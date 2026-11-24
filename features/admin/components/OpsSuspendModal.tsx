"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { AdminUser } from "../types";
import { updateAdminAccountStatusApi } from "@/lib/api/admin-users";

interface OpsSuspendModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSuspension: (userId: string, category: string, reason: string) => void;
}

const SUSPENSION_CATEGORIES = [
  "Repeated policy / safety violations",
  "Fraud / suspicious financial activity",
  "Unresponsive on active bookings",
  "Identity / verification fraud",
  "Abusive language or customer harassment",
  "Off-platform payment solicitation",
  "Quality / substandard delivery complaints",
  "Other operational reasons",
];

export function OpsSuspendModal({
  user,
  isOpen,
  onClose,
  onConfirmSuspension,
}: OpsSuspendModalProps) {
  const [category, setCategory] = useState(SUSPENSION_CATEGORIES[0]);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanReason = reason.trim();
    if (cleanReason.length < 5) {
      toast.error("Please provide an audit reason of at least 5 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullReason = `${category}: ${cleanReason}`;
      await updateAdminAccountStatusApi(user.id, {
        enabled: false,
        reason: fullReason,
      });

      onConfirmSuspension(user.id, category, cleanReason);
      toast.success(`Account for ${user.fullName} has been suspended.`);
      onClose();
    } catch (err: any) {
      const msg = err?.message || "Failed to suspend account.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150 border border-neutral-200">
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <h3 className="font-heading font-bold text-lg text-[#0F1115]">
            Suspend {user.fullName}?
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Red Warning Banner (Screenshot 6 exact layout) */}
        <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/80 text-xs text-red-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-red-800 text-xs">
            <svg className="w-4 h-4 shrink-0 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Suspending this account blocks all marketplace activity immediately:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-red-700 text-[11px] leading-relaxed">
            <li>Active jobs and quotes won&apos;t be visible to search or hire</li>
            <li>Wallet withdrawals are disabled while suspended</li>
            <li>The user receives an email explaining the suspension</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Category */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
              Reason category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#001B40] bg-white cursor-pointer"
              required
            >
              {SUSPENSION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Reason Details */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
              Reason details <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the decision. This is recorded against your admin ID."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm text-neutral-800 focus:outline-none focus:border-[#001B40] placeholder:text-neutral-400"
              required
            />
          </div>

          {/* Audit Notice */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-1">
            <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>An action is written to the activity log with your Admin ID for audit compliance.</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? "Suspending..." : "Suspend account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
