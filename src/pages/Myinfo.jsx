import { useState } from "react";
import authApi from "../api/authApi";
import { ChevronDown, ChevronUp, FileDown, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import useTagStore from "../store/useTagStore";
import useUserStore from "../store/useUserStore";
import useGalleryLikeStore from "../store/useGalleryLikeStore";
import useTagLikeStore from "../store/useTagLikeStore";
import ImportData from "./ImportData";
import downloadFileFromData from "../function/downloadFileFromData";

export default function Myinfo({ afterLogin }) {
  const { user, gallery_like_limit, tag_like_limit, tag_dislike_limit } =
    useUserStore();
  const { galleryLikeList, hiddenGalleryIds } = useGalleryLikeStore();
  const { tagLikeList, tagDislikeList } = useTagLikeStore();
  const { tagMap } = useTagStore();
  const [isDeleteCardOpen, setIsDeleteCardOpen] = useState(false); // 초기 상태: 접힘
  const [isDataExportCardOpen, setIsDataExportCardOpen] = useState(false); // 초기 상태: 접힘
  const logout = async () => {
    const { error } = await authApi.signOut();
    if (error) toast("로그아웃 에러");
    afterLogin();
  };
  const deleteUser = async () => {
    const ok = confirm("정말 탈퇴하시겠습니까?");
    if (ok) {
      const { error } = await authApi.deleteAccount();
      if (error) {
        console.error("탈퇴 실패:", error.message);
      } else {
        // 탈퇴 후 로그아웃 처리.
        alert("탈퇴되었습니다.");
        await logout();
      }
    }
  };
  const downloadData = () => {
    let newTagLikeList = structuredClone(tagLikeList);
    for (let i = 0; i < newTagLikeList.length; i++) {
      newTagLikeList[i].name = tagMap.get(newTagLikeList[i].tag_id).name;
    }
    let newTagDislikeList = structuredClone(tagDislikeList);
    for (let i = 0; i < newTagDislikeList.length; i++) {
      newTagDislikeList[i].name = tagMap.get(newTagDislikeList[i].tag_id).name;
    }
    const likeListData = {
      galleryLikeList,
      tagLikeList: newTagLikeList,
      tagDislikeList: newTagDislikeList,
    };
    console.log(likeListData);
    downloadFileFromData(likeListData, `sand_hamster_${Date.now()}.json`);
  };

  return (
    <div className="flex grow flex-col bg-white p-10 dark:bg-black">
      <p className="mb-10 text-center text-3xl font-semibold">내정보</p>
      <div className="flex w-full grow flex-col items-center">
        {/* 상단 정보 */}
        <div className="flex w-full flex-col items-center">
          <p>계정: {user.email}</p>
          <p>가입일: {new Date(user.created_at).toLocaleString()}</p>
          <p
            className="mt-2 cursor-pointer rounded-sm border px-1"
            onClick={logout}
          >
            로그아웃
          </p>
          <p className="mt-5">
            갤러리 좋아요 개수 - {galleryLikeList.length}/{gallery_like_limit}
          </p>
          <p>갤러리 싫어요 개수 - {hiddenGalleryIds.size}</p>
          <p>
            태그 좋아요 개수 - {tagLikeList.length}/{tag_like_limit}
          </p>
          <p>
            태그 싫어요 개수 - {tagDislikeList.length}/{tag_dislike_limit}
          </p>
        </div>
        {/* 데이터 가져오기 카드 */}
        <ImportData />
        {/* 데이터 내보내기 카드 */}
        <div className="my-2 w-full max-w-md rounded-xl border border-gray-500">
          <div
            className="p-4"
            onClick={() => setIsDataExportCardOpen(!isDataExportCardOpen)}
          >
            <div className="flex justify-between font-bold">
              <div className="flex">
                <FileDown />
                데이터 내보내기
              </div>
              {isDataExportCardOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
          </div>
          {isDataExportCardOpen && (
            <div className="w-full max-w-md border-t border-gray-500 p-4">
              <p>모든 갤러리 좋아요 정보를 내보냅니다</p>
              <p>모든 태그 좋아요/싫어요 정보를 내보냅니다</p>
              <div
                className="mt-2 cursor-pointer rounded-sm bg-gray-300 px-3 py-1 text-center dark:bg-gray-700"
                onClick={downloadData}
              >
                다운로드
              </div>
            </div>
          )}
        </div>
        {/* 회원 탈퇴 카드 */}
        <div className="mt-2 mb-10 w-full max-w-md rounded-xl border border-red-500">
          <div
            className="p-4"
            onClick={() => setIsDeleteCardOpen(!isDeleteCardOpen)}
          >
            <div className="flex justify-between font-bold">
              <div className="flex text-red-500">
                <Trash2 />
                회원 탈퇴
              </div>
              {isDeleteCardOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
          </div>
          {isDeleteCardOpen && (
            <div className="w-full max-w-md border-t border-red-500 p-4">
              <p>모든 갤러리 좋아요/싫어요 정보가 삭제됩니다</p>
              <p>모든 태그 좋아요/싫어요 정보가 삭제됩니다</p>
              <p>계정 정보가 삭제됩니다</p>
              <button
                className="mt-2 cursor-pointer rounded-sm bg-red-200 px-3 py-1 dark:bg-red-800"
                onClick={deleteUser}
              >
                회원 탈퇴
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
