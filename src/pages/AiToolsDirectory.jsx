import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Search, ExternalLink, CheckCircle2, AlertTriangle, Lightbulb, Sparkles, X } from 'lucide-react';
import { AI_LOAD_KEY } from './AiPromptLab.jsx';

const mods = import.meta.glob('../data/aiTools.js', { eager: true });
const TOOLS = Object.values(mods)[0]?.default || [];

export default function AiToolsDirectory() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [price, setPrice] = useState('All');
  const [sel, setSel] = useState(null);
  const nav = useNavigate();
  const cats = useMemo(() => ['All', ...new Set(TOOLS.map((t) => t.category))], []);
  const list = TOOLS.filter((t) => (cat === 'All' || t.category === cat) && (price === 'All' || t.pricing === price)
    && (!q || `${t.name} ${t.maker} ${t.category} ${t.whatItIs} ${(t.whereToUse || []).join(' ')}`.toLowerCase().includes(q.toLowerCase())));
  const tryPrompt = (t) => { try { sessionStorage.setItem(AI_LOAD_KEY, JSON.stringify({ user: t.examplePrompt, system: '', title: `${t.name} example` })); } catch { /* ignore */ } nav('/tools/ai-lab'); };

  return (
    <div className="ai-page">
      <div className="page-head">
        <h1><Compass className="hicon" /> AI Tools Directory</h1>
        <p className="muted">{TOOLS.length} popular AI tools: what each one is, where it is used in real jobs, and how to use it step by step.</p>
      </div>
      {TOOLS.length === 0 && <div className="card info">The tools list is being prepared. Refresh in a few minutes.</div>}
      <div className="toolbar">
        <div className="ai-search"><Search size={16} /><input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tools, e.g. presentation, coding, video…" /></div>
        <label className="small">Pricing <select value={price} onChange={(e) => setPrice(e.target.value)}>{['All', 'Free', 'Free tier + paid', 'Paid', 'Open source'].map((x) => <option key={x}>{x}</option>)}</select></label>
      </div>
      <div className="chips">{cats.map((c) => <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}{c !== 'All' && ` (${TOOLS.filter((t) => t.category === c).length})`}</button>)}</div>
      <div className="grid3">
        {list.map((t) => (
          <button key={t.id} className="card at-card" onClick={() => setSel(t)}>
            <div className="at-head"><span className="at-logo">{t.name.slice(0, 1)}</span><div><b>{t.name}</b><div className="muted small">{t.maker}</div></div></div>
            <div className="at-tags"><span className="at-tag">{t.category}</span><span className={`at-tag p-${(t.pricing || '').replace(/\W+/g, '')}`}>{t.pricing}</span></div>
            <p className="muted small">{t.whatItIs}</p>
          </button>
        ))}
      </div>
      {sel && (
        <div className="at-modal" onClick={() => setSel(null)}>
          <div className="card at-detail" onClick={(e) => e.stopPropagation()}>
            <button className="at-close" onClick={() => setSel(null)} aria-label="Close"><X size={18} /></button>
            <div className="at-head"><span className="at-logo big">{sel.name.slice(0, 1)}</span><div><h2>{sel.name}</h2><div className="muted">{sel.maker} · {sel.category} · {sel.pricing}</div></div></div>
            <p>{sel.whatItIs}</p>
            <div className="ai-grid">
              <div><h4>Where to use it</h4><ul>{(sel.whereToUse || []).map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div><h4>How to use it: step by step</h4><ol>{(sel.howToUse || []).map((x) => <li key={x}>{x}</li>)}</ol></div>
            </div>
            {sel.examplePrompt && (<><h4>Example prompt / usage</h4><pre className="ai-preview">{sel.examplePrompt}</pre></>)}
            <div className="ai-grid">
              <div><h4><Lightbulb size={14} /> Tips</h4><ul>{(sel.tips || []).map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div><h4><AlertTriangle size={14} /> Limitations</h4><ul>{(sel.limitations || []).map((x) => <li key={x}>{x}</li>)}</ul></div>
            </div>
            {sel.skills?.length > 0 && <div className="at-tags">{sel.skills.map((s) => <span key={s} className="at-tag"><CheckCircle2 size={12} /> {s}</span>)}</div>}
            <div className="row-btns">
              <a className="btn primary" href={sel.url} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Open {sel.name}</a>
              {sel.examplePrompt && <button className="btn" onClick={() => tryPrompt(sel)}><Sparkles size={14} /> Try the prompt in Prompt Lab</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
