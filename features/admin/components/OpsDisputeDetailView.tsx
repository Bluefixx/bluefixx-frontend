"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { AdminDispute, DisputeParty, DisputeEvidenceAttachment } from "../types";
import {
  OpsDisputeResolveModal,
  OpsDisputeRefundModal,
  OpsDisputeEscalateModal,
  OpsDisputeRequestInfoModal,
  OpsEvidenceLightboxModal,
  OpsDisciplinaryActionModal,
} from "./OpsDisputeModals";
import { OpsSecurityPinModal } from "./OpsSecurityPinModal";

interface OpsDisputeDetailViewProps {
  dispute: AdminDispute;
  onUpdateDispute?: (updated: AdminDispute) => void;
}

export function OpsDisputeDetailView({
  dispute: initialDispute,
  onUpdateDispute,
}: OpsDisputeDetailViewProps) {
  const [dispute, setDispute] = useState<AdminDispute>(initialDispute);

  // Resolution preview state
  const [selectedOutcome, setSelectedOutcome] = useState<string>("Release full escrow to worker");

  // Reply / note composer state
  const [composerText, setComposerText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  // Modals state
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isRequestInfoModalOpen, setIsRequestInfoModalOpen] = useState(false);

  // Feature 2: Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

  // Feature 3: Sanctions modal state
  const [sanctionTargetUser, setSanctionTargetUser] = useState<DisputeParty | null>(null);

  // Security PIN authorization state
  const [pendingPinAction, setPendingPinAction] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    onSuccess: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    actionLabel: "",
    onSuccess: () => {},
  });

  const requirePinAuth = (
    title: string,
    description: string,
    actionLabel: string,
    onSuccess: () => void
  ) => {
    setPendingPinAction({
      isOpen: true,
      title,
      description,
      actionLabel,
      onSuccess,
    });
  };

  // Money preview calculations
  const calculatePreview = () => {
    const total = dispute.escrowAmount;
    if (selectedOutcome === "Release full escrow to worker") {
      const fee = total * 0.1;
      return { customer: 0, worker: total - fee, fee };
    }
    if (selectedOutcome === "Release support to customer") {
      return { customer: total, worker: 0, fee: 0 };
    }
    if (selectedOutcome === "Split escrow agreed") {
      const splitHalf = total / 2;
      const fee = splitHalf * 0.1;
      return { customer: splitHalf, worker: splitHalf - fee, fee };
    }
    // No evidence
    const fee = total * 0.1;
    return { customer: 0, worker: total - fee, fee };
  };

  const previewAmounts = calculatePreview();

  // Handlers
  const handleSendMessage = () => {
    if (!composerText.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      author: {
        name: "Simeon Daniel",
        role: "ADMIN" as const,
      },
      timestamp: "Just now",
      content: composerText,
      isInternalAdminNote: isInternalNote,
    };

    const updated = {
      ...dispute,
      messages: [...dispute.messages, newMessage],
    };
    setDispute(updated);
    if (onUpdateDispute) onUpdateDispute(updated);
    setComposerText("");
    toast.success(isInternalNote ? "Internal admin note posted" : "Message sent to all parties");
  };

  const handleResolveConfirm = (outcome: string, reason: string) => {
    setIsResolveModalOpen(false);
    requirePinAuth(
      "Authorize Dispute Resolution & Fund Release",
      `Executing "${outcome}" for dispute ${dispute.id} (₦${dispute.escrowAmount.toLocaleString()}) requires Operations Admin PIN authorization.`,
      "Release Funds",
      () => {
        const updated: AdminDispute = {
          ...dispute,
          status: "RESOLVED",
          resolutionOutcome: outcome.includes("worker") ? "FULL_WORKER" : "FULL_CUSTOMER",
          resolutionReason: reason,
          resolvedAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          resolvedBy: "Simeon Daniel",
          timeline: [
            ...dispute.timeline,
            {
              title: "Dispute Resolved",
              date: "Today",
              description: `${outcome} authorized by Simeon Daniel`,
              completed: true,
            },
          ],
        };
        setDispute(updated);
        if (onUpdateDispute) onUpdateDispute(updated);
        toast.success(`Dispute ${dispute.id} resolved successfully!`);
      }
    );
  };

  const handleRefundConfirm = (reason: string) => {
    setIsRefundModalOpen(false);
    requirePinAuth(
      "Authorize Dispute Refund Memo",
      `Issuing ₦${dispute.escrowAmount.toLocaleString()} refund voucher for ${dispute.customer.name} requires Operations Admin PIN authorization.`,
      "Issue Refund",
      () => {
        const updated: AdminDispute = {
          ...dispute,
          status: "RESOLVED",
          resolutionOutcome: "FULL_CUSTOMER",
          refundDebitMemoId: `RF-${Date.now().toString().slice(-5)}`,
          resolutionReason: reason,
          resolvedAt: "Today",
          resolvedBy: "Simeon Daniel",
        };
        setDispute(updated);
        if (onUpdateDispute) onUpdateDispute(updated);
        toast.success(`Refund of ₦${dispute.escrowAmount.toLocaleString()} approved!`);
      }
    );
  };

  const handleEscalateConfirm = (reason: string) => {
    setIsEscalateModalOpen(false);
    const updated: AdminDispute = {
      ...dispute,
      status: "ESCALATED",
      assignedAdmin: "Olubisi Adeyemi (Trust & Safety Lead)",
      messages: [
        ...dispute.messages,
        {
          id: `msg-${Date.now()}`,
          author: { name: "System", role: "ADMIN" },
          timestamp: "Just now",
          content: `Case escalated to Trust & Safety Lead (@Olubisi Adeyemi). Reason: ${reason}. SLA reset to 24h.`,
          isInternalAdminNote: true,
        },
      ],
      timeline: [
        ...dispute.timeline,
        {
          title: "Escalated to Senior Review",
          date: "Today",
          description: "Assigned to Olubisi Adeyemi",
          completed: true,
        },
      ],
    };
    setDispute(updated);
    if (onUpdateDispute) onUpdateDispute(updated);
    toast.success("Case escalated to Trust & Safety Lead!");
  };

  const handleRequestInfoConfirm = (target: string, requestText: string, deadline: number) => {
    setIsRequestInfoModalOpen(false);
    const updated: AdminDispute = {
      ...dispute,
      status: "AWAITING_RESPONSE",
      messages: [
        ...dispute.messages,
        {
          id: `msg-${Date.now()}`,
          author: { name: "Simeon Daniel (Operations Admin)", role: "ADMIN" },
          timestamp: "Just now",
          content: `Formal Information Request to ${target}: ${requestText} (Required within ${deadline} hours).`,
        },
      ],
    };
    setDispute(updated);
    if (onUpdateDispute) onUpdateDispute(updated);
    toast.success(`Information request dispatched to ${target}!`);
  };

  // Feature 3: Sanctions confirmation with PIN
  const handleSanctionConfirm = (actionType: string, notes: string) => {
    if (!sanctionTargetUser) return;
    const target = sanctionTargetUser;
    setSanctionTargetUser(null);

    requirePinAuth(
      `Authorize Disciplinary Sanction: ${actionType}`,
      `Applying ${actionType} against ${target.name} (${target.code}) for case ${dispute.id} requires Operations Admin PIN authorization.`,
      "Enforce Sanction",
      () => {
        toast.success(`Sanction ${actionType} applied successfully to ${target.name}!`);
        // Append admin audit note
        const updated: AdminDispute = {
          ...dispute,
          messages: [
            ...dispute.messages,
            {
              id: `msg-${Date.now()}`,
              author: { name: "Simeon Daniel", role: "ADMIN" },
              timestamp: "Just now",
              content: `[DISCIPLINARY ACTION] ${actionType} applied against ${target.name}. Notes: ${notes}`,
              isInternalAdminNote: true,
            },
          ],
        };
        setDispute(updated);
        if (onUpdateDispute) onUpdateDispute(updated);
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <Link href="/ops/disputes" className="hover:text-[#001B40] transition-colors">
              Disputes
            </Link>
            <span>&gt;</span>
            <span className="font-semibold text-neutral-900">{dispute.id}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl md:text-2xl font-heading font-extrabold text-[#001B40]">
              {dispute.id} — {dispute.title}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                dispute.status === "RESOLVED"
                  ? "bg-emerald-100 text-emerald-800"
                  : dispute.status === "ESCALATED"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {dispute.status === "RESOLVED"
                ? "Resolved"
                : dispute.status === "ESCALATED"
                ? "Escalated"
                : "Under review"}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                dispute.priority === "CRITICAL" || dispute.priority === "HIGH"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {dispute.priority.charAt(0) + dispute.priority.slice(1).toLowerCase()}
            </span>
          </div>

          <p className="text-xs text-neutral-500 mt-1">
            Opened {dispute.openedDate} · ₦{dispute.escrowAmount.toLocaleString()} held in escrow ·{" "}
            <span className="font-semibold text-neutral-700">{dispute.assignedAdmin}</span>
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsRequestInfoModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors shadow-2xs"
          >
            Request information
          </button>
          <button
            type="button"
            onClick={() => setIsEscalateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors shadow-2xs"
          >
            Escalate
          </button>
          <button
            type="button"
            onClick={() => setIsResolveModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#001B40] text-white hover:bg-[#074292] shadow-xs transition-colors"
          >
            Resolve
          </button>
        </div>
      </div>

      {/* 3-Column Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================
            LEFT COLUMN: Case Summary & Parties (4 cols)
            ========================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Case Summary Card */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3.5">
              Case Summary
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-neutral-500 block text-[11px]">Job reference</span>
                <Link
                  href={`/ops/jobs?search=${dispute.jobId}`}
                  className="font-bold text-[#074292] hover:underline"
                >
                  {dispute.jobId}
                </Link>
                <span className="text-neutral-700 font-medium block mt-0.5">{dispute.jobTitle}</span>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Escrow held</span>
                  <span className="font-extrabold text-sm text-[#001B40]">
                    ₦{dispute.escrowAmount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Payment status</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Escrow held
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Transaction ID</span>
                <Link
                  href={`/ops/finance?search=${dispute.transactionId}`}
                  className="font-mono text-neutral-800 hover:text-[#074292] font-semibold"
                >
                  {dispute.transactionId}
                </Link>
              </div>
            </div>
          </div>

          {/* Parties Card */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Parties
            </h3>

            {/* Customer Box */}
            <div className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                    {dispute.customer.avatarUrl ? (
                      <img src={dispute.customer.avatarUrl} alt={dispute.customer.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-neutral-600">
                        {dispute.customer.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{dispute.customer.name}</h4>
                    <span className="text-[10px] text-neutral-500">Customer · {dispute.customer.code}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>

              <div className="text-[11px] text-neutral-600 space-y-1 pt-1">
                <p>
                  <span className="font-semibold text-neutral-800">{dispute.customer.totalJobs}</span> jobs posted ·{" "}
                  ₦{dispute.customer.lifetimeSpendOrEarned.toLocaleString()} lifetime spend
                </p>
                <p>
                  Past disputes: <span className="font-semibold text-neutral-800">{dispute.customer.pastDisputesCount}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-200/70 flex items-center justify-between text-xs">
                <Link
                  href={`/ops/users?search=${dispute.customer.code}`}
                  className="text-[#074292] font-semibold hover:underline text-[11px]"
                >
                  View Profile &rarr;
                </Link>
                {/* Feature 3 Action Trigger */}
                <button
                  type="button"
                  onClick={() => setSanctionTargetUser(dispute.customer)}
                  className="text-red-700 hover:text-red-800 font-bold text-[11px] px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Sanction Customer
                </button>
              </div>
            </div>

            {/* Worker Box */}
            <div className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                    {dispute.worker.avatarUrl ? (
                      <img src={dispute.worker.avatarUrl} alt={dispute.worker.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-neutral-600">
                        {dispute.worker.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{dispute.worker.name}</h4>
                    <span className="text-[10px] text-neutral-500">Worker · {dispute.worker.code}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>

              <div className="text-[11px] text-neutral-600 space-y-1 pt-1">
                <p>
                  <span className="font-semibold text-neutral-800">{dispute.worker.totalJobs}</span> jobs completed ·{" "}
                  <span className="text-amber-600 font-bold">★ {dispute.worker.rating || "4.8"}</span> ·{" "}
                  {dispute.worker.cancelledJobsCount || 0} cancelled
                </p>
                <p>
                  Past disputes: <span className="font-semibold text-neutral-800">{dispute.worker.pastDisputesCount}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-200/70 flex items-center justify-between text-xs">
                <Link
                  href={`/ops/users?search=${dispute.worker.code}`}
                  className="text-[#074292] font-semibold hover:underline text-[11px]"
                >
                  View Profile &rarr;
                </Link>
                {/* Feature 3 Action Trigger */}
                <button
                  type="button"
                  onClick={() => setSanctionTargetUser(dispute.worker)}
                  className="text-red-700 hover:text-red-800 font-bold text-[11px] px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Sanction Worker
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            MIDDLE COLUMN: Evidence & Conversation (5 cols)
            ========================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col h-[740px]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Evidence and conversation
                </h3>
                <span className="text-[11px] text-neutral-500">
                  All messages, claim photos and internal notes
                </span>
              </div>

              {/* Feature 2: Lightbox quick trigger */}
              {dispute.evidenceFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setLightboxInitialIndex(0);
                    setIsLightboxOpen(true);
                  }}
                  className="text-[11px] font-bold text-[#074292] hover:text-[#001B40] flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  <span>Inspect Evidence ({dispute.evidenceFiles.length})</span>
                </button>
              )}
            </div>

            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {dispute.messages.map((msg) => {
                const isAdmin = msg.author.role === "ADMIN";
                const isCustomer = msg.author.role === "CUSTOMER";

                return (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl text-xs space-y-2 border transition-all ${
                      msg.isInternalAdminNote
                        ? "bg-amber-50/70 border-amber-200 text-amber-950"
                        : isAdmin
                        ? "bg-blue-50/60 border-blue-200 text-neutral-900"
                        : "bg-white border-neutral-200 text-neutral-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#001B40]">{msg.author.name}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            isAdmin
                              ? "bg-blue-100 text-blue-800"
                              : isCustomer
                              ? "bg-purple-100 text-purple-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {msg.author.role}
                        </span>
                        {msg.isInternalAdminNote && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200 text-amber-900">
                            INTERNAL NOTE
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">{msg.timestamp}</span>
                    </div>

                    <p className="leading-relaxed text-[11px] whitespace-pre-wrap">{msg.content}</p>

                    {/* Attachments (Click to open Feature 2 Lightbox) */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-2">
                        {msg.attachments.map((att, idx) => (
                          <button
                            key={att.id}
                            type="button"
                            onClick={() => {
                              const matchIndex = dispute.evidenceFiles.findIndex((f) => f.name === att.name);
                              setLightboxInitialIndex(matchIndex >= 0 ? matchIndex : idx);
                              setIsLightboxOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-medium transition-colors"
                          >
                            <svg className="w-3 h-3 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                              <circle cx="9" cy="9" r="2" />
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                            <span>{att.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Composer Box */}
            <div className="pt-3 border-t border-neutral-200 mt-3 space-y-2 shrink-0">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-neutral-600">Post Reply or Admin Note</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-amber-800 font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 text-xs"
                  />
                  <span>Internal note (Admins only)</span>
                </label>
              </div>

              <div className="relative">
                <textarea
                  rows={2}
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  placeholder={
                    isInternalNote
                      ? "Add an internal operational note (invisible to customer and worker)..."
                      : "Send an official administrative message to both parties..."
                  }
                  className={`w-full text-xs p-3 rounded-xl border bg-white focus:outline-none transition-colors ${
                    isInternalNote
                      ? "border-amber-300 focus:ring-1 focus:ring-amber-500 bg-amber-50/20"
                      : "border-neutral-200 focus:ring-1 focus:ring-[#001B40]"
                  }`}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setLightboxInitialIndex(0);
                    setIsLightboxOpen(true);
                  }}
                  className="text-neutral-500 hover:text-neutral-800 text-[11px] font-medium flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                  <span>View full attachments</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!composerText.trim()}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    composerText.trim()
                      ? isInternalNote
                        ? "bg-amber-600 text-white hover:bg-amber-700"
                        : "bg-[#001B40] text-white hover:bg-[#074292]"
                      : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  {isInternalNote ? "Save note" : "Send message"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            RIGHT COLUMN: Resolution & Timeline (3 cols)
            ========================================= */}
        <div className="lg:col-span-3 space-y-6">
          {/* Resolution Card */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Resolution
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                Outcome *
              </label>
              <select
                value={selectedOutcome}
                onChange={(e) => setSelectedOutcome(e.target.value)}
                className="w-full text-xs font-semibold px-2.5 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#001B40]"
              >
                <option value="Release full escrow to worker">Release full escrow to worker</option>
                <option value="Release support to customer">Release support to customer</option>
                <option value="Split escrow agreed">Split escrow agreed</option>
                <option value="No evidence provided">No evidence provided</option>
              </select>
            </div>

            {/* Money Impact Preview */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Money Impact Preview
              </span>
              <div className="flex justify-between py-0.5">
                <span className="text-neutral-500">Customer receives</span>
                <span className="font-bold text-neutral-900">
                  ₦{previewAmounts.customer.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-neutral-500">Worker receives</span>
                <span className="font-bold text-emerald-700">
                  ₦{previewAmounts.worker.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-t border-neutral-200/60 pt-1">
                <span className="text-neutral-500">Platform fee</span>
                <span className="font-bold text-neutral-700">
                  ₦{previewAmounts.fee.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#001B40] text-white hover:bg-[#074292] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Resolve dispute</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRefundModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Approve refund</span>
              </button>
            </div>
          </div>

          {/* Case Timeline Stepper Card */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Case Timeline
            </h3>

            <div className="space-y-4 pt-1">
              {dispute.timeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs relative">
                  {/* Vertical connector line */}
                  {idx < dispute.timeline.length - 1 && (
                    <div className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-neutral-200 -mb-2" />
                  )}

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      item.completed
                        ? "bg-emerald-500 text-white"
                        : item.active
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-200 text-neutral-500"
                    }`}
                  >
                    {item.completed ? (
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-current" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">{item.title}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">{item.date}</span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <OpsDisputeResolveModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        dispute={dispute}
        onConfirm={handleResolveConfirm}
      />

      <OpsDisputeRefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        dispute={dispute}
        onConfirm={handleRefundConfirm}
      />

      <OpsDisputeEscalateModal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        dispute={dispute}
        onConfirm={handleEscalateConfirm}
      />

      <OpsDisputeRequestInfoModal
        isOpen={isRequestInfoModalOpen}
        onClose={() => setIsRequestInfoModalOpen(false)}
        dispute={dispute}
        onConfirm={handleRequestInfoConfirm}
      />

      {/* FEATURE 2: Media Lightbox */}
      <OpsEvidenceLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        files={dispute.evidenceFiles}
        initialFileIndex={lightboxInitialIndex}
      />

      {/* FEATURE 3: Direct Disciplinary Sanctions */}
      {sanctionTargetUser && (
        <OpsDisciplinaryActionModal
          isOpen={Boolean(sanctionTargetUser)}
          onClose={() => setSanctionTargetUser(null)}
          targetUser={sanctionTargetUser}
          disputeId={dispute.id}
          onConfirm={handleSanctionConfirm}
        />
      )}

      {/* PIN Security Authorization Gate */}
      <OpsSecurityPinModal
        isOpen={pendingPinAction.isOpen}
        title={pendingPinAction.title}
        description={pendingPinAction.description}
        actionLabel={pendingPinAction.actionLabel}
        onSuccess={() => {
          setPendingPinAction((prev) => ({ ...prev, isOpen: false }));
          pendingPinAction.onSuccess();
        }}
        onClose={() => setPendingPinAction((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
