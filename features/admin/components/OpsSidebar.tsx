"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface OpsSidebarProps {
  onCloseMobile?: () => void;
}

interface NavSubItem {
  name: string;
  href: string;
  badge?: number;
  badgeColor?: "orange" | "red" | "blue";
  paramTab?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
  badge?: number;
  badgeColor?: "orange" | "red" | "blue";
  subItems?: NavSubItem[];
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export function OpsSidebar({ onCloseMobile }: OpsSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Control which dropdowns are expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Users: true,
    Jobs: false,
    "Transactions & finance": true,
    "Disputes & support": false,
    "Talents / apprenticeship": false,
  });

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const navGroups: NavGroup[] = [
    {
      group: "Operate",
      items: [
        {
          name: "Dashboard",
          href: "/ops/dashboard",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          ),
        },
        {
          name: "Users",
          href: "/ops/users",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          ),
          subItems: [
            { name: "All users", href: "/ops/users", paramTab: "all" },
            { name: "Workers", href: "/ops/users?tab=workers", paramTab: "workers" },
            { name: "Customers", href: "/ops/users?tab=customers", paramTab: "customers" },
            { name: "Talents", href: "/ops/users?tab=talents", paramTab: "talents" },
            {
              name: "Pending verification",
              href: "/ops/users?tab=pending-verification",
              paramTab: "pending-verification",
              badge: 24,
              badgeColor: "orange",
            },
            {
              name: "Suspended / blocked",
              href: "/ops/users?tab=suspended",
              paramTab: "suspended",
            },
          ],
        },
        {
          name: "Jobs",
          href: "/ops/jobs",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          ),
          subItems: [
            { name: "All jobs", href: "/ops/jobs", paramTab: "all" },
            { name: "Active", href: "/ops/jobs?tab=active", paramTab: "active" },
            { name: "Pending", href: "/ops/jobs?tab=pending", paramTab: "pending" },
            { name: "Completed", href: "/ops/jobs?tab=completed", paramTab: "completed" },
            { name: "Cancelled", href: "/ops/jobs?tab=cancelled", paramTab: "cancelled" },
            { name: "Disputed", href: "/ops/jobs?tab=disputed", paramTab: "disputed", badge: 2, badgeColor: "red" },
          ],
        },
        {
          name: "Worker verification",
          href: "/ops/verification",
          badge: 24,
          badgeColor: "orange",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          ),
        },
      ],
    },
    {
      group: "Money",
      items: [
        {
          name: "Transactions & finance",
          href: "/ops/finance",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          ),
          subItems: [
            { name: "All transactions", href: "/ops/finance", paramTab: "all" },
            { name: "Withdrawals", href: "/ops/finance?tab=withdrawals", paramTab: "withdrawals", badge: 5, badgeColor: "red" },
            { name: "Refunds", href: "/ops/finance?tab=refunds", paramTab: "refunds", badge: 2, badgeColor: "orange" },
            { name: "Platform revenue", href: "/ops/finance?tab=revenue", paramTab: "revenue" },
            { name: "Wallet activity", href: "/ops/finance?tab=wallet", paramTab: "wallet" },
          ],
        },
      ],
    },
    {
      group: "Trust & safety",
      items: [
        {
          name: "Disputes & support",
          href: "/ops/disputes",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          ),
          subItems: [
            { name: "Disputes", href: "/ops/disputes" },
            { name: "Support tickets", href: "/ops/support", badge: 12, badgeColor: "orange" },
            { name: "Safety / incidents", href: "/ops/safety", badge: 4, badgeColor: "red" },
          ],
        },
        {
          name: "Reviews & ratings",
          href: "/ops/reviews",
          badge: 3,
          badgeColor: "orange",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ),
        },
      ],
    },
    {
      group: "Supply development",
      items: [
        {
          name: "Talents / apprenticeship",
          href: "/ops/talents",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          ),
          subItems: [
            { name: "Applications", href: "/ops/talents?tab=applications", paramTab: "applications", badge: 2, badgeColor: "blue" },
            { name: "Active talents", href: "/ops/talents?tab=active", paramTab: "active" },
            { name: "Master artisans", href: "/ops/talents?tab=masters", paramTab: "masters" },
            { name: "Programmes", href: "/ops/talents?tab=programmes", paramTab: "programmes" },
            { name: "Certifications", href: "/ops/talents?tab=certifications", paramTab: "certifications" },
            { name: "Apprenticeship payments", href: "/ops/talents?tab=payments", paramTab: "payments" },
          ],
        },
        {
          name: "Categories / trades",
          href: "/ops/categories",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
          ),
        },
      ],
    },
    {
      group: "Growth & content",
      items: [
        {
          name: "Content",
          href: "/ops/content",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          ),
        },
        {
          name: "Notifications",
          href: "/ops/notifications",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          ),
        },
        {
          name: "Referrals",
          href: "/ops/referrals",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
              <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
            </svg>
          ),
        },
        {
          name: "Reports & analytics",
          href: "/ops/reports",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" x2="18" y1="20" y2="10" />
              <line x1="12" x2="12" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="14" />
            </svg>
          ),
        },
      ],
    },
    {
      group: "Platform",
      items: [
        {
          name: "Administrators & roles",
          href: "/ops/admins",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <polyline points="16 11 18 13 22 9" />
            </svg>
          ),
        },
        {
          name: "Activity logs",
          href: "/ops/activity-logs",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          ),
        },
        {
          name: "Settings",
          href: "/ops/settings",
          icon: () => (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ),
        },
      ],
    },
  ];

  //Helper to check if a sub-item is active
  const isSubItemActive = (sub: NavSubItem, parentHref: string): boolean => {
    const [subPath, subQuery] = sub.href.split("?");
    const targetPath = subPath || parentHref;

    // Check if current route matches this sub item's base path
    const pathMatches =
      pathname === targetPath ||
      (targetPath !== "/ops" && pathname.startsWith(targetPath + "/"));

    if (!pathMatches) {
      return false;
    }

    // Determine the target tab for this sub-item
    let targetTab = sub.paramTab;
    if (!targetTab && subQuery) {
      const params = new URLSearchParams(subQuery);
      targetTab = params.get("tab") || undefined;
    }

    const currentTab = (searchParams.get("tab") || "all").toLowerCase();

    // If this sub-item has a specific tab defined (e.g. "withdrawals", "all")
    if (targetTab) {
      return currentTab === targetTab.toLowerCase();
    }

    // If this sub-item has no query params and no paramTab, check if there's no tab in URL or tab is 'all'
    return !searchParams.get("tab") || searchParams.get("tab") === "all";
  };

  // Auto-expand group if current path matches
  React.useEffect(() => {
    navGroups.forEach((grp) => {
      grp.items.forEach((item) => {
        if (item.subItems) {
          const isCurrentGroup =
            pathname === item.href ||
            item.subItems.some((sub) => {
              const [subPath] = sub.href.split("?");
              return pathname === subPath || pathname.startsWith(subPath + "/");
            });

          if (isCurrentGroup) {
            setExpandedGroups((prev) => ({
              ...prev,
              [item.name]: true,
            }));
          }
        }
      });
    });
  }, [pathname]);

  return (
    <aside className="w-64 bg-white border-r border-neutral-200/90 flex flex-col h-screen shrink-0 sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-neutral-200/90 flex items-center justify-between">
        <Link href="/ops/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#001B40] text-white flex items-center justify-center shadow-xs">
            {/* Bluefixx Cube Icon */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M21 16.5l-9 5.25-9-5.25v-9l9-5.25 9 5.25v9zM12 3.82L4.5 8.18v7.64L12 20.18l7.5-4.36V8.18L12 3.82z" />
              <path d="M12 12.5l7.5-4.32M12 12.5L4.5 8.18M12 12.5v7.68" />
            </svg>
          </div>
          <span className="font-heading font-extrabold text-sm text-[#001B40] tracking-tight">
            Operations Console
          </span>
        </Link>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-neutral-400 hover:text-neutral-700"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-neutral-200">
        {navGroups.map((grp) => (
          <div key={grp.group} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              {grp.group}
            </div>

            <div className="space-y-0.5 pt-1">
              {grp.items.map((item) => {
                const hasSub = Array.isArray(item.subItems) && item.subItems.length > 0;
                const isExpanded = expandedGroups[item.name];
                const isExactActive =
                  pathname === item.href ||
                  (item.href === "/ops/dashboard" && pathname === "/ops") ||
                  (item.href === "/ops/verification" && (pathname === "/ops/verification" || pathname === "/ops/verifications"));
                const isChildActive =
                  hasSub && item.subItems?.some((sub) => isSubItemActive(sub, item.href));

                return (
                  <div key={item.name} className="space-y-0.5">
                    {hasSub ? (
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${isChildActive || isExactActive
                            ? "text-[#001B40] font-bold"
                            : "text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-900"
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.icon(Boolean(isChildActive || isExactActive))}
                          <span>{item.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${item.badgeColor === "red"
                                  ? "bg-red-100 text-red-700"
                                  : item.badgeColor === "blue"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          <svg
                            className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isExpanded ? "rotate-180" : ""
                              }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isExactActive
                            ? "bg-[#001B40] text-white shadow-xs"
                            : "text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-900"
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.icon(isExactActive)}
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${isExactActive
                                ? "bg-white/20 text-white"
                                : item.badgeColor === "red"
                                  ? "bg-red-100 text-red-700"
                                  : item.badgeColor === "blue"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )}

                    {/* Submenu */}
                    {hasSub && isExpanded && (
                      <div className="pl-6 pr-1 py-0.5 space-y-0.5 border-l-2 border-neutral-100 ml-4">
                        {item.subItems?.map((sub) => {
                          const isSubActive = isSubItemActive(sub, item.href);

                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={onCloseMobile}
                              className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${isSubActive
                                  ? "bg-[#001B40] text-white font-bold shadow-2xs"
                                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                                }`}
                            >
                              <span className="truncate">{sub.name}</span>
                              {sub.badge && (
                                <span
                                  className={`px-1.5 py-0.2 text-[9px] font-bold rounded-sm ml-1.5 ${isSubActive
                                      ? "bg-white/20 text-white"
                                      : sub.badgeColor === "red"
                                        ? "bg-red-100 text-red-700"
                                        : sub.badgeColor === "blue"
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-amber-100 text-amber-700"
                                    }`}
                                >
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Version Tag */}
      <div className="p-3 border-t border-neutral-200/90 text-center">
        <span className="text-[10px] text-neutral-400 font-medium">
          Bluefixx Admin v1.4 · Lagos region
        </span>
      </div>
    </aside>
  );
}
