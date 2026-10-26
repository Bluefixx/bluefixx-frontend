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
 * Initialize payment or funding
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
 */
export async function verifyPaymentApi(id: string): Promise<{ status: string }> {
  return apiClient.post(`/payments/${id}/verify`, {});
}

/**
 * Request wallet withdrawal
 */
export async function requestWithdrawalApi(payload: {
  amount: number; // in kobo
  bankAccountId: string;
}): Promise<{ id: string; status: string }> {
  return apiClient.post("/wallet/withdrawals", payload);
}
