"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TalentProfileSettingsView } from "@/features/dashboard/components/talent/TalentProfileSettingsView";

export default function TalentSettingsPage() {
  const router = useRouter();

  return (
    <TalentProfileSettingsView
      onEditProfile={() => router.push("/talent/settings/edit-profile")}
      onOpenPin={() => router.push("/talent/settings/transaction-pin")}
      onOpenNotifications={() => router.push("/talent/settings/notifications")}
      onOpenCertifications={() => router.push("/talent/certificates")}
      onOpenWallet={() => router.push("/talent/enrollments")}
      onOpenSafetySupport={() => router.push("/talent/settings/safety-support")}
      onOpenReportProblem={() => router.push("/talent/settings/safety-support")}
      onOpenReferrals={() => router.push("/talent/settings/referrals")}
    />
  );
}
