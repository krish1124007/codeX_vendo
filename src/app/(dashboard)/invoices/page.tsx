import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { MarkPaidButton } from "@/components/mark-paid-button";
import { requirePermission, can } from "@/lib/auth/rbac";
import { listInvoices } from "@/services/procurement";
import { getVendorMap } from "@/services/vendors";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function InvoicesPage() {
  const user = await requirePermission("invoice:view");
  let vendorId: string | undefined = undefined;
  
  if (user.role === "VENDOR") {
    const { getVendorByUserIdOrEmail } = await import("@/services/vendors");
    const vendor = await getVendorByUserIdOrEmail(user.id, user.email);
    if (vendor) vendorId = vendor.id;
  }

  const [invoices, vendors] = await Promise.all([listInvoices(vendorId), getVendorMap()]);
  const manage = can(user.role, "invoice:manage");

  return (
    <>
      <PageHeader title="Invoices" subtitle="Track and settle vendor invoices" />
      <Card>
        <CardContent>
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>Invoice #</TH>
                <TH>Vendor</TH>
                <TH>Date</TH>
                <TH>Due</TH>
                <TH className="text-right">Amount</TH>
                <TH>Status</TH>
                <TH></TH>
              </TR>
            </THead>
            <tbody>
              {invoices.map((inv) => (
                <TR key={inv.id}>
                  <TD className="font-mono text-xs text-muted">{inv.invoiceNumber}</TD>
                  <TD className="font-medium">{vendors.get(inv.vendorId)?.name ?? "—"}</TD>
                  <TD className="text-muted">{formatDate(inv.invoiceDate)}</TD>
                  <TD className="text-muted">{formatDate(inv.dueDate)}</TD>
                  <TD className="text-right font-medium">{formatCurrency(inv.grandTotal)}</TD>
                  <TD>
                    <StatusBadge status={inv.status} />
                  </TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/purchase-orders/${inv.purchaseOrderId}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        View
                      </Link>
                      {manage && inv.status !== "PAID" && (
                        <MarkPaidButton invoiceId={inv.id} size="sm" />
                      )}
                    </div>
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
