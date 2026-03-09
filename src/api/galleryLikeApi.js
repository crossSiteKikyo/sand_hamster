import supabase from "./supabaseClient";

const galleryLikeApi = {
  getGalleryLikeList: (userId) =>
    supabase
      .from("user_gallery_like")
      .select("g_id, created_at")
      .eq("user_id", userId),
  insertGalleryLike: (user_id, g_id) =>
    supabase.from("user_gallery_like").insert([{ user_id, g_id }]),
  deleteGalleryLike: (user_id, g_id) =>
    supabase
      .from("user_gallery_like")
      .delete()
      .eq("user_id", user_id)
      .eq("g_id", g_id),
};

export default galleryLikeApi;
