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

  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      if (adminFilter !== "ALL" && log.adminName !== adminFilter) return false;
      if (objectFilter !== "ALL" && log.object !== objectFilter) return false;
      if (sensitivityFilter === "SENSITIVE" && !log.isSensitive) return false;
      if (sensitivityFilter === "STANDARD" && log.isSensitive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAdmin = log.adminName.toLowerCase().includes(q);
        const matchesObjectId = log.objectId.toLowerCase().includes(q);
        const matchesAction = log.action.toLowerCase().includes(q);
        if (!matchesAdmin && !matchesObjectId && !matchesAction) return false;
      }
      return true;
    });
  }, [logs, adminFilter, objectFilter, sensitivityFilter, searchQuery]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Date Time", "Admin", "Action", "Sensitive", "Object", "Object ID", "Change", "Reason"];
    const rows = filteredLogs.map((l) => [
      l.dateTime,
      l.adminName,
      `"${l.action}"`,
      l.isSensitive ? "Yes" : "No",
      l.object,
      l.objectId,
      `"${l.change}"`,
      `"${(l.reason || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bluefixx_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          Complete audit trail with timestamp, admin, what changed and before/after. Entries are immutable.
        </p>
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
              placeholder="Search admin or object ID"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#001B40]"
            />
          </div>

          <OpsDropdown options={adminOptions} value={adminFilter} onChange={setAdminFilter} />
          <OpsDropdown options={objectOptions} value={objectFilter} onChange={setObjectFilter} />
          <OpsDropdown options={sensitivityOptions} value={sensitivityFilter} onChange={setSensitivityFilter} />

          {(searchQuery || adminFilter !== "ALL" || objectFilter !== "ALL" || sensitivityFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setAdminFilter("ALL");
                setObjectFilter("ALL");
                setSensitivityFilter("ALL");
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
          <span>1–{filteredLogs.length} of 142</span>
          <div className="flex items-center gap-1.5">
            <button type="button" disabled className="px-2 py-1 rounded border border-neutral-200 text-neutral-300">
              &lt; Prev
            </button>
            <span className="font-semibold text-neutral-700">Page 1</span>
            <button type="button" className="px-2 py-1 rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-50">
              Next &gt;
            </button>
          </div>
        </div>
      </div>

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
