"use client";

import React, { useState } from "react";
import AuthHeroPanel from "./AuthHeroPanel";

interface EmailSignInProps {
  onBack: () => void;
  onGoToSignUp: () => void;
  onSuccess?: () => void;
}

export default function EmailSignIn({
  onBack,
  onGoToSignUp,
  onSuccess,
}: EmailSignInProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    if (!val || !val.includes("@") || !val.includes(".")) {
      return "Enter a valid email address, for example name@email.com.";
    }
    return null;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError(null);
    if (onSuccess) {
      onSuccess();
    } else {
      alert("Signed in successfully!");
    }
  };

  const isErrorState = Boolean(hasSubmitted && emailError);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left Column: Full-Height Hero Artwork */}
      <div className="w-full lg:w-1/2 min-h-[420px] lg:min-h-screen">
        <AuthHeroPanel
          image="/images/workers.png"
          imageAlt="Professional service technician"
          headline={
            isErrorState
              ? "Secure access without the guesswork."
              : "Your bookings, messages and protected terms — all together."
          }
          description={
            isErrorState
              ? "Clear validation helps protect your account and gets you back to your bookings faster."
              : "Return to the work that matters with secure access to every quote, booking and conversation."
          }
          showFooterTags={true}
        />
      </div>

      {/* Right Column: Support Header + Sign-In Form Card */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-4 sm:p-8 lg:p-12 bg-white">
        {/* Support Header */}
        <div className="w-full flex items-center justify-end text-xs sm:text-sm text-neutral-600 pb-4">
          <div className="flex items-center gap-2">
            <span>Need help?</span>
            <button
              onClick={() => alert("Support: support@bluefixxllp.com")}
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
            {/* Category Tag */}
            <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
              SIGN IN
            </span>

            {/* Headline */}
            <h3 className="font-sans font-bold text-2xl sm:text-[28px] text-[#0F1115] mt-1 tracking-tight">
              Welcome to BlueFixx
            </h3>

            {/* Subtext */}
            <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1.5 mb-5">
              {isErrorState
                ? "Check the highlighted field before continuing."
                : "Enter your details below to securely access your account."}
            </p>

            {/* Back Button */}
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-800 hover:text-black mb-5 cursor-pointer w-fit"
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

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div className="flex flex-col text-left">
                <label className="font-sans font-medium text-xs text-neutral-800 mb-1.5">
                  Email
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
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (hasSubmitted) {
                        setEmailError(validateEmail(e.target.value));
                      }
                    }}
                    placeholder="Enter your email address"
                    className={`w-full bg-white rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-colors ${
                      emailError
                        ? "border border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border border-neutral-300 focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="mt-1.5 text-[11px] text-red-500 font-medium flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="flex flex-col text-left">
                <label className="font-sans font-medium text-xs text-neutral-800 mb-1.5">
                  Password
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
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-white border border-neutral-300 rounded-xl py-2.5 pl-10 pr-14 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-700 hover:text-black cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                {isErrorState ? (
                  <span className="text-red-500 font-medium">1 field needs attention</span>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-neutral-300 text-[#001B40] focus:ring-[#001B40]"
                    />
                    <span>Remember me</span>
                  </label>
                )}

                <button
                  type="button"
                  onClick={() => alert("Password reset link sent to support.")}
                  className="font-semibold text-[#001B40] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-12 mt-2 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none"
              >
                Log In
              </button>
            </form>

            {/* Don't have an account? Sign Up */}
            <div className="text-center text-xs text-neutral-600 mt-5">
              <span>Don&apos;t have an account? </span>
              <button
                type="button"
                onClick={onGoToSignUp}
                className="font-bold text-[#001B40] hover:underline cursor-pointer"
              >
                Sign Up
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
