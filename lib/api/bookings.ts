import { apiClient } from "./client";
import { Booking, BookingDetail } from "@/types/customer";

/**
 * List active, completed, or cancelled bookings
 */
export async function getBookingsApi(params?: {
  cursor?: string;
  limit?: number;
  view?: "customer" | "artisan";
  tab?: "active" | "completed" | "cancelled";
}): Promise<Booking[]> {
  return apiClient.get<Booking[]>("/bookings", { params });
}

/**
 * Get booking details, agreed terms and timeline
 */
export async function getBookingByIdApi(id: string): Promise<BookingDetail> {
  return apiClient.get<BookingDetail>(`/bookings/${id}`);
}

/**
 * Customer confirms completion and authorizes release
 */
export async function confirmBookingApi(
  id: string,
  idempotencyKey?: string
): Promise<{ status: "COMPLETED" }> {
  return apiClient.post<{ status: "COMPLETED" }>(
    `/bookings/${id}/confirm`,
    {},
    idempotencyKey ? { headers: { "Idempotency-Key": idempotencyKey } } : undefined
  );
}

/**
 * Cancel booking according to actor and travel stage
 */
export async function cancelBookingApi(
  id: string,
  reason: string
): Promise<{ status: "CANCELLED" }> {
  return apiClient.post<{ status: "CANCELLED" }>(`/bookings/${id}/cancel`, { reason });
}

/**
 * Propose a mutually agreed reschedule before travel
 */
export async function proposeRescheduleApi(
  id: string,
  payload: { visitStart: string; visitEnd: string }
): Promise<unknown> {
  return apiClient.post(`/bookings/${id}/schedule`, payload);
}

/**
 * Accept or decline a schedule proposal
 */
export async function decideScheduleProposalApi(
  scheduleId: string,
  accept: boolean
): Promise<unknown> {
  return apiClient.post(`/schedules/${scheduleId}/decision`, { accept });
}

/**
 * Customer accepts or declines additional work
 */
export async function decideAdditionApi(additionId: string, accept: boolean): Promise<unknown> {
  return apiClient.post(`/additions/${additionId}/decision`, { accept });
}

/**
 * Customer confirms the funded booking visit window
 */
export async function confirmBookingScheduleVisitApi(bookingId: string): Promise<unknown> {
  return apiClient.post(`/bookings/${bookingId}/schedule/confirm`, {});
}
