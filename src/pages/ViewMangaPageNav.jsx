import { useCallback, useEffect, useState } from "react";
import useHitomiStore from "../store/useHitomiStore";
import { Fullscreen, X } from "lucide-react";
import { toast } from "react-toastify";

export default function ViewMangaPageNav({
  swiper,
  page,
  stopAutoSlide,
  setIsOpen,
  intervalID,
  isHorizontal,
  setIsHorizontal,
  isTwoView,
  setIsTwoView,
}) {
  const { imgHashList, title } = useHitomiStore();

  const [showUI, setShowUI] = useState(false); // 상하 UI 노출 여부
  const toggleUI = () => setShowUI(!showUI);

  // 페이지 이동 함수 (인자 0을 줘서 즉시이동)
  // 두쪽보기라면
  const goPrev = () => {
    if (isTwoView) {
      swiper?.slidePrev(0);
    }
    swiper?.slidePrev(0);
  };
  const goNext = () => {
    const currentIndex = swiper.activeIndex;
    if (isTwoView) {
      if (currentIndex >= imgHashList.length - 2)
        toast("마지막 페이지입니다", { autoClose: 500 });
      else swiper?.slideTo(currentIndex + 2);
    } else {
      // console.log(currentIndex, imgHashList.length);
      if (currentIndex == imgHashList.length - 1)
        toast("마지막 페이지입니다", { autoClose: 500 });
      else swiper?.slideNext(0);
    }
  };

  // 전체화면 토글
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  // 키보드 핸들러 함수. 키보드로 페이지를 움직일 수 있다.
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowUp":
      case "a":
      case "A":
      case "w":
      case "W":
        goPrev();
        break;
      case "ArrowRight":
      case "ArrowDown":
      case "d":
      case "D":
      case "s":
      case "S":
        goNext();
        break;
    }
  });
  // 이벤트 리스너 등록 및 해제
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <>
      {/* [Layer 1] 투명 클릭 영역 (3등분) */}
      {isHorizontal ? (
        <div className="absolute inset-0 z-10 flex select-none">
          <div className="h-full w-1/3 cursor-pointer" onClick={goPrev} />
          <div className="h-full w-1/3 cursor-pointer" onClick={toggleUI} />
          <div className="h-full w-1/3 cursor-pointer" onClick={goNext} />
        </div>
      ) : (
        <div className="absolute inset-0 z-10 select-none">
          <div className="h-1/3 w-full cursor-pointer" onClick={goPrev} />
          <div className="h-1/3 w-full cursor-pointer" onClick={toggleUI} />
          <div className="h-1/3 w-full cursor-pointer" onClick={goNext} />
        </div>
      )}
      {/* <div
        className="absolute bottom-0 left-0 z-10 h-1/6 w-full select-none"
        onClick={toggleUI}
      ></div> */}

      {/* [Layer 2] 상하 내비게이션 UI (HUD) */}
      {showUI && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {/* 상단바 */}
          <div className="pointer-events-auto absolute top-0 left-0 flex w-full items-center justify-between gap-1 border-b border-gray-500 bg-white/80 dark:bg-black/80">
            <div className="flex items-center">
              <div className="p-3" onClick={toggleFullscreen}>
                <Fullscreen className="w-6 shrink-0" />
              </div>
              <p className="">{title}</p>
            </div>
            <div className="p-3" onClick={toggleUI}>
              <X className="w-6 shrink-0" />
            </div>
          </div>
          {/* 하단바 */}
          <div className="pointer-events-auto absolute bottom-0 left-0 w-full border-t border-gray-500 bg-white/80 p-3 dark:bg-black/80">
            <div className="flex flex-col gap-2">
              {/* 페이지 이동 슬라이더 */}
              <input
                type="range"
                min="0"
                max={imgHashList.length - 1}
                value={page}
                onChange={(e) => swiper?.slideTo(parseInt(e.target.value))}
                className="appearance-none rounded-lg border border-gray-500"
              />
              {/* 페이지 번호 */}
              <div className="flex justify-center text-sm">
                {page + 1} / {imgHashList.length}
              </div>
              {/* 하단 버튼들 */}
              <div className="flex justify-center gap-2">
                <button
                  className="rounded-xl bg-black px-2 text-white dark:bg-white dark:text-black"
                  onClick={() => setIsHorizontal(!isHorizontal)}
                >
                  {isHorizontal ? "좌우 넘기기" : "상하 넘기기"}
                </button>
                {intervalID ? (
                  <button
                    className="rounded-xl bg-black px-2 text-white dark:bg-white dark:text-black"
                    onClick={stopAutoSlide}
                  >
                    넘기기 중지
                  </button>
                ) : (
                  <button
                    className="rounded-xl bg-black px-2 text-white dark:bg-white dark:text-black"
                    onClick={() => setIsOpen(true)}
                  >
                    자동 넘기기
                  </button>
                )}
                {isTwoView ? (
                  <button
                    className="rounded-xl bg-black px-2 text-white dark:bg-white dark:text-black"
                    onClick={() => setIsTwoView(false)}
                  >
                    두쪽 보기
                  </button>
                ) : (
                  <button
                    className="rounded-xl bg-black px-2 text-white dark:bg-white dark:text-black"
                    onClick={() => setIsTwoView(true)}
                  >
                    한쪽 보기
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
