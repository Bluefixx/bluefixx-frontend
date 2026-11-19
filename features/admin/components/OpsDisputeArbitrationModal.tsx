"use client";

import React, { useState } from "react";
import { AdminJob } from "../types";
import toast from "react-hot-toast";

interface OpsDisputeArbitrationModalProps {
  job: AdminJob | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (
    job: AdminJob,
    outcome: "WORKER_FULL" | "CUSTOMER_FULL" | "SPLIT",
    workerSharePercent: number,
    justification: string
  ) => void;
}

export function OpsDisputeArbitrationModal({
  job,
  isOpen,
  onClose,
  onResolve,
}: OpsDisputeArbitrationModalProps) {
  const [outcome, setOutcome] = useState<"WORKER_FULL" | "CUSTOMER_FULL" | "SPLIT">("SPLIT");
  const [workerSharePercent, setWorkerSharePercent] = useState<number>(50);
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !job || !job.disputeDetails) return null;

  const totalValue = job.value;
  const workerPayout = Math.round((totalValue * workerSharePercent) / 100);
  const customerRefund = totalValue - workerPayout;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      toast.error("Please enter a binding arbitration justification.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      onResolve(job, outcome, workerSharePercent, justification);
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-neutral-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-lg">
              ⚖️
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Dispute Arbitration Center</h3>
              <p className="text-xs text-neutral-500 font-mono">
                {job.id} · Total Locked Escrow: ₦{totalValue.toLocaleString()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
            ✕
          </button>
        </div>

        {/* Both Parties Evidence Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-rose-800 uppercase">Customer Claim</span>
              <span className="text-[11px] text-rose-600">{job.customer.name}</span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed italic">
              &ldquo;{job.disputeDetails.customerClaim}&rdquo;
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-blue-800 uppercase">Worker Rebuttal</span>
              <span className="text-[11px] text-blue-600">{job.worker?.name || "Artisan"}</span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed italic">
              &ldquo;{job.disputeDetails.workerRebuttal || "No formal rebuttal filed yet."}&rdquo;
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-2">Select Arbitration Ruling</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setOutcome("WORKER_FULL");
                  setWorkerSharePercent(100);
                }}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition-colors ${
                  outcome === "WORKER_FULL"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                100% to Worker
                <div className="text-[10px] font-normal text-neutral-500 mt-0.5">Dismiss customer claim</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOutcome("SPLIT");
                  setWorkerSharePercent(50);
                }}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition-colors ${
                  outcome === "SPLIT"
                    ? "border-[#001B40] bg-neutral-50 text-[#001B40]"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                Split Escrow
                <div className="text-[10px] font-normal text-neutral-500 mt-0.5">Custom percentage</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOutcome("CUSTOMER_FULL");
                  setWorkerSharePercent(0);
                }}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition-colors ${
                  outcome === "CUSTOMER_FULL"
                    ? "border-rose-600 bg-rose-50 text-rose-800"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                100% to Customer
                <div className="text-[10px] font-normal text-neutral-500 mt-0.5">Full customer refund</div>
              </button>
            </div>
          </div>

          {outcome === "SPLIT" && (
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700">Worker Share: {workerSharePercent}%</span>
                <span className="font-bold text-neutral-700">Customer Refund: {100 - workerSharePercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                step="5"
                value={workerSharePercent}
                onChange={(e) => setWorkerSharePercent(parseInt(e.target.value, 10))}
                className="w-full accent-[#001B40]"
              />
              <div className="flex justify-between text-xs pt-1 border-t border-neutral-200">
                <span className="text-emerald-700 font-bold">Worker gets: ₦{workerPayout.toLocaleString()}</span>
                <span className="text-rose-700 font-bold">Customer gets: ₦{customerRefund.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Binding Arbitration Justification (Logged to audit ledger) *
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Detail findings based on photographic proof and vendor terms..."
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
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#001B40] hover:bg-neutral-800 rounded-xl transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? "Executing Ruling..." : "Execute Binding Ruling"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
