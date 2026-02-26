import { useState } from "react";
import Tag from "../components/Tag";
import { useTagStore, useTypeStore } from "../store";
import ModalTagLike from "./ModalTagLike";
import TagMain from "../components/TagMain";

export default function GalleryList({ galleryList, isLoading }) {
  const { typeList } = useTypeStore();
  const { tagMap } = useTagStore();
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState({
    tag_id: 1,
    name: "female:anal",
    like_count: 0,
    dislike_count: 0,
  });
  if (isLoading) {
    return <div className="text-center">데이터를 불러오는 중입니다...</div>;
  }
  return (
    <>
      <ModalTagLike
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        tag={selectedTag}
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
            return (
              <div
                key={g.g_id}
                className="flex flex-col justify-between border rounded-sm"
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
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex">
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
                <div className="flex justify-between px-1">
                  <p className="text-gray-500">{g.g_id}</p>
                  <p className={`text-[#${type.title_bg_color}] font-semibold`}>
                    {date}
                  </p>
                  <p className="text-gray-500">{g.filecount}p</p>
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
