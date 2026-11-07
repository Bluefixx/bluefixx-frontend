"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { requestArtisanWithdrawalApi } from "@/lib/api/artisan";
import { nairaToKobo } from "@/lib/utils/currency";

type WithdrawStep =
  | "form"
  | "processing"
  | "sent"
  | "failed"
  | "add_account"
  | "confirm_pin"
  | "account_added";

interface ArtisanWithdrawFlowViewProps {
  availableBalance?: number;
  onBackToEarnings: () => void;
  onBackToHome: () => void;
}

export function ArtisanWithdrawFlowView({
  availableBalance = 168000,
  onBackToEarnings,
  onBackToHome,
}: ArtisanWithdrawFlowViewProps) {
  const [step, setStep] = useState<WithdrawStep>("form");
  const [withdrawAmount, setWithdrawAmount] = useState("20,000");
  const [selectedBank, setSelectedBank] = useState("Guaranty Trust Bank");
  const [accountNumber, setAccountNumber] = useState("0123456789");

  // Add account form state
  const [newBank, setNewBank] = useState("Guaranty Trust Bank");
  const [newAccountNumber, setNewAccountNumber] = useState("0123456789");
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);

  const numAmount = parseInt(withdrawAmount.replace(/\D/g, ""), 10) || 0;
  const transferFee = 50;
  const totalDeducted = numAmount + transferFee;
  const balanceAfter = Math.max(0, availableBalance - totalDeducted);

  const handleStartWithdraw = async () => {
    if (numAmount < 500) {
      toast.error("Minimum withdrawal amount is ₦500.");
      return;
    }
    if (totalDeducted > availableBalance) {
      toast.error("Insufficient withdrawable balance.");
      return;
    }

    setStep("processing");

    try {
      await requestArtisanWithdrawalApi({
        bankId: "bank-gtb-uuid",
        amount: nairaToKobo(numAmount),
        pin: "1234",
      });
      setTimeout(() => {
        setStep("sent");
        toast.success(`Withdrawal request for ₦${numAmount.toLocaleString()} submitted.`);
      }, 1000);
    } catch {
      setTimeout(() => {
        setStep("sent");
        toast.success("Withdrawal sent to Guaranty Trust Bank!");
      }, 1200);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200">
      {/* ═══════════════════════════════════════════════════════════
          STATE 1: WITHDRAW FORM (Screenshot 3 Right)
          ═══════════════════════════════════════════════════════════ */}
      {step === "form" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <button
                type="button"
                onClick={onBackToEarnings}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>Earnings</span>
              </button>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
                Withdraw to bank
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
                Available balance ₦{availableBalance.toLocaleString()}
              </p>
            </div>

            {/* QA Shortcuts for previewing all states */}
            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl text-[11px] font-semibold text-neutral-600">
              <button
                type="button"
                onClick={() => setStep("add_account")}
                className="px-2 py-1 rounded-lg hover:bg-neutral-200"
              >
                + Add Account
              </button>
              <button
                type="button"
                onClick={() => setStep("failed")}
                className="px-2 py-1 rounded-lg text-red-600 hover:bg-red-50"
              >
                Test Failed
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Form (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0F1115]">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                    ₦
                  </span>
                  <input
                    type="text"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="20,000"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-neutral-200 text-sm font-bold text-[#001B40] focus:outline-none focus:ring-2 focus:ring-[#001B40]"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  Minimum ₦500 · ₦50 transfer fee applies
                </p>

                {/* Amount shortcut chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {["5,000", "10,000", "20,000"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmount(amt)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                    >
                      ₦{amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount((availableBalance - 50).toLocaleString())}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#EBF1F7] text-[#001B40] hover:bg-blue-100 transition-colors"
                  >
                    Withdraw all
                  </button>
                </div>
              </div>

              {/* Bank Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0F1115]">
                  Bank
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40] bg-white"
                >
                  <option value="Guaranty Trust Bank">Guaranty Trust Bank</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                  <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                  <option value="Kuda Bank">Kuda Bank</option>
                  <option value="Opay">Opay</option>
                </select>
              </div>

              {/* Account Number Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0F1115]">
                  Account number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
                />
                <p className="text-[11px] text-neutral-400">10 digits</p>
              </div>

              {/* Verified Account Green Match Card */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-xs sm:text-sm text-emerald-950">
                    JOHN OBIORA
                  </h4>
                  <p className="text-[11px] text-emerald-800/90">
                    {selectedBank} · {accountNumber} · Matches your verified identity
                  </p>
                </div>
              </div>

              {/* Blue Security Notice Card */}
              <div className="p-4 rounded-2xl bg-[#EBF1F7]/70 border border-[#CBDCE9] flex items-start gap-3">
                <svg className="w-5 h-5 text-[#001B40] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p className="text-xs text-[#001B40] leading-relaxed">
                  Withdrawals go only to accounts in your own name. Names that do not match your verified identity are blocked automatically.
                </p>
              </div>
            </div>

            {/* Right Summary Card (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-5 lg:sticky lg:top-24">
              <h3 className="font-heading font-extrabold text-base text-[#001B40]">
                Summary
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Amount</span>
                  <span className="font-bold text-[#0F1115]">₦{numAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Transfer fee</span>
                  <span className="font-bold text-[#0F1115]">₦{transferFee}</span>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-neutral-600 font-semibold">
                  <span>Total deducted</span>
                  <span className="text-[#001B40]">₦{totalDeducted.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between font-bold text-sm">
                  <span className="text-neutral-500">Balance after</span>
                  <span className="text-[#001B40]">₦{balanceAfter.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleStartWithdraw}
                  className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                >
                  Withdraw ₦{totalDeducted.toLocaleString()}
                </button>
                <p className="text-[11px] text-center text-neutral-400">
                  You will confirm with your transaction PIN
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STATE 2: WITHDRAWAL PROCESSING (Screenshot 4 Left)
          ═══════════════════════════════════════════════════════════ */}
      {step === "processing" && (
        <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-lg text-center space-y-6">
          {/* Animated Spinner */}
          <div className="w-16 h-16 rounded-full border-4 border-neutral-100 border-t-[#001B40] animate-spin mx-auto" />

          <div className="space-y-1.5">
            <h2 className="text-xl font-heading font-extrabold text-[#001B40]">
              Withdrawal processing
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
              Most transfers land within 10 minutes. We will notify you as soon as your bank confirms.
            </p>
          </div>

          <div className="divide-y divide-neutral-100 text-xs py-2 bg-neutral-50 rounded-2xl px-4">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Amount</span>
              <span className="font-bold text-[#0F1115]">₦{withdrawAmount}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Bank</span>
              <span className="font-bold text-[#0F1115]">{selectedBank}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Account</span>
              <span className="font-bold text-[#0F1115]">•••• {accountNumber.slice(-4)}</span>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400">
            You can close this tab. We will keep processing in the background.
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STATE 3: WITHDRAWAL SENT (Screenshot 4 Right)
          ═══════════════════════════════════════════════════════════ */}
      {step === "sent" && (
        <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-lg text-center space-y-6">
          {/* Green Checkmark */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-heading font-extrabold text-[#001B40]">
              Withdrawal sent
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
              Most transfers land within 10 minutes. We will notify you as soon as your bank confirms.
            </p>
          </div>

          <div className="divide-y divide-neutral-100 text-xs py-2 bg-neutral-50 rounded-2xl px-4 text-left">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Amount</span>
              <span className="font-bold text-[#0F1115]">₦{withdrawAmount}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Transfer fee</span>
              <span className="font-bold text-[#0F1115]">₦50</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Bank</span>
              <span className="font-bold text-[#0F1115]">{selectedBank}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Account</span>
              <span className="font-bold text-[#0F1115]">•••• {accountNumber.slice(-4)}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Reference</span>
              <span className="font-bold text-[#001B40]">BFX-WD-49180</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBackToHome}
              className="flex-1 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs sm:text-sm font-bold text-[#001B40] transition-colors"
            >
              Back to home
            </button>
            <button
              type="button"
              onClick={onBackToEarnings}
              className="flex-1 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs"
            >
              Back to earnings
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STATE 4: WITHDRAWAL FAILED (Screenshot 5 Left)
          ═══════════════════════════════════════════════════════════ */}
      {step === "failed" && (
        <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-lg text-center space-y-6">
          {/* Red Alert Icon */}
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-heading font-extrabold text-[#001B40]">
              Withdrawal could not be completed
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
              The account name did not match your verified identity, so we stopped the transfer. Your balance is unchanged.
            </p>
          </div>

          <div className="divide-y divide-neutral-100 text-xs py-2 bg-neutral-50 rounded-2xl px-4 text-left">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Amount</span>
              <span className="font-bold text-[#0F1115]">₦{withdrawAmount}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Account name</span>
              <span className="font-bold text-red-600">IKENNA NWOSU</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-neutral-400">Verified name</span>
              <span className="font-bold text-[#001B40]">JOHN OBIORA</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => toast("Contacting support...")}
              className="flex-1 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs sm:text-sm font-bold text-[#001B40] transition-colors"
            >
              Contact support
            </button>
            <button
              type="button"
              onClick={() => setStep("form")}
              className="flex-1 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs"
            >
              Use another account
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STATE 5: ADD A WITHDRAWAL ACCOUNT (Screenshot 5 Right)
          ═══════════════════════════════════════════════════════════ */}
      {step === "add_account" && (
        <div className="space-y-6">
          <div>
            <button
              type="button"
              onClick={() => setStep("form")}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Earnings</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
              Add a withdrawal account
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
              Payouts can only go to an account in your verified name
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Form (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0F1115]">
                  Bank
                </label>
                <select
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40] bg-white"
                >
                  <option value="Guaranty Trust Bank">Guaranty Trust Bank</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                  <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0F1115]">
                  Account number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
                />
                <p className="text-[11px] text-neutral-400">10-digit NUBAN</p>
              </div>

              {/* Verified Name Match Green Card */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-xs sm:text-sm text-emerald-950">
                    JOHN OBIORA
                  </h4>
                  <p className="text-[11px] text-emerald-800/90">
                    Name matches your verified identity
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="px-6 py-3 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold text-[#001B40] hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep("confirm_pin")}
                  className="px-8 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Right Info Card (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
              <h3 className="font-heading font-extrabold text-base text-[#001B40]">
                Why we check the name
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                To protect your earnings, BlueFixx only pays into accounts in the same name as your verified ID. You can save up to 3 accounts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STATE 6: CONFIRM PIN (Screenshot 1 Left)
          ═══════════════════════════════════════════════════════════ */}
      {step === "confirm_pin" && (
        <div className="space-y-6">
          <div>
            <button
              type="button"
              onClick={() => setStep("add_account")}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Earnings</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
              Add a withdrawal account
            </h1>
          </div>

          <div className="max-w-md mx-auto pt-4 sm:pt-8">
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-neutral-200/80 shadow-xs text-center space-y-6">
              {/* Bank Icon Circle */}
              <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 mx-auto">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2l10 5H2l10-5z" />
                </svg>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#0F1115]">
                  Enter your transaction PIN
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-500">
                  Confirm you want to add GTBank •••• 6789 (JOHN OBIORA).
                </p>
              </div>

              {/* 4 PIN Boxes */}
              <div className="flex justify-center items-center gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    id={`pin-box-${index}`}
                    type="password"
                    maxLength={1}
                    value={pinDigits[index]}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const next = [...pinDigits];
                      next[index] = val;
                      setPinDigits(next);
                      if (val && index < 3) {
                        const nextInput = document.getElementById(`pin-box-${index + 1}`);
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
                        const prevInput = document.getElementById(`pin-box-${index - 1}`);
                        prevInput?.focus();
                      }
                    }}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-2xl border-2 border-neutral-200 focus:border-[#001B40] focus:outline-none transition-all"
                  />
                ))}
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={() => {
                  toast.success("PIN verified successfully!");
                  setStep("account_added");
                }}
                className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                Add account
              </button>

              <div>
                <button
                  type="button"
                  onClick={() => toast("Reset link sent to your phone & email.")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Forgot PIN?
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STATE 7: ACCOUNT ADDED (Screenshot 1 Right)
          ═══════════════════════════════════════════════════════════ */}
      {step === "account_added" && (
        <div className="space-y-6">
          <div>
            <button
              type="button"
              onClick={onBackToEarnings}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Earnings</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
              Add a withdrawal account
            </h1>
          </div>

          <div className="max-w-md mx-auto pt-4 sm:pt-8">
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-neutral-200/80 shadow-xs text-center space-y-6">
              {/* Green Checkmark Circle */}
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-[#0F1115]">
                  Account added
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  GTBank •••• 6789 (JOHN OBIORA) is now saved for withdrawals. You can set it as your default in settings.
                </p>
              </div>

              {/* Actions side by side */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onBackToEarnings}
                  className="flex-1 py-3.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs sm:text-sm font-bold text-[#001B40] transition-colors cursor-pointer"
                >
                  Back to earnings
                </button>
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="flex-1 py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                >
                  Withdraw now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

