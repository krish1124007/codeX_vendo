import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import type { Role, User } from "@/types";

/**
 * Role-based access control.
 *
 * `PERMISSIONS` maps each role to the set of capabilities it holds. Server
 * Actions and pages call `requireUser` / `requirePermission` to enforce access;
 * the sidebar uses `can()` to hide links a role cannot use.
 */
export type Permission =
  | "dashboard:view"
  | "vendor:view"
  | "vendor:manage"
  | "rfq:view"
  | "rfq:create"
  | "quotation:submit"
  | "quotation:compare"
  | "approval:view"
  | "approval:decide"
  | "po:view"
  | "invoice:view"
  | "invoice:manage"
  | "reports:view"
  | "activity:view"
  | "users:manage";

const ALL: Permission[] = [
  "dashboard:view",
  "vendor:view",
  "vendor:manage",
  "rfq:view",
  "rfq:create",
  "quotation:submit",
  "quotation:compare",
  "approval:view",
  "approval:decide",
  "po:view",
  "invoice:view",
  "invoice:manage",
  "reports:view",
  "activity:view",
  "users:manage",
];

export const PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [...ALL],
  PROCUREMENT_OFFICER: [
    "dashboard:view",
    "rfq:view",
    "rfq:create",
    "quotation:compare",
    "po:view",
    "invoice:view",
    "invoice:manage",
  ],
  MANAGER: [
    "dashboard:view",
    "approval:view",
    "approval:decide",
    "activity:view",
    "reports:view",
  ],
  VENDOR: [
    "dashboard:view",
    "rfq:view",
    "quotation:submit",
    "po:view",
  ],
};

export function can(role: Role, permission: Permission): boolean {
  return PERMISSIONS[role].includes(permission);
}

/** Require an authenticated user, else redirect to login. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require a specific permission, else redirect (unauthorized → dashboard). */
export async function requirePermission(permission: Permission): Promise<User> {
  const user = await requireUser();
  if (!can(user.role, permission)) redirect("/dashboard");
  return user;
}
