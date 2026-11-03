"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface ArtisanSendQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle?: string;
  customerName?: string;
  onQuoteSent?: () => void;
}

export function ArtisanSendQuoteModal({
  isOpen,
  onClose,
  jobTitle = "Kitchen Plumbing Repair",
  customerName = "Daniel C.",
  onQuoteSent,
}: ArtisanSendQuoteModalProps) {
  const [labourFee, setLabourFee] = useState("25000");
  const [materialsFee, setMaterialsFee] = useState("10000");
  const [estimatedDuration, setEstimatedDuration] = useState("1 day");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalFee = (Number(labourFee) || 0) + (Number(materialsFee) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labourFee) {
      toast.error("Please enter your labour fee");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Quote of ₦${totalFee.toLocaleString("en-NG")} sent to ${customerName}!`, {
        icon: "📨",
        duration: 4000,
      });
      onQuoteSent?.();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-100 text-left animate-in zoom-in-95 duration-200"
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

        <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#001B40] tracking-tight">
          Send a Quote
        </h2>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 font-medium mt-1">
          {jobTitle} · For {customerName}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="font-sans font-bold text-xs text-neutral-700 block">
              Labour Fee (₦)
            </label>
            <input
              type="number"
              value={labourFee}
              onChange={(e) => setLabourFee(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 font-sans text-sm text-neutral-800 focus:outline-hidden focus:border-[#001B40]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-sans font-bold text-xs text-neutral-700 block">
              Estimated Materials Cost (₦) (Optional)
            </label>
            <input
              type="number"
              value={materialsFee}
              onChange={(e) => setMaterialsFee(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 font-sans text-sm text-neutral-800 focus:outline-hidden focus:border-[#001B40]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-sans font-bold text-xs text-neutral-700 block">
              Estimated Duration
            </label>
            <input
              type="text"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              placeholder="e.g. 1 day, 3 hours"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 font-sans text-sm text-neutral-800 focus:outline-hidden focus:border-[#001B40]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-sans font-bold text-xs text-neutral-700 block">
              Note to customer
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain how you will fix the problem, materials needed, and any warranty..."
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 font-sans text-sm text-neutral-800 focus:outline-hidden focus:border-[#001B40] resize-none"
            />
          </div>

          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
            <span className="font-sans text-xs text-neutral-500 font-medium">
              Total Quote Amount
            </span>
            <span className="font-heading font-extrabold text-base sm:text-lg text-[#001B40]">
              ₦{totalFee.toLocaleString("en-NG")}
            </span>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 font-sans font-semibold text-xs sm:text-sm text-neutral-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Submit Quote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

