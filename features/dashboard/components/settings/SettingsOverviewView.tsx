"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import { useTranslations } from "@/components/shared/LanguageProvider";
import { getWalletApi } from "@/lib/api/wallet";

interface SettingsOverviewViewProps {
  onNavigate: (tab: "personal-details" | "pin" | "notifications" | "language" | "support" | "report-problem" | "referral") => void;
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
  const { walletBalance, setWalletBalance, resetAuth } = useAuth();
  const t = useTranslations("settings.overview");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    getWalletApi()
      .then((data) => {
        if (!mounted || !data) return;
        const rawAvail = (data as any).availableBalanceKobo ?? data.available;
        if (rawAvail !== undefined && rawAvail !== null) {
          const kobo = typeof rawAvail === "string" ? parseInt(rawAvail, 10) : rawAvail;
          if (!isNaN(kobo)) {
            setWalletBalance(Math.round(kobo / 100));
          }
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [setWalletBalance]);

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
          <span>{t("myAccount")}</span>
        </Link>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          {t("title")}
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
          {t("subtitle")}
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
                    {t("personalDetails")}
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
                    {t("securityAndPin")}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {t("securityAndPinSub")}
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
                    {t("notifications")}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {t("notificationsSub")}
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
                    {t("language")}
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
              {t("supportTitle")}
            </h3>

            <div className="divide-y divide-neutral-100 text-xs sm:text-sm">
              {/* Row 1: Safety & support */}
              <button
                type="button"
                onClick={() => onNavigate("support")}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/60 rounded-xl px-2 transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-bold text-[#001B40] block">
                    {t("safetyAndSupport")}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {t("safetyAndSupportSub")}
                  </span>
                </div>
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Row 2: Report a problem */}
              <button
                type="button"
                onClick={() => onNavigate("report-problem")}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/60 rounded-xl px-2 transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-bold text-[#001B40] block">
                    {t("reportProblem")}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {t("reportProblemSub")}
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
              ₦{(walletBalance ?? 0).toLocaleString()}
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
              {t("inviteAndEarn")}
            </h3>

            <button
              type="button"
              onClick={() => onNavigate("referral")}
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
                    {t("inviteAndEarn")}
                  </span>
                  <span className="text-[11px] text-neutral-400 block">
                    {t("inviteSub")}
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
                onClick={() => setIsLogoutModalOpen(true)}
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
      {/* MODAL: LOG OUT DIALOG (Screenshot 1 Right)                     */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-heading font-bold text-base text-[#001B40]">
              Log out of Bluefixx?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              You will need your phone number and OTP to sign back in. Active jobs continue on round.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  toast.success("Logged out successfully");
                  resetAuth();
                }}
                className="flex-1 py-3 bg-[#001B40] hover:bg-[#074292] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Log out
              </button>
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: DELETE ACCOUNT DIALOG (Screenshot 2)                    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-heading font-bold text-base text-[#001B40]">
              Delete Bluefixx account?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              You will need your phone number and OTP to sign back in. Active jobs continue on round.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  toast.error("Account deletion requested. Support will contact you.");
                }}
                className="flex-1 py-3 bg-[#DC2626] hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
