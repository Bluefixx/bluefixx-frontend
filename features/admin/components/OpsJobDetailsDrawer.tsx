"use client";

import React, { useState, useEffect } from "react";
import { AdminJob } from "../types";
import {
  getAdminJobDetailApi,
  mapBackendJobToAdminJob,
  BackendAdminJobDetailResponse,
} from "@/lib/api/admin-jobs";
import toast from "react-hot-toast";

interface OpsJobDetailsDrawerProps {
  job: AdminJob | null;
  onClose: () => void;
  onForceReleaseEscrow: (job: AdminJob) => void;
  onIssueRefund: (job: AdminJob) => void;
  onReassignWorker: (job: AdminJob) => void;
  onOpenArbitration: (job: AdminJob) => void;
}

export function OpsJobDetailsDrawer({
  job: initialJob,
  onClose,
  onForceReleaseEscrow,
  onIssueRefund,
  onReassignWorker,
  onOpenArbitration,
}: OpsJobDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "escrow" | "proof" | "history">("overview");
  const [job, setJob] = useState<AdminJob | null>(initialJob);
  const [detailRaw, setDetailRaw] = useState<BackendAdminJobDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    if (!initialJob) {
      setJob(null);
      setDetailRaw(null);
      return;
    }
    setJob(initialJob);
    let isMounted = true;
    setIsLoadingDetail(true);

    getAdminJobDetailApi(initialJob.id)
      .then((res) => {
        if (!isMounted) return;
        setDetailRaw(res);
        setJob(mapBackendJobToAdminJob(res));
      })
      .catch((err) => {
        console.warn("Could not fetch full job detail, using summary item:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetail(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialJob?.id]);

  if (!job) return null;

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getPaymentBadge = (status: AdminJob["paymentStatus"]) => {
    switch (status) {
      case "IN_ESCROW":
        return (
          <span className="inline-flex items-center whitespace-nowrap shrink-0 gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            In Escrow
          </span>
        );
      case "HOLDING":
        return (
          <span className="inline-flex items-center whitespace-nowrap shrink-0 gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Holding
          </span>
        );
      case "RELEASED":
        return (
          <span className="inline-flex items-center whitespace-nowrap shrink-0 gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Released
          </span>
        );
      case "DISPUTED":
        return (
          <span className="inline-flex items-center whitespace-nowrap shrink-0 gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Disputed
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center whitespace-nowrap shrink-0 gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-300">
            Refunded
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center whitespace-nowrap shrink-0 gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
            Failed
          </span>
        );
    }
  };

  const getDeliveryBadge = (status: AdminJob["deliveryStatus"]) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center whitespace-nowrap shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            In Progress
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center whitespace-nowrap shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Completed
          </span>
        );
      case "POSTED":
        return (
          <span className="inline-flex items-center whitespace-nowrap shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Posted / Unassigned
          </span>
        );
      case "DISPUTED":
        return (
          <span className="inline-flex items-center whitespace-nowrap shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Disputed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center whitespace-nowrap shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-300">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center whitespace-nowrap shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/*Backdrop */}
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-bold text-neutral-900 bg-neutral-200/80 px-2 py-0.5 rounded">
                  {job.id}
                </span>
                <span className="text-xs text-neutral-500">Posted on {job.postedDate}</span>
                {isLoadingDetail && (
                  <span className="text-[10px] text-neutral-400 animate-pulse font-medium">Updating...</span>
                )}
                {job.needsAttention && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    ⚠️ Needs Attention
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-neutral-900 mt-1.5">{job.title}</h2>
              <div className="flex items-center gap-3 text-xs text-neutral-600 mt-1">
                <span>Trade: <strong className="text-neutral-800">{job.trade}</strong></span>
                <span>•</span>
                <span>Location: <strong className="text-neutral-800">{job.location}</strong></span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Attention Banner if applicable */}
          {job.needsAttention && (
            <div className="mx-6 mt-4 p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-3">
              <span className="text-amber-600 text-base mt-0.5">⚠️</span>
              <div className="flex-1">
                <div className="text-xs font-bold text-amber-900">
                  Operational Alert: {job.attentionReason?.replace("_", " ")}
                </div>
                <p className="text-xs text-amber-800 mt-0.5">{job.attentionDescription}</p>
              </div>
              {job.worker?.isSuspended && (
                <button
                  type="button"
                  onClick={() => onReassignWorker(job)}
                  className="px-2.5 py-1 text-xs font-bold bg-amber-700 text-white rounded-lg hover:bg-amber-800 shrink-0"
                >
                  Reassign Artisan
                </button>
              )}
            </div>
          )}

          {/* Dual-State Hero Card */}
          <div className="px-6 pt-4 pb-2">
            <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
              <div className="border-r border-neutral-200 pr-3">
                <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Delivery Lifecycle
                </div>
                <div className="flex items-center gap-2">
                  {getDeliveryBadge(job.deliveryStatus)}
                </div>
                <div className="text-xs text-neutral-500 mt-2">
                  Scheduled: <span className="text-neutral-800 font-medium">{job.scheduledDate || "Standard"}</span>
                </div>
              </div>

              <div className="pl-2">
                <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Escrow Financial State
                </div>
                <div className="flex items-center gap-2">
                  {getPaymentBadge(job.paymentStatus)}
                  <span className="text-sm font-extrabold text-neutral-900">{formatNaira(job.value)}</span>
                </div>
                <div className="text-xs text-neutral-500 mt-2">
                  Ref: <span className="font-mono text-neutral-700">{job.escrowDetails.gatewayRef || "escrow-init"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 border-b border-neutral-200 mt-2">
            <div className="flex gap-6">
              {[
                { id: "overview", label: "Overview & Parties" },
                { id: "escrow", label: "Escrow & Ledger" },
                { id: "proof", label: "Proof & Work Gallery" },
                { id: "history", label: "Audit Timeline" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 text-xs font-bold border-b-2 transition-colors ${activeTab === tab.id
                      ? "border-[#001B40] text-[#001B40]"
                      : "border-transparent text-neutral-500 hover:text-neutral-800"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Parties Involved */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Card */}
                  <div className="p-4 rounded-xl border border-neutral-200 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase">Customer</span>
                      <span className="text-[11px] font-mono text-neutral-400">{job.customer.code}</span>
                    </div>
                    <div className="font-bold text-neutral-900 text-sm">{job.customer.name}</div>
                    <div className="text-xs text-neutral-600 mt-1">{job.customer.phone}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{job.customer.email}</div>
                  </div>

                  {/* Worker Card */}
                  <div className="p-4 rounded-xl border border-neutral-200 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase">Assigned Worker</span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        {job.worker?.code || "Unassigned"}
                      </span>
                    </div>
                    {job.worker ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-neutral-900 text-sm">{job.worker.name}</div>
                          {job.worker.isSuspended && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                              Suspended
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-600 mt-1">{job.worker.phone}</div>
                        <div className="text-xs text-neutral-500 mt-0.5">Trade: {job.worker.trade}</div>
                      </>
                    ) : (
                      <div className="text-xs text-neutral-400 italic">No artisan assigned to this job yet</div>
                    )}
                  </div>
                </div>

                {/* Job Description & Location */}
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                  <div>
                    <div className="text-xs font-bold text-neutral-700 mb-1">Job Details & Scope</div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {job.description || "Customer booked emergency on-demand trade service."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-200">
                    <div className="text-xs font-bold text-neutral-700 mb-0.5">Service Location Address</div>
                    <p className="text-xs text-neutral-600">{job.address || job.location}</p>
                  </div>
                </div>

                {/* Dispute Section if active */}
                {job.disputeDetails && (
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-600 font-bold text-sm">Dispute Case Details</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-rose-200 text-rose-800 font-bold">
                          {job.disputeDetails.status}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenArbitration(job)}
                        className="px-3 py-1 bg-[#001B40] text-white text-xs font-bold rounded-lg hover:bg-neutral-800"
                      >
                        Arbitrate Case
                      </button>
                    </div>

                    <div className="text-xs text-neutral-700">
                      <strong>Customer Claim:</strong> &ldquo;{job.disputeDetails.customerClaim}&rdquo;
                    </div>

                    {job.disputeDetails.workerRebuttal && (
                      <div className="text-xs text-neutral-700 pt-1">
                        <strong>Artisan Rebuttal:</strong> &ldquo;{job.disputeDetails.workerRebuttal}&rdquo;
                      </div>
                    )}
                  </div>
                )}

                {/* Related Support Cases if any */}
                {detailRaw?.supportCases && detailRaw.supportCases.length > 0 && (
                  <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
                    <div className="text-xs font-bold text-neutral-800">Support Cases & Tickets</div>
                    <div className="divide-y divide-neutral-100">
                      {detailRaw.supportCases.map((c) => (
                        <div key={c.id} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-bold text-neutral-800">
                              {c.ticketNumber || c.id.slice(0, 8)}
                            </span>
                            <span className="text-neutral-600 ml-2">{c.subject}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                              {c.status}
                            </span>
                            <span className="text-[10px] text-neutral-400 uppercase font-mono">
                              {c.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "escrow" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                  <div className="text-xs font-bold text-neutral-700">Escrow Financial Breakdown</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Gross Customer Payment:</span>
                      <strong className="text-neutral-900">{formatNaira(job.value)}</strong>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Bluefixx Platform Fee (10%):</span>
                      <span className="text-neutral-800">
                        {formatNaira(Math.round(job.escrowDetails.platformFeeKobo / 100))}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-600 pt-2 border-t border-neutral-200">
                      <span>Artisan Payout Amount (90%):</span>
                      <strong className="text-emerald-700">
                        {formatNaira(Math.round(job.escrowDetails.workerPayoutKobo / 100))}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 space-y-2 text-xs text-neutral-600">
                  <div className="font-bold text-neutral-800 mb-1">Escrow Timestamps</div>
                  <div>Locked in Escrow: {job.escrowDetails.escrowLockedAt || "Pending"}</div>
                  <div>Released to Worker: {job.escrowDetails.escrowReleasedAt || "Not released"}</div>
                  <div>Gateway Settlement ID: {job.escrowDetails.gatewayRef || "N/A"}</div>
                </div>

                {/* Payments & Refunds Ledger */}
                {detailRaw?.payments && detailRaw.payments.length > 0 && (
                  <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
                    <div className="text-xs font-bold text-neutral-800">Transaction Payments</div>
                    <div className="divide-y divide-neutral-100">
                      {detailRaw.payments.map((p) => (
                        <div key={p.id} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-bold text-neutral-800">{p.reference}</span>
                            {p.channel && <span className="text-[10px] text-neutral-400 ml-2">({p.channel})</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900">
                              ₦{(Number(p.amountKobo) / 100).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                              {p.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detailRaw?.refunds && detailRaw.refunds.length > 0 && (
                  <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
                    <div className="text-xs font-bold text-neutral-800">Processed Customer Refunds</div>
                    <div className="divide-y divide-neutral-100">
                      {detailRaw.refunds.map((r) => (
                        <div key={r.id} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-neutral-700 font-medium">{r.reason || "Customer refund"}</span>
                            <div className="text-[10px] text-neutral-400">
                              {r.createdAt ? new Date(r.createdAt).toLocaleString("en-GB") : "Recently"}
                            </div>
                          </div>
                          <span className="font-bold text-rose-700">
                            -₦{(Number(r.amountKobo) / 100).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "proof" && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-neutral-700">Artisan Proof of Work</div>
                {detailRaw?.proofs && detailRaw.proofs.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {detailRaw.proofs.map((p) => (
                        <div key={p.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                              {p.type} Evidence
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-GB") : ""}
                            </span>
                          </div>
                          {p.url ? (
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block aspect-video bg-neutral-200 rounded-lg overflow-hidden border border-neutral-200 hover:opacity-90 transition-opacity"
                            >
                              <img src={p.url} alt={`${p.type} proof`} className="w-full h-full object-cover" />
                            </a>
                          ) : (
                            <div className="aspect-video bg-neutral-100 rounded-lg border border-dashed border-neutral-300 flex items-center justify-center text-xs text-neutral-400">
                              Photo File on Record
                            </div>
                          )}
                          {p.notes && <p className="text-xs text-neutral-600 italic">&ldquo;{p.notes}&rdquo;</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : job.proofOfWork ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600">
                      <strong>Worker Notes:</strong> {job.proofOfWork.notes || "No notes provided"}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-600 mb-2">Uploaded Evidence:</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-32 bg-neutral-100 rounded-xl border border-dashed border-neutral-300 flex items-center justify-center text-xs text-neutral-400">
                          Before Job Photo
                        </div>
                        <div className="h-32 bg-neutral-100 rounded-xl border border-dashed border-neutral-300 flex items-center justify-center text-xs text-neutral-400">
                          Completed Job Photo
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-400 text-xs">
                    No completion proof uploaded by artisan yet.
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-neutral-700 mb-2">Audit Timeline</div>
                {job.activityLog?.map((log) => (
                  <div key={log.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                    <div className="flex justify-between font-bold text-neutral-800">
                      <span>{log.action}</span>
                      <span className="text-[11px] font-normal text-neutral-400">{log.timestamp}</span>
                    </div>
                    <div className="text-neutral-500 mt-0.5">By {log.actor}</div>
                    {log.details && <div className="text-neutral-600 mt-1 italic">{log.details}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Operational Actions Footer */}
          <div className="p-5 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {job.paymentStatus === "IN_ESCROW" && (
                <button
                  type="button"
                  onClick={() => onForceReleaseEscrow(job)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
                >
                  Force Release to Worker
                </button>
              )}

              {(job.paymentStatus === "IN_ESCROW" || job.paymentStatus === "HOLDING" || job.paymentStatus === "DISPUTED") && (
                <button
                  type="button"
                  onClick={() => onIssueRefund(job)}
                  className="px-3.5 py-2 text-xs font-bold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-xl transition-colors shadow-xs"
                >
                  Issue Customer Refund
                </button>
              )}

              {job.worker?.isSuspended && (
                <button
                  type="button"
                  onClick={() => onReassignWorker(job)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs"
                >
                  Emergency Reassign
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
