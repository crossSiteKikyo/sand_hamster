import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import notificationApi from "../api/notificationApi";

const useNotificationStore = create(
  persist(
    (set, get) => ({
      notificationList: [],
      readNotifications: [],
      // 공지사항 데이터 불러오기 함수.
      getNotificationList: async () => {
        let { data, error } = await notificationApi.getNotificationList();
        if (error) {
          toast(`공지사항 정보 가져오기 에러`);
        }
        if (data) set({ notificationList: data });
      },
      addReadNotificationId: (id) =>
        set((state) => ({
          readNotifications: state.readNotifications.includes(id)
            ? state.readNotifications
            : [...state.readNotifications, id],
        })),
      //미읽음 개수 계산 함수(Derived State)
      getUnreadCount: () => {
        const { notificationList, readNotifications } = get();
        const allIds = notificationList.map((v) => v.id);
        return allIds.filter((id) => !readNotifications.includes(id)).length;
      },
    }),
    {
      name: "notification-storage",
      // notificationList는 저장하지 않고, readNotifications만 저장한다.
      partialize: (state) => ({ readNotifications: state.readNotifications }),
    },
  ),
);

export default useNotificationStore;
