"use client";

import React from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";

interface ArtisanHomeViewProps {
  onSwitchToCustomer: () => void;
}

export default function ArtisanHomeView({
  onSwitchToCustomer,
}: ArtisanHomeViewProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-xs sm:text-sm text-neutral-500 font-medium flex items-center gap-1.5">
            Artisan Portal <span className="text-base">🔧</span>
          </span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] mt-1 tracking-tight">
            Welcome back, {user?.fullName || "Artisan"}
          </h1>
        </div>

        <button
          onClick={onSwitchToCustomer}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 font-sans font-semibold text-xs sm:text-sm text-neutral-800 transition-colors cursor-pointer w-fit"
        >
          <span>Switch to Customer view</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs">
          <p className="text-xs text-neutral-500 font-medium">Job Leads Nearby</p>
          <p className="font-heading font-bold text-2xl text-[#001B40] mt-1">14</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">
            ● 4 new today in Enugu
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs">
          <p className="text-xs text-neutral-500 font-medium">Active Quotes</p>
          <p className="font-heading font-bold text-2xl text-[#001B40] mt-1">3</p>
          <span className="text-[11px] text-blue-600 font-medium mt-1 inline-block">
            2 pending customer response
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs">
          <p className="text-xs text-neutral-500 font-medium">Completed Jobs</p>
          <p className="font-heading font-bold text-2xl text-[#001B40] mt-1">48</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">
            100% Escrow Released
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs">
          <p className="text-xs text-neutral-500 font-medium">Profile Rating</p>
          <p className="font-heading font-bold text-2xl text-[#001B40] mt-1 flex items-center gap-1.5">
            <span>4.9</span>
            <span className="text-amber-500 text-lg">★</span>
          </p>
          <span className="text-[11px] text-neutral-400 mt-1 inline-block">
            Based on 52 verified reviews
          </span>
        </div>
      </div>

      {/* Available Job Leads for Bidding */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-lg sm:text-xl text-[#0F1115]">
            Open job requests in your area
          </h3>
          <span className="text-xs text-neutral-500 font-medium">Filtered to: Enugu</span>
        </div>

        <div className="space-y-3.5">
          {[
            {
              id: "job-1",
              title: "Kitchen sink pipe leakage & low pressure",
              category: "Plumbing",
              location: "Independence Layout, Enugu (1.8 km away)",
              budget: "₦15,000 - ₦25,000",
              postedAt: "25 mins ago",
              urgency: "Emergency, today",
            },
            {
              id: "job-2",
              title: "AC servicing and gas refill for 2 split units",
              category: "Repairs & Technical",
              location: "GRA, Enugu (3.4 km away)",
              budget: "₦30,000 - ₦40,000",
              postedAt: "1 hour ago",
              urgency: "Within 2 days",
            },
            {
              id: "job-3",
              title: "Full ceiling POP touch-up & room screeding",
              category: "Home & Construction",
              location: "New Haven, Enugu (2.9 km away)",
              budget: "₦45,000 - ₦60,000",
              postedAt: "3 hours ago",
              urgency: "This week",
            },
          ].map((lead) => (
            <div
              key={lead.id}
              className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                    {lead.category}
                  </span>
                  <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                    {lead.urgency}
                  </span>
                  <span className="text-xs text-neutral-400">• {lead.postedAt}</span>
                </div>
                <h4 className="font-sans font-bold text-sm sm:text-base text-[#0F1115]">
                  {lead.title}
                </h4>
                <p className="font-sans text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{lead.location}</span>
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                <span className="font-sans font-bold text-sm sm:text-base text-[#001B40]">
                  {lead.budget}
                </span>
                <button
                  onClick={() => toast.success(`Quote draft initiated for ${lead.title}`)}
                  className="px-4 py-2 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                >
                  Submit quote
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
