"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/rbac";
import { markNotificationAsRead, markAllAsRead } from "@/services/notifications";

export async function markNotificationAsReadAction(id: string) {
  const user = await requireUser();
  await markNotificationAsRead(id, user.id);
  revalidatePath("/", "layout");
}

export async function markAllNotificationsAsReadAction() {
  const user = await requireUser();
  await markAllAsRead(user.id);
  revalidatePath("/", "layout");
}
