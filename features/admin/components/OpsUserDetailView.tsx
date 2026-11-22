"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/utils/currency";
import { AdminUser, AdminAccountStatus } from "../types";

interface OpsUserDetailViewProps {
  user: AdminUser;
}

type UserDetailTab =
  | "overview"
  | "jobs"
  | "payments"
  | "wallet"
  | "reviews"
  | "complaints"
  | "disputes"
  | "documents"
  | "activity";

export function OpsUserDetailView({ user: initialUser }: OpsUserDetailViewProps) {
  const [user, setUser] = useState<AdminUser>(initialUser);
  const [activeTab, setActiveTab] = useState<UserDetailTab>("overview");

  // Suspend modal state
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendCategory, setSuspendCategory] = useState("Code of Conduct violation");
  const [suspendReason, setSuspendReason] = useState("");
  const [isSubmittingSuspend, setIsSubmittingSuspend] = useState(false);

  // Contact modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSentToast, setContactSentToast] = useState(false);

  const handleConfirmSuspend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendReason.trim()) return;

    setIsSubmittingSuspend(true);
    setTimeout(() => {
      const nextStatus: AdminAccountStatus = user.accountStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
      setUser((prev) => ({
        ...prev,
        accountStatus: nextStatus,
        suspensionCategory: suspendCategory,
        suspensionReason: suspendReason,
        suspendedAt: new Date().toISOString(),
      }));
      setIsSubmittingSuspend(false);
      setShowSuspendModal(false);
    }, 600);
  };

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    setContactSentToast(true);
    setTimeout(() => {
      setContactSentToast(false);
      setShowContactModal(false);
      setContactSubject("");
      setContactMessage("");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <div className="text-xs font-semibold text-neutral-400 mb-1 flex items-center gap-1.5">
          <Link href="/ops/users" className="hover:underline">
            Users
          </Link>
          <span>&gt;</span>
          <span className="text-neutral-700 font-bold">{user.fullName}</span>
        </div>

        {/* User Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#001B40] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-[#001B40] tracking-tight">
                  {user.fullName}
                </h1>
                <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-200 text-neutral-800">
                  {user.role === "WORKER" ? "Worker" : user.role === "TALENT" ? "Talent" : "Customer"}
                </span>
                <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ● Verified
                </span>
                <span
                  className={`whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    user.accountStatus === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  ● {user.accountStatus}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {user.userCode} · joined {user.joinedAt} · last active {user.lastActive}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowContactModal(true)}
              className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>✉</span>
              <span>Contact</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSuspendModal(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer ${
                user.accountStatus === "SUSPENDED"
                  ? "bg-emerald-700 text-white hover:bg-emerald-800"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              <span>⛔</span>
              <span>{user.accountStatus === "SUSPENDED" ? "Reactivate" : "Suspend"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 9 Tabs Navigation */}
      <div className="border-b border-neutral-200">
        <nav className="flex items-center gap-1 sm:gap-4 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: "overview", label: "Overview" },
            { id: "jobs", label: "Jobs", count: 2 },
            { id: "payments", label: "Payments", count: 2 },
            { id: "wallet", label: "Wallet" },
            { id: "reviews", label: "Reviews", count: 1 },
            { id: "complaints", label: "Complaints", count: 1 },
            { id: "disputes", label: "Disputes", count: 0 },
            { id: "documents", label: "Documents", count: 0 },
            { id: "activity", label: "Activity" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as UserDetailTab)}
                className={`pb-3 px-1 border-b-2 font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                  isActive
                    ? "border-[#001B40] text-[#001B40]"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={`whitespace-nowrap shrink-0 inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? "bg-neutral-200 text-neutral-800 font-bold" : "text-neutral-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Trust and Performance */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Trust and performance
              </span>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase">Total jobs</span>
                  <p className="text-base font-bold text-neutral-900">{user.completedJobsCount} Total jobs</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase">Disputes</span>
                  <p className="text-base font-bold text-emerald-700">{user.disputeCount} Disputes</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase">Rating</span>
                  <p className="text-base font-bold text-amber-600">★ {user.rating} ({user.ratingCount} reviews)</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase">Total revenue</span>
                  <p className="text-base font-bold text-neutral-900">{formatNaira(user.walletBalanceKobo * 3, true)}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-500">
                Trade: <span className="font-semibold text-neutral-800">{user.trade || "General Marketplace"}</span> · Location: <span className="font-semibold text-neutral-800">{user.location}</span>
              </div>
            </div>

            {/* Verification Status */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Verification
                </span>
                <span className="text-xs text-[#074292] font-semibold cursor-pointer">Queue →</span>
              </div>
              <div className="pt-2">
                <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  ● Verified
                </span>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  All identification documents and NIN match verification records on file for this account.
                </p>
              </div>
              <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-500">
                NIN: <span className="font-mono font-bold text-neutral-700">{user.nin || "90123847120"}</span>
              </div>
            </div>

            {/* Wallet Quick Card */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Wallet
                </span>
                <span className="text-xs text-[#074292] font-semibold cursor-pointer">Transactions →</span>
              </div>
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Available:</span>
                  <span className="font-bold text-neutral-900">{formatNaira(user.walletBalanceKobo, true)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Pending (escrow):</span>
                  <span className="font-bold text-amber-700">{formatNaira(user.escrowBalanceKobo, true)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Withdrawn to bank:</span>
                  <span className="font-bold text-emerald-700">{formatNaira(user.walletBalanceKobo * 2, true)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Jobs & Open Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[#001B40]">Active Jobs</h3>
                <span className="text-xs text-[#074292] font-semibold cursor-pointer">All jobs →</span>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-neutral-900">JB-002379</p>
                    <p className="text-neutral-500">Solar inverter system wiring &amp; commissioning</p>
                  </div>
                  <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    ● In Progress
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-neutral-900">JB-002350</p>
                    <p className="text-neutral-500">AC compressor replacement</p>
                  </div>
                  <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ● Completed
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[#001B40]">Open Cases</h3>
                <span className="text-xs text-[#074292] font-semibold cursor-pointer">Disputes →</span>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-500">
                No open disputes or escalated incidents on this profile.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: JOBS */}
      {/* ========================================================= */}
      {activeTab === "jobs" && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Job</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Job status</th>
                  <th className="py-3 px-4">Posted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr className="hover:bg-neutral-50/60">
                  <td className="py-3.5 px-4 font-bold text-[#074292]">JB-002379</td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-900">Solar inverter system wiring &amp; commissioning</td>
                  <td className="py-3.5 px-4 text-neutral-700">Amaka Onyeka</td>
                  <td className="py-3.5 px-4 font-bold text-neutral-900">₦650,000</td>
                  <td className="py-3.5 px-4">
                    <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      ● In Escrow
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      ● In Progress
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-500">20 Aug 2026</td>
                </tr>
                <tr className="hover:bg-neutral-50/60">
                  <td className="py-3.5 px-4 font-bold text-[#074292]">JB-002350</td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-900">AC compressor replacement</td>
                  <td className="py-3.5 px-4 text-neutral-700">Segun Ajayi</td>
                  <td className="py-3.5 px-4 font-bold text-neutral-900">₦125,000</td>
                  <td className="py-3.5 px-4">
                    <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ● Released
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ● Completed
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-500">06 Aug 2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PAYMENTS */}
      {/* ========================================================= */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction</th>
                  <th className="py-3 px-4">Job</th>
                  <th className="py-3 px-4">Gross</th>
                  <th className="py-3 px-4">Platform fee</th>
                  <th className="py-3 px-4">Net to worker</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr className="hover:bg-neutral-50/60">
                  <td className="py-3.5 px-4 font-bold text-[#074292]">TX-008279</td>
                  <td className="py-3.5 px-4 font-medium text-neutral-700">JB-002379</td>
                  <td className="py-3.5 px-4 font-bold text-neutral-900">₦650,000</td>
                  <td className="py-3.5 px-4 text-neutral-500">₦52,000</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">₦598,000</td>
                  <td className="py-3.5 px-4 text-neutral-600">Bank transfer</td>
                  <td className="py-3.5 px-4">
                    <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      ● In Escrow
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-500">20 Aug 2026</td>
                </tr>
                <tr className="hover:bg-neutral-50/60">
                  <td className="py-3.5 px-4 font-bold text-[#074292]">TX-008250</td>
                  <td className="py-3.5 px-4 font-medium text-neutral-700">JB-002350</td>
                  <td className="py-3.5 px-4 font-bold text-neutral-900">₦125,000</td>
                  <td className="py-3.5 px-4 text-neutral-500">₦10,000</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">₦115,000</td>
                  <td className="py-3.5 px-4 text-neutral-600">Card</td>
                  <td className="py-3.5 px-4">
                    <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ● Successful
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-500">06 Aug 2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: WALLET */}
      {/* ========================================================= */}
      {activeTab === "wallet" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase">Available balance</span>
              <p className="text-xl font-black text-[#001B40] mt-1">{formatNaira(user.walletBalanceKobo, true)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase">Pending escrow</span>
              <p className="text-xl font-black text-[#074292] mt-1">{formatNaira(user.escrowBalanceKobo, true)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase">Total earnings</span>
              <p className="text-xl font-black text-emerald-700 mt-1">{formatNaira(user.walletBalanceKobo * 3, true)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase">Total withdrawn</span>
              <p className="text-xl font-black text-neutral-700 mt-1">{formatNaira(user.walletBalanceKobo * 2, true)}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div>
              <span className="font-bold">Notice on Ops Holds:</span>
              <p className="mt-0.5">Wallet is operating under normal parameters. No administrative freezes or debit memos active.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#001B40]">Wallet Activity Ledger</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-neutral-900">Payment release (JB-002350)</p>
                  <p className="text-neutral-500 text-[11px]">06 Aug 2026, 18:20</p>
                </div>
                <span className="font-bold text-emerald-700">+₦115,000</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-neutral-900">Withdrawal to GTBank •••• 6789</p>
                  <p className="text-neutral-500 text-[11px]">01 Aug 2026, 09:14</p>
                </div>
                <span className="font-bold text-neutral-700">-₦150,000</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: REVIEWS */}
      {/* ========================================================= */}
      {activeTab === "reviews" && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-amber-400">
                <span>★★★★★</span>
                <span className="text-neutral-700 font-bold ml-1">Amaka Onyeka → {user.fullName}</span>
                <span className="text-neutral-400">· 20 Aug 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#074292]">JB-002379</span>
                <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ● Clean
                </span>
              </div>
            </div>
            <p className="text-xs text-neutral-900 font-medium">
              &ldquo;Sized the system correctly and explained everything.&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: COMPLAINTS */}
      {/* ========================================================= */}
      {activeTab === "complaints" && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-3">
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-[#001B40]">PT-00471 Correct account name details</p>
              <p className="text-neutral-500 text-[11px] mt-0.5">Resolved · 05 Aug 2026, by Simeon Daniel</p>
            </div>
            <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              ● Resolved
            </span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: DISPUTES */}
      {/* ========================================================= */}
      {activeTab === "disputes" && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-xs text-neutral-400 space-y-2">
          <div className="text-3xl">⚖</div>
          <p className="font-bold text-neutral-700 text-sm">No disputes involving this user</p>
          <p>This user has zero open or historical dispute cases.</p>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: DOCUMENTS */}
      {/* ========================================================= */}
      {activeTab === "documents" && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-xs text-neutral-400 space-y-2">
          <div className="text-3xl">📄</div>
          <p className="font-bold text-neutral-700 text-sm">No documents on file</p>
          <p>This account has completed automated NIN identity checks with no pending manual uploads.</p>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 9: ACTIVITY */}
      {/* ========================================================= */}
      {activeTab === "activity" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#001B40]">User Activity</h3>
            <div className="space-y-3 text-xs border-l-2 border-neutral-200 pl-3">
              <div>
                <p className="font-bold text-neutral-900">● Account registered</p>
                <p className="text-[11px] text-neutral-500">Registered as worker · {user.joinedAt}</p>
              </div>
              <div>
                <p className="font-bold text-neutral-900">● Completed JB-002379</p>
                <p className="text-[11px] text-neutral-500">Solar installation — Lekki</p>
              </div>
              <div>
                <p className="font-bold text-neutral-900">● Last login</p>
                <p className="text-[11px] text-neutral-500">{user.lastActive}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#001B40]">Admin Actions on this Account</h3>
              <span className="text-xs text-[#074292] font-semibold cursor-pointer">Audit trail →</span>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-400">
              No sensitive admin actions or sanctions logged against this account yet.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUSPEND MODAL (Screenshot 4) */}
      {/* ========================================================= */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-extrabold text-[#001B40]">
                Suspend {user.fullName}?
              </h3>
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="text-red-600 text-base mt-0.5">⚠</span>
                <div className="text-xs text-red-950 font-medium space-y-1.5 leading-relaxed">
                  <p className="font-bold text-red-950">
                    All marketplace activity stopped immediately:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-red-900">
                    <li>Active jobs and withdrawals suspended</li>
                    <li>Talent receipt to escrow payments blocked</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmSuspend} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Reason category <span className="text-red-500">*</span>
                </label>
                <select
                  value={suspendCategory}
                  onChange={(e) => setSuspendCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#001B40]"
                >
                  <option value="Code of Conduct violation">Code of Conduct violation</option>
                  <option value="Fraud / suspicious rating patterns">Fraud / suspicious rating patterns</option>
                  <option value="Unresolved customer dispute">Unresolved customer dispute</option>
                  <option value="Safety incident investigation">Safety incident investigation</option>
                  <option value="Other operational sanction">Other operational sanction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Explain the decision. This is recorded against your admin account..."
                  className="w-full p-3 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#001B40]"
                />
              </div>

              <p className="text-[11px] text-neutral-400 italic">
                This action is written to the activity log with your admin identity timestamp.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSuspendModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSuspend || !suspendReason.trim()}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  {isSubmittingSuspend ? "Processing..." : "Suspend account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CONTACT USER MODAL */}
      {/* ========================================================= */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-extrabold text-[#001B40]">
                Contact {user.fullName}
              </h3>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {contactSentToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                ✓ Message dispatched via SMS and Email to {user.phone}
              </div>
            )}

            <form onSubmit={handleSendContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-bold mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="Official Notice regarding your account..."
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-bold mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Type your message to this user..."
                  className="w-full p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 font-bold text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!contactMessage.trim()}
                  className="px-5 py-2 rounded-xl bg-[#001B40] text-white font-bold hover:bg-[#074292] disabled:opacity-50"
                >
                  Dispatch Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
