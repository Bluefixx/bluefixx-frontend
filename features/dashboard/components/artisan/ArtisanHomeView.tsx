"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import { ArtisanFindJobsView } from "./ArtisanFindJobsView";
import { ArtisanJobDetailView, JobDetailData } from "./ArtisanJobDetailView";
import { ArtisanSendQuoteModal } from "./ArtisanSendQuoteModal";
import { ArtisanOnboardingFlow } from "./ArtisanOnboardingFlow";
import { ArtisanJobsListView, JobsListTab } from "./ArtisanJobsListView";
import { ArtisanQuoteFormView } from "./ArtisanQuoteFormView";
import { ArtisanQuoteSentView } from "./ArtisanQuoteSentView";
import { ArtisanActiveJobDetailView } from "./ArtisanActiveJobDetailView";
import { ArtisanEarningsView } from "./ArtisanEarningsView";
import { ArtisanWithdrawFlowView } from "./ArtisanWithdrawFlowView";
import { ArtisanMessagesView } from "./ArtisanMessagesView";
import { ArtisanCreateApprenticeshipView } from "./ArtisanCreateApprenticeshipView";
import { ArtisanApprenticeshipsHubView } from "./ArtisanApprenticeshipsHubView";
import { ArtisanProfileView } from "./ArtisanProfileView";
import { ArtisanApprenticeProgressView } from "./ArtisanApprenticeProgressView";
import { ArtisanPersonalDetailsView } from "./ArtisanPersonalDetailsView";
import { ArtisanCreatePinView } from "./ArtisanCreatePinView";
import { ArtisanReferralView } from "./ArtisanReferralView";
import { ArtisanSettingsOverviewView } from "./ArtisanSettingsOverviewView";
import { ArtisanLanguageSettingsView } from "./ArtisanLanguageSettingsView";
import { ArtisanSafetyCenterView } from "./ArtisanSafetyCenterView";
import { ArtisanReportProblemView } from "./ArtisanReportProblemView";
import { ArtisanRateCustomerView } from "./ArtisanRateCustomerView";
import { ArtisanNotificationsView } from "./ArtisanNotificationsView";
import { ArtisanNotificationSettingsView } from "./ArtisanNotificationSettingsView";
import {
  getArtisanApplicationsApi,
  getArtisanDashboardApi,
  getArtisanJobsApi,
  updateArtisanAvailabilityApi,
} from "@/lib/api/artisan";
import { ArtisanDashboardResponse } from "@/types/artisan";
import { formatNaira } from "@/lib/utils/currency";

export type ArtisanVerificationState =
  | "verified"
  | "not_verified"
  | "in_review"
  | "just_verified";

interface ArtisanHomeViewProps {
  onSwitchToCustomer?: () => void;
  onOpenRoleSwitcher?: () => void;
  initialVerificationState?: ArtisanVerificationState;
}

function ArtisanHomeViewContent({
  onSwitchToCustomer,
  onOpenRoleSwitcher,
  initialVerificationState = "verified",
}: ArtisanHomeViewProps) {
  const { user, refreshRoles } = useAuth();
  const [dashboardData, setDashboardData] = useState<ArtisanDashboardResponse | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  const userName = user?.fullName
    ? user.fullName.split(" ")[0]
    : dashboardData?.profile?.businessName
    ? dashboardData.profile.businessName.split(" ")[0]
    : "Artisan";

  const [timeGreeting, setTimeGreeting] = useState("Good morning");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting("Good morning");
    else if (hour < 17) setTimeGreeting("Good afternoon");
    else setTimeGreeting("Good evening");
  }, []);

  const searchParams = useSearchParams();
  const urlView = searchParams.get("view");

  // Subviews
  const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "find-jobs"
    | "job-detail"
    | "verification"
    | "jobs-list"
    | "send-quote"
    | "quote-sent"
    | "active-job-detail"
    | "earnings"
    | "withdraw"
    | "messages"
    | "create-apprenticeship"
    | "apprenticeships-hub"
    | "profile"
    | "apprentice-progress"
    | "personal-details"
    | "create-pin"
    | "referral"
    | "settings-overview"
    | "language"
    | "safety-center"
    | "report-problem"
    | "rate-customer"
    | "notifications"
    | "notification-settings"
  >(
    urlView === "find-jobs"
      ? "find-jobs"
      : urlView === "verification" || urlView === "become-artisan"
      ? "verification"
      : urlView === "requests" || urlView === "active-jobs" || urlView === "completed-jobs" || urlView === "declined"
      ? "jobs-list"
      : urlView === "quotes"
      ? "send-quote"
      : urlView === "earnings"
      ? "earnings"
      : urlView === "withdraw"
      ? "withdraw"
      : urlView === "messages"
      ? "messages"
      : urlView === "create-apprenticeship"
      ? "create-apprenticeship"
      : urlView === "training-programmes" || urlView === "apprenticeships" || urlView === "apprentice-applications"
      ? "apprenticeships-hub"
      : urlView === "active-apprentices" || urlView === "apprentice-progress"
      ? "apprentice-progress"
      : urlView === "personal-details" || urlView === "edit-profile"
      ? "personal-details"
      : urlView === "create-pin" || urlView === "pin"
      ? "create-pin"
      : urlView === "referral" || urlView === "invite"
      ? "referral"
      : urlView === "settings" || urlView === "settings-overview"
      ? "settings-overview"
      : urlView === "language"
      ? "language"
      : urlView === "safety" || urlView === "safety-center"
      ? "safety-center"
      : urlView === "report-problem" || urlView === "dispute"
      ? "report-problem"
      : urlView === "rate-customer"
      ? "rate-customer"
      : urlView === "notifications"
      ? "notifications"
      : urlView === "notification-settings"
      ? "notification-settings"
      : urlView === "profile"
      ? "profile"
      : "dashboard"
  );

  const [customerToRate, setCustomerToRate] = useState<{
    bookingId?: string;
    name: string;
    jobTitle: string;
    date: string;
  }>({
    name: "Customer",
    jobTitle: "Completed job",
    date: "Recent",
  });

  const [selectedBookingId, setSelectedBookingId] = useState<string | undefined>(undefined);
  const [selectedQuoteMeta, setSelectedQuoteMeta] = useState<{
    offerId?: string;
    quoteAmount?: string;
    estimatedCompletion?: string;
    warrantyPeriod?: string;
  } | null>(null);

  const [isQuoteSent, setIsQuoteSent] = useState(false);

  const [jobsListTab, setJobsListTab] = useState<JobsListTab>(
    urlView === "active-jobs"
      ? "active"
      : urlView === "completed-jobs"
      ? "completed"
      : urlView === "declined"
      ? "declined"
      : "requests"
  );

  // Verification state (verified, not_verified, in_review, just_verified)
  const [verificationState, setVerificationState] = useState<ArtisanVerificationState>(
    initialVerificationState
  );
  const [dismissJustVerifiedBanner, setDismissJustVerifiedBanner] = useState(false);

  // Availability toggle
  const [isAvailable, setIsAvailable] = useState(true);
  const [recommendedJobs, setRecommendedJobs] = useState<JobDetailData[]>([]);
  const [waitingApps, setWaitingApps] = useState<{ count: number; programTitle: string }>({
    count: 0,
    programTitle: "",
  });

  // Fetch live artisan dashboard metrics from backend
  useEffect(() => {
    let mounted = true;
    setIsLoadingDashboard(true);
    getArtisanApplicationsApi({ status: "SUBMITTED" })
      .then((res) => {
        if (!mounted || !Array.isArray(res?.items)) return;
        setWaitingApps({
          count: res.items.length,
          programTitle: res.items[0]?.programTitle || "Apprenticeship Programme",
        });
      })
      .catch(() => {});
    getArtisanJobsApi({ limit: 2 })
      .then((jobsRes) => {
        if (!mounted || !jobsRes?.items) return;
        const mapped: JobDetailData[] = jobsRes.items.map((it) => {
          const minNaira = it.budgetMinimum ? Math.round(parseInt(it.budgetMinimum, 10) / 100) : 0;
          const maxNaira = it.budgetMaximum ? Math.round(parseInt(it.budgetMaximum, 10) / 100) : 0;
          const budgetStr =
            minNaira > 0 && maxNaira > 0
              ? `₦${minNaira.toLocaleString()} - ₦${maxNaira.toLocaleString()}`
              : minNaira > 0
              ? `₦${minNaira.toLocaleString()}+`
              : "Negotiable";
          return {
            id: it.id,
            code: `BFX-${it.id.slice(0, 5).toUpperCase()}`,
            title: it.title || it.service?.name || "Service Request",
            category: it.trade?.name || it.service?.name || "Service",
            subCategory: it.service?.name || "General",
            postedTime: it.createdAt ? new Date(it.createdAt).toLocaleDateString() : "Recent",
            isUrgent: it.urgency === "EMERGENCY" || it.urgency === "WITHIN_TWO_DAYS",
            status: "Receiving Quotes",
            description: it.description || "",
            service: `${it.trade?.name || "Trade"} · ${it.service?.name || "Service"}`,
            date: it.preferredStart ? new Date(it.preferredStart).toLocaleDateString() : "Flexible",
            time: "Morning · 9am - 1pm",
            budget: budgetStr,
            urgency: it.urgency || "STANDARD",
            customerName: it.customer?.displayName || "Customer",
            customerLocation: it.area?.city ? `${it.area.city}, Nigeria` : "Nearby",
            distance: it.distanceKm !== undefined ? `${it.distanceKm.toFixed(1)} km away` : "Nearby",
            driveTime: "In your service area",
            photoUrl: it.media?.[0]?.url || "/images/workers.png",
            photoCaption: "",
            audioDuration: "",
            questions: [],
          };
        });
        setRecommendedJobs(mapped);
      })
      .catch(() => {});
    getArtisanDashboardApi()
      .then((res) => {
        if (!mounted || !res) return;
        setDashboardData(res);
        if (res.profile) {
          setIsAvailable(res.profile.available ?? true);
          if (res.profile.approval === "APPROVED") {
            setVerificationState("verified");
          } else if (res.profile.approval === "PENDING") {
            setVerificationState("in_review");
          } else if (res.profile.approval === "DRAFT" || res.profile.approval === "REJECTED") {
            setVerificationState("not_verified");
          }
        } else {
          setVerificationState("not_verified");
        }
      })
      .catch((err) => {
        console.debug("Artisan dashboard API offline or mocked.", err);
      })
      .finally(() => {
        if (mounted) setIsLoadingDashboard(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Selected job for detail view
  const [selectedJob, setSelectedJob] = useState<JobDetailData | null>(null);

  // Send Quote Modal
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  useEffect(() => {
    if (urlView === "find-jobs") {
      setCurrentView("find-jobs");
    } else if (urlView === "verification" || urlView === "become-artisan") {
      setCurrentView("verification");
    } else if (urlView === "requests") {
      setJobsListTab("requests");
      setCurrentView("jobs-list");
    } else if (urlView === "active-jobs") {
      setJobsListTab("active");
      setCurrentView("jobs-list");
    } else if (urlView === "completed-jobs") {
      setJobsListTab("completed");
      setCurrentView("jobs-list");
    } else if (urlView === "quotes") {
      setCurrentView("send-quote");
    } else if (urlView === "earnings") {
      setCurrentView("earnings");
    } else if (urlView === "withdraw") {
      setCurrentView("withdraw");
    } else if (urlView === "messages") {
      setCurrentView("messages");
    } else if (urlView === "create-apprenticeship") {
      setCurrentView("create-apprenticeship");
    } else if (urlView === "training-programmes" || urlView === "apprenticeships" || urlView === "apprentice-applications") {
      setCurrentView("apprenticeships-hub");
    } else if (urlView === "active-apprentices" || urlView === "apprentice-progress") {
      setCurrentView("apprentice-progress");
    } else if (urlView === "personal-details" || urlView === "edit-profile") {
      setCurrentView("personal-details");
    } else if (urlView === "create-pin" || urlView === "pin") {
      setCurrentView("create-pin");
    } else if (urlView === "referral" || urlView === "invite") {
      setCurrentView("referral");
    } else if (urlView === "profile") {
      setCurrentView("profile");
    } else if (!urlView) {
      setCurrentView("dashboard");
    }
  }, [urlView]);

  const toggleAvailability = async () => {
    const nextVal = !isAvailable;
    setIsAvailable(nextVal);
    try {
      await updateArtisanAvailabilityApi({ available: nextVal });
      toast.success(
        nextVal
          ? "🟢 You are now marked as available for new job requests."
          : "⚪ You are now paused/busy. New job requests are silenced.",
        { icon: nextVal ? "✅" : "⏸️" }
      );
    } catch (err: any) {
      setIsAvailable(!nextVal); // rollback
      toast.error(err?.message || "Could not update availability state.");
    }
  };

  const isVerified = verificationState === "verified" || verificationState === "just_verified";

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 1: FIND JOBS
  // ══════════════════════════════════════════════════════════════
  if (currentView === "find-jobs") {
    return (
      <ArtisanFindJobsView
        isVerified={isVerified}
        onSelectJob={(job) => {
          setSelectedJob(job);
          setCurrentView("job-detail");
        }}
        onContinueVerification={() => setCurrentView("verification")}
        onBackToDashboard={() => setCurrentView("dashboard")}
        onEditTrades={() => setCurrentView("verification")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 2: JOB DETAIL (QUOTING LOCKED / ACTIVE)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "job-detail" && selectedJob) {
    return (
      <>
        <ArtisanJobDetailView
          job={selectedJob}
          isVerified={isVerified}
          isQuoteSent={isQuoteSent}
          onBack={() => setCurrentView("find-jobs")}
          onContinueVerification={() => setCurrentView("verification")}
          onSendQuote={() => setCurrentView("send-quote")}
          onViewQuote={() => setCurrentView("quote-sent")}
          onAskQuestion={() => setCurrentView("messages")}
        />
        <ArtisanSendQuoteModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          jobTitle={selectedJob.title}
          customerName={selectedJob.customerName}
          onQuoteSent={() => {
            setIsQuoteSent(true);
            setCurrentView("quote-sent");
          }}
        />
      </>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 3: SEND QUOTE FORM (Screenshot 5 Right)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "send-quote") {
    return (
      <ArtisanQuoteFormView
        jobId={selectedJob?.id}
        jobTitle={selectedJob?.title || "Kitchen Plumbing Repair"}
        customerName={selectedJob?.customerName || "Daniel C."}
        customerBudget={selectedJob?.budget || "₦25,000 - ₦50,000"}
        onBack={() => {
          if (selectedJob) setCurrentView("job-detail");
          else setCurrentView("dashboard");
        }}
        onQuoteSent={(summary) => {
          setSelectedQuoteMeta(summary ?? null);
          setIsQuoteSent(true);
          setCurrentView("quote-sent");
        }}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 4: QUOTE SENT & STATUS (Screenshot 1 & 3)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "quote-sent") {
    return (
      <ArtisanQuoteSentView
        offerId={selectedQuoteMeta?.offerId}
        jobTitle={selectedJob?.title || "Service Request"}
        customerName={selectedJob?.customerName || "Customer"}
        quoteAmount={selectedQuoteMeta?.quoteAmount || "—"}
        submittedTime="Just now"
        estimatedCompletion={selectedQuoteMeta?.estimatedCompletion || "1 week"}
        warrantyPeriod={selectedQuoteMeta?.warrantyPeriod || "30 days"}
        onViewJob={() => setCurrentView("job-detail")}
        onFindMoreJobs={() => setCurrentView("find-jobs")}
        onBackToDashboard={() => setCurrentView("dashboard")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 5: ACTIVE JOB DETAIL & ADDITIONAL COST / COMPLETION
  // (Screenshot 4 & 5)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "active-job-detail") {
    return (
      <ArtisanActiveJobDetailView
        bookingId={selectedBookingId}
        onBack={() => {
          setJobsListTab("active");
          setCurrentView("jobs-list");
        }}
        onOpenMessages={() => setCurrentView("messages")}
        onFindMoreJobs={() => setCurrentView("find-jobs")}
        onRateCustomer={(customer) => {
          setCustomerToRate(customer);
          setCurrentView("rate-customer");
        }}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 6: JOBS LIST (REQUESTS, ACTIVE, COMPLETED, DECLINED)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "jobs-list") {
    return (
      <ArtisanJobsListView
        initialTab={jobsListTab}
        onSelectRequest={(job) => {
          setSelectedJob(job);
          setCurrentView("send-quote");
        }}
        onManageJob={(bookingId) => {
          setSelectedBookingId(bookingId);
          setCurrentView("active-job-detail");
        }}
        onBackToDashboard={() => setCurrentView("dashboard")}
        onRateCustomer={(customer) => {
          setCustomerToRate(customer);
          setCurrentView("rate-customer");
        }}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 7: ONBOARDING / BECOME AN ARTISAN (STEPS 1-5 & FAILED STATE)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "verification") {
    return (
      <ArtisanOnboardingFlow
        onBackToDashboard={() => setCurrentView("dashboard")}
        onCompleteVerification={() => {
          setVerificationState("in_review");
          setCurrentView("dashboard");
          void refreshRoles();
        }}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 8: EARNINGS & ESCROW DASHBOARD (09 · Earnings & withdrawals)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "earnings") {
    return (
      <ArtisanEarningsView
        onWithdrawToBank={() => setCurrentView("withdraw")}
        onBackToDashboard={() => setCurrentView("dashboard")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 9: WITHDRAW FLOW (Amount, Bank, Processing, Sent, Failed, Add Account)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "withdraw") {
    return (
      <ArtisanWithdrawFlowView
        onBackToEarnings={() => setCurrentView("earnings")}
        onBackToHome={() => setCurrentView("dashboard")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 10: ARTISAN MESSAGES (10 · Messages)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "messages") {
    return (
      <ArtisanMessagesView
        onBackToDashboard={() => setCurrentView("dashboard")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 11: CREATE APPRENTICESHIP (11 · Apprenticeship: create & publish)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "create-apprenticeship") {
    return (
      <ArtisanCreateApprenticeshipView
        onBackToDashboard={() => setCurrentView("dashboard")}
        onViewApprenticeship={() => setCurrentView("apprenticeships-hub")}
        onSuccess={() => setCurrentView("apprenticeships-hub")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 12: APPRENTICESHIPS HUB & APPLICATIONS (Screenshot 3 Left & Screenshot 5)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "apprenticeships-hub") {
    return (
      <ArtisanApprenticeshipsHubView
        onCreateNew={() => setCurrentView("create-apprenticeship")}
        onBackToDashboard={() => setCurrentView("dashboard")}
        initialTab={urlView === "apprentice-applications" ? "applications" : "active"}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 13: MASTER ARTISAN PROFILE (Screenshot 3 Right)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "profile") {
    return (
      <ArtisanProfileView
        onBackToDashboard={() => setCurrentView("dashboard")}
        onNavigateToEarnings={() => setCurrentView("earnings")}
        onNavigateToTalent={() => setCurrentView("apprenticeships-hub")}
        onNavigateToNotifications={() => toast("Opening notifications...")}
        onNavigateToSettings={() => setCurrentView("settings-overview")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 14: ACTIVE APPRENTICE PROGRESS & GRADUATION (Screenshot 1, 2, 3)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "apprentice-progress") {
    return (
      <ArtisanApprenticeProgressView
        onBack={() => setCurrentView("apprenticeships-hub")}
        onBackToDashboard={() => setCurrentView("dashboard")}
        onOpenMessage={() => setCurrentView("messages")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 15: PERSONAL DETAILS (Screenshot 4 Left)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "personal-details") {
    return (
      <ArtisanPersonalDetailsView
        onBackToProfile={() => setCurrentView("profile")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 16: TRANSACTION PIN CREATOR (Screenshot 4 Right)
  // ═══════════════════════════════════════════════════════════
  if (currentView === "create-pin") {
    return (
      <ArtisanCreatePinView
        onBack={() => setCurrentView("profile")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 17: INVITE & EARN / REFERRAL (Screenshot 5)
  // ═══════════════════════════════════════════════════════════
  if (currentView === "referral") {
    return (
      <ArtisanReferralView
        onBackToProfile={() => setCurrentView("profile")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 18: SETTINGS OVERVIEW (Artisan Web · Settings)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "settings-overview") {
    return (
      <ArtisanSettingsOverviewView
        onBack={() => setCurrentView("profile")}
        onNavigate={(view) => {
          if (view === "personal-details") setCurrentView("personal-details");
          else if (view === "create-pin") setCurrentView("create-pin");
          else if (view === "notifications") setCurrentView("notification-settings");
          else if (view === "language") setCurrentView("language");
          else if (view === "safety-center") setCurrentView("safety-center");
          else if (view === "report-problem") setCurrentView("report-problem");
          else if (view === "referral") setCurrentView("referral");
          else if (view === "earnings") setCurrentView("earnings");
          else if (view === "withdraw") setCurrentView("withdraw");
          else if (view === "verification") setCurrentView("verification");
          else toast(`Navigating to ${view}...`);
        }}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 19: LANGUAGE SETTINGS (Artisan Web · Language)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "language") {
    return (
      <ArtisanLanguageSettingsView
        onBack={() => setCurrentView("settings-overview")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 20: SAFETY CENTER & LIVE JOURNEY (Artisan Web · Safety support)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "safety-center") {
    return (
      <ArtisanSafetyCenterView
        onBack={() => setCurrentView("settings-overview")}
        onContactSupport={() => toast("Calling BlueFixx Support at 0700 258 3349...")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 21: REPORT A PROBLEM & DISPUTES (Artisan Web · Report a problem)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "report-problem") {
    return (
      <ArtisanReportProblemView
        onBack={() => setCurrentView("settings-overview")}
        onContactSupport={() => toast("Calling Dispute Support at 0700 258 3349...")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 22: RATE CUSTOMER (Artisan Web · Rate your customer)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "rate-customer") {
    return (
      <ArtisanRateCustomerView
        bookingId={customerToRate.bookingId}
        customerName={customerToRate.name}
        jobTitle={customerToRate.jobTitle}
        jobDate={customerToRate.date}
        onBack={() => {
          setJobsListTab("completed");
          setCurrentView("jobs-list");
        }}
        onDone={() => {
          setJobsListTab("completed");
          setCurrentView("jobs-list");
        }}
        onFindJobs={() => setCurrentView("find-jobs")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 23: NOTIFICATIONS FULL VIEW (Artisan Web · Notifications)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "notifications") {
    return (
      <ArtisanNotificationsView
        onBack={() => setCurrentView("dashboard")}
        onNavigate={(view) => {
          if (view === "find-jobs") setCurrentView("find-jobs");
          else if (view === "earnings") setCurrentView("earnings");
          else if (view === "messages") setCurrentView("messages");
          else if (view === "apprenticeships-hub") setCurrentView("apprenticeships-hub");
          else if (view === "rate-customer") setCurrentView("rate-customer");
          else if (view === "verification") setCurrentView("verification");
          else setCurrentView("dashboard");
        }}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // SUBVIEW 24: NOTIFICATION SETTINGS (Artisan Web · Notification settings)
  // ══════════════════════════════════════════════════════════════
  if (currentView === "notification-settings") {
    return (
      <ArtisanNotificationSettingsView
        onBack={() => setCurrentView("settings-overview")}
        onSave={() => setCurrentView("settings-overview")}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // MAIN VIEW: ARTISAN DASHBOARD
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto select-none animate-in fade-in duration-200">
      {/* Top Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#001B40] tracking-tight">
            {timeGreeting}, {userName}
          </h1>
        </div>
      </div>

      {/* STATE 1: Unverified Blue Notice Banner (Screenshot 3 Left) */}
      {verificationState === "not_verified" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-sm sm:text-base text-[#0F1115]">
                  Verify your identity to start earning
                </h3>
                <p className="font-sans text-xs text-neutral-500 max-w-2xl leading-relaxed">
                  You can explore jobs now. Sending quotes, receiving jobs and withdrawals unlock once your identity is verified.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView("verification")}
              className="px-5 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-center"
            >
              Continue verification →
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center gap-3">
            <div className="w-48 bg-neutral-100 rounded-full h-2 overflow-hidden">
              <div className="bg-[#001B40] h-full rounded-full w-1/4" />
            </div>
            <span className="font-sans text-xs font-medium text-neutral-400">
              1 of 4 steps done
            </span>
          </div>
        </div>
      )}

      {/* STATE 2: In Review Amber Banner (Screenshot 3 Right) */}
      {verificationState === "in_review" && (
        <div className="bg-amber-50/90 rounded-3xl p-5 sm:p-6 border border-amber-200/80 shadow-2xs space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-sm sm:text-base text-amber-950">
                  Your identity check is in review
                </h3>
                <p className="font-sans text-xs text-amber-800/90 max-w-2xl leading-relaxed">
                  Usually approved within 24 hours. We will notify you the moment you can send quotes.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200/60 flex items-center gap-3">
            <div className="w-48 bg-amber-200/80 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-700 h-full rounded-full w-3/4" />
            </div>
            <span className="font-sans text-xs font-medium text-amber-900">
              3 of 4 steps done · awaiting review
            </span>
          </div>
        </div>
      )}

      {/* STATE 3: Just Verified Green Banner (Screenshot 4 Left) */}
      {verificationState === "just_verified" && !dismissJustVerifiedBanner && (
        <div className="bg-emerald-50 rounded-3xl p-5 sm:p-6 border border-emerald-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-150">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-sm sm:text-base text-emerald-950">
                You are verified. Quoting is now open
              </h3>
              <p className="font-sans text-xs text-emerald-800/90 max-w-2xl leading-relaxed">
                Your Verified badge is live on your profile. Send your first quote to get your first job.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setCurrentView("find-jobs")}
              className="px-5 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              Find jobs →
            </button>
            <button
              type="button"
              onClick={() => setDismissJustVerifiedBanner(true)}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="Dismiss banner"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Artisan Status Profile Card (Matching Screenshot 1) */}
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
              {isVerified ? "Verified artisan" : "Not yet verified"}
            </span>
            <span className="font-heading font-extrabold text-base sm:text-lg text-[#0F1115]">
              {user?.fullName || "John Obiora"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap shrink-0">
          {/* Availability Toggle Switch */}
          {isVerified ? (
            <button
              type="button"
              onClick={toggleAvailability}
              className={`px-3.5 py-2 rounded-xl font-sans text-xs font-bold flex items-center gap-2 border transition-colors cursor-pointer ${
                isAvailable
                  ? "bg-[#001B40] text-white border-[#001B40]"
                  : "bg-neutral-100 text-neutral-600 border-neutral-300"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-emerald-400" : "bg-neutral-400"}`} />
              <span>{isAvailable ? "Available for new jobs" : "Paused / Busy"}</span>
              <span className="text-[10px] text-neutral-300 font-normal pl-1">
                Tap to change
              </span>
            </button>
          ) : (
            <div className="px-3.5 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-400 font-sans text-xs font-medium flex items-center gap-1.5">
              <span>🔒</span>
              <span>Jobs open after verification</span>
              <span className="text-[10px] text-neutral-400 bg-neutral-200/60 px-1.5 py-0.5 rounded-sm">
                Locked
              </span>
            </div>
          )}

          {/* Find Jobs CTA Button */}
          <button
            type="button"
            onClick={() => setCurrentView("find-jobs")}
            className="px-6 py-2.5 rounded-xl bg-[#001B40] hover:bg-[#052F5F] text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            Find jobs
          </button>
        </div>
      </div>

      {/* Metrics Row: 5 Cards (Matching Screenshot 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1: New Requests */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="text-neutral-400 font-sans text-xs font-medium block">
            New requests
          </span>
          <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115]">
            {dashboardData?.requests?.length ?? 0}
          </span>
        </div>

        {/* Metric 2: Active Jobs */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="text-neutral-400 font-sans text-xs font-medium block">
            Active jobs
          </span>
          <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115]">
            {dashboardData?.activeJobs?.length ?? 0}
          </span>
        </div>

        {/* Metric 3: Rating */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1">
          <span className="text-neutral-400 font-sans text-xs font-medium block">
            Rating
          </span>
          <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F1115]">
            {dashboardData?.profile?.ratingCount && dashboardData.profile.ratingCount > 0
              ? (dashboardData.profile.ratingTotal / dashboardData.profile.ratingCount).toFixed(1)
              : isVerified
              ? "4.8"
              : "New"}
          </span>
        </div>

        {/* Metric 4: Withdrawable Balance */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1 flex flex-col justify-between">
          <div>
            <span className="text-neutral-400 font-sans text-xs font-medium block">
              Withdrawable balance
            </span>
            <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#0F1115]">
              {dashboardData?.earnings?.available !== undefined
                ? formatNaira(dashboardData.earnings.available, true)
                : "₦0"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView("earnings")}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left pt-1"
          >
            Earnings →
          </button>
        </div>

        {/* Metric 5: Held in Escrow */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-1 flex flex-col justify-between">
          <div>
            <span className="text-neutral-400 font-sans text-xs font-medium block">
              Held in escrow
            </span>
            <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#0F1115]">
              {dashboardData?.earnings?.held !== undefined
                ? formatNaira(dashboardData.earnings.held, true)
                : "₦0"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView("earnings")}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left pt-1"
          >
            View more →
          </button>
        </div>
      </div>

      {/* SECTION 1: Active Jobs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg sm:text-xl text-[#0F1115]">
            Active jobs
          </h2>
          <button
            type="button"
            onClick={() => setCurrentView("active-job-detail")}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            Manage
          </button>
        </div>

        {dashboardData?.activeJobs && dashboardData.activeJobs.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.activeJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => {
                  setSelectedJob({
                    id: job.id,
                    code: `BFX-${job.id.slice(0, 5).toUpperCase()}`,
                    title: job.title || "Active Job",
                    category: "Service",
                    subCategory: "Booking",
                    postedTime: "Scheduled",
                    isUrgent: false,
                    status: job.status || "Scheduled",
                    description: "Active job in progress.",
                    service: job.title || "Service",
                    date: job.visitStart ? new Date(job.visitStart).toLocaleDateString() : "Scheduled",
                    time: "Agreed time",
                    budget: "In escrow",
                    urgency: "Scheduled",
                    customerName: job.customer?.fullName || "Customer",
                    customerLocation: "Enugu, Nigeria",
                    distance: "2.5 km away",
                    driveTime: "10 mins",
                    photoUrl: "/images/workers.png",
                    photoCaption: "Job site photo",
                    audioDuration: "0:30",
                    questions: [],
                  });
                  setCurrentView("active-job-detail");
                }}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-neutral-300 transition-all"
              >
                <div className="space-y-1.5">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-[#0F1115]">
                    {job.title || "Active Job"}
                  </h3>
                  <p className="font-sans text-xs text-neutral-400">
                    {job.customer?.fullName || "Customer"} · {job.visitStart ? new Date(job.visitStart).toLocaleString() : "Scheduled"}
                  </p>
                </div>

                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full self-start sm:self-center shrink-0">
                  ● Scheduled
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-2xs text-center space-y-2">
            <h3 className="font-heading font-bold text-sm sm:text-base text-[#0F1115]">
              No active jobs yet
            </h3>
            <p className="font-sans text-xs text-neutral-400">
              Jobs you win will appear here once you are verified.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: Recommended Jobs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg sm:text-xl text-[#0F1115]">
            Recommended jobs
          </h2>
          <button
            type="button"
            onClick={() => setCurrentView("find-jobs")}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            Find jobs
          </button>
        </div>

        {recommendedJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-2xs text-center space-y-2">
            <h3 className="font-heading font-bold text-sm sm:text-base text-[#0F1115]">
              No open jobs near you right now
            </h3>
            <p className="font-sans text-xs text-neutral-400">
              New customer job requests matching your trade will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-heading font-bold text-base text-[#0F1115]">
                        {job.title}
                      </h3>
                      <p className="font-sans text-xs text-neutral-400">
                        {job.category} · {job.subCategory}
                      </p>
                    </div>
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-100 shrink-0">
                      <Image
                        src={job.photoUrl || "/images/workers.png"}
                        alt={job.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                      {job.status}
                    </span>
                    {job.isUrgent && (
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full">
                        Urgent
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 pt-1">
                    <p className="font-sans text-xs text-neutral-600 font-medium">
                      {job.distance} · {job.date}
                    </p>
                    <p className="font-heading font-extrabold text-sm text-[#001B40]">
                      {job.budget}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <span className="font-sans text-[11px] text-neutral-400">
                    Posted {job.postedTime}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJob(job);
                      setCurrentView("job-detail");
                    }}
                    className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-sans font-bold text-xs transition-colors cursor-pointer"
                  >
                    View job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: 2-Column Split (Training + Recent Earnings) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Training (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#0F1115]">
              Training
            </h2>
            <button
              type="button"
              onClick={() => setCurrentView("apprenticeships-hub")}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-5">
            {/* Waiting applications callout (only shown for real pending applications) */}
            {waitingApps.count > 0 && (
              <div
                onClick={() => setCurrentView("apprenticeships-hub")}
                className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center gap-3 cursor-pointer hover:bg-neutral-100/70 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-sans font-bold text-xs text-[#0F1115]">
                    {waitingApps.count} application{waitingApps.count === 1 ? "" : "s"} waiting
                  </h4>
                  <p className="font-sans text-[11px] text-neutral-400">
                    {waitingApps.programTitle}
                  </p>
                </div>
              </div>
            )}

            {/* In Training Progress Bars */}
            <div className="space-y-3 pt-1">
              {dashboardData?.training?.apprentices && dashboardData.training.apprentices.length > 0 ? (
                <>
                  <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                    <span className="font-bold text-neutral-800">
                      {dashboardData.training.apprentices.length} apprentice
                      {dashboardData.training.apprentices.length === 1 ? "" : "s"} in training
                    </span>
                  </div>
                  {dashboardData.training.apprentices.map((apprentice) => (
                    <div
                      key={apprentice.enrollmentId}
                      onClick={() => setCurrentView("apprentice-progress")}
                      className="space-y-1 cursor-pointer group"
                    >
                      <div className="flex justify-between text-[11px] text-neutral-500 font-medium group-hover:text-[#001B40]">
                        <span className="group-hover:underline font-bold">{apprentice.name}</span>
                        <span>{apprentice.progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#001B40] h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, apprentice.progress))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-xs text-neutral-400">No active apprentices yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Earnings (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#0F1115]">
              Recent earnings
            </h2>
            <button
              type="button"
              onClick={() => setCurrentView("earnings")}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              All earnings
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs space-y-3.5">
            {dashboardData?.earnings?.recent && dashboardData.earnings.recent.length > 0 ? (
              dashboardData.earnings.recent.map((earning) => (
                <div
                  key={earning.id}
                  className="p-3.5 rounded-2xl border border-neutral-100 hover:bg-neutral-50/50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-xs text-[#0F1115]">
                        {earning.title}
                      </h4>
                      <p className="font-sans text-[11px] text-neutral-400">
                        {new Date(earning.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="font-heading font-extrabold text-sm text-emerald-700">
                    +{formatNaira(earning.amount, true)}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-neutral-400 font-sans">
                Earnings from completed jobs will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArtisanHomeView(props: ArtisanHomeViewProps) {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-7xl mx-auto py-12 px-4 text-center text-xs text-neutral-400 font-sans">
          Loading artisan dashboard...
        </div>
      }
    >
      <ArtisanHomeViewContent {...props} />
    </React.Suspense>
  );
}

export default ArtisanHomeView;

