import supabase from "./supabaseClient";

const galleryApi = {
  // getGalleryListAnonymous: (page, title = "", tagIds) => {
  //   const p_title = title?.trim() || "";
  //   return supabase.rpc("search_galleries_anonymous", {
  //     p_title: p_title,
  //     search_tags: tagIds,
  //     p_limit: pageSize,
  //     p_offset: pageSize * (page - 1),
  //   });
  // },
  // getGalleryListUser: (page, title = "", tagIds) => {
  //   const p_title = title?.trim() || "";
  //   return supabase.rpc("search_galleries_user", {
  //     p_title: p_title,
  //     search_tags: tagIds,
  //     p_limit: pageSize,
  //     p_offset: pageSize * (page - 1),
  //   });
  // },
  getGalleryListCursor: (title = "", tagIds, cursor_id, direction = "next") => {
    const p_title = title?.trim() || "";
    return supabase.rpc("search_galleries_smart_cursor", {
      p_title: p_title,
      search_tags: tagIds,
      p_cursor_id: cursor_id,
      p_direction: direction,
    });
  },
  getGalleryListById: (g_id) => {
    // 간단한 쿼리는 JS SDK로 쿼리.
    return supabase
      .from("gallery")
      .select("*, gallery_tag (*)")
      .eq("g_id", g_id);
  },
  getGalleriesByIds: (g_ids) =>
    supabase.rpc("get_galleries_by_ids", { p_gallery_ids: g_ids }),
  // getGalleryListByFlag: (cursor_id, direction = "next", flag) => {
  //   return supabase.rpc("get_user_galleries_like", {
  //     p_cursor_id: cursor_id,
  //     p_direction: direction,
  //     p_flag: flag,
  //   });
  // },
  getGalleryListHasLikeTag: (cursor_id, direction = "next") => {
    return supabase.rpc("get_user_galleries_only_like_tag", {
      p_cursor_id: cursor_id,
      p_direction: direction,
    });
  },
};

export default galleryApi;
