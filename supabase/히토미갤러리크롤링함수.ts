// supabase Edge Function으로 등록한 크롤링 함수
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

Deno.serve(async (req) => {
  // 1. 요청 헤더에서 내가 정한 비밀 키 확인
  const secretKey = req.headers.get("secret-key");
  // 키가 다르면 오류. 다른 유저가 실행할 수 없게 한다.
  if (secretKey !== "헤더 시크릿키 값은 깃허브에 올리지 않는다") {
    return new Response("Unauthorized, no header key", { status: 401 });
  }
  const typeIdx = {
    doujinshi: 1,
    manga: 2,
    artistcg: 3,
    gamecg: 4,
    imageset: 5,
  };
  const crawlLimit = 100; // 한번의 edge함수 실행에 몇개를 크롤링 할 것인지
  const chunkSize = 10; // 동시요청을 몇개씩 할 것인지

  try {
    // db
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", //관리자 키 사용
    );
    let insertgids = [];
    const hitomiHeaders = {
      Referer: "https://hitomi.la/",
      //'Range': 'bytes=0-3999' // 1000개를 가져온다. 아니 그냥 다 가져온다. 삭제된 갤러리 검사에 방해된다.
    };
    // 한국어 갤러리 id들을 fetch
    const nozomiResponse = await fetch(
      "https://ltn.gold-usergeneratedcontent.net/index-korean.nozomi",
      {
        method: "get",
        headers: hitomiHeaders,
      },
    );
    // 1. 응답 상태가 200번대가 아니면 즉시 에러를 발생시켜 중단
    if (!nozomiResponse.ok) {
      throw new Error(
        `Nozomi fetch failed: ${nozomiResponse.status} ${nozomiResponse.statusText}`,
      );
    }
    const arrayBuffer = await nozomiResponse.arrayBuffer();
    // 2. 데이터가 비어있는 경우(0바이트)에 대한 방어 로직
    if (arrayBuffer.byteLength === 0) {
      throw new Error(
        "Nozomi data is empty. Stopping execution to prevent accidental deletions.",
      );
    }
    const uint8Array = new Uint8Array(arrayBuffer);

    // 4바이트씩 Int 변환
    const gIdList: number[] = [];
    const dataView = new DataView(uint8Array.buffer);
    for (let i = 0; i < uint8Array.length; i += 4) {
      gIdList.push(dataView.getInt32(i, false)); // true는 Little Endian 기준
    }
    // DB에서 현재 저장된 ID 500개 가져오기 내림차순으로 큰값부터 가져온다. 삭제된 갤러리 있는지 보는 것이다.
    const { data: dbGalleries } = await supabase
      .from("gallery")
      .select("g_id")
      .order("g_id", { ascending: false })
      .limit(500);
    const allDbIds = dbGalleries?.map((g) => Number(g.g_id)) || [];
    // 삭제된 갤러리 정리 (DB에는 있는데 응답에는 없는 것)
    const idsToDelete = allDbIds.filter((g_id) => !gIdList.includes(g_id));
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("gallery")
        .delete()
        .in("g_id", idsToDelete);
      if (deleteError) {
        console.error("삭제 중 오류 발생:", deleteError.message);
      }
    }
    // DB에서 가장 큰 g_id 딱 하나만 가져오기
    const { data: maxIdData, error: maxError } = await supabase
      .from("gallery")
      .select("g_id")
      .order("g_id", { ascending: false })
      .limit(1)
      .maybeSingle();

    const serverMaxId = gIdList[0];
    const lastMaxId = maxIdData?.g_id || 0; // 데이터가 하나도 없으면 0
    // DB의 최대값보다 큰 ID들만 필터링 (새로 올라온 것들)
    const filteredIds = gIdList.filter((g_id) => g_id > lastMaxId);

    // 새로 크롤링 할 데이터들이 있다면 크롤링을 진행한다.
    if (filteredIds.length > 0) {
      filteredIds.reverse();
      const targetIds = filteredIds.slice(0, crawlLimit);
      const splitGids = (arr: number[], size: number) =>
        Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
          arr.slice(i * size, i * size + size),
        );
      const chunks = splitGids(targetIds, chunkSize);

      insertgids = insertgids.concat(targetIds);
      for (const chunk of chunks) {
        const ginfomap = {};
        // chunk에 있는 것들 promise.all로 모두 크롤링 한 후, db에 순차적으로 넣는다.
        // g_id가 key이고 정보가 value인
        const fetchPromises = chunk.map(async (g_id) => {
          try {
            const response = await fetch(
              `https://ltn.gold-usergeneratedcontent.net/galleries/${g_id}.js`,
              { headers: hitomiHeaders },
            );
            ginfomap[g_id] = JSON.parse(
              (await response.text()).replace("var galleryinfo = ", ""),
            );
            const response2 = await fetch(
              `https://ltn.gold-usergeneratedcontent.net/galleryblock/${g_id}.html`,
              { headers: hitomiHeaders },
            );
            const $ = cheerio.load(await response2.text());
            const imgs = $(".dj-img-cont picture img");
            ginfomap[g_id].thumb1 = `https:${imgs.eq(0).attr("data-src")}`;
            ginfomap[g_id].thumb2 = `https:${imgs.eq(1).attr("data-src")}`;
          } catch (e) {
            return new Response(
              JSON.stringify({ msg: "error galleryies fetch" }),
              {
                status: 500,
              },
            );
          }
        });
        // 크롤링 될 때까지 기다림
        await Promise.all(fetchPromises);
        // db에는 한번에 넣지 않고 순차적으로 넣는다. 순서를 보장하기 위해서.
        // 나중에 시간이 너무 걸린다면 한꺼번에 넣고 order를 하는것을 고려해보자.
        for (const g_id of chunk) {
          let tagNames = [];
          // 태그들 이름 리스트를 만든다. 일일히 insert하면 성능이 떨어지기 때문
          if (ginfomap[g_id].tags != null) {
            for (const tag of ginfomap[g_id].tags) {
              if (tag.female == "1") tagNames.push(`female:${tag.tag}`);
              else if (tag.male == "1") tagNames.push(`male:${tag.tag}`);
              else tagNames.push(`${tag.tag}`);
            }
          }
          // artists groups parodys는 하나도 없으면 null삽입
          if (ginfomap[g_id].artists != null) {
            for (const artist of ginfomap[g_id].artists) {
              tagNames.push(`artist:${artist.artist}`);
            }
          } else tagNames.push(`artist:null`);
          if (ginfomap[g_id].groups != null) {
            for (const group of ginfomap[g_id].groups) {
              tagNames.push(`group:${group.group}`);
            }
          } else tagNames.push(`group:null`);
          if (ginfomap[g_id].parodys != null) {
            for (const parody of ginfomap[g_id].parodys) {
              tagNames.push(`parody:${parody.parody}`);
            }
          } else tagNames.push(`parody:null`);
          if (ginfomap[g_id].characters != null) {
            for (const character of ginfomap[g_id].characters) {
              tagNames.push(`character:${character.character}`);
            }
          }
          // 없는 태그들을 만든다. upsert하면서 tag_id들이 1씩 늘어나지 않게 된다.
          await supabase.from("tag").upsert(
            tagNames.map((name) => ({ name })),
            { onConflict: "name", ignoreDuplicates: true },
          );
          // 태그 id들을 가져온다
          const { data: tagIdData, error: tagError } = await supabase
            .from("tag")
            .select("tag_id")
            .in("name", tagNames);
          if (tagError) throw tagError;
          const tagIdList = tagIdData.map((t) => t.tag_id);
          // rpc호출로 갤러리와 갤러리토큰 저장
          const { error: rpcError } = await supabase.rpc(
            "insert_gallery_with_tags",
            {
              p_g_id: g_id,
              p_title: ginfomap[g_id].title,
              p_thumb1: ginfomap[g_id].thumb1,
              p_thumb2: ginfomap[g_id].thumb2,
              p_date: ginfomap[g_id].date,
              p_filecount: ginfomap[g_id].files.length,
              p_type_id: typeIdx[ginfomap[g_id]["type"]],
              p_tag_ids: tagIdList,
            },
          );
          if (rpcError) {
            console.error("rpc 최종 저장 실패:", rpcError.message);
          }
        }
      }
      return new Response(
        JSON.stringify({ serverMaxId, lastMaxId, idsToDelete, insertgids }),
        {
          status: 200,
        },
      );
    } else {
      return new Response(
        JSON.stringify({
          msg: "새로 크롤링할 것이 없습니다",
          serverMaxId,
          lastMaxId,
          idsToDelete,
        }),
        {
          status: 200,
        },
      );
    }
  } catch (err) {
    return new Response(JSON.stringify({ message: err?.message ?? err }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
