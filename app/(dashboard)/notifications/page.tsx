"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/stores/auth-store";
import { useNotifications, NotificationItem } from "@/lib/stores/notifications-store";
import { getNotificationsApi } from "@/lib/api/notifications";
import { ArtisanNotificationsView } from "@/features/dashboard/components/artisan/ArtisanNotificationsView";

export default function NotificationsPage() {
  const { activeRole } = useAuth();
  const router = useRouter();
  const { notifications, setNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    let mounted = true;
    getNotificationsApi()
      .then((items) => {
        if (mounted && Array.isArray(items)) {
          setNotifications(
            items.map((it: any) => ({
              id: it.id,
              title: it.title,
              description: it.body || it.title,
              time: it.createdAt
                ? new Date(it.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Today",
              dateGroup: "Today",
              isRead: Boolean(it.read || it.readAt),
              type: (it.type?.toLowerCase() as any) || "quote",
              actionUrl: "/notifications",
            }))
          );
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [setNotifications]);

  if (activeRole === "artisan") {
    return (
      <ArtisanNotificationsView
        onBack={() => router.back()}
        onNavigate={(view) => router.push(`/dashboard?view=${view}`)}
      />
    );
  }

  const filteredNotifications =
    activeFilter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const todayNotifications = filteredNotifications.filter(
    (n) => n.dateGroup === "Today"
  );
  const earlierNotifications = filteredNotifications.filter(
    (n) => n.dateGroup === "Earlier"
  );

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "quote":
        return (
          <svg className="w-4.5 h-4.5 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
      case "job-completed":
        return (
          <svg className="w-4.5 h-4.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case "warranty":
        return (
          <svg className="w-4.5 h-4.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        );
      case "review":
        return (
          <svg className="w-4.5 h-4.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case "escrow":
        return (
          <svg className="w-4.5 h-4.5 text-[#001B40]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
      case "referral":
        return (
          <svg className="w-4.5 h-4.5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
          </svg>
        );
      default:
        return (
          <svg className="w-4.5 h-4.5 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
    }
  };

  const renderNotificationCard = (notif: NotificationItem) => (
    <Link
      key={notif.id}
      href={notif.actionUrl || "#"}
      onClick={() => markAsRead(notif.id)}
      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all hover:shadow-xs cursor-pointer ${
        !notif.isRead
          ? "bg-white border-blue-200 shadow-2xs"
          : "bg-white/80 border-neutral-200/80 hover:bg-white"
      }`}
    >
      {/* Icon Frame */}
      <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
        {getNotificationIcon(notif.type)}
      </div>

      {/* Main Details */}
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-xs sm:text-sm text-[#001B40]">
          {notif.title}
        </p>
        <p className="font-sans text-xs text-neutral-500 mt-0.5">
          {notif.description}
        </p>
      </div>

      {/* Timestamp & Unread Dot */}
      <div className="flex flex-col items-end gap-2 shrink-0 pt-0.5">
        <span className="font-sans text-xs text-neutral-400">
          {notif.time}
        </span>
        {!notif.isRead && (
          <span className="w-2 h-2 rounded-full bg-blue-600" />
        )}
      </div>
    </Link>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-150">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Notifications
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
          Updates about your jobs, payments and messages
        </p>
      </div>

      {/* Filter Tabs & Mark all as read */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center p-1 bg-neutral-100 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-[#001B40] text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("unread")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "unread"
                ? "bg-[#001B40] text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Unread
          </button>
        </div>

        <button
          type="button"
          onClick={markAllAsRead}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      {/* Empty State: You're all caught up (Screenshot 4 Right) */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 shadow-xs max-w-lg mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h3 className="font-heading font-bold text-base sm:text-lg text-[#001B40]">
            You&apos;re all caught up
          </h3>
          <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1 max-w-xs mx-auto">
            New updates about your jobs, payments and messages will show up here.
          </p>
        </div>
      ) : (
        /* Notifications List */
        <div className="space-y-6">
          {/* Today Group */}
          {todayNotifications.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">
                Today
              </h2>
              <div className="space-y-2.5">
                {todayNotifications.map(renderNotificationCard)}
              </div>
            </div>
          )}

          {/* Earlier Group */}
          {earlierNotifications.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">
                Earlier
              </h2>
              <div className="space-y-2.5">
                {earlierNotifications.map(renderNotificationCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
