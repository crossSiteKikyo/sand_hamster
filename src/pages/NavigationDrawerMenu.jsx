import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import { useThemeStore, useUserStore } from "../store";
import { BookHeart, Images, Menu, Moon, Sun, Tags, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function NavigationDrawerMenu({ className }) {
  const { user } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { pathname } = useLocation(); // 현재 경로를 가져옵니다.
  const isActive = (path) => pathname === path;
  function closeDrawer() {
    setIsOpen(false);
  }

  function openDrawer() {
    setIsOpen(true);
  }

  return (
    <>
      <div onClick={openDrawer} className={className}>
        <Menu className="h-5 w-5" />
      </div>
      <Transition show={isOpen} as={Fragment}>
        <Dialog className="relative z-50" onClose={closeDrawer}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30"></div>
          </TransitionChild>

          <div className="fixed inset-y-0 left-0">
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-in-out duration-100"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-100"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <DialogPanel className="h-full overflow-y-auto border-r bg-white dark:bg-gray-900 dark:text-gray-50">
                <img
                  src="https://raw.githubusercontent.com/crossSiteKikyo/sand_hamster/refs/heads/main/public/sand_hamster_logo.jpg"
                  alt="sand_hamster"
                  className="m-1 h-9 w-9"
                />
                <div
                  className="flex h-12 items-center px-3"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                  <p className="pl-3">테마</p>
                </div>
                <Link
                  className={`flex h-12 items-center px-3 ${isActive("/rank") ? "border-y border-l" : ""}`}
                  to="/rank"
                >
                  <Trophy className="h-5 w-5" />
                  <p className="pl-3">랭킹</p>
                </Link>
                {user != null && (
                  <>
                    <Link
                      className={`flex h-12 items-center px-3 ${isActive("/mygallery") ? "border-y border-l" : ""}`}
                      to="/mygallery"
                    >
                      <Images className="h-5 w-5" />
                      <p className="pl-3">내 갤러리</p>
                    </Link>
                    <Link
                      className={`flex h-12 items-center px-3 ${isActive("/mytag") ? "border-y border-l" : ""}`}
                      to="/mytag"
                    >
                      <Tags className="h-5 w-5" />
                      <p className="pl-3">내 태그</p>
                    </Link>
                    <Link
                      className={`flex h-12 items-center px-3 ${isActive("/mygalleryhasliketag") ? "border-y border-l" : ""}`}
                      to="/mygalleryhasliketag"
                    >
                      <BookHeart className="h-5 w-5" />
                      <p className="pl-3">내 좋아요</p>
                    </Link>
                  </>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
