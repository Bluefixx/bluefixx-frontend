"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";

interface DashboardSidebarProps {
  onOpenRoleSwitcher?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

function DashboardSidebarContent({
  onOpenRoleSwitcher,
  isOpen = false,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "";
  const { user, activeRole } = useAuth();

  // Accordion state for menus with submenus
  const [isExploreOpen, setIsExploreOpen] = useState(
    pathname.includes("/explore") || pathname.includes("/post-job")
  );
  const [isBookingsOpen, setIsBookingsOpen] = useState(
    pathname.includes("/bookings")
  );
  const [isProfileOpen, setIsProfileOpen] = useState(
    pathname.includes("/profile") || pathname.includes("/wallet")
  );
  const [isLearnOpen, setIsLearnOpen] = useState(true);
  const [isProgressOpen, setIsProgressOpen] = useState(true);
  const [isArtisanJobsOpen, setIsArtisanJobsOpen] = useState(true);
  const [isArtisanTalentOpen, setIsArtisanTalentOpen] = useState(false);
  const [isArtisanProfileOpen, setIsArtisanProfileOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(
    pathname.includes("/settings")
  );

  // Auto-expand accordion when navigating to a child page
  useEffect(() => {
    if (pathname.includes("/explore") || pathname.includes("/post-job")) {
      setIsExploreOpen(true);
    }
    if (pathname.includes("/bookings")) {
      setIsBookingsOpen(true);
    }
    if (pathname.includes("/profile") || pathname.includes("/wallet")) {
      setIsProfileOpen(true);
    }
    if (pathname.includes("/settings")) {
      setIsSettingsOpen(true);
    }
  }, [pathname]);

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const isHomeActive = pathname === "/dashboard" || pathname === "/";
  const isBrowseServicesActive = pathname === "/explore" || pathname === "/dashboard/explore";
  const isPostJobActive = pathname === "/post-job" || pathname === "/dashboard/post-job";
  const isMessagesActive = pathname === "/messages" || pathname === "/dashboard/messages";
  const isReviewsActive = pathname === "/reviews" || pathname === "/dashboard/reviews";
  
  // Talent-specific navigation state
  const viewParam = searchParams.get("view") || "";
  const isTalentHomeActive = (pathname === "/dashboard" || pathname === "/") && !viewParam;
  const isFindApprenticeshipsActive = pathname.includes("/dashboard") && (viewParam === "discover" || viewParam === "master-profile");
  const isMyApplicationsActive = pathname.includes("/dashboard") && (viewParam === "applications-list" || viewParam === "apply" || viewParam === "application-sent" || viewParam === "application-accepted" || viewParam === "application-declined");
  const isLearnActive = isFindApprenticeshipsActive || isMyApplicationsActive;
  const isMyApprenticeshipActive = pathname.includes("/dashboard") && viewParam === "progress" && currentTab !== "payments";
  const isPaymentsReceiptsActive = pathname.includes("/dashboard") && (viewParam === "refund-policy" || viewParam === "request-refund" || (viewParam === "progress" && currentTab === "payments"));
  const isProgressActive = isMyApprenticeshipActive || isPaymentsReceiptsActive;

  // Artisan-specific navigation state
  const isArtisanHomeActive = (pathname === "/dashboard" || pathname === "/") && (!viewParam || viewParam === "dashboard");
  const isArtisanFindJobsActive = pathname.includes("/dashboard") && (viewParam === "find-jobs" || viewParam === "job-detail");
  const isArtisanRequestsActive = pathname.includes("/dashboard") && viewParam === "requests";
  const isArtisanQuotesActive = pathname.includes("/dashboard") && viewParam === "quotes";
  const isArtisanActiveJobsActive = pathname.includes("/dashboard") && viewParam === "active-jobs";
  const isArtisanCompletedJobsActive = pathname.includes("/dashboard") && viewParam === "completed-jobs";
  const isArtisanJobsSectionActive = isArtisanFindJobsActive || isArtisanRequestsActive || isArtisanQuotesActive || isArtisanActiveJobsActive || isArtisanCompletedJobsActive;
  
  const isArtisanProgrammesActive = pathname.includes("/dashboard") && viewParam === "training-programmes";
  const isArtisanApprenticeAppsActive = pathname.includes("/dashboard") && viewParam === "apprentice-applications";
  const isArtisanActiveApprenticesActive = pathname.includes("/dashboard") && viewParam === "active-apprentices";
  const isArtisanTalentSectionActive = isArtisanProgrammesActive || isArtisanApprenticeAppsActive || isArtisanActiveApprenticesActive;

  const isArtisanVerificationActive = pathname.includes("/dashboard") && (viewParam === "verification" || viewParam === "become-artisan");
  const isArtisanEarningsActive = pathname.includes("/wallet") || (pathname.includes("/dashboard") && viewParam === "earnings");
  const isArtisanMyProfileActive = pathname === "/profile" || (pathname.includes("/dashboard") && viewParam === "profile");
  const isArtisanProfileSectionActive = isArtisanMyProfileActive || isArtisanVerificationActive || isArtisanEarningsActive;

  // Profile submenus
  const isMyProfileActive = pathname === "/profile" || pathname === "/dashboard/profile";
  const isWalletActive = pathname === "/wallet" || pathname === "/dashboard/wallet";
  const isProfileRoot = isMyProfileActive || isWalletActive;

  // Bookings subtabs
  const isBookingsRoot = pathname === "/bookings" || pathname === "/dashboard/bookings";
  const isJobPostsActive = isBookingsRoot && (currentTab === "job-posts" || !currentTab);
  const isActiveBookingsActive = isBookingsRoot && currentTab === "active";
  const isCompletedActive = isBookingsRoot && currentTab === "completed";

  // Settings subtabs
  const isSettingsRoot = pathname === "/settings" || pathname === "/dashboard/settings";
  const isAccountActive = isSettingsRoot && (currentTab === "account" || currentTab === "personal-details" || !currentTab);
  const isNotificationsActive = isSettingsRoot && currentTab === "notifications";
  const isLanguageActive = isSettingsRoot && currentTab === "language";
  const isSafetyActive = isSettingsRoot && (currentTab === "support" || currentTab === "safety" || currentTab === "report-problem");
  const isReferralActive = isSettingsRoot && (currentTab === "referral" || currentTab === "invite");

  const roleDisplay =
    activeRole === "customer"
      ? "Customer"
      : activeRole === "artisan"
      ? "Artisan"
      : "Talent";

  const sidebarContent = (
    <div className="w-64 bg-white border-r border-neutral-200/80 min-h-screen flex flex-col justify-between shrink-0 select-none">
      {/* Top Brand Logo & Nav */}
      <div>
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-neutral-100 lg:border-b-0">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className="flex items-center gap-2.5"
          >
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

          {/* Close button on mobile */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="px-3.5 space-y-1.5 mt-3">
          {activeRole === "apprentice" ? (
            <>
              {/* 1. Home */}
              <Link
                href="/dashboard"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all ${
                  isTalentHomeActive
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

              {/* 2. Learn (with submenus) */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsLearnOpen(!isLearnOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    isLearnActive
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
                    className={`w-4 h-4 text-neutral-400 transition-transform ${
                      isLearnOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Learn Submenu */}
                {isLearnOpen && (
                  <div className="pl-11 pr-2 pt-1 pb-1 space-y-1">
                    <Link
                      href="/dashboard?view=discover"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isFindApprenticeshipsActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Find apprenticeships
                    </Link>
                    <Link
                      href="/dashboard?view=applications-list"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isMyApplicationsActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      My applications
                    </Link>
                  </div>
                )}
              </div>

              {/* 3. Progress (with submenus) */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsProgressOpen(!isProgressOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    isProgressActive
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
                    className={`w-4 h-4 text-neutral-400 transition-transform ${
                      isProgressOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Progress Submenu */}
                {isProgressOpen && (
                  <div className="pl-11 pr-2 pt-1 pb-1 space-y-1">
                    <Link
                      href="/dashboard?view=progress"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isMyApprenticeshipActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      My apprenticeship
                    </Link>
                    <Link
                      href="/dashboard?view=refund-policy"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isPaymentsReceiptsActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Payments & receipts
                    </Link>
                  </div>
                )}
              </div>

              {/* 4. Messages */}
              <Link
                href="/messages"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all ${
                  isMessagesActive
                    ? "bg-[#001B40] text-white shadow-xs font-bold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 font-medium"
                }`}
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Messages</span>
              </Link>

              {/* 5. Profile */}
              <Link
                href="/profile"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all ${
                  isMyProfileActive
                    ? "bg-[#001B40] text-white shadow-xs font-bold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 font-medium"
                }`}
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Profile</span>
              </Link>
            </>
          ) : activeRole === "artisan" ? (
            <>
              {/* 1. Home */}
              <Link
                href="/dashboard"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all ${
                  isArtisanHomeActive
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

              {/* 2. Jobs (with badge '4' and accordion) */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsArtisanJobsOpen(!isArtisanJobsOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    isArtisanJobsSectionActive
                      ? "text-[#001B40] font-bold"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <span>Jobs</span>
                    <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-[11px] font-bold flex items-center justify-center">
                      4
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-neutral-400 transition-transform ${
                      isArtisanJobsOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isArtisanJobsOpen && (
                  <div className="pl-11 pr-2 pt-1 pb-1 space-y-1">
                    <Link
                      href="/dashboard?view=find-jobs"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isArtisanFindJobsActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Find jobs
                    </Link>
                    <Link
                      href="/dashboard?view=requests"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isArtisanRequestsActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Requests
                    </Link>
                    <Link
                      href="/dashboard?view=quotes"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isArtisanQuotesActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      My quotes
                    </Link>
                    <Link
                      href="/dashboard?view=active-jobs"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isArtisanActiveJobsActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Active jobs
                    </Link>
                    <Link
                      href="/dashboard?view=completed-jobs"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isArtisanCompletedJobsActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Completed jobs
                    </Link>
                  </div>
                )}
              </div>

              {/* 3. Talent (with accordion) */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsArtisanTalentOpen(!isArtisanTalentOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    isArtisanTalentSectionActive
                      ? "text-[#001B40] font-bold"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                    <span>Talent</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-neutral-400 transition-transform ${
                      isArtisanTalentOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isArtisanTalentOpen && (
                  <div className="pl-11 pr-2 pt-1 pb-1 space-y-1">
                    <Link
                      href="/dashboard?view=training-programmes"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isArtisanProgrammesActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Training programmes
                    </Link>
                    <Link
                      href="/dashboard?view=apprentice-applications"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isArtisanApprenticeAppsActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Apprentice applications
                    </Link>
                    <Link
                      href="/dashboard?view=active-apprentices"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isArtisanActiveApprenticesActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Active apprentices
                    </Link>
                  </div>
                )}
              </div>

              {/* 4. Messages (with badge '1') */}
              <Link
                href="/messages"
                onClick={handleLinkClick}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all ${
                  isMessagesActive
                    ? "bg-[#001B40] text-white shadow-xs font-bold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Messages</span>
                </div>
                <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-[11px] font-bold flex items-center justify-center">
                  1
                </span>
              </Link>

              {/* 5. Profile (with accordion matching Screenshot 02) */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsArtisanProfileOpen(!isArtisanProfileOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    isArtisanProfileSectionActive
                      ? "text-[#001B40] font-bold"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Profile</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-neutral-400 transition-transform ${
                      isArtisanProfileOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isArtisanProfileOpen && (
                  <div className="pl-11 pr-2 pt-1 pb-1 space-y-1">
                    <Link
                      href="/profile"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isArtisanMyProfileActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      My profile
                    </Link>
                    <Link
                      href="/dashboard?view=verification"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isArtisanVerificationActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Verification
                    </Link>
                    <Link
                      href="/wallet"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isArtisanEarningsActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Earnings
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* 1. Home */}
              <Link
                href="/dashboard"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all ${
                  isHomeActive
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

              {/* 2. Explore (with submenus) */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsExploreOpen(!isExploreOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    isBrowseServicesActive || isPostJobActive
                      ? "text-[#001B40] font-bold"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                    <span>Explore</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-neutral-400 transition-transform ${
                      isExploreOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Explore Submenu */}
                {isExploreOpen && (
                  <div className="pl-11 pr-2 pt-1 pb-1 space-y-1">
                    <Link
                      href="/explore"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isBrowseServicesActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Browse services
                    </Link>
                    <Link
                      href="/post-job"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isPostJobActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Post a job
                    </Link>
                  </div>
                )}
              </div>

              {/* 3. Bookings (with submenus) */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsBookingsOpen(!isBookingsOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    isBookingsRoot
                      ? "text-[#001B40] font-bold"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Bookings</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-neutral-400 transition-transform ${
                      isBookingsOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Bookings Submenu */}
                {isBookingsOpen && (
                  <div className="pl-11 pr-2 pt-1 pb-1 space-y-1">
                    <Link
                      href="/bookings?tab=job-posts"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isJobPostsActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Job posts
                    </Link>
                    <Link
                      href="/bookings?tab=active"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isActiveBookingsActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Active bookings
                    </Link>
                    <Link
                      href="/bookings?tab=completed"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isCompletedActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Completed
                    </Link>
                  </div>
                )}
              </div>

              {/* 4. Messages */}
              <Link
                href="/messages"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all ${
                  isMessagesActive
                    ? "bg-[#001B40] text-white shadow-xs font-bold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 font-medium"
                }`}
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Messages</span>
              </Link>

              {/* 5. Reviews */}
              <Link
                href="/reviews"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all ${
                  isReviewsActive
                    ? "bg-[#001B40] text-white shadow-xs font-bold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 font-medium"
                }`}
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill={isReviewsActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>Reviews</span>
              </Link>

              {/* 6. Profile (with submenus) */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    isProfileRoot
                      ? "text-[#001B40] font-bold"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Profile</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-neutral-400 transition-transform ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Profile Submenu */}
                {isProfileOpen && (
                  <div className="pl-11 pr-2 pt-1 pb-1 space-y-1">
                    <Link
                      href="/profile"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isMyProfileActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      My profile
                    </Link>
                    <Link
                      href="/wallet"
                      onClick={handleLinkClick}
                      className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                        isWalletActive
                          ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                      }`}
                    >
                      Wallet
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3.5 border-t border-neutral-100 space-y-1">
        {/* Settings (with submenus) */}
        <div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              isSettingsRoot
                ? "text-[#001B40] font-bold"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-neutral-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Settings</span>
            </div>
            <svg
              className={`w-4 h-4 text-neutral-400 transition-transform ${
                isSettingsOpen ? "rotate-180" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Settings Submenu */}
          {isSettingsOpen && (
            <div className="pl-11 pr-2 pt-1 pb-1 space-y-1">
              <Link
                href="/settings?tab=account"
                onClick={handleLinkClick}
                className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                  isAccountActive
                    ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                }`}
              >
                Account & security
              </Link>
              <Link
                href="/settings?tab=notifications"
                onClick={handleLinkClick}
                className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                  isNotificationsActive
                    ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                }`}
              >
                Notifications
              </Link>
              <Link
                href="/settings?tab=language"
                onClick={handleLinkClick}
                className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                  isLanguageActive
                    ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                }`}
              >
                Language
              </Link>
              <Link
                href="/settings?tab=support"
                onClick={handleLinkClick}
                className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                  isSafetyActive
                    ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                }`}
              >
                Safety & support
              </Link>
              <Link
                href="/settings?tab=referral"
                onClick={handleLinkClick}
                className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                  isReferralActive
                    ? "bg-[#EBF1F7] text-[#001B40] font-bold shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900 font-medium hover:bg-neutral-50"
                }`}
              >
                Invite & earn
              </Link>
            </div>
          )}
        </div>

        {/* Help & Support */}
        <button
          type="button"
          onClick={() => toast("Reach us at support@bluefixxllp.com", { icon: "🎧" })}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 transition-colors cursor-pointer text-left"
        >
          <svg className="w-5 h-5 text-neutral-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          {/* Drawer Container */}
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardSidebar(props: DashboardSidebarProps) {
  return (
    <React.Suspense
      fallback={
        <aside className="hidden lg:block shrink-0 w-64 bg-white border-r border-neutral-100 min-h-screen" />
      }
    >
      <DashboardSidebarContent {...props} />
    </React.Suspense>
  );
}
