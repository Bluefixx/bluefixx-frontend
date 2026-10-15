"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/features/dashboard/components/DashboardSidebar";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import UserRoleSwitcherModal from "@/features/dashboard/components/UserRoleSwitcherModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex flex-row font-sans text-neutral-900">
      {/* Sidebar Navigation */}
      <DashboardSidebar onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <DashboardHeader
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
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
