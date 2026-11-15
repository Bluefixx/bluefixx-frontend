"use client";

import React, { useEffect } from "react";
import { OtpChannel } from "@/types/auth";

interface OtpChannelModalProps {
  isOpen: boolean;
  email: string;
  phone: string;
  selectedChannel: OtpChannel;
  onSelectChannel: (channel: OtpChannel) => void;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function OtpChannelModal({
  isOpen,
  email,
  phone,
  selectedChannel,
  onSelectChannel,
  onConfirm,
  onClose,
  isLoading,
}: OtpChannelModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => {
        if (!isLoading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-channel-modal-title"
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-neutral-200/90 shadow-xl w-full max-w-[440px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
              VERIFY ACCOUNT
            </span>
            <h4
              id="otp-channel-modal-title"
              className="font-sans font-bold text-xl sm:text-2xl text-[#0F1115] mt-1 tracking-tight"
            >
              Where should we send your code?
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close verification method modal"
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
          Choose whether to receive your 6-digit registration OTP via email or SMS.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Email Option */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onSelectChannel("EMAIL")}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed ${
              selectedChannel === "EMAIL"
                ? "border-[#001B40] bg-blue-50/40 ring-1 ring-[#001B40]"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-[#001B40] flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedChannel === "EMAIL"
                    ? "border-[#001B40] bg-[#001B40]"
                    : "border-neutral-300"
                }`}
              >
                {selectedChannel === "EMAIL" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            <div>
              <div className="font-heading font-bold text-xs sm:text-sm text-[#0F1115]">
                Email address
              </div>
              <div className="text-[11px] text-neutral-500 truncate max-w-[165px] mt-0.5">
                {email || "Your email inbox"}
              </div>
            </div>
          </button>

          {/* Phone / SMS Option */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onSelectChannel("SMS")}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed ${
              selectedChannel === "SMS"
                ? "border-[#001B40] bg-blue-50/40 ring-1 ring-[#001B40]"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-[#001B40] flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedChannel === "SMS"
                    ? "border-[#001B40] bg-[#001B40]"
                    : "border-neutral-300"
                }`}
              >
                {selectedChannel === "SMS" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            <div>
              <div className="font-heading font-bold text-xs sm:text-sm text-[#0F1115]">
                Phone (SMS)
              </div>
              <div className="text-[11px] text-neutral-500 truncate max-w-[165px] mt-0.5">
                {phone || "Text to mobile phone"}
              </div>
            </div>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-1/3 h-11 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-2/3 h-11 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-25"
                  />
                  <path
                    d="M4 12a8 8 0 018-8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-75"
                  />
                </svg>
                Sending code...
              </span>
            ) : selectedChannel === "EMAIL" ? (
              "Send code via Email"
            ) : (
              "Send code via SMS"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
