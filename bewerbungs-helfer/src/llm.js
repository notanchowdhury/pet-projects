// Server-side LLM service. All provider calls are proxied through here. The key used
// is either the admin's shared env key (default) or a user's own key (resolved by the
// caller and passed in as `llm`). Keys never reach the browser.

export const PROVIDERS = ['anthropic', 'openai', 'gemini'];
export const DEFAULT_MODELS = { anthropic: 'claude-sonnet-5', openai: 'gpt-4o', gemini: 'gemini-2.5-pro' };
export const MODEL_SUGGESTIONS = {
  anthropic: ['claude-sonnet-5', 'claude-opus-4-8', 'claude-haiku-4-5'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'o4-mini'],
  gemini: ['gemini-2.5-pro', 'gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-2.5-flash']
};

// The admin's shared key from the environment.
export function defaultLLM() {
  const provider = process.env.LLM_PROVIDER || 'anthropic';
  return {
    provider,
    model: process.env.LLM_MODEL || DEFAULT_MODELS[provider] || DEFAULT_MODELS.anthropic,
    apiKey: process.env.LLM_API_KEY || ''
  };
}
// Who may use the shared key: "admins" (default — safe for public deployments, so
// strangers can't spend the operator's budget), "all", or "none".
export function builtinAccess() {
  const v = (process.env.BUILTIN_AI_ACCESS || 'admins').toLowerCase();
  return ['admins', 'all', 'none'].includes(v) ? v : 'admins';
}

// Whether the shared key exists and this user may use it.
export function defaultAvailable(user) {
  if (!process.env.LLM_API_KEY) return false;
  const access = builtinAccess();
  if (access === 'all') return true;
  if (access === 'admins') return user?.role === 'admin';
  return false;
}
export function defaultStatus() {
  const c = defaultLLM();
  return { configured: !!c.apiKey, provider: c.provider, model: c.model };
}

export async function callLLM({ system, user, maxTokens = 4096, llm }) {
  const { provider, model, apiKey } = llm || {};
  if (!apiKey) throw new Error('No API key available for this request.');

  if (provider === 'anthropic') {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] })
    });
    if (!r.ok) throw new Error(await errText(r));
    const d = await r.json();
    return (d.content || []).map(b => b.text || '').join('');
  }

  if (provider === 'openai') {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + apiKey },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] })
    });
    if (!r.ok) throw new Error(await errText(r));
    const d = await r.json();
    return d.choices?.[0]?.message?.content || '';
  }

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }] })
    });
    if (!r.ok) throw new Error(await errText(r));
    const d = await r.json();
    return (d.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
  }

  throw new Error('Unknown LLM provider: ' + provider);
}

async function errText(r) {
  let t = '';
  try { t = await r.text(); } catch {}
  return `LLM provider error (HTTP ${r.status}): ${t.slice(0, 300)}`;
}

export async function callJSON(opts) {
  return parseJSON(await callLLM(opts));
}

export function parseJSON(raw) {
  let s = String(raw || '').trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const first = s.indexOf('{'), last = s.lastIndexOf('}');
  if (first !== -1 && last !== -1) s = s.slice(first, last + 1);
  return JSON.parse(s);
}

/* Strip Markdown horizontal-rule lines and stray code fences from generated docs. */
export function stripRules(md) {
  if (!md) return md;
  return String(md)
    .replace(/```[a-z]*\n?/gi, '')
    .split('\n')
    .filter(l => !/^\s*[-*_=]{3,}\s*$/.test(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* ============================ Prompts ============================ */
export const P_ANALYZE = (jd) => `You are an expert bilingual (German/English) technical recruiter helping a software engineer apply for roles in Germany.

Analyse the job ad below. German ads bury real requirements inside compliance/legal/benefits boilerplate — ignore that noise and surface only what matters for a candidate's decision and application.

Return ONLY valid JSON (no markdown, no fences) with this exact shape:
{
  "detectedLanguage": "German" | "English" | other,
  "englishTranslation": "the FULL ad translated to natural English (if already English, return it lightly cleaned)",
  "company": "company name or 'Unknown'",
  "role": "job title in English",
  "seniority": "Junior | Mid | Senior | Lead | Unclear",
  "mustHaves": ["concrete required skills/experience"],
  "niceToHaves": ["preferred / bonus items"],
  "techStack": ["specific technologies named"],
  "languageRequirement": {
     "german": "none | basic | B1 | B2 | C1 | native | unclear",
     "english": "none | working | fluent | unclear",
     "note": "one sentence: is German a hard requirement or does the team likely work in English?"
  }
}

JOB AD:
"""${jd}"""`;

export const P_FIT = (resume, ex) => `You are a candid technical recruiter. Compare this candidate's résumé against the extracted job requirements. Be honest — do not inflate the match.

Return ONLY valid JSON (no markdown, no fences):
{
  "score": <integer 0-100, how well the résumé matches>,
  "verdict": "Strong fit" | "Moderate fit" | "Weak fit",
  "matched": [ { "requirement": "...", "evidence": "what in the résumé supports it" } ],
  "gaps": [ { "requirement": "...", "severity": "must" | "nice", "suggestion": "how to address or reframe it honestly" } ],
  "languageFlag": "one line on the German-language requirement as a go/no-go signal",
  "recommendation": "Apply | Stretch — worth applying | Skip — with a one-line reason"
}

EXTRACTED REQUIREMENTS:
${JSON.stringify(ex, null, 2)}

CANDIDATE RÉSUMÉ:
"""${resume}"""`;

export const P_TAILOR = (resume, ex, jdEn, notes, coverLang, tone) => {
  const langInstr = coverLang === 'de'
    ? `Write the cover letter in GERMAN as a proper "Anschreiben":
- Formal German business-letter structure: sender block, date line (use "[Ort], [Datum]"), recipient block placeholder, "Betreff:" subject line, formal salutation ("Sehr geehrte Damen und Herren," or a named contact if the ad gives one), 3-4 tight body paragraphs, "Mit freundlichen Grüßen", name.
- German tone: direct, factual, competence-first. NO American-style enthusiasm-selling, no "I'm passionate about", no exclamation marks.
- Reference concrete requirements from the ad and match them to real résumé evidence.`
    : `Write the cover letter in ENGLISH: professional, concise, 3-4 paragraphs, competence-first, mapping the ad's requirements to real résumé evidence. No fluff.`;
  const toneInstr = tone === 'warm' ? 'Keep it warm but professional.' : 'Keep it formal and restrained (German-standard).';
  return `You are an expert résumé writer for the German tech market.

CRITICAL RULES:
- Work ONLY from the candidate's master résumé and their notes. NEVER invent experience, skills, employers, dates, or numbers that are not supported. Reframing/emphasis is fine; fabrication is not.
- Produce ATS-safe output: plain text/Markdown, standard section headings, no tables/columns/graphics, real job titles and dates.

FORMATTING RULES (follow exactly):
- Use "#" for the candidate's name, "##" for section headings (e.g. Summary, Experience, Skills, Education), and "###" for individual roles/companies.
- Use "-" for bullet points and "**bold**" for emphasis (e.g. job titles, key metrics).
- Separate sections with a SINGLE blank line only.
- Do NOT insert horizontal rules or divider lines of any kind — never output lines made of "---", "***", "___", "===" or repeated dashes/underscores. Whitespace and headings alone must structure the document.
- Do NOT wrap the résumé or cover letter in code fences or backticks.

TASK: Tailor the résumé to this specific job, and write a matching cover letter.
${langInstr}
${toneInstr}

Return ONLY valid JSON (no markdown, no fences):
{
  "tailoredResume": "the full tailored résumé as clean Markdown",
  "coverLetter": "the full cover letter as clean Markdown/plain text",
  "atsNotes": ["short checks: formatting warnings, keywords added, anything the candidate should verify"]
}

JOB (English): """${jdEn}"""
EXTRACTED REQUIREMENTS: ${JSON.stringify(ex, null, 2)}
CANDIDATE NOTES (honestly incorporate, do not fabricate): """${notes || 'none'}"""
MASTER RÉSUMÉ: """${resume}"""`;
};
