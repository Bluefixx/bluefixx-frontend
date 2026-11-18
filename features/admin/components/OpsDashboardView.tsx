"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  MOCK_ATTENTION_ITEMS,
  MOCK_MARKETPLACE_KPIS,
  MOCK_MOST_REQUESTED_TRADES,
  MOCK_MOST_ACTIVE_LOCATIONS,
  MOCK_MOST_ACTIVE_WORKERS,
  MOCK_SENSITIVE_ACTIONS,
} from "../mockData";

export function OpsDashboardView() {
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "90d" | "custom">("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Operations metrics updated in real-time.");
    }, 500);
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-150 pb-12">
      {/* Dashboard Top Greeting & Date Controls (Screenshot 4) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
            Good morning, Simeon
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Here&apos;s what needs your attention today — Friday, 23 August 2024, 09:24 WAT
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter Pills */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
            {(["today", "7d", "30d", "90d", "custom"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer capitalize ${
                  timeRange === r
                    ? "bg-white text-[#001B40] shadow-xs font-bold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {r === "7d" ? "7 days" : r === "30d" ? "30 days" : r === "90d" ? "90 days" : r}
              </button>
            ))}
          </div>

          {/* Date Picker Pill */}
          <div className="px-3.5 py-1.5 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-700 bg-white flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span>25 Jul – 23 Aug</span>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            title="Refresh metrics"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
          </button>
        </div>
      </div>

      {/* SECTION 1: Needs Your Attention (Screenshot 4 - 8 Priority Alert Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
              Needs your attention
            </h2>
            <span className="text-xs text-neutral-400">
              47 open items requiring operational SLA response
            </span>
          </div>
          <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">
            View all priority items →
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {MOCK_ATTENTION_ITEMS.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-heading font-black text-2xl text-[#0F1115]">
                    {item.count}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.level === "critical"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : item.level === "high"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {item.level === "critical" && "⚠ Critical"}
                    {item.level === "high" && "High"}
                    {item.level === "monitor" && "Monitor"}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-xs sm:text-sm text-[#0F1115] mt-2 line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <Link
                href={item.href}
                className="text-xs font-bold text-[#001B40] hover:text-[#074292] hover:underline pt-1 inline-block"
              >
                {item.actionText}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Marketplace Health (Screenshot 4) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-[#0F1115]">
            Marketplace health
          </h2>
          <span className="text-xs text-neutral-400">Last 30 days vs previous 30 days</span>
        </div>

        {/* Big Turnover Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-neutral-100">
          <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider block">
                Platform turnover
              </span>
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] mt-1 block">
                ₦1.84M
              </span>
              <span className="text-[11px] text-neutral-500">Commission revenue earned</span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
              +12.4%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider block">
                Gross transaction volume
              </span>
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] mt-1 block">
                ₦18.4M
              </span>
              <span className="text-[11px] text-neutral-500">Total job & training payments</span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
              +9.5%
            </span>
          </div>
        </div>

        {/* 9 Metrics Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {MOCK_MARKETPLACE_KPIS.map((kpi) => (
            <div key={kpi.label} className="p-3.5 rounded-2xl border border-neutral-100 bg-neutral-50/40">
              <span className="text-[11px] text-neutral-400 font-medium block truncate">
                {kpi.label}
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="font-heading font-bold text-lg text-[#0F1115]">
                  {kpi.value}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    kpi.positive ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {kpi.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Operational Analytics (Charts representation) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-[#0F1115]">
              Operational analytics
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Revenue and refund pressure trends over the selected time period
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-neutral-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#001B40]" />
              Platform turnover (₦1.84M)
            </span>
            <span className="flex items-center gap-1.5 text-neutral-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Escrow held (₦4.2M)
            </span>
            <span className="flex items-center gap-1.5 text-neutral-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Refunds (₦57k)
            </span>
          </div>
        </div>

        {/* SVG Sparkline Curve Chart */}
        <div className="w-full h-48 relative border-b border-neutral-100 pt-6">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 150">
            {/* Grid lines */}
            <line x1="0" y1="30" x2="800" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1="0" y1="75" x2="800" y2="75" stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2="800" y2="120" stroke="#f1f5f9" strokeDasharray="4 4" />

            {/* Turnover Line (rising curve) */}
            <path
              d="M0,130 C120,120 250,90 400,65 C550,45 680,30 800,18"
              fill="none"
              stroke="#001B40"
              strokeWidth="2.5"
            />
            {/* Escrow Line */}
            <path
              d="M0,140 C120,135 250,120 400,110 C550,105 680,95 800,85"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
            />
            {/* Refund line (low flat line) */}
            <path
              d="M0,146 C120,146 250,144 400,145 C550,145 680,144 800,143"
              fill="none"
              stroke="#EF4444"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* SECTION 4: 3-Column Breakdown (Trades, Locations, Workers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Most Requested Trades */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-[#0F1115]">
              Most requested trades
            </h3>
            <span className="text-[11px] text-neutral-400">Total volume</span>
          </div>
          <div className="space-y-3">
            {MOCK_MOST_REQUESTED_TRADES.map((t) => (
              <div key={t.trade} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-neutral-800">{t.trade}</span>
                  <span className="text-neutral-500 font-mono">{t.count.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#001B40] rounded-full"
                    style={{ width: `${t.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Locations */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-[#0F1115]">
              Most active locations
            </h3>
            <span className="text-[11px] text-neutral-400">Geo density</span>
          </div>
          <div className="space-y-3">
            {MOCK_MOST_ACTIVE_LOCATIONS.map((l) => (
              <div key={l.location} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-neutral-800">{l.location}</span>
                  <span className="text-neutral-500 font-mono">{l.count.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${l.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Workers */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-[#0F1115]">
              Most active workers
            </h3>
            <Link href="/ops/users?tab=workers" className="text-[11px] font-bold text-blue-600 hover:underline">
              All workers →
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_MOST_ACTIVE_WORKERS.map((w) => (
              <div key={w.name} className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100 last:border-none">
                <div>
                  <p className="font-bold text-[#0F1115]">{w.name}</p>
                  <p className="text-[10px] text-neutral-400">{w.role}</p>
                </div>
                <span className="font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {w.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 5: Recent Sensitive Admin Actions (Screenshot 4) */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-[#0F1115]">
              Recent sensitive admin actions
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live audit trail of operations overrides and financial approvals
            </p>
          </div>
          <Link href="/ops/activity-logs" className="text-xs font-bold text-blue-600 hover:underline">
            Full audit log →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/70 border-b border-neutral-100 text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Admin</th>
                <th className="py-2.5 px-3">Action Description</th>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {MOCK_SENSITIVE_ACTIONS.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/60">
                  <td className="py-3 px-3 text-neutral-500 whitespace-nowrap">{item.timestamp}</td>
                  <td className="py-3 px-3 font-semibold text-[#001B40]">{item.adminName}</td>
                  <td className="py-3 px-3 font-medium text-neutral-800">{item.action}</td>
                  <td className="py-3 px-3 font-mono text-neutral-500">{item.reference}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : item.status === "Suspended"
                          ? "bg-red-50 text-red-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
