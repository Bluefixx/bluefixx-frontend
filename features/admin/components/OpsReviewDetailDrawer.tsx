"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminReview, ReviewReportStatus } from "../types";

interface OpsReviewDetailDrawerProps {
  review: AdminReview | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (reviewId: string, newStatus: ReviewReportStatus, reason: string) => void;
}

export function OpsReviewDetailDrawer({
  review,
  isOpen,
  onClose,
  onUpdateStatus,
}: OpsReviewDetailDrawerProps) {
  const [selectedAction, setSelectedAction] = useState<"clean" | "hide" | "investigating" | "strike">("clean");
  const [moderationReason, setModerationReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen || !review) return null;

  const handleApplyAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moderationReason.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      let targetStatus: ReviewReportStatus = "Clean";
      if (selectedAction === "hide") targetStatus = "Hidden";
      else if (selectedAction === "investigating") targetStatus = "Under Review";
      else if (selectedAction === "strike") targetStatus = "Hidden";

      onUpdateStatus(review.id, targetStatus, moderationReason);
      setIsSubmitting(false);
      setSuccessToast(`Review status updated to ${targetStatus}`);
      setTimeout(() => {
        setSuccessToast(null);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Review Moderation
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                {review.id}
              </span>
            </div>
            <h2 className="text-base font-bold text-[#001B40] mt-0.5">
              Investigate & Moderate Review
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm">
          {successToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
              <span>✓</span>
              <span>{successToast}</span>
            </div>
          )}

          {/* Star Rating & Review Text Card */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400 text-base">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {star <= review.stars ? "★" : "☆"}
                  </span>
                ))}
                <span className="ml-1 text-xs font-bold text-neutral-600">
                  {review.stars}.0 / 5.0
                </span>
              </div>
              <span className="text-xs text-neutral-400">{review.date}</span>
            </div>
            <p className="text-neutral-900 font-medium text-sm leading-relaxed">
              &ldquo;{review.reviewText}&rdquo;
            </p>
            {review.subAnnotation && (
              <div className="text-xs text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block">
                ⚠ {review.subAnnotation}
              </div>
            )}
          </div>

          {/* Context Cross-References */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-neutral-200 bg-white">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase">Reviewer</span>
              <p className="text-xs font-bold text-[#001B40] mt-1">{review.reviewerName}</p>
              <span className="text-[11px] text-neutral-500">{review.reviewerRole}</span>
              <div className="mt-2 text-[10px] text-neutral-400">
                Subnet: 102.89.44.xx · Account age: 2 days
              </div>
            </div>

            <div className="p-3 rounded-xl border border-neutral-200 bg-white">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase">Reviewed Worker</span>
              <p className="text-xs font-bold text-[#001B40] mt-1">{review.reviewedUserName}</p>
              <span className="text-[11px] text-neutral-500">{review.trade}</span>
              <div className="mt-2">
                <Link
                  href={`/ops/users/${review.reviewedUserId}`}
                  className="text-[11px] font-semibold text-[#074292] hover:underline"
                >
                  View worker profile →
                </Link>
              </div>
            </div>
          </div>

          {/* Linked Job / Case */}
          <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase">Linked Marketplace Job</span>
              <p className="text-xs font-bold text-neutral-900 mt-0.5">{review.jobId} · {review.jobTitle || review.trade}</p>
            </div>
            <Link
              href={`/ops/jobs`}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            >
              Open Job
            </Link>
          </div>

          {review.linkedDisputeId && (
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase">Active Dispute Cross-Reference</span>
                <p className="text-xs font-semibold text-amber-900 mt-0.5">
                  Case {review.linkedDisputeId} is currently open for arbitration.
                </p>
              </div>
              <Link
                href={`/ops/disputes/${review.linkedDisputeId}`}
                className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
              >
                Inspect Dispute
              </Link>
            </div>
          )}

          {review.linkedSafetyIncidentId && (
            <div className="p-3 rounded-xl border border-red-200 bg-red-50/50 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-red-800 uppercase">Safety Incident Cross-Reference</span>
                <p className="text-xs font-semibold text-red-900 mt-0.5">
                  Case {review.linkedSafetyIncidentId} involves physical property damage.
                </p>
              </div>
              <Link
                href={`/ops/safety`}
                className="text-xs font-bold px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Inspect Safety
              </Link>
            </div>
          )}

          {/* Moderation Actions Form */}
          <form onSubmit={handleApplyAction} className="pt-2 border-t border-neutral-200 space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Select Moderation Verdict
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    checked={selectedAction === "clean"}
                    onChange={() => setSelectedAction("clean")}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-bold text-neutral-900">Keep & Mark Clean</p>
                    <p className="text-[11px] text-neutral-500">Dismiss report. Review represents genuine customer feedback and stays public.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    checked={selectedAction === "hide"}
                    onChange={() => setSelectedAction("hide")}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-bold text-neutral-900">Hide from Public Profile</p>
                    <p className="text-[11px] text-neutral-500">
                      Remove rating impact from worker&apos;s score. Review is preserved in admin audit logs but hidden publicly.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    checked={selectedAction === "investigating"}
                    onChange={() => setSelectedAction("investigating")}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-bold text-neutral-900">Keep Under Review</p>
                    <p className="text-[11px] text-neutral-500">Pending safety investigation or dispute resolution conclusion.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-red-200 hover:bg-red-50/50 cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    checked={selectedAction === "strike"}
                    onChange={() => setSelectedAction("strike")}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-bold text-red-700">Hide & Strike Reviewer for Manipulation</p>
                    <p className="text-[11px] text-red-600">Flag reviewer account for malicious rating spam / retaliatory attack.</p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Administrative Reason & Audit Note <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="Explain the reason for this moderation decision. Recorded permanently against your admin account..."
                className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !moderationReason.trim()}
                className="px-5 py-2 rounded-xl bg-[#001B40] text-white text-xs font-bold hover:bg-[#074292] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSubmitting ? "Applying..." : "Save Moderation Decision"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
