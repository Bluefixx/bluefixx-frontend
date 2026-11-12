"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TalentRefundRequestedConfirmationView } from "@/features/dashboard/components/talent/TalentRefundRequestedConfirmationView";

export default function TalentRefundRequestedPage() {
  const router = useRouter();

  return (
    <TalentRefundRequestedConfirmationView
      onBackToPayments={() => router.push("/talent/enrollments")}
      onViewRequest={() => router.push("/talent/enrollments")}
    />
  );
}
