"use client";

import React from "react";
import { OpsUsersView } from "@/features/admin/components/OpsUsersView";

export default function OpsUsersPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center text-neutral-400 animate-pulse text-xs">
          Loading Users Console...
        </div>
      }
    >
      <OpsUsersView />
    </React.Suspense>
  );
}
