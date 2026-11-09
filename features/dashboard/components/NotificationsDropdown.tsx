"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { useNotifications, NotificationItem } from "@/lib/stores/notifications-store";

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Show top 3 recent notifications in dropdown panel (matching Screenshot 3 Left)
  const recentNotifications = notifications.slice(0, 3);

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "quote":
        return (
          <svg className="w-4 h-4 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
      case "job-completed":
        return (
          <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case "warranty":
        return (
          <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        );
      case "review":
        return (
          <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case "escrow":
        return (
          <svg className="w-4 h-4 text-[#001B40]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
      case "referral":
        return (
          <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-14 w-84 sm:w-96 bg-white rounded-2xl shadow-xl border border-neutral-200/90 py-3 z-50 animate-in fade-in duration-100"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 pb-3 border-b border-neutral-100">
        <h3 className="font-heading font-bold text-sm text-[#001B40]">
          Notifications
        </h3>
        <button
          type="button"
          onClick={markAllAsRead}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-neutral-50 max-h-96 overflow-y-auto">
        {recentNotifications.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-2 text-neutral-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-neutral-800">No notifications yet</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">You&apos;re all caught up with your updates.</p>
          </div>
        ) : (
          recentNotifications.map((notif) => (
            <Link
              key={notif.id}
              href={notif.actionUrl || "/notifications"}
              onClick={() => {
                markAsRead(notif.id);
                onClose();
              }}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-neutral-50/80 transition-colors ${
                !notif.isRead ? "bg-blue-50/20" : ""
              }`}
            >
              {/* Type Icon Container */}
              <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                {getNotificationIcon(notif.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-xs text-[#001B40] leading-snug">
                  {notif.title}
                </p>
                <p className="font-sans text-[11px] text-neutral-500 line-clamp-2 mt-0.5 leading-relaxed">
                  {notif.description}
                </p>
              </div>

              {/* Time & Unread Dot */}
              <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                <span className="font-sans text-[10px] text-neutral-400">
                  {notif.time}
                </span>
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 px-4 border-t border-neutral-100">
        <Link
          href="/notifications"
          onClick={onClose}
          className="block py-2 text-center text-xs font-bold text-neutral-600 hover:text-[#001B40] transition-colors"
        >
          See all notifications
        </Link>
      </div>
    </div>
  );
}
