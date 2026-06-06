import { defineConfig } from "prisma/config";

/**
 * Prisma 7 moved the connection URL out of `schema.prisma` and into this file.
 * The app currently runs on an in-memory store (src/lib/db/store.ts), so no
 * database connection is required yet. When a live Postgres instance is
 * available, set DATABASE_URL and wire a driver adapter into PrismaClient.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
