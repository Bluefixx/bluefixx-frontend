"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { TalentApplicationSentView } from "@/features/dashboard/components/talent/TalentApplicationSentView";
import { getTalentProgramByIdApi } from "@/lib/api/talent";

function TalentApplicationSentContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [trade, setTrade] = useState<string | undefined>();
  const [duration, setDuration] = useState<string | undefined>();
  const [masterArtisan, setMasterArtisan] = useState<string | undefined>();
  const [workshop, setWorkshop] = useState<string | undefined>();

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    getTalentProgramByIdApi(id)
      .then((programme) => {
        if (!isMounted || !programme) return;
        setTrade(programme.title);
        setDuration(
          programme.durationWeeks ? `${programme.durationWeeks} weeks` : undefined
        );
        setMasterArtisan(programme.artisan?.fullName);
        setWorkshop(programme.location);
      })
      .catch(() => {
        // Defaults inside the view remain in place
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <TalentApplicationSentView
      trade={trade}
      duration={duration}
      masterArtisan={masterArtisan}
      workshop={workshop}
      onBack={() => router.push(`/talent/discover/${id}/apply`)}
      onTrackApplication={() => router.push("/talent/applications")}
      onFindMore={() => router.push("/talent/discover")}
    />
  );
}

export default function TalentApplicationSentPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-neutral-400">Loading confirmation...</div>}>
      <TalentApplicationSentContent />
    </Suspense>
  );
}
