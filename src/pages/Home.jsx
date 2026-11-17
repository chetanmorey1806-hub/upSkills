import { Link } from 'react-router-dom';
import { tracks, trackOrder, topicKey } from '../data/index.js';
import { useProgress } from '../progress.js';
import ProgressBar from '../components/ProgressBar.jsx';

const steps = [
  ['1', 'Follow the roadmap', 'Study topics in order, one per day. Each builds on the previous one.'],
  ['2', 'Read theory + examples', 'Understand the concept, then walk through worked examples with sample data.'],
  ['3', 'Practice hands-on', 'Do the exercises in real Excel / Power BI, or in the built-in Formula Lab and DAX Lab.'],
  ['4', 'Test yourself', 'Take the topic quiz, then the mixed Quiz Arena for revision.'],
  ['5', 'Prepare interviews', 'Revise interview Q&A with flashcards; bookmark the tough ones.'],
];

export default function Home() {
  const { done, quiz } = useProgress();
  return (
    <div>
      <section className="hero">
        <h1>Master <span className="hl-excel">Excel</span> &amp; <span className="hl-pbi">Power BI</span> step by step</h1>
        <p>
          Complete preparation for students: theory with clear explanations, worked examples,
          interview questions with answers, hands-on practice and built-in practice tools.
        </p>
        <div className="hero-actions">
          <Link to="/roadmap" className="btn primary">Start the roadmap →</Link>
          <Link to="/tools" className="btn">Open practice tools</Link>
        </div>
      </section>

      <section className="grid2">
        {trackOrder.map((k) => tracks[k]).map((t) => {
          const total = t.topics.length;
          const completed = t.topics.filter((x) => done[topicKey(t.key, x.id)]).length;
          const iq = t.topics.reduce((s, x) => s + (x.interview?.length || 0), 0);
          const quizzes = t.topics.filter((x) => quiz[topicKey(t.key, x.id)] != null).length;
          return (
            <Link key={t.key} to={`/track/${t.key}`} className="card track-card" style={{ borderTopColor: t.color }}>
              <div className="track-icon">{t.icon}</div>
              <h2>{t.name}</h2>
              <p className="muted">{t.tagline}</p>
              <div className="stats">
                <div><b>{total}</b><span>Topics</span></div>
                <div><b>{iq}</b><span>Interview Q&amp;A</span></div>
                <div><b>{quizzes}/{total}</b><span>Quizzes taken</span></div>
              </div>
              <ProgressBar value={total ? completed / total : 0} color={t.color} />
              <div className="muted small">{completed} of {total} topics completed</div>
            </Link>
          );
        })}
      </section>

      <section>
        <h2 className="section-title">How to prepare</h2>
        <div className="steps">
          {steps.map(([n, h, p]) => (
            <div key={n} className="card step">
              <div className="step-n">{n}</div>
              <h4>{h}</h4>
              <p className="muted">{p}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
