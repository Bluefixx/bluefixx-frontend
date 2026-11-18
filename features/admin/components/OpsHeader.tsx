"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/stores/auth-store";

interface OpsHeaderProps {
  onOpenMobileMenu?: () => void;
}

export function OpsHeader({ onOpenMobileMenu }: OpsHeaderProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const adminName = user?.fullName || "Simeon Daniel";
  const adminEmail = user?.email || "simeon.ops@bluefixxllp.com";

  return (
    <header className="h-16 bg-white border-b border-neutral-200/90 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-neutral-600 hover:bg-neutral-100"
            aria-label="Open navigation menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        {/* Global Search Bar (matches screenshot) */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users, jobs, transactions, disputes, tickets..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white text-xs sm:text-sm text-neutral-900 border border-transparent focus:border-[#001B40] focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell with Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {/* Unread indicator dot */}
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-neutral-200/90 p-4 space-y-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="font-heading font-bold text-xs text-[#001B40]">
                  Operations Notifications
                </span>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  4 Critical
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-red-50/60 border border-red-100">
                  <p className="font-bold text-red-900 text-[11px]">Safety Incident #INC-4019</p>
                  <p className="text-neutral-600 text-[11px] mt-0.5">Physical altercation reported on Lekki site.</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100">
                  <p className="font-bold text-amber-900 text-[11px]">24 Workers Pending Verification</p>
                  <p className="text-neutral-600 text-[11px] mt-0.5">SLA warning: 8 workers waiting &gt; 24h.</p>
                </div>
                <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
                  <p className="font-bold text-blue-900 text-[11px]">Failed Withdrawal ₦120k</p>
                  <p className="text-neutral-600 text-[11px] mt-0.5">Paystack transfer reversed for Ibrahim Musa.</p>
                </div>
              </div>
              <Link
                href="/ops/notifications"
                onClick={() => setIsNotifOpen(false)}
                className="block text-center text-[11px] font-bold text-[#001B40] hover:underline pt-1"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>

        {/* User Pill (matches screenshot "Simeon Daniel / Operations Admin") */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-200/80">
          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#001B40] text-white flex items-center justify-center font-bold text-xs ring-2 ring-neutral-200">
            {user?.avatarUrl ? (
              <Image src={user.avatarUrl} alt={adminName} fill className="object-cover" />
            ) : (
              <span>{adminName.slice(0, 1)}</span>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <div className="font-heading font-bold text-xs text-[#001B40] leading-tight">
              {adminName}
            </div>
            <div className="text-[10px] text-neutral-400 font-medium">
              Operations Admin
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
