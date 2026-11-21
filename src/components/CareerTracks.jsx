import { Link } from 'react-router-dom';
import {
  Sparkles, BarChart3, Layers, Globe, Coffee, Terminal, Cpu, Database, MessageCircle, Library, ArrowRight,
  BriefcaseBusiness, BookOpen, GraduationCap, Route,
} from 'lucide-react';
import { TrackIcon } from './Icons.jsx';
import { trackGroups, tracks } from '../data/index.js';

// Icon, accent colours, description and typical job roles for each career track
const META = {
  ai: { icon: Sparkles, c1: '#8b5cf6', c2: '#ec4899', text: 'Prompting, machine learning, GenAI tools and building AI apps', roles: ['AI Engineer', 'Prompt Engineer', 'ML Associate'] },
  data: { icon: BarChart3, c1: '#10b981', c2: '#0ea5e9', text: 'Excel, Power BI, DAX, Power Query and business dashboards', roles: ['Data Analyst', 'BI Developer', 'MIS Executive'] },
  mern: { icon: Layers, c1: '#22c55e', c2: '#06b6d4', text: 'MongoDB, Express, React and Node.js with TypeScript', roles: ['MERN Developer', 'Full Stack Dev', 'Node.js Dev'] },
  web: { icon: Globe, c1: '#f97316', c2: '#eab308', text: 'HTML, CSS, JavaScript, React, Next.js, Vue and Bootstrap', roles: ['Frontend Dev', 'React Developer', 'UI Developer'] },
  java: { icon: Coffee, c1: '#ef4444', c2: '#f59e0b', text: 'Core Java, Collections, JSP/Servlets, Hibernate, Spring Boot', roles: ['Java Developer', 'Spring Boot Dev', 'Backend Engineer'] },
  python: { icon: Terminal, c1: '#3b82f6', c2: '#facc15', text: 'Python, DSA, Django, Flask, FastAPI, data science and ML', roles: ['Python Developer', 'Django Dev', 'Data Scientist'] },
  dotnet: { icon: Cpu, c1: '#7c3aed', c2: '#2563eb', text: 'C#, OOP, ASP.NET Core, Web API, Entity Framework, SQL Server', roles: ['.NET Developer', 'C# Developer', 'API Developer'] },
  db: { icon: Database, c1: '#0ea5e9', c2: '#6366f1', text: 'MySQL Workbench, SQL queries, joins, procedures and design', roles: ['SQL Developer', 'DB Admin', 'Data Engineer'] },
  career: { icon: MessageCircle, c1: '#e11d48', c2: '#a855f7', text: 'Communication, HR interview, group discussion and email writing', roles: ['Every role', 'Interview ready', 'Team player'] },
};
const FALLBACK = { icon: Library, c1: '#4f46e5', c2: '#06b6d4', text: 'Day-wise lessons from basics to advanced', roles: [] };
const MAX_CHIPS = 6;

// Moves the soft spotlight with the mouse
const spot = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};

export default function CareerTracks() {
  const groups = trackGroups
    .map((g) => ({ ...g, ts: g.tracks.map((k) => tracks[k]).filter((t) => t?.topics?.length) }))
    .filter((g) => g.ts.length);
  const allCourses = new Set(groups.flatMap((g) => g.ts.map((t) => t.key)));
  const allLessons = [...allCourses].reduce((s, k) => s + tracks[k].topics.length, 0);

  return (
    <section id="courses" className="ld-section ld-alt lg-section">
      <div className="lg-orb lg-orb-a" aria-hidden="true" />
      <div className="lg-orb lg-orb-b" aria-hidden="true" />
      <div className="ld-wrap">
        <div className="ld-head ld-rv">
          <span className="ld-eyebrow">Courses</span>
          <h2>Career tracks that <span className="lg-hl">companies hire for</span></h2>
          <p>Each track is a day-wise plan from basics to advanced with interview preparation built in.</p>
          <div className="lg-totals">
            <span><Route size={16} /> <b>{groups.length}</b> career tracks</span>
            <span><GraduationCap size={16} /> <b>{allCourses.size}</b> courses</span>
            <span><BookOpen size={16} /> <b>{allLessons}+</b> lessons</span>
          </div>
        </div>
        <div className="lg-grid">
          {groups.map((g, gi) => {
            const m = META[g.key] || FALLBACK;
            const I = m.icon;
            const lessons = g.ts.reduce((s, t) => s + t.topics.length, 0);
            const extra = g.ts.length - MAX_CHIPS;
            return (
              <Link key={g.key} to="/home" className="lg-card ld-rv" onMouseMove={spot}
                style={{ '--d': `${(gi % 3) * 90}ms`, '--c1': m.c1, '--c2': m.c2 }}>
                <div className="lg-cover">
                  <I className="lg-watermark" size={120} strokeWidth={1.2} aria-hidden="true" />
                  <span className="lg-no">{String(gi + 1).padStart(2, '0')}</span>
                </div>
                <span className="lg-icon"><I size={26} strokeWidth={1.8} /></span>
                <div className="lg-body">
                  <h3 className="lg-name">{g.name}</h3>
                  <p className="lg-desc">{m.text}</p>
                  <div className="lg-stats">
                    <span><b>{g.ts.length}</b> courses</span>
                    <span><b>{lessons}</b> lessons</span>
                    <span><b>Day-wise</b> plan</span>
                  </div>
                  {m.roles.length > 0 && (
                    <div className="lg-roles">
                      <BriefcaseBusiness size={14} />
                      {m.roles.map((r) => <span key={r}>{r}</span>)}
                    </div>
                  )}
                  <div className="lg-chips">
                    {g.ts.slice(0, MAX_CHIPS).map((t) => (
                      <span key={t.key}><TrackIcon track={t.key} size={13} /> {t.short}</span>
                    ))}
                    {extra > 0 && <span className="lg-more">+{extra} more</span>}
                  </div>
                  <span className="lg-foot">Explore track <span className="lg-arrow"><ArrowRight size={16} /></span></span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
