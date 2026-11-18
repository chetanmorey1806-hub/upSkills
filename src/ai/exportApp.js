// Builds a standalone single-file HTML chatbot from an AI App Builder project.
// The exported app uses the official Anthropic SDK (loaded as an ES module from a CDN, version pinned)
// and asks the end user for their own API key at runtime.
import { chunkText } from './textSearch.js';

// Plain source of the search helpers (kept as text so minification can't rename them).
const SEARCH_SRC = String.raw`function tokenize(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w))
    .map((w) => w.replace(/(ing|ed|es|s)$/, (m) => (w.length > 4 ? '' : m)));
}

function chunkText(text, size = 60) {
  // split into chunks of ~size words, keeping paragraph boundaries when possible
  const paras = String(text).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  paras.forEach((p) => {
    const words = p.split(/\s+/);
    for (let i = 0; i < words.length; i += size) chunks.push(words.slice(i, i + size).join(' '));
  });
  return chunks;
}

function buildIndex(docs) {
  const toks = docs.map(tokenize);
  const df = new Map();
  toks.forEach((t) => new Set(t).forEach((w) => df.set(w, (df.get(w) || 0) + 1)));
  const N = docs.length;
  const idf = (w) => Math.log((N + 1) / ((df.get(w) || 0) + 1)) + 1;
  const vec = (t) => {
    const tf = new Map();
    t.forEach((w) => tf.set(w, (tf.get(w) || 0) + 1));
    const v = new Map();
    tf.forEach((c, w) => v.set(w, (c / t.length) * idf(w)));
    return v;
  };
  const vectors = toks.map(vec);
  return {
    docs, vectors,
    search(query, k = 3) {
      const qv = vec(tokenize(query));
      return vectors.map((v, i) => ({ i, text: docs[i], score: cosine(qv, v) }))
        .sort((a, b) => b.score - a.score).slice(0, k);
    },
  };
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  a.forEach((x, w) => { na += x * x; if (b.has(w)) dot += x * b.get(w); });
  b.forEach((y) => { nb += y * y; });
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}
`;

const SDK_VERSION = '1.10.0';
const safe = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

export function buildStandaloneHtml(p) {
  const STOP = 'a an the and or but if of to in on at for from by with is are was were be been it this that these those as i you he she we they my your our their what which who how why when where do does did can could should would will not no yes so than then there here into about over under also just only very more most such its';
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${p.name.replace(/</g, '')}</title>
<style>
:root{--accent:${p.color};--bg:#f6f7fb;--card:#fff;--text:#1d2433;--muted:#5d6679;--border:#e1e5ee}
@media (prefers-color-scheme:dark){:root{--bg:#0d1117;--card:#161b22;--text:#e6edf3;--muted:#9aa5b4;--border:#2d3540}}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,sans-serif;background:var(--bg);color:var(--text)}
header{background:var(--accent);color:#fff;padding:16px}header h1{margin:0;font-size:1.3rem}header p{margin:4px 0 0;opacity:.9}
main{max-width:820px;margin:0 auto;padding:16px}.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:12px}
.msg{display:flex;gap:8px;margin:10px 0}.msg.user{flex-direction:row-reverse}.b{padding:10px 12px;border-radius:12px;max-width:80%;white-space:pre-wrap;line-height:1.5}
.user .b{background:var(--accent);color:#fff}.assistant .b{background:var(--card);border:1px solid var(--border)}
form{display:flex;gap:8px}input,button{font:inherit;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text)}
input{flex:1}button{background:var(--accent);color:#fff;border:none;cursor:pointer}.chips button{margin:4px 4px 0 0;background:var(--card);color:var(--text);border:1px solid var(--border)}
.muted{color:var(--muted);font-size:.85rem}
</style></head><body>
<header><h1>${p.name.replace(/</g, '')}</h1><p>${p.tagline.replace(/</g, '')}</p></header>
<main>
<div class="card" id="keycard"><b>Setup:</b> paste your Anthropic API key (stored only in this browser).<form id="kf"><input id="key" type="password" placeholder="sk-ant-..."><button>Save</button></form></div>
<div id="chat"></div>
<div class="chips" id="chips"></div>
<form id="f"><input id="q" placeholder="Type your question..." autocomplete="off"><button id="send">Send</button></form>
<p class="muted">Built with the AI App Builder. Answers can be wrong, so check important information.</p>
</main>
<script type="module">
import Anthropic from "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@${SDK_VERSION}/+esm";
const CONFIG = ${safe({ system: p.system, welcome: p.welcome, starters: p.starters.filter(Boolean), kb: p.useKb ? p.kb : '', topK: p.topK })};
const STOP = new Set(${safe(STOP)}.split(' '));
${SEARCH_SRC}
const chunks = CONFIG.kb ? chunkText(CONFIG.kb, 60) : [];
const index = chunks.length ? buildIndex(chunks) : null;
const chatEl = document.getElementById('chat');
const history = [];
const add = (role, text) => { const d = document.createElement('div'); d.className = 'msg ' + role; const b = document.createElement('div'); b.className = 'b'; b.textContent = text; d.appendChild(b); chatEl.appendChild(d); window.scrollTo(0, document.body.scrollHeight); return b; };
add('assistant', CONFIG.welcome);
const getKey = () => localStorage.getItem('app-anthropic-key') || '';
const refreshKey = () => { document.getElementById('keycard').style.display = getKey() ? 'none' : 'block'; };
refreshKey();
document.getElementById('kf').onsubmit = (e) => { e.preventDefault(); const k = document.getElementById('key').value.trim(); if (k) localStorage.setItem('app-anthropic-key', k); refreshKey(); };
const chips = document.getElementById('chips');
CONFIG.starters.forEach((s) => { const b = document.createElement('button'); b.textContent = s; b.onclick = () => ask(s); chips.appendChild(b); });
async function ask(question) {
  if (!question.trim()) return;
  if (!getKey()) { refreshKey(); alert('Please add your API key first.'); return; }
  add('user', question);
  let content = question;
  if (index) {
    const hits = index.search(question, CONFIG.topK).filter((h) => h.score > 0);
    if (hits.length) content = 'Use this reference information when it is relevant:\\n' + hits.map((h, i) => '[' + (i + 1) + '] ' + h.text).join('\\n') + '\\n\\nQuestion: ' + question;
  }
  history.push({ role: 'user', content });
  const bubble = add('assistant', '…');
  try {
    const client = new Anthropic({ apiKey: getKey(), dangerouslyAllowBrowser: true });
    const stream = client.beta.messages.stream({ model: 'claude-opus-5-5', max_tokens: 16000, system: CONFIG.system, messages: history, output_config: { effort: 'low' }, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' });
    let text = '';
    for await (const ev of stream) { if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') { text += ev.delta.text; bubble.textContent = text; } }
    const msg = await stream.finalMessage();
    if (msg.stop_reason === 'refusal') bubble.textContent = text || 'Sorry, I can\\'t help with that request.';
    history.push({ role: 'assistant', content: text || '(no answer)' });
  } catch (err) {
    history.pop();
    bubble.textContent = err instanceof Anthropic.AuthenticationError ? 'Invalid API key. Click below to update it.' : 'Error: ' + (err.message || err);
    if (err instanceof Anthropic.AuthenticationError) { localStorage.removeItem('app-anthropic-key'); refreshKey(); }
  }
}
document.getElementById('f').onsubmit = (e) => { e.preventDefault(); const q = document.getElementById('q'); const v = q.value; q.value = ''; ask(v); };
</script>
</body></html>`;
}

export function buildReport(p, tests) {
  const passed = tests.filter((t) => t.verdict === 'pass').length;
  const lines = [
    `# Final Project Report – ${p.name}`,
    '', `**Tagline:** ${p.tagline}`, `**Student:** ${p.student || '________'}    **Date:** ${new Date().toISOString().slice(0, 10)}`,
    '', '## 1. Problem statement', p.problem || '_(describe the problem)_',
    '', '## 2. Target users', p.users || '_(who will use it)_',
    '', '## 3. Features', ...(p.features || '').split('\n').filter(Boolean).map((f) => `- ${f}`),
    '', '## 4. AI design', '### System prompt', '```', p.system, '```',
    `### Knowledge base (RAG)`, p.useKb ? `Enabled: ${chunkText(p.kb, 60).length} chunks, top-${p.topK} retrieval using TF-IDF similarity.` : 'Not used.',
    `### Model`, 'Claude (claude-opus-5-5) via the Anthropic Messages API, streaming responses.',
    '', '## 5. Testing', `${passed}/${tests.length} test cases passed.`, '',
    '| # | Test question | Expected behaviour | Result | Notes |', '|---|---|---|---|---|',
    ...tests.map((t, i) => `| ${i + 1} | ${t.q.replace(/\|/g, '/')} | ${t.expected.replace(/\|/g, '/')} | ${t.verdict || 'not run'} | ${(t.note || '').replace(/\|/g, '/')} |`),
    '', '## 6. Limitations and responsible AI', p.limits || '_(e.g. can be wrong, privacy of data, needs human review)_',
    '', '## 7. Future improvements', p.future || '_(what you would add next)_',
    '', '## 8. What I learned', p.learned || '_(reflection)_', '',
  ];
  return lines.join('\n');
}
