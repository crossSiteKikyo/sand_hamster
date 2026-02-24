import { Bell, House, Moon, Search, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useThemeStore } from "../store";
import NavigationDrawerMenu from "./NavigationDrawerMenu";

export default function Navigation() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  return (
    <>
      {/* 사이드 네비게이션 */}
      <div className="flex-col shrink-0 border-r hidden md:flex text-center">
        <div className="flex p-1 mx-auto">
          <img src="/sand_hamster_logo.jpg" alt="tung" className="w-9 h-9" />
        </div>
        <Link to="/" className="flex flex-col justify-center p-3">
          <House className="w-5 h-5 mx-auto" />홈
        </Link>
        <Link to="/" className="flex flex-col justify-center p-3">
          <Search className="w-5 h-5 mx-auto" /> 검색
        </Link>
        <Link to="/notification" className="flex flex-col justify-center p-3">
          <Bell className="w-5 h-5 mx-auto" /> 알림
        </Link>
        <div
          className="flex flex-col justify-center p-3"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? (
            <Moon className="w-5 h-5 mx-auto" />
          ) : (
            <Sun className="w-5 h-5 mx-auto" />
          )}
          테마
        </div>
      </div>
      {/* 바텀 네비게이션 */}
      <div className="md:hidden fixed bottom-0 right-0 flex min-w-full border-t border-gray-200 bg-white/95 dark:border-gray-800 dark:bg-black/95">
        <NavigationDrawerMenu className="grow flex justify-center p-3" />
        <Link to="/" className="grow flex justify-center p-3">
          <Search className="w-5 h-5" />
        </Link>
        <Link to="/" className="grow flex justify-center p-3">
          <House className="w-5 h-5" />
        </Link>
        <Link to="/notification" className="grow flex justify-center p-3">
          <Bell className="w-5 h-5" />
        </Link>
      </div>
    </>
  );
}
