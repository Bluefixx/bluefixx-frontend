"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { TalentApplicationFormView } from "@/features/dashboard/components/talent/TalentApplicationFormView";
import { getTalentProgramByIdApi } from "@/lib/api/talent";
import { TalentProgramQuestion } from "@/types/talent";
import { formatNaira } from "@/lib/utils/currency";

function TalentApplyContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [programmeTitle, setProgrammeTitle] = useState<string | undefined>();
  const [duration, setDuration] = useState<string | undefined>();
  const [fee, setFee] = useState<string | undefined>();
  const [artisanName, setArtisanName] = useState<string | undefined>();
  const [artisanAvatar, setArtisanAvatar] = useState<string | undefined>();
  const [questions, setQuestions] = useState<TalentProgramQuestion[] | undefined>();

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    getTalentProgramByIdApi(id)
      .then((programme) => {
        if (!isMounted || !programme) return;
        setProgrammeTitle(programme.title);
        setDuration(programme.durationWeeks ? `${programme.durationWeeks} weeks` : undefined);
        setFee(formatNaira(Number(programme.fee || 0), true));
        setArtisanName(programme.artisan?.fullName);
        setArtisanAvatar(programme.artisan?.avatarUrl);
        setQuestions(Array.isArray(programme.questions) ? programme.questions : undefined);
      })
      .catch(() => {
        // Defaults inside the form remain in place
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <TalentApplicationFormView
      programId={id}
      programmeTitle={programmeTitle}
      duration={duration}
      fee={fee}
      artisanName={artisanName}
      artisanAvatar={artisanAvatar}
      questions={questions}
      onBack={() => router.push(`/talent/discover/${id}`)}
      onSubmitSuccess={() => router.push(`/talent/discover/${id}/apply/sent`)}
    />
  );
}

export default function TalentApplyPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-neutral-400">Loading application form...</div>}>
      <TalentApplyContent />
    </Suspense>
  );
}
