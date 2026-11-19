"use client";

import React, { useState } from "react";
import { AdminTransaction } from "../types";
import toast from "react-hot-toast";

// ==========================================
// Force Escrow Release Modal (Feature 3)
// ==========================================

interface ForceReleaseModalProps {
  transaction: AdminTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tx: AdminTransaction, justification: string) => void;
}

export function OpsTxForceReleaseModal({
  transaction,
  isOpen,
  onClose,
  onConfirm,
}: ForceReleaseModalProps) {
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      toast.error("Please provide an administrative reason.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(transaction, justification);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-neutral-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg">
              💰
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Force Escrow Release</h3>
              <p className="text-xs text-neutral-500 font-mono">
                {transaction.id} · Ref: {transaction.gatewayRef}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
            ✕
          </button>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4 text-xs text-emerald-900 space-y-1.5">
          <div className="font-bold">Immediate Payout Release:</div>
          <div>
            Worker net earnings of <strong>₦{transaction.workerEarnings.toLocaleString()}</strong> will be released
            from escrow directly into <strong>{transaction.worker.name}&apos;s</strong> wallet ledger.
          </div>
          <div className="text-[11px] text-emerald-700 pt-1">
            Bluefixx 10% platform fee (₦{transaction.platformFee.toLocaleString()}) moves to settled platform revenue.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Administrative Justification (Audit Log) *
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="e.g. Work confirmed completed by customer verbally or photo proof. Customer inactive for >48h."
              className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? "Releasing..." : "Authorize Escrow Release"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// Issue Full or Split Refund Modal (Feature 3)
// ==========================================

interface TxRefundModalProps {
  transaction: AdminTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    tx: AdminTransaction,
    refundAmount: number,
    splitPercent: number,
    reason: string
  ) => void;
}

export function OpsTxRefundModal({
  transaction,
  isOpen,
  onClose,
  onConfirm,
}: TxRefundModalProps) {
  const [refundMode, setRefundMode] = useState<"FULL" | "SPLIT">("FULL");
  const [customerSplitPercent, setCustomerSplitPercent] = useState<number>(100);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !transaction) return null;

  const total = transaction.grossAmount;
  const customerRefund =
    refundMode === "FULL" ? total : Math.round((total * customerSplitPercent) / 100);
  const workerPayout = total - customerRefund;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please enter a refund justification.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(transaction, customerRefund, customerSplitPercent, reason);
      setIsSubmitting(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-neutral-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-lg">
              ↩️
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Issue Escrow Refund</h3>
              <p className="text-xs text-neutral-500 font-mono">
                {transaction.id} · Total Escrow: ₦{total.toLocaleString()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">Refund Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRefundMode("FULL");
                  setCustomerSplitPercent(100);
                }}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition-colors ${
                  refundMode === "FULL"
                    ? "border-[#001B40] bg-neutral-50 text-[#001B40]"
                    : "border-neutral-200 text-neutral-600"
                }`}
              >
                <div>Full 100% Refund</div>
                <div className="text-[11px] font-normal text-neutral-500 mt-0.5">
                  ₦{total.toLocaleString()} to customer
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRefundMode("SPLIT");
                  setCustomerSplitPercent(50);
                }}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition-colors ${
                  refundMode === "SPLIT"
                    ? "border-[#001B40] bg-neutral-50 text-[#001B40]"
                    : "border-neutral-200 text-neutral-600"
                }`}
              >
                <div>Split / Partial Refund</div>
                <div className="text-[11px] font-normal text-neutral-500 mt-0.5">
                  Custom customer & worker share
                </div>
              </button>
            </div>
          </div>

          {refundMode === "SPLIT" && (
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
              <div className="flex justify-between text-xs font-bold text-neutral-700">
                <span>Customer Refund: {customerSplitPercent}%</span>
                <span>Worker Share: {100 - customerSplitPercent}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={customerSplitPercent}
                onChange={(e) => setCustomerSplitPercent(parseInt(e.target.value, 10))}
                className="w-full accent-[#001B40]"
              />
              <div className="flex justify-between text-xs pt-1 border-t border-neutral-200">
                <span className="text-rose-700 font-bold">Customer receives: ₦{customerRefund.toLocaleString()}</span>
                <span className="text-emerald-700 font-bold">Worker receives: ₦{workerPayout.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Reason / Resolution Category *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Worker failed to complete job, customer requested cancellation."
              className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-[#001B40]"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : `Execute ₦${customerRefund.toLocaleString()} Refund`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
