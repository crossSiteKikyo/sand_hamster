import { create } from "zustand";
import { toast } from "react-toastify";
import hitomiApi from "../api/hitomiApi";

function Sleep(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, ms);
  });
}

const useHitomiStore = create((set, get) => ({
  b: "1772697601/",
  o1: "0",
  o2: "1",
  thumbChar1: "a",
  thumbChar2: "b",
  numSet: new Set(),
  imgHashList: [],
  title: "제목",
  isAvifSupported: false, // 브라우저가 avif포맷을 지원하는지 안하는지.
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
    // 너무 자주요청하면 느려지기 때문에 2분에 1번씩만 주기적으로 요청한다.
    setTimeout(get().getImageDecodeInfo, 1000 * 60 * 2);
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
    console.log(files.map((f) => ({ hash: f.hash, hasavif: f.hasavif })));
    set({
      imgHashList: files.map((f) => ({ hash: f.hash, hasavif: f.hasavif })), // avif로 요청 가능하면 avif로 한다.
      title: galleryInfo.title,
    });
  },
  checkAvifSupport: async () => {
    // 예시 AVIF 파일의 Base64 데이터입니다. gemini가 만들어준 데이터는 오류가 있어 따로 만들었다.
    const avifData =
      "data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZgAAAXBtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAAA5waXRtAAAAAAABAAAANGlsb2MAAAAAREAAAgABAAAAAAGUAAEAAAAAAAAAGAACAAAAAAGsAAEAAAAAAAAAFQAAADhpaW5mAAAAAAACAAAAFWluZmUCAAAAAAEAAGF2MDEAAAAAFWluZmUCAAAAAAIAAGF2MDEAAAAAr2lwcnAAAACKaXBjbwAAAAxhdjFDgQAMAAAAABRpc3BlAAAAAAAAAAgAAAAIAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAcAAAAAA5waXhpAAAAAAEIAAAAOGF1eEMAAAAAdXJuOm1wZWc6bXBlZ0I6Y2ljcDpzeXN0ZW1zOmF1eGlsaWFyeTphbHBoYQAAAAAdaXBtYQAAAAAAAAACAAEDgQIDAAIEhAIFhgAAABppcmVmAAAAAAAAAA5hdXhsAAIAAQABAAAANW1kYXQSAAoIGAi/YICGg0IyChgAAABAALATS9gSAAoFGAi/YVAyChgAAAEAAiEbo2A=";
    const isSupported = await new Promise((resolve) => {
      const img = new Image();
      // 1. 최신 브라우저를 위한 decode() API 확인
      if (img.decode) {
        img.src = avifData;
        img
          .decode()
          .then(() => resolve(true))
          .catch(() => resolve(false));
      } else {
        // 2. 구형 브라우저를 위한 fallback
        img.onload = () => resolve(img.width > 0 && img.height > 0);
        img.onerror = () => resolve(false);
        img.src = avifData;
      }
    });
    set({ isAvifSupported: isSupported });
  },
}));

export default useHitomiStore;
