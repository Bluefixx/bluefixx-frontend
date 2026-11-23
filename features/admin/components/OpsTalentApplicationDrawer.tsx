"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminTalentApplication } from "../types";

interface OpsTalentApplicationDrawerProps {
  application: AdminTalentApplication | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OpsTalentApplicationDrawer({
  application,
  isOpen,
  onClose,
}: OpsTalentApplicationDrawerProps) {
  const [adminNote, setAdminNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [isSavingNote, setIsSavingNote] = useState(false);

  if (!isOpen || !application) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNote.trim()) return;
    setIsSavingNote(true);
    setTimeout(() => {
      setSavedNotes((prev) => [adminNote, ...prev]);
      setAdminNote("");
      setIsSavingNote(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Application Oversight
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                {application.id}
              </span>
            </div>
            <h2 className="text-base font-bold text-[#001B40] mt-0.5">
              {application.talentName}
            </h2>
            <p className="text-[11px] text-neutral-500 font-mono mt-0.5">{application.talentId}</p>
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
          {/* Master Artisan Decision Authority Callout */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 flex items-start gap-2.5">
            <span className="text-blue-600 text-base mt-0.5">ℹ</span>
            <div className="text-[11px] text-blue-900 leading-relaxed">
              <span className="font-bold block text-blue-950">Master Artisan Decision Authority</span>
              This application is submitted directly to the workshop&apos;s supervising Master Artisan. The master artisan evaluates and accepts or declines applicants through their artisan portal.
            </div>
          </div>

          {/* Status & Programme Card */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Current Status</span>
                <div className="mt-1">
                  <span
                    className={`whitespace-nowrap shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      application.status === "Verified"
                        ? "bg-emerald-100 text-emerald-800"
                        : application.status === "Shortlisted"
                        ? "bg-blue-100 text-blue-800"
                        : application.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    ● {application.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Applied Date</span>
                <p className="font-semibold text-neutral-800 mt-1">{application.appliedDate}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200/60 grid grid-cols-2 gap-2">
              <div>
                <span className="text-neutral-400 text-[10px] uppercase font-semibold">Programme:</span>
                <p className="font-bold text-neutral-900 text-xs mt-0.5">{application.programme}</p>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px] uppercase font-semibold">Trade:</span>
                <p className="font-bold text-neutral-900 text-xs mt-0.5">{application.trade}</p>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px] uppercase font-semibold">Location:</span>
                <p className="font-semibold text-neutral-800 text-xs mt-0.5">{application.location}</p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <h3 className="font-bold text-neutral-900 uppercase text-[11px] tracking-wider">
              Talent Profile &amp; Contact
            </h3>
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Phone:</span>
                <span className="font-semibold text-neutral-900">{application.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Email:</span>
                <span className="font-semibold text-neutral-900">{application.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Education:</span>
                <span className="font-semibold text-neutral-900">{application.education}</span>
              </div>
              <div className="pt-2 border-t border-neutral-100 flex justify-end">
                <Link
                  href={`/ops/users/${application.talentId}`}
                  className="text-xs font-bold text-[#074292] hover:underline flex items-center gap-1"
                >
                  <span>Open Full Talent 360 Profile</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Questionnaire Answers */}
          <div className="space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase text-[11px] tracking-wider">
              Applicant Questionnaire Answers
            </h3>

            <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Statement of Motivation</span>
              <p className="text-neutral-800 leading-relaxed font-medium">
                &ldquo;{application.motivation}&rdquo;
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Prior Trade Experience</span>
              <p className="text-neutral-800 leading-relaxed font-medium">
                {application.experience || "None declared."}
              </p>
            </div>

            {application.refereeName && (
              <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Guardian / Professional Reference</span>
                <p className="text-neutral-900 font-bold">{application.refereeName}</p>
                <p className="text-neutral-500 text-[11px]">{application.refereeContact}</p>
              </div>
            )}
          </div>

          {/* Internal Operations Notes */}
          <div className="space-y-3 pt-2 border-t border-neutral-200">
            <h3 className="font-bold text-neutral-900 uppercase text-[11px] tracking-wider">
              Internal Admin Notes
            </h3>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Log internal note or verification remark..."
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingNote || !adminNote.trim()}
                  className="px-3 py-1.5 rounded-lg bg-[#001B40] text-white font-bold text-xs hover:bg-[#074292] disabled:opacity-50 cursor-pointer"
                >
                  {isSavingNote ? "Adding..." : "Add Note"}
                </button>
              </div>
            </form>

            {savedNotes.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {savedNotes.map((note, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-neutral-100 text-[11px] text-neutral-700">
                    <span className="font-bold text-neutral-900 block text-[10px]">Simeon Daniel · Just now:</span>
                    {note}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
