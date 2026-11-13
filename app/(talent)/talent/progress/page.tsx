"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/stores/auth-store";
import { TalentTrainingProgressView } from "@/features/dashboard/components/talent/TalentTrainingProgressView";
import { ApprenticeshipCompletedModal } from "@/features/dashboard/components/talent/ApprenticeshipCompletedModal";
import { getTalentHomeApi } from "@/lib/api/talent";

export default function TalentProgressPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [enrollmentId, setEnrollmentId] = useState<string | undefined>(undefined);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

  // Resolve the active enrolment so progress, milestones and assignments load
  useEffect(() => {
    let isMounted = true;

    getTalentHomeApi()
      .then((home) => {
        if (!isMounted) return;
        setEnrollmentId(home?.enrollments?.[0]?.id);
      })
      .catch(() => {
        // Progress view renders its empty state when no enrolment is available
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const userName = user?.fullName ? user.fullName.split(" ")[0] : "Learner";

  return (
    <>
      <TalentTrainingProgressView
        enrollmentId={enrollmentId}
        onBack={() => router.push("/talent/home")}
        onOpenMessages={() => router.push("/talent/messages")}
        onCompleteProgramme={() => setIsCompletedModalOpen(true)}
      />

      <ApprenticeshipCompletedModal
        isOpen={isCompletedModalOpen}
        enrollmentId={enrollmentId}
        userName={userName}
        onClose={() => setIsCompletedModalOpen(false)}
        onReviewMaster={() => {
          setIsCompletedModalOpen(false);
          router.push("/talent/reviews");
        }}
        onViewCertificate={() => {
          setIsCompletedModalOpen(false);
          router.push("/talent/certificates");
        }}
      />
    </>
  );
}
