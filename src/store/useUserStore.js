import { create } from "zustand";
import { toast } from "react-toastify";
import authApi from "../api/authApi";

const useUserStore = create((set) => ({
  user: null,
  tag_like_limit: 0,
  gallery_like_limit: 0,
  deleteUser: () => set({ user: null }),
  getUser: async () => {
    const {
      data: { user },
      error,
    } = await authApi.getUser();
    if (user) {
      set({ user: user });
      const { data, error } = await authApi.getProfile(user.id);
      if (error) toast("유저 프로필 정보 가져오기 에러");
      if (data) {
        set({
          tag_like_limit: data[0].tag_like_limit,
          gallery_like_limit: data[0].gallery_like_limit,
        });
      }
      return user.id;
    }
    if (error) {
      set({ user: null });
    }
  },
}));

export default useUserStore;
