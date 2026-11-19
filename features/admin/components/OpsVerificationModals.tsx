"use client";

import React, { useState } from "react";
import { WorkerVerificationCase } from "../types";

interface ApproveVerificationModalProps {
  vCase: WorkerVerificationCase | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (vCase: WorkerVerificationCase) => void;
}

export function OpsApproveVerificationModal({
  vCase,
  isOpen,
  onClose,
  onConfirm,
}: ApproveVerificationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !vCase) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(vCase);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-neutral-200 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-neutral-900 text-lg">Approve {vCase.worker.name}?</h3>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <span>⚠️</span>
              <span>The worker becomes verified and enters job-matching immediately.</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-700 pl-1">
              <li>Verified badge is added to matching in <strong>{vCase.worker.trade}</strong></li>
              <li>Wallet withdrawals are approved</li>
              <li>Channel is notified as &ldquo;Approved by Admin&rdquo;</li>
            </ul>
          </div>

          <p className="text-[11px] text-neutral-500 leading-normal">
            This action is written to the audit log with your admin ID and a timestamp.
          </p>

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
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#001B40] hover:bg-neutral-800 rounded-xl transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? "Approving..." : "Approve verification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// Request More Information Modal
// ==========================================

interface RequestInfoModalProps {
  vCase: WorkerVerificationCase | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (vCase: WorkerVerificationCase, category: string, message: string) => void;
}

export function OpsRequestInfoModal({
  vCase,
  isOpen,
  onClose,
  onConfirm,
}: RequestInfoModalProps) {
  const [category, setCategory] = useState("Identity mismatch");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !vCase) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(vCase, category, message);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-neutral-200 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-neutral-900 text-lg">
            Request more information from {vCase.worker.name}
          </h3>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <span>⚠️</span>
              <span>The case moves to &ldquo;requires more information&rdquo; and the worker is asked to resubmit.</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-700 pl-1">
              <li>Counts to your quota until the worker responds</li>
              <li>Tell the worker your reason precisely</li>
              <li>Auto-reminder sent every 48 hrs</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Reason category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#001B40]"
            >
              <option value="Identity mismatch">Identity mismatch</option>
              <option value="Document expired">Document expired</option>
              <option value="Guarantor details incomplete">Guarantor details incomplete</option>
              <option value="Proof of address match fail">Proof of address match fail</option>
              <option value="Unclear / blurry photo">Unclear / blurry photo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Message *</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the worker exactly what is needed..."
              className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-[#001B40]"
              required
            />
          </div>

          <p className="text-[11px] text-neutral-500 leading-normal">
            This action is written to the activity log with your admin ID and a timestamp.
          </p>

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
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#001B40] hover:bg-neutral-800 rounded-xl transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Request info & next"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// Reject Verification Modal (Screenshot 6)
// ==========================================

interface RejectVerificationModalProps {
  vCase: WorkerVerificationCase | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (vCase: WorkerVerificationCase, category: string, reason: string) => void;
}

export function OpsRejectVerificationModal({
  vCase,
  isOpen,
  onClose,
  onConfirm,
}: RejectVerificationModalProps) {
  const [category, setCategory] = useState("Identity mismatch");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !vCase) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(vCase, category, reason);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-neutral-200 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-neutral-900 text-lg">Reject {vCase.worker.name}?</h3>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl text-xs text-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-900 font-bold">
              <span>⚠️</span>
              <span>The worker stays unverified and cannot work.</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-700 pl-1">
              <li>Cannot receive jobs via search/matching</li>
              <li>Stay unverified on {vCase.worker.trade} status</li>
              <li>Flagged registration logged to prevent fraudulent re-registration</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Reason category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-600"
            >
              <option value="Identity mismatch">Identity mismatch</option>
              <option value="Document forged or altered">Document forged or altered</option>
              <option value="Expired/invalid document">Expired/invalid document</option>
              <option value="Trade qualification not substantiated">Trade qualification not substantiated</option>
              <option value="Proof of address match fail">Proof of address match fail</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Reason *</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the decision. This is recorded against your admin account."
              className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-rose-600"
              required
            />
          </div>

          <p className="text-[11px] text-neutral-500 leading-normal">
            The artisan will be notified. The activity log with your admin ID and timestamp is preserved.
          </p>

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
              {isSubmitting ? "Rejecting..." : "Reject verification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
