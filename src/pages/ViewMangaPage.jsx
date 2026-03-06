import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useHitomiStore from "../store/useHitomiStore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Virtual } from "swiper/modules";
import "swiper/css";
import ModalAutoSlide from "./ModalAutoSlide";
import galleryApi from "../api/galleryApi";
import ViewMangaPageNav from "./ViewMangaPageNav";
import { CircleX } from "lucide-react";

export default function ViewMangaPage() {
  const [swiper, setSwiper] = useState(null);
  const [page, setPage] = useState(0);

  // 자동넘기기를 위한 변수들
  const [isOpen, setIsOpen] = useState(false);
  const [intervalID, setIntervalID] = useState(undefined); // 자동넘기기할 때 사용하는 interval 아이디
  const stopAutoSlide = () => {
    clearInterval(intervalID);
    setIntervalID(undefined);
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
    getGalleryInfo,
    getImageDecodeInfo,
    isAvifSupported,
  } = useHitomiStore();
  const [searchParams] = useSearchParams();
  const g_id = searchParams.get("g_id");
  const getImgHashList = async () => {
    await getImageDecodeInfo();
    await getGalleryInfo(g_id);
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
  const hashToImageUrl = (info) => {
    // info는 {hash, hasavif}로 되어있다.
    const hash = info.hash;
    const num = parseInt(
      `${hash[hash.length - 1]}${hash[hash.length - 3]}${hash[hash.length - 2]}`,
      16,
    );
    const subDomainNum = numSet.has(num) ? Number(o2) + 1 : Number(o1) + 1;
    const avifUrl = `https://a${subDomainNum}.gold-usergeneratedcontent.net/${b}${num}/${hash}.avif`;
    const webpUrl = `https://w${subDomainNum}.gold-usergeneratedcontent.net/${b}${num}/${hash}.webp`;
    // avif이미지가 존재하고, 브라우저가 avif포맷을 지원하면 avifurl을 준다.
    if (info.hasavif && isAvifSupported) return avifUrl;
    else return webpUrl;
  };
  const RetryImage = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 12345; // 최대 재시도 횟수
    const [isFail, setIsFail] = useState(false);

    // src 프롭이 변경되면 상태 초기화
    useEffect(() => {
      setImgSrc(src);
      setRetryCount(0);
    }, [src]);

    const handleError = async () => {
      if (retryCount < MAX_RETRIES) {
        // 1. 실제로 503 에러인지 fetch로 확인 (HEAD 요청으로 가볍게 체크)
        try {
          const response = await fetch(src, {
            method: "HEAD",
            cache: "no-cache",
          });
          if (response.status === 503) {
            console.warn(
              `[${response.status}] 에러 발생. ${retryCount + 1}회차 재시도 중...`,
            );
            // 2. 약간의 지연 시간을 두고 재시도
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
              // URL 뒤에 타임스탬프를 붙여 브라우저 캐시를 무시하고 새로 요청
              setImgSrc(`${src}?t=${Date.now()}`);
            }, 100);
          }
        } catch (err) {
          setIsFail(true);
          console.error("이미지 상태 확인 실패:", err);
        }
      } else setIsFail(true);
    };
    return (
      <>
        {isFail ? (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <CircleX className="h-16 w-16" />
            이미지 로딩 실패
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={handleError}
            crossOrigin="anonymous" // 👈 이 속성이 HTTP/2 협상을 유도할 수 있습니다.
          />
        )}
      </>
    );
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
            <RetryImage
              src={hashToImageUrl(hash)}
              className="h-full w-full object-contain"
              alt={`page-${idx}`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <ViewMangaPageNav
        swiper={swiper}
        page={page}
        setIsOpen={setIsOpen}
        stopAutoSlide={stopAutoSlide}
        intervalID={intervalID}
      />
    </div>
  );
}
