"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import { getTalentHomeApi, getTalentProgramsApi } from "@/lib/api/talent";
import { formatNaira } from "@/lib/utils/currency";
import { TalentProgramListItem } from "@/types/talent";

function TalentHomeViewContent() {
  const router = useRouter();
  const { user } = useAuth();
  const userName = user?.fullName ? user.fullName.split(" ")[0] : "Learner";

  const [timeGreeting, setTimeGreeting] = useState("Good morning");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting("Good morning");
    else if (hour < 17) setTimeGreeting("Good afternoon");
    else setTimeGreeting("Good evening");
  }, []);

  const [homeData, setHomeData] = useState<{
    enrollmentTitle: string;
    stageName: string;
    artisanName: string;
    progressPercent: number;
    attendancePercent: number;
    enrollmentId: string;
    nextSessionText: string;
    escrowHeldText: string;
  } | null>(null);

  const [otherSkills, setOtherSkills] = useState<TalentProgramListItem[]>([]);
  const [isLoadingOtherSkills, setIsLoadingOtherSkills] = useState(true);

  // Fetch active enrollment summary
  useEffect(() => {
    let isMounted = true;
    getTalentHomeApi()
      .then((data) => {
        if (!isMounted) return;
        if (data && data.enrollments && data.enrollments.length > 0) {
          const primary = data.enrollments[0];
          const nextSession = data.upcomingSessions?.[0];
          const feeKobo = Number(primary.fee || 0);
          const feeNgn = formatNaira(feeKobo, true);

          setHomeData({
            enrollmentTitle: primary.programTitle || "Apprenticeship Programme",
            stageName: primary.status ? primary.status.replace("_", " ") : "Active Training",
            artisanName: primary.masterArtisanName || "Verified Master Artisan",
            progressPercent: primary.progressPercent ?? 0,
            attendancePercent: primary.attendancePercent ?? 100,
            enrollmentId: primary.id,
            nextSessionText: nextSession
              ? `${nextSession.date} · ${nextSession.time} · ${nextSession.location}`
              : "Session schedule to be announced by master artisan",
            escrowHeldText: `${feeNgn} held in escrow and released to ${primary.masterArtisanName || "master artisan"} as you learn.`,
          });
        } else {
          setHomeData(null);
        }
      })
      .catch(() => {
        if (isMounted) setHomeData(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch other apprenticeship skills for discovery section
  useEffect(() => {
    let isMounted = true;
    setIsLoadingOtherSkills(true);

    getTalentProgramsApi({ limit: 4 })
      .then((items) => {
        if (!isMounted) return;
        setOtherSkills(items || []);
      })
      .catch(() => {
        if (isMounted) setOtherSkills([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingOtherSkills(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto select-none animate-in fade-in duration-200">
      {/* Top Main Heading */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#001B40] tracking-tight">
          {timeGreeting}, {userName}
        </h1>
      </div>

      {/* Greeting Banner Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white shadow-xs bg-[#001B40] text-white flex items-center justify-center font-heading font-extrabold text-lg sm:text-xl shrink-0">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={userName}
                fill
                className="object-cover"
              />
            ) : (
              <span>{userName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <span className="font-sans text-xs text-neutral-400 font-medium block">
              {timeGreeting}
            </span>
            <span className="font-heading font-extrabold text-base sm:text-lg text-[#0F1115]">
              {user?.fullName || "Learner"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Upgrade to Artisan Pill */}
          <button
            type="button"
            onClick={() =>
              toast(
                "⚡ Complete your current apprenticeship training to unlock verified Artisan status!",
                { icon: "🎓" }
              )
            }
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-800 font-sans text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>⚡</span>
            <span>Upgrade to Artisan</span>
          </button>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => router.push("/talent/discover")}
            className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            Find opportunities
          </button>
        </div>
      </div>

      {/* SECTION 1: Your Training */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg sm:text-xl text-[#0F1115]">
            Your training
          </h2>
          <button
            type="button"
            onClick={() => router.push("/talent/progress")}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            Full progress
          </button>
        </div>

        {/* Training Main Card & Next Session Card */}
        {!homeData ? (
          <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-2xs text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#001B40] flex items-center justify-center mx-auto">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-[#0F1115]">
                No active apprenticeship
              </h3>
              <p className="font-sans text-xs text-neutral-400 max-w-md mx-auto">
                Explore master artisans offering training in welding, plumbing, electrical, and more. Apply to start your learning journey.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => router.push("/talent/discover")}
                className="px-5 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Find opportunities
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Active Apprenticeship Card (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
                    {homeData.enrollmentTitle}
                  </h3>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full shrink-0">
                    {homeData.stageName}
                  </span>
                </div>
                <p className="font-sans text-xs text-neutral-400 font-medium">
                  Master artisan:{" "}
                  <span className="font-semibold text-neutral-700">
                    {homeData.artisanName}
                  </span>
                </p>
              </div>

              {/* Progress Bar & Stats */}
              <div className="space-y-2">
                <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#001B40] h-full rounded-full transition-all duration-500"
                    style={{ width: `${homeData.progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
                  <span>{homeData.progressPercent}% complete</span>
                  <span>Attendance: {homeData.attendancePercent}%</span>
                </div>
              </div>

              {/* Bottom Button */}
              <button
                type="button"
                onClick={() => router.push("/talent/progress")}
                className="w-full py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-sans font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
              >
                Open My Apprenticeship
              </button>
            </div>

            {/* Right Cards (4 cols): Next session + Payment */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-4">
              {/* Next Session Card */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-2 flex-1">
                <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase block">
                  NEXT SESSION
                </span>
                <p className="font-sans font-bold text-sm text-[#0F1115] leading-snug">
                  {homeData.nextSessionText}
                </p>
              </div>

              {/* Payment Escrow Card */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-2 flex-1">
                <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase block">
                  PAYMENT
                </span>
                <p className="font-sans text-xs text-neutral-600 leading-relaxed">
                  <span className="font-bold text-neutral-800">Held in escrow:</span>{" "}
                  {homeData.escrowHeldText}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Learn another skill */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg sm:text-xl text-[#0F1115]">
            Learn another skill
          </h2>
          <button
            type="button"
            onClick={() => router.push("/talent/discover")}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            Explore
          </button>
        </div>

        {/* Dynamic Skill Cards or Empty State */}
        {isLoadingOtherSkills ? (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs animate-pulse space-y-3">
            <div className="h-5 bg-neutral-100 rounded-md w-1/3" />
            <div className="h-4 bg-neutral-100 rounded-md w-1/4" />
          </div>
        ) : otherSkills.length > 0 ? (
          <div className="space-y-3">
            {otherSkills.slice(0, 2).map((skill) => {
              const feeFormatted = formatNaira(Number(skill.fee || 0), true);
              const durationFormatted = skill.durationWeeks
                ? `${skill.durationWeeks} weeks`
                : "Flexible";
              return (
                <div
                  key={skill.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-base text-[#0F1115]">
                      {skill.title}
                    </h3>
                    <p className="font-sans text-xs text-neutral-400">
                      {skill.artisan?.fullName || "Verified Master Artisan"} · {durationFormatted} · {feeFormatted}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/talent/discover/${skill.id}`)}
                    className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer self-start sm:self-center"
                  >
                    View Programme
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-[#0F1115]">
                Explore apprenticeship skills
              </h3>
              <p className="font-sans text-xs text-neutral-400">
                Browse open workshops in welding, plumbing, carpentry, and electrical installations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/talent/discover")}
              className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer self-start sm:self-center"
            >
              Explore all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function TalentHomeView() {
  return <TalentHomeViewContent />;
}

export default TalentHomeView;
