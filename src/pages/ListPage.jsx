import { useEffect, useState } from "react";
import { useGalleryStore, useTagStore, useUserStore } from "../store";
import { useSearchParams } from "react-router-dom";
import GalleryList from "./GalleryList";
import ModalTagLike from "./ModalTagLike";
import SearchedTagMain from "../components/SearchedTag";
import PaginationCursor from "./PaginationCursor";

export default function ListPage({}) {
  // 맨 처음 g_id와 맨 마지막 g_id를 알아야 한다.
  // prev인지 next인지 알아야 한다.
  const { tagMap } = useTagStore();
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title") || "";
  const galleryId = searchParams.get("galleryId") || "";
  const tagIds = searchParams.getAll("tag") || [];
  const direction = searchParams.get("direction");
  const cursorId = searchParams.get("cursorId");
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { galleryList, getGalleryListCursor, getGalleryListById } =
    useGalleryStore();
  async function getGalleryList() {
    setIsLoading(true);
    document.getElementById("content-scroll").scrollTo({
      top: 0,
    });
    if (galleryId != "") await getGalleryListById(galleryId);
    await getGalleryListCursor(title, tagIds, cursorId, direction);
    setIsLoading(false);
  }
  useEffect(() => {
    getGalleryList();
  }, [title, galleryId, direction, searchParams.toString()]);
  useEffect(() => {
    setTags(tagIds.map((tag_id) => tagMap.get(Number(tag_id))));
  }, [tagIds.toString()]);

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

  return (
    <div className="flex grow flex-col bg-white p-1 dark:bg-black">
      <ModalTagLike
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        getGalleryList={getGalleryList}
        tag={selectedTag}
        _type={selectedType}
      />
      <div
        className={`flex flex-col text-center ${galleryId.trim() || title.trim() || tagIds.length > 0 ? "mb-4 rounded-xl border border-gray-500" : ""}`}
      >
        {galleryId && <p>id검색: {galleryId}</p>}
        {title.trim() && <p>제목검색: {title}</p>}
        {tagIds.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 p-1">
            태그검색:
            {tags.map((t) => (
              <SearchedTagMain
                key={t.tag_id}
                tag={t}
                setSelectedTag={setSelectedTag}
                setIsTagModalOpen={setIsTagModalOpen}
              />
            ))}
          </div>
        )}
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
