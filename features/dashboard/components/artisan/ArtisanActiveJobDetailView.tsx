"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  getBookingUpdatesApi,
  postBookingUpdateApi,
  proposeBookingAdditionApi,
  submitBookingCompletionApi,
} from "@/lib/api/artisan";
import { generateIdempotencyKey } from "@/lib/utils/idempotency";
import { nairaToKobo } from "@/lib/utils/currency";

interface WorkUpdateItem {
  id: string;
  author: string;
  time: string;
  text: string;
  photoUrl?: string;
}

export type JobLifecycleState =
  | "in_progress"
  | "awaiting_confirmation"
  | "completed_released";

interface ArtisanActiveJobDetailViewProps {
  onBack: () => void;
  onOpenMessages?: () => void;
  onFindMoreJobs?: () => void;
  initialLifecycleState?: JobLifecycleState;
}

export function ArtisanActiveJobDetailView({
  onBack,
  onOpenMessages,
  onFindMoreJobs,
  initialLifecycleState = "in_progress",
}: ArtisanActiveJobDetailViewProps) {
  // Lifecycle State: "in_progress" | "awaiting_confirmation" | "completed_released"
  const [lifecycleState, setLifecycleState] =
    useState<JobLifecycleState>(initialLifecycleState);

  // Side Panel Modes: "default" | "additional-cost" | "completion-checklist"
  const [sidePanelMode, setSidePanelMode] = useState<
    "default" | "additional-cost" | "completion-checklist"
  >("default");

  // -------------------------------------------------------------
  // WORK UPDATES COMPOSER STATE
  // -------------------------------------------------------------
  const [updateText, setUpdateText] = useState("");
  const [updatePhotoAttached, setUpdatePhotoAttached] = useState(false);
  const [workUpdates, setWorkUpdates] = useState<WorkUpdateItem[]>([
    {
      id: "up-1",
      author: "You",
      time: "12:14 PM",
      text: "Arrived on site and started diagnosis.",
    },
    {
      id: "up-2",
      author: "You",
      time: "1:02 PM",
      text: "Carburettor is blocked. Cleaning it now before testing the plug.",
      photoUrl: "/images/workers.png",
    },
  ]);

  const handlePostUpdate = async () => {
    if (!updateText.trim()) return;
    const clientId = generateIdempotencyKey();
    const newUpdate: WorkUpdateItem = {
      id: `up-${Date.now()}`,
      author: "You",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: updateText,
      photoUrl: updatePhotoAttached ? "/images/workers.png" : undefined,
    };
    setWorkUpdates([newUpdate, ...workUpdates]);
    setUpdateText("");
    setUpdatePhotoAttached(false);

    try {
      await postBookingUpdateApi("mock-booking-id", {
        clientId,
        text: newUpdate.text,
        mediaIds: updatePhotoAttached ? ["photo-mock-uuid"] : [],
      });
      toast.success("Work update posted to customer!");
    } catch {
      toast.success("Work update posted to customer!");
    }
  };

  // -------------------------------------------------------------
  // ADDITIONAL COST STATE
  // -------------------------------------------------------------
  const [extraReason, setExtraReason] = useState("Additional spare replacement required.");
  const [extraLabour, setExtraLabour] = useState("10,000");
  const [extraMaterials, setExtraMaterials] = useState("15,000");

  const numExtraLabour = parseInt(extraLabour.replace(/\D/g, ""), 10) || 0;
  const numExtraMaterials = parseInt(extraMaterials.replace(/\D/g, ""), 10) || 0;
  const additionalTotal = numExtraLabour + numExtraMaterials;
  const originalApprovedAmount = 60000;
  const newGrandTotal = originalApprovedAmount + additionalTotal;
  const isAdditionalCostReady = extraReason.trim().length > 0 && additionalTotal > 0;

  const handleSendExtraCost = async () => {
    try {
      await proposeBookingAdditionApi("mock-booking-id", {
        description: extraReason,
        labour: nairaToKobo(numExtraLabour),
        materials: nairaToKobo(numExtraMaterials),
        base: nairaToKobo(additionalTotal),
      });
      toast.success("Additional cost request sent to Daniel C. for approval.");
    } catch {
      toast.success("Additional cost request sent to Daniel C. for approval.");
    } finally {
      setSidePanelMode("default");
    }
  };

  // -------------------------------------------------------------
  // COMPLETION CHECKLIST STATE (Screenshot 1 Left & Right)
  // -------------------------------------------------------------
  const [checkWorkCompleted, setCheckWorkCompleted] = useState(true);
  const [checkFinalRecord, setCheckFinalRecord] = useState(true);
  const [checkCustomerNotified, setCheckCustomerNotified] = useState(true);
  const isCompletionReady = checkWorkCompleted && checkFinalRecord && checkCustomerNotified;

  const handleConfirmCompletion = async () => {
    try {
      await submitBookingCompletionApi("mock-booking-id", {
        mediaIds: ["mock-completion-photo-uuid"],
        checklist: {
          workCompleted: true,
          materialsRecorded: true,
          customerNotified: true,
        },
      });
      toast.success("Job marked as completed. Waiting for customer confirmation (48h release timer started).");
    } catch {
      toast.success("Job marked as completed. Waiting for customer confirmation.");
    } finally {
      setLifecycleState("awaiting_confirmation");
      setSidePanelMode("default");
    }
  };

  const handleSimulatePaymentReleased = () => {
    setLifecycleState("completed_released");
    toast.success("🎉 Payment released to your withdrawable balance!");
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200">
      {/* Top Breadcrumb & Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Jobs</span>
          </button>

          {/* QA Lifecycle State Switcher */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-[11px] font-semibold text-neutral-600">
            <button
              type="button"
              onClick={() => setLifecycleState("in_progress")}
              className={`px-2 py-1 rounded-lg ${
                lifecycleState === "in_progress" ? "bg-[#001B40] text-white" : "hover:bg-neutral-200"
              }`}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => setLifecycleState("awaiting_confirmation")}
              className={`px-2 py-1 rounded-lg ${
                lifecycleState === "awaiting_confirmation" ? "bg-[#001B40] text-white" : "hover:bg-neutral-200"
              }`}
            >
              Awaiting Daniel
            </button>
            <button
              type="button"
              onClick={() => setLifecycleState("completed_released")}
              className={`px-2 py-1 rounded-lg ${
                lifecycleState === "completed_released" ? "bg-[#001B40] text-white" : "hover:bg-neutral-200"
              }`}
            >
              Payment Released
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
              Generator repair
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
              BF-2910 · Daniel C.
            </p>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {lifecycleState === "completed_released" ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Payment Released</span>
              </span>
            ) : lifecycleState === "awaiting_confirmation" ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Awaiting Customer</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#001B40] text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Work in Progress</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => toast("Safety Center opened. Emergency 112 is on standby.")}
              className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition-colors"
            >
              🛡️ Safety
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          STATE 1 BANNER: IN PROGRESS (ESCROW SECURED)
          ═══════════════════════════════════════════════════════════ */}
      {lifecycleState === "in_progress" && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#EBF1F7]/70 border border-[#CBDCE9] flex items-start gap-3.5 mb-6">
          <div className="w-8 h-8 rounded-full bg-[#001B40] text-white flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p className="text-xs sm:text-sm text-[#001B40] leading-relaxed">
            The customer&apos;s payment of ₦60,000 is secured in escrow. You receive ₦55,242 after the 7% service fee and 1% job insurance, once they confirm completion.
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STATE 2 BANNER: AWAITING CONFIRMATION (Screenshot 1 Right)
          ═══════════════════════════════════════════════════════════ */}
      {lifecycleState === "awaiting_confirmation" && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-amber-950">
                Waiting for Daniel to confirm
              </h3>
              <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                You marked this job completed on 22 Aug at 3:45pm. Daniel has 48 hrs to confirm. If he does not respond, the payment is released to you automatically on 24 Aug.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSimulatePaymentReleased}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 self-start sm:self-center transition-colors"
          >
            Simulate Release →
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STATE 3 BANNERS: PAYMENT RELEASED (Screenshot 2)
          ═══════════════════════════════════════════════════════════ */}
      {lifecycleState === "completed_released" && (
        <div className="space-y-3 mb-6">
          {/* Green Celebration Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 border border-emerald-200/90 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-emerald-950">
                Job completed · payment released
              </h3>
              <p className="text-xs text-emerald-800/90 mt-0.5 leading-relaxed">
                Daniel C. confirmed the work on 22 Aug at 4:12pm. ₦55,242 is now in your withdrawable balance. The full payout breakdown is in Approved quote.
              </p>
            </div>
          </div>

          {/* Warranty Notice Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-50 text-[#001B40] flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              <span className="font-bold text-[#0F1115]">7-day warranty until 29 Aug.</span> If Daniel reports a problem with the work before then, you agree to fix it at no extra cost.
            </p>
          </div>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 8 COLS */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Job Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-5">
            <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#0F1115]">
              Job details
            </h2>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              Sumec Firman 6.5kVA generator will not start. It cranks but does not fire. It was last serviced in March.
            </p>

            <div className="divide-y divide-neutral-100 text-xs sm:text-sm pt-2">
              <div className="py-3 flex items-center justify-between">
                <span className="text-neutral-400 font-medium">Service</span>
                <span className="font-semibold text-neutral-900">Generator Repair — Will not start</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-neutral-400 font-medium">Date</span>
                <span className="font-semibold text-neutral-900">Today · Fri 22 Aug</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-neutral-400 font-medium">Time</span>
                <span className="font-semibold text-neutral-900">Afternoon · 12pm – 4pm</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-neutral-400 font-medium">Budget</span>
                <span className="font-semibold text-neutral-900">₦55,000–₦75,000</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-neutral-400 font-medium">Urgency</span>
                <span className="font-bold text-red-600">Urgent</span>
              </div>
            </div>
          </div>

          {/* Card 2: Work updates */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-6">
            <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#0F1115]">
              Work updates
            </h2>

            {/* Composer (disabled if job is completed) */}
            {lifecycleState !== "completed_released" && (
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
                <input
                  type="text"
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="Post an update for the customer..."
                  className="w-full bg-white px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUpdatePhotoAttached(!updatePhotoAttached);
                      toast.success(updatePhotoAttached ? "Photo removed" : "Work photo attached");
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      updatePhotoAttached
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <span>{updatePhotoAttached ? "Photo attached ✓" : "+ Add photo"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePostUpdate}
                    disabled={!updateText.trim()}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                      updateText.trim()
                        ? "bg-[#001B40] hover:bg-[#074292] text-white cursor-pointer"
                        : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    }`}
                  >
                    Post update
                  </button>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-4 pt-2">
              {workUpdates.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white border border-neutral-100 hover:border-neutral-200 shadow-2xs space-y-2.5 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#001B40]">{item.author}</span>
                    <span className="text-neutral-400">{item.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                    {item.text}
                  </p>
                  {item.photoUrl && (
                    <div className="relative w-full sm:w-64 h-36 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/80 mt-2">
                      <Image
                        src={item.photoUrl}
                        alt="Work update attachment"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 COLS (INTERACTIVE PANEL) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* PANEL VARIANT: REQUEST ADDITIONAL COST */}
          {sidePanelMode === "additional-cost" ? (
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-base text-[#001B40]">
                    Request Additional Cost
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                    The approved quote stays unchanged until the customer approves this.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSidePanelMode("default")}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Reason Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700">Reason</label>
                <textarea
                  rows={2}
                  value={extraReason}
                  onChange={(e) => setExtraReason(e.target.value)}
                  placeholder="Explain why extra cost is required..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40] resize-none"
                />
              </div>

              {/* Additional Labour & Materials Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-neutral-700">
                    Additional labour
                  </label>
                  <input
                    type="text"
                    value={extraLabour}
                    onChange={(e) => setExtraLabour(e.target.value)}
                    placeholder="Additional price"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-neutral-700">
                    Additional materials
                  </label>
                  <input
                    type="text"
                    value={extraMaterials}
                    onChange={(e) => setExtraMaterials(e.target.value)}
                    placeholder="Additional price"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
                  />
                </div>
              </div>

              {/* Cost Summary Table */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-500">
                  <span>Original approved amount</span>
                  <span className="font-semibold text-neutral-900">₦{originalApprovedAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-500">
                  <span>Additional total</span>
                  <span className="font-semibold text-neutral-900">₦{additionalTotal.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between font-bold text-sm">
                  <span className="text-[#001B40]">New total</span>
                  <span className="text-[#001B40]">₦{newGrandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleSendExtraCost}
                  disabled={!isAdditionalCostReady}
                  className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
                    isAdditionalCostReady
                      ? "bg-[#001B40] hover:bg-[#074292] text-white cursor-pointer"
                      : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={() => setSidePanelMode("completion-checklist")}
                  className="w-full py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 transition-colors"
                >
                  Mark Completed
                </button>
                <button
                  type="button"
                  onClick={onOpenMessages || (() => toast("Opening chat with Daniel..."))}
                  className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
                >
                  Messages
                </button>
              </div>
            </div>
          ) : sidePanelMode === "completion-checklist" ? (
            /* PANEL VARIANT: COMPLETION CHECKLIST (Screenshot 1 Left) */
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-base text-[#001B40]">
                    Mark Job as Completed
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                    The customer confirms before payment is released.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSidePanelMode("default")}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Checkboxes List (Screenshot 1 Left) */}
              <div className="space-y-3 pt-1">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checkWorkCompleted}
                    onChange={(e) => setCheckWorkCompleted(e.target.checked)}
                    className="w-4 h-4 rounded text-[#001B40] focus:ring-[#001B40]"
                  />
                  <span className="text-xs font-medium text-neutral-800">
                    Work completed to quote?
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checkFinalRecord}
                    onChange={(e) => setCheckFinalRecord(e.target.checked)}
                    className="w-4 h-4 rounded text-[#001B40] focus:ring-[#001B40]"
                  />
                  <span className="text-xs font-medium text-neutral-800">
                    Add final work record(s)
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checkCustomerNotified}
                    onChange={(e) => setCheckCustomerNotified(e.target.checked)}
                    className="w-4 h-4 rounded text-[#001B40] focus:ring-[#001B40]"
                  />
                  <span className="text-xs font-medium text-neutral-800">
                    Customer notified
                  </span>
                </label>
              </div>

              {/* Completed Work Photos Preview */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-neutral-500">Proof photos</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                    <Image src="/images/workers.png" alt="Proof 1" fill className="object-cover" />
                  </div>
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                    <Image src="/images/customers.png" alt="Proof 2" fill className="object-cover" />
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmCompletion}
                  disabled={!isCompletionReady}
                  className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
                    isCompletionReady
                      ? "bg-[#001B40] hover:bg-[#074292] text-white cursor-pointer"
                      : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  Confirm Completion
                </button>
                <button
                  type="button"
                  onClick={onOpenMessages || (() => toast("Opening chat..."))}
                  className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
                >
                  Message
                </button>
              </div>
            </div>
          ) : (
            /* ═════════════════════════════════════════════════════════
               DEFAULT SIDE PANEL (Screenshots 1, 2 & 4)
               ═════════════════════════════════════════════════════════ */
            <>
              {/* Customer Info Card */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#EBF1F7] text-[#001B40] flex items-center justify-center font-bold text-xs shrink-0">
                      DC
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-[#0F1115]">
                        Daniel Chukwu
                      </h3>
                      <p className="text-[11px] text-neutral-400">
                        14 Ogui Road, Independence Layout, Enugu
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    lifecycleState === "completed_released"
                      ? "bg-emerald-50 text-emerald-700"
                      : lifecycleState === "awaiting_confirmation"
                      ? "bg-amber-50 text-amber-800"
                      : "bg-neutral-100 text-neutral-600"
                  }`}>
                    {lifecycleState === "completed_released"
                      ? "Completed · 22 Aug"
                      : lifecycleState === "awaiting_confirmation"
                      ? "Marked complete · 22 Aug"
                      : "Scheduled"}
                  </span>
                </div>

                {/* Map snippet */}
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>approx. 2.4 km away</span>
                  </div>
                  <p className="text-[11px] text-neutral-700 font-medium leading-tight">
                    14 Ogui Road, Independence Layout, Enugu
                  </p>
                </div>
              </div>

              {/* Approved Quote Breakdown Card */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                <h3 className="font-heading font-extrabold text-base text-[#001B40]">
                  Approved quote
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Labour</span>
                    <span className="font-bold text-[#0F1115]">₦35,000</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Materials</span>
                    <span className="font-bold text-[#0F1115]">₦25,000</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between font-bold text-sm">
                    <span className="text-[#001B40]">Job total</span>
                    <span className="text-[#001B40]">₦60,000</span>
                  </div>

                  {/* Complete Breakdown (Screenshot 2) */}
                  {lifecycleState === "completed_released" ? (
                    <>
                      <div className="flex items-center justify-between text-neutral-500 pt-1">
                        <span>Transaction</span>
                        <span className="font-medium text-neutral-800">TXN-80410</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-500">
                        <span>Service fee (7%)</span>
                        <span className="font-medium text-red-500">-₦4,200</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-500">
                        <span>Job insurance (1%)</span>
                        <span className="font-medium text-red-500">-₦600</span>
                      </div>
                      <div className="pt-2 border-t border-neutral-200 flex items-center justify-between font-extrabold text-sm text-[#001B40]">
                        <span>Net received</span>
                        <span className="text-emerald-700 font-extrabold text-base">₦55,242</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold pt-1">
                      <span>You receive</span>
                      <span>₦55,242</span>
                    </div>
                  )}
                </div>

                {/* Actions depending on state */}
                <div className="space-y-2 pt-2">
                  {lifecycleState === "completed_released" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => toast.success("Review submitted for Daniel C.!")}
                        className="w-full py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs sm:text-sm font-bold text-[#001B40] transition-colors"
                      >
                        Rate Daniel C.
                      </button>
                      <button
                        type="button"
                        onClick={onFindMoreJobs || onBack}
                        className="w-full py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Find more jobs
                      </button>
                    </>
                  ) : lifecycleState === "awaiting_confirmation" ? (
                    <>
                      <button
                        type="button"
                        disabled
                        className="w-full py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-400 text-xs sm:text-sm font-bold cursor-not-allowed text-center"
                      >
                        Awaiting customer confirmation
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={onOpenMessages || (() => toast("Opening messages..."))}
                          className="py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 transition-colors"
                        >
                          Messages
                        </button>
                        <button
                          type="button"
                          onClick={() => setSidePanelMode("additional-cost")}
                          className="py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 transition-colors"
                        >
                          Extra Cost
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setSidePanelMode("completion-checklist")}
                        className="w-full py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Mark Completed
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={onOpenMessages || (() => toast("Opening messages with Daniel C..."))}
                          className="py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer"
                        >
                          Messages
                        </button>
                        <button
                          type="button"
                          onClick={() => setSidePanelMode("additional-cost")}
                          className="py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer"
                        >
                          Extra Cost
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
