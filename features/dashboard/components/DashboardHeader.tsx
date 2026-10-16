"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import AccountMenuDropdown from "./AccountMenuDropdown";

interface DashboardHeaderProps {
  onOpenRoleSwitcher: () => void;
  onOpenMobileMenu?: () => void;
}

export default function DashboardHeader({
  onOpenRoleSwitcher,
  onOpenMobileMenu,
}: DashboardHeaderProps) {
  const { user, locationName, setLocationName, walletBalance } = useAuth();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const handleNotificationClick = () => {
    toast("You have 1 new message from verified artisan John Okafor", {
      icon: "🔔",
    });
  };

  const handleWalletClick = () => {
    toast(`Wallet balance: ₦${walletBalance.toLocaleString()}`, {
      icon: "💳",
    });
  };

  return (
    <header className="h-20 bg-white border-b border-neutral-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left: Mobile Hamburger + Location Selector */}
      <div className="flex items-center gap-2">
        {/* Mobile Hamburger Toggle Button */}
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 -ml-1 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setIsLocationModalOpen(!isLocationModalOpen)}
            className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer group py-1.5 px-2 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            {/* Blue Map Pin Icon */}
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <svg
                className="w-4 h-4 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>

          <div>
            <span className="block font-sans text-[11px] text-neutral-400 font-medium">
              Your location
            </span>
            <div className="flex items-center gap-1 font-sans font-bold text-xs sm:text-sm text-[#0F1115] group-hover:text-[#001B40]">
              <span>{locationName || "Independence Layout, Enugu"}</span>
              <svg
                className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </button>

        {/* Quick Location Dropdown Modal */}
        {isLocationModalOpen && (
          <div className="absolute left-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-neutral-100 p-3 z-50 animate-in fade-in duration-100">
            <p className="font-bold text-xs text-neutral-800 mb-2 px-1">
              Change Location
            </p>
            <div className="space-y-1">
              {[
                "Independence Layout, Enugu",
                "New Haven, Enugu",
                "GRA, Enugu",
                "Victoria Island, Lagos",
                "Ikeja, Lagos",
                "Maitama, Abuja",
              ].map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setLocationName(loc);
                    setIsLocationModalOpen(false);
                    toast.success(`Location set to ${loc}`);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    locationName === loc
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Controls: Role Switcher + Notifications + Wallet + Profile Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Type Switcher Button (vertical toggle arrows) */}
        <button
          type="button"
          onClick={onOpenRoleSwitcher}
          title="Switch account view (Customer / Artisan / Apprentice)"
          className="w-10 h-10 rounded-full border border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50 flex items-center justify-center text-neutral-700 transition-all cursor-pointer shadow-2xs"
        >
          {/* Vertical Toggle Arrows Icon */}
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="3" x2="12" y2="21" />
            <polyline points="8 7 12 3 16 7" />
            <polyline points="16 17 12 21 8 17" />
          </svg>
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={handleNotificationClick}
          title="Notifications"
          className="relative w-10 h-10 rounded-full border border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50 flex items-center justify-center text-neutral-700 transition-all cursor-pointer shadow-2xs"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {/* Orange Notification Pip */}
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
        </button>

        {/* Wallet Balance Widget */}
        <button
          type="button"
          onClick={handleWalletClick}
          className="hidden sm:flex flex-col text-right px-2.5 py-1 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors"
        >
          <span className="font-sans text-[11px] text-neutral-400 font-medium">
            Wallet
          </span>
          <span className="font-sans font-bold text-xs sm:text-sm text-[#0F1115]">
            ₦{walletBalance.toLocaleString()}
          </span>
        </button>

        {/* Profile Avatar Button with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-white ring-2 ring-neutral-200/80 hover:ring-[#001B40] transition-all cursor-pointer shrink-0 bg-neutral-100 flex items-center justify-center"
          >
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.fullName || "User Avatar"}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-bold text-sm text-[#001B40]">
                {user?.fullName ? user.fullName[0].toUpperCase() : "D"}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          <AccountMenuDropdown
            isOpen={isAccountMenuOpen}
            onClose={() => setIsAccountMenuOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
