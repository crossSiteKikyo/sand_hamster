import supabase from "./supabaseClient";

const authApi = {
  loginWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      // options: { redirectTo: "https://hitomi.la/list" },
    }),
  getUser: () => supabase.auth.getUser(),
  signOut: () => supabase.auth.signOut(),
  deleteAccount: () => supabase.rpc("delete_user"),
};

export default authApi;
