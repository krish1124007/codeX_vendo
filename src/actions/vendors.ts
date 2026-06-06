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

  if (!name || !gstNumber || !category) {
    return { error: "Name, GST number and category are required." };
  }

  const vendor = await createVendor({
    name,
    gstNumber,
    category,
    email: email || undefined,
    contactNumber: contactNumber || undefined,
    city: city || undefined,
    createdById: user.id,
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
