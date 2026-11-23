"use client";

import React, { useState, useMemo } from "react";
import { formatNaira } from "@/lib/utils/currency";
import { MOCK_ADMIN_REFERRALS, INITIAL_FRAUD_RULES } from "../mockPlatformData";
import { AdminReferralItem, ReferralFraudRules } from "../types";
import { OpsPayReferralModal } from "./OpsPayReferralModal";
import { OpsInvestigateReferralModal } from "./OpsInvestigateReferralModal";
import { OpsFraudRulesModal } from "./OpsFraudRulesModal";
import { OpsSecurityPinModal } from "./OpsSecurityPinModal";

export function OpsReferralsView() {
  const [referrals, setReferrals] = useState<AdminReferralItem[]>(MOCK_ADMIN_REFERRALS);
  const [fraudRules, setFraudRules] = useState<ReferralFraudRules>(INITIAL_FRAUD_RULES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [payoutFilter, setPayoutFilter] = useState("ALL");

  // Modals state
  const [selectedReferralForPay, setSelectedReferralForPay] = useState<AdminReferralItem | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const [selectedReferralForInvestigate, setSelectedReferralForInvestigate] = useState<AdminReferralItem | null>(null);
  const [isInvestigateOpen, setIsInvestigateOpen] = useState(false);

  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  // Batch Pay & PIN State
  const [isBatchPinOpen, setIsBatchPinOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Metrics
  const totalCount = referrals.length;
  const completedCount = referrals.filter((r) => r.conversionStatus === "Converted").length;
  const conversionRate = Math.round((completedCount / totalCount) * 100);
  const totalPaidKobo = referrals
    .filter((r) => r.payoutStatus === "Paid")
    .reduce((acc, r) => acc + r.rewardKobo, 0);
  const totalPendingKobo = referrals
    .filter((r) => r.payoutStatus === "Pending")
    .reduce((acc, r) => acc + r.rewardKobo, 0);

  // Filtered referrals
  const filteredReferrals = useMemo(() => {
    return referrals.filter((r) => {
      if (statusFilter !== "ALL" && r.conversionStatus !== statusFilter) return false;
      if (payoutFilter !== "ALL" && r.payoutStatus !== payoutFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchReferrer = r.referrerName.toLowerCase().includes(q);
        const matchReferred = r.referredName.toLowerCase().includes(q);
        const matchActivity = r.relatedActivity.toLowerCase().includes(q);
        if (!matchReferrer && !matchReferred && !matchActivity) return false;
      }
      return true;
    });
  }, [referrals, statusFilter, payoutFilter, searchQuery]);

  // Handle Pay Single Referral
  const handleConfirmPay = (referralId: string) => {
    setReferrals((prev) =>
      prev.map((r) => (r.id === referralId ? { ...r, payoutStatus: "Paid" } : r))
    );
    setToastMessage("Referral bonus paid to referrer wallet successfully.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Investigate & Hold
  const handleConfirmHold = (referralId: string, reason: string) => {
    setReferrals((prev) =>
      prev.map((r) =>
        r.id === referralId
          ? {
              ...r,
              conversionStatus: "Suspended",
              payoutStatus: "Withheld",
              fraudFlagReason: reason,
            }
          : r
      )
    );
    setToastMessage("Referral reward held and flagged for compliance investigation.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Batch Payout after PIN
  const handleBatchPaySuccess = () => {
    setIsBatchPinOpen(false);
    const pendingEligible = referrals.filter(
      (r) => r.payoutStatus === "Pending" && r.conversionStatus === "Converted"
    );
    setReferrals((prev) =>
      prev.map((r) =>
        r.payoutStatus === "Pending" && r.conversionStatus === "Converted"
          ? { ...r, payoutStatus: "Paid" }
          : r
      )
    );
    setToastMessage(`Batch approved ${pendingEligible.length} verified referrals (${formatNaira(totalPendingKobo, true)}).`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-neutral-400 mb-1">Growth & content</div>
          <h1 className="text-2xl font-extrabold text-[#001B40] tracking-tight">Referrals</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-neutral-500">
              Growth engine with anti-fraud safeguards. Rewards only pay out on genuine marketplace activity.
            </p>
            <button
              type="button"
              onClick={() => setIsHowItWorksOpen(true)}
              className="text-xs font-bold text-[#074292] hover:underline cursor-pointer shrink-0"
            >
              How it works &gt;
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsRulesModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <span>⚙️ Velocity Rules</span>
          </button>

          <button
            type="button"
            disabled={totalPendingKobo === 0}
            onClick={() => setIsBatchPinOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#001B40] text-white text-xs font-bold hover:bg-[#074292] disabled:opacity-50 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>Batch Pay Verified ({formatNaira(totalPendingKobo, true)})</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 5 KPI Summary Cards Matching Figma */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400">Total referrals</span>
          <div className="text-2xl font-extrabold text-[#001B40]">{totalCount}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400">Completed</span>
          <div className="text-2xl font-extrabold text-emerald-600">{completedCount}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400">Conversion rate</span>
          <div className="text-2xl font-extrabold text-[#001B40]">{conversionRate}%</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400">Total bonus paid</span>
          <div className="text-2xl font-extrabold text-[#001B40]">{formatNaira(totalPaidKobo, true)}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400">Pending payouts</span>
          <div className="text-2xl font-extrabold text-amber-600">{formatNaira(totalPendingKobo, true)}</div>
        </div>
      </div>

      {/* Fraud Alert Banner Matching Figma Screenshot */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <span className="text-amber-800 text-base leading-none mt-0.5">⚠</span>
          <div>
            <h3 className="font-extrabold text-amber-950 text-xs">
              Suspected self-referral ring
            </h3>
            <p className="text-amber-900 text-[11px] mt-0.5">
              An artisan has 5 accounts linked on the same device within 14 hours. Referral rewards is withheld pending review.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const flagged = referrals.find((r) => r.id === "REF-004");
            if (flagged) {
              setSelectedReferralForInvestigate(flagged);
              setIsInvestigateOpen(true);
            }
          }}
          className="px-3.5 py-1.5 rounded-xl bg-amber-900 text-white font-bold text-[11px] hover:bg-amber-950 shrink-0 cursor-pointer self-start sm:self-auto"
        >
          Review Flagged Ring
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex-1 flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Referrer or referred user..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#001B40]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-700 focus:outline-none focus:border-[#001B40]"
          >
            <option value="ALL">Status: All</option>
            <option value="Converted">Converted</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>

          <select
            value={payoutFilter}
            onChange={(e) => setPayoutFilter(e.target.value)}
            className="p-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-700 focus:outline-none focus:border-[#001B40]"
          >
            <option value="ALL">Payout: All</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Withheld">Withheld</option>
          </select>

          {(searchQuery || statusFilter !== "ALL" || payoutFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setPayoutFilter("ALL");
              }}
              className="text-xs text-red-600 hover:underline px-2 font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Referrer or referred user</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reward</th>
                <th className="py-3 px-4">Payout</th>
                <th className="py-3 px-4">Related activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredReferrals.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50/60 transition-colors">
                  {/* Referrer & Referred */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div>
                      <span className="font-bold text-neutral-900 block">{r.referrerName}</span>
                      <span className="text-[11px] text-neutral-500 block">
                        invited <strong className="text-neutral-700">{r.referredName}</strong>
                      </span>
                    </div>
                  </td>

                  {/* Type Pill */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        r.referrerRole === "Worker"
                          ? "bg-blue-100 text-blue-800"
                          : r.referrerRole === "Customer"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-teal-100 text-teal-800"
                      }`}
                    >
                      {r.referrerRole}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                    {r.date}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.conversionStatus === "Converted"
                          ? "bg-emerald-100 text-emerald-800"
                          : r.conversionStatus === "Pending"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      ● {r.conversionStatus}
                    </span>
                  </td>

                  {/* Reward Amount & Tier Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-neutral-900">
                        {formatNaira(r.rewardKobo, true)}
                      </span>
                      {r.tierBadge?.includes("Priority") && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          Priority Trade
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Payout Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.payoutStatus === "Paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : r.payoutStatus === "Pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      ● {r.payoutStatus}
                    </span>
                  </td>

                  {/* Related Activity */}
                  <td className="py-3.5 px-4 text-neutral-700 whitespace-nowrap">
                    <span>{r.relatedActivity}</span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      {r.payoutStatus === "Pending" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReferralForPay(r);
                            setIsPayModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#001B40] text-white font-bold hover:bg-[#074292] text-[11px] cursor-pointer"
                        >
                          Pay reward
                        </button>
                      )}

                      {r.payoutStatus === "Withheld" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReferralForInvestigate(r);
                            setIsInvestigateOpen(true);
                          }}
                          className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                        >
                          Investigate
                        </button>
                      )}

                      {r.payoutStatus === "Paid" && (
                        <span className="text-neutral-400 text-xs font-semibold">
                          Settled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span>1–{filteredReferrals.length} of {filteredReferrals.length} entries</span>
          <div className="flex items-center gap-1.5">
            <button type="button" disabled className="px-2 py-1 rounded border border-neutral-200 text-neutral-300">
              &lt; Prev
            </button>
            <span className="font-semibold text-neutral-700">Page 1</span>
            <button type="button" disabled className="px-2 py-1 rounded border border-neutral-200 text-neutral-300">
              Next &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <OpsPayReferralModal
        referral={selectedReferralForPay}
        isOpen={isPayModalOpen}
        onClose={() => {
          setIsPayModalOpen(false);
          setSelectedReferralForPay(null);
        }}
        onConfirmPay={handleConfirmPay}
      />

      <OpsInvestigateReferralModal
        referral={selectedReferralForInvestigate}
        isOpen={isInvestigateOpen}
        onClose={() => {
          setIsInvestigateOpen(false);
          setSelectedReferralForInvestigate(null);
        }}
        onConfirmHold={handleConfirmHold}
      />

      <OpsFraudRulesModal
        rules={fraudRules}
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        onSave={(newRules) => {
          setFraudRules(newRules);
          setToastMessage("Anti-fraud velocity limits updated successfully.");
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* Batch Pay Authorization PIN Modal */}
      <OpsSecurityPinModal
        isOpen={isBatchPinOpen}
        onClose={() => setIsBatchPinOpen(false)}
        onSuccess={handleBatchPaySuccess}
        title="Authorize Batch Referral Payout"
        description={`Confirm release of ${formatNaira(totalPendingKobo, true)} across all verified pending referral bonuses.`}
      />

      {/* How it Works Modal */}
      {isHowItWorksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-extrabold text-[#001B40]">
                How Bluefixx Referral Rewards Work
              </h3>
              <button
                type="button"
                onClick={() => setIsHowItWorksOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-neutral-600 leading-relaxed">
              <p>
                <strong>1. Transparent Multi-Role Eligibility:</strong> Customers, Artisans, and Talents receive custom referral invitation links from their respective dashboards.
              </p>
              <p>
                <strong>2. Genuine Activity Trigger:</strong> Rewards are only unlocked when the referred user completes verified platform actions (e.g., Artisan completes 1st job; Customer posts 2+ paid jobs; Talent enrolls with tuition paid).
              </p>
              <p>
                <strong>3. Priority Trade Incentives:</strong> High-demand trades (Solar installation, high-voltage electrical, specialized mechanics) earn elevated bonuses (₦3,000) to incentivize supply in critical trades.
              </p>
              <p>
                <strong>4. Anti-Fraud Device Intelligence:</strong> Automated hardware fingerprinting checks for multi-account loops on identical devices or localized proxy clusters.
              </p>
            </div>
            <div className="flex justify-end pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsHowItWorksOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#001B40] text-white font-bold hover:bg-[#074292] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
