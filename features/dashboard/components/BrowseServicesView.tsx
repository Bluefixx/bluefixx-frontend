"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, SERVICES, Category, ServiceItem } from "../data/mock-dashboard-data";

export default function BrowseServicesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [activeCategoryId, setActiveCategoryId] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState<string>(initialQuery);

  // Filter services by category and search
  const filteredServices = useMemo(() => {
    return SERVICES.filter((service) => {
      const matchesCategory =
        activeCategoryId === "all" || service.categoryId === activeCategoryId;
      const matchesSearch =
        !searchTerm.trim() ||
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategoryId, searchTerm]);

  // Group filtered services by category
  const groupedCategories = useMemo(() => {
    const map = new Map<string, { category: Category; items: ServiceItem[] }>();

    CATEGORIES.filter((c) => c.id !== "all").forEach((cat) => {
      const items = filteredServices.filter((s) => s.categoryId === cat.id);
      if (items.length > 0) {
        map.set(cat.id, { category: cat, items });
      }
    });

    return Array.from(map.values());
  }, [filteredServices]);

  const handleSelectService = (service: ServiceItem) => {
    router.push(`/dashboard/post-job?serviceId=${service.id}`);
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Breadcrumb Header */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
          <span>Explore</span>
          <span>/</span>
          <span className="text-neutral-700 font-medium">All categories</span>
        </nav>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
          Browse services
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
          29 services. Five categories. Find the right professional for the job.
        </p>
      </div>

      {/* Search Bar with Category Filter */}
      <div className="bg-white rounded-2xl p-2 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a service or job"
            className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
        </div>

        <div className="h-6 w-px bg-neutral-200 hidden sm:block" />

        <div className="relative w-full sm:w-auto">
          <select
            value={activeCategoryId}
            onChange={(e) => setActiveCategoryId(e.target.value)}
            className="w-full sm:w-48 bg-transparent py-2 pl-3 pr-8 text-xs sm:text-sm text-neutral-700 font-medium focus:outline-none cursor-pointer appearance-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </div>

      {/* Main 2-Column Content: Categories Filter (Left) & Services Grid (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Category Pills & Not Sure Where to Start Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-3 border border-neutral-200/80 shadow-2xs space-y-1">
            <span className="font-sans font-bold text-[11px] tracking-wider text-neutral-400 uppercase px-3 py-1.5 block">
              CATEGORIES
            </span>
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/80 font-bold text-[#001B40]"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 font-medium"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span
                    className={`text-xs ml-2 ${
                      isSelected ? "text-[#001B40] font-bold" : "text-neutral-400"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Not Sure Where to Start CTA Card */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs space-y-3">
            <h4 className="font-heading font-bold text-sm sm:text-base text-[#0F1115]">
              Not sure where to start?
            </h4>
            <p className="font-sans text-xs text-neutral-500 leading-relaxed">
              Describe your problem and let matched artisans send you a quote.
            </p>
            <Link
              href="/dashboard/post-job"
              className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-semibold text-xs sm:text-sm transition-all shadow-xs"
            >
              Post a job
            </Link>
          </div>
        </div>

        {/* Right Column: Grouped Category Services Cards */}
        <div className="lg:col-span-3 space-y-8">
          {groupedCategories.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200/80">
              <p className="text-sm font-semibold text-neutral-800">No services found</p>
              <p className="text-xs text-neutral-500 mt-1">
                Try searching for something else or clearing your category filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategoryId("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-[#001B40] text-white text-xs font-semibold"
              >
                Reset filters
              </button>
            </div>
          ) : (
            groupedCategories.map(({ category, items }) => (
              <div key={category.id} className="space-y-3.5">
                {/* Category Header */}
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115] flex items-center gap-2">
                      <span>{category.name}</span>
                    </h3>
                    <p className="font-sans text-xs text-neutral-500">
                      {category.id === "home-construction" && "Build, fix and finish your space"}
                      {category.id === "repairs-technical" && "Get machines and appliances working again"}
                      {category.id === "automotive" && "Vehicle diagnosis, repair, and detailing"}
                      {category.id === "fashion-beauty" && "Personal grooming, tailoring, and style"}
                      {category.id === "facility-property" && "Property maintenance, cleaning, and security"}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400 font-medium">
                    {items.length} services
                  </span>
                </div>

                {/* 2-Column Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {items.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleSelectService(service)}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 hover:border-[#001B40] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-sans font-bold text-sm sm:text-base text-[#0F1115] group-hover:text-[#001B40] transition-colors">
                            {service.name}
                          </h4>
                          <p className="font-sans text-xs text-neutral-500 mt-1 leading-relaxed">
                            {service.description}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[11px] text-neutral-400 block">from</span>
                          <span className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                            ₦{service.startingPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                        <span className="font-medium text-blue-600 group-hover:underline">
                          Request quote / Book →
                        </span>
                        <span className="text-[11px] text-neutral-400">Verified artisans</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
