import { useNavigate, useSearchParams } from "react-router-dom";
import MyButton from "../components/MyButton";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useGalleryStore from "../store/useGalleryStore";

export default function PaginationCursor({ direction, cursorId }) {
  const { firstGid, lastGid, has_more } = useGalleryStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // const [] = useState()
  const pageMove = (direction, cursorId) => {
    // 현재 url에서 path를 추출한다.
    const pathname = window.location.pathname;
    // 기존 searchParams 복사하여 새로운 객체 생성
    const newParams = new URLSearchParams(searchParams);
    if (direction == null) newParams.delete("direction");
    else newParams.set("direction", direction);
    if (cursorId == null) newParams.delete("cursorId");
    else newParams.set("cursorId", cursorId);
    newParams.delete("galleryId");
    // searchParams의 direction, cursorId 빼고 모든 params는 보존한다. direction, cursorId 만 값을 바꾼다.
    navigate(`${pathname}?${newParams.toString()}`);
  };
  const prevFormHandle = (e, direction) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    pageMove(direction, data.num);
    // 해당 form 초기화 (input 비우기)
    e.target.reset();
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full max-w-2xl gap-1 pb-3">
        {direction == null && cursorId == null ? (
          <MyButton className="flex grow items-center justify-center opacity-50">
            <ChevronFirst />
          </MyButton>
        ) : (
          <MyButton
            className="flex grow cursor-pointer items-center justify-center"
            onClick={() => pageMove(null, null)}
          >
            <ChevronFirst />
          </MyButton>
        )}
        {(direction == "prev" && !has_more) || cursorId == null ? (
          <>
            <MyButton className="flex grow items-center justify-center opacity-50">
              <ChevronLeft />
            </MyButton>
          </>
        ) : (
          <>
            <MyButton
              className="flex grow cursor-pointer items-center justify-center"
              onClick={() => pageMove("prev", firstGid)}
            >
              <ChevronLeft />
            </MyButton>
          </>
        )}
        <MyButton className="grow text-xl font-light opacity-50">
          {cursorId == null
            ? "첫페이지"
            : `${cursorId}
          ${direction == "next" ? " 이후" : " 이전"}`}
        </MyButton>
        {(direction == "next" && !has_more) || cursorId == 1 ? (
          <>
            <MyButton className="flex grow items-center justify-center opacity-50">
              <ChevronRight />
            </MyButton>
            <MyButton className="flex grow items-center justify-center opacity-50">
              <ChevronLast />
            </MyButton>
          </>
        ) : (
          <>
            <MyButton
              className="flex grow cursor-pointer items-center justify-center"
              onClick={() => pageMove("next", lastGid)}
            >
              <ChevronRight />
            </MyButton>
            <MyButton
              className="flex grow cursor-pointer items-center justify-center"
              onClick={() => pageMove("prev", 1)}
            >
              <ChevronLast />
            </MyButton>
          </>
        )}
      </div>
      <div className="flex gap-5 py-3">
        <form onSubmit={(e) => prevFormHandle(e, "prev")}>
          <input
            className="max-w-24 rounded-l-lg border pl-1 text-lg"
            type="number"
            placeholder={firstGid}
            name="num"
            min="1"
            required
          />
          <button className="rounded-r-lg border-y border-r bg-gray-400 px-1 text-lg dark:bg-gray-600">
            이전검색
          </button>
        </form>
        <form onSubmit={(e) => prevFormHandle(e, "next")}>
          <input
            className="max-w-24 rounded-l-lg border pl-1 text-lg"
            type="number"
            placeholder={lastGid}
            name="num"
            min="1"
            required
          />
          <button className="rounded-r-lg border-y border-r bg-gray-400 px-1 text-lg dark:bg-gray-600">
            이후검색
          </button>
        </form>
      </div>
    </div>
  );
}
