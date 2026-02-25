import { create } from "zustand";
import { persist } from "zustand/middleware";
import authApi from "./api/authApi";
import galleryApi from "./api/galleryApi";

const useThemeStore = create(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    { name: "isDarkMode" },
  ),
);

const useUserStore = create((set) => ({
  user: null,
  deleteUser: () => set({ user: null }),
  getUser: async () => {
    const {
      data: { user },
    } = await authApi.getUser();
    if (user) set({ user: user });
    else set({ user: null });
  },
}));

const useGalleryStore = create((set) => ({
  galleryList: [],
  getGalleryListAnonymous: async (page) => {
    let { data, error } = await galleryApi.getGalleryListAnonymous(page);
    if (data) set({ galleryList: data });
    console.log(data);
  },
}));

export { useThemeStore, useUserStore, useGalleryStore };
