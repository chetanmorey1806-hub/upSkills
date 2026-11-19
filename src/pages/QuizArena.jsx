import { useEffect, useState } from 'react';
import { allTopics, trackOrder, tracks } from '../data/index.js';
import Quiz from '../components/Quiz.jsx';

import Ico from '../components/Ico.jsx';
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export default function QuizArena() {
  const [track, setTrack] = useState('both');
  const [level, setLevel] = useState('All');
  const [count, setCount] = useState(15);
  const [timer, setTimer] = useState(0); // minutes; 0 = off
  const [qs, setQs] = useState(null);
  const [left, setLeft] = useState(0);
  const [runId, setRunId] = useState(0);
  const [finished, setFinished] = useState(false);

  const pool = allTopics
    .filter((t) => track === 'both' || t.track === track)
    .filter((t) => level === 'All' || t.level === level)
    .flatMap((t) => (t.quiz || []).map((q) => ({ ...q, source: `${tracks[t.track].short} · ${t.title}` })));

  const start = () => {
    setQs(shuffle(pool).slice(0, count));
    setLeft(timer * 60);
    setFinished(false);
    setRunId((r) => r + 1);
  };

  useEffect(() => {
    if (!qs || !timer || finished) return undefined;
    if (left <= 0) { setFinished(true); return undefined; }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [qs, left, timer, finished]);

  return (
    <div>
      <div className="page-head">
        <h1><Ico e="🏆" /> Quiz Arena</h1>
        <p className="muted">Random questions from all topics, like a real test. {pool.length} questions available with the current settings.</p>
        <div className="quiz-settings">
          <label>Track <select value={track} onChange={(e) => setTrack(e.target.value)}><option value="both">All courses</option>{trackOrder.map((k) => <option key={k} value={k}>{tracks[k].name}</option>)}</select></label>
          <label>Level <select value={level} onChange={(e) => setLevel(e.target.value)}>{['All', 'Beginner', 'Intermediate', 'Advanced'].map((l) => <option key={l}>{l}</option>)}</select></label>
          <label>Questions <select value={count} onChange={(e) => setCount(Number(e.target.value))}>{[10, 15, 20, 30, 50].map((n) => <option key={n}>{n}</option>)}</select></label>
          <label>Timer <select value={timer} onChange={(e) => setTimer(Number(e.target.value))}><option value={0}>Off</option>{[5, 10, 15, 20, 30].map((n) => <option key={n} value={n}>{n} min</option>)}</select></label>
          <button className="btn primary" onClick={start} disabled={!pool.length}>{qs ? 'New quiz' : 'Start quiz'}</button>
        </div>
      </div>
      {qs && timer > 0 && (
        <div className={`timer ${left < 60 ? 'low' : ''}`}>
          {finished ? <><Ico e="⏰" /> Time's up! Submit to see your score.</> : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`}
        </div>
      )}
      {qs && <Quiz key={runId} questions={qs} onFinish={() => setFinished(true)} />}
    </div>
  );
}
