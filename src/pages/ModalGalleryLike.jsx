import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import MyButton from "../components/MyButton";
import { toast } from "react-toastify";
import useUserStore from "../store/useUserStore";
import useGalleryLikeStore from "../store/useGalleryLikeStore";
export default function ModalGalleryLike({ isOpen, onClose, gallery }) {
  const { user } = useUserStore();
  const {
    galleryLikeList,
    hiddenGalleryIds,
    addGalleryLike,
    addHiddenGallery,
    deleteGalleryLike,
    deleteHiddenGallery,
  } = useGalleryLikeStore();

  let currentStatus = "none";
  if (hiddenGalleryIds.has(gallery.g_id)) currentStatus = "dislike";
  else if (galleryLikeList.find((v) => v.g_id == gallery.g_id) != undefined)
    currentStatus = "like";

  const changeLikeStatus = async (selected) => {
    // 익명 유저가 좋아요를 클릭할 수 없다.
    if (user == null && selected == "like") {
      toast("갤러리 좋아요 기능을 이용하시려면 로그인 해주세요");
      return;
    }
    // 똑같은 것을 클릭했으면 아무일도 일어나지 않는다.
    if (selected == currentStatus) return;
    // 현재 아무 상태도 아닐 때
    if (currentStatus == "none") {
      if (selected == "like") await addGalleryLike(user.id, gallery.g_id);
      else if (selected == "dislike") await addHiddenGallery(gallery.g_id);
    }
    // 현재 좋아요 상태일 때
    else if (currentStatus == "like") {
      if (selected == "none") await deleteGalleryLike(user.id, gallery.g_id);
      else if (selected == "dislike") {
        await deleteGalleryLike(user.id, gallery.g_id);
        await addHiddenGallery(gallery.g_id);
      }
    }
    // 현재 싫어요 상태일 때
    else if (currentStatus == "dislike") {
      if (selected == "none") await deleteHiddenGallery(gallery.g_id);
      else if (selected == "like") {
        await addGalleryLike(user.id, gallery.g_id);
        await deleteHiddenGallery(gallery.g_id);
      }
    }
    onClose();
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30"></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={`flex flex-col items-center rounded bg-[#CCCCCC] p-6 shadow-xl select-none dark:bg-[#999999] dark:text-white`}
        >
          <DialogTitle className="mb-8 flex flex-col items-center">
            <p className="pb-3 text-lg font-medium">
              갤러리 좋아요/싫어요 상태 변경
            </p>
            <p className="text-2xl font-bold">{gallery.g_id}</p>
            <p className="">{gallery.title}</p>
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
