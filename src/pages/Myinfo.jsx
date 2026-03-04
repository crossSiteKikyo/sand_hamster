import { useState } from "react";
import authApi from "../api/authApi";
import {
  useGalleryLikeStore,
  useTagLikeStore,
  useTagStore,
  useUserStore,
} from "../store";
import { ChevronDown, ChevronUp, FileDown, FileUp, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import galleryLikeApi from "../api/galleryLikeApi";
import tagLikeApi from "../api/tagLikeApi";

export default function Myinfo({ afterLogin }) {
  const { user, tag_like_limit, gallery_like_limit } = useUserStore();
  const { galleryLikeList, addGalleryLike, updateGalleryLike } =
    useGalleryLikeStore();
  const { tagLikeList, addTagLike, updateTagLike } = useTagLikeStore();
  const { tagMap, tagList } = useTagStore();
  const [isDeleteCardOpen, setIsDeleteCardOpen] = useState(false); // 초기 상태: 접힘
  const [isDataExportCardOpen, setIsDataExportCardOpen] = useState(false); // 초기 상태: 접힘
  const [isDataImportCardOpen, setIsDataImportCardOpen] = useState(false); // 초기 상태: 접힘
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
    const likeListData = {
      tagLikeList: newTagLikeList,
      galleryLikeList,
    };
    console.log(likeListData);
    // 1. JSON 데이터를 문자열로 변환 (들여쓰기 2칸 추가로 가독성 확보)
    const jsonString = JSON.stringify(likeListData, null, 2);
    // 2. Blob 객체 생성 (타입은 application/json)
    const blob = new Blob([jsonString], { type: "application/json" });
    // 3. 브라우저 메모리에 임시 URL 생성
    const url = URL.createObjectURL(blob);
    // 4. 가상의 <a> 태그 생성 및 설정
    const link = document.createElement("a");
    link.href = url;
    link.download = `sand_hamster_${Date.now()}.json`; // 파일명 설정
    // 5. 클릭 이벤트 발생시켜 다운로드 트리거
    document.body.appendChild(link);
    link.click();
    // 6. 사용이 끝난 임시 URL 및 태그 제거 (메모리 관리)
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const uploadData = (type) => {
    // pc라면 파일 탐색기로, 모바일이라면 저장공간을 열어 파일 하나를 선택한 후, JSON.parse한다.
    // 1. 숨겨진 input 엘리먼트 생성
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json"; // JSON 파일만 선택 가능하도록 제한

    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      // 2. 파일 읽기 시작
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonContent = e.target.result;
          const parsedData = JSON.parse(jsonContent);
          console.log(`${type} 데이터 파싱 성공:`, parsedData);
          // 3. 타입에 따른 데이터 처리 로직 분기
          if (type === "sand_hamster") {
            handleSandHamsterData(parsedData);
          } else if (type === "kHitomiViewer") {
            handleKHitomiData(parsedData);
          }
        } catch (error) {
          console.error("JSON 파싱 에러:", error);
          toast("유효한 JSON 파일이 아닙니다.");
        }
      };
      reader.readAsText(file); // 텍스트 형식으로 읽기
    };
    // 4. 클릭 이벤트 트리거 (파일 탐색기 열림)
    input.click();
  };
  const handleGalleryLikeDatas = async (newGalleryLikeList) => {
    // newGalleryLikeList는 {g_id, flag} 배열이여야함
    for (let i = 0; i < newGalleryLikeList.length; i++) {
      const { g_id, flag } = newGalleryLikeList[i];
      if (g_id == undefined || flag === undefined) continue;
      const galleryLike = galleryLikeList.find((v) => v.g_id == g_id);
      // g_id가 없다면 insert
      if (galleryLike == undefined) {
        let { error } = await galleryLikeApi.insertGalleryLike(
          user.id,
          g_id,
          flag,
        );
        if (error) {
          toast("갤러리 좋아요/싫어요 정보 insert 에러");
          break;
        } else addGalleryLike(g_id, flag);
      }
      // flag가 같다면 아무것도 하지 않는다.
      else if (galleryLike.flag == flag) continue;
      // flag가 다르다면 update
      else {
        let { error } = await galleryLikeApi.updateGalleryLike(
          user.id,
          g_id,
          flag,
        );
        if (error) {
          toast("갤러리 좋아요/싫어요 정보 update 에러");
          break;
        } else updateGalleryLike(g_id, flag);
      }
    }
  };
  const handleTagLikeDatas = async (newTagLikeList) => {
    // newTagLikeList는 {tag_id, flag} 배열이여야함
    for (let i = 0; i < newTagLikeList.length; i++) {
      const { tag_id, flag } = newTagLikeList[i];
      if (tag_id == undefined || flag === undefined) continue;
      const tagLike = tagLikeList.find((v) => v.tag_id == tag_id);
      // tag_id가 없다면 insert
      if (tagLike == undefined) {
        let { error } = await tagLikeApi.insertTagLike(user.id, tag_id, flag);
        if (error) {
          toast("태그 정보 insert 에러");
          break;
        } else addTagLike(tag_id, flag);
      }
      // flag가 같다면 아무것도 하지 않는다.
      else if (tagLike.flag == flag) continue;
      // flag가 다르다면 update
      else {
        let { error } = await tagLikeApi.updateTagLike(user.id, tag_id, flag);
        if (error) {
          toast("태그 정보 update 에러");
          break;
        } else updateTagLike(tag_id, flag);
      }
    }
  };
  const handleSandHamsterData = async (data) => {
    if (data.galleryLikeList == undefined || data.tagLikeList == undefined) {
      toast("sand_hamster 데이터 형식이 아닙니다");
      return;
    }
    await handleGalleryLikeDatas(data.galleryLikeList);
    await handleTagLikeDatas(data.tagLikeList);
    toast("sand_hamster 데이터 업로드를 완료했습니다");
  };

  const handleKHitomiData = async (data) => {
    // kHitomiViewer의 데이터 형식에 맞춰 변환 후 저장 로직
    if (data.galleries == undefined || data.tags == undefined) {
      toast("kHitomiViewer 데이터 형식이 아닙니다");
      return;
    }
    // {g_id, flag} 배열로 만든다.
    let newGalleryLikeList = data.galleries.map((v) => ({
      g_id: v.gId,
      flag: v.likeStatus == 2 ? true : false,
    }));
    // 좋아요를 앞에오게 만들어 먼저 정보를 넣는다.
    newGalleryLikeList.sort((a, b) => b.flag - a.flag);

    // {tag_id, flag} 배열로 만든다.
    let newTagLikeList = data.tags.map((v) => ({
      tag_id: tagList.find((t) => t.name == v.name)?.tag_id,
      flag: v.likeStatus == 2 ? true : false,
    }));
    // 좋아요를 앞에오게 만들어 먼저 정보를 넣는다.
    newTagLikeList.sort((a, b) => b.flag - a.flag);

    await handleGalleryLikeDatas(newGalleryLikeList);
    await handleTagLikeDatas(newTagLikeList);
    toast("kHitomiViewer 데이터 업로드를 완료했습니다");
  };
  return (
    <div className="flex grow flex-col bg-white p-10 dark:bg-black">
      <p className="mb-10 text-center text-3xl font-semibold">내정보</p>
      <div className="flex w-full grow flex-col items-center">
        {/* 상단 정보 */}
        <div className="flex w-full flex-col items-center">
          <p>계정: {user.email}</p>
          <p>가입일: {new Date(user.created_at).toLocaleString()}</p>
          <p className="mt-5">
            갤러리 좋아요/싫어요 개수 - {galleryLikeList.length}/
            {gallery_like_limit}
          </p>
          <p>
            태그 좋아요/싫어요 개수 - {tagLikeList.length}/{tag_like_limit}
          </p>
          <p
            className="mt-5 cursor-pointer rounded-sm border px-1"
            onClick={logout}
          >
            로그아웃
          </p>
        </div>
        {/* 데이터 가져오기 카드 */}
        <div className="my-2 mt-30 w-full max-w-md rounded-xl border border-gray-500">
          <div
            className="p-4"
            onClick={() => setIsDataImportCardOpen(!isDataImportCardOpen)}
          >
            <div className="flex justify-between font-bold">
              <div className="flex">
                <FileUp />
                데이터 가져오기
              </div>
              {isDataImportCardOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
          </div>
          {isDataImportCardOpen && (
            <div className="w-full max-w-md border-t border-gray-500 p-4">
              <p>갤러리 좋아요/싫어요 정보들을 업로드합니다</p>
              <p>태그 좋아요/싫어요 정보를 업로드합니다</p>
              <div
                className="mt-2 cursor-pointer rounded-sm bg-gray-300 px-3 py-1 text-center dark:bg-gray-700"
                onClick={() => uploadData("sand_hamster")}
              >
                sand_hamster 정보 업로드
              </div>
              <div
                className="mt-2 cursor-pointer rounded-sm bg-gray-300 px-3 py-1 text-center dark:bg-gray-700"
                onClick={() => uploadData("kHitomiViewer")}
              >
                kHitomiViewer 정보 업로드
              </div>
            </div>
          )}
        </div>
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
              <p>모든 갤러리 좋아요/싫어요 정보를 내보냅니다</p>
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
