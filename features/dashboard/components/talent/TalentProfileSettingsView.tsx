"use client";

import React from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";

interface TalentProfileSettingsViewProps {
  onEditProfile: () => void;
  onOpenPin: () => void;
  onOpenNotifications?: () => void;
  onOpenCertifications?: () => void;
  onOpenWallet?: () => void;
  onOpenSafetySupport?: () => void;
  onOpenReportProblem?: () => void;
  onOpenReferrals?: () => void;
}

export function TalentProfileSettingsView({
  onEditProfile,
  onOpenPin,
  onOpenNotifications,
  onOpenCertifications,
  onOpenWallet,
  onOpenSafetySupport,
  onOpenReportProblem,
  onOpenReferrals,
}: TalentProfileSettingsViewProps) {
  const { user, logout } = useAuth();
  const userName = user?.fullName || "Daniel Eze";

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          Profile
        </h1>
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-neutral-100 border-2 border-white shadow-xs shrink-0">
            <Image
              src="/images/david.jpg"
              alt={userName}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#0F1115]">
              {userName}
            </h2>
            <p className="font-sans text-xs text-neutral-400 font-medium">
              Enugu, Nigeria
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEditProfile}
          className="px-6 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer self-start sm:self-center"
        >
          Edit
        </button>
      </div>

      {/* 2-Column Settings Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Column 1: Account */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-xs uppercase text-neutral-400 tracking-wider">
            Account
          </h3>

          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
            {/* Personal details */}
            <div
              onClick={onEditProfile}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div>
                <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                  Personal details
                </p>
                <p className="font-sans text-xs text-neutral-400">
                  +234 810 142 7789
                </p>
              </div>
              <span className="text-neutral-400 text-sm">›</span>
            </div>

            {/* Security & transaction PIN */}
            <div
              onClick={onOpenPin}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div>
                <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                  Security & transaction PIN
                </p>
                <p className="font-sans text-xs text-neutral-400">
                  PIN, Login and security
                </p>
              </div>
              <span className="text-neutral-400 text-sm">›</span>
            </div>

            {/* Notifications */}
            <div
              onClick={onOpenNotifications || (() => toast("Notifications settings"))}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div>
                <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                  Notifications
                </p>
                <p className="font-sans text-xs text-neutral-400">
                  Push, email and SMS
                </p>
              </div>
              <span className="text-neutral-400 text-sm">›</span>
            </div>

            {/* Language */}
            <div
              onClick={() => toast("Language: English (Nigeria)")}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div>
                <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                  Language
                </p>
                <p className="font-sans text-xs text-neutral-400">
                  English (Nigeria)
                </p>
              </div>
              <span className="text-neutral-400 text-sm">›</span>
            </div>

            {/* Certifications */}
            <div
              onClick={onOpenCertifications || (() => toast("Certifications view"))}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div>
                <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                  Certifications
                </p>
                <p className="font-sans text-xs text-neutral-400">
                  Verified Apprenticeship
                </p>
              </div>
              <span className="text-neutral-400 text-sm">›</span>
            </div>

            {/* Invite & Earn */}
            {onOpenReferrals && (
              <div
                onClick={onOpenReferrals}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                    Invite & earn
                  </p>
                  <p className="font-sans text-xs text-neutral-400">
                    Earn ₦3,000 per referral
                  </p>
                </div>
                <span className="text-neutral-400 text-sm">›</span>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Payments & Support */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-xs uppercase text-neutral-400 tracking-wider">
            Payments & Support
          </h3>

          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
            {/* Bluefixx Wallet */}
            <div
              onClick={onOpenWallet || (() => toast("Opening Bluefixx Wallet..."))}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div>
                <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                  Bluefixx Wallet
                </p>
                <p className="font-sans text-xs text-neutral-400">
                  Balance: <span className="font-semibold text-neutral-700">₦185,500</span>
                </p>
              </div>
              <span className="text-neutral-400 text-sm">›</span>
            </div>

            {/* Safety & support */}
            <div
              onClick={onOpenSafetySupport || (() => toast("Safety Center"))}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div>
                <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                  Safety & support
                </p>
                <p className="font-sans text-xs text-neutral-400">
                  24/7 hotline and emergency dialer
                </p>
              </div>
              <span className="text-neutral-400 text-sm">›</span>
            </div>

            {/* Report a problem */}
            <div
              onClick={onOpenReportProblem || (() => toast("Report a problem"))}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div>
                <p className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
                  Report a problem
                </p>
                <p className="font-sans text-xs text-neutral-400">
                  Escalate dispute or safety concern
                </p>
              </div>
              <span className="text-neutral-400 text-sm">›</span>
            </div>

            {/* Log out */}
            <div
              onClick={() => {
                logout();
                toast.success("Logged out successfully");
              }}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <p className="font-sans font-bold text-xs sm:text-sm text-neutral-800">
                Log out
              </p>
              <span className="text-neutral-400 text-sm">›</span>
            </div>

            {/* Delete account */}
            <div
              onClick={() => toast.error("Please contact support to delete your account")}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-rose-50/50 transition-colors cursor-pointer"
            >
              <div>
                <p className="font-sans font-bold text-xs sm:text-sm text-rose-600">
                  Delete account
                </p>
                <p className="font-sans text-xs text-neutral-400">
                  Permanently remove your data, profile, and certifications
                </p>
              </div>
              <span className="text-rose-400 text-sm">›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
