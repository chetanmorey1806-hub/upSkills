// Turns a lesson object into a list of video "scenes" (slides with narration).
// Every lesson in every course gets a branded, narrated video lesson automatically.

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

// text with markdown fences removed (fences become separate code scenes)
function splitFences(s = '') {
  const codes = [];
  const text = String(s).replace(FENCE_RE, (_, c) => { codes.push(c.replace(/\s+$/, '')); return '\n'; });
  return { text, codes };
}

// split long text into pages of ~maxChars at paragraph / sentence boundaries
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

// estimate how long the narration takes at rate 1 (≈ 2.6 words / sec)
export function speechSeconds(text) {
  const words = String(text || '').split(/\s+/).filter(Boolean).length;
  return words / 2.6;
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

/**
 * @param {object} t      lesson
 * @param {object} tr     track ({ name, short, unit })
 * @param {object} opts   { toolName, label }   label e.g. "Day 11"
 */
export function buildScenes(t, tr, { toolName = 'Practice Tool', label = '' } = {}) {
  const scenes = [];
  const add = (s) => scenes.push({ minDur: 4, ...s });
  const course = tr?.name || '';

  // 1. Intro
  add({
    type: 'intro', chapter: 'Introduction', course, label, title: t.title, summary: t.summary || '', module: t.module || '', level: t.level || '', duration: t.duration || '',
    narration: `Welcome to UpSkillr. This is the ${course} course${label ? `, ${label}` : ''}. Today's topic is: ${plain(t.title)}. ${plain(t.summary || '')}`,
    minDur: 6,
  });

  // 2. Objectives
  if (t.objectives?.length) {
    const items = t.objectives.slice(0, 6);
    add({ type: 'bullets', chapter: 'Objectives', heading: 'After this video you will be able to', items, reveal: true,
      narration: `After this video you will be able to: ${items.map(plain).join('. ')}.` });
  }

  // 3. Theory
  (t.theory || []).forEach((th, i) => {
    const { text, codes } = splitFences(th.content || '');
    const pages = paginate(text);
    pages.forEach((pg, pi) => add({
      type: 'text', chapter: `Theory ${i + 1}`, heading: th.heading + (pages.length > 1 ? `  (${pi + 1}/${pages.length})` : ''), body: pg,
      narration: `${pi === 0 ? `${plain(th.heading)}. ` : ''}${plain(pg)}`,
    }));
    if (th.points?.length) {
      const items = th.points.slice(0, 7);
      add({ type: 'bullets', chapter: `Theory ${i + 1}`, heading: `${th.heading}: key points`, items, reveal: true,
        narration: `Key points. ${items.map(plain).join('. ')}.` });
    }
    const syntax = th.syntax || codes[0];
    if (syntax) {
      add({ type: 'code', chapter: `Theory ${i + 1}`, heading: th.syntax ? 'Syntax' : th.heading, code: syntax, file: 'syntax',
        narration: `Here is the ${th.syntax ? 'syntax' : 'code'}. Read it line by line.` , minDur: Math.min(14, 4 + syntax.split('\n').length * 0.6) });
    }
    if (th.tip) add({ type: 'tip', chapter: `Theory ${i + 1}`, body: th.tip, narration: `Tip. ${plain(th.tip)}` });
  });

  // 4. Practical: tool introduction
  add({
    type: 'howto', chapter: 'Practical', toolName,
    items: [
      'Open the lesson’s “Examples” tab',
      `Click the “▶ Try” / “Open in ${toolName}” button on any example`,
      `Or open Practice Tools → ${toolName} and type the code yourself`,
      'Press Run and compare your output with the expected result',
      'Change one value at a time and run again: that is how you learn',
    ],
    narration: `Now let's practise this practically in the ${toolName}. Open the Examples tab of this lesson and click the Try button on an example, or open Practice Tools and choose ${toolName}. Type the code, press Run, and compare your output with the expected result. Then change one value at a time and run it again.`,
    minDur: 8,
  });

  // 5. Worked examples: steps -> live demo in the tool
  (t.examples || []).forEach((ex, i) => {
    const steps = (ex.steps || []).slice(0, 7);
    add({ type: 'bullets', chapter: `Example ${i + 1}`, kicker: `Example ${i + 1}`, heading: ex.title, sub: ex.scenario || '', items: steps, reveal: true, numbered: true,
      narration: `Example ${i + 1}: ${plain(ex.title)}. ${plain(ex.scenario || '')} ${steps.length ? `Steps: ${steps.map((s, k) => `${k + 1}. ${plain(s)}`).join('. ')}.` : ''}` });
    const code = codeOf(ex);
    if (code) {
      const output = outputOf(ex);
      const reqs = ex.api?.requests?.length ? ex.api.requests.slice(0, 4).map((r) => `${r.method} ${r.url}`) : null;
      const lines = code.split('\n').length;
      add({
        type: 'practical', chapter: `Example ${i + 1}`, toolName, title: ex.title, code, output, requests: reqs,
        narration: `Let's do it in the ${toolName}. We type the code, then press Run. ${output ? 'And here is the output.' : ''} ${plain(ex.explanation || '')}`.trim(),
        minDur: Math.min(30, 8 + lines * 0.45),
      });
    } else if (ex.explanation) {
      add({ type: 'text', chapter: `Example ${i + 1}`, heading: 'Explanation', body: ex.explanation, narration: plain(ex.explanation) });
    }
  });

  // 6. Practice: pause and try
  (t.practice || []).slice(0, 3).forEach((pr, i) => {
    add({
      type: 'practice', chapter: `Practice ${i + 1}`, n: i + 1, task: pr.task, hint: pr.hint || '', solution: pr.solution || '', toolName,
      narration: `Practice task ${i + 1}. ${plain(pr.task)}. Pause the video and try it yourself in the ${toolName}. Hint: ${plain(pr.hint || 'read the examples again')}. Now let's look at the solution.`,
      minDur: Math.min(30, 14 + String(pr.solution || '').split('\n').length * 0.5),
    });
  });

  // 7. Interview revision
  const iv = (t.interview || []).slice(0, 4);
  iv.forEach((q, i) => add({
    type: 'qa', chapter: 'Interview Q&A', n: i + 1, total: iv.length, q: q.q, a: clip(q.a || '', 560),
    narration: `Interview question ${i + 1}. ${plain(q.q)} Answer: ${plain(clip(q.a || '', 560))}`,
  }));

  // 8. Outro
  add({
    type: 'outro', chapter: 'Summary', title: t.title, course, label,
    items: ['Re-watch any chapter from the list', `Practise in the ${toolName}`, `Take the ${t.quiz?.length || 5}-question quiz`, 'Mark the topic as completed'],
    narration: `Great work! You finished ${plain(t.title)}. Practise the tasks in the ${toolName}, then take the quiz to test yourself. See you in the next video on UpSkillr.`,
    minDur: 7,
  });

  return scenes.map((s, i) => ({ ...s, index: i, est: Math.max(s.minDur, speechSeconds(s.narration) + 1.2) }));
}

export const totalSeconds = (scenes) => scenes.reduce((a, s) => a + s.est, 0);
export const fmtTime = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
