"use client";

import React, { useState } from "react";
import { AdminTalentApplication } from "../types";

interface OpsTalentApplicationDrawerProps {
  application: AdminTalentApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: "In Review" | "Shortlisted" | "Verified" | "Rejected") => void;
}

export function OpsTalentApplicationDrawer({
  application,
  isOpen,
  onClose,
  onUpdateStatus,
}: OpsTalentApplicationDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !application) return null;

  const handleAction = (status: "Shortlisted" | "Verified" | "Rejected") => {
    setIsSubmitting(true);
    setTimeout(() => {
      onUpdateStatus(application.id, status);
      setIsSubmitting(false);
      setToastMessage(`Application marked as ${status}`);
      setTimeout(() => {
        setToastMessage(null);
        onClose();
      }, 1000);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Apprenticeship Application
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                {application.id}
              </span>
            </div>
            <h2 className="text-base font-bold text-[#001B40] mt-0.5">
              {application.talentName}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
          {toastMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium">
              ✓ {toastMessage}
            </div>
          )}

          {/* Quick summary */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 grid grid-cols-2 gap-3">
            <div>
              <span className="text-neutral-400 font-semibold uppercase text-[10px]">Applied Programme</span>
              <p className="font-bold text-neutral-900 mt-0.5">{application.programme}</p>
            </div>
            <div>
              <span className="text-neutral-400 font-semibold uppercase text-[10px]">Trade</span>
              <p className="font-bold text-neutral-900 mt-0.5">{application.trade}</p>
            </div>
            <div>
              <span className="text-neutral-400 font-semibold uppercase text-[10px]">Location</span>
              <p className="font-semibold text-neutral-800 mt-0.5">{application.location}</p>
            </div>
            <div>
              <span className="text-neutral-400 font-semibold uppercase text-[10px]">Applied Date</span>
              <p className="font-semibold text-neutral-800 mt-0.5">{application.appliedDate}</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <h3 className="font-bold text-neutral-900 uppercase text-[11px] tracking-wider">Contact Information</h3>
            <div className="p-3 rounded-xl border border-neutral-200 space-y-1.5 bg-white">
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
            </div>
          </div>

          {/* Questionnaire Answers */}
          <div className="space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase text-[11px] tracking-wider">Applicant Questionnaire</h3>
            
            <div className="p-3 rounded-xl border border-neutral-200 bg-white space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Statement of Motivation</span>
              <p className="text-neutral-800 leading-relaxed font-medium">
                &ldquo;{application.motivation}&rdquo;
              </p>
            </div>

            <div className="p-3 rounded-xl border border-neutral-200 bg-white space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Prior Trade Experience</span>
              <p className="text-neutral-800 leading-relaxed font-medium">
                {application.experience || "None declared."}
              </p>
            </div>

            {application.refereeName && (
              <div className="p-3 rounded-xl border border-neutral-200 bg-white space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Guardian / Professional Reference</span>
                <p className="text-neutral-900 font-bold">{application.refereeName}</p>
                <p className="text-neutral-500">{application.refereeContact}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleAction("Rejected")}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-red-300 text-red-700 font-bold text-xs hover:bg-red-50 cursor-pointer"
            >
              Reject Application
            </button>
            <div className="flex-1 flex items-center justify-end gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAction("Shortlisted")}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs hover:bg-neutral-100 cursor-pointer"
              >
                Shortlist
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAction("Verified")}
                className="px-4 py-2 rounded-xl bg-[#001B40] text-white font-bold text-xs hover:bg-[#074292] cursor-pointer"
              >
                Verify &amp; Admit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
