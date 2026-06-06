import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/rbac";
import { listApprovals } from "@/services/procurement";
import { getVendorMap } from "@/services/vendors";
import { formatCurrency } from "@/lib/utils/format";
import { db } from "@/lib/db/store";

export default async function ApprovalsPage() {
  await requirePermission("approval:view");
  const [approvals, vendors] = await Promise.all([listApprovals(), getVendorMap()]);
  const quotationMap = new Map(db.quotations.map((q) => [q.id, q]));

  return (
    <>
      <PageHeader title="Approvals" subtitle="Approval workflow queue" />

      <Card>
        <CardContent>
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>Vendor</TH>
                <TH>Quotation</TH>
                <TH className="text-right">Amount</TH>
                <TH>Level</TH>
                <TH>Status</TH>
                <TH></TH>
              </TR>
            </THead>
            <tbody>
              {approvals.map((a) => {
                const q = quotationMap.get(a.quotationId);
                return (
                  <TR key={a.id}>
                    <TD className="font-medium">{vendors.get(a.vendorId)?.name ?? "—"}</TD>
                    <TD className="font-mono text-xs text-muted">
                      {q?.quotationNumber ?? "—"}
                    </TD>
                    <TD className="text-right">{q ? formatCurrency(q.grandTotal) : "—"}</TD>
                    <TD>
                      <Badge tone="info">{a.level}</Badge>
                    </TD>
                    <TD>
                      <StatusBadge status={a.status} />
                    </TD>
                    <TD className="text-right">
                      <Link
                        href={`/approvals/${a.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Review →
                      </Link>
                    </TD>
                  </TR>
                );
              })}
              {approvals.length === 0 && (
                <TR className="hover:bg-transparent">
                  <TD colSpan={6} className="py-8 text-center text-muted">
                    No approvals in the queue.
                  </TD>
                </TR>
              )}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
