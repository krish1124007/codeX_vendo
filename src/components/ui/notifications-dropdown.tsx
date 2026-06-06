"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { markNotificationAsReadAction, markAllNotificationsAsReadAction } from "@/actions/notifications";
import { toast } from "sonner";
import type { Notification } from "@prisma/client";

export function NotificationsDropdown({
  notifications,
  unreadCount,
}: {
  notifications: Notification[];
  unreadCount: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    const res = await markNotificationAsReadAction(id);
    if (res?.error) toast.error(res.error);
  };

  const handleMarkAllAsRead = async () => {
    const res = await markAllNotificationsAsReadAction();
    if (res?.error) toast.error(res.error);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-hover hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white shadow-sm ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-lg ring-1 ring-black/5 z-50 overflow-hidden flex flex-col max-h-[85vh]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                <Check size={12} />
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <Bell size={24} className="text-muted/50 mb-2" />
                <p className="text-sm font-medium text-muted">No notifications yet</p>
                <p className="text-xs text-muted/80 mt-1">When you get updates, they'll show up here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((notif) => (
                  <li 
                    key={notif.id} 
                    className={cn(
                      "flex gap-3 px-4 py-3 transition-colors hover:bg-card-hover",
                      !notif.read ? "bg-primary/5" : ""
                    )}
                  >
                    <div className={cn(
                      "mt-1 flex h-2 w-2 flex-shrink-0 rounded-full",
                      !notif.read ? "bg-primary" : "bg-transparent"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-tight">
                        {notif.title}
                      </p>
                      <p className="mt-1 text-xs text-muted line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="mt-1.5 text-[10px] font-medium text-muted/70 uppercase tracking-wider">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
