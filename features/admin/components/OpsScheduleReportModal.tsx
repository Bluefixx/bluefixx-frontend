"use client";

import React, { useState } from "react";
import { AdminScheduledReport } from "../types";

interface OpsScheduleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: Partial<AdminScheduledReport>) => void;
}

export function OpsScheduleReportModal({
  isOpen,
  onClose,
  onSave,
}: OpsScheduleReportModalProps) {
  const [name, setName] = useState("Weekly Operational Performance Digest");
  const [frequency, setFrequency] = useState<"WEEKLY" | "MONTHLY" | "DAILY">("WEEKLY");
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [time, setTime] = useState("08:00 AM");
  const [recipientsText, setRecipientsText] = useState("executive-team@bluefixx.ng, simeon.daniel@bluefixx.ng");
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "Users",
    "Marketplace",
    "Finance",
    "Workers",
    "Apprenticeship",
  ]);

  if (!isOpen) return null;

  const toggleSection = (sec: string) => {
    setSelectedSections((prev) =>
      prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const recipients = recipientsText
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    onSave({
      id: `REP-SCHED-${Date.now()}`,
      name: name.trim(),
      frequency,
      dayOfWeek: frequency === "WEEKLY" ? dayOfWeek : "1st of month",
      time,
      recipients,
      sections: selectedSections,
      status: "ACTIVE",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200 text-xs">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#001B40]">Schedule Recurring Report</h3>
            <p className="text-neutral-500 text-xs mt-0.5">
              Automated compilation and email delivery of operational charts and metrics.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-sm p-1 rounded-md cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold text-neutral-700 mb-1">Report Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#001B40]"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Day</label>
              <select
                disabled={frequency === "DAILY"}
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#001B40] disabled:opacity-50"
              >
                <option value="Monday">Monday</option>
                <option value="Friday">Friday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Dispatch Time</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#001B40]"
              >
                <option value="06:00 AM">06:00 AM UTC</option>
                <option value="08:00 AM">08:00 AM UTC</option>
                <option value="06:00 PM">06:00 PM UTC</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              Recipient Email Addresses (Comma-separated) *
            </label>
            <input
              type="text"
              required
              value={recipientsText}
              onChange={(e) => setRecipientsText(e.target.value)}
              placeholder="e.g. ceo@bluefixx.ng, ops@bluefixx.ng"
              className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1.5">Include Sections in Digest</label>
            <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              {[
                "Users",
                "Marketplace",
                "Finance",
                "Workers",
                "Apprenticeship",
                "Support",
                "Disputes",
              ].map((sec) => (
                <label key={sec} className="flex items-center gap-2 cursor-pointer font-medium text-neutral-800">
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(sec)}
                    onChange={() => toggleSection(sec)}
                    className="rounded text-[#001B40]"
                  />
                  <span>{sec}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#001B40] text-white font-bold hover:bg-[#074292] shadow-xs cursor-pointer"
            >
              Schedule Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
