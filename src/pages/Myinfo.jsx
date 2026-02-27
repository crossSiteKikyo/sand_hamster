import authApi from "../api/authApi";
import { useUserStore } from "../store";

export default function Myinfo({ afterLogin }) {
  const { user } = useUserStore();
  const logout = async () => {
    const { error } = await authApi.signOut();
    if (error) toast("로그아웃 에러");
    afterLogin();
  };
  const deleteUser = async () => {
    const ok = confirm(
      "정말 탈퇴하시겠습니까? 관련된 모든 정보들도 삭제됩니다",
    );
    if (ok) {
      const { data, error } = await authApi.deleteAccount();
      if (error) {
        console.error("탈퇴 실패:", error.message);
      } else {
        alert("탈퇴되었습니다.");
        // 탈퇴 후 로그아웃 처리
        await logout();
      }
    }
  };
  console.log(user);
  return (
    <div className="p-10 bg-white dark:bg-black flex flex-col grow">
      <p className="font-semibold text-3xl text-center mb-10">내정보</p>
      <div className="flex flex-col justify-between items-center w-full grow">
        <div className="flex flex-col items-center w-full">
          <p>계정: {user.email}</p>
          <p>가입일: {new Date(user.created_at).toLocaleString()}</p>
          <p
            className="border rounded-sm px-1 mt-5 cursor-pointer"
            onClick={logout}
          >
            로그아웃
          </p>
        </div>
        <p
          className="border border-red-500 rounded-sm px-1 mb-10 cursor-pointer"
          onClick={deleteUser}
        >
          회원 탈퇴
        </p>
      </div>
    </div>
  );
}
