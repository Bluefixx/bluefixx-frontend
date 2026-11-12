"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TalentRequestRefundView } from "@/features/dashboard/components/talent/TalentRequestRefundView";
import { getTalentEnrollmentByIdApi } from "@/lib/api/talent";
import { formatNaira } from "@/lib/utils/currency";

export default function TalentRequestRefundPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [programmeTitle, setProgrammeTitle] = useState<string | undefined>();
  const [heldInEscrow, setHeldInEscrow] = useState<string | undefined>();

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    getTalentEnrollmentByIdApi(id)
      .then((enrollment) => {
        if (!isMounted || !enrollment) return;
        setProgrammeTitle(enrollment.programTitle);
        setHeldInEscrow(formatNaira(Number(enrollment.fee || 0), true));
      })
      .catch(() => {
        // Defaults inside the refund form remain in place
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <TalentRequestRefundView
      enrollmentId={id}
      programmeTitle={programmeTitle}
      heldInEscrow={heldInEscrow}
      onBack={() => router.push(`/talent/enrollments/${id}/refund-policy`)}
      onSubmitSuccess={() => router.push(`/talent/enrollments/${id}/refund-requested`)}
    />
  );
}
