import supabase from "./supabaseClient";

const authApi = {
  // loginWithGoogle: () =>
  //   supabase.auth.signInWithOAuth({
  //     provider: "google",
  //     options: { redirectTo: "https://hitomi.la" },
  //   }),
  signUp: (email, password) => supabase.auth.signUp({ email, password }),
  logIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),
  getUser: () => supabase.auth.getUser(),
  signOut: () => supabase.auth.signOut(),
  deleteAccount: () => supabase.rpc("delete_user"),
};

export default authApi;
