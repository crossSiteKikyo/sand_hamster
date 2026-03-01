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
  tagList: [],
  getAllTag: async () => {
    // 태그 데이터를 더이상 가져올 수 없을 때까지 가져온다.
    const newTagMap = new Map();
    let newTagList = [];
    let page = 0;
    while (true) {
      const { data, error } = await tagApi.getTagList(page);
      if (error) {
        toast(`태그 가져오기 에러: ${i}번째 페이지`);
        break;
      }
      if (data && data.length > 0) {
        data.forEach((tag) => newTagMap.set(tag.tag_id, tag));
        newTagList = [...newTagList, ...data];
        page++;
      } else break;
    }
    console.log(newTagList);
    console.log(newTagMap);
    set({ tagMap: newTagMap, tagList: newTagList });
  },
}));

const useTagLikeStore = create((set) => ({
  tagLikeList: [],
  tagsInfo: [],
  getTagLikeList: async () => {
    let { data, error } = await tagLikeApi.getTagLikeList();
    if (error) {
      console.error("태그 좋아요/싫어요 정보 가져오기 에러: ", error);
      toast(`태그 좋아요/싫어요 정보 가져오기 에러`);
    } else {
      // 최신 날짜 순으로 정렬
      set({
        tagLikeList: data.toSorted(
          (a, b) => new Date(b.date) - new Date(a.date),
        ),
      });
      console.log(data);
    }
  },
  getTagsInfoByIds: async (tag_ids) => {
    let { data, error } = await tagApi.getTagsInfoByIds(tag_ids);
    if (error) {
      toast(`태그 좋아요/싫어요 정보 가져오기 에러`);
    } else {
      set({ tagsInfo: data });
      console.log(data);
    }
  },
}));

const useGalleryLikeStore = create((set) => ({
  galleryLikeList: [],
  getGalleryLikeList: async () => {
    let { data, error } = await galleryLikeApi.getGalleryLikeList();
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
  totalCount: 10,
  firstGid: null,
  lastGid: null,
  has_more: false,
  getGalleryListAnonymous: async (page, title, tagIds) => {
    let { data, error } = await galleryApi.getGalleryListAnonymous(
      page,
      title,
      tagIds,
    );
    if (data) {
      set({ galleryList: data });
      if (data.length > 0) set({ totalCount: data[0].total_count });
    }
    console.log(data);
    if (error) toast("익명유저 갤러리 가져오기 오류");
  },
  getGalleryListUser: async (page, title, tagIds) => {
    let { data, error } = await galleryApi.getGalleryListUser(
      page,
      title,
      tagIds,
    );
    if (data) {
      set({ galleryList: data });
      if (data.length > 0) set({ totalCount: data[0].total_count });
    }
    console.log(data);
    if (error) toast("유저 갤러리 가져오기 오류");
  },
  getGalleryListCursor: async (title, tagIds, cursor_id, direction) => {
    let { data, error } = await galleryApi.getGalleryListCursor(
      title,
      tagIds,
      cursor_id,
      direction == "next" ? "next" : "prev",
    );
    if (data) {
      // 26개가 와야 더 데이터가 있는 것이다.
      if (data.length == 26) {
        set({ has_more: true });
        if (direction == "next") {
          set({ galleryList: data.slice(0, 25) });
          set({ firstGid: data[0].g_id, lastGid: data[data.length - 2].g_id });
        } else {
          set({ galleryList: data.slice(1, 26) });
          set({ firstGid: data[1].g_id, lastGid: data[data.length - 1].g_id });
        }
      } else if (data.length > 0) {
        set({ has_more: false, galleryList: data });
        set({ firstGid: data[0].g_id, lastGid: data[data.length - 1].g_id });
      } else {
        set({ has_more: false, galleryList: [] });
        set({ firstGid: cursor_id, lastGid: cursor_id });
      }
    }
    console.log(data);
    if (error) toast("cursor 갤러리 가져오기 오류");
  },
  getGalleryListById: async (g_id) => {
    let { data, error } = await galleryApi.getGalleryListById(g_id);
    if (data) set({ galleryList: data });
    console.log(data);
    if (error) toast("id로 갤러리 검색 오류");
  },
  getGalleryListByFlag: async (cursor_id, direction, flag) => {
    let { data, error } = await galleryApi.getGalleryListByFlag(
      cursor_id,
      direction == "next" ? "next" : "prev",
      flag,
    );
    if (data) {
      // 26개가 와야 더 데이터가 있는 것이다.
      if (data.length == 26) {
        set({ has_more: true });
        if (direction == "next") {
          set({ galleryList: data.slice(0, 25) });
          set({ firstGid: data[0].g_id, lastGid: data[data.length - 2].g_id });
        } else {
          set({ galleryList: data.slice(1, 26) });
          set({ firstGid: data[1].g_id, lastGid: data[data.length - 1].g_id });
        }
      } else if (data.length > 0) {
        set({ has_more: false, galleryList: data });
        set({ firstGid: data[0].g_id, lastGid: data[data.length - 1].g_id });
      } else {
        set({ has_more: false, galleryList: [] });
        set({ firstGid: cursor_id, lastGid: cursor_id });
      }
    }
    console.log(data);
    if (error) toast("좋아요/싫어요 갤러리 가져오기 오류");
  },
  getGalleryListHasLikeTag: async (cursor_id, direction) => {
    let { data, error } = await galleryApi.getGalleryListHasLikeTag(
      cursor_id,
      direction == "next" ? "next" : "prev",
    );
    if (data) {
      // 26개가 와야 더 데이터가 있는 것이다.
      if (data.length == 26) {
        set({ has_more: true });
        if (direction == "next") {
          set({ galleryList: data.slice(0, 25) });
          set({ firstGid: data[0].g_id, lastGid: data[data.length - 2].g_id });
        } else {
          set({ galleryList: data.slice(1, 26) });
          set({ firstGid: data[1].g_id, lastGid: data[data.length - 1].g_id });
        }
      } else if (data.length > 0) {
        set({ has_more: false, galleryList: data });
        set({ firstGid: data[0].g_id, lastGid: data[data.length - 1].g_id });
      } else {
        set({ has_more: false, galleryList: [] });
        set({ firstGid: cursor_id, lastGid: cursor_id });
      }
    }
    console.log(data);
    if (error) toast("좋아요 태그가 포함된 갤러리 가져오기 오류");
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
