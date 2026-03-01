import { useLongPress } from "use-long-press";
import { useTagLikeStore, useUserStore } from "../store";
import { toast } from "react-toastify";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { createSearchParams, useNavigate } from "react-router-dom";

export default function Tag({ tag, type, setSelectedTag, setIsTagModalOpen }) {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { tagLikeList } = useTagLikeStore();
  const likeTagIds = tagLikeList.map((t) => {
    if (t.flag) return t.tag_id;
  });
  const dislikeTagIds = tagLikeList.map((t) => {
    if (!t.flag) return t.tag_id;
  });
  const tagSearch = () => {
    navigate({
      pathname: "/list",
      search: `?${createSearchParams({
        tag: tag.tag_id,
      })}`,
    });
  };
  const handlers = useLongPress(() => {
    if (user == null) {
      toast("태그 좋아요/싫어요 기능을 이용하시려면 로그인 해주세요");
    } else {
      setSelectedTag(tag);
      setIsTagModalOpen(true);
    }
  });
  const colorMap = {
    male: "bg-blue-300 dark:bg-blue-600",
    female: "bg-pink-300 dark:bg-pink-600",
    other: "bg-gray-300 dark:bg-gray-700",
  };
  let name = tag.name;
  if (type == "male") {
    name = name.replace("male:", "");
  } else if (type == "female") {
    name = name.replace("female:", "");
  }
  return (
    <button
      {...handlers()}
      className={`flex cursor-pointer rounded-md px-1 select-none ${colorMap[type]}`}
      onClick={tagSearch}
    >
      {name}
      {likeTagIds.includes(tag.tag_id) && <ThumbsUp className="w-5 pl-1" />}
      {dislikeTagIds.includes(tag.tag_id) && (
        <ThumbsDown className="w-5 pl-1" />
      )}
    </button>
  );
}
