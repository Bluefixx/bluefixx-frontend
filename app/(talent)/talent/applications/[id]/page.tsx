"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { TalentApplicationAcceptedDetailView } from "@/features/dashboard/components/talent/TalentApplicationAcceptedDetailView";
import { TalentApplicationDeclinedDetailView } from "@/features/dashboard/components/talent/TalentApplicationDeclinedDetailView";
import { getTalentApplicationsApi } from "@/lib/api/talent";
import { formatNaira } from "@/lib/utils/currency";
import { TalentApplicationListItem } from "@/types/talent";

type DetailState = "loading" | "accepted" | "declined" | "redirect";

function TalentApplicationDetailContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [state, setState] = useState<DetailState>("loading");
  const [application, setApplication] = useState<TalentApplicationListItem | null>(
    null
  );

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    getTalentApplicationsApi()
      .then((items) => {
        if (!isMounted) return;
        const found = items?.find((item) => item.id === id);
        if (!found) {
          setState("redirect");
          return;
        }

        setApplication(found);
        if (found.status === "ACCEPTED") {
          setState("accepted");
        } else if (
          found.status === "DECLINED" ||
          found.status === "WITHDRAWN" ||
          found.status === "EXPIRED"
        ) {
          setState("declined");
        } else {
          // Application is still under review - the list is the right place to be
          setState("redirect");
        }
      })
      .catch(() => {
        if (isMounted) setState("redirect");
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (state === "redirect") {
      router.replace("/talent/applications");
    }
  }, [state, router]);

  if (state === "loading" || state === "redirect" || !application) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-xs text-neutral-400 font-sans">
        Loading application...
      </div>
    );
  }

  const programmeTitle = application.program?.title;
  const artisanName = application.program?.artisan?.fullName;
  const artisanAvatar = application.program?.artisan?.avatarUrl;
  const location = application.program?.location;
  const duration = application.program?.durationWeeks
    ? `${application.program.durationWeeks} weeks`
    : undefined;
  const fee = formatNaira(Number(application.program?.fee || 0), true);

  if (state === "accepted") {
    const enrollmentId = application.enrollment?.id;
    return (
      <TalentApplicationAcceptedDetailView
        programmeTitle={programmeTitle}
        artisanName={artisanName}
        artisanAvatar={artisanAvatar}
        location={location}
        duration={duration}
        fee={fee}
        onBack={() => router.push("/talent/applications")}
        onContinueToPayment={() =>
          router.push(
            enrollmentId
              ? `/talent/enrollments/${enrollmentId}/payment`
              : "/talent/enrollments"
          )
        }
      />
    );
  }

  return (
    <TalentApplicationDeclinedDetailView
      programmeTitle={programmeTitle}
      artisanName={artisanName}
      artisanAvatar={artisanAvatar}
      location={location}
      duration={duration}
      fee={fee}
      onBack={() => router.push("/talent/applications")}
      onFindOther={() => router.push("/talent/discover")}
    />
  );
}

export default function TalentApplicationDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto py-12 text-center text-xs text-neutral-400 font-sans">
          Loading application...
        </div>
      }
    >
      <TalentApplicationDetailContent />
    </Suspense>
  );
}
