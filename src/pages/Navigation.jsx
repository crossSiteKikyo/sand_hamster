import { Bell, House, LogIn, Moon, Search, Sun, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useThemeStore, useUserStore } from "../store";
import NavigationDrawerMenu from "./NavigationDrawerMenu";
import { useState } from "react";
import ModalSearch from "./ModalSearch";

export default function Navigation() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { user } = useUserStore();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  return (
    <>
      {/* 검색 모달창 */}
      <ModalSearch
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
      {/* 사이드 네비게이션 */}
      <div className="flex-col shrink-0 border-r hidden md:flex text-center">
        <div className="flex p-1 mx-auto">
          <img
            src="https://raw.githubusercontent.com/crossSiteKikyo/sand_hamster/refs/heads/main/public/sand_hamster_logo.jpg"
            alt="sand_hamster"
            className="w-9 h-9"
          />
        </div>
        <Link to="/list" className="flex flex-col justify-center p-3">
          <House className="w-5 h-5 mx-auto" />홈
        </Link>
        <div
          className="flex flex-col justify-center p-3 cursor-pointer"
          onClick={() => setIsSearchModalOpen(true)}
        >
          <Search className="w-5 h-5 mx-auto" /> 검색
        </div>
        <Link to="/notification" className="flex flex-col justify-center p-3">
          <Bell className="w-5 h-5 mx-auto" /> 알림
        </Link>
        <div
          className="flex flex-col justify-center p-3 cursor-pointer"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? (
            <Moon className="w-5 h-5 mx-auto" />
          ) : (
            <Sun className="w-5 h-5 mx-auto" />
          )}
          테마
        </div>
        {user ? (
          <Link to="/myinfo" className="flex flex-col justify-center p-3">
            <User className="w-5 h-5 mx-auto" /> 계정
          </Link>
        ) : (
          <Link to="/login" className="flex flex-col justify-center p-3">
            <LogIn className="w-5 h-5 mx-auto" /> 로그인
          </Link>
        )}
      </div>

      {/* 바텀 네비게이션 */}
      <div className="md:hidden fixed bottom-0 right-0 flex min-w-full border-t border-gray-200 bg-white/95 dark:border-gray-800 dark:bg-black/95">
        <NavigationDrawerMenu className="grow flex justify-center p-3" />
        <div
          className="grow flex justify-center p-3 cursor-pointer"
          onClick={() => setIsSearchModalOpen(true)}
        >
          <Search className="w-5 h-5" />
        </div>
        <Link to="/list" className="grow flex justify-center p-3">
          <House className="w-5 h-5" />
        </Link>
        <Link to="/notification" className="grow flex justify-center p-3">
          <Bell className="w-5 h-5" />
        </Link>
        {user ? (
          <Link to="/myinfo" className="grow flex justify-center p-3">
            <User className="w-5 h-5" />
          </Link>
        ) : (
          <Link to="/login" className="grow flex justify-center p-3">
            <LogIn className="w-5 h-5" />
          </Link>
        )}
      </div>
    </>
  );
}
