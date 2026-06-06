import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/rbac";
import { listRFQs, listQuotations } from "@/services/procurement";

export default async function QuotationsPage() {
  await requirePermission("rfq:view");
  const [rfqs, quotations] = await Promise.all([listRFQs(), listQuotations()]);
  const countByRfq = quotations.reduce<Record<string, number>>((acc, q) => {
    acc[q.rfqId] = (acc[q.rfqId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader title="Quotations" subtitle="Quotations received against your RFQs" />

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
              {rfqs.map((rfq) => (
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
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
