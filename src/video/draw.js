// Canvas renderer for NGU video lessons (1280x720). Pure drawing, no React.
import logoUrl from '../assets/ngu-logo.png';
export const W = 1280;
export const H = 720;

const C = {
  bg1: '#0b1020', bg2: '#111a33', panel: '#151e38', panel2: '#1b2547', line: 'rgba(255,255,255,.08)',
  text: '#e8ecf8', muted: '#94a3c4', accent: '#22d3ee', accent2: '#6366f1', yellow: '#fde047', green: '#34d399', red: '#f87171',
  code: '#1e1e2e', codeText: '#d4d4d4',
};
const FONT = '"Inter", "Segoe UI", "Noto Sans Devanagari", "Nirmala UI", Mangal, system-ui, -apple-system, sans-serif';
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

// ---------- Logo (same NGU artwork as components/Logo.jsx) ----------
let logoImg = null;
if (typeof Image !== 'undefined') { logoImg = new Image(); logoImg.src = logoUrl; }
export function drawLogo(ctx, x, y, size, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (logoImg && logoImg.complete && logoImg.naturalWidth) {
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(logoImg, x, y, size, size);
  } else { // image still loading: plain black badge
    ctx.fillStyle = '#08080a';
    ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function brandName(ctx, x, y, size) {
  ctx.font = `700 ${size}px ${FONT}`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('N', x, y);
  const w = ctx.measureText('N').width;
  ctx.fillStyle = C.accent;
  ctx.fillText('GU', x + w, y);
  return w + ctx.measureText('GU').width;
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
function drawEditor(ctx, x, y, w, h, { code, chars = Infinity, title = 'code', tool = '', runState = 0, focus = null, color = '#22d3ee' }) {
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
  let start = Math.max(0, all.length - visible);
  let fRows = null;
  if (focus) {
    let lineNo = 0;
    const rowsLine = all.map((r) => { if (r.num !== '') lineNo = r.num; return lineNo - 1; });
    const f0 = Math.max(0, rowsLine.indexOf(focus[0]));
    const f1 = Math.max(f0, rowsLine.lastIndexOf(focus[1]));
    fRows = [f0, f1];
    start = Math.max(0, Math.min(all.length - visible, f0 - 2));
  }
  ctx.beginPath();
  ctx.rect(x, y + 44, w, h - 46);
  ctx.clip();
  if (fRows) {
    const ry0 = y + 62 + (fRows[0] - start) * lh - lh / 2 - 2;
    const rh = (fRows[1] - fRows[0] + 1) * lh + 4;
    ctx.fillStyle = `${color}2e`;
    ctx.fillRect(x + 4, ry0, w - 8, rh);
    ctx.fillStyle = color;
    ctx.fillRect(x + 4, ry0, 4, rh);
  }
  all.slice(start).forEach(({ text: ln, num }, i) => {
    const ly = y + 62 + i * lh;
    const dim = fRows && (start + i < fRows[0] || start + i > fRows[1]);
    ctx.globalAlpha = dim ? 0.35 : 1;
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
    ctx.globalAlpha = 1;
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
  // soft light sweep + vignette (calm, studio-like background)
  const tm = meta.time || 0;
  const sx = W * (0.75 + Math.sin(tm * 0.08) * 0.1);
  const sw = ctx.createRadialGradient(sx, H * 0.35, 20, sx, H * 0.35, 700);
  sw.addColorStop(0, 'rgba(255,255,255,.045)');
  sw.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sw;
  ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,.45)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
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
  ctx.fillText(`NGU  ·  ${meta.index + 1}/${meta.total}`, W - 60, H - 20);
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

// ---------- real pictures (Wikipedia / Wikimedia Commons) ----------
export const isLogo = (ph) => /\.svg|logo|icon|wordmark/i.test(ph?.url || '');

// Photo card: rounded, shadowed, slow "Ken Burns" zoom, credit line. Logos are shown whole on a white card.
function drawPhoto(ctx, ph, x, y, w, h, p = 0, alpha = 1) {
  const im = ph?.img;
  if (!im) return;
  const iw = im.naturalWidth || im.width;
  const ih = im.naturalHeight || im.height;
  const logo = isLogo(ph);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.shadowColor = 'rgba(0,0,0,.55)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = logo ? '#ffffff' : '#0b1020';
  rr(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.save();
  rr(ctx, x, y, w, h, 18);
  ctx.clip();
  if (logo) {
    const pad = 36;
    const sc = Math.min((w - pad * 2) / iw, (h - pad * 2 - 30) / ih) * (1 + 0.04 * p);
    ctx.drawImage(im, x + (w - iw * sc) / 2, y + (h - 30 - ih * sc) / 2, iw * sc, ih * sc);
  } else {
    const sc = Math.max(w / iw, h / ih) * (1.03 + 0.09 * p);
    const dw = iw * sc;
    const dh = ih * sc;
    const pan = (p - 0.5) * 0.5;
    ctx.drawImage(im, x + (w - dw) / 2 + pan * (dw - w), y + (h - dh) / 2 - pan * 0.4 * (dh - h), dw, dh);
  }
  // credit strip
  const g = ctx.createLinearGradient(0, y + h - 56, 0, y + h);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,.72)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y + h - 56, w, 56);
  ctx.font = `500 12.5px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  let credit = `Image: Wikipedia · ${ph.title}`;
  while (ctx.measureText(credit).width > w - 28 && credit.length > 12) credit = `${credit.slice(0, -2)}`;
  ctx.fillText(credit, x + 14, y + h - 16);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.14)';
  ctx.lineWidth = 1.5;
  rr(ctx, x, y, w, h, 18);
  ctx.stroke();
  ctx.restore();
}

// Full-frame background photo behind intro / outro, darkened so the text stays readable.
function drawHero(ctx, ph, p, color) {
  const im = ph?.img;
  if (!im || isLogo(ph)) return false;
  const iw = im.naturalWidth || im.width;
  const ih = im.naturalHeight || im.height;
  const top = 63;
  const bh = H - 40 - top;
  const sc = Math.max(W / iw, bh / ih) * (1.04 + 0.08 * p);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, top, W, bh); ctx.clip();
  ctx.filter = 'blur(1.5px) saturate(.9)';
  ctx.drawImage(im, (W - iw * sc) / 2, top + (bh - ih * sc) / 2, iw * sc, ih * sc);
  ctx.filter = 'none';
  const g = ctx.createLinearGradient(0, top, 0, top + bh);
  g.addColorStop(0, 'rgba(8,12,28,.86)');
  g.addColorStop(0.5, 'rgba(8,12,28,.80)');
  g.addColorStop(1, 'rgba(8,12,28,.94)');
  ctx.fillStyle = g;
  ctx.fillRect(0, top, W, bh);
  const cg = ctx.createRadialGradient(140, 80, 10, 140, 80, 620);
  cg.addColorStop(0, `${color}40`);
  cg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cg;
  ctx.fillRect(0, top, W, bh);
  ctx.font = `500 12.5px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Image: Wikipedia · ${ph.title}`, W - 18, H - 54);
  ctx.restore();
  return true;
}

const PHOTO_W = 400;

// ---------- scenes ----------
const BODY_TOP = 92;
const BODY_BOTTOM = 600;

function sIntro(ctx, s, p, meta) {
  const sec = p * (s.est || 10);
  const a = ease(sec / 1.0);
  const hero = drawHero(ctx, meta.photo, p, meta.color);
  if (meta.photo?.img && isLogo(meta.photo)) {
    ctx.save(); ctx.globalAlpha = a;
    const im = meta.photo.img; const sc = Math.min(150 / im.naturalWidth, 120 / im.naturalHeight);
    ctx.fillStyle = '#fff'; rr(ctx, W / 2 - 95, 92 - (1 - a) * 30, 190, 150, 22); ctx.fill();
    ctx.drawImage(im, W / 2 - (im.naturalWidth * sc) / 2, 167 - (1 - a) * 30 - (im.naturalHeight * sc) / 2, im.naturalWidth * sc, im.naturalHeight * sc);
    ctx.restore();
  } else drawLogo(ctx, W / 2 - 60, 110 - (1 - a) * 30, 120, a);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.textAlign = 'center';
  ctx.font = `600 20px ${FONT}`;
  ctx.fillStyle = meta.color;
  ctx.fillText(`${s.course}${s.label ? `  ·  ${s.label}` : ''}`.toUpperCase(), W / 2, 270);
  ctx.restore();
  const b = ease((sec - 0.5) / 1.0);
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
  const c = ease((sec - 1.1) / 1.0);
  const ty = 320 + Math.min(3, lines.length) * size * 1.2 + 10;
  ctx.save();
  ctx.globalAlpha = c;
  const sum = s.summary.length > 220 ? `${s.summary.slice(0, 220)}…` : s.summary;
  const sl = layoutRich(ctx, sum, W - 300, 21);
  ctx.font = `400 21px ${FONT}`;
  ctx.fillStyle = hero ? '#d5dcec' : C.muted;
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
  const photo = meta.photo?.img ? meta.photo : null;
  const artW = photo ? PHOTO_W + 40 : s.art ? 280 : 0;
  if (photo) drawPhoto(ctx, photo, W - 60 - PHOTO_W, y - 6, PHOTO_W, Math.min(330, BODY_BOTTOM - y - 70), p, ease((p * (s.est || 10)) / 0.9));
  else if (s.art) drawArt(ctx, s.art, W - 170, (y + BODY_BOTTOM) / 2, 190, meta.color, meta.time);
  const size = fitSize(ctx, joined, W - 200 - artW, avail - items.length * 14, 27, 16, 1.38);
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
    const h = drawRich(ctx, it, 110, y, W - 200 - artW, size, { lh: 1.38 });
    ctx.restore();
    y += h + 14;
  });
}

function sText(ctx, s, p, meta) {
  const y = heading(ctx, s.heading, BODY_TOP + 8, { color: meta.color, size: 34 });
  const avail = BODY_BOTTOM - y;
  const photo = meta.photo?.img ? meta.photo : null;
  const artW = photo ? PHOTO_W + 40 : s.art ? 280 : 0;
  if (photo) drawPhoto(ctx, photo, W - 60 - PHOTO_W, y - 6, PHOTO_W, Math.min(330, BODY_BOTTOM - y - 70), p, ease((p * (s.est || 10)) / 0.9));
  else if (s.art) drawArt(ctx, s.art, W - 170, (y + BODY_BOTTOM) / 2, 190, meta.color, meta.time);
  const size = fitSize(ctx, s.body, W - 140 - artW, avail - 60, 28, 16, 1.5);
  // reveal paragraph by paragraph
  const paras = s.body.split(/\n{2,}/);
  let yy = y;
  paras.forEach((para, i) => {
    const a = ease(clamp01(p * paras.length * 1.6 - i * 1.0 + 0.6));
    yy += drawRich(ctx, para, 70, yy, W - 140 - artW, size, { lh: 1.5, alpha: a }) + size * 0.5;
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
  const photo = meta.photo?.img ? meta.photo : null;
  const bx = photo ? 60 : 120;
  const by = 180;
  const bw = photo ? W - 120 - PHOTO_W - 40 : W - 240;
  if (photo) drawPhoto(ctx, photo, W - 60 - PHOTO_W, by, PHOTO_W, 300, p);
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
  ctx.fillText(`💡  ${s.L?.proTip || 'Pro Tip'}`, bx + 36, by + 50);
  drawRich(ctx, s.body, bx + 36, by + 90, bw - 72, size, { lh: 1.5 });
  ctx.restore();
}


// tool window demo: type code -> move cursor -> click Run -> output
function sPractical(ctx, s, p, meta) {
  const y = heading(ctx, s.title, BODY_TOP + 4, { kicker: s.kicker || `Live demo · ${s.toolName}`, color: meta.color, size: 28 });
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
    ctx.fillText(s.requests ? `⇄  ${s.L?.response || 'RESPONSE'}` : `▣  ${s.L?.output || 'OUTPUT'}`, ox + 18, top + 22);
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
      ctx.fillText(chars < s.code.length ? (s.L?.typing || 'Typing the code…') : (s.L?.clickRun || 'Click ▶ Run to see the output'), ox + 18, top + 70);
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
  let y = heading(ctx, s.task, BODY_TOP + 8, { kicker: `${s.L?.practiceTask || 'Practice task'} ${s.n}`, color: meta.color, size: 28 });
  if (s.hint) {
    y += drawRich(ctx, `💡 ${s.L?.hint || 'Hint'}: ${s.hint}`, 60, y - 4, W - 120, 20, { color: C.muted, maxLines: 2 }) + 12;
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
    ctx.fillText(s.L?.pauseTry ? s.L.pauseTry(s.toolName) : `Pause the video and try it in the ${s.toolName}`, cx, cy + 110);
    ctx.restore();
  } else {
    ctx.font = `700 16px ${FONT}`;
    ctx.fillStyle = C.green;
    ctx.textBaseline = 'middle';
    ctx.fillText(`✔ ${s.L?.solution || 'SOLUTION'}`, 60, y + 4);
    const chars = Math.floor(s.solution.length * clamp01((p - pauseEnd) / 0.4));
    drawEditor(ctx, 60, y + 20, W - 120, BODY_BOTTOM - y - 4, { code: s.solution, chars, title: 'solution', tool: s.toolName });
  }
}

function sQa(ctx, s, p, meta) {
  const y = heading(ctx, s.q, BODY_TOP + 8, { kicker: `${s.L?.interviewQ || 'Interview question'} ${s.n}/${s.total}`, color: meta.color, size: 30 });
  const a = ease(clamp01((p - 0.18) * 3));
  ctx.save();
  ctx.globalAlpha = a;
  const photo = meta.photo?.img ? meta.photo : null;
  const bw = photo ? W - 120 - PHOTO_W - 30 : W - 120;
  const size = fitSize(ctx, s.a, bw - 56, BODY_BOTTOM - y - 70, 26, 15, 1.5);
  const boxH = Math.min(BODY_BOTTOM - y, richHeight(ctx, s.a, bw - 56, size, 1.5) + 76);
  ctx.fillStyle = 'rgba(52,211,153,.07)';
  ctx.strokeStyle = 'rgba(52,211,153,.4)';
  rr(ctx, 60, y, bw, boxH, 16);
  ctx.fill();
  ctx.stroke();
  ctx.font = `700 16px ${FONT}`;
  ctx.fillStyle = C.green;
  ctx.textBaseline = 'middle';
  ctx.fillText(s.L?.answer || 'ANSWER', 88, y + 28);
  drawRich(ctx, s.a, 88, y + 50, bw - 56, size, { lh: 1.5 });
  ctx.restore();
  if (photo) drawPhoto(ctx, photo, W - 60 - PHOTO_W, y, PHOTO_W, Math.min(320, BODY_BOTTOM - y - 60), p, ease((p * (s.est || 10)) / 0.9));
  const free = BODY_BOTTOM - (y + boxH);
  if (!photo && free > 150) drawArt(ctx, 'chat', W / 2, y + boxH + free / 2 + 10, Math.min(170, free - 20), meta.color, meta.time);
}

function sOutro(ctx, s, p, meta) {
  const a = ease((p * (s.est || 10)) / 1.0);
  drawHero(ctx, meta.photo, p, meta.color);
  ctx.save();
  ctx.globalAlpha = a;
  drawLogo(ctx, W / 2 - 50, 100, 100);
  drawArt(ctx, 'trophy', 190, 430, 150, meta.color, meta.time);
  drawArt(ctx, 'check', W - 190, 430, 140, meta.color, (meta.time || 0) + 1);
  ctx.textAlign = 'center';
  ctx.font = `800 40px ${FONT}`;
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.fillText(`🎉 ${s.L?.wellDone || 'Well done!'}`, W / 2, 250);
  ctx.font = `500 22px ${FONT}`;
  ctx.fillStyle = C.muted;
  const t = s.title.length > 90 ? `${s.title.slice(0, 90)}…` : s.title;
  ctx.fillText(`${s.L?.completed || 'You completed'}: ${t}`, W / 2, 296);
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
  ctx.fillText(`NGU  ·  ${s.L?.tagline || 'Learn any tech, one day at a time'}`, W / 2, 590);
  ctx.restore();
}


// ---------- illustrations ----------
export function drawArt(ctx, kind, cx, cy, size, color, t = 0) {
  const s = size / 100;
  ctx.save();
  ctx.translate(cx, cy + Math.sin(t * 1.2) * 6);
  ctx.scale(s, s);
  const g = ctx.createLinearGradient(-50, -50, 50, 50);
  g.addColorStop(0, color);
  g.addColorStop(1, '#22d3ee');
  const halo = ctx.createRadialGradient(0, 0, 10, 0, 0, 90);
  halo.addColorStop(0, `${color}44`);
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fill();
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#fff';
  ctx.fillStyle = g;
  if (kind === 'book') {
    ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(-25, -42, -55, -34); ctx.lineTo(-55, 34); ctx.quadraticCurveTo(-25, 26, 0, 38); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(25, -42, 55, -34); ctx.lineTo(55, 34); ctx.quadraticCurveTo(25, 26, 0, 38); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.globalAlpha = 0.7;
    [-14, -2, 10].forEach((y) => { ctx.beginPath(); ctx.moveTo(-44, y); ctx.lineTo(-12, y + 3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(12, y + 3); ctx.lineTo(44, y); ctx.stroke(); });
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fde047';
    const sp = 0.6 + 0.4 * Math.sin(t * 3);
    ctx.save(); ctx.translate(40, -52); ctx.scale(sp, sp); ctx.beginPath();
    for (let i = 0; i < 8; i += 1) { const a = (i * Math.PI) / 4; const r = i % 2 ? 4 : 13; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.fill(); ctx.restore();
  } else if (kind === 'target') {
    [44, 30, 16].forEach((r, i) => { ctx.fillStyle = i % 2 ? '#fff' : g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); });
    const k = Math.min(1, (t % 3) / 0.6);
    ctx.save(); ctx.translate(60 - 60 * k, -60 + 60 * k); ctx.strokeStyle = '#fde047'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(34, -34); ctx.stroke();
    ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(4, -16); ctx.lineTo(16, -4); ctx.closePath(); ctx.fill();
    ctx.restore();
  } else if (kind === 'bulb') {
    const glow = 0.5 + 0.5 * Math.sin(t * 2.5);
    ctx.fillStyle = `rgba(253,224,71,${0.25 + glow * 0.35})`;
    ctx.beginPath(); ctx.arc(0, -12, 58, 0, 7); ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.arc(0, -14, 34, Math.PI * 0.8, Math.PI * 2.2); ctx.lineTo(14, 26); ctx.lineTo(-14, 26); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#94a3b8'; rr(ctx, -15, 30, 30, 16, 4); ctx.fill();
    ctx.strokeStyle = '#fde047';
    for (let i = 0; i < 5; i += 1) { const a = Math.PI * (1.1 + i * 0.2); ctx.beginPath(); ctx.moveTo(Math.cos(a) * 52, -14 + Math.sin(a) * 52); ctx.lineTo(Math.cos(a) * (64 + glow * 6), -14 + Math.sin(a) * (64 + glow * 6)); ctx.stroke(); }
  } else if (kind === 'chat') {
    ctx.fillStyle = g; rr(ctx, -60, -46, 84, 56, 14); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-40, 10); ctx.lineTo(-48, 28); ctx.lineTo(-24, 10); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `800 34px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', -18, -18);
    ctx.fillStyle = '#34d399'; rr(ctx, -6, 0, 70, 46, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff';
    [0, 1, 2].forEach((i) => { ctx.globalAlpha = 0.4 + 0.6 * Math.max(0, Math.sin(t * 4 - i)); ctx.beginPath(); ctx.arc(14 + i * 15, 23, 5, 0, 7); ctx.fill(); });
    ctx.globalAlpha = 1;
  } else if (kind === 'laptop') {
    ctx.fillStyle = g; rr(ctx, -50, -40, 100, 64, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0b1020'; rr(ctx, -42, -32, 84, 48, 4); ctx.fill();
    ctx.fillStyle = '#34d399'; ctx.font = `700 16px ${MONO}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText('</>', -36, -16);
    ctx.fillStyle = '#fde047'; ctx.fillRect(-36, 2, 20 + ((t * 30) % 40), 4);
    ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(-62, 28); ctx.lineTo(62, 28); ctx.lineTo(54, 40); ctx.lineTo(-54, 40); ctx.closePath(); ctx.fill();
  } else if (kind === 'keyboard') {
    ctx.fillStyle = g; rr(ctx, -56, -26, 112, 52, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff';
    for (let r = 0; r < 3; r += 1) for (let c = 0; c < 7; c += 1) {
      const on = Math.floor(t * 6) % 21 === r * 7 + c;
      ctx.globalAlpha = on ? 1 : 0.55; rr(ctx, -48 + c * 14, -18 + r * 13, 10, 9, 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (kind === 'play') {
    ctx.fillStyle = '#16a34a'; ctx.beginPath(); ctx.arc(0, 0, 46, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-14, -22); ctx.lineTo(24, 0); ctx.lineTo(-14, 22); ctx.closePath(); ctx.fill();
  } else if (kind === 'check') {
    ctx.fillStyle = g; rr(ctx, -44, -50, 88, 100, 10); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.globalAlpha = 0.6;
    [-28, -12, 4].forEach((y) => { ctx.beginPath(); ctx.moveTo(-28, y); ctx.lineTo(28, y); ctx.stroke(); });
    ctx.globalAlpha = 1; ctx.strokeStyle = '#34d399'; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(-18, 26); ctx.lineTo(-4, 38); ctx.lineTo(24, 12); ctx.stroke();
  } else if (kind === 'trophy') {
    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.moveTo(-34, -44); ctx.lineTo(34, -44); ctx.quadraticCurveTo(34, 10, 0, 16); ctx.quadraticCurveTo(-34, 10, -34, -44); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#fde047'; ctx.beginPath(); ctx.arc(-38, -26, 14, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(38, -26, 14, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
    ctx.fillStyle = '#fde047'; ctx.fillRect(-6, 16, 12, 18); rr(ctx, -28, 34, 56, 12, 4); ctx.fill();
  }
  ctx.restore();
}

// flowchart of steps: numbered boxes in a snake layout with animated connectors
function sFlow(ctx, s, p, meta) {
  let y = heading(ctx, s.heading, BODY_TOP + 4, { kicker: s.kicker, color: meta.color, size: 30 });
  if (s.sub) y += drawRich(ctx, s.sub, 60, y - 8, W - 120, 19, { color: C.muted, maxLines: 2 }) + 6;
  const items = s.items || [];
  if (!items.length) { drawArt(ctx, 'laptop', W / 2, (y + BODY_BOTTOM) / 2, 160, meta.color, meta.time); return; }
  const cols = items.length <= 3 ? items.length : Math.ceil(items.length / 2);
  const rows = Math.ceil(items.length / cols);
  const gap = 46;
  const bw = (W - 120 - gap * (cols - 1)) / cols;
  const bh = Math.min(150, (BODY_BOTTOM - y - (rows - 1) * 34) / rows);
  const pos = items.map((_, i) => {
    const r = Math.floor(i / cols);
    const c = r % 2 ? cols - 1 - (i % cols) : i % cols;
    return { x: 60 + c * (bw + gap), y: y + r * (bh + 34) };
  });
  const shown = Math.min(items.length, Math.floor(p * 1.25 * items.length + 0.6));
  pos.forEach((a, i) => {
    const b = pos[i + 1];
    if (!b || i + 1 >= shown) return;
    ctx.save();
    ctx.strokeStyle = meta.color;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 8]);
    ctx.lineDashOffset = -(meta.time || 0) * 30;
    let x1; let y1; let x2; let y2;
    if (Math.abs(a.y - b.y) < 1) { x1 = a.x < b.x ? a.x + bw : a.x; x2 = a.x < b.x ? b.x : b.x + bw; y1 = a.y + bh / 2; y2 = y1; }
    else { x1 = a.x + bw / 2; x2 = x1; y1 = a.y + bh; y2 = b.y; }
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.setLineDash([]);
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.fillStyle = meta.color;
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 14 * Math.cos(ang - 0.5), y2 - 14 * Math.sin(ang - 0.5)); ctx.lineTo(x2 - 14 * Math.cos(ang + 0.5), y2 - 14 * Math.sin(ang + 0.5)); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
  items.forEach((it, i) => {
    if (i >= shown) return;
    const { x, y: by } = pos[i];
    const a = ease(clamp01(p * 1.25 * items.length + 0.6 - i));
    const active = i === shown - 1;
    ctx.save();
    ctx.globalAlpha *= Math.max(0.15, a);
    ctx.fillStyle = active ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.05)';
    ctx.strokeStyle = active ? meta.color : 'rgba(255,255,255,.12)';
    ctx.lineWidth = active ? 3 : 1.5;
    rr(ctx, x, by, bw, bh, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = meta.color;
    ctx.beginPath(); ctx.arc(x + 26, by + 26, 16, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `800 16px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), x + 26, by + 27);
    ctx.textAlign = 'left';
    const size = fitSize(ctx, it, bw - 64, bh - 18, 20, 12, 1.3);
    drawRich(ctx, it, x + 52, by + 12, bw - 64, size, { lh: 1.3, maxLines: 6 });
    ctx.restore();
  });
}

// "how to practise" pipeline: 4 stages with icons and a moving dot
function sHowto(ctx, s, p, meta) {
  const y = heading(ctx, s.heading, BODY_TOP + 4, { kicker: s.kicker, color: meta.color, size: 30 });
  const stages = s.pipeline || [];
  const icons = ['laptop', 'keyboard', 'play', 'check'];
  const n = stages.length;
  const cw = (W - 120) / n;
  const cy = y + 70;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,.12)';
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(60 + cw / 2, cy); ctx.lineTo(60 + cw * (n - 0.5), cy); ctx.stroke();
  const prog = clamp01(p * 1.6);
  ctx.strokeStyle = meta.color;
  ctx.beginPath(); ctx.moveTo(60 + cw / 2, cy); ctx.lineTo(60 + cw / 2 + cw * (n - 1) * prog, cy); ctx.stroke();
  ctx.fillStyle = '#fde047';
  ctx.beginPath(); ctx.arc(60 + cw / 2 + cw * (n - 1) * prog, cy, 9, 0, 7); ctx.fill();
  ctx.restore();
  stages.forEach((st, i) => {
    const cx = 60 + cw * (i + 0.5);
    const on = prog * (n - 1) + 0.05 >= i;
    ctx.save();
    ctx.globalAlpha = on ? 1 : 0.35;
    drawArt(ctx, icons[i % icons.length], cx, cy, 92, meta.color, (meta.time || 0) + i);
    ctx.font = `700 19px ${FONT}`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${i + 1}. ${st}`, cx, cy + 74);
    ctx.restore();
  });
  let yy = cy + 112;
  (s.items || []).forEach((it, i) => {
    const a = ease(clamp01(p * 2 - 0.6 - i * 0.15));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = meta.color;
    rr(ctx, 70, yy + 8, 10, 10, 3); ctx.fill();
    drawRich(ctx, it, 96, yy, W - 200, 19, { lh: 1.3, maxLines: 1 });
    ctx.restore();
    yy += 30;
  });
}

// code walkthrough: highlight one part of the code at a time and explain it
function sWalk(ctx, s, p, meta) {
  const y = heading(ctx, s.heading, BODY_TOP + 4, { kicker: s.kicker, color: meta.color, size: 28 });
  const top = y - 6;
  const hgt = BODY_BOTTOM - top + 18;
  const edW = 760;
  const parts = s.parts || [];
  const cur = Math.max(0, Math.min(parts.length - 1, meta.part ?? Math.floor(p * parts.length)));
  const part = parts[cur];
  drawEditor(ctx, 60, top, edW, hgt, { code: s.code, title: 'main', tool: s.toolName, focus: part ? [part.from, part.to] : null, color: meta.color });
  const ox = 60 + edW + 24;
  const ow = W - ox - 60;
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,.05)';
  ctx.strokeStyle = meta.color;
  ctx.lineWidth = 2;
  rr(ctx, ox, top, ow, hgt, 16);
  ctx.fill();
  ctx.stroke();
  ctx.font = `700 15px ${FONT}`;
  ctx.fillStyle = meta.color;
  ctx.textBaseline = 'middle';
  ctx.fillText(`${(s.L?.part || 'Part').toUpperCase()} ${cur + 1} / ${parts.length}`, ox + 22, top + 28);
  parts.forEach((_, i) => { ctx.fillStyle = i === cur ? meta.color : i < cur ? `${meta.color}88` : 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.arc(ox + 26 + i * 18, top + 54, 5, 0, 7); ctx.fill(); });
  if (part) {
    const txt = (meta.partText && meta.partText[cur]) || part.say;
    const size = fitSize(ctx, txt, ow - 44, hgt - 170, 24, 14, 1.45);
    drawRich(ctx, txt, ox + 22, top + 76, ow - 44, size, { lh: 1.45 });
    if (part.note && !part.translate) drawRich(ctx, `// ${part.note}`, ox + 22, top + hgt - 64, ow - 44, 14, { color: '#6a9955', maxLines: 2 });
  }
  drawArt(ctx, 'laptop', ox + ow - 56, top + 30, 50, meta.color, meta.time);
  ctx.restore();
}

const DRAW = { intro: sIntro, bullets: sBullets, text: sText, code: sCode, tip: sTip, howto: sHowto, practical: sPractical, practice: sPractice, qa: sQa, outro: sOutro, flow: sFlow, walk: sWalk };

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
