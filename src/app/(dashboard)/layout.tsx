import { AppShell } from "@/components/layout/app-shell";
import { NAV_ITEMS } from "@/components/layout/nav";
import { requireUser, can } from "@/lib/auth/rbac";
import { getUserNotifications, getUnreadCount } from "@/services/notifications";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const items = NAV_ITEMS.filter((item) => can(user.role, item.permission));
  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(user.id),
    getUnreadCount(user.id)
  ]);

  return (
    <AppShell 
      user={user} 
      items={items}
      notifications={notifications}
      unreadCount={unreadCount}
    >
      {children}
    </AppShell>
  );
}
