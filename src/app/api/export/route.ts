import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listVendors } from "@/services/vendors";
import { listPurchaseOrders } from "@/services/procurement";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER" && user.role !== "PROCUREMENT_OFFICER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const [vendors, pos] = await Promise.all([listVendors(), listPurchaseOrders()]);

    const spendMap = new Map<string, number>();
    for (const po of pos) {
      if (po.status !== "CANCELLED") {
        const current = spendMap.get(po.vendorId) || 0;
        spendMap.set(po.vendorId, current + po.grandTotal);
      }
    }

    let csv = "Vendor Name,Category,GST Number,Status,Total Spend\n";
    
    vendors.forEach((v) => {
      const spend = spendMap.get(v.id) || 0;
      csv += `"${v.name}","${v.category}","${v.gstNumber}","${v.status}",${spend}\n`;
    });

    const headers = new Headers();
    headers.set("Content-Type", "text/csv");
    headers.set("Content-Disposition", `attachment; filename="vendor_report_${new Date().toISOString().split('T')[0]}.csv"`);

    return new NextResponse(csv, { status: 200, headers });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
