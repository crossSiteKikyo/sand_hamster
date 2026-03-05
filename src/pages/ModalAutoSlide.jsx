import { Dialog, DialogPanel, Switch } from "@headlessui/react";
import { useState } from "react";
import useHitomiStore from "../store/useHitomiStore";

export default function ModalAutoSlide({
  setIntervalID,
  isOpen,
  onClose,
  swiper,
}) {
  const [second, setSecond] = useState(10);
  const [loop, setLoop] = useState(false);
  const { imgHashList } = useHitomiStore();
  const startInterval = () => {
    const intervalID = setInterval(() => {
      // page 대신 swiper.activeIndex를 직접 사용 (실시간 값)
      const currentIndex = swiper.activeIndex;
      const lastIndex = imgHashList.length - 1;
      // 최대 페이지일 때
      if (currentIndex >= lastIndex) {
        if (loop)
          swiper?.slideTo(0); // loop라면 다시 0부터 반복.
        else {
          // loop가 아니라면, 최대 페이지 이후에 종료.
          clearInterval(intervalID);
          setIntervalID(undefined);
        }
      } else swiper?.slideNext(0); // 다음 페이지로 이동
    }, second * 1000);
    setIntervalID(intervalID);
    onClose();
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30"></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={"flex flex-col rounded border border-gray-500 bg-gray-100"}
        >
          <div className="border-b border-gray-500 p-3 text-center text-lg">
            자동 넘기기
          </div>
          <div className="flex gap-1 p-3">
            주기
            <input
              type="number"
              min="1"
              className="w-16 rounded-lg border pl-1"
              value={second}
              onChange={(e) => setSecond(e.currentTarget.value)}
            />
            초
          </div>
          <div className="flex gap-1 border-b border-gray-500 p-3">
            반복
            <Switch
              checked={loop}
              onChange={setLoop}
              className="group flex h-6 w-11 cursor-pointer rounded-full bg-gray-300 p-1 transition-colors duration-200 ease-in-out focus:outline-none data-checked:bg-blue-500"
            >
              <span
                aria-hidden="true"
                className="inline-block size-4 translate-x-0 rounded-full bg-black shadow-lg transition duration-200 ease-in-out group-data-checked:translate-x-5"
              />
            </Switch>
          </div>
          <div className="flex gap-3 p-3">
            <button
              className="rounded-sm bg-gray-300 px-12 py-1"
              onClick={startInterval}
            >
              시작
            </button>
            <button
              className="rounded-sm bg-gray-300 px-2 py-1"
              onClick={onClose}
            >
              취소
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
