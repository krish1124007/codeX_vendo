import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { DocumentActions } from "@/components/document-actions";
import { MarkPaidButton } from "@/components/mark-paid-button";
import { requirePermission, can } from "@/lib/auth/rbac";
import { getPurchaseOrder, getInvoiceForPO } from "@/services/procurement";
import { getVendor } from "@/services/vendors";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePermission("po:view");
  const { id } = await params;
  const po = await getPurchaseOrder(id);
  if (!po) notFound();

  const [invoice, vendor] = await Promise.all([
    getInvoiceForPO(po.id),
    getVendor(po.vendorId),
  ]);

  const docNumber = invoice?.invoiceNumber ?? po.poNumber;

  return (
    <>
      <PageHeader
        title="Purchase order & invoice"
        subtitle={`${po.poNumber} — auto-generated after approval`}
        actions={<DocumentActions docNumber={docNumber} />}
      />

      <Card>
        <CardContent className="space-y-6">
          {/* Parties */}
          <div className="grid grid-cols-1 gap-6 border-b border-border pb-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Bill to</p>
              <p className="mt-2 font-medium">{invoice?.billToName ?? "Your Organization Name"}</p>
              <p className="text-sm text-muted">{invoice?.billToAddress ?? "123 Business Park, Ahmedabad"}</p>
              <p className="text-sm text-muted">GSTIN: {invoice?.billToGstin ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Vendor</p>
              <p className="mt-2 font-medium">{vendor?.name ?? "—"}</p>
              <p className="text-sm text-muted">{vendor?.address ?? vendor?.city ?? ""}</p>
              <p className="text-sm text-muted">GSTIN: {vendor?.gstNumber ?? "—"}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <Meta label="PO number" value={po.poNumber} />
            <Meta label="PO date" value={formatDate(po.poDate)} />
            <Meta label="Invoice date" value={invoice ? formatDate(invoice.invoiceDate) : "—"} />
            <Meta label="Due date" value={invoice ? formatDate(invoice.dueDate) : "—"} />
          </div>

          {/* Items */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
                <th className="py-2.5">Item</th>
                <th className="py-2.5 text-right">Qty</th>
                <th className="py-2.5 text-right">Unit price</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {po.items.map((it) => (
                <tr key={it.id} className="border-b border-border/60">
                  <td className="py-3">{it.name}</td>
                  <td className="py-3 text-right text-muted">{it.quantity}</td>
                  <td className="py-3 text-right">{formatCurrency(it.unitPrice)}</td>
                  <td className="py-3 text-right font-medium">{formatCurrency(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
            <TotalRow label="Subtotal" value={formatCurrency(po.subtotal)} />
            <TotalRow label="CGST (9%)" value={formatCurrency(po.cgst)} />
            <TotalRow label="SGST (9%)" value={formatCurrency(po.sgst)} />
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>Grand total</span>
              <span>{formatCurrency(po.grandTotal)}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between border-t border-border pt-5">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">Status:</span>
              <StatusBadge status={invoice?.status ?? po.status} />
            </div>
            {invoice &&
              invoice.status !== "PAID" &&
              can(user.role, "invoice:manage") && (
                <MarkPaidButton invoiceId={invoice.id} size="sm" />
              )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
