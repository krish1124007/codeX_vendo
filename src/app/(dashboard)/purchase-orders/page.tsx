import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/rbac";
import { listPurchaseOrders } from "@/services/procurement";
import { getVendorMap } from "@/services/vendors";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function PurchaseOrdersPage() {
  const user = await requirePermission("po:view");
  let vendorId: string | undefined = undefined;
  
  if (user.role === "VENDOR") {
    const { getVendorByUserIdOrEmail } = await import("@/services/vendors");
    const vendor = await getVendorByUserIdOrEmail(user.id, user.email);
    if (vendor) vendorId = vendor.id;
  }

  const [pos, vendors] = await Promise.all([listPurchaseOrders(vendorId), getVendorMap()]);

  return (
    <>
      <PageHeader title="Purchase orders" subtitle="Issued purchase orders" />
      <Card>
        <CardContent>
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>PO #</TH>
                <TH>Vendor</TH>
                <TH>Date</TH>
                <TH className="text-right">Amount</TH>
                <TH>Status</TH>
                <TH></TH>
              </TR>
            </THead>
            <tbody>
              {pos.map((po) => (
                <TR key={po.id}>
                  <TD className="font-mono text-xs text-muted">{po.poNumber}</TD>
                  <TD className="font-medium">{vendors.get(po.vendorId)?.name ?? "—"}</TD>
                  <TD className="text-muted">{formatDate(po.poDate)}</TD>
                  <TD className="text-right font-medium">{formatCurrency(po.grandTotal)}</TD>
                  <TD>
                    <StatusBadge status={po.status} />
                  </TD>
                  <TD className="text-right">
                    <Link
                      href={`/purchase-orders/${po.id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View →
                    </Link>
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
