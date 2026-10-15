"use client";

import React from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";

interface ApprenticeHomeViewProps {
  onSwitchToCustomer: () => void;
  onOpenRoleSwitcher: () => void;
}

export default function ApprenticeHomeView({
  onSwitchToCustomer,
  onOpenRoleSwitcher,
}: ApprenticeHomeViewProps) {
  const {
    user,
    apprenticeTrainingCompleted,
    setApprenticeTrainingCompleted,
  } = useAuth();

  const handleToggleGraduation = () => {
    const next = !apprenticeTrainingCompleted;
    setApprenticeTrainingCompleted(next);
    if (next) {
      toast.success(
        "🎉 Congratulations! You have completed your apprenticeship training. The Artisan switch is now unlocked!"
      );
    } else {
      toast("Apprenticeship set back to in-progress.", { icon: "ℹ️" });
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-xs sm:text-sm text-neutral-500 font-medium flex items-center gap-1.5">
            Apprenticeship Academy <span className="text-base">🎓</span>
          </span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] mt-1 tracking-tight">
            Keep learning, {user?.fullName || "Apprentice"}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onSwitchToCustomer}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 font-sans font-semibold text-xs sm:text-sm text-neutral-800 transition-colors cursor-pointer w-fit"
          >
            <span>Switch to Customer</span>
          </button>
          <button
            onClick={onOpenRoleSwitcher}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] font-sans font-semibold text-xs sm:text-sm text-white transition-colors cursor-pointer w-fit"
          >
            <span>Switch role</span>
          </button>
        </div>
      </div>

      {/* Program Status Card */}
      <div className="bg-[#001B40] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold text-blue-200 tracking-wider uppercase">
              CURRENT PROGRAM
            </span>
            <h3 className="font-heading font-bold text-xl sm:text-2xl mt-1 text-white">
              Plumbing & Mechanical Systems Apprenticeship
            </h3>
            <p className="font-sans text-xs sm:text-sm text-blue-100/80 mt-1">
              Mentored by <span className="font-semibold text-white">Master Artisan Michael Obi</span>
            </p>
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-blue-200">Overall Progress</span>
            <span className="font-heading font-bold text-2xl text-white">
              {apprenticeTrainingCompleted ? "100%" : "68%"}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-blue-900/60 rounded-full h-3 overflow-hidden p-0.5 mb-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              apprenticeTrainingCompleted ? "bg-emerald-400 w-full" : "bg-blue-400 w-[68%]"
            }`}
          />
        </div>

        {/* Training Simulation Controller */}
        <div className="pt-3 border-t border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-100">
          <span>
            {apprenticeTrainingCompleted
              ? "✓ Training program completed! You are certified and eligible for Artisan status."
              : "Rule: You can switch to a Customer account anytime. Artisan switch unlocks once training completes."}
          </span>
          <button
            onClick={handleToggleGraduation}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 ${
              apprenticeTrainingCompleted
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-white text-[#001B40] hover:bg-neutral-100"
            }`}
          >
            {apprenticeTrainingCompleted ? "Revoke Graduation (Demo)" : "Simulate Graduation (Demo)"}
          </button>
        </div>
      </div>

      {/* Curriculum & Logged Hours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs">
          <p className="text-xs text-neutral-500 font-medium">Logged Practical Hours</p>
          <p className="font-heading font-bold text-2xl text-[#001B40] mt-1">320 / 480 hrs</p>
          <span className="text-[11px] text-blue-600 font-medium mt-1 inline-block">
            40 hrs logged this month
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs">
          <p className="text-xs text-neutral-500 font-medium">Competency Assessments</p>
          <p className="font-heading font-bold text-2xl text-[#001B40] mt-1">8 of 10 Passed</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">
            Next assessment on Thursday
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-2xs">
          <p className="text-xs text-neutral-500 font-medium">Master Artisan Rating</p>
          <p className="font-heading font-bold text-2xl text-[#001B40] mt-1">Exceptional (9.4/10)</p>
          <span className="text-[11px] text-neutral-400 mt-1 inline-block">
            Recommended for early certification
          </span>
        </div>
      </div>
    </div>
  );
}
