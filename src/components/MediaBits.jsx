// Small shared UI pieces: profile avatar, certificate photo, course cover, recorded-video player.
import { useMemo, useState } from 'react';
import { useProfile } from '../profile.js';
import { useAuth } from '../auth.js';
import { useMedia, useResolvedSrc, courseScope, lessonScope } from '../media.js';

/* ------------------------------ avatar ------------------------------ */
export function Avatar({ size = 32, className = '', name }) {
  const [p] = useProfile();
  const user = useAuth();
  const n = name || p.fullName || user?.name || '?';
  return p.photo
    ? <img className={`avatar ${className}`} src={p.photo} alt={n} style={{ width: size, height: size }} />
    : <span className={`avatar avatar-txt ${className}`} style={{ width: size, height: size, fontSize: size * 0.45 }}>{n.trim().charAt(0).toUpperCase()}</span>;
}

/* --------------------------- certificate photo --------------------------- */
export function CertPhoto() {
  const [p] = useProfile();
  if (!p.photo) return null;
  return <img className="cert-photo" src={p.photo} alt="Student" />;
}
export function useCertName(fallback) {
  const [p] = useProfile();
  const user = useAuth();
  return fallback || p.fullName || user?.name || 'Student';
}

/* ------------------------------ course cover ------------------------------ */
const hash = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const solid = (c) => (/^#[0-9a-f]{3,8}$/i.test(c || '') ? c : '#4f46e5');

// Designed SVG cover (used until the admin uploads an image): course colour gradient, icon, title, key topics.
export function GeneratedCover({ track, height = 160, showTitle = true, wide = false }) {
  const c = solid(track?.color);
  const h = hash(track?.key || 'x');
  const topics = useMemo(() => [...new Set((track?.topics || []).map((t) => (t.module || '').replace(/^Module \d+:\s*/, '')).filter(Boolean))].slice(0, wide ? 4 : 3), [track, wide]);
  const icon = track?.icon || '📘';
  const id = `g${h}${wide ? 'w' : ''}`;
  const W = wide ? 1200 : 640;
  const glyphs = ['</>', '{ }', '( )', '[ ]', '=>', '#', 'Σ', 'fx', '∞', '01'];
  return (
    <svg className="course-cover" viewBox={`0 0 ${W} 220`} preserveAspectRatio="xMidYMid slice" style={{ height }} role="img" aria-label={track?.name}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c} />
          <stop offset="1" stopColor={c} stopOpacity=".55" />
        </linearGradient>
        <radialGradient id={`${id}r`} cx="85%" cy="15%" r="70%"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height="220" fill="#0b1026" />
      <rect width={W} height="220" fill={`url(#${id})`} />
      <rect width={W} height="220" fill={`url(#${id}r)`} />
      {Array.from({ length: wide ? 14 : 9 }, (_, i) => {
        const x = (h * (i + 3) * 37) % (W - 40) + 20, y = (h * (i + 5) * 53) % 180 + 20;
        return <text key={i} x={x} y={y} fill="#fff" opacity=".12" fontSize={18 + ((h >> i) % 22)} fontFamily="monospace" fontWeight="700">{glyphs[(h + i) % glyphs.length]}</text>;
      })}
      <circle cx={W - 80} cy="40" r="120" fill="#fff" opacity=".07" />
      <circle cx={W - 30} cy="200" r="70" fill="#fff" opacity=".06" />
      {showTitle ? (
        <>
          <text x={wide ? 60 : 40} y="96" fontSize={wide ? 70 : 60}>{icon}</text>
          <text x={wide ? 160 : 40} y={wide ? 92 : 146} fill="#fff" fontSize={wide ? 40 : 30} fontWeight="800" fontFamily="Inter, system-ui, sans-serif">{(track?.name || '').slice(0, wide ? 48 : 34)}</text>
          <text x={wide ? 160 : 40} y={wide ? 134 : 180} fill="#fff" opacity=".88" fontSize={wide ? 20 : 16} fontFamily="Inter, system-ui, sans-serif">{topics.join('  ·  ').slice(0, wide ? 110 : 70)}</text>
        </>
      ) : (
        <text x={W / 2} y="140" fontSize="84" textAnchor="middle">{icon}</text>
      )}
    </svg>
  );
}

export function CourseCover({ track, height = 160, showTitle = true, wide = false }) {
  const media = useMedia();
  const custom = track && media.covers?.[track.key];
  if (custom) return <img className="course-cover" src={custom} alt={track.name} style={{ height }} />;
  return <GeneratedCover track={track} height={height} showTitle={showTitle} wide={wide} />;
}

/* ------------------------------ video player ------------------------------ */
export function VideoPlayer({ v }) {
  const { url, missing } = useResolvedSrc(v.src);
  if (missing) return <div className="rv-missing">This video was uploaded on the admin's computer only. Ask your admin to share it as a YouTube/Drive link.</div>;
  if (!url) return <div className="rv-missing">Loading video…</div>;
  if (v.kind === 'file' || v.src.startsWith('idb:')) return <video className="rv-video" src={url} controls preload="metadata" controlsList="nodownload" />;
  if (v.kind === 'page') return <a className="btn" href={url} target="_blank" rel="noreferrer">▶ Open the video</a>;
  return <iframe className="rv-video" src={url} title={v.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />;
}

export function RecordedVideos({ track, lessonId, title }) {
  const media = useMedia();
  const list = [...(lessonId ? media.videos?.[lessonScope(track, lessonId)] || [] : []), ...(!lessonId ? media.videos?.[courseScope(track)] || [] : [])];
  const [cur, setCur] = useState(0);
  if (!list.length) return null;
  const v = list[Math.min(cur, list.length - 1)];
  return (
    <div className="card rv">
      <div className="rv-head"><b>🎥 {title || (lessonId ? 'Recorded class for this lesson' : 'Recorded classes for this course')}</b><span className="muted small">{list.length} video{list.length > 1 ? 's' : ''}</span></div>
      <VideoPlayer v={v} />
      <div className="rv-title"><b>{v.title}</b>{v.note && <span className="muted small"> · {v.note}</span>}</div>
      {list.length > 1 && (
        <div className="rv-list">{list.map((x, i) => (
          <button key={x.id} className={`chip ${i === cur ? 'active' : ''}`} onClick={() => setCur(i)}>▶ {x.title}</button>
        ))}</div>
      )}
    </div>
  );
}

// Name on certificates: what the student typed on that page, else the profile's full name, else the account name.
export function CertName({ fallback }) {
  return useCertName(fallback);
}
