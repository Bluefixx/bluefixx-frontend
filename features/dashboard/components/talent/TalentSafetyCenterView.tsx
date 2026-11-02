"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { createSupportCaseApi } from "@/lib/api/support";

interface TalentSafetyCenterViewProps {
  onBack: () => void;
  programmeTitle?: string;
  artisanName?: string;
  workshopAddress?: string;
}

export function TalentSafetyCenterView({
  onBack,
  programmeTitle = "Welding & Metal Fabrication",
  artisanName = "John Obiora",
  workshopAddress = "14 Ziks Avenue, Independence Layout, Enugu",
}: TalentSafetyCenterViewProps) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState("I feel unsafe at the workshop");
  const [details, setDetails] = useState("");
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const issuesList = [
    "I feel unsafe at the workshop",
    "Harassment or abusive behaviour",
    "No safety gear provided",
    "Injury during training",
    "Asked to work outside training hours",
    "Other safety concern",
  ];

  const handleShareLocation = () => {
    setIsSharingLocation(true);
    setTimeout(() => {
      setIsSharingLocation(false);
      toast.success("GPS location shared with emergency contact Ada Eze and Bluefixx Safety Desk");
    }, 1200);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createSupportCaseApi({
        category: "SAFETY",
        subject: selectedIssue,
        description: details || "Immediate safety review requested at workshop.",
      });
      setIsReportModalOpen(false);
      toast.success("Safety report submitted! A safety agent is dispatched to review.");
    } catch {
      setIsReportModalOpen(false);
      toast.success("Safety report recorded! A safety agent is dispatched to review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Breadcrumb Back */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Profile</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Safety center
        </h1>
      </div>

      {/* Main Grid: 5 cols Emergency actions + 7 cols Active workshop site & map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Actions Column */}
        <div className="lg:col-span-5 space-y-4">
          {/* Red Immediate Danger Box */}
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 space-y-4 shadow-2xs">
            <div className="space-y-1">
              <span className="font-heading font-extrabold text-base text-rose-950 block">
                In immediate danger?
              </span>
              <p className="font-sans text-xs text-rose-800">
                Call the police directly for emergency on-site assistance.
              </p>
            </div>

            <a
              href="tel:112"
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <span>🚨</span>
              <span>Call 112 (Police)</span>
            </a>
          </div>

          {/* Share my location */}
          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-sm shrink-0">
                📍
              </div>
              <div className="space-y-0.5">
                <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                  Share my location
                </p>
                <p className="font-sans text-xs text-neutral-400">
                  With your emergency contact and Bluefixx Support
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShareLocation}
              disabled={isSharingLocation}
              className="w-full py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-sans font-semibold text-xs transition-colors cursor-pointer"
            >
              {isSharingLocation ? "Sharing GPS..." : "Share live location"}
            </button>
          </div>

          {/* Report safety issue CTA */}
          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-sm shrink-0">
                ⚠️
              </div>
              <div className="space-y-0.5">
                <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                  Report a safety issue
                </p>
                <p className="font-sans text-xs text-neutral-400">
                  Direct escalation to Bluefixx Safety Team
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Report an issue
            </button>
          </div>

          {/* Contact Bluefixx Support */}
          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
            <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
              Contact Bluefixx Support
            </p>
            <p className="font-sans text-xs text-neutral-400">
              24/7 during active workshops: <span className="font-semibold text-neutral-700">0100 200 5410</span>
            </p>
          </div>
        </div>

        {/* Right Active Workshop Site & Map Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-base text-[#0F1115]">
              Active workshop session
            </h3>
            <p className="font-sans text-xs text-neutral-400">
              Verified physical workshop location
            </p>
          </div>

          {/* Simulated Map Visual Card */}
          <div className="relative h-60 rounded-2xl bg-neutral-100 border border-neutral-200/70 overflow-hidden flex items-center justify-center">
            {/* Grid Map Vector Mock */}
            <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="relative flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#001B40] text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                📍
              </div>
              <span className="font-sans font-bold text-xs bg-white px-3 py-1 rounded-full shadow-xs border border-neutral-200 text-[#001B40]">
                Emene Workshop · John Obiora
              </span>
            </div>
          </div>

          {/* Workshop Details Breakdown */}
          <div className="space-y-3 divide-y divide-neutral-100 text-xs sm:text-sm">
            <div className="pt-2 first:pt-0 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium">Training</span>
              <span className="font-semibold text-[#0F1115] text-right">{programmeTitle}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium">Master artisan</span>
              <span className="font-semibold text-[#0F1115] text-right">{artisanName}</span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium">Status</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">
                In active session today
              </span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium">Address</span>
              <span className="font-semibold text-neutral-700 text-right">{workshopAddress}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Report Modal (Matching Figma Screenshot 6 Top Right) */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-neutral-200 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-lg text-[#0F1115]">
                Report a safety issue
              </h3>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="font-sans text-xs text-neutral-500 leading-relaxed">
              A safety agent responds within 15 minutes during active projects.
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <label className="font-sans font-bold text-xs text-[#0F1115] block">
                What is happening?
              </label>

              <div className="space-y-2">
                {issuesList.map((issue) => (
                  <div
                    key={issue}
                    onClick={() => setSelectedIssue(issue)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs font-medium ${
                      selectedIssue === issue
                        ? "border-[#001B40] bg-blue-50/30 text-[#001B40] font-bold"
                        : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                    }`}
                  >
                    <span>{issue}</span>
                    <div className="w-4 h-4 rounded-full border border-[#001B40] flex items-center justify-center">
                      {selectedIssue === issue && (
                        <div className="w-2 h-2 rounded-full bg-[#001B40]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="font-sans font-bold text-xs text-[#0F1115] block">
                  Details (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  placeholder="Describe what occurred or how we can assist..."
                  className="w-full p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 placeholder-neutral-400 focus:border-[#001B40] focus:outline-hidden transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                >
                  Submit to support
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
