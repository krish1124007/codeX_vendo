"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateUserRoleAction } from "@/actions/users";
import type { Role } from "@/types";

export function RoleSelect({
  userId,
  defaultValue,
  roles,
}: {
  userId: string;
  defaultValue: string;
  roles: string[];
}) {
  const [pending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    startTransition(async () => {
      const res = await updateUserRoleAction(userId, newRole);
      if (res?.error) {
        toast.error(res.error);
        // revert select visually? This requires state, but page revalidate happens if successful.
        // If error, it stays on the new value unless we reset it. We'll leave it simple for now.
        e.target.value = defaultValue; // quick hack to revert
      } else {
        toast.success(`Role updated to ${newRole}`);
      }
    });
  };

  return (
    <select
      defaultValue={defaultValue}
      onChange={handleChange}
      disabled={pending}
      className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:border-primary/60 focus:outline-none disabled:opacity-50"
    >
      {roles.map((r) => (
        <option key={r} value={r}>
          {r.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
