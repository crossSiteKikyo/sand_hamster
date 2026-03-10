import { ChevronDown, ChevronUp, FileUp } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import useGalleryLikeStore from "../store/useGalleryLikeStore";
import getDataFromFile from "../function/getDataFromFile";
import { hiddenGalleryCache } from "../cacheDB";
import useTagLikeStore from "../store/useTagLikeStore";
import useTagStore from "../store/useTagStore";
import useUserStore from "../store/useUserStore";

export default function ImportData() {
  const { user } = useUserStore();
  const [isDataImportCardOpen, setIsDataImportCardOpen] = useState(false); // 초기 상태: 접힘
  const { galleryLikeList, addGalleryLike, getHiddenGalleryIds } =
    useGalleryLikeStore();
  const { tagLikeList, tagDislikeList, addTagLike, addTagDislike } =
    useTagLikeStore();
  const { tagList } = useTagStore();
  const uploadData = async (type) => {
    // pc라면 파일 탐색기로, 모바일이라면 저장공간을 열어 파일 하나를 선택한 후, JSON.parse한다.
    try {
      const parsedData = await getDataFromFile();
      // 3. 타입에 따른 데이터 처리 로직 분기
      if (type === "sand_hamster") {
        handleSandHamsterData(parsedData);
      } else if (type === "kHitomiViewer") {
        handleKHitomiData(parsedData);
      }
    } catch (e) {
      console.log(e);
      toast("json파싱 에러");
    }
  };
  const handleSandHamsterData = async (data) => {
    if (
      data.galleryLikeList == undefined ||
      data.tagLikeList == undefined ||
      data.tagDislikeList == undefined
    ) {
      toast("sand_hamster 데이터 형식이 아닙니다");
      return;
    }
    await handleGalleryLikeDatas(data.galleryLikeList.map((v) => v.g_id));
    await handleTagLikeDatas(data.tagLikeList.map((v) => v.tag_id));
    await handleTagDislikeDatas(data.tagDislikeList.map((v) => v.tag_id));
    toast("sand_hamster 데이터 업로드를 완료했습니다");
  };
  const handleKHitomiData = async (data) => {
    // kHitomiViewer의 데이터 형식에 맞춰 변환 후 저장 로직
    if (data.galleries == undefined || data.tags == undefined) {
      toast("kHitomiViewer 데이터 형식이 아닙니다");
      return;
    }
    // 싫어요 데이터와 좋아요 데이터를 구분한다.
    let galleryLikeGids = data.galleries
      .filter((v) => v.likeStatus == 2)
      .map((v) => v.gId);
    let galleryDislikeGids = data.galleries
      .filter((v) => v.likeStatus == 0)
      .map((v) => v.gId);

    // tag_id 값을 찾아 배열로 만든다.
    let tagLikeTagIds = data.tags
      .map((v) => v.likeStatus == 2)
      .map((v) => tagList.find((t) => t.name == v.name)?.tag_id);

    let tagDislikeTagIds = data.tags
      .map((v) => v.likeStatus == 0)
      .map((v) => tagList.find((t) => t.name == v.name)?.tag_id);

    await handleGalleryLikeDatas(galleryLikeGids);
    await handleGalleryDislikeDatas(galleryDislikeGids);
    await handleTagLikeDatas(tagLikeTagIds);
    await handleTagDislikeDatas(tagDislikeTagIds);
    toast("kHitomiViewer 데이터 업로드를 완료했습니다");
  };
  const handleGalleryLikeDatas = async (g_ids) => {
    // newGalleryLikeList는 g_id를 갖는 배열로 들어온다.
    for (let i = 0; i < g_ids.length; i++) {
      const g_id = g_ids[i];
      if (g_id == undefined) continue;
      const galleryLike = galleryLikeList.find((v) => v.g_id == g_id);
      // g_id가 없다면 insert
      if (galleryLike == undefined) {
        const flag = await addGalleryLike(user.id, g_id);
        // insert했는데 에러가 났으면 종료
        if (flag == false) break;
      }
    }
  };
  const handleGalleryDislikeDatas = async (g_ids) => {
    await hiddenGalleryCache.bulkPut(g_ids);
    await getHiddenGalleryIds();
  };
  const handleTagLikeDatas = async (tagLikeTagIds) => {
    // tag_id 를 갖는 배열이여야함
    for (let i = 0; i < tagLikeTagIds.length; i++) {
      const tag_id = tagLikeTagIds[i];
      if (tag_id == undefined) continue;
      const tagLike = tagLikeList.find((v) => v.tag_id == tag_id);
      // tag_id가 없다면 insert
      if (tagLike == undefined) {
        const flag = await addTagLike(user.id, tag_id);
        // insert했는데 에러가 났으면 종료
        if (flag == false) break;
      }
    }
  };
  const handleTagDislikeDatas = async (tagDislikeTagIds) => {
    // tag_id 를 갖는 배열이여야함
    for (let i = 0; i < tagDislikeTagIds.length; i++) {
      const tag_id = tagDislikeTagIds[i];
      if (tag_id == undefined) continue;
      const tagDislike = tagDislikeList.find((v) => v.tag_id == tag_id);
      // tag_id가 없다면 insert
      if (tagDislike == undefined) {
        const flag = await addTagDislike(user.id, tag_id);
        // insert했는데 에러가 났으면 종료
        if (flag == false) break;
      }
    }
  };

  return (
    <div className="my-2 mt-10 w-full max-w-md rounded-xl border border-gray-500">
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
  );
}
