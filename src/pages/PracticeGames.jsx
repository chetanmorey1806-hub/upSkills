import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Sparkles, Copy, ArrowUp, ArrowDown, CheckCircle2, XCircle, RotateCcw, Swords, Bot, Trophy, Timer } from 'lucide-react';
import { tracks, trackOrder } from '../data/index.js';
import CodeBlock from '../components/CodeBlock.jsx';
import AiText from '../components/AiText.jsx';
import { Inline } from '../components/RichText.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import ApiKeyBox, { useApiKey } from '../ai/ApiKeyBox.jsx';
import { streamClaude, describeError, stopNote } from '../ai/claudeClient.js';
import { useStudy, logEvent, recordAnswers, hashText } from '../study.js';
import { APTITUDE } from '../data/aptitude.js';
import { runPython } from '../components/pyodideRunner.js';

import Ico from '../components/Ico.jsx';
// Runs a student's arranged program to accept other valid orders (e.g. two independent lines swapped).
function runJs(code) {
  return new Promise((resolve) => {
    const src = `let out=[];const log=(...a)=>out.push(a.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(' '));console.log=log;console.info=log;
onmessage=async(e)=>{try{await (0,eval)(e.data);await new Promise(r=>setTimeout(r,60));postMessage({out:out.join('\\n')})}catch(err){postMessage({out:out.join('\\n'),err:String(err)})}}`;
    const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
    const w = new Worker(url);
    const done = (r) => { clearTimeout(t); w.terminate(); URL.revokeObjectURL(url); resolve(r); };
    const t = setTimeout(() => done({ out: '', err: 'timeout' }), 3000);
    w.onmessage = (e) => done(e.data);
    w.onerror = () => done({ out: '', err: 'error' });
    w.postMessage(code);
  });
}
async function runPy(code) {
  let out = '';
  let err = '';
  await runPython({ files: { 'main.py': code } }, (m) => { if (m.type === 'out') out += m.text; if (m.type === 'err') err += m.text; }, 8000);
  return { out, err };
}
const norm = (x) => String(x || '').replace(/\r/g, '').trim();

const pick = (mods, name) => { for (const m of Object.values(mods)) if (m[name]) return m[name]; return []; };
const ERRORS = pick(import.meta.glob('../data/errorDictionary.js', { eager: true }), 'ERRORS');
const PUZZLES = pick(import.meta.glob('../data/codePuzzles.js', { eager: true }), 'PUZZLES');

const seededShuffle = (arr, seedStr) => {
  let seed = parseInt(hashText(seedStr), 36) || 1;
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; const j = seed % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/* ============================== Explain my Error ============================== */
function matchErrors(text) {
  const t = String(text || '');
  if (!t.trim()) return [];
  return ERRORS.map((e) => {
    let score = 0;
    e.patterns.forEach((p) => { try { const m = t.match(new RegExp(p, 'i')); if (m) score += 10 + Math.min(m[0].length, 60); } catch { /* bad pattern */ } });
    return { e, score };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 3).map((x) => x.e);
}
const lineHints = (t) => [...new Set((String(t).match(/(?:line\s+\d+|\b[\w-]+\.(?:java|py|js|jsx|ts|cs|sql|html|css):\d+(?::\d+)?)/gi) || []).slice(0, 4))];

function ErrorCard({ e, lang }) {
  return (
    <div className="card ee-card">
      <div className="meta"><span className="badge">{e.lang}</span></div>
      <h2>{e.title}</h2>
      <div className="ee-mean"><b>{lang === 'mr' ? 'याचा अर्थ:' : 'What it means:'}</b> {e.meaning[lang] || e.meaning.en}</div>
      <div className="grid2">
        <div><h4><Ico e="🔎" /> Common causes</h4><ul>{e.causes.map((c, i) => <li key={i}><Inline text={c} /></li>)}</ul></div>
        <div><h4><Ico e="🛠" /> How to fix</h4><ol>{e.fixes.map((c, i) => <li key={i}><Inline text={c} /></li>)}</ol></div>
      </div>
      <div className="grid2">
        <CodeBlock code={e.example.bad} label="Causes the error" />
        <CodeBlock code={e.example.good} label="Fixed" />
      </div>
      <div className="tip"><Ico e="💡" /> <Inline text={e.tip} /></div>
    </div>
  );
}

export function ExplainError() {
  const [params] = useSearchParams();
  const [err, setErr] = useState(() => params.get('q') || '');
  const [code, setCode] = useState('');
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('upskillr-err-lang') || 'en'; } catch { return 'en'; } });
  const [browse, setBrowse] = useState('');
  const [blang, setBlang] = useState('All');
  const [apiKey, setKey] = useApiKey();
  const [model, setModel] = useState('claude-sonnet-5-5');
  const [effort, setEffort] = useState('low');
  const [ai, setAi] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const ctrl = useRef(null);
  useEffect(() => { try { localStorage.setItem('upskillr-err-lang', lang); } catch { /* ignore */ } }, [lang]);
  useEffect(() => () => ctrl.current?.abort(), []);
  const matches = useMemo(() => matchErrors(err), [err]);
  const hints = lineHints(err);
  const langs = ['All', ...new Set(ERRORS.map((e) => e.lang))];
  const list = ERRORS.filter((e) => (blang === 'All' || e.lang === blang) && (!browse || `${e.title} ${e.meaning.en} ${e.patterns.join(' ')}`.toLowerCase().includes(browse.toLowerCase())));
  const system = `You are a patient programming teacher for Indian students. Explain the error ${lang === 'mr' ? 'in Marathi (Devanagari) keeping technical words in English' : 'in simple English'}: 1) what it means in one line, 2) the exact cause in their code (point to the line), 3) the fixed code in a fenced block, 4) one tip to avoid it next time. Be short.`;
  const user = `Error message:\n${err.trim()}\n\n${code.trim() ? `My code:\n\`\`\`\n${code.trim()}\n\`\`\`` : '(no code given)'}`;
  const askAi = async () => {
    ctrl.current?.abort(); ctrl.current = new AbortController();
    setBusy(true); setAi('');
    try { const { message } = await streamClaude({ apiKey, model, effort, system, messages: [{ role: 'user', content: user }], onText: (d) => setAi((x) => x + d), signal: ctrl.current.signal }); const n = stopNote(message); if (n) setAi((x) => `${x}\n\n_${n}_`); } catch (e) { setAi(`${describeError(e)}`); } finally { setBusy(false); }
  };
  return (
    <div>
      <div className="page-head">
        <h1><Ico e="🩺" /> Explain my Error</h1>
        <p className="muted">Paste any error message from Java, Python, JavaScript, React, Node, SQL, C#, Git or npm. You get the meaning, the usual causes and the fix — works offline for {ERRORS.length} common errors, and Claude can explain anything else.</p>
      </div>
      <div className="card jc-form">
        <div className="db-card-head"><h3>Paste the error</h3><div className="chips"><button className={`chip ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>English</button><button className={`chip ${lang === 'mr' ? 'active' : ''}`} onClick={() => setLang('mr')}>मराठी</button></div></div>
        <textarea className="input mono" rows={5} value={err} onChange={(e) => setErr(e.target.value)} placeholder={'e.g. Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.length()" because "name" is null\n    at Main.main(Main.java:5)'} />
        {hints.length > 0 && <p className="small"><Ico e="📍" /> Look at: {hints.map((h) => <code key={h} className="ic">{h}</code>)} — that is where the error happened.</p>}
      </div>
      {err.trim() && matches.length === 0 && <div className="card info">This error is not in the offline list yet. Ask Claude below (add your code for a precise answer).</div>}
      {matches.map((e) => <ErrorCard key={e.id} e={e} lang={lang} />)}
      {err.trim() && (
        <div className="card jc-form">
          <h3><Sparkles size={17} /> Ask AI about this error (optional)</h3>
          <label>Your code (helps the AI point to the exact line)<textarea className="input mono" rows={6} value={code} onChange={(e) => setCode(e.target.value)} /></label>
          <ApiKeyBox apiKey={apiKey} setKey={setKey} model={model} setModel={setModel} effort={effort} setEffort={setEffort} compact />
          <div className="row-btns">
            <button className="btn primary" disabled={!apiKey || busy} onClick={askAi}><Sparkles size={15} /> {busy ? 'Explaining…' : 'Explain with Claude'}</button>
            <button className="btn" onClick={async () => { try { await navigator.clipboard.writeText(`${system}\n\n${user}`); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ } }}><Copy size={15} /> {copied ? 'Copied ✓' : 'Copy prompt'}</button>
          </div>
          {ai && <div className="ai-answer"><AiText text={ai} /></div>}
        </div>
      )}
      <h2 className="section-title">Browse common errors</h2>
      <div className="quiz-settings">
        <div className="sp-search"><Search size={16} /><input className="input" placeholder="Search errors…" value={browse} onChange={(e) => setBrowse(e.target.value)} /></div>
        <label>Language <select value={blang} onChange={(e) => setBlang(e.target.value)}>{langs.map((l) => <option key={l}>{l}</option>)}</select></label>
      </div>
      {list.map((e) => (
        <details key={e.id} className="card qa"><summary><span className="qa-q">{e.title}</span><span className="badge">{e.lang}</span></summary><div className="qa-a"><ErrorCard e={e} lang={lang} /></div></details>
      ))}
      {!ERRORS.length && <p className="muted">The error list is being added.</p>}
    </div>
  );
}

/* ============================== Code Puzzles ============================== */
const LANG_LABEL = { python: 'Python', javascript: 'JavaScript', java: 'Java', sql: 'SQL' };
const TYPE_LABEL = { parsons: 'Arrange the lines', output: 'Predict the output', bug: 'Find the bug' };

function Parsons({ p, onResult }) {
  const start = useMemo(() => {
    let s = seededShuffle(p.lines.map((l, i) => ({ l, i })), p.id);
    if (s.every((x, k) => x.i === k)) s = [...s.slice(1), s[0]];
    return s;
  }, [p.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [order, setOrder] = useState(start);
  const [checked, setChecked] = useState(null);
  const drag = useRef(null);
  const move = (from, to) => { if (to < 0 || to >= order.length) return; const o = [...order]; const [x] = o.splice(from, 1); o.splice(to, 0, x); setOrder(o); setChecked(null); };
  const [running, setRunning] = useState(false);
  const check = async () => {
    let ok = order.every((x, k) => x.l === p.lines[k]);
    if (!ok && (p.lang === 'javascript' || p.lang === 'python') && p.output != null) {
      setRunning(true);
      try {
        const code = order.map((x) => x.l).join('\n');
        const r = p.lang === 'javascript' ? await runJs(code) : await runPy(code);
        ok = !r.err && norm(r.out) === norm(p.output);
      } catch { /* keep false */ }
      setRunning(false);
    }
    setChecked(ok); onResult(ok);
  };
  return (
    <div>
      <ul className="pz-lines">
        {order.map((x, k) => (
          <li key={x.i} draggable onDragStart={() => { drag.current = k; }} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag.current != null) move(drag.current, k); drag.current = null; }}
            className={checked != null ? (x.l === p.lines[k] ? 'ok' : 'bad') : ''}>
            <span className="pz-grip">⋮⋮</span><code>{x.l}</code>
            <span className="pz-mv"><button onClick={() => move(k, k - 1)} aria-label="Move up"><ArrowUp size={14} /></button><button onClick={() => move(k, k + 1)} aria-label="Move down"><ArrowDown size={14} /></button></span>
          </li>
        ))}
      </ul>
      <div className="row-btns"><button className="btn primary" onClick={check} disabled={running}>{running ? 'Running your code…' : 'Check order'}</button><button className="btn" onClick={() => { setOrder(start); setChecked(null); }}><RotateCcw size={14} /> Reset</button></div>
      {checked != null && <div className={`explain ${checked ? 'ok' : 'bad'}`}>{checked ? `✓ Correct! Output: ${p.output}` : '✗ Not yet — green lines match the model order (other orders are accepted if they give the same output).'} {checked && <Inline text={p.explanation} />}</div>}
    </div>
  );
}
function OutputQ({ p, onResult }) {
  const [sel, setSel] = useState(null);
  return (
    <div>
      <CodeBlock code={p.code} label={LANG_LABEL[p.lang]} />
      <div className="quiz-opts">{p.options.map((o, k) => {
        let cls = 'opt';
        if (sel != null && k === p.answer) cls += ' correct';
        if (sel === k && k !== p.answer) cls += ' wrong';
        return <button key={k} className={cls} disabled={sel != null} onClick={() => { setSel(k); onResult(k === p.answer); }}><span className="opt-letter">{String.fromCharCode(65 + k)}</span><pre className="pz-opt">{o}</pre></button>;
      })}</div>
      {sel != null && <div className={`explain ${sel === p.answer ? 'ok' : 'bad'}`}>{sel === p.answer ? '✓ Correct! ' : '✗ Not quite. '}<Inline text={p.explanation} /></div>}
    </div>
  );
}
function BugQ({ p, onResult }) {
  const [sel, setSel] = useState(null);
  const lines = p.code.split('\n');
  return (
    <div>
      <p className="muted small">Click the line that has the bug.</p>
      <pre className="pz-bug">{lines.map((l, k) => (
        <div key={k} className={`pz-bl ${sel != null && k === p.bugLine ? 'ok' : ''} ${sel === k && k !== p.bugLine ? 'bad' : ''}`} onClick={() => { if (sel == null) { setSel(k); onResult(k === p.bugLine); } }}><span className="cv-ln">{k + 1}</span>{l || ' '}</div>
      ))}</pre>
      {sel != null && (
        <div className={`explain ${sel === p.bugLine ? 'ok' : 'bad'}`}>
          {sel === p.bugLine ? '✓ You found it! ' : `✗ The bug is on line ${p.bugLine + 1}. `}<Inline text={p.explanation} />
          <CodeBlock code={`- ${lines[p.bugLine]}\n+ ${p.fix}`} label="Fix" />
          {p.expected && <div className="small">Output after the fix: <code className="ic">{p.expected}</code></div>}
        </div>
      )}
    </div>
  );
}

export function CodePuzzles() {
  const [done, setDone] = useStudy('upskillr-study-puzzles', {});
  const [type, setType] = useState('All');
  const [lang, setLang] = useState('All');
  const [level, setLevel] = useState('All');
  const [cur, setCur] = useState(null);
  const list = PUZZLES.filter((p) => (type === 'All' || p.type === type) && (lang === 'All' || p.lang === lang) && (level === 'All' || p.level === level));
  const solved = PUZZLES.filter((p) => done[p.id]?.solved).length;
  const result = (p, ok) => {
    setDone((d) => ({ ...d, [p.id]: { solved: d[p.id]?.solved || ok, tries: (d[p.id]?.tries || 0) + 1 } }));
    if (ok && !done[p.id]?.solved) logEvent('puzzle', { id: p.id });
  };
  if (cur) {
    const idx = list.findIndex((x) => x.id === cur.id);
    const next = list.slice(idx + 1).find((x) => !done[x.id]?.solved) || list[idx + 1];
    return (
      <div>
        <div className="row-btns"><button className="btn" onClick={() => setCur(null)}>← All puzzles</button>{next && <button className="btn primary" onClick={() => setCur(next)}>Next puzzle →</button>}</div>
        <div className="card">
          <div className="meta"><span className="badge">{TYPE_LABEL[cur.type]}</span><span className={`lvl lvl-${cur.level}`}>{cur.level}</span><span>{LANG_LABEL[cur.lang]}</span><span>{cur.topic}</span>{done[cur.id]?.solved && <span className="badge ok">✓ Solved</span>}</div>
          <h2>{cur.title}</h2>
          {cur.prompt && <p>{cur.prompt}</p>}
          {cur.type === 'parsons' && <Parsons key={cur.id} p={cur} onResult={(ok) => result(cur, ok)} />}
          {cur.type === 'output' && <OutputQ key={cur.id} p={cur} onResult={(ok) => result(cur, ok)} />}
          {cur.type === 'bug' && <BugQ key={cur.id} p={cur} onResult={(ok) => result(cur, ok)} />}
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="page-head">
        <h1><Ico e="🧩" /> Code Puzzles</h1>
        <p className="muted">Three quick games that build real coding skill: arrange jumbled lines, predict the output, and spot the bug. {solved}/{PUZZLES.length} solved · 5 XP each.</p>
        <ProgressBar value={PUZZLES.length ? solved / PUZZLES.length : 0} />
      </div>
      <div className="quiz-settings">
        <label>Game <select value={type} onChange={(e) => setType(e.target.value)}><option value="All">All</option>{Object.entries(TYPE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        <label>Language <select value={lang} onChange={(e) => setLang(e.target.value)}><option>All</option>{Object.entries(LANG_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        <label>Level <select value={level} onChange={(e) => setLevel(e.target.value)}>{['All', 'Easy', 'Medium', 'Hard'].map((l) => <option key={l}>{l}</option>)}</select></label>
        {list.length > 0 && <button className="btn primary" onClick={() => setCur(list.find((x) => !done[x.id]?.solved) || list[0])}>▶ Start</button>}
      </div>
      <div className="grid3" style={{ marginTop: '1rem' }}>
        {list.map((p) => (
          <button key={p.id} className={`card jc-prob ${done[p.id]?.solved ? 'is-done' : ''}`} onClick={() => setCur(p)}>
            <div className="meta"><span>{TYPE_LABEL[p.type].split(' ')[0]}</span><span className={`lvl lvl-${p.level}`}>{p.level}</span><span>{LANG_LABEL[p.lang]}</span>{done[p.id]?.solved && <span className="jc-solved">✓</span>}</div>
            <h4>{p.title}</h4>
          </button>
        ))}
      </div>
      {!PUZZLES.length && <p className="muted">Puzzles are being added.</p>}
    </div>
  );
}

/* ============================== Quiz Battle vs Bot ============================== */
const BOTS = { easy: { name: 'Rookie Bot', acc: 0.5, min: 7, max: 13 }, medium: { name: 'Pro Bot', acc: 0.72, min: 5, max: 11 }, hard: { name: 'Master Bot', acc: 0.9, min: 3, max: 8 } };
const Q_TIME = 15;
const ROUNDS = 10;

export function QuizBattle() {
  const [src, setSrc] = useState('mixed');
  const [lvl, setLvl] = useState('medium');
  const [game, setGame] = useState(null);
  const [left, setLeft] = useState(Q_TIME);
  const [stats, setStats] = useStudy('upskillr-study-battles', { played: 0, won: 0, best: 0 });
  const tick = useRef(null);
  const courses = trackOrder.filter((k) => tracks[k]?.topics?.some((t) => t.quiz?.length));
  const pool = () => {
    if (src === 'aptitude') return APTITUDE.flatMap((t) => t.questions.map((q) => ({ question: q.q, options: q.options, answer: q.answer, explanation: q.explanation, source: `Aptitude · ${t.title}` })));
    const ks = src === 'mixed' ? courses : [src];
    return ks.flatMap((k) => tracks[k].topics.flatMap((t) => (t.quiz || []).map((q) => ({ ...q, source: `${tracks[k].short} · ${t.title}` }))));
  };
  const start = () => {
    const qs = shuffle(pool()).slice(0, ROUNDS);
    if (!qs.length) return;
    const b = BOTS[lvl];
    setGame({ qs, i: 0, me: 0, bot: 0, mine: {}, phase: 'q', botAt: b.min + Math.random() * (b.max - b.min), botPick: null, myPick: null, myTime: null });
    setLeft(Q_TIME);
  };
  // countdown + bot answering
  useEffect(() => {
    if (!game || game.phase !== 'q') return undefined;
    tick.current = setTimeout(() => {
      setLeft((l) => Math.max(0, +(l - 0.25).toFixed(2)));
      setGame((g) => {
        if (!g || g.phase !== 'q') return g;
        const elapsed = Q_TIME - left + 0.25;
        let n = g;
        if (g.botPick == null && elapsed >= g.botAt) {
          const q = g.qs[g.i]; const right = Math.random() < BOTS[lvl].acc;
          const wrong = [0, 1, 2, 3].filter((x) => x !== q.answer);
          n = { ...n, botPick: right ? q.answer : wrong[Math.floor(Math.random() * 3)], botTime: elapsed };
        }
        if ((n.myPick != null && n.botPick != null) || elapsed >= Q_TIME) return { ...n, phase: 'reveal' };
        return n;
      });
    }, 250);
    return () => clearTimeout(tick.current);
  }, [game, left, lvl]);
  // scoring on reveal
  useEffect(() => {
    if (!game || game.phase !== 'reveal' || game.scored) return;
    const q = game.qs[game.i];
    const pts = (pickIdx, t) => (pickIdx === q.answer ? 10 + Math.max(0, Math.round(Q_TIME - (t ?? Q_TIME))) : 0);
    setGame((g) => ({ ...g, scored: true, me: g.me + pts(g.myPick, g.myTime), bot: g.bot + pts(g.botPick, g.botTime) }));
  }, [game]);
  const answer = (k) => { if (!game || game.phase !== 'q' || game.myPick != null) return; setGame((g) => ({ ...g, myPick: k, myTime: Q_TIME - left, mine: { ...g.mine, [g.i]: k } })); };
  const next = () => {
    if (game.i + 1 >= game.qs.length) {
      const won = game.me > game.bot;
      setStats((s) => ({ played: (s.played || 0) + 1, won: (s.won || 0) + (won ? 1 : 0), best: Math.max(s.best || 0, game.me) }));
      try { recordAnswers(game.qs, game.mine, { label: 'Quiz Battle', kind: 'quiz' }); } catch { /* ignore */ }
      logEvent('battle', { won, score: game.me });
      setGame((g) => ({ ...g, phase: 'end' }));
      return;
    }
    const b = BOTS[lvl];
    setGame((g) => ({ ...g, i: g.i + 1, phase: 'q', scored: false, botAt: b.min + Math.random() * (b.max - b.min), botPick: null, myPick: null, myTime: null, botTime: null }));
    setLeft(Q_TIME);
  };

  if (!game) {
    return (
      <div>
        <div className="page-head">
          <h1><Ico e="⚔" /> Quiz Battle vs Bot</h1>
          <p className="muted">{ROUNDS} questions, {Q_TIME} seconds each. Answer correctly and fast: 10 points + bonus for every second left. Beat the bot to win XP!</p>
        </div>
        <div className="card qb-setup">
          <label>Questions from <select value={src} onChange={(e) => setSrc(e.target.value)}><option value="mixed">All courses (mixed)</option>{APTITUDE.length > 0 && <option value="aptitude">Aptitude & Reasoning</option>}{courses.map((k) => <option key={k} value={k}>{tracks[k].name}</option>)}</select></label>
          <div className="chips">{Object.entries(BOTS).map(([k, b]) => <button key={k} className={`chip ${lvl === k ? 'active' : ''}`} onClick={() => setLvl(k)}><Bot size={14} /> {b.name}</button>)}</div>
          <button className="btn primary qb-go" onClick={start}><Swords size={18} /> Start battle</button>
          <div className="stats"><div><b>{stats.played || 0}</b><span>Battles</span></div><div><b>{stats.won || 0}</b><span>Wins</span></div><div><b>{stats.best || 0}</b><span>Best score</span></div></div>
        </div>
      </div>
    );
  }
  const q = game.qs[Math.min(game.i, game.qs.length - 1)];
  if (game.phase === 'end') {
    const won = game.me > game.bot; const tie = game.me === game.bot;
    return (
      <div className="card center qb-end">
        <div className="qb-trophy">{won ? <><Ico e="🏆" /></> : tie ? <><Ico e="🤝" /></> : <><Ico e="🤖" /></>}</div>
        <h2>{won ? 'You win!' : tie ? "It's a tie!" : `${BOTS[lvl].name} wins this time`}</h2>
        <p className="qb-final"><b>{game.me}</b> vs <b>{game.bot}</b></p>
        <p className="muted">Wrong answers were added to your Mistake Notebook.</p>
        <div className="row-btns center"><button className="btn primary" onClick={start}><RotateCcw size={15} /> Play again</button><button className="btn" onClick={() => setGame(null)}>Change settings</button><Link className="btn" to="/study/mistakes">Mistake Notebook</Link></div>
      </div>
    );
  }
  const reveal = game.phase === 'reveal';
  return (
    <div className="qb">
      <div className="qb-score">
        <div className="qb-p you"><span className="qb-ava"><Ico e="🧑‍🎓" /></span><b>{game.me}</b><span>You{game.myPick != null && !reveal ? ' ✓' : ''}</span></div>
        <div className="qb-mid"><span>Q {game.i + 1}/{game.qs.length}</span><div className={`qb-timer ${left < 5 ? 'low' : ''}`}><Timer size={14} /> {Math.ceil(left)}s</div></div>
        <div className="qb-p bot"><span className="qb-ava"><Ico e="🤖" /></span><b>{game.bot}</b><span>{BOTS[lvl].name}{game.botPick != null && !reveal ? ' ✓' : ''}</span></div>
      </div>
      <div className="ft-bar"><i style={{ width: `${(left / Q_TIME) * 100}%` }} /></div>
      <div className="card">
        <div className="muted small">{q.source}</div>
        <h3><Inline text={q.question} /></h3>
        <div className="quiz-opts">{q.options.map((o, k) => {
          let cls = 'opt';
          if (game.myPick === k) cls += ' picked';
          if (reveal && k === q.answer) cls += ' correct';
          if (reveal && game.myPick === k && k !== q.answer) cls += ' wrong';
          return <button key={k} className={cls} disabled={game.myPick != null || reveal} onClick={() => answer(k)}><span className="opt-letter">{String.fromCharCode(65 + k)}</span><Inline text={o} />{reveal && game.botPick === k && <span className="qb-botpick"><Ico e="🤖" /></span>}</button>;
        })}</div>
        {reveal && (
          <>
            <div className={`explain ${game.myPick === q.answer ? 'ok' : 'bad'}`}>{game.myPick === q.answer ? <><CheckCircle2 size={15} /> Correct! </> : game.myPick == null ? <><Ico e="⏰" /> Time's up. </> : <><XCircle size={15} /> Wrong. </>}{q.explanation && <Inline text={q.explanation} />}</div>
            <button className="btn primary" onClick={next}>{game.i + 1 >= game.qs.length ? <><Trophy size={15} /> See result</> : 'Next question →'}</button>
          </>
        )}
      </div>
    </div>
  );
}
