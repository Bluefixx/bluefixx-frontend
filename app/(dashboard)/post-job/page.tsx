import React, { Suspense } from "react";
import PostJobWizard from "@/features/dashboard/components/PostJobWizard";

export const metadata = {
  title: "Post a Job | BlueFixx Marketplace",
  description: "Post a job in simple guided steps to get matched with verified artisans.",
};

export default function PostJobPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-neutral-400">
          Loading wizard...
        </div>
      }
    >
      <PostJobWizard />
    </Suspense>
  );
}
