import { useLongPress } from "use-long-press";
import { toast } from "react-toastify";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import useTagLikeStore from "../store/useTagLikeStore";
import useUserStore from "../store/useUserStore";

export default function SearchedTagMain({
  tag,
  setSelectedTag,
  setIsTagModalOpen,
}) {
  const { user } = useUserStore();
  const { tagLikeList } = useTagLikeStore();
  const likeTagIds = tagLikeList.map((t) => {
    if (t.flag) return t.tag_id;
  });
  const dislikeTagIds = tagLikeList.map((t) => {
    if (!t.flag) return t.tag_id;
  });
  const handlers = useLongPress(() => {
    if (user == null) {
      toast("태그 좋아요/싫어요 기능을 이용하시려면 로그인 해주세요");
    } else {
      setSelectedTag(tag);
      setIsTagModalOpen(true);
    }
  });
  const colorMap = {
    artist: "bg-[#FFCCCC] dark:bg-[#CC9999]",
    group: "bg-[#FFCCCC] dark:bg-[#CC9999]",
    parody: "bg-[#FFCCCC] dark:bg-[#CC9999]",
    character: "bg-[#FFCCCC] dark:bg-[#CC9999]",
    male: "bg-blue-300 dark:bg-blue-600",
    female: "bg-pink-300 dark:bg-pink-600",
    other: "bg-gray-300 dark:bg-gray-700",
  };
  let type = "other";
  const name = tag.name;
  if (name.startsWith("artist:")) type = "artist";
  else if (name.startsWith("group:")) type = "group";
  else if (name.startsWith("parody:")) type = "parody";
  else if (name.startsWith("character:")) type = "character";
  else if (name.startsWith("male:")) type = "male";
  else if (name.startsWith("female:")) type = "female";
  return (
    <button
      {...handlers()}
      className={`flex cursor-pointer rounded-md px-1 select-none ${colorMap[type]}`}
    >
      {name}
      {likeTagIds.includes(tag.tag_id) && <ThumbsUp className="w-5 pl-1" />}
      {dislikeTagIds.includes(tag.tag_id) && (
        <ThumbsDown className="w-5 pl-1" />
      )}
    </button>
  );
}
