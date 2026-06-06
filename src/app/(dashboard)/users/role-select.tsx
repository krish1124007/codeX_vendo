"use client";

export function RoleSelect({
  defaultValue,
  roles,
}: {
  defaultValue: string;
  roles: string[];
}) {
  return (
    <select
      name="role"
      defaultValue={defaultValue}
      onChange={(e) => e.target.form?.requestSubmit()}
      className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:border-primary/60 focus:outline-none"
    >
      {roles.map((r) => (
        <option key={r} value={r}>
          {r.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
