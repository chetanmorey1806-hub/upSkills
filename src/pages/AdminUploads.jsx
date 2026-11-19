// Admin: upload recorded videos, photos, PDFs and other files (or paste a video link) for students, stored on the server.
import { useRef, useState } from 'react';
import { Upload, Link2 } from 'lucide-react';
import { tracks, trackOrder } from '../data/index.js';
import { api, serverMode, fmtSize } from '../serverApi.js';
import { useMaterials, MaterialCard, ServerNeeded } from '../components/MaterialBits.jsx';

import Ico from '../components/Ico.jsx';
export default function AdminUploads() {
  const keys = trackOrder.filter((k) => tracks[k]);
  const [course, setCourse] = useState('');
  const [lesson, setLesson] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(null);
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('');
  const fileRef = useRef(null);
  const { list, loading, error, reload } = useMaterials('');

  if (!serverMode) return <ServerNeeded what="Uploading study material" />;

  const lessons = course ? tracks[course]?.topics || [] : [];
  const pick = (fl) => { setFiles([...files, ...Array.from(fl || [])]); setMsg(''); };
  const reset = () => { setFiles([]); setTitle(''); setNote(''); setLink(''); if (fileRef.current) fileRef.current.value = ''; };

  const send = async () => {
    setMsg('');
    if (!files.length && !link.trim()) { setMsg('Choose a file (video, photo, PDF…) or paste a video link.'); return; }
    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('note', note.trim());
    fd.append('course', course);
    fd.append('lesson', lesson);
    if (link.trim()) fd.append('url', link.trim());
    files.forEach((f) => fd.append('files', f, f.name));
    setProgress(0);
    try {
      const d = await api('/api/materials', { method: 'POST', form: fd, onProgress: setProgress });
      setMsg(`Uploaded ${d.materials.length} item${d.materials.length > 1 ? 's' : ''}. Students can see ${d.materials.length > 1 ? 'them' : 'it'} now under Study Material${course ? ` and on the ${tracks[course]?.short || 'course'} page` : ''}.`);
      reset();
      reload();
    } catch (e) { setMsg(`${e.message}`); }
    setProgress(null);
  };

  const remove = async (m) => {
    if (!window.confirm(`Delete "${m.title}"? Students will no longer see it.`)) return;
    try { await api(`/api/materials/${m.id}`, { method: 'DELETE' }); reload(); } catch (e) { window.alert(e.message); }
  };

  const shown = list.filter((m) => !filter || (filter === '_general' ? !m.course : m.course === filter));
  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="admin-uploads">
      <div className="card">
        <h3><Ico e="📤" /> Upload for students</h3>
        <p className="muted small">Recorded class videos (mp4/webm), photos, PDF notes or any document. Students see them under <b>Study Material</b>, and on the course / lesson page you choose.</p>
        <div className="grid2">
          <label className="field">Course
            <select className="input" value={course} onChange={(e) => { setCourse(e.target.value); setLesson(''); }}>
              <option value="">General: all students</option>
              {keys.map((k) => <option key={k} value={k}>{tracks[k].name}</option>)}
            </select>
          </label>
          <label className="field">Lesson (optional)
            <select className="input" value={lesson} onChange={(e) => setLesson(e.target.value)} disabled={!course}>
              <option value="">Whole course</option>
              {lessons.map((t, i) => <option key={t.id} value={t.id}>{t.day ? `Day ${t.day}` : `#${i + 1}`}: {t.title}</option>)}
            </select>
          </label>
          <label className="field">Title<input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Day 3 recorded class" /></label>
          <label className="field">Note for students (optional)<input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Watch before Friday's test" /></label>
        </div>

        <div
          className={`drop-zone ${files.length ? 'has' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <Upload size={26} />
          <b>Click to choose files, or drop them here</b>
          <span className="muted small">Video · Photo · PDF · any document. Several files at once are fine.</span>
          <input ref={fileRef} type="file" multiple hidden accept="video/*,image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.zip" onChange={(e) => pick(e.target.files)} />
        </div>
        {files.length > 0 && (
          <div className="chips">
            {files.map((f, i) => <span key={i} className="chip">{f.name} · {fmtSize(f.size)} <button className="link-btn" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label="Remove">✕</button></span>)}
            <span className="muted small">{files.length} file{files.length > 1 ? 's' : ''} · {fmtSize(totalSize)}</span>
          </div>
        )}
        <label className="field"><span><Link2 size={14} /> Or paste a video link (YouTube, Vimeo, Google Drive, .mp4)</span>
          <input className="input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://youtu.be/…" />
        </label>
        {progress !== null && <div className="up-progress"><i style={{ width: `${Math.round(progress * 100)}%` }} /><span>{progress < 1 ? `Uploading… ${Math.round(progress * 100)}%` : 'Saving…'}</span></div>}
        {msg && <p className="small">{msg}</p>}
        <div className="row-btns">
          <button className="btn primary" onClick={send} disabled={progress !== null}><Upload size={16} /> Upload</button>
          {(files.length > 0 || link) && <button className="btn" onClick={reset} disabled={progress !== null}>Clear</button>}
        </div>
      </div>

      <div className="card">
        <div className="rv-head">
          <h3 style={{ margin: 0 }}>Uploaded material <span className="muted small">({list.length})</span></h3>
          <select className="input" style={{ maxWidth: 260 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="_general">General</option>
            {keys.filter((k) => list.some((m) => m.course === k)).map((k) => <option key={k} value={k}>{tracks[k].name}</option>)}
          </select>
        </div>
        {loading && <p className="muted">Loading…</p>}
        {error && <p className="test-msg"><Ico e="⚠" /> {error}</p>}
        {!loading && !shown.length && <p className="muted">Nothing uploaded yet.</p>}
      </div>
      <div className="mat-grid">{shown.map((m) => <MaterialCard key={m.id} m={{ ...m, note: [m.lesson && `Lesson: ${tracks[m.course]?.topics?.find((t) => t.id === m.lesson)?.title || m.lesson}`, m.note].filter(Boolean).join(' · ') }} onDelete={remove} />)}</div>
    </div>
  );
}
