import { apiClient } from "./client";
import { ReferralSummary } from "@/types/customer";

/**
 * Get the user's referral link, code, statistics and rewards summary
 */
export async function getReferralSummaryApi(): Promise<ReferralSummary> {
  return apiClient.get<ReferralSummary>("/account/referrals");
}

/**
 * Get private referral progress and reward history
 */
export async function getReferralHistoryApi(params?: {
  cursor?: string;
  limit?: number;
}): Promise<unknown[]> {
  return apiClient.get<unknown[]>("/account/referrals/history", { params });
}

/**
 * Claim pending referral rewards into user's wallet
 */
export async function claimReferralRewardApi(payload?: {
  code?: string;
  purpose?: "BOOKING" | "TRAINING";
}): Promise<{
  claimedKobo?: number;
  message?: string;
}> {
  return apiClient.post<{ claimedKobo?: number; message?: string }>(
    "/account/referrals/claim",
    payload || {}
  );
}
