export default function SearchRecommendList({ setTagSearch }) {
  return (
    <>
      <div
        className="cursor-pointer flex items-center"
        onMouseDown={(e) => {
          e.preventDefault();
          setTagSearch("artist:");
        }}
      >
        artist: <p className="text-gray-500 pl-1 text-sm">작가</p>
      </div>
      <div
        className="cursor-pointer flex items-center"
        onMouseDown={(e) => {
          e.preventDefault();
          setTagSearch("group:");
        }}
      >
        group: <p className="text-gray-500 pl-1 text-sm">그룹</p>
      </div>
      <div
        className="cursor-pointer flex items-center"
        onMouseDown={(e) => {
          e.preventDefault();
          setTagSearch("parody:");
        }}
      >
        parody: <p className="text-gray-500 pl-1 text-sm">시리즈</p>
      </div>
      <div
        className="cursor-pointer flex items-center"
        onMouseDown={(e) => {
          e.preventDefault();
          setTagSearch("character:");
        }}
      >
        character: <p className="text-gray-500 pl-1 text-sm">캐릭터</p>
      </div>
      <div
        className="cursor-pointer flex items-center"
        onMouseDown={(e) => {
          e.preventDefault();
          setTagSearch("male:");
        }}
      >
        male: <p className="text-gray-500 pl-1 text-sm">남성</p>
      </div>
      <div
        className="cursor-pointer flex items-center"
        onMouseDown={(e) => {
          e.preventDefault();
          setTagSearch("female:");
        }}
      >
        female: <p className="text-gray-500 pl-1 text-sm">여성</p>
      </div>
    </>
  );
}
