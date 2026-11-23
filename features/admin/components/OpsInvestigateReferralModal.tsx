"use client";

import React, { useState } from "react";
import { formatNaira } from "@/lib/utils/currency";
import { AdminReferralItem } from "../types";

interface OpsInvestigateReferralModalProps {
  referral: AdminReferralItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmHold: (referralId: string, reason: string) => void;
}

export function OpsInvestigateReferralModal({
  referral,
  isOpen,
  onClose,
  onConfirmHold,
}: OpsInvestigateReferralModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !referral) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmHold(referral.id, reason.trim());
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200 text-xs">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-base font-extrabold text-[#001B40]">
            Investigate {referral.id}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-sm p-1 rounded-md cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Warning Callout Matching Screenshot */}
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
            <span>⚠</span>
            <span>Flag this referral for fraud review</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-amber-800 text-[11px] leading-relaxed">
            <li>
              Withhold <strong className="text-amber-950">{formatNaira(referral.rewardKobo, true)}</strong> pending payout to{" "}
              <strong className="text-amber-950">{referral.referrerName}</strong>.
            </li>
            <li>Linked accounts are checked for device and IP overlap.</li>
            <li>Referral earnings are frozen until fraud investigation completes.</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-neutral-700">
                Reason <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-neutral-400">Share with fraud team and user log</span>
            </div>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the decision. This is recorded against your admin account."
              className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40] text-xs"
            />
          </div>

          <p className="text-[11px] text-neutral-500 italic">
            This action is written to the activity log with your admin ID and timestamp.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              {isSubmitting ? "Holding..." : "Hold total reward"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
