"use client";

import { LogOut, Menu } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { humanizeEnum } from "@/lib/utils/format";
import type { User } from "@/types";

export function Topbar({
  user,
  onOpenMobile,
}: {
  user: User;
  onOpenMobile: () => void;
}) {
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
      {/* Mobile-only: open the drawer (desktop collapse lives in the sidebar) */}
      <button
        onClick={onOpenMobile}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-hover hover:text-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight">{user.name}</p>
          <p className="text-xs text-muted">{humanizeEnum(user.role)}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {initials}
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-hover hover:text-danger"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </form>
      </div>
    </header>
  );
}
