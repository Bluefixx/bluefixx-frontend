"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { JobDetailData } from "./ArtisanJobDetailView";

export type JobsListTab = "requests" | "active" | "completed" | "declined";

interface ArtisanJobsListViewProps {
  initialTab?: JobsListTab;
  onSelectRequest?: (job: JobDetailData) => void;
  onManageJob?: (jobId: string) => void;
  onBackToDashboard?: () => void;
}

export function ArtisanJobsListView({
  initialTab = "requests",
  onSelectRequest,
  onManageJob,
  onBackToDashboard,
}: ArtisanJobsListViewProps) {
  const [activeTab, setActiveTab] = useState<JobsListTab>(initialTab);

  // -------------------------------------------------------------
  // DATA MATCHING SCREENSHOTS 3 & 4
  // -------------------------------------------------------------
  const requestsData: JobDetailData[] = [
    {
      id: "req-1",
      code: "BFX-51029",
      title: "AC repair",
      category: "AC repair",
      subCategory: "Repair",
      postedTime: "posted 30 minutes ago",
      isUrgent: false,
      status: "New",
      description: "AC is running but not cooling. It was serviced 5 months ago.",
      service: "AC repair",
      date: "Today · 3:00 PM",
      time: "Afternoon · 3:00 PM",
      budget: "₦25,000–₦35,000",
      urgency: "Standard",
      customerName: "Simeon Nnamdi",
      customerLocation: "Enugu, Nigeria",
      distance: "2.5 km away",
      driveTime: "7 min from your base",
      photoUrl: "",
      photoCaption: "",
      audioDuration: "",
      questions: [{ question: "Is the outdoor unit spinning?", answer: "Yes" }],
    },
    {
      id: "req-2",
      code: "BFX-61920",
      title: "Generator changeover wiring",
      category: "Electrical",
      subCategory: "Wiring",
      postedTime: "posted 1 hour ago",
      isUrgent: false,
      status: "New",
      description: "Need a changeover panel installed for a 5kVA generator.",
      service: "Electrical · Wiring",
      date: "Tomorrow · 9:00 AM",
      time: "Morning · 9:00 AM",
      budget: "₦30,000–₦45,000",
      urgency: "Standard",
      customerName: "Adanna Onyekwere",
      customerLocation: "Enugu, Nigeria",
      distance: "4.1 km away",
      driveTime: "12 min from your base",
      photoUrl: "",
      photoCaption: "",
      audioDuration: "",
      questions: [{ question: "Is the changeover switch purchased?", answer: "Yes" }],
    },
    {
      id: "req-3",
      code: "BFX-72819",
      title: "No power in half the house",
      category: "Electrical",
      subCategory: "Emergency",
      postedTime: "posted 5 minutes ago",
      isUrgent: true,
      status: "Emergency",
      description: "Sockets in the sitting room and two bedrooms stopped working this morning.",
      service: "Electrical · Emergency",
      date: "Now",
      time: "Immediate dispatch",
      budget: "₦15,000–₦35,000",
      urgency: "Emergency",
      customerName: "Uche Mba",
      customerLocation: "Enugu, Nigeria",
      distance: "4.2 km away",
      driveTime: "10 min from your base",
      photoUrl: "",
      photoCaption: "",
      audioDuration: "",
      questions: [{ question: "Did the main breaker trip?", answer: "No" }],
    },
  ];

  const activeJobsData = [
    {
      id: "active-1",
      title: "AC repair - Not cooling",
      customerName: "Simeon Nnamdi",
      description: "AC is running but not cooling. It was serviced 5 months ago.",
      distance: "2.5 km away",
      schedule: "Today · 3:00 PM",
      budget: "₦25,000–₦35,000",
      badge: "In progress",
    },
    {
      id: "active-2",
      title: "Full house rewiring (day 2 of 3)",
      customerName: "Adanna Onyekwere",
      description: "Need a changeover panel installed for a 5kVA generator.",
      distance: "4.1 km away",
      schedule: "Tomorrow · 9:00 AM",
      budget: "₦30,000–₦45,000",
      badge: "In progress",
    },
  ];

  const completedJobsData = [
    {
      id: "comp-1",
      title: "Lighting installation",
      customerName: "Kelechi Nwosu",
      date: "10 Aug",
      tag: "Insured",
      badge: "Completed",
      payout: "₦25,740 · paid out",
    },
  ];

  const declinedJobsData = [
    {
      id: "decl-1",
      title: "Lighting installation",
      customerName: "Kelechi Nwosu",
      date: "10 Aug",
      tag: "Completed",
      badge: "Declined",
      payout: "₦28,000 · paid out",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-1">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1 hover:text-neutral-800 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Jobs</span>
            </button>
          )}
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Jobs
        </h1>
      </div>

      {/* Tabs Row (Requests [3], Active, Completed, Declined) */}
      <div className="flex items-center gap-4 sm:gap-8 border-b border-neutral-200/90 overflow-x-auto no-scrollbar">
        {/* Requests Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 relative transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "requests"
              ? "text-[#001B40]"
              : "text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <span>Requests</span>
          <span className="w-4 h-4 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center">
            3
          </span>
          {activeTab === "requests" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#001B40] rounded-full" />
          )}
        </button>

        {/* Active Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`pb-3 text-xs sm:text-sm font-bold relative transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "active"
              ? "text-[#001B40]"
              : "text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <span>Active</span>
          {activeTab === "active" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#001B40] rounded-full" />
          )}
        </button>

        {/* Completed Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`pb-3 text-xs sm:text-sm font-bold relative transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "completed"
              ? "text-[#001B40]"
              : "text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <span>Completed</span>
          {activeTab === "completed" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#001B40] rounded-full" />
          )}
        </button>

        {/* Declined Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("declined")}
          className={`pb-3 text-xs sm:text-sm font-bold relative transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "declined"
              ? "text-[#001B40]"
              : "text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <span>Declined</span>
          {activeTab === "declined" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#001B40] rounded-full" />
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB 1: REQUESTS (Screenshot 3 Left)
          ═══════════════════════════════════════════════════════════ */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {requestsData.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#001B40]">
                    {req.title}
                  </h3>
                  <p className="font-sans text-xs text-neutral-400 font-medium mt-0.5">
                    {req.customerName}
                  </p>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  req.status === "Emergency"
                    ? "bg-[#FEE2E2] text-[#EF4444]"
                    : "bg-blue-50 text-blue-700"
                }`}>
                  {req.status}
                </span>
              </div>

              <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {req.description}
              </p>

              <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-neutral-500 font-medium">
                <span>{req.distance}</span>
                <span>•</span>
                <span>{req.date}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-t border-neutral-100">
                <span className="font-sans font-bold text-sm sm:text-base text-[#001B40]">
                  {req.budget}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectRequest) onSelectRequest(req);
                    else toast.success(`Viewing request: ${req.title}`);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  View request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 2: ACTIVE JOBS (Screenshot 3 Right)
          ═══════════════════════════════════════════════════════════ */}
      {activeTab === "active" && (
        <div className="space-y-4">
          {activeJobsData.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#001B40]">
                    {job.title}
                  </h3>
                  <p className="font-sans text-xs text-neutral-400 font-medium mt-0.5">
                    {job.customerName}
                  </p>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                  {job.badge}
                </span>
              </div>

              <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {job.description}
              </p>

              <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-neutral-500 font-medium">
                <span>{job.distance}</span>
                <span>•</span>
                <span>{job.schedule}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-t border-neutral-100">
                <span className="font-sans font-bold text-sm sm:text-base text-[#001B40]">
                  {job.budget}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (onManageJob) onManageJob(job.id);
                    else toast.success(`Managing job: ${job.title}`);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  Manage job
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 3: COMPLETED JOBS (Screenshot 4 Left)
          ═══════════════════════════════════════════════════════════ */}
      {activeTab === "completed" && (
        <div className="space-y-4">
          {completedJobsData.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#001B40]">
                    {job.title}
                  </h3>
                </div>
                <p className="font-sans text-xs text-neutral-400 font-medium">
                  {job.customerName} · {job.date} · {job.tag}
                </p>
                <p className="font-sans font-bold text-sm sm:text-base text-[#001B40] pt-1">
                  {job.payout}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                {job.badge}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 4: DECLINED JOBS (Screenshot 4 Right)
          ═══════════════════════════════════════════════════════════ */}
      {activeTab === "declined" && (
        <div className="space-y-4">
          {declinedJobsData.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#001B40]">
                    {job.title}
                  </h3>
                </div>
                <p className="font-sans text-xs text-neutral-400 font-medium">
                  {job.customerName} · {job.tag} · {job.date}
                </p>
                <p className="font-sans font-bold text-sm sm:text-base text-[#001B40] pt-1">
                  {job.payout}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
                {job.badge}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

