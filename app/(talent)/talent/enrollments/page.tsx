"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { TalentPaymentsReceiptsView } from "@/features/dashboard/components/talent/TalentPaymentsReceiptsView";
import { getTalentHomeApi } from "@/lib/api/talent";

export default function TalentEnrollmentsPage() {
  const router = useRouter();
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  // Resolve the active apprentice enrolment so refunds can be raised against it
  useEffect(() => {
    let isMounted = true;

    getTalentHomeApi()
      .then((home) => {
        if (!isMounted) return;
        setEnrollmentId(home?.enrollments?.[0]?.id ?? null);
      })
      .catch(() => {
        // Leave null; the refund action falls back to a friendly message
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRequestRefund = () => {
    if (enrollmentId) {
      router.push(`/talent/enrollments/${enrollmentId}/refund-policy`);
    } else {
      toast.error("No active apprenticeship available to refund.");
    }
  };

  return (
    <TalentPaymentsReceiptsView
      onBack={() => router.push("/talent/home")}
      onRequestRefund={handleRequestRefund}
    />
  );
}
