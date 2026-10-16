"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/stores/auth-store";
import CustomerHomeView from "@/features/dashboard/components/CustomerHomeView";
import ArtisanHomeView from "@/features/dashboard/components/ArtisanHomeView";
import ApprenticeHomeView from "@/features/dashboard/components/ApprenticeHomeView";
import UserRoleSwitcherModal from "@/features/dashboard/components/UserRoleSwitcherModal";

export default function DashboardHomePage() {
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
