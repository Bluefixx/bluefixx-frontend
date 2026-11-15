"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";
import { useNotifications } from "@/lib/stores/notifications-store";
import AccountMenuDropdown from "./AccountMenuDropdown";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { getNotificationsApi } from "@/lib/api/notifications";
import { getSavedAddressesApi } from "@/lib/api/account";
import { SavedAddress } from "@/types/customer";

interface DashboardHeaderProps {
  onOpenRoleSwitcher: () => void;
  onOpenMobileMenu?: () => void;
}

export default function DashboardHeader({
  onOpenRoleSwitcher,
  onOpenMobileMenu,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { user, locationName, setLocationName, walletBalance, activeRole, switchRole } = useAuth();
  const { unreadCount, setNotifications } = useNotifications();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  useEffect(() => {
    let mounted = true;
    getNotificationsApi()
      .then((items) => {
        if (mounted && Array.isArray(items)) {
          setNotifications(
            items.map((it: any) => ({
              id: it.id,
              title: it.title,
              description: it.body || it.title,
              time: it.createdAt
                ? new Date(it.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Today",
              dateGroup: "Today",
              isRead: Boolean(it.read || it.readAt),
              type: (it.type?.toLowerCase() as any) || "quote",
              actionUrl: "/notifications",
            }))
          );
        }
      })
      .catch((err) => {
        console.debug("Notifications API offline, using cached notifications.", err);
      });

    // Hydrate user addresses for dynamic location
    getSavedAddressesApi()
      .then((addrs) => {
        if (!mounted || !Array.isArray(addrs)) return;
        setSavedAddresses(addrs);
        if (!locationName && addrs.length > 0) {
          const def = addrs.find((a) => a.isDefault) || addrs[0];
          const name = [def.area || def.street, def.city].filter(Boolean).join(", ");
          if (name) setLocationName(name);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [setNotifications, locationName, setLocationName]);

  const displayLocation =
    locationName ||
    (user?.city && user?.state ? `${user.city}, ${user.state}` : user?.state || "Lagos, Nigeria");

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
              <span className="max-w-[140px] sm:max-w-[180px] truncate">{displayLocation}</span>
              <svg
                className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 shrink-0"
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
          <div className="absolute left-0 top-14 w-72 bg-white rounded-2xl shadow-xl border border-neutral-100 p-3 z-50 animate-in fade-in duration-100">
            <p className="font-bold text-xs text-neutral-800 mb-2 px-1">
              Select Location
            </p>

            {savedAddresses.length > 0 && (
              <div className="space-y-1 mb-2">
                <p className="text-[10px] uppercase font-bold text-neutral-400 px-1 mb-1">Saved Addresses</p>
                {savedAddresses.map((addr) => {
                  const addrLabel = [addr.area || addr.street, addr.city].filter(Boolean).join(", ");
                  const isSelected = locationName === addrLabel || locationName === addr.title;
                  return (
                    <button
                      key={addr.id}
                      onClick={() => {
                        setLocationName(addrLabel);
                        setIsLocationModalOpen(false);
                        toast.success(`Location set to ${addr.title || addr.city}`);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{addr.title || "Address"}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-500 block truncate">
                        {addr.street || addr.area}, {addr.city}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className={`space-y-1 ${savedAddresses.length > 0 ? "pt-2 border-t border-neutral-100" : ""}`}>
              <p className="text-[10px] uppercase font-bold text-neutral-400 px-1 mb-1">Cities & Regions</p>
              {[
                "Lagos, Nigeria",
                "Abuja, Nigeria",
                "Port Harcourt, Nigeria",
                "Enugu, Nigeria",
                "Ibadan, Nigeria",
              ].map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setLocationName(loc);
                    setIsLocationModalOpen(false);
                    toast.success(`Location set to ${loc}`);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
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
      </div>

      {/* Right Controls: Role Switcher + Notifications + Wallet + Profile Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Type Switcher Button (vertical toggle arrows) & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            title="Switch account view (Customer / Artisan / Talent)"
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

          {/* Floating Role Menu (Screenshot 1 Right) */}
          {isRoleMenuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-neutral-100 py-2 z-50 animate-in fade-in duration-100 select-none">
              <button
                type="button"
                onClick={async () => {
                  setIsRoleMenuOpen(false);
                  const { redirectPath } = await switchRole("customer");
                  toast.success("Switched to Customer view");
                  router.push(redirectPath);
                }}
                className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  activeRole === "customer"
                    ? "bg-[#001B40] text-white font-bold"
                    : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <span>Switch to Customer</span>
                {activeRole === "customer" && <span>✓</span>}
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsRoleMenuOpen(false);
                  const { onboardingRequired, redirectPath } = await switchRole("artisan");
                  if (onboardingRequired) {
                    toast("Complete your Artisan onboarding to activate your profile.", { icon: "📝" });
                  } else {
                    toast.success("Switched to Artisan view");
                  }
                  router.push(redirectPath);
                }}
                className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  activeRole === "artisan"
                    ? "bg-[#001B40] text-white font-bold"
                    : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <span>Switch to Artisan</span>
                {activeRole === "artisan" && <span>✓</span>}
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsRoleMenuOpen(false);
                  const { onboardingRequired, redirectPath } = await switchRole("apprentice");
                  if (onboardingRequired) {
                    toast("Complete your Apprentice profile details to get started.", { icon: "📝" });
                  } else {
                    toast.success("Switched to Talent view");
                  }
                  router.push(redirectPath);
                }}
                className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  activeRole === "apprentice"
                    ? "bg-[#001B40] text-white font-bold"
                    : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <span>Switch to Talent</span>
                {activeRole === "apprentice" && <span>✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            title={unreadCount > 0 ? `${unreadCount} unread notification(s)` : "Notifications"}
            className={`relative w-10 h-10 rounded-full border transition-all cursor-pointer shadow-2xs flex items-center justify-center ${
              unreadCount > 0
                ? "border-amber-300 bg-amber-50/50 text-amber-600 hover:bg-amber-100/60"
                : "border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700"
            }`}
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
            {/* Orange/Amber Notification Pip */}
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          <NotificationsDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

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
