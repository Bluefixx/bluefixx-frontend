"use client";

import React, { useState, useMemo } from "react";
import { WorkerVerificationCase } from "../types";
import { MOCK_VERIFICATION_CASES } from "../mockJobsData";
import { OpsVerificationReviewer } from "./OpsVerificationReviewer";
import toast from "react-hot-toast";

export function OpsWorkerVerificationsView() {
  const [cases, setCases] = useState<WorkerVerificationCase[]>(MOCK_VERIFICATION_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterTrade, setFilterTrade] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");

  const activeIndex = useMemo(() => {
    return cases.findIndex((c) => c.id === selectedCaseId);
  }, [cases, selectedCaseId]);

  const activeCase = activeIndex >= 0 ? cases[activeIndex] : null;

  // Filtered queue
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          Boolean(c.id && c.id.toLowerCase().includes(q)) ||
          Boolean(c.worker.name && c.worker.name.toLowerCase().includes(q)) ||
          Boolean(c.worker.code && c.worker.code.toLowerCase().includes(q)) ||
          Boolean(c.worker.trade && c.worker.trade.toLowerCase().includes(q)) ||
          Boolean(c.worker.location && c.worker.location.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
      if (filterTrade !== "ALL" && c.worker.trade !== filterTrade) return false;
      if (filterPriority !== "ALL" && c.priority !== filterPriority) return false;

      return true;
    });
  }, [cases, searchQuery, filterStatus, filterTrade, filterPriority]);

  const handleUpdateCase = (updated: WorkerVerificationCase) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
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
          className="px-4 py-2 bg-[#001B40] text-white text-xs font-bold rounded-2xl hover:bg-neutral-800 transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <span>Open verification queue ({cases.filter((c) => c.status === "PENDING").length})</span>
          <span>→</span>
        </button>
      </div>

      {/* KPI Cards & Decisions this week (Screenshot 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Metric Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-3xl bg-white border border-neutral-200 shadow-xs">
            <div className="text-2xl font-extrabold text-neutral-900">4</div>
            <div className="text-xs font-bold text-neutral-600 mt-1">In verification queue</div>
            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">High priority</div>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-neutral-200 shadow-xs">
            <div className="text-2xl font-extrabold text-neutral-900">3</div>
            <div className="text-xs font-bold text-neutral-600 mt-1">In review</div>
            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Simeon Daniel assigned</div>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-neutral-200 shadow-xs">
            <div className="text-2xl font-extrabold text-rose-600">1</div>
            <div className="text-xs font-bold text-neutral-600 mt-1">Rejected / flagged</div>
            <div className="text-[10px] text-rose-600 font-semibold mt-0.5">Document forged</div>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-neutral-200 shadow-xs">
            <div className="text-2xl font-extrabold text-neutral-900">5 days</div>
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
            {[
              { day: "Mon", app: 6, rev: 3, rej: 1 },
              { day: "Tue", app: 8, rev: 2, rej: 0 },
              { day: "Wed", app: 5, rev: 4, rej: 2 },
              { day: "Thu", app: 9, rev: 3, rej: 1 },
              { day: "Fri", app: 7, rev: 5, rej: 0 },
              { day: "Sat", app: 3, rev: 1, rej: 0 },
              { day: "Sun", app: 2, rev: 0, rej: 0 },
            ].map((d) => {
              const total = d.app + d.rev + d.rej;
              return (
                <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-4 rounded-t flex flex-col-reverse overflow-hidden h-14 bg-neutral-100">
                    <div style={{ height: `${(d.app / 12) * 100}%` }} className="bg-emerald-500 w-full" />
                    <div style={{ height: `${(d.rev / 12) * 100}%` }} className="bg-amber-400 w-full" />
                    <div style={{ height: `${(d.rej / 12) * 100}%` }} className="bg-rose-500 w-full" />
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
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#001B40]"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-neutral-700 focus:outline-hidden"
            >
              <option value="ALL">Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="REQUIRES_INFO">Requires Info</option>
              <option value="REJECTED">Rejected</option>
              <option value="APPROVED">Approved</option>
            </select>

            <select
              value={filterTrade}
              onChange={(e) => setFilterTrade(e.target.value)}
              className="text-xs bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-neutral-700 focus:outline-hidden"
            >
              <option value="ALL">Trade</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Welding">Welding</option>
              <option value="Mechanic / AC">Mechanic / AC</option>
              <option value="Masonry">Masonry</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-neutral-700 focus:outline-hidden"
            >
              <option value="ALL">Priority</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 text-xs font-bold bg-[#001B40] text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
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
              {filteredCases.map((c) => {
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
                        <div className="w-8 h-8 rounded-full bg-[#001B40] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {c.worker.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.worker.avatarUrl}
                              alt={c.worker.name}
                              className="w-full h-full object-cover rounded-full"
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
                    <td className="py-3.5 px-4">
                      <span className="font-medium">{c.documents.length}</span>
                      {flaggedCount > 0 && (
                        <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                          {flaggedCount} flagged
                        </span>
                      )}
                    </td>

                    {/* Submitted */}
                    <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">{c.submittedAt}</td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {c.status === "PENDING" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Pending
                        </span>
                      )}
                      {c.status === "IN_REVIEW" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          In Review
                        </span>
                      )}
                      {c.status === "REQUIRES_INFO" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                          Requires more info
                        </span>
                      )}
                      {c.status === "REJECTED" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Rejected
                        </span>
                      )}
                      {c.status === "APPROVED" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
