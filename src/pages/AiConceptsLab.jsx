import { useMemo, useState } from 'react';
import { Brain, Hash, Dices, Search, Send } from 'lucide-react';
import { buildIndex, chunkText } from '../ai/textSearch.js';
import { PRICES, streamClaude, describeError } from '../ai/claudeClient.js';
import ApiKeyBox, { useApiKey } from '../ai/ApiKeyBox.jsx';
import RichText from '../components/RichText.jsx';

// ---------- 1. tokenizer (approximate, for teaching) ----------
function approxTokens(text) {
  const out = [];
  const parts = text.match(/\s+|[A-Za-z]+|\d+|[^\sA-Za-z\d]/g) || [];
  let lead = '';
  parts.forEach((p) => {
    if (/^\s+$/.test(p)) { lead = p.includes('\n') ? '\n' : ' '; if (p.includes('\n')) out.push('⏎'); return; }
    if (/^[A-Za-z]+$/.test(p) && p.length > 6) {
      // long words split into ~4-char sub-word pieces (like BPE)
      let w = p;
      let first = true;
      while (w.length) { const n = w.length > 6 ? 4 : w.length; out.push((first ? lead.replace('\n', '') : '') + w.slice(0, n)); w = w.slice(n); first = false; }
    } else if (/^\d+$/.test(p) && p.length > 3) {
      for (let i = 0; i < p.length; i += 3) out.push((i === 0 ? lead.replace('\n', '') : '') + p.slice(i, i + 3));
    } else out.push(lead.replace('\n', '') + p);
    lead = '';
  });
  return out;
}
const COLORS = ['#dbeafe', '#fde68a', '#bbf7d0', '#fbcfe8', '#ddd6fe', '#fed7aa'];

function TokenTab() {
  const [text, setText] = useState('Artificial Intelligence helps students learn faster. Prompt engineering = giving clear instructions!\nTokenization splits text into pieces like "token" + "ization".');
  const [outTokens, setOutTokens] = useState(500);
  const toks = approxTokens(text);
  const words = text.split(/\s+/).filter(Boolean).length;
  return (
    <div>
      <p className="muted">LLMs read text as <b>tokens</b> (word pieces), not letters or words. Roughly 1 token ≈ 4 characters ≈ ¾ of an English word. Type below to see an approximate split. Real tokenizers differ; the API's <code className="ic">count_tokens</code> endpoint gives exact counts.</p>
      <textarea className="input" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="ai-tokens">{toks.map((t, i) => <span key={i} style={{ background: COLORS[i % COLORS.length] }}>{t.replace(/ /g, '·')}</span>)}</div>
      <div className="stats ai-stats">
        <div><b>{text.length}</b><span>characters</span></div>
        <div><b>{words}</b><span>words</span></div>
        <div><b>{toks.length}</b><span>≈ tokens</span></div>
        <div><b>{(text.length / 4).toFixed(0)}</b><span>chars ÷ 4 rule</span></div>
      </div>
      <h4>Cost estimate for one request</h4>
      <label className="small">Expected reply length: {outTokens} output tokens <input type="range" min="50" max="4000" step="50" value={outTokens} onChange={(e) => setOutTokens(Number(e.target.value))} /></label>
      <table className="data-table"><thead><tr><th>Model</th><th>Input $/1M</th><th>Output $/1M</th><th>This request ≈</th><th>1,000 requests ≈</th></tr></thead>
        <tbody>{Object.entries(PRICES).map(([m, [i, o]]) => { const c = (toks.length * i + outTokens * o) / 1e6; return <tr key={m}><td>{m}</td><td>${i}</td><td>${o}</td><td>${c.toFixed(5)}</td><td>${(c * 1000).toFixed(2)}</td></tr>; })}</tbody>
      </table>
      <p className="muted small">Output tokens usually cost more than input tokens, and long chats resend the whole history each turn, so trim what you send.</p>
    </div>
  );
}

// ---------- 2. next-token sampling ----------
const PROMPTS = {
  'The capital of France is': { Paris: 6.0, the: 2.2, a: 1.6, located: 1.4, beautiful: 1.0, Lyon: 0.3, not: 0.2, London: -0.5 },
  'Once upon a time there was a': { little: 3.2, young: 2.9, king: 2.6, girl: 2.5, princess: 2.3, dragon: 1.9, boy: 1.8, robot: 0.8 },
  'My favourite programming language is': { Python: 3.0, JavaScript: 2.4, Java: 2.2, 'C#': 1.6, 'C++': 1.4, Rust: 1.0, Go: 0.9, COBOL: -1.0 },
  'For lunch today I will eat': { rice: 2.4, a: 2.2, pizza: 2.0, dal: 1.8, salad: 1.5, biryani: 1.5, nothing: 0.4, books: -2.0 },
};
function softmax(logits, T) {
  const xs = Object.entries(logits).map(([w, l]) => [w, l / Math.max(T, 0.01)]);
  const m = Math.max(...xs.map((x) => x[1]));
  const ex = xs.map(([w, l]) => [w, Math.exp(l - m)]);
  const s = ex.reduce((a, [, v]) => a + v, 0);
  return ex.map(([w, v]) => [w, v / s]).sort((a, b) => b[1] - a[1]);
}
function SamplingTab() {
  const [pk, setPk] = useState(Object.keys(PROMPTS)[0]);
  const [T, setT] = useState(1);
  const [topP, setTopP] = useState(1);
  const [samples, setSamples] = useState({});
  const probs = softmax(PROMPTS[pk], T);
  let cum = 0;
  const kept = probs.map(([w, p]) => { const keep = cum < topP; cum += p; return [w, p, keep]; });
  const keptSum = kept.filter((k) => k[2]).reduce((a, k) => a + k[1], 0);
  const sample = (n) => {
    const res = {};
    for (let i = 0; i < n; i++) {
      let r = Math.random() * keptSum;
      for (const [w, p, keep] of kept) { if (!keep) continue; r -= p; if (r <= 0) { res[w] = (res[w] || 0) + 1; break; } }
    }
    setSamples(res);
  };
  return (
    <div>
      <p className="muted">An LLM predicts a probability for every possible <b>next token</b>, then picks one. <b>Temperature</b> sharpens (low) or flattens (high) the probabilities; <b>top-p</b> keeps only the most likely words whose probabilities add up to p. (Some providers let you set these; current Claude models are tuned with an <b>effort</b> setting instead. The sampling idea is the same.)</p>
      <div className="quiz-settings">
        <label>Prompt <select value={pk} onChange={(e) => { setPk(e.target.value); setSamples({}); }}>{Object.keys(PROMPTS).map((k) => <option key={k}>{k}</option>)}</select></label>
        <label>Temperature {T.toFixed(1)} <input type="range" min="0.1" max="2" step="0.1" value={T} onChange={(e) => setT(Number(e.target.value))} /></label>
        <label>Top-p {topP.toFixed(2)} <input type="range" min="0.1" max="1" step="0.05" value={topP} onChange={(e) => setTopP(Number(e.target.value))} /></label>
      </div>
      <div className="ai-bars">
        {kept.map(([w, p, keep]) => (
          <div key={w} className={`ai-bar ${keep ? '' : 'cut'}`}>
            <span className="w">“{w}”</span>
            <div className="track"><div className="fill" style={{ width: `${(p * 100).toFixed(1)}%` }} /></div>
            <span className="p">{(p * 100).toFixed(1)}%{!keep && ' (cut by top-p)'}</span>
            {samples[w] != null && <span className="n">picked {samples[w]}×</span>}
          </div>
        ))}
      </div>
      <div className="row-btns">
        <button className="btn primary" onClick={() => sample(1)}><Dices size={14} /> Sample once</button>
        <button className="btn" onClick={() => sample(100)}>Sample 100 times</button>
      </div>
      <p className="muted small">Try temperature 0.1 (always "Paris": predictable, factual) vs 2.0 (surprising words: creative but riskier). This is why the same prompt can give different answers.</p>
    </div>
  );
}

// ---------- 3. semantic search & RAG ----------
const KB = `College timings are 9:00 AM to 4:30 PM, Monday to Saturday. The library stays open until 7 PM on weekdays.

The annual fee for the B.Sc. Computer Science course is 85,000 rupees, payable in two instalments in July and January. Late payment attracts a fine of 500 rupees per week.

Students need at least 75 percent attendance in every subject to be allowed to sit the final examinations. Medical leave must be supported by a doctor's certificate within 7 days.

The placement cell conducts aptitude training every Saturday from August. Companies like TCS, Infosys and Persistent visit the campus between October and February.

Hostel rooms are available for both boys and girls. The hostel fee is 60,000 rupees per year including mess. Apply through the student portal before 30 June.

Scholarships are available for students with more than 85 percent marks in 12th standard and for students from low-income families. Apply online with income and marks certificates.

The college has three computer labs with 60 systems each, high-speed Wi-Fi and licensed software including Visual Studio, Power BI and MySQL Workbench.`;

function RagTab() {
  const [kb, setKb] = useState(KB);
  const [q, setQ] = useState('How much attendance do I need for exams?');
  const [k, setK] = useState(2);
  const [apiKey, setKey] = useApiKey();
  const [ans, setAns] = useState('');
  const [busy, setBusy] = useState(false);
  const chunks = useMemo(() => chunkText(kb, 60), [kb]);
  const index = useMemo(() => buildIndex(chunks), [chunks]);
  const hits = index.search(q, k);
  const ragPrompt = `Answer the question using ONLY the context below. If the answer is not in the context, say "I don't know based on the college information."\n\nContext:\n${hits.map((h, i) => `[${i + 1}] ${h.text}`).join('\n')}\n\nQuestion: ${q}`;
  const ask = async () => {
    if (!apiKey) { setAns('Add your API key above to ask Claude, or copy the prompt into any chatbot.'); return; }
    setBusy(true); setAns('');
    try { await streamClaude({ apiKey, model: 'claude-opus-5-5', effort: 'low', messages: [{ role: 'user', content: ragPrompt }], onText: (d) => setAns((a) => a + d) }); } catch (e) { setAns(describeError(e)); }
    setBusy(false);
  };
  return (
    <div>
      <p className="muted"><b>RAG (Retrieval-Augmented Generation)</b> = first <b>search</b> your own documents for the most relevant chunks, then give only those chunks to the LLM so it answers from your data. Real systems use <b>embeddings</b> (vectors that capture meaning) stored in a vector database. This demo uses TF-IDF keyword vectors and cosine similarity so you can see each step.</p>
      <div className="ai-grid">
        <div>
          <h4>1. Knowledge base (split into {chunks.length} chunks)</h4>
          <textarea className="input" rows={12} value={kb} onChange={(e) => setKb(e.target.value)} />
        </div>
        <div>
          <h4>2. Question → top {k} matching chunks</h4>
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} />
          <label className="small">Chunks to retrieve (top-k): <select value={k} onChange={(e) => setK(Number(e.target.value))}>{[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}</select></label>
          {hits.map((h, i) => (
            <div key={h.i} className="ai-hit"><b>#{i + 1}</b> <span className="ai-sim">similarity {h.score.toFixed(3)}</span><p>{h.text}</p></div>
          ))}
        </div>
      </div>
      <h4>3. Prompt sent to the LLM (grounded in the retrieved chunks)</h4>
      <pre className="ai-preview">{ragPrompt}</pre>
      <ApiKeyBox apiKey={apiKey} setKey={setKey} compact />
      <button className="btn primary" disabled={busy} onClick={ask}><Send size={14} /> Ask Claude with these chunks</button>
      {ans && <div className="card ai-answer"><RichText text={ans} /></div>}
    </div>
  );
}

export default function AiConceptsLab() {
  const [tab, setTab] = useState('tokens');
  return (
    <div className="ai-page">
      <div className="page-head">
        <h1><Brain className="hicon" /> AI Concepts Lab</h1>
        <p className="muted">See how LLMs work inside: tokens and cost, next-word probabilities, and semantic search / RAG.</p>
      </div>
      <div className="tabs">
        <button className={`tab ${tab === 'tokens' ? 'active' : ''}`} onClick={() => setTab('tokens')}><Hash size={14} /> Tokens & cost</button>
        <button className={`tab ${tab === 'sampling' ? 'active' : ''}`} onClick={() => setTab('sampling')}><Dices size={14} /> Next-word prediction</button>
        <button className={`tab ${tab === 'rag' ? 'active' : ''}`} onClick={() => setTab('rag')}><Search size={14} /> Semantic search & RAG</button>
      </div>
      <div className="card">{tab === 'tokens' ? <TokenTab /> : tab === 'sampling' ? <SamplingTab /> : <RagTab />}</div>
    </div>
  );
}
