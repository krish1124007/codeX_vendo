"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "@/components/layout/nav";

export function Sidebar({
  items,
  collapsed,
  mobileOpen,
  onToggle,
  onCloseMobile,
}: {
  items: NavItem[];
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Backdrop (mobile only) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:transition-[width]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-[4.75rem]" : "lg:w-64",
        )}
      >
        {/* Header: hamburger + brand */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-3">
          <button
            onClick={onToggle}
            aria-label="Toggle sidebar"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-hover hover:text-foreground"
          >
            <Menu size={20} />
          </button>
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 overflow-hidden",
              collapsed && "lg:hidden",
            )}
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              VB
            </span>
            <span className="whitespace-nowrap text-base font-semibold tracking-tight">
              VendorBridge
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 pt-4">
          <p
            className={cn(
              "mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-faint",
              collapsed && "lg:hidden",
            )}
          >
            Menu
          </p>
          <div className="space-y-0.5">
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={item.label}
                  className={cn(
                    "group relative flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    collapsed && "lg:justify-center lg:px-0",
                    active
                      ? "bg-card-hover text-foreground"
                      : "text-muted hover:bg-card-hover hover:text-foreground",
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <Icon
                    name={item.icon}
                    size={18}
                    className={cn(
                      "flex-shrink-0 transition-transform duration-150",
                      active ? "text-primary" : "group-hover:scale-110",
                    )}
                  />
                  <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div
          className={cn(
            "whitespace-nowrap border-t border-border px-5 py-4 text-xs text-faint",
            collapsed && "lg:hidden",
          )}
        >
          VendorBridge · v1.0
        </div>
      </aside>
    </>
  );
}
