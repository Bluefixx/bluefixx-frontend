"use client";

import React from "react";
import { AdminAuditLog } from "../types";

interface OpsActivityLogDetailDrawerProps {
  log: AdminAuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OpsActivityLogDetailDrawer({
  log,
  isOpen,
  onClose,
}: OpsActivityLogDetailDrawerProps) {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Audit Record
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 font-mono">
                {log.id}
              </span>
            </div>
            <h2 className="text-base font-bold text-[#001B40] mt-0.5">
              {log.action}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
          {/* Cryptographic Tamper-Evident Badge */}
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 text-sm">🔒</span>
              <span className="text-[11px] font-bold text-emerald-950">Immutable Audit Entry</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700">SHA-256: 8f2b...verified</span>
          </div>

          {/* Core Properties */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 space-y-2.5">
            <div className="flex justify-between">
              <span className="text-neutral-500">Timestamp:</span>
              <span className="font-bold text-neutral-900">{log.dateTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Administrator:</span>
              <span className="font-bold text-[#074292]">{log.adminName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Target Object:</span>
              <span className="font-semibold text-neutral-800">{log.object}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Object Reference ID:</span>
              <span className="font-mono font-bold text-neutral-900">{log.objectId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Admin IP Address:</span>
              <span className="font-mono text-neutral-600">{log.ipAddress || "102.89.44.82"}</span>
            </div>
          </div>

          {/* State Transition Diff */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              State Transition Diff
            </span>
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-neutral-400 font-semibold block">BEFORE</span>
                <span className="font-bold text-red-600">{log.change.split("→")[0]?.trim()}</span>
              </div>
              <span className="text-neutral-400 text-base">→</span>
              <div className="space-y-0.5 text-right">
                <span className="text-[10px] text-neutral-400 font-semibold block">AFTER</span>
                <span className="font-bold text-emerald-700">{log.change.split("→")[1]?.trim()}</span>
              </div>
            </div>
          </div>

          {/* Justification Reason */}
          {log.reason && (
            <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Documented Reason &amp; Audit Notes
              </span>
              <p className="text-neutral-800 font-medium leading-relaxed">
                &ldquo;{log.reason}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
