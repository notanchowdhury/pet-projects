import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'test-secret-for-airesolve-only';
delete process.env.LLM_API_KEY;
const { resolveLLMForUser } = await import('../src/aiResolve.js');
const { encrypt } = await import('../src/crypto.js');

test('own mode without a saved key throws a user-facing error', () => {
  assert.throws(() => resolveLLMForUser({ aiMode: 'own', aiKeyEnc: null }), /Add it in AI settings/);
});

test('own mode with a saved key decrypts and returns it', () => {
  const aiKeyEnc = encrypt('sk-my-own-key');
  const cfg = resolveLLMForUser({ aiMode: 'own', aiKeyEnc, aiProvider: 'anthropic', aiModel: 'claude-sonnet-5' });
  assert.equal(cfg.apiKey, 'sk-my-own-key');
  assert.equal(cfg.provider, 'anthropic');
  assert.equal(cfg.source, 'own');
});

test('default mode without an admin key throws a user-facing error', () => {
  assert.throws(() => resolveLLMForUser({ aiMode: 'default' }), /not configured by the administrator/);
});

test('built-in key is admin-only by default', () => {
  process.env.LLM_API_KEY = 'sk-shared';
  delete process.env.BUILTIN_AI_ACCESS;
  try {
    assert.equal(resolveLLMForUser({ aiMode: 'default', role: 'admin' }).source, 'default');
    assert.throws(() => resolveLLMForUser({ aiMode: 'default', role: 'user' }), /not available for your account/);
  } finally { delete process.env.LLM_API_KEY; }
});

test('BUILTIN_AI_ACCESS=all lets regular users use the built-in key', () => {
  process.env.LLM_API_KEY = 'sk-shared';
  process.env.BUILTIN_AI_ACCESS = 'all';
  try {
    assert.equal(resolveLLMForUser({ aiMode: 'default', role: 'user' }).apiKey, 'sk-shared');
  } finally { delete process.env.LLM_API_KEY; delete process.env.BUILTIN_AI_ACCESS; }
});
