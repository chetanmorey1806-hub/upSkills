// Mini Excel formula engine: tokenizer, parser, evaluator.
// Values: number | string | boolean | null (blank) | Err | Matrix (array of rows)

export class Err {
  constructor(code) { this.code = code; }
  toString() { return this.code; }
}
const E = {
  NA: () => new Err('#N/A'), VALUE: () => new Err('#VALUE!'), DIV0: () => new Err('#DIV/0!'),
  REF: () => new Err('#REF!'), NAME: () => new Err('#NAME?'), NUM: () => new Err('#NUM!'),
};
export const isErr = (v) => v instanceof Err;
const isMatrix = (v) => Array.isArray(v);

// ---------- cell address helpers ----------
export const colToNum = (c) => c.toUpperCase().split('').reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
export const numToCol = (n) => { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
export const parseAddr = (a) => {
  const m = /^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(a);
  return m ? { c: colToNum(m[1]), r: parseInt(m[2], 10) } : null;
};
export const addr = (c, r) => numToCol(c) + r;

// ---------- tokenizer ----------
function tokenize(src) {
  const t = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === '"') {
      let s = ''; i++;
      while (i < src.length) {
        if (src[i] === '"' && src[i + 1] === '"') { s += '"'; i += 2; }
        else if (src[i] === '"') break;
        else s += src[i++];
      }
      if (src[i] !== '"') throw new Error('Unclosed string');
      i++; t.push({ type: 'str', v: s }); continue;
    }
    const num = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(src.slice(i));
    if (num) { t.push({ type: 'num', v: parseFloat(num[0]) }); i += num[0].length; continue; }
    const ref = /^(\$?[A-Za-z]{1,3}\$?\d+)(:(\$?[A-Za-z]{1,3}\$?\d+))?/.exec(src.slice(i));
    const ident = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(src.slice(i));
    if (ref && !(ident && ident[0].length > ref[0].length && src[i + ident[0].length] === '(')) {
      // cell ref (but not a function like LOG10( )
      if (!(src[i + ref[0].length] === '(')) {
        t.push(ref[3] ? { type: 'range', a: ref[1], b: ref[3] } : { type: 'ref', a: ref[1] });
        i += ref[0].length; continue;
      }
    }
    if (ident) {
      const name = ident[0].toUpperCase();
      i += ident[0].length;
      if (name === 'TRUE' || name === 'FALSE') { t.push({ type: 'bool', v: name === 'TRUE' }); continue; }
      t.push({ type: 'name', v: name }); continue;
    }
    const two = src.slice(i, i + 2);
    if (['<=', '>=', '<>'].includes(two)) { t.push({ type: 'op', v: two }); i += 2; continue; }
    if ('+-*/^&=<>%'.includes(ch)) { t.push({ type: 'op', v: ch }); i++; continue; }
    if (ch === '(' || ch === ')' || ch === ',' || ch === ';') { t.push({ type: ch === ';' ? ',' : ch }); i++; continue; }
    if (ch === '{' || ch === '}') { t.push({ type: ch }); i++; continue; }
    throw new Error(`Unexpected character "${ch}"`);
  }
  return t;
}

// ---------- parser (precedence climbing) ----------
function parse(tokens) {
  let p = 0;
  const peek = () => tokens[p];
  const next = () => tokens[p++];
  const expect = (type) => { const tk = next(); if (!tk || tk.type !== type) throw new Error(`Expected "${type}"`); return tk; };

  const cmp = () => {
    let l = concat();
    while (peek()?.type === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(peek().v)) { const op = next().v; l = { k: 'bin', op, l, r: concat() }; }
    return l;
  };
  const concat = () => {
    let l = add();
    while (peek()?.type === 'op' && peek().v === '&') { next(); l = { k: 'bin', op: '&', l, r: add() }; }
    return l;
  };
  const add = () => {
    let l = mul();
    while (peek()?.type === 'op' && (peek().v === '+' || peek().v === '-')) { const op = next().v; l = { k: 'bin', op, l, r: mul() }; }
    return l;
  };
  const mul = () => {
    let l = pow();
    while (peek()?.type === 'op' && (peek().v === '*' || peek().v === '/')) { const op = next().v; l = { k: 'bin', op, l, r: pow() }; }
    return l;
  };
  const pow = () => {
    let l = unary();
    while (peek()?.type === 'op' && peek().v === '^') { next(); l = { k: 'bin', op: '^', l, r: unary() }; }
    return l;
  };
  const unary = () => {
    if (peek()?.type === 'op' && (peek().v === '-' || peek().v === '+')) { const op = next().v; const e = unary(); return op === '-' ? { k: 'neg', e } : e; }
    return percent();
  };
  const percent = () => {
    let e = primary();
    while (peek()?.type === 'op' && peek().v === '%') { next(); e = { k: 'bin', op: '/', l: e, r: { k: 'lit', v: 100 } }; }
    return e;
  };
  const primary = () => {
    const tk = next();
    if (!tk) throw new Error('Unexpected end of formula');
    switch (tk.type) {
      case 'num': case 'str': case 'bool': return { k: 'lit', v: tk.v };
      case 'ref': return { k: 'ref', a: tk.a };
      case 'range': return { k: 'range', a: tk.a, b: tk.b };
      case '(': { const e = cmp(); expect(')'); return e; }
      case '{': {
        const rows = [[]];
        while (peek() && peek().type !== '}') {
          const e = cmp(); rows[rows.length - 1].push(e);
          if (peek()?.type === ',') next();
        }
        expect('}');
        return { k: 'arr', rows };
      }
      case 'name': {
        if (peek()?.type === '(') {
          next();
          const args = [];
          if (peek()?.type !== ')') {
            for (;;) {
              if (peek()?.type === ',' || peek()?.type === ')') args.push({ k: 'lit', v: null });
              else args.push(cmp());
              if (peek()?.type === ',') { next(); continue; }
              break;
            }
          }
          expect(')');
          return { k: 'call', name: tk.v, args };
        }
        return { k: 'name', v: tk.v };
      }
      default: throw new Error(`Unexpected token "${tk.v ?? tk.type}"`);
    }
  };
  const ast = cmp();
  if (p < tokens.length) throw new Error(`Unexpected "${tokens[p].v ?? tokens[p].type}"`);
  return ast;
}

// ---------- coercion ----------
const toNum = (v) => {
  if (isErr(v)) return v;
  if (isMatrix(v)) return toNum(v[0]?.[0]);
  if (v === null || v === '') return 0;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isNaN(n) ? E.VALUE() : n;
};
const toStr = (v) => {
  if (isMatrix(v)) return toStr(v[0]?.[0]);
  if (v === null) return '';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return fmtNum(v);
  return String(v);
};
const toBool = (v) => {
  if (isMatrix(v)) return toBool(v[0]?.[0]);
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (v === null) return false;
  const s = String(v).toUpperCase();
  if (s === 'TRUE') return true;
  if (s === 'FALSE') return false;
  return E.VALUE();
};
export const fmtNum = (n) => {
  if (!Number.isFinite(n)) return '#NUM!';
  const r = Math.round(n * 1e10) / 1e10;
  return String(r);
};
const flat = (args) => {
  const out = [];
  args.forEach((a) => (isMatrix(a) ? a.forEach((row) => row.forEach((x) => out.push({ v: x, fromRange: true }))) : out.push({ v: a, fromRange: false })));
  return out;
};
const firstErr = (arr) => arr.find((x) => isErr(x.v ?? x));
const asMatrix = (v) => (isMatrix(v) ? v : [[v]]);

// ---------- criteria (COUNTIF etc.) ----------
function makeCriteria(crit) {
  if (typeof crit === 'number' || typeof crit === 'boolean') return (v) => v === crit || (typeof v === 'string' && v !== '' && Number(v) === crit);
  const s = toStr(crit);
  const m = /^(<=|>=|<>|=|<|>)?(.*)$/.exec(s);
  const op = m[1] || '=';
  const rhs = m[2];
  const rhsNum = rhs !== '' && !Number.isNaN(Number(rhs)) ? Number(rhs) : null;
  const wild = (pat) => new RegExp('^' + pat.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/~\*/g, '\u0001').replace(/~\?/g, '\u0002').replace(/\*/g, '.*').replace(/\?/g, '.').replace(/\u0001/g, '\\*').replace(/\u0002/g, '\\?') + '$', 'i');
  return (v) => {
    if (rhsNum !== null && op !== '=' && op !== '<>') {
      if (typeof v !== 'number') return false;
      return op === '<' ? v < rhsNum : op === '>' ? v > rhsNum : op === '<=' ? v <= rhsNum : v >= rhsNum;
    }
    if (op === '<' || op === '>' || op === '<=' || op === '>=') {
      if (typeof v !== 'string') return false;
      const c = v.toLowerCase().localeCompare(rhs.toLowerCase());
      return op === '<' ? c < 0 : op === '>' ? c > 0 : op === '<=' ? c <= 0 : c >= 0;
    }
    let eq;
    if (rhs === '') eq = v === null || v === '';
    else if (rhsNum !== null && typeof v === 'number') eq = v === rhsNum;
    else eq = v !== null && wild(rhs).test(toStr(v));
    return op === '<>' ? !eq : eq;
  };
}

// ---------- dates (Excel serial, 1900 system) ----------
const EPOCH = Date.UTC(1899, 11, 30);
const serialToDate = (n) => new Date(EPOCH + Math.floor(n) * 86400000);
const dateToSerial = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - EPOCH) / 86400000);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function textFormat(v, fmt) {
  const f = String(fmt);
  if (/[dmy]/i.test(f) && !/[0#]/.test(f)) {
    const n = toNum(v); if (isErr(n)) return n;
    const d = serialToDate(n);
    const Y = d.getUTCFullYear(), M = d.getUTCMonth() + 1, D = d.getUTCDate(), W = d.getUTCDay();
    return f.replace(/yyyy|yy|mmmm|mmm|mm|m|dddd|ddd|dd|d/gi, (tok) => {
      const t = tok.toLowerCase();
      return { yyyy: Y, yy: String(Y).slice(-2), mmmm: MONTHS[M - 1], mmm: MONTHS[M - 1].slice(0, 3), mm: String(M).padStart(2, '0'), m: M, dddd: DAYS[W], ddd: DAYS[W].slice(0, 3), dd: String(D).padStart(2, '0'), d: D }[t];
    });
  }
  const n = toNum(v); if (isErr(n)) return n;
  const pct = f.includes('%');
  const val = pct ? n * 100 : n;
  const dec = (/\.(0+)/.exec(f) || [, ''])[1].length;
  const comma = f.includes(',');
  let s = Math.abs(val).toFixed(dec);
  if (comma) { const [a, b] = s.split('.'); s = a.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (b ? '.' + b : ''); }
  const prefix = (/^[^0#,.]*/.exec(f) || [''])[0].replace(/"/g, '');
  return (val < 0 ? '-' : '') + prefix + s + (pct ? '%' : '');
}

// ---------- functions ----------
const nums = (args) => flat(args).filter((x) => (x.fromRange ? typeof x.v === 'number' : x.v !== null)).map((x) => (x.fromRange ? x.v : toNum(x.v)));
const withNums = (args, fn) => {
  const all = flat(args); const er = all.find((x) => isErr(x.v)); if (er) return er.v;
  const ns = nums(args); const bad = ns.find(isErr); if (bad) return bad;
  return fn(ns);
};
const lookupEq = (a, b) => {
  if (typeof a === 'string' && typeof b === 'string') return a.toLowerCase() === b.toLowerCase();
  if (typeof a === 'number' && typeof b === 'string' && b !== '' && !Number.isNaN(Number(b))) return a === Number(b);
  if (typeof b === 'number' && typeof a === 'string' && a !== '' && !Number.isNaN(Number(a))) return b === Number(a);
  return a === b;
};
const cmpVals = (a, b) => {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return toStr(a).toLowerCase().localeCompare(toStr(b).toLowerCase());
};
function approxMatch(list, v, mode) {
  // mode 1: largest <= v (sorted asc); -1: smallest >= v
  let best = -1;
  list.forEach((x, i) => {
    if (x === null || typeof x !== typeof v) return;
    const c = cmpVals(x, v);
    if (mode === 1 && c <= 0 && (best < 0 || cmpVals(x, list[best]) >= 0)) best = i;
    if (mode === -1 && c >= 0 && (best < 0 || cmpVals(x, list[best]) <= 0)) best = i;
  });
  return best;
}
const ifsAgg = (rangeArgs, sumRange, mode) => {
  const pairs = [];
  for (let i = 0; i < rangeArgs.length; i += 2) pairs.push([asMatrix(rangeArgs[i]).flat(), makeCriteria(rangeArgs[i + 1])]);
  const target = sumRange ? asMatrix(sumRange).flat() : null;
  let sum = 0, count = 0;
  const n = pairs[0][0].length;
  for (let i = 0; i < n; i++) {
    if (pairs.every(([r, f]) => f(r[i] ?? null))) {
      if (target) { if (typeof target[i] === 'number') { sum += target[i]; count++; } }
      else count++;
    }
  }
  if (mode === 'count') return count;
  if (mode === 'sum') return sum;
  return count ? sum / count : E.DIV0();
};

const F = {
  SUM: (a) => withNums(a, (n) => n.reduce((s, x) => s + x, 0)),
  AVERAGE: (a) => withNums(a, (n) => (n.length ? n.reduce((s, x) => s + x, 0) / n.length : E.DIV0())),
  MIN: (a) => withNums(a, (n) => (n.length ? Math.min(...n) : 0)),
  MAX: (a) => withNums(a, (n) => (n.length ? Math.max(...n) : 0)),
  MEDIAN: (a) => withNums(a, (n) => { if (!n.length) return E.NUM(); const s = [...n].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }),
  PRODUCT: (a) => withNums(a, (n) => n.reduce((s, x) => s * x, 1)),
  COUNT: (a) => flat(a).filter((x) => typeof x.v === 'number' || (!x.fromRange && typeof toNum(x.v) === 'number' && x.v !== null)).length,
  COUNTA: (a) => flat(a).filter((x) => x.v !== null && x.v !== '').length,
  COUNTBLANK: (a) => flat(a).filter((x) => x.v === null || x.v === '').length,
  ROUND: ([v, d]) => { const n = toNum(v), k = toNum(d ?? 0); if (isErr(n)) return n; const f = 10 ** k; return Math.sign(n) * Math.round(Math.abs(n) * f + 1e-9) / f; },
  ROUNDUP: ([v, d]) => { const n = toNum(v), f = 10 ** toNum(d ?? 0); return Math.sign(n) * Math.ceil(Math.abs(n) * f - 1e-9) / f; },
  ROUNDDOWN: ([v, d]) => { const n = toNum(v), f = 10 ** toNum(d ?? 0); return Math.sign(n) * Math.floor(Math.abs(n) * f + 1e-9) / f; },
  INT: ([v]) => Math.floor(toNum(v)),
  ABS: ([v]) => Math.abs(toNum(v)),
  SQRT: ([v]) => { const n = toNum(v); return n < 0 ? E.NUM() : Math.sqrt(n); },
  POWER: ([a, b]) => toNum(a) ** toNum(b),
  MOD: ([a, b]) => { const x = toNum(a), y = toNum(b); if (y === 0) return E.DIV0(); return x - y * Math.floor(x / y); },
  LARGE: ([r, k]) => { const n = nums([r]).sort((x, y) => y - x); const i = toNum(k); return n[i - 1] ?? E.NUM(); },
  SMALL: ([r, k]) => { const n = nums([r]).sort((x, y) => x - y); const i = toNum(k); return n[i - 1] ?? E.NUM(); },
  RANK: ([v, r, o]) => { const x = toNum(v); const n = nums([r]); if (!n.includes(x)) return E.NA(); return toNum(o ?? 0) ? n.filter((y) => y < x).length + 1 : n.filter((y) => y > x).length + 1; },
  'RANK.EQ': (a) => F.RANK(a),
  SUMPRODUCT: (args) => {
    const ms = args.map(asMatrix);
    const len = ms[0].flat().length;
    if (ms.some((m) => m.flat().length !== len)) return E.VALUE();
    let s = 0;
    for (let i = 0; i < len; i++) s += ms.reduce((p, m) => { const v = m.flat()[i]; return p * (typeof v === 'number' ? v : typeof v === 'boolean' ? +v : 0); }, 1);
    return s;
  },
  SUMIF: ([r, c, s]) => ifsAgg([r, c], s ?? r, 'sum'),
  SUMIFS: ([s, ...rest]) => ifsAgg(rest, s, 'sum'),
  COUNTIF: ([r, c]) => ifsAgg([r, c], null, 'count'),
  COUNTIFS: (rest) => ifsAgg(rest, null, 'count'),
  AVERAGEIF: ([r, c, s]) => ifsAgg([r, c], s ?? r, 'avg'),
  AVERAGEIFS: ([s, ...rest]) => ifsAgg(rest, s, 'avg'),
  MAXIFS: ([s, ...rest]) => { const t = asMatrix(s).flat(); const pairs = []; for (let i = 0; i < rest.length; i += 2) pairs.push([asMatrix(rest[i]).flat(), makeCriteria(rest[i + 1])]); const v = t.filter((x, i) => typeof x === 'number' && pairs.every(([r, f]) => f(r[i] ?? null))); return v.length ? Math.max(...v) : 0; },
  MINIFS: ([s, ...rest]) => { const t = asMatrix(s).flat(); const pairs = []; for (let i = 0; i < rest.length; i += 2) pairs.push([asMatrix(rest[i]).flat(), makeCriteria(rest[i + 1])]); const v = t.filter((x, i) => typeof x === 'number' && pairs.every(([r, f]) => f(r[i] ?? null))); return v.length ? Math.min(...v) : 0; },
  // logical
  AND: (a) => { const v = flat(a).map((x) => toBool(x.v)); return v.find(isErr) || v.every(Boolean); },
  OR: (a) => { const v = flat(a).map((x) => toBool(x.v)); return v.find(isErr) || v.some(Boolean); },
  XOR: (a) => flat(a).map((x) => toBool(x.v)).filter(Boolean).length % 2 === 1,
  NOT: ([v]) => { const b = toBool(v); return isErr(b) ? b : !b; },
  ISBLANK: ([v]) => v === null,
  ISNUMBER: ([v]) => typeof v === 'number',
  ISTEXT: ([v]) => typeof v === 'string',
  ISERROR: ([v]) => isErr(v),
  ISNA: ([v]) => isErr(v) && v.code === '#N/A',
  // text
  LEFT: ([s, n]) => toStr(s).slice(0, n == null ? 1 : toNum(n)),
  RIGHT: ([s, n]) => { const k = n == null ? 1 : toNum(n); return k === 0 ? '' : toStr(s).slice(-k); },
  MID: ([s, st, n]) => toStr(s).substr(toNum(st) - 1, toNum(n)),
  LEN: ([s]) => toStr(s).length,
  TRIM: ([s]) => toStr(s).trim().replace(/ +/g, ' '),
  CLEAN: ([s]) => toStr(s).replace(/[\x00-\x1f]/g, ''),
  UPPER: ([s]) => toStr(s).toUpperCase(),
  LOWER: ([s]) => toStr(s).toLowerCase(),
  PROPER: ([s]) => toStr(s).toLowerCase().replace(/(^|[^a-z])([a-z])/g, (m, a, b) => a + b.toUpperCase()),
  CONCAT: (a) => flat(a).map((x) => toStr(x.v)).join(''),
  CONCATENATE: (a) => a.map(toStr).join(''),
  TEXTJOIN: ([d, ig, ...rest]) => flat(rest).map((x) => x.v).filter((v) => !(toBool(ig) && (v === null || v === ''))).map(toStr).join(toStr(d)),
  FIND: ([f, s, st]) => { const i = toStr(s).indexOf(toStr(f), (st ? toNum(st) : 1) - 1); return i < 0 ? E.VALUE() : i + 1; },
  SEARCH: ([f, s, st]) => {
    const pat = toStr(f).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
    const from = (st ? toNum(st) : 1) - 1;
    const m = new RegExp(pat, 'i').exec(toStr(s).slice(from));
    return m ? m.index + from + 1 : E.VALUE();
  },
  SUBSTITUTE: ([s, o, n, k]) => {
    const str = toStr(s), old = toStr(o), nw = toStr(n);
    if (!old) return str;
    if (k == null) return str.split(old).join(nw);
    let idx = -1; for (let i = 0; i < toNum(k); i++) { idx = str.indexOf(old, idx + 1); if (idx < 0) return str; }
    return str.slice(0, idx) + nw + str.slice(idx + old.length);
  },
  REPLACE: ([s, st, n, nw]) => { const str = toStr(s); const i = toNum(st) - 1; return str.slice(0, i) + toStr(nw) + str.slice(i + toNum(n)); },
  REPT: ([s, n]) => toStr(s).repeat(Math.max(0, toNum(n))),
  EXACT: ([a, b]) => toStr(a) === toStr(b),
  VALUE: ([s]) => toNum(s),
  TEXT: ([v, f]) => textFormat(v, toStr(f)),
  TEXTBEFORE: ([s, d]) => { const str = toStr(s); const i = str.indexOf(toStr(d)); return i < 0 ? E.NA() : str.slice(0, i); },
  TEXTAFTER: ([s, d]) => { const str = toStr(s); const i = str.indexOf(toStr(d)); return i < 0 ? E.NA() : str.slice(i + toStr(d).length); },
  // dates
  TODAY: () => { const d = new Date(); return dateToSerial(d.getFullYear(), d.getMonth() + 1, d.getDate()); },
  DATE: ([y, m, d]) => dateToSerial(toNum(y), toNum(m), toNum(d)),
  YEAR: ([v]) => serialToDate(toNum(v)).getUTCFullYear(),
  MONTH: ([v]) => serialToDate(toNum(v)).getUTCMonth() + 1,
  DAY: ([v]) => serialToDate(toNum(v)).getUTCDate(),
  WEEKDAY: ([v]) => serialToDate(toNum(v)).getUTCDay() + 1,
  EDATE: ([v, m]) => { const d = serialToDate(toNum(v)); const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + toNum(m), 1)); const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate(); return dateToSerial(t.getUTCFullYear(), t.getUTCMonth() + 1, Math.min(d.getUTCDate(), last)); },
  EOMONTH: ([v, m]) => { const d = serialToDate(toNum(v)); return Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + toNum(m) + 1, 0) - EPOCH) / 86400000); },
  DAYS: ([e, s]) => toNum(e) - toNum(s),
  DATEDIF: ([s, e, u]) => {
    const a = serialToDate(toNum(s)), b = serialToDate(toNum(e)); const unit = toStr(u).toUpperCase();
    if (b < a) return E.NUM();
    let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth();
    if (b.getUTCDate() < a.getUTCDate()) months--;
    if (unit === 'D') return toNum(e) - toNum(s);
    if (unit === 'M') return months;
    if (unit === 'Y') return Math.floor(months / 12);
    if (unit === 'YM') return months % 12;
    return E.NUM();
  },
  NETWORKDAYS: ([s, e]) => { let c = 0; const a = toNum(s), b = toNum(e); for (let x = Math.min(a, b); x <= Math.max(a, b); x++) { const w = serialToDate(x).getUTCDay(); if (w !== 0 && w !== 6) c++; } return a <= b ? c : -c; },
  // lookup
  CHOOSE: ([i, ...opts]) => opts[toNum(i) - 1] ?? E.VALUE(),
  VLOOKUP: ([v, t, c, r]) => {
    const m = asMatrix(t); const col = toNum(c);
    if (col < 1 || col > (m[0]?.length || 0)) return E.REF();
    const first = m.map((row) => row[0]);
    const exact = r != null && !toBool(r);
    const idx = exact ? first.findIndex((x) => (typeof v === 'string' ? makeCriteria(v)(x) : lookupEq(x, v))) : approxMatch(first, v, 1);
    return idx < 0 ? E.NA() : m[idx][col - 1];
  },
  HLOOKUP: ([v, t, rn, r]) => {
    const m = asMatrix(t); const ri = toNum(rn);
    if (ri < 1 || ri > m.length) return E.REF();
    const exact = r != null && !toBool(r);
    const idx = exact ? m[0].findIndex((x) => lookupEq(x, v)) : approxMatch(m[0], v, 1);
    return idx < 0 ? E.NA() : m[ri - 1][idx];
  },
  INDEX: ([t, r, c]) => {
    const m = asMatrix(t);
    let ri = toNum(r ?? 0), ci = toNum(c ?? 0);
    if (m.length === 1 && c == null) { ci = ri; ri = 1; }
    if (ri === 0 && ci > 0) return m.map((row) => [row[ci - 1]]);
    if (ci === 0 && m[0].length > 1) return [m[ri - 1]];
    const v = m[ri - 1]?.[(ci || 1) - 1];
    return v === undefined ? E.REF() : v;
  },
  MATCH: ([v, r, t]) => {
    const list = asMatrix(r).flat(); const type = t == null ? 1 : toNum(t);
    const idx = type === 0 ? list.findIndex((x) => (typeof v === 'string' ? makeCriteria(v)(x) : lookupEq(x, v))) : approxMatch(list, v, type > 0 ? 1 : -1);
    return idx < 0 ? E.NA() : idx + 1;
  },
  XMATCH: ([v, r, mm]) => {
    const list = asMatrix(r).flat(); const mode = toNum(mm ?? 0);
    let idx = list.findIndex((x) => lookupEq(x, v));
    if (idx < 0 && mode === -1) idx = approxMatch(list, v, 1);
    if (idx < 0 && mode === 1) idx = approxMatch(list, v, -1);
    if (idx < 0 && mode === 2) idx = list.findIndex((x) => makeCriteria(v)(x));
    return idx < 0 ? E.NA() : idx + 1;
  },
  XLOOKUP: ([v, lr, rr, nf, mm, sm]) => {
    const list = asMatrix(lr).flat(); const ret = asMatrix(rr);
    const mode = toNum(mm ?? 0); const search = toNum(sm ?? 1);
    const order = list.map((_, i) => i); if (search < 0) order.reverse();
    let idx = order.find((i) => lookupEq(list[i], v));
    if (idx === undefined && mode === 2) idx = order.find((i) => makeCriteria(v)(list[i]));
    if (idx === undefined && mode === -1) { const k = approxMatch(list, v, 1); if (k >= 0) idx = k; }
    if (idx === undefined && mode === 1) { const k = approxMatch(list, v, -1); if (k >= 0) idx = k; }
    if (idx === undefined) return nf != null ? nf : E.NA();
    const vertical = asMatrix(lr).length > 1;
    if (vertical) return ret[idx].length === 1 ? ret[idx][0] : [ret[idx]];
    return ret.length === 1 ? ret[0][idx] : ret.map((row) => [row[idx]]);
  },
  ROWS: ([r]) => asMatrix(r).length,
  COLUMNS: ([r]) => asMatrix(r)[0].length,
};
const LAZY = {
  IF: (args, ev) => { const c = toBool(ev(args[0])); if (isErr(c)) return c; return c ? (args[1] ? ev(args[1]) : true) : args[2] ? ev(args[2]) : false; },
  IFERROR: (args, ev) => { const v = ev(args[0]); return isErr(v) ? ev(args[1]) : v; },
  IFNA: (args, ev) => { const v = ev(args[0]); return isErr(v) && v.code === '#N/A' ? ev(args[1]) : v; },
  IFS: (args, ev) => { for (let i = 0; i < args.length; i += 2) { const c = toBool(ev(args[i])); if (isErr(c)) return c; if (c) return ev(args[i + 1]); } return E.NA(); },
  SWITCH: (args, ev) => {
    const v = ev(args[0]);
    for (let i = 1; i + 1 < args.length; i += 2) if (lookupEq(ev(args[i]), v)) return ev(args[i + 1]);
    return args.length % 2 === 0 ? ev(args[args.length - 1]) : E.NA();
  },
};
export const SUPPORTED = [...Object.keys(F), ...Object.keys(LAZY)].sort();

// ---------- evaluator ----------
function binop(op, a, b) {
  if (isMatrix(a) || isMatrix(b)) {
    const A = asMatrix(a), B = asMatrix(b);
    const rows = Math.max(A.length, B.length), cols = Math.max(A[0].length, B[0].length);
    const out = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) row.push(binop(op, (A[r] || A[0])[c] ?? (A[r] || A[0])[0], (B[r] || B[0])[c] ?? (B[r] || B[0])[0]));
      out.push(row);
    }
    return out;
  }
  if (isErr(a)) return a;
  if (isErr(b)) return b;
  if (op === '&') return toStr(a) + toStr(b);
  if (['=', '<>', '<', '>', '<=', '>='].includes(op)) {
    let c;
    const na = a === null ? (typeof b === 'string' ? '' : 0) : a;
    const nb = b === null ? (typeof a === 'string' ? '' : 0) : b;
    if (typeof na === 'number' && typeof nb === 'number') c = na - nb;
    else if (typeof na === 'boolean' && typeof nb === 'boolean') c = +na - +nb;
    else if (typeof na === typeof nb) c = String(na).toLowerCase().localeCompare(String(nb).toLowerCase());
    else c = typeof na === 'number' ? -1 : 1; // numbers < text < logicals
    return { '=': c === 0, '<>': c !== 0, '<': c < 0, '>': c > 0, '<=': c <= 0, '>=': c >= 0 }[op];
  }
  const x = toNum(a), y = toNum(b);
  if (isErr(x)) return x;
  if (isErr(y)) return y;
  switch (op) {
    case '+': return x + y;
    case '-': return x - y;
    case '*': return x * y;
    case '/': return y === 0 ? E.DIV0() : x / y;
    case '^': return x ** y;
    default: return E.VALUE();
  }
}

export function evaluateFormula(src, getCell) {
  let ast;
  try {
    ast = parse(tokenize(src));
  } catch (e) {
    return { error: e.message, value: new Err('#ERROR!') };
  }
  const getRange = (a, b) => {
    const p = parseAddr(a), q = parseAddr(b);
    const rows = [];
    for (let r = Math.min(p.r, q.r); r <= Math.max(p.r, q.r); r++) {
      const row = [];
      for (let c = Math.min(p.c, q.c); c <= Math.max(p.c, q.c); c++) row.push(getCell(addr(c, r)));
      rows.push(row);
    }
    return rows;
  };
  const ev = (n) => {
    switch (n.k) {
      case 'lit': return n.v;
      case 'ref': { const p = parseAddr(n.a); return getCell(addr(p.c, p.r)); }
      case 'range': return getRange(n.a, n.b);
      case 'arr': return n.rows.map((r) => r.map(ev));
      case 'neg': { const v = ev(n.e); if (isMatrix(v)) return binop('*', v, -1); const x = toNum(v); return isErr(x) ? x : -x; }
      case 'bin': return binop(n.op, ev(n.l), ev(n.r));
      case 'name': return E.NAME();
      case 'call': {
        if (LAZY[n.name]) return LAZY[n.name](n.args, ev);
        const fn = F[n.name];
        if (!fn) return E.NAME();
        const args = n.args.map((a) => (a.k === 'lit' && a.v === null ? null : ev(a)));
        const errArg = args.find((a) => isErr(a));
        if (errArg && !['ISERROR', 'ISNA', 'COUNT', 'COUNTA'].includes(n.name)) return errArg;
        try { return fn(args); } catch { return E.VALUE(); }
      }
      default: return E.VALUE();
    }
  };
  try {
    let v = ev(ast);
    if (isMatrix(v)) v = v[0]?.[0] ?? null;
    if (typeof v === 'number' && !Number.isFinite(v)) v = E.NUM();
    return { value: v };
  } catch (e) {
    return { error: e.message, value: new Err('#ERROR!') };
  }
}

// ---------- sheet: evaluate all cells with dependency recursion ----------
export function parseLiteral(raw) {
  if (raw == null || raw === '') return null;
  const s = String(raw);
  if (/^-?\d+(\.\d+)?$/.test(s.trim())) return parseFloat(s);
  if (/^(true|false)$/i.test(s.trim())) return s.trim().toUpperCase() === 'TRUE';
  return s;
}

export function computeSheet(raw) {
  const cache = {};
  const visiting = new Set();
  const get = (a) => {
    a = a.toUpperCase();
    if (a in cache) return cache[a];
    const r = raw[a];
    if (r == null || r === '') return null;
    if (typeof r === 'string' && r.startsWith('=')) {
      if (visiting.has(a)) return new Err('#CIRC!');
      visiting.add(a);
      const { value } = evaluateFormula(r.slice(1), get);
      visiting.delete(a);
      cache[a] = value;
      return value;
    }
    cache[a] = parseLiteral(r);
    return cache[a];
  };
  return { get };
}

export function display(v) {
  if (v === null || v === undefined) return '';
  if (isErr(v)) return v.code;
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return fmtNum(v);
  return String(v);
}
