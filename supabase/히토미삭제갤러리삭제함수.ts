// supabase Edge Function으로 등록한 크롤링 함수
// 서버에는 없지만 db에는 있는 갤러리들은 삭제한다. 하루에 한번. 5시 10분에.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // 1. 요청 헤더에서 내가 정한 비밀 키 확인
  const secretKey = req.headers.get("secret-key");
  // 키가 다르면 오류. 다른 유저가 실행할 수 없게 한다.
  if (secretKey !== "헤더 시크릿키 값은 깃허브에 올리지 않는다") {
    return new Response("Unauthorized, no header key", { status: 401 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", //관리자 키 사용
    );
    const hitomiHeaders = {
      Referer: "https://hitomi.la/",
      //'Range': 'bytes=0-3999' // 다 가져와서. 삭제된 갤러리 검사를 진행한다.
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
    const serverGidSet = new Set<number>();
    const dataView = new DataView(uint8Array.buffer);
    for (let i = 0; i < uint8Array.length; i += 4) {
      serverGidSet.add(dataView.getInt32(i, false)); // true는 Little Endian 기준
    }
    const allDbIds: number[] = [];
    let index = 0;
    const PAGE_SIZE = 1000;
    // db에서 모든 g_id를 가져온다. 한번에 1000개 제한이 있어서 여러번 반복해야함.
    while (true) {
      const { data, error } = await supabase
        .from("gallery")
        .select("g_id")
        .order("g_id", { ascending: false })
        .range(index, index + PAGE_SIZE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allDbIds.push(...data.map((d) => d.g_id));
      if (data.length < PAGE_SIZE) break;
      index += PAGE_SIZE;
    }
    // 삭제된 갤러리 정리 (DB에는 있는데 응답에는 없는 것)
    const idsToDelete = allDbIds.filter((g_id) => !serverGidSet.has(g_id));
    if (idsToDelete.length > 0) {
      // PostgreSQL의 IN 연산자 제한을 고려해 200개씩 나눠서 삭제하는 것이 안전합니다.
      for (let i = 0; i < idsToDelete.length; i += 200) {
        const chunk = idsToDelete.slice(i, i + 200);
        const { error: deleteError } = await supabase
          .from("gallery")
          .delete()
          .in("g_id", chunk);

        if (deleteError) throw deleteError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_db: allDbIds.length,
        deleted: idsToDelete.length,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    return new Response(JSON.stringify({ message: err?.message ?? err }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
