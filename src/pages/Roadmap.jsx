import { Link } from 'react-router-dom';
import { useState } from 'react';
import { tracks, topicKey, topicLabel } from '../data/index.js';
import { useProgress } from '../progress.js';
import ProgressBar from '../components/ProgressBar.jsx';

function buildPlan(mode) {
  const plan = [];
  let day = 1;
  if (mode !== 'powerbi') {
    let lastModule = null;
    tracks.excel.topics.forEach((x) => {
      if (x.module !== lastModule) { plan.push({ type: 'heading', label: x.module }); lastModule = x.module; }
      plan.push({ type: 'topic', day: x.day || day, track: 'excel', topic: x });
      day = (x.day || day) + 1;
    });
  }
  if (mode !== 'excel') {
    plan.push({ type: 'heading', label: 'Power BI' });
    const topics = tracks.powerbi.topics;
    topics.forEach((x, i) => {
      plan.push({ type: 'topic', day: day++, track: 'powerbi', topic: x });
      if (topics[i + 1]?.level !== x.level || i === topics.length - 1) {
        plan.push({ type: 'revision', day: day++, label: `Power BI ${x.level} revision`, text: `Revise ${x.level.toLowerCase()} Power BI topics, retake their quizzes and go through starred interview questions.` });
      }
    });
  }
  if (mode !== 'powerbi' && tracks.extra.topics.length) {
    plan.push({ type: 'heading', label: 'Extra practical sessions (job-oriented skills)' });
    tracks.extra.topics.forEach((x, i) => plan.push({ type: 'topic', track: 'extra', topic: x, idx: i }));
  }
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
        <h1>🗺 Step-by-step roadmap</h1>
        <p className="muted">
          Follow one day at a time: read the theory → solve the step-by-step examples → do the practice →
          take the quiz → revise the interview Q&amp;A. Tick "Mark as completed" on each day to track progress.
        </p>
        <div className="chips">
          {[['excel', 'Excel 60-day course'], ['powerbi', 'Power BI'], ['both', 'Excel → Power BI (full)']].map(([k, l]) => (
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
          if (p.type === 'heading') return <div key={'h' + i} className="tl-module">📦 {p.label}</div>;
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
              <div className="tl-dot" style={{ background: done[k] ? 'var(--ok)' : t.color }}>{done[k] ? '✓' : t.icon}</div>
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
