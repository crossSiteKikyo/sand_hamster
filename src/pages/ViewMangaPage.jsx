import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useHitomiStore from "../store/useHitomiStore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Virtual } from "swiper/modules";
import "swiper/css";
import { Fullscreen } from "lucide-react";
import ModalAutoSlide from "./ModalAutoSlide";
import galleryApi from "../api/galleryApi";

export default function ViewMangaPage() {
  const [isHorizontal, setIsHorizontal] = useState(true); // 좌우로 페이지를 넘길지 상하로 넘길지.
  const [swiper, setSwiper] = useState(null);
  const [page, setPage] = useState(0);
  const [showUI, setShowUI] = useState(false); // 상하 UI 노출 여부

  // 페이지 이동 함수 (인자 0을 줘서 즉시이동)
  const goPrev = () => swiper?.slidePrev(0);
  const goNext = () => swiper?.slideNext(0);
  const toggleUI = () => setShowUI(!showUI);

  // 자동넘기기를 위한 변수들
  const [isOpen, setIsOpen] = useState(false);
  const [intervalID, setIntervalID] = useState(undefined); // 자동넘기기할 때 사용하는 interval 아이디
  const stopAutoSlide = () => {
    clearInterval(intervalID);
    setIntervalID(undefined);
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

  const {
    b,
    o1,
    o2,
    numSet,
    imgHashList,
    title,
    getGalleryInfo,
    getImageDecodeInfo,
  } = useHitomiStore();
  const [searchParams] = useSearchParams();
  const g_id = searchParams.get("g_id");
  const [isLoading, setIsLoading] = useState(false);
  const getImgHashList = async () => {
    setIsLoading(true);
    getImageDecodeInfo();
    await getGalleryInfo(g_id);
    setIsLoading(false);
  };
  useEffect(() => {
    // 처음 한번 갤러리 이미지들 정보를 알아낸다.
    if (Number.isInteger(Number(g_id))) {
      getImgHashList();
      incrementGalleryViewCount(g_id);
    }
  }, [g_id]);
  const incrementGalleryViewCount = async (g_id) => {
    // 1. 세션 스토리지에서 이미 본 목록 가져오기
    const viewed = JSON.parse(
      sessionStorage.getItem("viewed_galleries") || "[]",
    );
    // 2. 이미 목록에 있다면 서버 호출 없이 종료
    if (viewed.includes(g_id)) return;
    // 3. 서버에 조회수 증가 요청
    const { error } = await galleryApi.incrementGalleryViewCount(g_id);
    if (!error) {
      // 4. 성공 시 세션 스토리지에 추가
      viewed.push(g_id);
      sessionStorage.setItem("viewed_galleries", JSON.stringify(viewed));
    }
  };
  const hashToImageUrl = (hash) => {
    const num = parseInt(
      `${hash[hash.length - 1]}${hash[hash.length - 3]}${hash[hash.length - 2]}`,
      16,
    );
    const subDomainNum = numSet.has(num) ? Number(o2) + 1 : Number(o1) + 1;
    return `https://w${subDomainNum}.gold-usergeneratedcontent.net/${b}${num}/${hash}.webp`;
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <ModalAutoSlide
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        setIntervalID={setIntervalID}
        swiper={swiper}
      />
      <Swiper
        modules={[Virtual]}
        onSwiper={setSwiper}
        speed={0} // 모든 전환 애니메이션 속도를 0으로 설정 (즉시 전환)
        onSlideChange={(s) => setPage(s.activeIndex)}
        virtual={{ addSlidesBefore: 5, addSlidesAfter: 10 }} //앞뒤 미리 로드
        className="h-full w-full"
      >
        {imgHashList.map((hash, idx) => (
          <SwiperSlide key={idx} virtualIndex={idx}>
            <img
              src={hashToImageUrl(hash)}
              className="h-full w-full object-contain"
              alt={`page-${idx}`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {/* [Layer 1] 투명 클릭 영역 (3등분) */}
      {isHorizontal ? (
        <div className="absolute inset-0 z-10 flex">
          <div className="h-full w-1/3 cursor-pointer" onClick={goPrev} />
          <div className="h-full w-1/3 cursor-pointer" onClick={toggleUI} />
          <div className="h-full w-1/3 cursor-pointer" onClick={goNext} />
        </div>
      ) : (
        <div className="absolute inset-0 z-10">
          <div className="h-1/3 w-full cursor-pointer" onClick={goPrev} />
          <div className="h-1/3 w-full cursor-pointer" onClick={toggleUI} />
          <div className="h-1/3 w-full cursor-pointer" onClick={goNext} />
        </div>
      )}

      {/* [Layer 2] 상하 내비게이션 UI (HUD) */}
      {showUI && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {/* 상단바 */}
          <div className="pointer-events-auto absolute top-0 left-0 flex w-full items-center gap-1 border-b border-gray-500 bg-white/80 dark:bg-black/80">
            <div className="p-3" onClick={toggleFullscreen}>
              <Fullscreen className="w-6 shrink-0" />
            </div>
            <p className="">{title}</p>
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
              <div className="flex justify-center text-sm">
                {page + 1} / {imgHashList.length}
              </div>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
