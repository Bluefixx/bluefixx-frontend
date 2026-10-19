"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ArtisanPublicProfileViewProps {
  artisanId?: string;
  onBack: () => void;
  onContinue: () => void;
}

type TabType = "about" | "services" | "portfolio" | "reviews" | "verification";

export default function ArtisanPublicProfileView({
  artisanId = "emeka-okafor",
  onBack,
  onContinue,
}: ArtisanPublicProfileViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("about");

  const artisan = {
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
      { name: "Leak & Burst Pipe Repair", price: "From ₦15,000" },
      { name: "Full Bathroom Re-piping", price: "From ₦85,000" },
      { name: "Water Heater Installation & Repair", price: "From ₦25,000" },
      { name: "Pressure Pump Diagnostics", price: "From ₦20,000" },
    ],
    portfolioImages: [
      { url: "/images/customers.png", title: "Complete master bathroom re-pipe" },
      { url: "/images/workers.png", title: "Commercial valve manifold installation" },
      { url: "/images/hero-mobile.jpg", title: "Water pump bypass system" },
    ],
    reviewsList: [
      {
        author: "Chisom O.",
        rating: 5,
        date: "2 days ago",
        comment: "Emeka arrived in 25 minutes and resolved a stubborn burst pipe under our kitchen sink without damaging our cabinets. Very professional!",
      },
      {
        author: "Ibrahim K.",
        rating: 5,
        date: "Last week",
        comment: "Excellent work on our water pump. Clean fittings and verified warranty. Highly recommended.",
      },
    ],
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
          {artisan.name}
        </h1>
        <p className="font-sans text-xs text-neutral-400 mt-0.5">
          {artisan.trade}
        </p>
      </div>

      {/* Hero Navy Banner (Matching media_1792437458303.png) */}
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
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === "about" && (
            <div className="space-y-4">
              {/* About Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-3">
                <h3 className="font-heading font-bold text-base text-[#0F1115]">
                  About {artisan.name.split(" ")[0]}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {artisan.bio}
                </p>
              </div>

              {/* 3 Highlight Cards */}
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

          {activeTab === "services" && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
              <h3 className="font-heading font-bold text-base text-[#0F1115]">
                Specialized Services
              </h3>
              <div className="divide-y divide-neutral-100">
                {artisan.servicesList.map((srv, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-medium text-neutral-800">{srv.name}</span>
                    <span className="font-bold text-[#001B40]">{srv.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "portfolio" && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
              <h3 className="font-heading font-bold text-base text-[#0F1115]">
                Past Project Work
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {artisan.portfolioImages.map((img, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                      <Image src={img.url} alt={img.title} fill className="object-cover" />
                    </div>
                    <p className="font-sans text-xs text-neutral-600 font-medium">
                      {img.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
              <h3 className="font-heading font-bold text-base text-[#0F1115]">
                Verified Customer Reviews
              </h3>
              <div className="space-y-3">
                {artisan.reviewsList.map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">{rev.author}</span>
                      <span className="text-neutral-400">{rev.date}</span>
                    </div>
                    <div className="text-amber-500 font-semibold">
                      {"★".repeat(rev.rating)}
                    </div>
                    <p className="text-neutral-600 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "verification" && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
              <h3 className="font-heading font-bold text-base text-[#0F1115]">
                Trust & Verification Details
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-800 font-medium">
                  <span>✓</span>
                  <span>National Identity (NIN) verified on Bluefixx registry</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-800 font-medium">
                  <span>✓</span>
                  <span>Physical residential address inspected and confirmed</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-800 font-medium">
                  <span>✓</span>
                  <span>Certified Trade Apprenticeship accreditation passed</span>
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
    </div>
  );
}
