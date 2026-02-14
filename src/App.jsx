import { useState } from "react";
import "./App.css";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <div className="flex flex-col">
          <Link to={"/category"}>카테고리</Link>
          <Link to={"/drink"}>음료수</Link>
        </div>
        <Routes>
          <Route path="/category" element={<Category />}></Route>
          <Route path="/drink" element={<Drink />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

function Category() {
  return (
    <div>
      <p>카카카테고리</p>
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
