"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { acceptOfferApi } from "@/lib/api";

export interface DetailedQuote {
  id: string;
  artisanId: string;
  artisanName: string;
  avatarUrl: string;
  role: string;
  rating: number;
  completedJobs: number;
  distance: string;
  totalQuote: number;
  labour: number;
  materials: number;
  duration: string;
  warranty: string;
  isRecommended?: boolean;
  recommendedTag?: string;
  workDescription: string;
  materialsIncluded: string;
  materialsNotIncluded: string;
  additionalNotes: string;
  submittedAt: string;
}

export const DETAILED_QUOTES: DetailedQuote[] = [
  {
    id: "q-1",
    artisanId: "emeka-okafor",
    artisanName: "Emeka Okafor",
    avatarUrl: "/images/david.jpg",
    role: "Verified Plumber",
    rating: 4.9,
    completedJobs: 126,
    distance: "2.4km",
    totalQuote: 120000,
    labour: 80000,
    materials: 40000,
    duration: "2 days",
    warranty: "30 days warranty",
    isRecommended: true,
    recommendedTag: "RECOMMENDED · Highest rating and closest to you",
    workDescription:
      "Isolate the water supply, open the basin wall access, replace the corroded joint and 1.2m of pipe, pressure-test the line and re-seal the wall.",
    materialsIncluded:
      "1.2m PPR pipe, elbow joints, thread tape, sealant, replacement tap connector.",
    materialsNotIncluded: "Wall tiles if the damp section has to be re-tiled.",
    additionalNotes:
      "I will send photos of the damaged section before I replace anything.",
    submittedAt: "Aug 22 · 9:28 AM",
  },
  {
    id: "q-2",
    artisanId: "chidi-nwosu",
    artisanName: "Chidi Nwosu",
    avatarUrl: "/images/james.jpg",
    role: "Verified Plumbing & Generator Technician",
    rating: 4.6,
    completedJobs: 210,
    distance: "4.1km",
    totalQuote: 135000,
    labour: 90000,
    materials: 45000,
    duration: "1 day",
    warranty: "60 days warranty",
    workDescription:
      "Full replacement of corroded line with high-gauge brass connector and immediate pressure test.",
    materialsIncluded:
      "High-grade copper pipe sections, brass fittings, Teflon thread sealant.",
    materialsNotIncluded: "Cosmetic plaster work.",
    additionalNotes: "Arriving in Bluefixx service gear with full testing kit.",
    submittedAt: "Aug 22 · 10:14 AM",
  },
  {
    id: "q-3",
    artisanId: "blessing-nwankwo",
    artisanName: "Blessing Nwankwo",
    avatarUrl: "/images/sarah.jpg",
    role: "Verified Plumber & Tiler",
    rating: 4.7,
    completedJobs: 74,
    distance: "3.8km",
    totalQuote: 87000,
    labour: 55000,
    materials: 32000,
    duration: "3 days",
    warranty: "14 days warranty",
    workDescription:
      "Clean access removal, joint soldering, replacement piping and water line pressure test.",
    materialsIncluded: "PPR pipes and standard joinery.",
    materialsNotIncluded: "Wall re-tiling if required.",
    additionalNotes: "Can work over the weekend if needed.",
    submittedAt: "Aug 22 · 10:45 AM",
  },
];

type FilterType = "recommended" | "lowest-price" | "highest-rated" | "closest" | "fastest";

interface CompareQuotesViewProps {
  jobTitle?: string;
  onBack: () => void;
  onOpenProfile: (artisanId: string) => void;
  onAcceptSuccess: (quote: DetailedQuote) => void;
}

export default function CompareQuotesView({
  jobTitle = "Bathroom Plumbing Repair",
  onBack,
  onOpenProfile,
  onAcceptSuccess,
}: CompareQuotesViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("recommended");

  // Modals state
  const [viewQuoteModal, setViewQuoteModal] = useState<DetailedQuote | null>(null);
  const [acceptQuoteModal, setAcceptQuoteModal] = useState<DetailedQuote | null>(null);

  // Filtered/sorted quotes
  const quotes = [...DETAILED_QUOTES].sort((a, b) => {
    if (activeFilter === "lowest-price") return a.totalQuote - b.totalQuote;
    if (activeFilter === "highest-rated") return b.rating - a.rating;
    if (activeFilter === "closest") return parseFloat(a.distance) - parseFloat(b.distance);
    if (activeFilter === "fastest") return parseInt(a.duration) - parseInt(b.duration);
    return 0; // "recommended" keeps default
  });

  const handleOpenAcceptFromView = (quote: DetailedQuote) => {
    setViewQuoteModal(null);
    setAcceptQuoteModal(quote);
  };

  const handleConfirmAccept = async () => {
    if (!acceptQuoteModal) return;
    const accepted = acceptQuoteModal;
    setAcceptQuoteModal(null);

    try {
      await acceptOfferApi(accepted.id, `accept-${Date.now()}`);
    } catch {
      // Graceful fallback for mock mode
    }

    onAcceptSuccess(accepted);
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Navigation */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>My jobs</span>
        </button>

        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight mt-3">
          Quotes for your job
        </h1>
        <p className="font-sans text-xs text-neutral-400 mt-0.5">
          {jobTitle}
        </p>

        <p className="font-sans text-xs text-neutral-500 mt-3 max-w-2xl leading-relaxed">
          Compare professionals before choosing who to hire. Price is only one factor, rating, experience and warranty matter just as much.
        </p>
      </div>

      {/* 7-day Bluefixx Warranty Banner (Matching media_1792437256603.png) */}
      <div className="bg-[#EBF7F0] border border-[#C6EBD3] rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <div className="text-xs">
          <h4 className="font-sans font-bold text-emerald-900">
            7-day Bluefixx warranty
          </h4>
          <p className="text-neutral-600 mt-0.5">
            Every job includes at least 7 days. Some artisans offer longer, shown on each quote.
          </p>
        </div>
      </div>

      {/* Filter Tabs / Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveFilter("recommended")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === "recommended"
              ? "bg-[#001B40] text-white shadow-2xs"
              : "text-blue-600 hover:text-blue-800 hover:bg-neutral-100"
          }`}
        >
          Recommended
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("lowest-price")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === "lowest-price"
              ? "bg-[#001B40] text-white shadow-2xs"
              : "text-blue-600 hover:text-blue-800 hover:bg-neutral-100"
          }`}
        >
          Lowest price
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("highest-rated")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === "highest-rated"
              ? "bg-[#001B40] text-white shadow-2xs"
              : "text-blue-600 hover:text-blue-800 hover:bg-neutral-100"
          }`}
        >
          Highest rated
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("closest")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === "closest"
              ? "bg-[#001B40] text-white shadow-2xs"
              : "text-blue-600 hover:text-blue-800 hover:bg-neutral-100"
          }`}
        >
          Closest
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("fastest")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === "fastest"
              ? "bg-[#001B40] text-white shadow-2xs"
              : "text-blue-600 hover:text-blue-800 hover:bg-neutral-100"
          }`}
        >
          Fastest
        </button>
      </div>

      {/* 3 Quote Cards Grid (Matching media_1792437256603.png) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {quotes.map((quote) => {
          const isRecommended = quote.isRecommended && activeFilter === "recommended";

          return (
            <div
              key={quote.id}
              className={`bg-white rounded-3xl overflow-hidden shadow-2xs flex flex-col justify-between transition-all ${
                isRecommended
                  ? "border-2 border-blue-500 ring-2 ring-blue-100/50"
                  : "border border-neutral-200/80 hover:border-neutral-300"
              }`}
            >
              <div>
                {/* Optional Top Recommended Banner */}
                {isRecommended ? (
                  <div className="bg-[#001B40] text-white px-4 py-2 text-[11px] font-bold tracking-tight text-center">
                    {quote.recommendedTag}
                  </div>
                ) : (
                  <div className="px-5 pt-4 pb-1 text-[11px] text-neutral-400 font-medium">
                    Verified professional
                  </div>
                )}

                {/* Artisan Info */}
                <div className="p-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-neutral-100 relative shrink-0">
                      <Image
                        src={quote.avatarUrl}
                        alt={quote.artisanName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-heading font-bold text-sm text-[#0F1115]">
                          {quote.artisanName}
                        </h3>
                        {/* Blue checkmark badge */}
                        <svg className="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="font-sans text-[11px] text-neutral-400">
                        {quote.role}
                      </p>
                      <p className="font-sans text-[11px] text-neutral-500 mt-0.5">
                        <span className="text-amber-500 font-semibold">★ {quote.rating}</span>
                        <span> · {quote.completedJobs} jobs</span>
                        {quote.distance && <span> · {quote.distance}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Gray Quote Breakdown Box */}
                  <div className="bg-neutral-50/80 rounded-2xl p-4 mt-4 border border-neutral-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-medium">Quote</span>
                      <span className="font-sans font-bold text-base text-[#0F1115]">
                        ₦{quote.totalQuote.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-neutral-500">
                      <span>Labour</span>
                      <span className="font-medium text-neutral-800">
                        ₦{quote.labour.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-neutral-500">
                      <span>Materials</span>
                      <span className="font-medium text-neutral-800">
                        ₦{quote.materials.toLocaleString()}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-neutral-200/60 text-[11px] text-neutral-400 font-medium">
                      {quote.duration} · {quote.warranty}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenProfile(quote.artisanId)}
                    className="py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer text-center"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewQuoteModal(quote)}
                    className="py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer text-center"
                  >
                    View Quote
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setAcceptQuoteModal(quote)}
                  className="w-full py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs font-semibold transition-colors cursor-pointer text-center shadow-2xs"
                >
                  Accept
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Assurance Tip */}
      <div className="bg-[#EDF5FF] border border-[#CDE0FF] rounded-2xl p-4 flex items-center gap-3 text-xs text-[#002D62] shadow-2xs">
        <svg className="w-5 h-5 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
        <span>
          Accepting a quote does not charge you. You review the full payment breakdown before anything is paid.
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* MODAL 1: QUOTE DETAIL DIALOG (Matching media_1792437315267)*/}
      {/* ══════════════════════════════════════════════════════════ */}
      {viewQuoteModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={() => setViewQuoteModal(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Title & Subtitle */}
            <div>
              <h3 className="font-heading font-bold text-lg text-[#0F1115]">
                {viewQuoteModal.artisanName}&apos;s quote
              </h3>
              <p className="font-sans text-xs text-neutral-400 mt-0.5">
                {jobTitle}
              </p>
            </div>

            {/* Gray Quote Total Box */}
            <div className="bg-neutral-50/80 rounded-2xl p-4 sm:p-5 border border-neutral-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-600">
                <span>Labour</span>
                <span className="font-semibold text-neutral-900">
                  ₦{viewQuoteModal.labour.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-neutral-600">
                <span>Materials</span>
                <span className="font-semibold text-neutral-900">
                  ₦{viewQuoteModal.materials.toLocaleString()}
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-neutral-500 font-medium">Quote total</span>
                <span className="font-sans font-bold text-lg sm:text-xl text-[#0F1115]">
                  ₦{viewQuoteModal.totalQuote.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Scope & Details */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <span className="font-bold text-neutral-700 block mb-1">
                  Work description
                </span>
                <p className="text-neutral-500">
                  {viewQuoteModal.workDescription}
                </p>
              </div>

              <div>
                <span className="font-bold text-neutral-700 block mb-1">
                  Materials included
                </span>
                <p className="text-neutral-500">
                  {viewQuoteModal.materialsIncluded}
                </p>
              </div>

              <div>
                <span className="font-bold text-neutral-700 block mb-1">
                  Materials not included
                </span>
                <p className="text-neutral-500">
                  {viewQuoteModal.materialsNotIncluded}
                </p>
              </div>

              <div>
                <span className="font-bold text-neutral-700 block mb-1">
                  Additional notes
                </span>
                <p className="text-neutral-500">
                  {viewQuoteModal.additionalNotes}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                <div>
                  <span className="text-neutral-400 block text-[11px]">Estimated completion</span>
                  <span className="font-bold text-neutral-800 text-xs">
                    {viewQuoteModal.duration}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Warranty</span>
                  <span className="font-bold text-neutral-800 text-xs">
                    {viewQuoteModal.warranty}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400 pt-1">
                Submitted: {viewQuoteModal.submittedAt}
              </p>
            </div>

            {/* Action button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleOpenAcceptFromView(viewQuoteModal)}
                className="w-full py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs font-semibold transition-colors cursor-pointer text-center shadow-2xs"
              >
                Accept Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* MODAL 2: ACCEPT QUOTE DIALOG (Matching media_1792437355974)*/}
      {/* ══════════════════════════════════════════════════════════ */}
      {acceptQuoteModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150 space-y-4 text-center">
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={() => setAcceptQuoteModal(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
                Accept {acceptQuoteModal.artisanName.split(" ")[0]}&apos;s quote?
              </h3>
              <p className="font-sans text-xs text-neutral-500 mt-2 leading-relaxed max-w-xs mx-auto">
                Once accepted, you&apos;ll proceed to payment. Nothing is charged until you complete that step.
              </p>
            </div>

            {/* Blue Amount Card */}
            <div className="bg-[#EDF5FF] rounded-2xl p-5 border border-[#CDE0FF]/60 space-y-1">
              <span className="font-sans font-bold text-2xl text-[#0F1115] block">
                ₦{acceptQuoteModal.totalQuote.toLocaleString()}
              </span>
              <span className="font-sans text-xs text-neutral-500 font-medium">
                {acceptQuoteModal.duration} · {acceptQuoteModal.warranty}
              </span>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmAccept}
                className="w-full py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs font-semibold transition-colors cursor-pointer text-center shadow-2xs"
              >
                Continue
              </button>

              <button
                type="button"
                onClick={() => setAcceptQuoteModal(null)}
                className="w-full py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
