import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MyButton from "../components/MyButton";

export default function Pagination({ page }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pageList, setPageList] = useState([]);
  const pageMove = (num) => {
    if (num <= 0) {
      num = 1;
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
  // 자신-2부터 5개가 모일때까지 페이지를 모은다.
  useEffect(() => {
    const _pageList = [];
    for (let i = Number(page) - 2; _pageList.length < 5; i++) {
      if (i > 0) _pageList.push(i);
    }
    setPageList(_pageList);
    console.log(pageList);
  }, [page]);

  return (
    <div className="flex grow gap-1 pb-3 max-w-2xl">
      <MyButton
        onClick={() => pageMove(Number(page) - 3)}
        className="px-2 grow"
      >
        &lt;
      </MyButton>
      {pageList.map((v, idx) =>
        v == Number(page) ? (
          <MyButton key={idx} className="px-2 font-black grow text-xl">
            {v}
          </MyButton>
        ) : (
          <MyButton
            key={idx}
            onClick={() => pageMove(v)}
            className="px-2 font-light grow text-xl"
          >
            {v}
          </MyButton>
        ),
      )}
      <MyButton
        onClick={() => pageMove(Number(page) + 3)}
        className="px-2 grow"
      >
        &gt;
      </MyButton>
    </div>
  );
}
