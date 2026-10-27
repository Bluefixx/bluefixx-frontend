import { apiClient } from "./client";
import { ReferralSummary } from "@/types/customer";

/**
 * Get the user's referral link, code, statistics and rewards history
 */
export async function getReferralSummaryApi(): Promise<ReferralSummary> {
  return apiClient.get<ReferralSummary>("/account/referrals");
}

/**
 * Claim pending referral rewards into user's wallet
 */
export async function claimReferralRewardApi(): Promise<{
  claimedKobo: number;
  message: string;
}> {
  return apiClient.post<{ claimedKobo: number; message: string }>(
    "/account/referrals/claim",
    {}
  );
}
