"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import {
  getArtisanOwnProfileApi,
  getArtisanDashboardApi,
  getArtisanTrainingProgramsApi,
} from "@/lib/api/artisan";
import { getArtisanByIdApi } from "@/lib/api/customer";
import { ArtisanOwnProfileResponse, TrainingProgramDetail } from "@/types/artisan";
import { ArtisanDetailResponse } from "@/types/customer";

interface ArtisanProfileViewProps {
  onBackToDashboard: () => void;
  onNavigateToEarnings?: () => void;
  onNavigateToTalent?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToSettings?: () => void;
}

const LEVEL_LABELS: Record<number, string> = {
  1: "Verified",
  2: "Certified",
  3: "Expert",
  4: "Master",
};

export function ArtisanProfileView({
  onBackToDashboard,
  onNavigateToEarnings,
  onNavigateToTalent,
  onNavigateToNotifications,
  onNavigateToSettings,
}: ArtisanProfileViewProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [ownProfile, setOwnProfile] = useState<ArtisanOwnProfileResponse | null>(null);
  const [publicProfile, setPublicProfile] = useState<ArtisanDetailResponse | null>(null);
  const [stats, setStats] = useState({
    completed: 0,
    ratingCount: 0,
    ratingTotal: 0,
    activeApprenticesCount: 0,
  });
  const [programmes, setProgrammes] = useState<TrainingProgramDetail[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [own, dashboard, programmesRes] = await Promise.all([
          getArtisanOwnProfileApi(),
          getArtisanDashboardApi(),
          getArtisanTrainingProgramsApi().catch(() => [] as TrainingProgramDetail[]),
        ]);
        if (!mounted) return;

        setOwnProfile(own);
        setProgrammes(Array.isArray(programmesRes) ? programmesRes : []);
        if (dashboard) {
          setStats({
            completed: dashboard.completed ?? 0,
            ratingCount: dashboard.profile?.ratingCount ?? 0,
            ratingTotal: dashboard.profile?.ratingTotal ?? 0,
            activeApprenticesCount: dashboard.activeApprenticesCount ?? 0,
          });
        }

        const artisanId = own?.profile?.userId;
        if (artisanId) {
          const pub = await getArtisanByIdApi(artisanId).catch(() => null);
          if (mounted && pub) setPublicProfile(pub);
        }
      } catch (err) {
        console.debug("Artisan profile API unavailable.", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const businessName = ownProfile?.profile?.businessName || publicProfile?.businessName || "";
  const fullName = user?.fullName || publicProfile?.fullName || "";
  const area = ownProfile?.profile?.area || publicProfile?.area || "";
  const radiusKm = ownProfile?.profile?.radiusKm;
  const isVerified = ownProfile?.profile?.approval === "APPROVED";
  const levelLabel = publicProfile?.level ? LEVEL_LABELS[publicProfile.level] : undefined;

  const serviceNames = (publicProfile?.services ?? [])
    .map((s) => s.name)
    .filter((n): n is string => Boolean(n));
  const fallbackServices = (ownProfile?.services ?? [])
    .map((s) => s.description)
    .filter((n): n is string => Boolean(n));
  const services = serviceNames.length > 0 ? serviceNames : fallbackServices;

  const portfolio: { id: string; url?: string; title?: string }[] = publicProfile
    ? publicProfile.portfolio.map((p) => ({
        id: p.id,
        url: p.mediaUrl,
        title: p.title,
      }))
    : (ownProfile?.profile?.portfolio ?? []).map((p) => ({
        id: p.id,
        url: p.url,
        title: p.title,
      }));
  const reviews = publicProfile?.reviews ?? [];
  const rating =
    stats.ratingCount > 0 ? (stats.ratingTotal / stats.ratingCount).toFixed(1) : null;

  const initials = (fullName || businessName || "?").trim().charAt(0).toUpperCase();
  const avatarUrl = ownProfile?.profile?.avatarUrl || user?.avatarUrl;

  const openProgrammes = programmes.filter(
    (p) => p.status === "PUBLISHED" && p.capacity - p.enrolledCount > 0
  );

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-neutral-200 rounded-md" />
        <div className="h-40 bg-white rounded-3xl border border-neutral-200/80" />
        <div className="h-64 bg-white rounded-3xl border border-neutral-200/80" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Home</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Profile
        </h1>
      </div>

      {/* Hero Master Artisan Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#001B40] text-white border-2 border-white shadow-xs shrink-0 flex items-center justify-center font-heading font-extrabold text-2xl">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={fullName || businessName} fill className="object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#0F1115]">
                {businessName || "Your business"}
              </h2>
              {fullName && (
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">{fullName}</p>
              )}
              {area && (
                <p className="text-xs text-neutral-400 mt-0.5">📍 {area}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {isVerified ? (
              <>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Already verified
                </span>
                {levelLabel && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#001B40] text-white shadow-2xs">
                    {levelLabel} Artisan
                  </span>
                )}
              </>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Verification {ownProfile?.profile?.approval?.toLowerCase() || "pending"}
              </span>
            )}
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
            <span className="font-heading font-extrabold text-2xl text-[#0F1115] block">
              {stats.completed}
            </span>
            <span className="text-xs text-neutral-500 font-medium">Jobs</span>
          </div>
          <div className="bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
            <span className="font-heading font-extrabold text-2xl text-[#0F1115] block">
              {rating ?? "—"}
            </span>
            <span className="text-xs text-neutral-500 font-medium">Rating</span>
          </div>
          <div className="bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
            <span className="font-heading font-extrabold text-2xl text-[#0F1115] block">
              {portfolio.length}
            </span>
            <span className="text-xs text-neutral-500 font-medium">Posts</span>
          </div>
          <div className="bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
            <span className="font-heading font-extrabold text-2xl text-[#0F1115] block">
              {stats.activeApprenticesCount}
            </span>
            <span className="text-xs text-neutral-500 font-medium">Talent</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Services */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-3">
            <h3 className="font-heading font-extrabold text-base text-[#0F1115]">
              Services
            </h3>
            {services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {services.map((svc) => (
                  <span
                    key={svc}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                No services added yet. Add services from your artisan onboarding.
              </p>
            )}
          </div>

          {/* Portfolio */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="font-heading font-extrabold text-base text-[#0F1115]">
              Portfolio
            </h3>
            {portfolio.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="relative h-48 rounded-2xl overflow-hidden bg-neutral-100"
                  >
                    {item.url && (
                      <Image
                        src={item.url}
                        alt={item.title || "Work portfolio"}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                Portfolio photos you upload will appear here.
              </p>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-[#0F1115]">
                Reviews
              </h3>
              {rating && (
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <span>★</span>
                  <span>
                    {rating} ({stats.ratingCount})
                  </span>
                </span>
              )}
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-3.5 divide-y divide-neutral-100">
                {reviews.map((rev) => (
                  <div key={rev.id} className="pt-3.5 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-xs sm:text-sm text-[#0F1115]">
                        {rev.customerName}
                      </span>
                      <span className="text-amber-500 text-xs">
                        {"★".repeat(Math.max(0, Math.round(rev.stars)))}
                      </span>
                    </div>
                    {rev.comment && (
                      <p className="text-xs text-neutral-600 leading-relaxed">{rev.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                Reviews from customers will appear here.
              </p>
            )}
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Apprenticeship opportunities */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#0F1115]">
                Apprenticeship opportunities
              </h3>
              <button
                type="button"
                onClick={onNavigateToTalent}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Manage →
              </button>
            </div>

            {openProgrammes.length > 0 ? (
              <div className="space-y-3">
                {openProgrammes.map((programme) => {
                  const slotsOpen = programme.capacity - programme.enrolledCount;
                  const duration =
                    programme.durationMonths ??
                    (programme.durationWeeks ? Math.round(programme.durationWeeks / 4) : undefined);
                  return (
                    <div
                      key={programme.id}
                      className="p-3.5 rounded-2xl border border-neutral-100 bg-neutral-50/50 space-y-1"
                    >
                      <h4 className="font-heading font-bold text-xs text-[#0F1115]">
                        {programme.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        {duration ? `${duration} months · ` : ""}
                        {slotsOpen} slot{slotsOpen === 1 ? "" : "s"} open
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                Published programmes with open slots will appear here.
              </p>
            )}
          </div>

          {/* Service Area */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-3">
            <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#0F1115]">
              Service area
            </h3>
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-center">
              <span className="text-2xl">🗺️</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {area
                ? `${area}${radiusKm ? ` · ${radiusKm} km radius` : ""}`
                : "Set your service area during verification."}
            </p>
          </div>

          {/* Profile Navigation Links */}
          <div className="bg-white rounded-3xl p-3 border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100">
            <button
              type="button"
              onClick={onNavigateToEarnings}
              className="w-full px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
            >
              <span>Earnings & withdrawals</span>
              <span className="text-neutral-400">›</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToTalent}
              className="w-full px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
            >
              <span>My Talent</span>
              <span className="text-neutral-400">›</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToNotifications}
              className="w-full px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
            >
              <span>Notifications</span>
              <span className="text-neutral-400">›</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToSettings}
              className="w-full px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
            >
              <span>Settings</span>
              <span className="text-neutral-400">›</span>
            </button>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-full px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              <span>Back to dashboard</span>
              <span className="text-red-400">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ArtisanProfileView;
