"use client";

import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { setTransactionPinApi } from "@/lib/api";

interface ArtisanCreatePinViewProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export function ArtisanCreatePinView({
  onBack,
  onSuccess,
}: ArtisanCreatePinViewProps) {
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...pinDigits];
    next[index] = digit;
    setPinDigits(next);

    // Auto-advance
    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleCreatePin = async () => {
    const pin = pinDigits.join("");
    if (pinDigits.some((d) => !d) || !/^(?:\d{4}|\d{6})$/.test(pin)) {
      toast.error("Please enter a 4-digit PIN.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await setTransactionPinApi({ pin });
      toast.success(res?.message || "Transaction PIN created successfully!");
      if (onSuccess) onSuccess();
      else onBack();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save transaction PIN. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Settings</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Transaction Pin
        </h1>
      </div>

      {/* Centered Elevated PIN Creator Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs max-w-md mx-auto text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#001B40] flex items-center justify-center mx-auto shadow-2xs">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
          Enter 4 numbers. Keep your PIN confidential and never share it with anyone, including staff from BlueFixx.
        </p>

        {/* 4 PIN Boxes (Hardware / On-Device Keyboard Input) */}
        <div className="flex justify-center items-center gap-3 pt-2">
          {[0, 1, 2, 3].map((idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={pinDigits[idx]}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 rounded-2xl border-2 border-neutral-200 bg-neutral-50/50 text-center text-xl font-heading font-bold text-[#0F1115] focus:outline-hidden focus:border-[#001B40] focus:bg-white transition-all"
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleCreatePin}
            disabled={isSubmitting || pinDigits.some((d) => !d)}
            className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] disabled:opacity-60 text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving PIN...</span>
              </>
            ) : (
              <span>Create PIN</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ArtisanCreatePinView;
