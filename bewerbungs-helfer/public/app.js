'use strict';

/* ============================ API helper ============================ */
async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch('/api' + path, {
    method,
    credentials: 'same-origin',
    headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  let data = null;
  if ((res.headers.get('content-type') || '').includes('application/json')) {
    try { data = await res.json(); } catch {}
  }
  if (res.status === 401 && !document.getElementById('appRoot').classList.contains('hidden')) {
    showAuth();
    toast('Your session ended. Please log in again.', true);
  }
  if (!res.ok) { const e = new Error(data?.error || `Request failed (${res.status})`); e.status = res.status; throw e; }
  return data;
}

/* ============================ Toast / theme / esc ============================ */
let toastTimer;
function toast(msg, isErr) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isErr ? ' err' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = 'toast'), isErr ? 5000 : 2600);
}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
function chips(arr) { return (arr || []).map(x => `<span class="chip">${esc(x)}</span>`).join('') || '<span style="color:var(--muted);font-size:13px;">—</span>'; }

function applyTheme(t) {
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  else document.documentElement.removeAttribute('data-theme');
}
applyTheme(localStorage.getItem('jat_theme'));
document.getElementById('themeToggle').addEventListener('click', () => {
  const cur = localStorage.getItem('jat_theme') || 'auto';
  const next = cur === 'auto' ? 'light' : cur === 'light' ? 'dark' : 'auto';
  localStorage.setItem('jat_theme', next);
  applyTheme(next);
  toast('Theme: ' + next);
});

/* ============================ Auth ============================ */
let authMode = 'login';

const SCREENS = {
  landing: document.getElementById('landing'),
  auth: document.getElementById('authScreen'),
  reset: document.getElementById('resetScreen'),
  onboarding: document.getElementById('onboarding'),
  app: document.getElementById('appRoot')
};
function showScreen(name) {
  Object.entries(SCREENS).forEach(([k, el]) => el.classList.toggle('hidden', k !== name));
}
function showAuth() { setAuthMode('login'); showScreen('auth'); }

// Landing → auth
['lpLogin', 'lpLogin2'].forEach(id => document.getElementById(id).addEventListener('click', () => { setAuthMode('login'); showScreen('auth'); }));
['lpSignup', 'lpGetStarted', 'lpGetStarted2'].forEach(id => document.getElementById(id).addEventListener('click', () => { setAuthMode('signup'); showScreen('auth'); }));
document.getElementById('authBack').addEventListener('click', () => showScreen('landing'));

// Forgot password: toggle panel + submit
function showForgotPanel(show) {
  document.getElementById('loginPanel').classList.toggle('hidden', show);
  document.getElementById('forgotPanel').classList.toggle('hidden', !show);
  document.getElementById('forgotMsg').textContent = '';
}
document.getElementById('forgotLink').addEventListener('click', () => showForgotPanel(true));
document.getElementById('forgotBack').addEventListener('click', () => showForgotPanel(false));
document.getElementById('forgotForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('forgotEmail').value.trim();
  const msg = document.getElementById('forgotMsg');
  const btn = e.target.querySelector('button[type=submit]');
  busy(btn, true, 'Sending…');
  try {
    await api('/auth/forgot', { method: 'POST', body: { email } });
    msg.style.color = 'var(--ok)';
    msg.textContent = 'If an account exists for that email, a reset link is on its way.';
  } catch (err) {
    msg.style.color = 'var(--bad)';
    msg.textContent = err.message;
  } finally { busy(btn, false); }
});

// Reset password screen (opened from the emailed link: /reset?token=...)
function showResetScreen(token) {
  showScreen('reset');
  const form = document.getElementById('resetForm');
  const msg = document.getElementById('resetMsg');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const password = document.getElementById('resetPw').value;
    const btn = form.querySelector('button[type=submit]');
    msg.textContent = '';
    busy(btn, true, 'Updating…');
    try {
      await api('/auth/reset', { method: 'POST', body: { token, password } });
      toast('Password updated — please log in');
      history.replaceState(null, '', '/');
      setAuthMode('login');
      showScreen('auth');
    } catch (err) { msg.style.color = 'var(--bad)'; msg.textContent = err.message; }
    finally { busy(btn, false); }
  };
}
document.getElementById('resetToLogin').addEventListener('click', () => { history.replaceState(null, '', '/'); setAuthMode('login'); showScreen('auth'); });

document.querySelectorAll('.auth-tab').forEach(t => t.addEventListener('click', () => setAuthMode(t.dataset.tab)));
function setAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === mode));
  document.getElementById('nameField').style.display = mode === 'signup' ? 'block' : 'none';
  document.getElementById('authSubmit').textContent = mode === 'signup' ? 'Create account' : 'Log in';
  document.getElementById('authPassword').setAttribute('autocomplete', mode === 'signup' ? 'new-password' : 'current-password');
  document.getElementById('authErr').textContent = '';
  showForgotPanel(false);
}
document.getElementById('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const name = document.getElementById('authName').value.trim();
  const btn = document.getElementById('authSubmit');
  const errEl = document.getElementById('authErr');
  errEl.textContent = '';
  btn.disabled = true;
  const origLabel = btn.textContent;
  btn.innerHTML = '<span class="spinner"></span>Please wait…';
  try {
    const path = authMode === 'signup' ? '/auth/signup' : '/auth/login';
    const body = authMode === 'signup' ? { email, password, name } : { email, password };
    const data = await api(path, { method: 'POST', body });
    await routeAfterAuth(data.user);
  } catch (err) {
    errEl.textContent = err.message;
  } finally {
    btn.disabled = false; btn.textContent = origLabel;
  }
});

async function routeAfterAuth(user) {
  if (!user.aiConfigured) await showOnboarding();
  else await enterApp(user);
}

async function showOnboarding() {
  showScreen('onboarding');
  let cfg;
  try { cfg = await api('/ai-config'); } catch (e) { toast(e.message, true); return; }
  renderAiInto(document.getElementById('onboardAi'), cfg, 'Continue →', async () => {
    try { const me = await api('/auth/me'); await enterApp(me.user); } catch (e) { toast(e.message, true); }
  });
}

async function enterApp(user) {
  showScreen('app');
  renderAccount(user);
  await loadResume();
  await refreshAccountAi();
}

/* ============================ Navigation ============================ */
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + btn.dataset.view).classList.add('active');
    if (btn.dataset.view === 'tracker') renderTracker();
    if (btn.dataset.view === 'admin') renderAdmin();
  });
});

/* ============================ Account ============================ */
function renderAccount(user) {
  document.getElementById('whoBox').innerHTML = `<strong>${esc(user.name || user.email)}</strong>${user.name ? esc(user.email) : ''}`;
  document.getElementById('accEmail').textContent = user.email;
  document.getElementById('accRole').textContent = user.role;
  document.getElementById('adminCard').style.display = user.role === 'admin' ? 'block' : 'none';
  document.getElementById('navAdmin').classList.toggle('hidden', user.role !== 'admin');
}

const PROVIDER_LABELS = { anthropic: 'Anthropic (Claude)', openai: 'OpenAI (ChatGPT)', gemini: 'Google (Gemini)' };

async function refreshAccountAi() {
  let cfg;
  try { cfg = await api('/ai-config'); } catch { return; }
  const ok = (cfg.mode === 'default' && cfg.defaultAvailable) || (cfg.mode === 'own' && cfg.hasOwnKey);
  document.getElementById('llmDot').classList.toggle('ok', ok);
  renderAiInto(document.getElementById('accountAi'), cfg, 'Save changes', () => { toast('AI settings saved ✓'); refreshAccountAi(); });
}

function aiControlsHTML(cfg) {
  const own = cfg.mode === 'own';
  const provOptions = ['anthropic', 'openai', 'gemini'].map(p => `<option value="${p}" ${cfg.provider === p ? 'selected' : ''}>${PROVIDER_LABELS[p]}</option>`).join('');
  const di = cfg.defaultInfo || {};
  return `
    <div class="ai-opt ${!own ? 'sel' : ''}" data-opt="default" ${!cfg.defaultAvailable ? 'data-disabled="1"' : ''}>
      <label class="ai-radio">
        <input type="radio" name="aimode" value="default" ${!own ? 'checked' : ''} ${!cfg.defaultAvailable ? 'disabled' : ''}>
        <span><strong>Use the built-in AI</strong> ${cfg.defaultAvailable ? '<span class="badge ok">recommended</span>' : '<span class="badge bad">unavailable</span>'}<br>
        <span class="muted">${cfg.defaultAvailable ? 'No setup needed — the app provides the model (' + esc(di.provider) + ' · ' + esc(di.model) + ').' : 'The built-in AI is not available for your account — please use your own key below.'}</span></span>
      </label>
    </div>
    <div class="ai-opt ${own ? 'sel' : ''}" data-opt="own">
      <label class="ai-radio">
        <input type="radio" name="aimode" value="own" ${own ? 'checked' : ''}>
        <span><strong>Use my own API key</strong><br><span class="muted">Bring a Claude, OpenAI, or Gemini key. Billed to your own account; stored encrypted.</span></span>
      </label>
      <div class="ai-own-fields" style="${own ? '' : 'display:none;'}">
        <div class="row">
          <div class="field"><label>Provider</label><select id="aiProvider">${provOptions}</select></div>
          <div class="field"><label>Model</label><input type="text" id="aiModel" list="aiModelList" value="${esc(cfg.model || '')}" placeholder="model id"><datalist id="aiModelList"></datalist></div>
        </div>
        <div class="field"><label>API key ${cfg.hasOwnKey ? '<span class="badge neu">saved — leave blank to keep</span>' : ''}</label>
          <input type="password" id="aiKey" autocomplete="off" placeholder="${cfg.hasOwnKey ? '•••••••• (unchanged)' : 'paste your key'}"></div>
        <div class="btn-row"><button class="btn neutral sm" id="aiTestBtn" type="button">Test key</button><span id="aiTestMsg" style="font-size:13px;"></span></div>
      </div>
    </div>`;
}

function renderAiInto(mount, cfg, buttonLabel, afterSave) {
  mount.innerHTML = aiControlsHTML(cfg) + `<button class="btn" id="aiSaveBtn" style="margin-top:6px;">${buttonLabel}</button>`;
  const ownFields = mount.querySelector('.ai-own-fields');
  const provSel = mount.querySelector('#aiProvider');
  const modelInput = mount.querySelector('#aiModel');
  const modelList = mount.querySelector('#aiModelList');
  const sug = cfg.suggestions || {};
  const refreshSug = () => { if (modelList && provSel) modelList.innerHTML = (sug[provSel.value] || []).map(m => `<option value="${m}">`).join(''); };
  refreshSug();
  mount.querySelectorAll('input[name=aimode]').forEach(r => r.addEventListener('change', () => {
    const own = mount.querySelector('input[name=aimode]:checked').value === 'own';
    ownFields.style.display = own ? 'block' : 'none';
    mount.querySelectorAll('.ai-opt').forEach(o => o.classList.toggle('sel', o.dataset.opt === (own ? 'own' : 'default')));
  }));
  if (provSel) provSel.addEventListener('change', () => { refreshSug(); if (modelInput && !modelInput.value) modelInput.value = (sug[provSel.value] || [])[0] || ''; });
  const testBtn = mount.querySelector('#aiTestBtn');
  if (testBtn) testBtn.addEventListener('click', async () => {
    const model = modelInput.value.trim();
    if (!model) return toast('Enter a model id first', true);
    const msg = mount.querySelector('#aiTestMsg'); msg.textContent = '';
    busy(testBtn, true, 'Testing…');
    try {
      const k = mount.querySelector('#aiKey').value;
      const r = await api('/ai-config/test', { method: 'POST', body: { provider: provSel.value, model, apiKey: k || undefined } });
      msg.innerHTML = r.ok ? '<span style="color:var(--ok)">✓ Key works</span>' : '<span style="color:var(--bad)">✗ ' + esc(r.error) + '</span>';
    } catch (e) { msg.innerHTML = '<span style="color:var(--bad)">✗ ' + esc(e.message) + '</span>'; }
    finally { busy(testBtn, false); }
  });
  mount.querySelector('#aiSaveBtn').addEventListener('click', async () => {
    const mode = mount.querySelector('input[name=aimode]:checked').value;
    const body = { mode };
    if (mode === 'own') {
      body.provider = provSel.value;
      body.model = modelInput.value.trim();
      const k = mount.querySelector('#aiKey').value;
      if (k) body.apiKey = k;
    }
    const btn = mount.querySelector('#aiSaveBtn'); busy(btn, true, 'Saving…');
    try { const res = await api('/ai-config', { method: 'PUT', body }); if (afterSave) await afterSave(res); }
    catch (e) { toast(e.message, true); }
    finally { busy(btn, false); }
  });
}
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try { await api('/auth/logout', { method: 'POST' }); } catch {}
  location.reload();
});
document.getElementById('changePwForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const currentPassword = document.getElementById('curPw').value;
  const newPassword = document.getElementById('newPw').value;
  const msg = document.getElementById('changePwMsg');
  const btn = e.target.querySelector('button[type=submit]');
  msg.textContent = '';
  busy(btn, true, 'Updating…');
  try {
    await api('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
    msg.style.color = 'var(--ok)'; msg.textContent = '✓ Password updated';
    document.getElementById('curPw').value = ''; document.getElementById('newPw').value = '';
  } catch (err) { msg.style.color = 'var(--bad)'; msg.textContent = err.message; }
  finally { busy(btn, false); }
});

/* ============================ Master résumé ============================ */
const masterResumeEl = document.getElementById('masterResume');
let resumeMeta = { hasOriginal: false, originalName: null };

async function loadResume() {
  try {
    const r = await api('/resume');
    masterResumeEl.value = r.text || '';
    resumeMeta = { hasOriginal: r.hasOriginal, originalName: r.originalName };
    document.getElementById('resumeStatus').textContent = r.text ? `Saved (${r.text.length} chars)` : 'Not set yet.';
    renderHeldFile();
  } catch (e) { /* handled by api */ }
}
document.getElementById('saveResume').addEventListener('click', async () => {
  try {
    await api('/resume', { method: 'PUT', body: { text: masterResumeEl.value } });
    document.getElementById('resumeStatus').textContent = `Saved ✓ (${masterResumeEl.value.trim().length} chars)`;
    toast('Master résumé saved ✓');
  } catch (e) { toast(e.message, true); }
});
document.getElementById('resumeFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const status = document.getElementById('resumeStatus');
  status.textContent = 'Reading ' + file.name + '…';
  try {
    const text = await extractFileText(file);
    masterResumeEl.value = text.trim();
    try {
      const dataUrl = await fileToDataUrl(file);
      await api('/resume/file', { method: 'PUT', body: { name: file.name, type: file.type, dataUrl } });
      resumeMeta = { hasOriginal: true, originalName: file.name };
      renderHeldFile();
    } catch (qe) { toast('Text loaded, but original could not be held: ' + qe.message, true); }
    status.textContent = 'Loaded ' + file.name + ' — review, then Save.';
    toast('File loaded — review & save');
  } catch (err) {
    status.textContent = '';
    toast('Could not read file: ' + (err.message || err) + '. Paste the text instead.', true);
  }
  e.target.value = '';
});

function renderHeldFile() {
  const row = document.getElementById('heldFileRow');
  if (!resumeMeta.hasOriginal) { row.style.display = 'none'; row.innerHTML = ''; return; }
  row.style.display = 'block';
  row.innerHTML = `📎 Original held: <strong>${esc(resumeMeta.originalName || 'file')}</strong>
    <span style="float:right;">
      <button class="btn neutral sm" id="dlOrig">Download original</button>
      <button class="btn danger sm" id="rmOrig">Remove</button>
    </span>`;
  document.getElementById('dlOrig').onclick = async () => {
    try { const f = await api('/resume/file'); const blob = await (await fetch(f.dataUrl)).blob(); downloadBlob(f.name, blob); }
    catch (e) { toast('Could not download original: ' + e.message, true); }
  };
  document.getElementById('rmOrig').onclick = async () => {
    try { await api('/resume/file', { method: 'DELETE' }); resumeMeta = { hasOriginal: false, originalName: null }; renderHeldFile(); toast('Removed held original'); }
    catch (e) { toast(e.message, true); }
  };
}

/* --- in-browser file text extraction --- */
async function extractFileText(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.txt') || name.endsWith('.md')) return await file.text();
  if (name.endsWith('.pdf')) return await extractPdf(file);
  if (name.endsWith('.docx')) return await extractDocx(file);
  throw new Error('Unsupported file type');
}
async function extractPdf(file) {
  const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  let out = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const content = await (await pdf.getPage(i)).getTextContent();
    out += content.items.map(it => it.str).join(' ') + '\n\n';
  }
  return out;
}
let mammothLoaded = false;
async function extractDocx(file) {
  if (!mammothLoaded) { await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js'); mammothLoaded = true; }
  const res = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return res.value;
}
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = () => reject(new Error('Failed to load ' + src + ' (offline?)'));
    document.head.appendChild(s);
  });
}
function fileToDataUrl(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
}

/* ============================ Apply workflow ============================ */
let currentApp = {};
function setStep(n) {
  document.querySelectorAll('#applySteps .step').forEach(s => {
    const sn = +s.dataset.s;
    s.classList.toggle('done', sn < n);
    s.classList.toggle('current', sn === n);
  });
}
function busy(btn, on, label) {
  if (on) { btn.dataset.orig = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>' + label; }
  else { btn.disabled = false; btn.innerHTML = btn.dataset.orig || label; }
}

document.getElementById('resetApply').addEventListener('click', () => {
  currentApp = {};
  document.getElementById('jdInput').value = '';
  ['apply-s2', 'apply-s3', 'apply-s4'].forEach(id => (document.getElementById(id).style.display = 'none'));
  setStep(1);
});

document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const jd = document.getElementById('jdInput').value.trim();
  if (!jd) return toast('Paste a job description first', true);
  const btn = document.getElementById('analyzeBtn'); busy(btn, true, 'Analysing…');
  try {
    const ex = await api('/ai/analyze', { method: 'POST', body: { jd } });
    currentApp = { jdOriginal: jd, jdEnglish: ex.englishTranslation, analysis: ex };
    renderExtraction(ex);
    document.getElementById('apply-s2').style.display = 'block';
    document.getElementById('apply-s3').style.display = 'none';
    document.getElementById('apply-s4').style.display = 'none';
    setStep(2);
    document.getElementById('apply-s2').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) { toast('Analysis failed: ' + e.message, true); }
  finally { busy(btn, false); }
});

function renderExtraction(ex) {
  document.getElementById('origText').textContent = currentApp.jdOriginal;
  document.getElementById('enText').textContent = ex.englishTranslation || '';
  document.getElementById('langBadge').textContent = 'Source: ' + (ex.detectedLanguage || '?');
  const lr = ex.languageRequirement || {};
  const de = (lr.german || 'unclear').toLowerCase();
  const hardDe = ['b2', 'c1', 'native'].some(x => de.includes(x));
  const lb = document.getElementById('langReqBadge');
  lb.textContent = 'German: ' + (lr.german || '?');
  lb.className = 'badge ' + (hardDe ? 'bad' : de === 'none' || de.includes('basic') || de.includes('b1') ? 'ok' : 'warn');
  document.getElementById('exCompany').textContent = ex.company || '—';
  document.getElementById('exRole').textContent = ex.role || '—';
  document.getElementById('exSeniority').textContent = ex.seniority || '—';
  document.getElementById('exMust').innerHTML = chips(ex.mustHaves);
  document.getElementById('exNice').innerHTML = chips(ex.niceToHaves);
  document.getElementById('exTech').innerHTML = chips(ex.techStack);
  document.getElementById('langNote').textContent = '🗣 ' + (lr.note || 'Language requirement unclear.');
}

document.getElementById('fitBtn').addEventListener('click', async () => {
  const btn = document.getElementById('fitBtn'); busy(btn, true, 'Checking…');
  try {
    const fit = await api('/ai/fit', { method: 'POST', body: { analysis: currentApp.analysis } });
    currentApp.compat = fit;
    renderFit(fit);
    document.getElementById('apply-s3').style.display = 'block';
    document.getElementById('apply-s4').style.display = 'none';
    setStep(3);
    document.getElementById('apply-s3').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) { toast('Fit check failed: ' + e.message, true); }
  finally { busy(btn, false); }
});

function renderFit(fit) {
  const score = Math.max(0, Math.min(100, +fit.score || 0));
  const ring = document.getElementById('scoreRing');
  ring.textContent = score;
  const col = score >= 70 ? 'var(--ok)' : score >= 45 ? 'var(--warn)' : 'var(--bad)';
  const weak = score >= 70 ? 'var(--ok-weak)' : score >= 45 ? 'var(--warn-weak)' : 'var(--bad-weak)';
  ring.style.background = weak; ring.style.color = col; ring.style.border = '3px solid ' + col;
  document.getElementById('verdictText').textContent = fit.verdict || '';
  document.getElementById('recoText').textContent = (fit.recommendation || '') + (fit.languageFlag ? '  ·  ' + fit.languageFlag : '');
  document.getElementById('matchList').innerHTML = (fit.matched || []).map(m =>
    `<li><strong>${esc(m.requirement)}</strong><br><span style="color:var(--muted)">${esc(m.evidence)}</span></li>`).join('') || '<li style="background:transparent;color:var(--muted)">—</li>';
  document.getElementById('gapList').innerHTML = (fit.gaps || []).map(g =>
    `<li class="${g.severity === 'nice' ? 'nice' : ''}"><strong>${esc(g.requirement)}</strong> <span class="badge ${g.severity === 'must' ? 'bad' : 'warn'}" style="font-size:11px">${esc(g.severity)}</span><br><span style="color:var(--muted)">${esc(g.suggestion)}</span></li>`).join('') || '<li style="background:transparent;color:var(--muted)">No gaps flagged 🎉</li>';
}

document.getElementById('tailorBtn').addEventListener('click', async () => {
  const btn = document.getElementById('tailorBtn'); busy(btn, true, 'Tailoring…');
  try {
    const out = await api('/ai/tailor', {
      method: 'POST',
      body: {
        analysis: currentApp.analysis,
        jdEnglish: currentApp.jdEnglish,
        notes: document.getElementById('userNotes').value.trim(),
        coverLang: document.getElementById('coverLang').value,
        tone: document.getElementById('tone').value
      }
    });
    currentApp.tailored = out;
    currentApp.coverLang = document.getElementById('coverLang').value;
    document.getElementById('tailoredResumeOut').textContent = out.tailoredResume || '';
    document.getElementById('coverLetterOut').textContent = out.coverLetter || '';
    document.getElementById('atsList').innerHTML = (out.atsNotes || []).map(n => `<li>${esc(n)}</li>`).join('') || '<li style="background:transparent;color:var(--muted)">—</li>';
    document.getElementById('apply-s4').style.display = 'block';
    setStep(4);
    document.getElementById('apply-s4').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) { toast('Tailoring failed: ' + e.message, true); }
  finally { busy(btn, false); }
});

/* ============================ Exports (client-side) ============================ */
function docStem(name) {
  const co = currentApp.analysis || {};
  return (co.company || 'application').replace(/[^\w-]+/g, '_') + '-' + name;
}
document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById(b.dataset.copy).textContent).then(() => toast('Copied ✓'), () => toast('Copy failed', true));
}));
document.querySelectorAll('[data-dl]').forEach(b => b.addEventListener('click', () => {
  downloadText(docStem(b.dataset.name) + '.md', document.getElementById(b.dataset.dl).textContent);
}));
document.querySelectorAll('[data-pdf]').forEach(b => b.addEventListener('click', () => {
  exportPdf(docStem(b.dataset.name), document.getElementById(b.dataset.pdf).textContent);
}));
document.querySelectorAll('[data-docx]').forEach(b => b.addEventListener('click', () => {
  exportDocx(docStem(b.dataset.name), document.getElementById(b.dataset.docx).textContent);
}));

function downloadBlob(name, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}
function downloadText(name, text) { downloadBlob(name, new Blob([text], { type: 'text/markdown' })); }

function mdToHtml(md) {
  const inline = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const lines = String(md || '').replace(/\r/g, '').split('\n');
  let html = '', inList = false;
  const closeList = () => { if (inList) { html += '</ul>'; inList = false; } };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    let m;
    if (!line.trim()) { closeList(); continue; }
    if (/^\s*[-*_=]{3,}\s*$/.test(line)) { closeList(); continue; }
    if (m = line.match(/^(#{1,3})\s+(.*)$/)) { closeList(); const h = m[1].length; html += `<h${h}>${inline(m[2])}</h${h}>`; }
    else if (m = line.match(/^\s*[-*]\s+(.*)$/)) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${inline(m[1])}</li>`; }
    else { closeList(); html += `<p>${inline(line)}</p>`; }
  }
  closeList();
  return html;
}
function printableHtml(title, md) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
    @page { margin: 0; }
    body { font-family: Arial, Helvetica, "Liberation Sans", sans-serif; font-weight: 400; font-synthesis: none; -webkit-font-smoothing: antialiased; color: #111; font-size: 11.5pt; line-height: 1.5; margin: 0; padding: 18mm; }
    h1, h2, h3, strong, b { font-synthesis: none; }
    h1 { font-size: 19pt; font-weight: 700; margin: 0 0 2pt; }
    h2 { font-size: 13pt; font-weight: 700; margin: 14pt 0 3pt; border-bottom: 1px solid #ccc; padding-bottom: 2pt; }
    h3 { font-size: 11.5pt; font-weight: 700; margin: 10pt 0 2pt; }
    p { margin: 4pt 0; font-weight: 400; } ul { margin: 4pt 0; padding-left: 18pt; } li { margin: 2pt 0; font-weight: 400; }
    strong, b { font-weight: 700; }
  </style></head><body>${mdToHtml(md)}</body></html>`;
}
function exportPdf(title, md) {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open(); doc.write(printableHtml(title, md)); doc.close();
  setTimeout(() => {
    try { iframe.contentWindow.focus(); iframe.contentWindow.print(); }
    catch { toast('Could not open print dialog', true); }
    setTimeout(() => iframe.remove(), 1500);
  }, 350);
  toast('Choose "Save as PDF" in the dialog');
}
let docxLoaded = false;
async function ensureDocx() {
  if (!docxLoaded) { await loadScript('https://cdn.jsdelivr.net/npm/docx@9.7.1/dist/index.umd.cjs'); docxLoaded = true; }
  return window.docx;
}
function mdToDocxParagraphs(md, C) {
  const { Paragraph, TextRun, HeadingLevel } = C;
  const runs = text => String(text).split(/(\*\*[^*]+\*\*)/g).filter(s => s !== '').map(seg => {
    const bold = /^\*\*[^*]+\*\*$/.test(seg);
    return new TextRun({ text: bold ? seg.slice(2, -2) : seg, bold });
  });
  const heads = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3];
  const out = [];
  for (const raw of String(md || '').replace(/\r/g, '').split('\n')) {
    const line = raw.replace(/\s+$/, '');
    let m;
    if (!line.trim()) { out.push(new Paragraph('')); continue; }
    if (/^\s*[-*_=]{3,}\s*$/.test(line)) continue;
    if (m = line.match(/^(#{1,3})\s+(.*)$/)) out.push(new Paragraph({ heading: heads[m[1].length - 1], children: runs(m[2]) }));
    else if (m = line.match(/^\s*[-*]\s+(.*)$/)) out.push(new Paragraph({ bullet: { level: 0 }, children: runs(m[1]) }));
    else out.push(new Paragraph({ children: runs(line) }));
  }
  return out;
}
async function exportDocx(baseName, md) {
  let d;
  try { d = await ensureDocx(); }
  catch { toast('Could not load the Word exporter (offline?). Use PDF or .md.', true); return; }
  try {
    const doc = new d.Document({ sections: [{ properties: {}, children: mdToDocxParagraphs(md, d) }] });
    const blob = await d.Packer.toBlob(doc);
    downloadBlob(baseName + '.docx', blob);
    toast('Word file downloaded ✓');
  } catch (e) { toast('Word export failed: ' + (e.message || e), true); }
}

/* ============================ Tracker ============================ */
document.getElementById('saveToTracker').addEventListener('click', async () => {
  const ex = currentApp.analysis || {};
  try {
    await api('/applications', { method: 'POST', body: {
      company: ex.company || 'Unknown',
      role: ex.role || '',
      jdLang: ex.detectedLanguage || null,
      score: currentApp.compat ? Math.round(currentApp.compat.score) : null,
      status: 'To apply',
      coverLang: currentApp.coverLang || null,
      jdOriginal: currentApp.jdOriginal || null,
      jdEnglish: currentApp.jdEnglish || null,
      analysis: currentApp.analysis || null,
      compat: currentApp.compat || null,
      tailored: currentApp.tailored || null
    }});
    toast('Saved to tracker ✓');
  } catch (e) { toast(e.message, true); }
});

const STATUSES = ['To apply', 'Applied', 'Interview', 'Offer', 'Rejected', 'Skipped'];
let trackerApps = [];
let trackerView = localStorage.getItem('jat_tracker_view') === 'board' ? 'board' : 'table';

function todayStr() { return new Date().toISOString().slice(0, 10); }

function scoreCls(score) { return score == null ? 'neu' : score >= 70 ? 'ok' : score >= 45 ? 'warn' : 'bad'; }

function followUpBadge(a) {
  if (!a.followUpAt) return '';
  const due = a.followUpAt <= todayStr();
  return `<span class="followup-badge${due ? ' due' : ''}">${due ? '⏰' : '📅'} ${esc(a.followUpAt)}</span>`;
}

// One-time population of the status filter dropdown.
let statusFilterBuilt = false;
function ensureStatusFilterOptions() {
  if (statusFilterBuilt) return;
  const sel = document.getElementById('trkStatusFilter');
  sel.innerHTML = '<option value="">All statuses</option>' + STATUSES.map(s => `<option value="${s}">${s}</option>`).join('');
  statusFilterBuilt = true;
}

function filteredSortedApps() {
  const q = document.getElementById('trkSearch').value.trim().toLowerCase();
  const statusFilter = document.getElementById('trkStatusFilter').value;
  const sort = document.getElementById('trkSort').value;
  let list = trackerApps.filter(a => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (q && !((a.company || '').toLowerCase().includes(q) || (a.role || '').toLowerCase().includes(q))) return false;
    return true;
  });
  const cmp = {
    'date-desc': (a, b) => b.date.localeCompare(a.date),
    'date-asc': (a, b) => a.date.localeCompare(b.date),
    'score-desc': (a, b) => (b.score ?? -1) - (a.score ?? -1),
    'score-asc': (a, b) => (a.score ?? 999) - (b.score ?? 999),
    'company-asc': (a, b) => (a.company || '').localeCompare(b.company || '')
  }[sort] || (() => 0);
  return list.slice().sort(cmp);
}

async function renderTracker() {
  ensureStatusFilterOptions();
  try { trackerApps = await api('/applications'); } catch (e) { toast(e.message, true); return; }
  renderTrackerActiveView();
}

function renderTrackerActiveView() {
  document.getElementById('trackerTableCard').style.display = trackerView === 'table' ? 'block' : 'none';
  document.getElementById('trackerBoard').style.display = trackerView === 'board' ? 'grid' : 'none';
  if (trackerView === 'table') renderTrackerTable(); else renderTrackerBoard();
}

document.querySelectorAll('#trkViewSwitch button').forEach(b => b.addEventListener('click', () => {
  trackerView = b.dataset.view;
  localStorage.setItem('jat_tracker_view', trackerView);
  document.querySelectorAll('#trkViewSwitch button').forEach(x => x.classList.toggle('active', x === b));
  renderTrackerActiveView();
}));
document.querySelectorAll('#trkViewSwitch button').forEach(b => b.classList.toggle('active', b.dataset.view === trackerView));

document.getElementById('trkSearch').addEventListener('input', renderTrackerActiveView);
document.getElementById('trkStatusFilter').addEventListener('change', renderTrackerActiveView);
document.getElementById('trkSort').addEventListener('change', renderTrackerActiveView);

async function patchApp(id, body) {
  const updated = await api('/applications/' + id, { method: 'PATCH', body });
  const i = trackerApps.findIndex(a => a.id === id);
  if (i !== -1) trackerApps[i] = updated;
  return updated;
}

function renderTrackerTable() {
  const body = document.getElementById('trackerBody');
  const empty = document.getElementById('trackerEmpty');
  const apps = filteredSortedApps();
  empty.style.display = apps.length ? 'none' : 'block';
  empty.textContent = trackerApps.length ? 'No applications match your search/filter.' : 'No applications yet. Analyse a job ad and hit "Save to tracker".';
  const byId = Object.fromEntries(trackerApps.map(a => [a.id, a]));
  body.innerHTML = apps.map(a => {
    const score = a.score == null ? '—' : a.score;
    return `<tr data-id="${a.id}">
      <td>${esc(a.date)}</td><td>${esc(a.company)}</td><td>${esc(a.role)}</td>
      <td><span class="badge neu">${esc(a.jdLang || '?')}</span></td>
      <td><span class="badge ${scoreCls(a.score)}">${score}</span></td>
      <td><select class="status-sel" data-id="${a.id}">${STATUSES.map(s => `<option ${s === a.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
      <td>${followUpBadge(a) || '<span style="color:var(--muted);font-size:12.5px;">—</span>'}</td>
      <td style="text-align:right;white-space:nowrap;">
        <button class="btn ghost sm icon-sm" data-edit="${a.id}" title="Notes &amp; follow-up">✎</button>
        ${a.tailored ? `<button class="btn ghost sm" data-view-app="${a.id}">Download</button>` : ''}
        <button class="btn danger sm" data-del="${a.id}">✕</button>
      </td></tr>`;
  }).join('');
  body.querySelectorAll('.status-sel').forEach(sel => sel.addEventListener('change', async () => {
    try { await patchApp(sel.dataset.id, { status: sel.value }); toast('Status updated'); }
    catch (e) { toast(e.message, true); }
  }));
  body.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    try { await api('/applications/' + b.dataset.del, { method: 'DELETE' }); renderTracker(); toast('Deleted'); }
    catch (e) { toast(e.message, true); }
  }));
  body.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openAppEditModal(b.dataset.edit)));
  body.querySelectorAll('[data-view-app]').forEach(b => b.addEventListener('click', () => {
    const a = byId[b.dataset.viewApp];
    if (!a?.tailored) return;
    const stem = (a.company || 'app').replace(/[^\w-]+/g, '_');
    downloadText(stem + '-resume.md', a.tailored.tailoredResume || '');
    downloadText(stem + '-cover-letter.md', a.tailored.coverLetter || '');
    toast('Downloaded résumé + cover letter (.md)');
  }));
}

/* ---- Kanban board ---- */
let dragId = null;
function renderTrackerBoard() {
  const board = document.getElementById('trackerBoard');
  const apps = filteredSortedApps();
  board.innerHTML = STATUSES.map(status => {
    const items = apps.filter(a => a.status === status);
    return `<div class="kanban-col" data-status="${esc(status)}">
      <div class="kanban-col-head"><span>${esc(status)}</span><span class="cnt">${items.length}</span></div>
      ${items.map(a => `
        <div class="kanban-card" draggable="true" data-id="${a.id}">
          <div class="co">${esc(a.company)}</div>
          <div class="ro">${esc(a.role) || '—'}</div>
          <div class="meta">
            <span class="badge ${scoreCls(a.score)}">${a.score == null ? '—' : a.score}</span>
            ${followUpBadge(a)}
          </div>
        </div>`).join('') || '<div class="kanban-empty">—</div>'}
    </div>`;
  }).join('');

  board.querySelectorAll('.kanban-card').forEach(card => {
    card.addEventListener('dragstart', () => { dragId = card.dataset.id; card.classList.add('dragging'); });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
    card.addEventListener('click', () => openAppEditModal(card.dataset.id));
  });
  board.querySelectorAll('.kanban-col').forEach(col => {
    col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drag-over'); });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', async (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const id = dragId;
      const status = col.dataset.status;
      if (!id) return;
      try { await patchApp(id, { status }); renderTrackerBoard(); toast('Status updated'); }
      catch (err) { toast(err.message, true); }
    });
  });
}

/* ---- Notes / follow-up modal ---- */
function openAppEditModal(id) {
  const a = trackerApps.find(x => x.id === id);
  if (!a) return;
  document.getElementById('appEditTitle').textContent = 'Edit — ' + (a.company || 'Application');
  document.getElementById('appEditFollowUp').value = a.followUpAt || '';
  document.getElementById('appEditNotes').value = a.notes || '';
  document.getElementById('appEditMsg').textContent = '';
  document.getElementById('appEditModal').classList.remove('hidden');
  document.getElementById('appEditSave').onclick = async () => {
    const btn = document.getElementById('appEditSave');
    const msg = document.getElementById('appEditMsg');
    busy(btn, true, 'Saving…');
    try {
      await patchApp(id, {
        notes: document.getElementById('appEditNotes').value,
        followUpAt: document.getElementById('appEditFollowUp').value || null
      });
      closeAppEditModal();
      renderTrackerActiveView();
      toast('Saved ✓');
    } catch (e) { msg.style.color = 'var(--bad)'; msg.textContent = e.message; }
    finally { busy(btn, false); }
  };
}
function closeAppEditModal() { document.getElementById('appEditModal').classList.add('hidden'); }
document.getElementById('appEditClose').addEventListener('click', closeAppEditModal);
document.getElementById('appEditModal').addEventListener('click', (e) => { if (e.target.id === 'appEditModal') closeAppEditModal(); });

/* ---- CSV export ---- */
function csvCell(v) {
  const s = String(v == null ? '' : v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
document.getElementById('trkExportCsv').addEventListener('click', () => {
  const apps = filteredSortedApps();
  if (!apps.length) return toast('Nothing to export', true);
  const header = ['Date', 'Company', 'Role', 'Language', 'Fit score', 'Status', 'Follow-up', 'Notes'];
  const rows = apps.map(a => [a.date, a.company, a.role, a.jdLang || '', a.score ?? '', a.status, a.followUpAt || '', a.notes || '']);
  const csv = [header, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n');
  downloadBlob('applications-' + todayStr() + '.csv', new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  toast('CSV exported ✓');
});

/* ============================ Admin ============================ */
async function renderAdmin() {
  let stats, users;
  try { [stats, users] = await Promise.all([api('/admin/stats'), api('/admin/users')]); }
  catch (e) { toast(e.message, true); return; }

  document.getElementById('adminStats').innerHTML = `
    <h3>Overview</h3>
    <div class="btn-row" style="margin-top:12px; gap:28px;">
      ${statTile('Users', stats.users)}
      ${statTile('Admins', stats.admins)}
      ${statTile('Résumés', stats.resumes)}
      ${statTile('Applications', stats.applications)}
    </div>`;

  const body = document.getElementById('adminBody');
  body.innerHTML = users.map(u => `<tr>
    <td>${esc(u.email)}${u.isSelf ? ' <span class="badge neu">you</span>' : ''}</td>
    <td>${esc(u.name || '—')}</td>
    <td><span class="badge ${u.role === 'admin' ? 'ok' : 'neu'}">${esc(u.role)}</span></td>
    <td><span class="badge neu">${esc(u.aiMode)}</span></td>
    <td>${u.applications}</td>
    <td>${u.hasResume ? `<button class="btn ghost sm" data-resume="${u.id}" data-email="${esc(u.email)}">View</button>` : '—'}</td>
    <td>${esc(u.createdAt)}</td>
    <td style="text-align:right;white-space:nowrap;">
      <button class="btn neutral sm" data-resetpw="${u.id}" data-email="${esc(u.email)}">Reset PW</button>
      ${u.isSelf ? '' : `
        <button class="btn neutral sm" data-role="${u.id}" data-next="${u.role === 'admin' ? 'user' : 'admin'}">${u.role === 'admin' ? 'Demote' : 'Make admin'}</button>
        <button class="btn danger sm" data-deluser="${u.id}" data-email="${esc(u.email)}">✕</button>`}
    </td></tr>`).join('');

  body.querySelectorAll('[data-role]').forEach(b => b.addEventListener('click', async () => {
    try { await api('/admin/users/' + b.dataset.role + '/role', { method: 'PATCH', body: { role: b.dataset.next } }); toast('Role updated'); renderAdmin(); }
    catch (e) { toast(e.message, true); }
  }));
  body.querySelectorAll('[data-deluser]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm(`Delete ${b.dataset.email} and ALL their data (résumé + applications)? This cannot be undone.`)) return;
    try { await api('/admin/users/' + b.dataset.deluser, { method: 'DELETE' }); toast('User deleted'); renderAdmin(); }
    catch (e) { toast(e.message, true); }
  }));
  body.querySelectorAll('[data-resume]').forEach(b => b.addEventListener('click', () => openResumeModal(b.dataset.resume, b.dataset.email)));
  body.querySelectorAll('[data-resetpw]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm(`Reset the password for ${b.dataset.email}? A new temporary password will be generated.`)) return;
    try {
      const r = await api('/admin/users/' + b.dataset.resetpw + '/reset-password', { method: 'POST' });
      alert(`Temporary password for ${r.email}:\n\n${r.tempPassword}\n\nShare it with the user. They should change it after logging in (Account → Change password).`);
    } catch (e) { toast(e.message, true); }
  }));
}
function statTile(label, value) {
  return `<div><div class="k-label">${label}</div><div style="font-size:24px;font-weight:700;">${value}</div></div>`;
}

async function openResumeModal(userId, email) {
  const modal = document.getElementById('resumeModal');
  const bodyEl = document.getElementById('rmBody');
  const dlBtn = document.getElementById('rmDownload');
  document.getElementById('rmTitle').textContent = 'Résumé — ' + email;
  document.getElementById('rmMeta').textContent = '';
  bodyEl.textContent = 'Loading…';
  dlBtn.style.display = 'none';
  modal.classList.remove('hidden');
  try {
    const r = await api('/admin/users/' + userId + '/resume');
    bodyEl.textContent = r.text || '(No text saved — the user may have only uploaded a file. Use Download original.)';
    document.getElementById('rmMeta').textContent = r.updatedAt ? 'Last updated ' + new Date(r.updatedAt).toLocaleString() : '';
    if (r.hasOriginal) {
      dlBtn.style.display = '';
      dlBtn.textContent = '⬇ Download original (' + (r.originalName || 'file') + ')';
      dlBtn.onclick = async () => {
        try { const f = await api('/admin/users/' + userId + '/resume/file'); const blob = await (await fetch(f.dataUrl)).blob(); downloadBlob(f.name || 'resume', blob); }
        catch (e) { toast(e.message, true); }
      };
    }
  } catch (e) { bodyEl.textContent = 'Could not load résumé: ' + e.message; }
}
function closeResumeModal() { document.getElementById('resumeModal').classList.add('hidden'); }
document.getElementById('rmClose').addEventListener('click', closeResumeModal);
document.getElementById('resumeModal').addEventListener('click', (e) => { if (e.target.id === 'resumeModal') closeResumeModal(); });

/* ============================ Boot ============================ */
(async function boot() {
  const rtoken = new URLSearchParams(location.search).get('token');
  if (location.pathname === '/reset' && rtoken) { showResetScreen(rtoken); return; }
  setAuthMode('login');
  try {
    const me = await api('/auth/me');
    await routeAfterAuth(me.user);
  } catch {
    showScreen('landing');
  }
})();
