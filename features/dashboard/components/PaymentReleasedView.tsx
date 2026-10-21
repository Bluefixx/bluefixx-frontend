"use client";

import React from "react";
import toast from "react-hot-toast";

interface PaymentReleasedViewProps {
  onBack?: () => void;
  onLeaveReview: () => void;
  onFileWarrantyClaim?: () => void;
  jobId?: string;
  jobTitle?: string;
  artisanName?: string;
  totalAmount?: string;
  serviceFee?: string;
  artisanEarnings?: string;
  transactionId?: string;
  releaseDate?: string;
}

export default function PaymentReleasedView({
  onBack,
  onLeaveReview,
  onFileWarrantyClaim,
  jobId = "BFX-20481",
  jobTitle = "Bathroom Plumbing Repair",
  artisanName = "Emeka Okafor",
  totalAmount = "₦120,000",
  serviceFee = "-₦8,400",
  artisanEarnings = "₦111,600",
  transactionId = "TXN-634891",
  releaseDate = "Today · 9:39",
}: PaymentReleasedViewProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>My jobs</span>
        </button>
      </div>

      {/* Heading */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Release Payment
        </h1>
        <p className="font-sans text-xs text-neutral-400 mt-1">
          {jobTitle}
        </p>
      </div>

      {/* Active Warranty Banner */}
      <div className="rounded-2xl p-4 sm:p-5 bg-[#E8F8EE] border border-[#BCECD0] flex items-start gap-3.5">
        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-emerald-900 text-xs sm:text-sm">
            Your 7-day warranty is active
          </h4>
          <p className="text-emerald-800 leading-relaxed font-medium">
            Bluefixx covers up to ₦100,000 if anything goes wrong. You can{" "}
            <button
              type="button"
              onClick={onFileWarrantyClaim}
              className="underline font-bold text-emerald-950 hover:text-emerald-700 cursor-pointer"
            >
              file a warranty claim
            </button>{" "}
            under booking actions on this page.
          </p>
        </div>
      </div>

      {/* Main Payment Released Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200/80 shadow-xs max-w-xl mx-auto flex flex-col items-center text-center">
        {/* Checkmark circle */}
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#001B40]">
          Payment Released
        </h2>

        <p className="font-heading font-black text-3xl sm:text-4xl text-[#001B40] my-2 tracking-tight">
          {totalAmount}
        </p>

        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mb-6 leading-relaxed">
          {artisanName} has been paid for {jobTitle}. The full breakdown is below:
        </p>

        {/* Breakdown table */}
        <div className="w-full space-y-3 border-t border-b border-neutral-100 py-4 text-xs sm:text-sm">
          <div className="flex items-center justify-between text-neutral-600">
            <span>Customer payment</span>
            <span className="font-semibold text-neutral-900">{totalAmount}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-500">
            <span>Service fee (7%, paid by artisan)</span>
            <span className="font-medium text-neutral-600">{serviceFee}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-600">
            <span>Artisan earnings</span>
            <span className="font-semibold text-neutral-900">{artisanEarnings}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-500 pt-2 border-t border-neutral-50">
            <span>Transaction ID</span>
            <span className="font-mono text-neutral-700">{transactionId}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-500">
            <span>Released</span>
            <span className="text-neutral-700">{releaseDate}</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="w-full space-y-2.5 mt-6">
          <button
            type="button"
            onClick={onLeaveReview}
            className="w-full py-3.5 bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Leave a Review
          </button>
          {onFileWarrantyClaim && (
            <button
              type="button"
              onClick={onFileWarrantyClaim}
              className="w-full py-2.5 text-xs text-neutral-500 hover:text-neutral-800 font-semibold cursor-pointer"
            >
              Have an issue? File a warranty claim
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
