"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/rbac";
import { markInvoicePaid } from "@/services/procurement";

export async function markInvoicePaidAction(
  invoiceId: string,
): Promise<{ ok: boolean }> {
  const user = await requirePermission("invoice:manage");
  await markInvoicePaid({ invoiceId, actorId: user.id, actorName: user.name });
  revalidatePath("/invoices");
  revalidatePath("/purchase-orders");
  return { ok: true };
}
