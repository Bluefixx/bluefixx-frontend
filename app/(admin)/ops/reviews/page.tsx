import React, { Suspense } from "react";
import { OpsReviewsView } from "@/features/admin/components/OpsReviewsView";

export const metadata = {
  title: "Reviews and Ratings · Bluefixx Operations",
  description: "Moderation workspace for marketplace reviews and reputation signals.",
};

export default function OpsReviewsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400 text-xs">Loading reviews moderation queue...</div>}>
      <OpsReviewsView />
    </Suspense>
  );
}
