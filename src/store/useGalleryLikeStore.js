import { create } from "zustand";
import { toast } from "react-toastify";
import galleryLikeApi from "../api/galleryLikeApi";

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

export default useGalleryLikeStore;
