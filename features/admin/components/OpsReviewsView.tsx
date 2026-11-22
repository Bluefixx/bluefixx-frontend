"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_ADMIN_REVIEWS } from "../mockReviewsData";
import { AdminReview, ReviewReportStatus } from "../types";
import { OpsDropdown, OpsDropdownOption } from "./OpsDropdown";
import { OpsReviewDetailDrawer } from "./OpsReviewDetailDrawer";

export function OpsReviewsView() {
  const [reviews, setReviews] = useState<AdminReview[]>(MOCK_ADMIN_REVIEWS);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("ALL");
  const [tradeFilter, setTradeFilter] = useState("ALL");
  const [ratingFilter, setRatingFilter] = useState("ALL");

  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter reported banner click
  const handleFilterReported = () => {
    setReportStatusFilter("Reported");
  };

  // Toggle quick hide/unhide
  const handleToggleHide = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((rev) => {
        if (rev.id === reviewId) {
          const nextStatus: ReviewReportStatus = rev.reportStatus === "Hidden" ? "Clean" : "Hidden";
          return { ...rev, reportStatus: nextStatus };
        }
        return rev;
      })
    );
  };

  // Update review from investigation drawer
  const handleUpdateStatus = (reviewId: string, newStatus: ReviewReportStatus) => {
    setReviews((prev) =>
      prev.map((rev) => (rev.id === reviewId ? { ...rev, reportStatus: newStatus } : rev))
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Review ID", "Stars", "Review Text", "Reviewer", "Reviewed Worker", "Job ID", "Date", "Status"];
    const rows = filteredReviews.map((r) => [
      r.id,
      r.stars,
      `"${r.reviewText.replace(/"/g, '""')}"`,
      r.reviewerName,
      r.reviewedUserName,
      r.jobId,
      r.date,
      r.reportStatus,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bluefixx_reviews_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter options
  const statusOptions: OpsDropdownOption[] = [
    { label: "Report status", value: "ALL" },
    { label: "Reported", value: "Reported" },
    { label: "Under Review", value: "Under Review" },
    { label: "Clean", value: "Clean" },
    { label: "Hidden", value: "Hidden" },
  ];

  const tradeOptions: OpsDropdownOption[] = [
    { label: "Master Artisan", value: "ALL" },
    { label: "Plumbing", value: "Plumbing" },
    { label: "Carpentry", value: "Carpentry" },
    { label: "Mechanic", value: "Mechanic" },
    { label: "Welding", value: "Welding" },
    { label: "Solar installation", value: "Solar installation" },
    { label: "Masonry", value: "Masonry" },
  ];

  const ratingOptions: OpsDropdownOption[] = [
    { label: "Rating", value: "ALL" },
    { label: "5 Stars", value: "5" },
    { label: "4 Stars", value: "4" },
    { label: "3 Stars", value: "3" },
    { label: "2 Stars", value: "2" },
    { label: "1 Star", value: "1" },
  ];

  // Filtering
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      if (reportStatusFilter !== "ALL" && rev.reportStatus !== reportStatusFilter) {
        return false;
      }
      if (tradeFilter !== "ALL" && rev.trade !== tradeFilter) {
        return false;
      }
      if (ratingFilter !== "ALL" && String(rev.stars) !== ratingFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText = rev.reviewText.toLowerCase().includes(q);
        const matchesReviewer = rev.reviewerName.toLowerCase().includes(q);
        const matchesReviewed = rev.reviewedUserName.toLowerCase().includes(q);
        const matchesJob = rev.jobId.toLowerCase().includes(q);
        if (!matchesText && !matchesReviewer && !matchesReviewed && !matchesJob) {
          return false;
        }
      }
      return true;
    });
  }, [reviews, reportStatusFilter, tradeFilter, ratingFilter, searchQuery]);

  const reportedCount = useMemo(() => {
    return reviews.filter((r) => r.reportStatus === "Reported" || r.reportStatus === "Under Review").length;
  }, [reviews]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-neutral-400 mb-1">Reviews &amp; ratings</div>
        <h1 className="text-2xl font-extrabold text-[#001B40] tracking-tight">
          Reviews and ratings
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Moderation workspace. Ratings are the currency of trust, so every change is reasoned and logged.
        </p>
      </div>

      {/* Priority Attention Banner */}
      <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-black text-amber-700 pl-2">
            {reportedCount}
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              Reported reviews awaiting moderation
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Two are flagged for suspicious rating patterns from newly created accounts.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleFilterReported}
          className="whitespace-nowrap px-4 py-2 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-neutral-800 hover:bg-neutral-50 shadow-xs cursor-pointer flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Filter reported</span>
          <span>→</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Review text, reviewer or job"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#001B40]"
            />
          </div>

          {/* Status Dropdown */}
          <OpsDropdown
            options={statusOptions}
            value={reportStatusFilter}
            onChange={setReportStatusFilter}
          />

          {/* Trade / Master Artisan Dropdown */}
          <OpsDropdown
            options={tradeOptions}
            value={tradeFilter}
            onChange={setTradeFilter}
          />

          {/* Rating Dropdown */}
          <OpsDropdown
            options={ratingOptions}
            value={ratingFilter}
            onChange={setRatingFilter}
          />

          {(searchQuery || reportStatusFilter !== "ALL" || tradeFilter !== "ALL" || ratingFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setReportStatusFilter("ALL");
                setTradeFilter("ALL");
                setRatingFilter("ALL");
              }}
              className="text-xs text-red-600 hover:underline px-2 py-1 font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-800 hover:bg-neutral-50 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          <span>Export</span>
        </button>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Review</th>
                <th className="py-3 px-4">Reviewer</th>
                <th className="py-3 px-4">Reviewed user</th>
                <th className="py-3 px-4">Job</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Report status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-400 text-xs">
                    No reviews match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => {
                  return (
                    <tr key={rev.id} className="hover:bg-neutral-50/60 transition-colors">
                      {/* Review & Stars */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                        <div className="flex items-center gap-0.5 text-amber-400 text-sm mb-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star}>
                              {star <= rev.stars ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                        <p className="font-medium text-neutral-900 leading-snug">
                          {rev.reviewText}
                        </p>
                        {rev.subAnnotation && (
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-amber-700 font-medium">
                              {rev.subAnnotation}
                            </span>
                            {rev.patternTag && (
                              <span className="whitespace-nowrap shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700">
                                {rev.patternTag}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Reviewer */}
                      <td className="py-3.5 px-4 font-semibold text-neutral-800 whitespace-nowrap">
                        {rev.reviewerName}
                      </td>

                      {/* Reviewed User */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Link
                          href={`/ops/users/${rev.reviewedUserId}`}
                          className="font-bold text-[#074292] hover:underline"
                        >
                          {rev.reviewedUserName}
                        </Link>
                      </td>

                      {/* Job */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Link
                          href={`/ops/jobs`}
                          className="font-bold text-[#074292] hover:underline"
                        >
                          {rev.jobId}
                        </Link>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                        {rev.date}
                      </td>

                      {/* Report Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`whitespace-nowrap shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            rev.reportStatus === "Reported"
                              ? "bg-amber-100 text-amber-800"
                              : rev.reportStatus === "Under Review"
                              ? "bg-blue-100 text-blue-800"
                              : rev.reportStatus === "Clean"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-neutral-200 text-neutral-700"
                          }`}
                        >
                          ● {rev.reportStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReview(rev);
                              setIsDrawerOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-neutral-300 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 flex items-center gap-1 cursor-pointer"
                          >
                            <span>🔍</span>
                            <span>Investigate</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleHide(rev.id)}
                            title={rev.reportStatus === "Hidden" ? "Unhide review" : "Hide review"}
                            className="p-1.5 rounded-lg border border-neutral-300 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 cursor-pointer"
                          >
                            {rev.reportStatus === "Hidden" ? (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" x2="23" y1="1" y2="23" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span>
            1–{filteredReviews.length} of {filteredReviews.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-400 text-xs font-semibold cursor-not-allowed"
            >
              &lt; Prev
            </button>
            <span className="px-2 py-1 text-xs font-semibold text-neutral-700">
              Page 1 of 1
            </span>
            <button
              type="button"
              disabled
              className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-400 text-xs font-semibold cursor-not-allowed"
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Investigation Drawer */}
      <OpsReviewDetailDrawer
        review={selectedReview}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedReview(null);
        }}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
