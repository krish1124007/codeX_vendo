import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { SpendBarChart } from "@/components/charts/spend-bar-chart";
import { requirePermission } from "@/lib/auth/rbac";
import {
  getMonthlyTrend,
  getReportSummary,
  getSpendByCategory,
  getTopVendorsBySpend,
} from "@/services/analytics";
import { formatCompactINR, formatCurrency } from "@/lib/utils/format";

export default async function ReportsPage() {
  await requirePermission("reports:view");
  const [summary, categories, topVendors, trend] = await Promise.all([
    getReportSummary(),
    getSpendByCategory(),
    getTopVendorsBySpend(),
    getMonthlyTrend(),
  ]);

  const maxCategory = Math.max(...categories.map((c) => c.amount));

  return (
    <>
      <PageHeader
        title="Reports & analytics"
        subtitle="Procurement insights — May 2025"
        actions={
          <Button size="sm" variant="secondary">
            <Icon name="Download" size={16} /> Export
          </Button>
        }
      />

      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total spend"
          value={formatCompactINR(summary.totalSpend)}
          accent="info"
          delta="+5%"
          trend="up"
          hint="vs Apr"
        />
        <StatCard label="Active vendors" value={summary.activeVendors} accent="success" delta="+2" trend="up" />
        <StatCard label="PO fulfillment" value={`${summary.poFulfillment}%`} accent="warning" hint="on-time delivery" />
        <StatCard label="Overdue invoices" value={summary.overdueInvoices} accent="danger" hint="needs follow-up" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Spend by category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            {categories.map((c) => (
              <div key={c.category}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{c.category}</span>
                  <span className="font-medium">{formatCompactINR(c.amount)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(c.amount / maxCategory) * 100}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top vendors by spend</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  <TH>Vendor</TH>
                  <TH className="text-right">Spend</TH>
                  <TH className="text-right">POs</TH>
                </TR>
              </THead>
              <tbody>
                {topVendors.map((v) => (
                  <TR key={v.vendor}>
                    <TD className="font-medium">{v.vendor}</TD>
                    <TD className="text-right">{formatCurrency(v.spend)}</TD>
                    <TD className="text-right text-muted">{v.pos}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendBarChart data={trend} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
