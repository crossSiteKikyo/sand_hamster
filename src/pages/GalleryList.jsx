export default function GalleryList({ galleryList, isLoading }) {
  if (isLoading) {
    return <div className="text-center">데이터를 불러오는 중입니다...</div>;
  }
  return (
    <>
      {galleryList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {galleryList.map((g) => {
            const type = [
              "doujinshi",
              "manga",
              "artistcg",
              "gamecg",
              "imageset",
            ][g.type_id - 1];
            return (
              <div key={g.g_id} className="border rounded-sm">
                <p className="text-base">{g.title}</p>
                <p className="text-base">{"종류: " + type}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-lg flex justify-center">결과가 없습니다</p>
      )}
    </>
  );
}
