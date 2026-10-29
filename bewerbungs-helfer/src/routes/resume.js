import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

// Cap the held original file at ~6MB of base64 (well within a typical résumé PDF).
const MAX_FILE_DATA = 6 * 1024 * 1024;

router.get('/', async (req, res) => {
  const r = await prisma.resume.findUnique({ where: { userId: req.userId } });
  res.json({
    text: r?.text || '',
    originalName: r?.originalName || null,
    originalType: r?.originalType || null,
    hasOriginal: !!r?.originalData,
    updatedAt: r?.updatedAt || null
  });
});

router.put('/', async (req, res) => {
  const parsed = z.object({ text: z.string().max(200000) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid résumé text.' });
  const text = parsed.data.text.trim();
  const r = await prisma.resume.upsert({
    where: { userId: req.userId },
    update: { text },
    create: { userId: req.userId, text }
  });
  res.json({ ok: true, updatedAt: r.updatedAt });
});

router.put('/file', async (req, res) => {
  const parsed = z.object({
    name: z.string().max(260),
    type: z.string().max(120).optional(),
    dataUrl: z.string().max(MAX_FILE_DATA)
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'File too large to hold (max ~4MB), or invalid.' });
  await prisma.resume.upsert({
    where: { userId: req.userId },
    update: { originalName: parsed.data.name, originalType: parsed.data.type || null, originalData: parsed.data.dataUrl },
    create: { userId: req.userId, text: '', originalName: parsed.data.name, originalType: parsed.data.type || null, originalData: parsed.data.dataUrl }
  });
  res.json({ ok: true });
});

router.get('/file', async (req, res) => {
  const r = await prisma.resume.findUnique({ where: { userId: req.userId } });
  if (!r?.originalData) return res.status(404).json({ error: 'No original file held.' });
  res.json({ name: r.originalName, type: r.originalType, dataUrl: r.originalData });
});

router.delete('/file', async (req, res) => {
  await prisma.resume.updateMany({
    where: { userId: req.userId },
    data: { originalName: null, originalType: null, originalData: null }
  });
  res.json({ ok: true });
});

export default router;
