"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/rbac";
import { createVendor } from "@/services/vendors";
import { logActivity } from "@/services/activity";

export type VendorFormState = { error?: string; ok?: boolean };

export async function createVendorAction(
  _prev: VendorFormState,
  formData: FormData,
): Promise<VendorFormState> {
  const user = await requirePermission("vendor:manage");

  const name = String(formData.get("name") ?? "").trim();
  const gstNumber = String(formData.get("gstNumber") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const contactNumber = String(formData.get("contactNumber") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !gstNumber || !category) {
    return { error: "Name, GST number and category are required." };
  }

  if (password && !email) {
    return { error: "Email is required to create a vendor login account." };
  }

  const { prisma } = await import("@/lib/db/prisma");
  let userId: string | undefined = undefined;

  if (password && email) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "An account with this email already exists." };
    }
    
    const bcrypt = (await import("bcryptjs")).default;
    const passwordHash = await bcrypt.hash(password, 10);
    
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "VENDOR",
        phone: contactNumber || null,
        status: "ACTIVE",
      }
    });
    userId = newUser.id;
  }

  const vendor = await createVendor({
    name,
    gstNumber,
    category,
    email: email || undefined,
    contactNumber: contactNumber || undefined,
    city: city || undefined,
    createdById: user.id,
    userId,
  });

  await logActivity({
    type: "VENDOR",
    action: "Vendor added",
    description: `${vendor.name} registered and pending verification`,
    entityType: "VENDOR",
    entityId: vendor.id,
    actorId: user.id,
    actorName: user.name,
  });

  revalidatePath("/vendors");
  return { ok: true };
}

export async function updateVendorStatusAction(
  vendorId: string,
  status: "ACTIVE" | "BLOCKED" | "PENDING",
) {
  const user = await requirePermission("vendor:manage");

  const { updateVendorStatus } = await import("@/services/vendors");
  const vendor = await updateVendorStatus(vendorId, status);

  await logActivity({
    type: "VENDOR",
    action: `Vendor ${status.toLowerCase()}`,
    description: `${vendor.name} marked as ${status}`,
    entityType: "VENDOR",
    entityId: vendor.id,
    actorId: user.id,
    actorName: user.name,
  });

  revalidatePath("/vendors");
}
