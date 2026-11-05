"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

export type ApplicantStatus = "submitted" | "accepted" | "declined";

interface ArtisanApplicantDetailViewProps {
  applicantId?: string;
  applicantName?: string;
  initialStatus?: ApplicantStatus;
  onBack: () => void;
  onBackToDashboard: () => void;
  onOpenMessage?: (name: string) => void;
}

export function ArtisanApplicantDetailView({
  applicantId = "app-chidera",
  applicantName = "Chidera Okwu",
  initialStatus = "submitted",
  onBack,
  onBackToDashboard,
  onOpenMessage,
}: ArtisanApplicantDetailViewProps) {
  const [status, setStatus] = useState<ApplicantStatus>(initialStatus);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [successMode, setSuccessMode] = useState<"accepted" | "declined" | null>(null);

  const handleConfirmAccept = () => {
    setIsAcceptModalOpen(false);
    setStatus("accepted");
    setSuccessMode("accepted");
    toast.success("Applicant accepted! Payment invitation dispatched.");
  };

  const handleConfirmDecline = () => {
    setIsDeclineModalOpen(false);
    setStatus("declined");
    setSuccessMode("declined");
    toast("Application declined. Slot restored for other applicants.");
  };

  // ═══════════════════════════════════════════════════════════
  // MODAL / SUCCESS STATE 1: ACCEPTED SUCCESS (Screenshot 3 Left)
  // ═══════════════════════════════════════════════════════════
  if (successMode === "accepted") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 select-none animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto shadow-2xs">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115]">
              Apprenticeship accepted
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-md mx-auto">
              Welding · 1 slots · 3 months. Talent can now continue to payment.
            </p>
          </div>

          <div className="space-y-3 pt-3 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => setSuccessMode(null)}
              className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              View applicants
            </button>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-full py-3.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-sans font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // MODAL / SUCCESS STATE 2: DECLINED SUCCESS (Screenshot 4 Left)
  // ═══════════════════════════════════════════════════════════
  if (successMode === "declined") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 select-none animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 border border-red-200/80 flex items-center justify-center mx-auto shadow-2xs">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115]">
              Application declined
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-md mx-auto">
              A copy of this has been sent. Their place is put back so other applicants for Welding & Metal Fabrication can apply.
            </p>
          </div>

          <div className="space-y-3 pt-3 max-w-sm mx-auto">
            <button
              type="button"
              onClick={onBack}
              className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              View applications
            </button>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-full py-3.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-sans font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Top Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>My apprenticeships</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          Applications
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
          Welding & Metal Fabrication · Enugu
        </p>
      </div>

      {/* TOP STATUS BANNER (If Accepted or Declined) */}
      {status === "accepted" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex items-start sm:items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 sm:mt-0">
            ✓
          </div>
          <div className="space-y-0.5">
            <h4 className="font-heading font-bold text-xs sm:text-sm text-emerald-950">
              {applicantName} accepted
            </h4>
            <p className="text-xs text-emerald-800">
              They have 3 days (due 24 Aug) to pay ₦150,000 to activate their place. Training starts once payment is confirmed.
            </p>
          </div>
        </div>
      )}

      {status === "declined" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-100 border border-neutral-300 flex items-start sm:items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-neutral-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 sm:mt-0">
            ✕
          </div>
          <div className="space-y-0.5">
            <h4 className="font-heading font-bold text-xs sm:text-sm text-neutral-900">
              {applicantName} declined
            </h4>
            <p className="text-xs text-neutral-600">
              This application has been declined. Their place has been put back for other candidates.
            </p>
          </div>
        </div>
      )}

      {/* Main 2-Column Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Answers, Portfolio & Recommendation (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Answers */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-5">
            <h3 className="font-heading font-extrabold text-base text-[#0F1115]">
              Answers
            </h3>

            <div className="space-y-4 divide-y divide-neutral-100 text-xs sm:text-sm">
              <div className="space-y-1">
                <span className="text-neutral-400 text-xs block">
                  Why do you want to learn this trade?
                </span>
                <p className="text-neutral-800 leading-relaxed font-medium">
                  I have watched my uncle fabricate gates since I was a boy and I want to do it properly with a certificate that customers can trust. I want my own workshop in Nsukka by 2028.
                </p>
              </div>

              <div className="pt-3 space-y-1">
                <span className="text-neutral-400 text-xs block">
                  What experience do you already have?
                </span>
                <p className="text-neutral-800 leading-relaxed font-medium">
                  Two years assisting, mostly cutting and grinding.
                </p>
              </div>

              <div className="pt-3 space-y-1">
                <span className="text-neutral-400 text-xs block">
                  Can you attend the workshop six days a week?
                </span>
                <p className="text-neutral-800 leading-relaxed font-medium">
                  Yes
                </p>
              </div>

              <div className="pt-3 space-y-1">
                <span className="text-neutral-400 text-xs block">
                  Which best describes your current situation?
                </span>
                <p className="text-neutral-800 leading-relaxed font-medium">
                  Currently unemployed
                </p>
              </div>

              <div className="pt-3 space-y-1">
                <span className="text-neutral-400 text-xs block">
                  Upload examples of previous work (Optional)
                </span>
                <p className="text-neutral-800 leading-relaxed font-medium">
                  2 photos attached
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Portfolio Photo Previews */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="font-heading font-extrabold text-base text-[#0F1115]">
              Portfolio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative h-44 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center group cursor-pointer">
                <Image
                  src="/images/path1.png"
                  alt="Portfolio work 1"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="relative h-44 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center group cursor-pointer">
                <Image
                  src="/images/path3.png"
                  alt="Portfolio work 2"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Recommendation */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-3">
            <h3 className="font-heading font-extrabold text-base text-[#0F1115]">
              Recommendation
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 italic leading-relaxed">
              &ldquo;Chidera worked in my workshop for two years. Reliable, early every morning, careful with tools.&rdquo;
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-amber-500">★</span>
              <span className="font-bold text-[#0F1115]">Uncle Obi Okwu</span>
              <span className="text-neutral-400">· Fabricator, Nsukka</span>
            </div>
          </div>
        </div>

        {/* Right Column: Applicant Card & Programme Terms (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Applicant Profile */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-100 shrink-0">
                <Image
                  src="/images/david.jpg"
                  alt={applicantName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#0F1115]">
                  {applicantName}
                </h3>
                <p className="text-xs text-neutral-400">
                  Abakpa Enugu East · Age 21
                </p>
                <span
                  className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                    status === "accepted"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : status === "declined"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}
                >
                  {status}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-neutral-100 text-xs">
              <div>
                <span className="text-neutral-400 block text-[11px]">Applied</span>
                <span className="font-bold text-[#0F1115]">18 Aug 2026, 10:12</span>
              </div>

              <div>
                <span className="text-neutral-400 block text-[11px]">Experience</span>
                <span className="font-bold text-[#0F1115] leading-tight block mt-0.5">
                  Two years helping in my uncle&apos;s workshop in Nsukka
                </span>
              </div>

              <div>
                <span className="text-neutral-400 block text-[11px]">Availability</span>
                <span className="font-bold text-[#0F1115]">Six days a week</span>
              </div>
            </div>
          </div>

          {/* Card 2: Programme Terms & Action Buttons */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-4">
            <div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Programme
              </span>
              <h4 className="font-heading font-extrabold text-xs sm:text-sm text-[#0F1115] mt-1">
                Welding & Metal Fabrication Apprenticeship
              </h4>
            </div>

            <div className="space-y-2.5 text-xs divide-y divide-neutral-100">
              <div className="flex items-center justify-between pt-1">
                <span className="text-neutral-500">Fee</span>
                <span className="font-heading font-bold text-[#0F1115]">₦150,000</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-neutral-500">Payment</span>
                <span className="font-heading font-bold text-[#0F1115]">Paid in full</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-neutral-500">Places left</span>
                <span className="font-heading font-bold text-[#0F1115]">
                  {status === "accepted" ? "0 of 3" : "1 of 3"}
                </span>
              </div>
            </div>

            {/* Actions for SUBMITTED state */}
            {status === "submitted" && (
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAcceptModalOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  Accept Applicant
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenMessage) onOpenMessage(applicantName);
                      else toast(`Starting chat with ${applicantName}...`);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors cursor-pointer"
                  >
                    Message
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeclineModalOpen(true)}
                    className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}

            {/* Action for ACCEPTED state */}
            {status === "accepted" && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => toast(`Opening profile for ${applicantName}...`)}
                  className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  View talent profile
                </button>
              </div>
            )}

            {/* Action for DECLINED state */}
            {status === "declined" && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  View My Apprenticeships
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODAL: ACCEPT CONFIRMATION DIALOG (Screenshot 2 Right)
          ═══════════════════════════════════════════════════════════ */}
      {isAcceptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-neutral-100 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-heading font-extrabold text-lg text-[#0F1115]">
              Accept Chidera?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              They will be asked to pay ₦150,000 to activate their place. One of 3 places will be taken.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAcceptModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                className="flex-1 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL: DECLINE CONFIRMATION DIALOG (Screenshot 3 Right)
          ═══════════════════════════════════════════════════════════ */}
      {isDeclineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-neutral-100 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-heading font-extrabold text-lg text-[#0F1115]">
              Decline this application
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Decline this apprenticeship. This talent won&apos;t pay for any more.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmDecline}
                className="flex-1 py-3 rounded-xl bg-[#001B40] hover:bg-[#074292] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Yes, decline
              </button>
              <button
                type="button"
                onClick={() => setIsDeclineModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ArtisanApplicantDetailView;

