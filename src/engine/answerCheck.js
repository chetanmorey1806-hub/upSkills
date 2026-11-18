// Lightweight answer analysis for mock interviews and soft-skills practice (runs fully in the browser).

const STOP = new Set(('a an the and or but if then else when while of to in on at by for with without from into onto over under about as is are was were be been being it its this that these those there here which who whom whose what why how ' +
  'can could should would will shall may might must do does did done doing have has had having not no yes you your we our they their he she his her i me my mine us them than so such very also just only more most less least ' +
  'each every any all some many much few other another same both either neither own one two use used using uses like e.g eg etc i.e ie get gets got make makes made way ways thing things example examples give gives').split(' '));

export const FILLERS = ['um', 'umm', 'uh', 'uhh', 'like', 'basically', 'actually', 'literally', 'you know', 'i mean', 'kind of', 'sort of', 'so yeah', 'okay so', 'right?'];

const norm = (s) => String(s || '').toLowerCase().replace(/`/g, ' ').replace(/\*\*/g, ' ');
const stem = (w) => (w.length > 4 ? w.replace(/(ing|ed)$/, '').replace(/([^s])s$/, '$1') : w);

function tokens(s) {
  return norm(s).match(/[a-z_][a-z0-9_+#.]*[a-z0-9_+#]|[a-z]/g) || [];
}

// Top keywords of a model answer: frequent, non-trivial words (code identifiers count double).
export function keywords(model, max = 12) {
  const freq = new Map();
  const codeIds = new Set((String(model).match(/`([^`]+)`/g) || []).flatMap((c) => tokens(c)));
  tokens(model).forEach((w) => {
    if (w.length < 3 || STOP.has(w) || /^\d+$/.test(w)) return;
    freq.set(w, (freq.get(w) || 0) + (codeIds.has(w) ? 2 : 1));
  });
  const seen = new Set();
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([w]) => w)
    .filter((w) => { const s = stem(w); if (seen.has(s)) return false; seen.add(s); return true; })
    .slice(0, max);
}

export function fillerCount(text) {
  const t = ` ${norm(text).replace(/[^a-z?' ]/g, ' ').replace(/\s+/g, ' ')} `;
  const found = {};
  FILLERS.forEach((f) => {
    const n = t.split(` ${f} `).length - 1;
    if (n) found[f] = n;
  });
  return found;
}

// Compare a student's answer with the model answer.
export function analyzeAnswer(answer, model) {
  const kws = keywords(model);
  const ans = new Set(tokens(answer).map(stem));
  const matched = kws.filter((k) => ans.has(stem(k)));
  const missed = kws.filter((k) => !ans.has(stem(k)));
  const words = (String(answer).trim().match(/\S+/g) || []).length;
  const coverage = kws.length ? Math.round((matched.length / kws.length) * 100) : 0;
  let verdict = 'Too short: explain more';
  if (words >= 12) verdict = coverage >= 60 ? 'Strong answer' : coverage >= 35 ? 'Good start: add the missing points' : 'Covers few key points';
  return { coverage, matched, missed, words, fillers: fillerCount(answer), verdict };
}

// STAR structure check for behavioural answers.
export function starCheck(text) {
  const t = norm(text);
  return {
    Situation: /\b(when|during|in my|at my|last (year|semester)|once|project|internship|college)\b/.test(t),
    Task: /\b(had to|needed to|my (role|task|responsibility|goal)|responsible|asked to|goal was)\b/.test(t),
    Action: /\b(i (decided|created|built|organi[sz]ed|talked|spoke|planned|learned|wrote|fixed|led|took|started|divided|scheduled|helped|implemented))\b/.test(t),
    Result: /\b(result|as a result|finally|in the end|outcome|achieved|improved|reduced|increased|completed|delivered|learned that|%|percent)\b/.test(t),
  };
}

export function speakingStats(text, seconds) {
  const words = (String(text).trim().match(/\S+/g) || []).length;
  const wpm = seconds > 0 ? Math.round((words / seconds) * 60) : 0;
  const fillers = fillerCount(text);
  const fillerTotal = Object.values(fillers).reduce((a, b) => a + b, 0);
  const pace = !wpm ? '' : wpm < 100 ? 'A little slow: aim for 120-150 words per minute' : wpm > 170 ? 'Too fast: slow down and pause between points' : 'Good pace';
  return { words, wpm, fillers, fillerTotal, pace };
}
