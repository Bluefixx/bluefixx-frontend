"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TalentMessagesView } from "@/features/dashboard/components/talent/TalentMessagesView";

export default function TalentMessagesPage() {
  const router = useRouter();

  return (
    <TalentMessagesView
      onBack={() => router.push("/talent/home")}
      onOpenTraining={() => router.push("/talent/progress")}
      onFindMore={() => router.push("/talent/discover")}
    />
  );
}
