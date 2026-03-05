import authApi from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useSignUpLimitStore from "../store/useSignUpLimitStore";

export default function SignUp() {
  const navigate = useNavigate();
  const { lastTime, setLastTime } = useSignUpLimitStore();
  const signup = async (e) => {
    e.preventDefault();
    if (Date.now() - Number(lastTime) < 1000 * 60 * 10) {
      toast(
        `아직 회원가입을 할 수 없습니다. 다음 회원가입 가능 시간: ${new Date(Number(lastTime + 1000 * 60 * 10)).toLocaleString()}`,
      );
      return;
    }
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const { error } = await authApi.signUp(data.email, data.password);
    if (error) toast("회원가입 에러");
    else {
      setLastTime();
      toast("회원가입 성공!");
      navigate("/login");
    }
  };
  return (
    <div className="grow bg-white pt-10 dark:bg-black">
      <p className="mb-10 text-center text-3xl font-semibold">회원가입</p>
      <div className="flex w-full flex-col items-center justify-center">
        <form className="m-1 flex flex-col gap-1" onSubmit={(e) => signup(e)}>
          <input
            className="min-w-xs rounded-md border pl-1"
            name="email"
            placeholder="이메일"
          ></input>
          <input
            className="min-w-xs rounded-md border pl-1"
            name="password"
            placeholder="비밀번호 6자리 이상"
          ></input>
          <div className="flex justify-end">
            <button className="rounded-md border bg-gray-400 dark:bg-gray-600">
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
