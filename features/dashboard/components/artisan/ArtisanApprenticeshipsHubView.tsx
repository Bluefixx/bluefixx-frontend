"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { ArtisanApplicantDetailView, ApplicantStatus } from "./ArtisanApplicantDetailView";

type ApprenticeshipTab = "active" | "applications" | "completed";
type ApplicationSubTab = "new" | "reviewing" | "accepted" | "declined";

interface ArtisanApprenticeshipsHubViewProps {
  onCreateNew: () => void;
  onBackToDashboard: () => void;
  initialTab?: ApprenticeshipTab;
  initialEmpty?: boolean;
}

export function ArtisanApprenticeshipsHubView({
  onCreateNew,
  onBackToDashboard,
  initialTab = "active",
  initialEmpty = false,
}: ArtisanApprenticeshipsHubViewProps) {
  const [activeTab, setActiveTab] = useState<ApprenticeshipTab>(initialTab);
  const [isEmpty, setIsEmpty] = useState(initialEmpty);
  const [selectedProgrammeForApplicants, setSelectedProgrammeForApplicants] = useState<string | null>(null);
  const [applicantSubTab, setApplicantSubTab] = useState<ApplicationSubTab>("new");
  const [selectedApplicant, setSelectedApplicant] = useState<{
    id: string;
    name: string;
    status: ApplicantStatus;
  } | null>(null);

  // Sample Applicants Matching Figma Screens
  const [applicants, setApplicants] = useState([
    {
      id: "app-chidera",
      name: "Chidera Okwu",
      location: "Abakpa Enugu East · Age 21",
      appliedDate: "18 Aug 2026, 10:12",
      experience: "Two years helping in my uncle's workshop in Nsukka",
      status: "new" as ApplicationSubTab,
      avatar: "👨🏾",
    },
    {
      id: "app-1",
      name: "Chinedu Agu",
      location: "Abakpa Nike, Enugu",
      appliedDate: "3 Aug 2026",
      experience: "No formal experience. Finished secondary school in 2025.",
      status: "declined" as ApplicationSubTab,
      avatar: "👨🏾",
    },
    {
      id: "app-2",
      name: "Ifeanyi Ugwu",
      location: "New Haven, Enugu",
      appliedDate: "10 Aug 2026",
      experience: "No formal experience. Finished secondary school in 2021.",
      status: "new" as ApplicationSubTab,
      avatar: "👨🏿",
    },
  ]);

  const handleAcceptApplicant = (id: string, name: string) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "accepted" } : a))
    );
    toast.success(`${name} accepted! Invoice and reservation sent.`);
  };

  const handleDeclineApplicant = (id: string, name: string) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "declined" } : a))
    );
    toast(`${name} application declined.`);
  };

  // ═══════════════════════════════════════════════════════════
  // VIEW: APPLICANT DETAIL WORKBENCH (Screenshots 2, 3, 4, 5)
  // ═══════════════════════════════════════════════════════════
  if (selectedApplicant) {
    return (
      <ArtisanApplicantDetailView
        applicantId={selectedApplicant.id}
        applicantName={selectedApplicant.name}
        initialStatus={selectedApplicant.status}
        onBack={() => setSelectedApplicant(null)}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════
  // VIEW: NEW APPLICANTS DRILLDOWN (Screenshot 5 Right)
  // ═══════════════════════════════════════════════════════════
  if (selectedProgrammeForApplicants) {
    const filteredApplicants = applicants.filter(
      (a) => a.status === applicantSubTab
    );

    return (
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
        <div>
          <button
            type="button"
            onClick={() => setSelectedProgrammeForApplicants(null)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>My apprenticeships</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
                My apprenticeships
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
                Hands-on placements at your workshop · {selectedProgrammeForApplicants}
              </p>
            </div>
            <button
              type="button"
              onClick={onCreateNew}
              className="w-10 h-10 rounded-full bg-[#001B40] hover:bg-[#074292] text-white flex items-center justify-center shadow-xs cursor-pointer transition-all"
              title="Create apprenticeship"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Subtabs: New, Reviewing, Accepted, Declined */}
        <div className="flex items-center gap-6 border-b border-neutral-200">
          {(["new", "reviewing", "accepted", "declined"] as const).map((tab) => {
            const isActive = applicantSubTab === tab;
            const count = applicants.filter((a) => a.status === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setApplicantSubTab(tab)}
                className={`pb-3 text-xs sm:text-sm font-bold capitalize transition-colors relative cursor-pointer ${
                  isActive ? "text-[#001B40]" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <span>{tab}</span>
                {count > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-100 text-neutral-700">
                    {count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#001B40] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Applicant Cards Grid or Empty State */}
        {filteredApplicants.length === 0 ? (
          /* EMPTY STATE: NO APPRENTICESHIP APPLICATIONS (Screenshot 1 Right) */
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-neutral-200/80 shadow-xs text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-lg text-[#0F1115]">
                No apprenticeship applications
              </h3>
              <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                Applications will appear here as talent applies for this opportunity.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onCreateNew}
                className="px-6 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Create new apprenticeship
              </button>
            </div>
          </div>
        ) : applicantSubTab === "declined" ? (
          /* DECLINED LIST: COMPACT STATUS ROWS (Screenshot 1 Left) */
          <div className="space-y-3">
            {filteredApplicants.map((applicant) => (
              <div
                key={applicant.id}
                onClick={() =>
                  setSelectedApplicant({
                    id: applicant.id,
                    name: applicant.name,
                    status: "declined",
                  })
                }
                className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-2xs flex items-center justify-between gap-4 cursor-pointer hover:border-neutral-300 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center text-xl shrink-0">
                    {applicant.avatar}
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-xs sm:text-sm text-[#0F1115]">
                      {applicant.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Welding & Metal Fabrication · Applied {applicant.appliedDate}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                  Declined
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* ACTIVE / NEW APPLICANTS CARDS (Screenshot 5 Right) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredApplicants.map((applicant) => (
              <div
                key={applicant.id}
                className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4 hover:border-neutral-300 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-xl shrink-0">
                    {applicant.avatar}
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#0F1115]">
                      {applicant.name}
                    </h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                      <span>📍</span>
                      <span>{applicant.location}</span>
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Applied {applicant.appliedDate}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-neutral-400 block uppercase tracking-wider">
                    Experience
                  </span>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    {applicant.experience}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedApplicant({
                        id: applicant.id,
                        name: applicant.name,
                        status:
                          applicant.status === "accepted"
                            ? "accepted"
                            : applicant.status === "declined"
                            ? "declined"
                            : "submitted",
                      })
                    }
                    className="flex-1 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeclineApplicant(applicant.id, applicant.name)}
                    className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAcceptApplicant(applicant.id, applicant.name)}
                    className="flex-1 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // MAIN VIEW: APPRENTICESHIPS HUB
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Home</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
            My apprenticeships
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
            Hands-on placements at your workshop
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEmpty(!isEmpty)}
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            {isEmpty ? "Preview With Data" : "Preview Empty State"}
          </button>

          <button
            type="button"
            onClick={onCreateNew}
            className="w-10 h-10 rounded-full bg-[#001B40] hover:bg-[#074292] text-white flex items-center justify-center shadow-xs cursor-pointer transition-all"
            title="Create apprenticeship"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* EMPTY STATE: NO APPRENTICESHIP CREATED YET (Screenshot 4) */}
      {isEmpty ? (
        <div className="max-w-md mx-auto pt-10 sm:pt-16">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-heading font-extrabold text-xl text-[#0F1115]">
                No apprenticeship created yet
              </h3>
              <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed">
                Train apprentices at your workshop and earn mentoring income. You set the trade, schedule, fee and number of places.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onCreateNew}
                className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                Create apprenticeship
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Main 3 Tabs: Active, Applications, Completed */}
          <div className="flex items-center gap-8 border-b border-neutral-200">
            {(["active", "applications", "completed"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-xs sm:text-sm font-bold capitalize transition-colors relative cursor-pointer ${
                    isActive ? "text-[#001B40]" : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  <span>{tab}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#001B40] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: ACTIVE PROGRAMMES (Screenshot 3 Left) */}
          {activeTab === "active" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Programme 1: Welding */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4 hover:border-neutral-300 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-extrabold text-base text-[#0F1115]">
                      Welding & Metal Fabrication
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                    <span>📍</span>
                    <span>Enugu</span>
                  </p>
                  <div className="text-xs text-neutral-600 space-y-1">
                    <p className="font-medium">6 months · 2 of 3 slots open</p>
                    <p className="text-neutral-400">Monday - Saturday · 8:00 AM - 5:00 PM</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-500">
                    7 applicants
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProgrammeForApplicants("Welding & Metal Fabrication")}
                    className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-[#001B40] transition-colors cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
              </div>

              {/* Programme 2: Plumbing */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4 hover:border-neutral-300 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-extrabold text-base text-[#0F1115]">
                      Plumbing Basics
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                    <span>📍</span>
                    <span>Enugu</span>
                  </p>
                  <div className="text-xs text-neutral-600 space-y-1">
                    <p className="font-medium">4 months · 0 of 1 slots open</p>
                    <p className="text-neutral-400">Monday - Friday · 8:00 AM - 4:00 PM</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-500">
                    3 applicants
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProgrammeForApplicants("Plumbing Basics")}
                    className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-[#001B40] transition-colors cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPLICATIONS OVERVIEW (Screenshot 5 Left) */}
          {activeTab === "applications" && (
            <div className="space-y-3.5">
              {/* Item 1 */}
              <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-sm sm:text-base text-[#0F1115]">
                      Welding & Metal Fabrication Apprenticeship
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      3 months · 3 slots · 4 applications
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                    2 new
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProgrammeForApplicants("Welding & Metal Fabrication Apprenticeship")}
                    className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-[#001B40] transition-colors cursor-pointer"
                  >
                    View applications
                  </button>
                </div>
              </div>

              {/* Item 2 */}
              <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-sm sm:text-base text-[#0F1115]">
                      Gate & Burglary-Proof Fabrication
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      1 month short course · 2 slots · 1 application
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                    1 new
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProgrammeForApplicants("Gate & Burglary-Proof Fabrication")}
                    className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-[#001B40] transition-colors cursor-pointer"
                  >
                    View applications
                  </button>
                </div>
              </div>

              {/* Item 3 */}
              <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-sm sm:text-base text-[#0F1115]">
                      Plumbing Basics
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      2 months · Full: 0 open slots
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600">
                    Filled
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProgrammeForApplicants("Plumbing Basics")}
                    className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-[#001B40] transition-colors cursor-pointer"
                  >
                    View applications
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPLETED PROGRAMMES */}
          {activeTab === "completed" && (
            <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200 text-xs text-neutral-400">
              No completed apprenticeship programmes yet.
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default ArtisanApprenticeshipsHubView;

