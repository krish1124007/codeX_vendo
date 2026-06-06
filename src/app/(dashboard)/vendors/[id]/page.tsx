import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { getVendor } from "@/services/vendors";
import { listPurchaseOrders } from "@/services/procurement";
import { formatCurrency } from "@/lib/utils/format";

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendor = await getVendor(id);

  if (!vendor) {
    notFound();
  }

  // Also fetch recent POs for this vendor
  const pos = await listPurchaseOrders(vendor.id);

  return (
    <>
      <PageHeader
        title={vendor.name}
        subtitle="Vendor profile and history"
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-3">
            <div>
              <div className="text-xs text-muted">Status</div>
              <div className="mt-1"><StatusBadge status={vendor.status} /></div>
            </div>
            <div>
              <div className="text-xs text-muted">Category</div>
              <div className="font-medium">{vendor.category}</div>
            </div>
            <div>
              <div className="text-xs text-muted">GST Number</div>
              <div className="font-mono text-sm">{vendor.gstNumber}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Email</div>
              <div className="font-medium">{vendor.email || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Contact Number</div>
              <div className="font-medium">{vendor.contactNumber || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted">City</div>
              <div className="font-medium">{vendor.city || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Rating</div>
              <div className="font-medium">{vendor.rating ? `${vendor.rating.toFixed(1)} ★` : "—"}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            {pos.length === 0 ? (
              <p className="text-sm text-muted">No purchase orders found for this vendor.</p>
            ) : (
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>PO #</TH>
                    <TH>Date</TH>
                    <TH className="text-right">Amount</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <tbody>
                  {pos.map((po) => (
                    <TR key={po.id}>
                      <TD className="font-medium text-foreground">{po.poNumber}</TD>
                      <TD className="text-muted">
                        {new Date(po.poDate).toLocaleDateString()}
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
      </div>
    </>
  );
}
