"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PhoneInput from "@/components/ui/PhoneInput";
import { toE164 } from "@/lib/utils/phone";

interface GoogleProfileModalProps {
  isOpen: boolean;
  isLoading: boolean;
  initialFullName?: string;
  onSubmit: (data: { fullName: string; phone: string; acceptedTerms: boolean }) => Promise<void>;
  onClose: () => void;
}

export default function GoogleProfileModal({
  isOpen,
  isLoading,
  initialFullName = "",
  onSubmit,
  onClose,
}: GoogleProfileModalProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = fullName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 120) {
      toast.error("Please enter your full name (2–120 characters).");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your mobile phone number.");
      return;
    }
    if (!agreedToTerms) {
      toast.error("You must agree to the Terms of Use and Privacy Policy.");
      return;
    }

    await onSubmit({
      fullName: trimmedName,
      phone: toE164(phone.trim(), countryCode),
      acceptedTerms: true,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => {
        if (!isLoading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-profile-modal-title"
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-neutral-200/90 shadow-xl w-full max-w-[440px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
              COMPLETE YOUR PROFILE
            </span>
            <h4
              id="google-profile-modal-title"
              className="font-sans font-bold text-xl sm:text-2xl text-[#0F1115] mt-1 tracking-tight"
            >
              Finish signing up with Google
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close Google profile modal"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1.5 mb-5 leading-relaxed">
          Enter your phone number and accept our terms to create your BlueFixx account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col text-left">
            <label className="font-sans font-medium text-xs text-neutral-800 mb-1">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              disabled={isLoading}
              className="w-full bg-white border border-neutral-300 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40] disabled:opacity-60"
            />
          </div>

          <PhoneInput
            value={phone}
            onChange={setPhone}
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            placeholder="803 245 0182"
            label="Phone number"
          />

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="googleTermsCheckbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-[#001B40] focus:ring-[#001B40]"
            />
            <label htmlFor="googleTermsCheckbox" className="text-xs text-neutral-700 cursor-pointer">
              I agree to the{" "}
              <a href="#" className="font-semibold text-neutral-900 underline">
                Terms of Use
              </a>{" "}
              and{" "}
              <a href="#" className="font-semibold text-neutral-900 underline">
                Privacy Policy
              </a>
              .
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-1/3 h-11 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-2/3 h-11 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
