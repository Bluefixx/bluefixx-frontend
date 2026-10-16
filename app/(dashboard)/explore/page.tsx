import React, { Suspense } from "react";
import BrowseServicesView from "@/features/dashboard/components/BrowseServicesView";

export const metadata = {
  title: "Explore & Browse Services | BlueFixx Marketplace",
  description: "Browse 29 services across 5 categories with verified artisans in your area.",
};

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-neutral-400">
          Loading services...
        </div>
      }
    >
      <BrowseServicesView />
    </Suspense>
  );
}
