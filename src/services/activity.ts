import { db, genId, nowISO } from "@/lib/db/store";
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
  const entry: ActivityLog = {
    id: genId("act"),
    createdAt: nowISO(),
    ...input,
  };
  db.activity.unshift(entry);
  return entry;
}

export async function listActivity(filter?: ActivityType | "ALL"): Promise<ActivityLog[]> {
  const all = [...db.activity].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (!filter || filter === "ALL") return all;
  return all.filter((a) => a.type === filter);
}
