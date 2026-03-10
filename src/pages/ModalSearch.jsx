import { Dialog, DialogPanel } from "@headlessui/react";
import { useEffect, useState } from "react";
import useTagStore from "../store/useTagStore";
import { Search, X } from "lucide-react";
import SearchRecommendList from "./SearchRecommendList";
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

export default function ModalSearch({ isOpen, onClose }) {
  // 검색 선택 url에 따라 자동반영하는데 사용하는 변수들
  const { tagMap } = useTagStore();
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title") || "";
  const galleryId = searchParams.get("galleryId") || "";
  const tagIds = searchParams.getAll("tag") || [];
  const { pathname } = useLocation(); // 현재 경로를 가져옵니다.

  const navigate = useNavigate();
  const [tagSearch, setTagSearch] = useState("");
  const [titleSearch, setTitleSearch] = useState("");
  const [galleryIdSearch, setGalleryIdSearch] = useState("");
  const [isTagSearchFocused, setIsTagSearchFocused] = useState(false);
  const [filteredTags, setFilteredTags] = useState([]); // 추천 태그들
  const [selectedTags, setSelectedTags] = useState([]); // 검색에 사용되는 태그들
  const { tagList } = useTagStore();
  // 검색으로 url이 바뀌는게 아닌, 다른 방법으로 바뀌더라도, id검색 제목검색 태그검색 리스트들을 반영한다.
  useEffect(() => {
    if (pathname == "/list") {
      setGalleryIdSearch(galleryId);
      setTitleSearch(title);
      setSelectedTags(tagIds.map((tag_id) => tagMap.get(Number(tag_id))));
    }
  }, [title, galleryId, tagIds.toString()]);
  const tagFilter = () => {
    // 빈칸이면 아무것도 보여주지 않음.
    if (!tagSearch.trim()) {
      setFilteredTags([]);
      return;
    }
    // 태그 결과를 필터링한다.
    setFilteredTags(
      tagList
        .filter((v) => v.name.includes(tagSearch.trim()))
        .filter((t) => !selectedTags.map((v) => v.tag_id).includes(t.tag_id))
        .slice(0, 50),
    );
  };
  // 태그창에 입력하는 값이 달라지면 추천 태그들 리스트가 달라진다.
  useEffect(() => {
    tagFilter();
  }, [tagSearch]);
  // id로 검색
  const handleIdSearch = (e) => {
    e.preventDefault();
    navigate(`/list?galleryId=${galleryIdSearch}`);
    // setSearchParams({ galleryId: galleryIdSearch });
    onClose();
  };
  // 제목과 태그로 검색
  const handleTitleTagSearch = (e) => {
    e.preventDefault();
    // 1. 쿼리 파라미터 객체 생성
    const params = {
      title: titleSearch,
      tag: selectedTags.map((t) => t.tag_id),
    };
    // 2. /list 경로로 이동하면서 쿼리 스트링 적용
    navigate({
      pathname: "/list",
      search: `?${createSearchParams(params)}`,
    });
    onClose();
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30"></div>
      <div className="fixed inset-0">
        <DialogPanel className="mx-auto w-full max-w-3xl bg-gray-50 p-3 dark:bg-gray-950 dark:text-white">
          <form className="mb-1 flex" onSubmit={handleTitleTagSearch}>
            <div className="flex grow flex-col gap-1 pr-1">
              <input
                className="rounded-md border pl-1"
                placeholder="제목 검색"
                value={titleSearch}
                onChange={(e) => setTitleSearch(e.target.value)}
              ></input>
              <div className="flex flex-wrap gap-1">
                {/* 선택한 태그들 보여주기 */}
                {selectedTags.map((tag) => {
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
                  if (tag.name.startsWith("artist:")) type = "artist";
                  else if (tag.name.startsWith("group:")) type = "group";
                  else if (tag.name.startsWith("parody:")) type = "parody";
                  else if (tag.name.startsWith("character:"))
                    type = "character";
                  else if (tag.name.startsWith("male:")) type = "male";
                  else if (tag.name.startsWith("female:")) type = "female";
                  return (
                    <div
                      key={tag.tag_id}
                      className={`flex justify-between rounded-sm pl-1 ${colorMap[type]}`}
                    >
                      {tag.name}
                      <X
                        onClick={() => {
                          setSelectedTags(
                            selectedTags.filter((t) => t.tag_id != tag.tag_id),
                          );
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <button className="rounded-md bg-gray-400 px-1 dark:bg-gray-600">
              <Search />
            </button>
          </form>
          <div className="relative flex">
            <input
              className="w-full rounded-md border pl-1"
              placeholder="태그 찾기 - 최대 50개만 표시합니다"
              onFocus={() => setIsTagSearchFocused(true)}
              onBlur={() => setIsTagSearchFocused(false)}
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
            ></input>
            <X
              className={`absolute right-0 ${tagSearch ? "" : "hidden"}`}
              onMouseDown={() => setTagSearch("")}
            />
          </div>
          <div className="relative">
            {isTagSearchFocused && (
              <div className="absolute mt-2 h-44 w-full gap-1 overflow-y-auto rounded-xl border bg-gray-50 p-1 dark:bg-gray-950">
                {tagSearch == "" ? (
                  <SearchRecommendList setTagSearch={setTagSearch} />
                ) : (
                  filteredTags.map((tag) => (
                    <p
                      key={tag.tag_id}
                      className="cursor-pointer"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedTags([...selectedTags, tag]);
                        setTagSearch("");
                      }}
                    >
                      {tag.name}
                    </p>
                  ))
                )}
              </div>
            )}
          </div>

          <form
            onSubmit={handleIdSearch}
            className="mt-3 flex w-full border-t border-gray-500 pt-3"
          >
            <input
              className="grow rounded-l-md border-y border-l pl-1"
              placeholder="갤러리 아이디로 검색"
              name="g_id"
              type="number"
              value={galleryIdSearch}
              onChange={(e) => setGalleryIdSearch(e.target.value)}
            />
            <button className="rounded-r-md border bg-gray-400 px-2 dark:bg-gray-600">
              검색
            </button>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
