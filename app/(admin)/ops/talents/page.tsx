import React, { Suspense } from "react";
import { OpsTalentsView } from "@/features/admin/components/OpsTalentsView";

export const metadata = {
  title: "Talents & Apprenticeship · Bluefixx Operations",
  description: "Apprenticeship pipeline, programmes, master artisans, payments and certifications.",
};

export default function OpsTalentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400 text-xs">Loading talents &amp; apprenticeship workspace...</div>}>
      <OpsTalentsView />
    </Suspense>
  );
}
