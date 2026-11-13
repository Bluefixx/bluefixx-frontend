"use client";

import React, { Suspense } from "react";
import { useAuth } from "@/lib/stores/auth-store";
import CustomerHomeView from "@/features/dashboard/components/CustomerHomeView";
import ArtisanHomeView from "@/features/dashboard/components/ArtisanHomeView";

function DashboardHomeContent() {
  const { activeRole, setActiveRole } = useAuth();

  return (
    <>
      {activeRole === "customer" && <CustomerHomeView />}

      {activeRole === "artisan" && (
        <ArtisanHomeView onSwitchToCustomer={() => setActiveRole("customer")} />
      )}
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
