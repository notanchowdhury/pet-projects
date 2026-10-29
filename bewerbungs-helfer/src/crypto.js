import crypto from 'node:crypto';

// AES-256-GCM encryption for user-supplied API keys stored at rest.
// The 32-byte key comes from ENCRYPTION_KEY (64 hex chars) if set, otherwise it is
// derived from JWT_SECRET. NOTE: changing whichever secret is used makes previously
// stored keys undecryptable — users would simply re-enter their key.
function key() {
  const raw = process.env.ENCRYPTION_KEY;
  if (raw && /^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, 'hex');
  const seed = process.env.JWT_SECRET || 'dev-insecure-secret-do-not-use-in-production';
  return crypto.createHash('sha256').update('jat-enc:' + seed).digest(); // 32 bytes
}

export function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const ct = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString('base64'); // iv(12) | tag(16) | ciphertext
}

export function decrypt(blob) {
  const buf = Buffer.from(String(blob), 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}
