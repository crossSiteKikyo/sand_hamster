import supabase from "./supabaseClient";

const rankingApi = {
  getRank: (rank_type, period) =>
    supabase
      .from("ranking")
      .select("*")
      .eq("rank_type", rank_type)
      .eq("period", period),
};

export default rankingApi;
