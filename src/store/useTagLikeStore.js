import { create } from "zustand";
import { toast } from "react-toastify";
import tagLikeApi from "../api/tagLikeApi";

const useTagLikeStore = create((set, get) => ({
  tagLikeList: [],
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

export default useTagLikeStore;
