"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/rbac";
import { decideApproval } from "@/services/procurement";
import type { ApprovalStatus } from "@/types";

export async function decideApprovalAction(input: {
  approvalId: string;
  decision: ApprovalStatus;
  remarks?: string;
}): Promise<{ ok: boolean; poId?: string }> {
  const user = await requirePermission("approval:decide");

  const { purchaseOrder } = await decideApproval({
    approvalId: input.approvalId,
    decision: input.decision,
    remarks: input.remarks,
    approverId: user.id,
    approverName: user.name,
  });

  revalidatePath("/approvals");
  revalidatePath("/purchase-orders");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { ok: true, poId: purchaseOrder?.id };
}
