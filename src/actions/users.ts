"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/rbac";
import { updateUserRole } from "@/services/users";
import { logActivity } from "@/services/activity";
import type { Role } from "@/types";

export async function updateUserRoleAction(userId: string, role: Role) {
  const current = await requirePermission("users:manage");
  
  const user = await updateUserRole(userId, role);
  
  await logActivity({
    type: "AUTH", // reusing AUTH as there's no USER type in standard
    action: "User role updated",
    description: `${user.name} role changed to ${role}`,
    actorId: current.id,
    actorName: current.name,
  });

  revalidatePath("/users");
}
