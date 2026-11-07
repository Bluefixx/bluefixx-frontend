"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getArtisanReferralsSummaryApi,
  getArtisanReferralsHistoryApi,
} from "@/lib/api/artisan";

type ReferralFilter = "All" | "In progress" | "Reward earned" | "Not qualified";

interface ArtisanReferralViewProps {
  onBackToProfile: () => void;
}

export function ArtisanReferralView({ onBackToProfile }: ArtisanReferralViewProps) {
  const [activeFilter, setActiveFilter] = useState<ReferralFilter>("All");
  const referralCode = "BLUE-JOHN";

  const [referralSummary, setReferralSummary] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    getArtisanReferralsSummaryApi()
      .then((data) => {
        if (!mounted || !data) return;
        setReferralSummary(data);
      })
      .catch((err) => {
        console.debug("Referrals API offline or mocked.", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://bluefixx.com/signup?ref=${referralCode}`);
    }
    toast.success("Referral link copied to clipboard!");
  };

  const handleShareCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralCode);
    }
    toast.success("Referral code copied!");
  };

  const referrals = [
    {
      id: "ref-1",
      name: "Daniel James",
      type: "Artisan",
      joinedDate: "2 Aug '26",
      status: "Reward earned",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      stepsCompleted: "4/4",
      amount: "₦5,000",
      steps: [
        { label: "Joined BlueFixx", done: true },
        { label: "Completed verification", done: true },
        { label: "Got first job", done: true },
        { label: "Completed first job", done: true },
      ],
      filterCategory: "Reward earned" as const,
    },
    {
      id: "ref-2",
      name: "Chiamaka Okator",
      type: "Artisan",
      joinedDate: "4 Aug '26",
      status: "In progress",
      statusColor: "bg-blue-50 text-blue-700 border-blue-100",
      stepsCompleted: "2/4",
      amount: "₦5,000",
      note: "Reward unlocks when they complete their first job",
      steps: [
        { label: "Joined BlueFixx", done: true },
        { label: "Completed verification", done: true },
        { label: "Got first job", done: false },
        { label: "Completed first job", done: false },
      ],
      filterCategory: "In progress" as const,
    },
    {
      id: "ref-3",
      name: "Fatima Yusuf",
      type: "Artisan",
      joinedDate: "12 Jul '26",
      status: "In progress",
      statusColor: "bg-blue-50 text-blue-700 border-blue-100",
      stepsCompleted: "1/4",
      amount: "₦5,000",
      note: "Reward unlocks when they complete their first job",
      steps: [
        { label: "Joined BlueFixx", done: true },
        { label: "Completed verification", done: false },
        { label: "Got first job", done: false },
        { label: "Completed first job", done: false },
      ],
      filterCategory: "In progress" as const,
    },
    {
      id: "ref-4",
      name: "Peter Adelowo",
      type: "Artisan",
      joinedDate: "18 Jul '26",
      status: "Payout pending",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
      stepsCompleted: "3/4",
      amount: "₦5,000",
      note: "Payment is still in escrow. Reward unlocks once complete",
      steps: [
        { label: "Joined BlueFixx", done: true },
        { label: "Completed verification", done: true },
        { label: "Got first job", done: true },
        { label: "Completed first job", done: false },
      ],
      filterCategory: "In progress" as const,
    },
    {
      id: "ref-5",
      name: "+234 803 ••• 47",
      type: "Artisan",
      joinedDate: "2 Jul '26",
      status: "Joined",
      statusColor: "bg-neutral-100 text-neutral-600 border-neutral-200",
      stepsCompleted: "1/4",
      amount: "₦1,500",
      steps: [
        { label: "Joined BlueFixx", done: true },
        { label: "Completed verification", done: false },
        { label: "Got first job", done: false },
        { label: "Completed first job", done: false },
      ],
      filterCategory: "In progress" as const,
    },
    {
      id: "ref-6",
      name: "Sam O.",
      type: "Artisan",
      joinedDate: "26 Jun '26",
      status: "Expired",
      statusColor: "bg-neutral-100 text-neutral-400 border-neutral-200",
      stepsCompleted: "1/4",
      amount: "₦1,500",
      note: "Invite window closed after 30 days without active booking",
      steps: [
        { label: "Joined BlueFixx", done: true },
        { label: "Completed verification", done: false },
        { label: "Got first job", done: false },
        { label: "Completed first job", done: false },
      ],
      filterCategory: "Not qualified" as const,
    },
    {
      id: "ref-7",
      name: "Solomon Davies",
      type: "Artisan",
      joinedDate: "18 Jul '26",
      status: "Revoked",
      statusColor: "bg-red-50 text-red-600 border-red-200",
      stepsCompleted: "1/4",
      amount: "No reward",
      note: "Violated terms of service (multiple accounts). Referral bonus disqualified",
      steps: [
        { label: "Joined BlueFixx", done: true },
        { label: "Completed verification", done: false },
        { label: "Got first job", done: false },
        { label: "Completed first job", done: false },
      ],
      filterCategory: "Not qualified" as const,
    },
  ];

  const filteredReferrals = referrals.filter((r) => {
    if (activeFilter === "All") return true;
    return r.filterCategory === activeFilter;
  });

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
          Invite & earn
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
          Invite skilled artisans you trust to join BlueFixx
        </p>
      </div>

      {/* Hero Dual Cards (Screenshot 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Dark Blue Card (8 cols) */}
        <div className="lg:col-span-8 bg-[#001B40] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-5 shadow-xs">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
              Refer an Artisan
            </span>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl text-white">
              Earn ₦5,000 when they complete their first job
            </h2>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-300 block">Your referral code</span>
                <span className="font-heading font-extrabold text-base tracking-widest text-white">
                  {referralCode}
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

        {/* Right Light Yellow Card: Double Referral Week (4 cols) */}
        <div className="lg:col-span-4 bg-[#FFF8EB] border border-[#FDE6B8] rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-[#7A4504]">
                Double Referral Week
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDE6B8] text-[#7A4504]">
                5 days left
              </span>
            </div>
            <p className="text-xs text-[#925406] leading-relaxed">
              Refer 3 verified artisans before 15 August and receive an extra ₦10,000.
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-[#7A4504] hover:underline cursor-pointer">
              Verified Artisans →
            </span>
          </div>
        </div>
      </div>

      {/* 4 Stat Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115] block">
            ₦25,000
          </span>
          <span className="text-neutral-400 font-sans text-xs font-medium">Earned</span>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115] block">
            12
          </span>
          <span className="text-neutral-400 font-sans text-xs font-medium">Invited</span>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115] block">
            7
          </span>
          <span className="text-neutral-400 font-sans text-xs font-medium">Joined</span>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115] block">
            5
          </span>
          <span className="text-neutral-400 font-sans text-xs font-medium">Activated</span>
        </div>
      </div>

      {/* Referral Progress Timeline Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#0F1115]">
            Referral progress
          </h3>
          <span className="text-xs font-bold text-neutral-400">1/2 activated</span>
        </div>

        {/* 5-Step Progress Row */}
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
            <span className="font-bold text-emerald-800 block text-[11px]">Reward paid (₦5,000)</span>
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

        {/* Referrals Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReferrals.map((ref) => (
            <div
              key={ref.id}
              className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-extrabold text-sm sm:text-base text-[#0F1115]">
                      {ref.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      {ref.type} · Joined {ref.joinedDate}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border ${ref.statusColor}`}
                  >
                    {ref.status}
                  </span>
                </div>

                {/* Steps Checkmarks */}
                <div className="space-y-1.5 text-xs text-neutral-600">
                  {ref.steps.map((st, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          st.done
                            ? "bg-emerald-600 text-white"
                            : "border border-neutral-300 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className={st.done ? "text-neutral-800" : "text-neutral-400"}>
                        {st.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">
                    {ref.stepsCompleted} steps complete
                  </span>
                  <span className="font-heading font-extrabold text-sm text-[#001B40]">
                    {ref.amount}
                  </span>
                </div>

                {ref.note && (
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-[11px] text-neutral-500 leading-relaxed">
                    {ref.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default ArtisanReferralView;

