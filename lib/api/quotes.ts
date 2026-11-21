import { apiClient } from "./client";
import { CreateQuoteRequest, QuoteResponse, QuoteOffer, Booking } from "@/types/customer";

/**
 * List quotes (outgoing for customer, incoming for artisan)
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
 */
export async function getQuoteByIdApi(id: string): Promise<QuoteResponse> {
  return apiClient.get<QuoteResponse>(`/quotes/${id}`);
}

/**
 * Create draft or submit private quote request
 */
export async function createQuoteApi(payload: CreateQuoteRequest): Promise<QuoteResponse> {
  return apiClient.post<QuoteResponse>("/quotes", payload);
}

/**
 * Edit and optionally submit an owned draft
 */
export async function editQuoteDraftApi(
  id: string,
  payload: Partial<CreateQuoteRequest>
): Promise<QuoteResponse> {
  return apiClient.patch<QuoteResponse>(`/quotes/${id}`, payload);
}

/**
 * Acknowledge, decline, or close a quote request
 */
export async function respondQuoteApi(
  id: string,
  payload: { action: "ACKNOWLEDGE" | "DECLINE" | "CLOSE"; reason?: string }
): Promise<{ status: string }> {
  return apiClient.post<{ status: string }>(`/quotes/${id}/respond`, payload);
}

/**
 * Send offer or structured counter-offer
 */
export async function createOfferApi(
  quoteId: string,
  payload: Partial<QuoteOffer>
): Promise<QuoteOffer> {
  return apiClient.post<QuoteOffer>(`/quotes/${quoteId}/offers`, payload);
}

/**
 * Accept opposite participant offer and reserve visit
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

export interface NegotiationOfferSnapshot {
  id: string;
  version: number;
  authorRole: "CUSTOMER" | "ARTISAN";
  base: string;
  fee: string;
  artisanEarnings: string;
  customerTotal: string;
  expiresAt: string;
  status: string;
  budgetPosition?: "BELOW" | "WITHIN" | "ABOVE" | null;
}

export interface NegotiationState {
  quoteId: string;
  status: string;
  enabled: boolean;
  turn: "CUSTOMER" | "ARTISAN" | null;
  round: number;
  maxRounds: number;
  liveMinutes: number;
  offer: NegotiationOfferSnapshot | null;
  history: Array<{
    version: number;
    authorRole: "CUSTOMER" | "ARTISAN";
    base: string;
    customerTotal: string;
    status: string;
    createdAt: string;
    budgetPosition?: "BELOW" | "WITHIN" | "ABOVE" | null;
  }>;
  budget?: { minimum: string | null; maximum: string | null } | null;
  serverTime: string;
  bookingId?: string | null;
}

/**
 * Fetch current live price negotiation state for a quote
 */
export async function getQuoteNegotiationApi(quoteId: string): Promise<NegotiationState> {
  return apiClient.get<NegotiationState>(`/quotes/${quoteId}/negotiation`);
}

/**
 * Submit a price-only counter-offer in an active quote negotiation
 */
export async function counterOfferApi(
  quoteId: string,
  priceKobo: number,
  idempotencyKey?: string
): Promise<NegotiationState> {
  return apiClient.post<NegotiationState>(
    `/quotes/${quoteId}/counter`,
    { price: priceKobo },
    idempotencyKey ? { headers: { "Idempotency-Key": idempotencyKey } } : undefined
  );
}
