import { useEffect, useState } from "react";
import "./App.css";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navigation from "./pages/Navigation";
import FloatingActionButton from "./pages/FloatingActionButton";
import NotificationPage from "./pages/NotificationPage";
import FirstPage from "./pages/FirstPage";
import Login from "./pages/Login";
import Myinfo from "./pages/Myinfo";
import ListPage from "./pages/ListPage";
import Footer from "./pages/Footer";
import { ToastContainer } from "react-toastify";
import SignUp from "./pages/SignUp";
import MyGallery from "./pages/MyGallery";
import MyTag from "./pages/MyTag";
import MyGalleryHasLikeTag from "./pages/MyGalleryHasLikeTag";
import RankPage from "./pages/RankPage";
import { galleryCache } from "./cacheDB";
import useThemeStore from "./store/useThemeStore";
import useUserStore from "./store/useUserStore";
import useTypeStore from "./store/useTypeStore";
import useTagStore from "./store/useTagStore";
import useTagLikeStore from "./store/useTagLikeStore";
import useGalleryLikeStore from "./store/useGalleryLikeStore";
import useNotificationStore from "./store/useNotificationStore";
import ViewMangaPage from "./pages/ViewMangaPage";

function App() {
  const { isDarkMode } = useThemeStore();
  const { getUser } = useUserStore();
  const { getTypeList } = useTypeStore();
  const { getAllTag } = useTagStore();
  const { getTagLikeList } = useTagLikeStore();
  const { getGalleryLikeList } = useGalleryLikeStore();
  const { getNotificationList } = useNotificationStore();
  const { pathname } = useLocation(); // 현재 경로를 가져옵니다.
  const isHomePage = pathname === "/";
  const isViewMangaPage = pathname === "/viewManga";
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState("유저정보 받아오는중...");

  const init = async () => {
    setIsInitializing(true);
    setLoadingInfo("유저정보 받아오는중...");
    await getUser();
    setLoadingInfo("타입 정보 받아오는중...");
    await getTypeList();
    setLoadingInfo("태그 정보 받아오는중...");
    await getAllTag();
    setLoadingInfo("공지사항 정보 받아오는중...");
    await getNotificationList();
    setLoadingInfo("태그 좋아요/싫어요 정보 받아오는중...");
    await getTagLikeList();
    setLoadingInfo("갤러리 좋아요/싫어요 정보 받아오는중...");
    await getGalleryLikeList();
    setLoadingInfo("오래된 캐시 정리중...");
    await galleryCache.cleanOldCache();
    setIsInitializing(false);
  };
  const afterLogin = async () => {
    setIsInitializing(true);
    setLoadingInfo("유저정보 받아오는중...");
    await getUser();
    setLoadingInfo("태그 좋아요/싫어요 정보 받아오는중...");
    await getTagLikeList();
    setLoadingInfo("갤러리 좋아요/싫어요 정보 받아오는중...");
    await getGalleryLikeList();
    setIsInitializing(false);
  };
  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-gray-50">
      <div className="mx-auto flex max-w-400 grow">
        <ToastContainer position="bottom-center" />
        {isInitializing ? (
          <div className="w-full text-center">
            <p>초기화중...</p>
            <p>{loadingInfo}</p>
          </div>
        ) : (
          <>
            {!(isHomePage || isViewMangaPage) && (
              <>
                <Navigation />
                <FloatingActionButton />
              </>
            )}
            <div
              className="flex grow flex-col overflow-y-auto"
              id="content-scroll"
            >
              <Routes>
                <Route path="/" element={<FirstPage />} />
                <Route path="/list" element={<ListPage />}></Route>
                <Route path="/rank" element={<RankPage />} />
                <Route path="/notification" element={<NotificationPage />} />
                <Route path="/viewManga" element={<ViewMangaPage />} />
                <Route
                  path="/login"
                  element={<Login afterLogin={afterLogin} />}
                />
                <Route path="/signup" element={<SignUp />} />
                <Route
                  path="/mygallery"
                  element={
                    <UserNecessaryRoute>
                      <MyGallery />
                    </UserNecessaryRoute>
                  }
                ></Route>
                <Route
                  path="/mytag"
                  element={
                    <UserNecessaryRoute>
                      <MyTag />
                    </UserNecessaryRoute>
                  }
                ></Route>
                <Route
                  path="/mygalleryhasliketag"
                  element={
                    <UserNecessaryRoute>
                      <MyGalleryHasLikeTag />
                    </UserNecessaryRoute>
                  }
                ></Route>
                <Route
                  path="/myinfo"
                  element={
                    <UserNecessaryRoute>
                      <Myinfo afterLogin={afterLogin} />
                    </UserNecessaryRoute>
                  }
                ></Route>
              </Routes>
              {!(isHomePage || isViewMangaPage) && <Footer />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function UserNecessaryRoute({ children }) {
  const { user } = useUserStore();
  if (user === null) {
    console.log("로그인 필요용~");
    return <Navigate to="/list" replace></Navigate>;
  }
  return children;
}

export default App;
