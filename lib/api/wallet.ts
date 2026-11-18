import { apiClient } from "./client";
import { WalletSummary, WalletTransaction } from "@/types/customer";

/**
 * Get wallet balances and withdrawal limits
 */
export async function getWalletApi(): Promise<WalletSummary> {
  return apiClient.get<WalletSummary>("/wallet");
}

/**
 * Paginated payment, deposit, refund, or withdrawal history
 */
export async function getWalletTransactionsApi(params?: {
  cursor?: string;
  limit?: number;
  category?: "all" | "payments" | "deposits" | "refunds" | "withdrawals";
}): Promise<WalletTransaction[]> {
  return apiClient.get<WalletTransaction[]>("/wallet/transactions", { params });
}

/**
 * Unified wallet activity with payment details, refunds, and withdrawals
 */
export async function getWalletActivityApi(params?: {
  cursor?: string;
  limit?: number;
  category?: "all" | "payments" | "deposits" | "funding" | "refunds" | "withdrawals";
}): Promise<unknown> {
  return apiClient.get("/wallet/activity", { params });
}

/**
 * Initialize payment or funding
 */
export async function createPaymentApi(
  payload: {
    purpose?: "TOPUP" | "BOOKING" | "TRAINING";
    amount?: number; // in kobo
    bookingId?: string;
    additionId?: string;
    trainingEnrollmentId?: string;
    source?: "WALLET" | "PAYSTACK";
    pin?: string;
  },
  idempotencyKey?: string
): Promise<{
  id: string;
  status?: string;
  checkoutUrl?: string;
  authorizationUrl?: string;
  reference: string;
}> {
  const key =
    idempotencyKey ||
    (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `pay_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
  return apiClient.post("/payments", payload, {
    headers: { "Idempotency-Key": key },
  });
}

/**
 * Get payment status by ID
 */
export async function getPaymentStatusApi(id: string): Promise<{
  id: string;
  status: string;
  reference?: string;
  amount?: string;
  source?: string;
  checkoutUrl?: string;
}> {
  return apiClient.get(`/payments/${id}`);
}

/**
 * Verify Paystack payment
 */
export async function verifyPaymentApi(id: string): Promise<{ status: string }> {
  return apiClient.post(`/payments/${id}/verify`, {});
}

/**
 * Request a replacement payment when initialization was interrupted or verification failed
 */
export async function retryPaymentApi(
  id: string,
  idempotencyKey?: string
): Promise<{
  id: string;
  reference: string;
  status: string;
  checkoutUrl?: string;
}> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  return apiClient.post(`/payments/${id}/retry`, {}, { headers });
}

/**
 * Download payment receipt PDF
 */
export async function downloadPaymentReceiptApi(id: string): Promise<Blob> {
  return apiClient.get(`/payments/${id}/receipt`, {
    responseType: "blob",
  });
}

/**
 * Request wallet withdrawal
 */
export async function requestWithdrawalApi(
  payload: {
    bankId: string;
    amount: number; // in kobo
    pin: string;
  },
  idempotencyKey?: string
): Promise<{ id: string; status: string; reference?: string }> {
  const key =
    idempotencyKey ||
    (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `wth_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
  return apiClient.post("/wallet/withdrawals", payload, {
    headers: { "Idempotency-Key": key },
  });
}

/**
 * List the user's wallet withdrawal requests
 */
export async function getWithdrawalsApi(params?: {
  cursor?: string;
  limit?: number;
}): Promise<
  Array<{
    id: string;
    amount: string;
    kind: string;
    status: string;
    reference: string;
  }>
> {
  return apiClient.get("/wallet/withdrawals", { params });
}

/**
 * Get a single withdrawal request by ID
 */
export async function getWithdrawalByIdApi(id: string): Promise<{
  id: string;
  userId: string;
  bankId: string;
  reference: string;
  amount: string;
  kind: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  bank?: { bankCode: string; last4: string; accountName: string };
}> {
  return apiClient.get(`/wallet/withdrawals/${id}`);
}

/**
 * Cancel a pending withdrawal request
 */
export async function cancelWithdrawalApi(
  id: string,
  reason: string
): Promise<{ message?: string }> {
  return apiClient.post(`/wallet/withdrawals/${id}/cancel`, { reason });
}
