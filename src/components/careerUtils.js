import { useEffect, useRef, useState, useCallback } from 'react';

// State persisted in localStorage (per browser). Works without storage too.
export function useLocalState(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
  }, [key, val]);
  return [val, setVal];
}

// Deterministic PRNG so "Test 3" always has the same questions.
export function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffle(arr, rnd = Math.random) {
  const b = [...arr];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
export const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

export const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

// Countdown timer. running=false pauses. Returns seconds left.
export function useCountdown(seconds, running, resetKey) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => { setLeft(seconds); }, [seconds, resetKey]);
  useEffect(() => {
    if (!running || left <= 0) return undefined;
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [running, left]);
  return left;
}

// Count-up stopwatch.
export function useStopwatch(running, resetKey) {
  const [t, setT] = useState(0);
  useEffect(() => { setT(0); }, [resetKey]);
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setT((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return t;
}

// Browser speech-to-text (Chrome / Edge). Appends recognized text via onText.
export function useDictation(onText) {
  const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const recRef = useRef(null);
  const cb = useRef(onText);
  cb.current = onText;

  const stop = useCallback(() => { try { recRef.current?.stop(); } catch { /* ignore */ } setListening(false); setInterim(''); }, []);
  const start = useCallback(() => {
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let fin = '';
      let tmp = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) fin += r[0].transcript; else tmp += r[0].transcript;
      }
      if (fin) cb.current?.(fin.trim());
      setInterim(tmp);
    };
    rec.onerror = () => { setListening(false); setInterim(''); };
    rec.onend = () => { setListening(false); setInterim(''); };
    recRef.current = rec;
    try { rec.start(); setListening(true); } catch { setListening(false); }
  }, [SR]);
  useEffect(() => () => { try { recRef.current?.stop(); } catch { /* ignore */ } }, []);
  return { supported: !!SR, listening, interim, start, stop };
}

const STOP = new Set('the a an and or but if then else of to in on at for from by with without into onto is are was were be been being it its this that these those as we you your our they them their he she his her i me my can could should would will shall may might must do does did done not no yes so such than also only just very more most less much many any some each every all both either neither which what when where who whom why how there here about over under between through after before during while use used using one two etc e.g eg ie example like make makes made get gets got have has had'.split(' '));

// Important words of a model answer (used to score how much of it a student covered).
export function keywordsOf(text, max = 12) {
  const words = String(text || '').toLowerCase().replace(/`[^`]*`/g, (m) => ` ${m.slice(1, -1)} `).match(/[a-z][a-z0-9+#.@_-]{2,}/g) || [];
  const freq = new Map();
  words.forEach((w) => {
    const k = w.replace(/[.]+$/, '');
    if (k.length < 4 || STOP.has(k)) return;
    freq.set(k, (freq.get(k) || 0) + 1);
  });
  return [...freq.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length).slice(0, max).map(([w]) => w);
}
export function coverage(answer, keywords) {
  const a = String(answer || '').toLowerCase();
  const hit = keywords.filter((k) => a.includes(k) || (k.length > 6 && a.includes(k.slice(0, k.length - 2))));
  return { hit, miss: keywords.filter((k) => !hit.includes(k)), pct: keywords.length ? Math.round((hit.length / keywords.length) * 100) : 0 };
}

// Speaking analysis: words, WPM, filler words, repeated words.
export function analyzeSpeech(text, seconds, fillers) {
  const clean = String(text || '').toLowerCase();
  const words = clean.match(/[a-z']+/g) || [];
  const fillerCounts = {};
  fillers.forEach((f) => {
    const re = new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const n = (clean.match(re) || []).length;
    if (n) fillerCounts[f] = n;
  });
  const fillerTotal = Object.values(fillerCounts).reduce((s, n) => s + n, 0);
  const freq = {};
  words.filter((w) => w.length > 3 && !STOP.has(w)).forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  const repeated = Object.entries(freq).filter(([, n]) => n >= 4).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const sentences = (String(text || '').match(/[^.!?]+[.!?]*/g) || []).filter((s) => s.trim()).length;
  const wpm = seconds > 5 ? Math.round(words.length / (seconds / 60)) : null;
  return { words: words.length, wpm, fillerCounts, fillerTotal, repeated, sentences };
}

export function downloadFile(name, content, type = 'text/html') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
