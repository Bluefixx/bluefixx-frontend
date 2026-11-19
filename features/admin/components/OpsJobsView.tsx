"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AdminJob, JobPaymentStatus, JobDeliveryStatus } from "../types";
import { MOCK_ADMIN_JOBS } from "../mockJobsData";
import { OpsJobDetailsDrawer } from "./OpsJobDetailsDrawer";
import {
  OpsForceReleaseModal,
  OpsRefundModal,
  OpsReassignWorkerModal,
} from "./OpsJobActionModals";
import { OpsDisputeArbitrationModal } from "./OpsDisputeArbitrationModal";

export function OpsJobsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "all";

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const [jobs, setJobs] = useState<AdminJob[]>(MOCK_ADMIN_JOBS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJobStatus, setFilterJobStatus] = useState<string>("ALL");
  const [filterPayment, setFilterPayment] = useState<string>("ALL");
  const [filterTrade, setFilterTrade] = useState<string>("ALL");
  const [filterLocation, setFilterLocation] = useState<string>("ALL");
  const [showNeedsAttentionOnly, setShowNeedsAttentionOnly] = useState(false);

  // Modals & Drawers state
  const [selectedJobForDrawer, setSelectedJobForDrawer] = useState<AdminJob | null>(null);
  const [jobForForceRelease, setJobForForceRelease] = useState<AdminJob | null>(null);
  const [jobForRefund, setJobForRefund] = useState<AdminJob | null>(null);
  const [jobForReassign, setJobForReassign] = useState<AdminJob | null>(null);
  const [jobForArbitration, setJobForArbitration] = useState<AdminJob | null>(null);
  const [activeMenuJobId, setActiveMenuJobId] = useState<string | null>(null);

  // Attention count
  const attentionJobsCount = useMemo(() => {
    return jobs.filter((j) => j.needsAttention).length;
  }, [jobs]);

  // Tab mapping
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // 1. Attention override toggle
      if (showNeedsAttentionOnly && !j.needsAttention) return false;

      // 2. Tab filter
      if (currentTab === "active" && j.deliveryStatus !== "IN_PROGRESS") return false;
      if (currentTab === "pending" && j.deliveryStatus !== "POSTED" && j.deliveryStatus !== "PENDING") return false;
      if (currentTab === "completed" && j.deliveryStatus !== "COMPLETED") return false;
      if (currentTab === "cancelled" && j.deliveryStatus !== "CANCELLED") return false;
      if (currentTab === "disputed" && j.deliveryStatus !== "DISPUTED") return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          Boolean(j.id && j.id.toLowerCase().includes(q)) ||
          Boolean(j.title && j.title.toLowerCase().includes(q)) ||
          Boolean(j.customer?.name && j.customer.name.toLowerCase().includes(q)) ||
          Boolean(j.customer?.code && j.customer.code.toLowerCase().includes(q)) ||
          Boolean(j.worker?.name && j.worker.name.toLowerCase().includes(q)) ||
          Boolean(j.worker?.code && j.worker.code.toLowerCase().includes(q)) ||
          Boolean(j.trade && j.trade.toLowerCase().includes(q)) ||
          Boolean(j.location && j.location.toLowerCase().includes(q));
        if (!match) return false;
      }

      // 4. Dropdown filters
      if (filterJobStatus !== "ALL" && j.deliveryStatus !== filterJobStatus) return false;
      if (filterPayment !== "ALL" && j.paymentStatus !== filterPayment) return false;
      if (filterTrade !== "ALL" && j.trade !== filterTrade) return false;
      if (
        filterLocation !== "ALL" &&
        (!j.location || !j.location.toLowerCase().includes(filterLocation.toLowerCase()))
      )
        return false;

      return true;
    });
  }, [
    jobs,
    currentTab,
    showNeedsAttentionOnly,
    searchQuery,
    filterJobStatus,
    filterPayment,
    filterTrade,
    filterLocation,
  ]);

  const handleTabChange = (tab: string) => {
    setShowNeedsAttentionOnly(false);
    if (tab === "all") {
      router.push("/ops/jobs");
    } else {
      router.push(`/ops/jobs?tab=${tab}`);
    }
  };

  const handleExportCSV = () => {
    if (typeof window === "undefined") return;
    const header = "Job ID,Title,Customer,Worker,Trade,Location,Value,Payment Status,Delivery Status,Posted Date\n";
    const rows = filteredJobs
      .map(
        (j) =>
          `"${j.id}","${j.title.replace(/"/g, '""')}","${j.customer.name}","${j.worker?.name || "Unassigned"}","${j.trade}","${j.location}",${j.value},"${j.paymentStatus}","${j.deliveryStatus}","${j.postedDate}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bluefixx_jobs_${currentTab}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Jobs exported to CSV successfully.");
  };

  const handleForceReleaseConfirm = (job: AdminJob, reason: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === job.id) {
          return {
            ...j,
            paymentStatus: "RELEASED",
            deliveryStatus: "COMPLETED",
            needsAttention: false,
            escrowDetails: {
              ...j.escrowDetails,
              escrowReleasedAt: new Date().toISOString(),
            },
            activityLog: [
              {
                id: `act-${Date.now()}`,
                timestamp: "Just now",
                action: "Force Escrow Release Executed",
                actor: "Admin (Simeon Daniel)",
                details: reason,
              },
              ...(j.activityLog || []),
            ],
          };
        }
        return j;
      })
    );
    toast.success(`Escrow released for ${job.id}. Worker wallet credited.`);
  };

  const handleRefundConfirm = (job: AdminJob, amount: number, reason: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === job.id) {
          const isFull = amount >= j.value;
          return {
            ...j,
            paymentStatus: isFull ? "REFUNDED" : j.paymentStatus,
            deliveryStatus: isFull ? "CANCELLED" : j.deliveryStatus,
            needsAttention: false,
            activityLog: [
              {
                id: `act-${Date.now()}`,
                timestamp: "Just now",
                action: `Refund Issued (₦${amount.toLocaleString()})`,
                actor: "Admin (Simeon Daniel)",
                details: reason,
              },
              ...(j.activityLog || []),
            ],
          };
        }
        return j;
      })
    );
    toast.success(`Refund of ₦${amount.toLocaleString()} issued to customer for ${job.id}.`);
  };

  const handleReassignConfirm = (job: AdminJob, newWorkerId: string, newWorkerName: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === job.id) {
          return {
            ...j,
            worker: {
              id: newWorkerId,
              code: "w-new",
              name: newWorkerName,
              phone: "0800 000 0000",
              trade: j.trade,
            },
            needsAttention: false,
            activityLog: [
              {
                id: `act-${Date.now()}`,
                timestamp: "Just now",
                action: "Artisan Reassigned",
                actor: "Admin (Simeon Daniel)",
                details: `Reassigned from ${job.worker?.name || "previous"} to ${newWorkerName}.`,
              },
              ...(j.activityLog || []),
            ],
          };
        }
        return j;
      })
    );
    toast.success(`Job ${job.id} reassigned to ${newWorkerName}.`);
  };

  const handleArbitrationResolve = (
    job: AdminJob,
    outcome: "WORKER_FULL" | "CUSTOMER_FULL" | "SPLIT",
    workerSharePercent: number,
    justification: string
  ) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === job.id) {
          return {
            ...j,
            paymentStatus: outcome === "CUSTOMER_FULL" ? "REFUNDED" : "RELEASED",
            deliveryStatus: "COMPLETED",
            needsAttention: false,
            disputeDetails: j.disputeDetails
              ? {
                  ...j.disputeDetails,
                  status: "RESOLVED",
                  resolutionProposal: `Arbitrated as ${outcome} (${workerSharePercent}% worker share). Justification: ${justification}`,
                }
              : undefined,
            activityLog: [
              {
                id: `act-${Date.now()}`,
                timestamp: "Just now",
                action: "Binding Arbitration Executed",
                actor: "Admin (Simeon Daniel)",
                details: `Outcome: ${outcome}. ${justification}`,
              },
              ...(j.activityLog || []),
            ],
          };
        }
        return j;
      })
    );
    toast.success(`Dispute for ${job.id} arbitrated and settlement executed.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900">Jobs</h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Every job on the marketplace with its money state alongside its delivery state — the two things that go wrong together.
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setShowNeedsAttentionOnly(false);
              handleTabChange("all");
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
              !showNeedsAttentionOnly && currentTab === "all"
                ? "bg-[#001B40] text-white"
                : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            All jobs
          </button>

          <button
            type="button"
            onClick={() => setShowNeedsAttentionOnly((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
              showNeedsAttentionOnly
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            <span>Needs attention ({attentionJobsCount})</span>
          </button>

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
      </div>

      {/* Operational Attention Banner (Screenshot 1-3) */}
      <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-xs text-amber-800">
            {attentionJobsCount}
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-900">
              Jobs requiring operational attention
            </div>
            <div className="text-[11px] text-neutral-600">
              Overdue delivery, failed escrow funding, or worker suspended mid-job.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNeedsAttentionOnly(true)}
          className="text-xs font-bold text-neutral-800 hover:text-black flex items-center gap-1 hover:underline shrink-0"
        >
          <span>Filter to these jobs</span>
          <span>→</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200 px-6 pt-3 flex gap-6 overflow-x-auto">
          {[
            { id: "all", label: "All jobs" },
            { id: "active", label: "Active" },
            { id: "pending", label: "Pending" },
            { id: "completed", label: "Completed" },
            { id: "cancelled", label: "Cancelled" },
            { id: "disputed", label: "Disputed", count: 2 },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                currentTab === tab.id
                  ? "border-[#001B40] text-[#001B40]"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
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
                placeholder="Job ID, title, customer or wo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#001B40]"
              />
            </div>

            {/* Job Status Filter */}
            <select
              value={filterJobStatus}
              onChange={(e) => setFilterJobStatus(e.target.value)}
              className="text-xs bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-neutral-700 focus:outline-hidden"
            >
              <option value="ALL">Job Status</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="POSTED">Posted</option>
              <option value="DISPUTED">Disputed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Payment Filter */}
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="text-xs bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-neutral-700 focus:outline-hidden"
            >
              <option value="ALL">Payment</option>
              <option value="IN_ESCROW">In Escrow</option>
              <option value="HOLDING">Holding</option>
              <option value="RELEASED">Released</option>
              <option value="DISPUTED">Disputed</option>
              <option value="REFUNDED">Refunded</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* Trade Filter */}
            <select
              value={filterTrade}
              onChange={(e) => setFilterTrade(e.target.value)}
              className="text-xs bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-neutral-700 focus:outline-hidden"
            >
              <option value="ALL">Trade</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Masonry">Masonry</option>
              <option value="Air conditioning">Air conditioning</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Painting">Painting</option>
            </select>

            {/* Location Filter */}
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="text-xs bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-neutral-700 focus:outline-hidden"
            >
              <option value="ALL">Location</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Enugu">Enugu</option>
              <option value="Benin City">Benin City</option>
              <option value="Kano">Kano</option>
            </select>

            {/* Reset Filters */}
            {(searchQuery ||
              filterJobStatus !== "ALL" ||
              filterPayment !== "ALL" ||
              filterTrade !== "ALL" ||
              filterLocation !== "ALL" ||
              showNeedsAttentionOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setFilterJobStatus("ALL");
                  setFilterPayment("ALL");
                  setFilterTrade("ALL");
                  setFilterLocation("ALL");
                  setShowNeedsAttentionOnly(false);
                }}
                className="text-xs text-neutral-500 hover:text-neutral-800 underline px-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 text-neutral-500 uppercase tracking-wider text-[11px] border-b border-neutral-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Job</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Worker</th>
                <th className="py-3 px-4">Trade</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Job Status</th>
                <th className="py-3 px-4">Posted</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 text-neutral-800 font-normal">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-400">
                    No jobs match the specified criteria.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job, index) => {
                  const isMenuOpen = activeMenuJobId === job.id;
                  const openUpwards = index >= Math.max(0, filteredJobs.length - 2);

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-neutral-50/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedJobForDrawer(job)}
                    >
                      {/* Job ID & Title */}
                      <td className="py-3.5 px-4 font-medium max-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-[#001B40] group-hover:underline">
                            {job.id}
                          </span>
                          {job.needsAttention && (
                            <span title={job.attentionDescription} className="text-amber-500 text-xs">
                              ⚠️
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate" title={job.title}>
                          {job.title}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900">{job.customer.name}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{job.customer.code}</div>
                      </td>

                      {/* Worker */}
                      <td className="py-3.5 px-4">
                        {job.worker ? (
                          <>
                            <div className="font-semibold text-neutral-900 flex items-center gap-1">
                              <span>{job.worker.name}</span>
                              {job.worker.isSuspended && (
                                <span className="text-[9px] font-bold px-1 rounded bg-rose-100 text-rose-700">
                                  Suspended
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono">{job.worker.code}</div>
                          </>
                        ) : (
                          <span className="text-neutral-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Trade */}
                      <td className="py-3.5 px-4 text-neutral-700">{job.trade}</td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-neutral-600">{job.location}</td>

                      {/* Value */}
                      <td className="py-3.5 px-4 font-bold text-neutral-900">
                        ₦{job.value.toLocaleString()}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        {job.paymentStatus === "IN_ESCROW" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <svg className="w-2.5 h-2.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            In Escrow
                          </span>
                        )}
                        {job.paymentStatus === "HOLDING" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Holding
                          </span>
                        )}
                        {job.paymentStatus === "RELEASED" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Released
                          </span>
                        )}
                        {job.paymentStatus === "DISPUTED" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Disputed
                          </span>
                        )}
                        {job.paymentStatus === "REFUNDED" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-300">
                            Refunded
                          </span>
                        )}
                        {job.paymentStatus === "FAILED" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 border border-red-300">
                            Failed
                          </span>
                        )}
                      </td>

                      {/* Job Status */}
                      <td className="py-3.5 px-4">
                        {job.deliveryStatus === "IN_PROGRESS" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            In Progress
                          </span>
                        )}
                        {job.deliveryStatus === "COMPLETED" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Completed
                          </span>
                        )}
                        {job.deliveryStatus === "POSTED" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            Posted
                          </span>
                        )}
                        {job.deliveryStatus === "DISPUTED" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Disputed
                          </span>
                        )}
                        {job.deliveryStatus === "CANCELLED" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-300">
                            Cancelled
                          </span>
                        )}
                      </td>

                      {/* Posted Date */}
                      <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">{job.postedDate}</td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveMenuJobId(isMenuOpen ? null : job.id)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setActiveMenuJobId(null)} />
                            <div
                              className={`absolute right-4 w-48 bg-white rounded-2xl shadow-xl border border-neutral-200 py-1.5 z-40 text-left animate-in fade-in zoom-in-95 ${
                                openUpwards ? "bottom-8 mb-1" : "top-full mt-1"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedJobForDrawer(job);
                                  setActiveMenuJobId(null);
                                }}
                                className="w-full px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                              >
                                <span>🔍</span> Inspect Details
                              </button>

                              {job.paymentStatus === "IN_ESCROW" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setJobForForceRelease(job);
                                    setActiveMenuJobId(null);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                                >
                                  <span>💰</span> Release Escrow
                                </button>
                              )}

                              {(job.paymentStatus === "IN_ESCROW" || job.paymentStatus === "HOLDING" || job.paymentStatus === "DISPUTED") && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setJobForRefund(job);
                                    setActiveMenuJobId(null);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                                >
                                  <span>↩️</span> Issue Refund
                                </button>
                              )}

                              {job.worker?.isSuspended && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setJobForReassign(job);
                                    setActiveMenuJobId(null);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                                >
                                  <span>🔄</span> Reassign Artisan
                                </button>
                              )}

                              {job.disputeDetails && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setJobForArbitration(job);
                                    setActiveMenuJobId(null);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                                >
                                  <span>⚖️</span> Arbitrate Dispute
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 bg-neutral-50/50">
          <div>
            Showing <strong className="text-neutral-800">{filteredJobs.length}</strong> of{" "}
            <strong className="text-neutral-800">{jobs.length}</strong> jobs
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-400 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="font-semibold text-neutral-800">1</span>
            <button
              type="button"
              disabled
              className="px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <OpsJobDetailsDrawer
        job={selectedJobForDrawer}
        onClose={() => setSelectedJobForDrawer(null)}
        onForceReleaseEscrow={(j) => setJobForForceRelease(j)}
        onIssueRefund={(j) => setJobForRefund(j)}
        onReassignWorker={(j) => setJobForReassign(j)}
        onOpenArbitration={(j) => setJobForArbitration(j)}
      />

      {/* Modals */}
      <OpsForceReleaseModal
        job={jobForForceRelease}
        isOpen={Boolean(jobForForceRelease)}
        onClose={() => setJobForForceRelease(null)}
        onConfirm={handleForceReleaseConfirm}
      />

      <OpsRefundModal
        job={jobForRefund}
        isOpen={Boolean(jobForRefund)}
        onClose={() => setJobForRefund(null)}
        onConfirm={handleRefundConfirm}
      />

      <OpsReassignWorkerModal
        job={jobForReassign}
        isOpen={Boolean(jobForReassign)}
        onClose={() => setJobForReassign(null)}
        onConfirm={handleReassignConfirm}
      />

      <OpsDisputeArbitrationModal
        job={jobForArbitration}
        isOpen={Boolean(jobForArbitration)}
        onClose={() => setJobForArbitration(null)}
        onResolve={handleArbitrationResolve}
      />
    </div>
  );
}
