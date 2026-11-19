"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { AdminSafetyIncident } from "../types";
import { MOCK_ADMIN_SAFETY_INCIDENTS } from "../mockDisputesData";
import { OpsDropdown } from "./OpsDropdown";

export function OpsSafetyView() {
  const [incidents, setIncidents] = useState<AdminSafetyIncident[]>(MOCK_ADMIN_SAFETY_INCIDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selected incident for triage drawer
  const [selectedIncident, setSelectedIncident] = useState<AdminSafetyIncident | null>(null);
  const [triageNotes, setTriageNotes] = useState("");

  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.party.name.toLowerCase().includes(q) ||
          item.party.code.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          (item.jobId && item.jobId.toLowerCase().includes(q));
        if (!match) return false;
      }

      if (priorityFilter !== "ALL" && item.priority !== priorityFilter) return false;
      if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;

      return true;
    });
  }, [incidents, searchQuery, priorityFilter, categoryFilter, statusFilter]);

  const criticalAlert = useMemo(
    () => incidents.find((i) => i.isCriticalAlert && i.status !== "Resolved"),
    [incidents]
  );

  const handleResolveIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: "Resolved" as const } : inc))
    );
    setSelectedIncident(null);
    toast.success(`Safety incident ${id} marked as resolved!`);
  };

  const handleExportCSV = () => {
    const headers = ["Incident ID", "Title", "Party", "Role", "Priority", "Category", "Job ID", "Status", "Assigned Admin", "Reported Date", "Location"];
    const rows = filteredIncidents.map((i) => [
      i.id,
      `"${i.title}"`,
      `"${i.party.name}"`,
      i.party.role,
      i.priority,
      i.category,
      i.jobId || "N/A",
      i.status,
      `"${i.assignedAdmin}"`,
      `"${i.reportedDate}"`,
      `"${i.location}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bluefixx_safety_incidents_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>Disputes & support</span>
            <span>&gt;</span>
            <span className="font-semibold text-neutral-900">Safety / incidents</span>
          </div>
          <h1 className="text-xl md:text-2xl font-heading font-extrabold text-[#001B40]">
            Safety and incidents
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Incidents and alerts reported on the platform across users, investigating incidents in real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-3.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 self-start md:self-auto transition-colors shadow-2xs"
        >
          <svg className="w-3.5 h-3.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Export</span>
        </button>
      </div>

      {/* Critical Incident Alert Banner (from Screenshot 1) */}
      {criticalAlert && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start md:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-950 flex items-center gap-2">
                <span>1 critical incident open right now</span>
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              </h4>
              <p className="text-[11px] text-red-800 mt-0.5">
                <strong>{criticalAlert.id}</strong> — {criticalAlert.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedIncident(criticalAlert)}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Open incident case
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex flex-wrap items-center gap-3">
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
            placeholder="Search incident, user, location..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#001B40]"
          />
        </div>

        {/* Universal Dropdown Filters (Matching Frame 2147238654) */}
        <OpsDropdown
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={[
            { label: "Priority (All)", value: "ALL" },
            { label: "Critical", value: "Critical" },
            { label: "High", value: "High" },
            { label: "Medium", value: "Medium" },
            { label: "Low", value: "Low" },
          ]}
        />

        <OpsDropdown
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { label: "Category (All)", value: "ALL" },
            { label: "Conduct", value: "Conduct" },
            { label: "Damage", value: "Damage" },
            { label: "Theft", value: "Theft" },
            { label: "Harassment", value: "Harassment" },
            { label: "Safety", value: "Safety" },
          ]}
        />

        <OpsDropdown
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "Status (All)", value: "ALL" },
            { label: "Open", value: "Open" },
            { label: "Investigating", value: "Investigating" },
            { label: "Resolved", value: "Resolved" },
            { label: "Escalated", value: "Escalated" },
          ]}
        />
      </div>

      {/* Incidents Data Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Party</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Job</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    No safety incidents found matching the search.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* ID & Title */}
                    <td className="py-3.5 px-4 font-semibold">
                      <button
                        type="button"
                        onClick={() => setSelectedIncident(inc)}
                        className="font-bold text-[#074292] hover:underline flex items-center gap-1.5 text-left"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        <span>{inc.id}</span>
                      </button>
                      <span className="text-[11px] text-neutral-600 block font-normal max-w-sm truncate mt-0.5">
                        {inc.title}
                      </span>
                    </td>

                    {/* Party */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-neutral-900 block">{inc.party.name}</span>
                      <span className="text-[10px] text-neutral-500">
                        {inc.party.role} · {inc.party.code}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.priority === "Critical"
                            ? "bg-red-100 text-red-700"
                            : inc.priority === "High"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {inc.priority}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-neutral-800">{inc.category}</span>
                    </td>

                    {/* Job */}
                    <td className="py-3.5 px-4">
                      {inc.jobId ? (
                        <Link
                          href={`/ops/jobs?search=${inc.jobId}`}
                          className="font-bold text-[#074292] hover:underline"
                        >
                          {inc.jobId}
                        </Link>
                      ) : (
                        <span className="text-neutral-400 italic">None</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.status === "Resolved"
                            ? "bg-emerald-100 text-emerald-800"
                            : inc.status === "Investigating"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>

                    {/* Assigned */}
                    <td className="py-3.5 px-4 text-neutral-600 font-medium">
                      {inc.assignedAdmin}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedIncident(inc)}
                        className="px-2.5 py-1 rounded-lg border border-neutral-200 text-[#001B40] hover:bg-neutral-100 font-semibold text-[11px] transition-colors"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Investigation Drawer */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-neutral-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                      {selectedIncident.priority}
                    </span>
                    <span className="text-xs font-bold text-[#074292]">{selectedIncident.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#001B40] mt-1">{selectedIncident.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Party Information */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-neutral-900 block">{selectedIncident.party.name}</span>
                  <span className="text-[11px] text-neutral-500">
                    {selectedIncident.party.role} · {selectedIncident.party.code}
                  </span>
                </div>
                <Link
                  href={`/ops/users?search=${selectedIncident.party.code}`}
                  className="text-[#074292] font-semibold hover:underline text-[11px]"
                >
                  Inspect profile &rarr;
                </Link>
              </div>

              {/* Description & Location */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                  Incident Report & Location
                </span>
                <p className="p-3.5 bg-neutral-50/80 rounded-xl border border-neutral-100 text-xs text-neutral-800 leading-relaxed">
                  {selectedIncident.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-600 pt-1">
                  <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Reported from: <strong>{selectedIncident.location}</strong> ({selectedIncident.reportedDate})</span>
                </div>
              </div>

              {selectedIncident.jobId && (
                <div className="text-xs flex items-center justify-between p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                  <span className="text-blue-900">Related Job: <strong>{selectedIncident.jobId}</strong></span>
                  <Link href={`/ops/jobs?search=${selectedIncident.jobId}`} className="text-[#074292] font-bold hover:underline">
                    View job details &rarr;
                  </Link>
                </div>
              )}

              {/* Investigation Notes Input */}
              <div className="space-y-2 pt-2">
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Add Investigation Finding / Action
                </label>
                <textarea
                  rows={3}
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                  placeholder="Record interview notes with client, witness testimony, or police report..."
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#001B40]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleResolveIncident(selectedIncident.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                Close & Resolve
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Investigation finding saved to case audit!");
                    setTriageNotes("");
                    setSelectedIncident(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#001B40] text-white hover:bg-[#074292]"
                >
                  Save finding
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
