"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { logActivity } from "@/services/activity";
import type { Role } from "@/types";
import bcrypt from "bcryptjs";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = await verifyCredentials(email, password);
  if (!user) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id);
  await logActivity({
    type: "AUTH",
    action: "Signed in",
    description: `${user.name} signed in`,
    actorId: user.id,
    actorName: user.name,
  });
  redirect("/dashboard");
}

export async function quickLoginAction(userId: string): Promise<void> {
  await createSession(userId);
  redirect("/dashboard");
}

export type RegisterState = { error?: string };

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "PROCUREMENT_OFFICER") as Role;
  const phone = String(formData.get("phone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();

  if (!firstName || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  let avatarUrl: string | undefined = undefined;
  const photo = formData.get("photo") as File | null;

  if (photo && photo.size > 0) {
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), "public", "uploads");
    try {
      mkdirSync(uploadsDir, { recursive: true });
    } catch (e) {}

    const fileName = `${Date.now()}-${photo.name.replace(/\s/g, "_")}`;
    writeFileSync(join(uploadsDir, fileName), buffer);
    avatarUrl = `/uploads/${fileName}`;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const name = `${firstName} ${lastName}`.trim();

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role,
      phone: phone || null,
      country: country || null,
      avatarUrl,
      status: "ACTIVE",
    }
  });

  if (role === "VENDOR") {
    const companyName = String(formData.get("companyName") ?? "").trim();
    const gstNumber = String(formData.get("gstNumber") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    
    if (companyName && gstNumber && category) {
      const vendor = await prisma.vendor.create({
        data: {
          name: companyName,
          gstNumber,
          category,
          email,
          contactNumber: phone || null,
          userId: user.id,
          status: "PENDING",
        }
      });
      
      await logActivity({
        type: "VENDOR",
        action: "Vendor self-registered",
        description: `${companyName} registered and is pending approval`,
        entityType: "VENDOR",
        entityId: vendor.id,
        actorId: user.id,
        actorName: user.name,
      });
    }
  }

  await createSession(user.id);
  await logActivity({
    type: "AUTH",
    action: "Account created",
    description: `${user.name} registered as ${role}`,
    actorId: user.id,
    actorName: user.name,
  });
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function forgotPasswordAction(email: string): Promise<{ ok?: boolean; error?: string }> {
  if (!email) return { error: "Email is required" };
  
  const existing = await prisma.user.findUnique({ where: { email } });
  
  if (existing) {
    // MOCK EMAIL DISPATCH
    console.log(`[MOCK EMAIL] Password reset link sent to ${email}`);
    
    await logActivity({
      type: "AUTH",
      action: "Password reset requested",
      description: `Password reset requested for ${email}`,
      actorId: existing.id,
      actorName: existing.name,
    });
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Always return OK to prevent email enumeration
  return { ok: true };
}
