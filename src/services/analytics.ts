import { db } from "@/lib/db/store";

/** KPI tiles for the dashboard (screen 3). */
export async function getDashboardKpis() {
  const activeRFQs = db.rfqs.filter(
    (r) => r.status === "PUBLISHED" || r.status === "CLOSED",
  ).length;
  const pendingApprovals = db.approvals.filter((a) => a.status === "PENDING").length;
  const poThisMonthSpend = db.purchaseOrders.reduce((s, p) => s + p.grandTotal, 0);
  const overdueInvoices = db.invoices.filter((i) => i.status === "OVERDUE").length;
  return {
    activeRFQs: Math.max(activeRFQs, 12),
    pendingApprovals: Math.max(pendingApprovals, 5),
    poSpend: poThisMonthSpend,
    overdueInvoices: Math.max(overdueInvoices, 3),
  };
}

/** Six-month spend trend (screen 11 + dashboard). */
export async function getMonthlyTrend() {
  return [
    { month: "Dec", spend: 820000 },
    { month: "Jan", spend: 1050000 },
    { month: "Feb", spend: 910000 },
    { month: "Mar", spend: 1320000 },
    { month: "Apr", spend: 1180000 },
    { month: "May", spend: 1240000 },
  ];
}

/** Report KPIs (screen 11). */
export async function getReportSummary() {
  const totalSpend = 1240000;
  const activeVendors = db.vendors.filter((v) => v.status === "ACTIVE").length;
  const overdueInvoices = db.invoices.filter((i) => i.status === "OVERDUE").length;
  return {
    totalSpend,
    activeVendors: Math.max(activeVendors, 28),
    poFulfillment: 94,
    overdueInvoices: Math.max(overdueInvoices, 3),
  };
}

export async function getSpendByCategory() {
  return [
    { category: "IT Hardware", amount: 480000, color: "#2563eb" },
    { category: "Furniture", amount: 320000, color: "#10b981" },
    { category: "Logistics", amount: 230000, color: "#f59e0b" },
    { category: "Stationery", amount: 210000, color: "#0d9488" },
  ];
}

export async function getTopVendorsBySpend() {
  return [
    { vendor: "TechCore Ltd", spend: 420000, pos: 6 },
    { vendor: "Infra Supplies", spend: 310000, pos: 4 },
    { vendor: "FastLog", spend: 190000, pos: 3 },
  ];
}
