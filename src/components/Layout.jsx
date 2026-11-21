import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Home, BookOpen, Map as MapIcon, Wrench, Sparkles, Rocket, Code2, Coffee, Terminal, Database, Cpu, Server, Search,
  ClipboardCheck, MessageCircle, MessagesSquare, FolderOpen, Trophy, Hammer, LayoutDashboard, ChevronDown, BarChart3, Globe, Layers, BookMarked,
  Brain, ListChecks, Library, GraduationCap, PlayCircle, Film, Shield } from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth, logout, firstName } from '../auth.js';
import FocusPill from './FocusTimer.jsx';
import { CommandPalette, DisplayMenu, openPalette } from './GlobalTools.jsx';
import Onboarding, { startTour, openOnboarding } from './Onboarding.jsx';
import { checkReminder } from '../reminders.js';
import { supaMode } from '../supabase.js';
import { startSync, syncNow, syncState, SYNC_EVENT } from '../cloudSync.js';
import { Languages, Presentation, Mic, Headphones, SpellCheck, CalendarCheck, BriefcaseBusiness, Megaphone, FileSearch, UserRoundPen, ScrollText } from 'lucide-react';
import { NotebookPen, AlertTriangle, Repeat, CalendarDays, Award, FileUser, Bot, Medal, CodeXml, Compass, Swords, Globe2, FileBarChart, Calculator, Building2, Video, ScanSearch, Stethoscope, Puzzle, Clapperboard, Sunrise, Briefcase, KanbanSquare, Scale, BookUser, Cloud, UsersRound, MessagesSquare as Forum2, School } from 'lucide-react';
import { usePerms, filterMenu } from '../permissions.js';
import { Avatar } from './MediaBits.jsx';
import { tracks, trackGroups } from '../data/index.js';

import Ico from './Ico.jsx';
import MobileTabBar from './MobileTabBar.jsx';
const ic = (I, size = 16) => <I size={size} strokeWidth={2} />;

/*
 * Menu tree — same structure as the SoftTheNext portal:
 * plain links, and sections that open a dropdown. A section item with
 * `children` is a group that expands in place inside the dropdown.
 */
const GROUP_ICON = { ai: Sparkles, data: BarChart3, mern: Layers, web: Globe, java: Coffee, python: Terminal, dotnet: Cpu, db: Database, career: MessageCircle };
const courseName = (k) => tracks[k]?.name || k;
const groupsWith = (build) => trackGroups
  .map((g) => ({ g, ks: g.tracks.filter((k) => tracks[k]?.topics?.length) }))
  .filter(({ ks }) => ks.length)
  .map(({ g, ks }) => build(g, ks, GROUP_ICON[g.key] || Library));

function buildMenu() {
  return [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/today', label: 'Today', icon: Sunrise },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      key: 'study', label: 'Study', icon: NotebookPen,
      items: [
        { to: '/study', label: 'Study Hub', icon: LayoutDashboard },
        { to: '/study/revision', label: 'Smart Revision', icon: Repeat },
        { to: '/study/mistakes', label: 'Mistake Notebook', icon: AlertTriangle },
        { to: '/study/notes', label: 'My Notes', icon: NotebookPen },
        { to: '/study/planner', label: 'Planner & Focus Timer', icon: CalendarDays },
        { to: '/study/challenge', label: 'Daily Coding Challenge', icon: CodeXml },
        { to: '/study/diagnostic', label: 'Diagnostic Test & Path', icon: Compass },
        { to: '/tools/quiz-battle', label: 'Quiz Battle vs Bot', icon: Swords },
        { to: '/study/achievements', label: 'XP & Badges', icon: Medal },
        { to: '/study/report', label: 'Weekly Report', icon: FileBarChart },
        { to: '/study/certificates', label: 'Certificates', icon: Award },
        { to: '/study/resume', label: 'Resume Builder', icon: FileUser },
        { to: '/study/portfolio', label: 'Portfolio Website', icon: Globe2 },
        { to: '/tools/ai-code-review', label: 'AI Code Review', icon: Bot },
      ],
    },
    {
      key: 'courses', label: 'Courses', icon: BookOpen,
      items: [
        { to: '/courses', label: 'All Courses', icon: BookOpen },
        ...groupsWith((g, ks, I) => (ks.length === 1
          ? { to: `/track/${ks[0]}`, label: courseName(ks[0]), icon: I }
          : { label: g.name, icon: I, children: ks.map((k) => ({ to: `/track/${k}`, label: courseName(k), icon: BookMarked })) })),
      ],
    },
    {
      key: 'videos', label: 'Videos', icon: PlayCircle,
      items: [
        { to: '/videos', label: 'All Video Lessons', icon: Film },
        { to: '/materials', label: 'Study Material (recorded classes, PDFs, photos)', icon: FolderOpen },
        ...groupsWith((g, ks, I) => (ks.length === 1
          ? { to: `/videos?group=${g.key}&course=${ks[0]}`, label: courseName(ks[0]), icon: I }
          : { label: g.name, icon: I, children: ks.map((k) => ({ to: `/videos?group=${g.key}&course=${k}`, label: courseName(k), icon: PlayCircle })) })),
      ],
    },
    {
      key: 'tests', label: 'Test Series', icon: Trophy,
      items: [
        { to: '/tools/test-series', label: 'All Test Series', icon: Trophy },
        ...groupsWith((g, ks, I) => (ks.length === 1
          ? { to: `/tools/test-series/${ks[0]}`, label: courseName(ks[0]), icon: I }
          : {
            label: g.name, icon: I,
            children: [
              { to: `/tools/test-series/grp:${g.key}`, label: `${g.name}: all courses`, icon: ListChecks },
              ...ks.map((k) => ({ to: `/tools/test-series/${k}`, label: courseName(k), icon: ClipboardCheck })),
            ],
          })),
      ],
    },
    { to: '/roadmap', label: 'Roadmap', icon: MapIcon },
    {
      key: 'labs', label: 'Practice Labs', icon: Wrench,
      items: [
        { to: '/tools', label: 'All Practice Tools', icon: Wrench },
        { to: '/tools/code-visualizer', label: 'Code Visualizer', icon: ScanSearch },
        { to: '/tools/visualizers', label: 'DSA & Concept Visualizer', icon: Clapperboard },
        { to: '/tools/code-puzzles', label: 'Code Puzzles', icon: Puzzle },
        { to: '/tools/explain-error', label: 'Explain my Error', icon: Stethoscope },
        { to: '/tools/playground', label: 'Web Playground', icon: Code2 },
        { to: '/tools/python-ide', label: 'Python IDE', icon: Terminal },
        { to: '/tools/java-ide', label: 'Java IDE', icon: Coffee },
        { to: '/tools/csharp-ide', label: 'C# IDE', icon: Cpu },
        { to: '/tools/mysql-workbench', label: 'MySQL Workbench', icon: Database },
        { to: '/tools/ssms-lab', label: 'SSMS Lab', icon: Server },
        { to: '/tools/mongo-lab', label: 'MongoDB Lab', icon: Database },
        { to: '/tools/api-lab', label: 'API Lab', icon: Server },
        { to: '/tools/ai-lab', label: 'AI Lab', icon: Sparkles },
        { to: '/tools/ai-app-builder', label: 'AI App Builder', icon: Rocket },
      ],
    },
    {
      key: 'interview', label: 'Interview Prep', icon: GraduationCap,
      items: [
        { to: '/practice/aptitude', label: 'Aptitude & Reasoning', icon: Calculator },
        { to: '/practice/companies', label: 'Company-wise Kits', icon: Building2 },
        { to: '/practice/video-interview', label: 'Video Mock Interview', icon: Video },
        { to: '/tools/dsa', label: 'DSA Practice Sheet', icon: Code2 },
        { to: '/tools/cheat-sheets', label: 'Cheat Sheets', icon: ScrollText },
        { to: '/tools/interview-phrases', label: 'Interview Phrases (मराठी/हिंदी → English)', icon: Languages },
        { to: '/tools/project-pitch', label: 'Explain Your Project', icon: Presentation },
        { to: '/tools/jam', label: 'JAM / Extempore Speaking', icon: Mic },
        { to: '/tools/situational', label: 'Situational & Managerial Round', icon: Scale },
        { to: '/tools/company-hr', label: 'Company-wise HR Rounds', icon: Building2 },
        { to: '/tools/versant', label: 'Versant / Communication Test', icon: Headphones },
        { to: '/tools/gd-topics', label: 'GD Topics 2026', icon: UsersRound },
        { to: '/tools/english-mistakes', label: 'Common English Mistakes', icon: SpellCheck },
        { to: '/tools/interview-day', label: 'Interview Day Kit', icon: CalendarCheck },
        { to: '/tools/first-job', label: 'First Job Skills', icon: BriefcaseBusiness },
        { to: '/tools/java-interview', label: 'Interview Prep', icon: ClipboardCheck },
        { to: '/tools/soft-skills', label: 'Soft Skills', icon: MessageCircle },
        { to: '/tools/quiz', label: 'Quiz Arena', icon: ListChecks },
        { to: '/tools/flashcards', label: 'Flashcards', icon: Brain },
      ],
    },
    supaMode && {
      key: 'community', label: 'Community', icon: UsersRound,
      items: [
        { to: '/classroom', label: 'My Class / Teacher Panel', icon: School },
        { to: '/community/forum', label: 'Doubt Forum', icon: Forum2 },
        { to: '/community/leaderboard', label: 'Leaderboard', icon: Trophy },
        { to: '/community/experiences', label: 'Interview Experience Bank', icon: BookUser },
      ],
    },
    {
      key: 'career', label: 'Career', icon: Briefcase,
      items: [
        { to: '/tools/placement-drives', label: 'Placement Drives', icon: Megaphone },
        { to: '/tools/internship', label: 'Virtual Internship', icon: BriefcaseBusiness },
        { to: '/tools/ats-checker', label: 'Resume ATS Checker', icon: FileSearch },
        { to: '/tools/profile-builder', label: 'LinkedIn & GitHub Builder', icon: UserRoundPen },
        { to: '/career/applications', label: 'Application Tracker', icon: KanbanSquare },
        { to: '/career/offers', label: 'Offer Comparison', icon: Scale },
        { to: '/career/experiences', label: 'Interview Journal', icon: BookUser },
        { to: '/study/resume', label: 'Resume Builder', icon: FileUser },
        { to: '/study/portfolio', label: 'Portfolio Website', icon: Globe2 },
      ],
    },
    {
      key: 'projects', label: 'Projects', icon: Hammer,
      items: [
        { to: '/tools/web-projects', label: 'Web Dev Projects', icon: Globe },
        { to: '/tools/python-projects', label: 'Python Projects', icon: Terminal },
        { to: '/tools/mern-projects', label: 'MERN Projects', icon: Layers },
        { to: '/tools/java-projects', label: 'Java Projects', icon: Coffee },
      ],
    },
    { to: '/chat', label: 'Chat', icon: MessagesSquare },
  ].filter(Boolean);
}

const leavesOf = (items) => items.flatMap((it) => (it.children ? leavesOf(it.children) : it.items ? leavesOf(it.items) : it.to ? [it] : []));

// Only the most specific menu entry lights up (longest path that matches the page).
function useCurrentPath(menu, pathname) {
  return useMemo(() => {
    let best = null;
    for (const { to } of leavesOf(menu)) {
      if ((pathname === to || pathname.startsWith(`${to}/`)) && (!best || to.length > best.length)) best = to;
    }
    return best;
  }, [menu, pathname]);
}
const holds = (item, cur) => leavesOf([item]).some((l) => l.to === cur);

function DropLink({ item, cur, nested }) {
  const I = item.icon || BookMarked;
  return (
    <Link to={item.to} role="menuitem" className={`dropdown-item${nested ? ' nested' : ''}${item.to === cur ? ' active' : ''}`}>
      <span className="dropdown-icon">{ic(I, nested ? 14 : 15)}</span>
      <span className="dropdown-label">{item.label}</span>
    </Link>
  );
}

/* A few courses that belong together; opens in place inside the dropdown. */
function DropGroup({ item, cur }) {
  const inside = holds(item, cur);
  const [open, setOpen] = useState(inside);
  useEffect(() => { setOpen(inside); }, [inside]);
  const I = item.icon || Library;
  return (
    <div className={`dropdown-group${open ? ' open' : ''}`}>
      <button type="button" className={`dropdown-item as-group${inside ? ' active' : ''}`} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="dropdown-icon">{ic(I, 15)}</span>
        <span className="dropdown-label">{item.label}</span>
        <span className="dropdown-count">{item.children.length}</span>
        <ChevronDown size={13} className="dropdown-caret" />
      </button>
      {open && (
        <div className="dropdown-children" role="group">
          {item.children.map((c) => <DropLink key={c.to} item={c} cur={cur} nested />)}
        </div>
      )}
    </div>
  );
}

const DropItems = ({ items, cur }) => items.map((it) => (it.children
  ? <DropGroup key={it.label} item={it} cur={cur} />
  : <DropLink key={it.to} item={it} cur={cur} />));

/* Desktop: the horizontal bar under the header. */
function Topnav({ menu, cur, pathname }) {
  const [openKey, setOpenKey] = useState(null);
  const [flip, setFlip] = useState(false);
  const navRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => { setOpenKey(null); }, [pathname]);
  useEffect(() => {
    if (!openKey) return undefined;
    const onDown = (e) => { if (!navRef.current?.contains(e.target)) setOpenKey(null); };
    const onKey = (e) => { if (e.key === 'Escape') setOpenKey(null); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [openKey]);
  // A panel opened near the right end would run off screen, so anchor it to its right edge.
  useLayoutEffect(() => {
    if (!openKey || !dropRef.current) { setFlip(false); return; }
    setFlip(dropRef.current.getBoundingClientRect().right > window.innerWidth - 12);
  }, [openKey]);

  return (
    <nav className="topnav" ref={navRef} aria-label="Main">
      <div className="topnav-inner">
        {menu.map((sec) => {
          if (!sec.items) {
            return (
              <Link key={sec.to} to={sec.to} className={`nav-link${sec.to === cur ? ' active' : ''}`}>
                <span className="nav-link-icon">{ic(sec.icon)}</span><span>{sec.label}</span>
              </Link>
            );
          }
          const isOpen = openKey === sec.key;
          const cols = sec.items.length > 8 && !sec.items.some((i) => i.children) ? 2 : 1;
          return (
            <div key={sec.key} className={`nav-group${isOpen ? ' open' : ''}`}>
              <button
                type="button"
                className={`nav-link${holds(sec, cur) ? ' active' : ''}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
                onClick={() => setOpenKey((k) => (k === sec.key ? null : sec.key))}
              >
                <span className="nav-link-icon">{ic(sec.icon)}</span><span>{sec.label}</span>
                <ChevronDown size={14} className="nav-caret" />
              </button>
              {isOpen && (
                <div className={`dropdown${flip ? ' flip' : ''}`} role="menu" ref={dropRef} data-cols={cols}>
                  <DropItems items={sec.items} cur={cur} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

/* Mobile / tablet: the same tree as an accordion inside the drawer. */
function DrawerMenu({ menu, cur }) {
  const [openKey, setOpenKey] = useState(() => menu.find((s) => s.items && holds(s, cur))?.key || null);
  return (
    <div className="dnav">
      {menu.map((sec, i) => {
        if (!sec.items) {
          return (
            <Link key={sec.to} to={sec.to} style={{ '--i': i }} className={`dnav-link${sec.to === cur ? ' active' : ''}`}>
              <span className="nav-ic">{ic(sec.icon)}</span><span>{sec.label}</span>
            </Link>
          );
        }
        const isOpen = openKey === sec.key;
        return (
          <div key={sec.key} className={`dnav-sec${isOpen ? ' open' : ''}`} style={{ '--i': i }}>
            <button type="button" className={`dnav-link${holds(sec, cur) ? ' active' : ''}`} aria-expanded={isOpen} onClick={() => setOpenKey((k) => (k === sec.key ? null : sec.key))}>
              <span className="nav-ic">{ic(sec.icon)}</span><span>{sec.label}</span>
              <ChevronDown size={16} className="nav-caret" />
            </button>
            {isOpen && <div className="dnav-items"><DropItems items={sec.items} cur={cur} /></div>}
          </div>
        );
      })}
    </div>
  );
}

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

function SyncBadge() {
  const [s, setS] = useState(syncState);
  useEffect(() => { const h = () => setS(syncState()); window.addEventListener(SYNC_EVENT, h); return () => window.removeEventListener(SYNC_EVENT, h); }, []);
  if (!supaMode) return null;
  const label = s.status === 'syncing' ? 'Syncing…' : s.status === 'synced' ? `Synced ${new Date(s.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : s.status === 'offline' ? 'Offline — will sync later' : s.status === 'error' ? 'Sync problem — retrying' : 'Cloud sync on';
  return <button className={`um-sync ${s.status}`} title={s.error || 'Your progress is saved to your account and appears on every device'} onClick={() => syncNow({ pullFirst: true })}><Cloud size={13} /> {label}</button>;
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  if (!user) return null;
  const first = firstName(user);
  return (
    <div className="um" ref={ref}>
      <button className="um-btn" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Account menu">
        <Avatar size={30} className="um-ava" />
        <span className="um-name">{first}</span>
      </button>
      {open && (
        <div className="um-drop">
          <div className="um-head"><Avatar size={44} className="um-ava big" /><div><b>{user.name}</b><div className="muted small">@{user.username} · {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Teacher' : 'Student'}</div></div></div>
          <SyncBadge />
          <Link to="/dashboard" onClick={() => setOpen(false)}>My dashboard</Link>
          <Link to="/profile" onClick={() => setOpen(false)}><Ico e="👤" /> My profile</Link>
          <button className="um-link" onClick={() => { setOpen(false); startTour(); }}>Take the app tour</button>
          <button className="um-link" onClick={() => { setOpen(false); openOnboarding(); }}>Change my goals &amp; plan</button>
          {user.role === 'admin' && <Link to="/admin" onClick={() => setOpen(false)}><Ico e="🛡" /> Admin panel</Link>}
          <Link to="/" onClick={() => setOpen(false)}>Home page</Link>
          <button className="um-out" onClick={() => { setOpen(false); onLogout(); }}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const user = useAuth();
  useEffect(() => { checkReminder(); const t = setInterval(checkReminder, 5 * 60 * 1000); return () => clearInterval(t); }, [user?.username]);
  const doLogout = async () => { if (supaMode) await syncNow(); logout(); window.location.hash = '#/'; };
  useEffect(() => { if (supaMode) startSync(user?.server ? user.id : null); }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const nav = useNavigate();
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  useScrollReveal(mainRef, pathname);
  const { canPath, isAdmin } = usePerms();
  const menu = useMemo(() => {
    const base = filterMenu(buildMenu(), canPath);
    return isAdmin ? [...base, { to: '/admin', label: 'Admin', icon: Shield }] : base;
  }, [canPath, isAdmin]);
  const cur = useCurrentPath(menu, pathname);
  const pageLabel = useMemo(() => {
    const hit = leavesOf(menu).find((l) => l.to === cur || l.to === pathname);
    if (hit) return hit.label;
    const seg = pathname.split('/').filter(Boolean);
    if (seg[0] === 'track' && seg[1]) return seg[2] ? 'Lesson' : 'Course';
    const last = seg[seg.length - 1] || 'Home';
    return decodeURIComponent(last).replace(/^grp:/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }, [menu, cur, pathname]);
  useEffect(() => { document.title = `${pageLabel} · UpSkillr`; }, [pageLabel]);

  useEffect(() => { setOpen(false); }, [pathname]);

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
          <form onSubmit={submit} className="search-form top-search">
            <span className="search-ic"><Search size={14} /></span>
            <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={(e) => { e.target.blur(); setOpen(false); openPalette(); }} readOnly placeholder="Search everything…  Ctrl K" />
          </form>
          <DisplayMenu />
          <UserMenu user={user} onLogout={doLogout} />
          <button
            className={`menu-btn ${open ? 'is-open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </div>
        <Topnav menu={menu} cur={cur} pathname={pathname} />
        <div className={`nav-overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
        <nav className={`nav ${open ? 'open' : ''}`} aria-label="Menu">
          <div className="nav-head">
            <span className="brand"><Logo size={28} /><span className="brand-name">Up<b>Skillr</b></span></span>
            <button className="nav-close" onClick={() => setOpen(false)} aria-label="Close menu">✕</button>
          </div>
          <form onSubmit={submit} className="search-form">
            <span className="search-ic"><Search size={14} /></span>
            <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={(e) => { e.target.blur(); setOpen(false); openPalette(); }} readOnly placeholder="Search everything…  Ctrl K" />
          </form>
          <DrawerMenu key={pathname} menu={menu} cur={cur} />
          {user && <button className="btn drawer-logout" onClick={doLogout}>Logout ({user.username})</button>}
        </nav>
      </header>

      <main className="container" ref={mainRef}>
        <div key={`pb-${pathname}`} className="page-brand" aria-label="UpSkillr">
          <Link to="/" className="pb-logo" title="UpSkillr home"><Logo size={30} /></Link>
          <div className="pb-text">
            <span className="pb-name">Up<b>Skillr</b></span>
            <span className="pb-sep">›</span>
            <span className="pb-page">{pageLabel}</span>
          </div>
          <span className="pb-credit">Developed by <b>ER. Chetan D Morey</b></span>
        </div>
        <div key={pathname} className="page-anim">{children}</div>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Logo size={28} />
            <span className="brand-name">Up<b>Skillr</b></span>
          </div>
          <p className="footer-tag">Learn any tech, one day at a time · Progress is saved in your browser</p>
          <div className="footer-credit">Developed by <b>ER. Chetan D Morey</b></div>
          <div className="footer-copy">© {new Date().getFullYear()} UpSkillr. All rights reserved.</div>
        </div>
      </footer>

      <FocusPill />
      <CommandPalette />
      <Onboarding />
      <MobileTabBar />
      <button
        className={`to-top ${scrolled && progress > 0.15 ? 'show' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >↑</button>
    </div>
  );
}
