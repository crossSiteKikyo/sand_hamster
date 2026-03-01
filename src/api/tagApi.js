import supabase from "./supabaseClient";

const tagApi = {
  getTagList: (num) =>
    supabase
      .from("tag")
      .select("*")
      .range(num * 1000, num * 1000 + 999),
  getTagsInfoByIds: (tag_ids) =>
    supabase.rpc("get_tags_info_by_ids", { p_tag_ids: tag_ids }),
};

export default tagApi;
