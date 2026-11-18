// Canvas renderer for UpSkillr video lessons (1280x720). Pure drawing, no React.
export const W = 1280;
export const H = 720;

const C = {
  bg1: '#0b1020', bg2: '#111a33', panel: '#151e38', panel2: '#1b2547', line: 'rgba(255,255,255,.08)',
  text: '#e8ecf8', muted: '#94a3c4', accent: '#22d3ee', accent2: '#6366f1', yellow: '#fde047', green: '#34d399', red: '#f87171',
  code: '#1e1e2e', codeText: '#d4d4d4',
};
const FONT = '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif';
const MONO = '"JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace';

const ease = (x) => 1 - (1 - Math.min(1, Math.max(0, x))) ** 3;
const clamp01 = (x) => Math.min(1, Math.max(0, x));

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------- Logo (same artwork as components/Logo.jsx) ----------
export function drawLogo(ctx, x, y, size, alpha = 1) {
  const s = size / 64;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.scale(s, s);
  const g = ctx.createLinearGradient(0, 0, 64, 64);
  g.addColorStop(0, '#4f46e5');
  g.addColorStop(1, '#06b6d4');
  ctx.fillStyle = g;
  rr(ctx, 0, 0, 64, 64, 14);
  ctx.fill();
  ctx.fillStyle = '#fff';
  [[12, 38, 14, 0.6], [27.5, 29, 23, 0.8], [43, 20, 32, 1]].forEach(([bx, by, bh, o]) => {
    ctx.globalAlpha = alpha * o;
    rr(ctx, bx, by, 9, bh, 2.5);
    ctx.fill();
  });
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(12, 30); ctx.lineTo(28, 17); ctx.lineTo(35, 23); ctx.lineTo(48, 11); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(41, 10.5); ctx.lineTo(49.5, 10); ctx.lineTo(49, 18.5); ctx.stroke();
  ctx.restore();
}

function brandName(ctx, x, y, size) {
  ctx.font = `700 ${size}px ${FONT}`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Up', x, y);
  const w = ctx.measureText('Up').width;
  ctx.fillStyle = C.accent;
  ctx.fillText('Skillr', x + w, y);
  return w + ctx.measureText('Skillr').width;
}

// ---------- rich text (**bold**, `code`) with wrapping ----------
function tokens(text) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m;
  const s = String(text);
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: s.slice(last, m.index), k: 'n' });
    out.push(m[0][0] === '`' ? { t: m[0].slice(1, -1), k: 'c' } : { t: m[0].slice(2, -2), k: 'b' });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ t: s.slice(last), k: 'n' });
  return out;
}

function fontFor(k, size) {
  if (k === 'c') return `500 ${size * 0.92}px ${MONO}`;
  if (k === 'b') return `700 ${size}px ${FONT}`;
  return `400 ${size}px ${FONT}`;
}

// lays out rich text, returns lines [{words:[{t,k,w}], w}]
function layoutRich(ctx, text, maxW, size) {
  const lines = [];
  String(text).split('\n').forEach((para) => {
    let line = { words: [], w: 0 };
    tokens(para).forEach((tok) => {
      ctx.font = fontFor(tok.k, size);
      // keep short inline code as one pill; only split it if it cannot fit on a line
      const pieces = tok.k === 'c' && ctx.measureText(tok.t).width + 8 < maxW * 0.6 ? [tok.t] : tok.t.split(/(\s+)/);
      pieces.forEach((piece) => {
        if (!piece) return;
        const isSpace = /^\s+$/.test(piece);
        ctx.font = fontFor(tok.k, size);
        const w = ctx.measureText(isSpace ? ' ' : piece).width + (tok.k === 'c' && !isSpace ? 8 : 0);
        if (!isSpace && line.w + w > maxW && line.words.length) {
          lines.push(line);
          line = { words: [], w: 0 };
        }
        if (isSpace && !line.words.length) return;
        line.words.push({ t: isSpace ? ' ' : piece, k: isSpace ? 'n' : tok.k, w });
        line.w += w;
      });
    });
    lines.push(line);
  });
  return lines;
}

function drawRich(ctx, text, x, y, maxW, size, { color = C.text, lh = 1.45, maxLines = 99, alpha = 1 } = {}) {
  const lines = layoutRich(ctx, text, maxW, size).slice(0, maxLines);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.textBaseline = 'middle';
  lines.forEach((ln, i) => {
    let cx = x;
    const cy = y + i * size * lh + size * 0.6;
    ln.words.forEach((wd) => {
      ctx.font = fontFor(wd.k, size);
      if (wd.k === 'c') {
        ctx.fillStyle = 'rgba(253,224,71,.12)';
        rr(ctx, cx, cy - size * 0.62, wd.w - 2, size * 1.24, 5);
        ctx.fill();
        ctx.fillStyle = C.yellow;
        ctx.fillText(wd.t, cx + 4, cy);
      } else {
        ctx.fillStyle = wd.k === 'b' ? '#ffffff' : color;
        ctx.fillText(wd.t, cx, cy);
      }
      cx += wd.w;
    });
  });
  ctx.restore();
  return lines.length * size * lh;
}

function richHeight(ctx, text, maxW, size, lh = 1.45) {
  return layoutRich(ctx, text, maxW, size).length * size * lh;
}

// pick the largest font size (<= max) so text fits in the box
function fitSize(ctx, text, maxW, maxH, max = 30, min = 16, lh = 1.45) {
  for (let s = max; s > min; s -= 1) if (richHeight(ctx, text, maxW, s, lh) <= maxH) return s;
  return min;
}

// ---------- simple syntax highlighting ----------
const KW = new Set(('const let var function return if else for while do switch case break continue new class extends import from export default async await try catch finally throw typeof instanceof this super null undefined true false '
  + 'def elif in not and or is lambda pass with as yield None True False print self '
  + 'public private protected static void int long double float boolean char string String var using namespace interface enum struct override virtual readonly '
  + 'select from where group by order having join left right inner outer on insert into values update set delete create table alter drop primary key foreign references distinct limit as and or not null count sum avg min max case when then end begin commit rollback '
  + 'SELECT FROM WHERE GROUP BY ORDER HAVING JOIN LEFT RIGHT INNER OUTER ON INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE ALTER DROP PRIMARY KEY FOREIGN REFERENCES DISTINCT LIMIT AS AND OR NOT NULL COUNT SUM AVG MIN MAX CASE WHEN THEN END BEGIN COMMIT ROLLBACK TOP GO').split(' '));

function hlLine(line) {
  const out = [];
  const re = /(\/\/.*$|#.*$|--\s.*$|<!--.*?-->|\/\*.*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|(<\/?[A-Za-z][\w-]*|\/?>)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g;
  let m;
  while ((m = re.exec(line))) {
    if (m[1]) out.push([m[1], '#6a9955']);
    else if (m[2]) out.push([m[2], '#ce9178']);
    else if (m[3]) out.push([m[3], '#b5cea8']);
    else if (m[4]) out.push([m[4], '#569cd6']);
    else if (m[5]) out.push([m[5], KW.has(m[5]) ? '#c586c0' : /^[A-Z]/.test(m[5]) ? '#4ec9b0' : line[re.lastIndex] === '(' ? '#dcdcaa' : '#9cdcfe']);
    else out.push([m[0], C.codeText]);
  }
  return out;
}

// code editor window; `chars` = how many characters are typed so far
function drawEditor(ctx, x, y, w, h, { code, chars = Infinity, title = 'code', tool = '', runState = 0 }) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.45)';
  ctx.shadowBlur = 30;
  ctx.fillStyle = C.code;
  rr(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.shadowBlur = 0;
  // title bar
  ctx.fillStyle = '#2a2a3c';
  rr(ctx, x, y, w, 42, 14);
  ctx.fill();
  ctx.fillRect(x, y + 28, w, 14);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 22 + i * 20, y + 21, 6, 0, 7); ctx.fill(); });
  ctx.font = `500 15px ${FONT}`;
  ctx.fillStyle = C.muted;
  ctx.textBaseline = 'middle';
  ctx.fillText(`${tool ? `${tool}  —  ` : ''}${title}`, x + 90, y + 21);
  let runBtn = null;
  if (runState) {
    const bw = 92;
    const bx = x + w - bw - 14;
    runBtn = { x: bx + bw / 2, y: y + 21 };
    ctx.fillStyle = runState === 2 ? '#15803d' : '#16a34a';
    rr(ctx, bx, y + 8, bw, 27, 7);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `700 14px ${FONT}`;
    ctx.fillText('▶  Run', bx + 22, y + 22);
  }
  // body
  const typed = code.slice(0, chars);
  const lh = 22;
  const fs = 15;
  ctx.font = `400 ${fs}px ${MONO}`;
  const maxCh = Math.max(20, Math.floor((w - 70) / ctx.measureText('M').width));
  // soft-wrap long lines: [{ text, num }] where num is the line number (only on the first piece)
  const all = [];
  typed.split('\n').forEach((ln, li) => {
    if (ln.length <= maxCh) { all.push({ text: ln, num: li + 1 }); return; }
    let rest = ln;
    let first = true;
    while (rest.length) {
      let cut = rest.length <= maxCh ? rest.length : rest.lastIndexOf(' ', maxCh);
      if (cut < maxCh * 0.5) cut = Math.min(maxCh, rest.length);
      all.push({ text: (first ? '' : '  ') + rest.slice(0, cut), num: first ? li + 1 : '' });
      rest = rest.slice(cut).replace(/^ /, '');
      first = false;
    }
  });
  const visible = Math.floor((h - 60) / lh);
  const start = Math.max(0, all.length - visible);
  ctx.beginPath();
  ctx.rect(x, y + 44, w, h - 46);
  ctx.clip();
  all.slice(start).forEach(({ text: ln, num }, i) => {
    const ly = y + 62 + i * lh;
    ctx.font = `400 ${fs - 2}px ${MONO}`;
    ctx.fillStyle = '#5a5a72';
    ctx.textAlign = 'right';
    ctx.fillText(String(num), x + 40, ly);
    ctx.textAlign = 'left';
    ctx.font = `400 ${fs}px ${MONO}`;
    let cx = x + 54;
    hlLine(ln).forEach(([t, col]) => {
      ctx.fillStyle = col;
      ctx.fillText(t, cx, ly);
      cx += ctx.measureText(t).width;
    });
    if (i === all.length - 1 - start && chars < code.length) {
      ctx.fillStyle = C.accent;
      ctx.fillRect(cx + 1, ly - 9, 2, 18);
    }
  });
  ctx.restore();
  return runBtn;
}

function drawCursor(ctx, x, y, pressed) {
  ctx.save();
  ctx.translate(x, y);
  if (pressed) { ctx.fillStyle = 'rgba(34,211,238,.35)'; ctx.beginPath(); ctx.arc(0, 0, 18, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.lineTo(6, 17); ctx.lineTo(10, 26); ctx.lineTo(14, 24); ctx.lineTo(10, 15); ctx.lineTo(17, 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function heading(ctx, text, y, { kicker, color, size = 38, alpha = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  let yy = y;
  if (kicker) {
    ctx.font = `700 15px ${FONT}`;
    const kw = ctx.measureText(kicker.toUpperCase()).width + 24;
    ctx.fillStyle = color;
    rr(ctx, 60, yy, kw, 28, 14);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    ctx.fillText(kicker.toUpperCase(), 72, yy + 14.5);
    yy += 42;
  }
  const s = fitSize(ctx, `**${text}**`, W - 120, size * 2.6, size, 24, 1.25);
  const h = drawRich(ctx, `**${text}**`, 60, yy, W - 120, s, { lh: 1.25, maxLines: 2 });
  ctx.fillStyle = color;
  ctx.fillRect(60, yy + h + 8, 70, 4);
  ctx.restore();
  return yy + h + 30;
}

// ---------- frame chrome ----------
function chrome(ctx, meta) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, C.bg1);
  g.addColorStop(1, C.bg2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // course-colour glow
  const rg = ctx.createRadialGradient(140, 80, 10, 140, 80, 620);
  rg.addColorStop(0, `${meta.color}55`);
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, W, H);
  // subtle grid
  ctx.strokeStyle = 'rgba(255,255,255,.025)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
  // header
  ctx.fillStyle = 'rgba(5,8,20,.55)';
  ctx.fillRect(0, 0, W, 62);
  ctx.fillStyle = C.line;
  ctx.fillRect(0, 62, W, 1);
  drawLogo(ctx, 22, 13, 36);
  brandName(ctx, 68, 32, 24);
  ctx.font = `600 15px ${FONT}`;
  const chip = `${meta.course}${meta.label ? `  ·  ${meta.label}` : ''}`;
  const cw = Math.min(ctx.measureText(chip).width + 28, 700);
  ctx.fillStyle = meta.color;
  rr(ctx, W - cw - 22, 16, cw, 30, 15);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.save();
  ctx.beginPath(); ctx.rect(W - cw - 22, 16, cw - 10, 30); ctx.clip();
  ctx.fillText(chip, W - cw - 8, 31.5);
  ctx.restore();
  // footer
  ctx.fillStyle = 'rgba(5,8,20,.6)';
  ctx.fillRect(0, H - 40, W, 40);
  ctx.font = `500 14px ${FONT}`;
  ctx.fillStyle = C.muted;
  ctx.textAlign = 'left';
  const ft = meta.title.length > 80 ? `${meta.title.slice(0, 80)}…` : meta.title;
  ctx.fillText(`${meta.chapter}  ·  ${ft}`, 22, H - 20);
  ctx.textAlign = 'right';
  ctx.fillText(`upskillr  ·  ${meta.index + 1}/${meta.total}`, W - 60, H - 20);
  ctx.textAlign = 'left';
  drawLogo(ctx, W - 48, H - 33, 26, 0.9);
  // progress
  ctx.fillStyle = 'rgba(255,255,255,.08)';
  ctx.fillRect(0, H - 4, W, 4);
  ctx.fillStyle = meta.color;
  ctx.fillRect(0, H - 4, W * meta.globalProgress, 4);
}

function caption(ctx, text) {
  if (!text) return;
  ctx.save();
  const size = 22;
  const lines = layoutRich(ctx, text, W - 260, size).slice(0, 2);
  const bh = lines.length * size * 1.35 + 18;
  const by = H - 52 - bh;
  ctx.fillStyle = 'rgba(0,0,0,.72)';
  const bw = Math.max(...lines.map((l) => l.w)) + 40;
  rr(ctx, (W - bw) / 2, by, bw, bh, 10);
  ctx.fill();
  ctx.font = `500 ${size}px ${FONT}`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((ln, i) => ctx.fillText(ln.words.map((w) => w.t).join(''), W / 2, by + 9 + size * 0.7 + i * size * 1.35));
  ctx.restore();
}

// ---------- scenes ----------
const BODY_TOP = 92;
const BODY_BOTTOM = 600;

function sIntro(ctx, s, p, meta) {
  const a = ease(p * 4);
  drawLogo(ctx, W / 2 - 60, 110 - (1 - a) * 30, 120, a);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.textAlign = 'center';
  ctx.font = `600 20px ${FONT}`;
  ctx.fillStyle = meta.color;
  ctx.fillText(`${s.course}${s.label ? `  ·  ${s.label}` : ''}`.toUpperCase(), W / 2, 270);
  ctx.restore();
  const b = ease(p * 4 - 0.4);
  ctx.save();
  ctx.globalAlpha = b;
  const size = fitSize(ctx, `**${s.title}**`, W - 200, 130, 46, 26, 1.2);
  const lines = layoutRich(ctx, `**${s.title}**`, W - 200, size);
  ctx.font = `700 ${size}px ${FONT}`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.slice(0, 3).forEach((ln, i) => ctx.fillText(ln.words.map((w) => w.t).join(''), W / 2, 320 + i * size * 1.2));
  ctx.restore();
  const c = ease(p * 4 - 0.9);
  const ty = 320 + Math.min(3, lines.length) * size * 1.2 + 10;
  ctx.save();
  ctx.globalAlpha = c;
  const sum = s.summary.length > 220 ? `${s.summary.slice(0, 220)}…` : s.summary;
  const sl = layoutRich(ctx, sum, W - 300, 21);
  ctx.font = `400 21px ${FONT}`;
  ctx.fillStyle = C.muted;
  ctx.textAlign = 'center';
  sl.slice(0, 3).forEach((ln, i) => ctx.fillText(ln.words.map((w) => w.t).join(''), W / 2, ty + i * 30));
  // meta pills
  const pills = [s.module && `📦 ${s.module}`, s.level && `📈 ${s.level}`, s.duration && `⏱ ${s.duration}`].filter(Boolean);
  ctx.font = `500 16px ${FONT}`;
  const widths = pills.map((pp) => ctx.measureText(pp).width + 28);
  let px = W / 2 - (widths.reduce((x, y) => x + y, 0) + (pills.length - 1) * 12) / 2;
  const py = ty + Math.min(3, sl.length) * 30 + 14;
  pills.forEach((pp, i) => {
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    rr(ctx, px, py, widths[i], 34, 17);
    ctx.fill();
    ctx.fillStyle = C.text;
    ctx.textAlign = 'left';
    ctx.fillText(pp, px + 14, py + 18);
    px += widths[i] + 12;
  });
  ctx.restore();
}

function sBullets(ctx, s, p, meta) {
  let y = heading(ctx, s.heading, BODY_TOP + 8, { kicker: s.kicker, color: meta.color, size: 34 });
  if (s.sub) {
    y += drawRich(ctx, s.sub, 60, y - 6, W - 120, 20, { color: C.muted, maxLines: 2 }) + 8;
  }
  const items = s.items || [];
  const avail = BODY_BOTTOM - y;
  const joined = items.join('\n');
  const size = fitSize(ctx, joined, W - 200, avail - items.length * 14, 27, 16, 1.38);
  items.forEach((it, i) => {
    const appear = s.reveal ? clamp01((p * 1.15 - (i / Math.max(1, items.length)) * 0.85) * items.length * 1.2) : 1;
    if (appear <= 0) return;
    const a = ease(appear);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate((1 - a) * 30, 0);
    ctx.fillStyle = meta.color;
    if (s.numbered) {
      ctx.beginPath(); ctx.arc(78, y + size * 0.62, 15, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `700 15px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), 78, y + size * 0.64);
      ctx.textAlign = 'left';
    } else {
      rr(ctx, 70, y + size * 0.62 - 6, 12, 12, 3); ctx.fill();
    }
    const h = drawRich(ctx, it, 110, y, W - 200, size, { lh: 1.38 });
    ctx.restore();
    y += h + 14;
  });
}

function sText(ctx, s, p, meta) {
  const y = heading(ctx, s.heading, BODY_TOP + 8, { color: meta.color, size: 34 });
  const avail = BODY_BOTTOM - y;
  const size = fitSize(ctx, s.body, W - 140, avail, 28, 16, 1.5);
  // reveal paragraph by paragraph
  const paras = s.body.split(/\n{2,}/);
  let yy = y;
  paras.forEach((para, i) => {
    const a = ease(clamp01(p * paras.length * 1.6 - i * 1.0 + 0.6));
    yy += drawRich(ctx, para, 70, yy, W - 140, size, { lh: 1.5, alpha: a }) + size * 0.5;
  });
}

function sCode(ctx, s, p, meta) {
  const y = heading(ctx, s.heading, BODY_TOP + 8, { color: meta.color, size: 32 });
  const chars = Math.floor(s.code.length * clamp01(p * 1.6));
  drawEditor(ctx, 60, y, W - 120, BODY_BOTTOM - y + 10, { code: s.code, chars, title: s.file || 'code' });
}

function sTip(ctx, s, p, meta) {
  const a = ease(p * 3);
  ctx.save();
  ctx.globalAlpha = a;
  const bx = 120;
  const by = 180;
  const bw = W - 240;
  ctx.fillStyle = 'rgba(253,224,71,.08)';
  ctx.strokeStyle = 'rgba(253,224,71,.5)';
  ctx.lineWidth = 2;
  const size = fitSize(ctx, s.body, bw - 72, 300, 30, 16, 1.5);
  const bh = richHeight(ctx, s.body, bw - 72, size, 1.5) + 130;
  rr(ctx, bx, by, bw, bh, 20);
  ctx.fill();
  ctx.stroke();
  ctx.font = `700 30px ${FONT}`;
  ctx.fillStyle = C.yellow;
  ctx.textBaseline = 'middle';
  ctx.fillText('💡  Pro Tip', bx + 36, by + 50);
  drawRich(ctx, s.body, bx + 36, by + 90, bw - 72, size, { lh: 1.5 });
  ctx.restore();
  void meta;
}

function sHowto(ctx, s, p, meta) {
  sBullets(ctx, { ...s, heading: `Practical: practise in the ${s.toolName}`, kicker: 'Hands-on', numbered: true, reveal: true }, p, meta);
}

// tool window demo: type code -> move cursor -> click Run -> output
function sPractical(ctx, s, p, meta) {
  const y = heading(ctx, s.title, BODY_TOP + 4, { kicker: `Live demo · ${s.toolName}`, color: meta.color, size: 28 });
  const top = y - 6;
  const hgt = BODY_BOTTOM - top + 18;
  const edW = s.output || s.requests ? 700 : W - 120;
  const typeEnd = 0.55;
  const chars = Math.floor(s.code.length * clamp01(p / typeEnd));
  const moving = clamp01((p - typeEnd) / 0.08);
  const clicked = p > typeEnd + 0.09;
  const runBtn = drawEditor(ctx, 60, top, edW, hgt, { code: s.code, chars, title: s.requests ? 'server.js' : 'main', tool: s.toolName, runState: clicked ? 2 : 1 });
  if (s.output || s.requests) {
    const ox = 60 + edW + 24;
    const ow = W - ox - 60;
    ctx.save();
    ctx.fillStyle = '#0d1326';
    ctx.strokeStyle = C.line;
    rr(ctx, ox, top, ow, hgt, 14);
    ctx.fill();
    ctx.stroke();
    ctx.font = `700 15px ${FONT}`;
    ctx.fillStyle = C.muted;
    ctx.textBaseline = 'middle';
    ctx.fillText(s.requests ? '⇄  RESPONSE' : '▣  OUTPUT', ox + 18, top + 22);
    ctx.fillStyle = C.line;
    ctx.fillRect(ox, top + 42, ow, 1);
    if (clicked) {
      const op = clamp01((p - typeEnd - 0.1) / 0.2);
      const outLines = String(s.output || 'Done ✔').split('\n');
      const n = Math.max(1, Math.ceil(outLines.length * op));
      ctx.beginPath(); ctx.rect(ox, top + 44, ow, hgt - 46); ctx.clip();
      let yy = top + 64;
      ctx.font = `400 14px ${MONO}`;
      outLines.slice(0, n).forEach((ln) => {
        // wrap long output lines
        let rest = ln;
        do {
          let cut = rest.length;
          while (cut > 1 && ctx.measureText(rest.slice(0, cut)).width > ow - 36) cut -= 1;
          const piece = rest.slice(0, cut);
          rest = rest.slice(cut);
          ctx.fillStyle = /→\s*[45]\d\d|error|Error|Exception/.test(piece) ? C.red : /→\s*2\d\d|✔|✓/.test(piece) ? C.green : '#e5e7eb';
          ctx.fillText(piece, ox + 18, yy);
          yy += 21;
        } while (rest && yy < top + hgt);
      });
    } else {
      ctx.font = `italic 400 15px ${FONT}`;
      ctx.fillStyle = '#5b6787';
      ctx.fillText(chars < s.code.length ? 'Typing the code…' : 'Click ▶ Run to see the output', ox + 18, top + 70);
    }
    ctx.restore();
  }
  if (runBtn && p > typeEnd - 0.02 && p < typeEnd + 0.4) {
    const sx = W / 2;
    const sy = BODY_BOTTOM;
    const cx = sx + (runBtn.x - sx) * ease(moving);
    const cy = sy + (runBtn.y - sy) * ease(moving);
    drawCursor(ctx, cx, cy, clicked && p < typeEnd + 0.16);
  }
}

function sPractice(ctx, s, p, meta) {
  let y = heading(ctx, s.task, BODY_TOP + 8, { kicker: `Practice task ${s.n}`, color: meta.color, size: 28 });
  if (s.hint) {
    y += drawRich(ctx, `💡 Hint: ${s.hint}`, 60, y - 4, W - 120, 20, { color: C.muted, maxLines: 2 }) + 12;
  }
  const pauseEnd = 0.38;
  if (p < pauseEnd) {
    const left = 1 - p / pauseEnd;
    ctx.save();
    const cx = W / 2;
    const cy = y + (BODY_BOTTOM - y) / 2;
    ctx.strokeStyle = 'rgba(255,255,255,.1)';
    ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(cx, cy, 70, 0, 7); ctx.stroke();
    ctx.strokeStyle = meta.color;
    ctx.beginPath(); ctx.arc(cx, cy, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left); ctx.stroke();
    ctx.font = `800 40px ${FONT}`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⏸', cx, cy);
    ctx.font = `600 22px ${FONT}`;
    ctx.fillText(`Pause the video and try it in the ${s.toolName}`, cx, cy + 110);
    ctx.restore();
  } else {
    ctx.font = `700 16px ${FONT}`;
    ctx.fillStyle = C.green;
    ctx.textBaseline = 'middle';
    ctx.fillText('✔ SOLUTION', 60, y + 4);
    const chars = Math.floor(s.solution.length * clamp01((p - pauseEnd) / 0.4));
    drawEditor(ctx, 60, y + 20, W - 120, BODY_BOTTOM - y - 4, { code: s.solution, chars, title: 'solution', tool: s.toolName });
  }
}

function sQa(ctx, s, p, meta) {
  const y = heading(ctx, s.q, BODY_TOP + 8, { kicker: `Interview question ${s.n}/${s.total}`, color: meta.color, size: 30 });
  const a = ease(clamp01((p - 0.18) * 3));
  ctx.save();
  ctx.globalAlpha = a;
  const size = fitSize(ctx, s.a, W - 176, BODY_BOTTOM - y - 70, 26, 15, 1.5);
  const boxH = Math.min(BODY_BOTTOM - y, richHeight(ctx, s.a, W - 176, size, 1.5) + 76);
  ctx.fillStyle = 'rgba(52,211,153,.07)';
  ctx.strokeStyle = 'rgba(52,211,153,.4)';
  rr(ctx, 60, y, W - 120, boxH, 16);
  ctx.fill();
  ctx.stroke();
  ctx.font = `700 16px ${FONT}`;
  ctx.fillStyle = C.green;
  ctx.textBaseline = 'middle';
  ctx.fillText('ANSWER', 88, y + 28);
  drawRich(ctx, s.a, 88, y + 50, W - 176, size, { lh: 1.5 });
  ctx.restore();
}

function sOutro(ctx, s, p, meta) {
  const a = ease(p * 3);
  ctx.save();
  ctx.globalAlpha = a;
  drawLogo(ctx, W / 2 - 50, 100, 100);
  ctx.textAlign = 'center';
  ctx.font = `800 40px ${FONT}`;
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.fillText('🎉 Well done!', W / 2, 250);
  ctx.font = `500 22px ${FONT}`;
  ctx.fillStyle = C.muted;
  const t = s.title.length > 90 ? `${s.title.slice(0, 90)}…` : s.title;
  ctx.fillText(`You completed: ${t}`, W / 2, 296);
  ctx.textAlign = 'left';
  (s.items || []).forEach((it, i) => {
    const b = ease(clamp01(p * 3 - 0.5 - i * 0.25));
    ctx.globalAlpha = b;
    const bx = 330;
    const by = 340 + i * 54;
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    rr(ctx, bx, by, W - 660, 44, 12);
    ctx.fill();
    ctx.fillStyle = meta.color;
    ctx.font = `700 18px ${FONT}`;
    ctx.fillText(`${i + 1}`, bx + 20, by + 23);
    ctx.fillStyle = C.text;
    ctx.font = `500 19px ${FONT}`;
    ctx.fillText(it, bx + 50, by + 23);
  });
  ctx.globalAlpha = a;
  ctx.textAlign = 'center';
  ctx.font = `600 18px ${FONT}`;
  ctx.fillStyle = C.accent;
  ctx.fillText('UpSkillr  ·  Learn any tech, one day at a time', W / 2, 590);
  ctx.restore();
}

const DRAW = { intro: sIntro, bullets: sBullets, text: sText, code: sCode, tip: sTip, howto: sHowto, practical: sPractical, practice: sPractice, qa: sQa, outro: sOutro };

/**
 * meta: { color, course, label, title, index, total, globalProgress, chapter, caption }
 * p: 0..1 progress inside the scene
 */
export function drawFrame(ctx, scene, p, meta) {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  chrome(ctx, { ...meta, chapter: scene.chapter });
  // scene fade-in
  ctx.globalAlpha = ease(clamp01(p * 12));
  (DRAW[scene.type] || sText)(ctx, scene, clamp01(p), meta);
  ctx.globalAlpha = 1;
  if (meta.caption) caption(ctx, meta.caption);
  ctx.restore();
}
