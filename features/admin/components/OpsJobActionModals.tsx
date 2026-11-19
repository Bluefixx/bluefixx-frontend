"use client";

import React, { useState } from "react";
import { AdminJob } from "../types";
import toast from "react-hot-toast";

// ==========================================
// Force Escrow Release Modal
// ==========================================

interface ForceReleaseModalProps {
  job: AdminJob | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (job: AdminJob, reason: string) => void;
}

export function OpsForceReleaseModal({ job, isOpen, onClose, onConfirm }: ForceReleaseModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide an administrative justification.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(job, reason);
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg">
              💰
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Force Escrow Release</h3>
              <p className="text-xs text-neutral-500 font-mono">{job.id} · {job.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
            ✕
          </button>
        </div>

        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl mb-4 text-xs text-emerald-900 leading-relaxed">
          <strong>Immediate Financial Effect:</strong> The full worker payout amount of{" "}
          <strong>₦{Math.round(job.escrowDetails.workerPayoutKobo / 100).toLocaleString()}</strong> will be released from
          escrow directly into <strong>{job.worker?.name || "the worker"}&apos;s wallet</strong>.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Administrative Reason / Compliance Justification *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Work verified completed via photo evidence. Customer unresponsive to sign-off prompts for >48h."
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
              {isSubmitting ? "Processing..." : "Confirm & Release Escrow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// Admin Customer Refund Modal
// ==========================================

interface RefundModalProps {
  job: AdminJob | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (job: AdminJob, refundAmount: number, reason: string) => void;
}

export function OpsRefundModal({ job, isOpen, onClose, onConfirm }: RefundModalProps) {
  const [refundType, setRefundType] = useState<"FULL" | "PARTIAL">("FULL");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = refundType === "FULL" ? job.value : parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0 || amount > job.value) {
      toast.error(`Please enter a valid refund amount up to ₦${job.value.toLocaleString()}`);
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason for the refund.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(job, amount, reason);
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
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-lg">
              ↩️
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Issue Escrow Refund</h3>
              <p className="text-xs text-neutral-500 font-mono">{job.id} · Total Value: ₦{job.value.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">Refund Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRefundType("FULL")}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition-colors ${
                  refundType === "FULL"
                    ? "border-[#001B40] bg-neutral-50 text-[#001B40]"
                    : "border-neutral-200 text-neutral-600"
                }`}
              >
                <div>Full Refund (100%)</div>
                <div className="text-[11px] font-normal text-neutral-500 mt-0.5">₦{job.value.toLocaleString()}</div>
              </button>
              <button
                type="button"
                onClick={() => setRefundType("PARTIAL")}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition-colors ${
                  refundType === "PARTIAL"
                    ? "border-[#001B40] bg-neutral-50 text-[#001B40]"
                    : "border-neutral-200 text-neutral-600"
                }`}
              >
                <div>Partial Refund</div>
                <div className="text-[11px] font-normal text-neutral-500 mt-0.5">Custom amount</div>
              </button>
            </div>
          </div>

          {refundType === "PARTIAL" && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Refund Amount (₦) *
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="e.g. 20000"
                max={job.value}
                className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-[#001B40]"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Refund Reason *</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why the refund is being issued to the customer..."
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
              {isSubmitting ? "Processing..." : "Process Refund"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// Emergency Reassign Worker Modal
// ==========================================

interface ReassignModalProps {
  job: AdminJob | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (job: AdminJob, newWorkerId: string, newWorkerName: string) => void;
}

const AVAILABLE_WORKERS_MOCK = [
  { id: "work-10", name: "Ibrahim Salisu", trade: "Plumbing", location: "Lagos — Ikeja", rating: 4.9 },
  { id: "work-11", name: "Emeka Eze", trade: "Electrical", location: "Lagos — VI", rating: 4.8 },
  { id: "work-12", name: "Kolapo Jinadu", trade: "Air conditioning", location: "Enugu — Independence", rating: 4.7 },
  { id: "work-13", name: "David Adeleke", trade: "Carpentry", location: "Abuja — Garki", rating: 4.8 },
];

export function OpsReassignWorkerModal({ job, isOpen, onClose, onConfirm }: ReassignModalProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = AVAILABLE_WORKERS_MOCK.find((w) => w.id === selectedWorkerId);
    if (!worker) {
      toast.error("Please select a verified replacement artisan.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(job, worker.id, worker.name);
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
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg">
              🔄
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Emergency Worker Reassignment</h3>
              <p className="text-xs text-neutral-500 font-mono">{job.id} · {job.trade} in {job.location}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">
              Select Verified Replacement Artisan in {job.trade} *
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {AVAILABLE_WORKERS_MOCK.map((w) => (
                <div
                  key={w.id}
                  onClick={() => setSelectedWorkerId(w.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    selectedWorkerId === w.id
                      ? "border-[#001B40] bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div>
                    <div className="font-bold text-neutral-900">{w.name}</div>
                    <div className="text-[11px] text-neutral-500">{w.trade} • {w.location}</div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <span>★</span>
                    <span>{w.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Administrative Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Previous worker suspended mid-job. Reassigned to nearest verified professional."
              className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-[#001B40]"
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
              disabled={isSubmitting || !selectedWorkerId}
              className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? "Reassigning..." : "Reassign Artisan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
