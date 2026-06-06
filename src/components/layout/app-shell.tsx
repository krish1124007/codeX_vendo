"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { NavItem } from "@/components/layout/nav";
import type { User } from "@/types";

import type { Notification } from "@prisma/client";

/**
 * Owns sidebar visibility:
 *  - `collapsed`   → desktop icon-only rail (toggled by the hamburger in the sidebar)
 *  - `mobileOpen`  → overlay drawer on small screens (opened from the top bar)
 */
export function AppShell({
  user,
  items,
  notifications,
  unreadCount,
  children,
}: {
  user: User;
  items: NavItem[];
  notifications: Notification[];
  unreadCount: number;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // One in-sidebar button: collapses the rail on desktop, closes the drawer on mobile.
  const toggle = () => {
    setCollapsed((v) => !v);
    setMobileOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        items={items}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={toggle}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar 
          user={user} 
          onOpenMobile={() => setMobileOpen(true)} 
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <div className="animate-fade-in mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
