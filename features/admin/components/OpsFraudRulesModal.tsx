"use client";

import React, { useState } from "react";
import { ReferralFraudRules } from "../types";

interface OpsFraudRulesModalProps {
  rules: ReferralFraudRules;
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: ReferralFraudRules) => void;
}

export function OpsFraudRulesModal({
  rules,
  isOpen,
  onClose,
  onSave,
}: OpsFraudRulesModalProps) {
  const [maxAccountsPerDevice, setMaxAccountsPerDevice] = useState(rules.maxAccountsPerDevice);
  const [maxReferralsPer24h, setMaxReferralsPer24h] = useState(rules.maxReferralsPer24h);
  const [autoHoldOnVpn, setAutoHoldOnVpn] = useState(rules.autoHoldOnVpn);
  const [requireFirstJobCompleted, setRequireFirstJobCompleted] = useState(rules.requireFirstJobCompleted);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      maxAccountsPerDevice,
      maxReferralsPer24h,
      autoHoldOnVpn,
      requireFirstJobCompleted,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4 animate-in zoom-in-95 duration-200 text-xs">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#001B40]">
              Anti-Fraud &amp; Referral Velocity Rules
            </h3>
            <p className="text-neutral-500 text-xs mt-0.5">
              Automated rules triggering instantaneous reward holds and fraud investigation flags.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-sm p-1 rounded-md cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <label className="block font-bold text-neutral-800 mb-1">
                Max Accounts Per Device
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={maxAccountsPerDevice}
                onChange={(e) => setMaxAccountsPerDevice(Number(e.target.value))}
                className="w-full p-2 bg-white rounded-lg border border-neutral-300 font-bold text-neutral-900 focus:outline-none focus:border-[#001B40]"
              />
              <span className="text-[10px] text-neutral-500 block mt-1">
                Flags self-referral rings sharing hardware ID/IMEI.
              </span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <label className="block font-bold text-neutral-800 mb-1">
                Max Referrals / 24 Hours
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={maxReferralsPer24h}
                onChange={(e) => setMaxReferralsPer24h(Number(e.target.value))}
                className="w-full p-2 bg-white rounded-lg border border-neutral-300 font-bold text-neutral-900 focus:outline-none focus:border-[#001B40]"
              />
              <span className="text-[10px] text-neutral-500 block mt-1">
                Velocity ceiling before automated payout freeze.
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-200 bg-neutral-50/60 cursor-pointer">
              <input
                type="checkbox"
                checked={autoHoldOnVpn}
                onChange={(e) => setAutoHoldOnVpn(e.target.checked)}
                className="rounded text-[#001B40] mt-0.5"
              />
              <div>
                <span className="font-bold text-neutral-900 block">Auto-Hold on VPN / Subnet Overlap</span>
                <span className="text-[11px] text-neutral-500 block">
                  Automatically holds reward when referrer and referred user share the same public IP address.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-200 bg-neutral-50/60 cursor-pointer">
              <input
                type="checkbox"
                checked={requireFirstJobCompleted}
                onChange={(e) => setRequireFirstJobCompleted(e.target.checked)}
                className="rounded text-[#001B40] mt-0.5"
              />
              <div>
                <span className="font-bold text-neutral-900 block">Mandate Verified Marketplace Transaction</span>
                <span className="text-[11px] text-neutral-500 block">
                  Rewards unlock only after the invited user successfully posts or delivers their first completed job.
                </span>
              </div>
            </label>
          </div>

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
              className="px-5 py-2 rounded-xl bg-[#001B40] text-white font-bold hover:bg-[#074292] shadow-xs cursor-pointer"
            >
              Save Velocity Rules
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
