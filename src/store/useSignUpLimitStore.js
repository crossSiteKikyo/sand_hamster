import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSignUpLimitStore = create(
  persist(
    (set) => ({
      lastTime: 1772638885602,
      setLastTime: () => set(() => ({ lastTime: Date.now() })),
    }),
    { name: "sand_hamster_last_signup" },
  ),
);

export default useSignUpLimitStore;
