import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const infos = [
    {
      title: "갤러리 북마크(좋아요)는 어떻게 하나요?",
      content: `갤러리 g_id를 클릭하면 갤러리 상태 변경 창이 뜹니다. 
      상태에서 좋아요를 클릭하시면 됩니다.
      '내 갤러리' 페이지에서 목록을 볼 수 있습니다.
      회원만 할 수 있습니다.`,
    },
    {
      title: "갤러리 차단(싫어요)는 어떻게 하나요?",
      content: `갤러리 g_id를 클릭하면 갤러리 상태 변경 창이 뜹니다.
      상태에서 싫어요를 클릭하시면 됩니다.
      차단한 갤러리들은 '갤러리 차단' 페이지에서 목록을 볼 수 있습니다.
      차단한 갤러리들은 브라우저에 저장되므로, 브라우저마다 설정해줘야 합니다.`,
    },
    {
      title: "태그 구독은 어떻게 하나요?",
      content: `태그를 꾹 클릭하면 태그 상태 변경 창이 뜹니다.
      상태에서 좋아요를 클릭하시면 됩니다.
      '내 좋아요' 페이지를 가면 좋아요 태그가 하나라도 있는 갤러리들만 볼 수 있습니다.
      '내 태그' 페이지에서는 어떤 태그를 구독했는지 볼 수 있습니다
      회원만 할 수 있습니다.`,
    },
    {
      title: "특정 태그를 차단하고 싶어요",
      content: `태그를 꾹 클릭하면 태그 상태 변경 창이 뜹니다.
      상태에서 싫어요를 클릭하시면 됩니다.
      차단한 태그들은 리스트에 나오지 않습니다.
      잘못 차단한 태그는 '내 태그'페이지에서 다시 상태 변경이 가능합니다.
      회원만 할 수 있습니다.`,
    },
    {
      title: "좋아요 or 싫어요는 몇개까지 할 수 있나요?",
      content: `내 정보 페이지에 개수 제한을 볼 수 있습니다. 
      갤러리 싫어요(차단)은 개수 제한이 없습니다.`,
    },
    // { title: "", content: `` },
  ];
  const infoClick = (idx) => {
    if (idx == selectedIdx) {
      setIsOpen(!isOpen);
    } else {
      setIsOpen(true);
      setSelectedIdx(idx);
    }
  };
  return (
    <div className="grow bg-white px-3 pt-10 dark:bg-black">
      <p className="mb-4 w-full text-center text-xl font-bold">도움말</p>
      <div className="flex flex-col divide-y divide-gray-500 rounded-lg border border-gray-500">
        {infos.map((v, i) => (
          <div key={i}>
            <div
              className="flex cursor-pointer justify-between p-2 font-semibold"
              onClick={() => infoClick(i)}
            >
              {v.title}
              {selectedIdx == i && isOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
            {selectedIdx == i && isOpen && (
              <div className="border-t border-gray-500 p-2 whitespace-pre-line">
                {v.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
