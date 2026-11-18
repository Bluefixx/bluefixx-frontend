"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { requestWithdrawalApi, getSavedBankAccountsApi } from "@/lib/api";
import { BankAccount } from "@/types/customer";

interface WithdrawWalletViewProps {
  currentBalance: number;
  onBackToWallet: () => void;
  onWithdrawalCompleted: (amount: number, newBalance: number, reference: string) => void;
}

export function WithdrawWalletView({
  currentBalance,
  onBackToWallet,
  onWithdrawalCompleted,
}: WithdrawWalletViewProps) {
  // Step: "form" | "pin" | "processing" | "success"
  const [step, setStep] = useState<"form" | "pin" | "processing" | "success">("form");
  const [selectedAmount, setSelectedAmount] = useState<number>(25000);
  const [customAmountStr, setCustomAmountStr] = useState<string>("25,000");
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", ""]);
  const [copiedTxnId, setCopiedTxnId] = useState(false);
  const [txnReference, setTxnReference] = useState<string>("BFX-WTH-8823104");
  const [savedBanks, setSavedBanks] = useState<BankAccount[]>([]);

  const quickPills = [5000, 10000, 25000, 50000, currentBalance];
  const newBalance = Math.max(0, currentBalance - selectedAmount);

  useEffect(() => {
    async function fetchBanks() {
      try {
        const banks = await getSavedBankAccountsApi();
        if (banks && banks.length > 0) {
          setSavedBanks(banks);
        }
      } catch {
        // Fallback to static bank details
      }
    }
    fetchBanks();
  }, []);

  const handleSelectQuickAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmountStr(amount.toLocaleString());
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    if (!rawVal) {
      setSelectedAmount(0);
      setCustomAmountStr("");
      return;
    }
    const num = Math.min(parseInt(rawVal, 10), currentBalance);
    setSelectedAmount(num);
    setCustomAmountStr(num.toLocaleString());
  };

  const handlePinChange = (index: number, val: string) => {
    const char = val.replace(/[^0-9]/g, "").slice(-1);
    const updated = [...pinDigits];
    updated[index] = char;
    setPinDigits(updated);

    if (char && index < 3) {
      const nextInput = document.getElementById(`withdraw-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      const prevInput = document.getElementById(`withdraw-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleAuthorizeWithdrawal = async () => {
    const fullPin = pinDigits.join("");
    if (fullPin.length < 4) {
      toast.error("Please enter your complete 4-digit PIN");
      return;
    }
    const bankId = savedBanks[0]?.id;
    if (!bankId) {
      toast.error("Please add and verify a payout bank account first.");
      return;
    }

    setStep("processing");

    try {
      const res = await requestWithdrawalApi({
        bankId,
        amount: selectedAmount * 100, // convert NGN to kobo
        pin: fullPin,
      });

      const ref = res?.reference || (res?.id ? `BFX-WTH-${res.id.slice(0, 8).toUpperCase()}` : txnReference);
      setTxnReference(ref);

      setStep("success");
      onWithdrawalCompleted(selectedAmount, newBalance, ref);
    } catch (err: any) {
      setStep("form");
      toast.error(err?.message || "Withdrawal request failed. Please try again.");
    }
  };

  const handleCopyTxn = () => {
    navigator.clipboard.writeText(txnReference);
    setCopiedTxnId(true);
    toast.success("Transaction ID copied to clipboard");
    setTimeout(() => setCopiedTxnId(false), 2000);
  };

  // ══════════════════════════════════════════════════════════════
  // VIEW: WITHDRAWAL PROCESSING
  // ══════════════════════════════════════════════════════════════
  if (step === "processing") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
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
            Withdraw Funds
          </h1>
          <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
            We&apos;re sending funds to your verified bank account.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white rounded-3xl p-8 sm:p-14 border border-neutral-200/80 shadow-xs flex flex-col items-center text-center space-y-5">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-neutral-100 border-t-[#001B40] animate-spin" />
            </div>

            <div className="space-y-1">
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#001B40]">
                Withdrawal processing
              </h2>
              <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#001B40] tracking-tight pt-1">
                ₦{selectedAmount.toLocaleString()}
              </div>
            </div>

            <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-md leading-relaxed">
              Transfers via NIP process instantly. Your bank should credit your account within minutes.
            </p>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Processing</span>
            </div>

            <p className="text-[11px] text-neutral-400 pt-4">
              Do not close this screen until confirmation is received.
            </p>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
              <h3 className="font-heading font-bold text-sm text-[#001B40]">
                Withdrawal summary
              </h3>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Amount</span>
                  <span className="font-bold text-[#001B40]">₦{selectedAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Destination</span>
                  <span className="font-semibold text-neutral-700">Access Bank ···· 1416</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Expected balance</span>
                  <span className="font-bold text-emerald-600">₦{newBalance.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600 pt-2 border-t border-neutral-100">
                  <span>Fee</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/60 text-xs text-neutral-500 leading-relaxed">
              <span className="font-bold text-neutral-800 block mb-1">Direct Bank Payout</span>
              Funds are debited and transmitted via standard interbank clearing.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW: WITHDRAWAL SUCCESSFUL
  // ══════════════════════════════════════════════════════════════
  if (step === "success") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
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
            Withdrawal Successful
          </h1>
          <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
            Your transfer has been initiated to your bank.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div className="space-y-1">
                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#001B40]">
                  Withdrawal Successful
                </h2>
                <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#001B40] tracking-tight">
                  ₦{selectedAmount.toLocaleString()}
                </div>
              </div>

              <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-md leading-relaxed">
                Funds have been sent to your Access Bank account (···· 1416). It should reflect within minutes.
              </p>
            </div>

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
                <span className="font-medium text-neutral-800">Just now</span>
              </div>

              <div className="flex items-center justify-between text-neutral-600">
                <span>Destination</span>
                <span className="font-medium text-neutral-800">NIP Transfer · Access Bank ···· 1416</span>
              </div>

              <div className="flex items-center justify-between text-neutral-600 pt-3 border-t border-neutral-100">
                <span>New wallet balance</span>
                <span className="font-extrabold text-[#001B40] text-sm sm:text-base">
                  ₦{newBalance.toLocaleString()}
                </span>
              </div>
            </div>

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

          <div className="lg:col-span-4 space-y-4">
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

            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
              <h3 className="font-heading font-bold text-sm text-[#001B40]">
                Withdrawal complete
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                You can review this transfer in your wallet transaction history anytime.
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
  // VIEW: MAIN WITHDRAWAL FORM
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
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
          Withdraw Funds
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
          Transfer money from your Bluefixx wallet to your bank account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
          <h2 className="font-heading font-bold text-base sm:text-lg text-[#001B40]">
            Withdraw money from your wallet
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
              Wallet balance after withdrawal: <span className="font-bold text-[#001B40]">₦{newBalance.toLocaleString()}</span>
            </p>
          </div>

          {/* Quick Selection Pills */}
          <div className="flex flex-wrap gap-2.5">
            {quickPills.map((pill, idx) => {
              const isSelected = selectedAmount === pill;
              const isAll = idx === quickPills.length - 1;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuickAmount(pill)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#001B40] text-white shadow-xs"
                      : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {isAll ? `All (₦${pill.toLocaleString()})` : `₦${pill.toLocaleString()}`}
                </button>
              );
            })}
          </div>

          {/* Destination Bank Account Card */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-[#001B40] font-black text-sm">
                AB
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-neutral-900 block">
                  Access Bank ···· 1416
                </span>
                <span className="text-xs text-neutral-500">
                  Daniel Eze · Verified Payout Account
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              Active
            </span>
          </div>

          {/* Breakdown Rows */}
          <div className="pt-4 border-t border-neutral-100 space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-neutral-600">
              <span>Current balance</span>
              <span className="font-semibold text-neutral-800">₦{currentBalance.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-neutral-600">
              <span>Withdrawal fee</span>
              <span className="font-semibold text-emerald-600">Free</span>
            </div>

            <div className="flex items-center justify-between text-neutral-600">
              <span>Processed by</span>
              <span className="font-semibold text-[#001B40]">NIP Instant Transfer</span>
            </div>

            <div className="flex items-center justify-between text-neutral-800 pt-3 border-t border-neutral-100">
              <span className="font-bold">Total payout</span>
              <span className="font-extrabold text-base sm:text-lg text-[#001B40]">
                ₦{selectedAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={selectedAmount <= 0 || selectedAmount > currentBalance}
            onClick={() => setStep("pin")}
            className="w-full py-3.5 bg-[#001B40] hover:bg-[#074292] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm cursor-pointer"
          >
            Continue to authorization
          </button>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Fast & secure withdrawals
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Direct NIP interbank transfer to your verified Access Bank account. Most withdrawals arrive within 10 minutes.
            </p>
            <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Zero fee for verified accounts</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>4-digit transaction PIN protection</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/60 text-xs text-neutral-500 leading-relaxed space-y-1">
            <span className="font-bold text-neutral-800 block">Funds protection guarantee</span>
            <p>
              Withdrawals can only be sent to the bank account registered in your name.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 4-DIGIT PIN AUTHORIZATION MODAL                                */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {step === "pin" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-heading font-bold text-base text-[#001B40]">
                Authorize Withdrawal
              </h3>
              <button
                type="button"
                onClick={() => setStep("form")}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#001B40] flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Enter your 4-digit transaction PIN to authorize transfer of <strong className="text-[#001B40]">₦{selectedAmount.toLocaleString()}</strong> to Access Bank.
              </p>
            </div>

            {/* PIN Inputs */}
            <div className="flex justify-center gap-3">
              {pinDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`withdraw-pin-${idx}`}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(idx, e)}
                  autoFocus={idx === 0}
                  className="w-12 h-12 rounded-xl border-2 border-neutral-200 text-center text-xl font-bold text-[#001B40] focus:border-[#001B40] focus:outline-hidden transition-colors"
                />
              ))}
            </div>

            <button
              type="button"
              disabled={pinDigits.some((d) => !d)}
              onClick={handleAuthorizeWithdrawal}
              className="w-full py-3.5 bg-[#001B40] hover:bg-[#074292] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm cursor-pointer"
            >
              Confirm Withdrawal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
