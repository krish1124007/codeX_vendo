import { notFound } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { ApprovalDecision } from "@/components/approval-decision";
import { requirePermission, can } from "@/lib/auth/rbac";
import { getApproval, getApprovalsForRFQ, getQuotation } from "@/services/procurement";
import { getVendor } from "@/services/vendors";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePermission("approval:view");
  const { id } = await params;
  const approval = await getApproval(id);
  if (!approval) notFound();

  const [chain, quotation, vendor] = await Promise.all([
    getApprovalsForRFQ(approval.rfqId),
    getQuotation(approval.quotationId),
    getVendor(approval.vendorId),
  ]);

  const lowerApproved = chain
    .filter((a) => a.level < approval.level)
    .every((a) => a.status === "APPROVED");
  const actionable =
    approval.status === "PENDING" && lowerApproved && can(user.role, "approval:decide");

  // Timeline stages
  const l1 = chain.find((a) => a.level === "L1");
  const l2 = chain.find((a) => a.level === "L2");
  const poGenerated = l2?.status === "APPROVED";
  const stages = [
    { label: "Submitted", done: true, current: false },
    { label: "L1 review", done: l1?.status === "APPROVED", current: l1?.status === "PENDING" },
    { label: "L2 approval", done: l2?.status === "APPROVED", current: l2?.status === "PENDING" && l1?.status === "APPROVED" },
    { label: "Generate PO", done: poGenerated, current: false },
  ];

  return (
    <>
      <PageHeader
        title="Approval workflow"
        subtitle={`Vendor: ${vendor?.name ?? "—"} · ${quotation ? formatCurrency(quotation.grandTotal) : ""}`}
      />

      {/* Timeline */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center">
            {stages.map((s, i) => (
              <div key={s.label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
                      s.done
                        ? "bg-primary text-white"
                        : s.current
                          ? "bg-warning text-white"
                          : "bg-card text-muted",
                    )}
                  >
                    {s.done ? <CheckCircle2 size={18} /> : i + 1}
                  </span>
                  <span className={cn("text-xs", s.current ? "text-warning" : "text-muted")}>
                    {s.label}
                  </span>
                </div>
                {i < stages.length - 1 && (
                  <span className={cn("mx-2 h-px flex-1", s.done ? "bg-primary" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Approval chain */}
        <Card>
          <CardHeader>
            <CardTitle>Approval chain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-3">
            {chain.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full",
                    a.status === "APPROVED"
                      ? "bg-success/15 text-success"
                      : a.status === "REJECTED"
                        ? "bg-danger/15 text-danger"
                        : "bg-warning/15 text-warning",
                  )}
                >
                  {a.status === "APPROVED" ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {a.approverName}{" "}
                    <span className="font-normal text-muted">({a.approverRole})</span>
                  </p>
                  <p className="text-xs text-muted">
                    {a.level} ·{" "}
                    {a.status === "APPROVED"
                      ? `Approved ${a.decidedAt ? formatDateTime(a.decidedAt) : ""}`
                      : a.status === "REJECTED"
                        ? "Rejected"
                        : "Awaiting decision"}
                  </p>
                  {a.remarks && <p className="mt-1 text-xs text-muted">“{a.remarks}”</p>}
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quotation summary + decision */}
        <Card>
          <CardHeader>
            <CardTitle>Quotation summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            <SummaryRow label="Vendor" value={vendor?.name ?? "—"} />
            <SummaryRow label="Total" value={quotation ? formatCurrency(quotation.grandTotal) : "—"} />
            <SummaryRow label="Delivery" value={`${quotation?.deliveryDays ?? "—"} days`} />
            <SummaryRow label="Rating" value={`${vendor?.rating.toFixed(1) ?? "—"} / 5`} />
            <SummaryRow label="Payment terms" value={quotation?.paymentTerms ?? "—"} />

            <div className="border-t border-border pt-4">
              {actionable ? (
                <ApprovalDecision approvalId={approval.id} />
              ) : (
                <p className="text-sm text-muted">
                  {approval.status !== "PENDING"
                    ? `This ${approval.level} approval is ${approval.status.toLowerCase()}.`
                    : !lowerApproved
                      ? "Waiting on the previous approval level."
                      : "You don't have permission to decide this approval."}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
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
