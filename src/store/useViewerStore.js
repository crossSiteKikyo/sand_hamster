import { create } from "zustand";
import { persist } from "zustand/middleware";

const useViewerStore = create(
  persist(
    (set) => ({
      isTwoView: false,
      setIsTwoView: (flag) => set((state) => ({ isTwoView: flag })),
    }),
    { name: "sand_hamster_viewer_store" },
  ),
);

export default useViewerStore;
