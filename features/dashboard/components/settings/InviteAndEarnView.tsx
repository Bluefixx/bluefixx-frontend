"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

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
  const referralCode = "BLUE-SIMEON";
  const referralUrl = "https://bluefixx.ng/invite/BLUE-SIMEON";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied to clipboard!");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success("Referral link copied to clipboard!");
  };

  const handleShareInvite = () => {
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

  const referrals: ReferralRecord[] = [
    {
      id: "ref-1",
      friendName: "Daniel Uche",
      joinedDate: "Customer · Joined Aug 24",
      progressSummary: "4/4 steps complete",
      progressDetail: "Joined Bluefixx · Completed profile · Booked first service · Completed first transaction",
      reward: "₦2,000",
      status: "Reward earned",
      statusColor: "bg-emerald-50 text-emerald-700",
    },
    {
      id: "ref-2",
      friendName: "Fatima Yusuf",
      joinedDate: "Customer · Joined Aug 19",
      progressSummary: "3/3 steps complete",
      progressDetail: "Joined Bluefixx · Completed verification · Completed profile · Reward unlocks when Fatima completes her first job.",
      reward: "₦2,000",
      status: "In progress",
      statusColor: "bg-blue-50 text-blue-700",
    },
    {
      id: "ref-3",
      friendName: "Peter Adams",
      joinedDate: "Customer · Joined Aug 15",
      progressSummary: "2/4 steps complete",
      progressDetail: "Payment to Emeka was sent · Reward is pending the completed transaction.",
      reward: "₦2,000",
      status: "Reward pending",
      statusColor: "bg-amber-50 text-amber-700",
    },
    {
      id: "ref-4",
      friendName: "+234 803 ••• 42",
      joinedDate: "Customer · Joined",
      progressSummary: "1/4 steps complete",
      progressDetail: "Invite sent. Profile, first service and first transaction still incomplete.",
      reward: "₦2,000",
      status: "Invited",
      statusColor: "bg-neutral-100 text-neutral-600",
    },
    {
      id: "ref-5",
      friendName: "Sam O.",
      joinedDate: "Customer · Joined",
      progressSummary: "1/4 steps complete",
      progressDetail: "Invite window expired after 30 days without a first booking.",
      reward: "₦2,000",
      status: "Expired",
      statusColor: "bg-neutral-100 text-neutral-500",
    },
    {
      id: "ref-6",
      friendName: "Unknown device",
      joinedDate: "Customer",
      progressSummary: "0/4 steps complete",
      progressDetail: "Blocked: This account shares a direct bank account with yours. Self-referrals do not qualify.",
      reward: "No reward",
      status: "Blocked",
      statusColor: "bg-rose-50 text-rose-700",
    },
  ];

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
              ₦10,000
            </span>
            <span className="text-xs text-neutral-400 font-medium">Earned</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
            <span className="font-heading font-black text-2xl sm:text-3xl text-[#001B40]">
              12
            </span>
            <span className="text-xs text-neutral-400 font-medium">Invited</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
            <span className="font-heading font-black text-2xl sm:text-3xl text-[#001B40]">
              7
            </span>
            <span className="text-xs text-neutral-400 font-medium">Joined</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
            <span className="font-heading font-black text-2xl sm:text-3xl text-[#001B40]">
              5
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
              {filteredReferrals.map((row) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
