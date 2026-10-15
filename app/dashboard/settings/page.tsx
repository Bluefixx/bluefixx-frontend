"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";

export default function SettingsPage() {
  const { selectedLanguageId, setSelectedLanguageId, activeRole } = useAuth();
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
          Settings & Preferences
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
          Customize notifications, languages, and security for your {activeRole} account.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-6">
        {/* Language Selection */}
        <div>
          <h3 className="font-bold text-sm text-[#0F1115] mb-1">Language</h3>
          <p className="text-xs text-neutral-500 mb-3">Choose the language you prefer for SMS and notifications.</p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "en", name: "English" },
              { id: "ig", name: "Igbo" },
              { id: "ha", name: "Hausa" },
              { id: "yo", name: "Yorùbá" },
              { id: "pcm", name: "Nigerian Pidgin" },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
                  setSelectedLanguageId(lang.id);
                  toast.success(`Language set to ${lang.name}`);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  selectedLanguageId === lang.id
                    ? "bg-[#001B40] text-white"
                    : "border border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-neutral-100" />

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#0F1115]">Notification Channels</h3>
          
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/60 cursor-pointer">
            <div>
              <span className="font-bold text-xs sm:text-sm text-neutral-900 block">SMS Security Alerts</span>
              <span className="text-xs text-neutral-500">Receive OTP codes and urgent arrival notifications via SMS</span>
            </div>
            <input
              type="checkbox"
              checked={smsNotifications}
              onChange={(e) => {
                setSmsNotifications(e.target.checked);
                toast.success("Notification preferences updated");
              }}
              className="w-4 h-4 rounded text-[#001B40] focus:ring-[#001B40]"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/60 cursor-pointer">
            <div>
              <span className="font-bold text-xs sm:text-sm text-neutral-900 block">Email Quotes & Receipts</span>
              <span className="text-xs text-neutral-500">Get copies of artisan quotes and escrow release receipts</span>
            </div>
            <input
              type="checkbox"
              checked={emailUpdates}
              onChange={(e) => {
                setEmailUpdates(e.target.checked);
                toast.success("Notification preferences updated");
              }}
              className="w-4 h-4 rounded text-[#001B40] focus:ring-[#001B40]"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
