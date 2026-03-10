import { useEffect, useState } from "react";
import ModalTagLike from "./ModalTagLike";
import useTagLikeStore from "../store/useTagLikeStore";
import useTagStore from "../store/useTagStore";
import TagMain from "../components/TagMain";
import Tag from "../components/Tag";

export default function TagBlock() {
  const [order, setOrder] = useState("created_at");
  const { tagDislikeList } = useTagLikeStore();
  const { tagMap } = useTagStore();
  const [tags, setTags] = useState([]);
  // 태그 모달창을 위한 변수들
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState({
    tag_id: 1,
    name: "female:anal",
    like_count: 0,
    dislike_count: 0,
  });
  const type = {
    name: "doujinshi",
    title_bg_color: "CC9999",
    sub_bg_color: "FFCCCC",
  };
  useEffect(() => {
    if (order == "created_at")
      tagDislikeList.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
    else
      tagDislikeList.sort((a, b) =>
        tagMap.get(a.tag_id).name.localeCompare(tagMap.get(b.tag_id).name),
      );
    setTags(tagDislikeList.map((v) => tagMap.get(v.tag_id)));
    console.log("ssdd", order);
  }, [order, tagDislikeList]);
  return (
    <div className="flex grow flex-col items-center bg-white p-1 dark:bg-black">
      <ModalTagLike
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        tag={selectedTag}
        _type={type}
      />
      <div className="flex justify-center p-2 text-xl font-semibold">
        싫어요 태그 목록
      </div>
      <div className="mb-2 flex justify-end gap-2">
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${order == "created_at" ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => setOrder("created_at")}
        >
          날짜순
        </button>
        <button
          className={`flex gap-1 rounded-xl border border-gray-500 p-2 ${order == "dict" ? "bg-gray-200 dark:bg-gray-700" : "cursor-pointer"}`}
          onClick={() => setOrder("dict")}
        >
          사전순
        </button>
      </div>
      <div className="flex w-full max-w-sm grow flex-col gap-1">
        {tags.map((v) => {
          const name = v.name;
          if (
            name.startsWith("artist:") ||
            name.startsWith("group:") ||
            name.startsWith("parody:") ||
            name.startsWith("character:")
          )
            return (
              <TagMain
                key={v.tag_id}
                tag={v}
                type={type}
                setSelectedTag={setSelectedTag}
                setIsTagModalOpen={setIsTagModalOpen}
              />
            );
          else
            return (
              <Tag
                key={v.tag_id}
                tag={v}
                setSelectedTag={setSelectedTag}
                setIsTagModalOpen={setIsTagModalOpen}
              />
            );
        })}
      </div>
    </div>
  );
}
