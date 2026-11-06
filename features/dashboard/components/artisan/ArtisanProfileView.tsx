"use client";

import React from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface ArtisanProfileViewProps {
  onBackToDashboard: () => void;
  onNavigateToEarnings?: () => void;
  onNavigateToTalent?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToSettings?: () => void;
}

export function ArtisanProfileView({
  onBackToDashboard,
  onNavigateToEarnings,
  onNavigateToTalent,
  onNavigateToNotifications,
  onNavigateToSettings,
}: ArtisanProfileViewProps) {
  const services = [
    "Welding & fabrication",
    "Arc welding",
    "Plumbing repair",
    "Generator servicing",
    "Pipe installation",
  ];

  const reviews = [
    {
      id: "rev-1",
      name: "Chisom A.",
      comment:
        "He arrived before the time we agreed and explained the fault before touching anything. Price was just exactly as quoted.",
      rating: 5,
    },
    {
      id: "rev-2",
      name: "Chiamaka O.",
      comment:
        "Neat work. He fixed the leak and pressure-tested every joint before leaving.",
      rating: 5,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Home</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Profile
        </h1>
      </div>

      {/* Hero Master Artisan Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-neutral-100 border-2 border-white shadow-xs shrink-0">
              <Image
                src="/images/david.jpg"
                alt="John Obiora"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#0F1115]">
                Obiora Welding & Fabrication
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                John Obiora
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                📍 Independence Layout, Enugu
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Already verified
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#001B40] text-white shadow-2xs">
              Master Artisan verified
            </span>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
            <span className="font-heading font-extrabold text-2xl text-[#0F1115] block">
              126
            </span>
            <span className="text-xs text-neutral-500 font-medium">Jobs</span>
          </div>
          <div className="bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
            <span className="font-heading font-extrabold text-2xl text-[#0F1115] block">
              4.8
            </span>
            <span className="text-xs text-neutral-500 font-medium">Rating</span>
          </div>
          <div className="bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
            <span className="font-heading font-extrabold text-2xl text-[#0F1115] block">
              7
            </span>
            <span className="text-xs text-neutral-500 font-medium">Posts</span>
          </div>
          <div className="bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
            <span className="font-heading font-extrabold text-2xl text-[#0F1115] block">
              4
            </span>
            <span className="text-xs text-neutral-500 font-medium">Talent</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Services */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-3">
            <h3 className="font-heading font-extrabold text-base text-[#0F1115]">
              Services
            </h3>
            <div className="flex flex-wrap gap-2">
              {services.map((svc) => (
                <span
                  key={svc}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700"
                >
                  {svc}
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="font-heading font-extrabold text-base text-[#0F1115]">
              Portfolio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative h-48 rounded-2xl overflow-hidden bg-neutral-100">
                <Image
                  src="/images/path1.png"
                  alt="Work portfolio 1"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-48 rounded-2xl overflow-hidden bg-neutral-100">
                <Image
                  src="/images/path3.png"
                  alt="Work portfolio 2"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-[#0F1115]">
                Reviews
              </h3>
              <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                <span>★</span>
                <span>4.8 (121)</span>
              </span>
            </div>

            <div className="space-y-3.5 divide-y divide-neutral-100">
              {reviews.map((rev) => (
                <div key={rev.id} className="pt-3.5 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs sm:text-sm text-[#0F1115]">
                      {rev.name}
                    </span>
                    <span className="text-amber-500 text-xs">★★★★★</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Apprenticeship opportunities */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#0F1115]">
                Apprenticeship opportunities
              </h3>
              <button
                type="button"
                onClick={onNavigateToTalent}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Manage →
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl border border-neutral-100 bg-neutral-50/50 space-y-1">
                <h4 className="font-heading font-bold text-xs text-[#0F1115]">
                  Welding & Metal Fabrication
                </h4>
                <p className="text-[11px] text-neutral-400">
                  3 months · 1 slot open
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-neutral-100 bg-neutral-50/50 space-y-1">
                <h4 className="font-heading font-bold text-xs text-[#0F1115]">
                  Plumbing Basics
                </h4>
                <p className="text-[11px] text-neutral-400">
                  2 months · 0 slots open
                </p>
              </div>
            </div>
          </div>

          {/* Service Area */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-3">
            <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#0F1115]">
              Service area
            </h3>
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-center">
              <span className="text-2xl">🗺️</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Enugu East, Independence Layout, New Haven, Trans-Ekulu
            </p>
          </div>

          {/* Profile Navigation Links */}
          <div className="bg-white rounded-3xl p-3 border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100">
            <button
              type="button"
              onClick={onNavigateToEarnings}
              className="w-full px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
            >
              <span>Earnings & withdrawals</span>
              <span className="text-neutral-400">›</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToTalent}
              className="w-full px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
            >
              <span>My Talent</span>
              <span className="text-neutral-400">›</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToNotifications}
              className="w-full px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
            >
              <span>Notifications</span>
              <span className="text-neutral-400">›</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToSettings}
              className="w-full px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
            >
              <span>Settings</span>
              <span className="text-neutral-400">›</span>
            </button>
            <button
              type="button"
              onClick={() => toast("Opening support...")}
              className="w-full px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
            >
              <span>Help & support</span>
              <span className="text-neutral-400">›</span>
            </button>
            <button
              type="button"
              onClick={() => toast("Logging out...")}
              className="w-full px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              <span>Log out</span>
              <span className="text-red-400">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ArtisanProfileView;

