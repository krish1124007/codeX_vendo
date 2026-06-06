"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/rbac";
import { createRFQ } from "@/services/procurement";

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const rfqSchema = z.object({
  title: z.string().min(3, "Title is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
  vendorIds: z.array(z.string()).min(1, "Select at least one vendor"),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.coerce.number().int().positive(),
        unit: z.string().min(1),
      }),
    )
    .min(1, "Add at least one line item"),
  publish: z.boolean(),
});

export async function createRFQAction(
  formData: FormData,
): Promise<{ error?: string; id?: string }> {
  const user = await requirePermission("rfq:create");

  const title = String(formData.get("title") || "");
  const category = String(formData.get("category") || "");
  const description = String(formData.get("description") || "");
  const deadline = String(formData.get("deadline") || "");
  const publish = formData.get("publish") === "true";
  
  let vendorIds: string[] = [];
  let items: any[] = [];
  
  try {
    vendorIds = JSON.parse(String(formData.get("vendorIds") || "[]"));
    items = JSON.parse(String(formData.get("items") || "[]"));
  } catch (e) {
    return { error: "Invalid data format" };
  }

  const parsed = rfqSchema.safeParse({
    title, category, description, deadline, publish, vendorIds, items
  });
  
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid RFQ details." };
  }

  // Handle attachments
  const attachmentUrls: string[] = [];
  const files = formData.getAll("attachments") as File[];
  
  if (files.length > 0) {
    const uploadsDir = join(process.cwd(), "public", "uploads", "rfqs");
    try {
      mkdirSync(uploadsDir, { recursive: true });
    } catch (e) {}

    for (const file of files) {
      if (file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
        writeFileSync(join(uploadsDir, fileName), buffer);
        attachmentUrls.push(`/uploads/rfqs/${fileName}`);
      }
    }
  }

  const rfq = await createRFQ({
    ...parsed.data,
    attachments: attachmentUrls,
    createdById: user.id,
    actorName: user.name,
  });

  revalidatePath("/rfqs");
  revalidatePath("/dashboard");
  return { id: rfq.id };
}
