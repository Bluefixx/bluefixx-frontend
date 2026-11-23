import React, { Suspense } from "react";
import { OpsAdminsView } from "@/features/admin/components/OpsAdminsView";

export const metadata = {
  title: "Administrators & Roles · Bluefixx Operations",
  description: "Manage admin console users, role assignments, and governance permissions.",
};

export default function OpsAdminsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400 text-xs">Loading administrators directory...</div>}>
      <OpsAdminsView />
    </Suspense>
  );
}
