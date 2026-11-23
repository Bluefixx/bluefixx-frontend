import React, { Suspense } from "react";
import { OpsContentView } from "@/features/admin/components/OpsContentView";

export const metadata = {
  title: "Content & Copy Management · Bluefixx Operations",
  description: "Manage public FAQs, testimonials, and platform broadcast announcements.",
};

export default function OpsContentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400 text-xs">Loading content management workspace...</div>}>
      <OpsContentView />
    </Suspense>
  );
}
