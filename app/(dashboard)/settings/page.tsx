"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/stores/auth-store";
import { SettingsOverviewView } from "@/features/dashboard/components/settings/SettingsOverviewView";
import { PersonalDetailsView } from "@/features/dashboard/components/settings/PersonalDetailsView";
import { LanguageSettingsView } from "@/features/dashboard/components/settings/LanguageSettingsView";
import { TransactionPinView } from "@/features/dashboard/components/settings/TransactionPinView";
import { NotificationsSettingsView } from "@/features/dashboard/components/settings/NotificationsSettingsView";
import { InviteAndEarnView } from "@/features/dashboard/components/settings/InviteAndEarnView";
import { SafetySupportView } from "@/features/dashboard/components/settings/SafetySupportView";
import { ReportProblemView } from "@/features/dashboard/components/settings/ReportProblemView";
import { ArtisanSettingsOverviewView } from "@/features/dashboard/components/artisan/ArtisanSettingsOverviewView";
import { ArtisanPersonalDetailsView } from "@/features/dashboard/components/artisan/ArtisanPersonalDetailsView";
import { ArtisanCreatePinView } from "@/features/dashboard/components/artisan/ArtisanCreatePinView";
import { ArtisanLanguageSettingsView } from "@/features/dashboard/components/artisan/ArtisanLanguageSettingsView";
import { ArtisanSafetyCenterView } from "@/features/dashboard/components/artisan/ArtisanSafetyCenterView";
import { ArtisanReportProblemView } from "@/features/dashboard/components/artisan/ArtisanReportProblemView";
import { ArtisanReferralView } from "@/features/dashboard/components/artisan/ArtisanReferralView";
import { ArtisanNotificationSettingsView } from "@/features/dashboard/components/artisan/ArtisanNotificationSettingsView";

interface UserSettingsData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl?: string;
}

type SettingsTab =
  | "overview"
  | "personal-details"
  | "pin"
  | "notifications"
  | "language"
  | "support"
  | "safety"
  | "report-problem"
  | "referral";

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const { user, locationName, activeRole } = useAuth();
  const isArtisan = activeRole === "artisan";

  const [activeTab, setActiveTab] = useState<SettingsTab>("overview");
  const [userData, setUserData] = useState<UserSettingsData>({
    fullName: user?.fullName || (isArtisan ? "John Obiora" : "Daniel Eze"),
    email: user?.email || (isArtisan ? "john.obiora@gmail.com" : "danieleze@gmail.com"),
    phone: user?.phone || "+234 803 555 0142",
    location: locationName || "Independence Layout, Enugu",
    avatarUrl: "/images/david.jpg",
  });

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "personal-details") {
      setActiveTab("personal-details");
    } else if (tabParam === "pin") {
      setActiveTab("pin");
    } else if (tabParam === "notifications") {
      setActiveTab("notifications");
    } else if (tabParam === "language") {
      setActiveTab("language");
    } else if (tabParam === "support" || tabParam === "safety") {
      setActiveTab("safety");
    } else if (tabParam === "report-problem") {
      setActiveTab("report-problem");
    } else if (tabParam === "referral" || tabParam === "invite") {
      setActiveTab("referral");
    } else {
      setActiveTab("overview");
    }
  }, [searchParams]);

  // View: Personal Details
  if (activeTab === "personal-details") {
    if (isArtisan) {
      return (
        <ArtisanPersonalDetailsView
          onBackToProfile={() => setActiveTab("overview")}
        />
      );
    }
    return (
      <PersonalDetailsView
        onBack={() => setActiveTab("overview")}
        userData={userData}
        onUpdateUserData={(updated) => setUserData(updated)}
      />
    );
  }

  // View: Language
  if (activeTab === "language") {
    if (isArtisan) {
      return (
        <ArtisanLanguageSettingsView
          onBack={() => setActiveTab("overview")}
        />
      );
    }
    return (
      <LanguageSettingsView
        onBack={() => setActiveTab("overview")}
      />
    );
  }

  // View: Transaction PIN
  if (activeTab === "pin") {
    if (isArtisan) {
      return (
        <ArtisanCreatePinView
          onBack={() => setActiveTab("overview")}
        />
      );
    }
    return (
      <TransactionPinView
        onBack={() => setActiveTab("overview")}
        onPinConfigured={() => {}}
      />
    );
  }

  // View: Notifications
  if (activeTab === "notifications") {
    if (isArtisan) {
      return (
        <ArtisanNotificationSettingsView
          onBack={() => setActiveTab("overview")}
        />
      );
    }
    return (
      <NotificationsSettingsView
        onBack={() => setActiveTab("overview")}
      />
    );
  }

  // View: Safety & Support
  if (activeTab === "safety" || activeTab === "support") {
    if (isArtisan) {
      return (
        <ArtisanSafetyCenterView
          onBack={() => setActiveTab("overview")}
        />
      );
    }
    return (
      <SafetySupportView
        onBack={() => setActiveTab("overview")}
      />
    );
  }

  // View: Report a Problem & Dispute Tracker
  if (activeTab === "report-problem") {
    if (isArtisan) {
      return (
        <ArtisanReportProblemView
          onBack={() => setActiveTab("overview")}
        />
      );
    }
    return (
      <ReportProblemView
        onBack={() => setActiveTab("overview")}
      />
    );
  }

  // View: Invite & Earn / Referral Program
  if (activeTab === "referral") {
    if (isArtisan) {
      return (
        <ArtisanReferralView
          onBackToProfile={() => setActiveTab("overview")}
        />
      );
    }
    return (
      <InviteAndEarnView
        onBack={() => setActiveTab("overview")}
      />
    );
  }

  // Default View: Settings Overview
  if (isArtisan) {
    return (
      <ArtisanSettingsOverviewView
        onBack={() => window.history.back()}
        onNavigate={(tab) => {
          if (
            tab === "personal-details" ||
            tab === "pin" ||
            tab === "notifications" ||
            tab === "language" ||
            tab === "support" ||
            tab === "safety" ||
            tab === "report-problem" ||
            tab === "referral"
          ) {
            setActiveTab(tab as SettingsTab);
          } else if (tab === "safety-center") {
            setActiveTab("safety");
          } else if (tab === "earnings" || tab === "withdraw" || tab === "verification") {
            window.location.href = `/dashboard?view=${tab}`;
          }
        }}
      />
    );
  }

  return (
    <SettingsOverviewView
      onNavigate={(tab) => setActiveTab(tab)}
      userData={userData}
    />
  );
}

export default function SettingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-neutral-400 font-sans">
          Loading settings...
        </div>
      }
    >
      <SettingsPageContent />
    </React.Suspense>
  );
}
