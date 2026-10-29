"use client";

import React from "react";

interface TalentRefundRequestedConfirmationViewProps {
  onBackToPayments: () => void;
  onViewRequest?: () => void;
  artisanName?: string;
}

export function TalentRefundRequestedConfirmationView({
  onBackToPayments,
  onViewRequest,
  artisanName = "John",
}: TalentRefundRequestedConfirmationViewProps) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Breadcrumb Back */}
      <button
        type="button"
        onClick={onBackToPayments}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>30-day refund policy</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Request a refund
        </h1>
      </div>

      {/* Main Confirmation Card matching Figma */}
      <div className="bg-white rounded-3xl p-8 sm:p-14 border border-neutral-200/80 shadow-2xs text-center space-y-6 max-w-xl mx-auto">
        {/* Curved Return Arrow Icon */}
        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 mx-auto text-2xl shadow-xs">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 14 4 9 9 4" />
            <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
          </svg>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115]">
            Refund request sent
          </h2>
          <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
            We have paused payouts to <span className="font-semibold text-neutral-700">{artisanName}</span> and will reply within 2 working days. If approved, your refund goes to your Bluefixx wallet within 24 hours.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={onViewRequest || onBackToPayments}
            className="px-6 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            View request
          </button>
          <button
            type="button"
            onClick={onBackToPayments}
            className="px-6 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            Back to payments
          </button>
        </div>
      </div>
    </div>
  );
}
