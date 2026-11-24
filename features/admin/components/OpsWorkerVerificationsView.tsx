"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { WorkerVerificationCase } from "../types";
import { OpsVerificationReviewer } from "./OpsVerificationReviewer";
import {
  getAdminVerificationStatsApi,
  getAdminVerificationQueueApi,
  mapQueueItemToVerificationCase,
  AdminVerificationStatsResponse,
  GetVerificationQueueParams,
  BackendVerificationApproval,
} from "@/lib/api/admin-verification";
import toast from "react-hot-toast";

export function OpsWorkerVerificationsView() {
  const [stats, setStats] = useState<AdminVerificationStatsResponse | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [cases, setCases] = useState<WorkerVerificationCase[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [queueError, setQueueError] = useState<string | null>(null);

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterTrade, setFilterTrade] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");

  // Pagination cursors
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const data = await getAdminVerificationStatsApi();
      setStats(data);
    } catch (err: any) {
      console.warn("Could not load verification stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Fetch Queue
  const fetchQueue = useCallback(async (cursorParam?: string) => {
    setIsLoadingQueue(true);
    setQueueError(null);
    try {
      const params: GetVerificationQueueParams = {
        limit: 30,
        cursor: cursorParam,
      };

      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      if (filterStatus !== "ALL") {
        if (filterStatus === "IN_REVIEW") {
          params.status = "UNDER_REVIEW";
        } else {
          params.status = filterStatus as BackendVerificationApproval;
        }
      }

      if (filterTrade !== "ALL") {
        params.trade = filterTrade;
      }

      const res = await getAdminVerificationQueueApi(params);
      const mapped = (res.items || []).map(mapQueueItemToVerificationCase);
      setCases(mapped);
      setNextCursor(res.nextCursor || null);
    } catch (err: any) {
      console.error("Failed to load verification queue:", err);
      setQueueError(err?.message || "Failed to load verification queue from server.");
    } finally {
      setIsLoadingQueue(false);
    }
  }, [searchQuery, filterStatus, filterTrade]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentCursor(undefined);
    setCursorStack([]);
  }, [searchQuery, filterStatus, filterTrade, filterPriority]);

  // Debounced queue fetch
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchQueue(currentCursor);
    }, 300);

    return () => clearTimeout(handler);
  }, [fetchQueue, currentCursor]);

  // Filtered queue (Priority filter applies client-side if needed)
  const filteredCases = useMemo(() => {
    if (filterPriority === "ALL") return cases;
    return cases.filter((c) => c.priority === filterPriority);
  }, [cases, filterPriority]);

  const activeIndex = useMemo(() => {
    return cases.findIndex((c) => c.id === selectedCaseId);
  }, [cases, selectedCaseId]);

  const activeCase = activeIndex >= 0 ? cases[activeIndex] : null;

  const handleUpdateCase = (updated: WorkerVerificationCase) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    fetchStats();
  };

  const handleNextPage = () => {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, currentCursor]);
    setCurrentCursor(nextCursor);
  };

  const handlePrevPage = () => {
    if (cursorStack.length === 0) return;
    const prev = cursorStack[cursorStack.length - 1];
    setCursorStack((p) => p.slice(0, -1));
    setCurrentCursor(prev);
  };

  const handleExportCSV = () => {
    if (typeof window === "undefined") return;
    const header = "Case ID,Worker Name,Code,Trade,Location,Documents,Status,Priority,Submitted At,Reviewer\n";
    const rows = filteredCases
      .map(
        (c) =>
          `"${c.id}","${c.worker.name}","${c.worker.code}","${c.worker.trade}","${c.worker.location}",${c.documents.length},"${c.status}","${c.priority}","${c.submittedAt}","${c.assignedReviewer}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bluefixx_verifications_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Verifications exported to CSV.");
  };

  // If inspecting a specific case, render the 3-column workstation
  if (activeCase) {
    return (
      <OpsVerificationReviewer
        vCase={activeCase}
        allCases={cases}
        currentIndex={activeIndex}
        onBackToQueue={() => setSelectedCaseId(null)}
        onNavigateCase={(idx) => {
          if (idx >= 0 && idx < cases.length) {
            setSelectedCaseId(cases[idx].id);
          }
        }}
        onUpdateCase={handleUpdateCase}
      />
    );
  }

  // Fallback day decisions for weekly chart if backend returns empty
  const defaultWeeklyChart = [
    { day: "Mon", approved: 6, review: 3, rejected: 1 },
    { day: "Tue", approved: 8, review: 2, rejected: 0 },
    { day: "Wed", approved: 5, review: 4, rejected: 2 },
    { day: "Thu", approved: 9, review: 3, rejected: 1 },
    { day: "Fri", approved: 7, review: 5, rejected: 0 },
    { day: "Sat", approved: 3, review: 1, rejected: 0 },
    { day: "Sun", approved: 2, review: 0, rejected: 0 },
  ];

  const weeklyDecisions =
    stats?.decisionsByDay && stats.decisionsByDay.length > 0
      ? stats.decisionsByDay.map((d, i) => ({
          day: d.day || d.date ? new Date(d.date || "").toLocaleDateString("en-GB", { weekday: "short" }) : defaultWeeklyChart[i]?.day || `D${i+1}`,
          approved: d.approved,
          review: d.review,
          rejected: d.rejected,
        }))
      : defaultWeeklyChart;

  const pendingCount = stats?.pending ?? cases.filter((c) => c.status === "PENDING").length;
  const inReviewCount = stats?.inReview ?? cases.filter((c) => c.status === "IN_REVIEW").length;
  const rejectedCount = stats?.rejected ?? cases.filter((c) => c.status === "REJECTED").length;
  const avgTurnaround = stats?.avgTurnaroundHours
    ? stats.avgTurnaroundHours < 24
      ? `${Math.round(stats.avgTurnaroundHours)} hrs`
      : `${(stats.avgTurnaroundHours / 24).toFixed(1)} days`
    : "5 days";

  // Queue View
  return (
    <div className="space-y-6">
      {/* Top Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Worker verification</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            This gate keeps unsafe workers off the marketplace. Every artisan / talent is reviewed by an Operations Administrator.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (cases.length > 0) setSelectedCaseId(cases[0].id);
          }}
          className="px-4 py-2 bg-[#001B40] text-white text-xs font-bold rounded-2xl hover:bg-neutral-800 transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>Open verification queue ({pendingCount})</span>
          <span>→</span>
        </button>
      </div>

      {/* KPI Cards & Decisions this week */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Metric Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-3xl bg-white border border-neutral-200 shadow-xs">
            <div className="text-2xl font-extrabold text-neutral-900">
              {isLoadingStats ? "…" : pendingCount}
            </div>
            <div className="text-xs font-bold text-neutral-600 mt-1">In verification queue</div>
            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">High priority</div>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-neutral-200 shadow-xs">
            <div className="text-2xl font-extrabold text-neutral-900">
              {isLoadingStats ? "…" : inReviewCount}
            </div>
            <div className="text-xs font-bold text-neutral-600 mt-1">In review</div>
            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Assigned to team</div>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-neutral-200 shadow-xs">
            <div className="text-2xl font-extrabold text-rose-600">
              {isLoadingStats ? "…" : rejectedCount}
            </div>
            <div className="text-xs font-bold text-neutral-600 mt-1">Rejected / flagged</div>
            <div className="text-[10px] text-rose-600 font-semibold mt-0.5">Compliance hold</div>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-neutral-200 shadow-xs">
            <div className="text-2xl font-extrabold text-neutral-900">
              {isLoadingStats ? "…" : avgTurnaround}
            </div>
            <div className="text-xs font-bold text-neutral-600 mt-1">Avg turnaround</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">SLA: &lt; 7 days</div>
          </div>
        </div>

        {/* Weekly Throughput Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-neutral-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-neutral-800">Decisions this week</div>
            <div className="flex items-center gap-3 text-[10px] text-neutral-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Approved
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Review
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Rejected
              </span>
            </div>
          </div>

          {/* SVG Stacked Bar Chart */}
          <div className="flex items-end justify-between h-20 px-2 pt-2">
            {weeklyDecisions.map((d) => {
              const total = Math.max(1, d.approved + d.review + d.rejected);
              return (
                <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-4 rounded-t flex flex-col-reverse overflow-hidden h-14 bg-neutral-100">
                    <div style={{ height: `${(d.approved / total) * 100}%` }} className="bg-emerald-500 w-full" />
                    <div style={{ height: `${(d.review / total) * 100}%` }} className="bg-amber-400 w-full" />
                    <div style={{ height: `${(d.rejected / total) * 100}%` }} className="bg-rose-500 w-full" />
                  </div>
                  <span className="text-[10px] text-neutral-400">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Queue Table Card */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[240px] max-w-sm flex-1">
              <svg
                className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search worker name, ID, trade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#001B40]"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-neutral-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Status: All</option>
              <option value="PENDING">Pending</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="REQUIRES_INFO">Requires Info</option>
              <option value="REJECTED">Rejected</option>
              <option value="APPROVED">Approved</option>
            </select>

            <select
              value={filterTrade}
              onChange={(e) => setFilterTrade(e.target.value)}
              className="text-xs bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-neutral-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Trade: All</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Electrical">Electrical</option>
              <option value="Welding">Welding</option>
              <option value="Solar installation">Solar installation</option>
              <option value="HVAC">Mechanic / AC</option>
              <option value="Masonry">Masonry</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-neutral-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Priority: All</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            {(searchQuery || filterStatus !== "ALL" || filterTrade !== "ALL" || filterPriority !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setFilterStatus("ALL");
                  setFilterTrade("ALL");
                  setFilterPriority("ALL");
                }}
                className="text-xs text-red-600 font-bold hover:underline cursor-pointer px-2"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 text-xs font-bold bg-[#001B40] text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Cases Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 text-neutral-500 uppercase tracking-wider text-[11px] border-b border-neutral-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Worker</th>
                <th className="py-3 px-4">Trade</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Documents</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned reviewer</th>
                <th className="py-3 px-4 text-right">Priority</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {isLoadingQueue ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`v-skel-${idx}`} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-neutral-200" />
                        <div className="space-y-1.5">
                          <div className="w-24 h-3 bg-neutral-200 rounded" />
                          <div className="w-16 h-2 bg-neutral-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="w-20 h-3 bg-neutral-200 rounded" /></td>
                    <td className="py-4 px-4"><div className="w-24 h-3 bg-neutral-200 rounded" /></td>
                    <td className="py-4 px-4"><div className="w-16 h-3 bg-neutral-200 rounded" /></td>
                    <td className="py-4 px-4"><div className="w-16 h-3 bg-neutral-200 rounded" /></td>
                    <td className="py-4 px-4"><div className="w-20 h-4 bg-neutral-200 rounded-full" /></td>
                    <td className="py-4 px-4"><div className="w-24 h-3 bg-neutral-200 rounded" /></td>
                    <td className="py-4 px-4 text-right"><div className="w-12 h-3 bg-neutral-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : queueError ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <p className="text-red-600 font-bold text-xs">{queueError}</p>
                    <button
                      type="button"
                      onClick={() => fetchQueue(currentCursor)}
                      className="mt-2 text-xs text-[#001B40] font-bold underline cursor-pointer"
                    >
                      Retry loading queue
                    </button>
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    No worker verifications matching your filters.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const flaggedCount = c.documents.filter((d) => d.status === "FLAGGED").length;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className="hover:bg-neutral-50/60 transition-colors cursor-pointer group"
                    >
                      {/* Worker */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#001B40] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {c.worker.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={c.worker.avatarUrl}
                                alt={c.worker.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{c.worker.name[0]}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 group-hover:underline">
                              {c.worker.name}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono">
                              {c.worker.code}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Trade */}
                      <td className="py-3.5 px-4 font-medium text-neutral-800">{c.worker.trade}</td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-neutral-600">{c.worker.location}</td>

                      {/* Documents */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium">{c.documents.length}</span>
                        {flaggedCount > 0 && (
                          <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 whitespace-nowrap shrink-0">
                            {flaggedCount} flagged
                          </span>
                        )}
                      </td>

                      {/* Submitted */}
                      <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">{c.submittedAt}</td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {c.status === "PENDING" && (
                          <span className="inline-flex items-center whitespace-nowrap shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Pending
                          </span>
                        )}
                        {c.status === "IN_REVIEW" && (
                          <span className="inline-flex items-center whitespace-nowrap shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            In Review
                          </span>
                        )}
                        {c.status === "REQUIRES_INFO" && (
                          <span className="inline-flex items-center whitespace-nowrap shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                            Requires more info
                          </span>
                        )}
                        {c.status === "REJECTED" && (
                          <span className="inline-flex items-center whitespace-nowrap shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Rejected
                          </span>
                        )}
                        {c.status === "APPROVED" && (
                          <span className="inline-flex items-center whitespace-nowrap shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Approved
                          </span>
                        )}
                      </td>

                      {/* Assigned Reviewer */}
                      <td className="py-3.5 px-4 text-neutral-600">{c.assignedReviewer}</td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-bold text-xs ${
                            c.priority === "HIGH"
                              ? "text-rose-600"
                              : c.priority === "MEDIUM"
                              ? "text-amber-600"
                              : "text-neutral-500"
                          }`}
                        >
                          • {c.priority}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>
            Showing {filteredCases.length} case{filteredCases.length === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={cursorStack.length === 0 || isLoadingQueue}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer transition-colors"
            >
              Previous
            </button>
            <span className="font-bold text-[#001B40]">Page {cursorStack.length + 1}</span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={!nextCursor || isLoadingQueue}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
