import { create } from "zustand";
import { toast } from "react-toastify";
import tagApi from "../api/tagApi";
import { tagCache } from "../cacheDB";

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

export default useTagStore;
