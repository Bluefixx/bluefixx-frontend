"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface TalentApprenticeshipPaymentViewProps {
  onBack: () => void;
  onOpenRefundPolicy: () => void;
  onPaymentSuccess: () => void;
  onPaymentFailed?: () => void;
  programmeTitle?: string;
  artisanName?: string;
  fee?: string;
  walletBalance?: string;
}

export function TalentApprenticeshipPaymentView({
  onBack,
  onOpenRefundPolicy,
  onPaymentSuccess,
  onPaymentFailed,
  programmeTitle = "Welding & Metal Fabrication",
  artisanName = "John Obiora",
  fee = "₦150,000",
  walletBalance = "₦185,500",
}: TalentApprenticeshipPaymentViewProps) {
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "paystack">("wallet");
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPaystackModalOpen, setIsPaystackModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pin, setPin] = useState("");

  const handlePay = () => {
    if (paymentMethod === "wallet") {
      if (pin.length < 4) {
        toast.error("Please enter your 4-digit transaction PIN");
        return;
      }
      if (pin === "0000") {
        setIsProcessing(true);
        setTimeout(() => {
          setIsProcessing(false);
          toast.error("Payment declined by bank.");
          if (onPaymentFailed) {
            onPaymentFailed();
          }
        }, 1500);
        return;
      }
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        toast.success("Payment completed! ₦150,000 safely held in escrow.");
        onPaymentSuccess();
      }, 2000);
    } else {
      setIsPaystackModalOpen(true);
    }
  };

  const handlePaystackPay = (type: "card" | "transfer") => {
    setIsPaystackModalOpen(false);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(`Paystack payment with ${type} confirmed!`);
      onPaymentSuccess();
    }, 2200);
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
        <span>My applications</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Pay for apprenticeship
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 font-medium mt-0.5">
          {programmeTitle} · Master artisan: {artisanName}
        </p>
      </div>

      {/* Main Grid: 8 cols payment configuration + 4 cols payment breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Options */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Payment Structure */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h2 className="font-heading font-bold text-sm sm:text-base text-[#0F1115]">
              Payment structure
            </h2>

            <div className="p-4 rounded-2xl border-2 border-[#001B40] bg-blue-50/20 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3.5">
                <div className="w-5 h-5 rounded-full border-2 border-[#001B40] flex items-center justify-center p-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#001B40]" />
                </div>
                <div>
                  <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                    Pay in full
                  </p>
                  <p className="font-sans text-xs text-neutral-400">
                    {fee} · Nothing else to pay
                  </p>
                </div>
              </div>
              <span className="font-heading font-extrabold text-sm sm:text-base text-[#001B40]">
                {fee}
              </span>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h2 className="font-heading font-bold text-sm sm:text-base text-[#0F1115]">
              Payment method
            </h2>

            <div className="space-y-3">
              {/* Option 1: Bluefixx Wallet */}
              <div
                onClick={() => setPaymentMethod("wallet")}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === "wallet"
                    ? "border-[#001B40] bg-blue-50/20 shadow-xs"
                    : "border-neutral-200 hover:border-neutral-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#001B40] shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                      Bluefixx Wallet
                    </p>
                    <p className="font-sans text-xs text-neutral-400">
                      Balance: <span className="font-semibold text-neutral-700">{walletBalance}</span>
                    </p>
                  </div>
                </div>

                <div className="w-5 h-5 rounded-full border-2 border-[#001B40] flex items-center justify-center p-0.5">
                  {paymentMethod === "wallet" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#001B40]" />
                  )}
                </div>
              </div>

              {/* Inline PIN Input (No dialogue box) */}
              {paymentMethod === "wallet" && (
                <div className="p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 space-y-3 animate-in fade-in duration-150">
                  <label className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] block">
                    Enter 4-digit transaction PIN
                  </label>
                  <p className="font-sans text-xs text-neutral-400">
                    Authorize payment of {fee} from your Bluefixx wallet
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    {[0, 1, 2, 3].map((idx) => (
                      <input
                        key={idx}
                        id={`payment-pin-${idx}`}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={pin[idx] || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          if (val) {
                            const newPin = (pin.slice(0, idx) + val + pin.slice(idx + 1)).slice(0, 4);
                            setPin(newPin);
                            if (idx < 3) {
                              document.getElementById(`payment-pin-${idx + 1}`)?.focus();
                            }
                          } else {
                            const newPin = pin.slice(0, idx) + pin.slice(idx + 1);
                            setPin(newPin);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !pin[idx] && idx > 0) {
                            document.getElementById(`payment-pin-${idx - 1}`)?.focus();
                          }
                        }}
                        className="w-12 h-12 text-center font-heading font-extrabold text-xl rounded-xl border border-neutral-300 focus:border-[#001B40] focus:ring-2 focus:ring-[#001B40]/10 bg-white text-[#001B40] transition-all"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Option 2: Paystack */}
              <div
                onClick={() => setPaymentMethod("paystack")}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === "paystack"
                    ? "border-[#001B40] bg-blue-50/20 shadow-xs"
                    : "border-neutral-200 hover:border-neutral-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                      Pay with Paystack
                    </p>
                    <p className="font-sans text-xs text-neutral-400">
                      Card, bank transfer, or USSD
                    </p>
                  </div>
                </div>

                <div className="w-5 h-5 rounded-full border-2 border-neutral-300 flex items-center justify-center p-0.5">
                  {paymentMethod === "paystack" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#001B40]" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Summary Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-6">
            <div className="space-y-4 divide-y divide-neutral-100 text-xs sm:text-sm">
              <div className="pt-2 first:pt-0 flex items-start justify-between gap-4">
                <span className="text-neutral-400 font-medium">Programme fee</span>
                <span className="font-bold text-[#0F1115]">{fee}</span>
              </div>

              <div className="pt-3 flex items-start justify-between gap-4">
                <span className="text-neutral-400 font-medium">Bluefixx escrow protection</span>
                <span className="font-bold text-emerald-700">Free</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePay}
              className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer text-center"
            >
              Pay {fee}
            </button>
          </div>

          {/* 30-Day Refund Policy Banner Card */}
          <div
            onClick={onOpenRefundPolicy}
            className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-5 space-y-2 cursor-pointer hover:bg-emerald-50 transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🛡️</span>
              <span className="font-sans font-bold text-xs sm:text-sm text-emerald-950">
                30-day refund policy
              </span>
            </div>
            <p className="font-sans text-xs text-emerald-900/90 leading-relaxed">
              100% refund protection within 30 days of learning if training is not as agreed.{" "}
              <span className="font-bold underline hover:text-emerald-950">Read the policy</span>.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL: Paystack Checkout Dialog */}
      {isPaystackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-neutral-200 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <span className="font-heading font-extrabold text-cyan-600 text-lg tracking-tight">
                paystack
              </span>
              <button
                type="button"
                onClick={() => setIsPaystackModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-2xl text-[#0F1115]">
                {fee}
              </h3>
              <p className="font-sans text-xs text-neutral-400">
                daniel.eze@gmail.com · Bluefixx Technologies
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => handlePaystackPay("card")}
                className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                Pay with Card
              </button>
              <button
                type="button"
                onClick={() => handlePaystackPay("transfer")}
                className="w-full py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Pay with Transfer
              </button>
            </div>

            <p className="font-sans text-[11px] text-neutral-400 leading-relaxed">
              You are on Paystack&apos;s secure checkout. You will return to Bluefixx once the payment is confirmed.
            </p>
          </div>
        </div>
      )}

      {/* MODAL 3: Payment Processing Animation (Matching Figma) */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full border border-neutral-200 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full border-4 border-[#001B40]/20 border-t-[#001B40] animate-spin mx-auto" />

            <div className="space-y-2">
              <h3 className="font-heading font-extrabold text-2xl text-[#0F1115]">
                Payment processing
              </h3>
              <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-xs mx-auto leading-relaxed">
                Most transfers land within 10 minutes. We will notify you as soon as your bank confirms.
              </p>
            </div>

            <div className="pt-2">
              <span className="font-mono text-[11px] text-neutral-400 bg-neutral-100 px-3 py-1.5 rounded-lg inline-block">
                Reference: PTX-78194-2025 · Safely held in escrow
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
