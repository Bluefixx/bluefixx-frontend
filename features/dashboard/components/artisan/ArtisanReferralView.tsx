"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getArtisanReferralsSummaryApi,
  getArtisanReferralsHistoryApi,
} from "@/lib/api/artisan";
import type { ReferralSummary, ReferralHistoryItem } from "@/types/artisan";
import { formatNaira } from "@/lib/utils/currency";

type ReferralFilter = "All" | "In progress" | "Reward earned" | "Not qualified";

interface ArtisanReferralViewProps {
  onBackToProfile: () => void;
}

type ReferralCategory = Exclude<ReferralFilter, "All">;

interface DisplayReferral {
  id: string;
  name: string;
  joinedDate: string;
  status: string;
  statusColor: string;
  amount: string;
  category: ReferralCategory;
}

function categorize(status?: string): ReferralCategory {
  const s = (status || "").toUpperCase();
  if (/(REWARD|QUALIF|PAID|ACTIVAT|COMPLET)/.test(s)) return "Reward earned";
  if (/(EXPIRE|REVOKE|DISQUALIF|REJECT|FAIL|NOT_QUALIF)/.test(s)) return "Not qualified";
  return "In progress";
}

function statusColor(category: ReferralCategory): string {
  switch (category) {
    case "Reward earned":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Not qualified":
      return "bg-neutral-100 text-neutral-500 border-neutral-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-100";
  }
}

function toDisplayReferral(item: ReferralHistoryItem): DisplayReferral {
  const category = categorize(item.status);
  return {
    id: item.id,
    name: item.inviteeName || "Invited artisan",
    joinedDate: item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "2-digit",
        })
      : "",
    status: item.status
      ? item.status.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
      : "In progress",
    statusColor: statusColor(category),
    amount: item.reward ? formatNaira(item.reward, true) : "No reward",
    category,
  };
}

export function ArtisanReferralView({ onBackToProfile }: ArtisanReferralViewProps) {
  const [activeFilter, setActiveFilter] = useState<ReferralFilter>("All");
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [referrals, setReferrals] = useState<DisplayReferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [summaryData, history] = await Promise.all([
          getArtisanReferralsSummaryApi().catch(() => null),
          getArtisanReferralsHistoryApi(undefined, 30).catch(() => null),
        ]);
        if (!mounted) return;
        if (summaryData) setSummary(summaryData);
        const items = history?.items ?? [];
        setReferrals(items.map(toDisplayReferral));
      } catch (err) {
        console.debug("Referrals API unavailable.", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const referralCode = summary?.code || "";
  const rewardLabel = summary?.rewardAmount ? formatNaira(summary.rewardAmount, true) : null;

  const handleCopyLink = () => {
    if (!referralCode) {
      toast.error("Your referral code is not available yet.");
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://bluefixx.com/signup?ref=${referralCode}`);
    }
    toast.success("Referral link copied to clipboard!");
  };

  const handleShareCode = () => {
    if (!referralCode) {
      toast.error("Your referral code is not available yet.");
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralCode);
    }
    toast.success("Referral code copied!");
  };

  const filteredReferrals = referrals.filter((r) => {
    if (activeFilter === "All") return true;
    return r.category === activeFilter;
  });

  const stats = [
    { label: "Earned", value: summary?.earnedTotal ? formatNaira(summary.earnedTotal, true) : "₦0" },
    { label: "Invited", value: String(summary?.invitedCount ?? 0) },
    { label: "Activated", value: String(summary?.qualifiedCount ?? 0) },
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Top Header */}
      <div>
        <button
          type="button"
          onClick={onBackToProfile}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Profile</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Invite &amp; earn
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
          Invite skilled artisans you trust to join BlueFixx
        </p>
      </div>

      {/* Hero Card */}
      <div className="bg-[#001B40] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-5 shadow-xs">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
            Refer an Artisan
          </span>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl text-white">
            {rewardLabel ? `Earn ${rewardLabel} when they complete their first job` : "Earn rewards when they complete their first job"}
          </h2>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-300 block">Your referral code</span>
              <span className="font-heading font-extrabold text-base tracking-widest text-white">
                {referralCode || "—"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleShareCode}
              className="px-6 py-2.5 rounded-xl bg-white text-[#001B40] hover:bg-neutral-100 font-sans font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
            >
              Share code
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-6 py-2.5 rounded-xl border border-white/30 text-white hover:bg-white/10 font-sans font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Copy link
            </button>
          </div>
        </div>
      </div>

      {/* Stat Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1"
          >
            <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115] block">
              {stat.value}
            </span>
            <span className="text-neutral-400 font-sans text-xs font-medium">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Referral Progress Explainer */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#0F1115]">
            How rewards work
          </h3>
          <span className="text-xs font-bold text-neutral-400">
            {summary?.qualifiedCount ?? 0}/{summary?.invitedCount ?? 0} activated
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 pt-2 text-center text-xs">
          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-full bg-[#001B40] text-white flex items-center justify-center font-bold text-xs mx-auto">
              1
            </div>
            <span className="font-medium text-neutral-700 block text-[11px]">Joined BlueFixx</span>
          </div>

          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-full bg-[#001B40] text-white flex items-center justify-center font-bold text-xs mx-auto">
              2
            </div>
            <span className="font-medium text-neutral-700 block text-[11px]">Completed verification</span>
          </div>

          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-full bg-[#001B40] text-white flex items-center justify-center font-bold text-xs mx-auto">
              3
            </div>
            <span className="font-medium text-neutral-700 block text-[11px]">Won first job</span>
          </div>

          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-full bg-[#001B40] text-white flex items-center justify-center font-bold text-xs mx-auto">
              4
            </div>
            <span className="font-medium text-neutral-700 block text-[11px]">Completed first job</span>
          </div>

          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mx-auto">
              ✓
            </div>
            <span className="font-bold text-emerald-800 block text-[11px]">
              Reward paid{rewardLabel ? ` (${rewardLabel})` : ""}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-neutral-400 leading-relaxed pt-2 border-t border-neutral-100">
          Rewards are paid promptly after the qualifying action is completed and the transaction settled. Canceled or reversed actions do not void the reward.
        </p>
      </div>

      {/* Referrals Feed with Filter Chips */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#0F1115]">
            Your referrals
          </h3>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {(["All", "In progress", "Reward earned", "Not qualified"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeFilter === filter
                    ? "bg-[#001B40] text-white shadow-2xs"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            <div className="h-32 bg-white rounded-3xl border border-neutral-200/80" />
            <div className="h-32 bg-white rounded-3xl border border-neutral-200/80" />
          </div>
        ) : filteredReferrals.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-neutral-200/80 shadow-2xs text-center space-y-2">
            <h4 className="font-heading font-bold text-sm text-[#0F1115]">
              No referrals yet
            </h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Share your referral code with artisans you trust. Their progress and your rewards will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReferrals.map((ref) => (
              <div
                key={ref.id}
                className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-extrabold text-sm sm:text-base text-[#0F1115]">
                      {ref.name}
                    </h4>
                    {ref.joinedDate && (
                      <p className="text-[11px] text-neutral-400">
                        Artisan · Joined {ref.joinedDate}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border ${ref.statusColor}`}
                  >
                    {ref.status}
                  </span>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">Reward</span>
                  <span className="font-heading font-extrabold text-sm text-[#001B40]">
                    {ref.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default ArtisanReferralView;
