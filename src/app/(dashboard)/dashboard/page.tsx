import { requireUser } from "@/lib/auth/rbac";
import { AdminDashboard } from "@/components/dashboards/admin-dashboard";
import { ManagerDashboard } from "@/components/dashboards/manager-dashboard";
import { VendorDashboard } from "@/components/dashboards/vendor-dashboard";
import { ProcurementDashboard } from "@/components/dashboards/procurement-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  switch (user.role) {
    case "VENDOR":
      return <VendorDashboard user={user} />;
    case "MANAGER":
      return <ManagerDashboard user={user} />;
    case "ADMIN":
    case "PROCUREMENT_OFFICER":
    default:
      return <ProcurementDashboard user={user} />;
  }
}

