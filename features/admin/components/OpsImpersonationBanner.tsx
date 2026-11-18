"use client";

import React from "react";
import Link from "next/link";
import { AdminUser } from "../types";

interface OpsImpersonationBannerProps {
  user: AdminUser | null;
  onExit: () => void;
}

export function OpsImpersonationBanner({ user, onExit }: OpsImpersonationBannerProps) {
  if (!user) return null;

  const roleDashboardUrl =
    user.role === "WORKER"
      ? "/artisan"
      : user.role === "TALENT"
      ? "/talent/home"
      : "/dashboard";

  return (
    <div className="bg-amber-500 text-black px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs font-semibold sticky top-0 z-50 animate-in slide-in-from-top duration-150">
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
        <span>
          Active Impersonation Session: <strong>{user.fullName}</strong> ({user.userCode} · {user.role})
        </span>
        <span className="hidden sm:inline text-black/70">
          — Read-only support & audit preview
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={roleDashboardUrl}
          className="px-3 py-1 rounded-lg bg-black text-white hover:bg-neutral-800 text-xs font-bold transition-colors cursor-pointer"
        >
          Open {user.role === "WORKER" ? "Artisan" : user.role === "TALENT" ? "Talent" : "Customer"} View →
        </Link>
        <button
          type="button"
          onClick={onExit}
          className="px-3 py-1 rounded-lg bg-white/30 hover:bg-white/40 text-black text-xs font-bold transition-colors cursor-pointer"
        >
          Exit Impersonation
        </button>
      </div>
    </div>
  );
}
