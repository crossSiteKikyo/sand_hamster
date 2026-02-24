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
    <div className="flex flex-col gap-1 fixed bottom-12 right-4 md:bottom-1">
      <button
        className="rounded-full border border-gray-500 bg-gray-400 dark:bg-gray-600 p-3 shadow"
        onClick={scrollToTop}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
      <button
        className="rounded-full border border-gray-500 bg-gray-400 dark:bg-gray-600 p-3 shadow"
        onClick={scrollToBottom}
      >
        <ArrowDown className="w-5 h-5" />
      </button>
    </div>
  );
}
