"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthHeroPanel from "./AuthHeroPanel";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendResetCode = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!phone.trim()) {
        toast.error("Please enter your phone number.");
        return;
      }

      setIsLoading(true);
      try {
        // Mock API request to send SMS reset code
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCodeSent(true);
        toast.success(`Reset code sent to ${phone}`);
      } catch {
        toast.error("Failed to send reset code. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [phone]
  );

  const handleResetPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!resetCode.trim() || resetCode.length < 6) {
        toast.error("Please enter the 6-digit reset code.");
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        toast.error("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }

      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        toast.success("Password reset successfully! Please sign in.");
        router.push("/login");
      } catch {
        toast.error("Failed to reset password. Please check your code.");
      } finally {
        setIsLoading(false);
      }
    },
    [resetCode, newPassword, confirmPassword, router]
  );

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left Column: Hero Artwork */}
      <div className="w-full lg:w-1/2 min-h-[420px] lg:min-h-screen">
        <AuthHeroPanel
          image="/images/talents.png"
          imageAlt="Service professional with equipment"
          headline="Recover access without losing your progress."
          description="Your bookings, conversations and verification history remain protected while we help you get back in."
          showFooterTags={true}
        />
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-4 sm:p-8 lg:p-12 bg-white">
        {/* Support Header */}
        <div className="w-full flex items-center justify-end text-xs sm:text-sm text-neutral-600 pb-4">
          <div className="flex items-center gap-2">
            <span>Need help?</span>
            <button
              onClick={() => toast("Reach us at support@bluefixxllp.com", { icon: "📧" })}
              className="inline-flex items-center gap-1.5 font-medium text-[#001B40] hover:underline cursor-pointer"
            >
              <svg
                className="w-4 h-4 text-[#001B40]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
              </svg>
              <span>Contact support</span>
            </button>
          </div>
        </div>

        {/* Center Card */}
        <div className="w-full flex items-center justify-center my-auto py-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 card-shadow-mobile border border-neutral-200/90 w-full max-w-[440px] flex flex-col">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-800 hover:text-black mb-4 cursor-pointer w-fit"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>

            {/* Category Tag */}
            <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
              ACCOUNT RECOVERY
            </span>

            {/* Headline */}
            <h3 className="font-sans font-bold text-2xl sm:text-[28px] text-[#0F1115] mt-1 tracking-tight">
              Forgot Password
            </h3>

            {/* Subtext */}
            <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1.5 mb-5 leading-relaxed">
              {codeSent
                ? `Enter the 6-digit code sent to ${phone} and choose a new password.`
                : "Enter the phone number linked to your account and we'll send a secure reset code."}
            </p>

            {!codeSent ? (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                {/* Phone number field */}
                <div className="flex flex-col text-left">
                  <label className="font-sans font-medium text-xs text-neutral-800 mb-1.5">
                    Phone number
                  </label>
                  <div className="relative w-full">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 803 245 0000"
                      className="w-full bg-white border border-neutral-300 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                    />
                  </div>
                </div>

                {/* Info Callout Banner */}
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-neutral-700">
                  <svg
                    className="w-4 h-4 text-[#001B40] shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>We&apos;ll send a 6-digit code by SMS. It expires after 10 minutes.</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send reset code"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Reset code input */}
                <div className="flex flex-col text-left">
                  <label className="font-sans font-medium text-xs text-neutral-800 mb-1.5">
                    6-digit reset code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter code"
                    className="w-full bg-white border border-neutral-300 rounded-xl py-2.5 px-3.5 text-center text-lg tracking-[0.4em] font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                  />
                </div>

                {/* New password */}
                <div className="flex flex-col text-left">
                  <label className="font-sans font-medium text-xs text-neutral-800 mb-1.5">
                    New password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-white border border-neutral-300 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                  />
                </div>

                {/* Confirm new password */}
                <div className="flex flex-col text-left">
                  <label className="font-sans font-medium text-xs text-neutral-800 mb-1.5">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-white border border-neutral-300 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Resetting..." : "Reset Password & Log In"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setCodeSent(false)}
                    className="text-xs font-semibold text-[#001B40] hover:underline cursor-pointer"
                  >
                    Change phone number or resend code
                  </button>
                </div>
              </form>
            )}

            {/* Back to Log In */}
            <div className="text-center text-xs text-neutral-600 mt-5">
              <span>Remember your password? </span>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="font-bold text-[#001B40] hover:underline cursor-pointer"
              >
                Log In
              </button>
            </div>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="hidden lg:block h-4" />
      </div>
    </div>
  );
}
