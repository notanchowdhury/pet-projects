import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

// Service-wide usage overview.
router.get('/stats', async (req, res) => {
  const [users, applications, admins, resumes] = await Promise.all([
    prisma.user.count(),
    prisma.application.count(),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.resume.count({ where: { NOT: { text: '' } } })
  ]);
  res.json({ users, applications, admins, resumes });
});

// List every user with lightweight per-user usage (no résumé/application content — privacy).
router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { applications: true } }, resume: { select: { text: true, updatedAt: true } } }
  });
  res.json(users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    aiMode: u.aiMode === 'own' ? (u.aiKeyEnc ? 'own' : 'own (no key)') : 'default',
    createdAt: u.createdAt.toISOString().slice(0, 10),
    applications: u._count.applications,
    hasResume: !!(u.resume && u.resume.text),
    isSelf: u.id === req.userId
  })));
});

// Promote / demote a user.
router.patch('/users/:id/role', async (req, res) => {
  const parsed = z.object({ role: z.enum(['user', 'admin']) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Role must be "user" or "admin".' });
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) return res.status(404).json({ error: 'User not found.' });
  if (target.role === 'admin' && parsed.data.role === 'user') {
    const admins = await prisma.user.count({ where: { role: 'admin' } });
    if (admins <= 1) return res.status(400).json({ error: 'Cannot demote the last remaining admin.' });
  }
  const u = await prisma.user.update({ where: { id: target.id }, data: { role: parsed.data.role } });
  res.json({ id: u.id, role: u.role });
});

// View a specific user's résumé text (admin oversight).
router.get('/users/:id/resume', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { email: true } });
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const r = await prisma.resume.findUnique({ where: { userId: req.params.id } });
  res.json({
    email: user.email,
    text: r?.text || '',
    originalName: r?.originalName || null,
    originalType: r?.originalType || null,
    hasOriginal: !!r?.originalData,
    updatedAt: r?.updatedAt || null
  });
});

// Download a specific user's held original résumé file.
router.get('/users/:id/resume/file', async (req, res) => {
  const r = await prisma.resume.findUnique({ where: { userId: req.params.id } });
  if (!r?.originalData) return res.status(404).json({ error: 'No original file held for this user.' });
  res.json({ name: r.originalName, type: r.originalType, dataUrl: r.originalData });
});

// Reset a user's password to a generated temporary one (returned once, for the admin to relay).
router.post('/users/:id/reset-password', async (req, res) => {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) return res.status(404).json({ error: 'User not found.' });
  const temp = 'Reset-' + crypto.randomBytes(4).toString('hex') + '!';
  await prisma.user.update({
    where: { id: target.id },
    data: { passwordHash: await bcrypt.hash(temp, 12), resetTokenHash: null, resetTokenExp: null }
  });
  res.json({ ok: true, email: target.email, tempPassword: temp });
});

// Delete a user and all their data (résumé + applications cascade via the schema).
router.delete('/users/:id', async (req, res) => {
  if (req.params.id === req.userId) {
    return res.status(400).json({ error: 'You cannot delete your own account from the admin panel.' });
  }
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) return res.status(404).json({ error: 'User not found.' });
  if (target.role === 'admin') {
    const admins = await prisma.user.count({ where: { role: 'admin' } });
    if (admins <= 1) return res.status(400).json({ error: 'Cannot delete the last remaining admin.' });
  }
  await prisma.user.delete({ where: { id: target.id } });
  res.json({ ok: true });
});

export default router;
