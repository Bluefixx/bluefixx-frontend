"use client";

import React, { useState } from "react";
import { INITIAL_ADMIN_SETTINGS } from "../mockPlatformData";
import { AdminPlatformSettings } from "../types";
import { OpsSecurityPinModal } from "./OpsSecurityPinModal";

export function OpsSettingsView() {
  const [settings, setSettings] = useState<AdminPlatformSettings>(INITIAL_ADMIN_SETTINGS);
  const [activeTab, setActiveTab] = useState<
    "general" | "marketplace" | "payments" | "withdrawals" | "refunds" | "security"
  >("general");

  // Security PIN modal state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    section: string;
    description: string;
    callback: () => void;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger PIN modal before saving sensitive settings
  const handleSaveWithPin = (section: string, description: string, callback: () => void) => {
    setPendingAction({ section, description, callback });
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    if (pendingAction) {
      pendingAction.callback();
      setToastMessage(`${pendingAction.section} successfully updated and recorded in audit trail.`);
      setTimeout(() => setToastMessage(null), 3500);
      setPendingAction(null);
    }
  };

  const toggleMaintenanceMode = () => {
    const nextState = !settings.security.maintenanceModeActive;
    handleSaveWithPin(
      "Emergency Maintenance Mode",
      nextState
        ? "Enable emergency read-only maintenance mode. Job bookings and bank payouts will be halted platform-wide."
        : "Disable maintenance mode and restore normal live platform operations.",
      () => {
        setSettings((prev) => ({
          ...prev,
          security: {
            ...prev.security,
            maintenanceModeActive: nextState,
          },
        }));
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-neutral-400 mb-1">Platform</div>
        <h1 className="text-2xl font-extrabold text-[#001B40] tracking-tight">Settings</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Platform configuration. Financial and security settings are restricted and every change is logged.
        </p>
      </div>

      {/* Emergency Maintenance Mode Kill-Switch Banner */}
      <div
        className={`p-4 rounded-2xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          settings.security.maintenanceModeActive
            ? "bg-red-50 border-red-300 text-red-900"
            : "bg-neutral-50 border-neutral-200 text-neutral-700"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-lg leading-none mt-0.5">
            {settings.security.maintenanceModeActive ? "🚨" : "🛡️"}
          </span>
          <div>
            <h3 className="font-extrabold text-xs">
              {settings.security.maintenanceModeActive
                ? "Emergency Platform Maintenance Mode is ACTIVE"
                : "Platform Operational Status: Normal Operations"}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {settings.security.maintenanceModeActive
                ? "New job requests and bank settlements are paused. Only viewing and active dispute chat remain accessible."
                : "All marketplace booking, instant escrow, and bank withdrawal rails are currently operational."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleMaintenanceMode}
          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0 self-start sm:self-auto ${
            settings.security.maintenanceModeActive
              ? "bg-red-600 text-white hover:bg-red-700 shadow-xs"
              : "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100"
          }`}
        >
          {settings.security.maintenanceModeActive ? "Deactivate Maintenance" : "Emergency Maintenance Toggle"}
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Settings Grid: 2-Columns matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Navigation Menu (1 col) */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs p-2 text-xs font-bold space-y-1">
          {[
            { id: "general", label: "General" },
            { id: "marketplace", label: "Marketplace" },
            { id: "payments", label: "Payments" },
            { id: "withdrawals", label: "Withdrawals" },
            { id: "refunds", label: "Refunds" },
            { id: "security", label: "Security" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-50 text-[#001B40] font-extrabold"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Settings Form Container (3 cols) */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 space-y-6 text-xs">
          {/* General Section */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#001B40]">Platform details</h2>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Brand name, customer support contact channels, and geographical jurisdiction.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Platform name</label>
                  <input
                    type="text"
                    value={settings.general.platformName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, platformName: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Support email</label>
                  <input
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, supportEmail: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Support phone</label>
                  <input
                    type="text"
                    value={settings.general.supportPhone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, supportPhone: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Default region</label>
                  <select
                    value={settings.general.defaultRegion}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, defaultRegion: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#001B40]"
                  >
                    <option value="Lagos region">Lagos region</option>
                    <option value="Abuja FCT">Abuja FCT</option>
                    <option value="Rivers / Port Harcourt">Rivers / Port Harcourt</option>
                    <option value="All Nigeria">All Nigeria</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setToastMessage("General platform details updated.");
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#001B40] text-white font-bold hover:bg-[#074292] shadow-xs cursor-pointer"
                >
                  Save general details
                </button>
              </div>
            </div>
          )}

          {/* Marketplace Section */}
          {activeTab === "marketplace" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-bold text-[#001B40]">Marketplace rules</h2>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Controls worker dispatch qualification, customer selection autonomy, and booking floors.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-neutral-100">
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="font-bold text-neutral-900 block">Require verification before matching</span>
                    <span className="text-[11px] text-neutral-500 block">
                      Unverified workers cannot be assigned to jobs by customer match algorithm.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.marketplace.requireVerificationBeforeMatching}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        marketplace: {
                          ...settings.marketplace,
                          requireVerificationBeforeMatching: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-[#001B40] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-bold text-neutral-900 block">Allow customers to invite specific workers</span>
                    <span className="text-[11px] text-neutral-500 block">
                      Bypasses automated matching when customer explicitly requests a specific artisan.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.marketplace.allowCustomerInviteSpecificWorker}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        marketplace: {
                          ...settings.marketplace,
                          allowCustomerInviteSpecificWorker: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-[#001B40] cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Minimum job value</label>
                    <input
                      type="text"
                      value="₦5,000"
                      readOnly
                      className="w-full p-2.5 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Free cancellation window</label>
                    <select
                      value={settings.marketplace.freeCancellationWindowHours}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          marketplace: {
                            ...settings.marketplace,
                            freeCancellationWindowHours: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#001B40]"
                    >
                      <option value={1}>1 hour after matching</option>
                      <option value={2}>2 hours after matching</option>
                      <option value={4}>4 hours after matching</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setToastMessage("Marketplace dispatch rules updated.");
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#001B40] text-white font-bold hover:bg-[#074292] shadow-xs cursor-pointer"
                >
                  Save marketplace rules
                </button>
              </div>
            </div>
          )}

          {/* Payments Section */}
          {activeTab === "payments" && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#001B40]">Payments and commission</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                    Restricted · Finance Admin and above
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Defines take rates, maximum single-transaction caps, and automated escrow release behavior.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Standard commission</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.payments.standardCommissionRate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          payments: {
                            ...settings.payments,
                            standardCommissionRate: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#001B40]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">%</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Single transaction limit</label>
                  <input
                    type="text"
                    value="₦500,000"
                    readOnly
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3.5 divide-y divide-neutral-100">
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="font-bold text-neutral-900 block">Auto-release escrow on customer confirmation</span>
                    <span className="text-[11px] text-neutral-500 block">
                      Immediate instantaneous payout settlement when customer marks job as completed.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.payments.autoReleaseEscrowOnCustomerConfirmation}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payments: {
                          ...settings.payments,
                          autoReleaseEscrowOnCustomerConfirmation: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-[#001B40] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-bold text-neutral-900 block">Split fee for pre-work drawing / material</span>
                    <span className="text-[11px] text-neutral-500 block">
                      Allows artisans to claim first 40% tranche of escrow for materials before job commences.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.payments.splitFeeForPreWorkDrawingOrMaterial}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payments: {
                          ...settings.payments,
                          splitFeeForPreWorkDrawingOrMaterial: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-[#001B40] cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveWithPin(
                      "Payment Commission Settings",
                      `Update standard platform commission to ${settings.payments.standardCommissionRate}% and save transaction policies.`,
                      () => {}
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-[#001B40] text-white font-bold hover:bg-[#074292] shadow-xs cursor-pointer"
                >
                  Save payment settings
                </button>
              </div>
            </div>
          )}

          {/* Withdrawals Section */}
          {activeTab === "withdrawals" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-bold text-[#001B40]">Withdrawals rules</h2>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Thresholds governing commercial bank disbursement queues and mandatory fraud review gates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Minimum withdrawal</label>
                  <input
                    type="text"
                    value="₦2,000"
                    readOnly
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Manual approval threshold</label>
                  <input
                    type="text"
                    value="₦200,000"
                    readOnly
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Payout bank</label>
                  <select
                    value={settings.withdrawals.payoutBank}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        withdrawals: {
                          ...settings.withdrawals,
                          payoutBank: e.target.value,
                        },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#001B40]"
                  >
                    <option value="Providus Bank">Providus Bank (Direct API)</option>
                    <option value="Zenith Bank">Zenith Bank Plc</option>
                    <option value="GTBank">Guaranty Trust Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Transaction PIN required</label>
                  <select
                    value={settings.withdrawals.transactionPinRequired}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        withdrawals: {
                          ...settings.withdrawals,
                          transactionPinRequired: e.target.value as any,
                        },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#001B40]"
                  >
                    <option value="ALWAYS">Always required</option>
                    <option value="OVER_THRESHOLD">Only above ₦50,000</option>
                    <option value="DISABLED">Disabled (Not recommended)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveWithPin(
                      "Withdrawal Thresholds",
                      "Update commercial bank settlement rail configuration and approval thresholds.",
                      () => {}
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-[#001B40] text-white font-bold hover:bg-[#074292] shadow-xs cursor-pointer"
                >
                  Save withdrawal rules
                </button>
              </div>
            </div>
          )}

          {/* Refunds Section */}
          {activeTab === "refunds" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-bold text-[#001B40]">Refund rules</h2>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Policies for customer clawbacks, commission forfeiture, and audit justification requirements.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-neutral-100">
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="font-bold text-neutral-900 block">Require reason on every refund</span>
                    <span className="text-[11px] text-neutral-500 block">
                      Reasons are recorded in the audit log and shared in text with the customer.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.refunds.requireReasonOnEveryRefund}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        refunds: {
                          ...settings.refunds,
                          requireReasonOnEveryRefund: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-[#001B40] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-bold text-neutral-900 block">Remove platform fee on full refunds</span>
                    <span className="text-[11px] text-neutral-500 block">
                      Platform fee is refunded when the worker did not perform any service.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.refunds.removePlatformFeeOnFullRefunds}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        refunds: {
                          ...settings.refunds,
                          removePlatformFeeOnFullRefunds: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-[#001B40] cursor-pointer"
                  />
                </div>

                <div className="pt-4 max-w-sm">
                  <label className="block font-bold text-neutral-700 mb-1">Refund request window</label>
                  <select
                    value={settings.refunds.refundRequestWindowHours}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        refunds: {
                          ...settings.refunds,
                          refundRequestWindowHours: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#001B40]"
                  >
                    <option value={24}>24 hours after completion</option>
                    <option value={48}>48 hours after completion</option>
                    <option value={72}>72 hours after completion</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setToastMessage("Refund policies successfully updated.");
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#001B40] text-white font-bold hover:bg-[#074292] shadow-xs cursor-pointer"
                >
                  Save refund policies
                </button>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeTab === "security" && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#001B40]">Security and authentication</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#001B40] border border-blue-200">
                    Restricted · Super Admin only
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Platform access tokens, administrative two-factor enforcement, and idle session revocation.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-neutral-100">
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="font-bold text-neutral-900 block">Require two-factor authentication for all admins</span>
                    <span className="text-[11px] text-neutral-500 block">
                      Mandatory on every admin login session. Strongly recommended.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.enforceMfaForAllAdmins}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          enforceMfaForAllAdmins: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-[#001B40] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-bold text-neutral-900 block">Session timeout after 30 min idle</span>
                    <span className="text-[11px] text-neutral-500 block">
                      Automatically logs out unattended administrative workstations.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.sessionTimeoutMinutes === 30}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          sessionTimeoutMinutes: e.target.checked ? 30 : 120,
                        },
                      })
                    }
                    className="w-5 h-5 accent-[#001B40] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-bold text-neutral-900 block">Alert on sensitive action outside working hours</span>
                    <span className="text-[11px] text-neutral-500 block">
                      Dispatches security SMS and email alerts if refunds or role modifications occur between 10PM and 6AM.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.alertOnSensitiveActionOutsideWorkingHours}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          alertOnSensitiveActionOutsideWorkingHours: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-[#001B40] cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveWithPin(
                      "Platform Security Governance",
                      "Update administrative security policies, 2FA requirements, and off-hour alert triggers.",
                      () => {}
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-[#001B40] text-white font-bold hover:bg-[#074292] shadow-xs cursor-pointer"
                >
                  Save security settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security PIN Authorization Modal */}
      <OpsSecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        title={pendingAction?.section || "Authorize Settings Modification"}
        description={pendingAction?.description || "Confirm administrative authorization to apply settings changes."}
      />
    </div>
  );
}
