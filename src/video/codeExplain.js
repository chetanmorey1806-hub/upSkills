// Splits code into small parts and explains each part (in English, Hindi or Marathi)
// so the video can teach "how to write this program" step by step.
import { tx } from './i18n.js';

const COMMENT_RE = /^\s*(\/\/+|#(?!include|!)|--\s|\/\*+|\*(?!\/)|<!--|''')\s?(.*?)(\*\/|-->)?\s*$/;

function commentText(line) {
  const m = COMMENT_RE.exec(line);
  if (!m) return '';
  const t = m[2].replace(/\*\/\s*$/, '').trim();
  return /[A-Za-z]{3,}/.test(t) ? t : '';
}

// group lines into blocks: split at blank lines; long blocks split at top-level statement starts
function blocksOf(code, maxBlocks) {
  const lines = code.replace(/\s+$/, '').split('\n');
  let blocks = [];
  let cur = null;
  lines.forEach((ln, i) => {
    if (!ln.trim()) { if (cur) { blocks.push(cur); cur = null; } return; }
    const top = !/^\s/.test(ln);
    if (cur && cur.to - cur.from >= 9 && top && !/^[})\]]/.test(ln)) { blocks.push(cur); cur = null; }
    if (!cur) cur = { from: i, to: i };
    cur.to = i;
  });
  if (cur) blocks.push(cur);
  // merge tiny blocks until we have at most maxBlocks
  while (blocks.length > maxBlocks) {
    let best = 0;
    let bestSize = Infinity;
    for (let i = 0; i < blocks.length - 1; i += 1) {
      const size = blocks[i + 1].to - blocks[i].from;
      if (size < bestSize) { bestSize = size; best = i; }
    }
    blocks.splice(best, 2, { from: blocks[best].from, to: blocks[best + 1].to });
  }
  blocks = blocks.map((b) => ({ ...b, lines: lines.slice(b.from, b.to + 1) }));
  return blocks;
}

function classify(lines, C) {
  const code = lines.filter((l) => !commentText(l)).join('\n');
  const first = (code.split('\n').find((l) => l.trim()) || '').trim();
  let m;
  if ((m = /^(?:import\s+(?:[\w*{},\s]+from\s+)?['"]([^'"]+)['"]|from\s+([\w.]+)\s+import|import\s+([\w.]+)|using\s+([\w.]+);|#include\s*[<"]([^>"]+)|(?:const|let|var)\s+[\w{},\s]+=\s*require\(['"]([^'"]+))/.exec(first))) {
    return C.import([m[1], m[2], m[3], m[4], m[5], m[6]].find(Boolean) || '');
  }
  if ((m = /\b(app|router)\.(get|post|put|patch|delete|all)\(\s*['"`]([^'"`]+)/i.exec(code))) return C.route(m[2].toUpperCase(), m[3]);
  if ((m = /@(Get|Post|Put|Delete|Patch)Mapping\(\s*(?:value\s*=\s*)?"?([^")]*)/.exec(code))) return C.route(m[1].toUpperCase(), m[2] || '/');
  if ((m = /@app\.(get|post|put|delete|route)\(\s*['"]([^'"]+)/.exec(code))) return C.route(m[1].toUpperCase(), m[2]);
  if (/\b(?:express|Flask|FastAPI)\(\s*(__name__)?\s*\)|WebApplication\.CreateBuilder/.test(code)) return C.app;
  if (/\b(app|router)\.use\(/.test(code)) return C.middleware;
  if ((m = /\.listen\(\s*(\w+)?|app\.run\(.*?(?:port\s*=\s*(\d+))?|uvicorn\.run/.exec(code))) return C.listen((m[1] && /^\d+$/.test(m[1]) ? m[1] : m[2]) || '');
  if (/createApp\s*\(/.test(code)) return C.vue;
  if ((m = /^\s*(?:CREATE\s+TABLE)\s+(?:IF\s+NOT\s+EXISTS\s+)?[`[]?(\w+)/im.exec(code))) return C.create(m[1]);
  if ((m = /^\s*SELECT\b[\s\S]*?\bFROM\s+[`[]?(\w+)/im.exec(code))) return C.select(m[1]);
  if (/^\s*SELECT\b/im.test(code)) return C.select('');
  if ((m = /^\s*(INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+[`[]?(\w+)/im.exec(code))) return C.write(m[1].split(/\s+/)[0].toUpperCase(), m[2]);
  if ((m = /^=\s*([A-Z][A-Z0-9.]*)\s*\(/.exec(first)) || /^=/.test(first)) return C.formula(m ? m[1] : '');
  if ((m = /^\s*(?:export\s+)?(?:public|private|protected)?\s*(?:static\s+)?(?:abstract\s+)?class\s+(\w+)/m.exec(code))) return C.cls(m[1]);
  if ((m = /^\s*(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|def\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>)/m.exec(code))) return C.func(m[1] || m[2] || m[3]);
  if ((m = /^\s*(?:public|private|protected|internal)\s+(?:static\s+)?(?:async\s+)?[\w<>[\],\s]+?\s+(\w+)\s*\([^;]*$/m.exec(first))) return C.func(m[1]);
  if (/^\s*(try\b|try:)/m.test(first)) return C.tryc;
  if (/^\s*(for|while|foreach)\b|\.(forEach|map)\(/.test(first)) return C.loop;
  if (/^\s*(if|switch|elif|else)\b/.test(first)) return C.cond;
  if (/^\s*(print\(|console\.(log|table)\(|System\.out\.print|Console\.Write|echo\b|PRINT\b)/i.test(first)) return C.print;
  if (/^\s*return\b/.test(first)) return C.ret;
  if ((m = /^<([a-zA-Z][\w-]*)/.exec(first))) return C.html(`<${m[1]}>`);
  if ((m = /^([.#]?[\w-][\w\s.#:>,[\]="'-]*)\{/.exec(first)) && !/[=(]/.test(m[1])) return C.css(m[1].trim());
  if ((m = /^\s*(?:const|let|var|final|int|double|float|string|String|bool|boolean|var|auto)\s+(\w+)\s*=|^\s*(\w+)\s*=\s*[^=]/.exec(first))) return C.variable(m[1] || m[2]);
  return C.generic;
}

/**
 * Returns [{ from, to, say, translate }] – one item per code part.
 * `translate` is true when the explanation came from an English code comment.
 */
export function explainCode(code, lang = 'en', maxBlocks = 6) {
  const C = tx(lang).code;
  const out = [];
  blocksOf(code, maxBlocks).forEach((b) => {
    const comments = b.lines.map(commentText).filter(Boolean);
    const onlyComments = b.lines.every((l) => commentText(l) || !l.trim());
    if (onlyComments && !comments.length) return;
    const auto = classify(b.lines, C);
    if (comments.length && (auto === C.generic || onlyComments)) {
      out.push({ from: b.from, to: b.to, say: comments.slice(0, 2).join('. '), translate: true });
    } else {
      out.push({ from: b.from, to: b.to, say: auto, translate: false, note: comments[0] || '' });
    }
  });
  return out;
}

// true when the text looks like program code (not prose / prompts)
export function looksLikeProgram(code) {
  const s = String(code);
  const sym = (s.match(/[{}();=<>[\]]/g) || []).length;
  return sym / Math.max(1, s.length) > 0.025 || /^\s*=/.test(s);
}
