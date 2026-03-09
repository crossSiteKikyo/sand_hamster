import { ArrowDown, ArrowUp } from "lucide-react";

export default function FloatingActionButton() {
  const scrollToTop = () => {
    const element = document.getElementById("content-scroll");
    if (element) {
      element.scrollTo({
        top: 0,
        // behavior: "smooth"
      }); // 부드러운 스크롤 추가
    }
  };
  const scrollToBottom = () => {
    const element = document.getElementById("content-scroll");
    if (element) {
      element.scrollTo({
        top: element.scrollHeight,
        // behavior: "smooth",
      });
    }
  };
  return (
    <div className="fixed right-4 bottom-12 z-10 flex flex-col gap-1 md:bottom-1">
      <button
        className="rounded-full border border-gray-500 bg-gray-400 p-3 shadow dark:bg-gray-600"
        onClick={scrollToTop}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
      <button
        className="rounded-full border border-gray-500 bg-gray-400 p-3 shadow dark:bg-gray-600"
        onClick={scrollToBottom}
      >
        <ArrowDown className="h-5 w-5" />
      </button>
    </div>
  );
}
