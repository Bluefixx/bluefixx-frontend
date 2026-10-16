"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/stores/auth-store";
import ArtisanHomeView from "@/features/dashboard/components/ArtisanHomeView";

export default function ArtisanPage() {
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
