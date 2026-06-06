import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import type { User } from "@/types";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "vb_session";

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const userId = store.get(SESSION_COOKIE)?.value;
  if (!userId) return null;
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  
  // Return the user cast to the expected type
  // (In a real app, you might omit passwordHash from the type here)
  return user as unknown as User;
}

export async function createSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    // Check if it's the demo password for backwards compatibility if needed,
    // but we seeded with real bcrypt hashes, so we rely on bcrypt.
    return null;
  }
  
  return user as unknown as User;
}
