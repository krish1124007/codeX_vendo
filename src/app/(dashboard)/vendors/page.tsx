import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { AddVendorDialog } from "@/components/forms/add-vendor-dialog";
import { requirePermission, can } from "@/lib/auth/rbac";
import { listVendors, vendorCounts } from "@/services/vendors";
import { updateVendorStatusAction } from "@/actions/vendors";
import { cn } from "@/lib/utils/cn";
import type { VendorStatus } from "@/types";

const FILTERS: { key: VendorStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "PENDING", label: "Pending" },
  { key: "BLOCKED", label: "Blocked" },
];

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const user = await requirePermission("vendor:view");
  const { q, status } = await searchParams;
  const activeStatus = (status as VendorStatus | "ALL") ?? "ALL";

  const [vendors, counts] = await Promise.all([
    listVendors({ search: q, status: activeStatus }),
    vendorCounts(),
  ]);

  const countFor = (key: VendorStatus | "ALL") =>
    key === "ALL"
      ? counts.all
      : key === "ACTIVE"
        ? counts.active
        : key === "PENDING"
          ? counts.pending
          : counts.blocked;

  return (
    <>
      <PageHeader
        title="Vendors"
        subtitle="Manage supplier profiles and registrations"
        actions={can(user.role, "vendor:manage") ? <AddVendorDialog /> : undefined}
      />

      <Card>
        <CardContent className="space-y-4">
          <form>
            {activeStatus !== "ALL" && (
              <input type="hidden" name="status" value={activeStatus} />
            )}
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by name, GST number, category…"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </form>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const params = new URLSearchParams();
              if (q) params.set("q", q);
              if (f.key !== "ALL") params.set("status", f.key);
              const href = `/vendors${params.toString() ? `?${params}` : ""}`;
              const isActive = activeStatus === f.key;
              return (
                <Link
                  key={f.key}
                  href={href}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted hover:text-foreground",
                  )}
                >
                  {f.label} ({countFor(f.key)})
                </Link>
              );
            })}
          </div>

          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>Vendor name</TH>
                <TH>Category</TH>
                <TH>GST number</TH>
                <TH>Contact</TH>
                <TH>Rating</TH>
                <TH>Status</TH>
                {can(user.role, "vendor:manage") && <TH className="text-right">Actions</TH>}
              </TR>
            </THead>
            <tbody>
              {vendors.map((v) => (
                <TR key={v.id}>
                  <TD className="font-medium">{v.name}</TD>
                  <TD className="text-muted">{v.category}</TD>
                  <TD className="font-mono text-xs text-muted">{v.gstNumber}</TD>
                  <TD className="text-muted">{v.contactNumber ?? "—"}</TD>
                  <TD>{v.rating ? `${v.rating.toFixed(1)} ★` : "—"}</TD>
                  <TD>
                    <StatusBadge status={v.status} />
                  </TD>
                  {can(user.role, "vendor:manage") && (
                    <TD className="text-right">
                      {v.status === "PENDING" && (
                        <div className="flex justify-end gap-3">
                          <form action={updateVendorStatusAction.bind(null, v.id, "ACTIVE")}>
                            <button type="submit" className="text-xs font-medium text-primary hover:underline">
                              Approve
                            </button>
                          </form>
                          <form action={updateVendorStatusAction.bind(null, v.id, "BLOCKED")}>
                            <button type="submit" className="text-xs font-medium text-danger hover:underline">
                              Reject
                            </button>
                          </form>
                        </div>
                      )}
                    </TD>
                  )}
                </TR>
              ))}
              {vendors.length === 0 && (
                <TR className="hover:bg-transparent">
                  <TD colSpan={can(user.role, "vendor:manage") ? 7 : 6} className="py-8 text-center text-muted">
                    No vendors match your search.
                  </TD>
                </TR>
              )}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
