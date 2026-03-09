export default function getDataFromFile() {
  return new Promise(function (resolve, reject) {
    // 1. 숨겨진 input 엘리먼트 생성
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json"; // JSON 파일만 선택 가능하도록 제한

    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      // 2. 파일 읽기 시작
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonContent = e.target.result;
          const parsedData = JSON.parse(jsonContent);
          console.log(`데이터 파싱 성공:`, parsedData);
          resolve(parsedData);
        } catch (error) {
          reject("JSON 파싱 에러:", error);
        }
      };
      reader.readAsText(file); // 텍스트 형식으로 읽기
    };
    // 4. 클릭 이벤트 트리거 (파일 탐색기 열림)
    input.click();
  });
}
