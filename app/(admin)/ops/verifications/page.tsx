"use client";

import React from "react";
import { OpsWorkerVerificationsView } from "@/features/admin/components/OpsWorkerVerificationsView";

export default function OpsVerificationsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-neutral-400">
          Loading worker verification queue...
        </div>
      }
    >
      <OpsWorkerVerificationsView />
    </React.Suspense>
  );
}
