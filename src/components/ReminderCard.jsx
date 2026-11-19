import { useEffect, useState } from 'react';
import { Bell, BellOff, CalendarPlus, Download } from 'lucide-react';
import { useStudy, DEFAULT_GOALS } from '../study.js';
import { notifySupported, showStudyNotification, syncReminderState, backgroundSupported, icsDailyReminder, icsTasks, googleCalUrl } from '../reminders.js';
import { downloadFile } from './careerUtils.js';

const appUrl = () => `${window.location.origin}${window.location.pathname}#/today`;

export default function ReminderCard({ tasks = {}, days = [] }) {
  const [plan, setPlan] = useStudy('planner', {});
  const r = { enabled: false, time: '19:00', ...(plan.reminder || {}) };
  const [perm, setPerm] = useState(notifySupported() ? Notification.permission : 'unsupported');
  const [msg, setMsg] = useState('');
  const minutes = Math.max(30, (plan.goals || DEFAULT_GOALS).focus || 50);
  useEffect(() => { syncReminderState(); }, [r.enabled, r.time]);
  const set = (patch) => setPlan((p) => ({ ...p, reminder: { ...r, ...patch } }));
  const enable = async () => {
    if (!notifySupported()) { setMsg('This browser cannot show notifications. Use the calendar options below.'); return; }
    let p = Notification.permission;
    if (p === 'default') p = await Notification.requestPermission();
    setPerm(p);
    if (p === 'granted') { set({ enabled: true }); setMsg('Reminders are on.'); } else setMsg('Notifications are blocked. Allow them from the lock icon in the address bar, or use the calendar options below.');
  };
  const weekTasks = Object.fromEntries(days.map((d) => [d, (tasks[d] || []).filter((t) => !t.done)]));
  const taskCount = Object.values(weekTasks).reduce((s, l) => s + l.length, 0);
  return (
    <div className="card">
      <h3><Bell size={18} /> Reminders &amp; calendar</h3>
      <div className="rm-row">
        {r.enabled && perm === 'granted'
          ? <button className="btn" onClick={() => set({ enabled: false })}><BellOff size={15} /> Turn off reminders</button>
          : <button className="btn primary" onClick={enable}><Bell size={15} /> Turn on daily reminder</button>}
        <label className="small">Remind me at <input type="time" value={r.time} onChange={(e) => set({ time: e.target.value })} /></label>
        {perm === 'granted' && <button className="btn small" onClick={() => showStudyNotification(true)}>Send a test notification</button>}
      </div>
      {msg && <p className="small">{msg}</p>}
      <p className="muted small">
        The reminder tells you how many revision cards are due, or reminds you about the daily challenge.
        {backgroundSupported() ? ' When UpSkillr is installed as an app, it can remind you even when the app is closed (Chrome / Android).' : ' This browser shows the reminder when you open UpSkillr after the chosen time. For reminders when the app is closed, add it to your calendar:'}
      </p>
      <div className="row-btns">
        <a className="btn" href={googleCalUrl({ title: 'UpSkillr study time', time: r.time, minutes, details: `Today's plan, revision and daily challenge: ${appUrl()}`, daily: true })} target="_blank" rel="noreferrer"><CalendarPlus size={15} /> Daily reminder in Google Calendar</a>
        <button className="btn" onClick={() => downloadFile('upskillr-daily-study.ics', icsDailyReminder(r.time, minutes, appUrl()), 'text/calendar')}><Download size={15} /> Daily reminder (.ics)</button>
        <button className="btn" disabled={!taskCount} onClick={() => downloadFile('upskillr-week-plan.ics', icsTasks(weekTasks, r.time), 'text/calendar')}><Download size={15} /> This week's {taskCount || ''} planned task{taskCount === 1 ? '' : 's'} (.ics)</button>
      </div>
      <p className="muted small">.ics files open in Google Calendar, Outlook and the iPhone/Android calendar, which then remind you on time.</p>
    </div>
  );
}
