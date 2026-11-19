import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supaMode } from '../supabase.js';
import { Highlighter, NotebookPen, HelpCircle, Trash2, Copy, Sparkles, X } from 'lucide-react';
import { useStudy, saveNote, addHighlight } from '../study.js';
import AiText from './AiText.jsx';
import ApiKeyBox, { useApiKey } from '../ai/ApiKeyBox.jsx';
import { streamClaude, describeError, stopNote } from '../ai/claudeClient.js';

import Ico from './Ico.jsx';
const HL_NAME = 'upskillr-notes';
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Paint saved highlights with the CSS Custom Highlight API (no DOM changes, so React is unaffected).
function paintHighlights(root, texts) {
  if (typeof CSS === 'undefined' || !CSS.highlights || typeof Highlight === 'undefined') return false;
  CSS.highlights.delete(HL_NAME);
  if (!root || !texts.length) return true;
  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement?.closest('textarea, input, .lst-panel, .lst-pop, button') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  let all = '';
  for (let n = walker.nextNode(); n; n = walker.nextNode()) { nodes.push([n, all.length]); all += n.data; }
  const locate = (pos) => {
    let lo = 0; let hi = nodes.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (nodes[mid][1] <= pos) lo = mid; else hi = mid - 1; }
    return [nodes[lo][0], pos - nodes[lo][1]];
  };
  const ranges = [];
  texts.forEach((t) => {
    const words = t.split(/\s+/).filter(Boolean).map(escRe);
    if (!words.length) return;
    const re = new RegExp(words.join('\\s+'), 'g');
    let m;
    let guard = 0;
    while ((m = re.exec(all)) && guard++ < 20) {
      try {
        const r = new Range();
        const [sn, so] = locate(m.index);
        const [en, eo] = locate(m.index + m[0].length - 1);
        r.setStart(sn, so); r.setEnd(en, eo + 1);
        ranges.push(r);
      } catch { /* ignore */ }
    }
  });
  if (ranges.length) CSS.highlights.set(HL_NAME, new Highlight(...ranges));
  return true;
}

const LANGS = [['English', 'simple English'], ['Marathi', 'Marathi (मराठी, Devanagari script) with technical terms kept in English'], ['Hindi', 'Hindi (हिंदी) with technical terms kept in English'], ['Marathi in English letters', 'Marathi written in English letters (Roman script, like WhatsApp Marathi) with technical terms in English']];

function DoubtPanel({ lesson, courseName, initial, onClose, link }) {
  const [q, setQ] = useState(initial || '');
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('upskillr-doubt-lang') || 'English'; } catch { return 'English'; } });
  const [apiKey, setKey] = useApiKey();
  const [model, setModel] = useState('claude-sonnet-5-5');
  const [effort, setEffort] = useState('low');
  const [ans, setAns] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const ctrl = useRef(null);
  useEffect(() => { setQ(initial || ''); setAns(''); }, [initial]);
  useEffect(() => { try { localStorage.setItem('upskillr-doubt-lang', lang); } catch { /* ignore */ } }, [lang]);
  useEffect(() => () => ctrl.current?.abort(), []);

  const context = [
    `Course: ${courseName}`, `Lesson: ${lesson.title}`, lesson.module ? `Module: ${lesson.module}` : '',
    `Lesson summary: ${lesson.summary || ''}`,
    `Lesson sections: ${(lesson.theory || []).map((s) => s.heading).join('; ')}`,
  ].filter(Boolean).join('\n');
  const langText = LANGS.find((l) => l[0] === lang)?.[1] || 'simple English';
  const system = `You are a patient, friendly teacher helping an Indian college student/fresher who is studying online. Explain in ${langText}. Use a simple real-life analogy, then a small example (code if relevant, in a fenced block), then 2-3 key points to remember. Keep it short (under 250 words) unless asked for more. If the doubt is unclear, answer the most likely meaning. Never invent facts; say when something depends on version or context.`;
  const user = `${context}\n\nMy doubt: ${q.trim()}`;

  const ask = async () => {
    if (!q.trim()) return;
    ctrl.current?.abort();
    ctrl.current = new AbortController();
    setBusy(true); setAns('');
    try {
      const { message } = await streamClaude({ apiKey, model, effort, system, messages: [{ role: 'user', content: user }], onText: (d) => setAns((a) => a + d), signal: ctrl.current.signal });
      const note = stopNote(message);
      if (note) setAns((a) => `${a}\n\n_${note}_`);
    } catch (e) { setAns(`${describeError(e)}`); } finally { setBusy(false); }
  };
  const copyPrompt = async () => {
    try { await navigator.clipboard.writeText(`${system}\n\n${user}`); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };

  return (
    <div className="card lst-panel lst-doubt">
      <div className="lst-head"><h3><HelpCircle size={18} /> Ask a doubt about this lesson</h3><button className="link-btn" onClick={onClose} aria-label="Close"><X size={16} /></button></div>
      <textarea className="input" rows={3} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. I did not understand the difference between == and equals(). Explain with an example." />
      <div className="row-btns">
        <label className="lst-lang">Explain in <select value={lang} onChange={(e) => setLang(e.target.value)}>{LANGS.map(([l]) => <option key={l}>{l}</option>)}</select></label>
        {['Explain it more simply', 'Give one more example', 'How is this asked in interviews?'].map((s) => <button key={s} className="chip" onClick={() => setQ((x) => (x ? `${x}\n${s}` : s))}>{s}</button>)}
      </div>
      <ApiKeyBox apiKey={apiKey} setKey={setKey} model={model} setModel={setModel} effort={effort} setEffort={setEffort} compact />
      <div className="row-btns">
        <button className="btn primary" disabled={!apiKey || busy || !q.trim()} onClick={ask}><Sparkles size={15} /> {busy ? 'Explaining…' : 'Explain with Claude'}</button>
        {busy && <button className="btn" onClick={() => ctrl.current?.abort()}>Stop</button>}
        <button className="btn" disabled={!q.trim()} onClick={copyPrompt}><Copy size={15} /> {copied ? 'Copied ✓' : 'Copy prompt'}</button>
        <a className="btn" href="https://claude.ai/new" target="_blank" rel="noreferrer">Open Claude.ai</a>
        {supaMode && <Link className="btn" to={`/community/forum?new=1&course=${encodeURIComponent((link || '').split('/')[2] || '')}&lesson=${encodeURIComponent(link || '')}&title=${encodeURIComponent((q.trim() || `Doubt in ${lesson.title}`).slice(0, 190))}&body=${encodeURIComponent(`Lesson: ${lesson.title}\n\n${q.trim()}`)}`}>Ask in the forum</Link>}
      </div>
      {!apiKey && <p className="muted small">No API key? Click <b>Copy prompt</b> and paste it into Claude.ai, ChatGPT or Gemini — the prompt already contains the lesson context.</p>}
      {ans && <div className="ai-answer lst-answer"><AiText text={ans} /></div>}
    </div>
  );
}

export default function LessonStudyTools({ lessonKey, lesson, courseName, link, contentRef, tab }) {
  const [notes] = useStudy('notes', {});
  const note = notes[lessonKey] || { text: '', highlights: [] };
  const [pop, setPop] = useState(null); // { x, y, text }
  const [doubt, setDoubt] = useState(null);
  const [supported, setSupported] = useState(true);
  const [text, setText] = useState(note.text || '');
  const timer = useRef(null);
  const panelRef = useRef(null);
  const meta = { title: lesson.title, course: courseName, link };

  useEffect(() => { setText((notes[lessonKey] || {}).text || ''); }, [lessonKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const hlKey = note.highlights.map((h) => h.id).join(',');
  useEffect(() => {
    const t = setTimeout(() => setSupported(paintHighlights(contentRef.current, note.highlights.map((h) => h.text))), 80);
    return () => clearTimeout(t);
  }, [hlKey, tab, lessonKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { try { CSS.highlights?.delete(HL_NAME); } catch { /* ignore */ } }, []);

  // show a small toolbar when the student selects text in the lesson
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return undefined;
    const onUp = () => setTimeout(() => {
      const sel = window.getSelection();
      const s = sel && !sel.isCollapsed ? sel.toString().trim() : '';
      if (!s || s.length < 2 || !root.contains(sel.anchorNode) || sel.anchorNode?.parentElement?.closest('textarea, input, .lst-panel')) { setPop(null); return; }
      const r = sel.getRangeAt(0).getBoundingClientRect();
      setPop({ x: Math.max(70, Math.min(window.innerWidth - 70, r.left + r.width / 2)), y: r.top, text: s.slice(0, 600) });
    }, 10);
    const onDown = (e) => { if (!e.target.closest?.('.lst-pop')) setPop(null); };
    root.addEventListener('mouseup', onUp);
    root.addEventListener('touchend', onUp);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', () => setPop(null), { passive: true, once: true });
    return () => { root.removeEventListener('mouseup', onUp); root.removeEventListener('touchend', onUp); document.removeEventListener('mousedown', onDown); };
  }, [contentRef, tab, pop]);

  const changeText = (v) => {
    setText(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => saveNote(lessonKey, { text: v }, meta), 400);
  };
  const removeHl = (id) => saveNote(lessonKey, { highlights: note.highlights.filter((h) => h.id !== id) }, meta);
  const openDoubt = (initial) => { setDoubt(initial ?? ''); setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); };

  return (
    <>
      {pop && (
        <div className="lst-pop" style={{ left: pop.x, top: pop.y }}>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => { addHighlight(lessonKey, pop.text, meta); window.getSelection()?.removeAllRanges(); setPop(null); }}><Highlighter size={14} /> Highlight</button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => { const t = pop.text; setText((x) => { const v = `${x ? `${x}\n` : ''}• ${t}`; saveNote(lessonKey, { text: v }, meta); return v; }); setPop(null); }}><NotebookPen size={14} /> Add to notes</button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => { const t = pop.text; setPop(null); openDoubt(`Explain this part: "${t}"`); }}><HelpCircle size={14} /> Explain</button>
        </div>
      )}

      <div className="lst-bar">
        <span className="muted small"><Ico e="💡" /> Select any text in the lesson to highlight it, save it to notes or ask what it means.</span>
        <button className="btn small" onClick={() => openDoubt('')}><HelpCircle size={14} /> I didn't understand</button>
        <button className="btn small" onClick={() => document.getElementById('lst-notes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><NotebookPen size={14} /> My notes{note.highlights.length || note.text ? ` (${note.highlights.length + (note.text ? 1 : 0)})` : ''}</button>
      </div>

      <div ref={panelRef}>{doubt !== null && <DoubtPanel lesson={lesson} courseName={courseName} initial={doubt} link={link} onClose={() => setDoubt(null)} />}</div>

      <div className="card lst-panel" id="lst-notes">
        <div className="lst-head"><h3><NotebookPen size={18} /> My notes for this lesson</h3><Link to="/study/notes" className="small">All my notes →</Link></div>
        <textarea className="input lst-notes" rows={5} value={text} onChange={(e) => changeText(e.target.value)} placeholder="Write your own notes, formulas, doubts to ask the teacher… (saved automatically)" />
        <h4><Highlighter size={15} /> Highlights ({note.highlights.length})</h4>
        {!supported && note.highlights.length > 0 && <p className="muted small">Your browser cannot colour highlights inside the lesson, but they are saved here.</p>}
        {note.highlights.length === 0 ? <p className="muted small">Select text in the theory or examples and click <b>Highlight</b>.</p> : (
          <ul className="lst-hls">{note.highlights.map((h) => <li key={h.id}><mark>{h.text}</mark><button className="link-btn danger" onClick={() => removeHl(h.id)} aria-label="Remove highlight"><Trash2 size={14} /></button></li>)}</ul>
        )}
      </div>
    </>
  );
}
