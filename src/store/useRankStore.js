import { create } from "zustand";
import { toast } from "react-toastify";
import rankingApi from "../api/rankingApi";
import { rankCache } from "../cacheDB";

const pageSize = 20;
const useRankStore = create((set, get) => ({
  rankGalleryIds: [],
  // galleryMap: new Map(),
  // tagMap: new Map(),
  rankTagIds: [],
  maxPage: 1,
  setRankInfo: async (rankType, period, page) => {
    // 캐시에서 rankType, period, 기준으로 조회.
    let row = await rankCache.get(rankType, period);
    // 결과가 없거나, 기간이 하루가 지났다면 서버에서 조회
    if (
      row == undefined ||
      new Date() - new Date(row.updated_at) > 1000 * 60 * 60 * 24 + 1000 * 60
    ) {
      let { data, error } = await rankingApi.getRank(rankType, period);
      if (error) toast("랭킹 정보 가져오기 오류");
      if (data) {
        row = data[0];
        rankCache.put(row);
      }
    }
    const ids = row.ids.slice(pageSize * (page - 1), pageSize * page);
    set({ maxPage: Math.ceil(row.ids.length / pageSize) });
    // rankType이 tag_like면 태그정보 수정.
    if (rankType == "tag_like") {
      set({ rankTagIds: ids });
    } else {
      set({ rankGalleryIds: ids });
    }
  },
}));

export default useRankStore;
