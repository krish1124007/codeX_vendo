"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/rbac";
import { createRFQ } from "@/services/procurement";

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

export type CreateRFQInput = z.input<typeof rfqSchema>;

export async function createRFQAction(
  input: CreateRFQInput,
): Promise<{ error?: string; id?: string }> {
  const user = await requirePermission("rfq:create");

  const parsed = rfqSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid RFQ details." };
  }

  const rfq = await createRFQ({
    ...parsed.data,
    createdById: user.id,
    actorName: user.name,
  });

  revalidatePath("/rfqs");
  revalidatePath("/dashboard");
  return { id: rfq.id };
}
