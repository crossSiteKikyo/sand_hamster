import { useLongPress } from "use-long-press";
import { toast } from "react-toastify";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { createSearchParams, useNavigate } from "react-router-dom";
import useTagLikeStore from "../store/useTagLikeStore";
import useUserStore from "../store/useUserStore";

export default function Tag({ tag, setSelectedTag, setIsTagModalOpen }) {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { tagLikeList, tagDislikeList } = useTagLikeStore();
  const likeTagIds = tagLikeList.map((t) => t.tag_id);
  const dislikeTagIds = tagDislikeList.map((t) => t.tag_id);
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
  let type = "other";
  let name = tag.name;
  if (tag.name.startsWith("male")) {
    name = name.replace("male:", "");
    type = "male";
  } else if (tag.name.startsWith("female")) {
    name = name.replace("female:", "");
    type = "female";
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
