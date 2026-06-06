"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/rbac";
import { createQuotation, selectQuotation, updateQuotation, getQuotationByRfqAndVendor } from "@/services/procurement";

/** Procurement officer selects the winning quotation → starts approval workflow. */
export async function selectQuotationAction(
  quotationId: string,
): Promise<{ ok?: boolean; error?: string }> {
  try {
    const user = await requirePermission("quotation:compare");
    await selectQuotation({ quotationId, actorId: user.id, actorName: user.name });
    revalidatePath("/quotations");
    revalidatePath("/approvals");
    return { ok: true };
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    return { error: error.message || "An unexpected error occurred." };
  }
}

/** Vendor submits or updates a quotation against an RFQ. */
export async function submitQuotationAction(input: {
  id?: string;
  rfqId: string;
  vendorId: string;
  taxRate: number;
  deliveryDays: number;
  paymentTerms?: string;
  notes?: string;
  items: { name: string; quantity: number; unitPrice: number }[];
}): Promise<{ error?: string; id?: string }> {
  try {
    const user = await requirePermission("quotation:submit");

    if (!input.vendorId) return { error: "Select the vendor you are quoting for." };
    if (input.items.length === 0 || input.items.some((i) => i.unitPrice <= 0)) {
      return { error: "Every line item needs a unit price." };
    }

    // Check if a quotation already exists for this vendor and RFQ
    const existing = await getQuotationByRfqAndVendor(input.rfqId, input.vendorId);
    
    let quotation;
    if (existing) {
      quotation = await updateQuotation(existing.id, { ...input, actorName: user.name });
    } else {
      quotation = await createQuotation({ ...input, actorName: user.name });
    }

    revalidatePath(`/quotations/${input.rfqId}/compare`);
    revalidatePath("/quotations");
    revalidatePath(`/rfqs`);
    return { id: quotation.id };
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    return { error: error.message || "An unexpected error occurred." };
  }
}
