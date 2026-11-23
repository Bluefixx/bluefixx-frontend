"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getTalentApplicationsApi,
  withdrawTalentApplicationApi,
} from "@/lib/api/talent";

export type ApplicationStatus = "accepted" | "under_review" | "declined";

export interface TalentApplicationItem {
  id: string;
  programmeTitle: string;
  artisanName: string;
  location: string;
  appliedDate: string;
  status: ApplicationStatus;
  startDate?: string;
  schedule?: string;
  declineReason?: string;
  fee?: string;
  duration?: string;
}

interface TalentApplicationsListViewProps {
  onBack?: () => void;
  onSelectApplication?: (app: TalentApplicationItem) => void;
  onMakePayment?: (app: TalentApplicationItem) => void;
  onFindMore?: () => void;
}

export function TalentApplicationsListView({
  onBack,
  onSelectApplication,
  onMakePayment,
  onFindMore,
}: TalentApplicationsListViewProps) {
  const [applications, setApplications] = useState<TalentApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getTalentApplicationsApi()
      .then((items) => {
        if (!isMounted) return;
        if (!items || items.length === 0) {
          setApplications([]);
          return;
        }

        const mapped: TalentApplicationItem[] = items.map((app) => {
          let uiStatus: ApplicationStatus = "under_review";
          if (app.status === "ACCEPTED") uiStatus = "accepted";
          else if (app.status === "DECLINED" || app.status === "EXPIRED" || app.status === "WITHDRAWN")
            uiStatus = "declined";

          const feeKobo = Number(app.program?.fee || 0);
          const feeNgn = feeKobo > 0 ? `₦${(feeKobo / 100).toLocaleString("en-NG")}` : "₦0";

          return {
            id: app.id,
            programmeTitle: app.program?.title || "Apprenticeship Programme",
            artisanName: app.program?.artisan?.fullName || "Verified Master Artisan",
            location: app.program?.location || "Enugu",
            appliedDate: app.createdAt
              ? new Date(app.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Recently",
            status: uiStatus,
            startDate: "Upcoming intake",
            schedule: "Monday - Saturday · 8:00 AM - 5:00 PM",
            declineReason:
              app.decisionReason ||
              (uiStatus === "accepted" ? undefined : "Places were filled on this apprenticeship intake."),
            fee: feeNgn,
            duration: app.program?.durationWeeks ? `${app.program.durationWeeks} weeks` : "Flexible",
          };
        });
        setApplications(mapped);
      })
      .catch(() => {
        if (isMounted) setApplications([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleWithdraw = async (appId: string) => {
    try {
      await withdrawTalentApplicationApi(appId);
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, status: "declined", declineReason: "Withdrawn by applicant." }
            : a
        )
      );
      toast.success("Application withdrawn.");
    } catch {
      toast.error("Could not withdraw application at this time.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Breadcrumb Back */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Home</span>
        </button>
      )}

      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          My applications
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 font-medium mt-0.5">
          Apprenticeship applications
        </p>
      </div>

      {/* List, Skeleton or Empty State */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4 animate-pulse"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-neutral-100 rounded-md w-1/2" />
                  <div className="h-3 bg-neutral-100 rounded-md w-1/3" />
                </div>
                <div className="h-6 w-20 bg-neutral-100 rounded-full" />
              </div>
              <div className="h-16 bg-neutral-50 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-5"
            >
              {/* Header Row: Title & Status Badge */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3
                    onClick={() => onSelectApplication?.(app)}
                    className="font-heading font-bold text-base sm:text-lg text-[#0F1115] hover:text-blue-900 cursor-pointer transition-colors"
                  >
                    {app.programmeTitle}
                  </h3>
                  <p className="font-sans text-xs text-neutral-400 font-medium">
                    {app.artisanName} · {app.location} · Applied {app.appliedDate}
                  </p>
                </div>

                {/* Status Badge */}
                {app.status === "accepted" && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
                    Accepted
                  </span>
                )}
                {app.status === "under_review" && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200">
                    Under review
                  </span>
                )}
                {app.status === "declined" && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200">
                    Declined
                  </span>
                )}
              </div>

              {/* Status Specific Section */}

              {/* 1. Accepted Banner */}
              {app.status === "accepted" && (
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <span className="font-sans font-bold text-sm text-emerald-900 block">
                      You&apos;re accepted! 🎉
                    </span>
                    {app.declineReason && (
                      <p className="text-xs text-emerald-800">{app.declineReason}</p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs text-emerald-800">
                      <div>
                        <span className="text-emerald-700/80">Start date: </span>
                        <span className="font-semibold">{app.startDate}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700/80">Schedule: </span>
                        <span className="font-semibold">{app.schedule}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onMakePayment) onMakePayment(app);
                      else onSelectApplication?.(app);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    Make payment to enrol now
                  </button>
                </div>
              )}

              {/* 2. Under Review 3-Stage Progress Timeline */}
              {app.status === "under_review" && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {/* Stage 1: Submitted */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                      <span className="font-semibold text-neutral-700 text-[11px] sm:text-xs">
                        Application submitted
                      </span>
                    </div>

                    {/* Stage 2: Under Review */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#001B40] text-white flex items-center justify-center text-[10px] font-bold">
                        ●
                      </div>
                      <span className="font-bold text-[#001B40] text-[11px] sm:text-xs">
                        Under review <span className="text-neutral-400 font-normal">· in progress</span>
                      </span>
                    </div>

                    {/* Stage 3: Decision */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full border-2 border-neutral-300 text-neutral-300 flex items-center justify-center text-[10px]" />
                      <span className="font-medium text-neutral-400 text-[11px] sm:text-xs">
                        Decision
                      </span>
                    </div>
                  </div>

                  <p className="font-sans text-[11px] text-neutral-400 text-center pt-2">
                    Master artisans usually respond within 2 days.
                  </p>
                </div>
              )}

              {/* 3. Declined Banner */}
              {app.status === "declined" && (
                <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="font-sans text-xs text-rose-800 leading-relaxed">
                    {app.declineReason}
                  </p>
                  <button
                    type="button"
                    onClick={onFindMore}
                    className="px-4 py-2 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-sans font-semibold text-xs transition-colors cursor-pointer shrink-0"
                  >
                    Find another apprenticeship
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State matching Figma Talent Web · Applications: none yet */
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-2xs text-center space-y-6 mt-8">
          <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500 mx-auto">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0F1115]">
              No applications yet
            </h3>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Find a master artisan near you, apply for a place, and track every application here.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onFindMore}
              className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              Find opportunities
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
