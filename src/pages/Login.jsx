import authApi from "../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login({ afterLogin }) {
  const navigate = useNavigate();
  const login = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const { error } = await authApi.logIn(data.email, data.password);
    if (error) toast("로그인 에러");
    else {
      afterLogin();
      navigate("/list");
    }
  };
  return (
    <div className="pt-10 bg-white dark:bg-black grow">
      <p className="font-semibold text-3xl text-center mb-10">로그인</p>
      <div className="flex flex-col justify-center items-center w-full">
        <form className="flex flex-col gap-1 m-1" onSubmit={(e) => login(e)}>
          <input
            className="border rounded-md min-w-xs pl-1"
            name="email"
            placeholder="이메일"
          ></input>
          <input
            className="border rounded-md min-w-xs pl-1"
            name="password"
            type="password"
            placeholder="비밀번호"
          ></input>
          <div className="flex justify-end">
            <button className="border rounded-md bg-gray-400 dark:bg-gray-600">
              로그인
            </button>
          </div>
        </form>

        <Link to={"/signUp"} className="border rounded-lg mt-10">
          계정이 없으신가요? 회원가입하기
        </Link>
      </div>
    </div>
  );
}
