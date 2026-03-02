import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MyButton from "../components/MyButton";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, maxPage = 1 }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pageList, setPageList] = useState([]);
  const [pageInput, setPageInput] = useState("");
  const changePageInput = (e) => {
    let num = e.currentTarget.value;
    if (num === "") setPageInput("");
    else if (num < 1) setPageInput(1);
    else if (num > maxPage) setPageInput(maxPage);
    else setPageInput(num);
  };
  const pageMove = (num) => {
    if (num <= 0) {
      num = 1;
    } else if (num > maxPage) {
      num = maxPage;
    }
    // 현재 url에서 path를 추출한다.
    const pathname = window.location.pathname;
    // 기존 searchParams 복사하여 새로운 객체 생성
    const newParams = new URLSearchParams(searchParams);
    // page 파라미터만 새로운 값으로 업데이트
    newParams.set("page", num);
    // searchParams의 page빼고 모든 params는 보존한다. page만 값을 바꾼다.
    navigate(`${pathname}?${newParams.toString()}`);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (pageInput != "") {
      pageMove(Number(pageInput));
      setPageInput("");
    }
  };
  // 자신-2부터 5개가 모일때까지 페이지를 모은다.
  useEffect(() => {
    const _pageList = [];
    for (let i = Number(page) - 2; _pageList.length < 5; i++) {
      if (i > 0) _pageList.push(i);
      if (i == maxPage) break;
    }
    setPageList(_pageList);
  }, [page, maxPage]);

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full max-w-2xl gap-1 pb-3">
        {page == 1 ? (
          <MyButton className="flex grow items-center justify-center px-2 opacity-50">
            <ChevronLeft />
          </MyButton>
        ) : (
          <MyButton
            onClick={() => pageMove(Number(page) - 3)}
            className="flex grow cursor-pointer items-center justify-center px-2"
          >
            <ChevronLeft />
          </MyButton>
        )}
        {pageList.map((v, idx) =>
          v == Number(page) ? (
            <MyButton
              key={idx}
              className="grow px-2 text-xl font-light opacity-50"
            >
              {v}
            </MyButton>
          ) : (
            <MyButton
              key={idx}
              onClick={() => pageMove(v)}
              className="grow cursor-pointer px-2 text-xl font-light"
            >
              {v}
            </MyButton>
          ),
        )}
        {page == maxPage ? (
          <MyButton className="flex grow items-center justify-center px-2 opacity-50">
            <ChevronRight />
          </MyButton>
        ) : (
          <MyButton
            onClick={() => pageMove(Number(page) + 3)}
            className="flex grow cursor-pointer items-center justify-center px-2"
          >
            <ChevronRight />
          </MyButton>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          className="w-32 rounded-l-lg border-y border-l p-2"
          type="Number"
          name="page"
          placeholder={maxPage}
          min={1}
          max={maxPage}
          value={pageInput}
          onChange={changePageInput}
        ></input>
        <button className="cursor-pointer rounded-r-lg border bg-gray-400 p-2 dark:bg-gray-600">
          페이지 이동
        </button>
      </form>
    </div>
  );
}
