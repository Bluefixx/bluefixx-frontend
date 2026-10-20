"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import JobPostingsView from "@/features/dashboard/components/JobPostingsView";
import SecureJobPaymentView from "@/features/dashboard/components/SecureJobPaymentView";

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"job-posts" | "active" | "completed">(
    tabParam === "active"
      ? "active"
      : tabParam === "completed"
      ? "completed"
      : "job-posts"
  );

  const [isSecuringActiveBooking, setIsSecuringActiveBooking] = useState(false);

  useEffect(() => {
    if (tabParam === "active") setActiveTab("active");
    else if (tabParam === "completed") setActiveTab("completed");
    else if (tabParam === "job-posts") setActiveTab("job-posts");
  }, [tabParam]);

  const handleTabChange = (newTab: "job-posts" | "active" | "completed") => {
    setActiveTab(newTab);
    router.replace(`/bookings?tab=${newTab}`, { scroll: false });
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Header Tabs */}
      <div className="flex items-center gap-4 sm:gap-6 border-b border-neutral-200">
        <button
          type="button"
          onClick={() => handleTabChange("job-posts")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === "job-posts"
              ? "text-[#001B40] border-b-2 border-[#001B40]"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          Job posts (3)
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("active")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === "active"
              ? "text-[#001B40] border-b-2 border-[#001B40]"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          Active bookings (1)
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("completed")}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === "completed"
              ? "text-[#001B40] border-b-2 border-[#001B40]"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          Completed (4)
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 1. JOB POSTS VIEW (Screenshots 1 - 5)                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "job-posts" && <JobPostingsView />}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 2. ACTIVE BOOKINGS                                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "active" && (
        isSecuringActiveBooking ? (
          <SecureJobPaymentView
            onBackToJobs={() => setIsSecuringActiveBooking(false)}
            onViewJobDetail={() => setIsSecuringActiveBooking(false)}
          />
        ) : (
          <div className="space-y-4">
            {/* Booking 1: Securing & Scheduling Available */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">
                    PLUMBING
                  </span>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Payment Pending
                  </span>
                </div>
                <h3 className="font-sans font-bold text-base text-[#0F1115]">
                  Bathroom Plumbing Repair
                </h3>
                <p className="font-sans text-xs text-neutral-500 mt-1">
                  Accepted quote from <span className="font-semibold text-neutral-800">Emeka Okafor</span> · 14 Ogui Road, Independence Layout
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                <span className="font-sans font-bold text-base text-[#001B40]">
                  ₦120,000
                </span>
                <button
                  type="button"
                  onClick={() => setIsSecuringActiveBooking(true)}
                  className="px-4 py-2 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs font-semibold cursor-pointer"
                >
                  Secure Escrow & Schedule
                </button>
              </div>
            </div>

            {/* Booking 2: Artisan En Route */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">
                    PLUMBING
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Artisan En Route
                  </span>
                </div>
                <h3 className="font-sans font-bold text-base text-[#0F1115]">
                  Kitchen Sink Pipe Leak & Pressure Valve Repair
                </h3>
                <p className="font-sans text-xs text-neutral-500 mt-1">
                  Assigned to <span className="font-semibold text-neutral-800">David Eze</span> (Plumber) · Arriving today around 2:00 PM
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                <span className="font-sans font-bold text-base text-[#001B40]">
                  ₦18,500
                </span>
                <span className="text-[11px] text-neutral-400">Escrow Held Safely</span>
                <button
                  type="button"
                  onClick={() => toast("Calling David Eze (+234 803 111 2233)...", { icon: "📞" })}
                  className="px-4 py-2 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs font-semibold cursor-pointer"
                >
                  Contact Artisan
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 3. COMPLETED BOOKINGS                                      */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "completed" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded uppercase">
                ELECTRICAL
              </span>
              <h3 className="font-sans font-bold text-base text-[#0F1115] mt-1">
                Distribution Box Circuit Breaker Replacement
              </h3>
              <p className="font-sans text-xs text-neutral-500 mt-1">
                Completed by <span className="font-semibold text-neutral-800">John Okafor</span> · 7-day warranty active
              </p>
            </div>
            <div className="text-right">
              <span className="font-sans font-bold text-base text-neutral-900">
                ₦22,000
              </span>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                ✓ Escrow Released
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Post a Job Reminder Banner (Shown on Active & Completed tabs) */}
      {activeTab !== "job-posts" && (
        <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div>
            <h4 className="font-bold text-[#001B40]">Need another job done?</h4>
            <p className="text-neutral-600 mt-0.5">Post a job to get competitive quotes from top-rated professionals.</p>
          </div>
          <Link
            href="/post-job"
            className="px-4 py-2 rounded-xl bg-[#001B40] text-white font-semibold text-xs text-center shrink-0 hover:bg-[#052F5F] transition-colors"
          >
            + Post a job
          </Link>
        </div>
      )}
    </div>
  );
}
