import Tag from "../components/Tag";
import { useTagStore, useTypeStore } from "../store";

export default function GalleryList({ galleryList, isLoading }) {
  const { typeList } = useTypeStore();
  const { tagMap } = useTagStore();
  if (isLoading) {
    return <div className="text-center">데이터를 불러오는 중입니다...</div>;
  }
  return (
    <>
      {galleryList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
          {galleryList.map((g) => {
            const date = new Date(g.date).toLocaleString();
            const type = typeList[g.type_id - 1];
            const tag_ids = g.gallery_tag.map((v) => v.tag_id);
            const tagNames = tag_ids.map((tag_id) => tagMap.get(tag_id).name);
            const artists = tagNames.filter((v) => v.startsWith("artist:")); // 작가
            const groups = tagNames.filter((v) => v.startsWith("group:")); //그룹
            const parodies = tagNames.filter((v) => v.startsWith("parody:")); //시리즈
            const characters = tagNames.filter((v) =>
              v.startsWith("character:"),
            ); //캐릭터
            const males = tagNames.filter((v) => v.startsWith("male:")); //남자
            const females = tagNames.filter((v) => v.startsWith("female:")); //여자
            const others = tagNames.filter(
              (v) =>
                !v.startsWith("artist:") &&
                !v.startsWith("group:") &&
                !v.startsWith("parody:") &&
                !v.startsWith("character:") &&
                !v.startsWith("male:") &&
                !v.startsWith("female:"),
            ); //나머지
            console.log(tagNames);
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
                    className={`text-base bg-[#${type.sub_bg_color}] text-[#${type.sub_text_color}] font-bold border-b border-[#${type.title_bg_color}]`}
                  >
                    {"작가: " + artists.map((v) => v.replace("artist:", ""))}
                  </div>
                  <div
                    className={`text-base bg-[#${type.sub_bg_color}] text-[#${type.sub_text_color}] font-bold border-b border-[#${type.title_bg_color}]`}
                  >
                    {"그룹: " + groups.map((v) => v.replace("group:", ""))}
                  </div>
                  <div
                    className={`text-base bg-[#${type.sub_bg_color}] text-[#${type.sub_text_color}] font-bold border-b border-[#${type.title_bg_color}]`}
                  >
                    {"시리즈: " + parodies.map((v) => v.replace("parody:", ""))}
                  </div>
                  {characters.length > 0 && (
                    <div
                      className={`text-base bg-[#${type.sub_bg_color}] text-[#${type.sub_text_color}] font-bold border-b border-[#${type.title_bg_color}]`}
                    >
                      {"캐릭터: " +
                        characters.map((v) => v.replace("character:", ""))}
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
                      <Tag tagName={v} type="male" />
                    ))}
                    {females.map((v) => (
                      <Tag tagName={v} type="female" />
                    ))}
                    {others.map((v) => (
                      <Tag tagName={v} type="other" />
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
