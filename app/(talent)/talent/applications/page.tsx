"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TalentApplicationsListView } from "@/features/dashboard/components/talent/TalentApplicationsListView";

export default function TalentApplicationsPage() {
  const router = useRouter();

  return (
    <TalentApplicationsListView
      onBack={() => router.push("/talent/home")}
      onFindMore={() => router.push("/talent/discover")}
      onSelectApplication={(app) => router.push(`/talent/applications/${app.id}`)}
      onMakePayment={(app) => router.push(`/talent/applications/${app.id}`)}
    />
  );
}
