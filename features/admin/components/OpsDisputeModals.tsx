"use client";

import React, { useState } from "react";
import { AdminDispute, DisputeEvidenceAttachment, DisputeParty } from "../types";

// ==========================================
// 1. Resolve Dispute Modal
// ==========================================
interface OpsDisputeResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispute: AdminDispute;
  onConfirm: (outcome: string, reason: string) => void;
}

export function OpsDisputeResolveModal({
  isOpen,
  onClose,
  dispute,
  onConfirm,
}: OpsDisputeResolveModalProps) {
  const [outcome, setOutcome] = useState("Release full escrow to worker");
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const calculateAmounts = () => {
    const total = dispute.escrowAmount;
    if (outcome === "Release full escrow to worker") {
      const fee = total * 0.1;
      return { worker: total - fee, customer: 0, fee };
    }
    if (outcome === "Release support to customer") {
      return { worker: 0, customer: total, fee: 0 };
    }
    if (outcome === "Split escrow agreed") {
      const splitHalf = total / 2;
      const fee = splitHalf * 0.1;
      return { worker: splitHalf - fee, customer: splitHalf, fee };
    }
    // No evidence
    const fee = total * 0.1;
    return { worker: total - fee, customer: 0, fee };
  };

  const amounts = calculateAmounts();

  const handleProceed = () => {
    if (!reason.trim()) {
      alert("Please provide an explanatory reason for the arbitration decision.");
      return;
    }
    onConfirm(outcome, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
          <h3 className="text-base font-bold text-[#001B40]">Resolve and move money?</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>

        {/* Warning Alert Banner */}
        <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl mb-4 text-xs text-amber-900 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <svg className="w-4 h-4 text-amber-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
            <span>{outcome}</span>
          </div>
          <p className="leading-relaxed text-[11px] text-amber-800">
            {outcome === "Release full escrow to worker" &&
              "Customer claims will be dismissed and funds released to the worker's wallet. Involves over ₦100,000 — requires Operations Admin sign-off."}
            {outcome === "Release support to customer" &&
              "Customer will receive a 100% refund voucher memo. Worker will not receive escrow balance."}
            {outcome === "Split escrow agreed" &&
              "Escrow will be split 50/50 between customer refund and worker earnings with platform fee adjusted."}
            {outcome === "No evidence provided" &&
              "Dispute closed in favor of contractor due to claimant failing to provide verifiable evidence within SLA."}
          </p>
        </div>

        {/* Decision Category */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
              Decision category *
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#001B40]"
            >
              <option value="Release full escrow to worker">Release full escrow to worker</option>
              <option value="Release support to customer">Release support to customer</option>
              <option value="Split escrow agreed">Split escrow agreed</option>
              <option value="No evidence provided">No evidence provided</option>
            </select>
          </div>

          {/* Money Breakdown Preview */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Customer refund</span>
              <span className="font-bold text-neutral-900">₦{amounts.customer.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Worker payout</span>
              <span className="font-bold text-emerald-700">₦{amounts.worker.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Platform fee</span>
              <span className="font-bold text-neutral-700">₦{amounts.fee.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Reason *
              </label>
              <span className="text-[10px] text-neutral-400">Shared with both parties & logged</span>
            </div>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the decision. This is recorded against your admin account and shared with both parties."
              className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#001B40]"
            />
          </div>
        </div>

        <p className="text-[10px] text-neutral-400 mb-5">
          This action will write an irreversible audit event to the security logs under your admin identity.
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProceed}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#001B40] text-white hover:bg-[#074292] shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>Confirm resolution</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. Approve Refund Modal
// ==========================================
interface OpsDisputeRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispute: AdminDispute;
  onConfirm: (reason: string) => void;
}

export function OpsDisputeRefundModal({
  isOpen,
  onClose,
  dispute,
  onConfirm,
}: OpsDisputeRefundModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleProceed = () => {
    if (!reason.trim()) {
      alert("Please provide a reason for the refund authorization.");
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
          <h3 className="text-base font-bold text-[#001B40]">Approve refund from this case?</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl mb-4 text-xs text-red-900 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-red-950">
            <svg className="w-4 h-4 text-red-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Refund ₦{dispute.escrowAmount.toLocaleString()} to {dispute.customer.name}</span>
          </div>
          <p className="leading-relaxed text-[11px] text-red-800">
            • Creates a refund record linked directly to dispute {dispute.id}.
            <br />
            • Requires Operations Admin PIN authentication.
          </p>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Reason *
              </label>
              <span className="text-[10px] text-neutral-400">Recorded against your admin account</span>
            </div>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the decision. This is recorded against your admin account."
              className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#001B40]"
            />
          </div>

          <p className="text-[11px] font-semibold text-red-700 bg-red-50/60 p-2.5 rounded-lg border border-red-100">
            A ₦{dispute.escrowAmount.toLocaleString()} debit memo voucher is issued and will be settled to the user's account.
          </p>
        </div>

        <p className="text-[10px] text-neutral-400 mb-5">
          This action will be written to the activity log with your admin identity and is irreversible.
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProceed}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors"
          >
            Request refund approval
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. Escalate Dispute Modal
// ==========================================
interface OpsDisputeEscalateModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispute: AdminDispute;
  onConfirm: (reason: string) => void;
}

export function OpsDisputeEscalateModal({
  isOpen,
  onClose,
  dispute,
  onConfirm,
}: OpsDisputeEscalateModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleProceed = () => {
    if (!reason.trim()) {
      alert("Please provide a reason for escalating this case.");
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
          <h3 className="text-base font-bold text-[#001B40]">Escalate this dispute?</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl mb-4 text-xs text-neutral-800 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-[#001B40]">
            <svg className="w-4 h-4 text-indigo-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="17 11 12 6 7 11" />
              <polyline points="17 18 12 13 7 18" />
            </svg>
            <span>This case moves to the Trust & Safety lead with full history:</span>
          </div>
          <ul className="text-[11px] text-neutral-600 list-disc list-inside space-y-1 pl-1">
            <li>Escalates to @Olubisi Adeyemi</li>
            <li>SLA resets to 24 hrs</li>
            <li>Both parties are notified the case is under senior review</li>
          </ul>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Reason *
              </label>
              <span className="text-[10px] text-neutral-400">Shared with Trust & Safety team</span>
            </div>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this requires senior escalation (e.g. conflicting gate logs, suspected contractor collusion, large value)."
              className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#001B40]"
            />
          </div>
        </div>

        <p className="text-[10px] text-neutral-400 mb-5">
          This action will be written to the activity log under your admin identity. Irreversible.
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProceed}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#001B40] text-white hover:bg-[#074292] shadow-sm transition-colors"
          >
            Escalate case
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. Request Info Modal
// ==========================================
interface OpsDisputeRequestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispute: AdminDispute;
  onConfirm: (target: string, requestText: string, deadlineHours: number) => void;
}

export function OpsDisputeRequestInfoModal({
  isOpen,
  onClose,
  dispute,
  onConfirm,
}: OpsDisputeRequestInfoModalProps) {
  const [targetParty, setTargetParty] = useState<"BOTH" | "CUSTOMER" | "WORKER">("BOTH");
  const [requestText, setRequestText] = useState("");
  const [deadline, setDeadline] = useState(48);

  if (!isOpen) return null;

  const handleProceed = () => {
    if (!requestText.trim()) {
      alert("Please state the specific evidence or clarification required.");
      return;
    }
    onConfirm(targetParty, requestText, deadline);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
          <h3 className="text-base font-bold text-[#001B40]">Request Information / Evidence</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3.5 mb-5">
          <div>
            <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
              Direct request to:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetParty("BOTH")}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-colors ${
                  targetParty === "BOTH"
                    ? "bg-[#001B40] text-white border-[#001B40]"
                    : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                Both Parties
              </button>
              <button
                type="button"
                onClick={() => setTargetParty("CUSTOMER")}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border truncate transition-colors ${
                  targetParty === "CUSTOMER"
                    ? "bg-[#001B40] text-white border-[#001B40]"
                    : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                Customer only
              </button>
              <button
                type="button"
                onClick={() => setTargetParty("WORKER")}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border truncate transition-colors ${
                  targetParty === "WORKER"
                    ? "bg-[#001B40] text-white border-[#001B40]"
                    : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                Worker only
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
              Required documentation / items:
            </label>
            <textarea
              rows={3}
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder="Specify required documents: e.g. timestamped photos of fitted hinges, purchase receipts for timber, or estate visitor pass."
              className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#001B40]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
              Response SLA deadline:
            </label>
            <select
              value={deadline}
              onChange={(e) => setDeadline(Number(e.target.value))}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#001B40]"
            >
              <option value={24}>24 Hours (Urgent)</option>
              <option value={48}>48 Hours (Standard)</option>
              <option value={72}>72 Hours (Extended)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProceed}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#001B40] text-white hover:bg-[#074292] shadow-sm transition-colors"
          >
            Send request
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// FEATURE 2: Integrated Evidence Media Lightbox
// & Before / After Comparison Modal
// ==========================================
interface OpsEvidenceLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: DisputeEvidenceAttachment[];
  initialFileIndex?: number;
}

export function OpsEvidenceLightboxModal({
  isOpen,
  onClose,
  files,
  initialFileIndex = 0,
}: OpsEvidenceLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialFileIndex);
  const [viewMode, setViewMode] = useState<"SINGLE" | "COMPARISON">("SINGLE");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || files.length === 0) return null;

  const currentFile = files[currentIndex] || files[0];
  const beforeFiles = files.filter((f) => !f.isAfterProof);
  const afterFiles = files.filter((f) => f.isAfterProof);
  const beforeFile = beforeFiles[0] || files[0];
  const afterFile = afterFiles[0] || files[files.length - 1];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % files.length);
    setZoomLevel(1);
    setRotation(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
    setZoomLevel(1);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f172a] text-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-700">
        {/* Header Toolbar */}
        <div className="h-14 px-5 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-[#090d16]">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-neutral-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <span>Evidence Lightbox</span>
            </span>

            {/* Mode Switcher */}
            <div className="flex items-center rounded-lg bg-neutral-800 p-0.5 ml-4 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("SINGLE")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  viewMode === "SINGLE"
                    ? "bg-[#001B40] text-white font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Single Inspection
              </button>
              <button
                type="button"
                onClick={() => setViewMode("COMPARISON")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  viewMode === "COMPARISON"
                    ? "bg-[#001B40] text-white font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Before / After Comparison
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {viewMode === "SINGLE" && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-300 mr-2">
                <button
                  type="button"
                  title="Zoom Out"
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </button>
                <span className="w-12 text-center text-[11px] font-mono">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  title="Zoom In"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </button>
                <button
                  type="button"
                  title="Rotate"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 ml-1"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body Viewport */}
        <div className="flex-1 flex overflow-hidden">
          {viewMode === "SINGLE" ? (
            <div className="flex-1 flex">
              {/* Media viewer */}
              <div className="flex-1 relative flex items-center justify-center p-4 bg-black/50 overflow-hidden select-none">
                <div
                  className="transition-transform duration-150 ease-out flex items-center justify-center max-w-full max-h-full"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  }}
                >
                  <img
                    src={currentFile.url}
                    alt={currentFile.name}
                    className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-2xl pointer-events-none"
                  />
                </div>

                {/* Left/Right carousel arrows */}
                {files.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white shadow-lg transition-transform hover:scale-105"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white shadow-lg transition-transform hover:scale-105"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Metadata Sidebar */}
              <div className="w-72 border-l border-neutral-800 bg-[#090d16] p-4 flex flex-col justify-between shrink-0">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                      File Information
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1 break-all">{currentFile.name}</h4>
                    <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
                      {currentFile.description || "No specific caption provided by uploader."}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-neutral-800 text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-400">Uploaded by</span>
                      <span className="font-semibold text-neutral-200">{currentFile.uploader}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-400">Uploaded at</span>
                      <span className="font-mono text-[11px] text-neutral-200">{currentFile.uploadedAt}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-400">Classification</span>
                      <span className={`inline-flex items-center whitespace-nowrap shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                        currentFile.isAfterProof ? "bg-amber-900/60 text-amber-300" : "bg-blue-900/60 text-blue-300"
                      }`}>
                        {currentFile.isAfterProof ? "After / Disputed State" : "Initial Pre-job Baseline"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-400">Integrity check</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        EXIF verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thumbnails Row */}
                <div className="pt-3 border-t border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">
                    Evidence Strip ({currentIndex + 1} of {files.length})
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {files.map((f, idx) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setCurrentIndex(idx);
                          setZoomLevel(1);
                          setRotation(0);
                        }}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-transform ${
                          idx === currentIndex ? "border-sky-400 scale-105" : "border-neutral-700 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Before & After Comparison Mode */
            <div className="flex-1 grid grid-cols-2 divide-x divide-neutral-800 bg-black/60 p-4 gap-4 overflow-y-auto">
              {/* Baseline / Before Card */}
              <div className="flex flex-col h-full bg-[#090d16] rounded-xl p-3 border border-neutral-800">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-2">
                  <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[11px] font-bold">
                    PRE-JOB BASELINE / INITIAL STATE
                  </span>
                  <span className="text-[11px] text-neutral-400">{beforeFile.name}</span>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden rounded-lg bg-neutral-900 p-2">
                  <img
                    src={beforeFile.url}
                    alt="Pre-job state"
                    className="max-h-[50vh] object-contain rounded"
                  />
                </div>
                <div className="pt-2 text-xs text-neutral-300 mt-2">
                  <span className="font-semibold text-white">Baseline Note: </span>
                  {beforeFile.description || "Customer site measurement prior to work commencement."}
                </div>
              </div>

              {/* Reported Damage / After Card */}
              <div className="flex flex-col h-full bg-[#090d16] rounded-xl p-3 border border-neutral-800">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-2">
                  <span className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 text-[11px] font-bold">
                    DISPUTED / CURRENT WORKMANSHIP STATE
                  </span>
                  <span className="text-[11px] text-neutral-400">{afterFile.name}</span>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden rounded-lg bg-neutral-900 p-2">
                  <img
                    src={afterFile.url}
                    alt="Disputed state"
                    className="max-h-[50vh] object-contain rounded"
                  />
                </div>
                <div className="pt-2 text-xs text-neutral-300 mt-2">
                  <span className="font-semibold text-white">Damage Claim: </span>
                  {afterFile.description || "Unfinished work and damage reported on site."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// FEATURE 3: Direct Disciplinary Sanctions Modal
// ==========================================
interface OpsDisciplinaryActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: DisputeParty;
  disputeId: string;
  onConfirm: (actionType: "FREEZE_PAYOUTS" | "SUSPEND_ACCOUNT" | "FORMAL_WARNING", reason: string) => void;
}

export function OpsDisciplinaryActionModal({
  isOpen,
  onClose,
  targetUser,
  disputeId,
  onConfirm,
}: OpsDisciplinaryActionModalProps) {
  const [actionType, setActionType] = useState<"FREEZE_PAYOUTS" | "SUSPEND_ACCOUNT" | "FORMAL_WARNING">(
    targetUser.role === "WORKER" ? "FREEZE_PAYOUTS" : "SUSPEND_ACCOUNT"
  );
  const [reasonCategory, setReasonCategory] = useState("Severe Conduct Violation");
  const [adminNotes, setAdminNotes] = useState("");

  if (!isOpen) return null;

  const handleProceed = () => {
    if (!adminNotes.trim()) {
      alert("Please provide detailed justification notes for this disciplinary sanction.");
      return;
    }
    onConfirm(actionType, `${reasonCategory}: ${adminNotes}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#001B40]">Apply Account Sanction</h3>
              <p className="text-xs text-neutral-500">
                Direct enforcement for {targetUser.name} ({targetUser.role})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>

        {/* Target User Summary Card */}
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 mb-4 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-[#001B40] block">{targetUser.name}</span>
            <span className="text-neutral-500 text-[11px]">{targetUser.code} · {targetUser.totalJobs} jobs on platform</span>
          </div>
          <span className="inline-flex items-center whitespace-nowrap shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
            Case: {disputeId}
          </span>
        </div>

        <div className="space-y-3.5 mb-4">
          <div>
            <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
              Select Sanction *
            </label>
            <div className="space-y-2">
              {targetUser.role === "WORKER" && (
                <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 cursor-pointer">
                  <input
                    type="radio"
                    name="sanctionType"
                    checked={actionType === "FREEZE_PAYOUTS"}
                    onChange={() => setActionType("FREEZE_PAYOUTS")}
                    className="mt-0.5 text-[#001B40] focus:ring-[#001B40]"
                  />
                  <div>
                    <span className="font-bold text-xs text-neutral-900 block">Freeze Payouts</span>
                    <span className="text-[11px] text-neutral-500 leading-snug">
                      Halts all wallet withdrawals immediately while allowing user to respond to dispute.
                    </span>
                  </div>
                </label>
              )}

              <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 cursor-pointer">
                <input
                  type="radio"
                  name="sanctionType"
                  checked={actionType === "SUSPEND_ACCOUNT"}
                  onChange={() => setActionType("SUSPEND_ACCOUNT")}
                  className="mt-0.5 text-[#001B40] focus:ring-[#001B40]"
                />
                <div>
                  <span className="font-bold text-xs text-red-700 block">Full Account Suspension</span>
                  <span className="text-[11px] text-neutral-500 leading-snug">
                    Terminates active sessions, prevents bidding/posting, and flags user in fraud database.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 cursor-pointer">
                <input
                  type="radio"
                  name="sanctionType"
                  checked={actionType === "FORMAL_WARNING"}
                  onChange={() => setActionType("FORMAL_WARNING")}
                  className="mt-0.5 text-[#001B40] focus:ring-[#001B40]"
                />
                <div>
                  <span className="font-bold text-xs text-amber-800 block">Issue Formal Policy Strike</span>
                  <span className="text-[11px] text-neutral-500 leading-snug">
                    Issues an official platform strike (1 of 3) with mandatory conduct acknowledgment.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
              Violation Category *
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#001B40]"
            >
              <option value="Severe Conduct Violation">Severe Conduct Violation</option>
              <option value="Repeated Job Abandonment">Repeated Job Abandonment</option>
              <option value="Suspected Asset Damage / Theft">Suspected Asset Damage / Theft</option>
              <option value="Off-Platform Payment Circumvention">Off-Platform Payment Circumvention</option>
              <option value="Refusal to Cooperate with Arbitration">Refusal to Cooperate with Arbitration</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Justification & Case Notes *
              </label>
              <span className="text-[10px] text-neutral-400">Recorded in user security audit</span>
            </div>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Detail the rationale for this sanction. Requires Admin PIN authorization to execute."
              className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#001B40]"
            />
          </div>
        </div>

        <p className="text-[10px] text-neutral-400 mb-5">
          This privileged operational action triggers the Operations Admin Security PIN modal before execution.
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProceed}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-red-700 text-white hover:bg-red-800 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Authorize Sanction</span>
          </button>
        </div>
      </div>
    </div>
  );
}
