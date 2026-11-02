"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getReferralSummaryApi } from "@/lib/api/referrals";

interface ReferralItem {
  id: string;
  name: string;
  meta: string;
  status: "reward_earned" | "in_progress" | "reward_pending" | "invited" | "expired" | "denied";
  amount?: string;
  note?: string;
}

interface TalentReferralViewProps {
  onBack: () => void;
  referralCode?: string;
}

export function TalentReferralView({
  onBack,
  referralCode: defaultCode = "BLUE-SIMEON",
}: TalentReferralViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "in_progress" | "reward_earned" | "not_qualified">("all");
  const [code, setCode] = useState<string>(defaultCode);

  useEffect(() => {
    let isMounted = true;
    getReferralSummaryApi()
      .then((data) => {
        if (!isMounted || !data) return;
        if (data.referralCode) setCode(data.referralCode);
      })
      .catch(() => {
        // Retain default code
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const referrals: ReferralItem[] = [
    {
      id: "ref-1",
      name: "Daniel John",
      meta: "Enugu · Joined Aug 24",
      status: "reward_earned",
      amount: "₦3,000",
    },
    {
      id: "ref-2",
      name: "Daniel John",
      meta: "Enugu · Joined Aug 24",
      status: "in_progress",
      amount: "₦3,000",
    },
    {
      id: "ref-3",
      name: "Fatima Yusuf",
      meta: "Enugu · Joined Aug 16",
      status: "in_progress",
      amount: "₦3,000",
      note: "Approval unlocks once their 30-day refund window closes",
    },
    {
      id: "ref-4",
      name: "Peter Adamu",
      meta: "Joined Aug 15",
      status: "reward_pending",
      amount: "₦3,000",
      note: "Payment to your bank account is currently pending final compliance transaction.",
    },
    {
      id: "ref-5",
      name: "+234 813 ••• 42",
      meta: "Invite sent 14 Aug",
      status: "invited",
    },
    {
      id: "ref-6",
      name: "Idris A.",
      meta: "Joined 2 Aug",
      status: "expired",
      note: "Refund window elapsed before 30-day apprenticeship milestone completion.",
    },
    {
      id: "ref-7",
      name: "Emmanuel Okeke",
      meta: "Joined 29 Jul",
      status: "denied",
      note: "Declined: the account already belongs to an existing user on another Bluefixx marketplace role.",
    },
  ];

  const filteredReferrals = referrals.filter((r) => {
    if (activeTab === "all") return true;
    if (activeTab === "in_progress") return r.status === "in_progress" || r.status === "reward_pending";
    if (activeTab === "reward_earned") return r.status === "reward_earned";
    if (activeTab === "not_qualified") return r.status === "expired" || r.status === "denied" || r.status === "invited";
    return true;
  });

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(code);
    toast.success("Referral code copied to clipboard!");
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`https://bluefixx.com/signup?ref=${code}`);
    toast.success("Referral invite link copied!");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Breadcrumb Back */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Profile</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Invite & earn
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 font-medium mt-0.5">
          Invite friends who want to learn a trade
        </p>
      </div>

      {/* Top Banner Grid: Referral Banner (8 cols) & Double Referral Promo (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Hero Card */}
        <div className="lg:col-span-8 bg-[#001B40] rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between space-y-6 shadow-xs">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
              Talent Referral
            </span>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
              Earn ₦3,000 when they finish their first 30 days
            </h2>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10">
            <div>
              <span className="text-[11px] text-blue-200 block">Your referral code</span>
              <span className="font-mono font-bold text-lg text-white tracking-wider">
                {code}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl bg-white text-[#001B40] hover:bg-neutral-100 font-sans font-bold text-xs transition-colors cursor-pointer"
              >
                Share invite
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-sans font-semibold text-xs transition-colors cursor-pointer"
              >
                Copy link
              </button>
            </div>
          </div>
        </div>

        {/* Right Promo Card */}
        <div className="lg:col-span-4 bg-amber-50/90 border border-amber-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-xs text-amber-900">
                Double Referral Week
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full">
                3 days left
              </span>
            </div>
            <p className="font-sans text-xs text-amber-900/90 leading-relaxed">
              Invite 3 friends who complete their first 30 days before 31 October and claim an extra ₦10,000 bonus.
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-amber-200/60">
            <div className="flex justify-between text-[11px] text-amber-800 font-medium">
              <span>1 / 3 friends enrolled</span>
              <span>33%</span>
            </div>
            <div className="w-full bg-amber-200/70 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full w-1/3" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#0F1115]">
            ₦15,000
          </span>
          <p className="font-sans text-xs text-neutral-400">Earned</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#0F1115]">
            12
          </span>
          <p className="font-sans text-xs text-neutral-400">Invited</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#0F1115]">
            7
          </span>
          <p className="font-sans text-xs text-neutral-400">Joined</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#0F1115]">
            5
          </span>
          <p className="font-sans text-xs text-neutral-400">In 30-day window</p>
        </div>
      </div>

      {/* Referral Progress Timeline Card */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-[#0F1115]">
            Referral progress
          </h3>
          <span className="text-xs text-neutral-400">5/7 enrolled</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="font-bold text-[#001B40] block">1</span>
            <span className="text-[11px] text-neutral-600">Joined Bluefixx</span>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="font-bold text-[#001B40] block">2</span>
            <span className="text-[11px] text-neutral-600">Applied & got accepted</span>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="font-bold text-[#001B40] block">3</span>
            <span className="text-[11px] text-neutral-600">Paid and started training</span>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="font-bold text-[#001B40] block">4</span>
            <span className="text-[11px] text-neutral-600">Refund window closed (30 days)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 col-span-2 sm:col-span-1">
            <span className="font-bold text-emerald-700 block">5</span>
            <span className="text-[11px] font-bold text-emerald-800">You receive ₦3,000</span>
          </div>
        </div>
      </div>

      {/* Your Referrals List with Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-heading font-bold text-base text-[#0F1115]">
            Your referrals
          </h3>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "all", label: "All" },
              { id: "in_progress", label: "In progress" },
              { id: "reward_earned", label: "Reward earned" },
              { id: "not_qualified", label: "Not qualified" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#001B40] text-white shadow-xs"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Referrals Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReferrals.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#0F1115]">
                    {r.name}
                  </h4>
                  <p className="font-sans text-xs text-neutral-400 mt-0.5">
                    {r.meta}
                  </p>
                </div>

                {/* Status Badges */}
                {r.status === "reward_earned" && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
                    Reward earned
                  </span>
                )}
                {r.status === "in_progress" && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200">
                    In progress
                  </span>
                )}
                {r.status === "reward_pending" && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200">
                    Reward pending
                  </span>
                )}
                {r.status === "invited" && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-neutral-600 bg-neutral-100">
                    Invited
                  </span>
                )}
                {r.status === "expired" && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-neutral-500 bg-neutral-100">
                    Expired
                  </span>
                )}
                {r.status === "denied" && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200">
                    Denied
                  </span>
                )}
              </div>

              {r.amount && (
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                  <span className="text-neutral-400">Bonus reward</span>
                  <span className="font-bold text-[#001B40]">{r.amount}</span>
                </div>
              )}

              {r.note && (
                <p className="font-sans text-[11px] text-neutral-400 leading-relaxed bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                  {r.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
