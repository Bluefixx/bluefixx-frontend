"use client";

import React from "react";
import toast from "react-hot-toast";
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
          <div className="w-16 h-16 rounded-full bg-[#001B40] text-white flex items-center justify-center font-bold text-2xl shrink-0">
            {user?.fullName ? user.fullName[0].toUpperCase() : "D"}
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-[#0F1115]">
              {user?.fullName || "Daniel Eze"}
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
              {user?.email || "daniel.eze@bluefixx.com"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60">
            <span className="text-neutral-400 block text-xs">Phone number</span>
            <span className="font-bold text-[#0F1115] mt-1 block">
              {user?.phone || "+234 803 245 0182"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60">
            <span className="text-neutral-400 block text-xs">Default location</span>
            <span className="font-bold text-[#0F1115] mt-1 block">
              {locationName || "Independence Layout, Enugu"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60">
            <span className="text-neutral-400 block text-xs">Street address</span>
            <span className="font-bold text-[#0F1115] mt-1 block">
              {user?.streetAddress || "14 Ziks Avenue"}
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="pt-2">
          <button
            onClick={() => toast.success("Profile changes saved")}
            className="px-5 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            Update profile
          </button>
        </div>
      </div>
    </div>
  );
}
