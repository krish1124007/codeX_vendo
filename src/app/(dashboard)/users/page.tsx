import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/rbac";
import { listUsers } from "@/services/users";
import { formatDate } from "@/lib/utils/format";
import { updateUserRoleAction } from "@/actions/users";
import { Select } from "@/components/ui/input";
import { RoleSelect } from "./role-select";

export default async function UsersPage() {
  const currentUser = await requirePermission("users:manage");
  const users = await listUsers();

  const roles = ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER", "VENDOR"];

  return (
    <>
      <PageHeader title="Users" subtitle="Manage system users and access roles" />
      <Card>
        <CardContent>
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>Name</TH>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Joined</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <tbody>
              {users.map((u) => (
                <TR key={u.id}>
                  <TD className="font-medium">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {u.name.charAt(0)}
                        </div>
                      )}
                      {u.name}
                      {u.id === currentUser.id && (
                        <span className="rounded bg-muted/10 px-1.5 py-0.5 text-[10px] font-medium text-muted">YOU</span>
                      )}
                    </div>
                  </TD>
                  <TD className="text-muted">{u.email}</TD>
                  <TD>
                    <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted shadow-xs">
                      {u.role.replace("_", " ")}
                    </span>
                  </TD>
                  <TD className="text-muted">{formatDate(u.createdAt)}</TD>
                  <TD className="text-right">
                    {u.id !== currentUser.id && (
                      <RoleSelect userId={u.id} defaultValue={u.role} roles={roles} />
                    )}
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
