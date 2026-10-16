"use client";

import React from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";

interface UserRoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserRoleSwitcherModal({
  isOpen,
  onClose,
}: UserRoleSwitcherModalProps) {
  const router = useRouter();
  const {
    activeRole,
    setActiveRole,
    apprenticeTrainingCompleted,
    setApprenticeTrainingCompleted,
  } = useAuth();

  if (!isOpen) return null;

  const handleSelectRole = (newRole: "customer" | "artisan" | "apprentice") => {
    if (newRole === activeRole) {
      onClose();
      return;
    }

    // Rule: Apprentice cannot switch to Artisan unless training is completed
    if (activeRole === "apprentice" && newRole === "artisan" && !apprenticeTrainingCompleted) {
      toast.error(
        "Artisan switch is locked. Apprentices must complete their training before upgrading to an Artisan account."
      );
      return;
    }

    setActiveRole(newRole);
    toast.success(
      `Switched to ${
        newRole === "customer"
          ? "Customer"
          : newRole === "artisan"
          ? "Artisan"
          : "Apprentice"
      } profile`
    );
    onClose();

    if (newRole === "artisan") {
      router.push("/artisan");
    } else {
      router.push("/dashboard");
    }
  };

  const handleToggleGraduation = () => {
    const nextState = !apprenticeTrainingCompleted;
    setApprenticeTrainingCompleted(nextState);
    if (nextState) {
      toast.success("Apprenticeship marked completed! Artisan switch unlocked.");
    } else {
      toast("Apprenticeship marked in-progress.", { icon: "ℹ️" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-neutral-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
              SWITCH ACCOUNT VIEW
            </span>
            <h3 className="font-sans font-bold text-xl text-[#0F1115] mt-0.5">
              Choose your profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-neutral-500 mt-3 mb-4">
          One account gives you seamless access to hire, work, or train on BlueFixx.
        </p>

        {/* Roles List */}
        <div className="space-y-3">
          {/* 1. Customer Option */}
          <div
            onClick={() => handleSelectRole("customer")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              activeRole === "customer"
                ? "border-[#001B40] bg-blue-50/50 ring-1 ring-[#001B40]"
                : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activeRole === "customer" ? "bg-[#001B40] text-white" : "bg-neutral-100 text-neutral-600"
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-sm text-[#0F1115]">Customer</span>
                  {activeRole === "customer" && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded uppercase">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Book verified artisans and protect your payments
                </p>
              </div>
            </div>
            {activeRole === "customer" && (
              <svg className="w-5 h-5 text-[#001B40] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>

          {/* 2. Artisan Option */}
          {(() => {
            const isLockedForApprentice =
              activeRole === "apprentice" && !apprenticeTrainingCompleted;

            return (
              <div
                onClick={() => {
                  if (isLockedForApprentice) {
                    toast.error(
                      "Locked: Apprentices must complete training before switching to an Artisan profile."
                    );
                  } else {
                    handleSelectRole("artisan");
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isLockedForApprentice
                    ? "border-neutral-200 bg-neutral-50 opacity-70 cursor-not-allowed"
                    : activeRole === "artisan"
                    ? "border-[#001B40] bg-blue-50/50 ring-1 ring-[#001B40] cursor-pointer"
                    : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      activeRole === "artisan" ? "bg-[#001B40] text-white" : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-sm text-[#0F1115]">Artisan</span>
                      {activeRole === "artisan" && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded uppercase">
                          ACTIVE
                        </span>
                      )}
                      {isLockedForApprentice && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          LOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {isLockedForApprentice
                        ? "Requires completed training to activate"
                        : "Receive customer requests, send quotes, and grow"}
                    </p>
                  </div>
                </div>
                {activeRole === "artisan" && (
                  <svg className="w-5 h-5 text-[#001B40] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })()}

          {/* 3. Apprentice Option */}
          <div
            onClick={() => handleSelectRole("apprentice")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              activeRole === "apprentice"
                ? "border-[#001B40] bg-blue-50/50 ring-1 ring-[#001B40]"
                : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activeRole === "apprentice" ? "bg-[#001B40] text-white" : "bg-neutral-100 text-neutral-600"
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-sm text-[#0F1115]">Apprentice</span>
                  {activeRole === "apprentice" && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded uppercase">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Learn alongside Master Artisans & build your trade credentials
                </p>
              </div>
            </div>
            {activeRole === "apprentice" && (
              <svg className="w-5 h-5 text-[#001B40] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>

        {/* Apprentice Training State Simulator */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>Apprentice training status:</span>
          <button
            type="button"
            onClick={handleToggleGraduation}
            className={`font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
              apprenticeTrainingCompleted
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            {apprenticeTrainingCompleted ? "✓ Training Completed" : "In Progress (Click to Complete)"}
          </button>
        </div>
      </div>
    </div>
  );
}
