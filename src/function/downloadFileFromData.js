export default function downloadFileFromData(data, fileName) {
  // 1. JSON 데이터를 문자열로 변환 (들여쓰기 2칸 추가로 가독성 확보)
  const jsonString = JSON.stringify(data, null, 2);
  // 2. Blob 객체 생성 (타입은 application/json)
  const blob = new Blob([jsonString], { type: "application/json" });
  // 3. 브라우저 메모리에 임시 URL 생성
  const url = URL.createObjectURL(blob);
  // 4. 가상의 <a> 태그 생성 및 설정
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName; // 파일명 설정
  // 5. 클릭 이벤트 발생시켜 다운로드 트리거
  document.body.appendChild(link);
  link.click();
  // 6. 사용이 끝난 임시 URL 및 태그 제거 (메모리 관리)
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
