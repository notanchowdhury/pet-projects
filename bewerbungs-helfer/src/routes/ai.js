import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../db.js';
import { requireAuth } from '../auth.js';
import { callJSON, stripRules, P_ANALYZE, P_FIT, P_TAILOR } from '../llm.js';
import { resolveLLMForUser } from '../aiResolve.js';

const router = Router();
router.use(requireAuth);

// Resolve the caller's LLM config (own key or admin default) for a request.
async function llmForUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return resolveLLMForUser(user);
}

// Protect the shared LLM budget from a single account hammering it.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'You are sending requests too quickly. Wait a moment and retry.' }
});
router.use(aiLimiter);

async function resumeText(userId) {
  const r = await prisma.resume.findUnique({ where: { userId } });
  return (r?.text || '').trim();
}

router.post('/analyze', async (req, res, next) => {
  try {
    const jd = String(req.body?.jd || '').trim();
    if (!jd) return res.status(400).json({ error: 'Paste a job description first.' });
    if (jd.length > 60000) return res.status(400).json({ error: 'Job description is too long.' });
    const llm = await llmForUser(req.userId);
    const ex = await callJSON({ system: 'You output only valid JSON.', user: P_ANALYZE(jd), maxTokens: 4096, llm });
    res.json(ex);
  } catch (e) { next(e); }
});

router.post('/fit', async (req, res, next) => {
  try {
    const analysis = req.body?.analysis;
    if (!analysis || typeof analysis !== 'object') return res.status(400).json({ error: 'Missing analysis.' });
    const resume = await resumeText(req.userId);
    if (!resume) return res.status(400).json({ error: 'Save your master résumé first.' });
    const llm = await llmForUser(req.userId);
    const fit = await callJSON({ system: 'You output only valid JSON.', user: P_FIT(resume, analysis), maxTokens: 3000, llm });
    res.json(fit);
  } catch (e) { next(e); }
});

const tailorSchema = z.object({
  analysis: z.any(),
  jdEnglish: z.string().max(200000).optional(),
  notes: z.string().max(8000).optional(),
  coverLang: z.enum(['de', 'en']).optional(),
  tone: z.enum(['formal', 'warm']).optional()
});

router.post('/tailor', async (req, res, next) => {
  try {
    const parsed = tailorSchema.safeParse(req.body);
    if (!parsed.success || !parsed.data.analysis) return res.status(400).json({ error: 'Missing data for tailoring.' });
    const resume = await resumeText(req.userId);
    if (!resume) return res.status(400).json({ error: 'Save your master résumé first.' });
    const d = parsed.data;
    const llm = await llmForUser(req.userId);
    const out = await callJSON({
      system: 'You output only valid JSON.',
      user: P_TAILOR(resume, d.analysis, d.jdEnglish || '', d.notes || '', d.coverLang || 'de', d.tone || 'formal'),
      maxTokens: 8000,
      llm
    });
    out.tailoredResume = stripRules(out.tailoredResume);
    out.coverLetter = stripRules(out.coverLetter);
    res.json(out);
  } catch (e) { next(e); }
});

export default router;
