"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/rbac";
import { createQuotation, selectQuotation } from "@/services/procurement";

/** Procurement officer selects the winning quotation → starts approval workflow. */
export async function selectQuotationAction(
  quotationId: string,
): Promise<{ ok: boolean }> {
  const user = await requirePermission("quotation:compare");
  await selectQuotation({ quotationId, actorId: user.id, actorName: user.name });
  revalidatePath("/quotations");
  revalidatePath("/approvals");
  return { ok: true };
}

/** Vendor submits a quotation against an RFQ. */
export async function submitQuotationAction(input: {
  rfqId: string;
  vendorId: string;
  taxRate: number;
  deliveryDays: number;
  paymentTerms?: string;
  notes?: string;
  items: { name: string; quantity: number; unitPrice: number }[];
}): Promise<{ error?: string; id?: string }> {
  const user = await requirePermission("quotation:submit");

  if (!input.vendorId) return { error: "Select the vendor you are quoting for." };
  if (input.items.length === 0 || input.items.some((i) => i.unitPrice <= 0)) {
    return { error: "Every line item needs a unit price." };
  }

  const quotation = await createQuotation({ ...input, actorName: user.name });
  revalidatePath(`/quotations/${input.rfqId}/compare`);
  revalidatePath("/quotations");
  return { id: quotation.id };
}
