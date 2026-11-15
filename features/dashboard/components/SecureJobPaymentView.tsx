"use client";

import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { createPaymentApi, verifyPaymentApi } from "@/lib/api/wallet";
import { openPaystackInline } from "@/lib/paystack";
import { confirmBookingScheduleVisitApi } from "@/lib/api/bookings";
import { nairaToKobo } from "@/lib/utils/currency";

export type PaymentStep = "secure" | "secured-success" | "schedule" | "scheduled-success";

interface SecureJobPaymentViewProps {
  bookingId?: string;
  jobId?: string;
  jobTitle?: string;
  artisanName?: string;
  customerName?: string;
  location?: string;
  quoteTotal?: number;
  labourAmount?: number;
  materialsAmount?: number;
  onBackToJobs?: () => void;
  onViewJobDetail?: () => void;
}

export default function SecureJobPaymentView({
  bookingId,
  jobId = "",
  jobTitle = "Service Booking",
  artisanName = "Artisan",
  customerName = "Customer",
  location = "",
  quoteTotal = 0,
  labourAmount = 0,
  materialsAmount = 0,
  onBackToJobs,
  onViewJobDetail,
}: SecureJobPaymentViewProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>("secure");
  const [selectedPaymentSource, setSelectedPaymentSource] = useState<"wallet" | "fund" | "paystack">("paystack");

  // PIN Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", ""]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first PIN input when modal opens
  useEffect(() => {
    if (isPinModalOpen) {
      setTimeout(() => {
        pinInputRefs.current[0]?.focus();
      }, 100);
    } else {
      setPinDigits(["", "", "", ""]);
    }
  }, [isPinModalOpen]);

  const handlePinChange = (index: number, val: string) => {
    // Only accept numbers
    const cleanVal = val.replace(/\D/g, "");
    if (!cleanVal && val !== "") return;

    const newPin = [...pinDigits];
    newPin[index] = cleanVal.slice(-1);
    setPinDigits(newPin);

    // Auto-advance
    if (cleanVal && index < 3) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    const newPin = [...pinDigits];
    for (let i = 0; i < pasted.length; i++) {
      newPin[i] = pasted[i];
    }
    setPinDigits(newPin);
    const nextIdx = Math.min(pasted.length, 3);
    pinInputRefs.current[nextIdx]?.focus();
  };

  const handleConfirmPayment = async () => {
    const source = selectedPaymentSource === "wallet" ? "WALLET" : "PAYSTACK";
    const fullPin = pinDigits.join("");
    if (source === "WALLET" && fullPin.length < 4) {
      toast.error("Please enter your complete 4-digit PIN");
      return;
    }

    const targetBookingId = bookingId || jobId;
    if (!targetBookingId) {
      toast.error("Booking reference is missing; cannot initialize payment.");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const payment = await createPaymentApi({
        purpose: "BOOKING",
        bookingId: targetBookingId,
        source,
        ...(source === "WALLET" ? { pin: fullPin } : {}),
      });

      if (source === "PAYSTACK") {
        const checkoutUrl = payment.checkoutUrl || payment.authorizationUrl;
        if (!checkoutUrl) {
          throw new Error("Paystack checkout URL was not returned");
        }
        setIsPinModalOpen(false);
        await openPaystackInline({
          checkoutUrl,
          onSuccess: async () => {
            try {
              const verified = await verifyPaymentApi(payment.id);
              if (verified?.status === "SUCCEEDED") {
                setCurrentStep("secured-success");
                toast.success(`₦${quoteTotal.toLocaleString("en-NG")} secured in Escrow protection!`, {
                  icon: "🔒",
                });
              } else if (verified?.status === "FAILED") {
                toast.error("Paystack payment failed or was cancelled.");
              } else {
                toast("Payment is pending confirmation.");
              }
            } catch (err: unknown) {
              toast.error(err instanceof Error ? err.message : "Could not verify Paystack payment.");
            }
          },
          onCancel: () => {
            toast("Payment cancelled.");
          },
          onError: (msg) => {
            toast.error(msg);
          },
        });
        return;
      }

      setIsPinModalOpen(false);
      setCurrentStep("secured-success");
      toast.success(`₦${quoteTotal.toLocaleString("en-NG")} secured in Escrow protection!`, {
        icon: "🔒",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 1: SECURE YOUR JOB (Matching media_1792531657923)     */}
      {/* (Payment option card omitted per user requirement)         */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === "secure" && (
        <div className="space-y-6">
          {/* Top Header */}
          <div>
            <button
              type="button"
              onClick={onBackToJobs}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>My jobs</span>
            </button>

            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight mt-3">
              Secure Your Job
            </h1>
            <p className="font-sans text-xs text-neutral-400 mt-0.5">
              {jobId} · {jobTitle}
            </p>
          </div>

          {/* 7-day Warranty Banner */}
          <div className="bg-[#EBF7F0] border border-[#C6EBD3] rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div className="text-xs">
              <h4 className="font-sans font-bold text-emerald-900">
                Covered by a 7-day warranty
              </h4>
              <p className="text-neutral-600 mt-0.5">
                Your warranty starts the day you confirm the work is complete.
              </p>
            </div>
          </div>

          {/* Two Columns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Summary Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
                <h3 className="font-heading font-bold text-base text-[#0F1115]">
                  Job summary
                </h3>

                <div className="divide-y divide-neutral-100 text-xs sm:text-sm">
                  <div className="flex items-center justify-between py-3 first:pt-0">
                    <span className="text-neutral-500">Job</span>
                    <span className="font-medium text-neutral-900">{jobTitle}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-neutral-500">Artisan</span>
                    <span className="font-medium text-neutral-900">{artisanName}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 last:pb-0">
                    <span className="text-neutral-500">Quote</span>
                    <span className="font-bold text-neutral-900">
                      ₦{quoteTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Source Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
                <h3 className="font-heading font-bold text-base text-[#0F1115]">
                  Payment source
                </h3>

                <div className="space-y-3">
                  {/* Option 1: Bluefixx Wallet (Disabled/Insufficient) */}
                  <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between gap-3 text-xs opacity-75">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-neutral-700">
                          Bluefixx Wallet
                        </h4>
                        <p className="font-sans text-[11px] text-neutral-400">
                          Balance ₦85,000, not enough for this payment
                        </p>
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full border border-neutral-300" />
                  </div>

                  {/* Option 2: Fund Wallet */}
                  <div
                    onClick={() => {
                      setSelectedPaymentSource("fund");
                      toast("Wallet funding will be available in the next release");
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                      selectedPaymentSource === "fund"
                        ? "border-[#001B40] bg-[#F4F7FB]"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-[#0F1115]">
                          Fund Wallet
                        </h4>
                        <p className="font-sans text-[11px] text-neutral-400">
                          Top up, then pay from your balance
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedPaymentSource === "fund"
                          ? "border-[#001B40]"
                          : "border-neutral-300"
                      }`}
                    >
                      {selectedPaymentSource === "fund" && (
                        <div className="w-2 h-2 rounded-full bg-[#001B40]" />
                      )}
                    </div>
                  </div>

                  {/* Option 3: Paystack (Selected) */}
                  <div
                    onClick={() => setSelectedPaymentSource("paystack")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                      selectedPaymentSource === "paystack"
                        ? "border-[#001B40] bg-[#F4F7FB]"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-[#001B40] flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-[#0F1115]">
                          Paystack
                        </h4>
                        <p className="font-sans text-[11px] text-neutral-400">
                          Card · Bank transfer · USSD
                        </p>
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full border border-[#001B40] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#001B40]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Escrow Shield Notice */}
              <div className="bg-[#EDF5FF] border border-[#CDE0FF] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#002D62] shadow-2xs">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <span className="leading-relaxed">
                  Bluefixx holds this payment in escrow. The artisan is only paid after you confirm the work is complete, and you can open a dispute before that happens.
                </span>
              </div>
            </div>

            {/* Right Column: Payment Summary Card */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-base text-[#0F1115]">
                    Payment summary
                  </h3>
                  <span className="bg-[#FFF8E6] text-[#B45309] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    Payment Pending
                  </span>
                </div>

                <div className="divide-y divide-neutral-100 text-xs sm:text-sm">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-neutral-500">Labour</span>
                    <span className="font-semibold text-neutral-800">
                      ₦{labourAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-neutral-500">Materials</span>
                    <span className="font-semibold text-neutral-800">
                      ₦{materialsAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3.5">
                    <span className="text-neutral-500 font-medium">Total</span>
                    <span className="font-sans font-bold text-xl text-[#0F1115]">
                      ₦{quoteTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="font-sans text-[11px] text-neutral-400 leading-relaxed pt-1">
                  Escrow protection is free for customers. Bluefixx deducts its 7% service fee from the artisan&apos;s payout.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPinModalOpen(true)}
                    className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center shadow-xs"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* PIN MODAL: ENTER TRANSACTION PIN (media_1792531765288)     */}
      {/* User Instruction: Just the input field is what's needed    */}
      {/* ══════════════════════════════════════════════════════════ */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150 space-y-5 text-center">
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={() => setIsPinModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div>
              <h3 className="font-heading font-bold text-lg text-[#0F1115]">
                Enter transaction PIN
              </h3>
              <p className="font-sans text-xs text-neutral-500 mt-2 leading-relaxed max-w-xs mx-auto">
                Authorise ₦{quoteTotal.toLocaleString()} to be held in escrow for {jobTitle}
              </p>
            </div>

            {/* 4 Digit PIN Input Boxes (Clean Accessible Input Only) */}
            <div className="flex items-center justify-center gap-3 pt-3">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    pinInputRefs.current[idx] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={pinDigits[idx]}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(idx, e)}
                  onPaste={handlePinPaste}
                  className="w-14 h-14 rounded-2xl border-2 border-neutral-200 text-center font-sans font-bold text-2xl text-[#001B40] focus:border-[#001B40] focus:outline-hidden transition-all shadow-2xs"
                />
              ))}
            </div>

            <p className="font-sans text-[11px] text-neutral-400">
              Enter your 4-digit Bluefixx security PIN
            </p>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment}
                className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center shadow-2xs disabled:opacity-60"
              >
                {isProcessingPayment ? "Securing payment..." : "Continue to payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 2: PAYMENT SECURED (Matching media_1792531808352)     */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === "secured-success" && (
        <div className="space-y-6">
          {/* Top Header */}
          <div>
            <button
              type="button"
              onClick={onBackToJobs}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>My jobs</span>
            </button>

            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight mt-3">
              Payment Secured
            </h1>
            <p className="font-sans text-xs text-neutral-400 mt-0.5">
              {jobId} · {jobTitle}
            </p>
          </div>

          {/* 7-day Warranty Banner */}
          <div className="bg-[#EBF7F0] border border-[#C6EBD3] rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div className="text-xs">
              <h4 className="font-sans font-bold text-emerald-900">
                Covered by a 7-day warranty
              </h4>
              <p className="text-neutral-600 mt-0.5">
                Your warranty starts the day you confirm the work is complete.
              </p>
            </div>
          </div>

          {/* Main Centered Body */}
          <div className="pt-4 sm:pt-6 space-y-6 max-w-xl mx-auto text-center">
            {/* Navy Lock Circle Icon */}
            <div className="w-14 h-14 rounded-full bg-[#001B40] text-white flex items-center justify-center mx-auto shadow-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            {/* Price */}
            <div>
              <span className="font-sans font-bold text-3xl sm:text-4xl text-[#0F1115] tracking-tight block">
                ₦{quoteTotal.toLocaleString()}
              </span>
              <p className="font-sans text-xs text-neutral-500 mt-2 max-w-md mx-auto leading-relaxed">
                Your payment is protected while the job is being completed. It is released only when you confirm the work.
              </p>
            </div>

            {/* White Transaction Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 text-left text-xs sm:text-sm">
              <div className="flex items-center justify-between py-3 first:pt-0">
                <span className="text-neutral-500">Job</span>
                <span className="font-medium text-neutral-900">{jobTitle}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-neutral-500">Artisan</span>
                <span className="font-medium text-neutral-900">{artisanName}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-neutral-500">Transaction ID</span>
                <span className="font-mono font-semibold text-neutral-800">TXN-639890</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-neutral-500">Amount</span>
                <span className="font-bold text-neutral-900">₦{quoteTotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-neutral-500">Payment type</span>
                <span className="font-medium text-neutral-900">Paid in full</span>
              </div>

              <div className="flex items-center justify-between py-3 last:pb-0">
                <span className="text-neutral-500">Date</span>
                <span className="font-medium text-neutral-900">Today · 9:39</span>
              </div>
            </div>

            {/* Green Notification Tip */}
            <div className="bg-[#EBF7F0] border border-[#C6EBD3] rounded-2xl p-4 text-xs text-emerald-900 font-medium flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <span>
                {artisanName.split(" ")[0]} has been notified and can now confirm the schedule with you.
              </span>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep("schedule")}
                className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center shadow-xs"
              >
                Continue to Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 3: SCHEDULE JOB (Matching media_1792531843952)        */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === "schedule" && (
        <div className="space-y-6">
          {/* Top Header */}
          <div>
            <button
              type="button"
              onClick={() => setCurrentStep("secured-success")}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>My jobs</span>
            </button>

            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight mt-3">
              Schedule Job
            </h1>
            <p className="font-sans text-xs text-neutral-400 mt-0.5">
              {jobTitle}
            </p>
          </div>

          {/* Two Column Schedule Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column: Schedule Confirmation Card */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
                <h3 className="font-heading font-bold text-base text-[#0F1115]">
                  Confirm your schedule
                </h3>

                <div className="divide-y divide-neutral-100 text-xs sm:text-sm">
                  <div className="flex items-center justify-between py-3.5 first:pt-0">
                    <span className="text-neutral-500">Artisan</span>
                    <span className="font-medium text-neutral-900">{artisanName}</span>
                  </div>

                  <div className="flex items-center justify-between py-3.5">
                    <span className="text-neutral-500">Customer</span>
                    <span className="font-medium text-neutral-900">{customerName}</span>
                  </div>

                  <div className="flex items-center justify-between py-3.5">
                    <span className="text-neutral-500">Date</span>
                    <span className="font-semibold text-neutral-900">Tomorrow · Sat 23 Aug</span>
                  </div>

                  <div className="flex items-center justify-between py-3.5 last:pb-0">
                    <span className="text-neutral-500">Time</span>
                    <span className="font-semibold text-neutral-900">Morning · 8am – 12pm</span>
                  </div>
                </div>
              </div>

              {/* Blue Proposed Slot Notice */}
              <div className="bg-[#EDF5FF] border border-[#CDE0FF] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#002D62] shadow-2xs">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="leading-relaxed">
                  {artisanName.split(" ")[0]} proposed tomorrow · 9:00 AM, matching your preferred slot. Confirming locks it in for both of you and starts reminders.
                </span>
              </div>

              {/* Confirm Schedule Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    const targetBookingId = bookingId || jobId;
                    try {
                      if (targetBookingId) {
                        await confirmBookingScheduleVisitApi(targetBookingId);
                      }
                      setCurrentStep("scheduled-success");
                      toast.success("Job schedule locked in!", { icon: "📅" });
                    } catch (err: unknown) {
                      const msg =
                        err instanceof Error ? err.message : "Failed to confirm schedule.";
                      toast.error(msg);
                    }
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center shadow-xs"
                >
                  Confirm Schedule
                </button>
              </div>
            </div>

            {/* Right Column: Location Map Preview */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-3">
                <h3 className="font-heading font-bold text-base text-[#0F1115]">
                  Job location
                </h3>

                {/* Stylized Map View */}
                <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                  {/* Subtle map road grid pattern */}
                  <div className="absolute inset-0 bg-[#E8ECEF] opacity-90 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="absolute top-1/2 left-0 right-0 h-4 bg-white/70 -translate-y-1/2" />
                  <div className="absolute left-1/3 top-0 bottom-0 w-3 bg-white/70" />

                  {/* Red Location Pin with Pulse */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <span className="bg-white/95 text-neutral-800 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm mt-1 whitespace-nowrap">
                      Independence Layout
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <p className="font-sans font-semibold text-xs text-neutral-800">
                    {location}
                  </p>
                  <p className="font-sans text-[11px] text-neutral-400 mt-0.5">
                    Job location
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 4: JOB SCHEDULED (Matching media_1792531872000)       */}
      {/* ══════════════════════════════════════════════════════════ */}
      {currentStep === "scheduled-success" && (
        <div className="space-y-6">
          {/* Top Header */}
          <div>
            <button
              type="button"
              onClick={onBackToJobs}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>My jobs</span>
            </button>

            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight mt-3">
              Schedule Job
            </h1>
            <p className="font-sans text-xs text-neutral-400 mt-0.5">
              {jobTitle}
            </p>
          </div>

          {/* Centered Schedule Confirmation Body */}
          <div className="pt-6 space-y-6 max-w-md mx-auto text-center">
            {/* Navy Calendar Circle Icon */}
            <div className="w-14 h-14 rounded-full bg-[#001B40] text-white flex items-center justify-center mx-auto shadow-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>

            <div>
              <h2 className="font-heading font-bold text-2xl text-[#0F1115]">
                Job Scheduled
              </h2>
              <p className="font-sans text-xs text-neutral-500 mt-1">
                Both you and {artisanName} are confirmed.
              </p>
            </div>

            {/* Countdown Box */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-2xs space-y-2">
              <span className="font-sans text-xs text-neutral-400 font-medium">
                Starts in
              </span>
              <span className="font-sans font-bold text-3xl sm:text-4xl text-[#0F1115] block tracking-tight">
                21h 19m
              </span>
              <span className="inline-flex items-center gap-1.5 font-sans text-xs text-neutral-500 pt-1">
                <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Tomorrow · 9:00 AM
              </span>
            </div>

            {/* Location Pill Box */}
            <div className="bg-[#EDF5FF] border border-[#CDE0FF] rounded-2xl p-4 flex items-center justify-center gap-2 text-xs text-[#002D62] shadow-2xs">
              <svg className="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{location}</span>
            </div>

            {/* View Job Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onViewJobDetail}
                className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center shadow-xs"
              >
                View Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
