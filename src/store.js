import { create } from "zustand";
import { persist } from "zustand/middleware";
import authApi from "./api/authApi";
import galleryApi from "./api/galleryApi";
import typeApi from "./api/typeApi";
import tagApi from "./api/tagApi";

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

const useTypeStore = create((set) => ({
  typeList: [],
  getTypeList: async () => {
    let { data, error } = await typeApi.getTypeList();
    if (data) set({ typeList: data });
    console.log(data);
  },
}));

const useTagStore = create((set) => ({
  tagMap: new Map(),
  getAllTag: async () => {
    // 태그 데이터를 더이상 가져올 수 없을 때까지 가져온다.
    const tagMap = new Map();
    for (let i = 0; ; i++) {
      let { data, error } = await tagApi.getTagList(i);
      if (error) {
        console.error("태그 가져오기 에러: ", error);
      } else if (data.length > 0) {
        data.forEach((tag) => tagMap.set(tag.tag_id, tag));
      } else break;
    }
    console.log(tagMap);
    set({ tagMap: tagMap });
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

export {
  useThemeStore,
  useUserStore,
  useTypeStore,
  useTagStore,
  useGalleryStore,
};
