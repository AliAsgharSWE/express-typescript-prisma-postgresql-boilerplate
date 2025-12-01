// prisma/prisma.config.ts
import "dotenv/config";

// Map custom env var to Prisma's expected DATABASE_URL for migrations
if (process.env.POSTGRES_DATABASE_URL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_DATABASE_URL;
}

export default {
  datasource: {
    url: process.env.DATABASE_URL || process.env.POSTGRES_DATABASE_URL,
  },
};
