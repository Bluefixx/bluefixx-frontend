import React, { Suspense } from "react";
import PostJobWizard from "@/features/dashboard/components/PostJobWizard";

export const metadata = {
  title: "Post a Job | BlueFixx Marketplace",
  description: "Post a job and match with verified local artisans in minutes.",
};

export default function PostJobPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-neutral-400">
          Loading job wizard...
        </div>
      }
    >
      <PostJobWizard />
    </Suspense>
  );
}
