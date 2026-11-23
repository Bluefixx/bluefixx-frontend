"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { MasterArtisanProfileView } from "@/features/dashboard/components/talent/MasterArtisanProfileView";

export default function TalentMasterArtisanPage() {
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
