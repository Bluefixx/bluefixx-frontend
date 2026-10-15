"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";

interface DashboardSidebarProps {
  onOpenRoleSwitcher?: () => void;
}

export default function DashboardSidebar({
  onOpenRoleSwitcher,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, activeRole } = useAuth();

  const navItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      exact: true,
    },
    {
      label: "Explore",
      href: "/dashboard/explore",
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      ),
      exact: false,
    },
    {
      label: "Post a Job",
      href: "/dashboard/post-job",
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
      exact: false,
    },
    {
      label: "Bookings",
      href: "/dashboard/bookings",
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      exact: false,
    },
    {
      label: "Messages",
      href: "/dashboard/messages",
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      exact: false,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      exact: false,
    },
  ];

  const roleDisplay =
    activeRole === "customer"
      ? "Customer"
      : activeRole === "artisan"
      ? "Artisan"
      : "Apprentice";

  return (
    <aside className="w-64 bg-white border-r border-neutral-200/80 min-h-screen flex flex-col justify-between shrink-0 select-none">
      {/* Top Logo & Navigation */}
      <div>
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image
              src="/icons/BFLogoW.svg"
              alt="BlueFixx"
              width={30}
              height={30}
              className="w-7 h-7 object-contain brightness-0"
            />
            <span className="font-heading font-bold text-xl text-[#001B40] tracking-tight">
              BlueFixx
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="px-3.5 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#001B40] text-white shadow-xs font-semibold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3.5 border-t border-neutral-100 space-y-1">
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
            pathname === "/dashboard/settings"
              ? "bg-[#001B40] text-white"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70"
          }`}
        >
          <svg className="w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Settings</span>
        </Link>

        <button
          type="button"
          onClick={() => toast("Contact support: support@bluefixxllp.com", { icon: "🎧" })}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 transition-colors cursor-pointer text-left"
        >
          <svg className="w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>Help & support</span>
        </button>

        {/* User Account / Role summary item */}
        <div
          onClick={onOpenRoleSwitcher}
          className="mt-2 p-2.5 rounded-2xl bg-neutral-50/80 hover:bg-neutral-100 border border-neutral-200/60 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#001B40] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.fullName ? user.fullName[0].toUpperCase() : "D"}
            </div>
            <div className="min-w-0 text-left">
              <p className="font-sans font-bold text-xs text-[#0F1115] truncate">
                {user?.fullName || "My account"}
              </p>
              <p className="font-sans text-[11px] text-neutral-500 capitalize">
                {roleDisplay}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="text-neutral-400 hover:text-neutral-700 p-1"
            title="Switch profile view"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
