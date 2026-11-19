// Study reminders without a server.
// 1) While the app is open (or opened later), a notification is shown once a day after the chosen time.
// 2) If the app is installed (PWA) and the browser supports Periodic Background Sync (Chrome/Android),
//    the service worker also checks in the background, using a small state saved in Cache Storage.
// 3) Calendar export (.ics / Google Calendar) gives reliable reminders from the phone's own calendar.
import { studyRead, dueItems, dayKey } from './study.js';

const STATE_CACHE = 'upskillr-reminder';
const STATE_URL = './__reminder-state.json';
const LAST_KEY = 'upskillr-study-reminded';

export const reminderSettings = () => ({ enabled: false, time: '19:00', ...(studyRead('upskillr-study-planner', {}).reminder || {}) });
export const notifySupported = () => typeof window !== 'undefined' && 'Notification' in window;

function message() {
  const due = dueItems().length;
  const mistakes = Object.keys(studyRead('upskillr-study-mistakes', {})).length;
  const solved = !!studyRead('upskillr-study-daily', {})[dayKey()];
  if (due) return { title: `${due} card${due === 1 ? '' : 's'} to revise today`, body: 'A few minutes of revision now keeps your streak and memory strong.', url: './#/study/revision' };
  if (!solved) return { title: 'Your daily coding challenge is waiting', body: 'Solve today\'s problem and earn 20 XP.', url: './#/study/challenge' };
  if (mistakes) return { title: `${mistakes} mistakes to fix`, body: 'Practise them once more in your Mistake Notebook.', url: './#/study/mistakes' };
  return { title: 'Time to study', body: 'Open today\'s plan and finish one lesson.', url: './#/today' };
}

export async function showStudyNotification(force = false) {
  if (!notifySupported() || Notification.permission !== 'granted') return false;
  const m = message();
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    if (reg?.showNotification) await reg.showNotification(m.title, { body: m.body, icon: './icon-192.png', badge: './icon-192.png', tag: 'upskillr-daily', data: { url: m.url }, renotify: force });
    else new Notification(m.title, { body: m.body, icon: './icon-192.png' });
    return true;
  } catch { return false; }
}

// Save the state the service worker needs (it cannot read localStorage).
export async function syncReminderState() {
  const s = reminderSettings();
  const state = { ...s, msg: message(), day: dayKey(), last: localStorage.getItem(LAST_KEY) || '' };
  try { const c = await caches.open(STATE_CACHE); await c.put(STATE_URL, new Response(JSON.stringify(state), { headers: { 'Content-Type': 'application/json' } })); } catch { /* no cache storage */ }
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg?.periodicSync && s.enabled) {
      const p = await navigator.permissions?.query({ name: 'periodic-background-sync' }).catch(() => null);
      if (!p || p.state === 'granted') await reg.periodicSync.register('upskillr-reminder', { minInterval: 6 * 60 * 60 * 1000 });
    } else if (reg?.periodicSync && !s.enabled) await reg.periodicSync.unregister('upskillr-reminder');
  } catch { /* not supported */ }
}

// Called when the app opens and every few minutes while it is open.
export async function checkReminder() {
  const s = reminderSettings();
  if (!s.enabled) return;
  const now = new Date();
  const [h, m] = s.time.split(':').map(Number);
  if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;
  if (localStorage.getItem(LAST_KEY) === dayKey()) return;
  if (await showStudyNotification()) localStorage.setItem(LAST_KEY, dayKey());
  syncReminderState();
}
export const backgroundSupported = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'periodicSync' in (window.ServiceWorkerRegistration?.prototype || {});

/* ---------------- calendar export ---------------- */
const pad = (n) => String(n).padStart(2, '0');
const icsDate = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const icsEsc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const wrap = (events) => ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//UpSkillr//Study Planner//EN', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n');

export function icsDailyReminder(time, minutes, appUrl) {
  const [h, m] = time.split(':').map(Number);
  const start = new Date(); start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + minutes * 60000);
  return wrap(['BEGIN:VEVENT', `UID:upskillr-daily-${Date.now()}@upskillr`, `DTSTAMP:${stamp()}`, `DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`, 'RRULE:FREQ=DAILY',
    'SUMMARY:UpSkillr study time', `DESCRIPTION:${icsEsc(`Today's plan, revision and daily challenge.\n${appUrl}`)}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Study time', 'TRIGGER:-PT5M', 'END:VALARM', 'END:VEVENT']);
}
export function icsTasks(byDay, time = '19:00') {
  const [h, m] = time.split(':').map(Number);
  const ev = [];
  Object.entries(byDay).forEach(([day, list]) => (list || []).forEach((t, i) => {
    const [y, mo, d] = day.split('-').map(Number);
    const start = new Date(y, mo - 1, d, h, m + i * 30);
    const end = new Date(start.getTime() + 30 * 60000);
    ev.push('BEGIN:VEVENT', `UID:upskillr-${day}-${t.id}@upskillr`, `DTSTAMP:${stamp()}`, `DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`, `SUMMARY:${icsEsc(`${t.text}`)}`, 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Study task', 'TRIGGER:-PT10M', 'END:VALARM', 'END:VEVENT');
  }));
  return wrap(ev);
}
export function icsEvent({ title, day, time, minutes = 60, details = '' }) {
  const [y, mo, d] = day.split('-').map(Number);
  const [h, m] = (time || '10:00').split(':').map(Number);
  const start = new Date(y, mo - 1, d, h, m);
  const end = new Date(start.getTime() + minutes * 60000);
  return wrap(['BEGIN:VEVENT', `UID:upskillr-${Date.now()}@upskillr`, `DTSTAMP:${stamp()}`, `DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`, `SUMMARY:${icsEsc(title)}`, `DESCRIPTION:${icsEsc(details)}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(title)}`, 'TRIGGER:-PT1H', 'END:VALARM', 'END:VEVENT']);
}
export function googleCalUrl({ title, day, time, minutes = 60, details = '', daily = false }) {
  const d = day || dayKey();
  const [y, mo, dd] = d.split('-').map(Number);
  const [h, m] = (time || '19:00').split(':').map(Number);
  const s = new Date(y, mo - 1, dd, h, m);
  const e = new Date(s.getTime() + minutes * 60000);
  const p = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${icsDate(s)}/${icsDate(e)}`, details });
  if (daily) p.set('recur', 'RRULE:FREQ=DAILY');
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
