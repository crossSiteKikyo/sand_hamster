import { useState } from "react";
import Tag from "../components/Tag";
import {
  useGalleryLikeStore,
  useTagStore,
  useTypeStore,
  useUserStore,
} from "../store";
import TagMain from "../components/TagMain";
import { Eye, ThumbsDown, ThumbsUp } from "lucide-react";
import { useLongPress } from "use-long-press";
import ModalGalleryLike from "./ModalGalleryLike";

export default function GalleryList({
  galleryList,
  isLoading,
  setSelectedTag,
  setIsTagModalOpen,
  setSelectedType,
  getGalleryList,
}) {
  const { typeList } = useTypeStore();
  const { tagMap } = useTagStore();
  const { user } = useUserStore();
  const { galleryLikeList } = useGalleryLikeStore();
  // 갤러리 모달창을 위한 변수들
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState({
    g_id: 3811499,
    title: "someTitle",
  });
  const galleryLongPressHandlers = useLongPress((e, { context: gallery }) => {
    if (user == null) {
      toast("갤러리 좋아요/싫어요 기능을 이용하시려면 로그인 해주세요");
    } else {
      setSelectedGallery(gallery);
      setIsGalleryModalOpen(true);
      console.log(gallery);
    }
  });

  if (isLoading) {
    return <div className="text-center">데이터를 불러오는 중입니다...</div>;
  }
  return (
    <>
      <ModalGalleryLike
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        getGalleryList={getGalleryList}
        gallery={selectedGallery}
      />
      {galleryList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
          {galleryList.map((g) => {
            const date = new Date(g.date).toLocaleString();
            const type = typeList[g.type_id - 1];
            const tag_ids = g.gallery_tag.map((v) => v.tag_id);
            const tags = tag_ids.map((tag_id) => tagMap.get(tag_id));
            const artists = tags.filter((v) => v.name.startsWith("artist:")); // 작가
            const groups = tags.filter((v) => v.name.startsWith("group:")); //그룹
            const parodies = tags.filter((v) => v.name.startsWith("parody:")); //시리즈
            const characters = tags.filter((v) =>
              v.name.startsWith("character:"),
            ); //캐릭터
            const males = tags.filter((v) => v.name.startsWith("male:")); //남자
            const females = tags.filter((v) => v.name.startsWith("female:")); //여자
            const others = tags.filter(
              (v) =>
                !v.name.startsWith("artist:") &&
                !v.name.startsWith("group:") &&
                !v.name.startsWith("parody:") &&
                !v.name.startsWith("character:") &&
                !v.name.startsWith("male:") &&
                !v.name.startsWith("female:"),
            ); //나머지
            const galleryLike = galleryLikeList.find((v) => v.g_id == g.g_id);
            const galleryLikeFlag = galleryLike?.flag;
            return (
              <div
                key={g.g_id}
                className={`flex flex-col justify-between border rounded-sm ${
                  galleryLikeFlag === true && "border-pink-500"
                } ${galleryLikeFlag === false && "border-gray-500"}`}
              >
                <div>
                  <div
                    className={`text-lg bg-[#${type.title_bg_color}] text-white font-semibold 
                  [text-shadow:1px_1px_0_#${type.sub_text_color},-1px_-1px_0_#${type.sub_text_color},1px_-1px_0_#${type.sub_text_color},-1px_1px_0_#${type.sub_text_color}]`}
                  >
                    {g.title}
                  </div>
                  <div
                    className={`text-base bg-[#${type.sub_bg_color}] text-[#${type.sub_text_color}] font-bold border-b border-[#${type.title_bg_color}]`}
                  >
                    {"종류: " + type.name}
                  </div>
                  <div
                    className={`flex flex-wrap text-base bg-[#${type.sub_bg_color}] text-[#${type.sub_text_color}] font-bold border-b border-[#${type.title_bg_color}]`}
                  >
                    작가:
                    {artists.map((v) => (
                      <TagMain
                        key={v.tag_id}
                        tag={v}
                        type={type}
                        setSelectedTag={setSelectedTag}
                        setIsTagModalOpen={setIsTagModalOpen}
                        selectTypeCallback={() => setSelectedType(type)}
                      />
                    ))}
                  </div>
                  <div
                    className={`flex flex-wrap text-base bg-[#${type.sub_bg_color}] text-[#${type.sub_text_color}] font-bold border-b border-[#${type.title_bg_color}]`}
                  >
                    그룹:
                    {groups.map((v) => (
                      <TagMain
                        key={v.tag_id}
                        tag={v}
                        type={type}
                        setSelectedTag={setSelectedTag}
                        setIsTagModalOpen={setIsTagModalOpen}
                        selectTypeCallback={() => setSelectedType(type)}
                      />
                    ))}
                  </div>
                  <div
                    className={`flex flex-wrap text-base bg-[#${type.sub_bg_color}] text-[#${type.sub_text_color}] font-bold border-b border-[#${type.title_bg_color}]`}
                  >
                    시리즈:
                    {parodies.map((v) => (
                      <TagMain
                        key={v.tag_id}
                        tag={v}
                        type={type}
                        setSelectedTag={setSelectedTag}
                        setIsTagModalOpen={setIsTagModalOpen}
                        selectTypeCallback={() => setSelectedType(type)}
                      />
                    ))}
                  </div>
                  {characters.length > 0 && (
                    <div
                      className={`flex flex-wrap text-base bg-[#${type.sub_bg_color}] text-[#${type.sub_text_color}] font-bold border-b border-[#${type.title_bg_color}]`}
                    >
                      캐릭터:
                      {characters.map((v) => (
                        <TagMain
                          key={v.tag_id}
                          tag={v}
                          type={type}
                          setSelectedTag={setSelectedTag}
                          setIsTagModalOpen={setIsTagModalOpen}
                          selectTypeCallback={() => setSelectedType(type)}
                        />
                      ))}
                    </div>
                  )}
                  <div {...galleryLongPressHandlers(g)} className="flex">
                    <img
                      className="w-1/2"
                      src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F14062F0B4B2C93D66D"
                    />
                    <img
                      className="w-1/2"
                      src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F14062F0B4B2C93D66D"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 p-1">
                    {males.map((v) => (
                      <Tag
                        key={v.tag_id}
                        tag={v}
                        type="male"
                        setSelectedTag={setSelectedTag}
                        setIsTagModalOpen={setIsTagModalOpen}
                      />
                    ))}
                    {females.map((v) => (
                      <Tag
                        key={v.tag_id}
                        tag={v}
                        type="female"
                        setSelectedTag={setSelectedTag}
                        setIsTagModalOpen={setIsTagModalOpen}
                      />
                    ))}
                    {others.map((v) => (
                      <Tag
                        key={v.tag_id}
                        tag={v}
                        type="other"
                        setSelectedTag={setSelectedTag}
                        setIsTagModalOpen={setIsTagModalOpen}
                      />
                    ))}
                  </div>
                </div>
                {/* 하단 정보 */}
                <div>
                  <div className="flex justify-between px-1">
                    <p className="text-gray-500 flex gap-1">
                      <ThumbsUp className="w-4" />
                      {g.like_count}
                    </p>
                    <p className="text-gray-500 flex gap-1">
                      <Eye className="w-4" />
                      {g.view_count}
                    </p>
                    <p className="text-gray-500 flex gap-1">
                      <ThumbsDown className="w-4" />
                      {g.dislike_count}
                    </p>
                  </div>
                  <div className="flex justify-between px-1">
                    <p className="text-gray-500">{g.g_id}</p>
                    <p
                      className={`text-[#${type.title_bg_color}] font-semibold`}
                    >
                      {date}
                    </p>
                    <p className="text-gray-500">{g.filecount}p</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-lg flex justify-center">결과가 없습니다</p>
      )}
    </>
  );
}
