import { apiClient } from "./client";
import { CreateQuoteRequest, QuoteResponse, QuoteOffer, Booking } from "@/types/customer";

/**
 * List quotes (outgoing for customer, incoming for artisan)
 * GET /api/v1/quotes
 */
export async function getQuotesApi(params?: {
  cursor?: string;
  limit?: number;
  view?: "customer" | "artisan";
  status?: string;
}): Promise<QuoteResponse[]> {
  return apiClient.get<QuoteResponse[]>("/quotes", { params });
}

/**
 * Get quote details and offer versions
 * GET /api/v1/quotes/{id}
 */
export async function getQuoteByIdApi(id: string): Promise<QuoteResponse> {
  return apiClient.get<QuoteResponse>(`/quotes/${id}`);
}

/**
 * Create draft or submit private quote request
 * POST /api/v1/quotes
 */
export async function createQuoteApi(payload: CreateQuoteRequest): Promise<QuoteResponse> {
  return apiClient.post<QuoteResponse>("/quotes", payload);
}

/**
 * Edit and optionally submit an owned draft
 * PATCH /api/v1/quotes/{id}
 */
export async function editQuoteDraftApi(
  id: string,
  payload: Partial<CreateQuoteRequest>
): Promise<QuoteResponse> {
  return apiClient.patch<QuoteResponse>(`/quotes/${id}`, payload);
}

/**
 * Acknowledge, decline, or close a quote request
 * POST /api/v1/quotes/{id}/respond
 */
export async function respondQuoteApi(
  id: string,
  payload: { action: "ACKNOWLEDGE" | "DECLINE" | "CLOSE"; reason?: string }
): Promise<{ status: string }> {
  return apiClient.post<{ status: string }>(`/quotes/${id}/respond`, payload);
}

/**
 * Send offer or structured counter-offer
 * POST /api/v1/quotes/{id}/offers
 */
export async function createOfferApi(
  quoteId: string,
  payload: Partial<QuoteOffer>
): Promise<QuoteOffer> {
  return apiClient.post<QuoteOffer>(`/quotes/${quoteId}/offers`, payload);
}

/**
 * Accept opposite participant offer and reserve visit
 * POST /api/v1/offers/{id}/accept
 */
export async function acceptOfferApi(offerId: string, idempotencyKey?: string): Promise<Booking> {
  return apiClient.post<Booking>(
    `/offers/${offerId}/accept`,
    {},
    idempotencyKey
      ? {
          headers: {
            "Idempotency-Key": idempotencyKey,
          },
        }
      : undefined
  );
}
