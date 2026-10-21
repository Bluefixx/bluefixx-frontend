"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface NotificationsSettingsViewProps {
  onBack: () => void;
}

interface NotificationCategorySetting {
  id: string;
  name: string;
  description: string;
  push: boolean;
  email: boolean;
  sms: boolean;
}

export function NotificationsSettingsView({ onBack }: NotificationsSettingsViewProps) {
  const [settings, setSettings] = useState<NotificationCategorySetting[]>([
    {
      id: "jobs",
      name: "Jobs & bookings",
      description: "Quotes, scheduling, job updates",
      push: true,
      email: true,
      sms: true,
    },
    {
      id: "payments",
      name: "Payments & wallet",
      description: "Deposit, releases, refunds",
      push: true,
      email: true,
      sms: true,
    },
    {
      id: "messages",
      name: "Messages",
      description: "Chats with artisans",
      push: true,
      email: false,
      sms: false,
    },
    {
      id: "reviews",
      name: "Reviews & warranty",
      description: "Review reminders, warranty updates",
      push: true,
      email: true,
      sms: false,
    },
    {
      id: "promotions",
      name: "Promotions & referrals",
      description: "Offers and referral rewards",
      push: false,
      email: true,
      sms: false,
    },
  ]);

  const handleToggle = (id: string, channel: "push" | "email" | "sms") => {
    setSettings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [channel]: !item[channel] } : item
      )
    );
  };

  const handleSave = () => {
    toast.success("Notification preferences saved successfully");
    onBack();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-150">
      {/* Top Header */}
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
          Notification settings
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
          Choose how Bluefixx contacts you
        </p>
      </div>

      {/* Main Settings Matrix Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          <div className="col-span-6 sm:col-span-7">Category</div>
          <div className="col-span-2 sm:col-span-1.5 text-center">Push</div>
          <div className="col-span-2 sm:col-span-1.5 text-center">Email</div>
          <div className="col-span-2 sm:col-span-2 text-center">SMS</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-neutral-100">
          {settings.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 px-6 py-4.5 items-center hover:bg-neutral-50/40 transition-colors"
            >
              {/* Category details */}
              <div className="col-span-6 sm:col-span-7 pr-3">
                <p className="font-heading font-bold text-xs sm:text-sm text-[#001B40]">
                  {item.name}
                </p>
                <p className="font-sans text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                  {item.description}
                </p>
              </div>

              {/* Push Toggle */}
              <div className="col-span-2 sm:col-span-1.5 flex justify-center">
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.push}
                  onClick={() => handleToggle(item.id, "push")}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer focus:outline-hidden ${
                    item.push ? "bg-[#001B40]" : "bg-neutral-200"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                      item.push ? "translate-x-4.5 left-0" : "translate-x-0.5 left-0"
                    }`}
                  />
                </button>
              </div>

              {/* Email Toggle */}
              <div className="col-span-2 sm:col-span-1.5 flex justify-center">
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.email}
                  onClick={() => handleToggle(item.id, "email")}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer focus:outline-hidden ${
                    item.email ? "bg-[#001B40]" : "bg-neutral-200"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                      item.email ? "translate-x-4.5 left-0" : "translate-x-0.5 left-0"
                    }`}
                  />
                </button>
              </div>

              {/* SMS Toggle */}
              <div className="col-span-2 sm:col-span-2 flex justify-center">
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.sms}
                  onClick={() => handleToggle(item.id, "sms")}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer focus:outline-hidden ${
                    item.sms ? "bg-[#001B40]" : "bg-neutral-200"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                      item.sms ? "translate-x-4.5 left-0" : "translate-x-0.5 left-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shadow-xs"
        >
          Save preferences
        </button>
      </div>
    </div>
  );
}
