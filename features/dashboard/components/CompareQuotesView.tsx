"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { acceptOfferApi, getQuotesApi, getJobByIdApi } from "@/lib/api";
import { koboToNaira } from "@/lib/utils/currency";
import { generateIdempotencyKey } from "@/lib/utils/idempotency";
import { QuoteResponse, QuoteOffer } from "@/types/customer";

export interface DetailedQuote {
  id: string;
  bookingId?: string;
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
  offerStatus?: string;
  bookingFunded?: boolean;
}

type FilterType = "recommended" | "lowest-price" | "highest-rated" | "closest" | "fastest";

interface CompareQuotesViewProps {
  jobId?: string;
  jobTitle?: string;
  onBack: () => void;
  onOpenProfile: (artisanId: string) => void;
  onAcceptSuccess: (quote: DetailedQuote) => void;
  onCompletePayment?: (quote: DetailedQuote) => void;
}

function mapOfferToDetailedQuote(
  quote: QuoteResponse,
  offer: QuoteOffer,
  index: number
): DetailedQuote {
  const labourNaira = koboToNaira(offer.labour);
  const materialsNaira = (offer.materials || []).reduce(
    (sum, m) => sum + koboToNaira(m.amount),
    0
  );
  const totalNaira = koboToNaira(offer.base) || labourNaira + materialsNaira;
  const warrantyDays = offer.warrantyDays ?? (offer.warrantyMonths ? offer.warrantyMonths * 30 : 0);

  return {
    id: offer.id,
    artisanId: quote.artisanId || offer.authorId,
    artisanName: `Artisan #${(quote.artisanId || offer.authorId).slice(0, 6).toUpperCase()}`,
    avatarUrl: "/images/workers.png",
    role: "Verified Artisan",
    rating: 4.8,
    completedJobs: 0,
    distance: "Nearby",
    totalQuote: totalNaira,
    labour: labourNaira,
    materials: materialsNaira,
    duration: `${offer.durationDays || 1} day${(offer.durationDays || 1) === 1 ? "" : "s"}`,
    warranty: warrantyDays > 0 ? `${warrantyDays} days warranty` : "Standard warranty",
    isRecommended: index === 0,
    recommendedTag: index === 0 ? "RECOMMENDED · Best match" : undefined,
    workDescription: quote.description || "Service quotation submitted.",
    materialsIncluded:
      (offer.materials || []).map((m) => m.name).filter(Boolean).join(", ") || "As quoted",
    materialsNotIncluded: "Additional unforeseen repairs",
    additionalNotes: "",
    submittedAt: new Date(offer.visitStart || quote.expiresAt).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
    }),
  };
}

export default function CompareQuotesView({
  jobId,
  jobTitle = "Job Quotes",
  onBack,
  onOpenProfile,
  onAcceptSuccess,
  onCompletePayment,
}: CompareQuotesViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("recommended");
  const [loadedQuotes, setLoadedQuotes] = useState<DetailedQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modals state
  const [viewQuoteModal, setViewQuoteModal] = useState<DetailedQuote | null>(null);
  const [acceptQuoteModal, setAcceptQuoteModal] = useState<DetailedQuote | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.resolve()
      .then(() => {
        if (!mounted) return null;
        setIsLoading(true);
        setLoadError(null);
        return Promise.all([
          getQuotesApi({ view: "customer" }),
          jobId ? getJobByIdApi(jobId).catch(() => null) : Promise.resolve(null),
        ]);
      })
      .then((res) => {
        if (!mounted || !res) return;
        const [quotesRes, jobRes] = res as [QuoteResponse[], any];
        const comparisons = Array.isArray(jobRes?.comparisons) ? jobRes.comparisons : [];

        if (comparisons.length > 0) {
          const mapped: DetailedQuote[] = comparisons
            .filter(
              (c: any) =>
                c?.offer &&
                (c.offer.status === "OPEN" || c.offer.status === "ACCEPTED")
            )
            .map((c: any, idx: number) => {
              const offer = c.offer as QuoteOffer & {
                scope?: string;
                exclusions?: string;
                notes?: string;
              };
              const baseQuote = mapOfferToDetailedQuote(
                {
                  id: c.quoteId,
                  customerId: jobRes.customerId || "",
                  artisanId: c.artisan?.id || offer.authorId,
                  serviceId: jobRes.serviceId || "",
                  description: offer.scope || jobRes.description || "",
                  urgency: jobRes.urgency || "STANDARD",
                  status: c.status || "OPEN",
                  expiresAt: offer.expiresAt,
                } as QuoteResponse,
                offer,
                idx
              );
              const distanceKm =
                typeof c.artisan?.distance === "number"
                  ? `${(c.artisan.distance / 1000).toFixed(1)} km away`
                  : "Nearby";
              return {
                ...baseQuote,
                bookingId: jobRes.booking?.id,
                offerStatus: offer.status,
                bookingFunded: Boolean(jobRes.booking?.funded),
                artisanName: c.artisan?.businessName || c.artisan?.fullName || baseQuote.artisanName,
                rating: Number((c.artisan?.rating || 0).toFixed(1)),
                completedJobs: c.artisan?.completedJobs ?? 0,
                distance: distanceKm,
                workDescription: offer.scope || baseQuote.workDescription,
                materialsNotIncluded: offer.exclusions || baseQuote.materialsNotIncluded,
                additionalNotes: offer.notes || "",
              };
            });
          setLoadedQuotes(mapped);
          return;
        }

        const list = Array.isArray(quotesRes) ? quotesRes : [];
        const mapped: DetailedQuote[] = [];
        list.forEach((quote) => {
          const openOffers = (quote.offers || []).filter((o) => o.status === "OPEN");
          openOffers.forEach((offer) => {
            mapped.push(mapOfferToDetailedQuote(quote, offer, mapped.length));
          });
        });
        setLoadedQuotes(mapped);
      })
      .catch((err: unknown) => {
        if (mounted) {
          setLoadError(err instanceof Error ? err.message : "Failed to load quotes.");
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [jobId]);

  // Filtered/sorted quotes
  const quotes = [...loadedQuotes].sort((a, b) => {
    if (activeFilter === "lowest-price") return a.totalQuote - b.totalQuote;
    if (activeFilter === "highest-rated") return b.rating - a.rating;
    if (activeFilter === "closest") return parseFloat(a.distance) - parseFloat(b.distance);
    if (activeFilter === "fastest") return parseInt(a.duration, 10) - parseInt(b.duration, 10);
    return 0;
  });

  const handleOpenAcceptFromView = (quote: DetailedQuote) => {
    setViewQuoteModal(null);
    setAcceptQuoteModal(quote);
  };

  const handleConfirmAccept = async () => {
    if (!acceptQuoteModal || isAccepting) return;
    const accepted = acceptQuoteModal;
    setIsAccepting(true);

    try {
      const booking = await acceptOfferApi(accepted.id, generateIdempotencyKey());
      setAcceptQuoteModal(null);
      toast.success("Quote accepted!");
      onAcceptSuccess({ ...accepted, bookingId: booking?.id });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to accept quote.";
      toast.error(msg);
    } finally {
      setIsAccepting(false);
    }
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

      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs sm:text-sm text-red-700 font-medium">
          {loadError}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="h-80 rounded-3xl bg-white border border-neutral-200/80 animate-pulse" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-neutral-200/80 text-center space-y-2">
          <h3 className="font-heading font-bold text-base text-[#001B40]">
            No quotes received yet
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500">
            Artisans reviewing your job post will submit their quotations here.
          </p>
        </div>
      ) : (
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

                {quote.offerStatus === "ACCEPTED" ? (
                  quote.bookingFunded ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold text-center">
                      Accepted &amp; Paid
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => (onCompletePayment ? onCompletePayment(quote) : onAcceptSuccess(quote))}
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors cursor-pointer text-center shadow-2xs"
                    >
                      Complete payment
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => setAcceptQuoteModal(quote)}
                    className="w-full py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs font-semibold transition-colors cursor-pointer text-center shadow-2xs"
                  >
                    Accept
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

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
