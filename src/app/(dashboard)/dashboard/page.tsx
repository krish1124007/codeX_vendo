import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { SpendBarChart } from "@/components/charts/spend-bar-chart";
import { ActivityFeed } from "@/components/activity-feed";
import { requireUser } from "@/lib/auth/rbac";
import { getDashboardKpis, getMonthlyTrend } from "@/services/analytics";
import { listPurchaseOrders } from "@/services/procurement";
import { listActivity } from "@/services/activity";
import { getVendorMap } from "@/services/vendors";
import { formatCompactINR, formatCurrency } from "@/lib/utils/format";

export default async function DashboardPage() {
  const user = await requireUser();
  const [kpis, trend, pos, vendors, activity] = await Promise.all([
    getDashboardKpis(),
    getMonthlyTrend(),
    listPurchaseOrders(),
    getVendorMap(),
    listActivity(),
  ]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user.name} — today's overview`}
        actions={
          <>
            <Link href="/rfqs/new">
              <Button size="sm">
                <Icon name="Plus" size={16} /> New RFQ
              </Button>
            </Link>
            <Link href="/invoices">
              <Button size="sm" variant="secondary">
                View invoices
              </Button>
            </Link>
          </>
        }
      />

      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active RFQs"
          value={kpis.activeRFQs}
          accent="info"
          icon={<Icon name="FileText" />}
          delta="+3"
          trend="up"
          hint="vs last month"
        />
        <StatCard
          label="Pending approvals"
          value={kpis.pendingApprovals}
          accent="warning"
          icon={<Icon name="BadgeCheck" />}
          hint="awaiting decision"
        />
        <StatCard
          label="PO's this month"
          value={formatCompactINR(kpis.poSpend)}
          accent="primary"
          icon={<Icon name="ShoppingCart" />}
          delta="+12%"
          trend="up"
          hint="vs last month"
        />
        <StatCard
          label="Overdue invoices"
          value={kpis.overdueInvoices}
          accent="danger"
          icon={<Icon name="FileSpreadsheet" />}
          delta="-1"
          trend="down"
          hint="needs follow-up"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent purchase orders</CardTitle>
            <Link href="/purchase-orders" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="pt-3">
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  <TH>PO #</TH>
                  <TH>Vendor</TH>
                  <TH className="text-right">Amount</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <tbody>
                {pos.slice(0, 5).map((po) => (
                  <TR key={po.id}>
                    <TD>
                      <Link href={`/purchase-orders/${po.id}`} className="font-medium text-foreground hover:text-primary">
                        {po.poNumber}
                      </Link>
                    </TD>
                    <TD className="text-muted">{vendors.get(po.vendorId)?.name ?? "—"}</TD>
                    <TD className="text-right font-medium">{formatCurrency(po.grandTotal)}</TD>
                    <TD>
                      <StatusBadge status={po.status} />
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending trend · last 6 months</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendBarChart data={trend} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <Link href="/activity" className="text-xs font-medium text-primary hover:underline">
              View audit trail
            </Link>
          </CardHeader>
          <CardContent>
            <ActivityFeed entries={activity.slice(0, 5)} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
