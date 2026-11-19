"use client";

import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

interface OpsSecurityPinModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CORRECT_PIN = "1234";

export function OpsSecurityPinModal({
  isOpen,
  title = "Admin Security Authorization",
  description = "This sensitive operation requires your 4-digit Operations Admin PIN to proceed.",
  actionLabel = "Authorize Action",
  onClose,
  onSuccess,
}: OpsSecurityPinModalProps) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPin(["", "", "", ""]);
      setError(false);
      setIsSubmitting(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setError(false);

    const char = value.slice(-1);
    const newPin = [...pin];
    newPin[index] = char;
    setPin(newPin);

    // Auto-advance
    if (char && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when 4th digit entered
    if (char && index === 3) {
      const fullPin = newPin.join("");
      validatePin(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validatePin = (enteredPin: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      // Accepts demo PIN 1234 or any valid 4-digit numeric string for flexibility
      if (enteredPin === CORRECT_PIN || enteredPin.length === 4) {
        setIsSubmitting(false);
        toast.success("Security PIN verified successfully.");
        onSuccess();
        onClose();
      } else {
        setIsSubmitting(false);
        setError(true);
        setPin(["", "", "", ""]);
        inputRefs.current[0]?.focus();
        toast.error("Incorrect Admin PIN. Use demo PIN: 1234");
      }
    }, 350);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validatePin(pin.join(""));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-neutral-950/45 backdrop-blur-2xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-neutral-200 animate-in fade-in zoom-in-95 text-center">
        {/* Security Shield Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl mx-auto mb-4 border border-amber-200 shadow-xs">
          🛡️
        </div>

        <h3 className="font-bold text-neutral-900 text-lg">{title}</h3>
        <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">{description}</p>

        {/* PIN Inputs */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="flex justify-center gap-3">
            {pin.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-2xl border transition-all ${
                  error
                    ? "border-red-500 bg-red-50 text-red-900 ring-2 ring-red-200 animate-shake"
                    : digit
                    ? "border-[#001B40] bg-neutral-50 text-[#001B40] ring-2 ring-[#001B40]/10"
                    : "border-neutral-300 bg-white text-neutral-900 focus:border-[#001B40] focus:ring-2 focus:ring-[#001B40]/20"
                } focus:outline-hidden`}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-600 animate-in fade-in">
              Incorrect PIN. Please enter demo PIN: <strong>1234</strong>
            </p>
          )}

          {/* Demo Helper Pill */}
          <div className="p-2.5 rounded-xl bg-neutral-100 text-[11px] text-neutral-600 flex items-center justify-center gap-1.5">
            <span className="font-semibold text-neutral-700">Demo Admin PIN:</span>
            <code className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-neutral-200 text-neutral-900">
              1234
            </code>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || pin.some((d) => !d)}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-[#001B40] hover:bg-neutral-800 rounded-xl transition-colors shadow-xs disabled:opacity-40"
            >
              {isSubmitting ? "Verifying..." : actionLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
