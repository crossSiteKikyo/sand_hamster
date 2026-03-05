import {
  Bell,
  BookHeart,
  House,
  Images,
  LogIn,
  Moon,
  Search,
  Sun,
  Tags,
  Trophy,
  User,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import NavigationDrawerMenu from "./NavigationDrawerMenu";
import { useState } from "react";
import ModalSearch from "./ModalSearch";
import useThemeStore from "../store/useThemeStore";
import useUserStore from "../store/useUserStore";
import useNotificationStore from "../store/useNotificationStore";

export default function Navigation() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { user } = useUserStore();
  const { getUnreadCount } = useNotificationStore();
  const unreadCount = getUnreadCount();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { pathname } = useLocation(); // 현재 경로를 가져옵니다.
  const isActive = (path) => pathname === path;
  return (
    <>
      {/* 검색 모달창 */}
      <ModalSearch
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
      {/* 사이드 네비게이션 */}
      <div className="hidden shrink-0 border-r md:block">
        <img
          src="https://raw.githubusercontent.com/crossSiteKikyo/sand_hamster/refs/heads/main/public/sand_hamster_logo.jpg"
          alt="sand_hamster"
          className="m-1 h-9 w-9"
        />
        <div>
          <Link
            className={`flex h-12 items-center px-3 ${isActive("/list") ? "border-y border-l" : ""}`}
            to="/list"
          >
            <House className="h-5 w-5" />
            <p className={`hidden pl-3 xl:block`}>홈</p>
          </Link>
          <div
            className="flex h-12 cursor-pointer items-center px-3"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <Search className="h-5 w-5" />
            <p className="hidden pl-3 xl:block">검색</p>
          </div>
          <Link
            className={`flex h-12 items-center px-3 ${isActive("/rank") ? "border-y border-l" : ""}`}
            to="/rank"
          >
            <Trophy className="h-5 w-5" />
            <p className="hidden pl-3 xl:block">랭킹</p>
          </Link>
          <Link
            className={`relative flex h-12 items-center px-3 ${isActive("/notification") ? "border-y border-l" : ""}`}
            to="/notification"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 ml-2 h-4 w-4 items-center justify-center rounded-full bg-red-500 p-0 text-center text-xs">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            <p className="hidden pl-3 xl:block">공지</p>
          </Link>
          <div className="flex h-12 items-center px-3" onClick={toggleDarkMode}>
            {isDarkMode ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <p className="hidden pl-3 xl:block">테마</p>
          </div>
          {user ? (
            <>
              <Link
                className={`flex h-12 items-center px-3 ${isActive("/mygallery") ? "border-y border-l" : ""}`}
                to="/mygallery"
              >
                <Images className="h-5 w-5" />
                <p className="hidden pl-3 xl:block">내 갤러리</p>
              </Link>
              <Link
                className={`flex h-12 items-center px-3 ${isActive("/mytag") ? "border-y border-l" : ""}`}
                to="/mytag"
              >
                <Tags className="h-5 w-5" />
                <p className="hidden pl-3 xl:block">내 태그</p>
              </Link>
              <Link
                className={`flex h-12 items-center px-3 ${isActive("/mygalleryhasliketag") ? "border-y border-l" : ""}`}
                to="/mygalleryhasliketag"
              >
                <BookHeart className="h-5 w-5" />
                <p className="hidden pl-3 xl:block">내 좋아요</p>
              </Link>
              <Link
                className={`flex h-12 items-center px-3 ${isActive("/myinfo") ? "border-y border-l" : ""}`}
                to="/myinfo"
              >
                <User className="h-5 w-5" />
                <p className="hidden pl-3 xl:block">계정</p>
              </Link>
            </>
          ) : (
            <>
              <Link
                className={`flex h-12 items-center px-3 ${isActive("/login") ? "border-y border-l" : ""}`}
                to="/login"
              >
                <LogIn className="h-5 w-5" />
                <p className="hidden pl-3 xl:block">로그인</p>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 바텀 네비게이션 */}
      <div className="fixed right-0 bottom-0 flex min-w-full border-t border-gray-200 bg-white/95 md:hidden dark:border-gray-800 dark:bg-black/95">
        <NavigationDrawerMenu className="flex grow justify-center p-3" />
        <div
          className="flex grow cursor-pointer justify-center p-3"
          onClick={() => setIsSearchModalOpen(true)}
        >
          <Search className="h-5 w-5" />
        </div>
        <Link to="/list" className="flex grow justify-center p-3">
          <House className="h-5 w-5" strokeWidth={isActive("/list") ? 3 : 2} />
        </Link>
        <Link to="/notification" className="flex grow justify-center p-3">
          <Bell
            className="h-5 w-5"
            strokeWidth={isActive("/notification") ? 3 : 2}
          />
          {unreadCount > 0 && (
            <span className="absolute top-1 ml-4 h-4 w-4 items-center justify-center rounded-full bg-red-500 p-0 text-center text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        {user ? (
          <Link to="/myinfo" className="flex grow justify-center p-3">
            <User
              className="h-5 w-5"
              strokeWidth={isActive("/myinfo") ? 3 : 2}
            />
          </Link>
        ) : (
          <Link to="/login" className="flex grow justify-center p-3">
            <LogIn
              className="h-5 w-5"
              strokeWidth={isActive("/login") ? 3 : 2}
            />
          </Link>
        )}
      </div>
    </>
  );
}
