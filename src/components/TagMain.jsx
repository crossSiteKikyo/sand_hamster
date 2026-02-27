import { useLongPress } from "use-long-press";
import { useTagLikeStore, useUserStore } from "../store";
import { toast } from "react-toastify";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function TagMain({
  tag,
  type,
  setSelectedTag,
  setIsTagModalOpen,
  selectTypeCallback,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUserStore();
  const { tagLikeList } = useTagLikeStore();
  const likeTagIds = tagLikeList.map((t) => {
    if (t.flag) return t.tag_id;
  });
  const dislikeTagIds = tagLikeList.map((t) => {
    if (!t.flag) return t.tag_id;
  });
  const tagSearch = () => {
    setSearchParams({ tag: tag.tag_id });
  };
  const handlers = useLongPress(() => {
    if (user == null) {
      toast("태그 좋아요/싫어요 기능을 이용하시려면 로그인 해주세요");
    } else {
      setSelectedTag(tag);
      setIsTagModalOpen(true);
      selectTypeCallback();
    }
  });
  let name = tag.name;
  if (tag.name.startsWith("artist:")) {
    name = name.replace("artist:", "");
  } else if (tag.name.startsWith("group:")) {
    name = name.replace("group:", "");
  } else if (tag.name.startsWith("parody:")) {
    name = name.replace("parody:", "");
  } else if (tag.name.startsWith("character:")) {
    name = name.replace("character:", "");
  }
  return (
    <button
      {...handlers()}
      className={`flex grow text-start px-1 border-r border-[#${type.title_bg_color}] cursor-pointer select-none bg-[#${type.sub_bg_color}]`}
      onClick={tagSearch}
    >
      {name}
      {likeTagIds.includes(tag.tag_id) && <ThumbsUp className="pl-1 w-5" />}
      {dislikeTagIds.includes(tag.tag_id) && (
        <ThumbsDown className="pl-1 w-5" />
      )}
    </button>
  );
}
