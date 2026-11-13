"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TalentRefundPolicyView } from "@/features/dashboard/components/talent/TalentRefundPolicyView";
import { getTalentEnrollmentByIdApi } from "@/lib/api/talent";
import { formatNaira } from "@/lib/utils/currency";

export default function TalentRefundPolicyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [programmeTitle, setProgrammeTitle] = useState<string | undefined>();
  const [feePaid, setFeePaid] = useState<string | undefined>();

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    getTalentEnrollmentByIdApi(id)
      .then((enrollment) => {
        if (!isMounted || !enrollment) return;
        setProgrammeTitle(enrollment.programTitle);
        setFeePaid(formatNaira(Number(enrollment.fee || 0), true));
      })
      .catch(() => {
        // Defaults inside the policy view remain in place
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <TalentRefundPolicyView
      programmeTitle={programmeTitle}
      feePaid={feePaid}
      onBack={() => router.push("/talent/enrollments")}
      onRequestRefund={() => router.push(`/talent/enrollments/${id}/request-refund`)}
    />
  );
}
