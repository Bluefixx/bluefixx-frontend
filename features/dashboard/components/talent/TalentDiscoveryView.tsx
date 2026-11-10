"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getTalentProgramsApi } from "@/lib/api/talent";
import { getServicesApi } from "@/lib/api/customer";
import { formatNaira } from "@/lib/utils/currency";

export interface ApprenticeshipProgramme {
  id: string;
  title: string;
  trade: string;
  artisanName: string;
  artisanAvatar?: string;
  isVerified: boolean;
  rating: number;
  experienceYears: number;
  location: string;
  duration: string;
  fee: string;
  placesLeft: number;
}

interface TalentDiscoveryViewProps {
  onBack: () => void;
  onSelectProgramme: (programme: ApprenticeshipProgramme) => void;
}

export function TalentDiscoveryView({
  onBack,
  onSelectProgramme,
}: TalentDiscoveryViewProps) {
  const [selectedTradeId, setSelectedTradeId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [trades, setTrades] = useState<{ id: string; name: string }[]>([
    { id: "all", name: "All trades" },
  ]);
  const [programmes, setProgrammes] = useState<ApprenticeshipProgramme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real trade categories from service catalog
  useEffect(() => {
    let isMounted = true;
    getServicesApi()
      .then((categories) => {
        if (!isMounted || !categories) return;
        const mappedTrades = categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
        }));
        setTrades([{ id: "all", name: "All trades" }, ...mappedTrades]);
      })
      .catch(() => {
        // Fallback default trade names if categories endpoint fails
        setTrades([
          { id: "all", name: "All trades" },
          { id: "welding", name: "Welding" },
          { id: "electrical", name: "Electrical" },
          { id: "plumbing", name: "Plumbing" },
          { id: "carpentry", name: "Carpentry" },
        ]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch real talent apprenticeship programmes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const tradeParam = selectedTradeId !== "all" ? selectedTradeId : undefined;

    getTalentProgramsApi({
      search: searchQuery.trim() || undefined,
      tradeId: tradeParam,
    })
      .then((items) => {
        if (!isMounted) return;
        if (!items || items.length === 0) {
          setProgrammes([]);
          return;
        }

        const mapped: ApprenticeshipProgramme[] = items.map((p) => {
          const feeKobo = Number(p.fee || 0);
          const feeFormatted = formatNaira(feeKobo, true);
          const ratingScore =
            p.artisan?.ArtisanProfile_userId?.ratingTotal &&
              p.artisan?.ArtisanProfile_userId?.ratingCount
              ? Number(
                (
                  p.artisan.ArtisanProfile_userId.ratingTotal /
                  p.artisan.ArtisanProfile_userId.ratingCount
                ).toFixed(1)
              )
              : 5.0;

          return {
            id: p.id,
            title: p.title,
            trade: p.trade?.name || "Technical Trade",
            artisanName: p.artisan?.fullName || "Verified Artisan",
            artisanAvatar: p.artisan?.avatarUrl,
            isVerified: p.artisan?.ArtisanProfile_userId?.approval === "APPROVED",
            rating: ratingScore,
            experienceYears: p.artisan?.ArtisanProfile_userId?.yearsExperience ?? 5,
            location: p.location || "Enugu",
            duration: p.durationWeeks ? `${p.durationWeeks} weeks` : "Flexible",
            fee: feeFormatted,
            placesLeft: p.placesLeft ?? 1,
          };
        });

        setProgrammes(mapped);
      })
      .catch(() => {
        if (isMounted) setProgrammes([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedTradeId]);

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto select-none animate-in fade-in duration-200">
      {/* Top Header*/}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Home</span>
        </button>

        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Learn from a master artisan
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
          Verified apprenticeship programmes in Enugu
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search a trade or programme"
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-neutral-200/90 focus:border-[#001B40] focus:outline-hidden text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 shadow-2xs transition-colors"
        />
      </div>

      {/*Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {trades.map((trade) => (
          <button
            key={trade.id}
            type="button"
            onClick={() => setSelectedTradeId(trade.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${selectedTradeId === trade.id
                ? "bg-[#001B40] text-white shadow-xs"
                : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
          >
            {trade.name}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4 animate-pulse"
            >
              <div className="h-5 bg-neutral-100 rounded-md w-3/4" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-neutral-100 rounded-md w-1/3" />
                  <div className="h-3 bg-neutral-100 rounded-md w-1/2" />
                </div>
              </div>
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <div className="h-4 bg-neutral-100 rounded-md w-24" />
                <div className="h-4 bg-neutral-100 rounded-md w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : programmes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {programmes.map((prog) => (
            <div
              key={prog.id}
              onClick={() => onSelectProgramme(prog)}
              className="bg-white rounded-3xl p-6 border border-neutral-200/80 hover:border-[#001B40]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115] group-hover:text-blue-900 transition-colors">
                  {prog.title}
                </h3>

                {/* Master Artisan Row */}
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#001B40] text-white flex items-center justify-center font-heading font-bold text-xs shrink-0">
                    {prog.artisanAvatar ? (
                      <Image
                        src={prog.artisanAvatar}
                        alt={prog.artisanName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span>{prog.artisanName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                        {prog.artisanName}
                      </span>
                      {prog.isVerified && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-[11px] text-neutral-400 mt-0.5">
                      ★ {prog.rating} · {prog.experienceYears} yrs exp · {prog.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Specs Pills Row */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-neutral-600 bg-neutral-50 border border-neutral-100 px-2.5 py-1 rounded-lg">
                    {prog.duration}
                  </span>
                  <span className="text-[11px] font-bold text-[#001B40] bg-neutral-50 border border-neutral-100 px-2.5 py-1 rounded-lg">
                    {prog.fee}
                  </span>
                </div>

                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  {prog.placesLeft} {prog.placesLeft === 1 ? "place" : "places"} left
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Dynamic Empty State */
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-2xs text-center space-y-6 mt-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0F1115]">
              No apprenticeships found
            </h3>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? `No apprenticeship programmes match "${searchQuery}". Try a different keyword or trade.`
                : "There are currently no open programmes published for this trade. Check back soon or select another category."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {(selectedTradeId !== "all" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTradeId("all");
                  setSearchQuery("");
                }}
                className="px-6 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Clear filters
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                import("react-hot-toast").then(({ default: toast }) =>
                  toast.success("We will notify you when new apprenticeships open!")
                );
              }}
              className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              Get notified
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
