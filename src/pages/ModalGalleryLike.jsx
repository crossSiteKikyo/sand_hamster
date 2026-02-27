import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import MyButton from "../components/MyButton";
import { useGalleryLikeStore, useUserStore } from "../store";
import { toast } from "react-toastify";
import galleryLikeApi from "../api/galleryLikeApi";
export default function ModalGalleryLike({
  isOpen,
  onClose,
  getGalleryList,
  gallery,
}) {
  const { user } = useUserStore();
  const { galleryLikeList, getGalleryLikeList } = useGalleryLikeStore();
  let galleryLike = galleryLikeList.find((v) => v.g_id == gallery.g_id);
  let galleryLikeText = "none";
  if (galleryLike !== undefined) {
    if (galleryLike.flag) galleryLikeText = "like";
    else galleryLikeText = "dislike";
  }
  const changeLikeStatus = async (selected) => {
    // 똑같은 것을 클릭했으면 아무일도 일어나지 않는다.
    if (selected == galleryLikeText) return;
    // 좋아요나 싫어요를 클릭했으면, insert하거나 update해야함.
    if (selected == "like" || selected == "dislike") {
      // 전 상태가 none이라면 insert, 아니면 update
      if (galleryLikeText == "none") {
        let { error } = await galleryLikeApi.insertGalleryLike(
          user.id,
          gallery.g_id,
          selected == "like" ? true : false,
        );
        if (error) toast("갤러리 좋아요/싫어요 정보 insert 에러");
      } else {
        let { error } = await galleryLikeApi.updateGalleryLike(
          user.id,
          gallery.g_id,
          selected == "like" ? true : false,
        );
        if (error) toast("갤러리 좋아요/싫어요 정보 update 에러");
      }
      // dislike를 클릭했다면 갤러리를 다시 로딩해야한다.
      if (selected == "dislike") getGalleryList();
    }
    // 상태없음을 클릭했으면, delete하거나 아무것도 안함.
    else if (selected == "none") {
      // 전 상태가 none이 아니라면 delete
      if (galleryLikeText != "none") {
        let { error } = await galleryLikeApi.deleteGalleryLike(
          user.id,
          gallery.g_id,
        );
        if (error) toast("갤러리 좋아요/싫어요 정보 delete 에러");
      }
    }
    getGalleryLikeList();
    onClose();
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30"></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={`rounded p-6 shadow-xl dark:text-white flex flex-col items-center dark:bg-[#999999] bg-[#CCCCCC]`}
        >
          <DialogTitle className="mb-8 flex flex-col items-center">
            <p className="text-lg font-medium pb-3">
              갤러리 좋아요/싫어요 상태 변경
            </p>
            <p className="text-2xl font-bold">{gallery.g_id}</p>
            <p className="">{gallery.title}</p>
          </DialogTitle>
          <div className="flex flex-col gap-2">
            <button
              className={`bg-gray-500 rounded-md px-2 text-2xl flex items-center ${galleryLikeText !== "like" ? "opacity-50 cursor-pointer" : ""}`}
              onClick={() => changeLikeStatus("like")}
            >
              좋아요 <ThumbsUp />
            </button>
            <button
              className={`bg-gray-500 rounded-md px-2 text-2xl ${galleryLikeText !== "none" ? "opacity-50 cursor-pointer" : ""}`}
              onClick={() => changeLikeStatus("none")}
            >
              상태없음
            </button>
            <button
              className={`bg-gray-500 rounded-md px-2 text-2xl flex items-center ${galleryLikeText !== "dislike" ? "opacity-50 cursor-pointer" : ""}`}
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
