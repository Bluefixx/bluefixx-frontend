import { apiClient } from "./client";
import { Review, CreateReviewRequest } from "@/types/customer";

/**
 * List completed customer bookings with pending or submitted reviews
 * GET /api/v1/reviews
 */
export async function getReviewsApi(params?: {
  cursor?: string;
  limit?: number;
}): Promise<Review[]> {
  return apiClient.get<Review[]>("/reviews", { params });
}

/**
 * Create or edit verified booking review within thirty days
 * POST /api/v1/bookings/{id}/review
 */
export async function submitReviewApi(
  bookingId: string,
  payload: CreateReviewRequest
): Promise<unknown> {
  return apiClient.post(`/bookings/${bookingId}/review`, payload);
}
