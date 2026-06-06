"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth/session";
import { db, genId, nowISO } from "@/lib/db/store";
import { logActivity } from "@/services/activity";
import type { Role } from "@/types";

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

/** One-click demo sign-in by user id (used by the role shortcuts on the login screen). */
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
  const role = String(formData.get("role") ?? "PROCUREMENT_OFFICER") as Role;
  const phone = String(formData.get("phone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();

  if (!firstName || !email) {
    return { error: "Name and email are required." };
  }
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: "An account with this email already exists." };
  }

  const now = nowISO();
  const user = {
    id: genId("u"),
    email,
    name: `${firstName} ${lastName}`.trim(),
    role,
    phone: phone || undefined,
    country: country || undefined,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  };
  db.users.push(user);

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
