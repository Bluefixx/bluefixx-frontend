"use client";
import { Suspense } from "react";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TalentRequestRefundView } from "@/features/dashboard/components/talent/TalentRequestRefundView";
import { getTalentEnrollmentByIdApi } from "@/lib/api/talent";
import { formatNaira } from "@/lib/utils/currency";

function TalentRequestRefundPageContent() {
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


export default function TalentRequestRefundPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-neutral-400">Loading...</div>}>
      <TalentRequestRefundPageContent />
    </Suspense>
  );
}
