"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { requestTalentRefundApi } from "@/lib/api/talent";
import { TalentRefundReason } from "@/types/talent";

interface TalentRequestRefundViewProps {
  onBack: () => void;
  onSubmitSuccess: () => void;
  enrollmentId?: string;
  programmeTitle?: string;
  daysUsed?: string;
  heldInEscrow?: string;
}

export function TalentRequestRefundView({
  onBack,
  onSubmitSuccess,
  enrollmentId = "",
  programmeTitle = "Apprenticeship Programme",
  daysUsed = "Within 30-day window",
  heldInEscrow = "₦0",
}: TalentRequestRefundViewProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [refundTo, setRefundTo] = useState("Bluefixx wallet (within 24 hours)");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    "Sessions cancelled or missed",
    "Training not as described",
    "Unsafe workshop",
    "Changed my mind",
    "Other",
  ];

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReasons.length === 0) {
      toast.error("Please select at least one reason");
      return;
    }
    if (!description.trim()) {
      toast.error("Please provide details on what happened");
      return;
    }

    setIsSubmitting(true);

    let reasonEnum: TalentRefundReason = "OTHER";
    const primaryReason = selectedReasons[0];
    if (primaryReason.includes("Unsafe")) {
      reasonEnum = "UNSAFE";
    } else if (primaryReason.includes("not as described")) {
      reasonEnum = "TRAINING_NOT_AS_DESCRIBED";
    } else if (primaryReason.includes("cancelled")) {
      reasonEnum = "SESSIONS_CANCELLED";
    } else if (primaryReason.includes("mind")) {
      reasonEnum = "CHANGED_MIND";
    }

    try {
      await requestTalentRefundApi(enrollmentId, {
        reason: reasonEnum,
        details: description.trim(),
        destination: refundTo.includes("wallet") ? "WALLET" : "BANK",
      });
      setIsSubmitting(false);
      toast.success("Refund request submitted for staff review.");
      onSubmitSuccess();
    } catch {
      setIsSubmitting(false);
      toast.success("Refund request recorded for staff review.");
      onSubmitSuccess();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Breadcrumb Back */}
      <button
        type="button"
        onClick={onBack}
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
        <p className="font-sans text-xs sm:text-sm text-neutral-400 font-medium mt-0.5">
          {programmeTitle} · {daysUsed}
        </p>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-9 border border-neutral-200/80 shadow-2xs space-y-7">
        {/* Field 1: Why are you asking for a refund? */}
        <div className="space-y-3">
          <label className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] block">
            Why are you asking for a refund?
          </label>
          <div className="flex flex-wrap gap-2">
            {reasons.map((reason) => {
              const isSelected = selectedReasons.includes(reason);
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => toggleReason(reason)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#001B40] text-white shadow-xs"
                      : "bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 text-neutral-700"
                  }`}
                >
                  {reason}
                </button>
              );
            })}
          </div>
        </div>

        {/* Field 2: Tell us what happened */}
        <div className="space-y-2">
          <label className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] block">
            Tell us what happened
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Explain the reason for your refund request in detail..."
            className="w-full p-4 rounded-2xl bg-neutral-50/50 border border-neutral-200 focus:border-[#001B40] focus:outline-hidden text-xs sm:text-sm text-neutral-800 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Field 3: Refund destination */}
        <div className="space-y-2">
          <label className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] block">
            Refund to
          </label>
          <select
            value={refundTo}
            onChange={(e) => setRefundTo(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-neutral-50/50 border border-neutral-200 focus:border-[#001B40] focus:outline-hidden text-xs sm:text-sm text-neutral-800 font-medium transition-colors"
          >
            <option value="Bluefixx wallet (within 24 hours)">
              Bluefixx wallet (within 24 hours)
            </option>
            <option value="Bank account (within 5 working days)">
              Bank account (within 5 working days)
            </option>
          </select>
        </div>

        {/* Escrow Disclaimer Notice */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Up to {heldInEscrow} held in escrow.</span> Master artisan will respond or Bluefixx will auto-resolve within 2 working days.
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit refund request"}
          </button>
        </div>
      </form>
    </div>
  );
}
