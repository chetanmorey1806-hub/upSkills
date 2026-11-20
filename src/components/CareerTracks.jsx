import { Link } from 'react-router-dom';
import {
  Sparkles, BarChart3, Layers, Globe, Coffee, Terminal, Cpu, Database, MessageCircle, Library, ArrowRight, BookOpen, CalendarDays,
} from 'lucide-react';
import { TrackIcon } from './Icons.jsx';
import { trackGroups, tracks } from '../data/index.js';

// Look of each career track card: icon, two gradient colours and a one-line description
const META = {
  ai: { icon: Sparkles, g: ['#9333ea', '#ec4899'], text: 'Prompting, machine learning, GenAI tools and building AI apps' },
  data: { icon: BarChart3, g: ['#16a34a', '#0ea5e9'], text: 'Excel, Power BI, DAX, Power Query and business dashboards' },
  mern: { icon: Layers, g: ['#0891b2', '#22c55e'], text: 'MongoDB, Express, React and Node.js with TypeScript' },
  web: { icon: Globe, g: ['#f97316', '#eab308'], text: 'HTML, CSS, JavaScript, React, Next.js, Vue and Bootstrap' },
  java: { icon: Coffee, g: ['#dc2626', '#f59e0b'], text: 'Core Java, Collections, JSP/Servlets, Hibernate, Spring Boot' },
  python: { icon: Terminal, g: ['#1d4ed8', '#0ea5e9'], text: 'Python, DSA, Django, Flask, FastAPI, data science and ML' },
  dotnet: { icon: Cpu, g: ['#7c3aed', '#2563eb'], text: 'C#, OOP, ASP.NET Core, Web API, Entity Framework, SQL Server' },
  db: { icon: Database, g: ['#0284c7', '#14b8a6'], text: 'MySQL Workbench, SQL queries, joins, procedures and design' },
  career: { icon: MessageCircle, g: ['#db2777', '#f97316'], text: 'Communication, HR interview, group discussion and email writing' },
};
const FALLBACK = { icon: Library, g: ['#4f46e5', '#06b6d4'], text: 'Day-wise lessons from basics to advanced' };

export default function CareerTracks() {
  const groups = trackGroups
    .map((g) => ({ ...g, ts: g.tracks.map((k) => tracks[k]).filter((t) => t?.topics?.length) }))
    .filter((g) => g.ts.length);

  return (
    <section id="courses" className="ld-section ld-alt lg-section">
      <div className="ld-wrap">
        <div className="ld-head ld-rv">
          <span className="ld-eyebrow">Courses</span>
          <h2>Career tracks that companies hire for</h2>
          <p>Each track is a day-wise plan from basics to advanced with interview preparation built in.</p>
        </div>
        <div className="lg-grid">
          {groups.map((g, gi) => {
            const m = META[g.key] || FALLBACK;
            const I = m.icon;
            const lessons = g.ts.reduce((s, t) => s + t.topics.length, 0);
            return (
              <Link key={g.key} to="/home" className="lg-card ld-rv" style={{ '--d': `${gi * 70}ms`, '--g1': m.g[0], '--g2': m.g[1] }}>
                <div className="lg-top">
                  <span className="lg-dots" aria-hidden="true" />
                  <span className="lg-icon"><I size={26} strokeWidth={2.2} /></span>
                  <div className="lg-title">
                    <h3>{g.name}</h3>
                    <p>{m.text}</p>
                  </div>
                </div>
                <div className="lg-stats">
                  <span><BookOpen size={14} /> <b>{g.ts.length}</b> {g.ts.length === 1 ? 'course' : 'courses'}</span>
                  <span><CalendarDays size={14} /> <b>{lessons}</b> lessons</span>
                </div>
                <div className="lg-chips">
                  {g.ts.map((t) => (
                    <span key={t.key} style={{ '--c': t.color }}><TrackIcon track={t.key} size={13} /> {t.short}</span>
                  ))}
                </div>
                <span className="lg-foot">Explore track <ArrowRight size={16} /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
