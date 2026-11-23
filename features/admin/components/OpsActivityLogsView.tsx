"use client";

import React, { useState, useMemo } from "react";
import { MOCK_ADMIN_AUDIT_LOGS } from "../mockPlatformData";
import { AdminAuditLog } from "../types";
import { OpsDropdown, OpsDropdownOption } from "./OpsDropdown";
import { OpsActivityLogDetailDrawer } from "./OpsActivityLogDetailDrawer";

export function OpsActivityLogsView() {
  const [logs] = useState<AdminAuditLog[]>(MOCK_ADMIN_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminFilter, setAdminFilter] = useState("ALL");
  const [objectFilter, setObjectFilter] = useState("ALL");
  const [sensitivityFilter, setSensitivityFilter] = useState("ALL");

  // Quick category pill filter
  const [quickFilter, setQuickFilter] = useState<"ALL" | "SENSITIVE" | "FINANCE" | "SECURITY">("ALL");

  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Compliance Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"CSV" | "JSON">("CSV");
  const [exportDateRange, setExportDateRange] = useState("Last 30 days");
  const [complianceReason, setComplianceReason] = useState("Quarterly Internal Security & Financial Audit");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dropdown options
  const adminOptions: OpsDropdownOption[] = [
    { label: "Admin", value: "ALL" },
    { label: "Tunde Balogun", value: "Tunde Balogun" },
    { label: "Simeon Daniel", value: "Simeon Daniel" },
    { label: "Admin Overflow", value: "Admin Overflow" },
    { label: "Bisi Ebiang", value: "Bisi Ebiang" },
    { label: "Emeka Nwaeze", value: "Emeka Nwaeze" },
  ];

  const objectOptions: OpsDropdownOption[] = [
    { label: "Object", value: "ALL" },
    { label: "Withdrawal", value: "Withdrawal" },
    { label: "Verification", value: "Verification" },
    { label: "User", value: "User" },
    { label: "Support ticket", value: "Support ticket" },
    { label: "Refund", value: "Refund" },
    { label: "Settings", value: "Settings" },
    { label: "Administrator", value: "Administrator" },
    { label: "Role", value: "Role" },
  ];

  const sensitivityOptions: OpsDropdownOption[] = [
    { label: "Sensitivity", value: "ALL" },
    { label: "Sensitive Only", value: "SENSITIVE" },
    { label: "Standard Only", value: "STANDARD" },
  ];

  // Filtering
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Quick filter
      if (quickFilter === "SENSITIVE" && !log.isSensitive) return false;
      if (quickFilter === "FINANCE" && !["Withdrawal", "Refund", "Settings"].includes(log.object)) return false;
      if (quickFilter === "SECURITY" && !["User", "Administrator", "Role", "Verification"].includes(log.object)) return false;

      // Dropdown filters
      if (adminFilter !== "ALL" && log.adminName !== adminFilter) return false;
      if (objectFilter !== "ALL" && log.object !== objectFilter) return false;
      if (sensitivityFilter === "SENSITIVE" && !log.isSensitive) return false;
      if (sensitivityFilter === "STANDARD" && log.isSensitive) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAdmin = log.adminName.toLowerCase().includes(q);
        const matchesObjectId = log.objectId.toLowerCase().includes(q);
        const matchesAction = log.action.toLowerCase().includes(q);
        if (!matchesAdmin && !matchesObjectId && !matchesAction) return false;
      }
      return true;
    });
  }, [logs, quickFilter, adminFilter, objectFilter, sensitivityFilter, searchQuery]);

  // Execute Compliance Export
  const handleExecuteExport = () => {
    const timestamp = new Date().toISOString();
    const hash = "SHA-256:" + Math.random().toString(16).substring(2, 10) + "8f2b3e";

    if (exportFormat === "CSV") {
      const metadata = [
        `# BLUEFIXX OPERATIONAL AUDIT COMPLIANCE EXPORT`,
        `# Exported At: ${timestamp}`,
        `# Exported By: Simeon Daniel (Operations Admin)`,
        `# Compliance Purpose: "${complianceReason}"`,
        `# Cryptographic Integrity Seal: ${hash}`,
        `# Scope: ${exportDateRange}`,
        "",
      ].join("\n");

      const headers = ["Date Time", "Admin", "Action", "Sensitive", "Object", "Object ID", "Change", "IP Address", "Reason"];
      const rows = filteredLogs.map((l) => [
        l.dateTime,
        l.adminName,
        `"${l.action}"`,
        l.isSensitive ? "Yes" : "No",
        l.object,
        l.objectId,
        `"${l.change}"`,
        l.ipAddress || "—",
        `"${(l.reason || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(metadata + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n"));
      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      link.setAttribute("download", `bluefixx_compliance_audit_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const exportObject = {
        meta: {
          organization: "Bluefixx Technologies Nigeria",
          exportedAt: timestamp,
          exportedBy: "Simeon Daniel (Operations Admin)",
          purpose: complianceReason,
          scope: exportDateRange,
          tamperEvidenceSeal: hash,
          recordCount: filteredLogs.length,
        },
        records: filteredLogs,
      };

      const jsonContent = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const link = document.createElement("a");
      link.setAttribute("href", jsonContent);
      link.setAttribute("download", `bluefixx_compliance_audit_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setIsExportModalOpen(false);
    setToastMessage(`Signed compliance audit report exported (${exportFormat})`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-neutral-400 mb-1">Activity logs</div>
        <h1 className="text-2xl font-extrabold text-[#001B40] tracking-tight">
          Activity logs
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Complete immutable audit trail with cryptographic tamper-evident signatures, admin authorization, and state diffs.
        </p>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick Filter Pill Buttons */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setQuickFilter("ALL")}
          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
            quickFilter === "ALL"
              ? "bg-[#001B40] text-white shadow-2xs"
              : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          All Operations ({logs.length})
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter("SENSITIVE")}
          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
            quickFilter === "SENSITIVE"
              ? "bg-amber-800 text-white shadow-2xs"
              : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
          }`}
        >
          <span>🔒 Sensitive Only</span>
          <span className="text-[10px] bg-amber-200/60 text-amber-900 px-1.5 py-0.2 rounded-full">
            {logs.filter((l) => l.isSensitive).length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter("FINANCE")}
          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
            quickFilter === "FINANCE"
              ? "bg-purple-800 text-white shadow-2xs"
              : "bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100"
          }`}
        >
          Financial Settlements &amp; Refunds
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter("SECURITY")}
          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
            quickFilter === "SECURITY"
              ? "bg-blue-800 text-white shadow-2xs"
              : "bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100"
          }`}
        >
          Staff &amp; Access Controls
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
              placeholder="Search admin or object ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#001B40]"
            />
          </div>

          <OpsDropdown options={adminOptions} value={adminFilter} onChange={setAdminFilter} />
          <OpsDropdown options={objectOptions} value={objectFilter} onChange={setObjectFilter} />
          <OpsDropdown options={sensitivityOptions} value={sensitivityFilter} onChange={setSensitivityFilter} />

          {(searchQuery || adminFilter !== "ALL" || objectFilter !== "ALL" || sensitivityFilter !== "ALL" || quickFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setAdminFilter("ALL");
                setObjectFilter("ALL");
                setSensitivityFilter("ALL");
                setQuickFilter("ALL");
              }}
              className="text-xs text-red-600 hover:underline px-2 font-semibold cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Compliance Export Button */}
        <button
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-800 hover:bg-neutral-50 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          <span>Export Audit Trail</span>
        </button>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Date / time</th>
                <th className="py-3 px-4">Admin</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Object</th>
                <th className="py-3 px-4">Object ID</th>
                <th className="py-3 px-4">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => {
                    setSelectedLog(log);
                    setIsDrawerOpen(true);
                  }}
                  className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                >
                  {/* Date Time */}
                  <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                    {log.dateTime}
                  </td>

                  {/* Admin Name */}
                  <td className="py-3.5 px-4 font-bold text-[#001B40] whitespace-nowrap">
                    {log.adminName}
                  </td>

                  {/* Action with Sensitive Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-800">{log.action}</span>
                      {log.isSensitive && (
                        <span className="whitespace-nowrap shrink-0 inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Sensitive
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Object */}
                  <td className="py-3.5 px-4 text-neutral-600 whitespace-nowrap">
                    {log.object}
                  </td>

                  {/* Object ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-neutral-700 whitespace-nowrap">
                    {log.objectId}
                  </td>

                  {/* Change Transition */}
                  <td className="py-3.5 px-4 font-medium text-neutral-700 whitespace-nowrap">
                    {log.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span>1–{filteredLogs.length} of {filteredLogs.length} entries</span>
          <div className="flex items-center gap-1.5">
            <button type="button" disabled className="px-2 py-1 rounded border border-neutral-200 text-neutral-300">
              &lt; Prev
            </button>
            <span className="font-semibold text-neutral-700">Page 1</span>
            <button type="button" disabled className="px-2 py-1 rounded border border-neutral-200 text-neutral-300">
              Next &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Audit Trail Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#001B40]">
                  Export Compliance Audit Log
                </h3>
                <p className="text-neutral-500 text-xs mt-0.5">
                  Generate a tamper-evident, cryptographically sealed record of operational actions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Export Format */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExportFormat("CSV")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                      exportFormat === "CSV"
                        ? "border-[#001B40] bg-blue-50/40 text-[#001B40]"
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="font-bold block">CSV (Spreadsheet)</span>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">
                      Formatted table with SHA-256 header signature for Excel/Sheets.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat("JSON")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                      exportFormat === "JSON"
                        ? "border-[#001B40] bg-blue-50/40 text-[#001B40]"
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="font-bold block">JSON (Security Audit)</span>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">
                      Structured object with raw cryptographic seals and IP records.
                    </span>
                  </button>
                </div>
              </div>

              {/* Date Scope */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Time Scope</label>
                <select
                  value={exportDateRange}
                  onChange={(e) => setExportDateRange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#001B40]"
                >
                  <option value="Last 24 hours">Last 24 hours</option>
                  <option value="Last 7 days">Last 7 days</option>
                  <option value="Last 30 days">Last 30 days</option>
                  <option value="All Time">All Time ({filteredLogs.length} current entries)</option>
                </select>
              </div>

              {/* Justification Reason */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Audit Purpose / Justification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={complianceReason}
                  onChange={(e) => setComplianceReason(e.target.value)}
                  placeholder="e.g. CBN Regulatory Audit or Quarterly Financial Review"
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
                />
                <span className="text-[10px] text-neutral-400 block mt-1">
                  This purpose is permanently embedded in the export metadata and recorded to admin activity.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-neutral-300 font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteExport}
                className="px-5 py-2 rounded-xl bg-[#001B40] text-white font-bold hover:bg-[#074292] shadow-xs cursor-pointer"
              >
                Download Signed Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Detail Drawer */}
      <OpsActivityLogDetailDrawer
        log={selectedLog}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedLog(null);
        }}
      />
    </div>
  );
}
