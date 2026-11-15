"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import {
  getAccountApi,
  getArtisanOwnProfileApi,
  getWithdrawalBeneficiariesApi,
  getNigerianBanksApi,
  getArtisanReferralsSummaryApi,
} from "@/lib/api/artisan";
import type {
  AccountResponse,
  ArtisanOwnProfileResponse,
  WithdrawalBeneficiary,
  NigerianBank,
  ReferralSummary,
} from "@/types/artisan";
import { formatNaira } from "@/lib/utils/currency";

interface ArtisanSettingsOverviewViewProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English (Nigeria)",
  pcm: "Nigerian Pidgin",
  ig: "Igbo",
  ha: "Hausa",
  yo: "Yoruba",
};

export function ArtisanSettingsOverviewView({
  onBack,
  onNavigate,
  onLogout,
}: ArtisanSettingsOverviewViewProps) {
  const { user, locationName, walletBalance } = useAuth();

  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [ownProfile, setOwnProfile] = useState<ArtisanOwnProfileResponse | null>(null);
  const [beneficiary, setBeneficiary] = useState<WithdrawalBeneficiary | null>(null);
  const [bankName, setBankName] = useState("");
  const [referral, setReferral] = useState<ReferralSummary | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [accountRes, profileRes, beneficiaries, banks, referralRes] = await Promise.all([
        getAccountApi().catch(() => null),
        getArtisanOwnProfileApi().catch(() => null),
        getWithdrawalBeneficiariesApi().catch(() => [] as WithdrawalBeneficiary[]),
        getNigerianBanksApi().catch(() => [] as NigerianBank[]),
        getArtisanReferralsSummaryApi().catch(() => null),
      ]);
      if (!mounted) return;
      if (accountRes) setAccount(accountRes);
      if (profileRes) setOwnProfile(profileRes);
      if (referralRes) setReferral(referralRes);
      const primary = Array.isArray(beneficiaries) ? beneficiaries[0] : undefined;
      if (primary) {
        setBeneficiary(primary);
        const match = Array.isArray(banks)
          ? banks.find((b) => b.code === primary.bankCode)
          : undefined;
        if (match) setBankName(match.name);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const displayName = account?.user.fullName || user?.fullName || "—";
  const displayLocation = ownProfile?.profile.area || locationName || "—";
  const displayPhone = account?.user.phone || user?.phone || "—";
  const displayWallet = formatNaira(walletBalance);
  const avatarUrl = account?.user.avatarUrl || user?.avatarUrl;
  const initial = (displayName || "?").trim().charAt(0).toUpperCase();

  const pinConfigured = Boolean(account?.settings.pinConfigured);
  const identityStatus = (ownProfile?.profile.identityStatus || "").toUpperCase();
  const isIdentityVerified =
    ownProfile?.profile.approval === "APPROVED" || /(APPROVED|VERIFIED|COMPLETE)/.test(identityStatus);
  const isIdentityPending =
    !isIdentityVerified && /(PENDING|REVIEW|SUBMITTED|PROGRESS)/.test(identityStatus);

  const verifiedTradeCount = ownProfile?.services?.length ?? 0;
  const languageLabel =
    LANGUAGE_LABELS[account?.settings.language || ""] || "English (Nigeria)";
  const payoutLabel = beneficiary
    ? `${bankName || "Bank"} •••• ${beneficiary.last4}`
    : "No payout account";
  const emergencyLabel =
    account?.settings.emergencyName && account?.settings.emergencyPhone
      ? `${account.settings.emergencyName} · ${account.settings.emergencyPhone}`
      : "Not set";
  const referralEarned = referral?.earnedTotal ? formatNaira(referral.earnedTotal, true) : "₦0";
  const supportPhone = account?.contacts.supportPhone;

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    toast.success("Logged out successfully");
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = "/auth/login";
    }
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    toast.error("Account deletion requested. Please contact support to finalize.");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Back button & Heading */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Profile</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Settings
        </h1>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden relative border-2 border-neutral-100 shrink-0 bg-[#001B40] text-white flex items-center justify-center font-heading font-extrabold text-xl">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#0F1115]">
              {displayName}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              {displayLocation}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("personal-details")}
          className="px-4 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 text-xs sm:text-sm font-semibold text-neutral-700 bg-white shadow-2xs transition-all cursor-pointer"
        >
          Edit
        </button>
      </div>

      {/* Settings Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Verification
          </h3>
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
            <button
              type="button"
              onClick={() => onNavigate("verification")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Identity verification
                </div>
                <div className="text-xs text-neutral-500 line-clamp-1">
                  {isIdentityVerified
                    ? "NIN, government ID and selfie verified"
                    : isIdentityPending
                    ? "Your documents are under review"
                    : "Complete your identity verification"}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${
                    isIdentityVerified
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : isIdentityPending
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-neutral-100 text-neutral-500 border-neutral-200"
                  }`}
                >
                  {isIdentityVerified ? "Verified" : isIdentityPending ? "In review" : "Not verified"}
                </span>
                <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("verification")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Competence verification
                </div>
                <div className="text-xs text-neutral-500 line-clamp-1">
                  {verifiedTradeCount > 0
                    ? `${verifiedTradeCount} verified ${verifiedTradeCount === 1 ? "trade" : "trades"} · View portfolio/video`
                    : "No verified trades yet"}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  {verifiedTradeCount > 0 ? `${verifiedTradeCount} verified` : "Not started"}
                </span>
                <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Account Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Account
          </h3>
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
            <button
              type="button"
              onClick={() => onNavigate("personal-details")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Personal details
                </div>
                <div className="text-xs text-neutral-500">
                  {displayPhone}
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("create-pin")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Security &amp; Transaction PIN
                </div>
                <div className="text-xs text-neutral-500">
                  {pinConfigured ? "PIN set · Login & sessions" : "Set up your transaction PIN"}
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("notifications")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Notifications
                </div>
                <div className="text-xs text-neutral-500">
                  Push, email and SMS
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("language")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Language
                </div>
                <div className="text-xs text-neutral-500">
                  {languageLabel}
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Payments Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Payments
          </h3>
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
            <button
              type="button"
              onClick={() => onNavigate("earnings")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Bluefixx Wallet
                </div>
                <div className="text-xs text-neutral-500">
                  {displayWallet}
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("withdraw")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Payout account
                </div>
                <div className="text-xs text-neutral-500">
                  {payoutLabel}
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("earnings")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Transaction history
                </div>
                <div className="text-xs text-neutral-500">
                  View past earnings & withdrawals
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Safety Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Safety
          </h3>
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
            <button
              type="button"
              onClick={() => onNavigate("safety-center")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Safety Center
                </div>
                <div className="text-xs text-neutral-500">
                  Live location, active job route & emergency support
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("safety-center")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Job insurance
                </div>
                <div className="text-xs text-neutral-500">
                  Active · Protected on all active jobs
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("personal-details")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Emergency contacts
                </div>
                <div className="text-xs text-neutral-500">
                  {emergencyLabel}
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("safety-center")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Report an incident
                </div>
                <div className="text-xs text-neutral-500">
                  Log an immediate safety hazard
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Support Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Support
          </h3>
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
            <button
              type="button"
              onClick={() => toast("Opening Help Center...")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Help center
                </div>
                <div className="text-xs text-neutral-500">
                  Browse FAQs, guides & platform rules
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() =>
                toast(supportPhone ? `Calling support at ${supportPhone}` : "Support contact unavailable")
              }
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Contact support
                </div>
                <div className="text-xs text-neutral-500">
                  {supportPhone ? `${supportPhone} · 24/7` : "Contact details unavailable"}
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("report-problem")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Report a problem
                </div>
                <div className="text-xs text-neutral-500">
                  Dispute job, customer issue or payment
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Referral Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Referral
          </h3>
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
            <button
              type="button"
              onClick={() => onNavigate("referral")}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Invite &amp; earn
                </div>
                <div className="text-xs text-neutral-500">
                  {referralEarned} earned so far
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Account Actions Section */}
        <div className="space-y-3 md:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Account Management
          </h3>
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="w-full p-4.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-[#0F1115] group-hover:text-[#001B40]">
                  Logout
                </div>
                <div className="text-xs text-neutral-500">
                  Sign out from your active session
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full p-4.5 flex items-center justify-between hover:bg-red-50/40 transition-colors text-left cursor-pointer group"
            >
              <div className="space-y-0.5 pr-2">
                <div className="text-xs sm:text-sm font-bold text-red-600 group-hover:text-red-700">
                  Delete account
                </div>
                <div className="text-xs text-neutral-500">
                  Permanently removes your jobs, reviews and certificates
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Dialog Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-neutral-100 space-y-4">
            <h3 className="text-lg sm:text-xl font-heading font-bold text-[#0F1115]">
              Log out of BlueFixx?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              You will need your phone number and OTP to log back in. Active jobs will continue as normal.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shadow-xs"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Dialog Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-neutral-100 space-y-4">
            <h3 className="text-lg sm:text-xl font-heading font-bold text-red-600">
              Delete BlueFixx account?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              This permanently removes your jobs, reviews, certificates and apprenticeship. Withdraw your {displayWallet} balance first. This cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shadow-xs"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArtisanSettingsOverviewView;

