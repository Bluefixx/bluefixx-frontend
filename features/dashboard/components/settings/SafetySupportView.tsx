"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface SafetySupportViewProps {
  onBack: () => void;
}

export function SafetySupportView({ onBack }: SafetySupportViewProps) {
  // Step: "overview" | "submitted"
  const [viewState, setViewState] = useState<"overview" | "submitted">("overview");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string>("Feel unsafe with the artisan");
  const [issueDetails, setIssueDetails] = useState("");

  const issueOptions = [
    "Feel unsafe with the artisan",
    "Threatening or abusive behaviour",
    "Damage to my property",
    "Injury on site",
    "Someone I did not know came to my home",
    "Other safety concern",
  ];

  const handleShareLocation = () => {
    navigator.clipboard.writeText("https://maps.google.com/?q=6.4528,7.5103");
    toast.success("GPS Location shared with Ada Eze & Bluefixx Support Desk");
  };

  const handleSubmitSafetyReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsReportModalOpen(false);
    setViewState("submitted");
    toast.error("Safety desk alerted. A safety agent is responding.", { icon: "🚨" });
  };

  // ══════════════════════════════════════════════════════════════
  // VIEW: SAFETY REPORT SUBMITTED (Screenshot 4 Left)
  // ══════════════════════════════════════════════════════════════
  if (viewState === "submitted") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Settings</span>
          </button>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
            Safety &amp; support
          </h1>
          <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
            Your safety report has been submitted.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Success Confirmation Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-8 sm:p-14 border border-neutral-200/80 shadow-xs flex flex-col items-center text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#001B40]">
                Report Submitted
              </h2>
              <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-sm leading-relaxed">
                Your report has been sent to our safety desk.
              </p>
            </div>

            <div className="pt-4 w-full max-w-xs">
              <Link
                href="/dashboard"
                className="block w-full py-3.5 bg-[#001B40] hover:bg-[#074292] text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm"
              >
                Go back to home
              </Link>
            </div>
          </div>

          {/* Right Info Cards */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-2">
              <h3 className="font-heading font-bold text-sm text-[#001B40]">
                Your safety comes first
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                A safety agent responds within 15 minutes during an active job. Your report opens an immediate safety review. We call the other party.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
              <h3 className="font-heading font-bold text-sm text-[#001B40]">
                Need immediate help?
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                If in immediate danger? Call the police first.
              </p>
              <a
                href="tel:112"
                className="block w-full py-3 bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs rounded-xl text-center transition-colors shadow-2xs"
              >
                Call Police, 112
              </a>
              <p className="text-[11px] text-neutral-400 text-center">
                Bluefixx Support: 0700 555 3499 · 24/7 during an active job
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW: MAIN SAFETY & SUPPORT OVERVIEW (Screenshot 3 Left)
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Settings</span>
        </button>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Safety &amp; support
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
          Help and protection during your active job.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* In Immediate Danger Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-sm sm:text-base text-[#001B40]">
                In immediate danger?
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Call the police first. Bluefixx will contact you straight after and your job is frozen automatically.
              </p>
            </div>

            <a
              href="tel:112"
              className="block w-full py-3.5 bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs sm:text-sm text-center rounded-xl transition-colors shadow-2xs"
            >
              Call Police, 112
            </a>
          </div>

          {/* Get Help Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Get help
            </h3>

            <div className="divide-y divide-neutral-100 text-xs sm:text-sm">
              {/* Option 1: Share location */}
              <button
                type="button"
                onClick={handleShareLocation}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/60 rounded-xl px-2 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#001B40] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-[#001B40] block">
                      Share my location
                    </span>
                    <span className="text-xs text-neutral-400">
                      Send to your emergency contact and Bluefixx Support
                    </span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Option 2: Report a safety issue */}
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/60 rounded-xl px-2 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-[#001B40] block">
                      Report a safety issue
                    </span>
                    <span className="text-xs text-neutral-400">
                      Leave an alert, pause ongoing actions and stop other parts
                    </span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Option 3: Contact Bluefixx support */}
              <Link
                href="/messages?conversation=support"
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/60 rounded-xl px-2 transition-colors cursor-pointer block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#001B40] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-[#001B40] block">
                      Contact Bluefixx support
                    </span>
                    <span className="text-xs text-neutral-400">
                      24/7 during an active job: 0700 555 3499
                    </span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Safety Agent Helper Banner */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60 text-xs text-neutral-500">
            <span className="font-bold text-[#001B40] block mb-0.5">A safety agent is here to help</span>
            A safety agent responds within 15 minutes during an active job.
          </div>
        </div>

        {/* Right Column: Active Job & Emergency Contact */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Job Card with Map */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Your active job
            </h3>

            {/* Stylized Map View */}
            <div className="relative w-full h-36 rounded-2xl bg-[#E8EEF5] border border-blue-100 overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full opacity-60" viewBox="0 0 300 150" fill="none">
                <line x1="30" y1="0" x2="30" y2="150" stroke="#CBD5E1" strokeWidth="12" />
                <line x1="120" y1="0" x2="120" y2="150" stroke="#CBD5E1" strokeWidth="14" />
                <line x1="220" y1="0" x2="220" y2="150" stroke="#CBD5E1" strokeWidth="10" />
                <line x1="0" y1="40" x2="300" y2="40" stroke="#CBD5E1" strokeWidth="10" />
                <line x1="0" y1="100" x2="300" y2="100" stroke="#CBD5E1" strokeWidth="12" />
                {/* Active path */}
                <line x1="120" y1="60" x2="120" y2="100" stroke="#001B40" strokeWidth="4" />
                <circle cx="180" cy="50" r="6" fill="#F59E0B" />
              </svg>

              {/* Pin */}
              <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#001B40] text-white flex items-center justify-center shadow-md">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Job</span>
                <span className="font-bold text-[#001B40]">Bathroom Plumbing Repair</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">With</span>
                <span className="font-semibold text-neutral-800">Emeka Okafor (Artisan)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                  Secured
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Contact Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Emergency contact
            </h3>
            <div className="text-xs">
              <span className="font-bold text-neutral-800 block">Ada Eze</span>
              <span className="text-neutral-500 block">+234 809 221 9049</span>
            </div>
            <button
              type="button"
              onClick={handleShareLocation}
              className="w-full py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Share my location
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: REPORT A SAFETY ISSUE (Screenshot 3 Right)              */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header with Close */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div>
                <h3 className="font-heading font-bold text-base text-[#001B40]">
                  Report a safety issue
                </h3>
                <p className="text-[11px] text-neutral-400">
                  A safety agent responds within 15 minutes during an active job.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitSafetyReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#001B40] mb-2">
                  What is happening?
                </label>
                <div className="space-y-2">
                  {issueOptions.map((issue) => {
                    const isSelected = selectedIssue === issue;
                    return (
                      <label
                        key={issue}
                        onClick={() => setSelectedIssue(issue)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? "border-[#001B40] bg-blue-50/30 font-semibold text-[#001B40]"
                            : "border-neutral-200/80 text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-[#001B40] bg-[#001B40]" : "border-neutral-300"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span>{issue}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-600">
                    Details
                  </label>
                  <span className="text-[11px] text-neutral-400">Optional</span>
                </div>
                <textarea
                  rows={3}
                  value={issueDetails}
                  onChange={(e) => setIssueDetails(e.target.value)}
                  placeholder="Tell us what is happening..."
                  className="w-full p-3 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-hidden focus:border-[#001B40]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-2xs cursor-pointer"
              >
                Submit safety report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
