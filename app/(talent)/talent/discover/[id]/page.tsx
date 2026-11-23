"use client";

import React, { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { MasterArtisanProfileView } from "@/features/dashboard/components/talent/MasterArtisanProfileView";

function TalentMasterArtisanContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  return (
    <MasterArtisanProfileView
      programId={id}
      onBack={() => router.push("/talent/discover")}
      onApply={(programme) =>
        router.push(`/talent/discover/${programme.id || id}/apply`)
      }
      onMessage={() => router.push(`/talent/messages?programId=${id}`)}
    />
  );
}

export default function TalentMasterArtisanPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-neutral-400">Loading...</div>}>
      <TalentMasterArtisanContent />
    </Suspense>
  );
}
