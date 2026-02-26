export default function SearchRecommendList({ setTagSearch }) {
  return (
    <div className="flex flex-col border p-1 gap-1 border-gray-500 rounded-xl">
      <p
        className="cursor-pointer"
        onMouseDown={(e) => {
          e.preventDefault();
          setTagSearch("artist:");
        }}
      >
        artist: (작가)
      </p>
      <p
        className="cursor-pointer"
        onMouseDown={(e) => {
          e.preventDefault();
          setTagSearch("group:");
        }}
      >
        group: (그룹)
      </p>
      <p
        className="cursor-pointer"
        onMouseDown={(e) => {
          e.preventDefault();
          setTagSearch("parody:");
        }}
      >
        parody: (시리즈)
      </p>
      <p
        className="cursor-pointer"
        onMouseDown={(e) => {
          e.preventDefault();
          setTagSearch("character:");
        }}
      >
        character: (캐릭터)
      </p>
      <p
        className="cursor-pointer"
        onMouseDown={(e) => {
          e.preventDefault();
          setTagSearch("male:");
        }}
      >
        male: (남성)
      </p>
      <p
        className="cursor-pointer"
        onMouseDown={(e) => {
          e.preventDefault();
          setTagSearch("female:");
        }}
      >
        female: (여성)
      </p>
    </div>
  );
}
