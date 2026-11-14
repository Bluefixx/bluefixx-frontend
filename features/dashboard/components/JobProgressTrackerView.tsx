"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  getBookingByIdApi,
  decideAdditionApi,
  confirmBookingApi,
} from "@/lib/api/bookings";
import { BookingDetail } from "@/types/customer";
import { koboToNaira } from "@/lib/utils/currency";

export type TrackerStage =
  | "job_posted"
  | "receiving_quotes"
  | "quote_accepted"
  | "payment_secured"
  | "scheduled"
  | "artisan_arrived"
  | "work_in_progress"
  | "completed_by_artisan"
  | "payment_released";

interface JobProgressTrackerViewProps {
  jobId?: string;
  onBack?: () => void;
  onPaymentReleased?: () => void;
  initialStage?: TrackerStage;
  initialShowAdditionalCost?: boolean;
}

export default function JobProgressTrackerView({
  jobId = "",
  onBack,
  onPaymentReleased,
  initialStage = "scheduled",
  initialShowAdditionalCost = false,
}: JobProgressTrackerViewProps) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [pendingAdditionId, setPendingAdditionId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Current milestone state in tracker
  const [currentStage, setCurrentStage] = useState<TrackerStage>(initialStage);

  // Additional Cost Requested state
  const [hasAdditionalCost, setHasAdditionalCost] = useState(initialShowAdditionalCost);
  const [additionalCostStatus, setAdditionalCostStatus] = useState<"pending" | "approved" | "declined">("pending");

  const mapStatusToStage = (status?: string, funded?: boolean, released?: boolean): TrackerStage => {
    if (released || status === "COMPLETED") return "payment_released";
    if (status === "WORK_SUBMITTED") return "completed_by_artisan";
    if (status === "IN_PROGRESS") return "work_in_progress";
    if (status === "ARRIVED") return "artisan_arrived";
    if (status === "ON_THE_WAY" || status === "FUNDED" || status === "ACCEPTED") return "scheduled";
    if (funded) return "payment_secured";
    return "quote_accepted";
  };

  const fetchBookingState = useCallback(async () => {
    if (!jobId) return;
    setIsRefreshing(true);
    try {
      const detail = await getBookingByIdApi(jobId);
      setBooking(detail);
      setCurrentStage(mapStatusToStage(detail.status, detail.funded, detail.released));
      const detailWithAdditions = detail as BookingDetail & {
        additions?: Array<{ id: string; status: string }>;
      };
      const pendingAdd = (detailWithAdditions.additions || []).find(
        (a) => a.status === "PROPOSED"
      );
      if (pendingAdd) {
        setPendingAdditionId(pendingAdd.id);
        setHasAdditionalCost(true);
        setAdditionalCostStatus("pending");
      }
    } catch {
      // Keep current view state if fetch fails
    } finally {
      setIsRefreshing(false);
    }
  }, [jobId]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void fetchBookingState();
    });
    return () => {
      active = false;
    };
  }, [fetchBookingState]);

  // Amounts
  const baseLabour = booking?.offer ? koboToNaira(booking.offer.labour) : 0;
  const baseMaterials = booking?.offer?.materials
    ? booking.offer.materials.reduce((sum, m) => sum + koboToNaira(m.amount), 0)
    : 0;
  const originalApproved = booking ? koboToNaira(booking.base) : baseLabour + baseMaterials;
  const additionalLabour = 0;
  const additionalMaterials = 0;
  const newTotal = originalApproved + additionalLabour + additionalMaterials;

  // Modals state
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isConfirmCompletionView, setIsConfirmCompletionView] = useState(false);
  const [isReleasePaymentModalOpen, setIsReleasePaymentModalOpen] = useState(false);
  const [isReportProblemModalOpen, setIsReportProblemModalOpen] = useState(false);
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
  const [problemReason, setProblemReason] = useState("");

  // Milestone timeline definition
  const milestones: { id: TrackerStage; title: string; actor: string; time?: string }[] = [
    { id: "job_posted", title: "Job posted", actor: "Customer", time: "Aug 22 · 8:32 AM" },
    { id: "receiving_quotes", title: "Receiving quotes", actor: "Marketplace" },
    { id: "quote_accepted", title: "Quote accepted", actor: "Customer" },
    { id: "payment_secured", title: "Payment secured", actor: "Bluefixx Escrow · TXN-639890" },
    { id: "scheduled", title: "Job scheduled", actor: "Both parties", time: "Tomorrow · 9:00 AM" },
    { id: "artisan_arrived", title: "Artisan arrived", actor: "Artisan" },
    { id: "work_in_progress", title: "Work in progress", actor: "Artisan" },
    { id: "completed_by_artisan", title: "Completed by artisan", actor: "Artisan" },
    { id: "payment_released", title: "Payment released", actor: "Customer confirmation" },
  ];

  const getStageIndex = (stage: TrackerStage) => {
    return milestones.findIndex((m) => m.id === stage);
  };

  const currentIndex = getStageIndex(currentStage);

  const refreshStage = async () => {
    await fetchBookingState();
    toast.success("Job status synced.");
  };

  // Handle Additional Cost Actions
  const handleApproveCost = async () => {
    if (!pendingAdditionId) {
      toast.error("No pending addition reference found.");
      return;
    }
    try {
      await decideAdditionApi(pendingAdditionId, true);
      setAdditionalCostStatus("approved");
      toast.success("Additional cost approved.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to approve additional cost.");
    }
  };

  const handleDeclineCost = async () => {
    if (!pendingAdditionId) {
      toast.error("No pending addition reference found.");
      return;
    }
    try {
      await decideAdditionApi(pendingAdditionId, false);
      setAdditionalCostStatus("declined");
      toast("Additional cost declined. Artisan will proceed with original scope.", { icon: "ℹ️" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to decline additional cost.");
    }
  };

  const handleAskQuestion = () => {
    router.push("/messages");
  };

  // Handle Release Payment
  const handleConfirmAndReleasePayment = async () => {
    if (!jobId) {
      toast.error("Booking reference is missing.");
      return;
    }
    try {
      await confirmBookingApi(jobId);
      setIsReleasePaymentModalOpen(false);
      setIsConfirmCompletionView(false);
      setCurrentStage("payment_released");
      toast.success("Payment released to artisan. Warranty is now active!", { duration: 5000 });
      if (onPaymentReleased) {
        setTimeout(() => {
          onPaymentReleased();
        }, 500);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to confirm completion.");
    }
  };

  // ══════════════════════════════════════════════════════════════
  // VIEW 2: IS YOUR JOB COMPLETE? (Screen 5 Left)
  // ══════════════════════════════════════════════════════════════
  if (isConfirmCompletionView) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Breadcrumb */}
        <div>
          <button
            type="button"
            onClick={() => setIsConfirmCompletionView(false)}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>My jobs</span>
          </button>

          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight mt-2">
            Is your job complete?
          </h1>
          <p className="font-sans text-xs text-neutral-400 mt-0.5">
            Bathroom Plumbing Repair
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-[#FFF9EA] border border-[#FDE68A] rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
          <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="font-sans text-xs sm:text-sm text-amber-900 leading-relaxed">
            Confirming completion releases the secured payment of{" "}
            <span className="font-bold">₦120,000</span> to{" "}
            <span className="font-bold">Emeka Okafor</span>. Only confirm once you are satisfied with the work.
          </p>
        </div>

        {/* Grid: Photos vs Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Completion Photos */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
              <h2 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
                Completion photos from Emeka
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Photo 1 */}
                <div className="space-y-2">
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 group">
                    <img
                      src="https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80"
                      alt="Replaced under-sink trap and copper valve"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-lg">
                      New copper joints & trap
                    </span>
                  </div>
                  <p className="font-sans text-xs text-neutral-500">
                    Joint underneath basin re-piped and sealed
                  </p>
                </div>

                {/* Photo 2 */}
                <div className="space-y-2">
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 group">
                    <img
                      src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
                      alt="Clean bathroom basin with dry wall surface"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-lg">
                      Clean & dry area
                    </span>
                  </div>
                  <p className="font-sans text-xs text-neutral-500">
                    Basin re-mounted with water pressure tested
                  </p>
                </div>
              </div>

              {/* Artisan Note */}
              <div className="pt-4 border-t border-neutral-100">
                <div className="bg-neutral-50 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#001B40] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    EO
                  </div>
                  <div>
                    <span className="font-sans font-bold text-xs text-neutral-900 block">
                      Emeka Okafor (Plumber)
                    </span>
                    <p className="font-sans text-xs text-neutral-600 mt-1 leading-relaxed">
                      &quot;Completed full diagnosis, replaced corroded coupling behind the basin, applied thread sealant, and pressure tested for 30 minutes. All dry and full pressure restored.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Problem Disclaimer Banner */}
            <div className="bg-[#EDF5FF] border border-[#CDE0FF] rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
              <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p className="font-sans text-xs sm:text-sm text-[#002D62] leading-relaxed">
                If something is wrong, report a problem instead. Your payment stays secured while Bluefixx Support reviews the job.
              </p>
            </div>
          </div>

          {/* Right Column: Job Summary Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-5">
              <h3 className="font-heading font-bold text-base text-[#0F1115]">
                Job summary
              </h3>

              <div className="space-y-3.5 text-xs sm:text-sm divide-y divide-neutral-100">
                <div className="flex justify-between items-center pb-2">
                  <span className="text-neutral-500">Job</span>
                  <span className="font-semibold text-neutral-900 text-right">
                    Bathroom Plumbing Repair
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-500">Artisan</span>
                  <span className="font-semibold text-neutral-900">
                    Emeka Okafor
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-500">Amount held</span>
                  <span className="font-bold text-base text-[#001B40]">
                    ₦120,000
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-neutral-500">Transaction ID</span>
                  <span className="font-mono text-xs text-neutral-600">
                    TXN-639890
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsReleasePaymentModalOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center shadow-xs"
                >
                  Confirm completion
                </button>

                <button
                  type="button"
                  onClick={() => setIsReportProblemModalOpen(true)}
                  className="w-full py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
                >
                  Report a problem
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* MODAL: RELEASE PAYMENT? (Screen 5 Right)                   */}
        {/* ══════════════════════════════════════════════════════════ */}
        {isReleasePaymentModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsReleasePaymentModalOpen(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className="space-y-2 pt-1 text-center sm:text-left">
                <h3 className="font-heading font-bold text-xl text-[#0F1115]">
                  Release payment?
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  ₦120,000 will be paid to <span className="font-semibold text-neutral-900">Emeka Okafor</span> immediately.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmAndReleasePayment}
                  className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center shadow-xs"
                >
                  Confirm &amp; Release
                </button>

                <button
                  type="button"
                  onClick={() => setIsReleasePaymentModalOpen(false)}
                  className="w-full py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
                >
                  Not yet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* MODAL: REPORT A PROBLEM                                    */}
        {/* ══════════════════════════════════════════════════════════ */}
        {isReportProblemModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => setIsReportProblemModalOpen(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <h3 className="font-heading font-bold text-lg text-[#0F1115]">
                Report an issue with this job
              </h3>
              <p className="font-sans text-xs text-neutral-500">
                Your payment will remain locked securely in Escrow while our resolution team reviews the dispute with both parties.
              </p>

              <div className="space-y-1.5 pt-2">
                <label className="font-sans font-semibold text-xs text-neutral-700">
                  What is the problem?
                </label>
                <textarea
                  rows={4}
                  value={problemReason}
                  onChange={(e) => setProblemReason(e.target.value)}
                  placeholder="e.g. The leak is still dripping, or the work is incomplete..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-[#001B40] text-xs sm:text-sm text-neutral-800 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsReportProblemModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-semibold text-xs hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!problemReason.trim()) {
                      toast.error("Please explain the issue first");
                      return;
                    }
                    setIsReportProblemModalOpen(false);
                    toast.success("Dispute opened. Bluefixx Escrow remains locked.");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer"
                >
                  Submit Dispute
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VIEW 1: MAIN JOB PROGRESS TRACKER (Screenshots 1, 2, 3, 4)
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ────────────────────────────────────────────────────────── */}
      {/* Top Header & Breadcrumb                                    */}
      {/* ────────────────────────────────────────────────────────── */}
      <div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors cursor-pointer mb-2"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>My jobs</span>
          </button>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
              Bathroom Plumbing Repair
            </h1>
            <p className="font-sans text-xs text-neutral-400 mt-0.5">
              {jobId} · Updated today · 9:39
            </p>
          </div>


        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Badges Row: Scheduled, Payment Secured, Safety             */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Pill */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#001B40] text-white text-xs font-semibold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {currentStage === "completed_by_artisan"
              ? "Completed by Artisan"
              : currentStage === "payment_released"
              ? "Payment Released"
              : currentStage === "work_in_progress"
              ? "Work in Progress"
              : currentStage === "artisan_arrived"
              ? "Artisan Arrived"
              : "Scheduled"}
          </span>

          {/* Payment Pill */}
          <span className="px-3 py-1 rounded-full bg-[#001B40] text-white text-xs font-semibold shadow-2xs">
            {currentStage === "payment_released" ? "Payment Released" : "Payment Secured"}
          </span>
        </div>

        {/* Safety Badge Button (Screenshot 3 trigger) */}
        <button
          type="button"
          onClick={() => setIsSafetyModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold text-[#E02D3C] border border-[#FEE2E2] bg-[#FFF1F2] hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Safety</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* SCREEN 2: Additional Cost Alert Banner                     */}
      {/* ────────────────────────────────────────────────────────── */}
      {hasAdditionalCost && additionalCostStatus === "pending" && (
        <div className="bg-[#FFF9EA] border border-[#FDE68A] rounded-2xl p-4 flex items-start gap-3 shadow-2xs animate-in fade-in duration-200">
          <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="font-sans text-xs sm:text-sm text-amber-900 leading-relaxed">
            The artisan requested an additional cost. Payment stays secured until you confirm.
          </p>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 7-Day Warranty Banner                                      */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="bg-[#EAF7EE] border border-[#C7EDD2] rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <svg className="w-5 h-5 text-[#1B8354] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <div>
          <h4 className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
            Covered by a 7-day warranty
          </h4>
          <p className="font-sans text-xs text-neutral-600 mt-0.5">
            Your warranty starts the day you confirm the work is complete.
          </p>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Main Two-Column Layout                                     */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ══════════════════════════════════════════════════════════ */}
        {/* LEFT COLUMN: Job Details & Photos (~65%)                   */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-8 space-y-6">
          {/* SCREEN 2: Additional Cost Requested Card */}
          {hasAdditionalCost && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
                  Additional cost requested
                </h3>
                {additionalCostStatus === "approved" && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    ✓ Approved
                  </span>
                )}
                {additionalCostStatus === "declined" && (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
                    ✕ Declined
                  </span>
                )}
              </div>

              <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                &quot;Upon opening the wall cavity behind the basin, the concealed copper pipe has extensive corrosion requiring 2 meters of new high-grade copper piping and new heavy-duty compression fittings.&quot;
              </p>

              {/* Cost Breakdown */}
              <div className="space-y-3 pt-2 text-xs sm:text-sm divide-y divide-neutral-100">
                <div className="flex justify-between items-center pb-2">
                  <span className="text-neutral-500">Additional labour</span>
                  <span className="font-semibold text-neutral-900">
                    ₦{additionalLabour.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-500">Additional materials</span>
                  <span className="font-semibold text-neutral-900">
                    ₦{additionalMaterials.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-500">Original approved amount</span>
                  <span className="font-semibold text-neutral-900">
                    ₦{originalApproved.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="font-bold text-sm text-neutral-900">New total</span>
                  <span className="font-bold text-lg text-[#001B40]">
                    ₦{newTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="font-sans text-xs text-neutral-400">
                The original approved quote is unchanged unless you approve this request.
              </p>

              {/* Action Buttons */}
              {additionalCostStatus === "pending" && (
                <div className="flex items-center gap-3 pt-2 flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={handleApproveCost}
                    className="flex-1 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center shadow-xs"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={handleDeclineCost}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={handleAskQuestion}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
                  >
                    Ask Question
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 1. Assigned Professional Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
              Assigned professional
            </h3>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-200 ring-2 ring-neutral-100 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                    alt="Emeka Okafor"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm sm:text-base text-[#0F1115]">
                    Emeka Okafor
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                    <span>Plumber</span>
                    <span>·</span>
                    <span className="flex items-center text-amber-500 font-semibold">
                      ★ 4.9
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-medium text-neutral-400 capitalize">
                {currentStage === "completed_by_artisan" ? "Completed" : "Scheduled"}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => toast("Opening chat conversation with Emeka Okafor...", { icon: "💬" })}
                className="w-full py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
              >
                Message Emeka
              </button>
            </div>
          </div>

          {/* 2. Job Details Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
              Job details
            </h3>

            <p className="font-sans text-xs sm:text-sm text-neutral-700 leading-relaxed">
              The pipe joint behind the bathroom basin has been dripping for three days and the wall is now damp. The shower pressure has also dropped. I need it diagnosed and repaired properly, not patched.
            </p>

            {/* Key-Value Specs */}
            <div className="space-y-3 pt-2 text-xs sm:text-sm divide-y divide-neutral-100">
              <div className="flex justify-between items-center pb-2">
                <span className="text-neutral-400">Service</span>
                <span className="font-medium text-neutral-900">
                  Plumbing → Leak repair
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-400">Location</span>
                <span className="font-medium text-neutral-900 text-right">
                  14 Ogui Road, Independence Layout, Enugu
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-400">Date</span>
                <span className="font-medium text-neutral-900">
                  Tomorrow · Sat 23 Aug
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-400">Time</span>
                <span className="font-medium text-neutral-900">
                  Morning · 8am – 12pm
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-400">Budget</span>
                <span className="font-medium text-neutral-900">
                  ₦100,000+
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-neutral-400">Urgency</span>
                <span className="font-medium text-neutral-900">
                  Soon
                </span>
              </div>
            </div>
          </div>

          {/* 3. Photos Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
              Photos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Photo 1 */}
              <div className="space-y-1.5">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img
                    src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80"
                    alt="Damp patch near the basin"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-sans text-xs text-neutral-500">
                  Damp patch near the basin
                </p>
              </div>

              {/* Photo 2 */}
              <div className="space-y-1.5">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img
                    src="https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80"
                    alt="Pipe joint underneath"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-sans text-xs text-neutral-500">
                  Pipe joint underneath
                </p>
              </div>
            </div>
          </div>

          {/* 4. Additional Information Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
              Additional information
            </h3>

            <div className="space-y-3 text-xs sm:text-sm divide-y divide-neutral-100">
              <div className="flex justify-between items-center pb-2">
                <span className="text-neutral-600">Is water currently leaking?</span>
                <span className="font-semibold text-neutral-900">Yes</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-600">Is the affected area accessible?</span>
                <span className="font-semibold text-neutral-900">Yes</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-neutral-600">Is there running water supply?</span>
                <span className="font-semibold text-neutral-900">Yes</span>
              </div>
            </div>
          </div>

          {/* 5. Work Updates Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
              Work updates
            </h3>

            {currentStage === "completed_by_artisan" || currentStage === "payment_released" ? (
              <div className="space-y-3">
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-sans font-bold text-xs text-emerald-900">
                      Work completed by Emeka Okafor
                    </span>
                    <p className="font-sans text-xs text-emerald-800 mt-1">
                      New copper joints installed, sealed, and verified leak-free. Completion photos uploaded.
                    </p>
                  </div>
                </div>
              </div>
            ) : currentStage === "work_in_progress" ? (
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0 animate-ping" />
                <div>
                  <span className="font-sans font-bold text-xs text-blue-900">
                    Artisan is currently working
                  </span>
                  <p className="font-sans text-xs text-blue-800 mt-1">
                    Emeka arrived at 9:15 AM and has disassembled the lower joint for replacement.
                  </p>
                </div>
              </div>
            ) : (
              <p className="font-sans text-xs text-neutral-400">
                No updates yet. The artisan posts progress here as the work moves.
              </p>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN: Status Stepper, Payment, Location, Actions   */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Job Status Stepper Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-5">
            <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
              Job Status
            </h3>

            <div className="space-y-4 pt-1">
              {milestones.map((m, idx) => {
                const isPast = idx < currentIndex;
                const isCurrent = idx === currentIndex;
                const isUpcoming = idx > currentIndex;

                return (
                  <div key={m.id} className="relative flex items-start gap-3 group">
                    {/* Connecting Vertical Line */}
                    {idx < milestones.length - 1 && (
                      <span
                        className={`absolute left-2.5 top-5 w-0.5 h-[calc(100%+0.25rem)] -translate-x-1/2 ${
                          idx < currentIndex ? "bg-neutral-800" : "bg-neutral-200"
                        }`}
                      />
                    )}

                    {/* Milestone Icon / Dot */}
                    <div className="relative z-10 shrink-0">
                      {isPast ? (
                        <div className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full border-2 border-[#001B40] bg-white flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#001B40]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-neutral-300 bg-white" />
                      )}
                    </div>

                    {/* Milestone Content */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-sans text-xs ${
                          isCurrent
                            ? "font-bold text-[#0F1115]"
                            : isPast
                            ? "font-medium text-neutral-800"
                            : "font-normal text-neutral-400"
                        }`}
                      >
                        {m.title}
                      </p>
                      <p className="font-sans text-[11px] text-neutral-400 mt-0.5">
                        {m.actor} {m.time ? `· ${m.time}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Payment Summary Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
              Payment summary
            </h3>

            <span className="inline-block px-3 py-1 rounded-full bg-[#001B40] text-white text-[11px] font-semibold">
              Payment Secured
            </span>

            <div className="space-y-2.5 pt-2 text-xs sm:text-sm divide-y divide-neutral-100">
              <div className="flex justify-between items-center pb-2">
                <span className="text-neutral-500">Labour</span>
                <span className="font-semibold text-neutral-900">
                  ₦{baseLabour.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-500">Materials</span>
                <span className="font-semibold text-neutral-900">
                  ₦{baseMaterials.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-neutral-500 font-medium">Total</span>
                <span className="font-bold text-lg text-[#0F1115]">
                  ₦{originalApproved.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400 leading-tight space-y-1">
              <p className="font-mono text-neutral-500 font-semibold">{jobId}</p>
              <p>
                Escrow protection active. Bluefixx retains 3.5% service fee from the artisan&apos;s payout upon completion.
              </p>
            </div>
          </div>

          {/* 3. Location Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
              Location
            </h3>

            {/* Stylized Map Box */}
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="relative z-10 w-9 h-9 rounded-full bg-[#001B40] text-white flex items-center justify-center shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
            </div>

            <div>
              <p className="font-sans font-semibold text-xs sm:text-sm text-neutral-900">
                14 Ogui Road, Independence Layout, Enugu
              </p>
              <p className="font-sans text-[11px] text-neutral-400 mt-0.5">
                205 SQM
              </p>
            </div>
          </div>

          {/* 4. Job Actions Card (Screenshot 1 & Screenshot 4) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-3">
            <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
              Job actions
            </h3>

            {currentStage === "completed_by_artisan" ? (
              // SCREEN 4: Completed by artisan -> Confirm completion button
              <button
                type="button"
                onClick={() => setIsConfirmCompletionView(true)}
                className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center shadow-xs"
              >
                Confirm completion
              </button>
            ) : currentStage === "payment_released" ? (
              <div className="w-full py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs text-center">
                ✓ Job Completed &amp; Escrow Released
              </div>
            ) : (
              <button
                type="button"
                disabled={isRefreshing}
                onClick={refreshStage}
                className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center shadow-xs disabled:opacity-60"
              >
                {isRefreshing ? "Syncing..." : "Refresh Job Status"}
              </button>
            )}

            <button
              type="button"
              onClick={() => router.push("/messages")}
              className="w-full py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
            >
              Message {booking?.artisan?.fullName || "Artisan"}
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREEN 3: SAFETY OPTIONS MODAL (Conversation options)        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isSafetyModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header with Close */}
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
                Conversation options
              </h3>
              <button
                type="button"
                onClick={() => setIsSafetyModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 3 Safety Actions */}
            <div className="space-y-2.5 pt-1">
              {/* Option 1: Call the Police */}
              <a
                href="tel:112"
                onClick={() => setIsSafetyModalOpen(false)}
                className="w-full p-3.5 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 flex items-center gap-3.5 transition-colors cursor-pointer group text-left block"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>
                  <span className="font-sans font-bold text-xs sm:text-sm text-rose-600 block">
                    Call the police
                  </span>
                  <span className="text-[11px] text-rose-500/80">
                    Emergency response (112)
                  </span>
                </div>
              </a>

              {/* Option 2: Message Bluefixx Support */}
              <button
                type="button"
                onClick={() => {
                  setIsSafetyModalOpen(false);
                  router.push("/messages?conversation=support");
                }}
                className="w-full p-3.5 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center gap-3.5 transition-colors cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#001B40] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <span className="font-sans font-semibold text-xs sm:text-sm text-neutral-800 block">
                    Message Bluefixx support
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Priority safety agent response
                  </span>
                </div>
              </button>

              {/* Option 3: Share Location */}
              <button
                type="button"
                onClick={() => {
                  setIsSafetyModalOpen(false);
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText("https://maps.google.com/?q=14+Ogui+Road+Independence+Layout+Enugu");
                  }
                  toast.success("Location link copied to clipboard!");
                }}
                className="w-full p-3.5 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center gap-3.5 transition-colors cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#001B40] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <span className="font-sans font-semibold text-xs sm:text-sm text-neutral-800 block">
                    Share location
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    14 Ogui Road, Independence Layout
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
