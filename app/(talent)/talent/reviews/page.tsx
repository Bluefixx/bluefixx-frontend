"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TalentReviewsSuite } from "@/features/dashboard/components/talent/TalentReviewsSuite";
import { getTalentHomeApi } from "@/lib/api/talent";
import { TalentEnrollmentSummary } from "@/types/talent";

export default function TalentReviewsPage() {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<TalentEnrollmentSummary | null>(null);

  // Resolve the Talent's apprenticeship so the review is submitted against the
  // real enrollment instead of a placeholder ID.
  useEffect(() => {
    let isMounted = true;
    getTalentHomeApi()
      .then((summary) => {
        if (!isMounted) return;
        const enrollments = summary?.enrollments ?? [];
        const completed = enrollments.find((item) => item.status === "COMPLETED");
        setEnrollment(completed ?? enrollments[0] ?? null);
      })
      .catch(() => {
        // Leave enrollment unset; the suite blocks submission until one exists.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <TalentReviewsSuite
      enrollmentId={enrollment?.id}
      programmeTitle={enrollment?.programTitle}
      artisanName={enrollment?.masterArtisanName}
      onBack={() => router.push("/talent/home")}
      onBackToApprenticeship={() => router.push("/talent/progress")}
      onViewCertificate={() => router.push("/talent/certificates")}
    />
  );
}
