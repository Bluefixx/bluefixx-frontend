"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TalentEditProfileView } from "@/features/dashboard/components/talent/TalentEditProfileView";

export default function TalentEditProfilePage() {
  const router = useRouter();

  return (
    <TalentEditProfileView
      onBack={() => router.push("/talent/settings")}
      onSaveSuccess={() => router.push("/talent/settings")}
    />
  );
}
