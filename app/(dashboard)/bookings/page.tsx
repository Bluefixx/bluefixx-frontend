"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import JobPostingsView from "@/features/dashboard/components/JobPostingsView";
import SecureJobPaymentView from "@/features/dashboard/components/SecureJobPaymentView";
import JobProgressTrackerView from "@/features/dashboard/components/JobProgressTrackerView";
import PaymentReleasedView from "@/features/dashboard/components/PaymentReleasedView";
import RateArtisanView from "@/features/dashboard/components/RateArtisanView";
import WarrantyClaimView from "@/features/dashboard/components/WarrantyClaimView";
import WarrantyClaimSentView from "@/features/dashboard/components/WarrantyClaimSentView";
import { getBookingsApi, getJobsApi } from "@/lib/api";
import { Booking } from "@/types/customer";

function BookingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const viewParam = searchParams.get("view");

  const [activeTab, setActiveTab] = useState<"job-posts" | "active" | "completed">(
    tabParam === "active"
      ? "active"
      : tabParam === "completed"
      ? "completed"
      : "job-posts"
  );

  const [jobPostsCount, setJobPostsCount] = useState<number>(0);
  const [activeBookingsList, setActiveBookingsList] = useState<Booking[]>([]);
  const [completedBookingsList, setCompletedBookingsList] = useState<Booking[]>([]);
  const [selectedActiveBookingId, setSelectedActiveBookingId] = useState<string | null>(null);
  const [selectedCompletedBookingId, setSelectedCompletedBookingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchBookings() {
      try {
        const [jobsRes, activeRes, completedRes] = await Promise.allSettled([
          getJobsApi(),
          getBookingsApi({ tab: "active" }),
          getBookingsApi({ tab: "completed" }),
        ]);
        if (!mounted) return;
        if (jobsRes.status === "fulfilled" && Array.isArray(jobsRes.value)) {
          setJobPostsCount(jobsRes.value.length);
        }
        if (activeRes.status === "fulfilled" && Array.isArray(activeRes.value)) {
          setActiveBookingsList(activeRes.value);
          if (activeRes.value[0]?.id) {
            setSelectedActiveBookingId(activeRes.value[0].id);
          }
        }
        if (completedRes.status === "fulfilled" && Array.isArray(completedRes.value)) {
          setCompletedBookingsList(completedRes.value);
          if (completedRes.value[0]?.id) {
            setSelectedCompletedBookingId(completedRes.value[0].id);
          }
        }
      } catch {
        // Fallback silently
      }
    }
    fetchBookings();
    return () => {
      mounted = false;
    };
  }, []);

  const [isSecuringActiveBooking, setIsSecuringActiveBooking] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<"tracker" | "list">("list");
  const [completedViewMode, setCompletedViewMode] = useState<
    "list" | "payment-released" | "rate-artisan" | "warranty-claim" | "warranty-claim-sent"
  >(
    viewParam === "rate"
      ? "rate-artisan"
      : viewParam === "warranty"
      ? "warranty-claim"
      : "list"
  );

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
          Job posts ({jobPostsCount})
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
          Active bookings ({activeBookingsList.length})
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
          Completed ({completedBookingsList.length})
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 1. JOB POSTS VIEW (Screenshots 1 - 5)                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "job-posts" && (
        <JobPostingsView onJobsLoaded={(count) => setJobPostsCount(count)} />
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 2. ACTIVE BOOKINGS                                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "active" && (
        isSecuringActiveBooking ? (
          <SecureJobPaymentView
            bookingId={selectedActiveBookingId ?? undefined}
            onBackToJobs={() => setIsSecuringActiveBooking(false)}
            onViewJobDetail={() => {
              setIsSecuringActiveBooking(false);
              setActiveViewMode("tracker");
            }}
          />
        ) : activeViewMode === "tracker" ? (
          <JobProgressTrackerView
            jobId={selectedActiveBookingId || "BFX-20481"}
            onBack={() => setActiveViewMode("list")}
            onPaymentReleased={() => {
              handleTabChange("completed");
              setCompletedViewMode("payment-released");
            }}
          />
        ) : (
          <div className="space-y-4">
            {activeBookingsList.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-neutral-200/80 shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#001B40] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-base text-neutral-800">No active bookings in progress</h3>
                <p className="font-sans text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  When you accept an artisan quote or fund an escrow, your active scheduled bookings will appear here.
                </p>
                <div className="mt-4">
                  <Link href="/post-job" className="px-4 py-2 rounded-xl bg-[#001B40] text-white text-xs font-semibold">
                    Post a job
                  </Link>
                </div>
              </div>
            ) : (
              activeBookingsList.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">
                        BOOKING #{booking.id.slice(0, 8)}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        {booking.status.replace(/_/g, " ")} · Escrow {booking.funded ? "Secured" : "Pending"}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-base text-[#0F1115]">
                      Service Booking
                    </h3>
                    <p className="font-sans text-xs text-neutral-500 mt-1">
                      Visit: {booking.visitStart ? new Date(booking.visitStart).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "Scheduled"}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                    <span className="font-sans font-bold text-base text-[#001B40]">
                      ₦{(parseInt(booking.base, 10) / 100).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedActiveBookingId(booking.id);
                          setActiveViewMode("tracker");
                        }}
                        className="px-4 py-2 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                      >
                        Track Progress →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 3. COMPLETED BOOKINGS                                      */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "completed" && (
        completedViewMode === "payment-released" ? (
          <PaymentReleasedView
            onBack={() => setCompletedViewMode("list")}
            onLeaveReview={() => setCompletedViewMode("rate-artisan")}
            onFileWarrantyClaim={() => setCompletedViewMode("warranty-claim")}
          />
        ) : completedViewMode === "rate-artisan" ? (
          <RateArtisanView
            bookingId={selectedCompletedBookingId || "BFX-BK-20541"}
            onBack={() => setCompletedViewMode("list")}
            onSubmitSuccess={() => setCompletedViewMode("list")}
          />
        ) : completedViewMode === "warranty-claim" ? (
          <WarrantyClaimView
            onBack={() => setCompletedViewMode("list")}
            onSubmitSuccess={() => setCompletedViewMode("warranty-claim-sent")}
          />
        ) : completedViewMode === "warranty-claim-sent" ? (
          <WarrantyClaimSentView
            onBack={() => setCompletedViewMode("list")}
            onViewBooking={() => setCompletedViewMode("list")}
          />
        ) : (
          <div className="space-y-4">
            {completedBookingsList.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-neutral-200/80 shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-base text-neutral-800">No completed bookings yet</h3>
                <p className="font-sans text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Your completed jobs, warranty receipts, and review requests will be available here once an artisan finishes work.
                </p>
              </div>
            ) : (
              completedBookingsList.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded uppercase">
                        COMPLETED #{booking.id.slice(0, 8)}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Warranty protected
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-base text-[#0F1115]">
                      Service Booking
                    </h3>
                    <p className="font-sans text-xs text-neutral-500 mt-1">
                      Completed {booking.completedAt ? new Date(booking.completedAt).toLocaleDateString("en-NG", { dateStyle: "medium" }) : "Recently"}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                    <span className="font-sans font-bold text-base text-[#001B40]">
                      ₦{(parseInt(booking.base, 10) / 100).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      ✓ {booking.released ? "Payment Released" : "Completed"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCompletedBookingId(booking.id);
                          setCompletedViewMode("rate-artisan");
                        }}
                        className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold cursor-pointer"
                      >
                        Rate Artisan
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCompletedBookingId(booking.id);
                          setCompletedViewMode("payment-released");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#001B40] hover:bg-[#052F5F] text-white text-xs font-semibold cursor-pointer"
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )
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

export default function BookingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-neutral-400 font-sans">
          Loading bookings...
        </div>
      }
    >
      <BookingsPageContent />
    </React.Suspense>
  );
}
