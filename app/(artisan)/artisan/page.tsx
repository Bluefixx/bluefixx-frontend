"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/stores/auth-store";
import ArtisanHomeView from "@/features/dashboard/components/ArtisanHomeView";

function ArtisanPageContent() {
  const router = useRouter();
  const { setActiveRole } = useAuth();

  useEffect(() => {
    setActiveRole("artisan");
  }, [setActiveRole]);

  return (
    <ArtisanHomeView
      onSwitchToCustomer={() => {
        setActiveRole("customer");
        router.push("/dashboard");
      }}
    />
  );
}

export default function ArtisanPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 text-center text-xs text-neutral-400 font-sans">
          Loading artisan dashboard...
        </div>
      }
    >
      <ArtisanPageContent />
    </Suspense>
  );
}
