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

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const { user, locationName } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>("overview");
  const [userData, setUserData] = useState<UserSettingsData>({
    fullName: user?.fullName || "Daniel Eze",
    email: user?.email || "danieleze@gmail.com",
    phone: user?.phone || "+234 803 212 1788",
    location: locationName || "Enugu, Nigeria",
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

  // View: Personal Details (Screenshot 3 Right)
  if (activeTab === "personal-details") {
    return (
      <PersonalDetailsView
        onBack={() => setActiveTab("overview")}
        userData={userData}
        onUpdateUserData={(updated) => setUserData(updated)}
      />
    );
  }

  // View: Language (Screenshot 4 Left)
  if (activeTab === "language") {
    return (
      <LanguageSettingsView
        onBack={() => setActiveTab("overview")}
      />
    );
  }

  // View: Transaction PIN (Screenshots 4 Right, 5 Left, 5 Right)
  if (activeTab === "pin") {
    return (
      <TransactionPinView
        onBack={() => setActiveTab("overview")}
        onPinConfigured={() => {}}
      />
    );
  }

  // View: Notifications
  if (activeTab === "notifications") {
    return (
      <NotificationsSettingsView
        onBack={() => setActiveTab("overview")}
      />
    );
  }

  // View: Safety & Support (Screenshots 3 Left, 3 Right, 4 Left)
  if (activeTab === "safety" || activeTab === "support") {
    return (
      <SafetySupportView
        onBack={() => setActiveTab("overview")}
      />
    );
  }

  // View: Report a Problem & Dispute Tracker (Screenshots 4 Right, 5 Left)
  if (activeTab === "report-problem") {
    return (
      <ReportProblemView
        onBack={() => setActiveTab("overview")}
      />
    );
  }

  // View: Invite & Earn / Referral Program (Screenshot 1 Left)
  if (activeTab === "referral") {
    return (
      <InviteAndEarnView
        onBack={() => setActiveTab("overview")}
      />
    );
  }

  // Default View: Settings Overview (Screenshot 3 Left)
  return (
    <SettingsOverviewView
      onNavigate={(tab) => setActiveTab(tab)}
      userData={userData}
    />
  );
}
