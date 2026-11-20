import { Link } from 'react-router-dom';
import {
  Sparkles, BarChart3, Layers, Globe, Coffee, Terminal, Cpu, Database, MessageCircle, Library, ArrowRight,
} from 'lucide-react';
import { TrackIcon } from './Icons.jsx';
import { trackGroups, tracks } from '../data/index.js';

// Icon and one-line description of each career track (all cards use the same purple theme)
const META = {
  ai: { icon: Sparkles, text: 'Prompting, machine learning, GenAI tools and building AI apps' },
  data: { icon: BarChart3, text: 'Excel, Power BI, DAX, Power Query and business dashboards' },
  mern: { icon: Layers, text: 'MongoDB, Express, React and Node.js with TypeScript' },
  web: { icon: Globe, text: 'HTML, CSS, JavaScript, React, Next.js, Vue and Bootstrap' },
  java: { icon: Coffee, text: 'Core Java, Collections, JSP/Servlets, Hibernate, Spring Boot' },
  python: { icon: Terminal, text: 'Python, DSA, Django, Flask, FastAPI, data science and ML' },
  dotnet: { icon: Cpu, text: 'C#, OOP, ASP.NET Core, Web API, Entity Framework, SQL Server' },
  db: { icon: Database, text: 'MySQL Workbench, SQL queries, joins, procedures and design' },
  career: { icon: MessageCircle, text: 'Communication, HR interview, group discussion and email writing' },
};
const FALLBACK = { icon: Library, text: 'Day-wise lessons from basics to advanced' };

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
              <Link key={g.key} to="/home" className="lg-card ld-rv" style={{ '--d': `${gi * 70}ms` }}>
                <div className="lg-head">
                  <span className="lg-icon"><I size={24} strokeWidth={1.8} /></span>
                  <span className="lg-count">{lessons} lessons</span>
                </div>
                <h3 className="lg-name">{g.name}</h3>
                <p className="lg-desc">{m.text}</p>
                <div className="lg-chips">
                  {g.ts.map((t) => (
                    <span key={t.key}><TrackIcon track={t.key} size={13} /> {t.short}</span>
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
