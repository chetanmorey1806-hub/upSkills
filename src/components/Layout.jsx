import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from './Logo.jsx';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/track/excel', label: 'Excel 60 Days' },
  { to: '/track/extra', label: 'Extra Skills' },
  { to: '/track/powerbi', label: 'Power BI' },
  { to: '/track/guides', label: 'Guides' },
  { to: '/tools', label: 'Practice Tools' },
];

export default function Layout({ children }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <Logo size={30} />
            <span className="brand-name">Up<b>Skillr</b></span>
          </Link>
          <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
          <nav className={`nav ${open ? 'open' : ''}`}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <form onSubmit={submit} className="search-form">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search topics, functions…" />
            </form>
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
      <footer className="footer">
        <div>UpSkillr · Learn any tech, one day at a time · Progress is saved in your browser</div>
        <div className="footer-credit">Developed by <b>Er. Chetan D Morey</b></div>
      </footer>
    </div>
  );
}
