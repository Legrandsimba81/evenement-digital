"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle, Loader2, Trash2 } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string | null;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
};

export function ProfileNotificationsCard() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (res.ok) {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Erreur marquage lecture:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm("Supprimer cette notification ?")) return;
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((prev) => {
          const removed = notifications.find((n) => n.id === id);
          return removed && !removed.read ? prev - 1 : prev;
        });
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Erreur marquage tout lu:", error);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell size={18} className="text-blue-500" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>
      {isLoadingNotifications ? (
        <div className="flex justify-center py-4">
          <Loader2 size={24} className="animate-spin text-blue-500" />
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">Aucune notification.</p>
      ) : (
        <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-2 text-sm py-2 px-2 rounded-lg transition ${
                !n.read ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                {n.title && (
                  <p className="font-medium text-gray-800 dark:text-gray-200">{n.title}</p>
                )}
                <p className="text-gray-700 dark:text-gray-300 break-words">{n.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(n.createdAt).toLocaleDateString("fr-FR")} à{" "}
                  {new Date(n.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-500 hover:text-blue-700 transition"
                    title="Marquer comme lu"
                  >
                    <CheckCircle size={14} />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 transition"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}