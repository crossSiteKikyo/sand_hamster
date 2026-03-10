import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ModalTagLike from "./ModalTagLike";
import Pagination from "./Pagination";
import TagList from "./TagList";
import useTagInfoStore from "../store/useTagInfoStore";
import useTagLikeStore from "../store/useTagLikeStore";
import useTagStore from "../store/useTagStore";

// 좋아요 한 태그들을 보여준다.
export default function MyTag() {
  const navigate = useNavigate();
  const { tagLikeList } = useTagLikeStore();
  const { tagMap } = useTagStore();
  const { getTagsInfoByIds } = useTagInfoStore();
  const [maxPage, setMaxPage] = useState(1);
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || 1;
  const order = searchParams.get("order") || "created_at";
  const [isLoading, setIsLoading] = useState(true);
  // 태그 모달창을 위한 변수들
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState({
    tag_id: 1,
    name: "female:anal",
    like_count: 0,
    dislike_count: 0,
  });
  async function getTagList(selectedUTL) {
    setIsLoading(true);
    document.getElementById("content-scroll").scrollTo({
      top: 0,
    });
    await getTagsInfoByIds(selectedUTL.map((v) => v.tag_id));
    setIsLoading(false);
  }
  const changeOrder = (order) => {
    // 현재 url에서 path를 추출한다.
    const pathname = window.location.pathname;
    // 새로운 객체 생성
    const newParams = new URLSearchParams(searchParams);
    newParams.set("order", order);
    navigate(`${pathname}?${newParams.toString()}`);
  };
  useEffect(() => {
    //tagLikeList를 정렬하면 된다.
    if (order == "dict")
      tagLikeList.sort((a, b) =>
        tagMap.get(a.tag_id).name.localeCompare(tagMap.get(b.tag_id).name),
      );
    else
      tagLikeList.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
    const maxPage = Math.ceil(tagLikeList.length / 20);
    setMaxPage(maxPage > 0 ? maxPage : 1);
    console.log(tagLikeList.slice(20 * (page - 1), 20 * page));
    getTagList(tagLikeList.slice(20 * (page - 1), 20 * page));
  }, [page, order, tagLikeList]);
  return (
    <div className="flex grow flex-col bg-white p-1 dark:bg-black">
      <ModalTagLike
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        tag={selectedTag}
        _type={{ name: "doujinshi" }}
      />
      <div className="mb-2 flex justify-end gap-2">
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${order == "created_at" ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => changeOrder("created_at")}
        >
          날짜순
        </button>
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${order == "dict" ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => changeOrder("dict")}
        >
          사전순
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
