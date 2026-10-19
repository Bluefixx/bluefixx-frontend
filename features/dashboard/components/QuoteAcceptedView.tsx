"use client";

import React from "react";
import toast from "react-hot-toast";

interface QuoteAcceptedViewProps {
  jobTitle?: string;
  customerName?: string;
  quoteAmount?: number;
  submittedTime?: string;
  estimatedCompletion?: string;
  warranty?: string;
  onBack: () => void;
  onViewJob: () => void;
}

export default function QuoteAcceptedView({
  jobTitle = "Bathroom Plumbing Repair",
  customerName = "Daniel C.",
  quoteAmount = 120000,
  submittedTime = "Today · 11:37",
  estimatedCompletion = "1 week",
  warranty = "30 days",
  onBack,
  onViewJob,
}: QuoteAcceptedViewProps) {
  const handleContinuePayment = () => {
    toast.success("Proceeding to secure Escrow payment...", {
      icon: "🔒",
      duration: 3500,
    });
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Navigation */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>My jobs</span>
        </button>

        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight mt-3">
          Quote accepted
        </h1>
        <p className="font-sans text-xs text-neutral-400 mt-0.5">
          {jobTitle}
        </p>
      </div>

      {/* Main Accepted Body (Matching media_1792437409407.png) */}
      <div className="pt-4 sm:pt-6 space-y-6 max-w-xl mx-auto text-center">
        {/* Navy Paper Plane / Send Icon */}
        <div className="w-14 h-14 rounded-full bg-[#001B40] text-white flex items-center justify-center mx-auto shadow-md">
          <svg className="w-6 h-6 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>

        {/* Large Amount */}
        <div>
          <span className="font-sans font-bold text-3xl sm:text-4xl text-[#0F1115] tracking-tight block">
            ₦{quoteAmount.toLocaleString()}
          </span>
        </div>

        {/* Breakdown Card with Divider Rows */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 text-left text-xs sm:text-sm">
          <div className="flex items-center justify-between py-3 first:pt-0">
            <span className="text-neutral-500">Customer</span>
            <span className="font-medium text-neutral-900">{customerName}</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-neutral-500">Job</span>
            <span className="font-medium text-neutral-900">{jobTitle}</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-neutral-500">Submitted</span>
            <span className="font-medium text-neutral-900">{submittedTime}</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-neutral-500">Quote amount</span>
            <span className="font-bold text-neutral-900">
              ₦{quoteAmount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-neutral-500">Estimated completion</span>
            <span className="font-medium text-neutral-900">{estimatedCompletion}</span>
          </div>

          <div className="flex items-center justify-between py-3 last:pb-0">
            <span className="text-neutral-500">Warranty</span>
            <span className="font-medium text-neutral-900">{warranty}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleContinuePayment}
            className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center shadow-xs"
          >
            Continue to Payment
          </button>

          <button
            type="button"
            onClick={onViewJob}
            className="w-full py-3.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center bg-white shadow-2xs"
          >
            View Job
          </button>
        </div>
      </div>
    </div>
  );
}
