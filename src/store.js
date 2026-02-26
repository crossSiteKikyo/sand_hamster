import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import authApi from "./api/authApi";
import galleryApi from "./api/galleryApi";
import typeApi from "./api/typeApi";
import tagApi from "./api/tagApi";
import tagLikeApi from "./api/tagLikeApi";
import galleryLikeApi from "./api/galleryLikeApi";

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
      error,
    } = await authApi.getUser();
    if (user) set({ user: user });
    if (error) {
      set({ user: null });
      // toast("유저 정보 가져오기 에러");
    }
  },
}));

const useTypeStore = create((set) => ({
  typeList: [],
  getTypeList: async () => {
    let { data, error } = await typeApi.getTypeList();
    if (error) {
      toast(`타입 정보 가져오기 에러`);
    }
    if (data) set({ typeList: data });
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
        toast(`태그 가져오기 에러: ${i}번째 페이지`);
      } else if (data.length > 0) {
        data.forEach((tag) => tagMap.set(tag.tag_id, tag));
      } else break;
    }
    console.log(tagMap);
    set({ tagMap: tagMap });
  },
}));

const useTagLikeStore = create((set) => ({
  tagLikeList: [],
  getTagLikeList: async () => {
    let { data, error } = await tagLikeApi.getTagLikeList();
    if (error) {
      console.error("태그 좋아요/싫어요 정보 가져오기 에러: ", error);
      toast(`태그 좋아요/싫어요 정보 가져오기 에러`);
    } else {
      set({ tagLikeList: data });
      console.log(data);
    }
  },
}));

const useGalleryLikeStore = create((set) => ({
  galleryLikeList: [],
  getGalleryLikeList: async () => {
    let { data, error } = await galleryLikeApi.getTagLikeList();
    if (error) {
      console.error("갤러리 좋아요/싫어요 정보 가져오기 에러: ", error);
      toast(`갤러리 좋아요/싫어요 정보 가져오기 에러`);
    } else {
      set({ galleryLikeList: data });
      console.log(data);
    }
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
  useTagLikeStore,
  useGalleryStore,
  useGalleryLikeStore,
};
