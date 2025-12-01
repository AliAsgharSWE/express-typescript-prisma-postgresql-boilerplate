import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Map your environment variable
const databaseUrl =
  process.env.POSTGRES_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or POSTGRES_DATABASE_URL is required");
}

// Create Postgres connection pool
const pool = new Pool({ connectionString: databaseUrl });

// Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool);

// Instantiate Prisma Client with adapter
export const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : [],
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Disconnecting Prisma Client...");
  await prisma.$disconnect();
  await pool.end();
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("beforeExit", shutdown);
