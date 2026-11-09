"use client";

import React, { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/stores/auth-store";
import CustomerHomeView from "@/features/dashboard/components/CustomerHomeView";
import ArtisanHomeView from "@/features/dashboard/components/ArtisanHomeView";
import ApprenticeHomeView from "@/features/dashboard/components/ApprenticeHomeView";
import UserRoleSwitcherModal from "@/features/dashboard/components/UserRoleSwitcherModal";

function DashboardHomeContent() {
  const router = useRouter();
  const { activeRole, setActiveRole } = useAuth();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  return (
    <>
      {activeRole === "customer" && <CustomerHomeView />}

      {activeRole === "artisan" && (
        <ArtisanHomeView onSwitchToCustomer={() => setActiveRole("customer")} />
      )}

      {activeRole === "apprentice" && (
        <ApprenticeHomeView
          onSwitchToCustomer={() => setActiveRole("customer")}
          onOpenRoleSwitcher={() => setIsRoleModalOpen(true)}
        />
      )}

      <UserRoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </>
  );
}

export default function DashboardHomePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto py-12 px-4 text-center text-xs text-neutral-400 font-sans">
          Loading dashboard...
        </div>
      }
    >
      <DashboardHomeContent />
    </Suspense>
  );
}
