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
  durationMs = 2800,
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
      {/* Exact Brand Swoop Pattern on Left matching Figma Design */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMinYMid slice"
        aria-hidden="true"
      >
        {/* Taller diagonal curved fin */}
        <path
          d="M-100 950 C -40 700 80 400 280 180 C 330 120 380 110 410 160 C 440 210 400 320 300 500 C 180 720 50 880 -10 980 Z"
          fill="#072B59"
          fillOpacity="0.8"
        />
        {/* Second lower overlapping curved fin */}
        <path
          d="M-80 980 C 20 800 140 600 320 380 C 360 330 410 330 430 380 C 450 430 400 560 280 760 C 180 920 60 990 0 1020 Z"
          fill="#0A366E"
          fillOpacity="0.7"
        />
        {/* Soft background glow */}
        <circle cx="200" cy="500" r="400" fill="#00357A" fillOpacity="0.15" />
      </svg>

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

        {/* Quick Skip button for review */}
        {onComplete && (
          <button
            onClick={onComplete}
            className="mt-6 text-xs text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            Click to skip &rarr;
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
