"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface FundWalletViewProps {
  currentBalance: number;
  onBackToWallet: () => void;
  onDepositCompleted: (amount: number, newBalance: number, reference: string) => void;
}

export function FundWalletView({
  currentBalance,
  onBackToWallet,
  onDepositCompleted,
}: FundWalletViewProps) {
  // Sub-step: "form" | "processing" | "success"
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [selectedAmount, setSelectedAmount] = useState<number>(25000);
  const [customAmountStr, setCustomAmountStr] = useState<string>("25,000");
  const [isPaystackCheckoutOpen, setIsPaystackCheckoutOpen] = useState(false);
  const [copiedTxnId, setCopiedTxnId] = useState(false);

  const quickPills = [5000, 10000, 25000, 50000, 100000];
  const newBalance = currentBalance + selectedAmount;
  const txnReference = "BFX-FND-4475191";

  // Handle amount change from quick pills
  const handleSelectQuickAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmountStr(amount.toLocaleString());
  };

  // Handle manual input
  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    if (!rawVal) {
      setSelectedAmount(0);
      setCustomAmountStr("");
      return;
    }
    const num = parseInt(rawVal, 10);
    setSelectedAmount(num);
    setCustomAmountStr(num.toLocaleString());
  };

  // Handle payment method click in Paystack checkout modal
  const handleStartProcessing = (method: "card" | "transfer") => {
    setIsPaystackCheckoutOpen(false);
    setStep("processing");

    toast.success(
      method === "card"
        ? "Paystack: Card payment authorized"
        : "Paystack: Bank transfer confirmed",
      { icon: "💳" }
    );

    // Simulate deposit processing delay (2.5 seconds)
    setTimeout(() => {
      setStep("success");
      onDepositCompleted(selectedAmount, newBalance, txnReference);
    }, 2500);
  };

  const handleCopyTxn = () => {
    navigator.clipboard.writeText(txnReference);
    setCopiedTxnId(true);
    toast.success("Transaction ID copied to clipboard");
    setTimeout(() => setCopiedTxnId(false), 2000);
  };

  // ══════════════════════════════════════════════════════════════
  // VIEW 1: DEPOSIT PROCESSING (Screenshot 2 Left)
  // ══════════════════════════════════════════════════════════════
  if (step === "processing") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
        {/* Breadcrumb & Header */}
        <div>
          <button
            type="button"
            onClick={onBackToWallet}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Wallet</span>
          </button>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
            Fund Account
          </h1>
          <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
            We&apos;re confirming your wallet deposit.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Processing Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-8 sm:p-14 border border-neutral-200/80 shadow-xs flex flex-col items-center text-center space-y-5">
            {/* Animated Circular Spinner */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-neutral-100 border-t-[#001B40] animate-spin" />
            </div>

            <div className="space-y-1">
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#001B40]">
                Deposit processing
              </h2>
              <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#001B40] tracking-tight pt-1">
                ₦{selectedAmount.toLocaleString()}
              </div>
            </div>

            <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-md leading-relaxed">
              Most deposits process within 30 seconds. We will notify you as soon as your bank confirms.
            </p>

            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Processing</span>
            </div>

            <p className="text-[11px] text-neutral-400 pt-4">
              Do not close this screen until confirmation is received.
            </p>
          </div>

          {/* Right Summary Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
              <h3 className="font-heading font-bold text-sm text-[#001B40]">
                Deposit summary
              </h3>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Amount</span>
                  <span className="font-bold text-[#001B40]">₦{selectedAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Current balance</span>
                  <span className="font-semibold text-neutral-700">₦{currentBalance.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Expected balance</span>
                  <span className="font-bold text-emerald-600">₦{newBalance.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600 pt-2 border-t border-neutral-100">
                  <span>Payment gateway</span>
                  <span className="font-semibold text-[#001B40]">Paystack</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/60 text-xs text-neutral-500 leading-relaxed">
              <span className="font-bold text-neutral-800 block mb-1">Waiting for bank confirmation</span>
              Your wallet balance updates only once the payment is confirmed. No need to make another payment.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW 2: DEPOSIT SUCCESSFUL (Screenshot 2 Right)
  // ══════════════════════════════════════════════════════════════
  if (step === "success") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
        {/* Breadcrumb & Header */}
        <div>
          <button
            type="button"
            onClick={onBackToWallet}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Wallet</span>
          </button>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
            Deposit Successful
          </h1>
          <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
            Your payment was confirmed and your wallet is ready.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Confirmation Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              {/* Green checkmark badge */}
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div className="space-y-1">
                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#001B40]">
                  Deposit Successful
                </h2>
                <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#001B40] tracking-tight">
                  ₦{selectedAmount.toLocaleString()}
                </div>
              </div>

              <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-md leading-relaxed">
                Your Bluefixx wallet has been funded. You can now pay for jobs or apprenticeship fees instantly.
              </p>
            </div>

            {/* Key-Value Breakdown Table */}
            <div className="pt-4 border-t border-neutral-100 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-neutral-600">
                <span>Amount</span>
                <span className="font-bold text-[#001B40]">₦{selectedAmount.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-neutral-600">
                <span>Transaction ID</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-medium text-neutral-800">{txnReference}</span>
                  <button
                    type="button"
                    onClick={handleCopyTxn}
                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                    title="Copy Transaction ID"
                  >
                    {copiedTxnId ? (
                      <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-neutral-600">
                <span>Date</span>
                <span className="font-medium text-neutral-800">19 Aug 2026 · 6:02pm</span>
              </div>

              <div className="flex items-center justify-between text-neutral-600">
                <span>Method</span>
                <span className="font-medium text-neutral-800">Paystack · Access Bank ···· 1416</span>
              </div>

              <div className="flex items-center justify-between text-neutral-600 pt-3 border-t border-neutral-100">
                <span>New wallet balance</span>
                <span className="font-extrabold text-[#001B40] text-sm sm:text-base">
                  ₦{newBalance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Done CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onBackToWallet}
                className="w-full py-3.5 bg-[#001B40] hover:bg-[#074292] text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>

          {/* Right Column Cards */}
          <div className="lg:col-span-4 space-y-4">
            {/* Updated Available Balance card */}
            <div className="bg-[#001B40] text-white rounded-3xl p-6 sm:p-7 shadow-xs space-y-3">
              <span className="text-xs text-blue-200/80 uppercase font-semibold tracking-wider">
                Available balance
              </span>
              <div className="font-heading font-extrabold text-3xl text-white tracking-tight">
                ₦{newBalance.toLocaleString()}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs">
                <span>₦120,000 held for jobs in progress</span>
              </div>
            </div>

            {/* Deposit Complete notification card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
              <h3 className="font-heading font-bold text-sm text-[#001B40]">
                Deposit complete
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                You can find this reference in your wallet transaction history.
              </p>
              <button
                type="button"
                onClick={onBackToWallet}
                className="w-full py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
              >
                View wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW 0: MAIN FUND WALLET FORM (Screenshot 1 Left)
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
      {/* Breadcrumb & Header */}
      <div>
        <button
          type="button"
          onClick={onBackToWallet}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Wallet</span>
        </button>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Fund Account
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
          Top up your Bluefixx Wallet securely.
        </p>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Card */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
          <h2 className="font-heading font-bold text-base sm:text-lg text-[#001B40]">
            Add money to your wallet
          </h2>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-600">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">
                ₦
              </span>
              <input
                type="text"
                value={customAmountStr}
                onChange={handleAmountInputChange}
                placeholder="25,000"
                className="w-full pl-9 pr-4 py-3.5 rounded-xl border border-neutral-200 text-sm sm:text-base font-bold text-[#001B40] placeholder:text-neutral-300 focus:outline-hidden focus:border-[#001B40] transition-colors"
              />
            </div>
            <p className="text-xs text-neutral-500">
              Wallet balance after funding: <span className="font-bold text-[#001B40]">₦{newBalance.toLocaleString()}</span>
            </p>
          </div>

          {/* Quick Amount Pills */}
          <div className="flex flex-wrap gap-2.5">
            {quickPills.map((pill) => {
              const isSelected = selectedAmount === pill;
              return (
                <button
                  key={pill}
                  type="button"
                  onClick={() => handleSelectQuickAmount(pill)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#001B40] text-white shadow-xs"
                      : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  ₦{pill.toLocaleString()}
                </button>
              );
            })}
          </div>

          {/* Breakdown Summary Rows */}
          <div className="pt-4 border-t border-neutral-100 space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-neutral-600">
              <span>Current balance</span>
              <span className="font-semibold text-neutral-800">₦{currentBalance.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-neutral-600">
              <span>Funding fee</span>
              <span className="font-semibold text-emerald-600">Free</span>
            </div>

            <div className="flex items-center justify-between text-neutral-600">
              <span>Processed by</span>
              <span className="font-semibold text-[#001B40]">Paystack</span>
            </div>

            <div className="flex items-center justify-between text-neutral-800 pt-3 border-t border-neutral-100">
              <span className="font-bold">Total to pay</span>
              <span className="font-extrabold text-base sm:text-lg text-[#001B40]">
                ₦{selectedAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <button
            type="button"
            disabled={selectedAmount <= 0}
            onClick={() => setIsPaystackCheckoutOpen(true)}
            className="w-full py-3.5 bg-[#001B40] hover:bg-[#074292] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm cursor-pointer"
          >
            Continue to payment
          </button>
        </div>

        {/* Right Info Cards */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Secure payments with Paystack
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Funding is instant for cards and usually under 5 minutes for bank transfers. You will see the reference in your transaction history within seconds.
            </p>

            <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs">
              <div className="flex items-center gap-2 text-neutral-700 font-semibold">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Pay with Card</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700 font-semibold">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Pay with Transfer</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/60 text-xs text-neutral-500 leading-relaxed space-y-1">
            <span className="font-bold text-neutral-800 block">Ready for your next job</span>
            <p>
              Your available balance will be <strong className="text-[#001B40]">₦{newBalance.toLocaleString()}</strong> once this deposit is confirmed. Held funds remain separate.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* PAYSTACK CHECKOUT MODAL (Screenshot 1 Right)                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isPaystackCheckoutOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-150">
            {/* Paystack Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                {/* Paystack Brand Icon */}
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-4 bg-sky-500 rounded-xs" />
                  <div className="w-1.5 h-3 bg-sky-600 rounded-xs" />
                  <div className="w-1.5 h-5 bg-[#001B40] rounded-xs" />
                </div>
                <span className="font-heading font-black text-lg text-[#001B40] tracking-tight">
                  paystack
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsPaystackCheckoutOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Amount & Account Details */}
            <div className="text-center space-y-1">
              <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#001B40] tracking-tight">
                ₦{selectedAmount.toLocaleString()}
              </div>
              <p className="text-xs text-neutral-500">
                danieleze@gmail.com · Bluefixx Technologies
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleStartProcessing("card")}
                className="w-full py-3.5 bg-[#001B40] hover:bg-[#074292] text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm cursor-pointer"
              >
                Pay with Card
              </button>

              <button
                type="button"
                onClick={() => handleStartProcessing("transfer")}
                className="w-full py-3.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 font-bold text-xs sm:text-sm rounded-xl text-center transition-colors cursor-pointer"
              >
                Pay with Transfer
              </button>
            </div>

            {/* Security Notice */}
            <div className="text-center space-y-3 pt-2">
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                You are on Paystack&apos;s secure checkout. You will return to Bluefixx once the payment is confirmed.
              </p>

              <div className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
                <svg className="w-3.5 h-3.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Secured by Paystack</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
