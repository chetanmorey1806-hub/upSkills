import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize, Volume2, VolumeX, Captions, Download, ListVideo, RotateCcw, Languages, Gauge } from 'lucide-react';
import { buildScenes, totalSeconds, fmtTime } from '../video/scenes.js';
import { drawFrame, W, H } from '../video/draw.js';
import { LANGS } from '../video/i18n.js';
import { translateTexts, cached, engineFor, prepareBuiltIn } from '../video/translate.js';

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

// split text into speakable chunks (Chrome stops very long utterances)
function chunks(text) {
  const parts = String(text).match(/[^.!?।]+[.!?।]*["')\]]*\s*/g) || [String(text)];
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
  return out;
}

const DEFAULT_PREFS = { speed: 1, voice: true, captions: true, lang: 'en', voices: {} };
function loadPrefs() {
  try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') }; } catch { return DEFAULT_PREFS; }
}

// pick the best installed voice for a language
function autoVoice(voices, lang) {
  const order = LANGS.find((l) => l.id === lang)?.tts || ['en'];
  for (const code of order) {
    const list = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(code.toLowerCase()));
    if (list.length) return list.find((v) => /natural|online|neural/i.test(v.name)) || list.find((v) => /google/i.test(v.name)) || list[0];
  }
  return null;
}

/**
 * Props: topic, track (track object), label ("Day 11"), toolName, lessonKey
 */
export default function VideoLesson({ topic, track, label, toolName, lessonKey }) {
  const [prefs, setPrefs] = useState(loadPrefs);
  const lang = prefs.lang || 'en';
  const scenes = useMemo(() => buildScenes(topic, track, { toolName, label, lang }), [topic, track, toolName, label, lang]);
  const total = useMemo(() => totalSeconds(scenes), [scenes]);
  const color = useMemo(() => resolveColor(track?.color), [track]);
  const chapters = useMemo(() => {
    const out = [];
    scenes.forEach((s, i) => { if (!out.length || out[out.length - 1].name !== s.chapter) out.push({ name: s.chapter, start: i }); });
    return out;
  }, [scenes]);

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voices, setVoices] = useState([]);
  const [showList, setShowList] = useState(true);
  const [engine, setEngine] = useState('none');
  const [busy, setBusy] = useState('');
  const [, force] = useState(0);

  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const st = useRef({ elapsed: 0, last: 0, speaking: false, unit: 0, units: [], token: 0, waiting: false, time: 0 });
  const recRef = useRef(null);

  const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const scene = scenes[Math.min(idx, scenes.length - 1)];
  const doneBefore = useMemo(() => scenes.slice(0, idx).reduce((a, s) => a + s.est, 0), [scenes, idx]);
  const voice = useMemo(() => voices.find((v) => v.name === prefs.voices?.[lang]) || autoVoice(voices, lang), [voices, prefs.voices, lang]);

  useEffect(() => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch { /* ignore */ } }, [prefs]);
  useEffect(() => { setIdx(0); setPlaying(false); st.current.elapsed = 0; }, [lessonKey]);
  useEffect(() => { let on = true; engineFor(lang).then((e) => on && setEngine(e)); return () => { on = false; }; }, [lang]);

  // voices
  useEffect(() => {
    if (!hasSpeech) return undefined;
    const load = () => setVoices(window.speechSynthesis.getVoices().filter((v) => /^(en|hi|mr)/i.test(v.lang)));
    load();
    window.speechSynthesis.addEventListener?.('voiceschanged', load);
    return () => { window.speechSynthesis.removeEventListener?.('voiceschanged', load); window.speechSynthesis.cancel(); };
  }, [hasSpeech]);

  // narration units of a scene in the current language: [{ text, part, item }]
  const unitsOf = useCallback((sc) => {
    const out = [];
    sc.say.forEach((it, item) => {
      const text = it.x && lang !== 'en' ? (cached(lang, it.t) || it.t) : it.t;
      chunks(text).forEach((c) => out.push({ text: c, part: it.part, item }));
    });
    return out.length ? out : [{ text: '', item: 0 }];
  }, [lang]);

  const needsTranslation = useCallback((sc) => lang !== 'en' && sc.say.some((it) => it.x && !cached(lang, it.t)), [lang]);
  const translateScene = useCallback((sc) => translateTexts(sc.say.filter((it) => it.x).map((it) => it.t), lang), [lang]);

  const stopSpeech = useCallback(() => {
    st.current.token += 1;
    st.current.speaking = false;
    if (hasSpeech) window.speechSynthesis.cancel();
  }, [hasSpeech]);

  // speak the narration from unit `from`
  const speak = useCallback((sc, from = 0) => {
    const s = st.current;
    s.units = unitsOf(sc);
    s.unit = Math.min(from, s.units.length - 1);
    if (!hasSpeech || !prefs.voice || recording) { s.speaking = false; return; }
    window.speechSynthesis.cancel();
    const token = ++s.token;
    const list = s.units.slice(s.unit);
    if (!list.length) { s.speaking = false; return; }
    s.speaking = true;
    list.forEach((u, k) => {
      const ut = new SpeechSynthesisUtterance(u.text);
      if (voice) ut.voice = voice;
      ut.lang = voice?.lang || (lang === 'en' ? 'en-IN' : `${lang}-IN`);
      ut.rate = Math.min(2, Math.max(0.5, prefs.speed));
      ut.onstart = () => { if (token === s.token) s.unit = from + k; };
      const end = () => { if (token === s.token && k === list.length - 1) s.speaking = false; };
      ut.onend = end;
      ut.onerror = end;
      window.speechSynthesis.speak(ut);
    });
  }, [hasSpeech, prefs.voice, prefs.speed, voice, lang, recording, unitsOf]);

  // start a scene: translate first (if needed), then speak; prefetch the next scenes
  const startScene = useCallback((sc, from = 0) => {
    const s = st.current;
    const token = ++s.token;
    if (needsTranslation(sc)) {
      s.waiting = true;
      setBusy('translating');
      // never block the video for long: after 10 s continue (content in English for this slide)
      Promise.race([translateScene(sc).catch(() => {}), new Promise((r) => setTimeout(r, 10000))]).then(() => {
        if (token !== s.token) return;
        s.waiting = false;
        setBusy('');
        speak(sc, from);
      });
    } else {
      s.waiting = false;
      speak(sc, from);
    }
    if (lang !== 'en') scenes.slice(sc.index + 1, sc.index + 3).forEach((n) => { if (needsTranslation(n)) translateScene(n); });
  }, [needsTranslation, translateScene, speak, lang, scenes]);

  const render = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || !scene) return;
    const ctx = cv.getContext('2d');
    const s = st.current;
    const p = Math.min(1, s.elapsed / scene.est);
    const units = s.units.length ? s.units : unitsOf(scene);
    const narrating = prefs.voice && hasSpeech && !recording && s.speaking;
    const ui = narrating ? s.unit : Math.min(units.length - 1, Math.floor(p * units.length));
    const cur = units[Math.max(0, ui)] || {};
    // which code part is being explained (walkthrough)
    let part;
    if (scene.type === 'walk') {
      for (let k = Math.max(0, ui); k >= 0; k -= 1) if (units[k]?.part != null) { part = units[k].part; break; }
      if (part == null) part = 0;
    }
    const partText = scene.type === 'walk' ? scene.parts.map((pt) => (pt.translate && lang !== 'en' ? cached(lang, pt.say) || pt.say : pt.say)) : null;
    drawFrame(ctx, scene, p, {
      color, course: track?.name || '', label, title: topic.title, index: idx, total: scenes.length,
      globalProgress: (doneBefore + Math.min(s.elapsed, scene.est)) / total,
      caption: prefs.captions || recording ? cur.text || '' : '',
      time: s.time, part, partText,
    });
  }, [scene, prefs.captions, prefs.voice, recording, hasSpeech, color, track, label, topic.title, idx, scenes.length, doneBefore, total, unitsOf, lang]);

  // scene change
  useEffect(() => {
    st.current.elapsed = 0;
    st.current.units = scene ? unitsOf(scene) : [];
    st.current.unit = 0;
    if (playing && scene) startScene(scene, 0);
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
      s.time += dt;
      if (!s.waiting) s.elapsed += dt * prefs.speed;
      render();
      if (now - (s.uiAt || 0) > 250) { s.uiAt = now; force((x) => x + 1); }
      const narrating = prefs.voice && hasSpeech && !recording && s.speaking;
      if (!s.waiting && s.elapsed >= scene.est && !narrating) {
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
    if (lang !== 'en') prepareBuiltIn(lang); // user gesture → allows the on-device model download
    setPlaying(true);
    startScene(scene, st.current.unit || 0);
  };
  const pause = () => { setPlaying(false); stopSpeech(); setBusy(''); };
  const toggle = () => (playing ? pause() : play());
  const go = (i) => {
    const n = Math.max(0, Math.min(scenes.length - 1, i));
    stopSpeech();
    st.current.elapsed = 0;
    st.current.unit = 0;
    if (n === idx) { if (playing) startScene(scene, 0); render(); force((x) => x + 1); } else setIdx(n);
  };

  const restartSpeech = () => { if (playing) { stopSpeech(); setTimeout(() => startScene(scene, st.current.unit), 0); } };
  const setLang = (l) => {
    stopSpeech();
    if (l !== 'en') prepareBuiltIn(l, (x) => setBusy(x < 1 ? `downloading ${Math.round(x * 100)}%` : ''));
    setPrefs({ ...prefs, lang: l });
    st.current.elapsed = 0;
    st.current.unit = 0;
    // scenes are rebuilt for the new language; the scene effect restarts the narration
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
    const parts = [];
    rec.ondataavailable = (e) => e.data.size && parts.push(e.data);
    rec.onstop = () => {
      recRef.current = null;
      setRecording(false);
      const blob = new Blob(parts, { type: rec.mimeType || 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `UpSkillr-${(track?.short || 'course').replace(/\W+/g, '-')}-${(label || topic.id).replace(/\W+/g, '-')}-${lang}.${/mp4/.test(rec.mimeType) ? 'mp4' : 'webm'}`;
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

  const langVoices = voices.filter((v) => (LANGS.find((l) => l.id === lang)?.tts || []).some((c) => v.lang.toLowerCase().startsWith(c.toLowerCase())));
  const exactVoice = voice && voice.lang.toLowerCase().startsWith(lang);
  const engineNote = lang === 'en' ? null
    : engine === 'builtin' ? '✓ Lesson content is translated on your device (free, built into your browser).'
      : engine === 'claude' ? '✓ Lesson content is translated with your Claude API key (from the AI tools).'
        : '⚠ Your browser cannot translate. Intro, steps and code explanations are in this language; the lesson content is spoken in English. Use the latest Chrome or Edge, or add your Claude API key in the AI Lab.';

  return (
    <div className="vl" ref={wrapRef}>
      <div className="vl-main">
        <div className="vl-langbar">
          <Languages size={16} />
          {LANGS.map((l) => (
            <button key={l.id} className={`vl-lang ${lang === l.id ? 'on' : ''}`} onClick={() => setLang(l.id)}>{l.label}</button>
          ))}
          {busy && <span className="vl-busy">{busy.startsWith('down') ? `⬇ Language model ${busy}` : '⏳ Translating…'}</span>}
        </div>
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
          <label className="vl-speed" title="Speed">
            <Gauge size={16} />
            <input type="range" min="0.5" max="2" step="0.05" value={prefs.speed}
              onChange={(e) => setPrefs({ ...prefs, speed: Number(e.target.value) })}
              onMouseUp={restartSpeech} onTouchEnd={restartSpeech} onKeyUp={restartSpeech} />
            <b>{prefs.speed.toFixed(2).replace(/0$/, '')}x</b>
          </label>
          <button className={`vl-btn ${prefs.voice ? 'on' : ''}`} disabled={!hasSpeech} onClick={() => { const v = !prefs.voice; setPrefs({ ...prefs, voice: v }); if (!v) stopSpeech(); else if (playing) startScene(scene, st.current.unit); }} title={hasSpeech ? 'Voice narration' : 'Your browser has no text-to-speech'}>
            {prefs.voice ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button className={`vl-btn ${prefs.captions ? 'on' : ''}`} onClick={() => setPrefs({ ...prefs, captions: !prefs.captions })} title="Subtitles"><Captions size={18} /></button>
          <button className={`vl-btn ${showList ? 'on' : ''}`} onClick={() => setShowList(!showList)} title="Chapters"><ListVideo size={18} /></button>
          <button className="vl-btn" onClick={fullscreen} title="Full screen"><Maximize size={18} /></button>
        </div>
        <div className="vl-extra">
          {[0.75, 1, 1.25, 1.5].map((v) => (
            <button key={v} className={`chip ${Math.abs(prefs.speed - v) < 0.01 ? 'active' : ''}`} onClick={() => { setPrefs({ ...prefs, speed: v }); restartSpeech(); }}>{v}x</button>
          ))}
          {hasSpeech && (
            <label>🎙 Voice{' '}
              <select value={prefs.voices?.[lang] || ''} onChange={(e) => { setPrefs({ ...prefs, voices: { ...(prefs.voices || {}), [lang]: e.target.value } }); restartSpeech(); }}>
                <option value="">Auto {voice ? `(${voice.name})` : ''}</option>
                {langVoices.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
              </select>
            </label>
          )}
          {recording
            ? <button className="btn small" onClick={cancelRecord}>■ Stop recording &amp; save</button>
            : <button className="btn small" onClick={record} title="Plays the whole video once and saves it as a video file"><Download size={14} /> Download video</button>}
        </div>
        {(engineNote || (hasSpeech && voices.length > 0 && !exactVoice)) && (
          <div className="vl-notes">
            {engineNote && <p className="muted small">{engineNote}</p>}
            {hasSpeech && voices.length > 0 && !exactVoice && (
              <p className="muted small">
                {voice
                  ? `⚠ No ${LANGS.find((l) => l.id === lang)?.label} voice is installed, so “${voice.name}” is used. `
                  : '⚠ No voice for this language is installed, subtitles are shown instead. '}
                Microsoft Edge has natural Indian voices for English, Hindi and Marathi (e.g. Neerja, Swara, Aarohi). On Windows you can also add them in Settings → Time &amp; language → Speech.
              </p>
            )}
          </div>
        )}
        <p className="muted small vl-note">Shortcuts: Space = play/pause, ← → = previous/next slide.{recording ? ' Recording… the video plays once and downloads automatically at the end (subtitles are burned in; the browser voice cannot be recorded).' : ''}</p>
      </div>
      {showList && (
        <aside className="vl-list">
          <h4>{scenes.length} slides · {fmtTime(total)}</h4>
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
