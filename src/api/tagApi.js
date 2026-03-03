import supabase from "./supabaseClient";

const tagApi = {
  getTagList: (lastTagId) =>
    supabase
      .from("tag")
      .select("*")
      .gt("tag_id", lastTagId)
      .order("tag_id", { ascending: true })
      .limit(1000),
  getTagsInfoByIds: (tag_ids) =>
    supabase.rpc("get_tags_info_by_ids", { p_tag_ids: tag_ids }),
};

export default tagApi;
