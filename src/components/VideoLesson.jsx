import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize, Volume2, VolumeX, Captions, Download, ListVideo, RotateCcw } from 'lucide-react';
import { buildScenes, totalSeconds, fmtTime, plain } from '../video/scenes.js';
import { drawFrame, W, H } from '../video/draw.js';

const PREF_KEY = 'upskillr-video-prefs';

// CSS colour (incl. var(--x)) -> #rrggbb so the canvas can use it with alpha suffixes
export function resolveColor(c) {
  try {
    let v = c || '#6366f1';
    const m = /var\((--[\w-]+)\)/.exec(v);
    if (m) v = getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() || '#6366f1';
    if (/^#[0-9a-f]{6}$/i.test(v)) return v;
    if (/^#[0-9a-f]{3}$/i.test(v)) return `#${[...v.slice(1)].map((x) => x + x).join('')}`;
    const cv = document.createElement('canvas').getContext('2d');
    cv.fillStyle = v;
    const out = cv.fillStyle;
    return /^#[0-9a-f]{6}$/i.test(out) ? out : '#6366f1';
  } catch { return '#6366f1'; }
}

function sentencesOf(text) {
  const parts = String(text).match(/[^.!?]+[.!?]*["')\]]*\s*/g) || [String(text)];
  // merge very short parts, split very long ones (Chrome stops long utterances)
  const out = [];
  parts.forEach((p) => {
    let s = p.trim();
    if (!s) return;
    while (s.length > 220) {
      const cut = s.lastIndexOf(' ', 200) > 60 ? s.lastIndexOf(' ', 200) : 200;
      out.push(s.slice(0, cut));
      s = s.slice(cut).trim();
    }
    if (out.length && out[out.length - 1].length < 40) out[out.length - 1] += ` ${s}`;
    else out.push(s);
  });
  return out.length ? out : [''];
}

function loadPrefs() {
  try { return { speed: 1, voice: true, captions: true, voiceName: '', ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') }; } catch { return { speed: 1, voice: true, captions: true, voiceName: '' }; }
}

/**
 * Props: topic, track (track object), label ("Day 11"), toolName, lessonKey
 */
export default function VideoLesson({ topic, track, label, toolName, lessonKey }) {
  const scenes = useMemo(() => buildScenes(topic, track, { toolName, label }), [topic, track, toolName, label]);
  const total = useMemo(() => totalSeconds(scenes), [scenes]);
  const color = useMemo(() => resolveColor(track?.color), [track]);
  const chapters = useMemo(() => {
    const out = [];
    scenes.forEach((s, i) => { if (!out.length || out[out.length - 1].name !== s.chapter) out.push({ name: s.chapter, start: i }); });
    return out;
  }, [scenes]);

  const [prefs, setPrefs] = useState(loadPrefs);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voices, setVoices] = useState([]);
  const [showList, setShowList] = useState(true);
  const [, force] = useState(0);

  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const st = useRef({ elapsed: 0, last: 0, speaking: false, sent: 0, sents: [], token: 0 });
  const recRef = useRef(null);

  const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const scene = scenes[Math.min(idx, scenes.length - 1)];
  const doneBefore = useMemo(() => scenes.slice(0, idx).reduce((a, s) => a + s.est, 0), [scenes, idx]);

  useEffect(() => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch { /* ignore */ } }, [prefs]);

  // reset when lesson changes
  useEffect(() => { setIdx(0); setPlaying(false); st.current.elapsed = 0; }, [lessonKey]);

  // voices
  useEffect(() => {
    if (!hasSpeech) return undefined;
    const load = () => setVoices(window.speechSynthesis.getVoices().filter((v) => /^(en|hi|mr)/i.test(v.lang)));
    load();
    window.speechSynthesis.addEventListener?.('voiceschanged', load);
    return () => { window.speechSynthesis.removeEventListener?.('voiceschanged', load); window.speechSynthesis.cancel(); };
  }, [hasSpeech]);

  const stopSpeech = useCallback(() => {
    st.current.token += 1;
    st.current.speaking = false;
    if (hasSpeech) window.speechSynthesis.cancel();
  }, [hasSpeech]);

  // speak the narration from sentence `from`
  const speak = useCallback((sc, from = 0) => {
    const s = st.current;
    s.sents = sentencesOf(sc.narration);
    s.sent = from;
    if (!hasSpeech || !prefs.voice || recording) { s.speaking = false; return; }
    window.speechSynthesis.cancel();
    const token = ++s.token;
    const voice = voices.find((v) => v.name === prefs.voiceName) || voices.find((v) => /en-IN/i.test(v.lang)) || voices.find((v) => /^en/i.test(v.lang));
    const list = s.sents.slice(from);
    if (!list.length) { s.speaking = false; return; }
    s.speaking = true;
    list.forEach((txt, k) => {
      const u = new SpeechSynthesisUtterance(txt);
      if (voice) u.voice = voice;
      u.lang = voice?.lang || 'en-IN';
      u.rate = Math.min(2, Math.max(0.6, prefs.speed));
      u.onstart = () => { if (token === s.token) s.sent = from + k; };
      u.onend = () => { if (token === s.token && k === list.length - 1) s.speaking = false; };
      u.onerror = () => { if (token === s.token && k === list.length - 1) s.speaking = false; };
      window.speechSynthesis.speak(u);
    });
  }, [hasSpeech, prefs.voice, prefs.voiceName, prefs.speed, voices, recording]);

  const render = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || !scene) return;
    const ctx = cv.getContext('2d');
    const s = st.current;
    const p = Math.min(1, s.elapsed / scene.est);
    let cap = '';
    if (prefs.captions || recording) {
      const sents = s.sents.length ? s.sents : sentencesOf(scene.narration);
      const i = prefs.voice && hasSpeech && !recording && s.speaking ? s.sent : Math.min(sents.length - 1, Math.floor(p * sents.length));
      cap = plain(sents[Math.max(0, i)] || '');
    }
    drawFrame(ctx, scene, p, {
      color, course: track?.name || '', label, title: topic.title, index: idx, total: scenes.length,
      globalProgress: (doneBefore + Math.min(s.elapsed, scene.est)) / total, caption: cap,
    });
  }, [scene, prefs.captions, prefs.voice, recording, hasSpeech, color, track, label, topic.title, idx, scenes.length, doneBefore, total]);

  // start narration when scene changes while playing
  useEffect(() => {
    st.current.elapsed = 0;
    st.current.sents = sentencesOf(scene?.narration || '');
    st.current.sent = 0;
    if (playing && scene) speak(scene, 0);
    render();
  }, [idx, scene]); // eslint-disable-line react-hooks/exhaustive-deps

  // animation loop
  useEffect(() => {
    if (!playing) { render(); return undefined; }
    let raf;
    st.current.last = performance.now();
    const tick = (now) => {
      const s = st.current;
      const dt = Math.min(0.1, (now - s.last) / 1000);
      s.last = now;
      s.elapsed += dt * prefs.speed;
      render();
      if (now - (s.uiAt || 0) > 250) { s.uiAt = now; force((x) => x + 1); } // refresh time / seek bar
      const narrating = prefs.voice && hasSpeech && !recording && s.speaking;
      if (s.elapsed >= scene.est && !narrating) {
        if (idx < scenes.length - 1) { setIdx(idx + 1); return; }
        setPlaying(false);
        stopSpeech();
        if (recRef.current) recRef.current.stop();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, idx, render, scene, scenes.length, prefs.speed, prefs.voice, hasSpeech, recording, stopSpeech]);

  const play = () => {
    if (idx === scenes.length - 1 && st.current.elapsed >= scene.est) { setIdx(0); st.current.elapsed = 0; }
    setPlaying(true);
    const s = st.current;
    speak(scene, s.sents.length ? Math.min(s.sent, s.sents.length - 1) : 0);
  };
  const pause = () => { setPlaying(false); stopSpeech(); };
  const toggle = () => (playing ? pause() : play());
  const go = (i) => {
    const n = Math.max(0, Math.min(scenes.length - 1, i));
    stopSpeech();
    st.current.elapsed = 0;
    if (n === idx) { if (playing) speak(scene, 0); render(); force((x) => x + 1); } else setIdx(n);
  };

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (!wrapRef.current?.contains(document.activeElement) && document.activeElement !== document.body) return;
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle(); }
      if (e.key === 'ArrowRight') go(idx + 1);
      if (e.key === 'ArrowLeft') go(idx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // stop speech when unmounting
  useEffect(() => () => { if (hasSpeech) window.speechSynthesis.cancel(); }, [hasSpeech]);

  const fullscreen = () => {
    const el = wrapRef.current?.querySelector('.vl-stage');
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.(); else el.requestFullscreen?.();
  };

  const record = () => {
    const cv = canvasRef.current;
    if (!cv?.captureStream || typeof MediaRecorder === 'undefined') { alert('Your browser cannot record video. Please use Chrome, Edge or Firefox.'); return; }
    const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'].find((m) => MediaRecorder.isTypeSupported?.(m));
    const rec = new MediaRecorder(cv.captureStream(30), mime ? { mimeType: mime, videoBitsPerSecond: 4_000_000 } : undefined);
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      recRef.current = null;
      setRecording(false);
      const blob = new Blob(chunks, { type: rec.mimeType || 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `UpSkillr-${(track?.short || 'course').replace(/\W+/g, '-')}-${(label || topic.id).replace(/\W+/g, '-')}.${/mp4/.test(rec.mimeType) ? 'mp4' : 'webm'}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    };
    recRef.current = rec;
    stopSpeech();
    setRecording(true);
    setIdx(0);
    st.current.elapsed = 0;
    rec.start(1000);
    setPlaying(true);
  };
  const cancelRecord = () => { pause(); recRef.current?.stop(); };

  const curChapter = chapters.filter((c) => c.start <= idx).pop();
  const elapsedTotal = doneBefore + Math.min(st.current.elapsed, scene?.est || 0);

  const seek = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const target = ((e.clientX - r.left) / r.width) * total;
    let acc = 0;
    for (let i = 0; i < scenes.length; i += 1) {
      if (acc + scenes[i].est > target) { go(i); return; }
      acc += scenes[i].est;
    }
  };

  return (
    <div className="vl" ref={wrapRef}>
      <div className="vl-main">
        <div className="vl-stage" onClick={toggle}>
          <canvas ref={canvasRef} width={W} height={H} />
          {!playing && !recording && (
            <button className="vl-bigplay" aria-label="Play" onClick={(e) => { e.stopPropagation(); play(); }}><Play size={38} fill="currentColor" /></button>
          )}
          {recording && <span className="vl-rec">● REC</span>}
        </div>
        <div className="vl-seek" onClick={seek} title="Jump to a part of the video">
          <div className="vl-seek-fill" style={{ width: `${(elapsedTotal / total) * 100}%`, background: color }} />
          {chapters.map((c) => {
            const at = scenes.slice(0, c.start).reduce((a, s) => a + s.est, 0);
            return <span key={c.start} className="vl-tick" style={{ left: `${(at / total) * 100}%` }} />;
          })}
        </div>
        <div className="vl-bar">
          <button className="vl-btn" onClick={() => go(idx - 1)} aria-label="Previous"><SkipBack size={18} /></button>
          <button className="vl-btn primary" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
          <button className="vl-btn" onClick={() => go(idx + 1)} aria-label="Next"><SkipForward size={18} /></button>
          <button className="vl-btn" onClick={() => go(0)} aria-label="Restart"><RotateCcw size={16} /></button>
          <span className="vl-time">{fmtTime(elapsedTotal)} / {fmtTime(total)}</span>
          <span className="vl-chap">{curChapter?.name}</span>
          <span className="vl-spacer" />
          <select value={prefs.speed} onChange={(e) => { const v = Number(e.target.value); setPrefs({ ...prefs, speed: v }); if (playing) { stopSpeech(); setTimeout(() => speak(scene, st.current.sent), 0); } }} title="Speed">
            {[0.75, 1, 1.25, 1.5, 2].map((v) => <option key={v} value={v}>{v}x</option>)}
          </select>
          <button className={`vl-btn ${prefs.voice ? 'on' : ''}`} disabled={!hasSpeech} onClick={() => { const v = !prefs.voice; setPrefs({ ...prefs, voice: v }); if (!v) stopSpeech(); else if (playing) speak(scene, st.current.sent); }} title={hasSpeech ? 'Voice narration' : 'Your browser has no text-to-speech'}>
            {prefs.voice ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button className={`vl-btn ${prefs.captions ? 'on' : ''}`} onClick={() => setPrefs({ ...prefs, captions: !prefs.captions })} title="Subtitles"><Captions size={18} /></button>
          <button className={`vl-btn ${showList ? 'on' : ''}`} onClick={() => setShowList(!showList)} title="Chapters"><ListVideo size={18} /></button>
          <button className="vl-btn" onClick={fullscreen} title="Full screen"><Maximize size={18} /></button>
        </div>
        <div className="vl-extra">
          {hasSpeech && voices.length > 0 && (
            <label>🎙 Voice{' '}
              <select value={prefs.voiceName} onChange={(e) => { setPrefs({ ...prefs, voiceName: e.target.value }); if (playing) { stopSpeech(); setTimeout(() => speak(scene, st.current.sent), 0); } }}>
                <option value="">Auto (English – India)</option>
                {voices.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
              </select>
            </label>
          )}
          {recording
            ? <button className="btn small" onClick={cancelRecord}>■ Stop recording &amp; save</button>
            : <button className="btn small" onClick={record} title="Plays the whole video once and saves it as a video file"><Download size={14} /> Download video</button>}
          <span className="muted small">Shortcuts: Space = play/pause, ← → = previous/next slide</span>
        </div>
        {recording && <p className="muted small vl-note">Recording… the video plays once from the start and downloads automatically at the end (subtitles are burned in; browser voice cannot be recorded).</p>}
      </div>
      {showList && (
        <aside className="vl-list">
          <h4>Chapters · {scenes.length} slides · {fmtTime(total)}</h4>
          <ol>
            {chapters.map((c, i) => {
              const end = chapters[i + 1]?.start ?? scenes.length;
              const active = idx >= c.start && idx < end;
              const dur = scenes.slice(c.start, end).reduce((a, s) => a + s.est, 0);
              return (
                <li key={c.start} className={active ? 'active' : idx >= end ? 'done' : ''}>
                  <button onClick={() => go(c.start)}>
                    <span className="vl-li-name">{c.name}</span>
                    <span className="vl-li-time">{fmtTime(dur)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
      )}
    </div>
  );
}
