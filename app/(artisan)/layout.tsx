"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/features/dashboard/components/DashboardSidebar";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import UserRoleSwitcherModal from "@/features/dashboard/components/UserRoleSwitcherModal";

interface ArtisanDashboardLayoutProps {
  children: React.ReactNode;
}

export default function ArtisanDashboardLayout({
  children,
}: ArtisanDashboardLayoutProps) {
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex flex-row font-sans text-neutral-900">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      <UserRoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
      />
    </div>
  );
}
