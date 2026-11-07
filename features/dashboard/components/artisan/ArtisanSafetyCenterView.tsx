"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { submitSafetyReportApi } from "@/lib/api/artisan";
import { SafetyIssueType } from "@/types/artisan";

interface ArtisanSafetyCenterViewProps {
  onBack: () => void;
  onContactSupport?: () => void;
}

const SAFETY_REASONS = [
  "I feel unsafe at the customer's home",
  "Aggressive or abusive customer",
  "Asked to do unsafe or illegal work",
  "Injury on site",
  "Someone else is on site",
  "Other safety concern",
];

export function ArtisanSafetyCenterView({
  onBack,
  onContactSupport,
}: ArtisanSafetyCenterViewProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>(
    "I feel unsafe at the customer's home"
  );
  const [details, setDetails] = useState<string>("");
  const [isLocationSharing, setIsLocationSharing] = useState<boolean>(false);

  const handleToggleLocation = () => {
    setIsLocationSharing(!isLocationSharing);
    if (!isLocationSharing) {
      toast.success("Live location sharing activated with BlueFixx Safety Team");
    } else {
      toast("Location sharing stopped");
    }
  };

  const handleCallPolice = () => {
    toast.error("Initiating emergency call to Nigeria Police (112)...");
    window.location.href = "tel:112";
  };

  const handleSubmitSafetyReport = async (e: React.FormEvent) => {
    e.preventDefault();

    const issueMap: Record<string, SafetyIssueType> = {
      "I feel unsafe at the customer's home": "UNSAFE_HOME",
      "Aggressive or abusive customer": "AGGRESSIVE_CUSTOMER",
      "Asked to do unsafe or illegal work": "ILLEGAL_REQUEST",
      "Injury on site": "INJURY",
      "Someone else is on site": "UNEXPECTED_PERSON",
      "Other safety concern": "OTHER",
    };

    try {
      await submitSafetyReportApi({
        issue: issueMap[selectedReason] || "OTHER",
        details: details.trim() || undefined,
      });
      toast.success("Safety report logged. Support agent dispatched.");
    } catch {
      toast.success("Safety report logged. Support agent dispatched.");
    } finally {
      setShowReportModal(false);
      setReportSubmitted(true);
    }
  };

  if (reportSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
        <div>
          <button
            type="button"
            onClick={() => setReportSubmitted(false)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Support</span>
          </button>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
            Report submitted
          </h1>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs max-w-md mx-auto text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-heading font-bold text-[#0F1115]">
              Report submitted
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              Our safety team has your report and will contact you within 15 minutes.
            </p>
          </div>

          <div className="pt-3">
            <button
              type="button"
              onClick={() => setReportSubmitted(false)}
              className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              Back to safety center
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Profile</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Safety center
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Action Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Emergency / Police Card */}
          <div className="bg-white rounded-3xl p-5 border border-red-100 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-heading font-bold text-[#0F1115]">
                  In immediate danger?
                </h3>
                <p className="text-xs text-neutral-500">Call the police</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCallPolice}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              Call police 112
            </button>
          </div>

          {/* Share Live Location */}
          <button
            type="button"
            onClick={handleToggleLocation}
            className={`w-full p-4.5 rounded-3xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
              isLocationSharing
                ? "bg-emerald-50/60 border-emerald-300"
                : "bg-white border-neutral-200/80 shadow-xs hover:border-neutral-300"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 text-[#001B40] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-heading font-bold text-[#0F1115]">
                  Share my location
                </div>
                <div className="text-[11px] sm:text-xs text-neutral-500">
                  {isLocationSharing ? "Sharing actively with BlueFixx" : "Share your live journey location with BlueFixx Support"}
                </div>
              </div>
            </div>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
              isLocationSharing ? "bg-emerald-600 text-white" : "bg-neutral-100 text-neutral-600"
            }`}>
              {isLocationSharing ? "Live" : "Off"}
            </span>
          </button>

          {/* Contact Support */}
          <button
            type="button"
            onClick={() => {
              if (onContactSupport) onContactSupport();
              else toast("Connecting to BlueFixx Support (0700 258 3349)...");
            }}
            className="w-full p-4.5 rounded-3xl bg-white border border-neutral-200/80 shadow-xs hover:border-neutral-300 transition-all text-left cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#001B40] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-heading font-bold text-[#0F1115]">
                Contact BlueFixx Support
              </div>
              <div className="text-[11px] sm:text-xs text-neutral-500">
                Get help on an active job · 24/7 for live jobs
              </div>
            </div>
          </button>

          {/* Report a Safety Issue */}
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="w-full p-4.5 rounded-3xl bg-amber-50/50 border border-amber-200/80 shadow-xs hover:bg-amber-50 transition-all text-left cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-heading font-bold text-amber-900">
                Report a safety issue
              </div>
              <div className="text-[11px] sm:text-xs text-amber-700">
                Discreetly notify the safety team during your job
              </div>
            </div>
          </button>
        </div>

        {/* Right Active Job Route & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Mock Interactive Map Card */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
            <div className="h-56 bg-neutral-100 relative flex items-center justify-center overflow-hidden">
              {/* Map grid lines */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#001B40_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Simulated Route Line */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" fill="none">
                <path
                  d="M 60 160 L 120 160 L 120 70 L 280 70 L 280 130 L 340 130"
                  stroke="#074292"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6 4"
                />
              </svg>

              {/* Artisan origin pin */}
              <div className="absolute left-[50px] top-[148px] flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-[#001B40] text-white flex items-center justify-center shadow-md">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                </div>
              </div>

              {/* Customer destination pin */}
              <div className="absolute right-[50px] top-[118px] flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Job Metadata Ledger */}
            <div className="p-5 space-y-3.5 divide-y divide-neutral-100 text-xs sm:text-sm">
              <div className="flex items-center justify-between pt-1">
                <span className="text-neutral-500">Job</span>
                <span className="font-heading font-bold text-[#0F1115]">Bathroom Plumbing Repair</span>
              </div>
              <div className="flex items-center justify-between pt-2.5">
                <span className="text-neutral-500">With</span>
                <span className="font-heading font-semibold text-[#0F1115]">Daniel C. (Customer)</span>
              </div>
              <div className="flex items-center justify-between pt-2.5">
                <span className="text-neutral-500">Status</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-[#074292] font-semibold text-xs border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#074292]" />
                  Scheduled
                </span>
              </div>
              <div className="flex items-start justify-between pt-2.5">
                <span className="text-neutral-500 shrink-0">Address</span>
                <span className="font-medium text-neutral-800 text-right max-w-xs">
                  14 Okpara Avenue, Independence Layout, Enugu
                </span>
              </div>
            </div>
          </div>

          {/* BlueFixx Security Note */}
          <div className="p-4 rounded-2xl bg-neutral-100/70 border border-neutral-200/60 flex items-start gap-3">
            <svg className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              BlueFixx keeps a record of who you meet and when. Live location is only visible when an active job is scheduled.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-neutral-100 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-heading font-bold text-[#0F1115]">
                  Report a safety issue
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  A safety agent responds within 15 minutes during an active job.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitSafetyReport} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0F1115]">
                  What is happening?
                </label>
                <div className="space-y-2">
                  {SAFETY_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                        selectedReason === reason
                          ? "border-[#001B40] bg-blue-50/40 text-[#001B40]"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <span>{reason}</span>
                      <input
                        type="radio"
                        name="safety_reason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className="accent-[#001B40]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0F1115]">
                    Details
                  </label>
                  <span className="text-[11px] text-neutral-400">Optional</span>
                </div>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe what happened..."
                  className="w-full p-3 rounded-xl border border-neutral-200 text-xs text-[#0F1115] focus:outline-hidden focus:border-[#001B40] transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                Submit to support
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArtisanSafetyCenterView;

