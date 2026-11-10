"use client";

import React from "react";
import Image from "next/image";

interface TalentApplicationAcceptedDetailViewProps {
  onBack: () => void;
  onContinueToPayment: () => void;
  programmeTitle?: string;
  artisanName?: string;
  artisanTitle?: string;
  artisanAvatar?: string;
  startDate?: string;
  duration?: string;
  location?: string;
  fee?: string;
}

export function TalentApplicationAcceptedDetailView({
  onBack,
  onContinueToPayment,
  programmeTitle = "Apprenticeship Programme",
  artisanName = "Verified Master Artisan",
  artisanTitle = "Master Artisan",
  artisanAvatar,
  startDate = "Upcoming intake",
  duration = "Flexible",
  location = "Enugu",
  fee = "₦0",
}: TalentApplicationAcceptedDetailViewProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Breadcrumb Back */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>My applications</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          My applications
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 font-medium mt-0.5">
          Apprenticeship applications
        </p>
      </div>

      {/* Grid: 8 cols main content + 4 cols programme summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-9 border border-neutral-200/80 shadow-2xs space-y-7">
          {/* Top Celebration Banner */}
          <div className="text-center space-y-3 py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto text-2xl shadow-xs">
              🎉
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115]">
              Your application was accepted
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed">
              <span className="font-semibold text-neutral-700">{artisanName}</span> has offered you a place on <span className="font-semibold text-neutral-700">{programmeTitle}</span>. Pay to secure your place, training starts {startDate}.
            </p>
          </div>

          {/* Master Artisan Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/70 flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#001B40] text-white flex items-center justify-center font-heading font-bold text-sm shrink-0">
              {artisanAvatar ? (
                <Image
                  src={artisanAvatar}
                  alt={artisanName}
                  fill
                  className="object-cover"
                />
              ) : (
                <span>{artisanName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="font-sans font-bold text-sm text-[#0F1115]">
                {artisanName}
              </p>
              <p className="font-sans text-xs text-neutral-500">
                {artisanTitle}
              </p>
            </div>
          </div>

          {/* Escrow Disclaimer Notice */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs shrink-0 mt-0.5">
              🛡️
            </div>
            <p className="font-sans text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Your place is held for 72 hours.</span> Prepaid fee is safe. Bluefixx holds it in escrow and releases it to your master artisan as you reach each milestone.
            </p>
          </div>
        </div>

        {/* Right Programme Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-6">
          <h3 className="font-heading font-bold text-base text-[#0F1115]">
            Programme
          </h3>

          <div className="space-y-4 divide-y divide-neutral-100 text-xs sm:text-sm">
            <div className="pt-2 first:pt-0 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Programme</span>
              <span className="font-semibold text-[#0F1115] text-right">{programmeTitle}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Duration</span>
              <span className="font-semibold text-[#0F1115] text-right">{duration}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Location</span>
              <span className="font-semibold text-[#0F1115] text-right">{location}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Starts</span>
              <span className="font-semibold text-[#0F1115] text-right">{startDate}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Training fee</span>
              <span className="font-bold text-[#001B40] text-sm text-right">{fee}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium shrink-0">Payment structure</span>
              <span className="font-semibold text-neutral-700 text-right">Paid in full</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onContinueToPayment}
            className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer text-center"
          >
            Continue to payment
          </button>
        </div>
      </div>
    </div>
  );
}
