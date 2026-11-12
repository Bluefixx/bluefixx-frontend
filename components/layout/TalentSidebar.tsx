"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";

interface TalentSidebarProps {
  onOpenRoleSwitcher?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function TalentSidebar({
  onOpenRoleSwitcher,
  isOpen = false,
  onClose,
}: TalentSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const [isLearnOpen, setIsLearnOpen] = useState(true);
  const [isProgressOpen, setIsProgressOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(pathname.includes("/talent/settings"));

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 lg:hidden backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200/80 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full select-none">
          {/* Brand Logo Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-neutral-100">
            <Link href="/talent/home" onClick={handleLinkClick} className="flex items-center gap-2.5">
              <Image
                src="/icons/BFLogoBlue.svg"
                alt="BlueFixx"
                width={30}
                height={30}
                className="w-7 h-7 object-contain"
                priority
              />
              <span className="font-heading font-bold text-xl text-[#001B40] tracking-tight">
                BlueFixx
              </span>
            </Link>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3.5 space-y-1.5 mt-3 overflow-y-auto">
            {/* 1. Home */}
            <Link
              href="/talent/home"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all ${
                isActive("/talent/home")
                  ? "bg-[#001B40] text-white shadow-xs font-bold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 font-medium"
              }`}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Home</span>
            </Link>

            {/* 2. Learn */}
            <div>
              <button
                type="button"
                onClick={() => setIsLearnOpen(!isLearnOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  pathname.includes("/talent/discover") || pathname.includes("/talent/applications")
                    ? "text-[#001B40] font-bold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  <span>Learn</span>
                </div>
                <svg
                  className={`w-4 h-4 text-neutral-400 transition-transform ${isLearnOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isLearnOpen && (
                <div className="pl-11 pr-2 pt-1 pb-1 space-y-1">
                  <Link
                    href="/talent/discover"
                    onClick={handleLinkClick}
                    className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                      isActive("/talent/discover")
                        ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                        : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                    }`}
                  >
                    Find apprenticeships
                  </Link>
                  <Link
                    href="/talent/applications"
                    onClick={handleLinkClick}
                    className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                      isActive("/talent/applications")
                        ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                        : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                    }`}
                  >
                    My applications
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Progress */}
            <div>
              <button
                type="button"
                onClick={() => setIsProgressOpen(!isProgressOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  pathname.includes("/talent/progress") || pathname.includes("/talent/enrollments")
                    ? "text-[#001B40] font-bold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                  <span>Progress</span>
                </div>
                <svg
                  className={`w-4 h-4 text-neutral-400 transition-transform ${isProgressOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isProgressOpen && (
                <div className="pl-11 pr-2 pt-1 pb-1 space-y-1">
                  <Link
                    href="/talent/progress"
                    onClick={handleLinkClick}
                    className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                      isActive("/talent/progress")
                        ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                        : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                    }`}
                  >
                    My apprenticeship
                  </Link>
                  <Link
                    href="/talent/enrollments"
                    onClick={handleLinkClick}
                    className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                      isActive("/talent/enrollments")
                        ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                        : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                    }`}
                  >
                    Active enrollments
                  </Link>
                </div>
              )}
            </div>

            {/* 4. Messages */}
            <Link
              href="/talent/messages"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all ${
                isActive("/talent/messages")
                  ? "bg-[#001B40] text-white shadow-xs font-bold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 font-medium"
              }`}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Messages</span>
            </Link>

            {/* 5. Certificates */}
            <Link
              href="/talent/certificates"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all ${
                isActive("/talent/certificates")
                  ? "bg-[#001B40] text-white shadow-xs font-bold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 font-medium"
              }`}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>Certificates</span>
            </Link>

            {/* 6. Reviews */}
            <Link
              href="/talent/reviews"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all ${
                isActive("/talent/reviews")
                  ? "bg-[#001B40] text-white shadow-xs font-bold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 font-medium"
              }`}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Reviews</span>
            </Link>
          </nav>

          {/* Bottom Section */}
          <div className="p-3.5 border-t border-neutral-100 space-y-1">
            {/* Settings */}
            <Link
              href="/talent/settings"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all ${
                isActive("/talent/settings")
                  ? "bg-[#001B40] text-white shadow-xs font-bold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 font-medium"
              }`}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Settings</span>
            </Link>

            {/* Profile Summary */}
            <div
              onClick={onOpenRoleSwitcher}
              className="mt-2 p-2.5 rounded-2xl bg-neutral-50/80 hover:bg-neutral-100 border border-neutral-200/60 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#001B40] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.fullName ? user.fullName[0].toUpperCase() : "T"}
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-sans font-bold text-xs text-[#0F1115] truncate">
                    {user?.fullName || "Talent Account"}
                  </p>
                  <p className="font-sans text-[11px] text-neutral-500">Apprentice</p>
                </div>
              </div>
              <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
