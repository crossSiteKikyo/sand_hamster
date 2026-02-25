import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import { useThemeStore } from "../store";
import { Menu, Moon, Sun } from "lucide-react";

export default function NavigationDrawerMenu({ children, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  function closeDrawer() {
    setIsOpen(false);
  }

  function openDrawer() {
    setIsOpen(true);
  }

  return (
    <>
      <div onClick={openDrawer} className={className}>
        <Menu className="w-5 h-5" />
      </div>
      <Transition show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeDrawer}>
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

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 left-0 overflow-hidden flex">
              <div className="fixed inset-y-0 left-0 flex">
                <TransitionChild
                  as={Fragment}
                  enter="transform transition ease-in-out duration-100"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-100"
                  leaveFrom="translate-x-0"
                  leaveTo="-translate-x-full"
                >
                  <DialogPanel className="bg-white dark:bg-gray-900 dark:text-gray-50 border-r h-full overflow-y-auto">
                    <div className="flex p-1">
                      <img
                        src="/sand_hamster_logo.jpg"
                        alt="tung"
                        className="w-9 h-9 mx-auto"
                      />
                    </div>
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
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
