import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { tracks, topicKey, topicLabel } from '../data/index.js';
import { useProgress } from '../progress.js';
import ProgressBar from '../components/ProgressBar.jsx';
import { TrackIcon } from '../components/Icons.jsx';
import { CourseCover, RecordedVideos } from '../components/MediaBits.jsx';
import { LessonMaterials } from '../components/MaterialBits.jsx';

import Ico from '../components/Ico.jsx';
function TopicRow({ track, t, x, idx, done, quiz }) {
  const k = topicKey(track, x.id);
  return (
    <Link to={`/track/${track}/${x.id}`} className={`card topic-row ${done[k] ? 'is-done' : ''}`}>
      <div className="topic-num" style={{ background: done[k] ? 'var(--ok)' : t.color }}>
        {done[k] ? '✓' : x.day && t.unit === 'Day' ? x.day : x.extraNo || idx + 1}
      </div>
      <div className="topic-main">
        <div className="muted small">{topicLabel(track, x, idx)}</div>
        <h3>{x.title}</h3>
        <p className="muted">{x.summary}</p>
        <div className="meta">
          <span className={`lvl lvl-${x.level}`}>{x.level}</span>
          {x.duration && <span><Ico e="⏱" /> {x.duration}</span>}
          <span><Ico e="📘" /> {x.theory?.length || 0} sections</span>
          <span><Ico e="🧪" /> {x.examples?.length || 0} solved examples</span>
          <span><Ico e="💬" /> {x.interview?.length || 0} Q&amp;A</span>
          <span><Ico e="🛠" /> {x.practice?.length || 0} exercises</span>
          {quiz[k] != null && <span><Ico e="🏆" /> Quiz {quiz[k]}/{x.quiz?.length}</span>}
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
  const hasModules = new Set(t.topics.map((x) => x.module).filter(Boolean)).size > 1;

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
      <div className="track-banner"><CourseCover track={t} height={190} wide /></div>
      <RecordedVideos track={track} />
      <LessonMaterials track={track} />
      <div className="page-head" style={{ borderLeftColor: t.color }}>
        <h1 className="with-icon"><span className="track-icon" style={{ color: t.color }}><TrackIcon track={track} size={26} /></span> {t.name}</h1>
        <p className="muted">{t.tagline}</p>
        <ProgressBar value={t.topics.length ? completed / t.topics.length : 0} color={t.color} />
        <div className="muted small">{completed} / {t.topics.length} completed</div>
      </div>
      {t.group === 'java' && (
        <div className="card info jc-hub">
          <b>Java career hub:</b>
          <Link to="/tools/java-interview"><Ico e="📝" /> Interview test series & mock interviews</Link>
          <Link to="/tools/java-projects"><Ico e="🏗" /> Final Project Studio</Link>
          <Link to="/tools/soft-skills"><Ico e="🗣" /> Soft Skills Lab</Link>
          <Link to="/tools/java-ide"><Ico e="☕" /> Java IDE</Link>
        </div>
      )}
      {t.group === 'web' && (
        <Link to="/tools/web-projects" className="card ts-banner" style={{ '--c': t.color }}>
          <span><Ico e="🌐" /></span>
          <div><b>Web Development Final Projects</b><div className="muted small">Build 8 real projects here with live preview and automated checks: portfolio, Bootstrap landing page, calculator, to-do, quiz, form validation, GitHub finder and a React app</div></div>
          <span className="btn small primary">Build a project →</span>
        </Link>
      )}
      {t.topics.some((x) => x.quiz?.length || x.interview?.length) && (
        <Link to={`/tools/test-series/${track}`} className="card ts-banner" style={{ '--c': t.color }}>
          <span><Ico e="🎯" /></span>
          <div><b>{t.short} Test Series</b><div className="muted small">Practice sets, module-wise and lesson-wise tests, a grand test and mock interviews for this course</div></div>
          <span className="btn small primary">Take a test →</span>
        </Link>
      )}
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
