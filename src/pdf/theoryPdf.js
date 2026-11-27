// NGU (Never Give Up): builds a clean, printable A4 PDF of one lesson's theory (for offline reading on any phone / computer).
// Uses jsPDF in the browser; Noto Sans fonts (SIL Open Font License, subset) are loaded from /public/fonts/pdf
// only when a student clicks "Download PDF".
import { jsPDF } from 'jspdf';

const FONT_DIR = `${import.meta.env?.BASE_URL || '/'}fonts/pdf/`;
const FONTS = [
  ['NotoSans-Regular.ttf', 'Noto', 'normal'],
  ['NotoSans-Bold.ttf', 'Noto', 'bold'],
  ['NotoSansMono-Regular.ttf', 'NotoMono', 'normal'],
  ['SymbolsDejaVu.ttf', 'Sym', 'normal'], // arrows, ticks, stars, box drawing (DejaVu Sans subset, free licence)
];
// characters drawn with the symbols font (Noto Sans has no arrows / ticks / shapes)
const SYM_RE = /([\u00D7\u00F7\u2190-\u2BFF]+)/;
const splitSym = (text) => String(text).split(SYM_RE).filter((x) => x !== '').map((x) => ({ t: x, sym: SYM_RE.test(x) && /^[\u00D7\u00F7\u2190-\u2BFF]+$/.test(x) }));
const fontCache = {};

function toBase64(buf) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

let logoCache = null;
async function loadLogo() {
  if (logoCache !== null) return logoCache;
  try {
    const res = await fetch(`${import.meta.env?.BASE_URL || '/'}icon-192.png`);
    logoCache = res.ok ? `data:image/png;base64,${toBase64(await res.arrayBuffer())}` : '';
  } catch { logoCache = ''; }
  return logoCache;
}

async function addFonts(doc) {
  await Promise.all(FONTS.map(async ([file]) => {
    if (!fontCache[file]) {
      const res = await fetch(FONT_DIR + file);
      if (!res.ok) throw new Error(`Could not load font ${file}`);
      fontCache[file] = toBase64(await res.arrayBuffer());
    }
  }));
  FONTS.forEach(([file, name, style]) => {
    doc.addFileToVFS(file, fontCache[file]);
    doc.addFont(file, name, style);
  });
}

// ---------- page geometry (mm) ----------
const PAGE_W = 210;
const PAGE_H = 297;
const M = 18; // side margin
const TOP = 20;
const BOTTOM = 280; // content must stay above the footer
const W = PAGE_W - M * 2;
const PURPLE = [109, 40, 217];
const DARK = [17, 24, 39];
const MUTED = [90, 99, 115];
const PT = 0.3528; // 1 pt in mm

// remove characters the fonts cannot draw (emoji, variation selectors)
const clean = (s) => String(s ?? '')
  .replace(/[\u{1F000}-\u{1FFFF}\u{FE00}-\u{FE0F}\u{200D}\u{E0000}-\u{E007F}]/gu, '')
  .replace(/\t/g, '  ');

function makeWriter(doc) {
  let y = TOP;

  const ensure = (h) => { if (y + h > BOTTOM) { doc.addPage(); y = TOP; } };
  const font = (kind, size) => {
    if (kind === 'sym') doc.setFont('Sym', 'normal');
    else if (kind === 'code') doc.setFont('NotoMono', 'normal');
    else doc.setFont('Noto', kind === 'bold' ? 'bold' : 'normal');
    doc.setFontSize(size);
  };

  // **bold** and `code` inside a line of text
  const tokens = (text) => {
    const out = [];
    const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let last = 0;
    let m;
    const s = clean(text);
    while ((m = re.exec(s))) {
      if (m.index > last) out.push({ t: s.slice(last, m.index), k: 'n' });
      out.push(m[0][0] === '`' ? { t: m[0].slice(1, -1), k: 'code' } : { t: m[0].slice(2, -2), k: 'bold' });
      last = m.index + m[0].length;
    }
    if (last < s.length) out.push({ t: s.slice(last), k: 'n' });
    // symbols get their own font; inside `code` they stay part of the code pill
    return out.flatMap((tok) => (tok.k === 'code' ? [tok] : splitSym(tok.t).map((r) => ({ t: r.t, k: r.sym ? 'sym' : tok.k }))));
  };

  // word-wrap rich text into lines of segments
  const layout = (text, width, size, baseBold) => {
    const lines = [];
    let line = [];
    let lw = 0;
    const push = () => { lines.push(line); line = []; lw = 0; };
    tokens(text).forEach((tok) => {
      const kind = tok.k === 'n' ? (baseBold ? 'bold' : 'n') : tok.k;
      // (symbol runs keep kind 'sym')
      const sz = kind === 'code' ? size * 0.9 : size;
      tok.t.split(/(\s+)/).forEach((piece) => {
        if (!piece) return;
        const space = /^\s+$/.test(piece);
        if (space && !line.length) return;
        font(kind, sz);
        let pw = doc.getTextWidth(space ? ' ' : piece);
        if (!space && lw + pw > width && line.length) {
          // drop trailing space before breaking
          if (line.length && line[line.length - 1].space) { lw -= line[line.length - 1].w; line.pop(); }
          push();
        }
        if (!space && pw > width) {
          // a single very long word (URL, code): hard-break it
          let rest = piece;
          while (rest) {
            let n = rest.length;
            while (n > 1 && doc.getTextWidth(rest.slice(0, n)) > width - lw) n -= 1;
            const part = rest.slice(0, n);
            const w2 = doc.getTextWidth(part);
            line.push({ t: part, kind, sz, w: w2 });
            lw += w2;
            rest = rest.slice(n);
            if (rest) push();
          }
          return;
        }
        if (space && !line.length) return;
        line.push({ t: space ? ' ' : piece, kind, sz, w: pw, space });
        lw += pw;
      });
    });
    if (line.length) push();
    return lines;
  };

  const rich = (text, { x = M, width = W, size = 10.5, color = DARK, lh = 1.45, bold = false, after = 1.5 } = {}) => {
    const lineH = size * PT * lh;
    layout(text, width, size, bold).forEach((ln) => {
      ensure(lineH);
      let cx = x;
      const base = y + size * PT * 0.95;
      ln.forEach((seg) => {
        font(seg.kind, seg.sz);
        if (seg.kind === 'code') {
          doc.setFillColor(243, 240, 255);
          doc.rect(cx - 0.3, base - seg.sz * PT * 0.85, seg.w + 0.6, seg.sz * PT * 1.15, 'F');
          doc.setTextColor(...PURPLE);
          let px = cx;
          splitSym(seg.t).forEach((r) => {
            font(r.sym ? 'sym' : 'code', seg.sz);
            doc.text(r.t, px, base);
            px += doc.getTextWidth(r.t);
          });
          cx += seg.w;
          return;
        } else doc.setTextColor(...(seg.kind === 'sym' ? PURPLE : color));
        doc.text(seg.t, cx, base);
        cx += seg.w;
      });
      y += lineH;
    });
    y += after;
  };

  const heading = (text, size = 14) => {
    ensure(size * PT * 2.6);
    y += 2;
    font('bold', size);
    doc.setTextColor(...PURPLE);
    const lines = doc.splitTextToSize(clean(text), W);
    lines.forEach((l) => { doc.text(l, M, y + size * PT); y += size * PT * 1.3; });
    doc.setDrawColor(...PURPLE);
    doc.setLineWidth(0.6);
    doc.line(M, y + 0.6, M + 22, y + 0.6);
    y += 4;
  };

  const label = (text, color = PURPLE) => {
    ensure(7);
    font('bold', 9);
    doc.setTextColor(...color);
    doc.text(clean(text).toUpperCase(), M, y + 3);
    y += 5.5;
  };

  const code = (src, { title } = {}) => {
    if (title) label(title, MUTED);
    const size = 8.6;
    const lh = size * PT * 1.42;
    font('code', size);
    const maxW = W - 8;
    const rows = [];
    clean(src).replace(/\s+$/, '').split('\n').forEach((ln) => {
      if (!ln) { rows.push(''); return; }
      let rest = ln;
      let first = true;
      while (rest.length) {
        let n = rest.length;
        while (n > 1 && doc.getTextWidth(rest.slice(0, n)) > maxW) n -= 1;
        rows.push((first ? '' : '  ') + rest.slice(0, n));
        rest = rest.slice(n);
        first = false;
      }
    });
    let i = 0;
    while (i < rows.length) {
      ensure(lh * Math.min(3, rows.length - i) + 4);
      const fit = Math.max(1, Math.floor((BOTTOM - y - 4) / lh));
      const chunk = rows.slice(i, i + fit);
      const h = chunk.length * lh + 4;
      doc.setFillColor(246, 247, 251);
      doc.setDrawColor(226, 228, 236);
      doc.setLineWidth(0.2);
      doc.rect(M, y, W, h, 'FD');
      doc.setFillColor(...PURPLE);
      doc.rect(M, y, 1, h, 'F');
      font('code', size);
      doc.setTextColor(30, 41, 59);
      chunk.forEach((r, k) => {
        let px = M + 4;
        splitSym(r).forEach((run) => {
          font(run.sym ? 'sym' : 'code', size);
          doc.text(run.t, px, y + 2.2 + size * PT + k * lh);
          px += doc.getTextWidth(run.t);
        });
      });
      y += h + 2.5;
      i += chunk.length;
    }
    y += 1;
  };

  const bullets = (items, { numbered = false, size = 10.5 } = {}) => {
    items.forEach((it, i) => {
      const mark = numbered ? `${i + 1}.` : '•';
      ensure(size * PT * 1.5);
      font(numbered ? 'bold' : 'n', size);
      doc.setTextColor(...PURPLE);
      doc.text(mark, M + 1.5, y + size * PT * 0.95);
      rich(it, { x: M + 7, width: W - 7, size, after: 0.8 });
    });
    y += 1;
  };

  const box = (title, text, { fill = [245, 243, 255], stroke = [196, 181, 253], titleColor = PURPLE } = {}) => {
    const size = 10;
    const paras = String(text).split('\n').filter((l) => l.trim());
    const nLines = paras.reduce((s, p) => s + layout(p, W - 10, size, false).length, 0);
    const h = 8 + nLines * size * PT * 1.45 + paras.length * 0.8 + 3;
    ensure(Math.min(h, 60));
    const startY = y;
    const fitsOnPage = startY + h <= BOTTOM;
    if (fitsOnPage) {
      doc.setFillColor(...fill);
      doc.setDrawColor(...stroke);
      doc.setLineWidth(0.3);
      doc.roundedRect(M, y, W, h, 2, 2, 'FD');
    }
    y += 2.5;
    font('bold', 9.5);
    doc.setTextColor(...titleColor);
    doc.text(clean(title), M + 5, y + 3.2);
    y += 5.5;
    paras.forEach((p) => rich(p, { x: M + 5, width: W - 10, size, after: 0.8 }));
    y = fitsOnPage ? Math.max(y, startY + h) + 3 : y + 3;
  };

  // markdown-ish content: paragraphs, "- " bullets, "1. " lists, ``` code, | tables
  const content = (md) => {
    const parts = String(md || '').split(/```[\w-]*\n?([\s\S]*?)```/g);
    parts.forEach((part, pi) => {
      if (pi % 2 === 1) { code(part); return; }
      const lines = part.split('\n');
      let para = [];
      let list = null;
      let table = [];
      const flushPara = () => { if (para.length) { rich(para.join(' '), { after: 2.2 }); para = []; } };
      const flushList = () => { if (list) { bullets(list.items, { numbered: list.numbered }); list = null; } };
      const flushTable = () => { if (table.length) { code(table.filter((r) => !/^\|?\s*:?-{2,}/.test(r)).join('\n')); table = []; } };
      lines.forEach((raw) => {
        const ln = raw.trimEnd();
        const t = ln.trim();
        if (/^\|.*\|$/.test(t)) { flushPara(); flushList(); table.push(t); return; }
        flushTable();
        if (!t) { flushPara(); flushList(); return; }
        let m;
        if ((m = /^[-*•]\s+(.*)$/.exec(t))) {
          flushPara();
          if (!list || list.numbered) { flushList(); list = { numbered: false, items: [] }; }
          list.items.push(m[1]);
          return;
        }
        if ((m = /^\d+[.)]\s+(.*)$/.exec(t))) {
          flushPara();
          if (!list || !list.numbered) { flushList(); list = { numbered: true, items: [] }; }
          list.items.push(m[1]);
          return;
        }
        if ((m = /^#{1,6}\s+(.*)$/.exec(t))) { flushPara(); flushList(); rich(m[1], { bold: true, size: 11.5, after: 1 }); return; }
        flushList();
        para.push(t);
      });
      flushPara(); flushList(); flushTable();
    });
  };

  return {
    get y() { return y; },
    set y(v) { y = v; },
    ensure, font, rich, heading, label, code, bullets, box, content,
  };
}

function drawLogo(doc, x, y, s) {
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, s, s, s * 0.22, s * 0.22, 'F');
  doc.setFillColor(...PURPLE);
  const u = s / 64;
  [[12, 38, 14], [27.5, 29, 23], [43, 20, 32]].forEach(([bx, by, bh]) => doc.roundedRect(x + bx * u, y + by * u, 9 * u, bh * u, 2 * u, 2 * u, 'F'));
}

/**
 * @param {object} t lesson object (title, summary, objectives, theory[], module, level, duration, day)
 * @param {object} opts { course, label, student }
 */
export async function downloadTheoryPdf(t, { course = '', label = '', student = '', save = true } = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const [, logo] = await Promise.all([addFonts(doc), loadLogo()]);
  doc.setProperties({ title: `${label ? `${label}: ` : ''}${clean(t.title)}`, subject: `${course} theory notes`, author: 'NGU', creator: 'NGU' });
  const w = makeWriter(doc);

  // ----- title block -----
  doc.setFillColor(...PURPLE);
  doc.rect(0, 0, PAGE_W, 40, 'F');
  if (logo) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(M - 0.6, 9.4, 13.2, 13.2, 3, 3, 'F');
    doc.addImage(logo, 'PNG', M, 10, 12, 12);
  } else drawLogo(doc, M, 10, 12);
  doc.setFillColor(255, 255, 255);
  w.font('bold', 15);
  doc.setTextColor(255, 255, 255);
  doc.text('NGU', M + 15, 18.5);
  w.font('n', 9);
  doc.text('Never Give Up · Theory notes', M + 15, 23);
  w.font('bold', 10);
  const right = clean(`${course}${label ? `  ·  ${label}` : ''}`);
  doc.text(right, PAGE_W - M, 18.5, { align: 'right' });
  if (t.module) { w.font('n', 9); doc.text(clean(t.module), PAGE_W - M, 23, { align: 'right' }); }

  w.y = 50;
  w.font('bold', 19);
  doc.setTextColor(...DARK);
  doc.splitTextToSize(clean(t.title), W).forEach((l) => { doc.text(l, M, w.y + 19 * PT); w.y += 19 * PT * 1.25; });
  w.y += 2;
  const meta = [t.level, t.duration].filter(Boolean).join('  ·  ');
  if (meta) w.rich(meta, { size: 9.5, color: MUTED, after: 2 });
  if (t.summary) w.rich(t.summary, { size: 11, color: [55, 65, 81], after: 4 });

  if (t.objectives?.length) {
    w.box('After this lesson you will be able to', t.objectives.map((o) => `• ${o}`).join('\n'));
  }

  // ----- theory sections -----
  (t.theory || []).forEach((sec, i) => {
    w.heading(`${i + 1}. ${sec.heading || 'Section'}`);
    w.content(sec.content);
    if (sec.syntax) w.code(sec.syntax, { title: 'Syntax' });
    if (sec.points?.length) { w.label('Key points'); w.bullets(sec.points); }
    if (sec.tip) w.box('Tip', sec.tip, { fill: [255, 251, 235], stroke: [253, 224, 71], titleColor: [161, 98, 7] });
    w.y += 2;
  });

  // ----- footer on every page -----
  const total = doc.getNumberOfPages();
  const when = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  for (let p = 1; p <= total; p += 1) {
    doc.setPage(p);
    doc.setDrawColor(226, 228, 236);
    doc.setLineWidth(0.3);
    doc.line(M, PAGE_H - 13, PAGE_W - M, PAGE_H - 13);
    w.font('n', 8);
    doc.setTextColor(...MUTED);
    const left = clean(`NGU  ·  ${course}${label ? `  ·  ${label}` : ''}`);
    doc.text(doc.splitTextToSize(left, 120)[0], M, PAGE_H - 8.5);
    doc.text(`Page ${p} of ${total}`, PAGE_W - M, PAGE_H - 8.5, { align: 'right' });
    if (student) {
      w.font('n', 7);
      doc.text(clean(`Downloaded by ${student} on ${when}. For personal study only.`), M, PAGE_H - 5);
    }
  }

  const slug = (s) => clean(s).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  const name = `NGU-${slug(course) || 'Course'}-${slug(label) || 'Lesson'}-${slug(t.title)}.pdf`;
  if (!save) return { doc, name };
  doc.save(name);
  return name;
}
