"use client";

import React from "react";

interface TalentApprenticeshipActivatedViewProps {
  onBack?: () => void;
  onViewApprenticeship: () => void;
  onManageArtisan?: () => void;
  amount?: string;
  programmeTitle?: string;
  masterArtisan?: string;
  reference?: string;
  paymentMethod?: string;
  startDate?: string;
}

export function TalentApprenticeshipActivatedView({
  onBack,
  onViewApprenticeship,
  onManageArtisan,
  amount = "₦150,000",
  programmeTitle = "Welding & Metal Fabrication Apprenticeship",
  masterArtisan = "John Obiora",
  reference = "BFX-TRN-4417202",
  paymentMethod = "Paystack · Debit Card **** 4012",
  startDate = "1 September 2025",
}: TalentApprenticeshipActivatedViewProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Breadcrumb Back */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>My applications</span>
        </button>
      )}

      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Apprenticeship activated
        </h1>
      </div>

      {/* Main Grid: 8 cols Confirmation + 4 cols Receipt / Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Confirmation Card */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-2xs flex flex-col items-center justify-center text-center space-y-6 min-h-[380px]">
          {/* Green Check Circle */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115]">
              Apprenticeship activated
            </h2>
            <p className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
              {amount}
            </p>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed pt-2">
              Payment of <span className="font-semibold text-neutral-700">{amount}</span> confirmed. Your place is confirmed and training starts on {startDate}.
            </p>
          </div>
        </div>

        {/* Right Details Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="space-y-4 divide-y divide-neutral-100 text-xs sm:text-sm">
            <div className="pt-2 first:pt-0 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Amount</span>
              <span className="font-bold text-[#0F1115] text-right">{amount}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Programme</span>
              <span className="font-semibold text-[#0F1115] text-right">{programmeTitle}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Master artisan</span>
              <span className="font-semibold text-[#0F1115] text-right">{masterArtisan}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Reference</span>
              <span className="font-mono text-xs font-semibold text-neutral-700 text-right">{reference}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Method</span>
              <span className="font-semibold text-neutral-700 text-right">{paymentMethod}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={onViewApprenticeship}
              className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer text-center"
            >
              View Apprenticeship
            </button>

            <button
              type="button"
              onClick={onManageArtisan || onViewApprenticeship}
              className="w-full py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
            >
              Manage master artisan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
