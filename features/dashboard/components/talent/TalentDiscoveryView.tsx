"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getTalentProgramsApi } from "@/lib/api/talent";

interface ApprenticeshipProgramme {
  id: string;
  title: string;
  trade: string;
  artisanName: string;
  artisanAvatar: string;
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
  const [selectedTrade, setSelectedTrade] = useState("All trades");
  const [searchQuery, setSearchQuery] = useState("");

  const trades = ["All trades", "Welding", "Electrical", "Plumbing", "Carpentry"];

  const defaultProgrammes: ApprenticeshipProgramme[] = [
    {
      id: "prog-1",
      title: "Welding & Metal Fabrication Apprenticeship",
      trade: "Welding",
      artisanName: "John Obiora",
      artisanAvatar: "/images/david.jpg",
      isVerified: true,
      rating: 4.9,
      experienceYears: 7,
      location: "Emene Industrial Layout",
      duration: "3 months",
      fee: "₦50,000",
      placesLeft: 1,
    },
    {
      id: "prog-2",
      title: "Home Electrical Installation Apprenticeship",
      trade: "Electrical",
      artisanName: "Chinedu Okafor",
      artisanAvatar: "/images/james.jpg",
      isVerified: true,
      rating: 4.8,
      experienceYears: 5,
      location: "New Haven",
      duration: "3 months",
      fee: "₦40,000",
      placesLeft: 1,
    },
    {
      id: "prog-3",
      title: "Pipe Laying & Sanitary Plumbing",
      trade: "Plumbing",
      artisanName: "Michael Obi",
      artisanAvatar: "/images/workers.png",
      isVerified: true,
      rating: 4.7,
      experienceYears: 6,
      location: "Independence Layout",
      duration: "4 months",
      fee: "₦60,000",
      placesLeft: 2,
    },
    {
      id: "prog-4",
      title: "Modern Furniture & Cabinetry",
      trade: "Carpentry",
      artisanName: "Emeka Nwankwo",
      artisanAvatar: "/images/customers.png",
      isVerified: true,
      rating: 4.9,
      experienceYears: 9,
      location: "Ogui Road",
      duration: "6 months",
      fee: "₦75,000",
      placesLeft: 1,
    },
  ];

  const [programmes, setProgrammes] = useState<ApprenticeshipProgramme[]>(defaultProgrammes);

  useEffect(() => {
    let isMounted = true;
    getTalentProgramsApi({
      search: searchQuery || undefined,
    })
      .then((items) => {
        if (!isMounted) return;
        if (items && items.length > 0) {
          const mapped: ApprenticeshipProgramme[] = items.map((p) => {
            const feeKobo = Number(p.fee || 5000000);
            const feeFormatted = `₦${(feeKobo / 100).toLocaleString("en-NG")}`;
            const ratingScore =
              p.artisan?.ArtisanProfile_userId?.ratingTotal &&
              p.artisan?.ArtisanProfile_userId?.ratingCount
                ? Number(
                    (
                      p.artisan.ArtisanProfile_userId.ratingTotal /
                      p.artisan.ArtisanProfile_userId.ratingCount
                    ).toFixed(1)
                  )
                : 4.9;

            return {
              id: p.id,
              title: p.title,
              trade: p.trade?.name || "Trade",
              artisanName: p.artisan?.fullName || "Verified Artisan",
              artisanAvatar: p.artisan?.avatarUrl || "/images/david.jpg",
              isVerified: p.artisan?.ArtisanProfile_userId?.approval === "APPROVED",
              rating: ratingScore,
              experienceYears: p.artisan?.ArtisanProfile_userId?.yearsExperience ?? 5,
              location: p.location || "Enugu",
              duration: `${p.durationWeeks ? Math.round(p.durationWeeks / 4) : 3} months`,
              fee: feeFormatted,
              placesLeft: p.placesLeft ?? 1,
            };
          });
          setProgrammes(mapped);
        }
      })
      .catch(() => {
        // Retain default programs on offline/fallback
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedTrade]);

  const filteredProgrammes = programmes.filter((p) => {
    const matchesTrade = selectedTrade === "All trades" || p.trade === selectedTrade;
    const matchesQuery =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.artisanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.trade.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrade && matchesQuery;
  });

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
          <span>Home</span>
        </button>

        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Learn from a master artisan
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
          Verified programmes in Enugu
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

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {trades.map((trade) => (
          <button
            key={trade}
            type="button"
            onClick={() => setSelectedTrade(trade)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedTrade === trade
                ? "bg-[#001B40] text-white shadow-xs"
                : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {trade}
          </button>
        ))}
      </div>

      {/* Programmes Grid or Empty State */}
      {filteredProgrammes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {filteredProgrammes.map((prog) => (
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
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-100 shrink-0">
                    <Image
                      src={prog.artisanAvatar}
                      alt={prog.artisanName}
                      fill
                      className="object-cover"
                    />
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
                      ★ {prog.rating} · {prog.experienceYears} years · {prog.location}
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
                  {prog.placesLeft} place left
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State Card matching Figma Talent Web · Discover: no programmes nearby */
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-2xs text-center space-y-6 mt-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0F1115]">
              No apprenticeships near you yet
            </h3>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
              There are no open places in {selectedTrade !== "All trades" ? selectedTrade : "Welding"} within 10 km. Try another trade, widen your area, or get notified when a place opens.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedTrade("All trades");
                setSearchQuery("");
              }}
              className="px-6 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Change filters
            </button>
            <button
              type="button"
              onClick={() => {
                import("react-hot-toast").then(({ default: toast }) =>
                  toast.success("We will notify you when places open!")
                );
              }}
              className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              Notify me
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
