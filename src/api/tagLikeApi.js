import supabase from "./supabaseClient";

const tagLikeApi = {
  getTagLikeList: () => supabase.from("user_tag_like").select("tag_id, flag"),
  insertTagLike: (user_id, tag_id, flag) =>
    supabase.from("user_tag_like").insert([{ user_id, tag_id, flag }]),
  updateTagLike: (user_id, tag_id, flag) =>
    supabase
      .from("user_tag_like")
      .update([{ flag: flag }])
      .eq("user_id", user_id)
      .eq("tag_id", tag_id),
  deleteTagLike: (user_id, tag_id) =>
    supabase
      .from("user_tag_like")
      .delete()
      .eq("user_id", user_id)
      .eq("tag_id", tag_id),
};

export default tagLikeApi;
