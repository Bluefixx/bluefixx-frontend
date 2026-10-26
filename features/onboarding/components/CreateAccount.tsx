"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import AuthHeroPanel from "./AuthHeroPanel";
import PhoneInput from "@/components/ui/PhoneInput";
import { toE164 } from "@/lib/utils/phone";

interface CreateAccountProps {
  onBack: () => void;
  onGoToSignIn: () => void;
  onSubmitSuccess: (userData: { fullName: string; phone: string; email: string }) => void;
}

export default function CreateAccount({
  onBack,
  onGoToSignIn,
  onSubmitSuccess,
}: CreateAccountProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg("You must agree to the Terms of Use and Privacy Policy.");
      return;
    }
    setErrorMsg(null);
    onSubmitSuccess({ fullName, phone: toE164(phone, countryCode), email });
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left Column: Full-Height Hero Artwork (Desktop only) */}
      <div className="hidden lg:block lg:w-1/2 min-h-screen">
        <AuthHeroPanel
          image="/images/talents.png"
          imageAlt="Master craftsman teaching apprentice"
          headline="Start with a profile you can trust."
          description="A verified account protects customers, artisans and apprentices — before anyone accepts a job."
          showFooterTags={true}
        />
      </div>

      {/* Right Column: Support Header + Create Account Card */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-12 bg-white">
        {/* Support Header: Logo on mobile + Contact Support */}
        <div className="w-full flex items-center justify-between lg:justify-end text-xs sm:text-sm text-neutral-600 pb-2 sm:pb-3 pt-1 sm:pt-0">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <Image
              src="/icons/BFLogoBlue.svg"
              alt="BlueFixx"
              width={26}
              height={26}
              className="w-6 h-6 object-contain"
              priority
            />
            <span className="font-heading font-bold text-base text-[#001B40] tracking-tight">
              BlueFixx
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden xs:inline">Need help?</span>
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
        <div className="w-full flex items-center justify-center my-auto py-2 sm:py-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-neutral-200/90 sm:card-shadow-mobile w-full max-w-[480px] flex flex-col">
            {/* Header Stepper Row */}
            <div className="flex items-center justify-between mb-1">
              <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
                GET STARTED
              </span>
              {/* Stepper Dots (Step 1 of 6) */}
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-1.5 bg-[#001B40] rounded-full" />
                <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                <span className="text-[10px] sm:text-xs text-neutral-500 font-medium ml-1">
                  Step 1 of 6
                </span>
              </div>
            </div>

            {/* Headline */}
            <h3 className="font-sans font-bold text-2xl sm:text-[28px] text-[#0F1115] mt-1 tracking-tight">
              Create Account
            </h3>

            {/* Subtext */}
            <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1 mb-4 leading-relaxed">
              Set up your BlueFixx account. You can choose how you use the marketplace after verification.
            </p>

            {/* Back Button */}
            <button
              onClick={onBack}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-100 border border-red-200 text-red-600 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Row 1: Full name & Phone number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col text-left">
                  <label className="font-sans font-medium text-xs text-neutral-800 mb-1">
                    Full name
                  </label>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-white border border-neutral-300 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                    />
                  </div>
                </div>

                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  countryCode={countryCode}
                  onCountryCodeChange={setCountryCode}
                  placeholder="803 245 0182"
                  label="Phone number"
                />
              </div>

              {/* Row 2: Email */}
              <div className="flex flex-col text-left">
                <label className="font-sans font-medium text-xs text-neutral-800 mb-1">
                  Email
                </label>
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-white border border-neutral-300 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                  />
                </div>
              </div>

              {/* Row 3: Password & Confirm password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col text-left">
                  <label className="font-sans font-medium text-xs text-neutral-800 mb-1">
                    Password
                  </label>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create password"
                      className="w-full bg-white border border-neutral-300 rounded-xl py-2 pl-9 pr-12 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-neutral-700 hover:text-black cursor-pointer"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col text-left">
                  <label className="font-sans font-medium text-xs text-neutral-800 mb-1">
                    Confirm password
                  </label>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-white border border-neutral-300 rounded-xl py-2 pl-9 pr-12 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-neutral-700 hover:text-black cursor-pointer"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Checkbox Terms of Use */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="termsCheckbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-[#001B40] focus:ring-[#001B40]"
                />
                <label htmlFor="termsCheckbox" className="text-xs text-neutral-700 cursor-pointer">
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

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full h-12 mt-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none"
              >
                Create Account
              </button>
            </form>

            {/* Already have an account? Log In */}
            <div className="text-center text-xs text-neutral-600 mt-4">
              <span>Already have an account? </span>
              <button
                type="button"
                onClick={onGoToSignIn}
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
