"use client";

import React from "react";
import { OpsFinanceView } from "@/features/admin/components/OpsFinanceView";

export default function OpsFinancePage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-neutral-400">
          Loading financial ledger...
        </div>
      }
    >
      <OpsFinanceView />
    </React.Suspense>
  );
}
