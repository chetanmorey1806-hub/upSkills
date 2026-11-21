import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import Logo from './Logo.jsx';
import SocialIcon, { SOCIAL_LABELS } from './SocialIcon.jsx';
import siteInfo, { waLink, telLink, socialLinks } from '../data/siteInfo.js';
import { trackGroups, tracks } from '../data/index.js';
import '../styles/landing-extra.css';

const QUICK = [['features', 'Features'], ['courses', 'Courses'], ['packages', 'Packages'], ['faq', 'FAQ'], ['contact', 'Contact']];

export default function LandingFooter() {
  const groups = trackGroups
    .map((g) => ({ ...g, first: g.tracks.find((k) => tracks[k]?.topics?.length) }))
    .filter((g) => g.first);
  const socials = socialLinks();
  const wa = waLink('Hello UpSkillr, I have an enquiry.');
  const hasContact = !!(siteInfo.phone || wa || siteInfo.email || siteInfo.address || socials.length);
  const go = (id) => (e) => {
    e.preventDefault(); // HashRouter: a bare "#id" would be treated as a route
    (document.getElementById(id) || document.getElementById('contact'))?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="lx-footer">
      <div className="ld-wrap lx-foot-grid">
        <div className="lx-foot-brand">
          <Link to="/" className="brand"><Logo size={30} /><span className="brand-name">Up<b>Skillr</b></span></Link>
          <p>Learn any tech, one day at a time. Day-wise lessons, built-in labs, test series and projects in one place.</p>
          {socials.length > 0 && (
            <div className="lx-socials">
              {socials.map(([k, url]) => <a key={k} href={url} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABELS[k] || k} title={SOCIAL_LABELS[k] || k}><SocialIcon name={k} /></a>)}
            </div>
          )}
        </div>
        <nav className="lx-foot-col" aria-label="Courses">
          <h4>Courses</h4>
          {groups.map((g) => <Link key={g.key} to={`/track/${g.first}`}>{g.name}</Link>)}
          <Link to="/courses">All courses</Link>
        </nav>
        <nav className="lx-foot-col" aria-label="Quick links">
          <h4>Quick links</h4>
          {QUICK.map(([id, label]) => <a key={id} href={`#${id}`} onClick={go(id)}>{label}</a>)}
          <Link to="/login">Sign in</Link>
          <Link to="/register">Register</Link>
        </nav>
        {hasContact && (
          <div className="lx-foot-col lx-foot-contact">
            <h4>Contact</h4>
            {siteInfo.phone && <a href={telLink()}><Phone size={15} /> {siteInfo.phone}</a>}
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /> WhatsApp</a>}
            {siteInfo.email && <a href={`mailto:${siteInfo.email}`}><Mail size={15} /> {siteInfo.email}</a>}
            {siteInfo.address && <span><MapPin size={15} /> {siteInfo.address}</span>}
          </div>
        )}
      </div>
      <div className="ld-wrap lx-foot-bottom">
        <div className="lx-foot-legal"><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms of use</Link></div>
        <div className="footer-credit">Developed by <b>ER. Chetan D Morey</b></div>
        <div className="footer-copy">© {new Date().getFullYear()} UpSkillr. All rights reserved.</div>
      </div>
    </footer>
  );
}
