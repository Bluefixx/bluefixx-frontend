"use client";

import React, { useState } from "react";
import { AdminRoleUser, AdminMfaStatus } from "../types";

interface OpsInviteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (admin: AdminRoleUser) => void;
}

export function OpsInviteAdminModal({
  isOpen,
  onClose,
  onInvite,
}: OpsInviteAdminModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRoleUser["role"]>("Support Agent");
  const [enforceMfa, setEnforceMfa] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onInvite({
        id: `ADM-${Date.now()}`,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
        status: "Invited",
        mfaStatus: enforceMfa ? "PENDING_SETUP" : "DISABLED",
        lastActive: "—",
      });
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-base font-extrabold text-[#001B40]">
            Invite New Administrator
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-sm p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Chinelo Nwachukwu"
              className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              Work Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@bluefixx.ng"
              className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              Assigned Operational Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#001B40]"
            >
              <option value="Super Administrator">Super Administrator (Full platform access)</option>
              <option value="Finance Admin">Finance Admin (Settlements, payouts, refunds)</option>
              <option value="Operations Admin">Operations Admin (Jobs, users, trades)</option>
              <option value="Support Lead">Support Lead (Disputes arbitration, SLA)</option>
              <option value="Verification Admin">Verification Admin (Worker KYC review)</option>
              <option value="Support Agent">Support Agent (Support tickets triage)</option>
              <option value="Compliance Lead">Compliance Lead (Safety, fraud audit)</option>
            </select>
          </div>

          {/* MFA Enforcement Toggle */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="enforceMfa"
              checked={enforceMfa}
              onChange={(e) => setEnforceMfa(e.target.checked)}
              className="rounded text-[#001B40] mt-0.5"
            />
            <label htmlFor="enforceMfa" className="cursor-pointer">
              <span className="font-bold text-[#001B40] block">Enforce Multi-Factor Authentication (2FA)</span>
              <span className="text-[11px] text-neutral-600 block mt-0.5">
                Staff member will be prompted to link an Authenticator app before granting dashboard access.
              </span>
            </label>
          </div>

          <p className="text-[11px] text-neutral-500 italic pt-1">
            An invite email with a 24-hour secure setup link will be dispatched to this address.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
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
              {isSubmitting ? "Sending invite..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
