import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { tracks, topicKey, topicLabel } from '../data/index.js';
import { useProgress } from '../progress.js';
import ProgressBar from '../components/ProgressBar.jsx';

function TopicRow({ track, t, x, idx, done, quiz }) {
  const k = topicKey(track, x.id);
  return (
    <Link to={`/track/${track}/${x.id}`} className={`card topic-row ${done[k] ? 'is-done' : ''}`}>
      <div className="topic-num" style={{ background: done[k] ? 'var(--ok)' : t.color }}>
        {done[k] ? '✓' : x.day && track === 'excel' ? x.day : x.extraNo || idx + 1}
      </div>
      <div className="topic-main">
        <div className="muted small">{topicLabel(track, x, idx)}</div>
        <h3>{x.title}</h3>
        <p className="muted">{x.summary}</p>
        <div className="meta">
          <span className={`lvl lvl-${x.level}`}>{x.level}</span>
          {x.duration && <span>⏱ {x.duration}</span>}
          <span>📘 {x.theory?.length || 0} sections</span>
          <span>🧪 {x.examples?.length || 0} solved examples</span>
          <span>💬 {x.interview?.length || 0} Q&amp;A</span>
          <span>🛠 {x.practice?.length || 0} exercises</span>
          {quiz[k] != null && <span>🏆 Quiz {quiz[k]}/{x.quiz?.length}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function TrackPage() {
  const { track } = useParams();
  const t = tracks[track];
  const { done, quiz } = useProgress();
  const [level, setLevel] = useState('All');
  if (!t) return <p>Track not found.</p>;
  const list = t.topics.filter((x) => level === 'All' || x.level === level);
  const completed = t.topics.filter((x) => done[topicKey(track, x.id)]).length;
  const hasModules = t.topics.some((x) => x.module) && track === 'excel';

  // group into modules (keeps order)
  const groups = [];
  list.forEach((x) => {
    const m = hasModules ? x.module || 'Other' : '';
    let g = groups.find((gg) => gg.name === m);
    if (!g) groups.push((g = { name: m, items: [] }));
    g.items.push(x);
  });

  return (
    <div>
      <div className="page-head" style={{ borderLeftColor: t.color }}>
        <h1>{t.icon} {t.name}</h1>
        <p className="muted">{t.tagline}</p>
        <ProgressBar value={t.topics.length ? completed / t.topics.length : 0} color={t.color} />
        <div className="muted small">{completed} / {t.topics.length} completed</div>
      </div>
      <div className="chips">
        {['All', 'Beginner', 'Intermediate', 'Advanced'].map((l) => (
          <button key={l} className={`chip ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)}>{l}</button>
        ))}
      </div>
      {hasModules && (
        <div className="card toc">
          <b>Modules:</b>{' '}
          {groups.map((g, i) => (
            <a key={g.name} href={`#mod-${i}`} onClick={(e) => { e.preventDefault(); document.getElementById(`mod-${i}`)?.scrollIntoView({ behavior: 'smooth' }); }}>{g.name}</a>
          ))}
        </div>
      )}
      {t.topics.length === 0 && <p className="muted">Content is being added. Check back soon.</p>}
      {groups.map((g, gi) => {
        const gDone = g.items.filter((x) => done[topicKey(track, x.id)]).length;
        return (
          <section key={g.name} id={`mod-${gi}`} className="module">
            {g.name && (
              <div className="module-head">
                <h2>{g.name}</h2>
                <span className="muted small">{gDone}/{g.items.length} done</span>
              </div>
            )}
            <div className="topic-list">
              {g.items.map((x) => (
                <TopicRow key={x.id} track={track} t={t} x={x} idx={t.topics.indexOf(x)} done={done} quiz={quiz} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
