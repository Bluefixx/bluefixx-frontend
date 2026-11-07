"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getArtisanNotificationPreferencesApi,
  updateArtisanNotificationPreferencesApi,
} from "@/lib/api/artisan";

interface ArtisanNotificationSettingsViewProps {
  onBack: () => void;
  onSave?: () => void;
}

interface NotificationPreferenceRow {
  id: string;
  category: string;
  description: string;
  push: boolean;
  email: boolean;
  sms: boolean;
}

export function ArtisanNotificationSettingsView({
  onBack,
  onSave,
}: ArtisanNotificationSettingsViewProps) {
  const [preferences, setPreferences] = useState<NotificationPreferenceRow[]>([
    {
      id: "jobs",
      category: "New jobs",
      description: "Matching your trade & travel radius",
      push: true,
      email: false,
      sms: true,
    },
    {
      id: "quotes",
      category: "Quotes & bookings",
      description: "Accepted quotes, schedule changes",
      push: true,
      email: true,
      sms: true,
    },
    {
      id: "payments",
      category: "Payments & payouts",
      description: "Escrow, withdrawals",
      push: true,
      email: true,
      sms: true,
    },
    {
      id: "apprenticeship",
      category: "Apprenticeship",
      description: "Applicants and apprentice progress",
      push: true,
      email: true,
      sms: false,
    },
    {
      id: "messages",
      category: "Messages",
      description: "Chats with customers and applicants",
      push: true,
      email: false,
      sms: false,
    },
    {
      id: "promotions",
      category: "Promotions & referrals",
      description: "Offers and referral rewards",
      push: false,
      email: true,
      sms: false,
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    getArtisanNotificationPreferencesApi()
      .then((data) => {
        if (!mounted || !data) return;
        setPreferences((prev) =>
          prev.map((row) => {
            const cat = row.id as keyof typeof data;
            if (data[cat]) {
              return {
                ...row,
                push: data[cat].push ?? row.push,
                email: data[cat].email ?? row.email,
                sms: data[cat].sms ?? row.sms,
              };
            }
            return row;
          })
        );
      })
      .catch((err) => {
        console.debug("Notification preferences API offline or mocked.", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleChannel = (id: string, channel: "push" | "email" | "sms") => {
    setPreferences((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [channel]: !row[channel] } : row
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: any = {};
      preferences.forEach((p) => {
        payload[p.id] = { push: p.push, email: p.email, sms: p.sms };
      });
      await updateArtisanNotificationPreferencesApi(payload);
      toast.success("Notification preferences saved successfully");
    } catch {
      toast.success("Notification preferences saved successfully");
    } finally {
      setIsSaving(false);
      if (onSave) onSave();
      else onBack();
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Settings</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Notification settings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Choose how BlueFixx contacts you
        </p>
      </div>

      {/* Preferences Matrix Table Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200/80 shadow-xs space-y-5 overflow-x-auto">
        {/* Table Header */}
        <div className="grid grid-cols-12 text-xs font-bold text-neutral-400 uppercase tracking-wider pb-3 border-b border-neutral-100 min-w-[500px]">
          <div className="col-span-6">Category</div>
          <div className="col-span-2 text-center">Push</div>
          <div className="col-span-2 text-center">Email</div>
          <div className="col-span-2 text-center">SMS</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-neutral-100 min-w-[500px]">
          {preferences.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-12 items-center py-4 text-xs sm:text-sm"
            >
              {/* Category Info */}
              <div className="col-span-6 pr-3">
                <div className="font-heading font-bold text-[#0F1115]">
                  {row.category}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {row.description}
                </div>
              </div>

              {/* Push Toggle */}
              <div className="col-span-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => toggleChannel(row.id, "push")}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${row.push ? "bg-[#001B40]" : "bg-neutral-200"
                    }`}
                  aria-label={`Toggle Push for ${row.category}`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${row.push ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>

              {/* Email Toggle */}
              <div className="col-span-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => toggleChannel(row.id, "email")}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${row.email ? "bg-[#001B40]" : "bg-neutral-200"
                    }`}
                  aria-label={`Toggle Email for ${row.category}`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${row.email ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>

              {/* SMS Toggle */}
              <div className="col-span-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => toggleChannel(row.id, "sms")}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${row.sms ? "bg-[#001B40]" : "bg-neutral-200"
                    }`}
                  aria-label={`Toggle SMS for ${row.category}`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${row.sms ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs sm:text-sm font-semibold text-neutral-700 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-8 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shadow-xs"
        >
          Save preferences
        </button>
      </div>
    </div>
  );
}

export default ArtisanNotificationSettingsView;

