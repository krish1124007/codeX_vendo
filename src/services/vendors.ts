import { db, genId, nowISO } from "@/lib/db/store";
import type { Vendor, VendorStatus } from "@/types";

export async function listVendors(query?: {
  search?: string;
  status?: VendorStatus | "ALL";
}): Promise<Vendor[]> {
  let rows = [...db.vendors];
  const search = query?.search?.trim().toLowerCase();
  if (search) {
    rows = rows.filter(
      (v) =>
        v.name.toLowerCase().includes(search) ||
        v.gstNumber.toLowerCase().includes(search) ||
        v.category.toLowerCase().includes(search),
    );
  }
  if (query?.status && query.status !== "ALL") {
    rows = rows.filter((v) => v.status === query.status);
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getVendor(id: string): Promise<Vendor | undefined> {
  return db.vendors.find((v) => v.id === id);
}

export async function getVendorMap(): Promise<Map<string, Vendor>> {
  return new Map(db.vendors.map((v) => [v.id, v]));
}

export async function vendorCounts() {
  const all = db.vendors.length;
  const active = db.vendors.filter((v) => v.status === "ACTIVE").length;
  const pending = db.vendors.filter((v) => v.status === "PENDING").length;
  const blocked = db.vendors.filter((v) => v.status === "BLOCKED").length;
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
}): Promise<Vendor> {
  const now = nowISO();
  const vendor: Vendor = {
    id: genId("v"),
    name: input.name,
    gstNumber: input.gstNumber,
    category: input.category,
    email: input.email,
    contactNumber: input.contactNumber,
    city: input.city,
    rating: 0,
    status: "PENDING",
    createdById: input.createdById,
    createdAt: now,
    updatedAt: now,
  };
  db.vendors.push(vendor);
  return vendor;
}
