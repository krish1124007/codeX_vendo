import { prisma } from "@/lib/db/prisma";
import type { Vendor, VendorStatus } from "@/types";

export async function listVendors(query?: {
  search?: string;
  status?: VendorStatus | "ALL";
}): Promise<Vendor[]> {
  const searchFilter = query?.search?.trim() 
    ? {
        OR: [
          { name: { contains: query.search.trim(), mode: "insensitive" as const } },
          { gstNumber: { contains: query.search.trim(), mode: "insensitive" as const } },
          { category: { contains: query.search.trim(), mode: "insensitive" as const } },
        ]
      }
    : {};
    
  const statusFilter = (query?.status && query.status !== "ALL")
    ? { status: query.status }
    : {};

  const vendors = await prisma.vendor.findMany({
    where: {
      ...searchFilter,
      ...statusFilter,
    },
    orderBy: { name: "asc" },
  });
  
  return vendors as unknown as Vendor[];
}

export async function getVendor(id: string): Promise<Vendor | undefined> {
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  return vendor ? (vendor as unknown as Vendor) : undefined;
}

export async function getVendorMap(): Promise<Map<string, Vendor>> {
  const vendors = await prisma.vendor.findMany();
  return new Map(vendors.map((v: any) => [v.id, v as unknown as Vendor]));
}

export async function vendorCounts() {
  const counts = await prisma.vendor.groupBy({
    by: ['status'],
    _count: { status: true }
  });
  
  let active = 0, pending = 0, blocked = 0;
  let all = 0;
  
  for (const group of counts) {
    all += group._count.status;
    if (group.status === "ACTIVE") active = group._count.status;
    if (group.status === "PENDING") pending = group._count.status;
    if (group.status === "BLOCKED") blocked = group._count.status;
  }
  
  return { all, active, pending, blocked };
}

export async function createVendor(input: {
  name: string;
  gstNumber: string;
  category: string;
  email?: string;
  contactNumber?: string;
  city?: string;
  createdById?: string;
  userId?: string;
}): Promise<Vendor> {
  const vendor = await prisma.vendor.create({
    data: {
      name: input.name,
      gstNumber: input.gstNumber,
      category: input.category,
      email: input.email || null,
      contactNumber: input.contactNumber || null,
      city: input.city || null,
      rating: 0,
      status: "PENDING",
      createdById: input.createdById || null,
      userId: input.userId || null,
    }
  });
  
  return vendor as unknown as Vendor;
}

export async function updateVendorStatus(id: string, status: VendorStatus): Promise<Vendor> {
  const vendor = await prisma.vendor.update({
    where: { id },
    data: { status },
  });
  return vendor as unknown as Vendor;
}
