"use client";

import React, { useState, useEffect } from "react";
import DashboardSidebar from "@/features/dashboard/components/DashboardSidebar";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import UserRoleSwitcherModal from "@/features/dashboard/components/UserRoleSwitcherModal";
import { useAuth } from "@/lib/stores/auth-store";

interface TalentLayoutProps {
  children: React.ReactNode;
}

export default function TalentLayout({ children }: TalentLayoutProps) {
  const { setActiveRole } = useAuth();
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // The shared header/sidebar render the apprentice (talent) navigation only when
  // the active role is "apprentice". Enforce it for every /talent/* route.
  useEffect(() => {
    setActiveRole("apprentice");
  }, [setActiveRole]);

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex flex-row font-sans text-neutral-900">
      {/* Sidebar Navigation (Desktop persistent + Mobile overlay drawer) */}
      <React.Suspense fallback={<aside className="w-64 shrink-0 bg-white border-r border-neutral-100 hidden lg:block" />}>
        <DashboardSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        />
      </React.Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Hamburger & Location Selector */}
        <DashboardHeader
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        />

        {/* Page Content Body with Mobile-Optimized Padding */}
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
