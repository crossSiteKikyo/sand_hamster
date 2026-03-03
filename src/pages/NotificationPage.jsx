import { useState } from "react";
import { useNotificationStore } from "../store";

export default function NotificationPage() {
  const [selectedId, setSelectedId] = useState(null);
  const { notificationList, readNotifications, addReadNotificationId } =
    useNotificationStore();
  return (
    <div className="grow bg-white px-3 pt-10 dark:bg-black">
      <p className="mb-4 w-full text-center text-xl font-bold">공지사항</p>
      <div className="flex flex-col gap-3">
        {notificationList.map((v) => {
          const isRead = readNotifications.includes(Number(v.id));
          return (
            <div
              key={v.id}
              className={`cursor-pointer rounded-lg border p-4 ${isRead ? "" : "border-orange-500 shadow-sm"}`}
              onClick={() => setSelectedId(Number(v.id))}
            >
              <div className="flex items-center gap-2">
                <div className="flex"></div>
                {!isRead && (
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                )}
                <p className="text-lg font-semibold">{v.title}</p>
              </div>
              {selectedId == v.id && (
                <div onClick={() => addReadNotificationId(v.id)}>
                  <p className="pt-5 whitespace-pre-line">{v.content}</p>
                  <p className="pt-5 text-sm text-gray-500">
                    {new Date(v.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
