"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/rbac";
import { decideApproval, getApproval } from "@/services/procurement";
import type { ApprovalStatus } from "@/types";

export async function decideApprovalAction(input: {
  approvalId: string;
  decision: ApprovalStatus;
  remarks?: string;
}): Promise<{ ok?: boolean; poId?: string; error?: string }> {
  try {
    const user = await requirePermission("approval:decide");

    const approval = await getApproval(input.approvalId);
    if (!approval) throw new Error("Approval not found");

    const hasLevelPermission =
      user.role === "ADMIN" ||
      (approval.level === "L1" && user.role === "PROCUREMENT_OFFICER") ||
      (approval.level === "L2" && user.role === "MANAGER");

    if (!hasLevelPermission) {
      throw new Error("You do not have permission to decide this level of approval");
    }

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
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    return { error: error.message || "An unexpected error occurred during approval." };
  }
}
