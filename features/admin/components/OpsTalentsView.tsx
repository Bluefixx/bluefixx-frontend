"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { formatNaira } from "@/lib/utils/currency";
import {
  MOCK_TALENT_APPLICATIONS,
  MOCK_ACTIVE_TALENTS,
  MOCK_MASTER_ARTISANS,
  MOCK_APPRENTICESHIP_PROGRAMMES,
  MOCK_TALENT_CERTIFICATIONS,
  MOCK_APPRENTICESHIP_PAYMENTS,
} from "../mockTalentsData";
import {
  AdminTalentApplication,
  AdminActiveTalent,
  AdminMasterArtisan,
  AdminApprenticeshipProgramme,
  AdminTalentCertification,
  AdminApprenticeshipPayment,
} from "../types";
import { OpsDropdown, OpsDropdownOption } from "./OpsDropdown";
import { OpsTalentApplicationDrawer } from "./OpsTalentApplicationDrawer";
import { OpsIssueCertificationModal } from "./OpsIssueCertificationModal";

type TalentTab =
  | "applications"
  | "active"
  | "masters"
  | "programmes"
  | "certifications"
  | "payments";

export function OpsTalentsView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab State
  const initialTab = (searchParams.get("tab") as TalentTab) || "applications";
  const [activeTab, setActiveTab] = useState<TalentTab>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as TalentTab;
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tab: TalentTab) => {
    setActiveTab(tab);
    router.push(`/ops/talents?tab=${tab}`);
  };

  // State
  const [applications, setApplications] = useState<AdminTalentApplication[]>(MOCK_TALENT_APPLICATIONS);
  const [activeTalents] = useState<AdminActiveTalent[]>(MOCK_ACTIVE_TALENTS);
  const [masterArtisans] = useState<AdminMasterArtisan[]>(MOCK_MASTER_ARTISANS);
  const [programmes] = useState<AdminApprenticeshipProgramme[]>(MOCK_APPRENTICESHIP_PROGRAMMES);
  const [certifications, setCertifications] = useState<AdminTalentCertification[]>(MOCK_TALENT_CERTIFICATIONS);
  const [payments] = useState<AdminApprenticeshipPayment[]>(MOCK_APPRENTICESHIP_PAYMENTS);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [tradeFilter, setTradeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Drawers & Modals
  const [selectedApplication, setSelectedApplication] = useState<AdminTalentApplication | null>(null);
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);

  const [selectedCertForIssue, setSelectedCertForIssue] = useState<AdminTalentCertification | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // Handlers
  const handleUpdateAppStatus = (id: string, newStatus: "In Review" | "Shortlisted" | "Verified" | "Rejected") => {
    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app)));
  };

  const handleConfirmIssueCertification = (certId: string) => {
    setCertifications((prev) =>
      prev.map((c) =>
        c.id === certId
          ? {
              ...c,
              status: "Certified",
              issuedAt: "Just now",
              issuedBy: "Simeon Daniel",
              certificateCode: `BFX-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            }
          : c
      )
    );
  };

  // Dropdown options
  const tradeOptions: OpsDropdownOption[] = [
    { label: "Trade", value: "ALL" },
    { label: "Plumbing", value: "Plumbing" },
    { label: "Welding", value: "Welding" },
    { label: "Carpentry", value: "Carpentry" },
    { label: "Solar installation", value: "Solar installation" },
    { label: "Electrical", value: "Electrical" },
    { label: "Cleaning", value: "Cleaning" },
    { label: "Fashion Design", value: "Fashion Design" },
  ];

  const statusOptions: OpsDropdownOption[] = [
    { label: "Status", value: "ALL" },
    { label: "In Review", value: "In Review" },
    { label: "Verified", value: "Verified" },
    { label: "Shortlisted", value: "Shortlisted" },
    { label: "Rejected", value: "Rejected" },
  ];

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (tradeFilter !== "ALL" && app.trade !== tradeFilter) return false;
      if (statusFilter !== "ALL" && app.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          app.talentName.toLowerCase().includes(q) ||
          app.trade.toLowerCase().includes(q) ||
          app.programme.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [applications, tradeFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-neutral-400 mb-1">Talents &amp; apprenticeship</div>
        <h1 className="text-2xl font-extrabold text-[#001B40] tracking-tight">
          Talents and apprenticeship
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          The supply pipeline: applications, programmes, master artisans, payments and the certification that closes the loop.
        </p>
      </div>

      {/* 6 Subtabs Navigation Bar */}
      <div className="border-b border-neutral-200">
        <nav className="flex items-center gap-1 sm:gap-4 overflow-x-auto scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => handleTabChange("applications")}
            className={`pb-3 px-1 border-b-2 font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === "applications"
                ? "border-[#001B40] text-[#001B40]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <span>Applications</span>
            <span className="whitespace-nowrap shrink-0 inline-flex items-center px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full text-[10px]">
              2
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("active")}
            className={`pb-3 px-1 border-b-2 font-bold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === "active"
                ? "border-[#001B40] text-[#001B40]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Active talents
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("masters")}
            className={`pb-3 px-1 border-b-2 font-bold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === "masters"
                ? "border-[#001B40] text-[#001B40]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Master artisans
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("programmes")}
            className={`pb-3 px-1 border-b-2 font-bold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === "programmes"
                ? "border-[#001B40] text-[#001B40]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Programmes
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("certifications")}
            className={`pb-3 px-1 border-b-2 font-bold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === "certifications"
                ? "border-[#001B40] text-[#001B40]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Certifications
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("payments")}
            className={`pb-3 px-1 border-b-2 font-bold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === "payments"
                ? "border-[#001B40] text-[#001B40]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Apprenticeship payments
          </button>
        </nav>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: APPLICATIONS */}
      {/* ============================================================== */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Talent, trade or programme"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#001B40]"
              />
            </div>
            <OpsDropdown options={tradeOptions} value={tradeFilter} onChange={setTradeFilter} />
            <OpsDropdown options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
            {(searchQuery || tradeFilter !== "ALL" || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setTradeFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="text-xs text-red-600 hover:underline px-2 font-semibold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Talent</th>
                    <th className="py-3 px-4">Trade</th>
                    <th className="py-3 px-4">Programme</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Applied</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#001B40] whitespace-nowrap">
                        {app.talentName}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700 whitespace-nowrap">
                        {app.trade}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-neutral-900">
                        {app.programme}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                        {app.location}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                        {app.appliedDate}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            app.status === "Verified"
                              ? "bg-emerald-100 text-emerald-800"
                              : app.status === "Shortlisted"
                              ? "bg-blue-100 text-blue-800"
                              : app.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          ● {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApplication(app);
                            setIsAppDrawerOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100 cursor-pointer"
                        >
                          View application
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ACTIVE TALENTS (CARDS GRID) */}
      {/* ============================================================== */}
      {activeTab === "active" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTalents.map((talent) => (
            <div
              key={talent.id}
              className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#001B40] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {talent.talentName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#001B40] text-sm">
                        {talent.talentName}
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        {talent.trade} · {talent.location}
                      </p>
                    </div>
                  </div>
                  <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ● Verified
                  </span>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Programme:</span>
                    <span className="font-semibold text-neutral-900 text-right">
                      {talent.programme}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Master Artisan:</span>
                    <span className="font-bold text-[#074292]">
                      {talent.masterArtisanName}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-neutral-200/60">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-500">Training Progress:</span>
                      <span className="font-bold text-neutral-800">
                        Month {talent.currentMonth} of {talent.totalMonths} ({talent.progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#001B40] rounded-full transition-all"
                        style={{ width: `${talent.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href={`/ops/users/${talent.talentId}`}
                className="w-full py-2 px-3 text-center rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Open talent profile
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: MASTER ARTISANS (CARDS GRID) */}
      {/* ============================================================== */}
      {activeTab === "masters" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masterArtisans.map((master) => (
            <div
              key={master.id}
              className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#074292] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {master.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#001B40] text-sm">
                        {master.name}
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        {master.trade} · {master.location}
                      </p>
                    </div>
                  </div>
                  <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ● Active
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-center">
                  <div>
                    <span className="block text-xs font-black text-[#001B40]">
                      {master.completedJobsCount}
                    </span>
                    <span className="text-[10px] text-neutral-500">Jobs</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black text-emerald-700">
                      {master.verifiedApprenticesCount}
                    </span>
                    <span className="text-[10px] text-neutral-500">Apprentices</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black text-amber-600">
                      ★ {master.rating}
                    </span>
                    <span className="text-[10px] text-neutral-500">Rating</span>
                  </div>
                </div>

                <div className="mt-2 px-1 flex justify-between text-xs text-neutral-500">
                  <span>Gross Payouts:</span>
                  <span className="font-bold text-neutral-800">
                    {formatNaira(master.totalRevenueKobo, true)}
                  </span>
                </div>
              </div>

              <Link
                href={`/ops/users/${master.userId}`}
                className="w-full py-2 px-3 text-center rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Open worker profile
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PROGRAMMES CATALOG */}
      {/* ============================================================== */}
      {activeTab === "programmes" && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Programme</th>
                  <th className="py-3 px-4">Trade</th>
                  <th className="py-3 px-4">Master artisan</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {programmes.map((prg) => (
                  <tr key={prg.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900">
                      <div>{prg.title}</div>
                      <div className="text-[11px] text-neutral-400 font-normal">{prg.cohort}</div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-700 whitespace-nowrap">
                      {prg.trade}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Link
                        href={`/ops/users/${prg.masterArtisanId}`}
                        className="font-bold text-[#074292] hover:underline"
                      >
                        {prg.masterArtisanName}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 whitespace-nowrap">
                      {prg.duration}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium">
                      {prg.enrolledCount} / {prg.capacity}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900 whitespace-nowrap">
                      {formatNaira(prg.feeKobo, true)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prg.status === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : prg.status === "Full"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        ● {prg.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        className="px-3 py-1 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100 cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: CERTIFICATIONS */}
      {/* ============================================================== */}
      {activeTab === "certifications" && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Talent</th>
                  <th className="py-3 px-4">Programme &amp; Trade</th>
                  <th className="py-3 px-4">Master artisan</th>
                  <th className="py-3 px-4">Completed date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {certifications.map((cert) => (
                  <tr key={cert.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#001B40] whitespace-nowrap">
                      <Link href={`/ops/users/${cert.talentId}`} className="hover:underline">
                        {cert.talentName}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-900">{cert.programme}</div>
                      <div className="text-[11px] text-neutral-400">{cert.trade} · {cert.cohort}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-neutral-700 whitespace-nowrap">
                      {cert.masterArtisanName}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                      {cert.completedDate}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`whitespace-nowrap shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          cert.status === "Certified"
                            ? "bg-emerald-100 text-emerald-800"
                            : cert.status === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : cert.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        ● {cert.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {cert.status === "Pending" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCertForIssue(cert);
                            setIsIssueModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-[#074292] text-white text-xs font-bold hover:bg-[#001B40] cursor-pointer"
                        >
                          Issue certification
                        </button>
                      ) : cert.status === "Certified" ? (
                        <span className="text-[11px] font-mono text-neutral-400">
                          {cert.certificateCode}
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: APPRENTICESHIP PAYMENTS */}
      {/* ============================================================== */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase">Total fees paid</span>
              <p className="text-xl font-black text-[#001B40] mt-1">₦1,800,000</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase">In escrow</span>
              <p className="text-xl font-black text-[#074292] mt-1">₦550,000</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase">Released to artisans</span>
              <p className="text-xl font-black text-emerald-700 mt-1">₦850,000</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-red-200 shadow-xs">
              <span className="text-[11px] font-semibold text-red-500 uppercase">Overdue / Attention</span>
              <p className="text-xl font-black text-red-700 mt-1">1</p>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Talent</th>
                    <th className="py-3 px-4">Programme</th>
                    <th className="py-3 px-4">Master artisan</th>
                    <th className="py-3 px-4">Slot</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Outstanding</th>
                    <th className="py-3 px-4">Next due</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#001B40] whitespace-nowrap">
                        <Link href={`/ops/users/${p.talentId}`} className="hover:underline">
                          {p.talentName}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-neutral-900 whitespace-nowrap">
                        {p.programme}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-700 whitespace-nowrap">
                        {p.masterArtisanName}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                        {p.slot}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-neutral-900 whitespace-nowrap">
                        {formatNaira(p.totalFeeKobo, true)}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-700 font-bold whitespace-nowrap">
                        {formatNaira(p.paidAmountKobo, true)}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700 font-medium whitespace-nowrap">
                        {p.outstandingAmountKobo > 0 ? formatNaira(p.outstandingAmountKobo, true) : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                        {p.nextDue}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === "Paid in full"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.status === "Overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          ● {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Drawer for Application Details */}
      <OpsTalentApplicationDrawer
        application={selectedApplication}
        isOpen={isAppDrawerOpen}
        onClose={() => {
          setIsAppDrawerOpen(false);
          setSelectedApplication(null);
        }}
        onUpdateStatus={handleUpdateAppStatus}
      />

      {/* Modal for Issuing Certification */}
      <OpsIssueCertificationModal
        certification={selectedCertForIssue}
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setSelectedCertForIssue(null);
        }}
        onConfirm={handleConfirmIssueCertification}
      />
    </div>
  );
}
