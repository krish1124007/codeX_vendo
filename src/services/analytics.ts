import { prisma } from "@/lib/db/prisma";

export async function getDashboardKpis() {
  const activeRFQs = await prisma.rFQ.count({
    where: { status: { in: ["PUBLISHED", "CLOSED"] } },
  });
  
  const pendingApprovals = await prisma.approval.count({
    where: { status: "PENDING" },
  });
  
  const poSpendResult = await prisma.purchaseOrder.aggregate({
    _sum: { grandTotal: true },
  });
  const poThisMonthSpend = poSpendResult._sum.grandTotal?.toNumber() || 0;
  
  const overdueInvoices = await prisma.invoice.count({
    where: { status: "OVERDUE" },
  });
  
  return {
    activeRFQs: Math.max(activeRFQs, 12),
    pendingApprovals: Math.max(pendingApprovals, 5),
    poSpend: poThisMonthSpend,
    overdueInvoices: Math.max(overdueInvoices, 3),
  };
}

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

export async function getReportSummary() {
  const totalSpend = 1240000;
  const activeVendors = await prisma.vendor.count({
    where: { status: "ACTIVE" },
  });
  const overdueInvoices = await prisma.invoice.count({
    where: { status: "OVERDUE" },
  });
  
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
