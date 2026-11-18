import { Link } from 'react-router-dom';
import { tracks, trackGroups, topicKey } from '../data/index.js';
import { useProgress } from '../progress.js';
import ProgressBar from './ProgressBar.jsx';
import { usePerms } from '../permissions.js';
import { TrackIcon } from './Icons.jsx';
import { BrainCircuit, BarChart3, Globe, Coffee, Code2, Cpu, Database } from 'lucide-react';

const GROUP_ICONS = { ai: BrainCircuit, data: BarChart3, web: Globe, java: Coffee, python: Code2, dotnet: Cpu, db: Database };

export default function TrackCards() {
  const { done, quiz } = useProgress();
  const { canCourse } = usePerms();
  return trackGroups.filter((g) => g.tracks.some((k) => tracks[k] && canCourse(k))).map((g) => (
    <section key={g.key} className="track-group">
      <h2 className="section-title group-title">{(() => { const G = GROUP_ICONS[g.key]; return G ? <G size={22} /> : null; })()} {g.name}</h2>
      <div className="grid3">
        {g.tracks.filter((k) => tracks[k] && canCourse(k)).map((k) => tracks[k]).map((t) => {
          const total = t.topics.length;
          const completed = t.topics.filter((x) => done[topicKey(t.key, x.id)]).length;
          const iq = t.topics.reduce((s, x) => s + (x.interview?.length || 0), 0);
          const quizzes = t.topics.filter((x) => quiz[topicKey(t.key, x.id)] != null).length;
          return (
            <Link key={t.key} to={`/track/${t.key}`} className="card track-card" style={{ borderTopColor: t.color }}>
              <div className="track-icon" style={{ color: t.color, background: `color-mix(in srgb, ${t.color} 12%, transparent)` }}><TrackIcon track={t.key} size={24} /></div>
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
