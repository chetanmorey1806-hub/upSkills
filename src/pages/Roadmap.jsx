import { Link } from 'react-router-dom';
import { useState } from 'react';
import { tracks, topicKey, topicLabel } from '../data/index.js';
import { useProgress } from '../progress.js';
import ProgressBar from '../components/ProgressBar.jsx';
import { TrackIcon } from '../components/Icons.jsx';

import Ico from '../components/Ico.jsx';
function addCourse(plan, trackKey, startDay) {
  let day = startDay;
  let lastModule = null;
  tracks[trackKey].topics.forEach((x) => {
    if (x.module !== lastModule) { plan.push({ type: 'heading', label: `${tracks[trackKey].short}: ${x.module}` }); lastModule = x.module; }
    plan.push({ type: 'topic', day, track: trackKey, topic: x });
    day += 1;
  });
  return day;
}
function addExtras(plan, trackKey, label) {
  if (!tracks[trackKey].topics.length) return;
  plan.push({ type: 'heading', label });
  tracks[trackKey].topics.forEach((x, i) => plan.push({ type: 'topic', track: trackKey, topic: x, idx: i }));
}

const WEB_PLANS = { html: ['html'], css: ['css'], js: ['js'], react: ['react'], web: ['html', 'css', 'js', 'react'], javafs: ['corejava', 'collections', 'advjava', 'hibernate', 'spring', 'springboot', 'javatech'], ai: ['ai'], mysql: ['mysql'], dotnet: ['dotnet'], pyfs: ['python', 'sql', 'flask', 'django', 'drf'], pyfull: ['python', 'sql', 'html', 'css', 'js', 'flask', 'django', 'drf', 'react'], javafull: ['corejava', 'collections', 'advjava', 'hibernate', 'spring', 'springboot', 'html', 'css', 'js', 'react', 'javatech'] };

function buildPlan(mode) {
  const plan = [];
  let day = 1;
  if (WEB_PLANS[mode]) {
    WEB_PLANS[mode].forEach((k) => { day = addCourse(plan, k, day); });
    if (mode === 'html' || mode === 'web') addExtras(plan, 'htmlextra', 'HTML extra topics (must-know)');
    if (mode === 'dotnet') addExtras(plan, 'dotnetextra', '.NET extra topics: OOP concepts, advanced C#, SQL Server, ASP.NET Core / EF Core / Web API');
    return plan;
  }
  if (mode !== 'powerbi') day = addCourse(plan, 'excel', day);
  if (mode !== 'excel') day = addCourse(plan, 'powerbi', mode === 'both' ? day : 1);
  if (mode !== 'powerbi') addExtras(plan, 'extra', 'Excel extra practical sessions (job-oriented skills)');
  if (mode !== 'excel') addExtras(plan, 'pbiextra', 'Power BI extra topics (advanced practice)');
  return plan;
}

export default function Roadmap() {
  const [mode, setMode] = useState('excel');
  const { done } = useProgress();
  const plan = buildPlan(mode);
  const topicItems = plan.filter((p) => p.type === 'topic');
  const completed = topicItems.filter((p) => done[topicKey(p.track, p.topic.id)]).length;
  const nextUp = topicItems.find((p) => !done[topicKey(p.track, p.topic.id)]);
  const lastDay = Math.max(0, ...plan.filter((p) => p.day).map((p) => p.day));

  return (
    <div>
      <div className="page-head">
        <h1>Step-by-step roadmap</h1>
        <p className="muted">
          Follow one day at a time: read the theory → solve the step-by-step examples → do the practice →
          take the quiz → revise the interview Q&amp;A. Tick "Mark as completed" on each day to track progress.
        </p>
        <div className="chips">
          {[['excel', 'Excel 60 days'], ['powerbi', 'Power BI 45 days'], ['both', 'Excel → Power BI (105 days)'], ['html', 'HTML 30 days'], ['css', 'CSS 30 days'], ['js', 'JavaScript 45 days'], ['react', 'React 30 days'], ['web', 'Full web dev: HTML → CSS → JS → React (135 days)'], ['javafs', 'Java Full Stack: Core Java → Collections → Adv Java → Hibernate → Spring → Spring Boot (132 days)'], ['javafull', 'Java Full Stack + Frontend (Java + HTML/CSS/JS/React)'], ['ai', 'Artificial Intelligence (45 days)'], ['mysql', 'MySQL with Workbench (30 days)'], ['dotnet', '.NET Full Stack (120 days)'], ['pyfs', 'Python Full Stack: Python → SQL → Flask → Django → DRF (114 days)'], ['pyfull', 'Python Full Stack + Frontend (Python, SQL, HTML/CSS/JS, Flask, Django, DRF, React)']].map(([k, l]) => (
            <button key={k} className={`chip ${mode === k ? 'active' : ''}`} onClick={() => setMode(k)}>{l}</button>
          ))}
        </div>
        <ProgressBar value={topicItems.length ? completed / topicItems.length : 0} />
        <div className="muted small">{completed}/{topicItems.length} lessons done · {lastDay} days</div>
        {nextUp && (
          <Link className="btn primary" to={`/track/${nextUp.track}/${nextUp.topic.id}`}>
            Continue: {nextUp.day ? `Day ${nextUp.day}` : topicLabel(nextUp.track, nextUp.topic, nextUp.idx)}: {nextUp.topic.title} →
          </Link>
        )}
      </div>

      {topicItems.length === 0 && <p className="muted">Lessons are being added…</p>}
      <div className="timeline">
        {plan.map((p, i) => {
          if (p.type === 'heading') return <div key={'h' + i} className="tl-module"><Ico e="📦" /> {p.label}</div>;
          if (p.type === 'revision') {
            return (
              <div key={'r' + i} className="tl-item revision">
                <div className="tl-dot">⟳</div>
                <div className="card tl-card">
                  <div className="tl-day">Day {p.day}</div>
                  <h4>{p.label}</h4>
                  <p className="muted">{p.text}</p>
                  <Link to="/tools/quiz">Quiz Arena</Link> · <Link to="/tools/flashcards">Flashcards</Link>
                </div>
              </div>
            );
          }
          const k = topicKey(p.track, p.topic.id);
          const t = tracks[p.track];
          return (
            <div key={k} className={`tl-item ${done[k] ? 'is-done' : ''}`}>
              <div className="tl-dot" style={{ background: done[k] ? 'var(--ok)' : t.color }}>{done[k] ? '✓' : <TrackIcon track={p.track} size={16} />}</div>
              <Link to={`/track/${p.track}/${p.topic.id}`} className="card tl-card">
                <div className="tl-day">{p.day ? `Day ${p.day}` : topicLabel(p.track, p.topic, p.idx)} · {t.short} · <span className={`lvl lvl-${p.topic.level}`}>{p.topic.level}</span></div>
                <h4>{p.topic.title}</h4>
                <p className="muted">{p.topic.summary}</p>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
