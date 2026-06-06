import { PageHeader } from "@/components/ui/page-header";
import { CreateRfqForm } from "@/components/forms/create-rfq-form";
import { requirePermission } from "@/lib/auth/rbac";
import { listVendors } from "@/services/vendors";

export default async function NewRFQPage() {
  await requirePermission("rfq:create");
  const vendors = await listVendors({ status: "ACTIVE" });

  return (
    <>
      <PageHeader title="Create RFQ" subtitle="New request for quotation" />
      <CreateRfqForm vendors={vendors} />
    </>
  );
}
