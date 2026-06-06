import { prisma } from "@/lib/db/prisma";

export async function getProcurementDashboardKpis() {
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
    activeRFQs,
    pendingApprovals,
    poSpend: poThisMonthSpend,
    overdueInvoices,
  };
}

export async function getAdminDashboardKpis() {
  const totalUsers = await prisma.user.count();
  const totalVendors = await prisma.vendor.count();
  const pendingVendors = await prisma.vendor.count({ where: { status: "PENDING" } });
  const totalActivity = await prisma.activityLog.count();
  
  return {
    totalUsers,
    totalVendors,
    pendingVendors,
    totalActivity,
  };
}

export async function getManagerDashboardKpis() {
  const poSpendResult = await prisma.purchaseOrder.aggregate({
    _sum: { grandTotal: true },
  });
  const totalPoSpend = poSpendResult._sum.grandTotal?.toNumber() || 0;
  
  const pendingL2Approvals = await prisma.approval.count({
    where: { status: "PENDING", level: "L2" },
  });
  
  const overdueInvoices = await prisma.invoice.count({
    where: { status: "OVERDUE" },
  });
  
  const totalActiveVendors = await prisma.vendor.count({ where: { status: "ACTIVE" }});
  
  return {
    totalPoSpend,
    pendingL2Approvals,
    overdueInvoices,
    totalActiveVendors,
  };
}

export async function getVendorDashboardKpis(vendorId: string) {
  const invitedRFQs = await prisma.rFQVendor.count({
    where: { vendorId, status: "INVITED" },
  });
  
  const activeQuotations = await prisma.quotation.count({
    where: { vendorId, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
  });
  
  const awardedPOs = await prisma.purchaseOrder.count({
    where: { vendorId, status: { in: ["ISSUED", "ACKNOWLEDGED"] } },
  });
  
  const pendingInvoices = await prisma.invoice.count({
    where: { vendorId, status: "PENDING_PAYMENT" },
  });
  
  return {
    invitedRFQs,
    activeQuotations,
    awardedPOs,
    pendingInvoices,
  };
}

export async function getMonthlyTrend() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const pos = await prisma.purchaseOrder.findMany({
    where: { poDate: { gte: sixMonthsAgo } },
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const trendMap = new Map<string, number>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    trendMap.set(monthNames[d.getMonth()], 0);
  }

  for (const po of pos) {
    const month = monthNames[new Date(po.poDate).getMonth()];
    if (trendMap.has(month)) {
      trendMap.set(month, trendMap.get(month)! + Number(po.grandTotal));
    }
  }

  return Array.from(trendMap.entries()).map(([month, spend]) => ({ month, spend }));
}

export async function getReportSummary() {
  const poSpendResult = await prisma.purchaseOrder.aggregate({
    _sum: { grandTotal: true },
  });
  const totalSpend = poSpendResult._sum.grandTotal?.toNumber() || 0;

  const activeVendors = await prisma.vendor.count({
    where: { status: "ACTIVE" },
  });
  const overdueInvoices = await prisma.invoice.count({
    where: { status: "OVERDUE" },
  });
  
  const totalPos = await prisma.purchaseOrder.count();
  const completedPos = await prisma.purchaseOrder.count({ where: { status: "COMPLETED" } });
  const poFulfillment = totalPos > 0 ? Math.round((completedPos / totalPos) * 100) : 100;
  
  return {
    totalSpend,
    activeVendors,
    poFulfillment,
    overdueInvoices,
  };
}

export async function getSpendByCategory() {
  const pos = await prisma.purchaseOrder.findMany({
    include: { rfq: true },
  });

  const categoryMap = new Map<string, number>();
  for (const po of pos) {
    const category = po.rfq?.category || "Other";
    categoryMap.set(category, (categoryMap.get(category) || 0) + Number(po.grandTotal));
  }

  const colors = ["#2563eb", "#10b981", "#f59e0b", "#0d9488", "#8b5cf6", "#ec4899", "#ef4444"];
  
  return Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount], i) => ({
      category,
      amount,
      color: colors[i % colors.length],
    }));
}

export async function getTopVendorsBySpend() {
  const pos = await prisma.purchaseOrder.findMany({
    include: { vendor: true },
  });

  const vendorMap = new Map<string, { spend: number; pos: number }>();
  for (const po of pos) {
    const vendorName = po.vendor.name;
    const current = vendorMap.get(vendorName) || { spend: 0, pos: 0 };
    vendorMap.set(vendorName, {
      spend: current.spend + Number(po.grandTotal),
      pos: current.pos + 1,
    });
  }

  return Array.from(vendorMap.entries())
    .map(([vendor, data]) => ({ vendor, ...data }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);
}
