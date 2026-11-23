"use client";
import { Suspense } from "react";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TalentPaymentFailedView } from "@/features/dashboard/components/talent/TalentPaymentFailedView";
import { getTalentEnrollmentByIdApi } from "@/lib/api/talent";
import { formatNaira } from "@/lib/utils/currency";

function TalentPaymentFailedPageContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [amount, setAmount] = useState<string | undefined>();

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    getTalentEnrollmentByIdApi(id)
      .then((enrollment) => {
        if (!isMounted || !enrollment) return;
        setAmount(formatNaira(Number(enrollment.fee || 0), true));
      })
      .catch(() => {
        // Default amount remains in place
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <TalentPaymentFailedView
      amount={amount}
      onBack={() => router.push("/talent/applications")}
      onUseWallet={() => router.push(`/talent/enrollments/${id}/payment`)}
      onTryAgain={() => router.push(`/talent/enrollments/${id}/payment`)}
    />
  );
}


export default function TalentPaymentFailedPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-neutral-400">Loading...</div>}>
      <TalentPaymentFailedPageContent />
    </Suspense>
  );
}
