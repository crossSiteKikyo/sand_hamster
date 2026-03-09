import { createSearchParams, useNavigate } from "react-router-dom";
import { useLongPress } from "use-long-press";
import { Loader2 } from "lucide-react";
import useTagInfoStore from "../store/useTagInfoStore";
import useTagLikeStore from "../store/useTagLikeStore";
import useHitomiStore from "../store/useHitomiStore";
import useUserStore from "../store/useUserStore";
import { toast } from "react-toastify";

export default function TagList({
  isLoading,
  setSelectedTag,
  setIsTagModalOpen,
}) {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { tagLikeList } = useTagLikeStore();
  const { tagIds, tagInfoMap } = useTagInfoStore();
  const { thumbChar1, thumbChar2, numSet } = useHitomiStore();
  const tagSearch = (tag) => {
    navigate({
      pathname: "/list",
      search: `?${createSearchParams({
        tag: tag.tag_id,
      })}`,
    });
  };
  const tagLongPressHandlers = useLongPress((e, { context: tag }) => {
    if (user == null) {
      toast("태그 좋아요/싫어요 기능을 이용하시려면 로그인해 주세요");
    } else {
      setSelectedTag(tag);
      setIsTagModalOpen(true);
    }
  });
  const decodeHitomiThumbnailUrl = (url) => {
    if (url == undefined) return "";
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
            className="flex h-48 animate-pulse flex-col items-center justify-center rounded-sm border"
          >
            <Loader2 className="h-10 animate-spin" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <>
      {tagIds.length > 0 ? (
        <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
          {tagIds.map((tag_id) => {
            const t = tagInfoMap.get(tag_id);
            if (t == undefined)
              return (
                <div
                  key={tag_id}
                  className="flex h-48 animate-pulse flex-col items-center justify-center rounded-sm border"
                >
                  <Loader2 className="h-10 animate-spin" />
                </div>
              );
            const colorMap = {
              artist: "bg-[#FFCCCC] dark:bg-[#CC9999]",
              group: "bg-[#FFCCCC] dark:bg-[#CC9999]",
              parody: "bg-[#FFCCCC] dark:bg-[#CC9999]",
              character: "bg-[#FFCCCC] dark:bg-[#CC9999]",
              male: "bg-blue-300 dark:bg-blue-600",
              female: "bg-pink-300 dark:bg-pink-600",
              other: "bg-gray-300 dark:bg-gray-700",
            };
            let type = "other";
            const name = t.name;
            if (name.startsWith("artist:")) type = "artist";
            else if (name.startsWith("group:")) type = "group";
            else if (name.startsWith("parody:")) type = "parody";
            else if (name.startsWith("character:")) type = "character";
            else if (name.startsWith("male:")) type = "male";
            else if (name.startsWith("female:")) type = "female";
            const userTagLike = tagLikeList.find((v) => v.tag_id == t.tag_id);
            const userTagLikeFlag = userTagLike?.flag;

            return (
              <div
                key={t.tag_id}
                className={`flex cursor-pointer flex-col rounded-sm border ${colorMap[type]} ${userTagLikeFlag === true ? "border-pink-500" : ""} ${userTagLikeFlag === false ? "border-gray-500" : ""}`}
                onClick={() => tagSearch(t)}
                {...tagLongPressHandlers(t)}
              >
                <div className="flex justify-between px-1">
                  <p>{t.name}</p>
                  {userTagLike != undefined && (
                    <p className="text-sm text-gray-500">
                      {new Date(userTagLike.date).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="relative flex min-h-36 items-center select-none">
                  {t.thumbnails[0] && (
                    <img
                      className="h-auto w-1/3"
                      alt="첫번째 썸네일"
                      src={decodeHitomiThumbnailUrl(t.thumbnails[0])}
                    />
                  )}
                  {t.thumbnails[1] && (
                    <img
                      className="h-auto w-1/3"
                      alt="두번째 썸네일"
                      src={decodeHitomiThumbnailUrl(t.thumbnails[1])}
                    />
                  )}
                  {t.thumbnails[2] && (
                    <img
                      className="h-auto w-1/3"
                      alt="세번째 썸네일"
                      src={decodeHitomiThumbnailUrl(t.thumbnails[2])}
                    />
                  )}
                  {userTagLikeFlag === false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 px-1 text-sm dark:bg-gray-900">
                      싫어요 태그 검열
                    </div>
                  )}
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
