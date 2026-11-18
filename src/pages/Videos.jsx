import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlayCircle, Clock, Film } from 'lucide-react';
import { tracks, trackGroups, trackOrder, topicLabel, topicKey } from '../data/index.js';
import { buildScenes, totalSeconds, fmtTime } from '../video/scenes.js';
import { drawFrame, W, H } from '../video/draw.js';
import { resolveColor } from '../components/VideoLesson.jsx';
import { useProgress } from '../progress.js';

const TW = 320;
const TH = 180;

// small canvas thumbnail = the video's intro frame (with logo + course name), drawn when scrolled into view
function Thumb({ topic, track, label, color }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const paint = () => {
      const ctx = cv.getContext('2d');
      ctx.setTransform(TW / W, 0, 0, TH / H, 0, 0);
      const scene = buildScenes({ ...topic, objectives: [], theory: [], examples: [], practice: [], interview: [] }, track, { label })[0];
      drawFrame(ctx, scene, 1, { color, course: track.name, label, title: topic.title, index: 0, total: 1, globalProgress: 0, caption: '' });
    };
    if (typeof IntersectionObserver === 'undefined') { paint(); return undefined; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { paint(); io.disconnect(); } }, { rootMargin: '200px' });
    io.observe(cv);
    return () => io.disconnect();
  }, [topic, track, label, color]);
  return <canvas ref={ref} width={TW} height={TH} className="vthumb-canvas" />;
}

export default function Videos() {
  const [params, setParams] = useSearchParams();
  const groups = trackGroups.filter((g) => g.tracks.some((k) => tracks[k]));
  const trackKey = params.get('course') && tracks[params.get('course')] ? params.get('course') : groups[0]?.tracks.find((k) => tracks[k]) || trackOrder[0];
  const groupKey = params.get('group') || groups.find((g) => g.tracks.includes(trackKey))?.key || groups[0]?.key;
  const group = groups.find((g) => g.key === groupKey) || groups[0];
  const tr = tracks[trackKey];
  const color = useMemo(() => resolveColor(tr.color), [tr]);
  const p = useProgress();
  const [q, setQ] = useState('');

  const items = useMemo(() => tr.topics.map((t, i) => {
    const label = topicLabel(trackKey, t, i);
    const scenes = buildScenes(t, tr, { label });
    return { t, label, secs: totalSeconds(scenes), slides: scenes.length };
  }), [tr, trackKey]);
  const shown = items.filter(({ t, label }) => !q || `${label} ${t.title} ${t.module || ''}`.toLowerCase().includes(q.toLowerCase()));
  const totalTime = items.reduce((a, x) => a + x.secs, 0);

  const allCount = trackOrder.reduce((a, k) => a + (tracks[k]?.topics.length || 0), 0);

  return (
    <div className="videos-page">
      <div className="page-head">
        <h1 className="with-icon"><Film size={28} /> Video Lessons</h1>
        <p className="muted">
          {allCount} narrated video lessons with subtitles, one for every topic of every course. Each video explains the theory,
          shows a <b>live practical demo</b> in the practice tool, gives you a “pause &amp; try” task with its solution and ends with interview questions.
        </p>
      </div>

      <div className="vgroups">
        {groups.map((g) => (
          <button key={g.key} className={`chip ${g.key === group.key ? 'active' : ''}`} onClick={() => setParams({ group: g.key, course: g.tracks.find((k) => tracks[k]) })}>{g.name}</button>
        ))}
      </div>
      <div className="vcourses">
        {group.tracks.filter((k) => tracks[k]).map((k) => (
          <button key={k} className={`vcourse ${k === trackKey ? 'active' : ''}`} style={{ '--c': tracks[k].color }} onClick={() => setParams({ group: group.key, course: k })}>
            <span>{tracks[k].icon}</span> {tracks[k].short || tracks[k].name}
            <small>{tracks[k].topics.length}</small>
          </button>
        ))}
      </div>

      <div className="vhead">
        <div>
          <h2>{tr.name}</h2>
          <p className="muted small">{items.length} videos · about {Math.round(totalTime / 3600 * 10) / 10} hours</p>
        </div>
        <input className="input" style={{ maxWidth: 280 }} placeholder="Search videos…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="vgrid">
        {shown.map(({ t, label, secs, slides }) => {
          const done = p.done[topicKey(trackKey, t.id)];
          return (
            <Link key={t.id} to={`/track/${trackKey}/${t.id}?tab=video`} className="vcard">
              <div className="vthumb">
                <Thumb topic={t} track={tr} label={label} color={color} />
                <span className="vplay"><PlayCircle size={44} /></span>
                <span className="vdur"><Clock size={12} /> {fmtTime(secs)}</span>
                {done && <span className="vdone">✓ Done</span>}
              </div>
              <div className="vbody">
                <span className="vlabel" style={{ color: tr.color }}>{label}{t.module ? ` · ${t.module}` : ''}</span>
                <b>{t.title}</b>
                <span className="muted small">{slides} slides · theory · live demo · practice · interview</span>
              </div>
            </Link>
          );
        })}
      </div>
      {!shown.length && <p className="muted">No videos match “{q}”.</p>}
    </div>
  );
}
