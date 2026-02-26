import supabase from "./supabaseClient";

const galleryLikeApi = {
  getTagLikeList: () => supabase.from("user_gallery_like").select("g_id, flag"),
};

export default galleryLikeApi;
