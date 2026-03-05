import { create } from "zustand";
import { toast } from "react-toastify";
import hitomiApi from "../api/hitomiApi";

const useHitomiStore = create((set) => ({
  b: "1772697601/",
  o1: "0",
  o2: "1",
  thumbChar1: "a",
  thumbChar2: "b",
  numSet: new Set(),
  imgHashList: [],
  title: "제목",
  getImageDecodeInfo: async () => {
    const response = await hitomiApi.getGgjs();
    if (!response.ok) {
      toast("ggjs 요청 오류");
      return;
    }
    const body = await response.text();
    // 변수값 b를 알아냄.
    const b = body.match(/(?<=b: ')[^']+/)[0];
    // 변수값 o를 알아냄.
    const o1 = body.match(/(?<=var o = )\d/)[0];
    const o2 = o1 == "0" ? "1" : "0";
    // 맨위 o와 맨 아래 o는 0과 1로만 응답되는 것 같다.
    const thumbChar1 = o1 == "0" ? "a" : "b";
    const thumbChar2 = o1 == "0" ? "b" : "a";
    const numSet = new Set(
      body.match(/(?<=case )\d+(?=:)/gi).map((v) => Number(v)),
    );
    set({ b, o1, o2, thumbChar1, thumbChar2, numSet });
  },
  getGalleryInfo: async (g_id) => {
    const response = await hitomiApi.getGalleryInfo(g_id);
    if (!response.ok) {
      toast(`${g_id} 정보 요청 오류`);
      return;
    }
    const body = (await response.text()).replace("var galleryinfo = ", "");
    const galleryInfo = JSON.parse(body);
    const files = galleryInfo.files;
    set({ imgHashList: files.map((f) => f.hash), title: galleryInfo.title });
  },
}));

export default useHitomiStore;
