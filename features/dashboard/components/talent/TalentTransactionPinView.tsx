"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { setTransactionPinApi } from "@/lib/api/account";

interface TalentTransactionPinViewProps {
  onBack: () => void;
  onSuccessBack: () => void;
}

export function TalentTransactionPinView({
  onBack,
  onSuccessBack,
}: TalentTransactionPinViewProps) {
  const [step, setStep] = useState<"create" | "confirm" | "success">("create");
  const [firstPin, setFirstPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateContinue = () => {
    if (firstPin.length < 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }
    setStep("confirm");
  };

  const handleConfirmPin = async () => {
    if (confirmPin.length < 4) {
      toast.error("Please enter all 4 digits");
      return;
    }
    if (firstPin !== confirmPin) {
      toast.error("PINs do not match. Please try again.");
      setConfirmPin("");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await setTransactionPinApi({ pin: firstPin });
      toast.success(res?.message || "Transaction PIN created successfully!");
      setStep("success");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not save your PIN. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 3: SUCCESS (Matching Figma Screenshot 5 Left)
  if (step === "success") {
    return (
      <div className="space-y-6 max-w-xl mx-auto pb-16 select-none animate-in fade-in duration-200">
        <button
          type="button"
          onClick={onSuccessBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Profile</span>
        </button>

        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
            Transaction PIN
          </h1>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-neutral-200/80 shadow-2xs text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto text-2xl shadow-xs">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-2xl text-[#0F1115]">
              PIN Created
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Your transaction PIN is ready. You will be asked for it each time money moves on Bluefixx.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onSuccessBack}
              className="w-full max-w-sm mx-auto py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer block"
            >
              Back to settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 1 (Create PIN) & STEP 2 (Confirm PIN)
  return (
    <div className="space-y-6 max-w-xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Breadcrumb Back */}
      <button
        type="button"
        onClick={step === "confirm" ? () => setStep("create") : onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Profile</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Transaction PIN
        </h1>
      </div>

      {/* Center Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-2xs text-center space-y-6">
        {/* Lock Icon */}
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#001B40] mx-auto shadow-2xs">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <div className="space-y-2 max-w-sm mx-auto">
          <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed">
            {step === "create"
              ? "Your transaction PIN protects payments, withdrawals, and other money movements on Bluefixx. Never share it."
              : "Enter the same four digits again to confirm."}
          </p>
        </div>

        {/* 4 Clean PIN Input Boxes (Direct input, no dialogue box) */}
        <div className="flex items-center justify-center gap-3.5 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const currentPin = step === "create" ? firstPin : confirmPin;
            const setCurrentPin = step === "create" ? setFirstPin : setConfirmPin;
            const inputId = `txn-pin-input-${step}-${idx}`;

            return (
              <input
                key={idx}
                id={inputId}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={currentPin[idx] || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  if (val) {
                    const next = (currentPin.slice(0, idx) + val + currentPin.slice(idx + 1)).slice(0, 4);
                    setCurrentPin(next);
                    if (idx < 3) {
                      document.getElementById(`txn-pin-input-${step}-${idx + 1}`)?.focus();
                    }
                  } else {
                    const next = currentPin.slice(0, idx) + currentPin.slice(idx + 1);
                    setCurrentPin(next);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !currentPin[idx] && idx > 0) {
                    document.getElementById(`txn-pin-input-${step}-${idx - 1}`)?.focus();
                  }
                }}
                className="w-14 h-14 text-center font-heading font-extrabold text-2xl rounded-2xl border-2 border-neutral-200 focus:border-[#001B40] focus:ring-4 focus:ring-[#001B40]/10 bg-neutral-50/50 text-[#001B40] transition-all"
              />
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {step === "create" ? (
            <button
              type="button"
              onClick={handleCreateContinue}
              disabled={firstPin.length < 4}
              className={`w-full max-w-sm mx-auto py-3.5 rounded-xl font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer ${
                firstPin.length === 4
                  ? "bg-[#001B40] hover:bg-[#052F5F] text-white"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmPin}
              disabled={confirmPin.length < 4 || isSubmitting}
              className={`w-full max-w-sm mx-auto py-3.5 rounded-xl font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer ${
                confirmPin.length === 4 && !isSubmitting
                  ? "bg-[#001B40] hover:bg-[#052F5F] text-white"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Saving PIN..." : "Confirm PIN"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
