"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { AdminSupportTicket } from "../types";
import { MOCK_ADMIN_SUPPORT_TICKETS } from "../mockDisputesData";
import { OpsDropdown } from "./OpsDropdown";

export function OpsSupportView() {
  const [tickets, setTickets] = useState<AdminSupportTicket[]>(MOCK_ADMIN_SUPPORT_TICKETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [onlyBreached, setOnlyBreached] = useState(false);

  // Selected ticket for Quick Drawer / Action
  const [selectedTicket, setSelectedTicket] = useState<AdminSupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (onlyBreached && !t.isBreachedSLA) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          t.id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.user.name.toLowerCase().includes(q) ||
          t.user.code.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;

      return true;
    });
  }, [tickets, onlyBreached, searchQuery, categoryFilter, priorityFilter, statusFilter]);

  const breachedCount = useMemo(() => tickets.filter((t) => t.isBreachedSLA).length, [tickets]);

  const handleResolveTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: "Resolved" as const } : t))
    );
    setSelectedTicket(null);
    toast.success(`Ticket ${ticketId} marked as resolved!`);
  };

  const handleSendTicketReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    toast.success(`Reply sent to ${selectedTicket.user.name}`);
    setReplyText("");
    setSelectedTicket(null);
  };

  const handleExportCSV = () => {
    const headers = ["Ticket ID", "Subject", "User", "Role", "Category", "Priority", "Status", "Assigned", "Created", "Wait Time"];
    const rows = filteredTickets.map((t) => [
      t.id,
      `"${t.subject}"`,
      `"${t.user.name}"`,
      t.user.role,
      t.category,
      t.priority,
      t.status,
      `"${t.assignedAdmin}"`,
      `"${t.createdAt}"`,
      t.waitTime,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bluefixx_support_tickets_${Date.now()}.csv`);
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
            <span className="font-semibold text-neutral-900">Support tickets</span>
          </div>
          <h1 className="text-xl md:text-2xl font-heading font-extrabold text-[#001B40]">
            Support inbox
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Every ticket open on the platform with SLA timer, live job transaction or dispute context.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* SLA Breach Alert Banner */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start md:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950">
              {breachedCount} tickets breaching first-response SLA
            </h4>
            <p className="text-[11px] text-amber-800">
              Average wait time 3.7 hrs including two high-priority payment complaints.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOnlyBreached(!onlyBreached)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            onlyBreached
              ? "bg-[#001B40] text-white shadow-xs"
              : "bg-amber-200/80 hover:bg-amber-300 text-amber-950"
          }`}
        >
          {onlyBreached ? "Showing Breaches Only (Reset)" : "View breaches"}
        </button>
      </div>

      {/* Filters Bar */}
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
            placeholder="Ticket, subject or user..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#001B40]"
          />
        </div>

        {/* Universal Dropdown Filters (Matching Frame 2147238654) */}
        <OpsDropdown
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { label: "Category (All)", value: "ALL" },
            { label: "Withdrawal", value: "Withdrawal" },
            { label: "Payments", value: "Payments" },
            { label: "Dispute", value: "Dispute" },
            { label: "Verification", value: "Verification" },
            { label: "Account Safety", value: "Account Safety" },
            { label: "Apprenticeship", value: "Apprenticeship" },
            { label: "Reviews", value: "Reviews" },
            { label: "Programmes", value: "Programmes" },
          ]}
        />

        <OpsDropdown
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={[
            { label: "Priority (All)", value: "ALL" },
            { label: "Urgent", value: "Urgent" },
            { label: "High", value: "High" },
            { label: "Medium", value: "Medium" },
            { label: "Low", value: "Low" },
          ]}
        />

        <OpsDropdown
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "Status (All)", value: "ALL" },
            { label: "Open", value: "Open" },
            { label: "In Progress", value: "In Progress" },
            { label: "Waiting for user", value: "Waiting for user" },
            { label: "Resolved", value: "Resolved" },
          ]}
        />
      </div>

      {/* Support Tickets Data Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Wait time</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-400">
                    No support tickets match the current filters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* ID & Subject */}
                    <td className="py-3.5 px-4 font-semibold">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(t)}
                        className="font-bold text-[#074292] hover:underline block text-left"
                      >
                        {t.id}
                      </button>
                      <span className="text-[11px] text-neutral-600 block font-normal max-w-xs truncate">
                        {t.subject}
                      </span>
                    </td>

                    {/* User */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900">{t.user.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-neutral-100 text-neutral-700 whitespace-nowrap shrink-0">
                          {t.user.role}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-neutral-700">{t.category}</span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center whitespace-nowrap shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === "Urgent"
                            ? "bg-red-100 text-red-700"
                            : t.priority === "High"
                            ? "bg-orange-100 text-orange-700"
                            : t.priority === "Medium"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center whitespace-nowrap shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === "Open"
                            ? "bg-blue-100 text-blue-800"
                            : t.status === "In Progress"
                            ? "bg-purple-100 text-purple-800"
                            : t.status === "Waiting for user"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    {/* Assigned */}
                    <td className="py-3.5 px-4 text-neutral-600">
                      <span className={t.assignedAdmin === "Unassigned" ? "text-neutral-400 italic" : "font-medium"}>
                        {t.assignedAdmin}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">
                      {t.createdAt.split(",")[0]}
                    </td>

                    {/* Wait Time with SLA Indicator */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          t.isBreachedSLA ? "text-red-600" : "text-neutral-700"
                        }`}
                      >
                        {t.waitTime}
                      </span>
                      {t.isBreachedSLA && (
                        <span className="block text-[9px] font-extrabold text-red-600 uppercase whitespace-nowrap">
                          SLA Breach
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(t)}
                        className="px-2.5 py-1 rounded-lg border border-neutral-200 text-[#001B40] hover:bg-neutral-100 font-semibold text-[11px] transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Quick Inspection & Resolution Drawer */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-neutral-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <span className="text-xs font-bold text-[#074292]">{selectedTicket.id}</span>
                  <h3 className="text-base font-bold text-[#001B40] mt-0.5">{selectedTicket.subject}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg text-sm"
                >
                  ✕
                </button>
              </div>

              {/* User details pill */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-neutral-900 block">{selectedTicket.user.name}</span>
                  <span className="text-[11px] text-neutral-500">
                    {selectedTicket.user.role} · {selectedTicket.user.code}
                  </span>
                </div>
                <Link
                  href={`/ops/users?search=${selectedTicket.user.code}`}
                  className="text-[#074292] font-semibold hover:underline text-[11px]"
                >
                  View profile &rarr;
                </Link>
              </div>

              {/* Snippet */}
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
                  Message Thread
                </span>
                <div className="p-3.5 bg-neutral-50/80 rounded-xl border border-neutral-100 text-xs text-neutral-800 leading-relaxed">
                  "{selectedTicket.lastMessageSnippet}"
                </div>
              </div>

              {/* Quick links to context */}
              {selectedTicket.jobId && (
                <div className="text-xs flex items-center justify-between p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                  <span className="text-blue-900">Linked Job: <strong>{selectedTicket.jobId}</strong></span>
                  <Link href={`/ops/jobs?search=${selectedTicket.jobId}`} className="text-[#074292] font-bold hover:underline">
                    Inspect job &rarr;
                  </Link>
                </div>
              )}

              {/* Reply Box */}
              <div className="space-y-2 pt-2">
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Post Administrative Reply
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type an official customer support reply..."
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#001B40]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleResolveTicket(selectedTicket.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                Mark Resolved
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSendTicketReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#001B40] text-white hover:bg-[#074292] disabled:opacity-50"
                >
                  Send reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
