import authApi from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SignUp() {
  const navigate = useNavigate();
  const signup = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const { error } = await authApi.signUp(data.email, data.password);
    if (error) toast("회원가입 에러");
    else {
      toast("회원가입 성공!");
      navigate("/login");
    }
  };
  return (
    <div className="pt-10 bg-white dark:bg-black grow">
      <p className="font-semibold text-3xl text-center mb-10">회원가입</p>
      <div className="flex flex-col justify-center items-center w-full">
        <form className="flex flex-col gap-1 m-1" onSubmit={(e) => signup(e)}>
          <input
            className="border rounded-md min-w-xs pl-1"
            name="email"
            placeholder="이메일"
          ></input>
          <input
            className="border rounded-md min-w-xs pl-1"
            name="password"
            placeholder="비밀번호 6자리 이상"
          ></input>
          <div className="flex justify-end">
            <button className="border rounded-md bg-gray-400 dark:bg-gray-600">
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
