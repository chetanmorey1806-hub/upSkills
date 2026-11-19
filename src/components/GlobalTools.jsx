import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Monitor, Type, CornerDownLeft } from 'lucide-react';
import { searchAll } from '../searchIndex.js';
import { usePrefs, THEMES, SIZES } from '../uiPrefs.js';

export const openPalette = () => window.dispatchEvent(new Event('open-palette'));

/* Ctrl/⌘+K search across the whole app */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const nav = useNavigate();
  const input = useRef(null);
  const list = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); }
      else if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) && !document.activeElement?.isContentEditable) { e.preventDefault(); setOpen(true); }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-palette', onOpen);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('open-palette', onOpen); };
  }, []);
  useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => input.current?.focus(), 20); } }, [open]);
  const results = searchAll(q, 40);
  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { list.current?.querySelector('.cp-item.on')?.scrollIntoView({ block: 'nearest' }); }, [sel]);
  if (!open) return null;
  const go = (r) => { setOpen(false); if (r) nav(r.to); };
  const onKey = (e) => {
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    else if (e.key === 'Enter') { if (results[sel]) go(results[sel]); else if (q.trim()) { setOpen(false); nav(`/search?q=${encodeURIComponent(q.trim())}`); } }
  };
  return (
    <div className="cp-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="cp" role="dialog" aria-label="Search everything">
        <div className="cp-input"><Search size={18} /><input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Search lessons, tools, aptitude, errors, projects…" /><kbd>Esc</kbd></div>
        <div className="cp-list" ref={list}>
          {!q && <div className="cp-hint">Try “sorting”, “percentage”, “NullPointerException”, “resume”, “TCS”, “Spring Boot”…</div>}
          {q && !results.length && <div className="cp-hint">No quick match. Press Enter to search inside all lessons.</div>}
          {results.map((r, i) => (
            <button key={`${r.type}-${r.to}-${i}`} className={`cp-item ${i === sel ? 'on' : ''}`} onMouseEnter={() => setSel(i)} onClick={() => go(r)}>
              <span className="cp-ic">{r.icon}</span>
              <span className="cp-txt"><b>{r.title}</b><span>{r.sub}</span></span>
              <span className="cp-type">{r.type}</span>
              {i === sel && <CornerDownLeft size={14} className="cp-enter" />}
            </button>
          ))}
        </div>
        <div className="cp-foot"><span>↑↓ to move · Enter to open</span><span>Ctrl K anywhere</span></div>
      </div>
    </div>
  );
}

/* Theme + text size */
export function DisplayMenu() {
  const [p, set] = usePrefs();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const dark = p.theme === 'dark' || (p.theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  const icons = { system: Monitor, light: Sun, dark: Moon };
  return (
    <div className="dm" ref={ref}>
      <button className="dm-btn" onClick={() => setOpen(!open)} aria-label="Display settings" title="Theme & text size">{dark ? <Moon size={17} /> : <Sun size={17} />}</button>
      {open && (
        <div className="dm-drop">
          <div className="dm-label">Theme</div>
          <div className="dm-row">{THEMES.map(([k, l]) => { const I = icons[k]; return <button key={k} className={p.theme === k ? 'on' : ''} onClick={() => set({ theme: k })}><I size={15} /> {l}</button>; })}</div>
          <div className="dm-label"><Type size={13} /> Text size</div>
          <div className="dm-row">{SIZES.map(([k, l]) => <button key={k} className={p.size === k ? 'on' : ''} onClick={() => set({ size: k })}>{l}</button>)}</div>
        </div>
      )}
    </div>
  );
}
