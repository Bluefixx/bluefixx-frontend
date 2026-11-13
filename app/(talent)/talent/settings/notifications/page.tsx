"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { NotificationsSettingsView } from "@/features/dashboard/components/settings/NotificationsSettingsView";

export default function TalentNotificationsPage() {
  const router = useRouter();

  return (
    <NotificationsSettingsView onBack={() => router.push("/talent/settings")} />
  );
}
