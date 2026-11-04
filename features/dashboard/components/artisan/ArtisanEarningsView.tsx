"use client";

import React from "react";
import toast from "react-hot-toast";

interface ArtisanEarningsViewProps {
  onWithdrawToBank: () => void;
  onBackToDashboard: () => void;
}

export function ArtisanEarningsView({
  onWithdrawToBank,
  onBackToDashboard,
}: ArtisanEarningsViewProps) {
  const transactions = [
    {
      id: "tx-1",
      title: "Job payout · Insured",
      subtitle: "BF-2910 · 7% fee + 1% insurance deducted",
      amount: "₦55,242",
      badge: "Net payout",
      badgeColor: "bg-emerald-50 text-emerald-700",
    },
    {
      id: "tx-2",
      title: "Pressure pump servicing",
      subtitle: "Aaron D. · Booking #BF-7281",
      amount: "₦38,000",
      badge: "Available",
      badgeColor: "bg-emerald-50 text-emerald-700",
    },
    {
      id: "tx-3",
      title: "Bathroom re-piping",
      subtitle: "Chukwudi O. · Booking #BF-0711",
      amount: "₦45,000",
      badge: "Withdrawn",
      badgeColor: "bg-neutral-100 text-neutral-600",
    },
    {
      id: "tx-4",
      title: "Shower line replacement",
      subtitle: "Henry N. · Booking #BF-2710",
      amount: "₦85,000",
      badge: "Withdrawn",
      badgeColor: "bg-neutral-100 text-neutral-600",
    },
  ];

  const weeklyData = [
    { day: "Mon", height: "h-6", amount: "₦0" },
    { day: "Tue", height: "h-14", amount: "₦25,000" },
    { day: "Wed", height: "h-10", amount: "₦18,000" },
    { day: "Thu", height: "h-28", amount: "₦38,000", isHighest: true },
    { day: "Fri", height: "h-8", amount: "₦12,000" },
    { day: "Sat", height: "h-4", amount: "₦0" },
    { day: "Sun", height: "h-4", amount: "₦0" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Top Header */}
      <div>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Profile</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Earnings
        </h1>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          HERO ROW: DARK BLUE WITHDRAWABLE BALANCE CARD
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-[#001B40] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <span className="text-xs sm:text-sm text-neutral-300 font-medium">
            Withdrawable balance
          </span>
          <div className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
            ₦168,000
          </div>
          <button
            type="button"
            onClick={onWithdrawToBank}
            className="px-6 py-2.5 rounded-xl bg-white text-[#001B40] hover:bg-neutral-100 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
          >
            Withdraw to bank
          </button>
        </div>

        {/* 3 Metric Columns */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-8">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs text-neutral-300">In escrow</span>
            <p className="text-base sm:text-xl font-heading font-extrabold text-white">
              ₦46,500
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs text-neutral-300">Paid out this month</span>
            <p className="text-base sm:text-xl font-heading font-extrabold text-white">
              ₦412,000
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs text-neutral-300">Apprentice earnings</span>
            <p className="text-base sm:text-xl font-heading font-extrabold text-white">
              ₦212,000
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECOND ROW: YOUR STANDING & THIS WEEK BAR CHART
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Your Standing Card (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#0F1115]">
            Your standing
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
              <span className="text-[11px] text-neutral-400 font-medium">This month</span>
              <p className="font-heading font-extrabold text-lg sm:text-xl text-[#001B40]">
                ₦320,000
              </p>
              <p className="text-[11px] text-neutral-500">3 jobs completed</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-1">
              <span className="text-[11px] text-amber-700 font-medium">BlueFixx Rewards</span>
              <p className="font-heading font-extrabold text-lg sm:text-xl text-amber-900">
                ₦1,240
              </p>
              <p className="text-[11px] text-amber-700">Milestone 4 of 5</p>
            </div>
          </div>
        </div>

        {/* This Week Bar Chart Card (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#0F1115]">
              This week
            </h2>
            <span className="text-xs text-neutral-400 font-medium">Thursday: ₦38,000</span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
            {weeklyData.map((bar) => (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div
                  className={`w-full max-w-[32px] rounded-t-xl transition-all ${
                    bar.isHighest
                      ? "bg-[#001B40]"
                      : "bg-[#CBDCE9] group-hover:bg-[#001B40]/70"
                  } ${bar.height}`}
                  title={`${bar.day}: ${bar.amount}`}
                />
                <span className="text-[11px] font-medium text-neutral-400">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          THIRD ROW: TRANSACTION LEDGER
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-5">
        <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#0F1115]">
          Transaction ledger
        </h2>

        <div className="divide-y divide-neutral-100">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/50 rounded-xl px-2 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 text-[#001B40] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xs sm:text-sm text-[#0F1115]">
                    {tx.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {tx.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="font-heading font-extrabold text-sm sm:text-base text-[#001B40]">
                  {tx.amount}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${tx.badgeColor}`}>
                  {tx.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM NOTICE BANNER (7% SERVICE FEE + 1% INSURANCE)
          ═══════════════════════════════════════════════════════════ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#EBF1F7]/70 border border-[#CBDCE9] space-y-1">
        <p className="text-xs text-[#001B40] leading-relaxed">
          BlueFixx charges a 7% service fee on completed jobs. Approved money moves to your withdrawable balance as soon as the customer confirms completion.
        </p>
        <p className="text-xs text-[#001B40]/80">
          1% professional job insurance is deducted from your take only when the service fee is.
        </p>
      </div>
    </div>
  );
}

