import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'test-secret-for-crypto-roundtrip-only';
const { encrypt, decrypt } = await import('../src/crypto.js');

test('encrypt/decrypt round-trips a plain string', () => {
  const secret = 'sk-test-1234567890';
  const enc = encrypt(secret);
  assert.notEqual(enc, secret);
  assert.equal(decrypt(enc), secret);
});

test('encrypt produces different ciphertext each time (random IV)', () => {
  const a = encrypt('same-plaintext');
  const b = encrypt('same-plaintext');
  assert.notEqual(a, b);
});

test('decrypt rejects tampered ciphertext', () => {
  const enc = Buffer.from(encrypt('secret-value'), 'base64');
  enc[enc.length - 1] ^= 0xff; // flip a byte in the ciphertext
  assert.throws(() => decrypt(enc.toString('base64')));
});
