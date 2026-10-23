import { apiClient } from "./client";
import { WalletSummary, WalletTransaction } from "@/types/customer";

/**
 * Get wallet balances and withdrawal limits
 * GET /api/v1/wallet
 */
export async function getWalletApi(): Promise<WalletSummary> {
  return apiClient.get<WalletSummary>("/wallet");
}

/**
 * Paginated payment, deposit, refund, or withdrawal history
 * GET /api/v1/wallet/transactions
 */
export async function getWalletTransactionsApi(params?: {
  cursor?: string;
  limit?: number;
  category?: "all" | "payments" | "deposits" | "refunds" | "withdrawals";
}): Promise<WalletTransaction[]> {
  return apiClient.get<WalletTransaction[]>("/wallet/transactions", { params });
}

/**
 * Initialize payment or funding
 * POST /api/v1/payments
 */
export async function createPaymentApi(payload: {
  amount: number; // in kobo
  bookingId?: string;
  additionId?: string;
  source?: "WALLET" | "PAYSTACK";
}): Promise<{ id: string; authorizationUrl?: string; reference: string }> {
  return apiClient.post("/payments", payload);
}

/**
 * Verify Paystack payment
 * POST /api/v1/payments/{id}/verify
 */
export async function verifyPaymentApi(id: string): Promise<{ status: string }> {
  return apiClient.post(`/payments/${id}/verify`, {});
}

/**
 * Request wallet withdrawal
 * POST /api/v1/wallet/withdrawals
 */
export async function requestWithdrawalApi(payload: {
  amount: number; // in kobo
  bankAccountId: string;
}): Promise<{ id: string; status: string }> {
  return apiClient.post("/wallet/withdrawals", payload);
}
