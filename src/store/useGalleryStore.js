import { create } from "zustand";
import { toast } from "react-toastify";
import galleryApi from "../api/galleryApi";
import { galleryCache } from "../cacheDB";

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

export default useGalleryStore;
