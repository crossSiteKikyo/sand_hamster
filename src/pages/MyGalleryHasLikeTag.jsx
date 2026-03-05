import { useEffect, useState } from "react";
import GalleryList from "./GalleryList";
import { useSearchParams } from "react-router-dom";
import ModalTagLike from "./ModalTagLike";
import PaginationCursor from "./PaginationCursor";
import useUserStore from "../store/useUserStore";
import useGalleryStore from "../store/useGalleryStore";
import useHitomiStore from "../store/useHitomiStore";

// 좋아요한 태그를 하나라도 포함하는 갤러리를 보여준다.
export default function MyGalleryHasLikeTag() {
  const { user } = useUserStore();
  const [searchParams] = useSearchParams();
  const direction = searchParams.get("direction");
  const cursorId = searchParams.get("cursorId");
  const [isLoading, setIsLoading] = useState(true);
  const { getGalleryListHasLikeTag } = useGalleryStore();
  const { getImageDecodeInfo } = useHitomiStore();
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
    await getImageDecodeInfo();
    document.getElementById("content-scroll").scrollTo({
      top: 0,
    });
    if (user != null) await getGalleryListHasLikeTag(cursorId, direction);
    setIsLoading(false);
  }
  useEffect(() => {
    getGalleryList();
  }, [cursorId, direction]);
  return (
    <div className="flex grow flex-col bg-white p-1 dark:bg-black">
      <ModalTagLike
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        getGalleryList={getGalleryList}
        tag={selectedTag}
        _type={selectedType}
      />
      <div className="grow">
        <GalleryList
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
