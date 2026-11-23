import React, { Suspense } from "react";
import { OpsCategoriesView } from "@/features/admin/components/OpsCategoriesView";

export const metadata = {
  title: "Trades & Categories · Bluefixx Operations",
  description: "Platform trade taxonomy, commission overrides, and verification requirements.",
};

export default function OpsCategoriesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400 text-xs">Loading trades taxonomy...</div>}>
      <OpsCategoriesView />
    </Suspense>
  );
}
