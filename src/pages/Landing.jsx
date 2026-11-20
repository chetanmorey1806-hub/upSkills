import { useEffect, useRef, useState } from 'react';
import HeroBanner from '../components/HeroBanner.jsx';
import { Link } from 'react-router-dom';
import { useAuth, logout, firstName } from '../auth.js';
import {
  BookOpenCheck, Code2, ClipboardCheck, Hammer, MessageCircle, Sparkles, ArrowRight, LayoutDashboard,
  GraduationCap, Laptop, Trophy, Briefcase, Rocket, CheckCircle2, Flame, Menu, X, LogIn, UserPlus, LogOut,
} from 'lucide-react';
import Logo from '../components/Logo.jsx';
import PackagesSection from '../components/PackagesSection.jsx';
import { TrackIcon } from '../components/Icons.jsx';
import { allTopics, trackGroups, tracks, trackOrder } from '../data/index.js';
import { codingProblems, javaProjects } from '../data/javaCareer.js';

const WORDS = ['Java Full Stack', 'Python', 'Power BI', 'Artificial Intelligence', '.NET', 'React', 'Excel', 'MySQL'];
const TECH = ['Java', 'Spring Boot', 'Hibernate', 'React', 'JavaScript', 'Python', 'Django', 'MySQL', 'Docker', 'Kubernetes', 'Kafka', 'Power BI', 'Excel', 'DAX', 'C#', 'ASP.NET Core', 'HTML5', 'CSS3', 'Git', 'AWS', 'Claude AI', 'Redis', 'MongoDB', 'JUnit'];

const SNIPPETS = [
  ['student.py', [
    ['k', 'class '], ['t', 'Student'], ['p', ':'], ['n'],
    ['p', '    '], ['k', 'def '], ['f', '__init__'], ['p', '(self, name, marks):'], ['n'],
    ['p', '        self.name, self.marks = name, marks'], ['n'], ['n'],
    ['p', '    '], ['k', 'def '], ['f', 'grade'], ['p', '(self):'], ['n'],
    ['p', '        '], ['k', 'if'], ['p', ' self.marks >= '], ['v', '75'], ['p', ': '], ['k', 'return '], ['s', '"Distinction"'], ['n'],
    ['p', '        '], ['k', 'return '], ['s', '"Pass"'], ['k', ' if'], ['p', ' self.marks >= '], ['v', '35'], ['k', ' else '], ['s', '"Fail"'], ['n'],
  ]],
  ['Student.java', [
    ['k', 'public class '], ['t', 'Student'], ['p', ' {'], ['n'],
    ['p', '  '], ['k', 'private '], ['t', 'String'], ['p', ' name;'], ['n'],
    ['p', '  '], ['k', 'private int'], ['p', ' marks;'], ['n'], ['n'],
    ['p', '  '], ['k', 'public '], ['t', 'String'], ['f', ' grade'], ['p', '() {'], ['n'],
    ['p', '    '], ['k', 'return'], ['p', ' marks >= '], ['v', '75'], ['p', ' ? '], ['s', '"Distinction"'], ['n'],
    ['p', '         : marks >= '], ['v', '35'], ['p', ' ? '], ['s', '"Pass"'], ['p', ' : '], ['s', '"Fail"'], ['p', ';'], ['n'],
    ['p', '  }'], ['n'],
    ['p', '}'],
  ]],
  ['top_students.sql', [
    ['k', 'SELECT '], ['p', 'name, marks,'], ['n'],
    ['p', '  '], ['k', 'CASE WHEN '], ['p', 'marks >= '], ['v', '75'], ['k', ' THEN '], ['s', "'Distinction'"], ['n'],
    ['p', '       '], ['k', 'WHEN '], ['p', 'marks >= '], ['v', '35'], ['k', ' THEN '], ['s', "'Pass'"], ['n'],
    ['p', '       '], ['k', 'ELSE '], ['s', "'Fail'"], ['k', ' END '], ['k', 'AS '], ['p', 'grade'], ['n'],
    ['k', 'FROM '], ['t', 'students'], ['n'],
    ['k', 'ORDER BY '], ['p', 'marks '], ['k', 'DESC'], ['p', ';'],
  ]],
  ['Grade.jsx', [
    ['k', 'export default function '], ['f', 'Grade'], ['p', '({ marks }) {'], ['n'],
    ['p', '  '], ['k', 'const '], ['p', 'grade = marks >= '], ['v', '75'], ['p', ' ? '], ['s', "'Distinction'"], ['n'],
    ['p', '    : marks >= '], ['v', '35'], ['p', ' ? '], ['s', "'Pass'"], ['p', ' : '], ['s', "'Fail'"], ['p', ';'], ['n'],
    ['p', '  '], ['k', 'return '], ['p', '<'], ['t', 'span'], ['p', '>{grade}</'], ['t', 'span'], ['p', '>;'], ['n'],
    ['p', '}'],
  ]],
];
const codeLen = (code) => code.reduce((s, [, t]) => s + (t ? t.length : 1), 0);

// fade/slide sections in as they scroll into view
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const els = root.querySelectorAll('.ld-rv');
    if (typeof IntersectionObserver === 'undefined') { els.forEach((e) => e.classList.add('in')); return undefined; }
    const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return ref;
}

function Counter({ to, suffix = '+' }) {
  const ref = useRef(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf, fallback;
    const run = () => {
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.max(0, Math.min(1, (t - t0) / 1400));
        setV(Math.round(to * (1 - (1 - k) ** 3)));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      fallback = setTimeout(() => setV(to), 1700);
    };
    if (typeof IntersectionObserver === 'undefined') { setV(to); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { run(); io.disconnect(); } });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); clearTimeout(fallback); };
  }, [to]);
  return <b ref={ref}>{v.toLocaleString('en-IN')}{suffix}</b>;
}

function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % WORDS.length), 2200); return () => clearInterval(id); }, []);
  return <span className="ld-rot" aria-live="polite"><span key={i} className="ld-rot-word">{WORDS[i]}</span></span>;
}

function TypingCode({ onFile }) {
  const [st, setSt] = useState({ i: 0, n: 0 });
  useEffect(() => {
    const id = setInterval(() => setSt(({ i, n }) => (n >= codeLen(SNIPPETS[i][1]) + 40 ? { i: (i + 1) % SNIPPETS.length, n: 0 } : { i, n: n + 1 })), 45);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { onFile?.(SNIPPETS[st.i][0]); }, [st.i, onFile]);
  let left = st.n;
  const out = [];
  SNIPPETS[st.i][1].forEach(([c, t], i) => {
    if (left <= 0) return;
    if (c === 'n') { out.push(<br key={i} />); left -= 1; return; }
    out.push(<span key={i} className={`ld-c-${c}`}>{t.slice(0, left)}</span>);
    left -= t.length;
  });
  return <code>{out}<span className="ld-caret" /></code>;
}

const FEATURES = [
  [BookOpenCheck, 'Day-wise courses', 'Every lesson has simple theory, solved examples, interview Q&A, hands-on practice and a quiz. Learn one topic a day.'],
  [Code2, 'Practice in the browser', 'Java, Python, C# and web IDEs, MySQL Workbench, SSMS, Excel formula, DAX and Power Query labs. Nothing to install.'],
  [ClipboardCheck, 'Interview test series', 'Timed grand, course-wise and module-wise tests, mock technical and HR interviews, and a coding round.'],
  [Hammer, 'Final projects', 'Real projects from console apps to Spring Boot microservices, with milestones, starter code, viva Q&A and a project report.'],
  [MessageCircle, 'Soft skills lab', 'Self-introduction, speaking practice with speed and filler-word analysis, HR answers, STAR stories, GD and emails.'],
  [Sparkles, 'AI tools', 'Prompt lab, AI concepts lab, ML playground and an AI app builder to learn how modern AI really works.'],
];

const JOURNEY = [
  [GraduationCap, 'Learn', 'Follow the day-wise roadmap'],
  [Laptop, 'Practise', 'Code in the built-in IDEs and labs'],
  [Trophy, 'Test', 'Quizzes and timed test series'],
  [Rocket, 'Build', 'Finish a final project'],
  [MessageCircle, 'Communicate', 'Train your soft skills'],
  [Briefcase, 'Get hired', 'Crack technical and HR rounds'],
];

export default function Landing() {
  const ref = useReveal();
  const user = useAuth();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [file, setFile] = useState(SNIPPETS[0][0]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { document.title = 'UpSkillr – Learn, Practise, Get Hired'; }, []);

  const lessons = allTopics.length;
  const qa = allTopics.reduce((s, t) => s + (t.interview?.length || 0), 0);
  const quiz = allTopics.reduce((s, t) => s + (t.quiz?.length || 0), 0);
  const go = (id) => (e) => { e.preventDefault(); setMenu(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <div className="ld" ref={ref}>
      <header className={`ld-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="ld-wrap ld-nav-in">
          <Link to="/" className="brand"><Logo size={32} /><span className="brand-name">Up<b>Skillr</b></span></Link>
          <nav className={`ld-links ${menu ? 'open' : ''}`}>
            <a href="#features" onClick={go('features')}>Features</a>
            <a href="#courses" onClick={go('courses')}>Courses</a>
            <a href="#packages" onClick={go('packages')}>Packages</a>
            <a href="#career" onClick={go('career')}>Career prep</a>
            <a href="#journey" onClick={go('journey')}>How it works</a>
            {user ? (
              <>
                <span className="ld-user"><span className="ld-ava">{firstName(user).charAt(0).toUpperCase()}</span>{firstName(user)}</span>
                <Link to="/dashboard" className="btn small primary"><LayoutDashboard size={15} /> Dashboard</Link>
                <button className="btn small" onClick={logout}><LogOut size={15} /> Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn small"><LogIn size={15} /> Sign in</Link>
                <Link to="/register" className="btn small primary"><UserPlus size={15} /> Register</Link>
              </>
            )}
          </nav>
          <button className="ld-burger" onClick={() => setMenu(!menu)} aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu}>{menu ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </header>

      {/* BANNER SLIDER (first section) */}
      <HeroBanner user={user} onJump={go} />

      {/* HERO */}
      <section className="ld-hero">
        <div className="ld-bg" aria-hidden="true"><span className="ld-blob b1" /><span className="ld-blob b2" /><span className="ld-blob b3" /><span className="ld-grid" /></div>
        <div className="ld-wrap ld-hero-in">
          <div className="ld-hero-text">
            <div className="ld-pill"><Flame size={14} /> {trackOrder.length}+ courses · {lessons}+ day-wise lessons · free to start</div>
            <h1>Become job-ready in <br /><RotatingWord /></h1>
            <p>Learn step by step with clear theory and examples, practise in built-in IDEs, take interview test series, build a final project and train your soft skills — all in one place.</p>
            <div className="ld-cta">
              {user ? (
                <>
                  <Link to="/home" className="btn primary ld-big">Continue learning <ArrowRight size={18} /></Link>
                  <Link to="/dashboard" className="btn ld-big"><LayoutDashboard size={18} /> My dashboard</Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn primary ld-big"><UserPlus size={18} /> Register free</Link>
                  <Link to="/login" className="btn ld-big"><LogIn size={18} /> Sign in</Link>
                </>
              )}
            </div>
            <div className="ld-trust"><CheckCircle2 size={15} /> {user ? `Signed in as ${user.username}` : 'Free account · your own progress, tests and projects'} · works on mobile</div>
          </div>
          <div className="ld-hero-art" aria-hidden="true">
            <div className="ld-window">
              <div className="ld-win-bar"><i /><i /><i /><span>{file}</span></div>
              <pre><TypingCode onFile={setFile} /></pre>
            </div>
            <div className="ld-float f1"><Trophy size={16} /> Quiz score <b>5/5</b></div>
            <div className="ld-float f2"><Flame size={16} /> <b>7-day</b> streak</div>
            <div className="ld-float f3"><Rocket size={16} /> Project <b>80%</b> done</div>
            <div className="ld-float f4"><ClipboardCheck size={16} /> Mock test <b>86%</b></div>
          </div>
        </div>
        <div className="ld-wrap ld-stats">
          <div><Counter to={trackOrder.length} /><span>Courses</span></div>
          <div><Counter to={lessons} /><span>Lessons</span></div>
          <div><Counter to={qa} /><span>Interview Q&amp;A</span></div>
          <div><Counter to={quiz} /><span>Quiz questions</span></div>
          <div><Counter to={codingProblems.length + javaProjects.length} /><span>Coding problems &amp; projects</span></div>
        </div>
      </section>

      {/* TECH MARQUEE */}
      <section className="ld-marquee" aria-label="Technologies covered">
        <div className="ld-track">{[...TECH, ...TECH].map((t, i) => <span key={i}>{t}</span>)}</div>
      </section>

      {/* FEATURES */}
      <section id="features" className="ld-section">
        <div className="ld-wrap">
          <div className="ld-head ld-rv"><span className="ld-eyebrow">Everything in one place</span><h2>Learn it. Practise it. Prove it.</h2><p>Not just videos or notes: every skill is learned, practised and tested inside the app.</p></div>
          <div className="ld-features">
            {FEATURES.map(([I, h, p], i) => (
              <div key={h} className="ld-feature ld-rv" style={{ '--d': `${i * 70}ms` }}>
                <div className="ld-ficon"><I size={24} strokeWidth={1.8} /></div>
                <h3>{h}</h3><p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section id="courses" className="ld-section ld-alt">
        <div className="ld-wrap">
          <div className="ld-head ld-rv"><span className="ld-eyebrow">Courses</span><h2>Career tracks that companies hire for</h2><p>Each track is a day-wise plan from basics to advanced with interview preparation built in.</p></div>
          <div className="ld-groups">
            {trackGroups.map((g, gi) => {
              const ts = g.tracks.map((k) => tracks[k]).filter(Boolean);
              const n = ts.reduce((s, t) => s + t.topics.length, 0);
              return (
                <Link key={g.key} to="/home" className="ld-group ld-rv" style={{ '--d': `${gi * 60}ms` }}>
                  <div className="ld-group-top"><h3>{g.name}</h3><span>{n} lessons</span></div>
                  <div className="ld-chips">{ts.map((t) => <span key={t.key} style={{ '--c': t.color }}><TrackIcon track={t.key} size={14} /> {t.short}</span>)}</div>
                  <span className="ld-more">Explore <ArrowRight size={14} /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <PackagesSection />

      {/* CAREER PREP */}
      <section id="career" className="ld-section">
        <div className="ld-wrap ld-career">
          <div className="ld-rv">
            <span className="ld-eyebrow">Placement preparation</span>
            <h2>From learning to your first job offer</h2>
            <p>The Java career hub prepares students for every round of a fresher interview.</p>
            <ul className="ld-list">
              <li><CheckCircle2 size={18} /> Timed test series with score history</li>
              <li><CheckCircle2 size={18} /> Mock technical &amp; HR interviews — type or speak your answer</li>
              <li><CheckCircle2 size={18} /> {codingProblems.length} coding-round problems with solutions</li>
              <li><CheckCircle2 size={18} /> {javaProjects.length} guided final projects with a downloadable report</li>
              <li><CheckCircle2 size={18} /> Soft skills: self-intro, GD, STAR answers, email writing</li>
            </ul>
            <div className="ld-cta left">
              <Link to="/tools/java-interview" className="btn primary">Take a mock test <ArrowRight size={16} /></Link>
              <Link to="/tools/soft-skills" className="btn">Soft Skills Lab</Link>
            </div>
          </div>
          <div className="ld-cards ld-rv" style={{ '--d': '120ms' }}>
            <Link to="/tools/java-interview" className="ld-mini c1"><ClipboardCheck size={22} /><b>Test series</b><span>Grand · course · module tests</span></Link>
            <Link to="/tools/java-projects" className="ld-mini c2"><Hammer size={22} /><b>Final projects</b><span>Milestones · viva · report</span></Link>
            <Link to="/tools/soft-skills" className="ld-mini c3"><MessageCircle size={22} /><b>Soft skills</b><span>Speak · write · present</span></Link>
            <Link to="/dashboard" className="ld-mini c4"><LayoutDashboard size={22} /><b>Dashboard</b><span>Progress · streak · readiness</span></Link>
          </div>
        </div>
      </section>

      {/* JOURNEY */}
      <section id="journey" className="ld-section ld-alt">
        <div className="ld-wrap">
          <div className="ld-head ld-rv"><span className="ld-eyebrow">How it works</span><h2>Your path, one step at a time</h2></div>
          <ol className="ld-journey">
            {JOURNEY.map(([I, h, p], i) => (
              <li key={h} className="ld-rv" style={{ '--d': `${i * 90}ms` }}>
                <div className="ld-jdot"><I size={22} /></div>
                <b>{i + 1}. {h}</b><span>{p}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="ld-section">
        <div className="ld-wrap">
          <div className="ld-final ld-rv">
            <h2>Start today. Your future self will thank you.</h2>
            <p>Pick a course, finish one lesson a day, and watch your dashboard grow.</p>
            <div className="ld-cta">
              <Link to="/home" className="btn ld-big ld-white">Explore courses <ArrowRight size={18} /></Link>
              <Link to="/roadmap" className="btn ld-big ld-ghost">See the roadmap</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand"><Logo size={28} /><span className="brand-name">Up<b>Skillr</b></span></div>
          <p className="footer-tag">Learn any tech, one day at a time</p>
          <div className="footer-credit">Developed by <b>ER. Chetan D Morey</b></div>
          <div className="footer-copy">© {new Date().getFullYear()} UpSkillr. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
