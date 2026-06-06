import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { SubmitQuotationForm } from "@/components/forms/submit-quotation-form";
import { requireUser } from "@/lib/auth/rbac";
import { getRFQ, getQuotationByRfqAndVendor } from "@/services/procurement";
import { listVendors } from "@/services/vendors";
import { formatDate } from "@/lib/utils/format";

export default async function SubmitQuotationPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  const user = await requireUser();
  const { rfqId } = await params;
  const rfq = await getRFQ(rfqId);
  if (!rfq) notFound();

  const allVendors = await listVendors();
  const assigned = allVendors.filter((v) => rfq.vendorIds.includes(v.id));
  let vendors = assigned.length ? assigned : allVendors.filter((v) => v.status === "ACTIVE");

  // Determine if the current user is a vendor and has an existing quotation
  let existingQuotation;
  if (user.role === "VENDOR") {
    const currentVendor = allVendors.find(v => v.userId === user.id || v.email === user.email);
    if (currentVendor) {
      vendors = [currentVendor];
      existingQuotation = await getQuotationByRfqAndVendor(rfqId, currentVendor.id);
    }
  }

  return (
    <>
      <PageHeader
        title={existingQuotation ? "Edit quotation" : "Submit quotation"}
        subtitle={`${rfq.title} — deadline ${formatDate(rfq.deadline)}`}
      />
      <SubmitQuotationForm rfq={rfq} vendors={vendors} existingQuotation={existingQuotation} />
    </>
  );
}
