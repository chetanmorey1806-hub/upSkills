// Students: everything the admin has uploaded (recorded videos, photos, PDF notes, files, video links).
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tracks, trackOrder } from '../data/index.js';
import { serverMode } from '../serverApi.js';
import { useMaterials, MaterialCard, KIND, ServerNeeded } from '../components/MaterialBits.jsx';

import Ico from '../components/Ico.jsx';
export default function StudyMaterial() {
  const [params, setParams] = useSearchParams();
  const course = params.get('course') || '';
  const kind = params.get('kind') || '';
  const { list, loading, error } = useMaterials('');
  const set = (k, v) => { const p = Object.fromEntries(params); if (v) p[k] = v; else delete p[k]; setParams(p, { replace: true }); };

  const inCourse = useMemo(() => list.filter((m) => !course || m.course === course || (course === '_general' && !m.course)), [list, course]);
  const shown = inCourse.filter((m) => !kind || m.kind === kind);
  const courses = trackOrder.filter((k) => tracks[k] && list.some((m) => m.course === k));
  const count = (k) => inCourse.filter((m) => m.kind === k).length;

  return (
    <div>
      <div className="page-head">
        <h1><Ico e="📚" /> Study Material</h1>
        <p className="muted">Recorded classes, photos, PDF notes and files shared by your trainer.</p>
      </div>
      {!serverMode ? <ServerNeeded what="Study material" /> : (
        <>
          <div className="quiz-settings">
            <label>Course
              <select value={course} onChange={(e) => set('course', e.target.value)}>
                <option value="">All courses</option>
                <option value="_general">General (all students)</option>
                {courses.map((k) => <option key={k} value={k}>{tracks[k].name}</option>)}
              </select>
            </label>
          </div>
          <div className="tabs">
            <button className={`tab ${!kind ? 'active' : ''}`} onClick={() => set('kind', '')}>All <span className="count">{inCourse.length}</span></button>
            {Object.entries(KIND).map(([k, v]) => count(k) > 0 && (
              <button key={k} className={`tab ${kind === k ? 'active' : ''}`} onClick={() => set('kind', k)}><v.icon size={15} /> {v.label} <span className="count">{count(k)}</span></button>
            ))}
          </div>
          {loading && <p className="muted">Loading…</p>}
          {error && <div className="card test-msg"><Ico e="⚠" /> {error}</div>}
          {!loading && !error && !shown.length && <p className="muted">Nothing here yet. Your trainer's uploads will appear here.</p>}
          <div className="mat-grid">{shown.map((m) => <MaterialCard key={m.id} m={m} />)}</div>
        </>
      )}
    </div>
  );
}
