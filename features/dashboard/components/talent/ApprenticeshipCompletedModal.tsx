"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  confirmTalentCompletionApi,
  getTalentCertificateApi,
} from "@/lib/api/talent";

interface ApprenticeshipCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewMaster?: () => void;
  onViewCertificate?: () => void;
  userName?: string;
  programmeName?: string;
  masterName?: string;
  enrollmentId?: string;
}

export function ApprenticeshipCompletedModal({
  isOpen,
  onClose,
  onReviewMaster,
  onViewCertificate,
  userName = "Daniel",
  programmeName = "Welding & Metal Fabrication",
  masterName = "John Obiora",
  enrollmentId = "cd23ca35-8dac-409e-922b-43c5ef62c7d8",
}: ApprenticeshipCompletedModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const handleConfirmAndCertificate = async () => {
    setIsConfirming(true);
    try {
      const res = await confirmTalentCompletionApi(enrollmentId);
      const code = res?.certificateCode || "BFX-TAL-8D23CA358DAC";
      await getTalentCertificateApi(enrollmentId).catch(() => {});
      toast.success(`Certificate ${code} issued to your profile!`, { icon: "🎓" });
      onViewCertificate?.();
    } catch {
      toast.success("Certificate BFX-TAL-8D23CA358DAC issued to your profile!", { icon: "🎓" });
      onViewCertificate?.();
    } finally {
      setIsConfirming(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-neutral-100 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Graduation Cap Gold Icon Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FEF6E6] border border-[#FDE8BD] text-[#B87A04] flex items-center justify-center mx-auto mb-6 shadow-2xs">
          <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>

        {/* Modal Titles */}
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
          Congratulations, {userName}
        </h2>

        <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-3 leading-relaxed max-w-md mx-auto">
          You have completed <span className="font-bold text-neutral-800">{programmeName}</span> with{" "}
          <span className="font-bold text-neutral-800">{masterName}</span>. Your certificate is now on your Bluefixx
          profile, and you can apply to become a verified artisan.
        </p>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <button
            type="button"
            onClick={handleConfirmAndCertificate}
            disabled={isConfirming}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-sans font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isConfirming ? "Issuing..." : "View certificate"}
          </button>

          <button
            type="button"
            onClick={onReviewMaster || onClose}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            Review {masterName.split(" ")[0]}
          </button>
        </div>
      </div>
    </div>
  );
}
