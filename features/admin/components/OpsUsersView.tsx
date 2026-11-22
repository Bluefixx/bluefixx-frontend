"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AdminUser } from "../types";
import { MOCK_ADMIN_USERS } from "../mockData";
import { OpsSuspendModal } from "./OpsSuspendModal";
import { OpsSendNotificationModal } from "./OpsSendNotificationModal";
import { OpsUserProfileDrawer } from "./OpsUserProfileDrawer";
import { OpsBulkActionModal, BulkActionType } from "./OpsBulkActionModal";
import { OpsImpersonationBanner } from "./OpsImpersonationBanner";
import { OpsSecurityPinModal } from "./OpsSecurityPinModal";

export function OpsUsersView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "all";

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Clear conflicting filters whenever currentTab changes (e.g. from Customers to Talents)
  useEffect(() => {
    setFilterRole("ALL");
    setSearchQuery("");
    if (currentTab === "pending-verification") {
      setFilterVerification("ALL");
    }
    if (currentTab === "suspended") {
      setFilterAccount("ALL");
    }
  }, [currentTab]);

  const [users, setUsers] = useState<AdminUser[]>(MOCK_ADMIN_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [filterVerification, setFilterVerification] = useState<string>("ALL");
  const [filterAccount, setFilterAccount] = useState<string>("ALL");
  const [filterLocation, setFilterLocation] = useState<string>("ALL");
  const [filterRisk, setFilterRisk] = useState<string>("ALL");

  // Selection
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  // Modals & Drawer State
  const [inspectUser, setInspectUser] = useState<AdminUser | null>(null);
  const [suspendTargetUser, setSuspendTargetUser] = useState<AdminUser | null>(null);
  const [notifyUsers, setNotifyUsers] = useState<AdminUser[]>([]);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);

  // Advanced Bulk Action Modal
  const [bulkActionType, setBulkActionType] = useState<BulkActionType | null>(null);

  // Impersonation state
  const [impersonatedUser, setImpersonatedUser] = useState<AdminUser | null>(null);

  // Admin Security PIN state for critical actions
  const [pendingPinAction, setPendingPinAction] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    onSuccess: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    actionLabel: "",
    onSuccess: () => { },
  });

  const requirePinAuth = (
    title: string,
    description: string,
    actionLabel: string,
    onSuccess: () => void
  ) => {
    setPendingPinAction({
      isOpen: true,
      title,
      description,
      actionLabel,
      onSuccess,
    });
  };

  // Tab Filtering logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Sidebar tab filter
      if (currentTab === "workers" && u.role !== "WORKER") return false;
      if (currentTab === "customers" && u.role !== "CUSTOMER") return false;
      if (currentTab === "talents" && u.role !== "TALENT") return false;
      if (currentTab === "pending-verification" && u.verificationStatus !== "PENDING") return false;
      if (currentTab === "suspended" && u.accountStatus !== "SUSPENDED") return false;

      // 2. Search query (name, email, phone, userCode, trade)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          Boolean(u.fullName && u.fullName.toLowerCase().includes(q)) ||
          Boolean(u.email && u.email.toLowerCase().includes(q)) ||
          Boolean(u.phone && u.phone.toLowerCase().includes(q)) ||
          Boolean(u.userCode && u.userCode.toLowerCase().includes(q)) ||
          Boolean(u.trade && u.trade.toLowerCase().includes(q)) ||
          Boolean(u.location && u.location.toLowerCase().includes(q));
        if (!match) return false;
      }

      // 3. Dropdown filters
      if (filterRole !== "ALL" && u.role !== filterRole) return false;
      if (filterVerification !== "ALL" && u.verificationStatus !== filterVerification) return false;
      if (filterAccount !== "ALL" && u.accountStatus !== filterAccount) return false;
      if (
        filterLocation !== "ALL" &&
        (!u.location || !u.location.toLowerCase().includes(filterLocation.toLowerCase()))
      )
        return false;
      if (filterRisk !== "ALL" && (u.riskLevel || "LOW") !== filterRisk) return false;

      return true;
    });
  }, [
    users,
    currentTab,
    searchQuery,
    filterRole,
    filterVerification,
    filterAccount,
    filterLocation,
    filterRisk,
  ]);

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedUsers = useMemo(() => {
    return users.filter((u) => selectedUserIds.includes(u.id));
  }, [users, selectedUserIds]);

  // Suspension
  const handleConfirmSuspension = (
    userId: string,
    category: string,
    reason: string
  ) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            accountStatus: "SUSPENDED",
            suspensionCategory: category,
            suspensionReason: reason,
            suspendedAt: new Date().toLocaleString(),
          };
        }
        return u;
      })
    );
    if (inspectUser && inspectUser.id === userId) {
      setInspectUser((prev) =>
        prev
          ? {
            ...prev,
            accountStatus: "SUSPENDED",
            suspensionCategory: category,
            suspensionReason: reason,
            suspendedAt: new Date().toLocaleString(),
          }
          : null
      );
    }
  };

  const handleReactivateUser = (user: AdminUser) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === user.id) {
          return {
            ...u,
            accountStatus: "ACTIVE",
            suspensionCategory: undefined,
            suspensionReason: undefined,
          };
        }
        return u;
      })
    );
    if (inspectUser && inspectUser.id === user.id) {
      setInspectUser((prev) =>
        prev
          ? {
            ...prev,
            accountStatus: "ACTIVE",
            suspensionCategory: undefined,
            suspensionReason: undefined,
          }
          : null
      );
    }
    toast.success(`Account for ${user.fullName} reactivated.`);
    setActiveMenuUserId(null);
  };

  const handleExportCSV = () => {
    if (typeof window === "undefined") return;
    const csvHeader = "ID,Code,Name,Role,Trade,Email,Phone,Location,Verification,AccountStatus,RiskLevel,Tags\n";
    const csvRows = filteredUsers
      .map(
        (u) =>
          `"${u.id}","${u.userCode}","${u.fullName}","${u.role}","${u.trade || ""}","${u.email}","${u.phone}","${u.location}","${u.verificationStatus}","${u.accountStatus}","${u.riskLevel || "LOW"}","${(u.tags || []).join("; ")}"`
      )
      .join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bluefixx-users-${currentTab}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Users export CSV downloaded.");
  };

  const handleApplyBulkUpdates = (updatedBatch: AdminUser[]) => {
    const updatedMap = new Map(updatedBatch.map((u) => [u.id, u]));
    setUsers((prev) => prev.map((u) => updatedMap.get(u.id) || u));
    setSelectedUserIds([]);
  };

  const handleStartImpersonation = (u: AdminUser) => {
    setImpersonatedUser(u);
    setActiveMenuUserId(null);
    setInspectUser(null);
    toast.success(`Started read-only support session as ${u.fullName} (${u.role}).`);
  };

  const handleStartImpersonationWithPin = (u: AdminUser) => {
    setActiveMenuUserId(null);
    requirePinAuth(
      "Authorize User Impersonation",
      `Launching an impersonated support session as ${u.fullName} (${u.userCode}) gives temporary access to their role view. This privileged action is logged to the audit registry.`,
      "Authorize Session",
      () => handleStartImpersonation(u)
    );
  };

  const handleInitiateSuspendWithPin = (u: AdminUser) => {
    setActiveMenuUserId(null);
    requirePinAuth(
      "Authorize Account Suspension",
      `Suspending ${u.fullName}'s account will revoke all active marketplace access and freeze wallet withdrawals immediately.`,
      "Proceed to Suspend",
      () => setSuspendTargetUser(u)
    );
  };

  const handleReactivateUserWithPin = (u: AdminUser) => {
    setActiveMenuUserId(null);
    requirePinAuth(
      "Authorize Account Reactivation",
      `Reactivating ${u.fullName}'s account will restore normal marketplace access and verified matching.`,
      "Reactivate Account",
      () => handleReactivateUser(u)
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Impersonation Banner if active */}
      <OpsImpersonationBanner
        user={impersonatedUser}
        onExit={() => {
          setImpersonatedUser(null);
          toast("Exited impersonation mode.");
        }}
      />

      {/* Page Header (Screenshot 5 / 6 exact layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
            Users
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl leading-relaxed">
            Every worker, customer and talent on the marketplace, with verification, anti-fraud risk, and account state in one view.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setNotifyUsers(users);
              setIsNotifyModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>Send notification</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV ({filteredUsers.length})</span>
          </button>
        </div>
      </div>

      {/* Workers Waiting on Verification Notice Banner (Screenshot 5 / 6 exact layout) */}
      <div className="p-4 rounded-2xl border-l-4 border-l-amber-500 border border-neutral-200/90 bg-amber-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-xs">
            !
          </div>
          <div>
            <span className="font-heading font-bold text-xs sm:text-sm text-[#0F1115]">
              Workers waiting on verification
            </span>
            <p className="text-xs text-neutral-500 mt-0.5">
              24 new accounts with ID docs that cannot be searched/hired yet until verified.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/ops/users?tab=pending-verification")}
          className="text-xs font-bold text-[#001B40] hover:text-[#074292] hover:underline self-start sm:self-center cursor-pointer whitespace-nowrap"
        >
          Open verification queue →
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name, email, phone or user..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-800 focus:outline-none focus:border-[#001B40]"
            />
          </div>

          {/* User Type Dropdown */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-700 bg-white focus:outline-none focus:border-[#001B40] cursor-pointer"
          >
            <option value="ALL">User Type: All</option>
            <option value="WORKER">Worker</option>
            <option value="CUSTOMER">Customer</option>
            <option value="TALENT">Talent</option>
          </select>

          {/* Verification Dropdown */}
          <select
            value={filterVerification}
            onChange={(e) => setFilterVerification(e.target.value)}
            className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-700 bg-white focus:outline-none focus:border-[#001B40] cursor-pointer"
          >
            <option value="ALL">Verification: All</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Account Status Dropdown */}
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-700 bg-white focus:outline-none focus:border-[#001B40] cursor-pointer"
          >
            <option value="ALL">Account: All</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DORMANT">Dormant</option>
          </select>

          {/* Location Dropdown */}
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-700 bg-white focus:outline-none focus:border-[#001B40] cursor-pointer"
          >
            <option value="ALL">Location: All</option>
            <option value="Lagos">Lagos</option>
            <option value="Abuja">Abuja</option>
            <option value="Kano">Kano</option>
            <option value="Enugu">Enugu</option>
            <option value="Port Harcourt">Port Harcourt</option>
          </select>

          {/* Risk Filter Dropdown (Feature 4) */}
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-700 bg-white focus:outline-none focus:border-[#001B40] cursor-pointer"
          >
            <option value="ALL">Risk Level: All</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>

          {/* Reset Filters */}
          {(searchQuery || filterRole !== "ALL" || filterVerification !== "ALL" || filterAccount !== "ALL" || filterLocation !== "ALL" || filterRisk !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterRole("ALL");
                setFilterVerification("ALL");
                setFilterAccount("ALL");
                setFilterLocation("ALL");
                setFilterRisk("ALL");
              }}
              className="px-3 py-2 text-xs font-bold text-red-600 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Enhanced Multi-Action Bulk Action Bar (Feature 1) */}
        {selectedUserIds.length > 0 && (
          <div className="p-3 rounded-2xl bg-[#001B40] text-white flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
            <span className="font-bold pl-1">
              {selectedUserIds.length} user{selectedUserIds.length === 1 ? "" : "s"} selected
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setBulkActionType("VERIFY_KYC")}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
              >
                ✓ Approve KYC
              </button>

              <button
                type="button"
                onClick={() => setBulkActionType("REQUEST_DOCS")}
                className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold text-xs cursor-pointer"
              >
                Request Docs
              </button>

              <button
                type="button"
                onClick={() => setBulkActionType("ADD_TAG")}
                className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold text-xs cursor-pointer"
              >
                + Tag Users
              </button>

              <button
                type="button"
                onClick={() => setBulkActionType("FREEZE_PAYOUTS")}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs cursor-pointer"
              >
                Freeze Payouts
              </button>

              <button
                type="button"
                onClick={() => {
                  setNotifyUsers(selectedUsers);
                  setIsNotifyModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold text-xs cursor-pointer"
              >
                Send Notification
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedUserIds([]);
                  toast.success("Selection cleared");
                }}
                className="px-2.5 py-1.5 text-neutral-300 hover:text-white cursor-pointer ml-1"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200/90 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredUsers.length > 0 &&
                      selectedUserIds.length === filteredUsers.length
                    }
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded-md border-neutral-300 text-[#001B40] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3">User</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-3">Email</th>
                <th className="py-3.5 px-3">Phone</th>
                <th className="py-3.5 px-3">Location</th>
                <th className="py-3.5 px-3">Verification</th>
                <th className="py-3.5 px-3">Account</th>
                <th className="py-3.5 px-3">Risk Level</th>
                <th className="py-3.5 px-3">Last Active</th>
                <th className="py-3.5 pr-5 pl-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-neutral-400">
                    No users match the selected filters or search query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const isChecked = selectedUserIds.includes(user.id);
                  const isMenuOpen = activeMenuUserId === user.id;
                  const openUpwards = index >= Math.max(0, filteredUsers.length - 2);

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-neutral-50/70 transition-colors ${isChecked ? "bg-blue-50/30" : ""
                        }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-5 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectUser(user.id)}
                          className="w-4 h-4 rounded-md border-neutral-300 text-[#001B40] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* User (Avatar + Name + Code + Tags) */}
                      <td className="py-3.5 px-3">
                        <div
                          onClick={() => setInspectUser(user)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#001B40] text-white flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-neutral-200">
                            {hasMounted && user.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.avatarUrl}
                                alt={user.fullName || "User"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <span>{user.fullName?.[0]?.toUpperCase() || "U"}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-heading font-bold text-xs text-[#0F1115] group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                              <span>{user.fullName}</span>
                              {user.payoutsFrozen && (
                                <span className="text-[10px] text-amber-600" title="Payouts frozen">
                                  🔒
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              {user.userCode} {user.trade ? `· ${user.trade}` : ""}
                            </div>
                            {user.tags && user.tags.length > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {user.tags.slice(0, 2).map((t) => (
                                  <span key={t} className="text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded font-medium whitespace-nowrap shrink-0">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center whitespace-nowrap shrink-0 px-2 py-0.5 rounded-md font-bold text-[10px] ${user.role === "WORKER"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : user.role === "CUSTOMER"
                                ? "bg-sky-50 text-sky-700 border border-sky-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                        >
                          {user.role === "WORKER" ? "Worker" : user.role === "CUSTOMER" ? "Customer" : "Talent"}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-3 text-neutral-600 font-medium">
                        {user.email}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-3 text-neutral-600 font-mono text-[11px] whitespace-nowrap">
                        {user.phone}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-3 text-neutral-600 whitespace-nowrap">
                        {user.location}
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center whitespace-nowrap shrink-0 gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${user.verificationStatus === "VERIFIED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : user.verificationStatus === "PENDING"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : user.verificationStatus === "UNDER_REVIEW"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                        >
                          {user.verificationStatus === "VERIFIED" && "✓ Verified"}
                          {user.verificationStatus === "PENDING" && "• Pending"}
                          {user.verificationStatus === "UNDER_REVIEW" && "• Under Review"}
                          {user.verificationStatus === "REJECTED" && "✕ Rejected"}
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center whitespace-nowrap shrink-0 gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${user.accountStatus === "ACTIVE"
                              ? "text-emerald-700 bg-emerald-50"
                              : user.accountStatus === "SUSPENDED"
                                ? "text-red-700 bg-red-50"
                                : "text-neutral-500 bg-neutral-100"
                            }`}
                        >
                          {user.accountStatus === "ACTIVE" && "▲ Active"}
                          {user.accountStatus === "SUSPENDED" && "▼ Suspended"}
                          {user.accountStatus === "DORMANT" && "• Dormant"}
                        </span>
                      </td>

                      {/* Risk Level Column (Feature 4) */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center whitespace-nowrap shrink-0 gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${user.riskLevel === "HIGH"
                              ? "bg-red-100 text-red-800"
                              : user.riskLevel === "MEDIUM"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                        >
                          {user.riskLevel === "HIGH" && "⚠ High"}
                          {user.riskLevel === "MEDIUM" && "• Medium"}
                          {user.riskLevel === "LOW" && "✓ Low"}
                        </span>
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-3 text-neutral-400 text-[11px] whitespace-nowrap">
                        {user.lastActive}
                      </td>

                      {/* Actions Menu button (...) */}
                      <td className="py-3.5 pr-5 pl-2 text-right relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuUserId(isMenuOpen ? null : user.id)
                          }
                          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 cursor-pointer"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="19" cy="12" r="1" />
                            <circle cx="5" cy="12" r="1" />
                          </svg>
                        </button>

                        {/* Dropdown Menu (Screenshot 6 + Impersonate & Profile) */}
                        {isMenuOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setActiveMenuUserId(null)}
                            />
                            <div
                              className={`absolute right-4 w-48 bg-white rounded-2xl shadow-xl border border-neutral-200/90 py-1.5 z-40 text-left animate-in fade-in zoom-in-95 ${openUpwards ? "bottom-8 mb-1" : "top-full mt-1"
                                }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setInspectUser(user);
                                  setActiveMenuUserId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                              >
                                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                                <span>Open profile</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStartImpersonationWithPin(user)}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                              >
                                <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                                <span>View as user (Audit)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setNotifyUsers([user]);
                                  setIsNotifyModalOpen(true);
                                  setActiveMenuUserId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                              >
                                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                <span>Send notification</span>
                              </button>

                              <div className="my-1 border-t border-neutral-100" />

                              {user.accountStatus === "SUSPENDED" ? (
                                <button
                                  type="button"
                                  onClick={() => handleReactivateUserWithPin(user)}
                                  className="w-full px-3.5 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  <span>Reactivate account</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleInitiateSuspendWithPin(user)}
                                  className="w-full px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                  </svg>
                                  <span>Suspend account</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>
            Showing 1-{filteredUsers.length} of {users.length} users
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-400 disabled:opacity-50 text-xs font-semibold cursor-not-allowed"
            >
              Previous
            </button>
            <span className="font-bold text-[#001B40]">Page 1</span>
            <button
              type="button"
              disabled
              className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-400 disabled:opacity-50 text-xs font-semibold cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Suspend Modal */}
      {suspendTargetUser && (
        <OpsSuspendModal
          user={suspendTargetUser}
          isOpen={Boolean(suspendTargetUser)}
          onClose={() => setSuspendTargetUser(null)}
          onConfirmSuspension={handleConfirmSuspension}
        />
      )}

      {/* Bulk Action Modal (Feature 1) */}
      <OpsBulkActionModal
        actionType={bulkActionType}
        selectedUsers={selectedUsers}
        isOpen={Boolean(bulkActionType)}
        onClose={() => setBulkActionType(null)}
        onApplyBulkAction={handleApplyBulkUpdates}
      />

      {/* Send Notification Modal */}
      <OpsSendNotificationModal
        users={notifyUsers}
        isOpen={isNotifyModalOpen}
        onClose={() => {
          setIsNotifyModalOpen(false);
          setNotifyUsers([]);
        }}
      />

      {/* Rich User Profile 360° Drawer */}
      <OpsUserProfileDrawer
        user={inspectUser}
        isOpen={Boolean(inspectUser)}
        onClose={() => setInspectUser(null)}
        onOpenSuspendModal={(u) => {
          setInspectUser(null);
          setSuspendTargetUser(u);
        }}
        onOpenNotifyModal={(u) => {
          setNotifyUsers([u]);
          setIsNotifyModalOpen(true);
        }}
        onImpersonateUser={handleStartImpersonation}
        onUpdateUser={(updated) => {
          setInspectUser(updated);
          setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        }}
      />

      {/* Admin Security PIN Authorization */}
      <OpsSecurityPinModal
        isOpen={pendingPinAction.isOpen}
        title={pendingPinAction.title}
        description={pendingPinAction.description}
        actionLabel={pendingPinAction.actionLabel}
        onClose={() => setPendingPinAction((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={pendingPinAction.onSuccess}
      />
    </div>
  );
}
