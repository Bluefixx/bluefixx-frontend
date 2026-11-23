"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TalentMessagesView } from "@/features/dashboard/components/talent/TalentMessagesView";

function TalentMessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = searchParams.get("programId") || undefined;

  return (
    <TalentMessagesView
      programId={programId}
      onBack={() => router.push("/talent/home")}
      onOpenTraining={() => router.push("/talent/progress")}
      onFindMore={() => router.push("/talent/discover")}
    />
  );
}

export default function TalentMessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-neutral-400">Loading messages...</div>}>
      <TalentMessagesContent />
    </Suspense>
  );
}
