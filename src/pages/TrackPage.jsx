import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  Play, RotateCcw, Video, Target, Award, ChevronDown, Check, Lock, Clock, Trophy, BookOpen, FlaskConical,
  MessageCircle, Wrench, Search, X, Layers, CalendarDays, CircleDot, ArrowRight, ChevronsUpDown,
} from 'lucide-react';
import { tracks, topicKey, topicLabel } from '../data/index.js';
import { useProgress } from '../progress.js';
import { courseCompletion } from '../study.js';
import { TrackIcon } from '../components/Icons.jsx';
import { CourseCover, RecordedVideos } from '../components/MediaBits.jsx';
import { LessonMaterials } from '../components/MaterialBits.jsx';
import Ico from '../components/Ico.jsx';
import '../styles/track-page.css';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const passed = (x, score) => score != null && x.quiz?.length && score >= Math.ceil(x.quiz.length * 0.6);

function Ring({ value, color, size = 132 }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.round(Math.max(0, Math.min(1, value || 0)) * 100);
  return (
    <div className="tp-ring" style={{ width: size, height: size }} role="img" aria-label={`${pct}% of lessons completed`}>
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <circle cx="60" cy="60" r={r} className="tp-ring-track" />
        <circle cx="60" cy="60" r={r} className="tp-ring-fill" style={{ stroke: color, strokeDasharray: c, strokeDashoffset: c * (1 - pct / 100) }} />
      </svg>
      <div className="tp-ring-label"><b>{pct}%</b><span>complete</span></div>
    </div>
  );
}

function LessonNode({ track, x, idx, status, quiz }) {
  const k = topicKey(track, x.id);
  const score = quiz[k];
  const Icon = status === 'done' ? Check : status === 'current' ? Play : status === 'locked' ? Lock : CircleDot;
  return (
    <li className={`tp-node is-${status}`}>
      <span className="tp-dot" aria-hidden="true"><Icon size={status === 'current' ? 14 : 13} strokeWidth={2.6} /></span>
      <Link to={`/track/${track}/${x.id}`} className="tp-lesson">
        <div className="tp-lesson-top">
          <span className="tp-day">{topicLabel(track, x, idx)}</span>
          {status === 'current' && <span className="tp-tag tp-tag-now">Up next</span>}
          {status === 'done' && <span className="tp-tag tp-tag-done">Completed</span>}
          {x.level && <span className={`lvl lvl-${x.level}`}>{x.level}</span>}
          {score != null && (
            <span className={`tp-score ${passed(x, score) ? 'ok' : ''}`}><Trophy size={12} /> Quiz {score}/{x.quiz?.length}</span>
          )}
        </div>
        <h3>{x.title}</h3>
        {x.summary && <p className="tp-summary">{x.summary}</p>}
        <div className="tp-meta">
          {x.duration && <span><Clock size={13} /> {x.duration}</span>}
          <span><BookOpen size={13} /> {x.theory?.length || 0} sections</span>
          <span><FlaskConical size={13} /> {x.examples?.length || 0} solved examples</span>
          <span><MessageCircle size={13} /> {x.interview?.length || 0} Q&amp;A</span>
          <span><Wrench size={13} /> {x.practice?.length || 0} exercises</span>
        </div>
      </Link>
      <ArrowRight className="tp-go" size={16} aria-hidden="true" />
    </li>
  );
}

export default function TrackPage() {
  const { track } = useParams();
  const t = tracks[track];
  const { done, quiz } = useProgress();
  const [level, setLevel] = useState('All');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null); // null = default (only the current module open)

  const info = useMemo(() => {
    if (!t) return null;
    const topics = t.topics;
    const isDone = (x) => !!done[topicKey(track, x.id)];
    const completed = topics.filter(isDone).length;
    // next lesson = first not-done lesson after the last completed one (falls back to the first not-done)
    let last = -1;
    topics.forEach((x, i) => { if (isDone(x)) last = i; });
    let next = topics.findIndex((x, i) => i > last && !isDone(x));
    if (next === -1) next = topics.findIndex((x) => !isDone(x));
    const status = (x, i) => (isDone(x) ? 'done' : i === next ? 'current' : next !== -1 && i > next ? 'locked' : 'todo');
    const quizPassed = topics.filter((x) => passed(x, quiz[topicKey(track, x.id)])).length;
    const quizTotal = topics.filter((x) => x.quiz?.length).length;
    const levels = LEVELS.map((l) => [l, topics.filter((x) => x.level === l).length]).filter(([, n]) => n);
    const hasModules = new Set(topics.map((x) => x.module).filter(Boolean)).size > 1;
    return { topics, completed, next, status, quizPassed, quizTotal, levels, hasModules };
  }, [t, track, done, quiz]);

  if (!t) return <p>Track not found.</p>;
  const { topics, completed, next, status, quizPassed, quizTotal, levels, hasModules } = info;
  const total = topics.length;
  const cert = courseCompletion(track, topics);
  const nextTopic = next >= 0 ? topics[next] : topics[0];
  const allDone = total > 0 && completed === total;
  const ctaLabel = allDone ? 'Review course' : completed === 0 && next === 0 ? `Start ${topicLabel(track, topics[0], 0)}` : nextTopic ? `Continue ${topicLabel(track, nextTopic, next)}` : '';
  const moduleCount = new Set(topics.map((x) => x.module).filter(Boolean)).size;

  // filter + group into modules (keeps order)
  const needle = q.trim().toLowerCase();
  const filtering = level !== 'All' || !!needle;
  const list = topics.filter((x) => (level === 'All' || x.level === level)
    && (!needle || `${x.title} ${x.summary || ''} ${x.module || ''}`.toLowerCase().includes(needle)));
  const groups = [];
  list.forEach((x) => {
    const m = hasModules ? x.module || 'Other' : '';
    let g = groups.find((gg) => gg.name === m);
    if (!g) groups.push((g = { name: m, items: [] }));
    g.items.push(x);
  });
  const currentModule = hasModules && nextTopic ? nextTopic.module || 'Other' : '';
  const isOpen = (name) => !hasModules || filtering || (open ? open.has(name) : name === currentModule || (allDone && name === groups[0]?.name));
  const toggle = (name) => setOpen((prev) => {
    const s = new Set(prev || groups.filter((g) => isOpen(g.name)).map((g) => g.name));
    s.has(name) ? s.delete(name) : s.add(name);
    return s;
  });
  const allOpen = groups.every((g) => isOpen(g.name));
  const jumpTo = (gi, name) => {
    setOpen((prev) => new Set([...(prev || groups.filter((g) => isOpen(g.name)).map((g) => g.name)), name]));
    setTimeout(() => document.getElementById(`mod-${gi}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };

  return (
    <div className="tp" style={{ '--tc': t.color }}>
      <header className="tp-hero card">
        <div className="tp-cover"><span className="only-wide"><CourseCover track={t} height={130} showTitle={false} wide /></span><span className="only-narrow"><CourseCover track={t} height={100} showTitle={false} /></span></div>
        <div className="tp-hero-body">
          <div className="tp-hero-info">
            <div className="tp-title-row">
              <span className="tp-icon"><TrackIcon track={track} size={30} /></span>
              <div>
                <h1>{t.name}</h1>
                <p className="tp-tagline">{t.tagline}</p>
              </div>
            </div>
            <div className="tp-badges">
              <span className="tp-badge"><CalendarDays size={14} /> {total} {t.unit === 'Day' ? 'days' : `${(t.unit || 'topic').toLowerCase()}s`}</span>
              {moduleCount > 1 && <span className="tp-badge"><Layers size={14} /> {moduleCount} modules</span>}
              {levels.map(([l, n]) => <span key={l} className={`lvl lvl-${l}`}>{l} · {n}</span>)}
            </div>
            <div className="tp-actions">
              {total > 0 && (
                <Link className="btn primary tp-cta" to={`/track/${track}/${(allDone ? topics[0] : nextTopic).id}`}>
                  {allDone ? <RotateCcw size={18} /> : <Play size={18} />} {ctaLabel}
                </Link>
              )}
              <Link className="btn" to={`/videos?course=${track}`}><Video size={16} /> Videos</Link>
              <Link className="btn" to={`/tools/test-series/${track}`}><Target size={16} /> Test Series</Link>
              <Link className="btn" to={`/study/certificate/${track}`}><Award size={16} /> Certificate</Link>
            </div>
            {nextTopic && !allDone && <div className="tp-next muted small">Next: <b>{nextTopic.title}</b>{nextTopic.duration ? ` · ${nextTopic.duration}` : ''}</div>}
          </div>
          <div className="tp-progress">
            <Ring value={total ? completed / total : 0} color={t.color} />
            <div className="tp-stats">
              <div><b>{completed}<small> / {total}</small></b><span>lessons done</span></div>
              <div><b>{quizPassed}<small> / {quizTotal}</small></b><span>quizzes passed</span></div>
            </div>
          </div>
        </div>
        {cert.eligible ? (
          <Link to={`/study/certificate/${track}`} className="tp-cert on">
            <Award size={20} /><div><b>Certificate unlocked</b><span>You completed every lesson and passed the grand test ({cert.grand}%). View, print or save it as PDF.</span></div><ArrowRight size={18} />
          </Link>
        ) : total > 0 && (
          <div className="tp-cert">
            <Lock size={18} /><div><b>Certificate locked</b><span>Finish all lessons ({cert.done}/{cert.total}) and pass the grand test with 60%+ ({cert.grand != null ? `best ${cert.grand}%` : 'not taken yet'}).</span></div>
          </div>
        )}
      </header>

      <RecordedVideos track={track} />
      <LessonMaterials track={track} />

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
          <span className="btn small primary">Build a project <ArrowRight size={14} /></span>
        </Link>
      )}
      {topics.some((x) => x.quiz?.length || x.interview?.length) && (
        <Link to={`/tools/test-series/${track}`} className="card ts-banner" style={{ '--c': t.color }}>
          <span><Ico e="🎯" /></span>
          <div><b>{t.short} Test Series</b><div className="muted small">Practice sets, module-wise and lesson-wise tests, a grand test and mock interviews for this course</div></div>
          <span className="btn small primary">Take a test <ArrowRight size={14} /></span>
        </Link>
      )}

      <div className="tp-toolbar">
        <div className="chips">
          {['All', ...LEVELS].map((l) => (
            <button key={l} className={`chip ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)}>{l}</button>
          ))}
        </div>
        <label className="tp-search">
          <Search size={15} aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search lessons" aria-label="Search lessons" />
          {q && <button type="button" onClick={() => setQ('')} aria-label="Clear search"><X size={14} /></button>}
        </label>
        {hasModules && !filtering && (
          <button type="button" className="btn small" onClick={() => setOpen(allOpen ? new Set() : new Set(groups.map((g) => g.name)))}>
            <ChevronsUpDown size={15} /> {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        )}
      </div>

      {hasModules && groups.length > 0 && (
        <nav className="tp-toc" aria-label="Modules">
          {groups.map((g, i) => {
            const gDone = g.items.filter((x) => done[topicKey(track, x.id)]).length;
            return (
              <a key={g.name} href={`#mod-${i}`} className={gDone === g.items.length ? 'is-done' : g.name === currentModule ? 'is-current' : ''}
                onClick={(e) => { e.preventDefault(); jumpTo(i, g.name); }}>
                {gDone === g.items.length && <Check size={13} />} {g.name}
              </a>
            );
          })}
        </nav>
      )}

      {total === 0 && <p className="muted">Content is being added. Check back soon.</p>}
      {total > 0 && list.length === 0 && <p className="muted">No lessons match this filter.</p>}

      <div className="tp-timeline">
        {groups.map((g, gi) => {
          const gDone = g.items.filter((x) => done[topicKey(track, x.id)]).length;
          const opened = isOpen(g.name);
          const pct = g.items.length ? Math.round((gDone / g.items.length) * 100) : 0;
          const isCur = g.name === currentModule;
          return (
            <section key={g.name || 'all'} id={`mod-${gi}`} className={`tp-module ${opened ? 'open' : ''} ${isCur ? 'is-current' : ''} ${gDone === g.items.length ? 'is-done' : ''}`}>
              {g.name && (
                <button type="button" className="tp-mod-head" onClick={() => !filtering && toggle(g.name)} aria-expanded={opened} disabled={filtering}>
                  <span className="tp-mod-num">{gDone === g.items.length ? <Check size={16} strokeWidth={3} /> : gi + 1}</span>
                  <span className="tp-mod-text">
                    <span className="tp-mod-title">{g.name}{isCur && <span className="tp-tag tp-tag-now">Current</span>}</span>
                    <span className="tp-mod-bar"><span style={{ width: `${pct}%` }} /></span>
                    <span className="tp-mod-count">{gDone}/{g.items.length} done · {pct}%</span>
                  </span>
                  {!filtering && <ChevronDown className="tp-chev" size={20} />}
                </button>
              )}
              {opened && (
                <ol className="tp-nodes">
                  {g.items.map((x) => {
                    const idx = topics.indexOf(x);
                    return <LessonNode key={x.id} track={track} x={x} idx={idx} status={status(x, idx)} quiz={quiz} />;
                  })}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
