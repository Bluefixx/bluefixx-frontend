"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

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

interface ArtisanNotificationsViewProps {
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export function ArtisanNotificationsView({
  onBack,
  onNavigate,
}: ArtisanNotificationsViewProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<ArtisanNotificationItem[]>([
    {
      id: "notif-1",
      type: "job",
      title: "New job near you",
      subtitle: "Kitchen Plumbing Repair · 2.5 km away · ₦25,000–₦50,000",
      time: "12m",
      read: false,
      section: "today",
      actionView: "find-jobs",
    },
    {
      id: "notif-2",
      type: "payment",
      title: "Payment released",
      subtitle: "₦55,242 is now in your withdrawable balance.",
      time: "2h",
      read: false,
      section: "today",
      actionView: "earnings",
    },
    {
      id: "notif-3",
      type: "message",
      title: "Chiamaka Obi sent a message",
      subtitle: "Are you still free to come today?",
      time: "3h",
      read: true,
      section: "today",
      actionView: "messages",
    },
    {
      id: "notif-4",
      type: "apprenticeship",
      title: "New apprenticeship application",
      subtitle: "Daniel Eze applied to Welding & Metal Fabrication.",
      time: "Yesterday",
      read: true,
      section: "earlier",
      actionView: "apprenticeships-hub",
    },
    {
      id: "notif-5",
      type: "review",
      title: "Rate Daniel C.",
      subtitle: "Earn trust by reviewing your recent customer.",
      time: "3d ago",
      read: true,
      section: "earlier",
      actionView: "rate-customer",
    },
    {
      id: "notif-6",
      type: "verification",
      title: "Identity verified",
      subtitle: "You can now receive and quote on live jobs.",
      time: "1w ago",
      read: true,
      section: "earlier",
      actionView: "verification",
    },
  ]);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success("Notifications cleared");
  };

  const handleItemClick = (notif: ArtisanNotificationItem) => {
    // Mark this one as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.actionView && onNavigate) {
      onNavigate(notif.actionView);
    } else {
      toast(notif.title);
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
            <span className="text-neutral-300">·</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 cursor-pointer"
            >
              Clear
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

      {/* Zero State: All Caught Up */}
      {filteredNotifications.length === 0 ? (
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

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setNotifications([
                  {
                    id: "notif-1",
                    type: "job",
                    title: "New job near you",
                    subtitle: "Kitchen Plumbing Repair · 2.5 km away · ₦25,000–₦50,000",
                    time: "12m",
                    read: false,
                    section: "today",
                    actionView: "find-jobs",
                  },
                  {
                    id: "notif-2",
                    type: "payment",
                    title: "Payment released",
                    subtitle: "₦55,242 is now in your withdrawable balance.",
                    time: "2h",
                    read: false,
                    section: "today",
                    actionView: "earnings",
                  },
                ]);
                setFilter("all");
              }}
              className="text-xs font-semibold text-[#074292] hover:underline cursor-pointer"
            >
              Reset sample notifications
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today Section */}
          {todayItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
                Today
              </h3>
              <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
                {todayItems.map((item) => (
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
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs text-neutral-400 font-medium">
                        {item.time}
                      </span>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#074292]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Earlier Section */}
          {earlierItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
                Earlier
              </h3>
              <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
                {earlierItems.map((item) => (
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
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs text-neutral-400 font-medium">
                        {item.time}
                      </span>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#074292]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ArtisanNotificationsView;

