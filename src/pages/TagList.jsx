import { createSearchParams, useNavigate } from "react-router-dom";
import { useTagLikeStore } from "../store";
import { useLongPress } from "use-long-press";

export default function TagList({
  isLoading,
  setSelectedTag,
  setIsTagModalOpen,
}) {
  const navigate = useNavigate();
  const { tagLikeList, tagsInfo } = useTagLikeStore();
  const tagSearch = (tag) => {
    navigate({
      pathname: "/list",
      search: `?${createSearchParams({
        tag: tag.tag_id,
      })}`,
    });
  };
  const tagLongPressHandlers = useLongPress((e, { context: tag }) => {
    setSelectedTag(tag);
    setIsTagModalOpen(true);
  });
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
        <div className="flex h-48 flex-col justify-between rounded-sm border"></div>
        <div className="flex h-48 flex-col justify-between rounded-sm border"></div>
        <div className="flex h-48 flex-col justify-between rounded-sm border"></div>
        <div className="flex h-48 flex-col justify-between rounded-sm border"></div>
        <div className="flex h-48 flex-col justify-between rounded-sm border"></div>
        <div className="flex h-48 flex-col justify-between rounded-sm border"></div>
      </div>
    );
  }
  return (
    <>
      {tagsInfo.length > 0 ? (
        <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
          {tagsInfo.map((t) => {
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
                className={`flex cursor-pointer flex-col rounded-sm border ${colorMap[type]} ${userTagLikeFlag ? "border-pink-500" : "border-gray-500"}`}
                onClick={() => tagSearch(t)}
                {...tagLongPressHandlers(t)}
              >
                <p className="pl-1">{t.name}</p>
                <div className="flex">
                  <img
                    className="w-1/3"
                    src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F14062F0B4B2C93D66D"
                  />
                  <img
                    className="w-1/3"
                    src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F14062F0B4B2C93D66D"
                  />
                  <img
                    className="w-1/3"
                    src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F14062F0B4B2C93D66D"
                  />
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
