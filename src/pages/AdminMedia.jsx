import { useMemo, useRef, useState } from 'react';
import { tracks, trackOrder } from '../data/index.js';
import { useMedia, saveMedia, putFile, deleteFile, parseVideoLink, courseScope, lessonScope } from '../media.js';
import { imageToDataUrl } from '../profile.js';
import { CourseCover, VideoPlayer } from '../components/MediaBits.jsx';

import Ico from '../components/Ico.jsx';
const fmtMB = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;

export default function AdminMedia() {
  const media = useMedia();
  const keys = trackOrder.filter((k) => tracks[k]);
  const [course, setCourse] = useState(keys[0]);
  const [lesson, setLesson] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);
  const coverRef = useRef(null);
  const t = tracks[course];
  const scope = lesson ? lessonScope(course, lesson) : courseScope(course);
  const list = media.videos?.[scope] || [];
  const allCount = useMemo(() => Object.values(media.videos || {}).reduce((s, l) => s + l.length, 0), [media]);

  const add = (item) => {
    saveMedia((md) => { md.videos[scope] = [...(md.videos[scope] || []), { id: `v${Date.now()}`, title: title.trim() || 'Recorded class', note: note.trim(), addedAt: new Date().toISOString(), ...item }]; return md; });
    setTitle(''); setNote(''); setLink('');
    setMsg('Video added. Students who can open this course now see it.');
  };
  const addLink = () => {
    setMsg('');
    const v = parseVideoLink(link);
    if (!v) { setMsg('Paste a YouTube, Vimeo, Google Drive or direct .mp4 link.'); return; }
    add(v);
  };
  const addFile = async (f) => {
    setMsg('');
    if (!/^video\//.test(f.type)) { setMsg('Please choose a video file (mp4 / webm).'); return; }
    setBusy(`Saving ${f.name} (${fmtMB(f.size)})…`);
    try {
      const id = `f${Date.now()}`;
      await putFile(id, f);
      add({ kind: 'file', src: `idb:${id}`, fileName: f.name, size: f.size, localOnly: true });
    } catch (e) { setMsg(`Could not store the file: ${e.message}. The browser may be out of space; use a YouTube/Drive link instead.`); }
    setBusy('');
  };
  const remove = async (v) => {
    if (!window.confirm(`Delete "${v.title}"?`)) return;
    saveMedia((md) => { md.videos[scope] = (md.videos[scope] || []).filter((x) => x.id !== v.id); if (!md.videos[scope].length) delete md.videos[scope]; return md; });
    if (v.src.startsWith('idb:')) await deleteFile(v.src.slice(4));
  };
  const move = (v, d) => saveMedia((md) => {
    const l = md.videos[scope] || []; const i = l.findIndex((x) => x.id === v.id); const j = i + d;
    if (i >= 0 && j >= 0 && j < l.length) [l[i], l[j]] = [l[j], l[i]];
    return md;
  });
  const setCover = async (f) => {
    setMsg('');
    try { const url = await imageToDataUrl(f, { square: false, maxW: 1280, maxH: 440, quality: 0.8 }); saveMedia((md) => { md.covers[course] = url; return md; }); setMsg('Course image updated.'); } catch (e) { setMsg(`${e.message}`); }
  };

  return (
    <div className="admin-media">
      <div className="ts-stats">
        <div className="card"><b>{allCount}</b><span>Recorded videos</span></div>
        <div className="card"><b>{Object.keys(media.covers || {}).length}</b><span>Custom course images</span></div>
        <div className="card"><b>{keys.length}</b><span>Courses</span></div>
      </div>

      <div className="card">
        <div className="grid2">
          <label className="field">Course
            <select className="input" value={course} onChange={(e) => { setCourse(e.target.value); setLesson(''); }}>
              {keys.map((k) => <option key={k} value={k}>{tracks[k].name}</option>)}
            </select>
          </label>
          <label className="field">Show the video on
            <select className="input" value={lesson} onChange={(e) => setLesson(e.target.value)}>
              <option value="">The course page (intro / all lessons)</option>
              {(t?.topics || []).map((x, i) => <option key={x.id} value={x.id}>{x.day ? `Day ${x.day}` : `Topic ${i + 1}`}: {x.title}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h3><Ico e="🎥" /> Add a recorded video</h3>
          <label className="field">Title<input className="input" value={title} placeholder="Day 1 live class: Introduction" onChange={(e) => setTitle(e.target.value)} /></label>
          <label className="field">Note (optional)<input className="input" value={note} placeholder="Recorded on 12 Nov · 45 min" onChange={(e) => setNote(e.target.value)} /></label>
          <label className="field">Video link (best: works for every student)
            <input className="input" value={link} placeholder="https://youtu.be/…  ·  Google Drive link  ·  https://…/class1.mp4" onChange={(e) => setLink(e.target.value)} />
          </label>
          <div className="row-btns">
            <button className="btn primary" onClick={addLink} disabled={!link.trim()}>＋ Add link</button>
            <button className="btn" onClick={() => fileRef.current?.click()} disabled={!!busy}><Ico e="⬆" /> Upload video file</button>
            <input ref={fileRef} type="file" accept="video/*" hidden onChange={(e) => { if (e.target.files[0]) addFile(e.target.files[0]); e.target.value = ''; }} />
          </div>
          {busy && <p className="small"><Ico e="⏳" /> {busy}</p>}
          {msg && <p className="small">{msg}</p>}
          <div className="tip small">
            <b>Which to use?</b> A <b>YouTube (Unlisted) or Google Drive link</b> plays for every student on every device. An <b>uploaded file</b> is stored in this computer's browser, so it only plays on this computer (good for an institute lab PC). Google Drive: set sharing to "Anyone with the link".
          </div>
        </div>

        <div className="card">
          <h3>Videos on {lesson ? 'this lesson' : 'the course page'} ({list.length})</h3>
          {!list.length && <p className="muted">No videos yet.</p>}
          {list.map((v, i) => (
            <div key={v.id} className="am-video">
              <VideoPlayer v={v} />
              <div className="am-row">
                <div><b>{v.title}</b><div className="muted small">{v.kind}{v.localOnly ? ' · this computer only' : ''}{v.size ? ` · ${fmtMB(v.size)}` : ''}{v.note ? ` · ${v.note}` : ''}</div></div>
                <span className="am-btns">
                  <button className="link-btn" disabled={i === 0} onClick={() => move(v, -1)} title="Move up">↑</button>
                  <button className="link-btn" disabled={i === list.length - 1} onClick={() => move(v, 1)} title="Move down">↓</button>
                  <button className="link-btn danger" onClick={() => remove(v)}>Delete</button>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3><Ico e="🖼" /> Course image: {t?.name}</h3>
        <p className="muted small">Shown on the course card and at the top of the course page. Without an upload, a designed cover in the course colours is used.</p>
        <div className="am-cover"><CourseCover track={t} height={180} /></div>
        <div className="row-btns">
          <button className="btn primary" onClick={() => coverRef.current?.click()}><Ico e="⬆" /> Upload course image</button>
          {media.covers?.[course] && <button className="btn" onClick={() => saveMedia((md) => { delete md.covers[course]; return md; })}>↺ Use the designed cover</button>}
          <input ref={coverRef} type="file" accept="image/*" hidden onChange={(e) => { if (e.target.files[0]) setCover(e.target.files[0]); e.target.value = ''; }} />
        </div>
        <p className="muted small">Best size: wide banner, about 1280 × 440 px. Images are compressed automatically and published with the settings file.</p>
      </div>
    </div>
  );
}
