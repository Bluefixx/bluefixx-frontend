"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TalentApprenticeshipActivatedView } from "@/features/dashboard/components/talent/TalentApprenticeshipActivatedView";
import { getTalentEnrollmentByIdApi } from "@/lib/api/talent";
import { formatNaira } from "@/lib/utils/currency";

export default function TalentApprenticeshipActivatedPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [amount, setAmount] = useState<string | undefined>();
  const [programmeTitle, setProgrammeTitle] = useState<string | undefined>();
  const [masterArtisan, setMasterArtisan] = useState<string | undefined>();

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    getTalentEnrollmentByIdApi(id)
      .then((enrollment) => {
        if (!isMounted || !enrollment) return;
        setAmount(formatNaira(Number(enrollment.fee || 0), true));
        setProgrammeTitle(enrollment.programTitle);
        setMasterArtisan(enrollment.masterArtisanName);
      })
      .catch(() => {
        // Defaults inside the activated view remain in place
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <TalentApprenticeshipActivatedView
      amount={amount}
      programmeTitle={programmeTitle}
      masterArtisan={masterArtisan}
      onBack={() => router.push("/talent/applications")}
      onViewApprenticeship={() => router.push("/talent/progress")}
      onManageArtisan={() => router.push("/talent/discover")}
    />
  );
}
