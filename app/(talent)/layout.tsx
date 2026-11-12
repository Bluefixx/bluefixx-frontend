"use client";

import React, { useState } from "react";
import TalentSidebar from "@/components/layout/TalentSidebar";
import TalentHeader from "@/components/layout/TalentHeader";
import UserRoleSwitcherModal from "@/features/dashboard/components/UserRoleSwitcherModal";

interface TalentLayoutProps {
  children: React.ReactNode;
}

export default function TalentLayout({ children }: TalentLayoutProps) {
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex flex-row font-sans text-neutral-900">
      {/* Sidebar Navigation */}
      <React.Suspense fallback={<aside className="w-64 shrink-0 bg-white border-r border-neutral-100 hidden lg:block" />}>
        <TalentSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        />
      </React.Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <TalentHeader
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Role Switcher Modal */}
      <UserRoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
      />
    </div>
  );
}
