import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { SubmitQuotationForm } from "@/components/forms/submit-quotation-form";
import { requireUser } from "@/lib/auth/rbac";
import { getRFQ } from "@/services/procurement";
import { listVendors } from "@/services/vendors";
import { formatDate } from "@/lib/utils/format";

export default async function SubmitQuotationPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  await requireUser();
  const { rfqId } = await params;
  const rfq = await getRFQ(rfqId);
  if (!rfq) notFound();

  const allVendors = await listVendors();
  const assigned = allVendors.filter((v) => rfq.vendorIds.includes(v.id));
  const vendors = assigned.length ? assigned : allVendors.filter((v) => v.status === "ACTIVE");

  return (
    <>
      <PageHeader
        title="Submit quotation"
        subtitle={`${rfq.title} — deadline ${formatDate(rfq.deadline)}`}
      />
      <SubmitQuotationForm rfq={rfq} vendors={vendors} />
    </>
  );
}
