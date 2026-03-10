import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import MyButton from "../components/MyButton";
import { toast } from "react-toastify";
import useTagLikeStore from "../store/useTagLikeStore";
import useUserStore from "../store/useUserStore";
export default function ModalTagLike({ isOpen, onClose, tag, _type }) {
  const { user } = useUserStore();
  const {
    tagLikeList,
    tagDislikeList,
    addTagLike,
    addTagDislike,
    deleteTagLike,
    deleteTagDislike,
  } = useTagLikeStore();
  const colorMap = {
    doujinshi: `dark:bg-[#CC9999] bg-[#FFCCCC]`,
    manga: `dark:bg-[#CC99CC] bg-[#FFCCFF]`,
    artistcg: `dark:bg-[#99CCCC] bg-[#CCFFFF]`,
    gamecg: `dark:bg-[#9999CC] bg-[#CCCCFF]`,
    imageset: `dark:bg-[#$999999] bg-[#CCCCCC]`,
    male: "bg-blue-300 dark:bg-blue-600",
    female: "bg-pink-300 dark:bg-pink-600",
    other: "bg-gray-300 dark:bg-gray-700",
  };
  // colorMap을 사용하기 위한 변수이다.
  let type = "other";
  if (tag.name.startsWith("artist:")) type = _type.name;
  else if (tag.name.startsWith("group:")) type = _type.name;
  else if (tag.name.startsWith("parody:")) type = _type.name;
  else if (tag.name.startsWith("character:")) type = _type.name;
  else if (tag.name.startsWith("male:")) type = "male";
  else if (tag.name.startsWith("female:")) type = "female";

  let currentStatus = "none";
  if (tagLikeList.find((v) => v.tag_id == tag.tag_id) != undefined)
    currentStatus = "like";
  else if (tagDislikeList.find((v) => v.tag_id == tag.tag_id) != undefined)
    currentStatus = "dislike";
  const changeLikeStatus = async (selected) => {
    // 익명 유저가 클릭할 수 없다.
    if (user == null) {
      toast("태그 좋아요/싫어요 기능을 이용하시려면 로그인 해주세요");
      return;
    }
    // 똑같은 것을 클릭했으면 아무일도 일어나지 않는다.
    if (selected == currentStatus) return;
    // 현재 아무 상태도 아닐 때
    if (currentStatus == "none") {
      if (selected == "like") await addTagLike(user.id, tag.tag_id);
      else if (selected == "dislike") await addTagDislike(user.id, tag.tag_id);
    }
    // 현재 좋아요 상태일 때
    else if (currentStatus == "like") {
      if (selected == "none") await deleteTagLike(user.id, tag.tag_id);
      else if (selected == "dislike") {
        await deleteTagLike(user.id, tag.tag_id);
        await addTagDislike(user.id, tag.tag_id);
      }
    }
    // 현재 싫어요 상태일 때
    else if (currentStatus == "dislike") {
      if (selected == "none") await deleteTagDislike(user.id, tag.tag_id);
      else if (selected == "like") {
        await addTagLike(user.id, tag.tag_id);
        await deleteTagDislike(user.id, tag.tag_id);
      }
    }
    onClose();
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30"></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={`flex flex-col items-center rounded p-6 shadow-xl select-none dark:text-white ${colorMap[type]}`}
        >
          <DialogTitle className="mb-8 flex flex-col items-center">
            <p className="pb-3 text-lg font-medium">
              태그 좋아요/싫어요 상태 변경
            </p>
            <p className="text-2xl font-bold">{tag.name}</p>
          </DialogTitle>
          <div className="flex flex-col gap-2">
            <button
              className={`flex items-center rounded-md bg-gray-500 px-2 text-2xl ${currentStatus !== "like" ? "cursor-pointer opacity-50" : ""}`}
              onClick={() => changeLikeStatus("like")}
            >
              좋아요 <ThumbsUp />
            </button>
            <button
              className={`rounded-md bg-gray-500 px-2 text-2xl ${currentStatus !== "none" ? "cursor-pointer opacity-50" : ""}`}
              onClick={() => changeLikeStatus("none")}
            >
              상태없음
            </button>
            <button
              className={`flex items-center rounded-md bg-gray-500 px-2 text-2xl ${currentStatus !== "dislike" ? "cursor-pointer opacity-50" : ""}`}
              onClick={() => changeLikeStatus("dislike")}
            >
              싫어요 <ThumbsDown />
            </button>
          </div>
          <div className="flex w-full justify-end pt-3">
            <MyButton onClick={onClose}>닫기</MyButton>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
