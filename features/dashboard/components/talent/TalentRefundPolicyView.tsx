"use client";

import React from "react";

interface TalentRefundPolicyViewProps {
  onBack: () => void;
  onRequestRefund: () => void;
  programmeTitle?: string;
  feePaid?: string;
  startDate?: string;
  windowEnd?: string;
}

export function TalentRefundPolicyView({
  onBack,
  onRequestRefund,
  programmeTitle = "Welding & Metal Fabrication",
  feePaid = "₦150,000",
  startDate = "1 Sep 2025",
  windowEnd = "1 Oct 2025",
}: TalentRefundPolicyViewProps) {
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
        <span>Payments & receipts</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          30-day refund policy
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 font-medium mt-0.5">
          For apprenticeship fees paid through Bluefixx
        </p>
      </div>

      {/* Main Grid: 8 cols policy documentation + 4 cols status card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Detailed Policy Content Card */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-9 border border-neutral-200/80 shadow-2xs space-y-7">
          {/* Section 1: How it works */}
          <div className="space-y-2">
            <h2 className="font-heading font-bold text-base text-[#0F1115]">
              How it works
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
              You can ask for a refund within 30 days of your start date. Your fee stays in escrow, so Bluefixx can return it to you safely without delays.
            </p>
          </div>

          {/* Section 2: Full Refund */}
          <div className="space-y-2">
            <h2 className="font-heading font-bold text-base text-[#0F1115]">
              You qualify for a full refund if:
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Sessions are cancelled or missed without a make-up plan, the training does not match the agreed syllabus level, or the workshop environment is unsafe.
            </p>
          </div>

          {/* Section 3: Partial Refund */}
          <div className="space-y-2">
            <h2 className="font-heading font-bold text-base text-[#0F1115]">
              You can get a partial refund if:
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
              You change your mind within 30 days. We refund the total fee minus the proportional sessions you have already attended.
            </p>
          </div>

          {/* Section 4: After 30 days */}
          <div className="space-y-2">
            <h2 className="font-heading font-bold text-base text-[#0F1115]">
              After 30 days:
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Refunds are only possible through an escalated problem report reviewed and arbitrated by the Bluefixx Safety & Resolution Desk.
            </p>
          </div>

          {/* Section 5: Payout turnaround */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <h2 className="font-heading font-bold text-base text-[#0F1115]">
              How you get paid
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Refunds are credited directly to your Bluefixx wallet within 24 hours, or to your bank account within 5 working days.
            </p>
          </div>
        </div>

        {/* Right Active Apprenticeship Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-6">
          <h3 className="font-heading font-bold text-base text-[#0F1115]">
            Your apprenticeship
          </h3>

          <div className="space-y-4 divide-y divide-neutral-100 text-xs sm:text-sm">
            <div className="pt-2 first:pt-0 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Fee paid</span>
              <span className="font-bold text-[#0F1115]">{feePaid}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Started</span>
              <span className="font-semibold text-neutral-700">{startDate}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Refund window ends</span>
              <span className="font-semibold text-[#001B40]">{windowEnd}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRequestRefund}
            className="w-full py-3.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-sans font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center"
          >
            Request a refund
          </button>
        </div>
      </div>
    </div>
  );
}
