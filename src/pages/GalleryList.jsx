import { useState } from "react";
import Tag from "../components/Tag";
import TagMain from "../components/TagMain";
import { Loader2 } from "lucide-react";
import { useLongPress } from "use-long-press";
import ModalGalleryLike from "./ModalGalleryLike";
import useTypeStore from "../store/useTypeStore";
import useTagStore from "../store/useTagStore";
import useUserStore from "../store/useUserStore";
import useGalleryLikeStore from "../store/useGalleryLikeStore";
import useGalleryStore from "../store/useGalleryStore";
import useHitomiStore from "../store/useHitomiStore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function GalleryList({
  isLoading,
  setSelectedTag,
  setIsTagModalOpen,
  setSelectedType,
  getGalleryList,
}) {
  const navigate = useNavigate();
  const { typeList } = useTypeStore();
  const { tagMap } = useTagStore();
  const { user } = useUserStore();
  const { galleryLikeList } = useGalleryLikeStore();
  const { galleryIds, galleryMap } = useGalleryStore();
  const { thumbChar1, thumbChar2, numSet } = useHitomiStore();
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
  const decodeHitomiThumbnailUrl = (url) => {
    // https://tn.hitomi.la로 시작하는 url만 decode해야한다.
    if (!url.startsWith("https://tn.hitomi.la")) return url;
    const hash = url.match(/[0-9a-z]{40,}/)[0];
    const num = parseInt(
      `${hash[hash.length - 1]}${hash[hash.length - 3]}${hash[hash.length - 2]}`,
      16,
    );
    const ch = numSet.has(num) ? thumbChar2 : thumbChar1;
    return url.replace("tn.hitomi.la", `${ch}tn.gold-usergeneratedcontent.net`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
        {[...Array(6)].map((v, i) => (
          <div
            key={i}
            className="flex h-96 animate-pulse flex-col items-center justify-center rounded-sm border"
          >
            <Loader2 className="h-10 animate-spin" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <>
      <ModalGalleryLike
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        getGalleryList={getGalleryList}
        gallery={selectedGallery}
      />
      {galleryIds.length > 0 ? (
        <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
          {galleryIds.map((g_id) => {
            const g = galleryMap.get(g_id);
            if (g == undefined)
              return (
                <div
                  key={g_id}
                  className="flex h-96 animate-pulse flex-col items-center justify-center rounded-sm border"
                >
                  <Loader2 className="h-10 animate-spin" />
                </div>
              );
            const date = new Date(g.date).toLocaleString();
            const type = typeList[g.type_id - 1];
            const tag_ids = g.tag_ids;
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
                className={`flex flex-col justify-between rounded-sm border ${
                  galleryLikeFlag === true && "border-pink-500"
                } ${galleryLikeFlag === false && "border-gray-500"}`}
              >
                <div>
                  <div
                    className={`text-lg font-semibold text-white`}
                    style={{
                      backgroundColor: `#${type.title_bg_color}`,
                      textShadow: `1px 1px 0 #${type.sub_text_color},-1px -1px 0 #${type.sub_text_color},1px -1px 0 #${type.sub_text_color},-1px 1px 0 #${type.sub_text_color}`,
                    }}
                  >
                    {g.title}
                  </div>
                  <div
                    className={`border-b text-base font-bold`}
                    style={{
                      backgroundColor: `#${type.sub_bg_color}`,
                      color: `#${type.sub_text_color}`,
                      borderColor: `#${type.title_bg_color}`,
                    }}
                  >
                    {"종류: " + type.name}
                  </div>
                  <div
                    className={`flex flex-wrap border-b text-base font-bold`}
                    style={{
                      backgroundColor: `#${type.sub_bg_color}`,
                      color: `#${type.sub_text_color}`,
                      borderColor: `#${type.title_bg_color}`,
                    }}
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
                    className={`flex flex-wrap border-b text-base font-bold`}
                    style={{
                      backgroundColor: `#${type.sub_bg_color}`,
                      color: `#${type.sub_text_color}`,
                      borderColor: `#${type.title_bg_color}`,
                    }}
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
                    className={`flex flex-wrap border-b text-base font-bold`}
                    style={{
                      backgroundColor: `#${type.sub_bg_color}`,
                      color: `#${type.sub_text_color}`,
                      borderColor: `#${type.title_bg_color}`,
                    }}
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
                      className={`flex flex-wrap border-b text-base font-bold`}
                      style={{
                        backgroundColor: `#${type.sub_bg_color}`,
                        color: `#${type.sub_text_color}`,
                        borderColor: `#${type.title_bg_color}`,
                      }}
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
                  <div
                    {...galleryLongPressHandlers(g)}
                    className="flex min-h-40 items-center select-none"
                    onClick={() => navigate(`/viewManga?g_id=${g.g_id}`)}
                  >
                    <img
                      className="h-auto w-1/2"
                      src={decodeHitomiThumbnailUrl(g.thumb1)}
                      alt="첫번째 썸네일"
                    />
                    <img
                      className="h-auto w-1/2"
                      src={decodeHitomiThumbnailUrl(g.thumb2)}
                      alt="두번째 썸네일"
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
                <div className="flex justify-between px-1">
                  <p className="text-gray-500">{g.g_id}</p>
                  <p>{date}</p>
                  <p className="text-gray-500">{g.filecount}p</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="flex justify-center text-lg">결과가 없습니다</p>
      )}
    </>
  );
}
