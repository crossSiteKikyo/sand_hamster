import { useEffect, useState } from "react";
import GalleryList from "./GalleryList";
import { useSearchParams } from "react-router-dom";
import { useGalleryStore, useUserStore } from "../store";
import ModalTagLike from "./ModalTagLike";
import PaginationCursor from "./PaginationCursor";
import { ThumbsDown, ThumbsUp } from "lucide-react";

// 좋아요/싫어요 한 갤러리를 보여준다.
export default function MyGallery() {
  const { user } = useUserStore();
  // 좋아요/싫어요 구분
  const [flag, setFlag] = useState(true);
  const [searchParams] = useSearchParams();
  const direction = searchParams.get("direction") || "next";
  const cursorId = searchParams.get("cursorId");
  const [isLoading, setIsLoading] = useState(true);
  const { galleryList, getGalleryListByFlag } = useGalleryStore();
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
  async function getGalleryList() {
    setIsLoading(true);
    document.getElementById("content-scroll").scrollTo({
      top: 0,
    });
    if (user != null) await getGalleryListByFlag(cursorId, direction, flag);
    setIsLoading(false);
  }
  useEffect(() => {
    getGalleryList();
  }, [flag, cursorId, direction]);
  return (
    <div className="flex grow flex-col bg-white p-1 dark:bg-black">
      <ModalTagLike
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        getGalleryList={getGalleryList}
        tag={selectedTag}
        _type={selectedType}
      />
      <div className="mb-2 flex justify-end gap-2">
        <button
          className={`flex gap-1 rounded-xl border border-pink-500 p-2 ${flag ? "bg-pink-300 dark:bg-pink-700" : "cursor-pointer"}`}
          onClick={() => setFlag(true)}
        >
          좋아요 <ThumbsUp className="w-5" />
        </button>
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${!flag ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => setFlag(false)}
        >
          싫어요 <ThumbsDown className="w-5" />
        </button>
      </div>
      <div className="grow">
        <GalleryList
          galleryList={galleryList}
          isLoading={isLoading}
          setSelectedTag={setSelectedTag}
          setIsTagModalOpen={setIsTagModalOpen}
          setSelectedType={setSelectedType}
          getGalleryList={getGalleryList}
        />
      </div>
      <div className="flex justify-center pt-5">
        <PaginationCursor direction={direction} cursorId={cursorId} />
      </div>
    </div>
  );
}
