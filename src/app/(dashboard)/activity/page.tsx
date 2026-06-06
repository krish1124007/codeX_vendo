import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ActivityFeed } from "@/components/activity-feed";
import { requirePermission } from "@/lib/auth/rbac";
import { listActivity } from "@/services/activity";
import { cn } from "@/lib/utils/cn";
import type { ActivityType } from "@/types";

const TABS: { key: ActivityType | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "RFQ", label: "RFQ" },
  { key: "APPROVAL", label: "Approvals" },
  { key: "INVOICE", label: "Invoices" },
  { key: "VENDOR", label: "Vendors" },
];

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await requirePermission("activity:view");
  const { type } = await searchParams;
  const activeType = (type as ActivityType | "ALL") ?? "ALL";
  const entries = await listActivity(activeType);

  return (
    <>
      <PageHeader title="Activity & Logs" subtitle="Procurement audit trail" />

      <Card>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const href =
                tab.key === "ALL" ? "/activity" : `/activity?type=${tab.key}`;
              const isActive = activeType === tab.key;
              return (
                <Link
                  key={tab.key}
                  href={href}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-info/15 text-info"
                      : "text-muted hover:bg-card-hover hover:text-foreground",
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <ActivityFeed entries={entries} />

          <p className="rounded-lg border border-border bg-background px-4 py-3 text-xs text-muted">
            Audit logs are immutable — entries are write-once, with no edit or
            delete. The database schema reflects this (no soft-delete on log records).
          </p>
        </CardContent>
      </Card>
    </>
  );
}
