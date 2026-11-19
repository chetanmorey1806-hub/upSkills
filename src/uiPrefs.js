// Display preferences (theme + text size). Stored under a plain key so they stay the same
// for everyone on this device, before and after sign-in.
import { useEffect, useState } from 'react';

const KEY = 'ui-prefs';
const EVT = 'ui-prefs';
export const THEMES = [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']];
export const SIZES = [['sm', 'A−'], ['md', 'A'], ['lg', 'A+'], ['xl', 'A++']];

export function readPrefs() {
  try { return { theme: 'system', size: 'md', ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { theme: 'system', size: 'md' }; }
}
export function applyPrefs(p = readPrefs()) {
  const el = document.documentElement;
  if (p.theme === 'light' || p.theme === 'dark') el.setAttribute('data-theme', p.theme); else el.removeAttribute('data-theme');
  if (p.size && p.size !== 'md') el.setAttribute('data-size', p.size); else el.removeAttribute('data-size');
  const dark = p.theme === 'dark' || (p.theme !== 'light' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0d1117' : '#4f46e5');
}
export function setPrefs(patch) {
  const next = { ...readPrefs(), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  applyPrefs(next);
  window.dispatchEvent(new Event(EVT));
}
export function usePrefs() {
  const [p, setP] = useState(readPrefs);
  useEffect(() => { const h = () => setP(readPrefs()); window.addEventListener(EVT, h); return () => window.removeEventListener(EVT, h); }, []);
  return [p, setPrefs];
}
