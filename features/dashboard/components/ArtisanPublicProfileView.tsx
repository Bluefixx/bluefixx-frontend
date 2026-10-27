"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getArtisanByIdApi } from "@/lib/api/customer";
import { ArtisanDetailResponse } from "@/types/customer";

interface ArtisanPublicProfileViewProps {
  artisanId?: string;
  onBack: () => void;
  onContinue: () => void;
}

type TabType = "about" | "services" | "portfolio" | "reviews" | "verification";

interface PortfolioItem {
  id: string;
  url: string;
  title: string;
  location: string;
  description: string;
}

interface ReviewItem {
  id: string;
  author: string;
  initials: string;
  date: string;
  rating: number;
  comment: string;
  tags: string[];
  imageUrl?: string;
}

const DEFAULT_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: "p-1",
    url: "/images/workers.png",
    title: "Kitchen sink re-pipe, GRA",
    location: "GRA, Enugu",
    description:
      "Complete replacement of corroded galvanized plumbing lines with high-gauge PPR pipes and clean under-counter wall sealing.",
  },
  {
    id: "p-2",
    url: "/images/hero-mobile.jpg",
    title: "Bathroom rebuild, Trans-Ekulu",
    location: "Trans-Ekulu, Enugu",
    description:
      "Full concealed piping run for hot and cold pressure lines, wall-hung sanitary ware installation, and hydrostatic pressure testing.",
  },
  {
    id: "p-3",
    url: "/images/customers.png",
    title: "Pressure pump install, New Haven",
    location: "New Haven, Enugu",
    description:
      "Dual pressure pump bypass setup with automatic flow sensors and vibration-dampened brass fittings.",
  },
];

const DEFAULT_REVIEWS_LIST: ReviewItem[] = [
  {
    id: "r-1",
    author: "Tunde A.",
    initials: "T",
    date: "12 Jul 2026",
    rating: 5.0,
    comment:
      "Emeka arrived within the hour, found the leak behind the wall and fixed it cleanly. He showed me the old fitting before replacing it. Very transparent with pricing.",
    tags: ["On time", "Neat work", "Fair price"],
    imageUrl: "/images/workers.png",
  },
  {
    id: "r-2",
    author: "Okeke O.",
    initials: "O",
    date: "01 Jul 2026",
    rating: 5.0,
    comment:
      "Emeka arrived within the hour, found the leak behind the wall and fixed it cleanly. He showed me the old fitting before replacing it. Very transparent with pricing.",
    tags: ["On time", "Neat work", "Fair price"],
    imageUrl: "/images/workers.png",
  },
];

const DEFAULT_ARTISAN = {
  name: "Emeka Okafor",
  trade: "Plumbing",
  experienceYears: 11,
  location: "Independence Layout, Enugu",
  rating: 4.9,
  jobsDone: 318,
  replyTime: "8m",
  trustScore: 92,
  avatarUrl: "/images/david.jpg",
  bio: "Licensed plumber with 11 years across residential and estate maintenance. I handle burst pipes, pressure pumps, water heaters and full bathroom re-piping. I supply original PPR fittings and give a written warranty on every job.",
  highlights: [
    "318 jobs completed through Bluefixx",
    "Available today",
    "Written warranty offered on all work",
  ],
  servicesList: [
    { name: "Leak & burst pipe repair", price: "₦12,000 – ₦35,000" },
    { name: "Water heater installation", price: "₦25,000 – ₦60,000" },
    { name: "Full bathroom re-piping", price: "₦80,000 – ₦250,000" },
    { name: "Pressure pump servicing", price: "₦15,000 – ₦45,000" },
  ],
};

export default function ArtisanPublicProfileView({
  artisanId = "emeka-okafor",
  onBack,
  onContinue,
}: ArtisanPublicProfileViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const [artisanData, setArtisanData] = useState<ArtisanDetailResponse | null>(null);

  // Lightbox state for portfolio
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!artisanId) return;
    let mounted = true;

    getArtisanByIdApi(artisanId)
      .then((data) => {
        if (mounted && data) {
          setArtisanData(data);
        }
      })
      .catch((err) => {
        console.debug("Artisan detail API offline, using fallback.", err);
      });

    return () => {
      mounted = false;
    };
  }, [artisanId]);

  const artisan = useMemo(() => {
    if (!artisanData) return DEFAULT_ARTISAN;
    return {
      name: artisanData.businessName || artisanData.fullName || DEFAULT_ARTISAN.name,
      trade: artisanData.services?.[0]?.name || DEFAULT_ARTISAN.trade,
      experienceYears: DEFAULT_ARTISAN.experienceYears,
      location: artisanData.area || DEFAULT_ARTISAN.location,
      rating: artisanData.rating || DEFAULT_ARTISAN.rating,
      jobsDone: artisanData.completedJobs ?? DEFAULT_ARTISAN.jobsDone,
      replyTime: DEFAULT_ARTISAN.replyTime,
      trustScore: DEFAULT_ARTISAN.trustScore,
      avatarUrl: artisanData.photoUrl || DEFAULT_ARTISAN.avatarUrl,
      bio: artisanData.bio || DEFAULT_ARTISAN.bio,
      highlights: DEFAULT_ARTISAN.highlights,
      servicesList: artisanData.services?.length
        ? artisanData.services.map((s) => ({
            name: s.name,
            price: s.indicativePrice || "Price on request",
          }))
        : DEFAULT_ARTISAN.servicesList,
    };
  }, [artisanData]);

  const portfolioItems: PortfolioItem[] = useMemo(() => {
    if (artisanData?.portfolio && artisanData.portfolio.length > 0) {
      return artisanData.portfolio.map((p, idx) => ({
        id: p.id || `port-${idx}`,
        url: p.mediaUrl || DEFAULT_PORTFOLIO_ITEMS[idx % DEFAULT_PORTFOLIO_ITEMS.length].url,
        title: p.title || "Completed project",
        location: artisanData.area || "Enugu",
        description: "Verified completed work through Bluefixx.",
      }));
    }
    return DEFAULT_PORTFOLIO_ITEMS;
  }, [artisanData]);

  const reviewsList: ReviewItem[] = useMemo(() => {
    if (artisanData?.reviews && artisanData.reviews.length > 0) {
      return artisanData.reviews.map((r, idx) => ({
        id: r.id || `rev-${idx}`,
        author: r.customerName || "Customer",
        initials: (r.customerName || "C").charAt(0).toUpperCase(),
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Recent",
        rating: r.stars || 5.0,
        comment: r.comment || "Great work and very professional service.",
        tags: ["Verified booking"],
        imageUrl: undefined,
      }));
    }
    return DEFAULT_REVIEWS_LIST;
  }, [artisanData]);

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : portfolioItems.length - 1
        );
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null && prev < portfolioItems.length - 1 ? prev + 1 : 0
        );
      }
    },
    [lightboxIndex, portfolioItems.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const activeLightboxItem =
    lightboxIndex !== null ? portfolioItems[lightboxIndex] : null;

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
          {artisan.name}
        </h1>
        <p className="font-sans text-xs text-neutral-400 mt-0.5">
          {artisan.trade}
        </p>
      </div>

      {/* Hero Navy Banner (Matching all screenshots) */}
      <div className="bg-[#002D62] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-sm">
        {/* Left Side: Avatar & Identity */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 relative bg-neutral-800 shrink-0 shadow-md">
            <Image
              src={artisan.avatarUrl}
              alt={artisan.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-white tracking-tight">
              {artisan.name}
            </h2>
            <p className="font-sans text-xs text-white/80">
              {artisan.trade} · {artisan.experienceYears} years
            </p>
            <p className="font-sans text-xs text-white/60">
              {artisan.location}
            </p>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 bg-[#FFF8E6] text-[#B45309] font-bold text-[11px] px-3 py-1 rounded-full shadow-2xs">
                ★ Expert Artisan
              </span>
              <span className="inline-flex items-center gap-1 bg-[#001B40] text-white/90 font-medium text-[11px] px-3 py-1 rounded-full border border-white/10 shadow-2xs">
                Trust score {artisan.trustScore}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Stats Box */}
        <div className="bg-[#001B40]/70 rounded-2xl p-4 sm:p-5 flex items-center justify-around sm:justify-start gap-6 sm:gap-8 border border-white/10 shrink-0">
          <div>
            <span className="font-sans text-[11px] text-white/60 block">Rating</span>
            <span className="font-sans font-bold text-xl sm:text-2xl text-white">
              {artisan.rating}
            </span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <span className="font-sans text-[11px] text-white/60 block">Jobs done</span>
            <span className="font-sans font-bold text-xl sm:text-2xl text-white">
              {artisan.jobsDone}
            </span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <span className="font-sans text-[11px] text-white/60 block">Replies in</span>
            <span className="font-sans font-bold text-xl sm:text-2xl text-white">
              {artisan.replyTime}
            </span>
          </div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="flex items-center gap-6 sm:gap-8 border-b border-neutral-200 overflow-x-auto text-xs sm:text-sm font-semibold">
        {(["about", "services", "portfolio", "reviews", "verification"] as TabType[]).map((tab) => {
          const labels: Record<TabType, string> = {
            about: "About",
            services: "Services",
            portfolio: "Portfolio",
            reviews: "Reviews",
            verification: "Verification",
          };
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 transition-colors capitalize cursor-pointer whitespace-nowrap ${
                isActive
                  ? "text-[#0254D8] border-b-2 border-[#0254D8] font-bold"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Two Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Changes based on activeTab) */}
        <div className="lg:col-span-2 space-y-4">
          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 1: ABOUT                                               */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === "about" && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-3">
                <h3 className="font-heading font-bold text-base text-[#0F1115]">
                  About {artisan.name.split(" ")[0]}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {artisan.bio}
                </p>
              </div>

              <div className="space-y-2.5">
                {artisan.highlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-2xs flex items-center gap-3 text-xs sm:text-sm font-medium text-neutral-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">
                      ✓
                    </span>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 2: SERVICES & PRICES (Matching media_1792439474717)    */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === "services" && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs">
                <h3 className="font-heading font-bold text-base text-[#0F1115] mb-2">
                  Services
                </h3>
                <div className="divide-y divide-neutral-100">
                  {artisan.servicesList.map((srv, idx) => (
                    <div key={idx} className="py-4 flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-neutral-700 font-medium">{srv.name}</span>
                      <span className="font-sans font-bold text-[#0F1115]">{srv.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indicative Price Note Box */}
              <div className="bg-[#EDF5FF] border border-[#CDE0FF] rounded-2xl p-4 flex items-center gap-3 text-xs text-[#002D62] shadow-2xs">
                <svg className="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <span>
                  Prices are indicative. Final cost is agreed with you in negotiation before any work starts.
                </span>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 3: PORTFOLIO + IMMERSIVE LIGHTBOX (media_1792439523516)*/}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === "portfolio" && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-base text-[#0F1115]">
                Portfolio
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {portfolioItems.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setLightboxIndex(idx)}
                    className="group bg-white rounded-3xl p-3 border border-neutral-200/80 shadow-2xs hover:border-[#0254D8]/50 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-100">
                      <Image
                        src={item.url}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Zoom Overlay Prompt */}
                      <div className="absolute inset-0 bg-neutral-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 text-neutral-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="14" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                          </svg>
                          View photo
                        </span>
                      </div>
                    </div>
                    <div className="px-2 pt-2.5 pb-1">
                      <h4 className="font-sans text-xs text-neutral-600 font-medium">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 4: REVIEWS (Matching media_1792439614969)              */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-base text-[#0F1115]">
                Customer reviews
              </h3>

              <div className="space-y-4">
                {reviewsList.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-3.5"
                  >
                    {/* Top User Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#001B40] text-white flex items-center justify-center font-bold text-xs">
                          {review.initials}
                        </div>
                        <div>
                          <h4 className="font-sans font-bold text-sm text-[#0F1115]">
                            {review.author}
                          </h4>
                          <span className="font-sans text-[11px] text-neutral-400">
                            {review.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 font-bold text-xs text-amber-500">
                        <span>★</span>
                        <span>{review.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Review Comment */}
                    <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {review.comment}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {review.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Attached Photo */}
                    {review.imageUrl && (
                      <div className="pt-2">
                        <div className="relative aspect-2/1 sm:aspect-21/9 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/80 max-w-xl">
                          <Image
                            src={review.imageUrl}
                            alt="Repair photo"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 5: VERIFICATION STATUS (Matching media_1792439655096)  */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === "verification" && (
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-base text-[#0F1115]">
                Verification status
              </h3>

              <div className="space-y-3.5">
                {/* 1. Verified Artisan */}
                <div className="bg-[#FFFDF6] border border-[#FDE68A]/70 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans font-bold text-sm text-[#0F1115]">
                      Verified Artisan
                    </h4>
                    <span className="w-5 h-5 rounded-full bg-amber-100/80 text-amber-700 flex items-center justify-center font-bold text-xs">
                      ✓
                    </span>
                  </div>
                  <p className="font-sans text-xs text-neutral-500 mt-1">
                    NIN and BVN confirmed, liveness selfie matched, phone number verified.
                  </p>
                </div>

                {/* 2. Certified Professional */}
                <div className="bg-[#FFFDF6] border border-[#FDE68A]/70 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans font-bold text-sm text-[#0F1115]">
                      Certified Professional
                    </h4>
                    <span className="w-5 h-5 rounded-full bg-amber-100/80 text-amber-700 flex items-center justify-center font-bold text-xs">
                      ✓
                    </span>
                  </div>
                  <p className="font-sans text-xs text-neutral-500 mt-1">
                    Passed the trade knowledge test and submitted a practical assessment.
                  </p>
                </div>

                {/* 3. Expert Artisan */}
                <div className="bg-[#FFFDF6] border border-[#FDE68A]/70 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans font-bold text-sm text-[#0F1115]">
                      Expert Artisan
                    </h4>
                    <span className="w-5 h-5 rounded-full bg-amber-100/80 text-amber-700 flex items-center justify-center font-bold text-xs">
                      ✓
                    </span>
                  </div>
                  <p className="font-sans text-xs text-neutral-500 mt-1">
                    Portfolio reviewed by a Master Artisan and 100+ completed jobs.
                  </p>
                </div>

                {/* 4. Master Artisan (Not attained) */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans font-bold text-sm text-[#0F1115]">
                      Master Artisan
                    </h4>
                    <span className="text-neutral-400 text-xs font-medium">
                      Not attained
                    </span>
                  </div>
                  <p className="font-sans text-xs text-neutral-400 mt-1">
                    Passed a live assessment and is approved to mentor apprentices.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-3">
            <div>
              <h4 className="font-heading font-bold text-base text-[#0F1115]">
                {artisan.name}
              </h4>
              <p className="font-sans text-xs text-neutral-400 mt-0.5">
                {artisan.trade} · {artisan.experienceYears} years
              </p>
              <div className="mt-2">
                <span className="bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full text-[11px] inline-block">
                  Available today
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={onContinue}
                className="w-full py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs font-semibold transition-colors cursor-pointer text-center shadow-2xs"
              >
                Continue
              </button>

              <button
                type="button"
                onClick={() => router.push("/messages")}
                className="w-full py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer text-center bg-white shadow-2xs"
              >
                Message {artisan.name.split(" ")[0]}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* IMMERSIVE PORTFOLIO LIGHTBOX MODAL                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeLightboxItem && lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 select-none">
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer backdrop-blur-xs"
            aria-label="Close lightbox"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Prev Arrow */}
          <button
            type="button"
            onClick={() =>
              setLightboxIndex(
                lightboxIndex > 0 ? lightboxIndex - 1 : portfolioItems.length - 1
              )
            }
            className="absolute left-4 sm:left-8 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer backdrop-blur-xs hidden sm:flex items-center justify-center"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={() =>
              setLightboxIndex(
                lightboxIndex < portfolioItems.length - 1 ? lightboxIndex + 1 : 0
              )
            }
            className="absolute right-4 sm:right-8 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer backdrop-blur-xs hidden sm:flex items-center justify-center"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Lightbox Content Container */}
          <div className="max-w-4xl w-full max-h-[92vh] flex flex-col items-center space-y-4">
            {/* Image Box */}
            <div className="relative w-full aspect-16/10 max-h-[70vh] rounded-3xl overflow-hidden shadow-2xl bg-neutral-900 border border-white/10">
              <Image
                src={activeLightboxItem.url}
                alt={activeLightboxItem.title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Bottom Meta & Caption */}
            <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 text-white border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-bold text-sm sm:text-base text-white">
                    {activeLightboxItem.title}
                  </h4>
                  <span className="text-white/40 text-xs">·</span>
                  <span className="text-white/70 text-xs font-medium">
                    {activeLightboxItem.location}
                  </span>
                </div>
                <p className="font-sans text-xs text-white/80 mt-1 max-w-2xl leading-relaxed">
                  {activeLightboxItem.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-white/60 bg-white/10 px-3 py-1 rounded-full">
                  {lightboxIndex + 1} of {portfolioItems.length}
                </span>

                {/* Mobile arrows */}
                <div className="flex items-center gap-1 sm:hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        lightboxIndex > 0 ? lightboxIndex - 1 : portfolioItems.length - 1
                      )
                    }
                    className="p-1.5 rounded-lg bg-white/10 text-white"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        lightboxIndex < portfolioItems.length - 1 ? lightboxIndex + 1 : 0
                      )
                    }
                    className="p-1.5 rounded-lg bg-white/10 text-white"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
