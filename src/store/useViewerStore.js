import { create } from "zustand";
import { persist } from "zustand/middleware";

const useViewerStore = create(
  persist(
    (set, get) => ({
      isTwoView: false,
      setIsTwoView: (flag) => set((state) => ({ isTwoView: flag })),
      touchDirection: "leftToRight",
      nextTouchDirection: () => {
        if (get().touchDirection == "leftToRight")
          set({ touchDirection: "rightToLeft" });
        else if (get().touchDirection == "rightToLeft")
          set({ touchDirection: "topToBottom" });
        else set({ touchDirection: "leftToRight" });
      },
      second: 10,
      setSecond: (num) => set({ second: num }),
      loop: false,
      setLoop: (flag) => set({ loop: flag }),
    }),
    { name: "sand_hamster_viewer_store" },
  ),
);

export default useViewerStore;
