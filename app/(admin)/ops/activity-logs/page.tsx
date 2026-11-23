import React, { Suspense } from "react";
import { OpsActivityLogsView } from "@/features/admin/components/OpsActivityLogsView";

export const metadata = {
  title: "Activity Logs & Audit Trail · Bluefixx Operations",
  description: "Immutable audit trail of administrator decisions, financial releases, and governance actions.",
};

export default function OpsActivityLogsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400 text-xs">Loading immutable activity audit logs...</div>}>
      <OpsActivityLogsView />
    </Suspense>
  );
}
