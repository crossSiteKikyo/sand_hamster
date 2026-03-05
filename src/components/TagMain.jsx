import { useLongPress } from "use-long-press";
import { toast } from "react-toastify";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { createSearchParams, useNavigate } from "react-router-dom";
import useTagLikeStore from "../store/useTagLikeStore";
import useUserStore from "../store/useUserStore";

export default function TagMain({
  tag,
  type,
  setSelectedTag,
  setIsTagModalOpen,
  selectTypeCallback,
}) {
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
      className={`flex grow border-r px-1 text-start border-[#${type.title_bg_color}] cursor-pointer select-none bg-[#${type.sub_bg_color}]`}
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
