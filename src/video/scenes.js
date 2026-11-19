// Turns a lesson object into a list of video "scenes" (slides with narration).
// Every lesson in every course gets a branded, narrated video lesson automatically.
// Narration is a list of items { t, x, part? }:
//   t = text, x = true when t is English lesson content that must be translated for hi/mr,
//   part = index of the code part highlighted while this item is spoken (code walkthrough).
import { tx } from './i18n.js';
import { explainCode, looksLikeProgram } from './codeExplain.js';

const FENCE_RE = /```[\w-]*\n?([\s\S]*?)```/g;

// Markdown-ish text -> plain text for narration
export function plain(s = '') {
  return String(s)
    .replace(FENCE_RE, ' ')
    .replace(/^\|.*\|\s*$/gm, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/[→⇒]/g, ' gives ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitFences(s = '') {
  const codes = [];
  const text = String(s).replace(FENCE_RE, (_, c) => { codes.push(c.replace(/\s+$/, '')); return '\n'; });
  return { text, codes };
}

function paginate(text, maxChars = 520) {
  const paras = String(text).split(/\n{2,}|\n(?=[-*•] )/).map((p) => p.trim()).filter(Boolean);
  const pages = [];
  let cur = '';
  const push = () => { if (cur.trim()) pages.push(cur.trim()); cur = ''; };
  for (const p of paras) {
    if (p.length > maxChars) {
      push();
      const sentences = p.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [p];
      for (const s of sentences) {
        if ((cur + s).length > maxChars) push();
        cur += s;
      }
      push();
    } else {
      if ((cur + '\n\n' + p).length > maxChars) push();
      cur += (cur ? '\n\n' : '') + p;
    }
  }
  push();
  return pages.length ? pages : [''];
}

const clip = (s, n) => (s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, '')}…` : s);

export function speechSeconds(text, lang = 'en') {
  const words = String(text || '').split(/\s+/).filter(Boolean).length;
  return (words / 2.6) * (lang === 'en' ? 1 : 1.2);
}

function codeOf(ex) {
  if (ex.api?.code) return ex.api.code;
  if (ex.playground) {
    const pg = ex.playground;
    if (pg.code) return pg.code;
    return [pg.html, pg.css && `/* CSS */\n${pg.css}`, pg.js && `// JS\n${pg.js}`].filter(Boolean).join('\n\n') || ex.code || '';
  }
  return ex.code || ex.python || ex.java || ex.csharp || ex.tsql || ex.mysql || ex.sql || ex.mongo || ex.prompt || '';
}

function outputOf(ex) {
  let out = ex.result || '';
  if (!out && ex.table?.rows) out = ex.table.rows.slice(0, 8).map((r) => (Array.isArray(r) ? r.join('  |  ') : Object.values(r).join('  |  '))).join('\n');
  return String(out);
}

// helpers to build narration items
const own = (t) => ({ t, x: false }); // already in the target language
const en = (t) => ({ t: plain(t), x: true }); // English lesson content → translated when needed

/**
 * @param {object} t      lesson
 * @param {object} tr     track ({ name, short, unit, lang })
 * @param {object} opts   { toolName, label, lang }
 */
export function buildScenes(t, tr, { toolName = 'Practice Tool', label = '', lang = 'en' } = {}) {
  const X = tx(lang);
  const L = X.L;
  const scenes = [];
  const ch = (name, n) => `${L.chapters[name] || name}${n ? ` ${n}` : ''}`;
  const add = (s) => scenes.push({ minDur: 4, ...s });
  const course = tr?.name || '';
  const proseTrack = tr?.lang === 'soft';

  // 1. Intro
  add({
    type: 'intro', chapter: ch('Introduction'), course, label, title: t.title, summary: t.summary || '', module: t.module || '', level: t.level || '', duration: t.duration || '',
    say: [own(X.intro(course, label, plain(t.title))), en(t.summary || '')], minDur: 6,
  });

  // 2. Objectives
  if (t.objectives?.length) {
    const items = t.objectives.slice(0, 6);
    add({ type: 'bullets', art: 'target', chapter: ch('Objectives'), heading: L.objectives, items, reveal: true, say: [own(X.objectives), ...items.map(en)] });
  }

  // 3. Theory
  (t.theory || []).forEach((th, i) => {
    const { text, codes } = splitFences(th.content || '');
    const pages = paginate(text);
    pages.forEach((pg, pi) => add({
      type: 'text', art: 'book', chapter: ch('Theory', i + 1), heading: th.heading + (pages.length > 1 ? `  (${pi + 1}/${pages.length})` : ''), body: pg, photoHeading: th.heading,
      say: [...(pi === 0 ? [lang === 'en' ? en(th.heading) : own(X.theory(plain(th.heading)))] : []), en(pg)],
    }));
    if (th.points?.length) {
      const items = th.points.slice(0, 7);
      add({ type: 'bullets', art: 'bulb', chapter: ch('Theory', i + 1), heading: `${th.heading}: ${L.keyPoints}`, photoHeading: th.heading, items, reveal: true, say: [own(X.keyPoints), ...items.map(en)] });
    }
    const syntax = th.syntax || codes[0];
    if (syntax) {
      add({ type: 'code', chapter: ch('Theory', i + 1), heading: th.syntax ? L.syntax : th.heading, code: syntax, file: 'syntax',
        say: [own(X.syntax)], minDur: Math.min(14, 4 + syntax.split('\n').length * 0.6) });
    }
    if (th.tip) add({ type: 'tip', chapter: ch('Theory', i + 1), heading: L.proTip, photoHeading: th.heading, body: th.tip, say: [own(X.tip), en(th.tip)] });
  });

  // 4. Practical: how to practise (pipeline graphic)
  add({ type: 'howto', chapter: ch('Practical'), toolName, heading: L.practiseIn(toolName), kicker: L.handsOn, items: L.howtoItems(toolName), pipeline: L.pipeline, say: [own(X.howto(toolName))], minDur: 10 });

  // 5. Worked examples: steps (flowchart) -> code walkthrough -> live demo in the tool
  (t.examples || []).forEach((ex, i) => {
    const steps = (ex.steps || []).slice(0, 6);
    add({
      type: 'flow', chapter: ch('Example', i + 1), kicker: `${L.example} ${i + 1}`, heading: ex.title, sub: ex.scenario || '', items: steps,
      say: [own(X.example(i + 1, plain(ex.title))), en(ex.scenario || ''), ...(steps.length ? [own(X.steps)] : []), ...steps.flatMap((s, k) => [own(X.step(k + 1)), en(s)])],
    });
    const code = codeOf(ex);
    if (code) {
      const output = outputOf(ex);
      const reqs = ex.api?.requests?.length ? ex.api.requests.slice(0, 4).map((r) => `${r.method} ${r.url}`) : null;
      const lines = code.split('\n').length;
      if (!proseTrack && lines >= 3 && looksLikeProgram(code)) {
        const parts = explainCode(code, lang, 6);
        if (parts.length >= 2) {
          add({
            type: 'walk', chapter: ch('Example', i + 1), kicker: L.codeWalk, heading: ex.title, code, parts, toolName,
            say: [own(X.walkIntro), ...parts.map((p, k) => ({ t: p.translate ? plain(p.say) : p.say, x: p.translate, part: k }))],
            minDur: 6 + parts.length * 3,
          });
        }
      }
      add({
        type: 'practical', chapter: ch('Example', i + 1), toolName, title: ex.title, code, output, requests: reqs, kicker: `${L.liveDemo} · ${toolName}`,
        say: [own(X.run(toolName)), ...(output ? [own(X.output)] : []), en(ex.explanation || '')],
        minDur: Math.min(30, 8 + lines * 0.45),
      });
    } else if (ex.explanation) {
      add({ type: 'text', art: 'book', chapter: ch('Example', i + 1), heading: ex.title, photoHeading: ex.title, body: ex.explanation, say: [en(ex.explanation)] });
    }
  });

  // 6. Practice: pause and try
  (t.practice || []).slice(0, 3).forEach((pr, i) => {
    add({
      type: 'practice', chapter: ch('Practice', i + 1), n: i + 1, task: pr.task, hint: pr.hint || '', solution: pr.solution || '', toolName,
      say: [own(X.practice(i + 1)), en(pr.task), own(X.pause(toolName)), ...(pr.hint ? [own(X.hint), en(pr.hint)] : []), own(X.solution)],
      minDur: Math.min(30, 14 + String(pr.solution || '').split('\n').length * 0.5),
    });
  });

  // 7. Interview revision
  const iv = (t.interview || []).slice(0, 4);
  iv.forEach((q, i) => add({
    type: 'qa', art: 'chat', chapter: ch('Interview Q&A'), n: i + 1, total: iv.length, q: q.q, a: clip(q.a || '', 560),
    say: [own(X.qa(i + 1)), en(q.q), own(X.answer), en(clip(q.a || '', 560))],
  }));

  // 8. Outro
  add({
    type: 'outro', chapter: ch('Summary'), title: t.title, course, label,
    items: L.outroItems(toolName, t.quiz?.length || 5),
    say: [own(X.outro(plain(t.title), toolName))], minDur: 7,
  });

  return scenes.map((s, i) => {
    const say = s.say.filter((it) => it.t && it.t.trim());
    const text = say.map((it) => it.t).join(' ');
    return { ...s, say, narration: text, L, lang, index: i, est: Math.max(s.minDur, speechSeconds(text, lang) + 1.2) };
  });
}

export const totalSeconds = (scenes) => scenes.reduce((a, s) => a + s.est, 0);
export const fmtTime = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
