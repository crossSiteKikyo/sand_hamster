import { useEffect, useState } from "react";
import { useGalleryStore, useTagStore, useUserStore } from "../store";
import { useSearchParams } from "react-router-dom";
import GalleryList from "./GalleryList";
import Pagination from "./Pagination";
import ModalTagLike from "./ModalTagLike";
import SearchedTagMain from "../components/SearchedTag";

export default function ListPage() {
  const { tagMap } = useTagStore();
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || "1";
  const title = searchParams.get("title") || "";
  const galleryId = searchParams.get("galleryId") || "";
  const tagIds = searchParams.getAll("tag") || [];
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("g_id");
  const {
    galleryList,
    getGalleryListAnonymous,
    getGalleryListUser,
    getGalleryListById,
  } = useGalleryStore();
  const { user } = useUserStore();
  async function getGalleryList() {
    setIsLoading(true);
    if (galleryId != "") await getGalleryListById(galleryId);
    else if (user == null)
      await getGalleryListAnonymous(Number(page), title, tagIds, sortBy);
    else await getGalleryListUser(Number(page), title, tagIds, sortBy);
    setIsLoading(false);
  }
  useEffect(() => {
    getGalleryList();
  }, [page, sortBy, title, galleryId, searchParams.toString()]);
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
    <div className="flex flex-col p-1 bg-white dark:bg-black grow">
      <ModalTagLike
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        getGalleryList={getGalleryList}
        tag={selectedTag}
        _type={selectedType}
      />
      <div className="flex justify-end gap-2 mb-2">
        <button
          className={`border border-gray-500 rounded-xl p-2 ${sortBy == "g_id" ? "bg-amber-200" : "cursor-pointer"}`}
          onClick={() => setSortBy("g_id")}
        >
          최신순
        </button>
        <button
          className={`border border-gray-500 rounded-xl p-2 ${sortBy == "like_count" ? "bg-amber-200" : "cursor-pointer"}`}
          onClick={() => setSortBy("like_count")}
        >
          좋아요순
        </button>
        <button
          className={`border border-gray-500 rounded-xl p-2 ${sortBy == "view_count" ? "bg-amber-200" : "cursor-pointer"}`}
          onClick={() => setSortBy("view_count")}
        >
          조회순
        </button>
      </div>
      <div
        className={`flex flex-col text-center ${galleryId.trim() || title.trim() || tagIds.length > 0 ? "border mb-4 rounded-xl border-gray-500" : ""}`}
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
        <Pagination page={page} />
      </div>
    </div>
  );
}
