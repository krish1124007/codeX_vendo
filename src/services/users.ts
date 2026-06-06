import { prisma } from "@/lib/db/prisma";
import type { User, Role } from "@/types";

export async function listUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  // Strip password Hash
  return users.map((user: any) => {
    const { passwordHash, ...safeUser } = user;
    return safeUser as unknown as User;
  });
}

export async function updateUserRole(id: string, role: Role): Promise<User> {
  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });
  const { passwordHash, ...safeUser } = user;
  return safeUser as unknown as User;
}
