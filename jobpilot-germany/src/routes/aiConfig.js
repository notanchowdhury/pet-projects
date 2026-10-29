import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../db.js';
import { requireAuth } from '../auth.js';
import { encrypt, decrypt } from '../crypto.js';
import { callLLM, defaultAvailable, defaultStatus, PROVIDERS, DEFAULT_MODELS, MODEL_SUGGESTIONS } from '../llm.js';

const router = Router();
router.use(requireAuth);

function effective(user) {
  if (user.aiMode === 'own' && user.aiKeyEnc) return { provider: user.aiProvider, model: user.aiModel, source: 'own' };
  const d = defaultStatus();
  return { provider: d.provider, model: d.model, source: 'default' };
}

router.get('/', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  res.json({
    mode: user.aiMode,
    provider: user.aiProvider,
    model: user.aiModel,
    hasOwnKey: !!user.aiKeyEnc,
    configured: user.aiConfigured,
    defaultAvailable: defaultAvailable(user),
    defaultInfo: defaultStatus(),          // { provider, model, configured }
    effective: effective(user),
    suggestions: MODEL_SUGGESTIONS
  });
});

const schema = z.object({
  mode: z.enum(['default', 'own']),
  provider: z.enum(PROVIDERS).optional(),
  model: z.string().max(120).optional(),
  apiKey: z.string().max(400).optional()
});

router.put('/', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid AI settings.' });
  const d = parsed.data;
  const current = await prisma.user.findUnique({ where: { id: req.userId } });

  if (d.mode === 'default' && !defaultAvailable(current)) {
    return res.status(400).json({ error: 'The built-in AI is not available for your account — please use your own API key.' });
  }

  const data = { aiMode: d.mode, aiConfigured: true };

  if (d.mode === 'own') {
    const provider = d.provider || current.aiProvider;
    const model = (d.model || current.aiModel || '').trim();
    if (!provider) return res.status(400).json({ error: 'Choose a provider.' });
    if (!model) return res.status(400).json({ error: 'Enter a model id (e.g. ' + DEFAULT_MODELS[provider] + ').' });
    const key = (d.apiKey || '').trim();
    if (!key && !current.aiKeyEnc) return res.status(400).json({ error: 'Enter your API key.' });
    data.aiProvider = provider;
    data.aiModel = model;
    if (key) data.aiKeyEnc = encrypt(key); // only overwrite when a new key is provided
  }
  // when switching to 'default' we keep any stored own-key/provider/model so the user
  // can switch back without re-entering; the resolver only uses them in 'own' mode.

  const user = await prisma.user.update({ where: { id: req.userId }, data });
  res.json({ mode: user.aiMode, provider: user.aiProvider, model: user.aiModel, hasOwnKey: !!user.aiKeyEnc, configured: user.aiConfigured, effective: effective(user) });
});

// Validate a key by making one tiny call. Tests the key typed in the form, or the
// saved key if none is typed. Returns 200 with {ok:false,error} on failure (not an HTTP error).
const testLimiter = rateLimit({ windowMs: 60 * 1000, max: 12, standardHeaders: true, legacyHeaders: false, message: { ok: false, error: 'Too many tests — wait a moment.' } });
router.post('/test', testLimiter, async (req, res) => {
  const parsed = z.object({ provider: z.enum(PROVIDERS), model: z.string().min(1).max(120), apiKey: z.string().max(400).optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Choose a provider and enter a model id to test.' });
  let apiKey = (parsed.data.apiKey || '').trim();
  if (!apiKey) {
    const u = await prisma.user.findUnique({ where: { id: req.userId } });
    if (u?.aiKeyEnc) { try { apiKey = decrypt(u.aiKeyEnc); } catch {} }
  }
  if (!apiKey) return res.status(400).json({ error: 'Enter an API key to test.' });
  try {
    const reply = await callLLM({ system: 'You are a connectivity test.', user: 'Reply with exactly: OK', maxTokens: 16, llm: { provider: parsed.data.provider, model: parsed.data.model, apiKey } });
    res.json({ ok: true, reply: String(reply || '').trim().slice(0, 40) });
  } catch (e) {
    res.json({ ok: false, error: String(e.message || e).slice(0, 200) });
  }
});

// Remove the stored own key (and fall back to default mode).
router.delete('/key', async (req, res) => {
  await prisma.user.update({ where: { id: req.userId }, data: { aiKeyEnc: null, aiMode: 'default' } });
  res.json({ ok: true });
});

export default router;
