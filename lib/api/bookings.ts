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
 * Artisan withdraws a proposed addition before customer decision
 */
export async function withdrawAdditionApi(additionId: string): Promise<unknown> {
  return apiClient.post(`/additions/${additionId}/withdraw`, {});
}

/**
 * Cancel an accepted but unfunded addition
 */
export async function cancelAdditionApi(additionId: string): Promise<unknown> {
  return apiClient.post(`/additions/${additionId}/cancel`, {});
}

/**
 * Customer confirms the funded booking visit window
 */
export async function confirmBookingScheduleVisitApi(bookingId: string): Promise<unknown> {
  return apiClient.post(`/bookings/${bookingId}/schedule/confirm`, {});
}

/**
 * Create payment/work milestones for a booking
 */
export async function createBookingMilestonesApi(
  bookingId: string,
  milestones: Array<{ title: string; amount: number; dueAt?: string }>
): Promise<unknown> {
  return apiClient.post(`/bookings/${bookingId}/milestones`, { milestones });
}

/**
 * Update a booking milestone status or details
 */
export async function updateBookingMilestoneApi(
  milestoneId: string,
  payload: { status?: string; title?: string }
): Promise<unknown> {
  return apiClient.patch(`/milestones/${milestoneId}`, payload);
}

export interface LiveLocationPoint {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  heading: number | null;
  speedMps: number | null;
  capturedAt: string;
  updatedAt: string;
}

export interface BookingTrackingSnapshot {
  bookingId: string;
  status: string;
  trackingActive: boolean;
  artisan: LiveLocationPoint | null;
  customer: LiveLocationPoint | null;
  destination: {
    latitude: number;
    longitude: number;
    accuracyMeters: number | null;
    source: "LIVE_GPS" | "BOOKING_ADDRESS";
    label: string | null;
    address: string | null;
    instructions: string | null;
  } | null;
  distanceKm: number | null;
  etaMinutes: number | null;
  encodedPolyline: string | null;
  etaSource: "GOOGLE_ROUTES" | "HAVERSINE" | null;
  navigationUrl: string | null;
}

export async function getBookingTrackingApi(bookingId: string): Promise<BookingTrackingSnapshot> {
  return apiClient.get<BookingTrackingSnapshot>(`/bookings/${bookingId}/tracking`);
}

export async function updateBookingLocationApi(
  bookingId: string,
  payload: {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    source?: "GPS" | "MAP_PIN";
    heading?: number;
    speedMps?: number;
    capturedAt: string;
  }
): Promise<BookingTrackingSnapshot> {
  return apiClient.post<BookingTrackingSnapshot>(`/bookings/${bookingId}/tracking/location`, payload);
}

export async function advanceBookingStatusApi(
  bookingId: string,
  status: "ON_THE_WAY" | "ARRIVED" | "IN_PROGRESS"
): Promise<{ status: string }> {
  return apiClient.post<{ status: string }>(`/bookings/${bookingId}/status`, { status });
}
