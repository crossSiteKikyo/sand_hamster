import { useEffect, useState } from "react";
import GalleryList from "./GalleryList";
import { useNavigate, useSearchParams } from "react-router-dom";
import ModalTagLike from "./ModalTagLike";
import Pagination from "./Pagination";
import useGalleryLikeStore from "../store/useGalleryLikeStore";
import useGalleryStore from "../store/useGalleryStore";

// 좋아요/싫어요 한 갤러리를 보여준다.
export default function MyGallery() {
  const navigate = useNavigate();
  const { galleryLikeList } = useGalleryLikeStore();
  const [maxPage, setMaxPage] = useState(1);
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || 1;
  const order = searchParams.get("order") || "g_id";
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
  async function getGalleryList(selectedUGL) {
    setIsLoading(true);
    document.getElementById("content-scroll").scrollTo({
      top: 0,
    });
    await getGalleriesByIds(selectedUGL.map((v) => v.g_id));
    setIsLoading(false);
  }
  const changeOrder = (order) => {
    // 현재 url에서 path를 추출한다.
    const pathname = window.location.pathname;
    // 새로운 객체 생성
    const newParams = new URLSearchParams();
    newParams.set("page", 1);
    newParams.set("order", order);
    navigate(`${pathname}?${newParams.toString()}`);
  };
  useEffect(() => {
    //galleryLikeList를 정렬하면 된다.
    let selectedUGL = [];
    if (order == "g_id")
      selectedUGL = galleryLikeList.toSorted((a, b) => b.g_id - a.g_id);
    else
      selectedUGL = galleryLikeList.toSorted(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
    const maxPage = Math.ceil(galleryLikeList.length / 20);
    setMaxPage(maxPage > 0 ? maxPage : 1);
    console.log(selectedUGL.slice(20 * (page - 1), 20 * page));
    getGalleryList(selectedUGL.slice(20 * (page - 1), 20 * page));
  }, [page, order, galleryLikeList]);
  return (
    <div className="flex grow flex-col bg-white p-1 dark:bg-black">
      <ModalTagLike
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        tag={selectedTag}
        _type={selectedType}
      />
      <div className="mb-2 flex justify-end gap-2">
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${order == "g_id" ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => changeOrder("g_id")}
        >
          g_id순
        </button>
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${order == "created_at" ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => changeOrder("created_at")}
        >
          생성한 날짜순
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
