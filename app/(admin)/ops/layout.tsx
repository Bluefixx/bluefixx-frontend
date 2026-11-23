"use client";

import React, { useState } from "react";
import { OpsSidebar } from "@/features/admin/components/OpsSidebar";
import { OpsHeader } from "@/features/admin/components/OpsHeader";

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <React.Suspense fallback={<div className="w-64 bg-white border-r border-neutral-200" />}>
          <OpsSidebar />
        </React.Suspense>
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10">
            <React.Suspense fallback={<div className="w-64 bg-white" />}>
              <OpsSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </React.Suspense>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <OpsHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <React.Suspense fallback={<div className="p-6 text-xs text-neutral-400">Loading...</div>}>
            {children}
          </React.Suspense>
        </main>
      </div>
    </div>
  );
}
