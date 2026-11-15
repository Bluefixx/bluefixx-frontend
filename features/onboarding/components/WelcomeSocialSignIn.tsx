"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import AuthHeroPanel from "./AuthHeroPanel";

interface WelcomeSocialSignInProps {
  onContinueWithEmail: () => void;
  onGoToSignUp: () => void;
  onGoogleSignIn?: () => void;
  onAppleSignIn?: () => void;
  isGoogleLoading?: boolean;
}

export default function WelcomeSocialSignIn({
  onContinueWithEmail,
  onGoToSignUp,
  onGoogleSignIn,
  onAppleSignIn,
  isGoogleLoading = false,
}: WelcomeSocialSignInProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left Column: Full-Height Hero Artwork (Desktop only) */}
      <div className="hidden lg:block lg:w-1/2 min-h-screen">
        <AuthHeroPanel
          image="/images/customers.png"
          imageAlt="Verified artisan and customer"
          headline="Trusted hands for every job."
          description="Find verified artisans, agree the details before work begins, and keep everything together from quote to completion."
          showFooterTags={true}
        />
      </div>

      {/* Right Column: Support header + Centered Welcome Card */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-12 bg-white">
        {/* Support Header: Logo on mobile + Contact support */}
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
            {/* Category Tag */}
            <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
              WELCOME
            </span>

            {/* Headline */}
            <h3 className="font-sans font-bold text-2xl sm:text-[28px] text-[#0F1115] mt-1 tracking-tight">
              Welcome to BlueFixx
            </h3>

            {/* Subtext */}
            <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1.5 mb-6">
              Sign in to book trusted help, manage agreements or grow your trade career.
            </p>

            {/* Social Logins */}
            <span className="block font-sans font-medium text-xs text-neutral-500 mb-2.5">
              Continue with
            </span>

            {/* Google Button */}
            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={onGoogleSignIn || onContinueWithEmail}
              className="w-full h-12 rounded-xl border border-neutral-800 hover:bg-neutral-50 flex items-center justify-center gap-3 font-sans font-semibold text-xs sm:text-sm text-neutral-800 transition-all cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {/* Google Color G SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.24c-.25-.72-.39-1.49-.39-2.24s.14-1.52.39-2.24V6.61H1.25C.45 8.22 0 10.06 0 12s.45 3.78 1.25 5.39l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
            </button>

            {/* Apple Button */}
            <button
              onClick={onAppleSignIn || onContinueWithEmail}
              className="w-full h-12 rounded-xl border border-neutral-800 hover:bg-neutral-50 flex items-center justify-center gap-3 font-sans font-semibold text-xs sm:text-sm text-neutral-800 transition-all cursor-pointer select-none mt-2.5"
            >
              {/* Apple SVG Logo */}
              <svg className="w-4 h-4 shrink-0 fill-current text-black" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.61.7-.1.14 1.83 1.02 3.03 1.07-.08 2.14-.65 2.79-1.37z" />
              </svg>
              <span>Continue with Apple</span>
            </button>

            {/* Divider OR */}
            <div className="flex items-center my-4 sm:my-5">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="px-3 text-[11px] font-medium text-neutral-400">OR</span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            {/* Continue with Email Button */}
            <button
              onClick={onContinueWithEmail}
              className="w-full h-12 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none"
            >
              Continue with email
            </button>

            {/* Don't have an account? Sign Up */}
            <div className="text-center text-xs text-neutral-600 mt-5">
              <span>Don&apos;t have an account? </span>
              <button
                onClick={onGoToSignUp}
                className="font-bold text-[#001B40] hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </div>

            {/* Security Notice */}
            <div className="flex items-center justify-center gap-1.5 text-neutral-500 text-[11px] mt-4">
              {/* Green Shield Lock Icon */}
              <svg
                className="w-3.5 h-3.5 text-green-600 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <rect x="9" y="11" width="6" height="5" rx="1" />
              </svg>
              <span>Your details are encrypted and never shared without permission.</span>
            </div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="hidden lg:block h-4" />
      </div>
    </div>
  );
}
