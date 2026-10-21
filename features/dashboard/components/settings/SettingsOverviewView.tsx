"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";

interface SettingsOverviewViewProps {
  onNavigate: (tab: "personal-details" | "pin" | "notifications" | "language") => void;
  userData: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    avatarUrl?: string;
  };
}

export function SettingsOverviewView({
  onNavigate,
  userData,
}: SettingsOverviewViewProps) {
  const { walletBalance, resetAuth } = useAuth();
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>My account</span>
        </Link>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Settings
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
          Manage your profile, preferences and account security.
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 border-2 border-neutral-100 bg-[#001B40] text-white flex items-center justify-center font-bold text-xl">
            {userData.avatarUrl ? (
              <Image
                src={userData.avatarUrl}
                alt={userData.fullName}
                fill
                className="object-cover"
              />
            ) : (
              <span>{userData.fullName.charAt(0)}</span>
            )}
          </div>

          <div>
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#001B40]">
              {userData.fullName}
            </h2>
            <p className="text-xs text-neutral-500 font-medium">
              {userData.location}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {userData.phone} · {userData.email}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("personal-details")}
          className="self-start sm:self-center px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
        >
          Edit profile
        </button>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Account & Support */}
        <div className="lg:col-span-7 space-y-6">
          {/* Account Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Account
            </h3>

            <div className="divide-y divide-neutral-100 text-xs sm:text-sm">
              {/* Row 1: Personal details */}
              <button
                type="button"
                onClick={() => onNavigate("personal-details")}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/60 rounded-xl px-2 transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-bold text-[#001B40] block">
                    Personal details
                  </span>
                  <span className="text-xs text-neutral-400">
                    {userData.phone}
                  </span>
                </div>
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Row 2: Security & transaction PIN */}
              <button
                type="button"
                onClick={() => onNavigate("pin")}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/60 rounded-xl px-2 transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-bold text-[#001B40] block">
                    Security &amp; transaction PIN
                  </span>
                  <span className="text-xs text-neutral-400">
                    PIN, login and recovery
                  </span>
                </div>
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Row 3: Notifications */}
              <button
                type="button"
                onClick={() => onNavigate("notifications")}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/60 rounded-xl px-2 transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-bold text-[#001B40] block">
                    Notifications
                  </span>
                  <span className="text-xs text-neutral-400">
                    Push, email and SMS
                  </span>
                </div>
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Row 4: Language */}
              <button
                type="button"
                onClick={() => onNavigate("language")}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/60 rounded-xl px-2 transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-bold text-[#001B40] block">
                    Language
                  </span>
                  <span className="text-xs text-neutral-400">
                    English (Nigeria)
                  </span>
                </div>
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Support
            </h3>

            <div className="divide-y divide-neutral-100 text-xs sm:text-sm">
              {/* Row 1: Safety & support */}
              <button
                type="button"
                onClick={() => setIsSafetyModalOpen(true)}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/60 rounded-xl px-2 transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-bold text-[#001B40] block">
                    Safety &amp; support
                  </span>
                  <span className="text-xs text-neutral-400">
                    Emergency help and Bluefixx support
                  </span>
                </div>
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Row 2: Report a problem */}
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/60 rounded-xl px-2 transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-bold text-[#001B40] block">
                    Report a problem
                  </span>
                  <span className="text-xs text-neutral-400">
                    Get help with a payment or an unfinished job
                  </span>
                </div>
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Wallet Card, Referral & Account Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Bluefixx Wallet Card (Navy) */}
          <div className="bg-[#001B40] text-white rounded-3xl p-6 shadow-xs space-y-4">
            <span className="text-xs text-blue-200/80 uppercase font-bold tracking-wider">
              Bluefixx Wallet
            </span>
            <div className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
              ₦{(walletBalance || 85000).toLocaleString()}
            </div>
            <Link
              href="/wallet"
              className="block w-full py-3 bg-white hover:bg-neutral-100 text-[#001B40] font-bold text-xs sm:text-sm text-center rounded-xl transition-colors shadow-sm"
            >
              Open wallet
            </Link>
          </div>

          {/* Referral Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Referral
            </h3>

            <button
              type="button"
              onClick={() => setIsReferralModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-neutral-50 border border-neutral-100 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 12 20 22 4 22 4 12" />
                    <rect x="2" y="7" width="20" height="5" />
                    <line x1="12" y1="22" x2="12" y2="7" />
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm text-[#001B40] block">
                    Invite &amp; earn
                  </span>
                  <span className="text-[11px] text-neutral-400 block">
                    ₦5,000 voucher per friend
                  </span>
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Account Actions Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#001B40]">
              Account actions
            </h3>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  toast.success("Logged out successfully");
                  resetAuth();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-neutral-50 text-neutral-700 transition-colors text-left cursor-pointer border border-neutral-100"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span className="font-semibold text-xs sm:text-sm">Log out</span>
                </div>
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full text-left px-3 pt-2 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
              >
                Delete Bluefixx account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: SAFETY & SUPPORT                                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isSafetyModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-heading font-bold text-base text-[#001B40]">
                Safety &amp; Support
              </h3>
              <button
                type="button"
                onClick={() => setIsSafetyModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Bluefixx 24/7 Safety Desk is on standby for emergency support and dispute resolution.
            </p>

            <div className="space-y-2">
              <a
                href="tel:112"
                className="w-full p-3 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/60 flex items-center gap-3 transition-colors cursor-pointer block"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-xs text-rose-600 block">Call Nigeria Police (112)</span>
                  <span className="text-[10px] text-rose-500">National emergency line</span>
                </div>
              </a>

              <Link
                href="/messages?conversation=support"
                onClick={() => setIsSafetyModalOpen(false)}
                className="w-full p-3 rounded-2xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/60 flex items-center gap-3 transition-colors cursor-pointer block"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#001B40] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-xs text-[#001B40] block">Message Bluefixx Support</span>
                  <span className="text-[10px] text-blue-600">Typically responds within 2 minutes</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: REPORT A PROBLEM                                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-heading font-bold text-base text-[#001B40]">
                Report a Problem
              </h3>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Select the active booking or transaction you need resolution assistance for.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50">
                <span className="font-bold text-xs text-[#001B40] block">
                  Booking BFX-20481 · Bathroom Plumbing Repair
                </span>
                <span className="text-[11px] text-neutral-500">
                  Emeka Okafor · ₦120,000 held in Escrow
                </span>
              </div>

              <textarea
                rows={3}
                placeholder="Describe what went wrong with the repair or artisan..."
                className="w-full p-3 rounded-xl border border-neutral-200 text-xs focus:outline-hidden focus:border-[#001B40]"
              />

              <button
                type="button"
                onClick={() => {
                  setIsReportModalOpen(false);
                  toast.success("Problem reported. Case #PR-9241 created.");
                }}
                className="w-full py-3 bg-[#001B40] hover:bg-[#074292] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: REFERRAL                                                */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isReferralModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect x="2" y="7" width="20" height="5" />
                <line x1="12" y1="22" x2="12" y2="7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-[#001B40]">
                Invite Friends &amp; Earn ₦5,000
              </h3>
              <p className="text-xs text-neutral-500">
                Share your unique code. When your friend completes their first repair, you both receive ₦5,000 in wallet credit.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-100 font-mono font-bold text-sm tracking-wider text-[#001B40] flex items-center justify-between">
              <span>DANIELEZE-BFX</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("DANIELEZE-BFX");
                  toast.success("Referral code copied!");
                }}
                className="text-xs font-sans text-blue-700 hover:underline cursor-pointer"
              >
                Copy
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsReferralModalOpen(false)}
              className="w-full py-2.5 bg-[#001B40] hover:bg-[#074292] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: DELETE ACCOUNT CONFIRMATION                             */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-heading font-bold text-base text-rose-600">
              Delete Bluefixx Account
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Are you sure you want to delete your account? This action cannot be undone. All active escrow balances and warranty protections will be forfeited.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  toast.error("Account deletion requested. Support will contact you.");
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
