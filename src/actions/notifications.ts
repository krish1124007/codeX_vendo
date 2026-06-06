"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/rbac";
import { markNotificationAsRead, markAllAsRead } from "@/services/notifications";

export async function markNotificationAsReadAction(id: string): Promise<{ ok?: boolean; error?: string }> {
  try {
    const user = await requireUser();
    await markNotificationAsRead(id, user.id);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    return { error: error.message || "An error occurred." };
  }
}

export async function markAllNotificationsAsReadAction(): Promise<{ ok?: boolean; error?: string }> {
  try {
    const user = await requireUser();
    await markAllAsRead(user.id);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    return { error: error.message || "An error occurred." };
  }
}
