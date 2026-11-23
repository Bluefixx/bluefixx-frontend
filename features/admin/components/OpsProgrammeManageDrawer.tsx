"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/utils/currency";
import { AdminApprenticeshipProgramme } from "../types";

interface OpsProgrammeManageDrawerProps {
  programme: AdminApprenticeshipProgramme | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProgramme: (updated: AdminApprenticeshipProgramme) => void;
}

export function OpsProgrammeManageDrawer({
  programme,
  isOpen,
  onClose,
  onUpdateProgramme,
}: OpsProgrammeManageDrawerProps) {
  const [capacity, setCapacity] = useState(programme?.capacity || 10);
  const [status, setStatus] = useState<"Active" | "Full" | "Upcoming" | "Completed">(
    programme?.status || "Active"
  );
  const [isAdmissionsPaused, setIsAdmissionsPaused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync state when programme changes
  React.useEffect(() => {
    if (programme) {
      setCapacity(programme.capacity);
      setStatus(programme.status);
    }
  }, [programme]);

  if (!isOpen || !programme) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdateProgramme({
        ...programme,
        capacity,
        status: isAdmissionsPaused ? "Full" : status,
      });
      setIsSaving(false);
      setSuccessToast("Programme settings successfully updated");
      setTimeout(() => {
        setSuccessToast(null);
        onClose();
      }, 1000);
    }, 500);
  };

  const percentEnrolled = Math.round((programme.enrolledCount / capacity) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Programme Management
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                {programme.id}
              </span>
            </div>
            <h2 className="text-base font-bold text-[#001B40] mt-0.5">
              {programme.title}
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
          {successToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium flex items-center gap-2">
              <span>✓</span>
              <span>{successToast}</span>
            </div>
          )}

          {/* Quick Specifications */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 grid grid-cols-2 gap-3.5">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Trade</span>
              <p className="font-bold text-neutral-900 mt-0.5">{programme.trade}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Cohort</span>
              <p className="font-bold text-neutral-900 mt-0.5">{programme.cohort}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Location</span>
              <p className="font-semibold text-neutral-800 mt-0.5">{programme.location}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Duration</span>
              <p className="font-semibold text-neutral-800 mt-0.5">{programme.duration}</p>
            </div>
          </div>

          {/* Master Artisan Card */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-white flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Supervising Master Artisan</span>
              <p className="font-bold text-sm text-[#001B40] mt-0.5">{programme.masterArtisanName}</p>
              <p className="text-[11px] text-neutral-500">{programme.trade} Specialist</p>
            </div>
            <Link
              href={`/ops/users/${programme.masterArtisanId}`}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
            >
              View Profile →
            </Link>
          </div>

          {/* Enrollment Progress & Capacity */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Enrollment &amp; Capacity</span>
                <p className="font-bold text-sm text-neutral-900 mt-0.5">
                  {programme.enrolledCount} of {capacity} slots filled ({percentEnrolled}%)
                </p>
              </div>
              <span
                className={`whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  status === "Active"
                    ? "bg-emerald-100 text-emerald-800"
                    : status === "Full"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                ● {status}
              </span>
            </div>

            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#001B40] rounded-full transition-all"
                style={{ width: `${Math.min(percentEnrolled, 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-neutral-500 pt-1">
              <span>Remaining Open Slots: <strong className="text-neutral-800">{Math.max(capacity - programme.enrolledCount, 0)}</strong></span>
              <span>Cohort Fee: <strong className="text-neutral-800">{formatNaira(programme.feeKobo, true)}</strong></span>
            </div>
          </div>

          {/* Financial Pool Summary */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Cohort Financial Escrow Pool</span>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-neutral-500 text-[11px]">Fee per Apprentice:</span>
                <p className="font-bold text-neutral-900 text-sm">{formatNaira(programme.feeKobo, true)}</p>
              </div>
              <div>
                <span className="text-neutral-500 text-[11px]">Total Escrow Pool:</span>
                <p className="font-bold text-emerald-700 text-sm">
                  {formatNaira(programme.feeKobo * programme.enrolledCount, true)}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 italic pt-1">
              Escrow is released incrementally to the master artisan upon confirmed attendance and syllabus milestones.
            </p>
          </div>

          {/* Operational Controls Form */}
          <form onSubmit={handleSave} className="pt-2 border-t border-neutral-200 space-y-4">
            <h3 className="font-bold text-neutral-900 uppercase text-[11px] tracking-wider">
              Operational Governance Controls
            </h3>

            {/* Adjust Capacity */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Total Capacity (Available Slots)
              </label>
              <input
                type="number"
                min={programme.enrolledCount}
                max={50}
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || programme.enrolledCount)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#001B40]"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                Cannot be lower than current enrollment ({programme.enrolledCount} apprentices).
              </span>
            </div>

            {/* Change Status */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Cohort Lifecycle Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#001B40]"
              >
                <option value="Active">Active (Accepting applications / In training)</option>
                <option value="Full">Full (Capacity reached)</option>
                <option value="Upcoming">Upcoming (Scheduled start date)</option>
                <option value="Completed">Completed (Cohort finished)</option>
              </select>
            </div>

            {/* Pause Admissions Toggle */}
            <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-900">Pause Admissions</p>
                <p className="text-[11px] text-neutral-500">Temporarily prevent new talent applications from being submitted.</p>
              </div>
              <input
                type="checkbox"
                checked={isAdmissionsPaused}
                onChange={(e) => setIsAdmissionsPaused(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-[#001B40] text-white text-xs font-bold hover:bg-[#074292] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
