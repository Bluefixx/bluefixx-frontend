"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import { getWalletApi, getWalletTransactionsApi, verifyPaymentApi } from "@/lib/api/wallet";
import { FundWalletView } from "@/features/dashboard/components/FundWalletView";
import { WithdrawWalletView } from "@/features/dashboard/components/WithdrawWalletView";

interface WalletTransaction {
  id: string;
  title: string;
  artisanName?: string;
  category: "payment" | "funding" | "deposit" | "refund";
  date: string;
  amount: number;
  isCredit: boolean;
  status: "Secured" | "Completed" | "Released" | "Returned";
  labour?: number;
  materials?: number;
  reference: string;
  balanceBefore: number;
  balanceAfter: number;
}

export default function WalletPage() {
  const { walletBalance, setWalletBalance } = useAuth();
  const [balance, setBalance] = useState<number>(walletBalance ?? 0);
  const [heldBalance, setHeldBalance] = useState<number>(0);
  const [activeView, setActiveView] = useState<"overview" | "fund" | "withdraw">("overview");
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);
  const [activeTab, setActiveTab] = useState<"All" | "Payments" | "Deposits" | "Funding" | "Refunds">("All");

  // Modals
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPaymentMethodsModalOpen, setIsPaymentMethodsModalOpen] = useState(false);
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadWalletData = async () => {
      try {
        const data = await getWalletApi();
        if (!mounted || !data) return;
        const rawAvail = (data as any).availableBalanceKobo ?? data.available;
        if (rawAvail !== undefined && rawAvail !== null) {
          const kobo = typeof rawAvail === "string" ? parseInt(rawAvail, 10) : rawAvail;
          if (!isNaN(kobo)) {
            const naira = Math.round(kobo / 100);
            setBalance(naira);
            setWalletBalance(naira);
          }
        }
        const rawHeld = (data as any).heldBalanceKobo ?? data.bookingHeld;
        if (rawHeld !== undefined && rawHeld !== null) {
          const kobo = typeof rawHeld === "string" ? parseInt(rawHeld, 10) : rawHeld;
          if (!isNaN(kobo)) {
            setHeldBalance(Math.round(kobo / 100));
          }
        }
      } catch (err) {
        console.debug("Wallet API unavailable:", err);
      }

      try {
        const items = await getWalletTransactionsApi();
        if (!mounted) return;
        if (Array.isArray(items) && items.length > 0) {
          const mapped: WalletTransaction[] = items.map((it: any) => ({
            id: it.id,
            title: it.description || it.title || (it.category === "FUNDING" ? "Wallet funding" : "Job payment"),
            artisanName: it.peerName || it.artisanName,
            category: (it.category?.toLowerCase() as any) || (it.isCredit ? "funding" : "payment"),
            date: it.createdAt
              ? new Date(it.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
              : "Recent",
            amount: Math.abs(Math.round(Number(it.amountKobo ?? it.amount ?? 0) / 100)),
            isCredit: Boolean(it.isCredit ?? (Number(it.amountKobo ?? it.amount ?? 0) > 0)),
            status: it.status || "Completed",
            labour: it.labourKobo ? Math.round(Number(it.labourKobo) / 100) : undefined,
            materials: it.materialsKobo ? Math.round(Number(it.materialsKobo) / 100) : undefined,
            reference: it.reference || it.id,
            balanceBefore: Math.round(Number(it.balanceBeforeKobo ?? 0) / 100),
            balanceAfter: Math.round(Number(it.balanceAfterKobo ?? 0) / 100),
          }));
          setTransactions(mapped);
        }
      } catch (err) {
        console.debug("Transactions API offline:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    const verifyReturningTopup = async () => {
      if (typeof window === "undefined") {
        await loadWalletData();
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const urlRef = params.get("reference") || params.get("trxref");
      const rawPending = sessionStorage.getItem("bluefixx_pending_topup");

      if (rawPending) {
        try {
          const pending = JSON.parse(rawPending) as {
            paymentId?: string;
            reference?: string;
            amount?: number;
          };
          if (pending.paymentId && (!urlRef || !pending.reference || urlRef === pending.reference)) {
            const verified = await verifyPaymentApi(pending.paymentId);
            if (!mounted) return;
            if (verified?.status === "SUCCEEDED") {
              sessionStorage.removeItem("bluefixx_pending_topup");
              toast.success(
                pending.amount
                  ? `Wallet funded with ₦${pending.amount.toLocaleString()}!`
                  : "Wallet funded successfully!"
              );
            } else if (verified?.status === "FAILED") {
              sessionStorage.removeItem("bluefixx_pending_topup");
              toast.error("Paystack payment failed or was cancelled.");
            } else {
              toast("Payment is still pending confirmation.");
            }
          }
        } catch (err: any) {
          if (mounted) {
            toast.error(err?.message || "Could not verify Paystack payment yet.");
          }
        }
      }

      if (urlRef) {
        window.history.replaceState({}, "", "/wallet");
      }

      await loadWalletData();
    };

    void verifyReturningTopup();

    return () => {
      mounted = false;
    };
  }, [setWalletBalance]);

  const filteredTransactions = transactions.filter((txn) => {
    if (activeTab === "All") return true;
    if (activeTab === "Payments") return txn.category === "payment";
    if (activeTab === "Deposits") return txn.category === "deposit";
    if (activeTab === "Funding") return txn.category === "funding";
    if (activeTab === "Refunds") return txn.category === "refund";
    return true;
  });

  const handleCopyReference = (ref: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ref);
    }
    toast.success(`Copied reference ${ref} to clipboard!`);
  };

  const handleDepositCompleted = (amount: number, newBal: number, reference: string) => {
    setBalance(newBal);
    const newTxn: WalletTransaction = {
      id: `txn-${Date.now()}`,
      title: "Wallet funding - Paystack",
      category: "funding",
      date: "Just now",
      amount: amount,
      isCredit: true,
      status: "Completed",
      reference: reference,
      balanceBefore: balance,
      balanceAfter: newBal,
    };
    setTransactions((prev) => [newTxn, ...prev]);
  };

  const handleWithdrawalCompleted = (amount: number, newBal: number, reference: string) => {
    setBalance(newBal);
    const newTxn: WalletTransaction = {
      id: `txn-${Date.now()}`,
      title: "Bank withdrawal - Access Bank",
      category: "payment",
      date: "Just now",
      amount: amount,
      isCredit: false,
      status: "Completed",
      reference: reference,
      balanceBefore: balance,
      balanceAfter: newBal,
    };
    setTransactions((prev) => [newTxn, ...prev]);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPinModalOpen(false);
    toast.success("Transaction PIN updated successfully.");
  };

  // ══════════════════════════════════════════════════════════════
  // VIEW: FUND WALLET DEDICATED FLOW (Screenshots 1 & 2)
  // ══════════════════════════════════════════════════════════════
  if (activeView === "fund") {
    return (
      <FundWalletView
        currentBalance={balance}
        onBackToWallet={() => setActiveView("overview")}
        onDepositCompleted={handleDepositCompleted}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW: WITHDRAW DEDICATED FLOW
  // ══════════════════════════════════════════════════════════════
  if (activeView === "withdraw") {
    return (
      <WithdrawWalletView
        currentBalance={balance}
        onBackToWallet={() => setActiveView("overview")}
        onWithdrawalCompleted={handleWithdrawalCompleted}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW: TRANSACTION DETAILS (Screenshot 5 Right)
  // ══════════════════════════════════════════════════════════════
  if (selectedTransaction) {
    const txn = selectedTransaction;
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
        {/* Breadcrumb */}
        <div>
          <button
            type="button"
            onClick={() => setSelectedTransaction(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Wallet</span>
          </button>
        </div>

        {/* Heading */}
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
            Transaction details
          </h1>
          <p className="font-sans text-xs text-neutral-400 mt-1">
            {txn.title} {txn.artisanName && `· ${txn.artisanName}`}
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Breakdown and Transaction Information */}
          <div className="lg:col-span-7 space-y-6">
            {/* Amount & Status Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-black text-2xl sm:text-3xl text-[#001B40]">
                  {txn.isCredit ? `+₦${txn.amount.toLocaleString()}` : `-₦${txn.amount.toLocaleString()}`}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    txn.status === "Secured"
                      ? "bg-emerald-50 text-emerald-700"
                      : txn.status === "Completed"
                      ? "bg-blue-50 text-blue-700"
                      : txn.status === "Released"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {txn.status}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-sans">
                {txn.date}
              </p>
            </div>

            {/* Payment breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
              <h3 className="font-heading font-bold text-sm text-[#001B40]">
                Payment breakdown
              </h3>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Labour</span>
                  <span className="font-semibold text-neutral-900">
                    ₦{(txn.labour || txn.amount * 0.67).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Materials</span>
                  <span className="font-semibold text-neutral-900">
                    ₦{(txn.materials || txn.amount * 0.33).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-900 font-bold pt-3 border-t border-neutral-100">
                  <span>Total</span>
                  <span>₦{txn.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Transaction Information */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
              <h3 className="font-heading font-bold text-sm text-[#001B40]">
                Transaction information
              </h3>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-neutral-500">
                  <span>Type</span>
                  <span className="font-semibold text-neutral-900 capitalize">
                    {txn.category === "payment" ? "Job payment" : txn.category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-500">
                  <span>Reference</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-neutral-800 font-semibold">{txn.reference}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyReference(txn.reference)}
                      className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                      aria-label="Copy reference"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-neutral-500">
                  <span>Method</span>
                  <span className="font-semibold text-neutral-900">Bluefixx Wallet</span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 pt-2 border-t border-neutral-100">
                  <span>Balance before</span>
                  <span className="text-neutral-800">₦{txn.balanceBefore.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-500">
                  <span>Balance after</span>
                  <span className="font-bold text-[#001B40]">₦{txn.balanceAfter.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Job actions and safety info */}
          <div className="lg:col-span-5 space-y-5">
            {/* Job Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="font-heading font-bold text-base text-[#001B40]">
                  {txn.title}
                </h3>
                {txn.artisanName && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {txn.artisanName} · Plumbing
                  </p>
                )}
              </div>

              <div className="space-y-1 py-1">
                <span className="text-[11px] text-neutral-400 block">
                  Your payment is held securely for this job.
                </span>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  Secured
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <Link
                  href="/bookings"
                  className="block w-full py-3 bg-[#001B40] hover:bg-[#074292] text-white font-bold text-xs text-center rounded-xl transition-colors shadow-2xs"
                >
                  View booking
                </Link>

                <Link
                  href="/bookings?tab=completed&view=warranty"
                  className="block w-full py-2.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-bold text-xs text-center rounded-xl transition-colors"
                >
                  Report a problem
                </Link>
              </div>
            </div>

            {/* Protection Notice */}
            <div className="p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/60 text-xs space-y-2 text-neutral-600">
              <h4 className="font-bold text-[#001B40] text-xs">
                Your money stays protected
              </h4>
              <p className="text-neutral-500 leading-relaxed">
                Nothing is released to the artisan while a problem report is open.
              </p>
              <p className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-200/50">
                Use the copy icon to save your transaction reference.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW: WALLET OVERVIEW (Screenshot 5 Left)
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-150">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>My account</span>
        </Link>
      </div>

      {/* Heading */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Wallet
        </h1>
        <p className="font-sans text-xs text-neutral-400 mt-1">
          Manage your balance, payments and protected funds
        </p>
      </div>

      {/* Top Grid: Balance Card on Left, Wallet Settings on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Available Balance Card (Navy background matching Figma) */}
        <div className="lg:col-span-8 bg-[#001B40] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-blue-200/80 tracking-wider uppercase">
              AVAILABLE BALANCE
            </span>
            <div className="font-heading font-black text-3xl sm:text-5xl text-white my-3 tracking-tight">
              ₦{balance.toLocaleString()}
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-blue-100 text-xs px-3.5 py-1 rounded-full backdrop-blur-xs font-medium">
              <span>{heldBalance > 0 ? `₦${heldBalance.toLocaleString()} held for jobs in progress` : "No funds currently held"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 sm:pt-8">
            <button
              type="button"
              onClick={() => setActiveView("fund")}
              className="py-2.5 px-5 bg-white hover:bg-neutral-100 text-[#001B40] font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              + Fund Wallet
            </button>
            <button
              type="button"
              onClick={() => setActiveView("withdraw")}
              className="py-2.5 px-5 border border-white/30 hover:bg-white/10 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Wallet Settings Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-sm sm:text-base text-[#001B40]">
              Wallet settings
            </h3>

            {/* Option 1: Payment methods */}
            <button
              type="button"
              onClick={() => setIsPaymentMethodsModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-neutral-50 transition-colors text-left cursor-pointer border border-neutral-100"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#001B40] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs sm:text-sm text-neutral-800 block truncate">
                    Payment methods
                  </span>
                  <span className="text-[11px] text-neutral-400 block truncate">
                    Access Bank ···· 1416 · Default
                  </span>
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Option 2: Transaction PIN */}
            <button
              type="button"
              onClick={() => setIsPinModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-neutral-50 transition-colors text-left cursor-pointer border border-neutral-100"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#001B40] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs sm:text-sm text-neutral-800 block truncate">
                    Transaction PIN
                  </span>
                  <span className="text-[11px] text-neutral-400 block truncate">
                    Protect every payment you make
                  </span>
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed pt-4 border-t border-neutral-100 mt-4">
            Funds held for a job are only released until the work is completed.
          </p>
        </div>
      </div>

      {/* Bottom Transactions Card */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-5">
        <h3 className="font-heading font-bold text-base text-[#001B40]">
          Transactions
        </h3>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 border-b border-neutral-100 pb-2 overflow-x-auto">
          {(["All", "Payments", "Deposits", "Funding", "Refunds"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? "bg-[#001B40] text-white shadow-2xs font-bold"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table / List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">TRANSACTION</th>
                <th className="pb-3 font-semibold">DATE &amp; TIME</th>
                <th className="pb-3 font-semibold">AMOUNT</th>
                <th className="pb-3 font-semibold text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-neutral-400">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-2 text-neutral-400">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-neutral-700">No transactions found</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Your payments, deposits, and refunds will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr
                    key={txn.id}
                    onClick={() => setSelectedTransaction(txn)}
                    className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-blue-50 text-neutral-600 group-hover:text-[#001B40] flex items-center justify-center shrink-0 transition-colors">
                          {txn.isCredit ? (
                            <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="7" y1="17" x2="17" y2="7" />
                              <polyline points="7 7 17 7 17 17" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="7" y1="7" x2="17" y2="17" />
                              <polyline points="17 7 17 17 7 17" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-neutral-900 group-hover:text-[#001B40] block">
                            {txn.title} {txn.artisanName && `· ${txn.artisanName}`}
                          </span>
                          <span className="text-[11px] text-neutral-400 block font-mono">
                            {txn.reference}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 text-xs whitespace-nowrap">
                      {txn.date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-xs sm:text-sm whitespace-nowrap">
                      <span className={txn.isCredit ? "text-emerald-600" : "text-neutral-900"}>
                        {txn.isCredit ? `+₦${txn.amount.toLocaleString()}` : `-₦${txn.amount.toLocaleString()}`}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          txn.status === "Secured"
                            ? "bg-emerald-50 text-emerald-700"
                            : txn.status === "Completed"
                            ? "bg-blue-50 text-blue-700"
                            : txn.status === "Released"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>



      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: TRANSACTION PIN (Input field requested by user)       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-heading font-bold text-base text-[#001B40]">
                Transaction PIN
              </h3>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Enter your 4-digit security PIN to authorize escrow payments and withdrawals.
            </p>

            <form onSubmit={handleSavePin} className="space-y-5">
              <div className="flex items-center justify-center gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    type="password"
                    maxLength={1}
                    value={pinDigits[idx]}
                    onChange={(e) => {
                      const val = e.target.value;
                      const next = [...pinDigits];
                      next[idx] = val;
                      setPinDigits(next);
                      if (val && e.target.nextElementSibling) {
                        (e.target.nextElementSibling as HTMLInputElement).focus();
                      }
                    }}
                    className="w-12 h-12 rounded-xl border border-neutral-200 text-center font-bold text-lg text-[#001B40] focus:outline-hidden focus:border-[#001B40]"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#001B40] hover:bg-[#074292] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Save PIN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: PAYMENT METHODS                                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isPaymentMethodsModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-heading font-bold text-base text-[#001B40]">
                Payment Methods
              </h3>
              <button
                type="button"
                onClick={() => setIsPaymentMethodsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-2xl border border-blue-200 bg-blue-50/50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#001B40] block">Access Bank ···· 1416</span>
                  <span className="text-[10px] text-blue-700 font-semibold">Default withdrawal account</span>
                </div>
                <span className="text-xs font-bold text-emerald-600">✓ Active</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsPaymentMethodsModalOpen(false);
                toast.success("Add bank account form will be available shortly.");
              }}
              className="w-full py-2.5 border border-dashed border-neutral-300 hover:border-neutral-400 text-neutral-700 text-xs font-semibold rounded-xl"
            >
              + Add another bank account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
