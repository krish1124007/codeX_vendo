import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { SelectQuotationButton } from "@/components/select-quotation-button";
import { requirePermission, can } from "@/lib/auth/rbac";
import { getRFQ, getQuotationsForRFQ } from "@/services/procurement";
import { getVendorMap } from "@/services/vendors";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";

export default async function CompareQuotationsPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  const user = await requirePermission("rfq:view");
  const { rfqId } = await params;
  const rfq = await getRFQ(rfqId);
  if (!rfq) notFound();

  const [quotations, vendors] = await Promise.all([
    getQuotationsForRFQ(rfqId),
    getVendorMap(),
  ]);

  const lowestTotal = quotations.length
    ? Math.min(...quotations.map((q) => q.grandTotal))
    : 0;
  const selectionMade = quotations.some((q) => q.status === "SELECTED");
  const canSelect = can(user.role, "quotation:compare") && !selectionMade;

  const rows: { label: string; render: (i: number) => React.ReactNode }[] = [
    { label: "Grand total", render: (i) => formatCurrency(quotations[i].grandTotal) },
    { label: "GST %", render: (i) => `${quotations[i].taxRate}%` },
    { label: "Delivery (days)", render: (i) => quotations[i].deliveryDays },
    {
      label: "Vendor rating",
      render: (i) => `${vendors.get(quotations[i].vendorId)?.rating.toFixed(1) ?? "—"} / 5`,
    },
    { label: "Payment terms", render: (i) => quotations[i].paymentTerms ?? "—" },
  ];

  return (
    <>
      <PageHeader
        title="Quotation comparison"
        subtitle={`${rfq.title} — ${quotations.length} quotation${quotations.length === 1 ? "" : "s"} received`}
        actions={
          <Link href={`/quotations/${rfqId}/submit`}>
            <Button size="sm" variant="secondary">
              Submit a quotation
            </Button>
          </Link>
        }
      />

      {quotations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted">
            No quotations submitted yet for this RFQ.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-44 border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Criteria
                  </th>
                  {quotations.map((q) => {
                    const isLowest = q.grandTotal === lowestTotal;
                    return (
                      <th
                        key={q.id}
                        className={cn(
                          "border-b border-border px-4 py-3 text-left",
                          isLowest && "bg-success/10",
                        )}
                      >
                        <div className="font-semibold text-foreground">
                          {vendors.get(q.vendorId)?.name ?? "Vendor"}
                        </div>
                        <div className="mt-0.5">
                          {isLowest ? (
                            <span className="text-xs font-medium text-success">Lowest price</span>
                          ) : (
                            <span className="text-xs text-muted">{q.quotationNumber}</span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-border/60">
                    <td className="px-4 py-3 text-muted">{row.label}</td>
                    {quotations.map((q, i) => (
                      <td
                        key={q.id}
                        className={cn(
                          "px-4 py-3 font-medium",
                          q.grandTotal === lowestTotal && "bg-success/10",
                        )}
                      >
                        {row.render(i)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="px-4 py-4 text-muted">Decision</td>
                  {quotations.map((q) => {
                    const isLowest = q.grandTotal === lowestTotal;
                    return (
                      <td
                        key={q.id}
                        className={cn("px-4 py-4 align-top", isLowest && "bg-success/10")}
                      >
                        {q.status === "SELECTED" ? (
                          <StatusBadge status="SELECTED" />
                        ) : selectionMade ? (
                          <StatusBadge status={q.status} />
                        ) : canSelect ? (
                          <SelectQuotationButton quotationId={q.id} lowest={isLowest} />
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <p className="mt-4 text-xs text-muted">
        Green column = lowest price. Selecting a vendor initiates the approval workflow.
      </p>
    </>
  );
}
