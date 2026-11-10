"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/stores/auth-store";
import { ArtisanProfileView } from "@/features/dashboard/components/artisan/ArtisanProfileView";

export default function ProfilePage() {
  const { user, activeRole, locationName } = useAuth();
  const router = useRouter();

  if (activeRole === "artisan") {
    return (
      <ArtisanProfileView
        onBackToDashboard={() => router.push("/dashboard")}
        onNavigateToEarnings={() => router.push("/dashboard?view=earnings")}
        onNavigateToTalent={() => router.push("/dashboard?view=training-programmes")}
        onNavigateToNotifications={() => router.push("/notifications")}
        onNavigateToSettings={() => router.push("/settings")}
      />
    );
  }

  const initialLetter = user?.fullName?.trim() ? user.fullName.trim()[0].toUpperCase() : "U";

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0F1115] tracking-tight">
          My Profile
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-500 mt-1">
          Manage your verified BlueFixx profile, security, and addresses.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-neutral-100">
          <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-neutral-100 bg-[#001B40] text-white flex items-center justify-center font-bold text-2xl">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.fullName || "User Avatar"}
                fill
                className="object-cover"
              />
            ) : (
              <span>{initialLetter}</span>
            )}
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-[#0F1115]">
              {user?.fullName || "User"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md capitalize">
                {activeRole} Profile
              </span>
              <span className="text-xs text-emerald-600 font-medium">● Identity Verified</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60">
            <span className="text-neutral-400 block text-xs">Email address</span>
            <span className="font-bold text-[#0F1115] mt-1 block">
              {user?.email || "Not specified"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60">
            <span className="text-neutral-400 block text-xs">Phone number</span>
            <span className="font-bold text-[#0F1115] mt-1 block">
              {user?.phone || "Not specified"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60">
            <span className="text-neutral-400 block text-xs">Default location</span>
            <span className="font-bold text-[#0F1115] mt-1 block">
              {locationName || "Lagos, Nigeria"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60">
            <span className="text-neutral-400 block text-xs">Street address</span>
            <span className="font-bold text-[#0F1115] mt-1 block">
              {user?.streetAddress || "Not specified"}
            </span>
          </div>
        </div>

        {/* Action: Redirect to settings where user can make edits */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={() => router.push("/settings?tab=personal-details")}
            className="px-5 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <span>Edit profile in Settings</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => router.push("/wallet")}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            View Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
