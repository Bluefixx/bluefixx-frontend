"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TalentReferralView } from "@/features/dashboard/components/talent/TalentReferralView";

export default function TalentReferralsPage() {
  const router = useRouter();

  return <TalentReferralView onBack={() => router.push("/talent/settings")} />;
}
