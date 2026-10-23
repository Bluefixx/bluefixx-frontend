import { apiClient } from "./client";
import { NotificationItem, NotificationPreferences } from "@/types/customer";

/**
 * List customer notifications
 * GET /api/v1/notifications
 */
export async function getNotificationsApi(): Promise<NotificationItem[]> {
  return apiClient.get<NotificationItem[]>("/notifications");
}

/**
 * Mark notification as read
 * POST /api/v1/notifications/{id}/read
 */
export async function markNotificationReadApi(id: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(`/notifications/${id}/read`, {});
}

/**
 * Get notification preferences
 * GET /api/v1/account/notification-preferences
 */
export async function getNotificationPreferencesApi(): Promise<NotificationPreferences> {
  return apiClient.get<NotificationPreferences>("/account/notification-preferences");
}

/**
 * Update notification preferences
 * PATCH /api/v1/account/notification-preferences
 */
export async function updateNotificationPreferencesApi(
  payload: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  return apiClient.patch<NotificationPreferences>("/account/notification-preferences", payload);
}
