import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Pagination from "./Pagination";
import ModalTagLike from "./ModalTagLike";
import GalleryList from "./GalleryList";
import TagList from "./TagList";
import useGalleryStore from "../store/useGalleryStore";
import useRankStore from "../store/useRankStore";
import useTagInfoStore from "../store/useTagInfoStore";
import useHitomiStore from "../store/useHitomiStore";

export default function RankPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const { getGalleriesByIds } = useGalleryStore();
  const { getTagsInfoByIds } = useTagInfoStore();
  const { getImageDecodeInfo } = useHitomiStore();
  const page = searchParams.get("page") || 1;
  // 기간 구분
  const period = searchParams.get("period") || "weekly";
  // 랭크 타입
  const rankType = searchParams.get("rankType") || "gallery_like";
  const { rankGalleryIds, rankTagIds, maxPage, setRankInfo } = useRankStore();
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
  useEffect(() => {
    setRankInfo(rankType, period, page);
  }, [rankType, period, page]);
  const pageMove = (rankType, period) => {
    // 현재 url에서 path를 추출한다.
    const pathname = window.location.pathname;
    // 기존 searchParams 복사하여 새로운 객체 생성
    const newParams = new URLSearchParams(searchParams);
    if (rankType != null) newParams.set("rankType", rankType);
    if (period != null) newParams.set("period", period);
    // page는 없애서 1로 초기화한다.
    newParams.delete("page");
    navigate(`${pathname}?${newParams.toString()}`);
  };
  async function getGalleryList(g_ids) {
    setIsLoading(true);
    await getImageDecodeInfo();
    document.getElementById("content-scroll").scrollTo({
      top: 0,
    });
    await getGalleriesByIds(g_ids);
    setIsLoading(false);
  }
  useEffect(() => {
    getGalleryList(rankGalleryIds);
  }, [rankGalleryIds]);
  async function getTagList(tag_ids) {
    setIsLoading(true);
    await getImageDecodeInfo();
    document.getElementById("content-scroll").scrollTo({
      top: 0,
    });
    await getTagsInfoByIds(tag_ids);
    setIsLoading(false);
  }
  useEffect(() => {
    getTagList(rankTagIds);
  }, [rankTagIds]);
  return (
    <div className="grow bg-white p-1 dark:bg-black">
      <ModalTagLike
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        tag={selectedTag}
        _type={selectedType}
        // 재로딩은 이 컴포넌트에서 하기 때문에 getGalleryList를 넘기면 안됨.
      />
      {/* 랭크 타입 선택 */}
      <div className="mb-2 flex justify-end gap-2">
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${rankType == "gallery_view" ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => pageMove("gallery_view")}
        >
          갤러리 조회
        </button>
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${rankType == "gallery_like" ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => pageMove("gallery_like")}
        >
          갤러리 좋아요
        </button>
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${rankType == "tag_like" ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => pageMove("tag_like")}
        >
          태그 좋아요
        </button>
      </div>
      {/* 기간선택 */}
      <div className="mb-2 flex justify-end gap-2">
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${period == "daily" ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => pageMove(null, "daily")}
        >
          일간
        </button>
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${period == "weekly" ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => pageMove(null, "weekly")}
        >
          주간
        </button>
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${period == "monthly" ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => pageMove(null, "monthly")}
        >
          월간
        </button>
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${period == "all_time" ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => pageMove(null, "all_time")}
        >
          전기간
        </button>
      </div>
      <div className="grow">
        {rankType == "tag_like" ? (
          <TagList
            isLoading={isLoading}
            setSelectedTag={setSelectedTag}
            setIsTagModalOpen={setIsTagModalOpen}
          />
        ) : (
          <GalleryList
            isLoading={isLoading}
            setSelectedTag={setSelectedTag}
            setIsTagModalOpen={setIsTagModalOpen}
            setSelectedType={setSelectedType}
            // 재로딩은 이 컴포넌트에서 하기 때문에 getGalleryList를 넘기면 안됨.
          />
        )}
      </div>
      <div className="flex justify-center pt-5">
        <Pagination page={page} maxPage={maxPage} />
      </div>
    </div>
  );
}
