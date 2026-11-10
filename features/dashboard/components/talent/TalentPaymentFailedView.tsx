"use client";

import React from "react";

interface TalentPaymentFailedViewProps {
  onBack: () => void;
  onUseWallet: () => void;
  onTryAgain: () => void;
  amount?: string;
  holdHours?: number;
}

export function TalentPaymentFailedView({
  onBack,
  onUseWallet,
  onTryAgain,
  amount = "₦0",
  holdHours = 48,
}: TalentPaymentFailedViewProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Breadcrumb Back */}
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

      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Pay for apprenticeship
        </h1>
      </div>

      {/* Centered Error Card matching Figma */}
      <div className="bg-white rounded-3xl p-8 sm:p-14 border border-neutral-200/80 shadow-2xs text-center space-y-6 max-w-xl mx-auto mt-6">
        {/* Coral/Rose Declined Icon */}
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto text-2xl shadow-xs">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <line x1="16" y1="15" x2="16.01" y2="15" />
          </svg>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115]">
            Your payment did not go through
          </h2>
          <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
            Your bank declined the <span className="font-semibold text-neutral-700">{amount}</span> payment. Your place is held for {holdHours} hours. Try another card or pay from your Bluefixx wallet.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={onUseWallet}
            className="px-6 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Use wallet
          </button>
          <button
            type="button"
            onClick={onTryAgain}
            className="px-6 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
