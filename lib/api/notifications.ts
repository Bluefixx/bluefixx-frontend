import { apiClient } from "./client";
import { NotificationItem, NotificationPreferences } from "@/types/customer";

/**
 * List customer notifications
 */
export async function getNotificationsApi(): Promise<NotificationItem[]> {
  return apiClient.get<NotificationItem[]>("/notifications");
}

/**
 * Mark notification(s) as read
 */
export async function markNotificationReadApi(ids: string | string[]): Promise<{ count: number }> {
  const idsArray = Array.isArray(ids) ? ids : [ids];
  return apiClient.post<{ count: number }>("/notifications/read", { ids: idsArray });
}

/**
 * Get notifications summary
 */
export async function getNotificationsSummaryApi(): Promise<any> {
  return apiClient.get<any>("/notifications/summary");
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferencesApi(): Promise<NotificationPreferences> {
  return apiClient.get<NotificationPreferences>("/account/notification-preferences");
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferencesApi(
  payload: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  return apiClient.patch<NotificationPreferences>("/account/notification-preferences", payload);
}

/**
 * Mark a single notification as read by ID
 */
export async function markNotificationReadByIdApi(id: string): Promise<{ message?: string }> {
  return apiClient.post<{ message?: string }>(`/notifications/${id}/read`, {});
}
