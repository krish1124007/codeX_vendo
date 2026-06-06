import { AppShell } from "@/components/layout/app-shell";
import { NAV_ITEMS } from "@/components/layout/nav";
import { requireUser, can } from "@/lib/auth/rbac";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const items = NAV_ITEMS.filter((item) => can(user.role, item.permission));

  return (
    <AppShell user={user} items={items}>
      {children}
    </AppShell>
  );
}
