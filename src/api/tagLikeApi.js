import supabase from "./supabaseClient";

const tagLikeApi = {
  getTagLikeList: (user_id) =>
    supabase
      .from("user_tag_like")
      .select("tag_id, created_at")
      .eq("user_id", user_id),
  insertTagLike: (user_id, tag_id) =>
    supabase.from("user_tag_like").insert([{ user_id, tag_id }]),
  deleteTagLike: (user_id, tag_id) =>
    supabase
      .from("user_tag_like")
      .delete()
      .eq("user_id", user_id)
      .eq("tag_id", tag_id),
  getTagDislikeList: (user_id) =>
    supabase
      .from("user_tag_dislike")
      .select("tag_id, created_at")
      .eq("user_id", user_id),
  insertTagDislike: (user_id, tag_id) =>
    supabase.from("user_tag_dislike").insert([{ user_id, tag_id }]),
  deleteTagDislike: (user_id, tag_id) =>
    supabase
      .from("user_tag_dislike")
      .delete()
      .eq("user_id", user_id)
      .eq("tag_id", tag_id),
};

export default tagLikeApi;
