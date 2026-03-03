import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import authApi from "./api/authApi";
import galleryApi from "./api/galleryApi";
import typeApi from "./api/typeApi";
import notificationApi from "./api/notificationApi";
import tagApi from "./api/tagApi";
import tagLikeApi from "./api/tagLikeApi";
import galleryLikeApi from "./api/galleryLikeApi";
import { tagCache } from "./cacheDB";

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

const useNotificationStore = create(
  persist(
    (set, get) => ({
      notificationList: [],
      readNotifications: [],
      // 공지사항 데이터 불러오기 함수.
      getNotificationList: async () => {
        let { data, error } = await notificationApi.getNotificationList();
        if (error) {
          toast(`공지사항 정보 가져오기 에러`);
        }
        if (data) set({ notificationList: data });
      },
      addReadNotificationId: (id) =>
        set((state) => ({
          readNotifications: state.readNotifications.includes(id)
            ? state.readNotifications
            : [...state.readNotifications, id],
        })),
      //미읽음 개수 계산 함수(Derived State)
      getUnreadCount: () => {
        const { notificationList, readNotifications } = get();
        const allIds = notificationList.map((v) => v.id);
        return allIds.filter((id) => !readNotifications.includes(id)).length;
      },
    }),
    {
      name: "notification-storage",
      // notificationList는 저장하지 않고, readNotifications만 저장한다.
      partialize: (state) => ({ readNotifications: state.readNotifications }),
    },
  ),
);

const useTagStore = create((set) => ({
  tagMap: new Map(),
  tagList: [],
  getAllTag: async () => {
    // 캐시에 저장된 제일 큰 tag_id값을 알아낸다.
    const lastTag = await tagCache.getMaxId();
    let lastTagId = lastTag == undefined ? 0 : lastTag.tag_id;
    // lastTagId 보다 큰 tag_id를 가진 tag들만 서버에서 가져온다.
    // 태그 데이터를 더이상 가져올 수 없을 때까지 가져온다.
    let newTagList = [];
    while (true) {
      const { data, error } = await tagApi.getTagList(lastTagId);
      if (error) {
        toast(`태그 가져오기 에러: ${i}번째 페이지`);
        break;
      }
      if (data && data.length > 0) {
        newTagList = [...newTagList, ...data];
        // 응답받은 태그들의 가장 마지막 태그의 아이디
        lastTagId = data[data.length - 1].tag_id;
      } else break;
      if (data.length < 1000) break;
    }
    // 캐시에 태그정보 벌크로 추가.
    await tagCache.bulkAdd(newTagList);
    const newTagMap = new Map();
    const allTagList = await tagCache.getAllTagList();
    allTagList.forEach((tag) => newTagMap.set(tag.tag_id, tag));
    // console.log(allTagList);
    // console.log(newTagMap);
    set({ tagMap: newTagMap, tagList: allTagList });
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
      toast(`tag_id로 태그 정보 가져오기 에러`);
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
      // g_id desc 순으로 정렬
      set({ galleryLikeList: data.toSorted((a, b) => b.g_id - a.g_id) });
      console.log(data);
    }
  },
}));

const pageSize = 20;
const useGalleryStore = create((set) => ({
  galleryList: [],
  totalCount: 10,
  firstGid: null,
  lastGid: null,
  has_more: false,
  getGalleryListCursor: async (title, tagIds, cursor_id, direction) => {
    direction = direction == "prev" ? "prev" : "next";
    let { data, error } = await galleryApi.getGalleryListCursor(
      title,
      tagIds,
      cursor_id,
      direction,
    );
    if (data) {
      // 21개가 와야 더 데이터가 있는 것이다.
      if (data.length == pageSize + 1) {
        set({ has_more: true });
        if (direction == "next") {
          set({ galleryList: data.slice(0, pageSize) });
          set({ firstGid: data[0].g_id, lastGid: data[data.length - 2].g_id });
        } else {
          set({ galleryList: data.slice(1, pageSize + 1) });
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
  getGalleriesByIds: async (g_ids) => {
    let { data, error } = await galleryApi.getGalleriesByIds(g_ids);
    if (error) {
      toast(`g_id로 갤러리 정보 가져오기 에러`);
    } else {
      set({ galleryList: data });
      console.log(data);
    }
  },
  getGalleryListHasLikeTag: async (cursor_id, direction) => {
    direction = direction == "prev" ? "prev" : "next";
    let { data, error } = await galleryApi.getGalleryListHasLikeTag(
      cursor_id,
      direction,
    );
    if (data) {
      // 21개가 와야 더 데이터가 있는 것이다.
      if (data.length == pageSize + 1) {
        set({ has_more: true });
        if (direction == "next") {
          set({ galleryList: data.slice(0, pageSize) });
          set({ firstGid: data[0].g_id, lastGid: data[data.length - 2].g_id });
        } else {
          set({ galleryList: data.slice(1, pageSize + 1) });
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
  useNotificationStore,
  useTagStore,
  useTagLikeStore,
  useGalleryStore,
  useGalleryLikeStore,
};
