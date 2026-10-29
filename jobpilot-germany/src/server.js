import 'dotenv/config';
import { assertEnv } from './env.js';

let startupWarnings = [];
try {
  ({ warnings: startupWarnings } = assertEnv());
} catch (e) {
  console.error('[startup] ' + e.message);
  process.exit(1);
}

import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

import { logger } from './logger.js';
import { prisma, pingDb } from './db.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import applicationRoutes from './routes/applications.js';
import aiRoutes from './routes/ai.js';
import aiConfigRoutes from './routes/aiConfig.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // correct client IPs behind a reverse proxy (for rate limiting / secure cookies)

app.use(pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existing = req.headers['x-request-id'];
    const id = (typeof existing === 'string' && existing) || crypto.randomUUID();
    res.setHeader('x-request-id', id);
    return id;
  },
  autoLogging: { ignore: (req) => req.url === '/api/health' || req.url === '/api/health/ready' }
}));

// Security headers. CSP allows the two CDNs the frontend loads (pdf.js, mammoth, docx).
const CDNS = ['https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'];
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", ...CDNS],
      scriptSrcElem: ["'self'", ...CDNS],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", ...CDNS],
      workerSrc: ["'self'", 'blob:', ...CDNS],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Health checks (kept unauthenticated and unrate-limited for orchestrators/load balancers).
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/health/ready', async (req, res) => {
  try {
    await pingDb();
    res.json({ ok: true, db: 'up' });
  } catch (e) {
    req.log?.error({ err: e }, 'readiness check failed');
    res.status(503).json({ ok: false, db: 'down' });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-config', aiConfigRoutes);
app.use('/api/admin', adminRoutes);

// Unmatched API routes get a JSON 404 instead of falling through to the SPA HTML.
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// Static frontend
app.use(express.static(publicDir));
// SPA fallback for non-API GET routes
app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(publicDir, 'index.html')));

// Central error handler
app.use((err, req, res, next) => {
  (req.log || logger).error({ err }, err?.message || 'Unhandled error');
  if (err?.userFacing) return res.status(400).json({ error: err.message });
  const isLLM = /LLM provider|API key|provider error/i.test(String(err?.message));
  res.status(isLLM ? 502 : 500).json({ error: err?.message || 'Something went wrong.' });
});

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => {
  logger.info(`JobPilot Germany listening on http://localhost:${port}`);
  for (const w of startupWarnings) logger.warn(w);
});

// Graceful shutdown: stop accepting new connections, let in-flight requests finish,
// then close the DB pool. Force-exit if it hangs so orchestrators don't wait forever.
let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received, shutting down gracefully`);
  const forceTimer = setTimeout(() => {
    logger.warn('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000);
  forceTimer.unref();
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } finally {
      clearTimeout(forceTimer);
      process.exit(0);
    }
  });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (err) => logger.error({ err }, 'Unhandled promise rejection'));
