import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSettingStore = create(
  persist(
    (set) => ({
      isHiddenGalleryHidden: false,
      hideHiddenGallery: () => set(() => ({ isHiddenGalleryHidden: true })),
      blurHiddenGallery: () => set(() => ({ isHiddenGalleryHidden: false })),
    }),
    { name: "sand_hamster_setting" },
  ),
);

export default useSettingStore;
