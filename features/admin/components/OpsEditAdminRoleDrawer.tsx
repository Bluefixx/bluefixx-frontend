"use client";

import React, { useState, useEffect } from "react";
import { AdminRoleUser } from "../types";

interface OpsEditAdminRoleDrawerProps {
  admin: AdminRoleUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRole: (adminId: string, newRole: AdminRoleUser["role"]) => void;
}

export function OpsEditAdminRoleDrawer({
  admin,
  isOpen,
  onClose,
  onUpdateRole,
}: OpsEditAdminRoleDrawerProps) {
  const [role, setRole] = useState<AdminRoleUser["role"]>(admin?.role || "Support Agent");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (admin) {
      setRole(admin.role);
    }
  }, [admin]);

  if (!isOpen || !admin) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onUpdateRole(admin.id, role);
      setIsSubmitting(false);
      setToastMessage("Role updated successfully");
      setTimeout(() => {
        setToastMessage(null);
        onClose();
      }, 900);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200 overflow-hidden animate-in slide-in-from-right duration-200">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Role &amp; Permissions
            </span>
            <h2 className="text-base font-bold text-[#001B40] mt-0.5">
              {admin.fullName}
            </h2>
            <p className="text-[11px] text-neutral-500 font-mono">{admin.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
          {toastMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium">
              ✓ {toastMessage}
            </div>
          )}

          <div>
            <label className="block font-bold text-neutral-700 mb-1.5 uppercase tracking-wider text-[11px]">
              Assigned Operational Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-none focus:border-[#001B40]"
            >
              <option value="Super Administrator">Super Administrator (Full access)</option>
              <option value="Finance Admin">Finance Admin (Settlements, payouts, refunds)</option>
              <option value="Operations Admin">Operations Admin (Jobs, users, trades)</option>
              <option value="Support Lead">Support Lead (Disputes arbitration, SLA)</option>
              <option value="Verification Admin">Verification Admin (Worker KYC review)</option>
              <option value="Support Agent">Support Agent (Support tickets triage)</option>
              <option value="Compliance Lead">Compliance Lead (Safety, fraud audit)</option>
            </select>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Effective Permissions</span>
            <ul className="space-y-1.5 text-neutral-700 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600">✓</span>
                <span>Access Operations Console dashboard</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600">✓</span>
                <span>View user profiles and marketplace job feeds</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className={role.includes("Finance") || role.includes("Super") ? "text-emerald-600" : "text-neutral-300"}>
                  {role.includes("Finance") || role.includes("Super") ? "✓" : "✕"}
                </span>
                <span>Release escrow payouts and approve withdrawals</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className={role.includes("Support") || role.includes("Super") ? "text-emerald-600" : "text-neutral-300"}>
                  {role.includes("Support") || role.includes("Super") ? "✓" : "✕"}
                </span>
                <span>Arbitrate disputes and modify customer refunds</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className={role === "Super Administrator" ? "text-emerald-600" : "text-neutral-300"}>
                  {role === "Super Administrator" ? "✓" : "✕"}
                </span>
                <span>Modify administrator roles and manage commission rates</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-[11px] text-amber-900 leading-relaxed">
            <span className="font-bold block">24-Hour Elevated Privilege Rule</span>
            Any sensitive privilege change is logged to the immutable audit trail and requires re-authentication.
          </div>

          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#001B40] text-white font-bold hover:bg-[#074292] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
