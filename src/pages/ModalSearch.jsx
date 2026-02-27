import { Dialog, DialogPanel } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useTagStore, useTypeStore } from "../store";
import { X } from "lucide-react";
import SearchRecommendList from "./SearchRecommendList";
import { useSearchParams } from "react-router-dom";

export default function ModalSearch({ isOpen, onClose }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tagSearch, setTagSearch] = useState("");
  const [titleSearch, setTitleSearch] = useState("");
  const [galleryIdSearch, setGalleryIdSearch] = useState("");
  const [isTagSearchFocused, setIsTagSearchFocused] = useState(false);
  const [filteredTags, setFilteredTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const { tagList } = useTagStore();
  const tagFilter = () => {
    if (!tagSearch.trim()) {
      setFilteredTags([]);
      return;
    }
    // 태그 결과를 필터링한다.
    setFilteredTags(
      tagList
        .filter((v) => v.name.includes(tagSearch))
        .filter((t) => !selectedTags.map((v) => v.tag_id).includes(t.tag_id))
        .slice(0, 50),
    );
  };
  useEffect(() => {
    tagFilter();
  }, [tagSearch]);
  const handleIdSearch = (e) => {
    e.preventDefault();
    setSearchParams({ galleryId: galleryIdSearch });
    onClose();
  };
  const handleTitleTagSearch = (e) => {
    e.preventDefault();
    // setSearchParams로 selectedTags, titleSearch를 url에 반영한다.
    setSearchParams({
      title: titleSearch,
      tag: selectedTags.map((t) => t.tag_id),
    });
    onClose();
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30"></div>
      <div className="fixed inset-0">
        <DialogPanel className="shadow-xl dark:text-white bg-gray-50 dark:bg-gray-950 flex flex-col items-center p-3">
          <form
            onSubmit={handleTitleTagSearch}
            className="mb-3 flex flex-col w-full gap-1"
          >
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
              else if (tag.name.startsWith("character:")) type = "character";
              else if (tag.name.startsWith("male:")) type = "male";
              else if (tag.name.startsWith("female:")) type = "female";
              return (
                <div
                  key={tag.tag_id}
                  className={`flex ${colorMap[type]} pl-1 rounded-sm justify-between`}
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
            {filteredTags.length === 50 && (
              <p>검색 결과가 너무 많아 50개만 표시합니다.</p>
            )}
            <div className="flex relative">
              <input
                className="border rounded-md pl-1 grow"
                placeholder="태그 찾기"
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
            <div className="flex flex-col border p-1 gap-1 border-gray-500 rounded-xl h-44 overflow-y-auto">
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
            <input
              className="border rounded-md pl-1"
              placeholder="제목 검색"
              value={titleSearch}
              onChange={(e) => setTitleSearch(e.target.value)}
            ></input>
            <div className="flex justify-end">
              <button className="border rounded-md bg-gray-400 dark:bg-gray-600">
                제목과 태그로 검색
              </button>
            </div>
          </form>
          <form
            onSubmit={handleIdSearch}
            className="border-t border-gray-500 w-full pt-3 flex"
          >
            <input
              className="border-y border-l rounded-l-md pl-1 grow"
              placeholder="갤러리 아이디로 검색"
              name="g_id"
              type="number"
              value={galleryIdSearch}
              onChange={(e) => setGalleryIdSearch(e.target.value)}
            />
            <button className="border rounded-r-md bg-gray-400 dark:bg-gray-600 px-2">
              검색
            </button>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
