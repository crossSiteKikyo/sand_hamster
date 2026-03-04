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
import { galleryCache, tagCache } from "./cacheDB";

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

const useTagLikeStore = create((set, get) => ({
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
  addTagLike: (tag_id, flag) => {
    let newTagLikeList = [...get().tagLikeList];
    newTagLikeList.push({ tag_id, flag, date: Date.now() });
    set({
      tagLikeList: newTagLikeList.toSorted(
        (a, b) => new Date(b.date) - new Date(a.date),
      ),
    });
  },
  updateTagLike: (tag_id, flag) => {
    let newTagLikeList = [...get().tagLikeList];
    for (let i = 0; i < newTagLikeList.length; i++) {
      if (newTagLikeList[i].tag_id == tag_id) {
        newTagLikeList[i].flag = flag;
        newTagLikeList[i].date = Date.now();
        break;
      }
    }
    set({ tagLikeList: newTagLikeList });
  },
  deleteTagLike: (tag_id) => {
    set({ tagLikeList: get().tagLikeList.filter((v) => v.tag_id != tag_id) });
  },
}));

const useGalleryLikeStore = create((set, get) => ({
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
  addGalleryLike: (g_id, flag) => {
    let newGalleryLikeList = [...get().galleryLikeList];
    newGalleryLikeList.push({ g_id, flag });
    set({
      galleryLikeList: newGalleryLikeList.toSorted((a, b) => b.g_id - a.g_id),
    });
    console.log(newGalleryLikeList.toSorted((a, b) => b.g_id - a.g_id));
  },
  updateGalleryLike: (g_id, flag) => {
    let newGalleryLikeList = [...get().galleryLikeList];
    for (let i = 0; i < newGalleryLikeList.length; i++) {
      if (newGalleryLikeList[i].g_id == g_id) {
        newGalleryLikeList[i].flag = flag;
        break;
      }
    }
    set({ galleryLikeList: newGalleryLikeList });
    console.log(newGalleryLikeList);
  },
  deleteGalleryLike: (g_id) => {
    set({
      galleryLikeList: get().galleryLikeList.filter((v) => v.g_id != g_id),
    });
    console.log(get().galleryLikeList.filter((v) => v.g_id != g_id));
  },
}));

const pageSize = 20;
const useGalleryStore = create((set, get) => ({
  galleryIds: [],
  galleryMap: new Map(),
  firstGid: null,
  lastGid: null,
  has_more: false, // cursor방식 다음 페이지가 있는지 없는지
  // 캐시에 없는 갤러리 정보들을 요청후 캐시에 저장한다
  getGalleriesByIdsAndSaveToCache: async (g_ids) => {
    let { data, error } = await galleryApi.getGalleriesDetailByIds(g_ids);
    if (data) {
      // await를 해야할까? 어차피 비동기니까 더 빨리 반환할거라면 await를 안하는게 맞다.
      // 너무 오래된 데이터 청소를 위해 last_accessed_at칼럼을 등록한다.
      galleryCache.bulkAdd(
        data.map((v) => ({ ...v, last_accessed_at: Date.now() })),
      );
    }
    if (error) {
      toast(`g_id로 갤러리 정보 가져오기2 에러`);
    }
    return data;
  },
  // cursor페이징 요청은, galleryMap제외한 정보들을 이 함수 전에 세팅해야함.
  // g_id배열로 galleryMap값을 넣는 역할. 캐시에서 값을 가져오고, 없는 정보들은 서버에 재요청후 캐싱
  // 너무 오래된 데이터 청소를 위해 last_accessed_at칼럼을 등록한다.
  setInfoAndCacheNewInfos: async (g_ids) => {
    const result = await galleryCache.bulkGet(g_ids);
    // console.log(result);
    const newGalleryMap = new Map();
    // 없는 g_id, 있는 g_id들을 추려냄.
    const missing_ids = [];
    const exists_ids = [];
    result.forEach((v, i) => {
      if (v == undefined) missing_ids.push(g_ids[i]);
      else exists_ids.push(g_ids[i]);
      newGalleryMap.set(g_ids[i], v);
    });
    // 없는 g_id가 있다면 다시 서버에 요청후 캐시에 저장.
    if (missing_ids.length > 0) {
      // 없던 g_id들을 캐시에서 가져와서 Map에 추가.
      const newGalleriesDetail =
        await get().getGalleriesByIdsAndSaveToCache(missing_ids);
      newGalleriesDetail.forEach((v) => {
        newGalleryMap.set(v.g_id, v);
      });
    }
    set({ galleryMap: newGalleryMap });
    // 있던 id들의 마지막 접근 시간 업데이트
    galleryCache.updateLastAccessedAt(exists_ids);
  },
  // 갤러리 하나만 검색할 때 사용 함수
  getGalleryListById: async (g_id) => {
    g_id = Number(g_id);
    set({ galleryIds: [g_id], has_more: false, firstGid: g_id, lastGid: g_id });
    await get().setInfoAndCacheNewInfos([g_id]);
  },
  // 프론트에 저장된 id들로 검색할 때 사용 함수. 수정해야함.
  getGalleriesByIds: async (g_ids) => {
    set({ galleryIds: g_ids });
    await get().setInfoAndCacheNewInfos(g_ids);
  },
  getGalleryListCursor: async (title, tagIds, cursor_id, direction) => {
    direction = direction == "prev" ? "prev" : "next";
    let { data: g_ids, error } = await galleryApi.getGalleryListCursor(
      title,
      tagIds,
      cursor_id,
      direction,
    );
    if (g_ids) {
      // prev라면 reverse한다.
      if (direction == "prev") g_ids.reverse();
      // galleryIds, firstGid, lastGid, has_more설정
      if (g_ids.length > 0) {
        // 21개가 와야 더 데이터가 있는 것이다.
        if (g_ids.length == pageSize + 1) {
          set({ has_more: true });
          if (direction == "next") g_ids = g_ids.slice(0, pageSize);
          else g_ids = g_ids.slice(1, pageSize + 1);
        } else {
          set({ has_more: false });
        }
        set({
          galleryIds: g_ids,
          firstGid: g_ids[0],
          lastGid: g_ids[g_ids.length - 1],
        });
      } else {
        set({ has_more: false, galleryIds: [] });
        set({ firstGid: cursor_id, lastGid: cursor_id });
      }
      await get().setInfoAndCacheNewInfos(g_ids);
    }
    if (error) toast("cursor 갤러리 가져오기 오류");
  },
  getGalleryListHasLikeTag: async (cursor_id, direction) => {
    direction = direction == "prev" ? "prev" : "next";
    let { data: g_ids, error } = await galleryApi.getGalleryListHasLikeTag(
      cursor_id,
      direction,
    );
    if (g_ids) {
      // prev라면 reverse한다.
      if (direction == "prev") g_ids.reverse();
      // galleryIds, firstGid, lastGid, has_more설정
      if (g_ids.length > 0) {
        // 21개가 와야 더 데이터가 있는 것이다.
        if (g_ids.length == pageSize + 1) {
          set({ has_more: true });
          if (direction == "next") g_ids = g_ids.slice(0, pageSize);
          else g_ids = g_ids.slice(1, pageSize + 1);
        } else {
          set({ has_more: false });
        }
        set({
          galleryIds: g_ids,
          firstGid: g_ids[0],
          lastGid: g_ids[g_ids.length - 1],
        });
      } else {
        set({ has_more: false, galleryIds: [] });
        set({ firstGid: cursor_id, lastGid: cursor_id });
      }
      await get().setInfoAndCacheNewInfos(g_ids);
    }
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
