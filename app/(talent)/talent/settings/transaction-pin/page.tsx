"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TalentTransactionPinView } from "@/features/dashboard/components/talent/TalentTransactionPinView";

export default function TalentTransactionPinPage() {
  const router = useRouter();

  return (
    <TalentTransactionPinView
      onBack={() => router.push("/talent/settings")}
      onSuccessBack={() => router.push("/talent/settings")}
    />
  );
}
