"use client";

import React from "react";
import { OpsJobsView } from "@/features/admin/components/OpsJobsView";

export default function OpsJobsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-neutral-400">
          Loading jobs ledger...
        </div>
      }
    >
      <OpsJobsView />
    </React.Suspense>
  );
}
