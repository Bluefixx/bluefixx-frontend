"use client";

import React from "react";

interface TalentApplicationSentViewProps {
  onBack?: () => void;
  onTrackApplication?: () => void;
  onFindMore?: () => void;
  trade?: string;
  masterArtisan?: string;
  workshop?: string;
  duration?: string;
}

export function TalentApplicationSentView({
  onBack,
  onTrackApplication,
  onFindMore,
  trade = "Apprenticeship Programme",
  masterArtisan = "Master Artisan",
  workshop = "Verified Workshop",
  duration = "6 months",
}: TalentApplicationSentViewProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Apply</span>
      </button>

      {/* Page Title */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Application sent
        </h1>
      </div>

      {/* Grid: Main confirmation card (8 cols) & Program summary card (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Card */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-2xs flex flex-col items-center justify-center text-center space-y-6 min-h-[380px]">
          {/* Green Checkmark Circle */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="space-y-3 max-w-md">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115]">
              Application sent
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed">
              <span className="font-semibold text-neutral-700">{masterArtisan}</span> will review your application. You&apos;ll get a notification as soon as there is an update. Response takes about 2 days.
            </p>
          </div>
        </div>

        {/* Right Program Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="space-y-4 divide-y divide-neutral-100 text-xs sm:text-sm">
            <div className="pt-2 first:pt-0 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Trade</span>
              <span className="font-semibold text-[#0F1115] text-right">{trade}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Master Artisan</span>
              <span className="font-semibold text-[#0F1115] text-right">{masterArtisan}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Workshop</span>
              <span className="font-semibold text-[#0F1115] text-right">{workshop}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Duration</span>
              <span className="font-semibold text-[#0F1115] text-right">{duration}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={onTrackApplication}
              className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer text-center"
            >
              Track my application
            </button>

            <button
              type="button"
              onClick={onFindMore}
              className="w-full py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
            >
              Find more opportunities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
