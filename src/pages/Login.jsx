import { FcGoogle } from "react-icons/fc";
import authApi from "../api/authApi";
import { useUserStore } from "../store";

export default function Login() {
  const { getUser } = useUserStore();
  const loginWithGoogle = async () => {
    const { data, error } = await authApi.loginWithGoogle();
    if (error) console.error("Error logging in:", error.message);
    else await getUser();
  };
  return (
    <div className="p-10 bg-white dark:bg-black grow">
      <p className="font-semibold text-3xl text-center mb-10">
        로그인 / 회원가입
      </p>
      <div className="flex flex-col justify-center items-center w-full">
        <p
          className="flex justify-center w-64 border rounded-xl p-2"
          onClick={loginWithGoogle}
        >
          <FcGoogle className="w-6 h-6 mr-2" />
          구글로 로그인
        </p>
      </div>
    </div>
  );
}
