import { defaultLLM, defaultAvailable } from './llm.js';
import { decrypt } from './crypto.js';

// Given a User row, return the LLM config to use for their request, or throw a
// user-friendly error explaining what to fix.
export function resolveLLMForUser(user) {
  if (user.aiMode === 'own') {
    if (!user.aiKeyEnc) {
      const e = new Error('You chose to use your own API key, but none is saved. Add it in AI settings.');
      e.userFacing = true;
      throw e;
    }
    let apiKey;
    try { apiKey = decrypt(user.aiKeyEnc); }
    catch { const e = new Error('Your saved API key could not be read. Please re-enter it in AI settings.'); e.userFacing = true; throw e; }
    return { provider: user.aiProvider, model: user.aiModel, apiKey, source: 'own' };
  }

  // default: admin's shared key
  const d = defaultLLM();
  if (!d.apiKey) {
    const e = new Error('The built-in AI service is not configured by the administrator. Switch to your own API key in AI settings.');
    e.userFacing = true;
    throw e;
  }
  if (!defaultAvailable(user)) {
    const e = new Error('The built-in AI is not available for your account. Add your own API key in AI settings.');
    e.userFacing = true;
    throw e;
  }
  return { ...d, source: 'default' };
}
