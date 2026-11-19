"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AdminDispute } from "../types";
import { MOCK_ADMIN_DISPUTES } from "../mockDisputesData";
import { OpsDropdown } from "./OpsDropdown";

export function OpsDisputesView() {
  const [disputes] = useState<AdminDispute[]>(MOCK_ADMIN_DISPUTES);
  const [activeTab, setActiveTab] = useState<"ALL" | "ASSIGNED">("ALL");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Filtered Disputes
  const filteredDisputes = useMemo(() => {
    return disputes.filter((item) => {
      if (activeTab === "ASSIGNED" && item.assignedAdmin !== "Simeon Daniel") {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.jobId.toLowerCase().includes(q) ||
          item.jobTitle.toLowerCase().includes(q) ||
          item.customer.name.toLowerCase().includes(q) ||
          item.worker.name.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (priorityFilter !== "ALL" && item.priority !== priorityFilter) return false;
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;

      return true;
    });
  }, [disputes, activeTab, searchQuery, priorityFilter, statusFilter]);

  // Aggregate metrics
  const totalEscrow = useMemo(
    () => disputes.reduce((acc, curr) => acc + curr.escrowAmount, 0),
    [disputes]
  );
  const escalatedCount = useMemo(
    () => disputes.filter((d) => d.status === "ESCALATED").length,
    [disputes]
  );
  const awaitingCount = useMemo(
    () => disputes.filter((d) => d.status === "AWAITING_RESPONSE").length,
    [disputes]
  );

  const handleExportCSV = () => {
    const headers = [
      "Dispute ID",
      "Title",
      "Job ID",
      "Customer",
      "Worker",
      "Escrow Amount",
      "Priority",
      "Status",
      "Assigned Admin",
      "Opened Date",
    ];
    const rows = filteredDisputes.map((d) => [
      d.id,
      `"${d.title}"`,
      d.jobId,
      `"${d.customer.name}"`,
      `"${d.worker.name}"`,
      d.escrowAmount,
      d.priority,
      d.status,
      `"${d.assignedAdmin}"`,
      d.openedDate,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bluefixx_disputes_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>Trust & safety</span>
            <span>&gt;</span>
            <span className="font-semibold text-neutral-900">Disputes</span>
          </div>
          <h1 className="text-xl md:text-2xl font-heading font-extrabold text-[#001B40]">
            Disputes
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Case management & arbitration: every dispute holds customer money and the marketplace's reputation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-neutral-100 rounded-xl p-1 self-start md:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === "ALL"
                ? "bg-white text-[#001B40] font-bold shadow-2xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            All ({disputes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ASSIGNED")}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === "ASSIGNED"
                ? "bg-white text-[#001B40] font-bold shadow-2xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Assigned to me (1)
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Open Disputes */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Open disputes
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#001B40]">{disputes.length}</span>
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          </div>
        </div>

        {/* In Escrow */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            In escrow
          </span>
          <span className="text-2xl font-extrabold text-[#001B40]">
            ₦{totalEscrow.toLocaleString()}
          </span>
        </div>

        {/* Escalated */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Escalated
          </span>
          <span className="text-2xl font-extrabold text-red-600">{escalatedCount}</span>
        </div>

        {/* Awaiting response */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Awaiting response
          </span>
          <span className="text-2xl font-extrabold text-amber-600">{awaitingCount}</span>
        </div>

        {/* Avg Resolution */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs col-span-2 md:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Avg resolution
          </span>
          <span className="text-2xl font-extrabold text-neutral-800">4.2 days</span>
        </div>
      </div>

      {/* Filter Bar & Export */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <svg
              className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, user, job..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#001B40]"
            />
          </div>

          {/* Universal Dropdown Filters (Matching Frame 2147238654) */}
          <OpsDropdown
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { label: "Priority (All)", value: "ALL" },
              { label: "High", value: "HIGH" },
              { label: "Medium", value: "MEDIUM" },
              { label: "Low", value: "LOW" },
            ]}
          />

          <OpsDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "Status (All)", value: "ALL" },
              { label: "Open", value: "OPEN" },
              { label: "Under Review", value: "UNDER_REVIEW" },
              { label: "Awaiting Response", value: "AWAITING_RESPONSE" },
              { label: "Escalated", value: "ESCALATED" },
              { label: "Resolved", value: "RESOLVED" },
            ]}
          />
        </div>

        {/* CSV Export Button */}
        <button
          type="button"
          onClick={handleExportCSV}
          className="px-3.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Export</span>
        </button>
      </div>

      {/* Disputes Data Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="py-3 px-4">Dispute ID</th>
                <th className="py-3 px-4">Job</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Worker</th>
                <th className="py-3 px-4">Escrow held</th>
                <th className="py-3 px-4">Opened</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredDisputes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-400">
                    No disputes match the current criteria.
                  </td>
                </tr>
              ) : (
                filteredDisputes.map((d) => (
                  <tr key={d.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* ID & Title */}
                    <td className="py-3.5 px-4 font-semibold">
                      <Link
                        href={`/ops/disputes/${d.id}`}
                        className="font-bold text-[#074292] hover:underline flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{d.id}</span>
                      </Link>
                      <span className="text-[11px] text-neutral-500 block font-normal">{d.title}</span>
                    </td>

                    {/* Job */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-neutral-900 block">{d.jobId}</span>
                      <span className="text-[11px] text-neutral-500 truncate max-w-[140px] block">
                        {d.jobTitle}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-neutral-900">{d.customer.name}</span>
                    </td>

                    {/* Worker */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-neutral-900">{d.worker.name}</span>
                    </td>

                    {/* Escrow */}
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                      ₦{d.escrowAmount.toLocaleString()}
                    </td>

                    {/* Opened */}
                    <td className="py-3.5 px-4 text-neutral-600 font-mono text-[11px]">
                      {d.openedDate}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.priority === "HIGH" || d.priority === "CRITICAL"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {d.priority.charAt(0) + d.priority.slice(1).toLowerCase()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : d.status === "ESCALATED"
                            ? "bg-red-100 text-red-800"
                            : d.status === "AWAITING_RESPONSE"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {d.status === "RESOLVED"
                          ? "Resolved"
                          : d.status === "ESCALATED"
                          ? "Escalated"
                          : d.status === "AWAITING_RESPONSE"
                          ? "Awaiting response"
                          : "Under review"}
                      </span>
                    </td>

                    {/* Assigned */}
                    <td className="py-3.5 px-4 text-neutral-600">
                      <span
                        className={
                          d.assignedAdmin === "Unassigned" ? "text-neutral-400 italic" : "font-medium"
                        }
                      >
                        {d.assignedAdmin}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/ops/disputes/${d.id}`}
                        className="px-2.5 py-1 rounded-lg border border-neutral-200 text-[#001B40] hover:bg-neutral-100 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Open case</span>
                        <span>&rarr;</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 bg-neutral-50/50">
          <span>Showing {filteredDisputes.length} disputes</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled className="px-2.5 py-1 rounded border border-neutral-200 text-neutral-400 cursor-not-allowed">
              Prev
            </button>
            <span className="font-semibold text-neutral-700">1</span>
            <button type="button" disabled className="px-2.5 py-1 rounded border border-neutral-200 text-neutral-400 cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
