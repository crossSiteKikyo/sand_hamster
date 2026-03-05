import { create } from "zustand";
import { toast } from "react-toastify";
import tagApi from "../api/tagApi";

const useTagInfoStore = create((set, get) => ({
  tagIds: [],
  tagInfoMap: new Map(),
  getTagsInfoByIds: async (tag_ids) => {
    set({ tagIds: tag_ids });
    // 1. 이미 Map에 존재하는 ID는 제외하고 API 요청 보낼 목록 만들기
    const missingIds = tag_ids.filter((id) => !get().tagInfoMap.has(id));
    // 모두 이미 로드된 상태라면 API 요청 없이 종료
    if (missingIds.length === 0) return;

    let { data, error } = await tagApi.getTagsInfoByIds(tag_ids);
    if (error) {
      toast(`tag_id로 태그 정보 가져오기 에러`);
    }
    if (data) {
      const newMap = new Map(get().tagInfoMap);
      data.forEach((v) => newMap.set(v.tag_id, v));
      set({ tagInfoMap: newMap });
      console.log(data);
    }
  },
}));

export default useTagInfoStore;
