"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TalentEditProfileView } from "@/features/dashboard/components/talent/TalentEditProfileView";

function TalentEditProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "1";

  return (
    <TalentEditProfileView
      isOnboarding={isOnboarding}
      onBack={() => router.push(isOnboarding ? "/talent/home" : "/talent/settings")}
      onSaveSuccess={() => router.push(isOnboarding ? "/talent/home" : "/talent/settings")}
    />
  );
}

export default function TalentEditProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto py-12 text-center text-xs text-neutral-400 font-sans">
          Loading profile...
        </div>
      }
    >
      <TalentEditProfileContent />
    </Suspense>
  );
}
