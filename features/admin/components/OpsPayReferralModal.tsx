"use client";

import React, { useState } from "react";
import { formatNaira } from "@/lib/utils/currency";
import { AdminReferralItem } from "../types";

interface OpsPayReferralModalProps {
  referral: AdminReferralItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPay: (referralId: string) => void;
}

export function OpsPayReferralModal({
  referral,
  isOpen,
  onClose,
  onConfirmPay,
}: OpsPayReferralModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !referral) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmPay(referral.id);
      setIsProcessing(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200 text-xs">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-base font-extrabold text-[#001B40]">
            Pay {formatNaira(referral.rewardKobo, true)} reward?
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
        <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#001B40] text-xs">
            <span>ℹ</span>
            <span>The reward is credited to the referrer wallet.</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-neutral-600 text-[11px] leading-relaxed">
            <li>
              <strong className="text-neutral-900">{formatNaira(referral.rewardKobo, true)}</strong> credited to{" "}
              <strong className="text-neutral-900">{referral.referrerName}</strong>.
            </li>
            <li>Reward becomes withdrawable immediately to their commercial bank account.</li>
            <li>Qualifying activity verified: {referral.relatedActivity}.</li>
          </ul>
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
            type="button"
            disabled={isProcessing}
            onClick={handlePay}
            className="px-5 py-2 rounded-xl bg-[#001B40] text-white font-bold hover:bg-[#074292] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
          >
            {isProcessing ? "Processing..." : "Pay reward"}
          </button>
        </div>
      </div>
    </div>
  );
}
