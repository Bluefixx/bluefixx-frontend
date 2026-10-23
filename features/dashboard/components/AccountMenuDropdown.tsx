"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";

interface AccountMenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountMenuDropdown({
  isOpen,
  onClose,
}: AccountMenuDropdownProps) {
  const router = useRouter();
  const { user, activeRole, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    onClose();
    router.push("/login");
  };

  const roleLabel =
    activeRole === "customer"
      ? "Customer account"
      : activeRole === "artisan"
      ? "Artisan account"
      : "Apprentice account";

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 py-2.5 z-50 animate-in fade-in duration-100"
    >
      {/* Header Info */}
      <div className="px-4 py-2">
        <p className="font-sans font-bold text-sm text-[#0F1115] truncate">
          {user?.fullName || "Daniel Eze"}
        </p>
        <p className="font-sans text-xs text-neutral-500 capitalize">{roleLabel}</p>
      </div>

      <div className="h-px bg-neutral-100 my-1.5" />

      {/* Menu Options */}
      <button
        onClick={() => {
          onClose();
          router.push("/dashboard/profile");
        }}
        className="w-full px-4 py-2 text-left text-xs sm:text-sm font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 cursor-pointer transition-colors"
      >
        <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>My profile</span>
      </button>

      <button
        onClick={() => {
          onClose();
          router.push("/dashboard/settings");
        }}
        className="w-full px-4 py-2 text-left text-xs sm:text-sm font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 cursor-pointer transition-colors"
      >
        <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span>Settings</span>
      </button>

      <div className="h-px bg-neutral-100 my-1.5" />

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full px-4 py-2 text-left text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer transition-colors"
      >
        <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>Log out</span>
      </button>
    </div>
  );
}
