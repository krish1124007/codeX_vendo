import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { getVendorDashboardKpis } from "@/services/analytics";
import { listPurchaseOrders, listInvoices } from "@/services/procurement";
import { getVendorByUserIdOrEmail } from "@/services/vendors";
import { formatCurrency } from "@/lib/utils/format";
import type { User } from "@/types";

export async function VendorDashboard({ user }: { user: User }) {
  const vendor = await getVendorByUserIdOrEmail(user.id, user.email);

  if (!vendor) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <Icon name="Building" size={48} className="mb-4 text-muted" />
        <h2 className="text-lg font-semibold">No vendor profile found</h2>
        <p className="mt-2 text-sm text-muted">Your account is not linked to any vendor profile yet.</p>
      </div>
    );
  }

  const [kpis, pos, invoices] = await Promise.all([
    getVendorDashboardKpis(vendor.id),
    listPurchaseOrders(vendor.id),
    listInvoices(vendor.id),
  ]);

  return (
    <>
      <PageHeader
        title="Vendor Dashboard"
        subtitle={`Welcome back, ${user.name} — ${vendor.name} Overview`}
        actions={
          <>
            <Link href="/quotations">
              <Button size="sm">
                <Icon name="FileText" size={16} /> My Quotations
              </Button>
            </Link>
          </>
        }
      />

      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="RFQ Invitations"
          value={kpis.invitedRFQs}
          accent="info"
          icon={<Icon name="Mail" />}
        />
        <StatCard
          label="Active Quotations"
          value={kpis.activeQuotations}
          accent="warning"
          icon={<Icon name="FileText" />}
        />
        <StatCard
          label="Awarded POs"
          value={kpis.awardedPOs}
          accent="success"
          icon={<Icon name="BadgeCheck" />}
        />
        <StatCard
          label="Pending Invoices"
          value={kpis.pendingInvoices}
          accent="danger"
          icon={<Icon name="FileSpreadsheet" />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchase Orders</CardTitle>
            <Link href="/purchase-orders" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="pt-3">
            {pos.length === 0 ? (
              <p className="text-sm text-muted">No purchase orders found.</p>
            ) : (
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>PO #</TH>
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
                      <TD className="text-right font-medium">{formatCurrency(po.grandTotal)}</TD>
                      <TD>
                        <StatusBadge status={po.status} />
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <Link href="/invoices" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="pt-3">
            {invoices.length === 0 ? (
              <p className="text-sm text-muted">No invoices found.</p>
            ) : (
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>Inv #</TH>
                    <TH className="text-right">Amount</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <tbody>
                  {invoices.slice(0, 5).map((inv) => (
                    <TR key={inv.id}>
                      <TD>
                        <Link href={`/invoices/${inv.id}`} className="font-medium text-foreground hover:text-primary">
                          {inv.invoiceNumber}
                        </Link>
                      </TD>
                      <TD className="text-right font-medium">{formatCurrency(inv.grandTotal)}</TD>
                      <TD>
                        <StatusBadge status={inv.status} />
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
