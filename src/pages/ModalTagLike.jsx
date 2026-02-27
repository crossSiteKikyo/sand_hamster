import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import MyButton from "../components/MyButton";
import { useTagLikeStore, useUserStore } from "../store";
import { toast } from "react-toastify";
import tagLikeApi from "../api/tagLikeApi";
export default function ModalTagLike({
  isOpen,
  onClose,
  getGalleryList,
  tag,
  _type,
}) {
  const { user } = useUserStore();
  const { tagLikeList, getTagLikeList } = useTagLikeStore();
  const colorMap = {
    artist: `bg-[#${_type.title_bg_color}] dark:bg-[#${_type.sub_bg_color}]`,
    group: `bg-[#${_type.title_bg_color}] dark:bg-[#${_type.sub_bg_color}]`,
    parody: `bg-[#${_type.title_bg_color}] dark:bg-[#${_type.sub_bg_color}]`,
    character: `bg-[#${_type.title_bg_color}] dark:bg-[#${_type.sub_bg_color}]`,
    male: "bg-blue-300 dark:bg-blue-600",
    female: "bg-pink-300 dark:bg-pink-600",
    other: "bg-gray-300 dark:bg-gray-700",
  };
  let type = "other";
  if (tag.name.startsWith("artist:")) type = "artist";
  else if (tag.name.startsWith("group:")) type = "group";
  else if (tag.name.startsWith("parody:")) type = "parody";
  else if (tag.name.startsWith("character:")) type = "character";
  else if (tag.name.startsWith("male:")) type = "male";
  else if (tag.name.startsWith("female:")) type = "female";
  let tagLike = tagLikeList.find((v) => v.tag_id == tag.tag_id);
  let tagLikeText = "none";
  if (tagLike !== undefined) {
    if (tagLike.flag) tagLikeText = "like";
    else tagLikeText = "dislike";
  }
  const changeLikeStatus = async (selected) => {
    // 똑같은 것을 클릭했으면 아무일도 일어나지 않는다.
    if (selected == tagLikeText) return;
    // 좋아요나 싫어요를 클릭했으면, insert하거나 update해야함.
    if (selected == "like" || selected == "dislike") {
      // 전 상태가 none이라면 insert, 아니면 update
      if (tagLikeText == "none") {
        let { error } = await tagLikeApi.insertTagLike(
          user.id,
          tag.tag_id,
          selected == "like" ? true : false,
        );
        if (error) toast("태그 정보 insert 에러");
      } else {
        let { error } = await tagLikeApi.updateTagLike(
          user.id,
          tag.tag_id,
          selected == "like" ? true : false,
        );
        if (error) toast("태그 정보 update 에러");
      }
      // dislike를 클릭했다면 갤러리를 다시 로딩해야한다.
      if (selected == "dislike") getGalleryList();
    }
    // 상태없음을 클릭했으면, delete하거나 아무것도 안함.
    else if (selected == "none") {
      // 전 상태가 none이 아니라면 delete
      if (tagLikeText != "none") {
        let { error } = await tagLikeApi.deleteTagLike(user.id, tag.tag_id);
        if (error) toast("태그 정보 delete 에러");
      }
    }
    getTagLikeList();
    onClose();
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30"></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={`rounded p-6 shadow-xl dark:text-white flex flex-col items-center ${colorMap[type]}`}
        >
          <DialogTitle className="mb-8 flex flex-col items-center">
            <p className="text-lg font-medium pb-3">
              태그 좋아요/싫어요 상태 변경
            </p>
            <p className="text-2xl font-bold">{tag.name}</p>
          </DialogTitle>
          <div className="flex flex-col gap-2">
            <button
              className={`bg-gray-500 rounded-md px-2 text-2xl flex items-center ${tagLikeText !== "like" ? "opacity-50 cursor-pointer" : ""}`}
              onClick={() => changeLikeStatus("like")}
            >
              좋아요 <ThumbsUp />
            </button>
            <button
              className={`bg-gray-500 rounded-md px-2 text-2xl ${tagLikeText !== "none" ? "opacity-50 cursor-pointer" : ""}`}
              onClick={() => changeLikeStatus("none")}
            >
              상태없음
            </button>
            <button
              className={`bg-gray-500 rounded-md px-2 text-2xl flex items-center ${tagLikeText !== "dislike" ? "opacity-50 cursor-pointer" : ""}`}
              onClick={() => changeLikeStatus("dislike")}
            >
              싫어요 <ThumbsDown />
            </button>
          </div>
          <div className="flex justify-end w-full pt-3">
            <MyButton onClick={onClose}>닫기</MyButton>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
