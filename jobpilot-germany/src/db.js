import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Cheap connectivity check for the readiness probe. Works identically on
// SQLite and Postgres since it never touches an application table.
export async function pingDb() {
  await prisma.$queryRaw`SELECT 1`;
}
