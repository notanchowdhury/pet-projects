import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

const STATUSES = ['To apply', 'Applied', 'Interview', 'Offer', 'Rejected', 'Skipped'];

function toClient(a) {
  const j = s => { try { return s ? JSON.parse(s) : null; } catch { return null; } };
  return {
    id: a.id,
    date: a.createdAt.toISOString().slice(0, 10),
    company: a.company,
    role: a.role,
    jdLang: a.jdLang,
    score: a.score,
    status: a.status,
    coverLang: a.coverLang,
    jdEnglish: a.jdEnglish,
    analysis: j(a.analysis),
    compat: j(a.compat),
    tailored: j(a.tailored),
    notes: a.notes || '',
    followUpAt: a.followUpAt ? a.followUpAt.toISOString().slice(0, 10) : null
  };
}

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD.');

const createSchema = z.object({
  company: z.string().max(300).optional(),
  role: z.string().max(300).optional(),
  jdLang: z.string().max(40).optional(),
  score: z.number().int().min(0).max(100).nullable().optional(),
  status: z.string().max(40).optional(),
  coverLang: z.string().max(10).nullable().optional(),
  jdOriginal: z.string().max(200000).optional(),
  jdEnglish: z.string().max(200000).optional(),
  analysis: z.any().optional(),
  compat: z.any().optional(),
  tailored: z.any().optional(),
  notes: z.string().max(4000).optional(),
  followUpAt: dateStr.nullable().optional()
});

router.get('/', async (req, res) => {
  const rows = await prisma.application.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' } });
  res.json(rows.map(toClient));
});

router.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid application data.' });
  const d = parsed.data;
  const str = v => (v == null ? null : JSON.stringify(v));
  const a = await prisma.application.create({
    data: {
      userId: req.userId,
      company: d.company || 'Unknown',
      role: d.role || '',
      jdLang: d.jdLang || null,
      score: d.score ?? null,
      status: STATUSES.includes(d.status) ? d.status : 'To apply',
      coverLang: d.coverLang || null,
      jdOriginal: d.jdOriginal || null,
      jdEnglish: d.jdEnglish || null,
      analysis: str(d.analysis),
      compat: str(d.compat),
      tailored: str(d.tailored),
      notes: d.notes || null,
      followUpAt: d.followUpAt ? new Date(d.followUpAt) : null
    }
  });
  res.status(201).json(toClient(a));
});

const patchSchema = z.object({
  status: z.enum(STATUSES).optional(),
  notes: z.string().max(4000).nullable().optional(),
  followUpAt: dateStr.nullable().optional()
}).refine(d => d.status !== undefined || d.notes !== undefined || d.followUpAt !== undefined, 'Nothing to update.');

router.patch('/:id', async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid update.' });
  const owned = await prisma.application.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!owned) return res.status(404).json({ error: 'Not found.' });
  const d = parsed.data;
  const data = {};
  if (d.status !== undefined) data.status = d.status;
  if (d.notes !== undefined) data.notes = d.notes || null;
  if (d.followUpAt !== undefined) data.followUpAt = d.followUpAt ? new Date(d.followUpAt) : null;
  const a = await prisma.application.update({ where: { id: owned.id }, data });
  res.json(toClient(a));
});

router.delete('/:id', async (req, res) => {
  const result = await prisma.application.deleteMany({ where: { id: req.params.id, userId: req.userId } });
  if (result.count === 0) return res.status(404).json({ error: 'Not found.' });
  res.json({ ok: true });
});

export default router;
