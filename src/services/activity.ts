import { prisma } from "@/lib/db/prisma";
import type { ActivityLog, ActivityType } from "@/types";

/**
 * Append a write-once entry to the immutable audit trail.
 * There is deliberately no update/delete API for activity logs.
 */
export async function logActivity(input: {
  type: ActivityType;
  action: string;
  description: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  actorName?: string;
}): Promise<ActivityLog> {
  const entry = await prisma.activityLog.create({
    data: {
      type: input.type,
      action: input.action,
      description: input.description,
      entityType: input.entityType || null,
      entityId: input.entityId || null,
      actorId: input.actorId || null,
      actorName: input.actorName || null,
    },
  });
  
  // Cast Prisma's ActivityLog to our frontend type if needed
  return entry as unknown as ActivityLog;
}

export async function listActivity(filter?: ActivityType | "ALL"): Promise<ActivityLog[]> {
  const where = (!filter || filter === "ALL") ? undefined : { type: filter };
  
  const logs = await prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  
  return logs as unknown as ActivityLog[];
}
