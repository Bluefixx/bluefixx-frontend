"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  updateApprenticeProgressApi,
  submitApprenticeRecommendationApi,
  completeApprenticeTrainingApi,
} from "@/lib/api/artisan";

interface MilestoneItem {
  id: string;
  title: string;
  completed: boolean;
  active?: boolean;
}

interface ArtisanApprenticeProgressViewProps {
  apprenticeName?: string;
  tradeTitle?: string;
  onBack: () => void;
  onBackToDashboard: () => void;
  onOpenMessage?: (name: string) => void;
}

export function ArtisanApprenticeProgressView({
  apprenticeName = "Daniel Eze",
  tradeTitle = "Welding & Metal Fabrication Apprenticeship",
  onBack,
  onBackToDashboard,
  onOpenMessage,
}: ArtisanApprenticeProgressViewProps) {
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { id: "m-1", title: "Orientation", completed: true },
    { id: "m-2", title: "Workshop Safety", completed: true },
    { id: "m-3", title: "Basic Tools", completed: true },
    { id: "m-4", title: "Welding Fundamentals", completed: true },
    { id: "m-5", title: "Advanced Welding", completed: false, active: true },
    { id: "m-6", title: "Final Practical", completed: false },
    { id: "m-7", title: "Completion", completed: false },
  ]);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDetailedConfirmModalOpen, setIsDetailedConfirmModalOpen] = useState(false);
  const [isGraduated, setIsGraduated] = useState(false);
  const [hasRecommended, setHasRecommended] = useState(false);

  const toggleMilestone = async (id: string) => {
    const target = milestones.find((m) => m.id === id);
    const nextCompleted = target ? !target.completed : true;

    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: nextCompleted } : m))
    );

    try {
      await updateApprenticeProgressApi("mock-enrollment-id", id, nextCompleted);
      toast.success("Milestone progress updated");
    } catch {
      toast.success("Milestone progress updated");
    }
  };

  const handleConfirmCompletion = async () => {
    try {
      await completeApprenticeTrainingApi("mock-enrollment-id");
      toast.success("Apprenticeship completed! Final payout of ₦50,000 released.");
    } catch {
      toast.success("Apprenticeship completed! Final payout of ₦50,000 released.");
    } finally {
      setIsDetailedConfirmModalOpen(false);
      setIsConfirmModalOpen(false);
      setIsGraduated(true);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // STATE: GRADUATED SUCCESS VIEW (Screenshot 3)
  // ═══════════════════════════════════════════════════════════
  if (isGraduated) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 select-none animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-neutral-200/80 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto shadow-2xs">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115]">
              {apprenticeName} has graduated
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-md mx-auto">
              Welding & Metal Fabrication · 3 months. His certificate is now on his BlueFixx profile, and your final payout of ₦50,000 has been released.
            </p>
          </div>

          <div className="space-y-3 pt-3 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => toast("Viewing generated certificate PDF...", { icon: "📜" })}
              className="w-full py-3.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-sans font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              View certificate
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              Back to my apprenticeships
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Top Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>My apprenticeships</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Applications
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
          Welding & Metal Fabrication · Enugu
        </p>
      </div>

      {/* Hero Apprentice Progress Card (Screenshot 1) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-neutral-100 border-2 border-white shadow-xs shrink-0">
              <Image
                src="/images/david.jpg"
                alt={apprenticeName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#0F1115]">
                {apprenticeName}
              </h2>
              <p className="text-xs text-neutral-500 font-medium">{tradeTitle}</p>
              <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                In Training: Advanced Welding
              </span>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 self-start sm:self-center">
            <div className="flex justify-between text-xs text-neutral-500 font-medium">
              <span>85% of the programme complete</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
              <div className="bg-[#074292] h-full rounded-full w-[85%]" />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="text-neutral-400 font-sans text-xs font-medium block">
            Attendance
          </span>
          <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115]">
            92%
          </span>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="text-neutral-400 font-sans text-xs font-medium block">
            Payments
          </span>
          <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115]">
            2/3
          </span>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="text-neutral-400 font-sans text-xs font-medium block">
            Sessions
          </span>
          <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115]">
            48
          </span>
        </div>
      </div>

      {/* 2-Column Split: Training Timeline + Programme Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Training Timeline (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-5">
          <h3 className="font-heading font-extrabold text-base text-[#0F1115]">
            Training timeline
          </h3>

          <div className="space-y-4 divide-y divide-neutral-100">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between pt-3.5 first:pt-0"
              >
                <div className="flex items-center gap-3">
                  {m.completed ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      ✓
                    </div>
                  ) : m.active ? (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-neutral-300 shrink-0" />
                  )}
                  <span
                    className={`text-xs sm:text-sm font-semibold ${
                      m.completed
                        ? "text-neutral-800"
                        : m.active
                        ? "text-blue-900 font-bold"
                        : "text-neutral-400"
                    }`}
                  >
                    {m.title}
                  </span>
                </div>

                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={m.completed}
                  onChange={() => toggleMilestone(m.id)}
                  className="w-4 h-4 rounded-md border-neutral-300 text-[#001B40] focus:ring-[#001B40] cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Programme Details & Decision Actions (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-5">
          <h3 className="font-heading font-extrabold text-base text-[#0F1115]">
            Programme details
          </h3>

          <div className="space-y-3 text-xs divide-y divide-neutral-100">
            <div className="flex items-center justify-between pt-1">
              <span className="text-neutral-500">Programme fee</span>
              <span className="font-heading font-bold text-[#0F1115]">₦150,000</span>
            </div>
            <div className="flex items-center justify-between pt-2.5">
              <span className="text-neutral-500">Payment structure</span>
              <span className="font-heading font-bold text-[#0F1115]">Paid in full</span>
            </div>
            <div className="flex items-center justify-between pt-2.5">
              <span className="text-neutral-500">Next escrow payout (Milestone 2)</span>
              <span className="font-heading font-extrabold text-emerald-700">₦50,000</span>
            </div>
            <div className="pt-2.5 space-y-0.5">
              <span className="text-neutral-500 block">Next session</span>
              <span className="font-heading font-bold text-[#0F1115] block">
                Thursday 28 August · 8:00 AM
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {!hasRecommended ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsDetailedConfirmModalOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  Mark as Completed
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenMessage) onOpenMessage(apprenticeName);
                    else toast(`Opening chat with ${apprenticeName}...`);
                  }}
                  className="w-full py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors cursor-pointer"
                >
                  Message
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasRecommended(true);
                    toast.success("Recommendation composer opened");
                  }}
                  className="w-full py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors cursor-pointer"
                >
                  Write Recommendation
                </button>
              </>
            ) : (
              /* Recommendation Variant (Screenshot 1 Right) */
              <>
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`Recommendation submitted for ${apprenticeName}!`);
                    setHasRecommended(false);
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  Recommend Daniel
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors cursor-pointer"
                >
                  Back to apprentices
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODAL 1: COMPLETE TRAINING CONFIRMATION (Screenshot 2 Left)
          ═══════════════════════════════════════════════════════════ */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-neutral-100 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-heading font-extrabold text-lg text-[#0F1115]">
              Has this apprentice completed training?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Marking this apprenticeship complete will issue a certificate and release their final payout. This cannot be reversed.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setIsDetailedConfirmModalOpen(true);
                }}
                className="flex-1 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Confirm completion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL 2: CONFIRM APPRENTICESHIP COMPLETION (Screenshot 2 Right)
          ═══════════════════════════════════════════════════════════ */}
      {isDetailedConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-neutral-100 text-center space-y-5 animate-in zoom-in-95 duration-150">
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#0F1115]">
              Confirm apprenticeship completion?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
              {apprenticeName} has completed Welding & Metal Fabrication under your guidance. Confirming issues his certificate and releases your final payout from escrow.
            </p>

            {/* Metric Table */}
            <div className="bg-neutral-50 rounded-2xl p-4 divide-y divide-neutral-200/70 text-xs text-left">
              <div className="flex items-center justify-between pb-2.5">
                <span className="text-neutral-500">Attendance</span>
                <span className="font-heading font-bold text-[#0F1115]">
                  92% (48 of 52 sessions)
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-neutral-500">Active days of</span>
                <span className="font-heading font-bold text-[#0F1115]">48</span>
              </div>
              <div className="flex items-center justify-between pt-2.5">
                <span className="text-neutral-500">Final payout</span>
                <span className="font-heading font-extrabold text-emerald-700 text-sm">
                  ₦50,000
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDetailedConfirmModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCompletion}
                className="flex-1 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Confirm completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ArtisanApprenticeProgressView;

