import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTagInfoStore, useTagLikeStore } from "../store";
import ModalTagLike from "./ModalTagLike";
import Pagination from "./Pagination";
import TagList from "./TagList";
import { ThumbsDown, ThumbsUp } from "lucide-react";

// 좋아요/싫어요 한 태그들을 보여준다.
export default function MyTag() {
  const { tagLikeList } = useTagLikeStore();
  const { getTagsInfoByIds } = useTagInfoStore();
  // 좋아요/싫어요 구분
  const [flag, setFlag] = useState(true);
  const [maxPage, setMaxPage] = useState(1);
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || 1;
  const [isLoading, setIsLoading] = useState(true);
  // 태그 모달창을 위한 변수들
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState({
    tag_id: 1,
    name: "female:anal",
    like_count: 0,
    dislike_count: 0,
  });
  const selectedType = {
    type_id: 1,
    name: "doujinshi",
    title_bg_color: "CC9999",
    sub_bg_color: "FFCCCC",
    sub_text_color: "663333",
  };
  async function getTagList(selectedUTL) {
    setIsLoading(true);
    document.getElementById("content-scroll").scrollTo({
      top: 0,
    });
    await getTagsInfoByIds(selectedUTL.map((v) => v.tag_id));
    setIsLoading(false);
  }
  useEffect(() => {
    //tagLikeList를 정렬하면 된다.
    let selectedUTL = tagLikeList.filter((v) => v.flag == flag);
    const maxPage = Math.ceil(selectedUTL.length / 20);
    setMaxPage(maxPage > 0 ? maxPage : 1);
    console.log(selectedUTL.slice(20 * (page - 1), 20 * page));
    getTagList(selectedUTL.slice(20 * (page - 1), 20 * page));
  }, [page, flag, tagLikeList]);
  return (
    <div className="flex grow flex-col bg-white p-1 dark:bg-black">
      <ModalTagLike
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        tag={selectedTag}
        _type={selectedType}
        // 재로딩은 이 컴포넌트에서 하기 때문에 getGalleryList를 넘기면 안됨.
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
        <TagList
          isLoading={isLoading}
          setSelectedTag={setSelectedTag}
          setIsTagModalOpen={setIsTagModalOpen}
        />
      </div>
      <div className="flex justify-center pt-5">
        <Pagination page={page} maxPage={maxPage} />
      </div>
    </div>
  );
}
