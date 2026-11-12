"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TalentSafetyCenterView } from "@/features/dashboard/components/talent/TalentSafetyCenterView";
import { getTalentHomeApi } from "@/lib/api/talent";

export default function TalentSafetySupportPage() {
  const router = useRouter();
  const [programmeTitle, setProgrammeTitle] = useState<string | undefined>();
  const [artisanName, setArtisanName] = useState<string | undefined>();

  useEffect(() => {
    let isMounted = true;

    getTalentHomeApi()
      .then((home) => {
        if (!isMounted) return;
        const enrollment = home?.enrollments?.[0];
        if (enrollment) {
          setProgrammeTitle(enrollment.programTitle);
          setArtisanName(enrollment.masterArtisanName);
        }
      })
      .catch(() => {
        // Defaults inside the safety centre remain in place
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <TalentSafetyCenterView
      programmeTitle={programmeTitle}
      artisanName={artisanName}
      onBack={() => router.push("/talent/settings")}
    />
  );
}
