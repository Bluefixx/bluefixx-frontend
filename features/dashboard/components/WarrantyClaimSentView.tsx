"use client";

import React from "react";
import Link from "next/link";

interface WarrantyClaimSentViewProps {
  onBack?: () => void;
  onViewBooking: () => void;
  artisanName?: string;
  jobTitle?: string;
}

export default function WarrantyClaimSentView({
  onBack,
  onViewBooking,
  artisanName = "Emeka Okafor",
  jobTitle = "Bathroom Plumbing Repair",
}: WarrantyClaimSentViewProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>{jobTitle}</span>
        </button>
      </div>

      {/* Heading */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Report an issue under warranty
        </h1>
      </div>

      {/* Center Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs max-w-lg mx-auto flex flex-col items-center text-center">
        {/* Checkmark circle */}
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#001B40]">
          Warranty claim sent
        </h2>

        <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-md my-3 leading-relaxed">
          {artisanName} has been notified and will propose a return visit within 24 hours, at no extra cost. You can follow the claim from this booking.
        </p>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-6">
          <Link
            href="/messages?conversation=emeka"
            className="w-full sm:w-1/2 py-3.5 px-4 rounded-xl border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-bold text-center transition-colors cursor-pointer"
          >
            Message {artisanName.split(" ")[0]}
          </Link>

          <button
            type="button"
            onClick={onViewBooking}
            className="w-full sm:w-1/2 py-3.5 px-4 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold text-center transition-colors cursor-pointer shadow-sm"
          >
            View booking
          </button>
        </div>
      </div>
    </div>
  );
}
