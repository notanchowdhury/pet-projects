// Fail-fast startup validation. Runs before the app wires up any routes so a
// misconfigured deployment gets a clear error and a non-zero exit code instead of
// silently running insecure (or immediately crashing on first request).

export function assertEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const problems = [];

  const jwtSecret = process.env.JWT_SECRET;
  if (isProd && (!jwtSecret || jwtSecret === 'change-me-to-a-long-random-secret')) {
    problems.push('JWT_SECRET must be set to a strong, unique secret in production.');
  }
  if (jwtSecret && jwtSecret.length > 0 && jwtSecret.length < 32 && isProd) {
    problems.push('JWT_SECRET should be at least 32 characters in production.');
  }

  if (!process.env.DATABASE_URL) {
    problems.push('DATABASE_URL must be set.');
  }

  if (process.env.ENCRYPTION_KEY && !/^[0-9a-fA-F]{64}$/.test(process.env.ENCRYPTION_KEY)) {
    problems.push('ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes) if set.');
  }

  if (problems.length) {
    for (const p of problems) console.error('[startup] ' + p);
    throw new Error(`Refusing to start: ${problems.length} configuration problem(s) above.`);
  }

  const warnings = [];
  if (isProd && process.env.COOKIE_SECURE !== 'true') {
    warnings.push('COOKIE_SECURE is not "true" in production — the auth cookie will not be marked Secure.');
  }
  if (!process.env.LLM_API_KEY) {
    warnings.push('LLM_API_KEY is not set — the built-in AI option is disabled; users must bring their own key.');
  }
  if (isProd && !process.env.SMTP_HOST) {
    warnings.push('SMTP_HOST is not set in production — password reset links will only be logged to the server console, not emailed.');
  }
  return { warnings };
}
