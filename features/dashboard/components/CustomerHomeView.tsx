"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import { CATEGORIES, TRUSTED_ARTISANS } from "../data/mock-dashboard-data";

export default function CustomerHomeView() {
  const router = useRouter();
  const { walletBalance } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push("/explore");
      return;
    }
    router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handlePopularTagClick = (tag: string) => {
    router.push(`/explore?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* 1. Header Greeting & Post a Job CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-xs sm:text-sm text-neutral-500 font-medium flex items-center gap-1.5">
            Good morning <span className="text-base">👋</span>
          </span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] mt-1 tracking-tight">
            Let&apos;s get it fixed.
          </h1>
        </div>

        <Link
          href="/post-job"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer w-fit"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Post a job</span>
        </Link>
      </div>

      {/* 2. Main Hero Grid: Search Card (Left) & Guarantee/Wallet Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Hero Card: Dark Navy (#001B40) */}
        <div className="lg:col-span-2 bg-[#001B40] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
          <div>
            <h2 className="font-heading font-bold text-xl sm:text-2xl tracking-tight text-white">
              What do you need help with?
            </h2>
            <p className="font-sans text-xs sm:text-sm text-blue-100/80 mt-1.5 mb-6">
              Find trusted professionals for your home and everyday needs.
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a service or describe your problem"
                className="w-full bg-white text-neutral-900 placeholder:text-neutral-400 rounded-2xl py-3.5 pl-12 pr-4 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </form>
          </div>

          {/* Popular Tag Suggestions */}
          <div className="flex flex-wrap items-center gap-2 mt-6 text-xs text-blue-100/80">
            <span className="font-medium">Popular:</span>
            {["Plumbing", "Electrical", "Cleaning"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handlePopularTagClick(tag)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Wallet & Trust Highlights */}
        <div className="flex flex-col gap-3.5">
          {/* Card 1: Wallet Balance */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <span className="font-sans text-xs text-neutral-500 font-medium">
                Wallet balance
              </span>
            </div>
            <div className="mt-3">
              <span className="font-sans font-bold text-2xl text-[#0F1115]">
                ₦{walletBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Card 2: Escrow Protection */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-2xs flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h4 className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                Escrow protection
              </h4>
              <p className="font-sans text-xs text-neutral-500 mt-0.5 leading-relaxed">
                Artisans are paid only after you confirm
              </p>
            </div>
          </div>

          {/* Card 3: 7-Day Warranty */}
          <div className="bg-emerald-50/70 rounded-2xl p-4 sm:p-5 border border-emerald-200/60 shadow-2xs flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div>
              <h4 className="font-sans font-bold text-xs sm:text-sm text-emerald-950">
                7-day warranty
              </h4>
              <p className="font-sans text-xs text-emerald-800/80 mt-0.5 leading-relaxed">
                Every job is covered for 7 days after you confirm it
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Blue Banner */}
      <div className="rounded-2xl p-4 sm:p-5 bg-[#1D72FE] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-white">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="4" width="16" height="16" rx="3" transform="rotate(45 12 12)" />
              <path d="M12 9v6" />
              <path d="M9 12h6" />
            </svg>
          </div>
          <div>
            <h4 className="font-sans font-bold text-sm sm:text-base">Need help now?</h4>
            <p className="font-sans text-xs text-blue-100 mt-0.5">
              Find an available verified professional near you.
            </p>
          </div>
        </div>

        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 font-sans font-bold text-xs sm:text-sm text-white hover:underline cursor-pointer w-fit"
        >
          <span>Find a professional</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>

      {/* 4. Section: Browse Services */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-lg sm:text-xl text-[#0F1115]">
            Browse services
          </h3>
          <Link
            href="/explore"
            className="text-xs sm:text-sm font-semibold text-[#001B40] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>All categories</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        {/* Categories Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
            <Link
              key={cat.id}
              href={`/explore?category=${cat.id}`}
              className="bg-white rounded-2xl p-4 border border-neutral-200/80 hover:border-[#001B40] hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mb-3 group-hover:bg-[#001B40] group-hover:text-white transition-colors">
                {cat.id === "home-construction" && (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9" />
                    <path d="M17.64 15 22 10.64" />
                    <path d="m20.91 3.26-4 4" />
                    <path d="m14.82 4.24 3.9 3.9" />
                    <path d="m11.5 8.5 3-3" />
                  </svg>
                )}
                {cat.id === "repairs-technical" && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                )}
                {cat.id === "automotive" && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="16" height="12" x="4" y="5" rx="2" />
                    <circle cx="8" cy="17" r="2" />
                    <circle cx="16" cy="17" r="2" />
                  </svg>
                )}
                {cat.id === "fashion-beauty" && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="6" cy="6" r="3" />
                    <circle cx="6" cy="18" r="3" />
                    <line x1="20" y1="4" x2="8.12" y2="15.88" />
                    <line x1="14.47" y1="14.48" x2="20" y2="20" />
                    <line x1="8.12" y1="8.12" x2="12" y2="12" />
                  </svg>
                )}
                {cat.id === "facility-property" && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="16" height="20" x="4" y="2" rx="2" />
                    <line x1="9" y1="22" x2="9" y2="18" />
                    <line x1="15" y1="22" x2="15" y2="18" />
                  </svg>
                )}
              </div>
              <div>
                <h4 className="font-sans font-bold text-xs sm:text-sm text-[#0F1115] group-hover:text-[#001B40] transition-colors leading-snug">
                  {cat.name}
                </h4>
                <p className="font-sans text-[11px] text-neutral-400 mt-1">
                  {cat.count} services
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 5. Section: Trusted Professionals Near You */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-lg sm:text-xl text-[#0F1115]">
            Trusted professionals near you
          </h3>
          <button
            type="button"
            onClick={() => router.push("/explore")}
            className="text-xs sm:text-sm font-semibold text-[#001B40] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>See all</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Artisans Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRUSTED_ARTISANS.map((artisan) => (
            <div
              key={artisan.id}
              className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header: Avatar, Name, Trade & Verification Icon */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                      <Image
                        src={artisan.avatarUrl}
                        alt={artisan.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-sm sm:text-base text-[#0F1115]">
                        {artisan.name}
                      </h4>
                      <p className="font-sans text-xs text-neutral-500">{artisan.trade}</p>
                    </div>
                  </div>

                  {/* Verification Checkmark Pill */}
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>

                {/* Rating & Distance Meta */}
                <div className="flex items-center justify-between text-xs text-neutral-500 mt-3 pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-1 text-neutral-800 font-semibold">
                    <span className="text-amber-500">★</span>
                    <span>{artisan.rating}</span>
                    <span className="text-neutral-400 font-normal">({artisan.reviewCount})</span>
                  </div>
                  <span>
                    {artisan.distance} · {artisan.experienceYears} yrs
                  </span>
                </div>

                {/* Identity Verified Pill */}
                <div className="mt-2.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                    <span>•</span> Identity verified
                  </span>
                </div>
              </div>

              {/* Bottom Price, Availability & View Profile CTA */}
              <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-neutral-400 block">From</span>
                    <span className="font-sans font-bold text-sm sm:text-base text-[#0F1115]">
                      ₦{artisan.startingPrice.toLocaleString()}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    {artisan.availability}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toast(`Opening profile for ${artisan.name}...`, { icon: "👤" })}
                  className="w-full py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 text-xs sm:text-sm font-semibold text-neutral-800 transition-colors cursor-pointer text-center"
                >
                  View profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
