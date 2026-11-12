"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getTalentHomeApi, getTalentCertificateApi } from "@/lib/api/talent";
import { TalentCertificateRecord } from "@/types/talent";

interface TalentCertificatesViewProps {
  onBack?: () => void;
  onFindMore?: () => void;
}

export function TalentCertificatesView({
  onBack,
  onFindMore,
}: TalentCertificatesViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [certificate, setCertificate] = useState<TalentCertificateRecord | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getTalentHomeApi()
      .then(async (home) => {
        const enrollmentId = home?.enrollments?.[0]?.id;
        if (!enrollmentId) {
          if (isMounted) setCertificate(null);
          return;
        }

        try {
          const record = await getTalentCertificateApi(enrollmentId);
          if (isMounted) setCertificate(record);
        } catch {
          if (isMounted) setCertificate(null);
        }
      })
      .catch(() => {
        if (isMounted) setCertificate(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const completedDate = certificate?.completedAt
    ? new Date(certificate.completedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const handleCopyCode = async () => {
    if (!certificate?.certificateCode) return;
    try {
      await navigator.clipboard.writeText(certificate.certificateCode);
      toast.success("Certificate code copied");
    } catch {
      toast.error("Could not copy certificate code");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      {/* Breadcrumb Back */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Home</span>
        </button>
      )}

      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40] tracking-tight">
          My certificates
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 font-medium mt-0.5">
          Proof of every apprenticeship you complete on Bluefixx
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-2xs space-y-4 animate-pulse">
          <div className="h-6 bg-neutral-100 rounded-md w-1/3" />
          <div className="h-4 bg-neutral-100 rounded-md w-1/4" />
          <div className="h-10 bg-neutral-100 rounded-2xl w-full" />
        </div>
      ) : certificate ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <h2 className="font-heading font-bold text-lg text-[#0F1115]">
                  {certificate.programTitle}
                </h2>
                <p className="font-sans text-xs text-neutral-400 font-medium">
                  Completed {completedDate}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 shrink-0">
              Issued
            </span>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase block">
              CERTIFICATE CODE
            </span>
            <p className="font-heading font-extrabold text-base sm:text-lg text-[#001B40] tracking-wide">
              {certificate.certificateCode}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              Copy certificate code
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-2xs text-center space-y-6 mt-8">
          <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500 mx-auto">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0F1115]">
              No certificates yet
            </h3>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Complete your apprenticeship and confirm your milestones to unlock a
              verifiable Bluefixx certificate.
            </p>
          </div>

          {onFindMore && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onFindMore}
                className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                Find opportunities
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TalentCertificatesView;
