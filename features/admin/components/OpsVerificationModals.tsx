"use client";

import React, { useState, useEffect } from "react";
import { WorkerVerificationCase } from "../types";
import { RequestInfoCategory, RejectedStep } from "@/lib/api/admin-verification";

// ==========================================
// Approve Verification Modal
// ==========================================

interface ApproveVerificationModalProps {
  vCase: WorkerVerificationCase | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    vCase: WorkerVerificationCase,
    verifiedLegalName: string,
    note?: string
  ) => Promise<void> | void;
}

export function OpsApproveVerificationModal({
  vCase,
  isOpen,
  onClose,
  onConfirm,
}: ApproveVerificationModalProps) {
  const [verifiedLegalName, setVerifiedLegalName] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vCase) {
      setVerifiedLegalName(vCase.worker.name || "");
      setNote("Identity and portfolio evidence reviewed and verified.");
    }
  }, [vCase]);

  if (!isOpen || !vCase) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedLegalName.trim()) return;

    setIsSubmitting(true);
    try {
      await onConfirm(vCase, verifiedLegalName.trim(), note.trim());
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-neutral-200 animate-in fade-in zoom-in-95 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-neutral-900 text-lg">Approve {vCase.worker.name}?</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <span>✓</span>
              <span>The worker becomes verified and enters job-matching immediately.</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-700 pl-1 text-[11px]">
              <li>
                Verified badge added to matching in <strong>{vCase.worker.trade}</strong>
              </li>
              <li>Wallet withdrawal limits unlocked</li>
              <li>Notification dispatched: &ldquo;Account Approved by Admin&rdquo;</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Verified Legal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={verifiedLegalName}
              onChange={(e) => setVerifiedLegalName(e.target.value)}
              placeholder="e.g. Ada Chukwu Example"
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
            />
            <p className="text-[10px] text-neutral-400 mt-1">
              Must match government-issued identity evidence document.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Approval Audit Note
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Internal verification notes..."
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
            />
          </div>

          <p className="text-[11px] text-neutral-500 leading-normal">
            This action is permanently recorded in the audit log with your admin identity.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !verifiedLegalName.trim()}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Approving..." : "Confirm & Approve"}
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
  onConfirm: (
    vCase: WorkerVerificationCase,
    category: RequestInfoCategory,
    message: string
  ) => Promise<void> | void;
}

export function OpsRequestInfoModal({
  vCase,
  isOpen,
  onClose,
  onConfirm,
}: RequestInfoModalProps) {
  const [category, setCategory] = useState<RequestInfoCategory>("Identity mismatch");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !vCase) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await onConfirm(vCase, category, message.trim());
      onClose();
      setMessage("");
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-neutral-200 animate-in fade-in zoom-in-95 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-neutral-900 text-lg">
            Request more information from {vCase.worker.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <span>💬</span>
              <span>
                The case moves to &ldquo;requires more information&rdquo; and the worker is prompted to resubmit.
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-700 pl-1 text-[11px]">
              <li>Identity status reverts to PENDING</li>
              <li>Feedback message is delivered to worker via notification</li>
              <li>Audit entry logged with category and timestamp</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Reason category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RequestInfoCategory)}
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#001B40]"
            >
              <option value="Identity mismatch">Identity mismatch</option>
              <option value="Document expired">Document expired</option>
              <option value="Guarantor details incomplete">Guarantor details incomplete</option>
              <option value="Proof of address match fail">Proof of address match fail</option>
              <option value="Unclear / blurry photo">Unclear / blurry photo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Message to Worker <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the worker exactly what document or correction is needed..."
              className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Sending..." : "Request Info & Notify"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// Reject Verification Modal
// ==========================================

interface RejectVerificationModalProps {
  vCase: WorkerVerificationCase | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    vCase: WorkerVerificationCase,
    category: string,
    reason: string,
    rejectedSteps: RejectedStep[]
  ) => Promise<void> | void;
}

export function OpsRejectVerificationModal({
  vCase,
  isOpen,
  onClose,
  onConfirm,
}: RejectVerificationModalProps) {
  const [category, setCategory] = useState("Identity mismatch");
  const [reason, setReason] = useState("");
  const [rejectedSteps, setRejectedSteps] = useState<RejectedStep[]>(["identity"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !vCase) return null;

  const toggleStep = (step: RejectedStep) => {
    setRejectedSteps((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || rejectedSteps.length === 0) return;

    setIsSubmitting(true);
    try {
      await onConfirm(vCase, category, reason.trim(), rejectedSteps);
      onClose();
      setReason("");
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-neutral-200 animate-in fade-in zoom-in-95 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-neutral-900 text-lg">Reject {vCase.worker.name}?</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl text-xs text-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-900 font-bold">
              <span>⚠️</span>
              <span>The worker stays unverified and cannot take marketplace jobs.</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-700 pl-1 text-[11px]">
              <li>Blocked from job discovery and incoming booking offers</li>
              <li>Verification status updated to REJECTED</li>
              <li>Artisan notified with documented rejection decision</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Rejected Step(s) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { id: "identity", label: "Identity & KYC" },
                { id: "trades", label: "Trade Qualifications" },
                { id: "portfolio", label: "Portfolio Evidence" },
                { id: "pricing", label: "Pricing & Services" },
                { id: "details", label: "Profile Details" },
              ].map((step) => {
                const isChecked = rejectedSteps.includes(step.id as RejectedStep);
                return (
                  <label
                    key={step.id}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-rose-50 border-rose-300 text-rose-900 font-semibold"
                        : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStep(step.id as RejectedStep)}
                      className="rounded text-rose-600 focus:ring-0 cursor-pointer"
                    />
                    <span>{step.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Reason category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-rose-600"
            >
              <option value="Identity mismatch">Identity mismatch</option>
              <option value="Document forged or altered">Document forged or altered</option>
              <option value="Expired/invalid document">Expired/invalid document</option>
              <option value="Trade qualification not substantiated">
                Trade qualification not substantiated
              </option>
              <option value="Proof of address match fail">Proof of address match fail</option>
              <option value="Portfolio requirements not met">Portfolio requirements not met</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Decision Note <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the rejection decision. This is recorded on the worker profile and audit logs..."
              className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-rose-600"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim() || rejectedSteps.length === 0}
              className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
