import supabase from "./supabaseClient";

const tagApi = {
  getTagList: (num) =>
    supabase
      .from("tag")
      .select("*")
      .range(num * 1000, num * 1000 + 999),
};

export default tagApi;
