"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getWalletApi, getWalletTransactionsApi, downloadPaymentReceiptApi } from "@/lib/api/wallet";
import { formatNaira } from "@/lib/utils/currency";
import { WalletTransaction } from "@/types/customer";

interface TalentPaymentsReceiptsViewProps {
  onBack: () => void;
  onRequestRefund?: () => void;
  programmeTitle?: string;
  feePaid?: string;
  startDate?: string;
  windowEnd?: string;
}

export function TalentPaymentsReceiptsView({
  onBack,
  onRequestRefund,
  programmeTitle = "Apprenticeship Programme",
  feePaid = "₦0",
  startDate = "Active intake",
  windowEnd = "30 days from start",
}: TalentPaymentsReceiptsViewProps) {
  const [activeTab, setActiveTab] = useState<"history" | "policy">("history");
  const [availableBalance, setAvailableBalance] = useState("₦0");
  const [heldBalance, setHeldBalance] = useState("₦0");
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Fetch live wallet balances
    getWalletApi()
      .then((w) => {
        if (!isMounted || !w) return;
        setAvailableBalance(formatNaira(Number(w.available ?? 0), true));
        setHeldBalance(formatNaira(Number(w.bookingHeld ?? 0), true));
      })
      .catch(() => {});

    // Fetch transactions & payment activity
    getWalletTransactionsApi({ category: "all" })
      .then((txns) => {
        if (!isMounted) return;
        setTransactions(txns || []);
      })
      .catch(() => {
        if (isMounted) setTransactions([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDownloadReceipt = async (tx: WalletTransaction) => {
    setDownloadingId(tx.id);
    try {
      const blob = await downloadPaymentReceiptApi(tx.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${tx.reference || tx.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Receipt downloaded successfully", { icon: "🧾" });
    } catch {
      // In case PDF generator is not active on mock/test environment, show informative feedback
      toast("Receipt PDF will be available once the transaction completes clearing.", { icon: "📄" });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Breadcrumb Back */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Progress</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Payments & receipts
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 font-medium mt-0.5">
          Apprenticeship payments, receipts, and 30-day escrow refund protection
        </p>
      </div>

      {/* Top Balances Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Available Wallet Balance */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase block">
            AVAILABLE WALLET BALANCE
          </span>
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#001B40] block">
            {availableBalance}
          </span>
          <span className="text-[11px] text-neutral-400">Available to fund training or withdraw</span>
        </div>

        {/* Held in Escrow */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase block">
            HELD IN ESCROW
          </span>
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-emerald-700 block">
            {heldBalance}
          </span>
          <span className="text-[11px] text-neutral-400">Released to master artisan as you complete milestones</span>
        </div>

        {/* Escrow Protection Badge */}
        <div className="bg-gradient-to-br from-[#001B40] to-[#074292] rounded-3xl p-5 text-white shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-300">🛡️</span>
            <span className="text-xs font-bold tracking-wide uppercase">30-DAY ESCROW PROTECTION</span>
          </div>
          <p className="text-[11px] text-blue-100 leading-snug">
            Your apprenticeship fee is held safely in escrow. If training does not match syllabus standards, you qualify for a refund.
          </p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-[#001B40] text-white shadow-xs"
              : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
          }`}
        >
          Transactions & receipts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("policy")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "policy"
              ? "bg-[#001B40] text-white shadow-xs"
              : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
          }`}
        >
          30-day refund policy
        </button>
      </div>

      {/* TAB 1: Transactions & Receipts */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs animate-pulse flex items-center justify-between"
                >
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-neutral-100 rounded-md w-1/3" />
                    <div className="h-3 bg-neutral-100 rounded-md w-1/4" />
                  </div>
                  <div className="h-8 w-24 bg-neutral-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs overflow-hidden">
              <div className="divide-y divide-neutral-100">
                {transactions.map((tx) => {
                  const isPositive = tx.type === "DEPOSIT" || tx.type === "REFUND";
                  const formattedAmount = formatNaira(Math.abs(Number(tx.amount || 0)), true);
                  const displayDate = tx.createdAt
                    ? new Date(tx.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Recent";

                  return (
                    <div
                      key={tx.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-sm ${
                            isPositive ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {isPositive ? "↓" : "↑"}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-heading font-bold text-sm text-[#0F1115]">
                            {tx.description || (isPositive ? "Wallet Deposit / Refund" : "Apprenticeship Payment")}
                          </h4>
                          <p className="font-sans text-xs text-neutral-400">
                            {displayDate} · Ref: <span className="font-mono text-neutral-600">{tx.reference || tx.id.slice(0, 8)}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <span
                          className={`font-heading font-extrabold text-sm sm:text-base ${
                            isPositive ? "text-emerald-600" : "text-[#0F1115]"
                          }`}
                        >
                          {isPositive ? `+${formattedAmount}` : `-${formattedAmount}`}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDownloadReceipt(tx)}
                          disabled={downloadingId === tx.id}
                          className="px-3.5 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-sans font-semibold text-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          {downloadingId === tx.id ? "Downloading..." : "Receipt PDF"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-2xs text-center space-y-4 mt-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl">
                🧾
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-[#0F1115]">
                  No payments or receipts yet
                </h3>
                <p className="font-sans text-xs text-neutral-400 leading-relaxed">
                  Payments made for apprenticeship programs or wallet top-ups will appear here with official PDF receipts.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 30-Day Refund Policy */}
      {activeTab === "policy" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Detailed Policy Content Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-9 border border-neutral-200/80 shadow-2xs space-y-7">
            <div className="space-y-2">
              <h2 className="font-heading font-bold text-base text-[#0F1115]">
                How escrow protection works
              </h2>
              <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                You can ask for a refund within 30 days of your start date. Your fee stays in Bluefixx escrow, so it can be returned to you safely without delays if expectations are not met.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading font-bold text-base text-[#0F1115]">
                You qualify for a full refund if:
              </h2>
              <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Sessions are cancelled or missed without a make-up plan, the training does not match the agreed syllabus level, or the workshop environment is unsafe.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading font-bold text-base text-[#0F1115]">
                You can get a partial refund if:
              </h2>
              <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                You change your mind within 30 days. We refund the total fee minus the proportional sessions you have already attended.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading font-bold text-base text-[#0F1115]">
                After 30 days:
              </h2>
              <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Refunds are only possible through an escalated problem report reviewed and arbitrated by the Bluefixx Safety & Resolution Desk.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <h2 className="font-heading font-bold text-base text-[#0F1115]">
                How you get paid
              </h2>
              <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Approved refunds are credited directly to your Bluefixx wallet within 24 hours, or to your verified bank account.
              </p>
            </div>
          </div>

          {/* Right Active Apprenticeship Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-6">
            <h3 className="font-heading font-bold text-base text-[#0F1115]">
              Active apprenticeship
            </h3>

            <div className="space-y-4 divide-y divide-neutral-100 text-xs sm:text-sm">
              <div className="pt-2 first:pt-0 flex items-start justify-between gap-4">
                <span className="text-neutral-400 font-medium shrink-0">Programme</span>
                <span className="font-bold text-[#0F1115] text-right truncate">{programmeTitle}</span>
              </div>

              <div className="pt-3 flex items-start justify-between gap-4">
                <span className="text-neutral-400 font-medium shrink-0">Fee in escrow</span>
                <span className="font-bold text-[#001B40]">{feePaid}</span>
              </div>

              <div className="pt-3 flex items-start justify-between gap-4">
                <span className="text-neutral-400 font-medium shrink-0">Intake period</span>
                <span className="font-semibold text-neutral-700">{startDate}</span>
              </div>

              <div className="pt-3 flex items-start justify-between gap-4">
                <span className="text-neutral-400 font-medium shrink-0">Refund window</span>
                <span className="font-semibold text-[#001B40]">{windowEnd}</span>
              </div>
            </div>

            {onRequestRefund && (
              <button
                type="button"
                onClick={onRequestRefund}
                className="w-full py-3.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-sans font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center"
              >
                Request a refund
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

