"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getNotificationsApi, markNotificationReadApi } from "@/lib/api/notifications";
import type { NotificationItem } from "@/types/customer";

export interface ArtisanNotificationItem {
  id: string;
  type: "job" | "payment" | "message" | "apprenticeship" | "review" | "verification";
  title: string;
  subtitle: string;
  time: string;
  read: boolean;
  section: "today" | "earlier";
  actionView?: string;
}

/** The inbox item may carry either the documented `kind`/`readAt` fields or the legacy `type`/`read` alias. */
type RawNotification = NotificationItem & {
  kind?: string;
  reference?: string | null;
  readAt?: string | null;
  description?: string;
};

interface ArtisanNotificationsViewProps {
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "";
  const diffMins = Math.floor((Date.now() - then) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function kindToType(kind?: string): ArtisanNotificationItem["type"] {
  const k = (kind || "").toUpperCase();
  if (/(WITHDRAW|PAY|ESCROW|EARNING|PAYOUT)/.test(k)) return "payment";
  if (/(MESSAGE|CHAT|CONVERSATION)/.test(k)) return "message";
  if (/(APPLICATION|APPRENTICE|TRAINING|ENROL)/.test(k)) return "apprenticeship";
  if (/(REVIEW|RATE)/.test(k)) return "review";
  if (/(VERIF|IDENTITY|APPROV)/.test(k)) return "verification";
  return "job";
}

function kindToView(kind?: string): string | undefined {
  const k = (kind || "").toUpperCase();
  if (/(WITHDRAW|PAY|ESCROW|EARNING|PAYOUT)/.test(k)) return "earnings";
  if (/(MESSAGE|CHAT|CONVERSATION)/.test(k)) return "messages";
  if (/(APPLICATION|APPRENTICE|TRAINING|ENROL)/.test(k)) return "apprenticeships-hub";
  if (/(REVIEW|RATE)/.test(k)) return "rate-customer";
  if (/(VERIF|IDENTITY|APPROV)/.test(k)) return "verification";
  if (/OFFER/.test(k)) return "jobs-list";
  return undefined;
}

function mapNotification(raw: RawNotification): ArtisanNotificationItem {
  const kind = raw.kind || raw.type;
  return {
    id: raw.id,
    type: kindToType(kind),
    title: raw.title,
    subtitle: raw.body || raw.description || "",
    time: raw.createdAt ? formatRelativeTime(raw.createdAt) : "",
    read: Boolean(raw.read || raw.readAt),
    section: raw.createdAt && isToday(raw.createdAt) ? "today" : "earlier",
    actionView: kindToView(kind),
  };
}

export function ArtisanNotificationsView({
  onBack,
  onNavigate,
}: ArtisanNotificationsViewProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<ArtisanNotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = (await getNotificationsApi()) as RawNotification[];
        if (!mounted) return;
        setNotifications(Array.isArray(items) ? items.map(mapNotification) : []);
      } catch (err) {
        console.debug("Notifications API unavailable.", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) {
      toast("No unread notifications");
      return;
    }
    try {
      await markNotificationReadApi(unreadIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not update notifications.";
      toast.error(message);
    }
  };

  const handleItemClick = async (notif: ArtisanNotificationItem) => {
    if (!notif.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      markNotificationReadApi(notif.id).catch((err) => {
        console.debug("Could not mark notification read.", err);
      });
    }
    if (notif.actionView && onNavigate) {
      onNavigate(notif.actionView);
    }
  };

  const getIcon = (type: ArtisanNotificationItem["type"]) => {
    switch (type) {
      case "job":
        return (
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#001B40] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
        );
      case "payment":
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="12" x="2" y="6" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
          </div>
        );
      case "message":
        return (
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        );
      case "apprenticeship":
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
        );
      case "review":
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 fill-amber-400 text-amber-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        );
      case "verification":
        return (
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#074292] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
        );
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.read : true
  );

  const todayItems = filteredNotifications.filter((n) => n.section === "today");
  const earlierItems = filteredNotifications.filter((n) => n.section === "earlier");

  const renderList = (items: ArtisanNotificationItem[]) => (
    <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => handleItemClick(item)}
          className={`w-full p-4 sm:p-5 flex items-center justify-between text-left transition-colors cursor-pointer group ${
            !item.read ? "bg-blue-50/20 hover:bg-blue-50/40" : "hover:bg-neutral-50/70"
          }`}
        >
          <div className="flex items-center gap-3.5 pr-3">
            {getIcon(item.type)}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-heading font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  {item.title}
                </span>
              </div>
              {item.subtitle && (
                <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs text-neutral-400 font-medium">{item.time}</span>
            {!item.read && <span className="w-2 h-2 rounded-full bg-[#074292]" />}
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Header */}
      <div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back</span>
          </button>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
              Notifications
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Updates about your jobs, payments and messages
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-xs font-semibold text-[#074292] hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs: All vs Unread */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filter === "all"
              ? "bg-[#001B40] text-white shadow-2xs"
              : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filter === "unread"
              ? "bg-[#001B40] text-white shadow-2xs"
              : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Unread
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-white rounded-3xl border border-neutral-200/80" />
          <div className="h-20 bg-white rounded-3xl border border-neutral-200/80" />
          <div className="h-20 bg-white rounded-3xl border border-neutral-200/80" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        /* Zero State: All Caught Up */
        <div className="bg-white rounded-3xl p-12 sm:p-16 border border-neutral-200/80 shadow-xs max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#001B40] flex items-center justify-center mx-auto border border-blue-100">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[#0F1115]">
              You&apos;re all caught up
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">
              New updates about your jobs, payments and messages will show up here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {todayItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
                Today
              </h3>
              {renderList(todayItems)}
            </div>
          )}

          {earlierItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
                Earlier
              </h3>
              {renderList(earlierItems)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ArtisanNotificationsView;
