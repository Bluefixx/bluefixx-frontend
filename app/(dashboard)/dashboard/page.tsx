"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/stores/auth-store";
import CustomerHomeView from "@/features/dashboard/components/CustomerHomeView";
import ArtisanHomeView from "@/features/dashboard/components/ArtisanHomeView";

function DashboardHomeContent() {
  const router = useRouter();
  const { user, activeRole, setActiveRole } = useAuth();

  useEffect(() => {
    const userObj = user as any;
    const roleStr = String(userObj?.role || "").toLowerCase();
    const rolesArr = Array.isArray(userObj?.roles)
      ? userObj.roles.map((r: any) => String(r).toLowerCase())
      : [];
    if (roleStr === "admin" || rolesArr.includes("admin")) {
      router.replace("/ops");
    }
  }, [user, router]);

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
