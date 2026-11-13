"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TalentDiscoveryView } from "@/features/dashboard/components/talent/TalentDiscoveryView";

export default function TalentDiscoverPage() {
  const router = useRouter();

  return (
    <TalentDiscoveryView
      onBack={() => router.push("/talent/home")}
      onSelectProgramme={(prog) => router.push(`/talent/discover/${prog.id}`)}
    />
  );
}
