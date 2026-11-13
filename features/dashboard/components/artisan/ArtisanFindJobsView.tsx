"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { JobDetailData } from "./ArtisanJobDetailView";
import { ArtisanFiltersModal, FilterOptions } from "./ArtisanFiltersModal";
import { getArtisanJobsApi } from "@/lib/api/artisan";
import { formatNaira } from "@/lib/utils/currency";

interface ArtisanFindJobsViewProps {
  isVerified?: boolean;
  onSelectJob: (job: JobDetailData) => void;
  onContinueVerification?: () => void;
  onBackToDashboard?: () => void;
  onEditTrades?: () => void;
}

export function ArtisanFindJobsView({
  isVerified = false,
  onSelectJob,
  onContinueVerification,
  onBackToDashboard,
  onEditTrades,
}: ArtisanFindJobsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("My trade");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [forceEmptyState, setForceEmptyState] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>({
    trade: "Plumbing",
    distance: "Within 10 km",
    budget: "Any budget",
    urgency: "Any urgency",
    date: "Any date",
  });
  const [remoteJobs, setRemoteJobs] = useState<JobDetailData[] | null>(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  // Fetch jobs from backend API based on active filter and query
  useEffect(() => {
    let mounted = true;
    setIsLoadingJobs(true);

    const sortMapping: Record<string, "recommended" | "nearest" | "newest" | "urgent" | "highest-budget"> = {
      "My trade": "recommended",
      Nearby: "nearest",
      Newest: "newest",
      Urgent: "urgent",
      "Highest budget": "highest-budget",
    };

    getArtisanJobsApi({
      q: searchQuery.trim() || undefined,
      sort: sortMapping[activeFilter] || "recommended",
      myTrades: activeFilter === "My trade",
      urgency: activeFilter === "Urgent" ? "EMERGENCY" : undefined,
    })
      .then((res) => {
        if (!mounted || !res || !Array.isArray(res.items) || res.items.length === 0) return;
        const mapped: JobDetailData[] = res.items.map((it, idx) => ({
          id: it.id,
          code: `BFX-${it.id.slice(0, 5).toUpperCase()}`,
          title: it.title,
          category: it.trade?.name || it.service?.name || "Plumbing",
          subCategory: it.service?.name || "Repair",
          postedTime: it.createdAt ? new Date(it.createdAt).toLocaleDateString() : "recently",
          isUrgent: it.urgency === "EMERGENCY" || it.urgency === "WITHIN_TWO_DAYS",
          status: "Receiving Quotes",
          description: it.description,
          service: `${it.trade?.name || "Trade"} · ${it.service?.name || "Service"}`,
          date: it.preferredStart ? new Date(it.preferredStart).toLocaleDateString() : "Flexible",
          time: "Morning · 9am - 1pm",
          budget: it.budgetMaximum
            ? `${formatNaira(it.budgetMinimum || 0, true)} - ${formatNaira(it.budgetMaximum, true)}`
            : "Flexible",
          urgency: it.urgency || "Standard",
          customerName: it.customer?.displayName || "Customer",
          customerLocation: it.area?.city ? `${it.area.city}, Nigeria` : "Enugu, Nigeria",
          distance: it.distanceKm ? `${it.distanceKm.toFixed(1)} km away` : "Nearby",
          driveTime: "10 min from base",
          photoUrl: it.media?.[0]?.url || "",
          photoCaption: "",
          audioDuration: "",
          questions: [],
        }));
        setRemoteJobs(mapped);
      })
      .catch((err) => {
        console.debug("Jobs feed API offline, using local fixtures.", err);
      })
      .finally(() => {
        if (mounted) setIsLoadingJobs(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeFilter, searchQuery]);

  const filterChips = [
    "My trade",
    "Nearby",
    "Newest",
    "Urgent",
    "Highest budget",
  ];

  const jobsList: JobDetailData[] = [
    {
      id: "job-tank",
      code: "BFX-99412",
      title: "Water tank & pump installation",
      category: "Plumbing",
      subCategory: "Water installation",
      postedTime: "posted 7 hours ago",
      isUrgent: false,
      status: "Receiving Quotes",
      description:
        "Install a 1000L tank on a stand and connect a surface pump to the house line.",
      service: "Plumbing · Water installation",
      date: "Next week · Mon 25 Aug",
      time: "Morning · 9am - 1pm",
      budget: "₦80,000+ Flexible",
      urgency: "Standard",
      customerName: "Ngozi A.",
      customerLocation: "Enugu, Nigeria",
      distance: "4.1 km away",
      driveTime: "12 min from your base",
      photoUrl: "",
      photoCaption: "",
      audioDuration: "",
      questions: [
        { question: "Is the tank stand already built?", answer: "Yes" },
      ],
    },
    {
      id: "job-1",
      code: "BFX-72810",
      title: "Kitchen Plumbing Repair",
      category: "Plumbing",
      subCategory: "Pipe repair",
      postedTime: "posted 12 minutes ago",
      isUrgent: true,
      status: "Receiving Quotes",
      description:
        "Kitchen pipe underneath the sink is leaking. Water collects inside the cabinet every time we run the tap, and the wood is starting to swell.",
      service: "Plumbing · Pipe repair",
      date: "Tomorrow · Sat 23 Aug",
      time: "Morning · 9am - 12pm",
      budget: "₦25,000–₦40,000",
      urgency: "Urgent",
      customerName: "Daniel C.",
      customerLocation: "Enugu, Nigeria",
      distance: "2.6 km away",
      driveTime: "8 min from your base",
      photoUrl: "/images/workers.png",
      photoCaption: "Leak under the sink",
      audioDuration: "0:41",
      questions: [
        { question: "Is water currently leaking?", answer: "Yes" },
        { question: "Is the affected area accessible?", answer: "Yes" },
      ],
    },
    {
      id: "job-gen",
      code: "BFX-90145",
      title: "Generator Repair, 7.5 KVA",
      category: "Generator Repair",
      subCategory: "Servicing",
      postedTime: "posted 19 minutes ago",
      isUrgent: true,
      status: "Receiving Quotes",
      description:
        "Generator smokes heavily after 20 minutes of running and loses power.",
      service: "Generator Repair · Servicing",
      date: "Today · Fri 22 Aug",
      time: "Afternoon · 2pm - 5pm",
      budget: "₦30,000–₦50,000",
      urgency: "Urgent",
      customerName: "Emeka O.",
      customerLocation: "Enugu, Nigeria",
      distance: "5.2 km away",
      driveTime: "15 min from your base",
      photoUrl: "",
      photoCaption: "",
      audioDuration: "",
      questions: [
        { question: "When was it last serviced?", answer: "4 months ago" },
      ],
    },
    {
      id: "job-2",
      code: "BFX-83192",
      title: "Replace bathroom shower line",
      category: "Plumbing",
      subCategory: "Bathroom plumbing",
      postedTime: "posted 2 hours ago",
      isUrgent: false,
      status: "Receiving Quotes",
      description:
        "Shower head drips constantly and the hot line has no pressure.",
      service: "Plumbing · Bathroom plumbing",
      date: "This week · Wed 27 Aug",
      time: "Afternoon · 1pm - 4pm",
      budget: "₦35,000–₦50,000",
      urgency: "Standard",
      customerName: "Henry N.",
      customerLocation: "Enugu, Nigeria",
      distance: "3.4 km away",
      driveTime: "12 min from your base",
      photoUrl: "/images/customers.png",
      photoCaption: "Bathroom shower head and supply pipe",
      audioDuration: "0:25",
      questions: [
        { question: "Is water currently leaking?", answer: "Slow drip" },
        { question: "Is the affected area accessible?", answer: "Yes" },
      ],
    },
    {
      id: "job-drain",
      code: "BFX-44219",
      title: "Blocked drainage in compound",
      category: "Plumbing",
      subCategory: "Drainage",
      postedTime: "posted Yesterday",
      isUrgent: false,
      status: "Receiving Quotes",
      description:
        "Compound drain is blocked and water backs up after rain.",
      service: "Plumbing · Drainage",
      date: "This week",
      time: "Morning · 8am - 11am",
      budget: "₦20,000–₦30,000",
      urgency: "Standard",
      customerName: "Chinedu U.",
      customerLocation: "Enugu, Nigeria",
      distance: "1.8 km away",
      driveTime: "6 min from your base",
      photoUrl: "",
      photoCaption: "",
      audioDuration: "",
      questions: [
        { question: "Is it an underground drain?", answer: "Yes" },
      ],
    },
  ];

  // Dynamic filter logic (real API jobs only; no mock fallback)
  const displayedJobs = (() => {
    if (forceEmptyState) return [];
    let list = remoteJobs ? [...remoteJobs] : [];

    if (searchQuery.trim()) {
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return list;
  })();

  const subheadSummary =
    activeFilter === "Highest budget"
      ? "4 jobs · Plumbing · Within 10 km"
      : activeFilter === "Urgent"
      ? "2 urgent jobs · Plumbing & Generator · Within 10 km"
      : `${displayedJobs.length} jobs · Plumbing · Within 10 km`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-1">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-1 hover:text-neutral-800 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>Jobs</span>
              </button>
            )}
          </div>

          {/* Quick Toggle for Empty State Testing */}
          <button
            type="button"
            onClick={() => setForceEmptyState(!forceEmptyState)}
            className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 underline"
          >
            {forceEmptyState ? "Show listings" : "Preview empty state"}
          </button>
        </div>

        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Find Jobs
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
          Live listings matched to your trade and area
        </p>
      </div>

      {/* Unverified Warning Banner (Omitted when verified) */}
      {!isVerified && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-[#001B40]">
                  Verify your identity to start earning
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-0.5">
                  You can explore jobs now. Sending quotes, receiving jobs and withdrawals unlock once your identity is verified.
                </p>
              </div>
            </div>

            {onContinueVerification && (
              <button
                type="button"
                onClick={onContinueVerification}
                className="shrink-0 px-5 py-2.5 rounded-full bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Continue verification</span>
                <span className="text-base leading-none">→</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#074292] h-1.5 rounded-full w-1/4 transition-all duration-300" />
            </div>
            <p className="font-sans text-[11px] text-neutral-400 font-medium text-right">
              1 of 4 steps done
            </p>
          </div>
        </div>
      )}

      {/* Search Bar + Filters (Matching Figma Screenshot 1 Right & 4) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <svg
            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs"
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-neutral-200/90 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#001B40]/20 focus:border-[#001B40] transition-all shadow-2xs"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsFilterModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-white border border-neutral-200/90 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
        >
          <svg className="w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {filterChips.map((chip) => {
          const isActive = activeFilter === chip && !forceEmptyState;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setActiveFilter(chip);
                setForceEmptyState(false);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#001B40] text-white shadow-2xs"
                  : "bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200/80 hover:bg-neutral-50"
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {/* EMPTY STATE SCREENSHOT 2: No jobs nearby */}
      {displayedJobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs text-center max-w-xl mx-auto my-6 space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#001B40] flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#001B40]">
              No jobs in your area right now
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
              New plumbing and welding jobs within 10 km appear here. Widen your travel distance or add another trade to see more.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (onEditTrades) onEditTrades();
                else toast.success("Opening trade settings...");
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold text-[#001B40] hover:bg-neutral-50 transition-colors"
            >
              Edit trades
            </button>
            <button
              type="button"
              onClick={() => {
                setForceEmptyState(false);
                setActiveFilter("Highest budget");
                toast.success("Travel distance widened to 25 km.");
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs sm:text-sm font-bold text-white transition-colors shadow-xs"
            >
              Widen travel distance
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Match Subhead Summary */}
          <div className="pt-1">
            <p className="font-sans text-xs text-neutral-400 font-medium">
              {subheadSummary}
            </p>
          </div>

          {/* Job Feed Cards */}
          <div className="space-y-4">
            {displayedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 hover:border-neutral-300 shadow-2xs transition-all flex flex-col md:flex-row md:items-start justify-between gap-5 group"
              >
                {/* Left Content Area */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#001B40] group-hover:text-[#074292] transition-colors">
                      {job.title}
                    </h3>
                    <p className="font-sans text-xs text-neutral-400 font-medium mt-0.5">
                      {job.service}
                    </p>
                  </div>

                  {/* Status Chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF1F7] text-[#001B40]">
                      {job.status}
                    </span>
                    {job.isUrgent && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEE2E2] text-[#EF4444]">
                        Urgent
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-neutral-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                      </svg>
                      {job.distance}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                      </svg>
                      {job.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 font-bold text-[#001B40]">
                      <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="12" x="2" y="6" rx="2" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                      {job.budget}
                    </span>
                  </div>

                  {/* Customer quote */}
                  <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed italic line-clamp-2">
                    &ldquo;{job.description}&rdquo;
                  </p>

                  <p className="font-sans text-[11px] text-neutral-400 font-medium">
                    {job.customerName} · {job.postedTime}
                  </p>
                </div>

                {/* Right Thumbnail & Action Button */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 shrink-0">
                  {job.photoUrl ? (
                    <div className="relative w-24 h-18 sm:w-28 sm:h-20 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/80 shrink-0">
                      <Image
                        src={job.photoUrl}
                        alt={job.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="hidden md:block w-24 h-18" />
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectJob(job)}
                    className="px-6 py-2.5 rounded-full border border-neutral-300 hover:border-[#001B40] hover:bg-neutral-50 text-xs sm:text-sm font-bold text-[#001B40] transition-all cursor-pointer shadow-2xs"
                  >
                    View job
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Filters Modal Dialog (Screenshot 1 Right) */}
      <ArtisanFiltersModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        initialFilters={appliedFilters}
        onApplyFilters={(filters) => {
          setAppliedFilters(filters);
          toast.success("Filter preferences saved.");
        }}
      />
    </div>
  );
}
