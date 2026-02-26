import supabase from "./supabaseClient";

const typeApi = {
  getTypeList: () => supabase.from("type").select("*"),
};

export default typeApi;
