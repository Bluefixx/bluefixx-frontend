"use client";

import React from "react";
import Image from "next/image";

interface AuthHeroPanelProps {
  image: string;
  imageAlt: string;
  headline: string;
  description: string;
  badgeLabel?: string;
  showFooterTags?: boolean;
}

export default function AuthHeroPanel({
  image,
  imageAlt,
  headline,
  description,
  badgeLabel = "VERIFIED SERVICE MARKETPLACE",
  showFooterTags = true,
}: AuthHeroPanelProps) {
  return (
    <div className="relative min-h-[420px] lg:min-h-screen lg:h-full w-full bg-[#00132B] flex flex-col justify-between p-6 sm:p-10 lg:p-12 select-none overflow-hidden">
      {/* Background Illustration covering 100% height to top */}
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover object-center"
      />

      {/* Dark Gradient Overlay for text legibility */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#00132B] via-[#001B40]/40 to-transparent"
        aria-hidden="true"
      />

      {/* Top Left: White BlueFixx Logo pinned directly on top of image */}
      <div className="relative z-10 flex items-center gap-3">
        <Image
          src="/icons/BFLogoW.svg"
          alt="BlueFixx Logo"
          width={96}
          height={32}
          priority
          className="h-8 sm:h-9 w-auto object-contain"
        />
      </div>

      {/* Bottom Content Narrative */}
      <div className="relative z-10 max-w-lg mt-auto pt-16">
        {/* Verified Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white mb-4">
          <svg
            className="w-3.5 h-3.5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span className="font-sans font-bold text-[10px] sm:text-[11px] tracking-wider uppercase">
            {badgeLabel}
          </span>
        </div>

        {/* Big Bold Headline */}
        <h2 className="font-sans font-bold text-2xl sm:text-3xl lg:text-[34px] leading-tight text-white tracking-tight mb-3">
          {headline}
        </h2>

        {/* Narrative Description */}
        <p className="font-sans text-xs sm:text-sm text-neutral-200 leading-relaxed max-w-md">
          {description}
        </p>

        {/* Bottom Verification Badges */}
        {showFooterTags && (
          <div className="flex items-center gap-3 text-[11px] sm:text-xs text-neutral-300 font-medium pt-5">
            <span>Identity checked</span>
            <span className="text-neutral-400">&bull;</span>
            <span>Terms protected</span>
          </div>
        )}
      </div>
    </div>
  );
}
