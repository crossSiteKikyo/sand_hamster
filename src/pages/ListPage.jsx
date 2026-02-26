import { useEffect, useState } from "react";
import { useGalleryStore } from "../store";
import { useSearchParams } from "react-router-dom";
import GalleryList from "./GalleryList";
import Pagination from "./Pagination";

export default function ListPage() {
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || "1";
  const search = searchParams.get("search");
  const [isLoading, setIsLoading] = useState(true);
  const { galleryList, getGalleryListAnonymous } = useGalleryStore();
  async function getGalleryList() {
    setIsLoading(true);
    await getGalleryListAnonymous(Number(page));
    setIsLoading(false);
  }
  useEffect(() => {
    getGalleryList();
  }, [page]);

  return (
    <div className="flex flex-col p-1 bg-white dark:bg-black grow">
      <div className="grow">
        <GalleryList galleryList={galleryList} isLoading={isLoading} />
      </div>
      <div className="flex justify-center pt-5">
        <Pagination page={page} />
      </div>
    </div>
  );
}
