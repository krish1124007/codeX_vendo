"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitQuotationAction } from "@/actions/quotations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/format";
import type { RFQ, Vendor, Quotation } from "@/types";

export function SubmitQuotationForm({
  rfq,
  vendors,
  existingQuotation,
}: {
  rfq: RFQ;
  vendors: Vendor[];
  existingQuotation?: Quotation;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [vendorId, setVendorId] = useState(existingQuotation?.vendorId ?? vendors[0]?.id ?? "");
  const [taxRate, setTaxRate] = useState(existingQuotation?.taxRate ?? 18);
  const [deliveryDays, setDeliveryDays] = useState(existingQuotation?.deliveryDays ?? 10);
  const [paymentTerms, setPaymentTerms] = useState(existingQuotation?.paymentTerms ?? "30 days net");
  const [notes, setNotes] = useState(existingQuotation?.notes ?? "");

  const initialPrices = useMemo(() => {
    if (existingQuotation?.items) {
      return rfq.items.map((it) => {
        const eqItem = existingQuotation.items.find((i: any) => i.name === it.name);
        return eqItem ? Number(eqItem.unitPrice) : 0;
      });
    }
    return rfq.items.map(() => 0);
  }, [rfq.items, existingQuotation]);

  const [prices, setPrices] = useState<number[]>(initialPrices);

  const lines = rfq.items.map((it, i) => ({
    name: it.name,
    quantity: it.quantity,
    unitPrice: prices[i] || 0,
    total: (prices[i] || 0) * it.quantity,
  }));
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.total, 0), [lines]);
  const tax = Math.round((subtotal * taxRate) / 100);
  const grand = subtotal + tax;

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await submitQuotationAction({
        id: existingQuotation?.id,
        rfqId: rfq.id,
        vendorId,
        taxRate,
        deliveryDays,
        paymentTerms,
        notes,
        items: lines.map(({ name, quantity, unitPrice }) => ({ name, quantity, unitPrice })),
      });
      if (res.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        toast.success(existingQuotation ? "Quotation updated successfully" : "Quotation submitted successfully");
        router.push(`/rfqs`);
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm">
              <p className="font-medium">RFQ summary</p>
              <p className="text-muted">
                {rfq.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")} — category {rfq.category}
              </p>
            </div>

            <div>
              <Label htmlFor="vendor">Quoting as vendor</Label>
              <Select id="vendor" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label className="mb-2">Your quotation</Label>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted">
                    <th className="pb-2">Item</th>
                    <th className="pb-2">Qty</th>
                    <th className="pb-2">Unit price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rfq.items.map((it, i) => (
                    <tr key={it.id} className="border-t border-border/60">
                      <td className="py-2">{it.name}</td>
                      <td className="py-2 text-muted">{it.quantity}</td>
                      <td className="py-2">
                        <Input
                          type="number"
                          min={0}
                          className="h-9 w-28"
                          value={prices[i] || ""}
                          onChange={(e) =>
                            setPrices((p) =>
                              p.map((v, idx) => (idx === i ? Number(e.target.value) : v)),
                            )
                          }
                        />
                      </td>
                      <td className="py-2 text-right font-medium">
                        {formatCurrency(lines[i].total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="tax">Tax / GST %</Label>
                <Input
                  id="tax"
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="delivery">Delivery (days)</Label>
                <Input
                  id="delivery"
                  type="number"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="terms">Payment terms</Label>
                <Input
                  id="terms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardContent className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Summary</p>
            <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
            <SummaryRow label={`GST (${taxRate}%)`} value={formatCurrency(tax)} />
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Grand total</span>
              <span>{formatCurrency(grand)}</span>
            </div>

            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <Button className="w-full" disabled={pending || subtotal === 0} onClick={submit}>
              {pending ? "Submitting…" : existingQuotation ? "Update quotation" : "Submit quotation"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
