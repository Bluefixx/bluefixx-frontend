"use client";

import React, { useState } from "react";
import { formatNaira } from "@/lib/utils/currency";
import { MOCK_REPORTS_METRICS } from "../mockPlatformData";
import { OpsScheduleReportModal } from "./OpsScheduleReportModal";

export function OpsReportsView() {
  const [activeTab, setActiveTab] = useState<
    "users" | "marketplace" | "finance" | "workers" | "apprenticeship" | "support" | "disputes"
  >("users");

  const [dateRange, setDateRange] = useState("Last 30 days");
  const [selectedRegion, setSelectedRegion] = useState("All regions");
  const [selectedTrade, setSelectedTrade] = useState("All trades");

  // Chart Tooltips State
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(3); // Default Apr matching screenshot
  const [hoveredFunnelIndex, setHoveredFunnelIndex] = useState<number | null>(3);
  const [hoveredFinanceIndex, setHoveredFinanceIndex] = useState<number | null>(3);
  const [hoveredThroughputIndex, setHoveredThroughputIndex] = useState<number | null>(1); // Tue

  // LGA Drill-down state
  const [selectedStateForDrilldown, setSelectedStateForDrilldown] = useState<string | null>(null);

  // Modal State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const metrics = MOCK_REPORTS_METRICS;

  // Export aggregated CSV
  const handleExportCSV = () => {
    const headers = ["Tab", "Metric / Category", "Volume / Value", "Period Delta", "Region Scope"];
    const rows = [
      ["Users", "Active Workers (30d)", `${metrics.retention.activeWorkers30d}%`, metrics.retention.activeWorkersDelta, selectedRegion],
      ["Users", "Repeat Customers", `${metrics.retention.customersWithRepeatJob}%`, metrics.retention.customersRepeatDelta, selectedRegion],
      ["Marketplace", "Top Trade Volume (Electrical)", "2,210 jobs", "+14.2%", selectedRegion],
      ["Finance", "Take Rate", metrics.financeKpis.takeRate, metrics.financeKpis.takeRateDelta, selectedRegion],
      ["Finance", "Escrow Dispute Rate", metrics.financeKpis.escrowDisputeRate, metrics.financeKpis.escrowDisputeDelta, selectedRegion],
      ["Support", "SLA Resolution", metrics.supportKpis.resolvedInSla, metrics.supportKpis.resolvedDelta, selectedRegion],
      ["Disputes", "Median Resolution Time", metrics.disputesKpis.medianTimeToClose, metrics.disputesKpis.medianTimeDelta, selectedRegion],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bluefixx_operations_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("Operational report exported successfully.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-neutral-400 mb-1">Reports &amp; analytics</div>
          <h1 className="text-2xl font-extrabold text-[#001B40] tracking-tight">
            Reports and analytics
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Operational reporting built for decisions: what to fix, where to add supply, and what is costing money.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsScheduleOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#001B40] text-white text-xs font-bold hover:bg-[#074292] shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>⏱ Schedule report</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Bar Matching Figma */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="p-2 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-neutral-800 focus:outline-none focus:border-[#001B40]"
          >
            <option value="Last 30 days">Last 30 days</option>
            <option value="Last 90 days">Last 90 days</option>
            <option value="This Year">This Year (2026)</option>
            <option value="All Time">All Time</option>
          </select>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="p-2 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-neutral-800 focus:outline-none focus:border-[#001B40]"
          >
            <option value="All regions">All regions</option>
            <option value="Lagos region">Lagos region</option>
            <option value="Abuja FCT">Abuja FCT</option>
            <option value="Rivers / PH">Rivers / Port Harcourt</option>
          </select>

          <select
            value={selectedTrade}
            onChange={(e) => setSelectedTrade(e.target.value)}
            className="p-2 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-neutral-800 focus:outline-none focus:border-[#001B40]"
          >
            <option value="All trades">All trades</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Solar">Solar Installation</option>
          </select>
        </div>

        <span className="text-[11px] text-neutral-400 italic">
          Filters apply to all report metrics and charts below
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-6 text-xs font-bold overflow-x-auto">
          {[
            { id: "users", label: "Users" },
            { id: "marketplace", label: "Marketplace" },
            { id: "finance", label: "Finance" },
            { id: "workers", label: "Workers" },
            { id: "apprenticeship", label: "Apprenticeship" },
            { id: "support", label: "Support" },
            { id: "disputes", label: "Disputes" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-1 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#001B40] text-[#001B40] font-extrabold"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ========================================== */}
      {/* Tab 1: Users                               */}
      {/* ========================================== */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* User Growth Chart Container */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-sm text-[#001B40]">User growth by type</h3>
                <p className="text-[11px] text-neutral-500">
                  Workers vs customers vs talents, last 6 months
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Customers
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Workers
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Talent
                </span>
              </div>
            </div>

            {/* Interactive SVG Line Graph with Tooltip */}
            <div className="relative pt-6 pb-2">
              <svg viewBox="0 0 600 200" className="w-full h-48 overflow-visible">
                {/* Horizontal Grid lines */}
                <line x1="40" y1="30" x2="580" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="80" x2="580" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="130" x2="580" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="180" x2="580" y2="180" stroke="#e2e8f0" strokeWidth="1" />

                {/* Customers Polyline (Blue) */}
                <polyline
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  points="60,150 160,135 260,115 360,85 460,55 560,30"
                />

                {/* Workers Polyline (Emerald) */}
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  points="60,175 160,165 260,155 360,140 460,125 560,110"
                />

                {/* Talent Polyline (Amber) */}
                <polyline
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  points="60,190 160,185 260,180 360,170 460,160 560,150"
                />

                {/* Interactive Points on hover */}
                {metrics.userGrowth.map((g, idx) => {
                  const x = 60 + idx * 100;
                  return (
                    <g
                      key={g.month}
                      onMouseEnter={() => setHoveredMonthIndex(idx)}
                      className="cursor-pointer"
                    >
                      <line
                        x1={x}
                        y1="20"
                        x2={x}
                        y2="180"
                        stroke={hoveredMonthIndex === idx ? "#cbd5e1" : "transparent"}
                        strokeDasharray="3 3"
                        strokeWidth="1.5"
                      />
                      <circle cx={x} cy={85 - idx * 10 + 20} r="4" fill="#2563eb" />
                      <circle cx={x} cy={140 - idx * 6 + 10} r="4" fill="#059669" />
                      <circle cx={x} cy={170 - idx * 4 + 10} r="4" fill="#d97706" />
                      <text
                        x={x}
                        y="196"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748b"
                        fontWeight="600"
                      >
                        {g.month}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip Overlay matching Screenshot */}
              {hoveredMonthIndex !== null && (
                <div
                  className="absolute top-4 pointer-events-none bg-white p-3 rounded-xl shadow-xl border border-neutral-200 text-[11px] space-y-1 animate-in fade-in duration-150"
                  style={{ left: `calc(${10 + hoveredMonthIndex * 15}% + 10px)` }}
                >
                  <div className="font-extrabold text-neutral-800">
                    {metrics.userGrowth[hoveredMonthIndex].month}
                  </div>
                  <div className="text-blue-700 font-bold flex justify-between gap-3">
                    <span>Customers:</span>
                    <span>{metrics.userGrowth[hoveredMonthIndex].customers.toLocaleString()}</span>
                  </div>
                  <div className="text-emerald-700 font-bold flex justify-between gap-3">
                    <span>Workers:</span>
                    <span>{metrics.userGrowth[hoveredMonthIndex].workers.toLocaleString()}</span>
                  </div>
                  <div className="text-amber-700 font-bold flex justify-between gap-3">
                    <span>Talent:</span>
                    <span>{metrics.userGrowth[hoveredMonthIndex].talent.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Grid: Registrations by Location & Retention Signals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registrations by Location */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-[#001B40]">Registrations by location</h3>
                  <p className="text-[11px] text-neutral-500">
                    Click a state to view sub-district/LGA drill-downs
                  </p>
                </div>
                {selectedStateForDrilldown && (
                  <button
                    type="button"
                    onClick={() => setSelectedStateForDrilldown(null)}
                    className="text-[11px] font-bold text-[#074292] hover:underline cursor-pointer"
                  >
                    ← All States
                  </button>
                )}
              </div>

              {!selectedStateForDrilldown ? (
                <div className="space-y-3 pt-1">
                  {metrics.registrationsByLocation.map((loc) => (
                    <div
                      key={loc.state}
                      onClick={() => setSelectedStateForDrilldown(loc.state)}
                      className="group cursor-pointer space-y-1"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-neutral-800 group-hover:text-[#074292] transition-colors">
                          {loc.state} <span className="text-[10px] text-neutral-400 font-normal">({loc.lgas.length} districts)</span>
                        </span>
                        <span className="font-extrabold text-neutral-900">
                          {loc.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className="h-full bg-[#001B40] group-hover:bg-[#074292] rounded-full transition-all"
                          style={{ width: `${loc.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Sub-district / LGA Drill-down View */
                <div className="space-y-3 pt-1">
                  <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 font-bold text-xs text-[#001B40]">
                    📍 {selectedStateForDrilldown} Sub-District Clusters
                  </div>
                  {metrics.registrationsByLocation
                    .find((l) => l.state === selectedStateForDrilldown)
                    ?.lgas.map((lga) => (
                      <div key={lga.name} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-neutral-700">{lga.name}</span>
                          <span className="font-extrabold text-neutral-900">{lga.count.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                          <div
                            className="h-full bg-[#074292] rounded-full"
                            style={{ width: `${(lga.count / 1800) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Retention Signals with Delta Badges */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-[#001B40]">Retention signals</h3>
                <p className="text-[11px] text-neutral-500">
                  Engagement health metrics vs previous 30-day baseline
                </p>
              </div>

              <div className="divide-y divide-neutral-100 space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-neutral-700 font-medium">Workers active in last 30 days</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-neutral-900">
                      {metrics.retention.activeWorkers30d}%
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {metrics.retention.activeWorkersDelta}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <span className="text-neutral-700 font-medium">Customers with repeat job</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-neutral-900">
                      {metrics.retention.customersWithRepeatJob}%
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {metrics.retention.customersRepeatDelta}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <span className="text-neutral-700 font-medium">Talents completing on module</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-neutral-900">
                      {metrics.retention.talentsCompletingModule}%
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {metrics.retention.talentsModuleDelta}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <span className="text-neutral-700 font-medium">Dormant accounts (90 days)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-neutral-900">
                      {metrics.retention.dormantAccounts90d.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {metrics.retention.dormantDelta}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* Tab 2: Marketplace                         */}
      {/* ========================================== */}
      {activeTab === "marketplace" && (
        <div className="space-y-6">
          {/* Job Funnel Chart */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-sm text-[#001B40]">Job funnel</h3>
                <p className="text-[11px] text-neutral-500">
                  Posted → accepted → completed, with cancellations
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-neutral-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-neutral-400"></span> Posted
                </span>
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span> Accepted
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span> Completed
                </span>
                <span className="flex items-center gap-1.5 text-red-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span> Cancelled
                </span>
              </div>
            </div>

            {/* Interactive Funnel Grouped Bars */}
            <div className="relative pt-6 pb-2">
              <svg viewBox="0 0 600 200" className="w-full h-52 overflow-visible">
                <line x1="30" y1="40" x2="570" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="90" x2="570" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="140" x2="570" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="180" x2="570" y2="180" stroke="#e2e8f0" strokeWidth="1" />

                {metrics.jobFunnel.map((item, idx) => {
                  const groupX = 50 + idx * 90;
                  const hPosted = (item.posted / 450) * 140;
                  const hAccepted = (item.accepted / 450) * 140;
                  const hCompleted = (item.completed / 450) * 140;
                  const hCancelled = (item.cancelled / 450) * 140;

                  return (
                    <g
                      key={item.month}
                      onMouseEnter={() => setHoveredFunnelIndex(idx)}
                      className="cursor-pointer"
                    >
                      {/* Bar 1: Posted */}
                      <rect
                        x={groupX}
                        y={180 - hPosted}
                        width="14"
                        height={hPosted}
                        fill="#94a3b8"
                        rx="2"
                      />
                      {/* Bar 2: Accepted */}
                      <rect
                        x={groupX + 16}
                        y={180 - hAccepted}
                        width="14"
                        height={hAccepted}
                        fill="#2563eb"
                        rx="2"
                      />
                      {/* Bar 3: Completed */}
                      <rect
                        x={groupX + 32}
                        y={180 - hCompleted}
                        width="14"
                        height={hCompleted}
                        fill="#059669"
                        rx="2"
                      />
                      {/* Bar 4: Cancelled */}
                      <rect
                        x={groupX + 48}
                        y={180 - hCancelled}
                        width="14"
                        height={hCancelled}
                        fill="#ef4444"
                        rx="2"
                      />
                      <text
                        x={groupX + 31}
                        y="196"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748b"
                        fontWeight="600"
                      >
                        {item.month}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredFunnelIndex !== null && (
                <div
                  className="absolute top-4 pointer-events-none bg-white p-3 rounded-xl shadow-xl border border-neutral-200 text-[11px] space-y-1 animate-in fade-in duration-150"
                  style={{ left: `calc(${10 + hoveredFunnelIndex * 14}% + 10px)` }}
                >
                  <div className="font-extrabold text-neutral-800">
                    {metrics.jobFunnel[hoveredFunnelIndex].month}
                  </div>
                  <div className="text-neutral-600 font-bold flex justify-between gap-3">
                    <span>Posted:</span>
                    <span>{metrics.jobFunnel[hoveredFunnelIndex].posted}</span>
                  </div>
                  <div className="text-blue-700 font-bold flex justify-between gap-3">
                    <span>Accepted:</span>
                    <span>{metrics.jobFunnel[hoveredFunnelIndex].accepted}</span>
                  </div>
                  <div className="text-emerald-700 font-bold flex justify-between gap-3">
                    <span>Completed:</span>
                    <span>{metrics.jobFunnel[hoveredFunnelIndex].completed}</span>
                  </div>
                  <div className="text-red-700 font-bold flex justify-between gap-3">
                    <span>Cancelled:</span>
                    <span>{metrics.jobFunnel[hoveredFunnelIndex].cancelled}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Grid: Most Requested Trades & Average Job Value */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-[#001B40]">Most requested trades</h3>
              <div className="space-y-3 pt-1">
                {metrics.mostRequestedTrades.map((t) => (
                  <div key={t.trade} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-neutral-800">{t.trade}</span>
                      <span className="font-extrabold text-neutral-900">{t.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full bg-[#001B40] rounded-full"
                        style={{ width: `${t.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-[#001B40]">Average job value by trade</h3>
              <div className="space-y-3 pt-1">
                {metrics.avgJobValueByTrade.map((t) => (
                  <div key={t.trade} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-neutral-800">{t.trade}</span>
                      <span className="font-extrabold text-neutral-900">{t.formatted}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${t.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* Tab 3: Finance                             */}
      {/* ========================================== */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-sm text-[#001B40]">
                  Gross value, commission and refunds
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Gross transaction volume vs Bluefixx 10% take vs refund payouts
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-neutral-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-800"></span> GMV
                </span>
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Commission
                </span>
                <span className="flex items-center gap-1.5 text-red-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Refunds
                </span>
              </div>
            </div>

            {/* Interactive Finance Line Graph */}
            <div className="relative pt-6 pb-2">
              <svg viewBox="0 0 600 200" className="w-full h-48 overflow-visible">
                <line x1="40" y1="30" x2="580" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="80" x2="580" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="130" x2="580" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="180" x2="580" y2="180" stroke="#e2e8f0" strokeWidth="1" />

                {/* GMV Polyline */}
                <polyline
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  points="60,130 160,115 260,95 360,70 460,50 560,35"
                />

                {/* Commission Polyline */}
                <polyline
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  points="60,170 160,165 260,160 360,150 460,140 560,130"
                />

                {/* Refunds Polyline */}
                <polyline
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  points="60,178 160,177 260,176 360,174 460,172 560,170"
                />

                {metrics.financeTrends.map((f, idx) => {
                  const x = 60 + idx * 100;
                  return (
                    <g
                      key={f.month}
                      onMouseEnter={() => setHoveredFinanceIndex(idx)}
                      className="cursor-pointer"
                    >
                      <line
                        x1={x}
                        y1="20"
                        x2={x}
                        y2="180"
                        stroke={hoveredFinanceIndex === idx ? "#cbd5e1" : "transparent"}
                        strokeDasharray="3 3"
                        strokeWidth="1.5"
                      />
                      <circle cx={x} cy={130 - idx * 18} r="4" fill="#0f172a" />
                      <circle cx={x} cy={170 - idx * 8} r="4" fill="#2563eb" />
                      <circle cx={x} cy={178 - idx * 1.5} r="3" fill="#ef4444" />
                      <text
                        x={x}
                        y="196"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748b"
                        fontWeight="600"
                      >
                        {f.month}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {hoveredFinanceIndex !== null && (
                <div
                  className="absolute top-4 pointer-events-none bg-white p-3 rounded-xl shadow-xl border border-neutral-200 text-[11px] space-y-1 animate-in fade-in duration-150"
                  style={{ left: `calc(${10 + hoveredFinanceIndex * 15}% + 10px)` }}
                >
                  <div className="font-extrabold text-neutral-800">
                    {metrics.financeTrends[hoveredFinanceIndex].month}
                  </div>
                  <div className="text-neutral-900 font-bold flex justify-between gap-3">
                    <span>Gross Value:</span>
                    <span>{formatNaira(metrics.financeTrends[hoveredFinanceIndex].gmvKobo, true)}</span>
                  </div>
                  <div className="text-blue-700 font-bold flex justify-between gap-3">
                    <span>Commission (10%):</span>
                    <span>{formatNaira(metrics.financeTrends[hoveredFinanceIndex].commissionKobo, true)}</span>
                  </div>
                  <div className="text-red-700 font-bold flex justify-between gap-3">
                    <span>Refunds:</span>
                    <span>{formatNaira(metrics.financeTrends[hoveredFinanceIndex].refundsKobo, true)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4 Finance KPI Cards with Deltas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">Take rate</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#001B40]">{metrics.financeKpis.takeRate}</span>
                <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.2 rounded">
                  {metrics.financeKpis.takeRateDelta}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">Escrow dispute rate</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#001B40]">{metrics.financeKpis.escrowDisputeRate}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {metrics.financeKpis.escrowDisputeDelta}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">Refund approval rate</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#001B40]">{metrics.financeKpis.refundApprovalRate}</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                  {metrics.financeKpis.refundApprovalDelta}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">Avg payout turnaround</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#001B40]">{metrics.financeKpis.avgPayoutTurnaround}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {metrics.financeKpis.avgPayoutDelta}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* Tab 4: Workers                             */}
      {/* ========================================== */}
      {activeTab === "workers" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-sm text-[#001B40]">Verification throughput</h3>
                <p className="text-[11px] text-neutral-500">Decisions by day this week</p>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span> Approved
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Needs info
                </span>
                <span className="flex items-center gap-1.5 text-red-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span> Rejected
                </span>
              </div>
            </div>

            {/* Stacked Bar Chart */}
            <div className="relative pt-6 pb-2">
              <svg viewBox="0 0 600 200" className="w-full h-48 overflow-visible">
                <line x1="40" y1="40" x2="560" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="90" x2="560" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="140" x2="560" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="180" x2="560" y2="180" stroke="#e2e8f0" strokeWidth="1" />

                {metrics.verificationThroughput.map((item, idx) => {
                  const x = 70 + idx * 100;
                  const hApp = item.approved * 2.2;
                  const hNeeds = item.needsInfo * 2.2;
                  const hRej = item.rejected * 2.2;

                  return (
                    <g
                      key={item.day}
                      onMouseEnter={() => setHoveredThroughputIndex(idx)}
                      className="cursor-pointer"
                    >
                      {/* Rejected (Bottom) */}
                      <rect x={x} y={180 - hRej} width="32" height={hRej} fill="#ef4444" />
                      {/* Needs info (Middle) */}
                      <rect x={x} y={180 - hRej - hNeeds} width="32" height={hNeeds} fill="#f59e0b" />
                      {/* Approved (Top) */}
                      <rect
                        x={x}
                        y={180 - hRej - hNeeds - hApp}
                        width="32"
                        height={hApp}
                        fill="#059669"
                        rx="3"
                      />
                      <text
                        x={x + 16}
                        y="196"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748b"
                        fontWeight="600"
                      >
                        {item.day}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {hoveredThroughputIndex !== null && (
                <div
                  className="absolute top-4 pointer-events-none bg-white p-3 rounded-xl shadow-xl border border-neutral-200 text-[11px] space-y-1 animate-in fade-in duration-150"
                  style={{ left: `calc(${12 + hoveredThroughputIndex * 16}% + 10px)` }}
                >
                  <div className="font-extrabold text-neutral-800">
                    {metrics.verificationThroughput[hoveredThroughputIndex].day}
                  </div>
                  <div className="text-emerald-700 font-bold flex justify-between gap-3">
                    <span>Approved:</span>
                    <span>{metrics.verificationThroughput[hoveredThroughputIndex].approved}</span>
                  </div>
                  <div className="text-amber-700 font-bold flex justify-between gap-3">
                    <span>Needs info:</span>
                    <span>{metrics.verificationThroughput[hoveredThroughputIndex].needsInfo}</span>
                  </div>
                  <div className="text-red-700 font-bold flex justify-between gap-3">
                    <span>Rejected:</span>
                    <span>{metrics.verificationThroughput[hoveredThroughputIndex].rejected}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Earning Workers Leaderboard */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-[#001B40]">Top earning workers</h3>
            <div className="divide-y divide-neutral-100">
              {metrics.topEarningWorkers.map((w, idx) => (
                <div key={w.name} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center font-bold text-neutral-400">#{idx + 1}</span>
                    <div>
                      <span className="font-bold text-neutral-900 block">{w.name}</span>
                      <span className="text-[11px] text-neutral-500">
                        {w.trade} · {w.jobs} completed jobs
                      </span>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#001B40] text-sm">
                    {formatNaira(w.earningsKobo, true)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* Tab 5: Apprenticeship                      */}
      {/* ========================================== */}
      {activeTab === "apprenticeship" && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-[#001B40]">Apprenticeship pipeline metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">Open workshop slots</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#001B40]">
                  {metrics.apprenticeshipKpis.openSlots}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {metrics.apprenticeshipKpis.openSlotsDelta}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">Completion rate</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#001B40]">
                  {metrics.apprenticeshipKpis.completionRate}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {metrics.apprenticeshipKpis.completionDelta}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">Post-grad placement rate</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#001B40]">
                  {metrics.apprenticeshipKpis.placementRate}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {metrics.apprenticeshipKpis.placementDelta}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">Overdue milestone payments</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-amber-700">
                  {formatNaira(metrics.apprenticeshipKpis.overdueMilestoneKobo, true)}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {metrics.apprenticeshipKpis.overdueDelta}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* Tab 6: Support                             */}
      {/* ========================================== */}
      {activeTab === "support" && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-[#001B40]">Support &amp; ticket SLA health</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">Resolved in SLA</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#001B40]">
                  {metrics.supportKpis.resolvedInSla}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {metrics.supportKpis.resolvedDelta}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">First response median</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#001B40]">
                  {metrics.supportKpis.firstResponseMedian}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {metrics.supportKpis.firstResponseDelta}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">Escalated to lead</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-amber-700">
                  {metrics.supportKpis.escalatedToLead}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {metrics.supportKpis.escalatedDelta}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">Median ticket life</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#001B40]">
                  {metrics.supportKpis.medianTicketLife}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {metrics.supportKpis.ticketLifeDelta}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* Tab 7: Disputes                            */}
      {/* ========================================== */}
      {activeTab === "disputes" && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-[#001B40]">Dispute volume &amp; arbitration efficiency</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">Disputed jobs %</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#001B40]">
                  {metrics.disputesKpis.disputedJobsPercent}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {metrics.disputesKpis.disputedPercentDelta}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">Dispute rate</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#001B40]">
                  {metrics.disputesKpis.disputeRate}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {metrics.disputesKpis.disputeRateDelta}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">Median time to close</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#001B40]">
                  {metrics.disputesKpis.medianTimeToClose}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {metrics.disputesKpis.medianTimeDelta}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400">Favor artisan vs customer</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-[#001B40]">
                  {metrics.disputesKpis.favorArtisanVsCustomerSplit}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {metrics.disputesKpis.favorArtisanDelta}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Report Modal */}
      <OpsScheduleReportModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSave={() => {
          setToastMessage("Automated recurring report schedule created.");
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />
    </div>
  );
}
