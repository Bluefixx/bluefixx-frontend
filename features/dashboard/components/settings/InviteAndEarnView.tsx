"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getReferralSummaryApi, claimReferralRewardApi } from "@/lib/api";

interface InviteAndEarnViewProps {
  onBack: () => void;
}

interface ReferralRecord {
  id: string;
  friendName: string;
  joinedDate: string;
  progressSummary: string;
  progressDetail: string;
  reward: string;
  status: "Reward earned" | "In progress" | "Reward pending" | "Invited" | "Expired" | "Blocked";
  statusColor: string;
}

export function InviteAndEarnView({ onBack }: InviteAndEarnViewProps) {
  const [activeFilter, setActiveFilter] = useState<"All" | "In progress" | "Reward earned" | "Not qualified">("All");
  const [referralCode, setReferralCode] = useState("");
  const [referralUrl, setReferralUrl] = useState("");
  const [earnedKobo, setEarnedKobo] = useState(0);
  const [pendingKobo, setPendingKobo] = useState(0);
  const [invitedCount, setInvitedCount] = useState(0);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  async function loadReferralData() {
    setIsLoading(true);
    try {
      const data = await getReferralSummaryApi();
      if (data) {
        if (data.referralCode) setReferralCode(data.referralCode);
        if (data.referralLink) setReferralUrl(data.referralLink);
        setEarnedKobo(data.totalEarnedKobo || 0);
        setPendingKobo(data.pendingRewardKobo || 0);
        setInvitedCount(data.totalInvited || 0);

        if (Array.isArray(data.history) && data.history.length > 0) {
          const mapped: ReferralRecord[] = data.history.map((h) => ({
            id: h.id,
            friendName: h.refereeName || "Friend",
            joinedDate: `Joined ${new Date(h.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}`,
            progressSummary:
              h.status === "CLAIMED"
                ? "Reward claimed"
                : h.status === "COMPLETED"
                ? "Ready to claim"
                : "In progress",
            progressDetail:
              h.status === "CLAIMED"
                ? "Referral completed and paid into your wallet."
                : h.status === "COMPLETED"
                ? "Qualifying job completed. Claim reward to wallet."
                : "Friend joined. Reward unlocks upon their first completed job.",
            reward: `₦${((h.rewardKobo || 200000) / 100).toLocaleString()}`,
            status:
              h.status === "CLAIMED"
                ? "Reward earned"
                : h.status === "COMPLETED"
                ? "Reward pending"
                : "In progress",
            statusColor:
              h.status === "CLAIMED"
                ? "bg-emerald-50 text-emerald-700"
                : h.status === "COMPLETED"
                ? "bg-amber-50 text-amber-700"
                : "bg-blue-50 text-blue-700",
          }));
          setReferrals(mapped);
        } else {
          setReferrals([]);
        }
      }
    } catch {
      setReferrals([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReferralData();
  }, []);

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied to clipboard!");
  };

  const handleCopyLink = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    toast.success("Referral link copied to clipboard!");
  };

  const handleShareInvite = () => {
    if (!referralCode && !referralUrl) return;
    if (navigator.share) {
      navigator.share({
        title: "Join me on BlueFixx",
        text: `Use my invite code ${referralCode} to get ₦2,000 off your first artisan repair on Bluefixx!`,
        url: referralUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      const res = await claimReferralRewardApi();
      toast.success(res.message || "Referral reward claimed into your wallet!");
      await loadReferralData();
    } catch {
      toast.error("Failed to claim referral reward. Please try again.");
    } finally {
      setIsClaiming(false);
    }
  };

  const filteredReferrals = referrals.filter((r) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "In progress") return r.status === "In progress" || r.status === "Reward pending" || r.status === "Invited";
    if (activeFilter === "Reward earned") return r.status === "Reward earned";
    if (activeFilter === "Not qualified") return r.status === "Expired" || r.status === "Blocked";
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Settings</span>
        </button>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Invite &amp; earn
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
          Share Bluefixx with friends who need a reliable artisan.
        </p>
      </div>

      {/* Top Section: Navy Hero Card & 4 Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Navy Referral Card */}
        <div className="lg:col-span-7 bg-[#001B40] text-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs space-y-5">
          <div className="space-y-1">
            <span className="text-xs text-blue-200/80 uppercase font-bold tracking-wider">
              Refer a friend
            </span>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
              Give ₦2,000, get ₦2,000 when they book
            </h2>
          </div>

          {/* Referral Code Box */}
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-blue-200/80 block uppercase tracking-wider">
                Your referral code
              </span>
              <span className="font-mono font-black text-lg tracking-wider text-white">
                {referralCode}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Copy referral code"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleShareInvite}
              className="flex-1 py-3 bg-white hover:bg-neutral-100 text-[#001B40] font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm cursor-pointer"
            >
              Share invite
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 py-3 bg-transparent hover:bg-white/10 text-white border border-white/30 font-semibold text-xs sm:text-sm rounded-xl text-center transition-colors cursor-pointer"
            >
              Copy link
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
            <span className="font-heading font-black text-2xl sm:text-3xl text-[#001B40]">
              ₦{(earnedKobo / 100).toLocaleString()}
            </span>
            <span className="text-xs text-neutral-400 font-medium">Earned</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
            <span className="font-heading font-black text-2xl sm:text-3xl text-[#001B40]">
              ₦{(pendingKobo / 100).toLocaleString()}
            </span>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs text-neutral-400 font-medium">Pending</span>
              {pendingKobo > 0 && (
                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-0.5 rounded cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isClaiming ? "..." : "Claim"}
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
            <span className="font-heading font-black text-2xl sm:text-3xl text-[#001B40]">
              {invitedCount}
            </span>
            <span className="text-xs text-neutral-400 font-medium">Invited</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
            <span className="font-heading font-black text-2xl sm:text-3xl text-[#001B40]">
              {referrals.filter((r) => r.status === "Reward earned").length}
            </span>
            <span className="text-xs text-neutral-400 font-medium">Activated</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Progress Card & Double Referral Week */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Referral Progress */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Referral progress
            </h3>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
              ₦2,000 per qualifying referral
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
              <span>3/7 Activated</span>
              <span>43%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-neutral-100 overflow-hidden">
              <div className="h-full bg-[#001B40] rounded-full w-[43%]" />
            </div>
          </div>

          {/* Stepper info */}
          <div className="pt-2 text-xs text-neutral-600 space-y-1">
            <p className="font-medium">
              <span className="text-neutral-400">Customer:</span> Joined Bluefixx → Posted first job → Booked an artisan → Confirmed the job
            </p>
          </div>

          {/* Explanatory callout */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/60 text-xs text-neutral-500 space-y-1">
            <span className="font-bold text-[#001B40] block">When rewards are paid</span>
            <p className="leading-relaxed">
              Rewards are paid only after the qualifying action is completed and the transaction settles. Canceled or reversed transactions void the reward.
            </p>
          </div>
        </div>

        {/* Double Referral Week Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-[#001B40]">
                Double Referral Week
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/60">
                5 days left
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Refer 3 friends who book before 31 August and earn an extra <strong>₦5,000</strong>.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
              <span>1/3 friends booked</span>
              <span>33%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-neutral-100 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-[33%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Referrals Table */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-heading font-bold text-base text-[#001B40]">
            Your referrals
          </h3>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-neutral-100/70 border border-neutral-200/60 text-xs">
            {(["All", "In progress", "Reward earned", "Not qualified"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeFilter === tab
                    ? "bg-white text-[#001B40] shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pr-4">Friend</th>
                <th className="pb-3 px-4">Qualifying Step/Progress</th>
                <th className="pb-3 px-4 text-right">Reward</th>
                <th className="pb-3 pl-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-neutral-400">
                    Loading your referrals...
                  </td>
                </tr>
              ) : filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <p className="text-sm font-semibold text-neutral-800">No referrals yet</p>
                    <p className="font-sans text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      Share your referral code with friends. When they complete their first booking, you will earn ₦2,000!
                    </p>
                    <button
                      type="button"
                      onClick={handleShareInvite}
                      className="mt-4 px-4 py-2 rounded-xl bg-[#001B40] text-white text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Share invite link
                    </button>
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 pr-4 whitespace-nowrap">
                      <span className="font-bold text-[#001B40] block">
                        {row.friendName}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {row.joinedDate}
                      </span>
                    </td>

                    <td className="py-4 px-4 min-w-[260px]">
                      <span className="font-semibold text-neutral-800 block">
                        {row.progressSummary}
                      </span>
                      <span className="text-[11px] text-neutral-400 line-clamp-1">
                        {row.progressDetail}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <span className="font-bold text-[#001B40]">
                        {row.reward}
                      </span>
                    </td>

                    <td className="py-4 pl-4 text-right whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
