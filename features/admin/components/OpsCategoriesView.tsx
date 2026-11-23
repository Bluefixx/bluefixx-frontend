"use client";

import React, { useState, useMemo } from "react";
import { formatNaira } from "@/lib/utils/currency";
import { MOCK_ADMIN_TRADES } from "../mockPlatformData";
import { AdminTradeCategory } from "../types";
import { OpsDropdown, OpsDropdownOption } from "./OpsDropdown";
import { OpsCreateTradeModal } from "./OpsCreateTradeModal";
import { OpsInactivateTradeModal } from "./OpsInactivateTradeModal";

export function OpsCategoriesView() {
  const [trades, setTrades] = useState<AdminTradeCategory[]>(MOCK_ADMIN_TRADES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [demandFilter, setDemandFilter] = useState("ALL");

  // Modals state
  const [selectedTradeForEdit, setSelectedTradeForEdit] = useState<AdminTradeCategory | null>(null);
  const [isCreateOrEditOpen, setIsCreateOrEditOpen] = useState(false);

  const [selectedTradeForInactivate, setSelectedTradeForInactivate] = useState<AdminTradeCategory | null>(null);
  const [isInactivateOpen, setIsInactivateOpen] = useState(false);

  const handleSaveTrade = (savedTrade: Partial<AdminTradeCategory>) => {
    setTrades((prev) => {
      const exists = prev.some((t) => t.id === savedTrade.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTrade.id ? ({ ...t, ...savedTrade } as AdminTradeCategory) : t));
      }
      return [savedTrade as AdminTradeCategory, ...prev];
    });
  };

  const handleConfirmInactivate = (tradeId: string, reason: string) => {
    setTrades((prev) =>
      prev.map((t) =>
        t.id === tradeId
          ? { ...t, status: t.status === "Active" ? "Inactive" : "Active", deactivationReason: reason }
          : t
      )
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Trade", "Subcategories", "Active Workers", "Jobs (30d)", "Demand", "Avg Job Value", "Status"];
    const rows = filteredTrades.map((t) => [
      t.name,
      `"${t.subcategories.join("; ")}"`,
      t.activeWorkers,
      t.jobs30d,
      t.demand,
      formatNaira(t.avgJobValueKobo, true),
      t.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bluefixx_trades_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusOptions: OpsDropdownOption[] = [
    { label: "Status", value: "ALL" },
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  const demandOptions: OpsDropdownOption[] = [
    { label: "Demand", value: "ALL" },
    { label: "High", value: "High" },
    { label: "Medium", value: "Medium" },
    { label: "Low", value: "Low" },
  ];

  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (demandFilter !== "ALL" && t.demand !== demandFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesSub = t.subcategories.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesSub) return false;
      }
      return true;
    });
  }, [trades, statusFilter, demandFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-neutral-400 mb-1">Categories / trades</div>
          <h1 className="text-2xl font-extrabold text-[#001B40] tracking-tight">
            Trades and categories
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            The taxonomy that drives matching, verification requirements and commission. Demand signals show where supply is short.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedTradeForEdit(null);
            setIsCreateOrEditOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#001B40] text-white text-xs font-bold hover:bg-[#074292] shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <span>+</span>
          <span>Create trade</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Trade or subcategory"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#001B40]"
            />
          </div>

          <OpsDropdown options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
          <OpsDropdown options={demandOptions} value={demandFilter} onChange={setDemandFilter} />

          {(searchQuery || statusFilter !== "ALL" || demandFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setDemandFilter("ALL");
              }}
              className="text-xs text-red-600 hover:underline px-2 font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

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

      {/* Trades Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Trade</th>
                <th className="py-3 px-4 text-center">Active workers</th>
                <th className="py-3 px-4 text-center">Jobs (30d)</th>
                <th className="py-3 px-4">Demand</th>
                <th className="py-3 px-4">Avg job value</th>
                <th className="py-3 px-4 text-center">Jobs/worker</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredTrades.map((t) => (
                <tr key={t.id} className="hover:bg-neutral-50/60 transition-colors">
                  {/* Trade Name & Subcategories */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="font-bold text-neutral-900 text-xs block">
                      {t.name}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-normal line-clamp-1 mt-0.5">
                      {t.subcategories.join(", ")}
                    </span>
                  </td>

                  {/* Active Workers */}
                  <td className="py-3.5 px-4 text-center font-bold text-neutral-800 whitespace-nowrap">
                    {t.activeWorkers}
                  </td>

                  {/* Jobs (30d) */}
                  <td className="py-3.5 px-4 text-center font-bold text-neutral-900 whitespace-nowrap">
                    {t.jobs30d.toLocaleString()}
                  </td>

                  {/* Demand Indicator */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.demand === "High"
                          ? "bg-emerald-100 text-emerald-800"
                          : t.demand === "Medium"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      ● {t.demand}
                    </span>
                  </td>

                  {/* Avg Job Value */}
                  <td className="py-3.5 px-4 font-bold text-neutral-900 whitespace-nowrap">
                    {formatNaira(t.avgJobValueKobo, true)}
                  </td>

                  {/* Ratio Jobs per Worker */}
                  <td className="py-3.5 px-4 text-center font-medium text-neutral-700 whitespace-nowrap">
                    {t.jobsPerWorker}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`whitespace-nowrap shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === "Active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      ● {t.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTradeForEdit(t);
                          setIsCreateOrEditOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-neutral-300 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 flex items-center gap-1 cursor-pointer"
                      >
                        <span>✎</span>
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTradeForInactivate(t);
                          setIsInactivateOpen(true);
                        }}
                        title={t.status === "Active" ? "Deactivate trade" : "Reactivate trade"}
                        className={`p-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 cursor-pointer ${
                          t.status === "Active" ? "text-neutral-500 hover:text-red-700" : "text-emerald-700"
                        }`}
                      >
                        ⏻
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span>
            1–{filteredTrades.length} of {filteredTrades.length}
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

      {/* Modals */}
      <OpsCreateTradeModal
        trade={selectedTradeForEdit}
        isOpen={isCreateOrEditOpen}
        onClose={() => {
          setIsCreateOrEditOpen(false);
          setSelectedTradeForEdit(null);
        }}
        onSave={handleSaveTrade}
      />

      <OpsInactivateTradeModal
        trade={selectedTradeForInactivate}
        isOpen={isInactivateOpen}
        onClose={() => {
          setIsInactivateOpen(false);
          setSelectedTradeForInactivate(null);
        }}
        onConfirm={handleConfirmInactivate}
      />
    </div>
  );
}
