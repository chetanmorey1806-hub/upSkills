// Study material from the server (admin uploads): cards for videos, photos, PDFs, files and video links.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Image as ImageIcon, Film, Link2, Download, ExternalLink, File as FileIcon, Trash2 } from 'lucide-react';
import { api, fileUrl, fmtSize, serverMode } from '../serverApi.js';
import { parseVideoLink, useResolvedSrc } from '../media.js';
import { listLocalMaterials, LOCAL_MAT_EVENT } from '../localMaterials.js';
import { tracks } from '../data/index.js';

import Ico from './Ico.jsx';
export const KIND = {
  video: { label: 'Recorded videos', one: 'Video', icon: Film },
  photo: { label: 'Photos', one: 'Photo', icon: ImageIcon },
  pdf: { label: 'PDF notes', one: 'PDF', icon: FileText },
  file: { label: 'Files', one: 'File', icon: FileIcon },
  link: { label: 'Video links', one: 'Link', icon: Link2 },
};

export function useMaterials(query = '') {
  const [state, setState] = useState(() => (serverMode ? { list: [], loading: true, error: '' } : { list: listLocalMaterials(), loading: false, error: '' }));
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!serverMode) {
      // no server: material saved on this computer
      const h = () => setState({ list: listLocalMaterials(), loading: false, error: '' });
      h();
      window.addEventListener(LOCAL_MAT_EVENT, h);
      return () => window.removeEventListener(LOCAL_MAT_EVENT, h);
    }
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    api(`/api/materials${query}`)
      .then((d) => alive && setState({ list: d.materials || [], loading: false, error: '' }))
      .catch((e) => alive && setState({ list: [], loading: false, error: e.message }));
    return () => { alive = false; };
  }, [query, tick]);
  return { ...state, reload: () => setTick((n) => n + 1) };
}

export function MaterialCard({ m, onDelete, showCourse = true }) {
  const K = KIND[m.kind] || KIND.file;
  const isLocal = String(m.file?.id ?? '').startsWith('idb:');
  const { url: localUrl, missing } = useResolvedSrc(isLocal ? m.file.id : null);
  const src = m.file ? (isLocal ? localUrl : fileUrl(m.file.id)) : null;
  const dl = m.file ? (isLocal ? localUrl : fileUrl(m.file.id, { download: true })) : null;
  const link = m.kind === 'link' ? parseVideoLink(m.url) : null;
  return (
    <div className={`card mat-card mat-${m.kind}`}>
      {isLocal && missing && <div className="mat-media mat-missing">This file is saved on another computer or was removed from this browser.</div>}
      {m.kind === 'video' && <video className="mat-media" src={src} controls preload="metadata" controlsList="nodownload" />}
      {m.kind === 'photo' && <a href={src} target="_blank" rel="noreferrer"><img className="mat-media mat-photo" src={src} alt={m.title} loading="lazy" /></a>}
      {m.kind === 'link' && link && ['youtube', 'vimeo', 'drive'].includes(link.kind) && (
        <iframe className="mat-media" src={link.src} title={m.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
      )}
      {m.kind === 'link' && link?.kind === 'file' && <video className="mat-media" src={link.src} controls preload="metadata" />}
      {(m.kind === 'pdf' || m.kind === 'file') && (
        <a className="mat-doc" href={src} target="_blank" rel="noreferrer"><K.icon size={42} strokeWidth={1.5} /><span>{m.file?.name}</span></a>
      )}
      <div className="mat-body">
        <div className="mat-title"><K.icon size={15} /> <b>{m.title}</b></div>
        {m.note && <p className="muted small mat-note">{m.note}</p>}
        <div className="muted small mat-meta">
          {showCourse && m.course && <span>{tracks[m.course]?.short || tracks[m.course]?.name || m.course}</span>}
          {m.file && <span>{fmtSize(m.file.size)}</span>}
          <span>{new Date(m.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="row-btns">
          {m.kind === 'pdf' && <a className="btn small" href={src} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Open PDF</a>}
          {m.file && <a className="btn small" href={dl || undefined} download={isLocal ? m.file.name : undefined}><Download size={14} /> Download</a>}
          {m.kind === 'link' && <a className="btn small" href={m.url} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Open link</a>}
          {onDelete && <button className="btn small danger" onClick={() => onDelete(m)}><Trash2 size={14} /> Delete</button>}
        </div>
      </div>
    </div>
  );
}

// On a lesson page: the material the admin attached to that lesson. On a course page: course-wide material.
export function LessonMaterials({ track, lessonId }) {
  const { list } = useMaterials(`?course=${encodeURIComponent(track)}`);
  const mine = list.filter((m) => m.course === track && (lessonId ? m.lesson === lessonId : !m.lesson));
  if (!mine.length) return null;
  return (
    <div className="card mat-inline">
      <div className="rv-head"><b><Ico e="📚" /> {lessonId ? 'Study material for this lesson' : 'Study material for this course'}</b><Link className="small" to={`/materials?course=${track}`}>All material →</Link></div>
      <div className="mat-grid">{mine.map((m) => <MaterialCard key={m.id} m={m} showCourse={false} />)}</div>
    </div>
  );
}

export function ServerNeeded({ what }) {
  return (
    <div className="card server-needed">
      <h3><Ico e="🔌" /> {what} needs the UpSkillr server</h3>
      <p>Chat and shared study material are stored on a server so every student sees the same messages and files. The server is in the <code>server/</code> folder of this project.</p>
      <ol>
        <li>Copy <code>server/.env.example</code> to <code>server/.env</code> and fill in MySQL, <code>JWT_SECRET</code> and the admin password.</li>
        <li>Run <code>cd server &amp;&amp; npm install &amp;&amp; npm start</code>.</li>
        <li>Build the website with <code>VITE_API_URL=http://your-server:5050 npm run build</code> (or put it in a <code>.env</code> file next to <code>package.json</code>).</li>
      </ol>
    </div>
  );
}
