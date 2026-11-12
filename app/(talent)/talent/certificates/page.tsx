"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TalentCertificatesView } from "@/features/dashboard/components/talent/TalentCertificatesView";

export default function TalentCertificatesPage() {
  const router = useRouter();

  return (
    <TalentCertificatesView
      onBack={() => router.push("/talent/home")}
      onFindMore={() => router.push("/talent/discover")}
    />
  );
}
