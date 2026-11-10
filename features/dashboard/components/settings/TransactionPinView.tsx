"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { setTransactionPinApi, getAccountProfileApi } from "@/lib/api";

interface TransactionPinViewProps {
  onBack: () => void;
  onPinConfigured: () => void;
}

export function TransactionPinView({
  onBack,
  onPinConfigured,
}: TransactionPinViewProps) {
  // Sub-step: "loading" | "create" | "confirm" | "success" | "configured"
  const [subStep, setSubStep] = useState<"loading" | "create" | "confirm" | "success" | "configured">("loading");
  const [createPin, setCreatePin] = useState<string[]>(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState<string[]>(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAccountProfileApi()
      .then((profile) => {
        if (!mounted) return;
        const isConfigured = Boolean((profile as any)?.settings?.pinConfigured);
        if (isConfigured) {
          setSubStep("configured");
        } else {
          setSubStep("create");
        }
      })
      .catch(() => {
        if (mounted) setSubStep("create");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateDigitChange = (index: number, val: string) => {
    const char = val.replace(/[^0-9]/g, "").slice(-1);
    const updated = [...createPin];
    updated[index] = char;
    setCreatePin(updated);

    if (char && index < 3) {
      const nextInput = document.getElementById(`create-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleCreateKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !createPin[index] && index > 0) {
      const prevInput = document.getElementById(`create-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleConfirmDigitChange = (index: number, val: string) => {
    const char = val.replace(/[^0-9]/g, "").slice(-1);
    const updated = [...confirmPin];
    updated[index] = char;
    setConfirmPin(updated);

    if (char && index < 3) {
      const nextInput = document.getElementById(`confirm-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleConfirmKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !confirmPin[index] && index > 0) {
      const prevInput = document.getElementById(`confirm-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleProceedToConfirm = () => {
    if (createPin.some((d) => !d)) {
      toast.error("Please enter all 4 digits");
      return;
    }
    setSubStep("confirm");
  };

  const handleValidateAndSave = async () => {
    const pin1 = createPin.join("");
    const pin2 = confirmPin.join("");

    if (pin1 !== pin2) {
      toast.error("PINs do not match. Please try again.");
      setConfirmPin(["", "", "", ""]);
      const firstInput = document.getElementById("confirm-pin-0");
      firstInput?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await setTransactionPinApi({ pin: pin1 });
      toast.success(res?.message || "Transaction PIN saved successfully");
      setSubStep("success");
      onPinConfigured();
    } catch (err: any) {
      const errMsg =
        err?.message ||
        err?.response?.data?.error?.message ||
        "Failed to save transaction PIN. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (subStep === "loading") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-pulse">
        <div className="h-6 w-32 bg-neutral-200 rounded-md" />
        <div className="h-48 bg-white rounded-3xl border border-neutral-200/80 p-8" />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW: PIN ALREADY CONFIGURED
  // ══════════════════════════════════════════════════════════════
  if (subStep === "configured") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Settings</span>
          </button>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
            Transaction PIN
          </h1>
          <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
            Your wallet security is active.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs flex flex-col items-center text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#001B40]">
                PIN Configured &amp; Active
              </h2>
              <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-sm leading-relaxed">
                Your 4-digit transaction PIN is saved. It protects all payments, escrow releases, and withdrawals on your Bluefixx account.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
              <button
                type="button"
                onClick={() => {
                  setCreatePin(["", "", "", ""]);
                  setConfirmPin(["", "", "", ""]);
                  setSubStep("create");
                }}
                className="flex-1 py-3 bg-[#001B40] hover:bg-[#074292] text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm cursor-pointer"
              >
                Change PIN
              </button>
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs sm:text-sm rounded-xl text-center transition-colors cursor-pointer"
              >
                Back to Settings
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Wallet protection
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Your PIN is required whenever authorizing a service deposit, releasing funds to an artisan, or withdrawing to your bank.
            </p>
            <div className="pt-3 border-t border-neutral-100 space-y-1 text-xs">
              <span className="font-bold text-[#001B40] block">Need help resetting?</span>
              <p className="text-neutral-500 leading-relaxed">
                If you forget your PIN, you can reset it via OTP sent to your registered phone or email.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW: PIN CREATED (Screenshot 5 Right)
  // ══════════════════════════════════════════════════════════════
  if (subStep === "success") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Settings</span>
          </button>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
            Transaction PIN
          </h1>
          <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
            Your wallet security is set up.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white rounded-3xl p-8 sm:p-14 border border-neutral-200/80 shadow-xs flex flex-col items-center text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#001B40]">
                PIN Created
              </h2>
              <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-sm leading-relaxed">
                Your Transaction PIN is ready. You will be asked for it when transferring money on Bluefixx.
              </p>
            </div>

            <div className="pt-4 w-full max-w-xs">
              <button
                type="button"
                onClick={onBack}
                className="w-full py-3.5 bg-[#001B40] hover:bg-[#074292] text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Protected transactions
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Your PIN protects payments, withdrawals and other money movements on Bluefixx.
            </p>
            <div className="pt-3 border-t border-neutral-100 space-y-1 text-xs">
              <span className="font-bold text-[#001B40] block">Never share your PIN</span>
              <p className="text-neutral-500 leading-relaxed">
                Bluefixx will never call you to ask for your transaction PIN.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW: CONFIRM PIN (Screenshot 5 Left)
  // ══════════════════════════════════════════════════════════════
  if (subStep === "confirm") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
        <div>
          <button
            type="button"
            onClick={() => setSubStep("create")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Create transaction PIN</span>
          </button>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
            Transaction PIN
          </h1>
          <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
            Confirm your new transaction PIN.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs flex flex-col items-center text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#001B40] flex items-center justify-center">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#001B40]">
                Confirm your transaction PIN
              </h2>
              <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-sm leading-relaxed">
                Enter the same four digits again to confirm.
              </p>
            </div>

            {/* 4 Digit Boxes */}
            <div className="flex justify-center gap-3 sm:gap-4 pt-2">
              {confirmPin.map((digit, idx) => (
                <input
                  key={idx}
                  id={`confirm-pin-${idx}`}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleConfirmDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleConfirmKeyDown(idx, e)}
                  autoFocus={idx === 0}
                  className="w-14 h-14 rounded-2xl border-2 border-neutral-200 text-center text-2xl font-bold text-[#001B40] focus:border-[#001B40] focus:outline-hidden transition-colors"
                />
              ))}
            </div>

            <p className="text-xs text-neutral-400">
              Use your keyboard to enter a 4-digit PIN.
            </p>

            <div className="w-full max-w-md pt-2">
              <button
                type="button"
                disabled={confirmPin.some((d) => !d) || isSubmitting}
                onClick={handleValidateAndSave}
                className="w-full py-3.5 bg-[#001B40] hover:bg-[#074292] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving PIN...</span>
                  </>
                ) : (
                  <span>Confirm PIN</span>
                )}
              </button>
            </div>
          </div>

          {/* Right Info Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Keep your wallet secure
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              You&apos;ll use this PIN to authorise every payment, withdrawal and other money movement.
            </p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Keep your PIN private. Bluefixx will never ask you to share it.
            </p>

            <div className="pt-3 border-t border-neutral-100 space-y-1 text-xs">
              <span className="font-bold text-[#001B40] block">Your money, protected</span>
              <p className="text-neutral-500 leading-relaxed">
                Your transaction PIN adds an extra layer of security to your Bluefixx Wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW: CREATE PIN (Screenshot 4 Right)
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Settings</span>
        </button>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Transaction PIN
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
          Set up a secure PIN for your wallet.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs flex flex-col items-center text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#001B40] flex items-center justify-center">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#001B40]">
              Create your transaction PIN
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-sm leading-relaxed">
              Your transaction PIN protects payments, withdrawals and other money movements on Bluefixx. Never share it.
            </p>
          </div>

          {/* 4 Digit Boxes */}
          <div className="flex justify-center gap-3 sm:gap-4 pt-2">
            {createPin.map((digit, idx) => (
              <input
                key={idx}
                id={`create-pin-${idx}`}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCreateDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleCreateKeyDown(idx, e)}
                autoFocus={idx === 0}
                className="w-14 h-14 rounded-2xl border-2 border-neutral-200 text-center text-2xl font-bold text-[#001B40] focus:border-[#001B40] focus:outline-hidden transition-colors"
              />
            ))}
          </div>

          <p className="text-xs text-neutral-400">
            Use your keyboard to enter a 4-digit PIN.
          </p>

          <div className="w-full max-w-md pt-2">
            <button
              type="button"
              disabled={createPin.some((d) => !d)}
              onClick={handleProceedToConfirm}
              className="w-full py-3.5 bg-[#001B40] hover:bg-[#074292] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>

        {/* Right Info Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#001B40]">
            Keep your wallet secure
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            You&apos;ll use this PIN to authorise every payment, withdrawal and other money movement.
          </p>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Keep your PIN private. Bluefixx will never ask you to share it.
          </p>

          <div className="pt-3 border-t border-neutral-100 space-y-1 text-xs">
            <span className="font-bold text-[#001B40] block">Your money, protected</span>
            <p className="text-neutral-500 leading-relaxed">
              Your transaction PIN adds an extra layer of security to your Bluefixx Wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
