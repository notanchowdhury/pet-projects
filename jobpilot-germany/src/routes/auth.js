import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../db.js';
import { issueToken, clearToken, requireAuth } from '../auth.js';
import { defaultAvailable } from '../llm.js';
import { sendMail } from '../mailer.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in a few minutes.' }
});

const signupSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(200),
  name: z.string().max(120).optional()
});
const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200)
});

function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, role: u.role, aiConfigured: u.aiConfigured };
}

router.post('/signup', authLimiter, async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid email or password (min 8 chars).' });
  }
  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'An account with that email already exists.' });

  const totalUsers = await prisma.user.count();
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: parsed.data.name?.trim() || null,
      role: totalUsers === 0 ? 'admin' : 'user' // first account is admin
    }
  });
  issueToken(res, user);
  res.status(201).json({ user: publicUser(user), defaultAvailable: defaultAvailable(user) });
});

router.post('/login', authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Enter a valid email and password.' });
  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && (await bcrypt.compare(parsed.data.password, user.passwordHash));
  if (!ok) return res.status(401).json({ error: 'Wrong email or password.' });
  issueToken(res, user);
  res.json({ user: publicUser(user), defaultAvailable: defaultAvailable(user) });
});

router.post('/logout', (req, res) => {
  clearToken(res);
  res.json({ ok: true });
});

function baseUrl(req) {
  return (process.env.BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}

// Request a reset link. Always responds 200 (never reveals whether the email exists).
router.post('/forgot', authLimiter, async (req, res) => {
  const parsed = z.object({ email: z.string().email().max(200) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Enter a valid email.' });
  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { resetTokenHash: hash, resetTokenExp: new Date(Date.now() + 60 * 60 * 1000) }
    });
    const url = `${baseUrl(req)}/reset?token=${token}`;
    try {
      await sendMail({
        to: email,
        subject: 'Reset your JobPilot Germany password',
        text: `Someone requested a password reset for your account.\n\nOpen this link to choose a new password (valid for 1 hour):\n${url}\n\nIf you didn't request this, you can ignore this email — your password stays unchanged.`
      });
    } catch (e) {
      // Never fail (or reveal) the request because delivery hiccuped.
      console.error('[forgot] email send failed:', e.message);
    }
  }
  res.json({ ok: true });
});

// Complete a reset with a valid token.
router.post('/reset', authLimiter, async (req, res) => {
  const parsed = z.object({ token: z.string().min(10).max(200), password: z.string().min(8, 'Password must be at least 8 characters.').max(200) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid token or password.' });
  const hash = crypto.createHash('sha256').update(parsed.data.token).digest('hex');
  const user = await prisma.user.findFirst({ where: { resetTokenHash: hash, resetTokenExp: { gt: new Date() } } });
  if (!user) return res.status(400).json({ error: 'This reset link is invalid or has expired. Request a new one.' });
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 12), resetTokenHash: null, resetTokenExp: null }
  });
  res.json({ ok: true });
});

// Change password while logged in.
router.post('/change-password', requireAuth, async (req, res) => {
  const parsed = z.object({ currentPassword: z.string().min(1).max(200), newPassword: z.string().min(8, 'New password must be at least 8 characters.').max(200) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input.' });
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) } });
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    clearToken(res);
    return res.status(401).json({ error: 'Account no longer exists.' });
  }
  res.json({ user: publicUser(user), defaultAvailable: defaultAvailable(user) });
});

export default router;
