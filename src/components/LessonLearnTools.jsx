import { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, Pause, Square, Languages, Brain, CheckCircle2, Mic, MicOff, Sparkles, Copy, Lock } from 'lucide-react';
import RichText, { Inline } from './RichText.jsx';
import CodeBlock from './CodeBlock.jsx';
import AiText from './AiText.jsx';
import ApiKeyBox, { useApiKey } from '../ai/ApiKeyBox.jsx';
import { streamClaude, describeError } from '../ai/claudeClient.js';
import { keywordsOf, coverage, useDictation } from './careerUtils.js';
import { recordAnswers, logEvent } from '../study.js';

const LANGS = { en: { label: 'English', voice: ['en-IN', 'en-GB', 'en-US', 'en'] }, mr: { label: 'मराठी', name: 'Marathi', voice: ['mr-IN', 'mr', 'hi-IN'] }, hi: { label: 'हिंदी', name: 'Hindi', voice: ['hi-IN', 'hi'] } };
const pref = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const setPref = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
const plain = (s) => String(s || '').replace(/\*\*|`/g, '').replace(/^\s*[-•*]\s+/gm, '').trim();

// ---------- checkpoints: give each theory section the most related quiz question ----------
const words = (s) => new Set(String(s || '').toLowerCase().match(/[a-z][a-z0-9+#]{2,}/g) || []);
function assignCheckpoints(theory, quiz) {
  if (!quiz?.length) return {};
  const qs = quiz.map((q, i) => ({ i, w: words(`${q.question} ${q.options.join(' ')} ${q.explanation || ''}`) }));
  const secs = theory.map((s, i) => ({ i, w: words(`${s.heading} ${s.content} ${(s.points || []).join(' ')}`) }));
  const pairs = [];
  secs.forEach((s) => qs.forEach((q) => { let n = 0; q.w.forEach((x) => { if (s.w.has(x)) n++; }); pairs.push([n / Math.sqrt(q.w.size + 1), s.i, q.i]); }));
  pairs.sort((a, b) => b[0] - a[0]);
  const out = {}; const usedQ = new Set();
  pairs.forEach(([score, si, qi]) => { if (score > 0.4 && out[si] == null && !usedQ.has(qi)) { out[si] = qi; usedQ.add(qi); } });
  return out;
}

function Checkpoint({ q, onDone, done }) {
  const [sel, setSel] = useState(done ? q.answer : null);
  return (
    <div className="ll-check">
      <div className="ll-check-h"><CheckCircle2 size={16} /> Checkpoint — did you understand this section?</div>
      <div className="quiz-text"><Inline text={q.question} /></div>
      <div className="quiz-opts">{q.options.map((o, k) => {
        let cls = 'opt';
        if (sel != null && k === q.answer) cls += ' correct';
        if (sel === k && k !== q.answer) cls += ' wrong';
        return <button key={k} className={cls} disabled={sel != null} onClick={() => { setSel(k); try { recordAnswers([q], { 0: k }, { label: 'Lesson checkpoint' }); } catch { /* ignore */ } onDone(k === q.answer); }}><span className="opt-letter">{String.fromCharCode(65 + k)}</span><Inline text={o} /></button>;
      })}</div>
      {sel != null && q.explanation && <div className={`explain ${sel === q.answer ? 'ok' : 'bad'}`}>{sel === q.answer ? '✓ ' : '✗ '}<Inline text={q.explanation} /></div>}
    </div>
  );
}

// ---------- Feynman mode ----------
function Feynman({ lesson, sections, onClose }) {
  const [si, setSi] = useState(0);
  const [text, setText] = useState('');
  const [res, setRes] = useState(null);
  const [apiKey, setKey] = useApiKey();
  const [model, setModel] = useState('claude-sonnet-5-5');
  const [effort, setEffort] = useState('low');
  const [ai, setAi] = useState('');
  const [busy, setBusy] = useState(false);
  const dict = useDictation((t) => setText((x) => (x ? `${x} ${t}` : t)));
  const sec = sections[si];
  const keys = useMemo(() => keywordsOf(`${sec.heading} ${sec.content} ${(sec.points || []).join(' ')}`, 10), [sec]);
  const check = () => {
    dict.stop();
    const cov = coverage(text, keys);
    const n = (text.match(/\S+/g) || []).length;
    const score = Math.round(Math.min(100, cov.pct * 0.8 + Math.min(20, n / 4)));
    setRes({ ...cov, n, score });
    logEvent('feynman', { section: sec.heading, score });
  };
  const system = 'You are a kind teacher using the Feynman technique. The student explains a concept in their own words. Reply with: **Score: X/10**, **What you got right**, **Missing or wrong** (be specific), **A simpler way to explain it** (with an everyday analogy, 3-4 sentences). Keep it under 200 words. Reply in the same language the student used.';
  const askAi = async () => {
    setBusy(true); setAi('');
    try { await streamClaude({ apiKey, model, effort, system, messages: [{ role: 'user', content: `Lesson: ${lesson.title}\nConcept: ${sec.heading}\nReference notes: ${plain(sec.content).slice(0, 2500)}\n\nMy explanation:\n${text}` }], onText: (d) => setAi((x) => x + d) }); } catch (e) { setAi(`⚠ ${describeError(e)}`); } finally { setBusy(false); }
  };
  return (
    <div className="card ll-feynman">
      <div className="lst-head"><h3><Brain size={18} /> Feynman mode — explain it back</h3><button className="link-btn" onClick={onClose}>Close</button></div>
      <p className="muted small">If you can explain it simply, you understand it. Pick a concept, close your notes, and explain it as if teaching a friend (type or speak).</p>
      <label className="small">Concept <select value={si} onChange={(e) => { setSi(Number(e.target.value)); setRes(null); setAi(''); }}>{sections.map((s, i) => <option key={i} value={i}>{i + 1}. {s.heading}</option>)}</select></label>
      <textarea className="input" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Explain "${sec.heading}" in your own words…`} />
      {dict.interim && <div className="muted small">🎙 {dict.interim}</div>}
      <div className="row-btns">
        {dict.supported && <button className="btn" onClick={dict.listening ? dict.stop : dict.start}>{dict.listening ? <><MicOff size={15} /> Stop</> : <><Mic size={15} /> Speak</>}</button>}
        <button className="btn primary" disabled={!text.trim()} onClick={check}>Check my explanation</button>
      </div>
      {res && (
        <div className="ll-fres">
          <div className="stats"><div><b>{res.score}</b><span>Understanding score</span></div><div><b>{res.pct}%</b><span>Key ideas covered</span></div><div><b>{res.n}</b><span>Words</span></div></div>
          <p className="small">{res.hit.map((k) => <span key={k} className="jc-kw ok">✓ {k}</span>)}{res.miss.map((k) => <span key={k} className="jc-kw bad">✗ {k}</span>)}</p>
          <p className="muted small">Missed ideas? Re-read the section, then explain again without looking.</p>
          <ApiKeyBox apiKey={apiKey} setKey={setKey} model={model} setModel={setModel} effort={effort} setEffort={setEffort} compact />
          <button className="btn" disabled={!apiKey || busy} onClick={askAi}><Sparkles size={15} /> {busy ? 'Reading…' : 'Get feedback from Claude'}</button>
          {ai && <div className="ai-answer"><AiText text={ai} /></div>}
        </div>
      )}
    </div>
  );
}

// ---------- the theory view ----------
export default function TheoryView({ lesson, lessonKey }) {
  const [lang, setLang] = useState(() => pref('upskillr-lesson-lang', 'en'));
  const [trCache, setTrCache] = useState({});
  const [trBusy, setTrBusy] = useState(false);
  const [trErr, setTrErr] = useState('');
  const [apiKey, setKey] = useApiKey();
  const [showKey, setShowKey] = useState(false);
  const [gate, setGate] = useState(() => pref('upskillr-checkpoints', true));
  const [passed, setPassed] = useState({});
  const [reveal, setReveal] = useState(false);
  const [feyn, setFeyn] = useState(false);
  const [reading, setReading] = useState(null); // section index
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(() => pref('upskillr-tts-rate', 1));
  const speakRef = useRef({ stop: false });
  const theory = lesson.theory || [];
  const cpMap = useMemo(() => assignCheckpoints(theory, lesson.quiz), [lessonKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const cacheKey = `upskillr-tr:${lang}:${lessonKey}`;
  const translated = lang === 'en' ? null : (trCache[cacheKey] || pref(cacheKey, null));
  const sections = translated && translated.length === theory.length ? theory.map((s, i) => ({ ...s, ...translated[i], syntax: s.syntax })) : theory;

  useEffect(() => { setPassed({}); setReveal(false); stopSpeak(); }, [lessonKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopSpeak(), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setPref('upskillr-lesson-lang', lang), [lang]);

  // ----- translation -----
  const translate = async (target) => {
    if (pref(`upskillr-tr:${target}:${lessonKey}`, null)) return;
    if (!apiKey) { setShowKey(true); return; }
    setTrBusy(true); setTrErr('');
    const payload = theory.map((s) => ({ heading: s.heading, content: s.content, points: s.points || [], tip: s.tip || '' }));
    try {
      const { text } = await streamClaude({
        apiKey, model: 'claude-sonnet-5-5', effort: 'low',
        system: `Translate study material for Indian students into ${LANGS[target].name} (Devanagari script). Keep ALL technical terms, keywords, code, class/function names and **bold** / \`code\` markers in English exactly as they are. Keep the meaning simple and natural, not word-for-word. Return ONLY a JSON array with the same length and keys as the input: [{"heading","content","points","tip"}]. No commentary.`,
        messages: [{ role: 'user', content: JSON.stringify(payload) }],
      });
      const json = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
      if (!Array.isArray(json) || json.length !== theory.length) throw new Error('The translation came back incomplete. Try again.');
      const k = `upskillr-tr:${target}:${lessonKey}`;
      setPref(k, json);
      setTrCache((c) => ({ ...c, [k]: json }));
    } catch (e) { setTrErr(e instanceof SyntaxError ? 'Could not read the translation. Try again.' : describeError(e)); setLang('en'); } finally { setTrBusy(false); }
  };
  const chooseLang = (l) => { setLang(l); if (l !== 'en') translate(l); };
  const copyPrompt = async () => { try { await navigator.clipboard.writeText(`Translate this lesson into ${LANGS[lang === 'en' ? 'mr' : lang].name}, keeping technical terms in English:\n\n${theory.map((s) => `## ${s.heading}\n${s.content}\n${(s.points || []).map((p) => `- ${p}`).join('\n')}`).join('\n\n')}`); } catch { /* ignore */ } };

  // ----- text to speech -----
  const tts = typeof window !== 'undefined' && 'speechSynthesis' in window;
  function stopSpeak() { speakRef.current.stop = true; try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } setReading(null); setPaused(false); }
  const voiceFor = () => {
    const vs = window.speechSynthesis.getVoices();
    for (const code of LANGS[lang].voice) { const v = vs.find((x) => x.lang?.toLowerCase().startsWith(code.toLowerCase())); if (v) return v; }
    return null;
  };
  const speakFrom = (start = 0) => {
    stopSpeak();
    speakRef.current = { stop: false };
    const run = async () => {
      for (let i = start; i < sections.length && !speakRef.current.stop; i++) {
        setReading(i);
        document.getElementById(`sec-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const s = sections[i];
        const text = [s.heading, plain(s.content), ...(s.points || []).map(plain), s.tip ? plain(s.tip) : ''].filter(Boolean).join('. ');
        const chunks = text.match(/[^.!?।]+[.!?।]*/g) || [text];
        for (const c of chunks) {
          if (speakRef.current.stop) break;
          // eslint-disable-next-line no-await-in-loop
          await new Promise((res) => {
            const u = new SpeechSynthesisUtterance(c.trim());
            const v = voiceFor(); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = LANGS[lang].voice[0];
            u.rate = rate; u.onend = res; u.onerror = res;
            window.speechSynthesis.speak(u);
          });
        }
      }
      if (!speakRef.current.stop) setReading(null);
    };
    run();
  };
  const togglePause = () => { if (paused) { window.speechSynthesis.resume(); setPaused(false); } else { window.speechSynthesis.pause(); setPaused(true); } };

  // which sections are locked by an unanswered checkpoint above them
  let lockedFrom = null;
  if (gate && !reveal) for (let i = 0; i < sections.length; i++) { if (cpMap[i] != null && !passed[i]) { lockedFrom = i + 1; break; } }

  return (
    <div>
      <div className="ll-bar">
        {tts && (reading == null
          ? <button className="btn small" onClick={() => speakFrom(0)}><Volume2 size={15} /> Listen</button>
          : <><button className="btn small" onClick={togglePause}>{paused ? <Volume2 size={15} /> : <Pause size={15} />} {paused ? 'Resume' : 'Pause'}</button><button className="btn small" onClick={stopSpeak}><Square size={14} /> Stop</button></>)}
        {tts && <label className="ll-rate small">Speed <select value={rate} onChange={(e) => { const v = Number(e.target.value); setRate(v); setPref('upskillr-tts-rate', v); }}>{[0.75, 0.9, 1, 1.15, 1.3, 1.5].map((r) => <option key={r} value={r}>{r}×</option>)}</select></label>}
        <span className="ll-sep" />
        <Languages size={16} />
        {Object.entries(LANGS).map(([k, l]) => <button key={k} className={`chip ${lang === k ? 'active' : ''}`} disabled={trBusy} onClick={() => chooseLang(k)}>{l.label}</button>)}
        {trBusy && <span className="muted small">Translating…</span>}
        <span className="ll-sep" />
        <button className={`btn small ${feyn ? 'primary' : ''}`} onClick={() => setFeyn(!feyn)}><Brain size={15} /> Explain it back</button>
        <label className="check small" title="Answer a quick question after each section before moving on"><input type="checkbox" checked={gate} onChange={(e) => { setGate(e.target.checked); setPref('upskillr-checkpoints', e.target.checked); }} /> Checkpoints</label>
      </div>
      {trErr && <div className="explain bad">{trErr}</div>}
      {showKey && !apiKey && (
        <div className="card ll-key">
          <p className="small"><b>Marathi / Hindi mode uses Claude to translate this lesson once</b> (then it is saved for next time). Add your own API key, or copy the lesson into any chatbot.</p>
          <ApiKeyBox apiKey={apiKey} setKey={(k) => { setKey(k); if (k) { setShowKey(false); } }} compact />
          <button className="btn small" onClick={copyPrompt}><Copy size={14} /> Copy translate prompt</button>
        </div>
      )}
      {feyn && <Feynman lesson={lesson} sections={sections} onClose={() => setFeyn(false)} />}

      <div className="card toc">
        <b>Contents:</b>{' '}
        {sections.map((s, i) => <a key={i} href={`#sec-${i}`} onClick={(e) => { e.preventDefault(); document.getElementById(`sec-${i}`)?.scrollIntoView({ behavior: 'smooth' }); }}>{i + 1}. {s.heading}</a>)}
      </div>
      {sections.map((s, i) => {
        const locked = lockedFrom != null && i >= lockedFrom;
        return (
          <div key={i}>
            {locked && i === lockedFrom && (
              <div className="ll-gate"><Lock size={16} /> Answer the checkpoint above to continue. <button className="link-btn" onClick={() => setReveal(true)}>Show all sections anyway</button></div>
            )}
            <section id={`sec-${i}`} className={`card theory ${reading === i ? 'll-reading' : ''} ${locked ? 'll-locked' : ''}`} aria-hidden={locked || undefined} lang={lang === 'en' ? 'en' : lang}>
              <h2>{i + 1}. {s.heading} {tts && <button className="ll-say" title="Listen from here" onClick={() => speakFrom(i)}><Volume2 size={15} /></button>}</h2>
              <RichText text={s.content} />
              {s.syntax && <CodeBlock code={s.syntax} label="Syntax" />}
              {s.points?.length > 0 && <ul className="points">{s.points.map((pt, j) => <li key={j}><Inline text={pt} /></li>)}</ul>}
              {s.tip && <div className="tip">💡 <Inline text={s.tip} /></div>}
              {gate && cpMap[i] != null && <Checkpoint key={`${lessonKey}-${i}`} q={lesson.quiz[cpMap[i]]} done={!!passed[i]} onDone={() => setPassed((p) => ({ ...p, [i]: true }))} />}
            </section>
          </div>
        );
      })}
    </div>
  );
}
