import { create } from "zustand";
import { toast } from "react-toastify";
import galleryLikeApi from "../api/galleryLikeApi";
import { hiddenGalleryCache } from "../cacheDB";

const useGalleryLikeStore = create((set, get) => ({
  galleryLikeList: [], // {g_id, created_at}인 배열이다.
  hiddenGalleryIds: new Set(),
  getGalleryLikeList: async (userId) => {
    // 로그인 안한 사람은 갤러리 좋아요 리스트가 없음
    if (userId == undefined) {
      set({ galleryLikeList: [] });
      return;
    }
    let { data, error } = await galleryLikeApi.getGalleryLikeList(userId);
    if (error) {
      console.error("갤러리 좋아요 정보 가져오기 에러: ", error);
      toast(`갤러리 좋아요 정보 가져오기 에러`);
    } else {
      // g_id desc 순으로 정렬
      set({
        galleryLikeList: data.toSorted((a, b) => b.g_id - a.g_id),
      });
    }
  },
  getHiddenGalleryIds: async () => {
    try {
      const newIds = new Set(
        (await hiddenGalleryCache.getAll()).map((v) => v.g_id),
      );
      set({ hiddenGalleryIds: newIds });
      console.log(newIds);
    } catch (e) {
      toast("indexedDB에서 싫어요 갤러리 리스트 가져오기 오류");
      console.log(e);
    }
  },
  addGalleryLike: async (user_id, g_id) => {
    // 서버에 먼저 요청해보고, 성공이라면 상태에도 반영한다.
    const { error } = await galleryLikeApi.insertGalleryLike(user_id, g_id);
    if (error) {
      toast("갤러리 좋아요 정보 insert 에러");
      return false;
    }
    let newGalleryLikeList = [...get().galleryLikeList];
    newGalleryLikeList.push({ g_id, created_at: Date.now() });
    set({
      galleryLikeList: newGalleryLikeList.toSorted((a, b) => b.g_id - a.g_id),
    });
    return true;
  },
  addHiddenGallery: async (g_id) => {
    try {
      await hiddenGalleryCache.add(g_id);
    } catch (e) {
      toast("싫어요 갤러리 정보 입력 오류");
    }
    await get().getHiddenGalleryIds();
  },
  deleteGalleryLike: async (user_id, g_id) => {
    // 서버에 먼저 요청해보고, 성공이라면 상태에도 반영한다.
    const { error } = await galleryLikeApi.deleteGalleryLike(user_id, g_id);
    if (error) {
      toast("갤러리 좋아요 정보 delete 에러");
      return;
    }
    set({
      galleryLikeList: get().galleryLikeList.filter((v) => v.g_id != g_id),
    });
    console.log(get().galleryLikeList.filter((v) => v.g_id != g_id));
  },
  deleteHiddenGallery: async (g_id) => {
    try {
      await hiddenGalleryCache.delete(g_id);
    } catch (e) {
      toast("싫어요 갤러리 정보 삭제 오류");
    }
    await get().getHiddenGalleryIds();
  },
}));

export default useGalleryLikeStore;
