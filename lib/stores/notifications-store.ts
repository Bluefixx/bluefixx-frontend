"use client";

import { useSyncExternalStore } from "react";
import { markNotificationReadApi } from "@/lib/api/notifications";

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

const initialNotifications: NotificationItem[] = [];

let notifications: NotificationItem[] = [];
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
  addNotification(item: NotificationItem) {
    if (notifications.some((n) => n.id === item.id)) return;
    notifications = [item, ...notifications];
    emitChange();
  },
  markAsRead(id: string) {
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    emitChange();
    markNotificationReadApi(id).catch(() => {});
  },
  markAllAsRead() {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    notifications = notifications.map((n) => ({ ...n, isRead: true }));
    emitChange();
    if (unreadIds.length > 0) {
      markNotificationReadApi(unreadIds).catch(() => {});
    }
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
    addNotification: notificationStore.addNotification,
    markAsRead: notificationStore.markAsRead,
    markAllAsRead: notificationStore.markAllAsRead,
    clearAll: notificationStore.clearAll,
  };
}
