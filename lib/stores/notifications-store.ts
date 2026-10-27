"use client";

import { useSyncExternalStore } from "react";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  dateGroup: "Today" | "Earlier";
  isRead: boolean;
  type: "quote" | "job-completed" | "warranty" | "review" | "escrow" | "referral";
  actionUrl?: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Emeka Okafor sent a quote",
    description: "₦38,500 for Bathroom Plumbing Repair. Compare with 2 others.",
    time: "09:41",
    dateGroup: "Today",
    isRead: false,
    type: "quote",
    actionUrl: "/bookings?tab=job-posts",
  },
  {
    id: "notif-2",
    title: "Emeka marked the job complete",
    description: "Confirm within 48 hours to release payment.",
    time: "16:12",
    dateGroup: "Today",
    isRead: false,
    type: "job-completed",
    actionUrl: "/bookings?tab=active",
  },
  {
    id: "notif-3",
    title: "Your 7-day warranty is active",
    description: "Covered until 29 Aug. Report any issue from your booking.",
    time: "12:12",
    dateGroup: "Today",
    isRead: false,
    type: "warranty",
    actionUrl: "/bookings?tab=completed",
  },
  {
    id: "notif-4",
    title: "How did Emeka do?",
    description: "Leave a review for Bathroom Plumbing Repair.",
    time: "Yesterday",
    dateGroup: "Earlier",
    isRead: true,
    type: "review",
    actionUrl: "/reviews",
  },
  {
    id: "notif-5",
    title: "Payment secured in escrow",
    description: "₦38,500 is held until you confirm the work.",
    time: "20 Aug",
    dateGroup: "Earlier",
    isRead: true,
    type: "escrow",
    actionUrl: "/wallet",
  },
  {
    id: "notif-6",
    title: "Your friend booked their first job",
    description: "You earned ₦1,000 in referral rewards.",
    time: "18 Aug",
    dateGroup: "Earlier",
    isRead: true,
    type: "referral",
    actionUrl: "/settings?tab=referral",
  },
];

let notifications: NotificationItem[] = [...initialNotifications];
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export const notificationStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return notifications;
  },
  setNotifications(items: NotificationItem[]) {
    notifications = items;
    emitChange();
  },
  markAsRead(id: string) {
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    emitChange();
  },
  markAllAsRead() {
    notifications = notifications.map((n) => ({ ...n, isRead: true }));
    emitChange();
  },
  clearAll() {
    notifications = [];
    emitChange();
  },
};

export function useNotifications() {
  const currentNotifications = useSyncExternalStore(
    notificationStore.subscribe,
    notificationStore.getSnapshot,
    () => initialNotifications
  );

  const unreadCount = currentNotifications.filter((n) => !n.isRead).length;

  return {
    notifications: currentNotifications,
    unreadCount,
    setNotifications: notificationStore.setNotifications,
    markAsRead: notificationStore.markAsRead,
    markAllAsRead: notificationStore.markAllAsRead,
    clearAll: notificationStore.clearAll,
  };
}
