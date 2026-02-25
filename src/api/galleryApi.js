import supabase from "./supabaseClient";

const pageSize = 20;

const galleryApi = {
  getGalleryListAnonymous: (page) =>
    supabase
      .from("gallery")
      .select("*, gallery_tag (*)")
      .order("g_id", { ascending: false })
      .range(pageSize * (page - 1), pageSize * page - 1),
};

export default galleryApi;
