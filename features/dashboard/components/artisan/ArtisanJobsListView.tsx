"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { JobDetailData } from "./ArtisanJobDetailView";
import {
  getArtisanRequestsApi,
  getArtisanBookingsApi,
  getCustomerReviewsEligibleApi,
} from "@/lib/api/artisan";
import { ArtisanBookingDetail, ArtisanRequestsResponse } from "@/types/artisan";
import { formatNaira } from "@/lib/utils/currency";

export type JobsListTab = "requests" | "active" | "completed" | "declined";

interface ActiveJobCardItem {
  id: string;
  title: string;
  customerName: string;
  badge: string;
  description: string;
  distance: string;
  schedule: string;
  budget: string;
}

interface CompletedJobCardItem {
  id: string;
  title: string;
  customerName: string;
  date: string;
  payout: string;
  reviewPending: boolean;
  rating?: number;
}

interface DeclinedJobCardItem {
  id: string;
  title: string;
  customerName: string;
  date: string;
  tag: string;
  badge: string;
  payout: string;
}

interface ArtisanJobsListViewProps {
  initialTab?: JobsListTab;
  onSelectRequest?: (job: JobDetailData) => void;
  onManageJob?: (bookingId: string) => void;
  onBackToDashboard?: () => void;
  onRateCustomer?: (customer: {
    bookingId?: string;
    name: string;
    jobTitle: string;
    date: string;
  }) => void;
}

function formatShortDate(iso?: string | null): string {
  if (!iso) return "Scheduled";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

function formatBookingStageLabel(status: string): string {
  switch (status) {
    case "AWAITING_PAYMENT":
      return "Awaiting payment";
    case "ACCEPTED":
      return "Scheduled";
    case "ON_THE_WAY":
      return "On the way";
    case "ARRIVED":
      return "Arrived";
    case "IN_PROGRESS":
      return "In progress";
    case "WORK_SUBMITTED":
      return "Work submitted";
    case "COMPLETED":
      return "Completed";
    case "DISPUTED":
      return "Disputed";
    default:
      return status.replace(/_/g, " ");
  }
}

function mapRequestToJobDetail(
  item: ArtisanRequestsResponse["items"][number]
): JobDetailData {
  const createdLabel = formatShortDate(item.createdAt);
  const budgetLabel = item.budget ? formatNaira(item.budget) : "Quote requested";
  const locationLabel = item.area || "Nearby";
  const isEmergency = item.status?.toUpperCase() === "EMERGENCY";

  return {
    id: item.jobId || item.id,
    code: `BFX-${(item.jobId || item.id).slice(0, 6).toUpperCase()}`,
    title: item.title,
    category: item.serviceName || "Service",
    subCategory: item.serviceName || "Request",
    postedTime: `Posted ${createdLabel}`,
    isUrgent: isEmergency,
    status: isEmergency ? "Emergency" : item.status || "Pending",
    description: `${item.serviceName || "Service"} request from ${item.customer?.displayName || "Customer"}.`,
    service: item.serviceName || item.title,
    date: createdLabel,
    time: "Flexible",
    budget: budgetLabel,
    urgency: isEmergency ? "Urgent" : "Standard",
    customerName: item.customer?.displayName || "Customer",
    customerLocation: locationLabel,
    distance: locationLabel,
    driveTime: "Nearby",
    photoUrl: "",
    photoCaption: "",
    audioDuration: "",
    questions: [],
  };
}

function mapBookingToActiveCard(booking: ArtisanBookingDetail): ActiveJobCardItem {
  const customerName = booking.customer?.fullName || "Customer";
  const addressParts = [booking.address?.street, booking.address?.city].filter(Boolean);
  const scheduleDate = formatShortDate(booking.visitStart);

  return {
    id: booking.id,
    title: booking.jobTitle || "Booked job",
    customerName,
    badge: formatBookingStageLabel(booking.status),
    description: booking.jobDescription || booking.notes || "Active service booking.",
    distance: addressParts.length > 0 ? addressParts.join(", ") : "Confirmed location",
    schedule: `Visit: ${scheduleDate}`,
    budget: formatNaira(booking.base),
  };
}

export function ArtisanJobsListView({
  initialTab = "requests",
  onSelectRequest,
  onManageJob,
  onBackToDashboard,
  onRateCustomer,
}: ArtisanJobsListViewProps) {
  const [activeTab, setActiveTab] = useState<JobsListTab>(initialTab);
  const [requestsData, setRequestsData] = useState<JobDetailData[]>([]);
  const [activeJobsData, setActiveJobsData] = useState<ActiveJobCardItem[]>([]);
  const [completedJobsData, setCompletedJobsData] = useState<CompletedJobCardItem[]>([]);
  const [declinedJobsData, setDeclinedJobsData] = useState<DeclinedJobCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadTabData() {
      await Promise.resolve();
      if (!mounted) return;
      setIsLoading(true);
      setLoadError(null);

      if (activeTab === "requests") {
        getArtisanRequestsApi("incoming")
          .then((res) => {
            if (!mounted) return;
            const items = Array.isArray(res?.items) ? res.items : [];
            setRequestsData(items.map(mapRequestToJobDetail));
          })
          .catch(() => {
            if (mounted) setLoadError("Unable to load incoming job requests.");
          })
          .finally(() => {
            if (mounted) setIsLoading(false);
          });
      } else if (activeTab === "declined") {
        getArtisanRequestsApi("declined")
          .then((res) => {
            if (!mounted) return;
            const items = Array.isArray(res?.items) ? res.items : [];
            setDeclinedJobsData(
              items.map((item) => ({
                id: item.id,
                title: item.title,
                customerName: item.customer?.displayName || "Customer",
                date: formatShortDate(item.createdAt),
                tag: item.serviceName || "Request",
                badge: "Declined",
                payout: item.budget ? formatNaira(item.budget) : "—",
              }))
            );
          })
          .catch(() => {
            if (mounted) setLoadError("Unable to load declined requests.");
          })
          .finally(() => {
            if (mounted) setIsLoading(false);
          });
      } else if (activeTab === "active") {
        getArtisanBookingsApi("active")
          .then((items) => {
            if (!mounted) return;
            const list = Array.isArray(items) ? items : [];
            setActiveJobsData(list.map(mapBookingToActiveCard));
          })
          .catch(() => {
            if (mounted) setLoadError("Unable to load active jobs.");
          })
          .finally(() => {
            if (mounted) setIsLoading(false);
          });
      } else {
        Promise.all([
          getArtisanBookingsApi("completed"),
          getCustomerReviewsEligibleApi().catch(() => []),
        ])
          .then(([bookings, eligible]) => {
            if (!mounted) return;
            const bookingList = Array.isArray(bookings) ? bookings : [];
            const eligibleIds = new Set(
              (Array.isArray(eligible) ? eligible : [])
                .map((entry: { bookingId?: string; id?: string }) => entry.bookingId || entry.id)
                .filter((id): id is string => Boolean(id))
            );

            setCompletedJobsData(
              bookingList.map((booking) => ({
                id: booking.id,
                title: booking.jobTitle || "Completed job",
                customerName: booking.customer?.fullName || "Customer",
                date: formatShortDate(booking.completedAt || booking.visitEnd || booking.visitStart),
                payout: `${formatNaira(booking.base)}${booking.released ? " · paid out" : ""}`,
                reviewPending: eligibleIds.has(booking.id),
              }))
            );
          })
          .catch(() => {
            if (mounted) setLoadError("Unable to load completed jobs.");
          })
          .finally(() => {
            if (mounted) setIsLoading(false);
          });
      }
    }

    void loadTabData();

    return () => {
      mounted = false;
    };
  }, [activeTab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div>
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
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Jobs
        </h1>
      </div>

      {/* Tabs Row (Requests, Active, Completed, Declined) */}
      <div className="flex items-center gap-4 sm:gap-8 border-b border-neutral-200/90 overflow-x-auto no-scrollbar">
        {/* Requests Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 relative transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "requests"
              ? "text-[#001B40]"
              : "text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <span>Requests</span>
          {requestsData.length > 0 && (
            <span className="min-w-4 h-4 px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center">
              {requestsData.length}
            </span>
          )}
          {activeTab === "requests" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#001B40] rounded-full" />
          )}
        </button>

        {/* Active Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`pb-3 text-xs sm:text-sm font-bold relative transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "active"
              ? "text-[#001B40]"
              : "text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <span>Active</span>
          {activeTab === "active" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#001B40] rounded-full" />
          )}
        </button>

        {/* Completed Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`pb-3 text-xs sm:text-sm font-bold relative transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "completed"
              ? "text-[#001B40]"
              : "text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <span>Completed</span>
          {activeTab === "completed" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#001B40] rounded-full" />
          )}
        </button>

        {/* Declined Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("declined")}
          className={`pb-3 text-xs sm:text-sm font-bold relative transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "declined"
              ? "text-[#001B40]"
              : "text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <span>Declined</span>
          {activeTab === "declined" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#001B40] rounded-full" />
          )}
        </button>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs sm:text-sm text-red-700 font-medium">
          {loadError}
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((skeleton) => (
            <div
              key={skeleton}
              className="bg-white rounded-3xl p-6 border border-neutral-200/80 h-36 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* TAB 1: REQUESTS */}
      {!isLoading && activeTab === "requests" && (
        <div className="space-y-4">
          {requestsData.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 text-center space-y-2">
              <p className="font-heading font-bold text-base text-[#001B40]">
                No incoming job requests yet
              </p>
              <p className="text-xs sm:text-sm text-neutral-500">
                New customer requests matching your skills will appear here.
              </p>
            </div>
          ) : (
            requestsData.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#001B40]">
                      {req.title}
                    </h3>
                    <p className="font-sans text-xs text-neutral-400 font-medium mt-0.5">
                      {req.customerName}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      req.status === "Emergency"
                        ? "bg-[#FEE2E2] text-[#EF4444]"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {req.description}
                </p>

                <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-neutral-500 font-medium">
                  <span>{req.distance}</span>
                  <span>•</span>
                  <span>{req.date}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-t border-neutral-100">
                  <span className="font-sans font-bold text-sm sm:text-base text-[#001B40]">
                    {req.budget}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectRequest) onSelectRequest(req);
                      else toast.success(`Viewing request: ${req.title}`);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    View request
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE JOBS */}
      {!isLoading && activeTab === "active" && (
        <div className="space-y-4">
          {activeJobsData.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 text-center space-y-2">
              <p className="font-heading font-bold text-base text-[#001B40]">
                No active jobs
              </p>
              <p className="text-xs sm:text-sm text-neutral-500">
                Accepted and ongoing bookings will appear here.
              </p>
            </div>
          ) : (
            activeJobsData.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#001B40]">
                      {job.title}
                    </h3>
                    <p className="font-sans text-xs text-neutral-400 font-medium mt-0.5">
                      {job.customerName}
                    </p>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                    {job.badge}
                  </span>
                </div>

                <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-neutral-500 font-medium">
                  <span>{job.distance}</span>
                  <span>•</span>
                  <span>{job.schedule}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-t border-neutral-100">
                  <span className="font-sans font-bold text-sm sm:text-base text-[#001B40]">
                    {job.budget}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (onManageJob) onManageJob(job.id);
                      else toast.success(`Managing job: ${job.title}`);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    Manage job
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED JOBS */}
      {!isLoading && activeTab === "completed" && (
        <div className="space-y-4">
          <div className="px-1">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#0F1115]">
              Completed jobs
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Rate your customers you have finished jobs with.
            </p>
          </div>

          {completedJobsData.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 text-center space-y-2">
              <p className="font-heading font-bold text-base text-[#001B40]">
                No completed jobs yet
              </p>
              <p className="text-xs sm:text-sm text-neutral-500">
                Finished bookings will show up here once completed.
              </p>
            </div>
          ) : (
            completedJobsData.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#001B40]">
                    {job.title} · {job.customerName}
                  </h3>
                  <p className="font-sans text-xs text-neutral-400 font-medium">
                    Completed {job.date} · {job.payout}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {job.reviewPending ? (
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Review pending
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onRateCustomer) {
                            onRateCustomer({
                              bookingId: job.id,
                              name: job.customerName,
                              jobTitle: job.title,
                              date: job.date,
                            });
                          } else {
                            toast.success(`Opening review for ${job.customerName}`);
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
                      >
                        Rate Customer
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
                      <div className="flex text-amber-400">
                        {"★".repeat(job.rating || 5)}
                      </div>
                      <span>Reviewed</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: DECLINED JOBS */}
      {!isLoading && activeTab === "declined" && (
        <div className="space-y-4">
          {declinedJobsData.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 text-center space-y-2">
              <p className="font-heading font-bold text-base text-[#001B40]">
                No declined requests
              </p>
              <p className="text-xs sm:text-sm text-neutral-500">
                Requests you decline will appear here for reference.
              </p>
            </div>
          ) : (
            declinedJobsData.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#001B40]">
                      {job.title}
                    </h3>
                  </div>
                  <p className="font-sans text-xs text-neutral-400 font-medium">
                    {job.customerName} · {job.tag} · {job.date}
                  </p>
                  <p className="font-sans font-bold text-sm sm:text-base text-[#001B40] pt-1">
                    {job.payout}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
                  {job.badge}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
