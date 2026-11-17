import { Link } from 'react-router-dom';
import { tracks, trackGroups, topicKey } from '../data/index.js';
import { useProgress } from '../progress.js';
import ProgressBar from './ProgressBar.jsx';

export default function TrackCards() {
  const { done, quiz } = useProgress();
  return trackGroups.map((g) => (
    <section key={g.key} className="track-group">
      <h2 className="section-title">{g.name}</h2>
      <div className="grid3">
        {g.tracks.map((k) => tracks[k]).map((t) => {
          const total = t.topics.length;
          const completed = t.topics.filter((x) => done[topicKey(t.key, x.id)]).length;
          const iq = t.topics.reduce((s, x) => s + (x.interview?.length || 0), 0);
          const quizzes = t.topics.filter((x) => quiz[topicKey(t.key, x.id)] != null).length;
          return (
            <Link key={t.key} to={`/track/${t.key}`} className="card track-card" style={{ borderTopColor: t.color }}>
              <div className="track-icon">{t.icon}</div>
              <h3>{t.name}</h3>
              <p className="muted small">{t.tagline}</p>
              <div className="stats">
                <div><b>{total}</b><span>Lessons</span></div>
                <div><b>{iq}</b><span>Interview Q&amp;A</span></div>
                <div><b>{quizzes}/{total}</b><span>Quizzes</span></div>
              </div>
              <ProgressBar value={total ? completed / total : 0} color={t.color} />
              <div className="muted small">{total ? `${completed} of ${total} completed` : 'Content coming soon'}</div>
            </Link>
          );
        })}
      </div>
    </section>
  ));
}
