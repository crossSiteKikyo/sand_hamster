import supabase from "./supabaseClient";

const notificationApi = {
  getNotificationList: () => supabase.from("notification").select("*"),
};

export default notificationApi;
