import supabase from "./supabaseClient";

const galleryApi = {
  // g_id들로 상세 정보 검색
  getGalleriesDetailByIds: (g_ids) =>
    supabase.rpc("get_galleries_detail_by_ids", { p_gallery_ids: g_ids }),
  getGalleriesSummaryByIds: (g_ids) =>
    supabase.rpc("get_galleries_summary_by_ids", { p_gallery_ids: g_ids }),
  getGalleriesSummaryUserOnlyLikeTag: (cursor_id, direction = "next") =>
    supabase.rpc("get_galleries_summary_user_only_like_tag", {
      p_cursor_id: cursor_id,
      p_direction: direction,
    }),
  // 이 함수는 direction이 prev일 때 거꾸로 온다.
  getGalleriesSummaryCursor: (title, tagIds, cursor_id, direction = "next") =>
    supabase.rpc("search_galleries_summary_cursor", {
      p_title: title?.trim() || "",
      search_tags: tagIds,
      p_cursor_id: cursor_id,
      p_direction: direction,
    }),

  incrementGalleryViewCount: (g_id) =>
    supabase.rpc("increment_gallery_view_count", { p_g_id: g_id }),
};

export default galleryApi;
