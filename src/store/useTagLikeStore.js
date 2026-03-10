import { create } from "zustand";
import { toast } from "react-toastify";
import tagLikeApi from "../api/tagLikeApi";

const useTagLikeStore = create((set, get) => ({
  tagLikeList: [],
  tagDislikeList: [],
  getTagLikeList: async (user_id) => {
    // 로그인 안한 사람은 태그가 좋아요 리스트가 없음
    if (user_id == undefined) {
      set({ tagLikeList: [] });
      return;
    }
    let { data, error } = await tagLikeApi.getTagLikeList(user_id);
    if (error) {
      console.error("태그 좋아요 정보 가져오기 에러: ", error);
      toast(`태그 좋아요 정보 가져오기 에러`);
    } else {
      // 최신 날짜 순으로 정렬
      set({
        tagLikeList: data.toSorted(
          (a, b) => new Date(b.date) - new Date(a.date),
        ),
      });
    }
  },
  getTagDislikeList: async (user_id) => {
    // 로그인 안한 사람은 태그가 싫어요 리스트가 없음
    if (user_id == undefined) {
      set({ tagDislikeList: [] });
      return;
    }
    let { data, error } = await tagLikeApi.getTagDislikeList(user_id);
    if (error) {
      console.error("태그 싫어요 정보 가져오기 에러: ", error);
      toast(`태그 싫어요 정보 가져오기 에러`);
    } else {
      // 최신 날짜 순으로 정렬
      set({
        tagDislikeList: data.toSorted(
          (a, b) => new Date(b.date) - new Date(a.date),
        ),
      });
      console.log(data);
    }
  },
  addTagLike: async (user_id, tag_id) => {
    const { error } = await tagLikeApi.insertTagLike(user_id, tag_id);
    if (error) {
      toast("태그 좋아요 정보 insert 에러");
      return false;
    }
    let newTagLikeList = [...get().tagLikeList];
    newTagLikeList.push({ tag_id, created_at: Date.now() });
    set({
      tagLikeList: newTagLikeList.toSorted(
        (a, b) => new Date(b.date) - new Date(a.date),
      ),
    });
    return true;
  },
  addTagDislike: async (user_id, tag_id) => {
    const { error } = await tagLikeApi.insertTagDislike(user_id, tag_id);
    if (error) {
      toast("태그 싫어요 정보 insert 에러");
      return false;
    }
    let newTagDislikeList = [...get().tagDislikeList];
    newTagDislikeList.push({ tag_id, created_at: Date.now() });
    set({
      tagDislikeList: newTagDislikeList.toSorted(
        (a, b) => new Date(b.date) - new Date(a.date),
      ),
    });
    return true;
  },
  deleteTagLike: async (user_id, tag_id) => {
    const { error } = await tagLikeApi.deleteTagLike(user_id, tag_id);
    if (error) {
      toast("태그 좋아요 정보 delete 에러");
      return;
    }
    set({ tagLikeList: get().tagLikeList.filter((v) => v.tag_id != tag_id) });
  },
  deleteTagDislike: async (user_id, tag_id) => {
    const { error } = await tagLikeApi.deleteTagLike(user_id, tag_id);
    if (error) {
      toast("태그 싫어요 정보 delete 에러");
      return;
    }
    set({
      tagDislikeList: get().tagDislikeList.filter((v) => v.tag_id != tag_id),
    });
  },
}));

export default useTagLikeStore;
