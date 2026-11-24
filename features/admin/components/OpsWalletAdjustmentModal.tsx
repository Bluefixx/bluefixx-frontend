"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { AdminUser } from "../types";
import { adjustAdminAccountWalletApi } from "@/lib/api/admin-users";

interface OpsWalletAdjustmentModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAdjustment: (updatedUser: AdminUser) => void;
}

export function OpsWalletAdjustmentModal({
  user,
  isOpen,
  onClose,
  onConfirmAdjustment,
}: OpsWalletAdjustmentModalProps) {
  const [type, setType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [purpose, setPurpose] = useState("Goodwill Compensation");
  const [amountStr, setAmountStr] = useState("5000");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentNaira = Math.round(user.walletBalanceKobo / 100);
  const parsedAmount = Math.max(0, parseInt(amountStr.replace(/\D/g, ""), 10) || 0);

  const newBalanceNaira =
    type === "CREDIT"
      ? currentNaira + parsedAmount
      : Math.max(0, currentNaira - parsedAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      toast.error("Please enter a valid amount greater than ₦0.");
      return;
    }
    const cleanReason = reason.trim();
    if (cleanReason.length < 5) {
      toast.error("An audit reason of at least 5 characters is required.");
      return;
    }

    const adjustmentKobo = parsedAmount * 100;
    if (type === "DEBIT" && adjustmentKobo > user.walletBalanceKobo) {
      toast.error("Debit amount cannot exceed the user's available balance.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullReason = `${purpose}: ${cleanReason}`;
      const res = await adjustAdminAccountWalletApi(user.id, {
        direction: type,
        amountKobo: adjustmentKobo,
        reason: fullReason,
      });

      const updatedAvailableKobo = parseInt(res.available, 10);
      const updatedReservedKobo = parseInt(res.reserved, 10);

      const auditNote = {
        id: `note-${Date.now()}`,
        author: "Simeon Daniel (Admin)",
        text: `Wallet ${type}: ₦${parsedAmount.toLocaleString("en-NG")} for ${purpose}. Reason: ${cleanReason}`,
        createdAt: "Just now",
      };

      const updated: AdminUser = {
        ...user,
        walletBalanceKobo: isNaN(updatedAvailableKobo) ? user.walletBalanceKobo : updatedAvailableKobo,
        escrowBalanceKobo: isNaN(updatedReservedKobo) ? user.escrowBalanceKobo : updatedReservedKobo,
        internalNotes: [auditNote, ...(user.internalNotes || [])],
      };

      onConfirmAdjustment(updated);
      toast.success(
        `Wallet ${type === "CREDIT" ? "credited" : "debited"} with ₦${parsedAmount.toLocaleString("en-NG")}!`
      );
      onClose();
    } catch (err: any) {
      const msg = err?.message || "Failed to adjust wallet balance.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150 border border-neutral-200">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div>
            <h3 className="font-heading font-bold text-lg text-[#0F1115]">
              Adjust Wallet Balance
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              User: <strong className="text-[#001B40]">{user.fullName}</strong> ({user.userCode})
            </p>
          </div>
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

        {/* Current vs New Balance Card */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Current Balance</span>
            <span className="font-heading font-bold text-base text-[#001B40] mt-0.5 block">
              ₦{currentNaira.toLocaleString("en-NG")}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Projected Balance</span>
            <span
              className={`font-heading font-bold text-base mt-0.5 block ${
                type === "CREDIT" ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              ₦{newBalanceNaira.toLocaleString("en-NG")}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Credit vs Debit Toggle */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("CREDIT")}
                className={`py-2.5 rounded-xl border font-bold text-xs transition-colors cursor-pointer ${
                  type === "CREDIT"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                + Credit Funds (Add)
              </button>
              <button
                type="button"
                onClick={() => setType("DEBIT")}
                className={`py-2.5 rounded-xl border font-bold text-xs transition-colors cursor-pointer ${
                  type === "DEBIT"
                    ? "bg-red-50 border-red-500 text-red-800"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                − Debit Funds (Deduct)
              </button>
            </div>
          </div>

          {/* Purpose Dropdown */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
              Adjustment Category <span className="text-red-500">*</span>
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 font-medium text-xs text-neutral-900 bg-white focus:outline-none focus:border-[#001B40] cursor-pointer"
            >
              <option value="Goodwill Compensation">Goodwill Compensation (Platform Courtesy)</option>
              <option value="Dispute Resolution Refund">Dispute Resolution Escrow Refund</option>
              <option value="Promotional Bonus">Promotional / Campaign Credit</option>
              <option value="Penalty / Chargeback Deduction">Penalty / Chargeback Deduction</option>
              <option value="Manual Accounting Correction">Manual Accounting Correction</option>
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
              Amount (₦) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 font-bold">
                ₦
              </span>
              <input
                type="text"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="5,000"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none focus:border-[#001B40]"
                required
              />
            </div>
          </div>

          {/* Detailed Reason */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
              Compliance Reason & Ticket Ref <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Approved per dispute #DISP-9102 regarding job delay."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-[#001B40]"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
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
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50 ${
                type === "CREDIT"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isSubmitting ? "Processing..." : `Confirm ${type === "CREDIT" ? "Credit" : "Debit"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
