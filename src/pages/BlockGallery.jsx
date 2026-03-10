import { useNavigate, useSearchParams } from "react-router-dom";
import useGalleryLikeStore from "../store/useGalleryLikeStore";
import { useEffect, useState } from "react";
import useGalleryStore from "../store/useGalleryStore";
import useSettingStore from "../store/useSettingStore";
import ModalTagLike from "./ModalTagLike";
import Pagination from "./Pagination";
import GalleryList from "./GalleryList";
import downloadFileFromData from "../function/downloadFileFromData";
import { hiddenGalleryCache } from "../cacheDB";
import { toast } from "react-toastify";
import getDataFromFile from "../function/getDataFromFile";

export default function BlockGallery() {
  const { hiddenGalleryIds, getHiddenGalleryIds } = useGalleryLikeStore();
  const { isHiddenGalleryHidden, hideHiddenGallery, blurHiddenGallery } =
    useSettingStore();
  const [maxPage, setMaxPage] = useState(1);
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || 1;
  const [isLoading, setIsLoading] = useState(true);
  const { getGalleriesByIds } = useGalleryStore();
  // 태그 모달창을 위한 변수들
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState({
    tag_id: 1,
    name: "female:anal",
    like_count: 0,
    dislike_count: 0,
  });
  // 메인 태그일 때, 모달의 색을 정해주기 위해 사용되는 변수
  const [selectedType, setSelectedType] = useState({
    type_id: 1,
    name: "doujinshi",
    title_bg_color: "CC9999",
    sub_bg_color: "FFCCCC",
    sub_text_color: "663333",
  });
  async function getGalleryList(g_ids) {
    setIsLoading(true);
    document.getElementById("content-scroll").scrollTo({
      top: 0,
    });
    await getGalleriesByIds(g_ids);
    setIsLoading(false);
  }
  useEffect(() => {
    const g_ids = [...hiddenGalleryIds];
    g_ids.sort((a, b) => b - a);
    const maxPage = Math.ceil(g_ids.length / 20);
    setMaxPage(maxPage > 0 ? maxPage : 1);
    getGalleryList(g_ids.slice(20 * (page - 1), 20 * page));
  }, [page, hiddenGalleryIds]);
  const downloadData = () => {
    downloadFileFromData(
      [...hiddenGalleryIds],
      `sand_hamster_싫어요g_id들_${Date.now()}.json`,
    );
  };
  const uploadData = async () => {
    // g_id배열 데이터를 가져온다.
    try {
      const parsedData = await getDataFromFile();
      if (Array.isArray(parsedData)) {
        const g_ids = parsedData.map((d) => Number(d));
        await hiddenGalleryCache.bulkPut(g_ids);
        await getHiddenGalleryIds();
      } else toast("배열 데이터가 아닙니다");
    } catch (e) {
      console.log(e);
      toast("json파싱 에러");
    }
  };
  return (
    <div className="flex grow flex-col bg-white p-1 dark:bg-black">
      <ModalTagLike
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        tag={selectedTag}
        _type={selectedType}
      />
      <div className="mb-1 flex flex-wrap gap-1 border-b pb-1">
        싫어요 갤러리는 계정이 아니라 브라우저에 저장됩니다. 브라우저마다
        설정해줘야 합니다.
        <button
          className="cursor-pointer rounded-sm bg-gray-300 px-1 dark:bg-gray-700"
          onClick={downloadData}
        >
          목록 다운로드
        </button>
        <button
          className="cursor-pointer rounded-sm bg-gray-300 px-1 dark:bg-gray-700"
          onClick={uploadData}
        >
          목록 업로드
        </button>
      </div>
      <div className="mb-2 flex items-center justify-end gap-2">
        차단방식:
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${!isHiddenGalleryHidden ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => blurHiddenGallery()}
        >
          이미지 검열 처리하기
        </button>
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${isHiddenGalleryHidden ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => hideHiddenGallery()}
        >
          숨기기
        </button>
      </div>
      <div className="grow">
        <GalleryList
          isLoading={isLoading}
          setSelectedTag={setSelectedTag}
          setIsTagModalOpen={setIsTagModalOpen}
          setSelectedType={setSelectedType}
        />
      </div>
      <div className="flex justify-center pt-5">
        <Pagination page={page} maxPage={maxPage} />
      </div>
    </div>
  );
}
