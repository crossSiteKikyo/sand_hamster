import { create } from "zustand";
import { persist } from "zustand/middleware";
import authApi from "./api/authApi";

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

export { useThemeStore, useUserStore };
