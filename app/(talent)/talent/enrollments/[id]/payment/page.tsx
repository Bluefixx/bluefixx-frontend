"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TalentApprenticeshipPaymentView } from "@/features/dashboard/components/talent/TalentApprenticeshipPaymentView";
import { getTalentEnrollmentByIdApi } from "@/lib/api/talent";
import { formatNaira } from "@/lib/utils/currency";

export default function TalentEnrollmentPaymentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [programmeTitle, setProgrammeTitle] = useState<string | undefined>();
  const [fee, setFee] = useState<string | undefined>();
  const [artisanName, setArtisanName] = useState<string | undefined>();

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    getTalentEnrollmentByIdApi(id)
      .then((enrollment) => {
        if (!isMounted || !enrollment) return;
        setProgrammeTitle(enrollment.programTitle);
        setFee(formatNaira(Number(enrollment.fee || 0), true));
        setArtisanName(enrollment.masterArtisanName);
      })
      .catch(() => {
        // Defaults inside the payment view remain in place
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <TalentApprenticeshipPaymentView
      enrollmentId={id}
      programmeTitle={programmeTitle}
      fee={fee}
      artisanName={artisanName}
      onBack={() => router.push("/talent/applications")}
      onOpenRefundPolicy={() => router.push(`/talent/enrollments/${id}/refund-policy`)}
      onPaymentSuccess={() => router.push(`/talent/enrollments/${id}/activated`)}
      onPaymentFailed={() => router.push(`/talent/enrollments/${id}/payment-failed`)}
    />
  );
}
