"use client";

import { useEffect, useRef, useState } from "react";

type NotificationType = {
  id: number;
  message: string;
  createdAt: string;
};

export default function NotificationBell() {
  const [notifications, setNotifications] =
    useState<NotificationType[]>([]);

  const [open, setOpen] = useState(false);

  const notificationRef =
    useRef<HTMLDivElement>(null);

  // Fetch notifications every 5 seconds
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Close notification when mouse leaves
  useEffect(() => {
    const handleMouseLeave = (
      event: MouseEvent
    ) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mouseover",
      handleMouseLeave
    );

    return () => {
      document.removeEventListener(
        "mouseover",
        handleMouseLeave
      );
    };
  }, []);

  const fetchNotifications =
    async () => {
      try {
        const storedUser =
          localStorage.getItem("user");

        const userId = storedUser
          ? JSON.parse(storedUser).id
          : null;

        const res = await fetch(
          "http://localhost:5000/notifications",
          {
            method: "GET",
            credentials: "include",
            headers: userId
              ? {
                  "x-user-id":
                    String(userId),
                }
              : {},
          }
        );

        const data =
          await res.json();

        if (res.ok) {
          setNotifications(data);
        }
      } catch (error) {
        console.error(
          "Notification fetch failed"
        );
      }
    };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() =>
          setOpen(!open)
        }
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        🔔

        {notifications.length >
          0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {
              notifications.length
            }
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {open && (
        <div
          ref={notificationRef}
          className="absolute right-0 mt-3 w-80 bg-white shadow-2xl rounded-xl border z-50"
        >
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg">
              Notifications
            </h2>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length ===
            0 ? (
              <div className="p-4 text-gray-500 text-sm">
                No notifications
              </div>
            ) : (
              notifications.map(
                (
                  notification
                ) => (
                  <div
                    key={
                      notification.id
                    }
                    className="p-4 border-b hover:bg-gray-50 transition"
                  >
                    <p className="text-sm text-gray-800">
                      {
                        notification.message
                      }
                    </p>

                    <span className="text-xs text-gray-400">
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </span>
                  </div>
                )
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}