import jwt from 'jsonwebtoken';

const COOKIE = 'jat_token';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s === 'change-me-to-a-long-random-secret') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set to a strong secret in production.');
    }
    return 'dev-insecure-secret-do-not-use-in-production';
  }
  return s;
}

export function issueToken(res, user) {
  const token = jwt.sign({ uid: user.id, role: user.role }, secret(), { expiresIn: '7d' });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: MAX_AGE_MS,
    path: '/'
  });
}

export function clearToken(res) {
  res.clearCookie(COOKIE, { path: '/' });
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE];
  if (!token) return res.status(401).json({ error: 'Not authenticated.' });
  try {
    const payload = jwt.verify(token, secret());
    req.userId = payload.uid;
    req.userRole = payload.role;
    next();
  } catch {
    clearToken(res);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  next();
}
