import { create } from "zustand";
import { toast } from "react-toastify";
import hitomiApi from "../api/hitomiApi";

const useHitomiStore = create((set) => ({
  thumbChar1: "a",
  thumbChar2: "b",
  numSet: new Set(),
  getImageDecodeInfo: async () => {
    const response = await hitomiApi.getGgjs();
    if (!response.ok) {
      toast("ggjs 요청 오류");
      return;
    }
    const body = await response.text();
    // 변수값 o를 알아냄.
    const defaultO = body.match(/(?<=var o = )\d/)[0];
    // 맨위 o와 맨 아래 o는 0과 1로만 응답되는 것 같다.
    const thumbChar1 = defaultO == "0" ? "a" : "b";
    const thumbChar2 = defaultO == "0" ? "b" : "a";
    const numSet = new Set(
      body.match(/(?<=case )\d+(?=:)/gi).map((v) => Number(v)),
    );
    set({ thumbChar1, thumbChar2, numSet });
  },
}));

export default useHitomiStore;
