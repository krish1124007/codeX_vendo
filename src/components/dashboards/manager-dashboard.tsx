import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { SpendBarChart } from "@/components/charts/spend-bar-chart";
import { getManagerDashboardKpis, getMonthlyTrend } from "@/services/analytics";
import { listPurchaseOrders } from "@/services/procurement";
import { getVendorMap } from "@/services/vendors";
import { formatCompactINR, formatCurrency } from "@/lib/utils/format";
import type { User } from "@/types";

export async function ManagerDashboard({ user }: { user: User }) {
  const [kpis, trend, pos, vendors] = await Promise.all([
    getManagerDashboardKpis(),
    getMonthlyTrend(),
    listPurchaseOrders(),
    getVendorMap(),
  ]);

  return (
    <>
      <PageHeader
        title="Manager Dashboard"
        subtitle={`Welcome back, ${user.name} — Financial & Approval Overview`}
        actions={
          <>
            <Link href="/approvals">
              <Button size="sm" variant="secondary">
                <Icon name="BadgeCheck" size={16} className="mr-2" /> Pending Approvals
              </Button>
            </Link>
            <Link href="/reports">
              <Button size="sm">
                <Icon name="BarChart" size={16} className="mr-2" /> View Reports
              </Button>
            </Link>
          </>
        }
      />

      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total PO Spend"
          value={formatCompactINR(kpis.totalPoSpend)}
          accent="primary"
          icon={<Icon name="DollarSign" />}
        />
        <StatCard
          label="Pending L2 Approvals"
          value={kpis.pendingL2Approvals}
          accent="warning"
          icon={<Icon name="BadgeCheck" />}
        />
        <StatCard
          label="Overdue Invoices"
          value={kpis.overdueInvoices}
          accent="danger"
          icon={<Icon name="FileSpreadsheet" />}
        />
        <StatCard
          label="Active Vendors"
          value={kpis.totalActiveVendors}
          accent="info"
          icon={<Icon name="Building" />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent High-Value POs</CardTitle>
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
                {pos.slice(0, 6).map((po) => (
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
            <CardTitle>Spending Trend · Last 6 months</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendBarChart data={trend} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
