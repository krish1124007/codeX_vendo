"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/rbac";
import { markInvoicePaid } from "@/services/procurement";

export async function markInvoicePaidAction(
  invoiceId: string,
): Promise<{ ok?: boolean; error?: string }> {
  try {
    const user = await requirePermission("invoice:manage");
    await markInvoicePaid({ invoiceId, actorId: user.id, actorName: user.name });
    revalidatePath("/invoices");
    revalidatePath("/purchase-orders");
    return { ok: true };
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    return { error: error.message || "An unexpected error occurred." };
  }
}

export async function sendInvoiceEmailAction(invoiceId: string): Promise<{ ok?: boolean; error?: string }> {
  try {
    const user = await requirePermission("invoice:view");
    
    const { getInvoice } = await import("@/services/procurement");
    const { getVendor } = await import("@/services/vendors");
    const { logActivity } = await import("@/services/activity");

    const invoice = await getInvoice(invoiceId);
    if (!invoice) return { error: "Invoice not found" };

    const vendor = await getVendor(invoice.vendorId);
    
    // MOCK EMAIL DISPATCH
    console.log(`[MOCK EMAIL] Sending invoice ${invoice.invoiceNumber} to ${vendor?.email || 'vendor'}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    await logActivity({
      type: "INVOICE",
      action: "Invoice emailed",
      description: `${invoice.invoiceNumber} emailed to ${vendor?.name || 'vendor'}`,
      entityType: "INVOICE",
      entityId: invoice.id,
      actorId: user.id,
      actorName: user.name,
    });

    return { ok: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
