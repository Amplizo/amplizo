"use client";
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BackButton } from "@/components/ui/BackButton";
import { useAuthStore } from "@/store";
import { api } from "@/lib/api";
import { Bell, Check, CheckCheck, Trash2, Filter } from "lucide-react";

export default function NotificationsPage() {
  const { agent } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const take = 20;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications(filter === "unread", take, skip);
      setNotifications(data.items || []);
      setTotal(data.total || 0);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => { fetchNotifications(); }, [skip, filter]);

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const filtered = filter === "unread" ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;
  const totalPages = Math.max(1, Math.ceil(total / take));
  const currentPage = Math.floor(skip / take) + 1;
  const goToPage = (page: number) => {
    const p = Math.max(1, Math.min(totalPages, page));
    setSkip((p - 1) * take);
  };

  useEffect(() => { setSkip(0); }, [filter]);

  return (
    <DashboardLayout title="Notifications" subtitle={`${unreadCount} unread notifications`}>
      <BackButton className="mb-3" />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-brand-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>All</button>
            <button onClick={() => setFilter("unread")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "unread" ? "bg-brand-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>Unread ({unreadCount})</button>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20">
              <CheckCheck className="w-4 h-4" />Mark all read
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No notifications</div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((notification) => (
                <div key={notification.id} className={`p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notification.read ? "bg-brand-50/50 dark:bg-brand-900/10" : ""}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notification.read ? "bg-brand-500" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{notification.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                  {!notification.read && (
                    <button onClick={() => markAsRead(notification.id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Check className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {total > take && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-500">
              Showing {skip + 1}–{Math.min(skip + take, total)} of {total}
            </p>
            <div className="inline-flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
