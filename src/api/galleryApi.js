import supabase from "./supabaseClient";

const pageSize = 20;

const galleryApi = {
  getGalleryListAnonymous: (page, title = "", tagIds, sort_by = "g_id") => {
    const p_title = title?.trim() || "";
    return supabase.rpc("search_galleries_anonymous", {
      p_title: p_title,
      search_tags: tagIds,
      p_sort_by: sort_by,
      p_limit: pageSize,
      p_offset: pageSize * (page - 1),
    });

    // tags가 없다면 JS SDK로 쿼리. 그런데 rpc로 대응 가능하게 했다.
    let query = supabase.from("gallery").select("*, gallery_tag (*)");
    if (p_title) query = query.ilike("title", `%${p_title}%`);
    query = query
      .order("g_id", { ascending: false })
      .range(pageSize * (page - 1), pageSize * page - 1);
    return query;
  },
  getGalleryListUser: (page, title = "", tagIds, sort_by = "g_id") => {
    const p_title = title?.trim() || "";
    return supabase.rpc("search_galleries_user", {
      p_title: p_title,
      search_tags: tagIds,
      p_sort_by: sort_by,
      p_limit: pageSize,
      p_offset: pageSize * (page - 1),
    });
  },
  getGalleryListById: (g_id) => {
    return supabase
      .from("gallery")
      .select("*, gallery_tag (*)")
      .eq("g_id", g_id);
  },
};

export default galleryApi;
