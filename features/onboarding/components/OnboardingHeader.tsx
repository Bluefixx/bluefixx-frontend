"use client";

import React from "react";
import Image from "next/image";

interface OnboardingHeaderProps {
  onSkip?: () => void;
  onOpenLanguage?: () => void;
  selectedLanguageName?: string;
  showSkip?: boolean;
  showLanguagePill?: boolean;
}

export default function OnboardingHeader({
  onSkip,
  onOpenLanguage,
  selectedLanguageName = "English",
  showSkip = true,
  showLanguagePill = true,
}: OnboardingHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between py-4 px-4 sm:px-8 lg:px-12 bg-white">
      {/* Brand Logo */}
      <div className="flex items-center gap-2">
        <Image
          src="/icons/logoMain.svg"
          alt="BlueFixx Logo"
          width={100}
          height={32}
          priority
          className="h-8 sm:h-9 w-auto object-contain"
        />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4 sm:gap-6">
        {showSkip && (
          <button
            onClick={onSkip}
            className="text-neutral-600 hover:text-neutral-1000 font-sans font-medium text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <span>Skip</span>
            <span className="hidden sm:inline"> introduction</span>
          </button>
        )}

        {showLanguagePill && (
          <button
            onClick={onOpenLanguage}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-300 hover:border-neutral-400 bg-neutral-100/60 hover:bg-neutral-200/70 transition-all text-neutral-800 font-sans text-xs sm:text-sm font-medium cursor-pointer"
            aria-label="Select language"
          >
            {/* Translation Character Icon */}
            <svg
              className="w-4 h-4 text-neutral-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 8 6 6" />
              <path d="m4 14 6-6 2-3" />
              <path d="M2 5h12" />
              <path d="M7 2h1" />
              <path d="m22 22-5-10-5 10" />
              <path d="M14 18h6" />
            </svg>
            <span>{selectedLanguageName}</span>
          </button>
        )}
      </div>
    </header>
  );
}
