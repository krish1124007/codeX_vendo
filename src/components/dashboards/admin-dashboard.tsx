import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { ActivityFeed } from "@/components/activity-feed";
import { getAdminDashboardKpis } from "@/services/analytics";
import { listActivity } from "@/services/activity";
import type { User } from "@/types";

export async function AdminDashboard({ user }: { user: User }) {
  const [kpis, activity] = await Promise.all([
    getAdminDashboardKpis(),
    listActivity(),
  ]);

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        subtitle={`Welcome back, ${user.name} — System Overview`}
        actions={
          <>
            <Link href="/users">
              <Button size="sm">
                <Icon name="Users" size={16} /> Manage Users
              </Button>
            </Link>
          </>
        }
      />

      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={kpis.totalUsers}
          accent="primary"
          icon={<Icon name="Users" />}
        />
        <StatCard
          label="Total Vendors"
          value={kpis.totalVendors}
          accent="info"
          icon={<Icon name="Building" />}
        />
        <StatCard
          label="Pending Vendors"
          value={kpis.pendingVendors}
          accent="warning"
          icon={<Icon name="Clock" />}
        />
        <StatCard
          label="System Events"
          value={kpis.totalActivity}
          accent="success"
          icon={<Icon name="Activity" />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
            <Link href="/activity" className="text-xs font-medium text-primary hover:underline">
              View audit trail
            </Link>
          </CardHeader>
          <CardContent>
            <ActivityFeed entries={activity.slice(0, 10)} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
