"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CompareQuotesView, { DetailedQuote, DETAILED_QUOTES } from "./CompareQuotesView";
import QuoteAcceptedView from "./QuoteAcceptedView";
import ArtisanPublicProfileView from "./ArtisanPublicProfileView";

export type JobStatus = "receiving-quotes" | "no-quotes-yet" | "expired" | "cancelled";
export type JobSubView = "details" | "compare" | "accepted" | "artisan-profile";

export interface ArtisanQuote {
  id: string;
  artisanName: string;
  rating: number;
  completedJobs: number;
  price: number;
  duration: string;
  avatarUrl: string;
}

export interface PostedJob {
  id: string;
  title: string;
  category: string;
  service: string;
  location: string;
  date: string;
  time: string;
  budget: string;
  urgency: string;
  updatedAt: string;
  status: JobStatus;
  matchedProfessionals: number;
  quotesReceived: number;
  isAccessible: boolean;
  someoneOnSite: boolean;
  photos: { url: string; caption: string }[];
  quotes: ArtisanQuote[];
}

const INITIAL_POSTED_JOBS: PostedJob[] = [
  {
    id: "BFX-20541",
    title: "Bathroom Plumbing Repair",
    category: "Home & Construction",
    service: "Plumbing → Leak repair",
    location: "14 Ogui Road, Independence Layout, Enugu",
    date: "Tomorrow · Sat 23 Aug",
    time: "Morning · 8am – 12pm",
    budget: "₦100,000+",
    urgency: "Soon",
    updatedAt: "Today · 11:04",
    status: "receiving-quotes",
    matchedProfessionals: 12,
    quotesReceived: 3,
    isAccessible: false,
    someoneOnSite: true,
    photos: [
      { url: "/images/customers.png", caption: "Damp patch near the basin" },
      { url: "/images/workers.png", caption: "Pipe joint underneath" },
    ],
    quotes: [
      {
        id: "q-1",
        artisanName: "Emeka Okafor",
        rating: 4.9,
        completedJobs: 126,
        price: 120000,
        duration: "2 days",
        avatarUrl: "/images/david.jpg",
      },
      {
        id: "q-2",
        artisanName: "Blessing Nwankwo",
        rating: 4.7,
        completedJobs: 74,
        price: 87000,
        duration: "3 days",
        avatarUrl: "/images/sarah.jpg",
      },
      {
        id: "q-3",
        artisanName: "Chidi Nweze",
        rating: 4.6,
        completedJobs: 210,
        price: 135000,
        duration: "1 day",
        avatarUrl: "/images/james.jpg",
      },
    ],
  },
  {
    id: "BFX-20419",
    title: "Kitchen Sink Pipe & Valve Repair",
    category: "Home & Construction",
    service: "Plumbing → Pipe repair",
    location: "Plot 8, Bisalla Road, Independence Layout, Enugu",
    date: "This week",
    time: "Afternoon · 12pm – 4pm",
    budget: "₦35,000 - ₦50,000",
    urgency: "Flexible",
    updatedAt: "Today · 09:15",
    status: "no-quotes-yet",
    matchedProfessionals: 3,
    quotesReceived: 0,
    isAccessible: true,
    someoneOnSite: true,
    photos: [
      { url: "/images/hero-mobile.jpg", caption: "Kitchen under-counter valve" },
    ],
    quotes: [],
  },
  {
    id: "BFX-19802",
    title: "Water Heater Circuit Diagnostic",
    category: "Home & Construction",
    service: "Electrical → Wiring & breaker",
    location: "14 Ogui Road, Independence Layout, Enugu",
    date: "Ended 2 days ago",
    time: "Flexible",
    budget: "₦20,000",
    urgency: "Flexible",
    updatedAt: "14 days ago",
    status: "expired",
    matchedProfessionals: 8,
    quotesReceived: 2,
    isAccessible: true,
    someoneOnSite: true,
    photos: [],
    quotes: [],
  },
];

const CANCELLATION_REASONS = [
  "Found an artisan outside Bluefixx",
  "Problem resolved / No longer needed",
  "Quotes received are higher than budget",
  "Need to make edits and repost",
  "Artisans took too long to respond",
  "Other reason",
];

export default function JobPostingsView() {
  const router = useRouter();

  // Job data state
  const [jobs, setJobs] = useState<PostedJob[]>(INITIAL_POSTED_JOBS);
  const [selectedJobId, setSelectedJobId] = useState<string | null>("BFX-20541");

  // Navigation subviews
  const [currentSubView, setCurrentSubView] = useState<JobSubView>("details");
  const [activeArtisanId, setActiveArtisanId] = useState<string>("emeka-okafor");
  const [acceptedQuote, setAcceptedQuote] = useState<DetailedQuote | null>(null);

  // Cancellation modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReasonPreset, setCancelReasonPreset] = useState(CANCELLATION_REASONS[0]);
  const [cancelReasonText, setCancelReasonText] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Active selected job
  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  // Perform cancellation
  const handleConfirmCancel = () => {
    if (!selectedJob) return;
    setIsCancelling(true);
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === selectedJob.id ? { ...j, status: "cancelled" } : j
        )
      );
      setIsCancelling(false);
      setIsCancelModalOpen(false);
      toast.success(
        `Job post ${selectedJob.id} cancelled. Reason: ${cancelReasonPreset}${
          cancelReasonText ? ` ("${cancelReasonText}")` : ""
        }`,
        { duration: 4000 }
      );
    }, 600);
  };

  // ══════════════════════════════════════════════════════════
  // SUBVIEW A: COMPARE QUOTES (Matching media_1792437256603)
  // ══════════════════════════════════════════════════════════
  if (currentSubView === "compare" && selectedJob) {
    return (
      <CompareQuotesView
        jobTitle={selectedJob.title}
        onBack={() => setCurrentSubView("details")}
        onOpenProfile={(artisanId) => {
          setActiveArtisanId(artisanId);
          setCurrentSubView("artisan-profile");
        }}
        onAcceptSuccess={(quote) => {
          setAcceptedQuote(quote);
          setCurrentSubView("accepted");
        }}
      />
    );
  }

  // ══════════════════════════════════════════════════════════
  // SUBVIEW B: QUOTE ACCEPTED (Matching media_1792437409407)
  // ══════════════════════════════════════════════════════════
  if (currentSubView === "accepted" && selectedJob) {
    return (
      <QuoteAcceptedView
        jobTitle={selectedJob.title}
        customerName="Daniel C."
        quoteAmount={acceptedQuote?.totalQuote || 120000}
        submittedTime="Today · 11:37"
        estimatedCompletion={acceptedQuote?.duration || "1 week"}
        warranty={acceptedQuote?.warranty || "30 days"}
        onBack={() => setCurrentSubView("compare")}
        onViewJob={() => setCurrentSubView("details")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════
  // SUBVIEW C: ARTISAN PUBLIC PROFILE (Matching media_1792437458303)
  // ══════════════════════════════════════════════════════════
  if (currentSubView === "artisan-profile") {
    return (
      <ArtisanPublicProfileView
        artisanId={activeArtisanId}
        onBack={() => setCurrentSubView("compare")}
        onContinue={() => setCurrentSubView("compare")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════
  // VIEW 1: EMPTY STATE (Matching media_1792270117606.png)
  // ══════════════════════════════════════════════════════════
  if (jobs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
            My bookings
          </h1>
        </div>

        {/* Empty State Card */}
        <div className="pt-10 pb-16 flex justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 border border-neutral-100 shadow-xs text-center space-y-4">
            {/* Calendar Icon */}
            <div className="w-14 h-14 rounded-full bg-[#EBF1F7] flex items-center justify-center mx-auto text-[#001B40]">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>

            <div>
              <h2 className="font-heading font-bold text-lg text-[#0F1115]">
                No bookings yet
              </h2>
              <p className="font-sans text-xs text-neutral-500 mt-2 leading-relaxed max-w-xs mx-auto">
                Post a job to get quotes from verified artisans near you. Your bookings and warranties will appear here.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/post-job"
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-semibold text-xs tracking-wide transition-colors shadow-2xs"
              >
                + Post a job
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // VIEW 2: POSTED JOBS LIST (The Missing Screen from user)
  // When no specific job is selected or user clicks "All Posted Jobs"
  // ══════════════════════════════════════════════════════════
  if (!selectedJobId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
              My bookings
            </h1>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
              Active job posts waiting for quotes or ongoing reviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/post-job"
              className="px-4 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-semibold text-xs transition-colors shadow-2xs inline-flex items-center gap-1.5"
            >
              <span>+</span> Post a job
            </Link>
          </div>
        </div>

        {/* List of Posted Jobs */}
        <div className="space-y-4">
          {jobs.map((job) => {
            const isReceiving = job.status === "receiving-quotes";
            const isNoQuotes = job.status === "no-quotes-yet";
            const isExpired = job.status === "expired";
            const isCancelled = job.status === "cancelled";

            return (
              <div
                key={job.id}
                onClick={() => {
                  setSelectedJobId(job.id);
                  setCurrentSubView("details");
                }}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs hover:border-[#001B40]/30 hover:shadow-xs transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded uppercase">
                      {job.category}
                    </span>

                    {/* Status Badges */}
                    {isReceiving && (
                      <span className="text-[11px] font-semibold text-[#0254D8] bg-[#EBF3FF] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0254D8] animate-pulse" />
                        Receiving quotes ({job.quotesReceived})
                      </span>
                    )}

                    {isNoQuotes && (
                      <span className="text-[11px] font-semibold text-[#C2410C] bg-[#FFF7ED] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]" />
                        No quotes yet
                      </span>
                    )}

                    {isExpired && (
                      <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        Expired
                      </span>
                    )}

                    {isCancelled && (
                      <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Cancelled
                      </span>
                    )}

                    <span className="text-xs text-neutral-400">
                      {job.id} · Updated {job.updatedAt}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-[#0F1115]">
                    {job.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {job.location}
                    </span>
                    <span>·</span>
                    <span>Budget: <strong className="text-neutral-800">{job.budget}</strong></span>
                    <span>·</span>
                    <span>Service: {job.service}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100">
                  <div className="text-left md:text-right pr-2">
                    <span className="block font-sans font-bold text-base text-[#001B40]">
                      {job.quotesReceived} {job.quotesReceived === 1 ? "quote" : "quotes"}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {job.matchedProfessionals} matched
                    </span>
                  </div>

                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-[#001B40] text-white text-xs font-semibold hover:bg-[#052F5F] transition-colors"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // VIEW 3: JOB DETAILS (Screenshots 2, 3, 4, 5)
  // Clean production UI without debug/review actions bar
  // ══════════════════════════════════════════════════════════
  const isReceiving = selectedJob.status === "receiving-quotes";
  const isNoQuotes = selectedJob.status === "no-quotes-yet";
  const isExpired = selectedJob.status === "expired";
  const isCancelled = selectedJob.status === "cancelled";

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Breadcrumb & Main Header */}
      <div>
        <div className="flex items-center gap-1 text-xs text-neutral-500 font-medium">
          <button
            type="button"
            onClick={() => setSelectedJobId(null)}
            className="hover:text-neutral-800 cursor-pointer"
          >
            Bookings
          </button>
          <span>/</span>
          <span className="text-neutral-800">Job posting</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
            {selectedJob.title}
          </h1>

          {/* Status Badge Top Right */}
          <div>
            {isReceiving && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0254D8] bg-[#EBF3FF] px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0254D8]" />
                Receiving Quotes
              </span>
            )}
            {isNoQuotes && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C2410C] bg-[#FFF7ED] px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]" />
                No Quotes Yet
              </span>
            )}
            {isExpired && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                Expired
              </span>
            )}
            {isCancelled && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Cancelled
              </span>
            )}
          </div>
        </div>

        <p className="font-sans text-xs text-neutral-400 mt-1">
          {selectedJob.id} · Updated {selectedJob.updatedAt}
        </p>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* STATE BANNERS (For No Quotes Yet & Expired)                  */}
      {/* ──────────────────────────────────────────────────────────── */}
      {isNoQuotes && (
        <div className="bg-[#EDF5FF] border border-[#CDE0FF] text-[#002D62] p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-medium shadow-2xs">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-[#002D62] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <span>
            We haven&apos;t received any quotes yet. Only {selectedJob.matchedProfessionals} professionals matched this job, widening your search usually helps.
          </span>
        </div>
      )}

      {isExpired && (
        <div className="bg-[#EDF5FF] border border-[#CDE0FF] text-[#002D62] p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-medium shadow-2xs">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-[#002D62] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <span>
            Job listings stay open for 14 days. This listing reached its limit with 0 quotes unanswered.
          </span>
        </div>
      )}

      {isCancelled && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-medium">
          <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 font-bold">
            ✕
          </div>
          <span>
            This job posting has been cancelled and is no longer active. No payments were processed.
          </span>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* QUOTE ACTIVITY (Only visible in 'receiving-quotes' state)     */}
      {/* ──────────────────────────────────────────────────────────── */}
      {isReceiving && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-sm sm:text-base text-[#0F1115]">
                Quote activity
              </h2>
              <p className="font-sans text-xs text-neutral-500 mt-0.5">
                {selectedJob.quotes.length} professionals have responded to this job.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentSubView("compare")}
              className="font-sans text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              Compare all
            </button>
          </div>

          {/* 3 Quote Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedJob.quotes.map((quote) => (
              <div
                key={quote.id}
                className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top user row */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 relative shrink-0">
                      <Image
                        src={quote.avatarUrl}
                        alt={quote.artisanName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-sm text-[#0F1115]">
                        {quote.artisanName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                        <span className="text-amber-500 font-semibold">★ {quote.rating}</span>
                        <span>·</span>
                        <span>{quote.completedJobs} jobs</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Duration */}
                  <div className="flex items-baseline justify-between mt-5 pt-4 border-t border-neutral-100">
                    <span className="font-sans font-bold text-xl text-[#0F1115]">
                      ₦{quote.price.toLocaleString()}
                    </span>
                    <span className="font-sans text-xs text-neutral-500 font-medium">
                      {quote.duration}
                    </span>
                  </div>
                </div>

                {/* View Quote Button */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentSubView("compare")}
                    className="w-full py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    View quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TWO COLUMN CONTENT LAYOUT                                    */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN (Job Details & Sub-cards) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subcard for 'no-quotes-yet' state */}
          {isNoQuotes && (
            <div className="bg-white rounded-2xl p-8 border border-neutral-200/80 shadow-2xs text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#EBF3FF] text-[#0254D8] flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <circle cx="11" cy="14" r="3" />
                  <line x1="13.5" y1="16.5" x2="16" y2="19" />
                </svg>
              </div>
              <h2 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
                No quotes yet
              </h2>
              <p className="font-sans text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                Your posting is open. Adjust your budget, photos or timing to help more professionals respond.
              </p>
            </div>
          )}

          {/* Subcard for 'expired' state */}
          {isExpired && (
            <div className="bg-white rounded-2xl p-8 border border-neutral-200/80 shadow-2xs text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h2 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
                This posting has expired
              </h2>
              <p className="font-sans text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                The 14-day listing period has ended. Your job details are still available below.
              </p>
            </div>
          )}

          {/* Main Job Details Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-6">
            <div>
              <h2 className="font-heading font-bold text-base text-[#0F1115]">
                Job details
              </h2>
              <p className="font-sans font-semibold text-sm text-neutral-800 mt-2">
                {selectedJob.category}
              </p>
            </div>

            {/* Grid Specs */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-neutral-400 block mb-0.5">Service</span>
                <span className="font-semibold text-neutral-800">
                  {selectedJob.service}
                </span>
              </div>

              <div>
                <span className="text-neutral-400 block mb-0.5">Location</span>
                <span className="font-semibold text-neutral-800">
                  {selectedJob.location}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-neutral-400 block mb-0.5">Date</span>
                  <span className="font-semibold text-neutral-800">
                    {selectedJob.date}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Time</span>
                  <span className="font-semibold text-neutral-800">
                    {selectedJob.time}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-neutral-400 block mb-0.5">Budget</span>
                  <span className="font-semibold text-neutral-800">
                    {selectedJob.budget}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Urgency</span>
                  <span className="font-semibold text-neutral-800">
                    {selectedJob.urgency}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="pt-4 border-t border-neutral-100 space-y-3">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-400">
                Additional information
              </h3>

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600">Is the affected area accessible?</span>
                <span className="font-bold text-neutral-900">
                  {selectedJob.isAccessible ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600">Will someone be on site?</span>
                <span className="font-bold text-neutral-900">
                  {selectedJob.someoneOnSite ? "Yes" : "No"}
                </span>
              </div>
            </div>

            {/* Photos Section */}
            {selectedJob.photos.length > 0 && (
              <div className="pt-4 border-t border-neutral-100 space-y-3">
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-400">
                  Photos
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedJob.photos.map((photo, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                        <Image
                          src={photo.url}
                          alt={photo.caption}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="font-sans text-[11px] text-neutral-500 font-medium">
                        {photo.caption}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (Timeline or Manage Posting) */}
        <div className="space-y-5">
          {/* 1. Job Timeline Card (When Receiving Quotes) */}
          {isReceiving && (
            <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-5">
              <div>
                <h3 className="font-heading font-bold text-base text-[#0F1115]">
                  Job timeline
                </h3>
                <p className="font-sans text-xs text-neutral-400 mt-0.5">
                  Follow your job from posting to completion.
                </p>
              </div>

              {/* Vertical Milestones */}
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                {/* 1. Job posted (Done) */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-xs text-neutral-900">
                      Job posted
                    </h4>
                    <p className="font-sans text-[11px] text-neutral-400">
                      Customer · Today · 11:04
                    </p>
                  </div>
                </div>

                {/* 2. Receiving quotes (Active) */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-[#0254D8] bg-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0254D8]" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-xs text-[#0254D8]">
                      Receiving quotes
                    </h4>
                    <p className="font-sans text-[11px] text-neutral-400">
                      Marketplace
                    </p>
                  </div>
                </div>

                {/* 3. Quote accepted */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-neutral-300 bg-white" />
                  <div>
                    <h4 className="font-sans font-medium text-xs text-neutral-500">
                      Quote accepted
                    </h4>
                    <p className="font-sans text-[11px] text-neutral-400">
                      Customer · Pending
                    </p>
                  </div>
                </div>

                {/* 4. Payment secured */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-neutral-300 bg-white" />
                  <div>
                    <h4 className="font-sans font-medium text-xs text-neutral-500">
                      Payment secured
                    </h4>
                    <p className="font-sans text-[11px] text-neutral-400">
                      Bluefixx Escrow · Pending
                    </p>
                  </div>
                </div>

                {/* 5. Job scheduled */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-neutral-300 bg-white" />
                  <div>
                    <h4 className="font-sans font-medium text-xs text-neutral-500">
                      Job scheduled
                    </h4>
                    <p className="font-sans text-[11px] text-neutral-400">
                      Both parties · Pending
                    </p>
                  </div>
                </div>

                {/* 6. Artisan arrived */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-neutral-300 bg-white" />
                  <div>
                    <h4 className="font-sans font-medium text-xs text-neutral-500">
                      Artisan arrived
                    </h4>
                    <p className="font-sans text-[11px] text-neutral-400">
                      Artisan · Pending
                    </p>
                  </div>
                </div>

                {/* 7. Work in progress */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-neutral-300 bg-white" />
                  <div>
                    <h4 className="font-sans font-medium text-xs text-neutral-500">
                      Work in progress
                    </h4>
                    <p className="font-sans text-[11px] text-neutral-400">
                      Artisan · Pending
                    </p>
                  </div>
                </div>

                {/* 8. Completed by artisan */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-neutral-300 bg-white" />
                  <div>
                    <h4 className="font-sans font-medium text-xs text-neutral-500">
                      Completed by artisan
                    </h4>
                    <p className="font-sans text-[11px] text-neutral-400">
                      Artisan · Pending
                    </p>
                  </div>
                </div>

                {/* 9. Payment released */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-neutral-300 bg-white" />
                  <div>
                    <h4 className="font-sans font-medium text-xs text-neutral-500">
                      Payment released
                    </h4>
                    <p className="font-sans text-[11px] text-neutral-400">
                      Customer confirmation · Pending
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Manage Posting Card (For No Quotes & Expired) */}
          {(isNoQuotes || isExpired) && (
            <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
              <h3 className="font-heading font-bold text-base text-[#0F1115]">
                Manage posting
              </h3>

              <div className="space-y-3">
                <div>
                  <button
                    type="button"
                    onClick={() => router.push(`/post-job?edit=${selectedJob.id}`)}
                    className="w-full py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold transition-colors shadow-2xs"
                  >
                    Edit Job
                  </button>
                  <p className="font-sans text-[11px] text-neutral-400 text-center mt-1">
                    Adjust budget, photos or timing
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-full py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold transition-colors shadow-2xs"
                  >
                    Cancel Job
                  </button>
                  <p className="font-sans text-[11px] text-neutral-400 text-center mt-1">
                    No payment has been made
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Matching Activity Card (For No Quotes) */}
          {isNoQuotes && (
            <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
              <h3 className="font-heading font-bold text-base text-[#0F1115]">
                Matching activity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-sans font-bold text-2xl text-[#0F1115] block">
                    {selectedJob.matchedProfessionals}
                  </span>
                  <span className="font-sans text-xs text-neutral-400 font-medium">
                    Professionals matched
                  </span>
                </div>
                <div>
                  <span className="font-sans font-bold text-2xl text-[#0F1115] block">
                    {selectedJob.quotesReceived}
                  </span>
                  <span className="font-sans text-xs text-neutral-400 font-medium">
                    Quotes received
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Listing Summary Card (For Expired) */}
          {isExpired && (
            <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs space-y-3 text-xs">
              <h3 className="font-heading font-bold text-base text-[#0F1115]">
                Listing summary
              </h3>
              <div className="space-y-1.5 text-neutral-600">
                <p>14 days · Listing period ended</p>
                <p>2 quotes · Unanswered</p>
              </div>
            </div>
          )}

          {/* 5. Escrow Protection Assurance Box */}
          <div className="bg-[#EDF5FF] border border-[#CDE0FF] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#002D62] shadow-2xs">
            <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span className="leading-relaxed">
              {isReceiving
                ? "Artisans are paid only after you confirm. No quote has been accepted yet."
                : "Posting is free. No payment has been made on this job."}
            </span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* BOTTOM ACTION BAR                                            */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-200/60">
        <Link
          href="/dashboard"
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold text-center transition-colors shadow-2xs"
        >
          Back to Home
        </Link>

        {isReceiving && (
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold text-center transition-colors shadow-2xs cursor-pointer"
          >
            Cancel job posting
          </button>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* CANCEL JOB DIALOG MODAL (Matching media_1792270182127.png)   */}
      {/* With explicit User Requirement: Input for cancellation reason*/}
      {/* ══════════════════════════════════════════════════════════ */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150 space-y-5">
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Title & Description matching screenshot */}
            <div className="text-center pt-2">
              <h3 className="font-heading font-bold text-lg text-[#0F1115]">
                Cancel this Job post?
              </h3>
              <p className="font-sans text-xs text-neutral-500 mt-2 leading-relaxed">
                The listing will be closed and professionals will no longer see it. No payment has been made on this job.
              </p>
            </div>

            {/* USER REQUIREMENT: Reason input added into the modal */}
            <div className="space-y-3 pt-1 text-left">
              <label className="block text-xs font-semibold text-neutral-700">
                Reason for cancellation <span className="text-neutral-400 font-normal">(required)</span>
              </label>

              {/* Quick Select Options */}
              <div className="space-y-1.5">
                {CANCELLATION_REASONS.slice(0, 4).map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setCancelReasonPreset(reason)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between border ${
                      cancelReasonPreset === reason
                        ? "border-[#001B40] bg-[#F4F7FB] text-[#001B40] font-semibold"
                        : "border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-medium"
                    }`}
                  >
                    <span>{reason}</span>
                    {cancelReasonPreset === reason && (
                      <span className="w-2 h-2 rounded-full bg-[#001B40]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Additional Detail Text Input */}
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">
                  Additional comments or details
                </label>
                <textarea
                  rows={2}
                  value={cancelReasonText}
                  onChange={(e) => setCancelReasonText(e.target.value)}
                  placeholder="Tell us a little more about why you are cancelling..."
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-[#001B40] transition-colors resize-none text-neutral-800 placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* Action Buttons matching screenshot layout: Keep job on left, Cancel job on right */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs font-semibold transition-colors cursor-pointer text-center shadow-2xs"
              >
                Keep job
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer text-center disabled:opacity-60"
              >
                {isCancelling ? "Cancelling..." : "Cancel job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
