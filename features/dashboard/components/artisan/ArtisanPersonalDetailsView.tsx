"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";

interface ArtisanPersonalDetailsViewProps {
  onBackToProfile: () => void;
  onSuccess?: () => void;
}

export function ArtisanPersonalDetailsView({
  onBackToProfile,
  onSuccess,
}: ArtisanPersonalDetailsViewProps) {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Obiora");
  const [phoneNumber, setPhoneNumber] = useState("+234 803 245 0182");
  const [emailAddress, setEmailAddress] = useState(user?.email || "john.obiora@bluefixx.com");
  const [address, setAddress] = useState("14 Ogui Road, Independence Layout, Enugu");
  const [emergencyContact, setEmergencyContact] = useState("+234 802 119 4430");

  const handleSave = () => {
    toast.success("Personal details updated successfully!");
    if (onSuccess) onSuccess();
    else onBackToProfile();
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onBackToProfile}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Profile</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Personal details
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Profile Photo (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-neutral-100 mx-auto border-2 border-white shadow-xs">
            <Image
              src="/images/david.jpg"
              alt="John Obiora"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => toast("Photo upload dialog opened", { icon: "📷" })}
              className="absolute bottom-1 right-1 p-1.5 rounded-lg bg-[#001B40] text-white shadow-xs hover:bg-[#074292] transition-colors cursor-pointer"
              title="Change photo"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-heading font-bold text-sm text-[#0F1115]">
              Profile photo
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              A photo helps clients and talents recognize you before you start jobs.
            </p>
          </div>
        </div>

        {/* Right Card: Personal Info Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-5">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F1115]">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F1115]">
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F1115]">
              Phone number
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F1115]">
              Email address
            </label>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F1115]">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
            />
          </div>

          {/* Emergency Contact */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F1115]">
              Emergency contact
            </label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#001B40]"
            />
            <p className="text-[11px] text-neutral-400">
              Used for identity verification and safety.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onBackToProfile}
              className="px-6 py-3 rounded-xl border border-neutral-300 text-xs sm:text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-8 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ArtisanPersonalDetailsView;

