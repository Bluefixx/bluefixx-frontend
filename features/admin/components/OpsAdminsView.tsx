"use client";

import React, { useState } from "react";
import {
  MOCK_ADMIN_ROLES,
  ADMIN_PERMISSION_COLUMNS,
  ADMIN_ROLE_PERMISSIONS,
} from "../mockPlatformData";
import { AdminRoleUser, AdminRoleType } from "../types";
import { OpsInviteAdminModal } from "./OpsInviteAdminModal";
import { OpsEditAdminRoleDrawer } from "./OpsEditAdminRoleDrawer";

export function OpsAdminsView() {
  const [admins, setAdmins] = useState<AdminRoleUser[]>(MOCK_ADMIN_ROLES);
  const [activeTab, setActiveTab] = useState<"directory" | "matrix">("directory");

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState<AdminRoleUser | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleInvite = (newAdmin: AdminRoleUser) => {
    setAdmins((prev) => [newAdmin, ...prev]);
    setToastMessage(`Staff invite sent to ${newAdmin.email}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateRole = (adminId: string, newRole: AdminRoleUser["role"]) => {
    setAdmins((prev) =>
      prev.map((adm) => (adm.id === adminId ? { ...adm, role: newRole } : adm))
    );
    setToastMessage("Staff role successfully updated.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSuspend = (adminId: string) => {
    setAdmins((prev) =>
      prev.map((adm) => {
        if (adm.id === adminId) {
          const nextStatus = adm.status === "Suspended" ? "Active" : "Suspended";
          return { ...adm, status: nextStatus };
        }
        return adm;
      })
    );
  };

  const handleEnforceMfa = (adminId: string) => {
    setAdmins((prev) =>
      prev.map((adm) =>
        adm.id === adminId
          ? { ...adm, mfaStatus: "ENFORCED", mfaMethod: "AUTHENTICATOR_APP" }
          : adm
      )
    );
    setToastMessage("Two-Factor Authentication requirement enforced on account.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Group permissions by category for the matrix tab
  const permissionCategories = ["Security & Access", "Financials", "Trust & Moderation", "Platform Operations"] as const;

  const roleList: AdminRoleType[] = [
    "Super Administrator",
    "Finance Admin",
    "Support Lead",
    "Operations Admin",
    "Verification Admin",
    "Support Agent",
    "Compliance Lead",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-neutral-400 mb-1">Administrators &amp; roles</div>
          <h1 className="text-2xl font-extrabold text-[#001B40] tracking-tight">
            Administrators and roles
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Who can access what and with what authority. Use of roles or decisions modifying a role expires 24h.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#001B40] text-white text-xs font-bold hover:bg-[#074292] shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <span>+</span>
          <span>Invite admin</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-neutral-200">
        <nav className="flex items-center gap-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("directory")}
            className={`pb-3 px-1 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === "directory"
                ? "border-[#001B40] text-[#001B40]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <span>Staff Directory</span>
            <span className="text-[10px] text-neutral-400 font-normal">({admins.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={`pb-3 px-1 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === "matrix"
                ? "border-[#001B40] text-[#001B40]"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <span>Permissions Matrix</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold border border-blue-100">
              Governance
            </span>
          </button>
        </nav>
      </div>

      {/* Directory Tab */}
      {activeTab === "directory" && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">MFA Security</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {admins.map((adm) => (
                  <tr key={adm.id} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Administrator Avatar, Name & Email */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#001B40] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {adm.fullName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-neutral-900 block">{adm.fullName}</span>
                          <span className="text-[11px] text-neutral-500 font-mono">{adm.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`whitespace-nowrap shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                          adm.role === "Super Administrator"
                            ? "bg-blue-100 text-blue-800 font-bold"
                            : adm.role === "Finance Admin"
                            ? "bg-purple-100 text-purple-800 font-bold"
                            : "bg-neutral-100 text-neutral-800"
                        }`}
                      >
                        {adm.role}
                      </span>
                    </td>

                    {/* MFA Security Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {adm.mfaStatus === "ENFORCED" ? (
                        <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          🛡️ Active ({adm.mfaMethod === "SMS_2FA" ? "SMS" : "App"})
                        </span>
                      ) : adm.mfaStatus === "PENDING_SETUP" ? (
                        <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          ⏳ Pending setup
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <span className="whitespace-nowrap shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            ✕ Disabled
                          </span>
                          <button
                            type="button"
                            onClick={() => handleEnforceMfa(adm.id)}
                            className="text-[10px] text-[#074292] font-bold hover:underline cursor-pointer"
                          >
                            Enforce
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`whitespace-nowrap shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          adm.status === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : adm.status === "Invited"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        ● {adm.status}
                      </span>
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                      {adm.lastActive}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAdminForEdit(adm);
                            setIsEditDrawerOpen(true);
                          }}
                          className="text-xs font-semibold text-[#074292] hover:underline cursor-pointer"
                        >
                          Edit role
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleSuspend(adm.id)}
                          className={`text-xs font-semibold cursor-pointer ${
                            adm.status === "Suspended"
                              ? "text-emerald-700 hover:underline"
                              : "text-red-600 hover:underline"
                          }`}
                        >
                          {adm.status === "Suspended" ? "Reactivate" : "Suspend"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
            <span>1–{admins.length} of {admins.length}</span>
            <div className="flex items-center gap-1.5">
              <button type="button" disabled className="px-2 py-1 rounded border border-neutral-200 text-neutral-300">
                &lt; Prev
              </button>
              <span className="font-semibold text-neutral-700">Page 1</span>
              <button type="button" disabled className="px-2 py-1 rounded border border-neutral-200 text-neutral-300">
                Next &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Matrix Tab */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-neutral-600 space-y-1">
            <span className="font-bold text-[#001B40] block text-sm">
              Role Authority Matrix &amp; Principle of Least Privilege
            </span>
            <p>
              Admins only possess privileges strictly necessary for their departmental responsibilities. Sensitive operations require secondary 6-digit PIN authorization and are logged to the immutable audit trail.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    <th className="py-3 px-4 min-w-[220px]">Permission &amp; Scope</th>
                    {roleList.map((r) => (
                      <th key={r} className="py-3 px-3 text-center whitespace-nowrap min-w-[110px]">
                        <span className="font-extrabold text-[#001B40] block">{r.replace(" Administrator", " Admin")}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {permissionCategories.map((cat) => {
                    const catPerms = ADMIN_PERMISSION_COLUMNS.filter((c) => c.category === cat);
                    return (
                      <React.Fragment key={cat}>
                        <tr className="bg-neutral-100/50 text-neutral-700 font-extrabold text-[11px]">
                          <td colSpan={roleList.length + 1} className="py-2 px-4 uppercase tracking-wider text-[#001B40]">
                            {cat}
                          </td>
                        </tr>
                        {catPerms.map((perm) => (
                          <tr key={perm.key} className="hover:bg-neutral-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-bold text-neutral-900 block">{perm.label}</span>
                              <span className="text-[11px] text-neutral-500 block">{perm.description}</span>
                            </td>
                            {roleList.map((role) => {
                              const hasPerm = ADMIN_ROLE_PERMISSIONS[role]?.includes(perm.key);
                              return (
                                <td key={`${role}-${perm.key}`} className="py-3 px-3 text-center">
                                  {hasPerm ? (
                                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-extrabold inline-flex items-center justify-center text-xs">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="text-neutral-300 font-mono text-sm">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <OpsInviteAdminModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={handleInvite}
      />

      {/* Edit Role Drawer */}
      <OpsEditAdminRoleDrawer
        admin={selectedAdminForEdit}
        isOpen={isEditDrawerOpen}
        onClose={() => {
          setIsEditDrawerOpen(false);
          setSelectedAdminForEdit(null);
        }}
        onUpdateRole={handleUpdateRole}
      />
    </div>
  );
}
