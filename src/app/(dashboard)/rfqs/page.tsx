import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { requirePermission, can } from "@/lib/auth/rbac";
import { listRFQs } from "@/services/procurement";
import { formatDate } from "@/lib/utils/format";

export default async function RFQsPage() {
  const user = await requirePermission("rfq:view");
  const rfqs = await listRFQs();

  return (
    <>
      <PageHeader
        title="RFQ's"
        subtitle="Requests for quotation"
        actions={
          can(user.role, "rfq:create") ? (
            <Link href="/rfqs/new">
              <Button size="sm">
                <Icon name="Plus" size={16} /> New RFQ
              </Button>
            </Link>
          ) : undefined
        }
      />

      <Card>
        <CardContent>
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>RFQ #</TH>
                <TH>Title</TH>
                <TH>Category</TH>
                <TH>Deadline</TH>
                <TH>Vendors</TH>
                <TH>Status</TH>
                <TH></TH>
              </TR>
            </THead>
            <tbody>
              {rfqs.map((rfq) => (
                <TR key={rfq.id}>
                  <TD className="font-mono text-xs text-muted">{rfq.rfqNumber}</TD>
                  <TD className="font-medium">{rfq.title}</TD>
                  <TD className="text-muted">{rfq.category}</TD>
                  <TD className="text-muted">{formatDate(rfq.deadline)}</TD>
                  <TD className="text-muted">{rfq.vendorIds.length}</TD>
                  <TD>
                    <StatusBadge status={rfq.status} />
                  </TD>
                  <TD className="text-right">
                    <Link
                      href={`/quotations/${rfq.id}/compare`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Quotations
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
