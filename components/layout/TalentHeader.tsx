"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import AccountMenuDropdown from "@/features/dashboard/components/AccountMenuDropdown";
import { NotificationsDropdown } from "@/features/dashboard/components/NotificationsDropdown";

interface TalentHeaderProps {
  onOpenRoleSwitcher: () => void;
  onOpenMobileMenu?: () => void;
}

export default function TalentHeader({
  onOpenRoleSwitcher,
  onOpenMobileMenu,
}: TalentHeaderProps) {
  const { user, walletBalance } = useAuth();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <header className="h-20 bg-white border-b border-neutral-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left: Mobile Hamburger */}
      <div className="flex items-center gap-2">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            aria-label="Open sidebar menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        <div className="hidden sm:block">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
            Talent Dashboard
          </h2>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Wallet Balance */}
        <button
          onClick={() => toast(`Wallet balance: ₦${walletBalance.toLocaleString()}`, { icon: "💳" })}
          className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <span className="text-sm font-bold text-[#0F1115]">
            ₦{walletBalance.toLocaleString()}
          </span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-10 h-10 rounded-2xl bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          {isNotificationsOpen && (
            <NotificationsDropdown
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          )}
        </div>

        {/* Account Menu */}
        <div className="relative">
          <button
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-2xl border border-neutral-200/80 hover:bg-neutral-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#001B40] flex items-center justify-center text-white text-xs font-bold">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.fullName || "User"}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                (user?.fullName || "T")[0].toUpperCase()
              )}
            </div>
            <svg className="w-3.5 h-3.5 text-neutral-400 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {isAccountMenuOpen && (
            <AccountMenuDropdown
              isOpen={isAccountMenuOpen}
              onClose={() => setIsAccountMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
