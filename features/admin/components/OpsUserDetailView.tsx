"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatNaira } from "@/lib/utils/currency";
import { AdminUser, AdminAccountStatus } from "../types";
import {
  getAdminAccountDetailApi,
  getAdminArtisanIdentityApi,
  updateAdminAccountStatusApi,
  sendAdminAccountNotificationApi,
  createAdminAccountNoteApi,
  updateAdminAccountPayoutHoldApi,
  mapBackendAccountToAdminUser,
  BackendAdminAccountDetailResponse,
  BackendAdminIdentityEvidence,
} from "@/lib/api/admin-users";

interface OpsUserDetailViewProps {
  userId?: string;
  user?: AdminUser;
}

type UserDetailTab =
  | "overview"
  | "jobs"
  | "payments"
  | "wallet"
  | "reviews"
  | "complaints"
  | "disputes"
  | "documents"
  | "activity";

export function OpsUserDetailView({
  userId: propUserId,
  user: initialUser,
}: OpsUserDetailViewProps) {
  const targetId = propUserId || initialUser?.id || "";

  const [user, setUser] = useState<AdminUser | null>(initialUser || null);
  const [accountDetail, setAccountDetail] =
    useState<BackendAdminAccountDetailResponse | null>(null);
  const [identityEvidence, setIdentityEvidence] =
    useState<BackendAdminIdentityEvidence | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<UserDetailTab>("overview");

  // Suspend modal state
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendCategory, setSuspendCategory] = useState("Code of Conduct violation");
  const [suspendReason, setSuspendReason] = useState("");
  const [isSubmittingSuspend, setIsSubmittingSuspend] = useState(false);

  // Contact modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // New admin note state
  const [newNoteText, setNewNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Fetch full account detail from backend
  const fetchAccountDetail = useCallback(async () => {
    if (!targetId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const detail = await getAdminAccountDetailApi(targetId);
      setAccountDetail(detail);
      const mapped = mapBackendAccountToAdminUser(detail);
      setUser(mapped);

      // If artisan/worker, also fetch identity evidence for document tab
      if (detail.role === "ARTISAN") {
        try {
          const idEvidence = await getAdminArtisanIdentityApi(detail.id);
          setIdentityEvidence(idEvidence);
        } catch {
          // Identity may not be uploaded yet
        }
      }
    } catch (err: any) {
      console.error("Failed to load account detail:", err);
      setLoadError(err?.message || "Failed to load account from server.");
    } finally {
      setIsLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    fetchAccountDetail();
  }, [fetchAccountDetail]);

  const handleConfirmSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !suspendReason.trim()) return;

    setIsSubmittingSuspend(true);
    const willEnable = user.accountStatus === "SUSPENDED";
    try {
      await updateAdminAccountStatusApi(user.id, {
        enabled: willEnable,
        reason: `${suspendCategory}: ${suspendReason.trim()}`,
      });

      const nextStatus: AdminAccountStatus = willEnable ? "ACTIVE" : "SUSPENDED";
      setUser((prev) =>
        prev
          ? {
            ...prev,
            accountStatus: nextStatus,
            suspensionCategory: willEnable ? undefined : suspendCategory,
            suspensionReason: willEnable ? undefined : suspendReason,
            suspendedAt: willEnable ? undefined : new Date().toISOString(),
          }
          : null
      );
      toast.success(
        willEnable
          ? `Account for ${user.fullName} reactivated.`
          : `Account for ${user.fullName} suspended.`
      );
      setShowSuspendModal(false);
      setSuspendReason("");
    } catch (err: any) {
      console.error("Error updating account status:", err);
      toast.error(err?.message || "Failed to update account status.");
    } finally {
      setIsSubmittingSuspend(false);
    }
  };

  const handleSendContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !contactMessage.trim()) return;

    setIsSubmittingContact(true);
    try {
      await sendAdminAccountNotificationApi({
        userIds: [user.id],
        title: contactSubject.trim() || "Operational Notice",
        message: contactMessage.trim(),
        channel: "ALL",
        priority: "NORMAL",
      });
      toast.success(`Message dispatched to ${user.fullName}.`);
      setShowContactModal(false);
      setContactSubject("");
      setContactMessage("");
    } catch (err: any) {
      console.error("Error sending notification:", err);
      toast.error(err?.message || "Failed to dispatch notification.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newNoteText.trim()) return;

    setIsAddingNote(true);
    try {
      const added = await createAdminAccountNoteApi(user.id, {
        text: newNoteText.trim(),
      });
      setAccountDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notes: [
            ...(prev.notes || []),
            {
              id: added.id || `note-${Date.now()}`,
              authorId: added.authorId || "admin",
              author: added.author || "Admin",
              text: newNoteText.trim(),
              createdAt: added.createdAt || new Date().toISOString(),
            },
          ],
        };
      });
      setNewNoteText("");
      toast.success("Internal note added.");
    } catch (err: any) {
      console.error("Error creating note:", err);
      toast.error(err?.message || "Failed to add note.");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleTogglePayoutHold = async () => {
    if (!user) return;
    const nextHold = !user.payoutsFrozen;
    try {
      await updateAdminAccountPayoutHoldApi(user.id, {
        enabled: nextHold,
        reason: nextHold
          ? "Admin payout hold placed from User 360 profile"
          : "Admin restored withdrawal access",
      });
      setUser((prev) => (prev ? { ...prev, payoutsFrozen: nextHold } : null));
      toast.success(nextHold ? "Payouts held for user." : "Payout hold released.");
    } catch (err: any) {
      console.error("Error toggling payout hold:", err);
      toast.error(err?.message || "Failed to update payout hold.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-4 bg-neutral-200 rounded w-48"></div>
        <div className="h-16 bg-neutral-100 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-40 bg-neutral-100 rounded-2xl"></div>
          <div className="h-40 bg-neutral-100 rounded-2xl"></div>
          <div className="h-40 bg-neutral-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (loadError || !user) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 space-y-3">
        <div className="text-3xl text-neutral-400">👤</div>
        <h2 className="text-base font-bold text-neutral-800">Account Not Found</h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          {loadError || "The requested user account could not be retrieved from the server."}
        </p>
        <div className="pt-2">
          <Link
            href="/ops/users"
            className="px-4 py-2 bg-[#001B40] text-white text-xs font-bold rounded-xl hover:bg-[#074292] transition-colors inline-block"
          >
            ← Back to Users Directory
          </Link>
        </div>
      </div>
    );
  }

  const jobsCount = (accountDetail?.jobs?.length ?? 0) + (accountDetail?.bookings?.length ?? 0);
  const paymentsCount =
    (accountDetail?.payments?.length ?? 0) + (accountDetail?.transfers?.length ?? 0);
  const reviewsCount = accountDetail?.reviews?.length ?? 0;
  const complaintsCount = accountDetail?.cases?.length ?? 0;
  const disputesCount = accountDetail?.disputes?.length ?? 0;
  const documentsCount = identityEvidence ? 1 : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <div className="text-xs font-semibold text-neutral-400 mb-1 flex items-center gap-1.5">
          <Link href="/ops/users" className="hover:underline">
            Users
          </Link>
          <span>&gt;</span>
          <span className="text-neutral-700 font-bold">{user.fullName}</span>
        </div>

        {/* User Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#001B40] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.fullName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-[#001B40] tracking-tight">
                  {user.fullName}
                </h1>
                <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-200 text-neutral-800">
                  {user.role === "WORKER" ? "Worker" : user.role === "TALENT" ? "Talent" : "Customer"}
                </span>
                <span
                  className={`whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${user.verificationStatus === "VERIFIED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                    }`}
                >
                  ● {user.verificationStatus}
                </span>
                <span
                  className={`whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${user.accountStatus === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                    }`}
                >
                  ● {user.accountStatus}
                </span>
                {user.payoutsFrozen && (
                  <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    🔒 Payouts Held
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {user.userCode} · joined {user.joinedAt} · last active {user.lastActive}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowContactModal(true)}
              className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>✉</span>
              <span>Contact</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSuspendModal(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors ${user.accountStatus === "SUSPENDED"
                  ? "bg-emerald-700 text-white hover:bg-emerald-800"
                  : "bg-red-600 text-white hover:bg-red-700"
                }`}
            >
              <span>⛔</span>
              <span>{user.accountStatus === "SUSPENDED" ? "Reactivate" : "Suspend"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 9 Tabs Navigation */}
      <div className="border-b border-neutral-200">
        <nav className="flex items-center gap-1 sm:gap-4 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: "overview", label: "Overview" },
            { id: "jobs", label: "Jobs", count: jobsCount },
            { id: "payments", label: "Payments", count: paymentsCount },
            { id: "wallet", label: "Wallet" },
            { id: "reviews", label: "Reviews", count: reviewsCount },
            { id: "complaints", label: "Complaints", count: complaintsCount },
            { id: "disputes", label: "Disputes", count: disputesCount },
            { id: "documents", label: "Documents", count: documentsCount },
            { id: "activity", label: "Activity" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as UserDetailTab)}
                className={`pb-3 px-1 border-b-2 font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${isActive
                    ? "border-[#001B40] text-[#001B40]"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                  }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={`whitespace-nowrap shrink-0 inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? "bg-neutral-200 text-neutral-800 font-bold" : "text-neutral-400"
                      }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Trust and Performance */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Trust and performance
              </span>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase">Total jobs</span>
                  <p className="text-base font-bold text-neutral-900">{user.completedJobsCount} Jobs</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase">Disputes</span>
                  <p className="text-base font-bold text-emerald-700">{user.disputeCount} Disputes</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase">Rating</span>
                  <p className="text-base font-bold text-amber-600">
                    ★ {user.rating} ({user.ratingCount} reviews)
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase">Available funds</span>
                  <p className="text-base font-bold text-neutral-900">
                    {formatNaira(user.walletBalanceKobo, true)}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-500">
                Trade: <span className="font-semibold text-neutral-800">{user.trade || "General Marketplace"}</span> · Location: <span className="font-semibold text-neutral-800">{user.location}</span>
              </div>
            </div>

            {/* Verification Status */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Verification
                </span>
                <span
                  onClick={() => setActiveTab("documents")}
                  className="text-xs text-[#074292] font-semibold cursor-pointer hover:underline"
                >
                  Documents →
                </span>
              </div>
              <div className="pt-2">
                <span
                  className={`whitespace-nowrap shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${user.verificationStatus === "VERIFIED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                    }`}
                >
                  ● {user.verificationStatus}
                </span>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  {user.verificationStatus === "VERIFIED"
                    ? "Identification documents and credentials confirmed against official registries."
                    : "Account documents are pending or under operational review."}
                </p>
              </div>
              <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 flex justify-between">
                <span>NIN: <strong className="font-mono text-neutral-700">{user.nin || accountDetail?.profile?.nin || "Not submitted"}</strong></span>
                <span>BVN: <strong className="text-neutral-700">{accountDetail?.profile?.bvn ? "Verified" : "Unverified"}</strong></span>
              </div>
            </div>

            {/* Wallet Quick Card */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Wallet
                </span>
                <span
                  onClick={() => setActiveTab("wallet")}
                  className="text-xs text-[#074292] font-semibold cursor-pointer hover:underline"
                >
                  Transactions →
                </span>
              </div>
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Available:</span>
                  <span className="font-bold text-neutral-900">
                    {formatNaira(user.walletBalanceKobo, true)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Pending (escrow):</span>
                  <span className="font-bold text-amber-700">
                    {formatNaira(user.escrowBalanceKobo, true)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Withdrawal status:</span>
                  <span className={`font-bold ${user.payoutsFrozen ? "text-red-600" : "text-emerald-700"}`}>
                    {user.payoutsFrozen ? "On Hold" : "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Jobs & Open Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[#001B40]">Active Jobs &amp; Bookings</h3>
                <span
                  onClick={() => setActiveTab("jobs")}
                  className="text-xs text-[#074292] font-semibold cursor-pointer hover:underline"
                >
                  All jobs →
                </span>
              </div>
              <div className="space-y-2">
                {((accountDetail?.jobs && accountDetail.jobs.length > 0) ||
                  (accountDetail?.bookings && accountDetail.bookings.length > 0)) ? (
                  <>
                    {(accountDetail?.jobs || []).slice(0, 2).map((j) => (
                      <div
                        key={j.id}
                        className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-neutral-900">{j.title}</p>
                          <p className="text-neutral-500 text-[11px]">
                            Budget: {formatNaira(Number(j.budgetKobo || 0), true)}
                          </p>
                        </div>
                        <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          ● {j.status}
                        </span>
                      </div>
                    ))}
                    {(accountDetail?.bookings || []).slice(0, 2).map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-neutral-900">{b.title || b.code || "Booking"}</p>
                          <p className="text-neutral-500 text-[11px]">
                            {b.counterpartyName ? `Client: ${b.counterpartyName}` : "Marketplace booking"}
                          </p>
                        </div>
                        <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ● {b.status}
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-400">
                    No active jobs or bookings on record.
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[#001B40]">Open Cases &amp; Disputes</h3>
                <span
                  onClick={() => setActiveTab("disputes")}
                  className="text-xs text-[#074292] font-semibold cursor-pointer hover:underline"
                >
                  Disputes →
                </span>
              </div>
              {((accountDetail?.cases && accountDetail.cases.length > 0) ||
                (accountDetail?.disputes && accountDetail.disputes.length > 0)) ? (
                <div className="space-y-2">
                  {(accountDetail?.cases || []).slice(0, 2).map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-neutral-900">{c.subject}</p>
                        <p className="text-neutral-500 text-[11px]">Priority: {c.priority}</p>
                      </div>
                      <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        ● {c.status}
                      </span>
                    </div>
                  ))}
                  {(accountDetail?.disputes || []).slice(0, 2).map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl bg-red-50/50 border border-red-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-red-950">{d.title}</p>
                        <p className="text-red-700 text-[11px]">{d.disputeCode || "Dispute"}</p>
                      </div>
                      <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                        ● {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-500">
                  No open disputes or escalated incidents on this profile.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: JOBS */}
      {/* ========================================================= */}
      {activeTab === "jobs" && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Identifier</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Counterparty</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {((accountDetail?.jobs && accountDetail.jobs.length > 0) ||
                  (accountDetail?.bookings && accountDetail.bookings.length > 0)) ? (
                  <>
                    {(accountDetail?.jobs || []).map((j) => (
                      <tr key={j.id} className="hover:bg-neutral-50/60">
                        <td className="py-3.5 px-4 font-bold text-[#074292]">
                          {j.id.slice(0, 8)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-900">{j.title}</td>
                        <td className="py-3.5 px-4 text-neutral-600">Marketplace Job</td>
                        <td className="py-3.5 px-4 font-bold text-neutral-900">
                          {formatNaira(Number(j.budgetKobo || 0), true)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            ● {j.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500">
                          {j.createdAt ? new Date(j.createdAt).toLocaleDateString("en-GB") : "—"}
                        </td>
                      </tr>
                    ))}
                    {(accountDetail?.bookings || []).map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-50/60">
                        <td className="py-3.5 px-4 font-bold text-[#074292]">
                          {b.code || b.id.slice(0, 8)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-900">
                          {b.title || "Direct Booking"}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-700">
                          {b.counterpartyName || "Customer"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-neutral-900">
                          {formatNaira(Number(b.totalAmountKobo || 0), true)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ● {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500">
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-GB") : "—"}
                        </td>
                      </tr>
                    ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400">
                      No jobs or bookings recorded for this account.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PAYMENTS */}
      {/* ========================================================= */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {((accountDetail?.payments && accountDetail.payments.length > 0) ||
                  (accountDetail?.transfers && accountDetail.transfers.length > 0)) ? (
                  <>
                    {(accountDetail?.payments || []).map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50/60">
                        <td className="py-3.5 px-4 font-bold text-[#074292] font-mono">
                          {p.reference}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-800">Payment In</td>
                        <td className="py-3.5 px-4 font-bold text-neutral-900">
                          {formatNaira(parseInt(p.amountKobo || "0", 10), true)}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-600">{p.channel}</td>
                        <td className="py-3.5 px-4">
                          <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ● {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-GB") : "—"}
                        </td>
                      </tr>
                    ))}
                    {(accountDetail?.transfers || []).map((t) => (
                      <tr key={t.id} className="hover:bg-neutral-50/60">
                        <td className="py-3.5 px-4 font-bold text-[#074292] font-mono">
                          {t.reference}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-800">Payout Out</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">
                          {formatNaira(parseInt(t.amountKobo || "0", 10), true)}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-600">Bank Transfer</td>
                        <td className="py-3.5 px-4">
                          <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            ● {t.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-GB") : "—"}
                        </td>
                      </tr>
                    ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400">
                      No payments or transfer records found for this account.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: WALLET */}
      {/* ========================================================= */}
      {activeTab === "wallet" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase">
                Available balance
              </span>
              <p className="text-xl font-black text-[#001B40] mt-1">
                {formatNaira(user.walletBalanceKobo, true)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase">
                Pending escrow
              </span>
              <p className="text-xl font-black text-[#074292] mt-1">
                {formatNaira(user.escrowBalanceKobo, true)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase">
                Payout Hold Status
              </span>
              <p className={`text-sm font-black mt-2 ${user.payoutsFrozen ? "text-red-600" : "text-emerald-700"}`}>
                {user.payoutsFrozen ? "🔒 Frozen by Admin" : "✓ Normal Access"}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase">
                Payout Controls
              </span>
              <button
                type="button"
                onClick={handleTogglePayoutHold}
                className={`mt-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${user.payoutsFrozen
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                  }`}
              >
                {user.payoutsFrozen ? "Unfreeze Withdrawals" : "Hold Withdrawals"}
              </button>
            </div>
          </div>

          {accountDetail?.payoutAccount && (
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-2">
              <h3 className="font-bold text-sm text-[#001B40]">Linked Payout Account</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-neutral-400 font-semibold text-[10px] uppercase">Bank</span>
                  <p className="font-bold text-neutral-900">{accountDetail.payoutAccount.bankName || "Commercial Bank"}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-semibold text-[10px] uppercase">Account Number</span>
                  <p className="font-mono font-bold text-neutral-900">{accountDetail.payoutAccount.accountNumberMasked || "•••• ••••"}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-semibold text-[10px] uppercase">Account Name</span>
                  <p className="font-bold text-neutral-900">{accountDetail.payoutAccount.accountName || user.fullName}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#001B40]">Wallet Activity Ledger</h3>
            <div className="space-y-2 text-xs">
              {(accountDetail?.transfers && accountDetail.transfers.length > 0) ? (
                accountDetail.transfers.map((tx) => (
                  <div key={tx.id} className="p-3 rounded-xl bg-neutral-50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-neutral-900">Transfer ({tx.reference})</p>
                      <p className="text-neutral-500 text-[11px]">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString("en-GB") : "Recently"}
                      </p>
                    </div>
                    <span className="font-bold text-neutral-800">
                      {formatNaira(parseInt(tx.amountKobo || "0", 10), true)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-neutral-400">
                  No payout transfer records or debit adjustments on file.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: REVIEWS */}
      {/* ========================================================= */}
      {activeTab === "reviews" && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          {(accountDetail?.reviews && accountDetail.reviews.length > 0) ? (
            accountDetail.reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <span>{"★".repeat(Math.max(1, Math.min(5, rev.rating)))}</span>
                    <span className="text-neutral-700 ml-1">
                      {rev.reviewerName || "Client"}
                    </span>
                    <span className="text-neutral-400 font-normal">
                      · {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-GB") : "Recently"}
                    </span>
                  </div>
                  <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-neutral-800 font-medium">
                  &ldquo;{rev.comment || "Great service delivered."}&rdquo;
                </p>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-neutral-400">
              No reviews have been submitted for this account yet.
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: COMPLAINTS */}
      {/* ========================================================= */}
      {activeTab === "complaints" && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-3">
          {(accountDetail?.cases && accountDetail.cases.length > 0) ? (
            accountDetail.cases.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-[#001B40]">
                    {c.ticketNumber ? `${c.ticketNumber} ` : ""}{c.subject}
                  </p>
                  <p className="text-neutral-500 text-[11px] mt-0.5">
                    Priority: {c.priority} · {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "Recently"}
                  </p>
                </div>
                <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  ● {c.status}
                </span>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-neutral-400">
              No support tickets or complaints recorded on this account.
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: DISPUTES */}
      {/* ========================================================= */}
      {activeTab === "disputes" && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
          {(accountDetail?.disputes && accountDetail.disputes.length > 0) ? (
            <div className="space-y-3">
              {accountDetail.disputes.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-[#001B40]">
                      {d.disputeCode ? `${d.disputeCode} ` : ""}{d.title}
                    </p>
                    <p className="text-neutral-500 text-[11px] mt-0.5">
                      Amount: {formatNaira(parseInt(d.amountKobo || "0", 10), true)} ·{" "}
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-GB") : "Recently"}
                    </p>
                  </div>
                  <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                    ● {d.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-neutral-400 space-y-2">
              <div className="text-3xl">⚖</div>
              <p className="font-bold text-neutral-700 text-sm">No disputes involving this user</p>
              <p>This user has zero open or historical arbitration cases.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: DOCUMENTS */}
      {/* ========================================================= */}
      {activeTab === "documents" && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-2 text-xs">
              <span className="font-bold text-neutral-800">National Identification (NIN)</span>
              <p className="font-mono text-neutral-600 font-bold">
                {accountDetail?.profile?.nin || user.nin || "Not submitted"}
              </p>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Verified
              </span>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-2 text-xs">
              <span className="font-bold text-neutral-800">Bank Verification Number (BVN)</span>
              <p className="font-mono text-neutral-600 font-bold">
                {accountDetail?.profile?.bvn ? "Verified on Registry" : "Not Linked"}
              </p>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {accountDetail?.profile?.bvn ? "Verified" : "Pending"}
              </span>
            </div>
          </div>

          {identityEvidence ? (
            <div className="border-t border-neutral-200 pt-4 space-y-3">
              <h4 className="font-bold text-xs text-[#001B40]">Artisan Identity Evidence Files</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {identityEvidence.idCardUrl && (
                  <div className="p-3 rounded-xl border border-neutral-200 flex items-center justify-between">
                    <span>Identity Document Card</span>
                    <a
                      href={identityEvidence.idCardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#074292] font-bold hover:underline"
                    >
                      View File ↗
                    </a>
                  </div>
                )}
                {identityEvidence.selfieUrl && (
                  <div className="p-3 rounded-xl border border-neutral-200 flex items-center justify-between">
                    <span>Live Verification Selfie</span>
                    <a
                      href={identityEvidence.selfieUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#074292] font-bold hover:underline"
                    >
                      View File ↗
                    </a>
                  </div>
                )}
                {identityEvidence.proofOfAddressUrl && (
                  <div className="p-3 rounded-xl border border-neutral-200 flex items-center justify-between">
                    <span>Proof of Address</span>
                    <a
                      href={identityEvidence.proofOfAddressUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#074292] font-bold hover:underline"
                    >
                      View File ↗
                    </a>
                  </div>
                )}
                {identityEvidence.tradeCertificateUrl && (
                  <div className="p-3 rounded-xl border border-neutral-200 flex items-center justify-between">
                    <span>Trade Skill Certificate</span>
                    <a
                      href={identityEvidence.tradeCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#074292] font-bold hover:underline"
                    >
                      View File ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-neutral-400">
              No manual image uploads or identity files recorded for this user profile.
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 9: ACTIVITY & NOTES */}
      {/* ========================================================= */}
      {activeTab === "activity" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#001B40]">Admin Audit Actions</h3>
            <div className="space-y-3 text-xs border-l-2 border-neutral-200 pl-3">
              {(accountDetail?.audits && accountDetail.audits.length > 0) ? (
                accountDetail.audits.map((a) => (
                  <div key={a.id}>
                    <p className="font-bold text-neutral-900">● {a.action}</p>
                    <p className="text-[11px] text-neutral-500">
                      {a.adminName || "System Admin"} · {a.timestamp || a.createdAt || "Recently"}
                    </p>
                    {a.details && <p className="text-[11px] text-neutral-600 mt-0.5">{a.details}</p>}
                  </div>
                ))
              ) : (
                <p className="text-neutral-400 italic">No admin audits logged against this profile.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#001B40]">Internal Admin Notes</h3>
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Write private admin note..."
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#001B40]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingNote || !newNoteText.trim()}
                  className="px-3 py-1.5 rounded-xl bg-[#001B40] text-white font-bold text-xs hover:bg-[#074292] disabled:opacity-50 cursor-pointer"
                >
                  {isAddingNote ? "Saving..." : "Add Note"}
                </button>
              </div>
            </form>

            <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs">
              {(accountDetail?.notes && accountDetail.notes.length > 0) ? (
                accountDetail.notes.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <p className="text-neutral-900">{n.text}</p>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      {n.author || "Admin"} · {n.createdAt ? new Date(n.createdAt).toLocaleString("en-GB") : "Recently"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-neutral-400 text-center py-3">No private notes recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUSPEND MODAL */}
      {/* ========================================================= */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-extrabold text-[#001B40]">
                {user.accountStatus === "SUSPENDED" ? "Reactivate" : "Suspend"} {user.fullName}?
              </h3>
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmSuspend} className="space-y-3">
              {user.accountStatus !== "SUSPENDED" && (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Reason category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={suspendCategory}
                    onChange={(e) => setSuspendCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#001B40]"
                  >
                    <option value="Code of Conduct violation">Code of Conduct violation</option>
                    <option value="Fraud / suspicious rating patterns">Fraud / suspicious rating patterns</option>
                    <option value="Unresolved customer dispute">Unresolved customer dispute</option>
                    <option value="Safety incident investigation">Safety incident investigation</option>
                    <option value="Other operational sanction">Other operational sanction</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Explain the decision. This is recorded against your admin account..."
                  className="w-full p-3 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#001B40]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSuspendModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSuspend || !suspendReason.trim()}
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition-colors shadow-xs cursor-pointer ${user.accountStatus === "SUSPENDED"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                    }`}
                >
                  {isSubmittingSuspend
                    ? "Processing..."
                    : user.accountStatus === "SUSPENDED"
                      ? "Confirm Reactivation"
                      : "Confirm Suspension"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CONTACT USER MODAL */}
      {/* ========================================================= */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-extrabold text-[#001B40]">
                Contact {user.fullName}
              </h3>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-bold mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="Official Notice regarding your account..."
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-bold mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Type your message to this user..."
                  className="w-full p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingContact || !contactMessage.trim()}
                  className="px-5 py-2 rounded-xl bg-[#001B40] text-white font-bold hover:bg-[#074292] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingContact ? "Dispatching..." : "Dispatch Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
