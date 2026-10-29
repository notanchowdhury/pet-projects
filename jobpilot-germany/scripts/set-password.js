// Operator tool: reset any account's password from the terminal.
// Use when an admin is locked out (no email/reset access).
//
//   node scripts/set-password.js <email> <newPassword>
//   npm run set-password -- <email> <newPassword>
//
// Uses the same DATABASE_URL / schema as the app (SQLite locally; Postgres if configured).

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: node scripts/set-password.js <email> <newPassword>');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    console.error(`No account found for ${email}`);
    process.exit(1);
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(password, 12), resetTokenHash: null, resetTokenExp: null }
  });
  console.log(`✓ Password updated for ${user.email} (role: ${user.role}).`);
} catch (e) {
  console.error('Failed:', e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
