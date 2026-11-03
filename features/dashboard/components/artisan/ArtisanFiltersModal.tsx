"use client";

import React, { useState } from "react";

export interface FilterOptions {
  trade: string;
  distance: string;
  budget: string;
  urgency: string;
  date: string;
}

interface ArtisanFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters?: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
}

export function ArtisanFiltersModal({
  isOpen,
  onClose,
  initialFilters = {
    trade: "Plumbing",
    distance: "Within 10 km",
    budget: "Any budget",
    urgency: "Any urgency",
    date: "Any date",
  },
  onApplyFilters,
}: ArtisanFiltersModalProps) {
  const [selectedTrade, setSelectedTrade] = useState(initialFilters.trade);
  const [selectedDistance, setSelectedDistance] = useState(initialFilters.distance);
  const [selectedBudget, setSelectedBudget] = useState(initialFilters.budget);
  const [selectedUrgency, setSelectedUrgency] = useState(initialFilters.urgency);
  const [selectedDate, setSelectedDate] = useState(initialFilters.date);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters({
      trade: selectedTrade,
      distance: selectedDistance,
      budget: selectedBudget,
      urgency: selectedUrgency,
      date: selectedDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200/80 space-y-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-heading font-extrabold text-[#001B40]">
              Filters
            </h2>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Only jobs you can realistically take
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Filter Sections */}
        <div className="space-y-5 max-h-[65vh] overflow-y-auto no-scrollbar pr-1">
          {/* 1. Trade */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700">Trade</label>
            <div className="flex flex-wrap gap-2">
              {["Plumbing", "Tiling", "Generator Repair", "All trades"].map((trade) => {
                const isActive = selectedTrade === trade;
                return (
                  <button
                    key={trade}
                    type="button"
                    onClick={() => setSelectedTrade(trade)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#001B40] text-white shadow-2xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
                    }`}
                  >
                    {trade}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Distance */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700">Distance</label>
            <div className="flex flex-wrap gap-2">
              {["Within 5 km", "Within 10 km", "Within 25 km", "Any distance"].map((dist) => {
                const isActive = selectedDistance === dist;
                return (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => setSelectedDistance(dist)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#001B40] text-white shadow-2xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
                    }`}
                  >
                    {dist}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Budget */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700">Budget</label>
            <div className="flex flex-wrap gap-2">
              {["Any budget", "₦25k+", "₦50k+", "₦100k+"].map((b) => {
                const isActive = selectedBudget === b;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBudget(b)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#001B40] text-white shadow-2xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Urgency */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700">Urgency</label>
            <div className="flex flex-wrap gap-2">
              {["Any urgency", "Urgent", "Soon", "Flexible"].map((u) => {
                const isActive = selectedUrgency === u;
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setSelectedUrgency(u)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#001B40] text-white shadow-2xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
                    }`}
                  >
                    {u}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Date */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700">Date</label>
            <div className="flex flex-wrap gap-2">
              {["Any date", "Today", "Tomorrow", "This week"].map((d) => {
                const isActive = selectedDate === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDate(d)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#001B40] text-white shadow-2xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
          >
            Show
          </button>
        </div>
      </div>
    </div>
  );
}

