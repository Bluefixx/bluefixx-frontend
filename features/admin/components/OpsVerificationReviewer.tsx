"use client";

import React, { useState, useEffect, useCallback } from "react";
import { WorkerVerificationCase, VerificationDocument } from "../types";
import {
  OpsApproveVerificationModal,
  OpsRequestInfoModal,
  OpsRejectVerificationModal,
} from "./OpsVerificationModals";
import {
  getAdminWorkerVerificationDetailApi,
  getAdminArtisanIdentityEvidenceApi,
  assignVerificationReviewerApi,
  reviewArtisanDecisionApi,
  requestVerificationInfoApi,
  mapDetailToVerificationCase,
  RequestInfoCategory,
  RejectedStep,
  BackendAdminArtisanIdentityResponse,
} from "@/lib/api/admin-verification";
import toast from "react-hot-toast";

interface OpsVerificationReviewerProps {
  vCase: WorkerVerificationCase;
  allCases: WorkerVerificationCase[];
  currentIndex: number;
  onBackToQueue: () => void;
  onNavigateCase: (index: number) => void;
  onUpdateCase: (updated: WorkerVerificationCase) => void;
}

export function OpsVerificationReviewer({
  vCase: initialCase,
  allCases,
  currentIndex,
  onBackToQueue,
  onNavigateCase,
  onUpdateCase,
}: OpsVerificationReviewerProps) {
  const [currentCase, setCurrentCase] = useState<WorkerVerificationCase>(initialCase);
  const [identityEvidence, setIdentityEvidence] =
    useState<BackendAdminArtisanIdentityResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Modals state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Load deep detail on artisanId change
  const loadCaseDetail = useCallback(async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const detail = await getAdminWorkerVerificationDetailApi(id);
      const mapped = mapDetailToVerificationCase(detail);
      setCurrentCase(mapped);
      onUpdateCase(mapped);

      // Also fetch identity-only evidence
      try {
        const idEvidence = await getAdminArtisanIdentityEvidenceApi(id);
        setIdentityEvidence(idEvidence);
      } catch {
        // Non-blocking if identity is unsubmitted
      }
    } catch (err: any) {
      console.warn("Could not fetch verification detail from backend:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [onUpdateCase]);

  useEffect(() => {
    setCurrentCase(initialCase);
    setSelectedDocIndex(0);
    setZoomLevel(100);
    setRotation(0);
    loadCaseDetail(initialCase.id);
  }, [initialCase.id, loadCaseDetail]);

  const activeDoc: VerificationDocument | undefined = currentCase.documents[selectedDocIndex];

  // Live Decisions Handlers
  const handleApproveConfirm = async (
    targetCase: WorkerVerificationCase,
    verifiedLegalName: string,
    note?: string
  ) => {
    try {
      await reviewArtisanDecisionApi(targetCase.id, {
        approve: true,
        verifiedLegalName,
        note: note || "Identity and portfolio evidence verified.",
      });

      const updated: WorkerVerificationCase = {
        ...targetCase,
        status: "APPROVED",
        history: [
          {
            date: "Just now",
            event: `Verification approved (${verifiedLegalName})`,
            author: "Admin Reviewer",
          },
          ...targetCase.history,
        ],
      };
      onUpdateCase(updated);
      toast.success(`Verification approved for ${targetCase.worker.name}`);
      if (currentIndex < allCases.length - 1) {
        onNavigateCase(currentIndex + 1);
      } else {
        onBackToQueue();
      }
    } catch (err: any) {
      console.error("Failed to approve verification:", err);
      toast.error(err?.message || "Failed to approve verification.");
      throw err;
    }
  };

  const handleRequestInfoConfirm = async (
    targetCase: WorkerVerificationCase,
    category: RequestInfoCategory,
    message: string
  ) => {
    try {
      await requestVerificationInfoApi(targetCase.id, {
        category,
        message,
      });

      const updated: WorkerVerificationCase = {
        ...targetCase,
        status: "REQUIRES_INFO",
        history: [
          {
            date: "Just now",
            event: `Additional info requested (${category}): "${message}"`,
            author: "Admin Reviewer",
          },
          ...targetCase.history,
        ],
      };
      onUpdateCase(updated);
      toast.success(`Information requested from ${targetCase.worker.name}`);
      if (currentIndex < allCases.length - 1) {
        onNavigateCase(currentIndex + 1);
      } else {
        onBackToQueue();
      }
    } catch (err: any) {
      console.error("Failed to request info:", err);
      toast.error(err?.message || "Failed to request more information.");
      throw err;
    }
  };

  const handleRejectConfirm = async (
    targetCase: WorkerVerificationCase,
    category: string,
    reason: string,
    rejectedSteps: RejectedStep[]
  ) => {
    try {
      await reviewArtisanDecisionApi(targetCase.id, {
        approve: false,
        note: `${category}: ${reason}`,
        rejectedSteps,
      });

      const updated: WorkerVerificationCase = {
        ...targetCase,
        status: "REJECTED",
        history: [
          {
            date: "Just now",
            event: `Verification rejected (${category}): "${reason}"`,
            author: "Admin Reviewer",
          },
          ...targetCase.history,
        ],
      };
      onUpdateCase(updated);
      toast.error(`Verification rejected for ${targetCase.worker.name}`);
      if (currentIndex < allCases.length - 1) {
        onNavigateCase(currentIndex + 1);
      } else {
        onBackToQueue();
      }
    } catch (err: any) {
      console.error("Failed to reject verification:", err);
      toast.error(err?.message || "Failed to reject verification.");
      throw err;
    }
  };

  const handleAssignReviewerToggle = async () => {
    const isAssigned = currentCase.assignedReviewer && currentCase.assignedReviewer !== "Unassigned";
    try {
      await assignVerificationReviewerApi(currentCase.id, {
        reviewerId: isAssigned ? null : "current-admin-session",
      });
      const newReviewer = isAssigned ? "Unassigned" : "Me (Operations Admin)";
      const updated: WorkerVerificationCase = {
        ...currentCase,
        assignedReviewer: newReviewer,
        status: isAssigned ? "PENDING" : "IN_REVIEW",
      };
      setCurrentCase(updated);
      onUpdateCase(updated);
      toast.success(isAssigned ? "Reviewer unassigned." : "Assigned case to you.");
    } catch (err: any) {
      console.error("Error toggling assignment:", err);
      toast.error(err?.message || "Failed to update reviewer assignment.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header / Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <button
            type="button"
            onClick={onBackToQueue}
            className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 mb-1 font-semibold cursor-pointer"
          >
            <span>←</span>
            <span>Worker verification</span>
            <span>—</span>
            <span className="font-mono">{currentCase.id}</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-neutral-900">
              Verification review — {currentCase.worker.name}
            </h1>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                currentCase.status === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800"
                  : currentCase.status === "REJECTED"
                  ? "bg-rose-100 text-rose-800"
                  : currentCase.status === "REQUIRES_INFO"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {currentCase.status.replace("_", " ")}
            </span>
            {isLoadingDetail && (
              <span className="text-[10px] text-neutral-400 animate-pulse">Syncing...</span>
            )}
          </div>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Case {currentCase.id} · Submitted {currentCase.submittedAt} · {currentCase.documents.length} document{currentCase.documents.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* Navigation Pagers & Assignment */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleAssignReviewerToggle}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-bold cursor-pointer"
          >
            {currentCase.assignedReviewer && currentCase.assignedReviewer !== "Unassigned"
              ? "Unassign Reviewer"
              : "Assign to Me"}
          </button>
          <span className="text-neutral-500 font-medium px-1">
            Case {currentIndex + 1} of {allCases.length}
          </span>
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => onNavigateCase(currentIndex - 1)}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 cursor-pointer"
          >
            &lt; Previous
          </button>
          <button
            type="button"
            disabled={currentIndex === allCases.length - 1}
            onClick={() => onNavigateCase(currentIndex + 1)}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 cursor-pointer"
          >
            Next &gt;
          </button>
        </div>
      </div>

      {/* 3-Column Split Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Column 1: Worker Profile & History (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#001B40] text-white flex items-center justify-center font-bold text-base shrink-0 overflow-hidden">
                {currentCase.worker.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentCase.worker.avatarUrl}
                    alt={currentCase.worker.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{currentCase.worker.name[0]}</span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-sm leading-tight">
                  {currentCase.worker.name}
                </h3>
                <div className="text-[11px] text-neutral-400 font-mono">{currentCase.worker.code}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded whitespace-nowrap shrink-0">
                    {currentCase.priority} priority
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs border-t border-neutral-100 pt-3">
              <div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase">Primary Trade</div>
                <div className="font-semibold text-neutral-800">{currentCase.worker.trade}</div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase">Operating Location</div>
                <div className="text-neutral-700">{currentCase.worker.location}</div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase">Experience Declared</div>
                <div className="text-neutral-700">{currentCase.worker.experienceYears} years</div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase">Phone &amp; Email</div>
                <div className="text-neutral-800 font-medium">{currentCase.worker.phone}</div>
                <div className="text-neutral-500 text-[11px]">{currentCase.worker.email}</div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase">NIN / Registry Status</div>
                <div className="text-neutral-800 font-mono font-bold">
                  {identityEvidence?.nin || "NIN Submitted"}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase">Assigned Reviewer</div>
                <div className="text-neutral-700 font-medium">{currentCase.assignedReviewer}</div>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-3 space-y-2">
              <div className="text-[11px] font-bold text-neutral-800">Activity on this account</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <div className="text-[10px] text-neutral-500">Jobs Completed</div>
                  <div className="font-bold text-neutral-900 text-sm mt-0.5">
                    {currentCase.worker.jobsCompleted}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <div className="text-[10px] text-neutral-500">Rating</div>
                  <div className="font-bold text-neutral-900 text-sm mt-0.5 flex items-center gap-1 text-amber-600">
                    <span>★</span>
                    <span>{currentCase.worker.rating}</span>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-neutral-500 pt-1">
                Lifetime Earnings:{" "}
                <strong className="text-neutral-900">
                  ₦{currentCase.worker.lifetimeEarnings.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Document Viewer Canvas & Case History (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-xs space-y-4">
            {/* Viewer Header with Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <div className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                  <span>Document viewer</span>
                  {activeDoc?.status === "FLAGGED" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      ⚠️ Flagged
                    </span>
                  )}
                  {activeDoc?.status === "VALID" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      ✓ Valid
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5 truncate max-w-sm">
                  {activeDoc?.name} · Submitted {activeDoc?.submittedAt}
                </div>
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                  className="px-2 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-600 cursor-pointer"
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="px-1 text-[11px] text-neutral-500 font-mono">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
                  className="px-2 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-600 cursor-pointer"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="px-2 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-600 ml-1 cursor-pointer"
                  title="Rotate"
                >
                  ↻ Rotate
                </button>
              </div>
            </div>

            {/* Document Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {currentCase.documents.map((doc, idx) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => {
                    setSelectedDocIndex(idx);
                    setZoomLevel(100);
                    setRotation(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    selectedDocIndex === idx
                      ? "bg-[#001B40] text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  <span>{doc.name.split("(")[0].trim()}</span>
                  {doc.status === "FLAGGED" && <span className="text-amber-400">⚠️</span>}
                </button>
              ))}
            </div>

            {/* Document Preview Canvas */}
            <div className="relative bg-neutral-900 rounded-2xl h-[340px] flex items-center justify-center overflow-hidden border border-neutral-800 p-4">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transition: "transform 0.2s ease-out",
                }}
                className="max-w-full max-h-full flex flex-col items-center justify-center text-center p-6 bg-white/95 rounded-xl shadow-2xl text-neutral-800 border border-neutral-200"
              >
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-2xl mb-3 border border-neutral-200 text-neutral-600">
                  📄
                </div>
                <div className="font-bold text-sm text-neutral-900">{activeDoc?.name}</div>
                <div className="text-xs text-neutral-500 mt-1">
                  Verified with NIMC / Trade Registry Gateway
                </div>
                <div className="text-[11px] font-mono text-neutral-400 mt-2 bg-neutral-100 px-3 py-1 rounded-lg">
                  Doc Ref: {currentCase.worker.code}-{activeDoc?.type}
                </div>
                {activeDoc?.url && activeDoc.url.startsWith("http") && (
                  <a
                    href={activeDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-xs text-[#074292] font-bold hover:underline"
                  >
                    Open Original File ↗
                  </a>
                )}
              </div>
            </div>

            {/* Flag Note if Document has Warning */}
            {activeDoc?.flagReason && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-start gap-2.5">
                <span className="text-base text-rose-600">⚠️</span>
                <div>
                  <strong>Reviewer Warning:</strong> {activeDoc.flagReason}
                </div>
              </div>
            )}

            {/* Case History Log at Bottom */}
            <div className="border-t border-neutral-100 pt-3 space-y-2">
              <div className="text-xs font-bold text-neutral-800">Case History</div>
              <div className="space-y-2">
                {currentCase.history.map((h, i) => (
                  <div key={i} className="text-xs p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                    <div className="flex justify-between font-medium text-neutral-800">
                      <span>{h.event}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">{h.date}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Author: {h.author}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Decision Panel (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm">Decision</h3>

            {/* Approve Card */}
            <div
              onClick={() => setShowApproveModal(true)}
              className="p-4 rounded-2xl border-2 border-emerald-500/80 bg-emerald-50/50 hover:bg-emerald-50 transition-colors cursor-pointer group space-y-1"
            >
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <span>✓</span>
                <span>Approve</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Artisan verified and enters job matching immediately.
              </p>
            </div>

            {/* Request More Information Card */}
            <div
              onClick={() => setShowRequestInfoModal(true)}
              className="p-4 rounded-2xl border border-amber-300 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer group space-y-1"
            >
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <span>💬</span>
                <span>Request more information</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Ask for clarification or re-upload of specific documents.
              </p>
            </div>

            {/* Reject Card */}
            <div
              onClick={() => setShowRejectModal(true)}
              className="p-4 rounded-2xl border border-rose-300 bg-rose-50/50 hover:bg-rose-50 transition-colors cursor-pointer group space-y-1"
            >
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <span>✕</span>
                <span>Reject</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Unverified status with documented reason on profile.
              </p>
            </div>

            {/* Quick Acceleration Action */}
            <button
              type="button"
              onClick={() => setShowApproveModal(true)}
              className="w-full py-3 px-4 bg-[#001B40] text-white text-xs font-bold rounded-2xl hover:bg-neutral-800 transition-colors shadow-xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <span>Approve &amp; next</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Decision Modals */}
      <OpsApproveVerificationModal
        vCase={currentCase}
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApproveConfirm}
      />

      <OpsRequestInfoModal
        vCase={currentCase}
        isOpen={showRequestInfoModal}
        onClose={() => setShowRequestInfoModal(false)}
        onConfirm={handleRequestInfoConfirm}
      />

      <OpsRejectVerificationModal
        vCase={currentCase}
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}
