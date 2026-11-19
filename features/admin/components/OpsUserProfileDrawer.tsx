"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { AdminUser } from "../types";
import { OpsWalletAdjustmentModal } from "./OpsWalletAdjustmentModal";
import { OpsSecurityPinModal } from "./OpsSecurityPinModal";

interface OpsUserProfileDrawerProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSuspendModal: (user: AdminUser) => void;
  onOpenNotifyModal: (user: AdminUser) => void;
  onImpersonateUser?: (user: AdminUser) => void;
  onUpdateUser: (updated: AdminUser) => void;
}

type TabType = "overview" | "kyc" | "financials" | "activity" | "risk" | "notes";

export function OpsUserProfileDrawer({
  user,
  isOpen,
  onClose,
  onOpenSuspendModal,
  onOpenNotifyModal,
  onImpersonateUser,
  onUpdateUser,
}: OpsUserProfileDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showNin, setShowNin] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isWalletAdjustOpen, setIsWalletAdjustOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [pinModalConfig, setPinModalConfig] = useState<{
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

  if (!isOpen || !user) return null;

  const formatNaira = (kobo: number) => {
    const naira = Math.round(kobo / 100);
    return `₦${naira.toLocaleString("en-NG")}`;
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsAddingNote(true);
    setTimeout(() => {
      const newNote = {
        id: `note-${Date.now()}`,
        author: "Simeon Daniel (Admin)",
        text: newNoteText.trim(),
        createdAt: "Just now",
      };
      const updatedNotes = [newNote, ...(user.internalNotes || [])];
      onUpdateUser({
        ...user,
        internalNotes: updatedNotes,
      });
      setNewNoteText("");
      setIsAddingNote(false);
      toast.success("Internal note added to user audit log.");
    }, 400);
  };

  const executeToggleFreezePayouts = () => {
    const nextState = !user.payoutsFrozen;
    const auditNote = {
      id: `note-${Date.now()}`,
      author: "Simeon Daniel (Admin)",
      text: nextState
        ? "Payout withdrawals frozen by operational review."
        : "Payout withdrawals restored by operational review.",
      createdAt: "Just now",
    };

    onUpdateUser({
      ...user,
      payoutsFrozen: nextState,
      internalNotes: [auditNote, ...(user.internalNotes || [])],
    });

    toast.success(
      nextState
        ? `Payouts frozen for ${user.fullName}.`
        : `Payout access restored for ${user.fullName}.`
    );
  };

  const handleToggleFreezePayouts = () => {
    setPinModalConfig({
      isOpen: true,
      title: user.payoutsFrozen ? "Authorize Payout Unfreeze" : "Authorize Payout Freeze",
      description: `Enter your 4-digit Admin PIN to ${
        user.payoutsFrozen ? "restore payout access for" : "freeze all withdrawal payouts for"
      } ${user.fullName}.`,
      actionLabel: user.payoutsFrozen ? "Confirm Unfreeze" : "Confirm Freeze",
      onSuccess: executeToggleFreezePayouts,
    });
  };

  const handleOpenWalletAdjustWithPin = () => {
    setPinModalConfig({
      isOpen: true,
      title: "Authorize Balance Adjustment",
      description: `Direct wallet balance debit/credit adjustment for ${user.fullName} requires administrator PIN verification.`,
      actionLabel: "Authorize Adjustment",
      onSuccess: () => setIsWalletAdjustOpen(true),
    });
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagInput.trim();
    if (!clean) return;

    const updatedTags = Array.from(new Set([...(user.tags || []), clean]));
    onUpdateUser({
      ...user,
      tags: updatedTags,
    });
    setNewTagInput("");
    toast.success(`Tag "${clean}" added.`);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = (user.tags || []).filter((t) => t !== tagToRemove);
    onUpdateUser({
      ...user,
      tags: updatedTags,
    });
  };

  const handleTriggerPasswordReset = () => {
    toast.success(`Password reset email dispatched to ${user.email}.`);
  };

  const handleForceLogout = () => {
    toast.success(`All active authentication sessions invalidated for ${user.fullName}.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400">User Profile</span>
            <span className="text-xs text-neutral-300">/</span>
            <span className="text-xs font-bold font-mono text-[#001B40]">{user.userCode}</span>
          </div>

          <div className="flex items-center gap-2">
            {onImpersonateUser && (
              <button
                type="button"
                onClick={() => onImpersonateUser(user)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="View marketplace as this user"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>View As User</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenNotifyModal(user)}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-white cursor-pointer"
            >
              Send notification
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* User Identity Banner */}
        <div className="p-5 sm:p-6 border-b border-neutral-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-[#001B40] text-white flex items-center justify-center font-bold text-lg ring-2 ring-neutral-200 shrink-0">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span>{user.fullName?.[0]?.toUpperCase() || "U"}</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-heading font-extrabold text-xl text-[#0F1115]">
                    {user.fullName}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      user.role === "WORKER"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : user.role === "CUSTOMER"
                        ? "bg-sky-50 text-sky-700 border border-sky-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {user.role} {user.trade ? `· ${user.trade}` : ""}
                  </span>

                  {/* Anti-fraud Risk Level Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user.riskLevel === "HIGH"
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : user.riskLevel === "MEDIUM"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {user.riskLevel === "HIGH" && "⚠ High Risk"}
                    {user.riskLevel === "MEDIUM" && "• Medium Risk"}
                    {user.riskLevel === "LOW" && "✓ Low Risk"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user.verificationStatus === "VERIFIED"
                        ? "bg-emerald-50 text-emerald-700"
                        : user.verificationStatus === "PENDING"
                        ? "bg-amber-50 text-amber-700"
                        : user.verificationStatus === "UNDER_REVIEW"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {user.verificationStatus === "VERIFIED" && "✓"}
                    {user.verificationStatus === "PENDING" && "•"}
                    {user.verificationStatus === "UNDER_REVIEW" && "•"}
                    {user.verificationStatus === "REJECTED" && "✕"}{" "}
                    {user.verificationStatus}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user.accountStatus === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700"
                        : user.accountStatus === "SUSPENDED"
                        ? "bg-red-50 text-red-700"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {user.accountStatus === "ACTIVE" && "▲"}
                    {user.accountStatus === "SUSPENDED" && "▼"}
                    {user.accountStatus === "DORMANT" && "•"}{" "}
                    {user.accountStatus}
                  </span>

                  {user.payoutsFrozen && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      🔒 Payouts Frozen
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Suspend or Reactivate button */}
            <div className="flex items-center gap-2">
              {user.accountStatus === "SUSPENDED" ? (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateUser({
                      ...user,
                      accountStatus: "ACTIVE",
                      suspensionReason: undefined,
                      suspensionCategory: undefined,
                    });
                    toast.success(`Account for ${user.fullName} has been reactivated.`);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Reactivate account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenSuspendModal(user)}
                  className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Suspend account
                </button>
              )}
            </div>
          </div>

          {/* Operational Tags */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {(user.tags || []).map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 font-semibold text-[11px]"
              >
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}
            <form onSubmit={handleAddTag} className="inline-flex items-center gap-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="+ Add tag..."
                className="px-2 py-0.5 rounded-lg border border-neutral-200 text-[11px] w-24 focus:outline-none focus:border-[#001B40]"
              />
            </form>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] font-bold text-neutral-400 block uppercase">Wallet Balance</span>
              <span className="font-heading font-extrabold text-sm text-[#001B40]">
                {formatNaira(user.walletBalanceKobo)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] font-bold text-neutral-400 block uppercase">Escrow Held</span>
              <span className="font-heading font-extrabold text-sm text-[#001B40]">
                {formatNaira(user.escrowBalanceKobo)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] font-bold text-neutral-400 block uppercase">Completed Jobs</span>
              <span className="font-heading font-extrabold text-sm text-[#001B40]">
                {user.completedJobsCount}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] font-bold text-neutral-400 block uppercase">Rating Score</span>
              <span className="font-heading font-extrabold text-sm text-emerald-700">
                {user.rating > 0 ? `${user.rating.toFixed(1)} ★` : "New (0)"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-neutral-200 overflow-x-auto">
          {[
            { id: "overview", label: "Overview & Contact" },
            { id: "kyc", label: "Identity & KYC" },
            { id: "financials", label: "Wallet & Safeguards" },
            { id: "activity", label: "Activity & History" },
            { id: "risk", label: `Risk Signals (${user.riskFlags?.length || 0})` },
            { id: "notes", label: `Staff Notes (${user.internalNotes?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#001B40] text-[#001B40]"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-3">
                <h4 className="font-heading font-bold text-xs uppercase text-neutral-500 tracking-wider">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Primary Email</span>
                    <span className="font-semibold text-neutral-900 flex items-center gap-1.5 mt-0.5">
                      {user.email}
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-sm font-bold">
                        Verified
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Primary Phone</span>
                    <span className="font-semibold text-neutral-900 flex items-center gap-1.5 mt-0.5">
                      {user.phone}
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-sm font-bold">
                        SMS Active
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Registered Location</span>
                    <span className="font-semibold text-neutral-900 mt-0.5 block">
                      {user.location}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Last Active Timestamp</span>
                    <span className="font-semibold text-neutral-900 mt-0.5 block">
                      {user.lastActive}
                    </span>
                  </div>
                </div>
              </div>

              {/* Suspension Banner if suspended */}
              {user.accountStatus === "SUSPENDED" && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1.5">
                  <span className="font-bold block text-red-800">
                    Account Currently Suspended
                  </span>
                  <p className="text-red-700">
                    <strong className="font-semibold">Category:</strong> {user.suspensionCategory || "Violation"}
                  </p>
                  <p className="text-red-700">
                    <strong className="font-semibold">Reason:</strong> {user.suspensionReason || "Administrative review"}
                  </p>
                  {user.suspendedAt && (
                    <p className="text-[10px] text-red-500 pt-1">Suspended on {user.suspendedAt}</p>
                  )}
                </div>
              )}

              {/* Operations Quick Actions */}
              <div className="space-y-2">
                <h4 className="font-heading font-bold text-xs uppercase text-neutral-500 tracking-wider">
                  Admin & Security Quick Actions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleTriggerPasswordReset}
                    className="p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-left text-xs font-semibold text-neutral-800 flex items-center justify-between cursor-pointer"
                  >
                    <span>Trigger Password Reset</span>
                    <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={handleForceLogout}
                    className="p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-left text-xs font-semibold text-neutral-800 flex items-center justify-between cursor-pointer"
                  >
                    <span>Force Invalidate Sessions</span>
                    <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                      <line x1="12" y1="2" x2="12" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "kyc" && (
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">National Identity Number (NIN)</span>
                    <div className="font-mono font-bold text-sm text-[#001B40] mt-0.5">
                      {user.nin
                        ? showNin
                          ? user.nin
                          : `••••••••${user.nin.slice(-4)}`
                        : "Not submitted"}
                    </div>
                  </div>
                  {user.nin && (
                    <button
                      type="button"
                      onClick={() => setShowNin(!showNin)}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      {showNin ? "Hide" : "Reveal"}
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs">
                  <span className="text-neutral-500">BVN Verified via NIBSS</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {user.bvnVerified ? "✓ Verified" : "Pending Match"}
                  </span>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="space-y-3">
                <h4 className="font-heading font-bold text-xs uppercase text-neutral-500 tracking-wider">
                  Verification Documents
                </h4>
                {user.documents && user.documents.length > 0 ? (
                  user.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#001B40] flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-xs text-[#0F1115]">{doc.name}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            Uploaded {doc.uploadedAt} · Status: {doc.status}
                          </p>
                        </div>
                      </div>

                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        Preview
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400 py-3">No physical documents uploaded yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "financials" && (
            <div className="space-y-5">
              {/* Wallet Balances Card */}
              <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-xs uppercase text-neutral-500 tracking-wider">
                    Wallet Balances
                  </h4>
                  <button
                    type="button"
                    onClick={handleOpenWalletAdjustWithPin}
                    className="px-3 py-1.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    ± Adjust Balance
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Available Liquid Funds:</span>
                  <span className="font-bold text-sm text-[#001B40]">
                    {formatNaira(user.walletBalanceKobo)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-neutral-500">Funds Held in Escrow:</span>
                  <span className="font-bold text-sm text-neutral-700">
                    {formatNaira(user.escrowBalanceKobo)}
                  </span>
                </div>
              </div>

              {/* Safeguard: Freeze Payouts */}
              <div className="p-4 rounded-2xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-xs uppercase text-neutral-800">
                      Payout Safeguard (Withdrawals)
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Freeze bank transfer payouts without suspending general marketplace browsing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleFreezePayouts}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      user.payoutsFrozen
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                    }`}
                  >
                    {user.payoutsFrozen ? "Unfreeze Payouts" : "Freeze Payouts"}
                  </button>
                </div>
              </div>

              {/* Custom Limits & Commission Rate */}
              <div className="p-4 rounded-2xl border border-neutral-200 space-y-3 text-xs">
                <h4 className="font-heading font-bold text-xs uppercase text-neutral-500 tracking-wider">
                  Commission Rate & Withdrawal Limits
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px]">Commission Rate</span>
                    <span className="font-heading font-bold text-sm text-[#001B40] mt-0.5 block">
                      {user.customCommissionRate || 10}%
                    </span>
                    <span className="text-[10px] text-neutral-400">Platform fee</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px]">Daily Payout Limit</span>
                    <span className="font-heading font-bold text-sm text-[#001B40] mt-0.5 block">
                      {formatNaira(user.dailyWithdrawalLimitKobo || 50000000)}
                    </span>
                    <span className="text-[10px] text-neutral-400">Per 24h cycle</span>
                  </div>
                </div>
              </div>

              {/* Payout Bank Account */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-3">
                <h4 className="font-heading font-bold text-xs uppercase text-neutral-500 tracking-wider">
                  Linked Payout Bank Account
                </h4>
                {user.bankAccount ? (
                  <div className="space-y-1.5 text-xs">
                    <p className="font-bold text-[#001B40] text-sm">
                      {user.bankAccount.bankName} · {user.bankAccount.accountNumber}
                    </p>
                    <p className="text-neutral-500">
                      Account Name: <strong className="text-neutral-800">{user.bankAccount.accountName}</strong>
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold text-[10px] mt-1">
                      Approved for Payout
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">No payout bank account connected yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "risk" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-xs uppercase text-neutral-500 tracking-wider">
                    Risk Assessment Engine
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      user.riskLevel === "HIGH"
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : user.riskLevel === "MEDIUM"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {user.riskLevel} RISK
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px]">Dispute Ratio</span>
                    <span
                      className={`font-heading font-bold text-base mt-0.5 block ${
                        (user.disputeRatePercent || 0) > 10 ? "text-red-700" : "text-[#001B40]"
                      }`}
                    >
                      {user.disputeRatePercent || 0}%
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {user.disputeCount || 0} disputes on {user.completedJobsCount} jobs
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px]">Suspension Flags</span>
                    <span className="font-heading font-bold text-base text-[#001B40] mt-0.5 block">
                      {user.accountStatus === "SUSPENDED" ? "1 Active" : "0 Active"}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {user.suspensionCategory || "Clear record"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Anti-fraud Warning Flags List */}
              <div className="space-y-2">
                <h4 className="font-heading font-bold text-xs uppercase text-neutral-500 tracking-wider">
                  Active Anti-Fraud / Compliance Flags
                </h4>
                {user.riskFlags && user.riskFlags.length > 0 ? (
                  user.riskFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-red-50/70 border border-red-200/80 text-red-900 flex items-center gap-2.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                      <span className="font-medium text-xs">{flag}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <span>✓ No active fraud flags detected. Clean risk score.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-xs uppercase text-neutral-500 tracking-wider">
                Recent Marketplace History
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#0F1115]">Job #JOB-1029 Completed</p>
                    <p className="text-neutral-400 text-[10px]">Payment released from escrow · ₦45,000</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#0F1115]">Quote Accepted: Q-8821</p>
                    <p className="text-neutral-400 text-[10px]">Electrical wiring inspection in Surulere</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2.5">
                <label className="block text-xs font-bold text-neutral-800">
                  Add Private Staff / Operations Note
                </label>
                <textarea
                  rows={2}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record verification updates, dispute calls, or compliance notes visible only to admins..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#001B40]"
                  required
                />
                <button
                  type="submit"
                  disabled={isAddingNote}
                  className="px-4 py-2 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isAddingNote ? "Adding..." : "Add Note"}
                </button>
              </form>

              {/* Existing Notes List */}
              <div className="space-y-2.5 pt-2">
                <h4 className="font-heading font-bold text-xs uppercase text-neutral-500 tracking-wider">
                  Audit Notes History
                </h4>
                {user.internalNotes && user.internalNotes.length > 0 ? (
                  user.internalNotes.map((note) => (
                    <div key={note.id} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#001B40]">{note.author}</span>
                        <span className="text-neutral-400">{note.createdAt}</span>
                      </div>
                      <p className="text-xs text-neutral-700 leading-relaxed">{note.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400">No staff notes recorded yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Adjustment Modal */}
      {isWalletAdjustOpen && (
        <OpsWalletAdjustmentModal
          user={user}
          isOpen={isWalletAdjustOpen}
          onClose={() => setIsWalletAdjustOpen(false)}
          onConfirmAdjustment={(updated) => {
            onUpdateUser(updated);
          }}
        />
      )}

      {/* Admin Security PIN Authorization */}
      <OpsSecurityPinModal
        isOpen={pinModalConfig.isOpen}
        title={pinModalConfig.title}
        description={pinModalConfig.description}
        actionLabel={pinModalConfig.actionLabel}
        onClose={() => setPinModalConfig((p) => ({ ...p, isOpen: false }))}
        onSuccess={pinModalConfig.onSuccess}
      />
    </div>
  );
}
