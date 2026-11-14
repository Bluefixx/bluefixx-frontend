"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { respondToDisputeApi, submitSafetyReportApi } from "@/lib/api/artisan";
import { SafetyIssueType } from "@/types/artisan";

interface ArtisanReportProblemViewProps {
  disputeId?: string;
  bookingId?: string;
  onBack: () => void;
  onViewDispute?: () => void;
  onContactSupport?: () => void;
}

const PROBLEM_TAGS = [
  "Customer unreachable",
  "Job scope changed",
  "Additional cost refused",
  "Damage claim against me",
  "Safety concern",
  "Payment issue",
  "Other",
];

export function ArtisanReportProblemView({
  disputeId,
  bookingId,
  onBack,
  onViewDispute,
  onContactSupport,
}: ArtisanReportProblemViewProps) {
  const [selectedTag, setSelectedTag] = useState<string>("Additional cost refused");
  const [description, setDescription] = useState<string>("");
  const [photoCount, setPhotoCount] = useState<number>(0);
  const [videoCount, setVideoCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"report" | "dispute-detail">("report");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please describe the problem before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (disputeId) {
        await respondToDisputeApi(disputeId, {
          text: `[${selectedTag}] ${description.trim()}`,
        });
        toast.success("Dispute response submitted.");
      } else {
        const issueType: SafetyIssueType =
          selectedTag === "Safety concern" ? "UNSAFE_HOME" : "OTHER";
        await submitSafetyReportApi({
          issue: issueType,
          bookingId,
          details: `[${selectedTag}] ${description.trim()}`,
        });
        toast.success("Problem reported to support.");
      }
      setActiveTab("dispute-detail");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit report.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (activeTab === "dispute-detail") {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
        {/* Header */}
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Profile</span>
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
              Dispute
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Disputed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Job Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-[#0F1115]">
                    Bathroom Plumbing Repair
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    Daniel C. (Customer) · Independence Layout
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                  Under Review
                </span>
              </div>

              {/* Specs Table */}
              <div className="divide-y divide-neutral-100 text-xs sm:text-sm space-y-2.5 pt-1">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-neutral-500">Amount in dispute</span>
                  <span className="font-heading font-bold text-[#0F1115]">₦45,000</span>
                </div>
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-neutral-500">Transaction ID</span>
                  <span className="font-mono text-neutral-700">BFX-PAY-123842</span>
                </div>
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-neutral-500">Reason</span>
                  <span className="font-medium text-neutral-800">Work Incomplete (reported by customer)</span>
                </div>
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-neutral-500">Evidence</span>
                  <span className="font-medium text-neutral-800">1 photo · 1 video (by customer)</span>
                </div>
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-neutral-500">Opened</span>
                  <span className="text-neutral-600">18 Aug 2026 · 10:14am</span>
                </div>
              </div>
            </div>

            {/* Messages from BlueFixx Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Messages from BlueFixx
              </h4>
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60 space-y-2">
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                  &ldquo;Daniel reported that the leak in pipe was not resolved. We have paused your ₦45,000 payout. Please respond with photos of the finished job by tomorrow (24 hours).&rdquo;
                </p>
                <div className="text-[11px] font-semibold text-neutral-500">
                  Amaka, Dispute Support · 11:20am
                </div>
              </div>
            </div>

            {/* SLA / Escrow Notice */}
            <p className="text-xs text-neutral-500 leading-relaxed px-1">
              Most disputes are resolved within 48 hours. If resolved in customer&apos;s favor, payout is refunded to the customer.
            </p>
          </div>

          {/* Right Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Dispute Timeline */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-5">
              <h3 className="text-sm font-heading font-bold text-[#0F1115]">
                Dispute timeline
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                {/* Step 1 Done */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 mt-0.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-[#0F1115]">Customer opened a dispute</div>
                    <div className="text-xs text-neutral-500">18 Aug · 10:14am</div>
                  </div>
                </div>

                {/* Step 2 Active */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#001B40] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div>
                    <div className="font-bold text-[#001B40]">Under review by BlueFixx</div>
                    <div className="text-xs text-neutral-500">BlueFixx contacted you on 18 Aug · 11:20am</div>
                  </div>
                </div>

                {/* Step 3 Pending */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center shrink-0 border border-neutral-200 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-neutral-300" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-600">Waiting for your response</div>
                    <div className="text-xs text-neutral-500">Respond by 19 Aug · 11:20am</div>
                  </div>
                </div>

                {/* Step 4 Done */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-300 flex items-center justify-center shrink-0 border border-neutral-200 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-neutral-200" />
                  </div>
                  <div>
                    <div className="font-medium text-neutral-400">Resolved</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => toast("Opening chat with Daniel C...")}
                className="w-full py-3.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs sm:text-sm font-bold text-neutral-700 transition-colors cursor-pointer"
              >
                Message customer
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onContactSupport) onContactSupport();
                  else toast("Calling Dispute Support at 0700 258 3349...");
                }}
                className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shadow-xs"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Profile</span>
        </button>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
            Report a problem
          </h1>
          <button
            type="button"
            onClick={() => setActiveTab("dispute-detail")}
            className="text-xs font-semibold text-[#074292] hover:underline cursor-pointer"
          >
            View active dispute →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (8 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs space-y-5">
          {/* Reason Tags */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0F1115]">
              What went wrong?
            </label>
            <div className="flex flex-wrap gap-2">
              {PROBLEM_TAGS.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#001B40] text-white"
                        : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0F1115]">
              Describe the problem
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what happened clearly..."
              className="w-full p-3.5 rounded-2xl border border-neutral-200 text-xs sm:text-sm text-[#0F1115] focus:outline-hidden focus:border-[#001B40] transition-colors"
            />
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0F1115]">
              Evidence
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPhotoCount((prev) => prev + 1);
                  toast.success("Photo attached");
                }}
                className="py-4 px-3 rounded-2xl border border-dashed border-neutral-300 hover:border-neutral-400 bg-neutral-50/60 hover:bg-neutral-50 flex flex-col items-center justify-center gap-1.5 text-neutral-600 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="text-xs font-semibold">
                  {photoCount > 0 ? `Photo attached (${photoCount})` : "Add photo"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setVideoCount((prev) => prev + 1);
                  toast.success("Video attached");
                }}
                className="py-4 px-3 rounded-2xl border border-dashed border-neutral-300 hover:border-neutral-400 bg-neutral-50/60 hover:bg-neutral-50 flex flex-col items-center justify-center gap-1.5 text-neutral-600 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span className="text-xs font-semibold">
                  {videoCount > 0 ? `Video attached (${videoCount})` : "Add video"}
                </span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-neutral-500 leading-relaxed">
            The customer will see your report and can respond within 24 hours. Neither receives the escrow/full release payment while an issue is open.
          </p>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            Submit report
          </button>
        </form>

        {/* Right Escrow Guarantee Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-emerald-100 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <h3 className="text-sm font-heading font-bold text-[#0F1115]">
            Your ₦45,000 payout is in safe escrow
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Nothing is refunded to the customer while a problem report is open. A Bluefixx agent reviews it within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ArtisanReportProblemView;

