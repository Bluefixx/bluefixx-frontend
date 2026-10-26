"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import AuthHeroPanel from "./AuthHeroPanel";
import PhoneInput from "@/components/ui/PhoneInput";
import { toE164 } from "@/lib/utils/phone";

interface PhoneVerificationProps {
  initialPhoneNumber?: string;
  onBack: () => void;
  onSendCode: (phone: string) => void;
}

export default function PhoneVerification({
  initialPhoneNumber = "",
  onBack,
  onSendCode,
}: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [countryCode, setCountryCode] = useState("+234");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    onSendCode(toE164(phoneNumber, countryCode));
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left Column: Full-Height Hero Artwork (desktop only) */}
      <div className="hidden lg:block lg:w-1/2 min-h-screen">
        <AuthHeroPanel
          image="/images/talents.png"
          imageAlt="Master craftsman teaching apprentice"
          headline="A simple check keeps every marketplace account safer."
          description="Phone verification helps customers and professionals know they are dealing with real people."
          showFooterTags={true}
        />
      </div>

      {/* Right Column: Support Header + Phone Verification Card */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-12 bg-white">
        {/* Support Header: Brand logo on mobile + Contact support */}
        <div className="w-full flex items-center justify-between lg:justify-end text-xs sm:text-sm text-neutral-600 pb-2 sm:pb-4 pt-1 sm:pt-0">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <Image
              src="/icons/BFLogoBlue.svg"
              alt="BlueFixx"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
              priority
            />
            <span className="font-heading font-bold text-lg text-[#001B40] tracking-tight">
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
        <div className="w-full flex items-center justify-center my-auto py-2 sm:py-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-neutral-200/90 sm:card-shadow-mobile w-full max-w-[440px] flex flex-col">
            {/* Header Stepper Row (Step 2 of 6) */}
            <div className="flex items-center justify-between mb-1">
              <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
                PHONE VERIFICATION
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                <div className="w-5 h-1.5 bg-[#001B40] rounded-full" />
                <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                <span className="text-[10px] sm:text-xs text-neutral-500 font-medium ml-1">
                  Step 2 of 6
                </span>
              </div>
            </div>

            {/* Headline */}
            <h3 className="font-sans font-bold text-2xl sm:text-[28px] text-[#0F1115] mt-1 tracking-tight">
              Verify your account
            </h3>

            {/* Subtext */}
            <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1.5 mb-5 leading-relaxed">
              Enter your phone number. We&apos;ll send a one-time verification code by SMS.
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
            <form onSubmit={handleSubmit} className="space-y-5">
                <PhoneInput
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  countryCode={countryCode}
                  onCountryCodeChange={setCountryCode}
                  placeholder="803 245 0182"
                  label="Phone number"
                />

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none"
              >
                Send verification code
              </button>
            </form>

            {isSent && (
              <p className="mt-3 text-xs text-green-700 text-center font-medium">
                Verification code dispatched to {phoneNumber}.
              </p>
            )}

            {/* Rates & Privacy Disclaimer */}
            <p className="font-sans text-[11px] text-neutral-400 text-center leading-relaxed mt-5">
              Standard SMS rates may apply. We&apos;ll only use this number for account security and service updates.
            </p>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="hidden lg:block h-4" />
      </div>
    </div>
  );
}
