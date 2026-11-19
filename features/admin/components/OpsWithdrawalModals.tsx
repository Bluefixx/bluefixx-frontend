"use client";

import React, { useState } from "react";
import { AdminWithdrawal } from "../types";
import toast from "react-hot-toast";

// ==========================================
// Single Withdrawal Review / Investigate Modal
// ==========================================

interface SingleWithdrawalModalProps {
  withdrawal: AdminWithdrawal | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (wd: AdminWithdrawal) => void;
  onReject: (wd: AdminWithdrawal, reason: string) => void;
}

export function OpsWithdrawalReviewModal({
  withdrawal,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: SingleWithdrawalModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !withdrawal) return null;

  const handleApproveClick = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onApprove(withdrawal);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      onReject(withdrawal, rejectReason);
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
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#001B40] flex items-center justify-center text-lg">
              🏦
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Withdrawal Payout Review</h3>
              <p className="text-xs text-neutral-500 font-mono">{withdrawal.id} · Requested {withdrawal.requestedAt}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
            ✕
          </button>
        </div>

        {/* Worker & Amount Hero */}
        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 mb-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-neutral-500 uppercase">Worker</div>
            <div className="font-bold text-neutral-900 text-sm mt-0.5">{withdrawal.worker.name}</div>
            <div className="text-xs text-neutral-500 font-mono">
              {withdrawal.worker.code} • {withdrawal.worker.trade}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold text-neutral-500 uppercase">Payout Amount</div>
            <div className="font-extrabold text-lg text-[#001B40] mt-0.5">
              ₦{withdrawal.amount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Bank & Name Match Verification */}
        <div className="p-4 rounded-2xl border border-neutral-200 space-y-2.5 mb-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-700">Destination Bank</span>
            <span className="text-neutral-900 font-semibold">{withdrawal.destinationBank.bankName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Account Number</span>
            <span className="font-mono text-neutral-900 font-medium">
              {withdrawal.destinationBank.accountNumber}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <span className="text-neutral-500">Account Name</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-neutral-900">{withdrawal.destinationBank.accountName}</span>
              {withdrawal.destinationBank.nameMatchStatus === "MATCH" && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                  ✓ Match
                </span>
              )}
              {withdrawal.destinationBank.nameMatchStatus === "PARTIAL" && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                  ⚠️ Partial
                </span>
              )}
              {withdrawal.destinationBank.nameMatchStatus === "MISMATCH" && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                  🚨 Mismatch
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Risk Warning Note if present */}
        {withdrawal.riskNote && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 mb-4 flex items-start gap-2">
            <span className="text-rose-600 font-bold">⚠️</span>
            <div>
              <strong>Security Flag:</strong> {withdrawal.riskNote}
            </div>
          </div>
        )}

        {showRejectForm ? (
          <form onSubmit={handleRejectSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Rejection Reason (Returned to worker) *
              </label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Bank account name mismatch with KYC documents."
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-rose-600"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="px-3 py-1.5 text-xs text-neutral-600"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl"
              >
                Confirm Rejection & Revert Funds
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowRejectForm(true)}
              className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition-colors"
            >
              Reject Payout
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleApproveClick}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
              >
                {isSubmitting ? "Approving..." : "Approve & Release Payout"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Batch Payout Processing Modal (Feature 4)
// ==========================================

interface BatchPayoutModalProps {
  selectedWithdrawals: AdminWithdrawal[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmBatch: (withdrawals: AdminWithdrawal[]) => void;
}

export function OpsBatchPayoutModal({
  selectedWithdrawals,
  isOpen,
  onClose,
  onConfirmBatch,
}: BatchPayoutModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || selectedWithdrawals.length === 0) return null;

  const totalAmount = selectedWithdrawals.reduce((acc, w) => acc + w.amount, 0);

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmBatch(selectedWithdrawals);
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-neutral-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#001B40] text-white flex items-center justify-center text-lg">
              ⚡
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Batch Payout Execution</h3>
              <p className="text-xs text-neutral-500">
                Consolidated release for {selectedWithdrawals.length} selected worker payouts
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
            ✕
          </button>
        </div>

        {/* Total Batch Hero Card */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-900">Total Batch Disbursement</div>
            <div className="text-[11px] text-emerald-700">Deducted from Bluefixx NIBSS settlement account</div>
          </div>
          <div className="font-extrabold text-xl text-emerald-900">
            ₦{totalAmount.toLocaleString()}
          </div>
        </div>

        {/* Selected List Preview */}
        <div className="border border-neutral-200 rounded-2xl overflow-hidden mb-4 max-h-48 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
              <tr>
                <th className="py-2 px-3">Worker</th>
                <th className="py-2 px-3">Bank</th>
                <th className="py-2 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {selectedWithdrawals.map((w) => (
                <tr key={w.id}>
                  <td className="py-2.5 px-3 font-semibold">{w.worker.name}</td>
                  <td className="py-2.5 px-3 text-neutral-600">
                    {w.destinationBank.bankName} · {w.destinationBank.accountNumber}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-neutral-900">
                    ₦{w.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-[11px] text-neutral-500 leading-normal mb-4">
          Each worker will receive an instant SMS & in-app receipt confirmation. Bank transfer references will be logged in the audit ledger.
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#001B40] hover:bg-neutral-800 rounded-xl transition-colors shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? "Processing Batch..." : `Authorize ₦${totalAmount.toLocaleString()} Batch`}
          </button>
        </div>
      </div>
    </div>
  );
}
