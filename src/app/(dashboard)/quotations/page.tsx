import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/rbac";
import { listRFQs, listQuotations } from "@/services/procurement";

export default async function QuotationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requirePermission("rfq:view");
  const { status, q } = await searchParams;
  const [allRfqs, quotations] = await Promise.all([listRFQs(), listQuotations()]);
  
  let rfqs = allRfqs;
  if (status && status !== "ALL") {
    rfqs = rfqs.filter((rfq) => rfq.status === status);
  }
  if (q && q.trim() !== "") {
    const searchLower = q.trim().toLowerCase();
    rfqs = rfqs.filter(
      (rfq) =>
        rfq.title.toLowerCase().includes(searchLower) ||
        rfq.category.toLowerCase().includes(searchLower)
    );
  }

  const countByRfq = quotations.reduce<Record<string, number>>((acc, quot) => {
    acc[quot.rfqId] = (acc[quot.rfqId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader 
        title="Quotations" 
        subtitle="Quotations received against your RFQs"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted font-medium">Filter:</span>
            <form className="flex items-center gap-2">
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search RFQ or category..."
                className="h-9 rounded-md border border-border bg-card px-3 py-1 text-sm shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <select 
                name="status"
                defaultValue={status ?? "ALL"}
                className="h-9 rounded-md border border-border bg-card px-3 py-1 text-sm shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CLOSED">Closed</option>
                <option value="AWARDED">Awarded</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button 
                type="submit" 
                className="h-9 rounded-md bg-secondary px-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
              >
                Apply
              </button>
            </form>
          </div>
        }
      />

      <Card>
        <CardContent>
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>RFQ</TH>
                <TH>Category</TH>
                <TH>Quotations</TH>
                <TH>Status</TH>
                <TH></TH>
              </TR>
            </THead>
            <tbody>
              {rfqs.length === 0 ? (
                <TR>
                  <TD colSpan={5} className="py-8 text-center text-muted">
                    No RFQs found for the selected filter.
                  </TD>
                </TR>
              ) : (
                rfqs.map((rfq) => (
                  <TR key={rfq.id}>
                    <TD className="font-medium">{rfq.title}</TD>
                    <TD className="text-muted">{rfq.category}</TD>
                    <TD className="text-muted">{countByRfq[rfq.id] ?? 0} received</TD>
                    <TD>
                      <StatusBadge status={rfq.status} />
                    </TD>
                    <TD className="text-right">
                      <Link
                        href={`/quotations/${rfq.id}/compare`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Compare →
                      </Link>
                    </TD>
                  </TR>
                ))
              )}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
