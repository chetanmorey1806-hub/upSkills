import { Link, useLocation } from 'react-router-dom';
import { usePerms } from '../permissions.js';
import { logout } from '../auth.js';

import Ico from './Ico.jsx';
// Wraps the app's pages: shows a friendly "locked" page when the admin has not given this permission.
export default function PermissionGate({ children }) {
  const { pathname, search } = useLocation();
  const { canPath, disabled, isAdmin } = usePerms();
  if (disabled) return (
    <div className="card locked">
      <div className="locked-ic"><Ico e="⛔" /></div>
      <h2>Your account is disabled</h2>
      <p className="muted">Please contact your admin / institute to activate your account again.</p>
      <button className="btn" onClick={() => { logout(); window.location.hash = '#/'; }}>Logout</button>
    </div>
  );
  if (!canPath(pathname, search)) return (
    <div className="card locked">
      <div className="locked-ic"><Ico e="🔒" /></div>
      <h2>{pathname.startsWith('/admin') ? 'Admins only' : 'This section is locked'}</h2>
      <p className="muted">{pathname.startsWith('/admin') ? 'Only an admin can open the admin panel.' : 'Your admin has not given you access to this course or tool yet. Ask your admin / institute to unlock it, or check the packages.'}</p>
      <div className="row-btns center">
        <Link className="btn primary" to="/dashboard">Go to my dashboard</Link>
        {!isAdmin && <Link className="btn" to="/?section=packages">See packages</Link>}
      </div>
    </div>
  );
  return children;
}
