"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { AdminUser } from "../types";

export type BulkActionType =
  | "VERIFY_KYC"
  | "REQUEST_DOCS"
  | "ADD_TAG"
  | "FREEZE_PAYOUTS"
  | "UNFREEZE_PAYOUTS";

interface OpsBulkActionModalProps {
  actionType: BulkActionType | null;
  selectedUsers: AdminUser[];
  isOpen: boolean;
  onClose: () => void;
  onApplyBulkAction: (updatedUsers: AdminUser[]) => void;
}

export function OpsBulkActionModal({
  actionType,
  selectedUsers,
  isOpen,
  onClose,
  onApplyBulkAction,
}: OpsBulkActionModalProps) {
  const [tagInput, setTagInput] = useState("VIP Customer");
  const [reRequestReason, setReRequestReason] = useState(
    "Please re-upload a clear and well-lit photo of your government-issued ID card."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !actionType || selectedUsers.length === 0) return null;

  const count = selectedUsers.length;

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      let updated: AdminUser[] = [];

      if (actionType === "VERIFY_KYC") {
        updated = selectedUsers.map((u) => ({
          ...u,
          verificationStatus: "VERIFIED" as const,
          internalNotes: [
            {
              id: `note-${Date.now()}-${u.id}`,
              author: "Simeon Daniel (Bulk Admin)",
              text: "KYC approved via bulk operations review.",
              createdAt: "Just now",
            },
            ...(u.internalNotes || []),
          ],
        }));
        toast.success(`Verified KYC for ${count} users!`);
      } else if (actionType === "REQUEST_DOCS") {
        updated = selectedUsers.map((u) => ({
          ...u,
          verificationStatus: "UNDER_REVIEW" as const,
          internalNotes: [
            {
              id: `note-${Date.now()}-${u.id}`,
              author: "Simeon Daniel (Bulk Admin)",
              text: `Document re-request dispatched: "${reRequestReason}"`,
              createdAt: "Just now",
            },
            ...(u.internalNotes || []),
          ],
        }));
        toast.success(`Document re-request notification sent to ${count} users.`);
      } else if (actionType === "ADD_TAG") {
        const cleanTag = tagInput.trim();
        if (!cleanTag) {
          toast.error("Please enter a tag name.");
          setIsSubmitting(false);
          return;
        }
        updated = selectedUsers.map((u) => ({
          ...u,
          tags: Array.from(new Set([...(u.tags || []), cleanTag])),
        }));
        toast.success(`Tag "${cleanTag}" added to ${count} users.`);
      } else if (actionType === "FREEZE_PAYOUTS") {
        updated = selectedUsers.map((u) => ({
          ...u,
          payoutsFrozen: true,
          internalNotes: [
            {
              id: `note-${Date.now()}-${u.id}`,
              author: "Simeon Daniel (Bulk Admin)",
              text: "Payout withdrawals frozen by bulk operations safeguard.",
              createdAt: "Just now",
            },
            ...(u.internalNotes || []),
          ],
        }));
        toast.success(`Payouts frozen for ${count} users.`);
      } else if (actionType === "UNFREEZE_PAYOUTS") {
        updated = selectedUsers.map((u) => ({
          ...u,
          payoutsFrozen: false,
        }));
        toast.success(`Payouts unfrozen for ${count} users.`);
      }

      onApplyBulkAction(updated);
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150 border border-neutral-200">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div>
            <h3 className="font-heading font-bold text-lg text-[#0F1115]">
              {actionType === "VERIFY_KYC" && "Bulk Approve Verification"}
              {actionType === "REQUEST_DOCS" && "Bulk Document Re-Request"}
              {actionType === "ADD_TAG" && "Bulk Tag Users"}
              {actionType === "FREEZE_PAYOUTS" && "Bulk Freeze Payouts"}
              {actionType === "UNFREEZE_PAYOUTS" && "Bulk Unfreeze Payouts"}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Affects <strong className="text-[#001B40]">{count} selected users</strong>
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

        {actionType === "VERIFY_KYC" && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <p className="font-bold">
              Are you sure you want to mark all {count} selected users as Verified?
            </p>
            <p className="text-emerald-700 text-[11px] leading-relaxed">
              This will grant them immediate access to receive quotes, accept bookings, and publish apprenticeship offerings.
            </p>
          </div>
        )}

        {actionType === "REQUEST_DOCS" && (
          <div className="space-y-3 text-xs">
            <label className="block font-bold text-neutral-800">
              Notification & SMS Message to Send:
            </label>
            <textarea
              rows={3}
              value={reRequestReason}
              onChange={(e) => setReRequestReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-[#001B40]"
              required
            />
            <p className="text-[11px] text-neutral-400">
              Selected users will receive an in-app notice and SMS prompting them to re-upload.
            </p>
          </div>
        )}

        {actionType === "ADD_TAG" && (
          <div className="space-y-3 text-xs">
            <label className="block font-bold text-neutral-800">
              Choose or Enter Tag:
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {["VIP Customer", "Power Artisan", "Watchlist", "High Volume", "Lagos Pro"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTagInput(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                    tagInput === t
                      ? "bg-[#001B40] text-white border-[#001B40]"
                      : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. VIP Customer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-[#001B40]"
              required
            />
          </div>
        )}

        {actionType === "FREEZE_PAYOUTS" && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <p className="font-bold">
              Freeze wallet withdrawal payouts for {count} users?
            </p>
            <p className="text-amber-700 text-[11px] leading-relaxed">
              Users will still be able to browse and perform jobs, but bank payout requests will be blocked pending operational clearance.
            </p>
          </div>
        )}

        {actionType === "UNFREEZE_PAYOUTS" && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
            <p className="font-bold">
              Restore payout access for {count} users?
            </p>
            <p className="text-blue-700 text-[11px] leading-relaxed">
              Withdrawals will immediately be allowed according to their tier limits.
            </p>
          </div>
        )}

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
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? "Applying..." : "Confirm Bulk Action"}
          </button>
        </div>
      </div>
    </div>
  );
}
