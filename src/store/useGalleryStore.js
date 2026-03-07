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
      galleryCache.bulkPut(
        data.map((v) => ({ ...v, last_accessed_at: Date.now() })),
      );
    }
    if (error) toast(`g_id들로 갤러리 상세 정보 가져오기 에러`);
    return data;
  },
  // {g_id, view_count, ver}의 배열이 데이터로 들어온다.
  // g_id배열로 galleryMap값을 넣는 역할. 캐시에서 값을 가져오고, 없는 정보들은 서버에 재요청후 캐싱
  // 너무 오래된 데이터 청소를 위해 last_accessed_at칼럼을 등록한다.
  setMapInfoAndCacheNewInfos: async (data) => {
    const result = await galleryCache.bulkGet(data.map((v) => v.g_id));
    // console.log(result);
    const newGalleryMap = new Map();
    // 없거나 버전이 낮은 g_id들, 괜찮은 g_id들을 추려냄.
    const oldOrMissedGids = [];
    const fineData = [];
    for (let i = 0; i < result.length; i++) {
      // 없거나 버전이 낮은 g_id들
      if (result[i] == undefined || result[i].ver != data[i].ver)
        oldOrMissedGids.push(data[i].g_id);
      // 괜찮은 g_id들.
      else {
        result[i].view_count = data[i].view_count;
        newGalleryMap.set(data[i].g_id, result[i]);
        fineData.push(data[i]);
      }
    }
    // oldOrMissedGids가 있다면 다시 서버에 요청후 캐시에 저장.
    if (oldOrMissedGids.length > 0) {
      // 없던 g_id들을 캐시에서 가져와서 Map에 추가.
      const newGalleriesDetail =
        await get().getGalleriesByIdsAndSaveToCache(oldOrMissedGids);
      newGalleriesDetail.forEach((v) => {
        newGalleryMap.set(v.g_id, v);
      });
    }
    set({ galleryMap: newGalleryMap });
    // 있던 id들의 view_count, 마지막 접근 시간 업데이트
    if (fineData.length > 0)
      galleryCache.updateViewCountAndLastAccessedAt(fineData);
  },
  // 프론트에 저장된 id들로 검색할 때 사용 함수.
  // 숫자 페이지기 때문에 galleryIds만 설정하고 firstGid, lastGid, has_more는 설정 안한다.
  getGalleriesByIds: async (g_ids) => {
    let { data, error } = await galleryApi.getGalleriesSummaryByIds(g_ids);
    if (data) {
      set({ galleryIds: g_ids });
      await get().setMapInfoAndCacheNewInfos(data);
    }
    if (error) toast("g_id들로 갤러리 요약 정보 가져오기 오류");
  },
  // 갤러리 하나만 검색할 때 사용 함수
  // galleryIds, firstGid, lastGid, has_more설정 만 하고 g_id들을 넘김.
  getGalleryListById: async (g_id) => {
    g_id = Number(g_id);
    let { data, error } = await galleryApi.getGalleriesSummaryByIds([g_id]);
    if (data) {
      set({
        galleryIds: [g_id],
        has_more: false,
        firstGid: g_id,
        lastGid: g_id,
      });
      await get().setMapInfoAndCacheNewInfos(data);
    }
    if (error) toast("g_id로 갤러리 요약 정보 가져오기 오류");
  },
  // 검색하여 갤러리들을 세팅한다.
  // galleryIds, firstGid, lastGid, has_more설정 만 하고 g_id들을 넘김.
  // galleryMap설정과 캐싱 설정은 다른 함수로 위임한다.
  getGalleryListCursor: async (title, tagIds, cursor_id, direction) => {
    direction = direction == "prev" ? "prev" : "next";
    let { data, error } = await galleryApi.getGalleriesSummaryCursor(
      title,
      tagIds,
      cursor_id,
      direction,
    );
    if (data) {
      // prev라면 reverse한다.
      if (direction == "prev") data.reverse();
      if (data.length > 0) {
        // 21개가 와야 더 데이터가 있는 것이다.
        if (data.length == pageSize + 1) {
          set({ has_more: true });
          if (direction == "next") data = data.slice(0, pageSize);
          else data = data.slice(1, pageSize + 1);
        } else {
          set({ has_more: false });
        }
        set({
          galleryIds: data.map((v) => v.g_id),
          firstGid: data[0].g_id,
          lastGid: data[data.length - 1].g_id,
        });
      } else {
        set({ has_more: false, galleryIds: [] });
        set({ firstGid: cursor_id, lastGid: cursor_id });
      }
      await get().setMapInfoAndCacheNewInfos(data);
    }
    if (error) toast("cursor 갤러리 요약 가져오기 오류");
  },
  // 좋아요 태그가 하나라도 포함된 갤러리들을 세팅한다.
  // galleryIds, firstGid, lastGid, has_more설정 만 하고 g_id들을 넘김.
  // galleryMap설정과 캐싱 설정은 다른 함수로 위임한다.
  getGalleryListHasLikeTag: async (cursor_id, direction) => {
    direction = direction == "prev" ? "prev" : "next";
    let { data, error } = await galleryApi.getGalleriesSummaryUserOnlyLikeTag(
      cursor_id,
      direction,
    );
    if (data) {
      if (data.length > 0) {
        // 21개가 와야 더 데이터가 있는 것이다.
        if (data.length == pageSize + 1) {
          set({ has_more: true });
          if (direction == "next") data = data.slice(0, pageSize);
          else data = data.slice(1, pageSize + 1);
        } else {
          set({ has_more: false });
        }
        set({
          galleryIds: data.map((v) => v.g_id),
          firstGid: data[0].g_id,
          lastGid: data[data.length - 1].g_id,
        });
      } else {
        set({ has_more: false, galleryIds: [] });
        set({ firstGid: cursor_id, lastGid: cursor_id });
      }
      await get().setMapInfoAndCacheNewInfos(data);
    }
    if (error) toast("좋아요 태그가 하나라도 포함된 갤러리 요약 가져오기 오류");
  },
}));

export default useGalleryStore;
