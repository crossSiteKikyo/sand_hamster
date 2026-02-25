import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useThemeStore, useUserStore } from "./store";
import Navigation from "./pages/Navigation";
import FloatingActionButton from "./pages/FloatingActionButton";
import NotificationPage from "./pages/NotificationPage";
import FirstPage from "./pages/FirstPage";
import Login from "./pages/Login";
import Myinfo from "./pages/Myinfo";

function App() {
  const { isDarkMode } = useThemeStore();
  const { getUser } = useUserStore();

  useEffect(() => {
    getUser();
  }, []);

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
              <Route path="/login" element={<Login />} />
              <Route path="/list" element={<ListPage />}></Route>
              <Route path="/notification" element={<NotificationPage />} />
              <Route
                path="/myinfo"
                element={
                  <UserNecessaryRoute>
                    <Myinfo />
                  </UserNecessaryRoute>
                }
              ></Route>
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
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

function ListPage() {
  return (
    <div>
      <p>갤러리 리스트</p>
    </div>
  );
}

export default App;
