import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer, Mail, ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/rbac";
import { getInvoice } from "@/services/procurement";
import { getVendor } from "@/services/vendors";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { EmailInvoiceButton } from "./email-invoice-button";

export default async function InvoicePage(props: { params: Promise<{ id: string }> }) {
  await requirePermission("invoice:view");
  const params = await props.params;
  const invoice = await getInvoice(params.id);

  if (!invoice) notFound();

  const vendor = await getVendor(invoice.vendorId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Hide this top action bar when printing */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/invoices"
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} /> Back to Invoices
        </Link>
        <div className="flex gap-2">
          <EmailInvoiceButton invoiceId={invoice.id} />
          {/* Print simply calls window.print() */}
          <Button variant="outline" className="print-btn">
            <Printer size={16} className="mr-2" /> Print / PDF
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardContent className="p-8 sm:p-12">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">INVOICE</h1>
              <p className="mt-2 text-sm text-muted">Invoice No: {invoice.invoiceNumber}</p>
              <div className="mt-4">
                <StatusBadge status={invoice.status} />
              </div>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="font-semibold text-foreground">VendorBridge Inc.</h2>
              <p className="mt-1 text-sm text-muted">
                123 Business Park
                <br />
                Ahmedabad, Gujarat 380001
                <br />
                contact@vendorbridge.io
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase text-muted">Bill To</p>
              <div className="mt-2 text-sm">
                <p className="font-medium text-foreground">{vendor?.name || invoice.billToName}</p>
                {vendor?.city && <p className="text-muted">{vendor.city}</p>}
                {vendor?.email && <p className="text-muted">{vendor.email}</p>}
                {vendor?.gstNumber && <p className="text-muted">GSTIN: {vendor.gstNumber}</p>}
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-sm font-semibold uppercase text-muted">Details</p>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <span className="text-muted">Issue Date:</span>{" "}
                  <span className="font-medium text-foreground">{formatDate(invoice.invoiceDate)}</span>
                </p>
                <p>
                  <span className="text-muted">Due Date:</span>{" "}
                  <span className="font-medium text-foreground">{formatDate(invoice.dueDate)}</span>
                </p>
                <p>
                  <span className="text-muted">PO Ref:</span>{" "}
                  <span className="font-medium text-foreground">{invoice.purchaseOrderId.split("-")[0]}...</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <Table>
              <THead>
                <TR>
                  <TH>Description</TH>
                  <TH className="text-right">Qty</TH>
                  <TH className="text-right">Unit Price</TH>
                  <TH className="text-right">Total</TH>
                </TR>
              </THead>
              <tbody>
                {invoice.items.map((item) => (
                  <TR key={item.id}>
                    <TD className="font-medium">{item.name}</TD>
                    <TD className="text-right">{item.quantity}</TD>
                    <TD className="text-right">{formatCurrency(item.unitPrice)}</TD>
                    <TD className="text-right font-medium">{formatCurrency(item.total)}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-sm space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">CGST (9%)</span>
                <span className="font-medium">{formatCurrency(invoice.cgst)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">SGST (9%)</span>
                <span className="font-medium">{formatCurrency(invoice.sgst)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base">
                <span className="font-semibold text-foreground">Grand Total</span>
                <span className="font-bold text-primary">{formatCurrency(invoice.grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 border-t border-border pt-8 text-sm text-muted">
            <p><strong>Payment Terms:</strong> Net 30 days. Please make checks payable to VendorBridge Inc.</p>
            <p>Thank you for your business!</p>
          </div>
        </CardContent>
      </Card>

      {/* Script for printing safely on client */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelectorAll('.print-btn').forEach(btn => {
              btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.print();
              });
            });
          `,
        }}
      />
    </div>
  );
}
