"use client";

import React, { useEffect } from "react";
import Image from "next/image";

interface SplashScreenProps {
  onComplete?: () => void;
  autoAdvance?: boolean;
  durationMs?: number;
}

export default function SplashScreen({
  onComplete,
  autoAdvance = true,
  durationMs = 2600,
}: SplashScreenProps) {
  useEffect(() => {
    if (!autoAdvance || !onComplete) return;
    const timer = setTimeout(() => {
      onComplete();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [autoAdvance, durationMs, onComplete]);

  return (
    <div className="relative min-h-screen w-full bg-[#001B40] text-white flex flex-col justify-between p-6 sm:p-10 md:p-12 overflow-hidden select-none">
      {/* Decorative Brand Curves in Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-no-repeat bg-left-top"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 45%, #074292 0%, transparent 55%), radial-gradient(circle at 85% 20%, #1A75D6 0%, transparent 40%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -left-32 top-1/4 w-[600px] h-[600px] rounded-full border border-white/5 pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Left Label */}
      <header className="relative z-10">
        <span className="font-sans font-semibold tracking-[0.2em] text-[11px] sm:text-[12px] text-white/80 uppercase">
          BLUEFIXX MARKETPLACE
        </span>
      </header>

      {/* Center Content */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center my-auto px-4">
        {/* White Logo */}
        <div className="relative flex flex-col items-center">
          <Image
            src="/icons/BFLogoW.svg"
            alt="BlueFixx Logo"
            width={72}
            height={72}
            priority
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-sm"
          />
        </div>

        {/* Headline & Subtitle */}
        <h1 className="mt-8 font-sans font-bold text-2xl sm:text-3xl md:text-[34px] leading-tight text-white max-w-lg">
          Trusted Hands for Every Job.
        </h1>
        <p className="mt-2.5 font-sans font-normal text-sm sm:text-base text-neutral-300 max-w-md">
          Preparing your trusted service marketplace
        </p>

        {/* Circular Spinner */}
        <div className="mt-8 flex items-center justify-center">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[2.5px] border-white/20 border-t-white animate-spin"
            role="status"
            aria-label="Loading marketplace"
          />
        </div>

        {/* Optional Skip button for fast preview */}
        {onComplete && (
          <button
            onClick={onComplete}
            className="mt-6 text-xs text-white/50 hover:text-white transition-colors cursor-pointer underline underline-offset-4"
          >
            Skip loading &rarr;
          </button>
        )}
      </main>

      {/* Bottom Footer Note */}
      <footer className="relative z-10 text-center pb-2">
        <p className="font-sans text-xs sm:text-[13px] text-neutral-400 tracking-wide">
          Verified artisans &bull; Protected terms &bull; Clear support
        </p>
      </footer>
    </div>
  );
}
