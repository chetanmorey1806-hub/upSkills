// Bottom tab bar for phones (shown only under 760px wide, see styles/mobile-tabbar.css).
// Hidden on full-screen editor pages, and each tab is hidden when the user may not open it.
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Wrench, PlayCircle, UserRound } from 'lucide-react';
import { usePerms } from '../permissions.js';
import '../styles/mobile-tabbar.css';

const TABS = [
  { to: '/home', label: 'Home', icon: Home, match: /^\/(home|today|dashboard)(\/|$)/ },
  { to: '/courses', label: 'Courses', icon: BookOpen, match: /^\/(courses|track|roadmap)(\/|$)/ },
  { to: '/tools', label: 'Practice', icon: Wrench, match: /^\/(tools|practice)(\/|$)/ },
  { to: '/videos', label: 'Videos', icon: PlayCircle, match: /^\/(videos|materials)(\/|$)/ },
  { to: '/profile', label: 'Profile', icon: UserRound, match: /^\/profile(\/|$)/ },
];

// Full-height editors / IDEs and chat: the bar would cover their panels.
const HIDE_ON = [
  /^\/tools\/(playground|java-ide|python-ide|csharp-ide|api-lab|mongo-lab|mysql-workbench|ssms-lab|sql-lab)\/?$/,
  /^\/tools\/(web-projects|python-projects|mern-projects|java-projects)\/[^/]+/,
  /^\/chat\/?$/,
];

export default function MobileTabBar() {
  const { pathname } = useLocation();
  const { canPath } = usePerms();
  const tabs = TABS.filter((t) => canPath(t.to));
  const hidden = tabs.length < 2 || HIDE_ON.some((r) => r.test(pathname));

  useEffect(() => {
    document.body.classList.toggle('has-tabbar', !hidden);
    return () => document.body.classList.remove('has-tabbar');
  }, [hidden]);

  if (hidden) return null;
  return (
    <nav className="mtab" aria-label="Main sections">
      {tabs.map(({ to, label, icon: I, match }) => {
        const on = match.test(pathname);
        return (
          <Link key={to} to={to} className={`mtab-item${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined}>
            <I size={21} strokeWidth={on ? 2.4 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
