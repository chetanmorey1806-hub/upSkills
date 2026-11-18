import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Home, BookOpen, Map as MapIcon, Wrench, Sparkles, Rocket, Code2, Coffee, Terminal, Database, Cpu, Server, Search, ClipboardCheck, MessageCircle, Trophy, Hammer, LayoutDashboard } from 'lucide-react';
import Logo from './Logo.jsx';

const ic = (I) => <I size={16} strokeWidth={2} />;
const links = [
  { to: '/home', label: 'Home', icon: ic(Home), end: true },
  { to: '/dashboard', label: 'Dashboard', icon: ic(LayoutDashboard) },
  { to: '/courses', label: 'Courses', icon: ic(BookOpen) },
  { to: '/roadmap', label: 'Roadmap', icon: ic(MapIcon) },
  { to: '/tools', label: 'Practice Tools', icon: ic(Wrench), end: true },
  { to: '/tools/ai-lab', label: 'AI Lab', icon: ic(Sparkles) },
  { to: '/tools/ai-app-builder', label: 'AI App Builder', icon: ic(Rocket) },
  { to: '/tools/playground', label: 'Web', icon: ic(Code2) },
  { to: '/tools/api-lab', label: 'API Lab', icon: ic(Server) },
  { to: '/tools/java-ide', label: 'Java', icon: ic(Coffee) },
  { to: '/tools/java-interview', label: 'Interview Prep', icon: ic(ClipboardCheck) },
  { to: '/tools/soft-skills', label: 'Soft Skills', icon: ic(MessageCircle) },
  { to: '/tools/test-series', label: 'Test Series', icon: ic(Trophy) },
  { to: '/tools/python-projects', label: 'Python Projects', icon: ic(Hammer) },
  { to: '/tools/mern-projects', label: 'MERN Projects', icon: ic(Rocket) },
  { to: '/tools/mongo-lab', label: 'MongoDB', icon: ic(Database) },
  { to: '/tools/python-ide', label: 'Python', icon: ic(Terminal) },
  { to: '/tools/mysql-workbench', label: 'MySQL', icon: ic(Database) },
  { to: '/tools/csharp-ide', label: 'C#', icon: ic(Cpu) },
  { to: '/tools/ssms-lab', label: 'SSMS', icon: ic(Server) },
];

const REVEAL_SEL = '.card, .section-title, .module-head, .page-head, .tl-item';

// Fades elements in as they scroll into view (also picks up content rendered later, e.g. tab switches).
function useScrollReveal(rootRef, key) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target); }
      }),
      { rootMargin: '0px 0px -40px 0px', threshold: 0.05 },
    );
    const scan = () => {
      const vh = window.innerHeight;
      let stagger = 0;
      root.querySelectorAll(REVEAL_SEL).forEach((el) => {
        if (el.dataset.rv) return;
        el.dataset.rv = '1';
        if (el.closest('.pg, .jide, .wb, .vs')) return; // leave IDE panels alone
        const r = el.getBoundingClientRect();
        el.classList.add('rv');
        if (r.top < vh) el.style.setProperty('--rv-d', `${Math.min(stagger++, 8) * 55}ms`);
        io.observe(el);
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [rootRef, key]);
}

export default function Layout({ children }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const nav = useNavigate();
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  useScrollReveal(mainRef, pathname);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const el = document.querySelector('.nav-links a.active');
    const box = el?.parentElement;
    if (el && box && box.scrollWidth > box.clientWidth) box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + el.offsetWidth / 2 });
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 8);
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };

  return (
    <div className="app">
      <header className={`topbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <Logo size={32} />
            <span className="brand-name">Up<b>Skillr</b></span>
          </Link>
          <button
            className={`menu-btn ${open ? 'is-open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
          <div className={`nav-overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
          <nav className={`nav ${open ? 'open' : ''}`}>
            <div className="nav-head">
              <span className="brand"><Logo size={28} /><span className="brand-name">Up<b>Skillr</b></span></span>
              <button className="nav-close" onClick={() => setOpen(false)} aria-label="Close menu">✕</button>
            </div>
            <form onSubmit={submit} className="search-form">
              <span className="search-ic"><Search size={14} /></span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search topics…" />
            </form>
            <div className="nav-links">
              {links.map((l, i) => (
                <NavLink key={l.to} to={l.to} end={l.end} style={{ '--i': i }}>
                  <span className="nav-ic">{l.icon}</span>
                  <span>{l.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main className="container" ref={mainRef}>
        <div key={pathname} className="page-anim">{children}</div>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Logo size={28} />
            <span className="brand-name">Up<b>Skillr</b></span>
          </div>
          <p className="footer-tag">Learn any tech, one day at a time · Progress is saved in your browser</p>
          <div className="footer-credit">
            Developed with <span className="heart">♥</span> by <b>Er. Chetan D Morey</b>
          </div>
          <div className="footer-copy">© {new Date().getFullYear()} UpSkillr. All rights reserved.</div>
        </div>
      </footer>

      <button
        className={`to-top ${scrolled && progress > 0.15 ? 'show' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >↑</button>
    </div>
  );
}
