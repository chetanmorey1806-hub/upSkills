import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Square, Coffee, Timer } from 'lucide-react';
import { useStudy, startFocus, pauseFocus, resumeFocus, stopFocus } from '../study.js';

const fmt = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach((t) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.25, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.3);
    });
  } catch { /* no audio */ }
}
function notify(title, body) {
  try { if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body, icon: './logo.svg' }); } catch { /* ignore */ }
}

// Shared by every timer on screen so a finished session is handled only once.
let lastFinished = null;

// Ticks every second while a session is running and finishes it when the time is up.
export function useFocusSession() {
  const [f] = useStudy('focus', null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!f || f.paused) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [f]);
  useEffect(() => {
    if (!f || f.paused || now < f.end || lastFinished === f.start) return;
    lastFinished = f.start;
    stopFocus(true);
    beep();
    if (f.mode === 'focus') { notify('Focus session complete 🎉', 'Great work! Take a 5-minute break.'); startFocus(5, 'break'); } else notify('Break over', 'Ready for the next focus session?');
  }, [now, f]);
  const left = f ? (f.paused ? f.end - f.paused : f.end - now) : 0;
  return { f, left };
}

export const FOCUS_PRESETS = [[25, 'Pomodoro 25'], [50, 'Deep 50'], [15, 'Quick 15']];

export function FocusControls({ label = '' }) {
  const { f, left } = useFocusSession();
  const [mins, setMins] = useState(25);
  const ask = () => { try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch { /* ignore */ } };
  if (!f) {
    return (
      <div className="ft-box">
        <div className="ft-time">{String(mins).padStart(2, '0')}:00</div>
        <div className="chips">{FOCUS_PRESETS.map(([m, l]) => <button key={m} className={`chip ${mins === m ? 'active' : ''}`} onClick={() => setMins(m)}>{l}</button>)}</div>
        <button className="btn primary" onClick={() => { ask(); startFocus(mins, 'focus', label); }}><Play size={16} /> Start focus</button>
        <p className="muted small">Study with no phone and no other tabs. After the session a 5-minute break starts automatically. Focus minutes count towards your daily goal and XP.</p>
      </div>
    );
  }
  const total = f.minutes * 60000;
  return (
    <div className={`ft-box ${f.mode}`}>
      <div className="ft-mode">{f.mode === 'focus' ? '🎯 Focus' : '☕ Break'}{f.paused ? ' · paused' : ''}</div>
      <div className="ft-time">{fmt(left)}</div>
      <div className="ft-bar"><i style={{ width: `${Math.min(100, (1 - left / total) * 100)}%` }} /></div>
      <div className="row-btns center">
        {f.paused ? <button className="btn primary" onClick={resumeFocus}><Play size={16} /> Resume</button> : <button className="btn" onClick={pauseFocus}><Pause size={16} /> Pause</button>}
        <button className="btn" onClick={() => stopFocus(true)}><Square size={16} /> {f.mode === 'focus' ? 'Finish early' : 'Skip break'}</button>
      </div>
    </div>
  );
}

// Small floating pill shown on every page while a session runs.
export default function FocusPill() {
  const { f, left } = useFocusSession();
  if (!f) return null;
  return (
    <Link to="/study/planner" className={`ft-pill ${f.mode}`} title="Open the planner">
      {f.mode === 'focus' ? <Timer size={15} /> : <Coffee size={15} />}
      <b>{fmt(left)}</b>{f.paused && <span>paused</span>}
    </Link>
  );
}
