import type { Permission } from "@/lib/auth/rbac";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide-react icon name
  permission: Permission;
}

/** Primary sidebar navigation (order matches the wireframes). */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", permission: "dashboard:view" },
  { label: "Vendors", href: "/vendors", icon: "Building2", permission: "vendor:view" },
  { label: "RFQ's", href: "/rfqs", icon: "FileText", permission: "rfq:view" },
  { label: "Quotations", href: "/quotations", icon: "ReceiptText", permission: "quotation:compare" },
  { label: "Approvals", href: "/approvals", icon: "BadgeCheck", permission: "approval:view" },
  { label: "Purchase orders", href: "/purchase-orders", icon: "ShoppingCart", permission: "po:view" },
  { label: "Invoices", href: "/invoices", icon: "FileSpreadsheet", permission: "invoice:view" },
  { label: "Reports", href: "/reports", icon: "BarChart3", permission: "reports:view" },
  { label: "Activity", href: "/activity", icon: "Activity", permission: "activity:view" },
];
