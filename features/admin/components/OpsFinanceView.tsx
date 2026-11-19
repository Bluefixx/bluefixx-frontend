"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  AdminTransaction,
  AdminWithdrawal,
  AdminRefund,
  CommissionTierConfig,
  WalletLedgerEntry,
} from "../types";
import {
  MOCK_ADMIN_TRANSACTIONS,
  MOCK_ADMIN_WITHDRAWALS,
  MOCK_ADMIN_REFUNDS,
  INITIAL_COMMISSION_CONFIG,
  MOCK_WALLET_LEDGER,
} from "../mockFinanceData";
import { OpsTransactionDetailDrawer } from "./OpsTransactionDetailDrawer";
import {
  OpsTxForceReleaseModal,
  OpsTxRefundModal,
} from "./OpsTransactionActionModals";
import {
  OpsWithdrawalReviewModal,
  OpsBatchPayoutModal,
} from "./OpsWithdrawalModals";
import { OpsCommissionConfigModal } from "./OpsCommissionConfigModal";
import { OpsSecurityPinModal } from "./OpsSecurityPinModal";

export function OpsFinanceView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "all";

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // State
  const [transactions, setTransactions] = useState<AdminTransaction[]>(MOCK_ADMIN_TRANSACTIONS);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>(MOCK_ADMIN_WITHDRAWALS);
  const [refunds, setRefunds] = useState<AdminRefund[]>(MOCK_ADMIN_REFUNDS);
  const [commissionConfig, setCommissionConfig] = useState<CommissionTierConfig>(INITIAL_COMMISSION_CONFIG);
  const [walletLedger, setWalletLedger] = useState<WalletLedgerEntry[]>(MOCK_WALLET_LEDGER);

  // Filters
  const [txSearchQuery, setTxSearchQuery] = useState("");
  const [txFilterStatus, setTxFilterStatus] = useState<string>("ALL");
  const [txFilterMethod, setTxFilterMethod] = useState<string>("ALL");
  const [showFailedPaymentsOnly, setShowFailedPaymentsOnly] = useState(false);

  // Selection for Batch Withdrawals (Feature 4)
  const [selectedWithdrawalIds, setSelectedWithdrawalIds] = useState<string[]>([]);

  // Modals & Drawers state
  const [selectedTxForDrawer, setSelectedTxForDrawer] = useState<AdminTransaction | null>(null);
  const [txForForceRelease, setTxForForceRelease] = useState<AdminTransaction | null>(null);
  const [txForRefund, setTxForRefund] = useState<AdminTransaction | null>(null);
  const [activeMenuTxId, setActiveMenuTxId] = useState<string | null>(null);

  const [selectedWdForReview, setSelectedWdForReview] = useState<AdminWithdrawal | null>(null);
  const [isBatchPayoutModalOpen, setIsBatchPayoutModalOpen] = useState(false);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);

  // PIN security authorization state
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

  // Reset filters when tab changes
  useEffect(() => {
    setTxSearchQuery("");
    setTxFilterStatus("ALL");
    setTxFilterMethod("ALL");
    setShowFailedPaymentsOnly(false);
    setSelectedWithdrawalIds([]);
  }, [currentTab]);

  const handleTabChange = (tab: string) => {
    if (tab === "all") {
      router.push("/ops/finance");
    } else {
      router.push(`/ops/finance?tab=${tab}`);
    }
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (showFailedPaymentsOnly && tx.status !== "FAILED") return false;

      if (txSearchQuery.trim()) {
        const q = txSearchQuery.toLowerCase();
        const match =
          tx.id.toLowerCase().includes(q) ||
          tx.customer.name.toLowerCase().includes(q) ||
          tx.customer.code.toLowerCase().includes(q) ||
          tx.worker.name.toLowerCase().includes(q) ||
          tx.worker.code.toLowerCase().includes(q) ||
          tx.job.id.toLowerCase().includes(q) ||
          tx.job.title.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (txFilterStatus !== "ALL" && tx.status !== txFilterStatus) return false;
      if (txFilterMethod !== "ALL" && tx.method !== txFilterMethod) return false;

      return true;
    });
  }, [transactions, showFailedPaymentsOnly, txSearchQuery, txFilterStatus, txFilterMethod]);

  // Selected withdrawals list
  const selectedWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => selectedWithdrawalIds.includes(w.id));
  }, [withdrawals, selectedWithdrawalIds]);

  // Action Handlers
  const handleForceReleaseConfirm = (tx: AdminTransaction, justification: string) => {
    requirePinAuth(
      "Authorize Force Escrow Release",
      `Releasing ₦${tx.workerEarnings.toLocaleString()} to ${tx.worker.name} requires Operations Admin PIN authorization.`,
      "Confirm Release",
      () => {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === tx.id
              ? {
                  ...t,
                  status: "RELEASED",
                  timeline: { ...t.timeline, payoutReleased: "Released by Admin (Simeon Daniel)" },
                  auditHistory: [
                    {
                      id: `aud-${Date.now()}`,
                      action: "Force Escrow Release Executed",
                      actor: "Simeon Daniel (Admin)",
                      date: "Just now",
                    },
                    ...t.auditHistory,
                  ],
                }
              : t
          )
        );
        toast.success(`Escrow released for ${tx.id}. Worker wallet credited.`);
      }
    );
  };

  const handleRefundConfirm = (
    tx: AdminTransaction,
    refundAmount: number,
    splitPercent: number,
    reason: string
  ) => {
    requirePinAuth(
      "Authorize Escrow Refund",
      `Executing refund of ₦${refundAmount.toLocaleString()} to ${tx.customer.name} requires Operations Admin PIN authorization.`,
      "Confirm Refund",
      () => {
        const newRefund: AdminRefund = {
          id: `RF-000${Date.now().toString().slice(-3)}`,
          transactionId: tx.id,
          customer: { id: tx.customer.id, code: tx.customer.code, name: tx.customer.name },
          worker: { id: tx.worker.id, code: tx.worker.code, name: tx.worker.name },
          job: { id: tx.job.id, title: tx.job.title },
          amount: refundAmount,
          reason,
          status: "Processed",
          admin: "Simeon Daniel",
          date: "Just now",
        };

        setRefunds((prev) => [newRefund, ...prev]);

        setTransactions((prev) =>
          prev.map((t) =>
            t.id === tx.id
              ? {
                  ...t,
                  status: splitPercent === 100 ? "REFUNDED" : t.status,
                  refundHistory: [
                    {
                      id: newRefund.id,
                      amount: refundAmount,
                      reason,
                      date: "Just now",
                      admin: "Simeon Daniel",
                      status: "Processed",
                    },
                    ...(t.refundHistory || []),
                  ],
                  auditHistory: [
                    {
                      id: `aud-${Date.now()}`,
                      action: `Escrow Refund Executed (₦${refundAmount.toLocaleString()})`,
                      actor: "Simeon Daniel (Admin)",
                      date: "Just now",
                    },
                    ...t.auditHistory,
                  ],
                }
              : t
          )
        );
        toast.success(`Refund of ₦${refundAmount.toLocaleString()} processed for ${tx.id}.`);
      }
    );
  };

  const handleSingleWithdrawalApprove = (wd: AdminWithdrawal) => {
    requirePinAuth(
      "Authorize Withdrawal Payout",
      `Releasing ₦${wd.amount.toLocaleString()} to ${wd.worker.name}'s ${wd.destinationBank.bankName} account requires Admin PIN.`,
      "Approve Payout",
      () => {
        setWithdrawals((prev) =>
          prev.map((w) =>
            w.id === wd.id ? { ...w, status: "APPROVED", assignedAdmin: "Simeon Daniel" } : w
          )
        );
        toast.success(`Withdrawal ${wd.id} approved. Funds dispatched via NIBSS.`);
      }
    );
  };

  const handleSingleWithdrawalReject = (wd: AdminWithdrawal, reason: string) => {
    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === wd.id
          ? {
              ...w,
              status: "REJECTED",
              assignedAdmin: "Simeon Daniel",
              riskNote: `Rejected: ${reason}`,
            }
          : w
      )
    );
    toast.error(`Withdrawal ${wd.id} rejected and funds returned to worker wallet.`);
  };

  const handleBatchPayoutConfirm = (batch: AdminWithdrawal[]) => {
    const total = batch.reduce((acc, w) => acc + w.amount, 0);
    requirePinAuth(
      "Authorize Batch Payout",
      `Executing consolidated batch release of ₦${total.toLocaleString()} across ${batch.length} worker accounts requires Admin PIN.`,
      "Disburse Batch",
      () => {
        const batchIds = new Set(batch.map((b) => b.id));
        setWithdrawals((prev) =>
          prev.map((w) =>
            batchIds.has(w.id) ? { ...w, status: "APPROVED", assignedAdmin: "Simeon Daniel" } : w
          )
        );
        setSelectedWithdrawalIds([]);
        toast.success(`Batch payout of ₦${total.toLocaleString()} successfully processed.`);
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Transactions & finance</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Customer payment, Bluefixx platform fee and worker earnings appear separately on every row — they can never exist apart.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (typeof window === "undefined") return;
              const csv = filteredTransactions
                .map(
                  (t) =>
                    `"${t.id}","${t.customer.name}","${t.worker.name}","${t.job.id}",${t.grossAmount},${t.platformFee},${t.workerEarnings},"${t.method}","${t.status}","${t.date}"`
                )
                .join("\n");
              const blob = new Blob(
                ["Tx ID,Customer,Worker,Job,Gross,Platform Fee,Worker Earnings,Method,Status,Date\n" + csv],
                { type: "text/csv;charset=utf-8;" }
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `bluefixx_finance_${currentTab}_${Date.now()}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Ledger exported to CSV.");
            }}
            className="px-3.5 py-2 text-xs font-bold bg-[#001B40] text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export ledger
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="border-b border-neutral-200 px-6 pt-3 flex gap-6 overflow-x-auto">
          {[
            { id: "all", label: "All transactions" },
            { id: "withdrawals", label: "Withdrawals", badge: withdrawals.filter((w) => w.status === "PENDING" || w.status === "FLAGGED").length },
            { id: "refunds", label: "Refunds", badge: refunds.filter((r) => r.status === "Pending").length },
            { id: "revenue", label: "Platform revenue" },
            { id: "wallet", label: "Wallet activity" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                currentTab === tab.id
                  ? "border-[#001B40] text-[#001B40]"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: ALL TRANSACTIONS */}
        {currentTab === "all" && (
          <div>
            {/* 5 KPI Metric Cards (Screenshot 1) */}
            <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 bg-white rounded-2xl border border-neutral-200 shadow-xs">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase">Gross Volume</div>
                  <div className="text-base font-extrabold text-neutral-900 mt-1">₦2,050,000</div>
                  <span className="text-[10px] text-emerald-600 font-medium">Across all jobs</span>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-neutral-200 shadow-xs">
                  <div className="text-[10px] font-bold text-blue-700 uppercase">Platform Fee</div>
                  <div className="text-base font-extrabold text-blue-900 mt-1">₦205,000</div>
                  <span className="text-[10px] text-blue-600 font-medium">10% Take rate</span>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-neutral-200 shadow-xs">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">Worker Earnings</div>
                  <div className="text-base font-extrabold text-emerald-900 mt-1">₦1,845,000</div>
                  <span className="text-[10px] text-emerald-600 font-medium">90% Net share</span>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-neutral-200 shadow-xs">
                  <div className="text-[10px] font-bold text-amber-700 uppercase">Pending Escrow</div>
                  <div className="text-base font-extrabold text-amber-900 mt-1">₦350,000</div>
                  <span className="text-[10px] text-amber-600 font-medium">Held securely</span>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-neutral-200 shadow-xs">
                  <div className="text-[10px] font-bold text-rose-700 uppercase">Disputed / Failed</div>
                  <div className="text-base font-extrabold text-rose-900 mt-1">5</div>
                  <span className="text-[10px] text-rose-600 font-medium">Requires audit</span>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-neutral-200 shadow-xs">
                  <div className="text-[10px] font-bold text-neutral-500 uppercase">Wallet Liquidity</div>
                  <div className="text-base font-extrabold text-neutral-900 mt-1">₦2,140,000</div>
                  <span className="text-[10px] text-neutral-500 font-medium">Settled funds</span>
                </div>
              </div>
            </div>

            {/* Alert Banner: Failed Payments on Active Jobs */}
            <div className="mx-6 my-4 p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-amber-600 text-lg">⚠️</span>
                <div>
                  <div className="text-xs font-bold text-amber-900">
                    Failed payments on active jobs
                  </div>
                  <div className="text-[11px] text-amber-800">
                    Work may already be underway with no money held in escrow.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFailedPaymentsOnly((prev) => !prev)}
                className="text-xs font-bold text-neutral-900 hover:underline shrink-0 flex items-center gap-1"
              >
                <span>{showFailedPaymentsOnly ? "Clear filter" : "Filter to these (4)"}</span>
                <span>→</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                <div className="relative min-w-[240px] max-w-sm flex-1">
                  <svg
                    className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by Tx ID, customer or worker..."
                    value={txSearchQuery}
                    onChange={(e) => setTxSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#001B40]"
                  />
                </div>

                <select
                  value={txFilterStatus}
                  onChange={(e) => setTxFilterStatus(e.target.value)}
                  className="text-xs bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-neutral-700"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="IN_ESCROW">In Escrow</option>
                  <option value="HOLDING">Holding</option>
                  <option value="RELEASED">Released</option>
                  <option value="DISPUTED">Disputed</option>
                  <option value="REFUNDED">Refunded</option>
                  <option value="FAILED">Failed</option>
                </select>

                <select
                  value={txFilterMethod}
                  onChange={(e) => setTxFilterMethod(e.target.value)}
                  className="text-xs bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-neutral-700"
                >
                  <option value="ALL">Payment Method</option>
                  <option value="Card — Paystack">Card — Paystack</option>
                  <option value="Bank transfer">Bank transfer</option>
                </select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto min-h-[360px] pb-16">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50/80 text-neutral-500 uppercase tracking-wider text-[11px] border-b border-neutral-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Tx ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Worker</th>
                    <th className="py-3 px-4">Job</th>
                    <th className="py-3 px-4">Gross Amount</th>
                    <th className="py-3 px-4">Platform Fee</th>
                    <th className="py-3 px-4">Worker Earnings</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {filteredTransactions.map((tx, index) => {
                    const isMenuOpen = activeMenuTxId === tx.id;
                    const openUpwards = index >= Math.max(0, filteredTransactions.length - 2);

                    return (
                      <tr
                        key={tx.id}
                        onClick={() => setSelectedTxForDrawer(tx)}
                        className="hover:bg-neutral-50/70 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[#001B40] group-hover:underline">
                          {tx.id}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-900">
                          {tx.customer.name}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-700">
                          {tx.worker.name}
                          <span className="text-[10px] text-neutral-400 block font-normal">
                            {tx.worker.trade}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#001B40]">{tx.job.id}</td>
                        <td className="py-3.5 px-4 font-extrabold text-neutral-900">
                          ₦{tx.grossAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-blue-700">
                          ₦{tx.platformFee.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-700">
                          ₦{tx.workerEarnings.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-600 whitespace-nowrap">{tx.method}</td>
                        <td className="py-3.5 px-4">
                          {tx.status === "IN_ESCROW" && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              In Escrow
                            </span>
                          )}
                          {tx.status === "HOLDING" && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Holding
                            </span>
                          )}
                          {tx.status === "RELEASED" && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Released
                            </span>
                          )}
                          {tx.status === "DISPUTED" && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              Disputed
                            </span>
                          )}
                          {tx.status === "REFUNDED" && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-300">
                              Refunded
                            </span>
                          )}
                          {tx.status === "FAILED" && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 border border-red-300">
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">{tx.date}</td>
                        <td
                          className="py-3.5 px-4 text-right relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveMenuTxId(isMenuOpen ? null : tx.id)}
                            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </button>

                          {isMenuOpen && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setActiveMenuTxId(null)} />
                              <div
                                className={`absolute right-4 w-48 bg-white rounded-2xl shadow-xl border border-neutral-200 py-1.5 z-40 text-left animate-in fade-in zoom-in-95 ${
                                  openUpwards ? "bottom-8 mb-1" : "top-full mt-1"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTxForDrawer(tx);
                                    setActiveMenuTxId(null);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  <span>🔍</span> Inspect Details
                                </button>

                                {tx.status === "IN_ESCROW" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTxForForceRelease(tx);
                                      setActiveMenuTxId(null);
                                    }}
                                    className="w-full px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                                  >
                                    <span>💰</span> Force Release
                                  </button>
                                )}

                                {(tx.status === "IN_ESCROW" || tx.status === "HOLDING" || tx.status === "DISPUTED") && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTxForRefund(tx);
                                      setActiveMenuTxId(null);
                                    }}
                                    className="w-full px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                                  >
                                    <span>↩️</span> Issue Refund
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: WITHDRAWALS & BATCH PAYOUTS (Feature 4) */}
        {currentTab === "withdrawals" && (
          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Withdrawals</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Payouts approved manually or automatically. Suspicious withdrawals require administrator sign-off before payout release.
              </p>
            </div>

            {/* Batch Selection Bar (Feature 4) */}
            {selectedWithdrawalIds.length > 0 && (
              <div className="p-3.5 bg-[#001B40] text-white rounded-2xl flex items-center justify-between shadow-lg animate-in fade-in">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold">{selectedWithdrawalIds.length} withdrawals selected</span>
                  <span>•</span>
                  <span>
                    Total: ₦{selectedWithdrawals.reduce((a, b) => a + b.amount, 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedWithdrawalIds([])}
                    className="px-3 py-1 text-xs text-neutral-300 hover:text-white"
                  >
                    Deselect All
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBatchPayoutModalOpen(true)}
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs"
                  >
                    Authorize Batch Payout
                  </button>
                </div>
              </div>
            )}

            {/* Withdrawals Table */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[11px] border-b border-neutral-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedWithdrawalIds.length === withdrawals.length}
                        onChange={() => {
                          if (selectedWithdrawalIds.length === withdrawals.length) {
                            setSelectedWithdrawalIds([]);
                          } else {
                            setSelectedWithdrawalIds(withdrawals.map((w) => w.id));
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="py-3 px-4">Worker</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Requested</th>
                    <th className="py-3 px-4">Destination Bank</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Admin</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {withdrawals.map((wd) => {
                    const isChecked = selectedWithdrawalIds.includes(wd.id);

                    return (
                      <tr key={wd.id} className="hover:bg-neutral-50/70">
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedWithdrawalIds((prev) =>
                                prev.includes(wd.id) ? prev.filter((id) => id !== wd.id) : [...prev, wd.id]
                              );
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-neutral-900">{wd.worker.name}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">
                            {wd.worker.code} • {wd.worker.trade}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-neutral-900">
                          ₦{wd.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">{wd.requestedAt}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-neutral-800">
                            {wd.destinationBank.bankName} · {wd.destinationBank.accountNumber}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                            <span>{wd.destinationBank.accountName}</span>
                            {wd.destinationBank.nameMatchStatus === "MATCH" && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                ✓ Match
                              </span>
                            )}
                            {wd.destinationBank.nameMatchStatus === "PARTIAL" && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                ⚠️ Partial
                              </span>
                            )}
                            {wd.destinationBank.nameMatchStatus === "MISMATCH" && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                                🚨 Mismatch
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {wd.status === "PENDING" && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              Pending
                            </span>
                          )}
                          {wd.status === "APPROVED" && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Approved
                            </span>
                          )}
                          {wd.status === "FLAGGED" && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                              Flagged
                            </span>
                          )}
                          {wd.status === "IN_REVIEW" && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                              In Review
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-600">{wd.assignedAdmin}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedWdForReview(wd)}
                            className="px-3 py-1.5 text-xs font-bold text-[#001B40] hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200"
                          >
                            Review & Decide
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REFUNDS */}
        {currentTab === "refunds" && (
          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Refunds</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Every refund carries a reason, an approving admin, and a reversal of the matching platform fee.
              </p>
            </div>

            <div className="border border-neutral-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[11px] border-b border-neutral-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Refund ID</th>
                    <th className="py-3 px-4">Transaction</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Worker</th>
                    <th className="py-3 px-4">Job</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Admin</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {refunds.map((rf) => (
                    <tr key={rf.id} className="hover:bg-neutral-50/70">
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-700">{rf.id}</td>
                      <td className="py-3.5 px-4 font-mono text-[#001B40]">{rf.transactionId}</td>
                      <td className="py-3.5 px-4 font-semibold">{rf.customer.name}</td>
                      <td className="py-3.5 px-4 text-neutral-700">{rf.worker.name}</td>
                      <td className="py-3.5 px-4 font-mono text-neutral-500">{rf.job.id}</td>
                      <td className="py-3.5 px-4 font-extrabold text-rose-700">
                        ₦{rf.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600 max-w-xs">{rf.reason}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800">
                          {rf.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600">{rf.admin}</td>
                      <td className="py-3.5 px-4 text-right text-neutral-500 whitespace-nowrap">{rf.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PLATFORM REVENUE & COMMISSION OVERRIDE (Feature 5) */}
        {currentTab === "revenue" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Platform revenue</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Commission earned, refunded and settled — the only place where Bluefixx money is the subject.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCommissionModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-[#001B40] text-white rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  ⚙️ Edit Commission Policy
                </button>
              </div>
            </div>

            {/* 4 Metric Cards (Screenshot 2) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
                <div className="text-[10px] font-bold text-neutral-400 uppercase">Gross Merchandise Value</div>
                <div className="text-xl font-extrabold text-neutral-900 mt-1">₦12,480,000</div>
                <span className="text-[10px] text-emerald-600 font-semibold">+12.4% vs last period</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 shadow-xs">
                <div className="text-[10px] font-bold text-blue-700 uppercase">Net Platform Revenue</div>
                <div className="text-xl font-extrabold text-blue-900 mt-1">₦1,040,800</div>
                <span className="text-[10px] text-blue-700 font-semibold">10.0% Baseline take rate</span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 shadow-xs">
                <div className="text-[10px] font-bold text-rose-700 uppercase">Refunds Deducted</div>
                <div className="text-xl font-extrabold text-rose-900 mt-1">₦160,000</div>
                <span className="text-[10px] text-rose-600 font-semibold">Reversed commissions</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-xs">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Net Settled Profit</div>
                <div className="text-xl font-extrabold text-emerald-900 mt-1">₦1,452,000</div>
                <span className="text-[10px] text-emerald-700 font-semibold">Liquid operating capital</span>
              </div>
            </div>

            {/* Revenue Trend SVG Chart */}
            <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800">Revenue Trend (30 Days)</span>
                <span className="text-neutral-500 font-mono">Net GTV vs Commission</span>
              </div>

              <div className="h-40 w-full relative flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Gradient Area */}
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#001B40" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#001B40" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M0,100 C80,85 140,75 220,60 C300,45 380,30 500,20 L500,120 L0,120 Z"
                    fill="url(#revenueGrad)"
                  />
                  <path
                    d="M0,100 C80,85 140,75 220,60 C300,45 380,30 500,20"
                    fill="none"
                    stroke="#001B40"
                    strokeWidth="3"
                  />
                </svg>
              </div>
            </div>

            {/* Revenue by Trade & Commission Configuration Split (Screenshot 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Revenue by Trade */}
              <div className="p-5 bg-white border border-neutral-200 rounded-2xl space-y-3 shadow-xs">
                <h3 className="font-bold text-xs uppercase text-neutral-500 tracking-wider">
                  Revenue by Trade
                </h3>
                <div className="space-y-2.5 text-xs">
                  {[
                    { trade: "Electrical", rev: 324000, max: 400000 },
                    { trade: "Plumbing", rev: 290000, max: 400000 },
                    { trade: "Cleaning", rev: 182000, max: 400000 },
                    { trade: "Carpentry", rev: 145000, max: 400000 },
                    { trade: "Painting", rev: 99000, max: 400000 },
                  ].map((t) => (
                    <div key={t.trade}>
                      <div className="flex justify-between font-semibold text-neutral-800 mb-1">
                        <span>{t.trade}</span>
                        <span>₦{t.rev.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                        <div
                          style={{ width: `${(t.rev / t.max) * 100}%` }}
                          className="bg-[#001B40] h-full rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commission Configuration (Screenshot 2) */}
              <div className="p-5 bg-white border border-neutral-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase text-neutral-500 tracking-wider">
                    Commission Configuration
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCommissionModalOpen(true)}
                    className="text-xs font-bold text-[#001B40] hover:underline"
                  >
                    Edit Policy →
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between p-2.5 bg-neutral-50 rounded-xl">
                    <span className="text-neutral-600">Standard Marketplace Take Rate:</span>
                    <strong className="text-neutral-900">{commissionConfig.standardCommissionPercent}%</strong>
                  </div>
                  <div className="flex justify-between p-2.5 bg-neutral-50 rounded-xl">
                    <span className="text-neutral-600">Solar Installation Discounted Rate:</span>
                    <strong className="text-neutral-900">{commissionConfig.solarCommissionPercent}%</strong>
                  </div>
                  <div className="flex justify-between p-2.5 bg-neutral-50 rounded-xl">
                    <span className="text-neutral-600">Apprenticeship Program Fee:</span>
                    <strong className="text-neutral-900">{commissionConfig.apprenticeshipCommissionPercent}%</strong>
                  </div>
                  <div className="flex justify-between p-2.5 bg-neutral-50 rounded-xl">
                    <span className="text-neutral-600">Worker Flat Withdrawal Fee:</span>
                    <strong className="text-neutral-900">₦{commissionConfig.withdrawalFlatFee}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WALLET OPERATIONS */}
        {currentTab === "wallet" && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Wallet operations</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Every wallet balance across the marketplace: Bluefixx balance (held safely), liabilities vs platform revenue.
              </p>
            </div>

            {/* 4 System Balance Cards (Screenshot 2) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
                <div className="text-[10px] font-bold text-neutral-400 uppercase">Balances Held on Behalf of Users</div>
                <div className="text-xl font-extrabold text-neutral-900 mt-1">₦3,080,000</div>
                <span className="text-[10px] text-neutral-500 font-medium">User deposits</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-xs">
                <div className="text-[10px] font-bold text-amber-800 uppercase">Total in Escrow (Held)</div>
                <div className="text-xl font-extrabold text-amber-900 mt-1">₦1,284,000</div>
                <span className="text-[10px] text-amber-700 font-medium">Locked for active jobs</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-xs">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">Available Liquid Balances</div>
                <div className="text-xl font-extrabold text-emerald-900 mt-1">₦1,796,000</div>
                <span className="text-[10px] text-emerald-700 font-medium">Ready for withdrawal</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 shadow-xs">
                <div className="text-[10px] font-bold text-blue-800 uppercase">Platform Revenue</div>
                <div className="text-xl font-extrabold text-blue-900 mt-1">₦1,842,500</div>
                <span className="text-[10px] text-blue-700 font-medium">Separated ledger funds</span>
              </div>
            </div>

            {/* Operational Alert Banner */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-3">
              <span className="text-base text-amber-600">⚠️</span>
              <div>
                <strong>3 wallet states need operational follow-up:</strong> Failed wallet funding (₦40,000 on TX-008275), 1 fake payout attempt (₦180,000), and pending reversal.
              </div>
            </div>

            {/* Live Ledger Table */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[11px] border-b border-neutral-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Tx ID</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {walletLedger.map((w) => (
                    <tr key={w.id} className="hover:bg-neutral-50/70">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#001B40]">{w.id}</td>
                      <td className="py-3.5 px-4 font-semibold">
                        {w.user.name}
                        <span className="text-[10px] text-neutral-400 font-mono block">
                          {w.user.code} • {w.user.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700">{w.type}</td>
                      <td className="py-3.5 px-4 font-extrabold text-neutral-900">
                        ₦{w.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            w.status === "Successful"
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-amber-50 text-amber-800"
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-neutral-500 whitespace-nowrap">{w.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Transaction 360° Detail Drawer */}
      <OpsTransactionDetailDrawer
        transaction={selectedTxForDrawer}
        isOpen={Boolean(selectedTxForDrawer)}
        onClose={() => setSelectedTxForDrawer(null)}
        onForceRelease={(tx) => setTxForForceRelease(tx)}
        onIssueRefund={(tx) => setTxForRefund(tx)}
      />

      {/* Force Escrow Release Modal (Feature 3) */}
      <OpsTxForceReleaseModal
        transaction={txForForceRelease}
        isOpen={Boolean(txForForceRelease)}
        onClose={() => setTxForForceRelease(null)}
        onConfirm={handleForceReleaseConfirm}
      />

      {/* Issue Refund Modal (Feature 3) */}
      <OpsTxRefundModal
        transaction={txForRefund}
        isOpen={Boolean(txForRefund)}
        onClose={() => setTxForRefund(null)}
        onConfirm={handleRefundConfirm}
      />

      {/* Single Withdrawal Review Modal (Feature 4) */}
      <OpsWithdrawalReviewModal
        withdrawal={selectedWdForReview}
        isOpen={Boolean(selectedWdForReview)}
        onClose={() => setSelectedWdForReview(null)}
        onApprove={handleSingleWithdrawalApprove}
        onReject={handleSingleWithdrawalReject}
      />

      {/* Batch Payout Execution Modal (Feature 4) */}
      <OpsBatchPayoutModal
        selectedWithdrawals={selectedWithdrawals}
        isOpen={isBatchPayoutModalOpen}
        onClose={() => setIsBatchPayoutModalOpen(false)}
        onConfirmBatch={handleBatchPayoutConfirm}
      />

      {/* Commission Configuration Modal (Feature 5) */}
      <OpsCommissionConfigModal
        currentConfig={commissionConfig}
        isOpen={isCommissionModalOpen}
        onClose={() => setIsCommissionModalOpen(false)}
        onSave={(newCfg) => setCommissionConfig(newCfg)}
      />

      {/* Admin Security PIN Authorization */}
      <OpsSecurityPinModal
        isOpen={pendingPinAction.isOpen}
        title={pendingPinAction.title}
        description={pendingPinAction.description}
        actionLabel={pendingPinAction.actionLabel}
        onClose={() => setPendingPinAction((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={pendingPinAction.onSuccess}
      />
    </div>
  );
}
