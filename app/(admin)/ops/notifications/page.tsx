import React, { Suspense } from "react";
import { OpsNotificationsView } from "@/features/admin/components/OpsNotificationsView";

export const metadata = {
  title: "Broadcast Notifications · Bluefixx Operations",
  description: "Mass communication console across in-app and email channels.",
};

export default function OpsNotificationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400 text-xs">Loading broadcast notification console...</div>}>
      <OpsNotificationsView />
    </Suspense>
  );
}
