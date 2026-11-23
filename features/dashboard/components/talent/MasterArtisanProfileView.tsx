"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { getTalentProgramByIdApi } from "@/lib/api/talent";

interface MasterArtisanProfileViewProps {
  onBack: () => void;
  onApply: (programme: { id: string; title: string; fee: string; duration: string }) => void;
  onMessage?: () => void;
  programId?: string;
}

export function MasterArtisanProfileView({
  onBack,
  onApply,
  onMessage,
  programId,
}: MasterArtisanProfileViewProps) {
  const [selectedProgramme, setSelectedProgramme] = useState({
    id: programId || "",
    title: "Apprenticeship Programme",
    fee: "₦0",
    duration: "Flexible",
  });

  const [artisanData, setArtisanData] = useState<{
    name: string;
    avatarUrl?: string;
    location: string;
    rating: number;
    experienceYears: number;
    trade: string;
  }>({
    name: "Master Artisan",
    avatarUrl: undefined,
    location: "Enugu",
    rating: 5.0,
    experienceYears: 5,
    trade: "Technical Trade",
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [placesRemaining, setPlacesRemaining] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!programId) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    setIsLoading(true);

    getTalentProgramByIdApi(programId)
      .then((detail) => {
        if (!isMounted || !detail) return;
        const feeKobo = Number(detail.fee || 0);
        const feeNgn = feeKobo > 0 ? `₦${(feeKobo / 100).toLocaleString("en-NG")}` : "₦0";

        setSelectedProgramme({
          id: detail.id,
          title: detail.title || "Apprenticeship Programme",
          fee: feeNgn,
          duration: detail.durationWeeks ? `${detail.durationWeeks} weeks` : "Flexible",
        });

        if (detail.artisan) {
          const ratingScore =
            detail.artisan.ArtisanProfile_userId?.ratingTotal &&
            detail.artisan.ArtisanProfile_userId?.ratingCount
              ? Number(
                  (
                    detail.artisan.ArtisanProfile_userId.ratingTotal /
                    detail.artisan.ArtisanProfile_userId.ratingCount
                  ).toFixed(1)
                )
              : 5.0;

          setArtisanData({
            name: detail.artisan.fullName || "Verified Master Artisan",
            avatarUrl: detail.artisan.avatarUrl,
            location: detail.location || "Enugu",
            rating: ratingScore,
            experienceYears: detail.artisan.ArtisanProfile_userId?.yearsExperience ?? 5,
            trade: detail.trade?.name || detail.title || "Apprenticeship",
          });
        }

        if (detail.outcomes && detail.outcomes.length > 0) {
          setSkills(detail.outcomes);
        }

        if (typeof detail.placesLeft === "number") {
          setPlacesRemaining(detail.placesLeft);
        }
      })
      .catch(() => {
        // Fallback gracefully
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [programId]);

  const portfolio: Array<{ title: string; img: string }> = [];
  const reviews: Array<{ name: string; role: string; text: string }> = [];

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Learn</span>
        </button>

        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Master artisan
        </h1>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white shadow-xs bg-[#001B40] text-white flex items-center justify-center font-heading font-extrabold text-2xl shrink-0">
              {artisanData.avatarUrl ? (
                <Image
                  src={artisanData.avatarUrl}
                  alt={artisanData.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span>{artisanData.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0F1115]">
                  {artisanData.name}
                </h2>
                <span className="text-[11px] font-bold text-white bg-[#001B40] px-2.5 py-0.5 rounded-full">
                  Master Artisan
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Accepting apprentices
                </span>
              </div>
              <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
                {artisanData.trade} · {artisanData.location}
              </p>
            </div>
          </div>

          {/* Stats Badges Row */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="bg-neutral-50 px-4 py-3 rounded-2xl border border-neutral-100 text-center min-w-[80px]">
              <span className="font-sans font-bold text-lg text-[#001B40] block">
                {placesRemaining}
              </span>
              <span className="font-sans text-[10px] text-neutral-400 font-medium">
                Places open
              </span>
            </div>

            <div className="bg-neutral-50 px-4 py-3 rounded-2xl border border-neutral-100 text-center min-w-[80px]">
              <span className="font-sans font-bold text-lg text-[#001B40] block">
                ★ {artisanData.rating}
              </span>
              <span className="font-sans text-[10px] text-neutral-400 font-medium">
                Rating
              </span>
            </div>

            <div className="bg-neutral-50 px-4 py-3 rounded-2xl border border-neutral-100 text-center min-w-[80px]">
              <span className="font-sans font-bold text-lg text-[#001B40] block">
                {artisanData.experienceYears} yrs
              </span>
              <span className="font-sans text-[10px] text-neutral-400 font-medium">
                Experience
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): What you will learn, Apprenticeships, Portfolio, Reviews */}
        <div className="lg:col-span-8 space-y-6">
          {/* What you will learn */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="font-heading font-bold text-base text-[#0F1115]">
              What you will learn
            </h3>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-full bg-neutral-100/80 text-neutral-700 font-sans text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                Key workshop skills and techniques tailored to this practical apprenticeship.
              </p>
            )}
          </div>

          {/* Apprenticeships offered */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="font-heading font-bold text-base text-[#0F1115]">
              Apprenticeships offered
            </h3>

            <div className="space-y-3">
              <div
                className="p-5 rounded-2xl border-2 border-blue-900 bg-blue-50/20 cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-sans font-bold text-sm text-[#0F1115]">
                    {selectedProgramme.title}
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full shrink-0">
                    {placesRemaining} {placesRemaining === 1 ? "place" : "places"} left
                  </span>
                </div>
                <p className="font-sans text-xs text-neutral-500">
                  {selectedProgramme.duration} · {artisanData.location}
                </p>
                <p className="font-sans text-xs text-neutral-700 font-medium">
                  {selectedProgramme.fee} · {placesRemaining} {placesRemaining === 1 ? "place" : "places"} left
                </p>
              </div>
            </div>
          </div>

          {/* Portfolio */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="font-heading font-bold text-base text-[#0F1115]">
              Portfolio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {portfolio.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden border border-neutral-200/80 group"
                >
                  <div className="relative aspect-[16/10] bg-neutral-100">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 bg-white">
                    <p className="font-sans font-bold text-xs text-[#0F1115]">
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-[#0F1115]">
                Reviews
              </h3>
              <span className="font-bold text-xs text-[#001B40]">★ 4.9 (10)</span>
            </div>

            <div className="space-y-3">
              {reviews.map((rev, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-neutral-50 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0F1115]">{rev.name}</span>
                    <span className="text-neutral-400">{rev.role}</span>
                  </div>
                  <p className="font-sans text-xs text-neutral-600 leading-relaxed">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Sticky CTA, Certifications, Location */}
        <div className="lg:col-span-4 space-y-6">
          {/* Action CTA Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4 sticky top-24">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase block">
                SELECTED PROGRAMME
              </span>
              <h4 className="font-heading font-bold text-base text-[#0F1115] mt-1">
                {selectedProgramme.title}
              </h4>
              <p className="font-sans text-xs text-neutral-500 mt-1">
                {selectedProgramme.fee} paid once · {selectedProgramme.duration} · 1 place left
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => onApply(selectedProgramme)}
                className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                Apply for a place
              </button>

              <button
                type="button"
                onClick={onMessage || (() => toast.success(`Opening chat with ${artisanData.name}`))}
                className="w-full py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-sans font-semibold text-xs transition-colors cursor-pointer"
              >
                Message {artisanData.name.split(" ")[0]}
              </button>
            </div>
          </div>

          {/* Certifications Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-3">
            <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase block">
              CERTIFICATIONS
            </span>
            <div>
              <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                Trade Test 1 · Welding & fabrication
              </p>
              <p className="font-sans text-[11px] text-neutral-400 mt-0.5">
                Federal Ministry of Labour · 2019
              </p>
            </div>
          </div>

          {/* Workshop Location Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-3">
            <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase block">
              WORKSHOP LOCATION
            </span>
            <div className="h-32 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs mb-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <p className="font-sans font-bold text-xs text-[#001B40]">
                {artisanData.location}
              </p>
              <p className="font-sans text-[11px] text-neutral-500">
                Verified Workshop
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
