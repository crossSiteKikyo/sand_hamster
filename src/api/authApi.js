import supabase from "./supabaseClient";

const authApi = {
  signUp: (email, password) => supabase.auth.signUp({ email, password }),
  logIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),
  getUser: () => supabase.auth.getUser(),
  getProfile: (user_id) =>
    supabase.from("profiles").select("*").eq("user_id", user_id),
  signOut: () => supabase.auth.signOut(),
  deleteAccount: () => supabase.rpc("delete_user"),
};

export default authApi;
