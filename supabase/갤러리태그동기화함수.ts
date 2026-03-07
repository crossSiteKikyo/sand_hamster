// supabase edgefunction으로 등록한 갤러리태그 동기화함수. 가끔 태그가 업데이트되는 현상이 있기 때문이다.
// 100개씩 나눠서 요청할 거기 때문에 헤더에 offset값을 준다. 0, 100, 200 ~ 900까지 주면 될듯하다. 4시간마다 10,11,12 ~ 19분에 실행시킨다.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const secretKey = req.headers.get("secret-key");
  if (secretKey !== "헤더 시크릿 키값") {
    return new Response("자격이 없습니다", { status: 401 });
  }
  const offsetStr = req.headers.get("offset");
  if (offsetStr == null || isNaN(parseInt(offsetStr)))
    return new Response("offset required and must be integer", { status: 400 });
  const offset = parseInt(offsetStr);

  const CHUNK_SIZE = 20; // 동시 요청 수 (속도를 위해 조금 높임)

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const transformAndSortTags = (gInfo) => {
    // 태그 이름 리스트 구성
    const tagNames = [];
    if (gInfo.tags != null) {
      for (const tag of gInfo.tags) {
        if (tag.female == "1") tagNames.push(`female:${tag.tag}`);
        else if (tag.male == "1") tagNames.push(`male:${tag.tag}`);
        else tagNames.push(`${tag.tag}`);
      }
    }
    // artists groups parodys는 하나도 없으면 null삽입
    if (gInfo.artists != null) {
      for (const artist of gInfo.artists) {
        tagNames.push(`artist:${artist.artist}`);
      }
    } else tagNames.push(`artist:null`);
    if (gInfo.groups != null) {
      for (const group of gInfo.groups) {
        tagNames.push(`group:${group.group}`);
      }
    } else tagNames.push(`group:null`);
    if (gInfo.parodys != null) {
      for (const parody of gInfo.parodys) {
        tagNames.push(`parody:${parody.parody}`);
      }
    } else tagNames.push(`parody:null`);
    if (gInfo.characters != null) {
      for (const character of gInfo.characters) {
        tagNames.push(`character:${character.character}`);
      }
    }
    return [...new Set(tagNames)].toSorted(); // 중복 제거 후 정렬
  };

  try {
    // 1. DB에서 현재 태그 상태 가져오기
    const { data: dbData, error } = await supabase.rpc(
      "get_galleries_with_tag_names",
      { p_limit: 100, p_offset: offset },
    );
    if (error) throw error;

    let updateCount = 0;
    // 1000개를 CHUNK_SIZE 단위로 나누어 처리
    for (let i = 0; i < dbData.length; i += CHUNK_SIZE) {
      const chunk = dbData.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (row) => {
          try {
            const { g_id, tag_names: dbTags } = row;
            // 2. 외부 데이터 가져오기 (히토미 .js)
            const response = await fetch(
              `https://ltn.gold-usergeneratedcontent.net/galleries/${g_id}.js`,
              {
                headers: { Referer: "https://hitomi.la/" },
                signal: AbortSignal.timeout(5000),
              },
            );
            if (!response.ok) return;

            const gInfo = JSON.parse(
              (await response.text()).replace("var galleryinfo = ", ""),
            );
            // 외부 태그 가공 (이것도 정렬해서 생성)
            const freshTags = transformAndSortTags(gInfo);
            // 3. 단순 문자열 비교 (정렬되어 있으므로 가능)
            if (dbTags.join(",") !== freshTags.join(",")) {
              console.log(`[Sync] G_ID ${g_id} 변경 감지됨`);
              const { error: rpcErr } = await supabase.rpc(
                "sync_gallery_tags",
                {
                  p_g_id: g_id,
                  p_new_tag_names: freshTags,
                },
              );
              if (!rpcErr) updateCount++;
            }
          } catch (e) {
            console.error(`[Error] G_ID ${row.g_id} 처리 중 오류:`, e.message);
          }
        }),
      );
    }
    return new Response(
      JSON.stringify({ success: true, updated: updateCount }),
      { status: 200 },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
