"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface NotificationsSettingsViewProps {
  onBack: () => void;
}

export function NotificationsSettingsView({ onBack }: NotificationsSettingsViewProps) {
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailReceipts, setEmailReceipts] = useState(true);
  const [pushArrivals, setPushArrivals] = useState(true);
  const [promoOffers, setPromoOffers] = useState(false);

  const handleSave = () => {
    toast.success("Notification preferences updated");
    onBack();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Settings</span>
        </button>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Notifications
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
          Control how you receive alerts, quotes and updates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
          <h2 className="font-heading font-bold text-base sm:text-lg text-[#001B40]">
            Notification channels
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 cursor-pointer hover:bg-neutral-100/60 transition-colors">
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#001B40] block">
                  SMS Security Alerts
                </span>
                <span className="text-xs text-neutral-500">
                  Receive OTP codes, login verification and artisan arrival SMS
                </span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-5 h-5 rounded text-[#001B40] focus:ring-[#001B40] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 cursor-pointer hover:bg-neutral-100/60 transition-colors">
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#001B40] block">
                  Email Quotes &amp; Receipts
                </span>
                <span className="text-xs text-neutral-500">
                  Receive detailed quote PDFs, payment releases and warranty terms
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailReceipts}
                onChange={(e) => setEmailReceipts(e.target.checked)}
                className="w-5 h-5 rounded text-[#001B40] focus:ring-[#001B40] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 cursor-pointer hover:bg-neutral-100/60 transition-colors">
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#001B40] block">
                  Push Notifications
                </span>
                <span className="text-xs text-neutral-500">
                  Instant real-time browser alerts when an artisan messages you
                </span>
              </div>
              <input
                type="checkbox"
                checked={pushArrivals}
                onChange={(e) => setPushArrivals(e.target.checked)}
                className="w-5 h-5 rounded text-[#001B40] focus:ring-[#001B40] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 cursor-pointer hover:bg-neutral-100/60 transition-colors">
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#001B40] block">
                  Promotions &amp; Vouchers
                </span>
                <span className="text-xs text-neutral-500">
                  Special seasonal discounts and referral bonuses
                </span>
              </div>
              <input
                type="checkbox"
                checked={promoOffers}
                onChange={(e) => setPromoOffers(e.target.checked)}
                className="w-5 h-5 rounded text-[#001B40] focus:ring-[#001B40] cursor-pointer"
              />
            </label>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3.5 bg-[#001B40] hover:bg-[#074292] text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm cursor-pointer"
            >
              Save preferences
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#001B40]">
            Notification policy
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Essential transactional alerts regarding security and active repairs cannot be disabled to ensure your safety and warranty validity.
          </p>
        </div>
      </div>
    </div>
  );
}
