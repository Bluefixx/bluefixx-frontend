"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { withdrawArtisanOfferApi } from "@/lib/api/artisan";

interface ArtisanQuoteSentViewProps {
  offerId?: string;
  jobTitle?: string;
  customerName?: string;
  quoteAmount?: string;
  submittedTime?: string;
  estimatedCompletion?: string;
  warrantyPeriod?: string;
  onViewJob: () => void;
  onFindMoreJobs: () => void;
  onBackToDashboard: () => void;
}

export function ArtisanQuoteSentView({
  offerId,
  jobTitle = "Kitchen Plumbing Repair",
  customerName = "Daniel C.",
  quoteAmount = "₦45,000",
  submittedTime = "Just now",
  estimatedCompletion = "1 week",
  warrantyPeriod = "30 days",
  onViewJob,
  onFindMoreJobs,
  onBackToDashboard,
}: ArtisanQuoteSentViewProps) {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawn, setIsWithdrawn] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleConfirmWithdraw = async () => {
    if (!offerId) {
      toast.error("Offer reference is missing; cannot withdraw quote.");
      setIsWithdrawModalOpen(false);
      return;
    }

    setIsWithdrawing(true);
    try {
      await withdrawArtisanOfferApi(offerId);
      toast.success("Quote successfully withdrawn.");
      setIsWithdrawModalOpen(false);
      setIsWithdrawn(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to withdraw quote.";
      toast.error(msg);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onViewJob}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>{jobTitle}</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Quote Sent
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
          {jobTitle}
        </p>
      </div>

      {/* WITHDRAWN SUCCESS BANNER (Screenshot 3 Right) */}
      {isWithdrawn ? (
        <div className="space-y-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#EBF1F7]/70 border border-[#CBDCE9] flex items-start gap-3">
            <svg className="w-5 h-5 text-[#001B40] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-xs sm:text-sm text-[#001B40] leading-relaxed">
              Your quote was withdrawn and removed from the customer&apos;s comparison. The job listing is still open if you change your mind.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={onFindMoreJobs}
              className="px-6 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
            >
              Find more jobs
            </button>
          </div>
        </div>
      ) : (
        /* NORMAL QUOTE SENT VIEW (Screenshot 1 Left & Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Spec Table */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
            <div className="divide-y divide-neutral-100 text-xs sm:text-sm">
              <div className="py-3.5 flex items-center justify-between">
                <span className="text-neutral-500 font-medium">Customer</span>
                <span className="font-bold text-[#0F1115]">{customerName}</span>
              </div>
              <div className="py-3.5 flex items-center justify-between">
                <span className="text-neutral-500 font-medium">Job</span>
                <span className="font-bold text-[#0F1115]">{jobTitle}</span>
              </div>
              <div className="py-3.5 flex items-center justify-between">
                <span className="text-neutral-500 font-medium">Submitted</span>
                <span className="font-bold text-[#0F1115]">{submittedTime}</span>
              </div>
              <div className="py-3.5 flex items-center justify-between">
                <span className="text-neutral-500 font-medium">Quote amount</span>
                <span className="font-heading font-extrabold text-[#001B40]">{quoteAmount}</span>
              </div>
              <div className="py-3.5 flex items-center justify-between">
                <span className="text-neutral-500 font-medium">Estimated completion</span>
                <span className="font-bold text-[#0F1115]">{estimatedCompletion}</span>
              </div>
              <div className="py-3.5 flex items-center justify-between">
                <span className="text-neutral-500 font-medium">Warranty</span>
                <span className="font-bold text-[#0F1115]">{warrantyPeriod}</span>
              </div>
            </div>

            {/* Bottom Tip Banner */}
            <div className="p-4 rounded-2xl bg-[#EBF1F7]/70 border border-[#CBDCE9] flex items-start gap-3">
              <svg className="w-5 h-5 text-[#001B40] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p className="text-xs text-[#001B40] leading-relaxed">
                The customer is comparing quotes. You will be notified when they view or accept yours. Nothing is payable right now until a quote is accepted and paid.
              </p>
            </div>
          </div>

          {/* Right Column: Status Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#001B40] text-white flex items-center justify-center mx-auto shadow-xs">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-500">
                Quote sent
              </h3>
              <p className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40]">
                {quoteAmount}
              </p>
              <p className="text-xs text-neutral-400 font-medium pt-1">
                Status: Awaiting Customer
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={onViewJob}
                className="w-full py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
              >
                View Job
              </button>

              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(true)}
                className="w-full py-2.5 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                Withdraw Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAW CONFIRMATION MODAL (Screenshot 3 Left) */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsWithdrawModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200/80 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#001B40]">
              Withdraw this quote?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto">
              It will be removed from the customer&apos;s comparison. You can send a new quote while the job is still open.
            </p>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                className="px-6 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                Withdraw Quote
              </button>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs sm:text-sm font-bold text-white transition-colors shadow-xs"
              >
                Keep Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

