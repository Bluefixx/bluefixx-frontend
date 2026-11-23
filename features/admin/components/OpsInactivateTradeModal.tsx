"use client";

import React, { useState } from "react";
import { AdminTradeCategory } from "../types";

interface OpsInactivateTradeModalProps {
  trade: AdminTradeCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tradeId: string, reason: string) => void;
}

export function OpsInactivateTradeModal({
  trade,
  isOpen,
  onClose,
  onConfirm,
}: OpsInactivateTradeModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !trade) return null;

  const handleDeactivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(trade.id, reason);
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-base font-extrabold text-[#001B40]">
            Inactivate {trade.name}?
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-sm p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Warning Alert Box */}
        <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-2">
          <div className="flex items-start gap-2.5">
            <span className="text-red-600 text-base mt-0.5">⚠</span>
            <div className="text-xs text-red-950 font-medium space-y-1.5 leading-relaxed">
              <p className="font-bold text-red-950">
                Customers can no longer post jobs in this trade:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-red-900">
                <li>Existing jobs continue to completion</li>
                <li>The trade is hidden from the mobile and web apps</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleDeactivate} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the decision. This is recorded against your admin account."
              className="w-full p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
            />
          </div>

          <p className="text-[11px] text-neutral-400 italic">
            This action is written to the activity log with your admin ID and timestamp.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              {isSubmitting ? "Processing..." : "Deactivate trade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
