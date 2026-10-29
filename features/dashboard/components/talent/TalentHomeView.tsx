"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import { TalentTrainingProgressView } from "./TalentTrainingProgressView";
import { TalentDiscoveryView } from "./TalentDiscoveryView";
import { MasterArtisanProfileView } from "./MasterArtisanProfileView";
import { TalentApplicationFormView } from "./TalentApplicationFormView";
import { ApprenticeshipCompletedModal } from "./ApprenticeshipCompletedModal";
import { TalentApplicationSentView } from "./TalentApplicationSentView";
import { TalentApplicationsListView, TalentApplicationItem } from "./TalentApplicationsListView";
import { TalentApplicationAcceptedDetailView } from "./TalentApplicationAcceptedDetailView";
import { TalentApplicationDeclinedDetailView } from "./TalentApplicationDeclinedDetailView";
import { TalentApprenticeshipPaymentView } from "./TalentApprenticeshipPaymentView";
import { TalentRefundPolicyView } from "./TalentRefundPolicyView";
import { TalentRequestRefundView } from "./TalentRequestRefundView";
import { TalentRefundRequestedConfirmationView } from "./TalentRefundRequestedConfirmationView";
import { TalentApprenticeshipActivatedView } from "./TalentApprenticeshipActivatedView";
import { TalentPaymentFailedView } from "./TalentPaymentFailedView";
import { TalentMessagesView } from "./TalentMessagesView";
import { TalentProfileSettingsView } from "./TalentProfileSettingsView";
import { TalentEditProfileView } from "./TalentEditProfileView";
import { TalentTransactionPinView } from "./TalentTransactionPinView";
import { TalentReferralView } from "./TalentReferralView";
import { TalentSafetyCenterView } from "./TalentSafetyCenterView";
import { TalentReviewsSuite } from "./TalentReviewsSuite";

export type TalentSubView =
  | "home"
  | "progress"
  | "discover"
  | "master-profile"
  | "apply"
  | "application-sent"
  | "applications-list"
  | "application-accepted"
  | "application-declined"
  | "payment"
  | "payment-failed"
  | "apprenticeship-activated"
  | "refund-policy"
  | "request-refund"
  | "refund-requested"
  | "messages"
  | "settings"
  | "profile"
  | "edit-profile"
  | "transaction-pin"
  | "referrals"
  | "safety-support"
  | "reviews";

interface TalentHomeViewProps {
  onSwitchToCustomer?: () => void;
  onOpenRoleSwitcher?: () => void;
}

export function TalentHomeView({
  onSwitchToCustomer,
  onOpenRoleSwitcher,
}: TalentHomeViewProps) {
  const { user } = useAuth();
  const userName = user?.fullName ? user.fullName.split(" ")[0] : "Daniel";
  const searchParams = useSearchParams();
  const urlView = searchParams.get("view") as TalentSubView | null;

  const validViews: TalentSubView[] = [
    "home",
    "progress",
    "discover",
    "master-profile",
    "apply",
    "application-sent",
    "applications-list",
    "application-accepted",
    "application-declined",
    "payment",
    "payment-failed",
    "apprenticeship-activated",
    "refund-policy",
    "request-refund",
    "refund-requested",
    "messages",
    "settings",
    "profile",
    "edit-profile",
    "transaction-pin",
    "referrals",
    "safety-support",
    "reviews",
  ];

  // Subview navigation
  const [currentView, setCurrentView] = useState<TalentSubView>(
    urlView && validViews.includes(urlView) ? urlView : "home"
  );

  useEffect(() => {
    if (urlView && validViews.includes(urlView)) {
      setCurrentView(urlView);
    } else if (!urlView) {
      setCurrentView("home");
    }
  }, [urlView]);

  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [activeProgramme, setActiveProgramme] = useState<{
    id: string;
    title: string;
    fee: string;
    duration: string;
  }>({
    id: "prog-welding-1",
    title: "Welding & Metal Fabrication Apprenticeship",
    fee: "₦150,000",
    duration: "3 months",
  });

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 1: TRAINING PROGRESS (Screenshot 2 Left)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "progress") {
    return (
      <>
        <TalentTrainingProgressView
          onBack={() => setCurrentView("home")}
          onOpenMessages={() => setCurrentView("messages")}
          onCompleteProgramme={() => setIsCompletedModalOpen(true)}
        />
        <ApprenticeshipCompletedModal
          isOpen={isCompletedModalOpen}
          onClose={() => setIsCompletedModalOpen(false)}
          onReviewMaster={() => {
            setIsCompletedModalOpen(false);
            setCurrentView("reviews");
          }}
          userName={userName}
        />
      </>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 2: DISCOVERY (Screenshot 4 Left)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "discover") {
    return (
      <TalentDiscoveryView
        onBack={() => setCurrentView("home")}
        onSelectProgramme={(prog) => {
          setActiveProgramme({
            id: prog.id,
            title: prog.title,
            fee: prog.fee,
            duration: prog.duration,
          });
          setCurrentView("master-profile");
        }}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 3: MASTER ARTISAN PROFILE (Screenshot 4 Right)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "master-profile") {
    return (
      <MasterArtisanProfileView
        onBack={() => setCurrentView("discover")}
        onApply={(programme) => {
          setActiveProgramme(programme);
          setCurrentView("apply");
        }}
        onMessage={() => toast.success("Connecting with John Obiora...")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 4: APPLICATION FORM (Screenshot 5)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "apply") {
    return (
      <TalentApplicationFormView
        onBack={() => setCurrentView("master-profile")}
        programmeTitle={activeProgramme.title}
        duration={activeProgramme.duration}
        fee={activeProgramme.fee}
        onSubmitSuccess={() => {
          setCurrentView("application-sent");
        }}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 5: APPLICATION SENT CONFIRMATION
  // ══════════════════════════════════════════════════════════════
  if (currentView === "application-sent") {
    return (
      <TalentApplicationSentView
        onBack={() => setCurrentView("apply")}
        onTrackApplication={() => setCurrentView("applications-list")}
        onFindMore={() => setCurrentView("discover")}
        trade={activeProgramme.title}
        duration={activeProgramme.duration}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 6: MY APPLICATIONS LIST
  // ══════════════════════════════════════════════════════════════
  if (currentView === "applications-list") {
    return (
      <TalentApplicationsListView
        onBack={() => setCurrentView("home")}
        onSelectApplication={(app) => {
          if (app.status === "accepted") {
            setCurrentView("application-accepted");
          } else if (app.status === "declined") {
            setCurrentView("application-declined");
          }
        }}
        onMakePayment={(app) => {
          setActiveProgramme({
            id: app.id,
            title: app.programmeTitle,
            fee: app.fee || "₦150,000",
            duration: app.duration || "3 months",
          });
          setCurrentView("payment");
        }}
        onFindMore={() => setCurrentView("discover")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 7: APPLICATION ACCEPTED DETAIL
  // ══════════════════════════════════════════════════════════════
  if (currentView === "application-accepted") {
    return (
      <TalentApplicationAcceptedDetailView
        onBack={() => setCurrentView("applications-list")}
        onContinueToPayment={() => setCurrentView("payment")}
        programmeTitle={activeProgramme.title}
        fee={activeProgramme.fee}
        duration={activeProgramme.duration}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 8: APPLICATION DECLINED DETAIL
  // ══════════════════════════════════════════════════════════════
  if (currentView === "application-declined") {
    return (
      <TalentApplicationDeclinedDetailView
        onBack={() => setCurrentView("applications-list")}
        onFindOther={() => setCurrentView("discover")}
        programmeTitle={activeProgramme.title}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 9: PAY FOR APPRENTICESHIP (Payment & Escrow)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "payment") {
    return (
      <TalentApprenticeshipPaymentView
        onBack={() => setCurrentView("applications-list")}
        onOpenRefundPolicy={() => setCurrentView("refund-policy")}
        onPaymentSuccess={() => {
          setCurrentView("apprenticeship-activated");
        }}
        onPaymentFailed={() => {
          setCurrentView("payment-failed");
        }}
        programmeTitle={activeProgramme.title}
        fee={activeProgramme.fee}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 10: 30-DAY REFUND POLICY
  // ══════════════════════════════════════════════════════════════
  if (currentView === "refund-policy") {
    return (
      <TalentRefundPolicyView
        onBack={() => setCurrentView("payment")}
        onRequestRefund={() => setCurrentView("request-refund")}
        programmeTitle={activeProgramme.title}
        feePaid={activeProgramme.fee}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 11: REQUEST A REFUND FORM
  // ══════════════════════════════════════════════════════════════
  if (currentView === "request-refund") {
    return (
      <TalentRequestRefundView
        onBack={() => setCurrentView("refund-policy")}
        onSubmitSuccess={() => setCurrentView("refund-requested")}
        programmeTitle={activeProgramme.title}
        heldInEscrow={activeProgramme.fee}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 12: REFUND REQUESTED CONFIRMATION
  // ══════════════════════════════════════════════════════════════
  if (currentView === "refund-requested") {
    return (
      <TalentRefundRequestedConfirmationView
        onBackToPayments={() => setCurrentView("progress")}
        onViewRequest={() => toast("Your refund request is being processed by Bluefixx")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 13: APPRENTICESHIP ACTIVATED CONFIRMATION
  // ══════════════════════════════════════════════════════════════
  if (currentView === "apprenticeship-activated") {
    return (
      <TalentApprenticeshipActivatedView
        onBack={() => setCurrentView("applications-list")}
        onViewApprenticeship={() => setCurrentView("progress")}
        onManageArtisan={() => setCurrentView("master-profile")}
        amount={activeProgramme.fee}
        programmeTitle={activeProgramme.title}
        masterArtisan="John Obiora"
        reference="BFX-TRN-4417202"
        paymentMethod="Paystack · Debit Card **** 4012"
        startDate="1 September 2025"
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 14: PAYMENT FAILED STATE
  // ══════════════════════════════════════════════════════════════
  if (currentView === "payment-failed") {
    return (
      <TalentPaymentFailedView
        onBack={() => setCurrentView("applications-list")}
        onUseWallet={() => setCurrentView("payment")}
        onTryAgain={() => setCurrentView("payment")}
        amount={activeProgramme.fee}
        holdHours={48}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 15: INBOX & MENTOR CONVERSATION
  // ══════════════════════════════════════════════════════════════
  if (currentView === "messages") {
    return (
      <TalentMessagesView
        onBack={() => setCurrentView("home")}
        onOpenTraining={() => setCurrentView("progress")}
        onFindMore={() => setCurrentView("discover")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 16: SETTINGS & PROFILE
  // ══════════════════════════════════════════════════════════════
  if (currentView === "settings" || currentView === "profile") {
    return (
      <TalentProfileSettingsView
        onEditProfile={() => setCurrentView("edit-profile")}
        onOpenPin={() => setCurrentView("transaction-pin")}
        onOpenNotifications={() => toast("Notification preferences")}
        onOpenCertifications={() => setIsCompletedModalOpen(true)}
        onOpenWallet={() => setCurrentView("payment")}
        onOpenSafetySupport={() => setCurrentView("safety-support")}
        onOpenReportProblem={() => setCurrentView("safety-support")}
        onOpenReferrals={() => setCurrentView("referrals")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 17: EDIT PROFILE
  // ══════════════════════════════════════════════════════════════
  if (currentView === "edit-profile") {
    return (
      <TalentEditProfileView
        onBack={() => setCurrentView("profile")}
        onSaveSuccess={() => setCurrentView("profile")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 18: TRANSACTION PIN (CREATE / CONFIRM)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "transaction-pin") {
    return (
      <TalentTransactionPinView
        onBack={() => setCurrentView("profile")}
        onSuccessBack={() => setCurrentView("profile")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 19: REFERRAL (INVITE & EARN)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "referrals") {
    return (
      <TalentReferralView
        onBack={() => setCurrentView("profile")}
        referralCode="BLUE-SIMEON"
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 20: SAFETY SUPPORT & LIVE GPS SHARING
  // ══════════════════════════════════════════════════════════════
  if (currentView === "safety-support") {
    return (
      <TalentSafetyCenterView
        onBack={() => setCurrentView("home")}
        programmeTitle={activeProgramme.title}
        artisanName="John Obiora"
        workshopAddress="14 Ziks Avenue, Independence Layout, Enugu"
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 21: REVIEWS (PENDING & SUBMISSION SUITE)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "reviews") {
    return (
      <TalentReviewsSuite
        onBack={() => setCurrentView("home")}
        onSubmitSuccess={() => setCurrentView("progress")}
        programmeTitle={activeProgramme.title}
        artisanName="John Obiora"
        duration={activeProgramme.duration}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // MAIN VIEW: TALENT HOME (Screenshot 1 Left)
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto select-none animate-in fade-in duration-200">
      {/* Top Main Heading */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#001B40] tracking-tight">
          Good morning, {userName}
        </h1>
      </div>

      {/* Greeting Banner Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white shadow-xs bg-neutral-100 shrink-0">
            <Image
              src="/images/david.jpg"
              alt={userName}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="font-sans text-xs text-neutral-400 font-medium block">
              Good morning
            </span>
            <span className="font-heading font-extrabold text-base sm:text-lg text-[#0F1115]">
              {user?.fullName || "Daniel Eze"}
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
            onClick={() => setCurrentView("discover")}
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
            onClick={() => setCurrentView("progress")}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            Full progress
          </button>
        </div>

        {/* Training Main Card & Next Session Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Active Apprenticeship Card (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
                  Welding & Metal Fabrication Apprenticeship
                </h3>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full shrink-0">
                  Advanced Welding
                </span>
              </div>
              <p className="font-sans text-xs text-neutral-400 font-medium">
                Master artisan: <span className="font-semibold text-neutral-700">John Obiora</span>
              </p>
            </div>

            {/* Progress Bar & Stats */}
            <div className="space-y-2">
              <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#001B40] h-full rounded-full transition-all duration-500 w-[65%]" />
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
                <span>65% complete</span>
                <span>Attendance: 92%</span>
              </div>
            </div>

            {/* Bottom Button */}
            <button
              type="button"
              onClick={() => setCurrentView("progress")}
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
                Thursday 28 August · 8:00am · Emene workshop
              </p>
            </div>

            {/* Payment Escrow Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-2 flex-1">
              <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase block">
                PAYMENT
              </span>
              <p className="font-sans text-xs text-neutral-600 leading-relaxed">
                <span className="font-bold text-neutral-800">Held in escrow:</span> ₦50,000 held in escrow and released to John as you learn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Learn another skill */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg sm:text-xl text-[#0F1115]">
            Learn another skill
          </h2>
          <button
            type="button"
            onClick={() => setCurrentView("discover")}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            Explore
          </button>
        </div>

        {/* Skill Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-base text-[#0F1115]">
              Home Electrical Installation
            </h3>
            <p className="font-sans text-xs text-neutral-400">
              Chinedu Okafor · 6 months · ₦120,000
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveProgramme({
                id: "prog-electrical-1",
                title: "Home Electrical Installation Apprenticeship",
                fee: "₦120,000",
                duration: "6 months",
              });
              setCurrentView("master-profile");
            }}
            className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer self-start sm:self-center"
          >
            View Programme
          </button>
        </div>
      </div>

      {/* Graduation & Certification Completed Modal */}
      <ApprenticeshipCompletedModal
        isOpen={isCompletedModalOpen}
        onClose={() => setIsCompletedModalOpen(false)}
        userName={userName}
      />
    </div>
  );
}
