import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useThemeStore } from "./store";
import Navigation from "./pages/Navigation";
import FloatingActionButton from "./pages/FloatingActionButton";
import NotificationPage from "./pages/NotificationPage";
import FirstPage from "./pages/FirstPage";

function App() {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <div className="bg-gray-50 dark:bg-gray-950 text-gray-950 dark:text-gray-50 flex h-screen overflow-hidden">
        <div className="max-w-7xl mx-auto flex grow">
          <Navigation />
          <FloatingActionButton />
          <div
            className="flex flex-col grow overflow-y-auto"
            id="content-scroll"
          >
            <Routes>
              <Route path="/" element={<FirstPage />} />
              <Route path="/notification" element={<NotificationPage />} />
              <Route path="/list" element={<Category />}></Route>
              <Route path="/drink" element={<Drink />}></Route>
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

function Category() {
  return (
    <div>
      <p>갤러리 리스트</p>
    </div>
  );
}

function Drink() {
  return (
    <div>
      <p>드드드드드링크</p>
    </div>
  );
}

export default App;
