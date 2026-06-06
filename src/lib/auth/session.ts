import { cookies } from "next/headers";
import { db } from "@/lib/db/store";
import type { User } from "@/types";

/**
 * Lightweight cookie-based session for the demo. The cookie stores the user id.
 *
 * This is intentionally swappable: in production replace `getCurrentUser` /
 * `createSession` with NextAuth (JWT strategy) — the rest of the app only
 * depends on `getCurrentUser()` returning a `User`, so call sites don't change.
 *
 * Note: `cookies()` is async in this Next.js version and may only be mutated
 * from a Server Action or Route Handler.
 */
const SESSION_COOKIE = "vb_session";
const DEMO_PASSWORD = "vendorbridge";

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const userId = store.get(SESSION_COOKIE)?.value;
  if (!userId) return null;
  return db.users.find((u) => u.id === userId) ?? null;
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

/** Verify credentials against the seeded users (demo password for all accounts). */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<User | null> {
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  if (password !== DEMO_PASSWORD) return null;
  return user;
}
