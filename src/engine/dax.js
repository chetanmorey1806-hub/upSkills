// Mini DAX engine: supports measures, filter context, row context, CALCULATE, iterators.
import { MODEL } from './daxModel.js';

const T = MODEL.tables;
const tableNames = Object.keys(T);
const findTable = (n) => tableNames.find((t) => t.toLowerCase() === n.toLowerCase());
const colsOf = (t) => Object.keys(T[t][0]);
const findCol = (t, c) => colsOf(t).find((x) => x.toLowerCase() === c.toLowerCase());
const relsFrom = (t) => MODEL.relationships.filter((r) => r.from === t);
const relTo = (from, to) => MODEL.relationships.find((r) => r.from === from && r.to === to);

export class DaxError extends Error {}
const fail = (m) => { throw new DaxError(m); };

// ---------- tokenizer ----------
function tokenize(src) {
  const t = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (src.startsWith('//', i) || src.startsWith('--', i)) { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (src.startsWith('/*', i)) { const e = src.indexOf('*/', i + 2); i = e < 0 ? src.length : e + 2; continue; }
    if (ch === '"') {
      let s = ''; i++;
      while (i < src.length) { if (src[i] === '"' && src[i + 1] === '"') { s += '"'; i += 2; } else if (src[i] === '"') break; else s += src[i++]; }
      if (src[i] !== '"') fail('Unclosed string');
      i++; t.push({ type: 'str', v: s }); continue;
    }
    if (ch === "'") {
      const e = src.indexOf("'", i + 1); if (e < 0) fail('Unclosed table name quote');
      t.push({ type: 'id', v: src.slice(i + 1, e), quoted: true }); i = e + 1; continue;
    }
    if (ch === '[') {
      const e = src.indexOf(']', i + 1); if (e < 0) fail('Unclosed [');
      t.push({ type: 'bracket', v: src.slice(i + 1, e).trim() }); i = e + 1; continue;
    }
    const num = /^(\d+\.?\d*|\.\d+)/.exec(src.slice(i));
    if (num) { t.push({ type: 'num', v: parseFloat(num[0]) }); i += num[0].length; continue; }
    const id = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(src.slice(i));
    if (id) { t.push({ type: 'id', v: id[0] }); i += id[0].length; continue; }
    const two = src.slice(i, i + 2);
    if (['<=', '>=', '<>', '&&', '||', '=='].includes(two)) { t.push({ type: 'op', v: two === '==' ? '=' : two }); i += 2; continue; }
    if ('+-*/&=<>^'.includes(ch)) { t.push({ type: 'op', v: ch }); i++; continue; }
    if ('(),{}'.includes(ch)) { t.push({ type: ch }); i++; continue; }
    fail(`Unexpected character "${ch}"`);
  }
  return t;
}

// ---------- parser ----------
function parse(tokens) {
  let p = 0;
  const peek = (o = 0) => tokens[p + o];
  const next = () => tokens[p++];
  const isKw = (tk, kw) => tk && tk.type === 'id' && !tk.quoted && tk.v.toUpperCase() === kw;
  const expect = (type) => { const tk = next(); if (!tk || tk.type !== type) fail(`Expected "${type}" but found "${tk ? tk.v ?? tk.type : 'end'}"`); return tk; };

  const expr = () => {
    if (isKw(peek(), 'VAR')) {
      const vars = [];
      while (isKw(peek(), 'VAR')) {
        next();
        const name = expect('id').v;
        const eq = next(); if (!eq || eq.v !== '=') fail('Expected "=" after VAR name');
        vars.push([name, expr()]);
      }
      if (!isKw(peek(), 'RETURN')) fail('Expected RETURN after VAR');
      next();
      return { k: 'var', vars, body: expr() };
    }
    return or();
  };
  const bin = (sub, ops) => () => {
    let l = sub();
    while (peek()?.type === 'op' && ops.includes(peek().v)) { const op = next().v; l = { k: 'bin', op, l, r: sub() }; }
    return l;
  };
  const unary = () => {
    if (peek()?.type === 'op' && peek().v === '-') { next(); return { k: 'neg', e: unary() }; }
    if (peek()?.type === 'op' && peek().v === '+') { next(); return unary(); }
    if (isKw(peek(), 'NOT') && peek(1)?.type !== '(') { next(); return { k: 'call', name: 'NOT', args: [unary()] }; }
    return primary();
  };
  const pow = bin(unary, ['^']);
  const mul = bin(pow, ['*', '/']);
  const add = bin(mul, ['+', '-']);
  const concat = bin(add, ['&']);
  const cmp = () => {
    let l = concat();
    for (;;) {
      if (peek()?.type === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(peek().v)) { const op = next().v; l = { k: 'bin', op, l, r: concat() }; continue; }
      if (isKw(peek(), 'IN')) {
        next(); expect('{'); const items = [];
        while (peek() && peek().type !== '}') { items.push(expr()); if (peek()?.type === ',') next(); }
        expect('}'); l = { k: 'in', l, items }; continue;
      }
      return l;
    }
  };
  const and = bin(cmp, ['&&']);
  const or = bin(and, ['||']);

  const primary = () => {
    const tk = next();
    if (!tk) fail('Unexpected end of expression');
    if (tk.type === 'num') return { k: 'lit', v: tk.v };
    if (tk.type === 'str') return { k: 'lit', v: tk.v };
    if (tk.type === '(') { const e = expr(); expect(')'); return e; }
    if (tk.type === 'bracket') return { k: 'measure', name: tk.v };
    if (tk.type === 'id') {
      if (peek()?.type === 'bracket') {
        const c = next().v;
        const t = findTable(tk.v); if (!t) fail(`Table '${tk.v}' not found`);
        const col = findCol(t, c); if (!col) fail(`Column [${c}] not found in table ${t}`);
        return { k: 'col', t, c: col };
      }
      if (peek()?.type === '(' && !tk.quoted) {
        next();
        const args = [];
        if (peek()?.type !== ')') {
          for (;;) { args.push(expr()); if (peek()?.type === ',') { next(); continue; } break; }
        }
        expect(')');
        return { k: 'call', name: tk.v.toUpperCase(), args };
      }
      return { k: 'ident', v: tk.v };
    }
    fail(`Unexpected "${tk.v ?? tk.type}"`);
  };
  const ast = expr();
  if (p < tokens.length) fail(`Unexpected "${tokens[p].v ?? tokens[p].type}"`);
  return ast;
}

// ---------- filter context ----------
// ctx = { filters: [{ table, cols:[...], pred(row) }], selected: [...] }
const emptyCtx = () => ({ filters: [], selected: [] });

function expandedTables(t) {
  // tables whose filters propagate into t (t itself + dims on the one-side)
  return [t, ...relsFrom(t).map((r) => r.to)];
}
function visibleRows(table, ctx) {
  const own = ctx.filters.filter((f) => f.table === table);
  let rows = T[table].filter((r) => own.every((f) => f.pred(r)));
  relsFrom(table).forEach((rel) => {
    const dimF = ctx.filters.filter((f) => f.table === rel.to);
    if (!dimF.length) return;
    const keys = new Set(T[rel.to].filter((r) => dimF.every((f) => f.pred(r))).map((r) => r[rel.toCol]));
    rows = rows.filter((r) => keys.has(r[rel.fromCol]));
  });
  return rows;
}
const removeFilters = (ctx, table, cols) => ({
  ...ctx,
  filters: ctx.filters.filter((f) => !(f.table === table && (!cols || f.cols.some((c) => cols.includes(c))))),
});

// ---------- table values ----------
// { table, cols: [...], rows: [row objects], partial: bool }
const fullTable = (t, rows) => ({ table: t, cols: colsOf(t), rows, partial: false });
const isTable = (v) => v && typeof v === 'object' && Array.isArray(v.rows);

// ---------- evaluator ----------
const BLANK = null;
const num = (v) => (v === null ? 0 : typeof v === 'boolean' ? +v : typeof v === 'number' ? v : (() => { const n = Number(v); if (Number.isNaN(n)) fail(`Cannot convert "${v}" to a number`); return n; })());
const truthy = (v) => (v === null ? false : typeof v === 'boolean' ? v : typeof v === 'number' ? v !== 0 : fail(`Cannot convert "${v}" to True/False`));
const toText = (v) => (v === null ? '' : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : String(v));
const scalarOf = (v) => {
  if (isTable(v)) {
    if (v.rows.length === 1 && v.cols.length === 1) return v.rows[0][v.cols[0]];
    if (v.rows.length === 0) return BLANK;
    fail('A table of multiple values was supplied where a single value was expected.');
  }
  return v;
};

// ---------- date helpers (ISO yyyy-mm-dd strings) ----------
const parseD = (s) => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return { y, m, d }; };
const fmtD = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
function shiftDate(s, n, unit) {
  const { y, m, d } = parseD(s);
  if (unit === 'DAY') return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
  const months = unit === 'YEAR' ? n * 12 : unit === 'QUARTER' ? n * 3 : n;
  const t = y * 12 + (m - 1) + months;
  const ny = Math.floor(t / 12), nm = (t % 12) + 1;
  return fmtD(ny, nm, Math.min(d, daysIn(ny, nm)));
}
const unitOf = (node) => {
  const u = (node && (node.v || node.name) || '').toString().toUpperCase();
  if (!['DAY', 'MONTH', 'QUARTER', 'YEAR'].includes(u)) fail('Interval must be DAY, MONTH, QUARTER or YEAR');
  return u;
};

export function makeEngine(measures) {
  // measures: { name: expressionString }
  const parsed = {};
  const getMeasure = (name) => {
    const key = Object.keys(measures).find((m) => m.toLowerCase() === name.toLowerCase());
    if (!key) return null;
    if (!parsed[key]) parsed[key] = parse(tokenize(measures[key]));
    return { key, ast: parsed[key] };
  };

  const contextTransition = (env) => {
    // convert every row context into equivalent filters
    let ctx = env.ctx;
    Object.entries(env.rows).forEach(([t, row]) => {
      if (row.__partial) {
        row.__cols.forEach((c) => {
          ctx = removeFilters(ctx, t, [c]);
          ctx = { ...ctx, filters: [...ctx.filters, { table: t, cols: [c], pred: (r) => r[c] === row[c] }] };
        });
      } else {
        ctx = removeFilters(ctx, t, null);
        ctx = { ...ctx, filters: [...ctx.filters, { table: t, cols: colsOf(t), pred: (r) => r === row }] };
      }
    });
    return ctx;
  };

  const evalTable = (n, env) => {
    const v = ev(n, env);
    if (!isTable(v)) fail('A table expression was expected here.');
    return v;
  };

  const iterate = (tblNode, exprNode, env) => {
    const tv = evalTable(tblNode, env);
    return tv.rows.map((row) => {
      const r = tv.partial ? { ...row, __partial: true, __cols: tv.cols } : row;
      return ev(exprNode, { ...env, rows: { ...env.rows, [tv.table]: r } });
    });
  };

  // apply a CALCULATE filter argument to newCtx (evaluated in env)
  const applyFilterArg = (argNode, env, newCtx) => {
    if (argNode.k === 'call' && ['ALL', 'REMOVEFILTERS', 'ALLSELECTED', 'ALLEXCEPT'].includes(argNode.name)) {
      return applyRemoval(argNode, newCtx);
    }
    if (argNode.k === 'call' && argNode.name === 'KEEPFILTERS') {
      const inner = argNode.args[0];
      const tmp = applyFilterArg(inner, env, { ...newCtx, filters: [] });
      return { ...newCtx, filters: [...newCtx.filters, ...tmp.filters] };
    }
    if (argNode.k === 'call' && argNode.name === 'USERELATIONSHIP') return newCtx; // single active relationships only
    // boolean predicate on columns of one table
    const cols = [];
    const walk = (n) => { if (!n || typeof n !== 'object') return; if (n.k === 'col') cols.push(n); Object.values(n).forEach((x) => (Array.isArray(x) ? x.forEach(walk) : typeof x === 'object' && walk(x))); };
    const isBoolExpr = argNode.k === 'bin' || argNode.k === 'in' || (argNode.k === 'call' && argNode.name === 'NOT');
    if (isBoolExpr) {
      walk(argNode);
      const tables = [...new Set(cols.map((c) => c.t))];
      if (tables.length !== 1) fail('CALCULATE filter expressions must reference columns from exactly one table. Use FILTER() for complex conditions.');
      const t = tables[0];
      const cnames = [...new Set(cols.map((c) => c.c))];
      const pred = (row) => truthy(ev(argNode, { ...env, ctx: emptyCtx(), rows: { [t]: row } }));
      let ctx = removeFilters(newCtx, t, cnames);
      return { ...ctx, filters: [...ctx.filters, { table: t, cols: cnames, pred }] };
    }
    // table filter (FILTER(...), VALUES(...), table variable...)
    const tv = evalTable(argNode, env);
    if (tv.partial) {
      const set = new Set(tv.rows.map((r) => JSON.stringify(tv.cols.map((c) => r[c]))));
      // a filter on the marked date column removes every filter on the Date table (like Power BI)
      const isDateCol = MODEL.dateTable && tv.table === MODEL.dateTable.table && tv.cols.includes(MODEL.dateTable.column);
      let ctx = isDateCol ? removeFilters(newCtx, tv.table, null) : removeFilters(newCtx, tv.table, tv.cols);
      return { ...ctx, filters: [...ctx.filters, { table: tv.table, cols: tv.cols, pred: (r) => set.has(JSON.stringify(tv.cols.map((c) => r[c]))) }] };
    }
    const set = new Set(tv.rows);
    let ctx = removeFilters(newCtx, tv.table, null);
    return { ...ctx, filters: [...ctx.filters, { table: tv.table, cols: colsOf(tv.table), pred: (r) => set.has(r) }] };
  };

  const applyRemoval = (n, ctx) => {
    const name = n.name;
    if (name === 'ALLEXCEPT') {
      const t = n.args[0].k === 'ident' ? findTable(n.args[0].v) : fail('ALLEXCEPT needs a table as first argument');
      const keep = n.args.slice(1).map((a) => (a.k === 'col' ? a : fail('ALLEXCEPT columns must be column references')));
      let out = ctx;
      expandedTables(t).forEach((tt) => {
        const keepCols = keep.filter((k) => k.t === tt).map((k) => k.c);
        out = { ...out, filters: out.filters.filter((f) => f.table !== tt || f.cols.every((c) => keepCols.includes(c))) };
      });
      return out;
    }
    let out = ctx;
    if (n.args.length === 0) out = { ...out, filters: [] };
    n.args.forEach((a) => {
      if (a.k === 'col') out = removeFilters(out, a.t, [a.c]);
      else if (a.k === 'ident' && findTable(a.v)) expandedTables(findTable(a.v)).forEach((tt) => { out = removeFilters(out, tt, null); });
      else fail(`${name} expects a table or column`);
    });
    if (name === 'ALLSELECTED') out = { ...out, filters: [...out.filters, ...ctx.selected.filter((s) => !out.filters.includes(s))] };
    return out;
  };

  const distinctCol = (colNode, env, all) => {
    const rows = all ? T[colNode.t] : visibleRows(colNode.t, env.ctx);
    const seen = new Map();
    rows.forEach((r) => { if (!seen.has(r[colNode.c])) seen.set(r[colNode.c], { [colNode.c]: r[colNode.c] }); });
    return { table: colNode.t, cols: [colNode.c], rows: [...seen.values()], partial: true };
  };

  const aggCol = (n, env, fn) => {
    const a = n.args[0];
    if (!a || a.k !== 'col') fail(`${n.name} expects a column reference like Sales[SalesAmount]`);
    const vals = visibleRows(a.t, env.ctx).map((r) => r[a.c]);
    return fn(vals);
  };
  const sum = (v) => { const n = v.filter((x) => x !== null).map(num); return n.length ? n.reduce((s, x) => s + x, 0) : BLANK; };
  const avg = (v) => { const n = v.filter((x) => x !== null).map(num); return n.length ? n.reduce((s, x) => s + x, 0) / n.length : BLANK; };
  const mx = (v) => { const n = v.filter((x) => x !== null); return n.length ? n.reduce((a, b) => (b > a ? b : a)) : BLANK; };
  const mn = (v) => { const n = v.filter((x) => x !== null); return n.length ? n.reduce((a, b) => (b < a ? b : a)) : BLANK; };

  const ev = (n, env) => {
    switch (n.k) {
      case 'lit': return n.v;
      case 'neg': { const v = scalarOf(ev(n.e, env)); return v === null ? BLANK : -num(v); }
      case 'var': {
        let vars = { ...env.vars };
        n.vars.forEach(([name, e]) => { vars = { ...vars, [name.toLowerCase()]: ev(e, { ...env, vars }) }; });
        return ev(n.body, { ...env, vars });
      }
      case 'ident': {
        const v = env.vars[n.v.toLowerCase()];
        if (v !== undefined) return v;
        const t = findTable(n.v);
        if (t) return fullTable(t, visibleRows(t, env.ctx));
        if (n.v.toUpperCase() === 'TRUE') return true;
        if (n.v.toUpperCase() === 'FALSE') return false;
        fail(`Unknown name "${n.v}"`);
        break;
      }
      case 'col': {
        const row = env.rows[n.t];
        if (row && (!row.__partial || row.__cols.includes(n.c))) return row[n.c];
        // implicit lookup via a fact row context to a dim (allowed only with RELATED in real DAX)
        fail(`A single value for column '${n.t}'[${n.c}] cannot be determined. Use an aggregation (SUM, MAX…) or an iterator / RELATED.`);
        break;
      }
      case 'measure': {
        const m = getMeasure(n.name);
        if (!m) fail(`Measure [${n.name}] not found. Define it in the measure list first.`);
        if (env.stack.includes(m.key)) fail(`Circular reference in measure [${m.key}]`);
        return ev(m.ast, { ctx: contextTransition(env), rows: {}, vars: {}, stack: [...env.stack, m.key] });
      }
      case 'in': {
        const v = scalarOf(ev(n.l, env));
        return n.items.some((it) => { const x = scalarOf(ev(it, env)); return x === v || (typeof x === 'string' && typeof v === 'string' && x.toLowerCase() === v.toLowerCase()); });
      }
      case 'bin': {
        if (n.op === '&&') return truthy(scalarOf(ev(n.l, env))) && truthy(scalarOf(ev(n.r, env)));
        if (n.op === '||') return truthy(scalarOf(ev(n.l, env))) || truthy(scalarOf(ev(n.r, env)));
        const a = scalarOf(ev(n.l, env)), b = scalarOf(ev(n.r, env));
        if (n.op === '&') return toText(a) + toText(b);
        if (['=', '<>', '<', '>', '<=', '>='].includes(n.op)) {
          let x = a, y = b;
          if (x === null) x = typeof y === 'string' ? '' : typeof y === 'boolean' ? false : 0;
          if (y === null) y = typeof x === 'string' ? '' : typeof x === 'boolean' ? false : 0;
          let c;
          if (typeof x === 'string' || typeof y === 'string') c = toText(x).toLowerCase().localeCompare(toText(y).toLowerCase());
          else c = num(x) - num(y);
          return { '=': c === 0, '<>': c !== 0, '<': c < 0, '>': c > 0, '<=': c <= 0, '>=': c >= 0 }[n.op];
        }
        if (a === null && b === null) return BLANK;
        const x = num(a), y = num(b);
        switch (n.op) {
          case '+': return x + y;
          case '-': return x - y;
          case '*': return a === null || b === null ? BLANK : x * y;
          case '/': if (y === 0) return x === 0 ? fail('Division 0/0 gives NaN; use DIVIDE()') : Infinity; return a === null ? BLANK : x / y;
          case '^': return x ** y;
          default: fail('Unknown operator');
        }
        break;
      }
      case 'call': return call(n, env);
      case '__tv': return n.tv;
      default: fail('Unsupported expression');
    }
    return BLANK;
  };

  const call = (n, env) => {
    const A = n.args;
    const s = (i) => scalarOf(ev(A[i], env));
    const need = (k) => { if (A.length < k) fail(`${n.name} needs at least ${k} argument(s)`); };
    switch (n.name) {
      case 'SUM': return aggCol(n, env, sum);
      case 'AVERAGE': return aggCol(n, env, avg);
      case 'MIN': if (A.length === 2) { const a = s(0), b = s(1); return a === null ? b : b === null ? a : Math.min(num(a), num(b)); } return aggCol(n, env, mn);
      case 'MAX': if (A.length === 2) { const a = s(0), b = s(1); return a === null ? b : b === null ? a : Math.max(num(a), num(b)); } return aggCol(n, env, mx);
      case 'COUNT': return aggCol(n, env, (v) => v.filter((x) => typeof x === 'number').length || BLANK);
      case 'COUNTA': return aggCol(n, env, (v) => v.filter((x) => x !== null).length || BLANK);
      case 'DISTINCTCOUNT': return aggCol(n, env, (v) => new Set(v).size || BLANK);
      case 'COUNTROWS': { need(1); const tv = evalTable(A[0], env); return tv.rows.length || BLANK; }
      case 'SUMX': case 'AVERAGEX': case 'MAXX': case 'MINX': case 'COUNTX': {
        need(2);
        const vals = iterate(A[0], A[1], env).map(scalarOf);
        return { SUMX: sum, AVERAGEX: avg, MAXX: mx, MINX: mn, COUNTX: (v) => v.filter((x) => x !== null).length || BLANK }[n.name](vals);
      }
      case 'CONCATENATEX': { need(2); const vals = iterate(A[0], A[1], env).map(scalarOf).map(toText); return vals.join(A[2] ? toText(s(2)) : ''); }
      case 'RANKX': {
        need(2);
        const vals = iterate(A[0], A[1], env).map(scalarOf).map((v) => (v === null ? 0 : num(v)));
        const cur = A[2] ? num(s(2)) : num(scalarOf(ev(A[1], env)) ?? 0);
        const asc = A[3] && toText(scalarOf(ev(A[3], env))).toUpperCase() === 'ASC';
        const dense = A[4] && toText(scalarOf(ev(A[4], env))).toUpperCase() === 'DENSE';
        const pool = dense ? [...new Set(vals)] : vals;
        return pool.filter((v) => (asc ? v < cur : v > cur)).length + 1;
      }
      case 'CALCULATE': case 'CALCULATETABLE': {
        need(1);
        let ctx = contextTransition(env);
        const base = { ...env, ctx };
        // removal modifiers first, then filters (all filter args evaluated in the original context)
        const mods = A.slice(1);
        mods.filter((m) => m.k === 'call' && ['ALL', 'REMOVEFILTERS', 'ALLSELECTED', 'ALLEXCEPT'].includes(m.name)).forEach((m) => { ctx = applyFilterArg(m, base, ctx); });
        mods.filter((m) => !(m.k === 'call' && ['ALL', 'REMOVEFILTERS', 'ALLSELECTED', 'ALLEXCEPT'].includes(m.name))).forEach((m) => { ctx = applyFilterArg(m, base, ctx); });
        return ev(A[0], { ...env, ctx, rows: {} });
      }
      case 'FILTER': {
        need(2);
        const tv = evalTable(A[0], env);
        const rows = tv.rows.filter((row) => {
          const r = tv.partial ? { ...row, __partial: true, __cols: tv.cols } : row;
          return truthy(scalarOf(ev(A[1], { ...env, rows: { ...env.rows, [tv.table]: r } })));
        });
        return { ...tv, rows };
      }
      case 'ALL': case 'REMOVEFILTERS': case 'ALLSELECTED': {
        if (!A.length) fail(`${n.name} needs a table or column`);
        const a = A[0];
        if (a.k === 'col') {
          if (n.name === 'ALLSELECTED') return distinctCol(a, { ...env, ctx: { ...emptyCtx(), filters: env.ctx.selected } }, false);
          return distinctCol(a, env, true);
        }
        const t = a.k === 'ident' ? findTable(a.v) : null;
        if (!t) fail(`${n.name} expects a table or column`);
        return fullTable(t, n.name === 'ALLSELECTED' ? visibleRows(t, { ...emptyCtx(), filters: env.ctx.selected }) : T[t]);
      }
      case 'ALLEXCEPT': {
        const t = findTable(A[0].v);
        return fullTable(t, visibleRows(t, applyRemoval(n, env.ctx)));
      }
      case 'VALUES': case 'DISTINCT': {
        need(1);
        if (A[0].k === 'col') return distinctCol(A[0], env, false);
        return evalTable(A[0], env);
      }
      case 'SELECTEDVALUE': {
        need(1); const d = distinctCol(A[0], env, false);
        return d.rows.length === 1 ? d.rows[0][A[0].c] : A[1] ? s(1) : BLANK;
      }
      case 'HASONEVALUE': { need(1); return distinctCol(A[0], env, false).rows.length === 1; }
      case 'ISFILTERED': { need(1); const a = A[0]; return env.ctx.filters.some((f) => f.table === a.t && f.cols.includes(a.c)); }
      case 'RELATED': {
        need(1); const a = A[0]; if (a.k !== 'col') fail('RELATED expects a column');
        const factT = Object.keys(env.rows).find((t) => relTo(t, a.t));
        if (!factT) fail(`RELATED(${a.t}[${a.c}]) needs a row context on a table related to ${a.t} (e.g. inside SUMX(Sales, …) or a calculated column).`);
        const rel = relTo(factT, a.t);
        const dimRow = T[a.t].find((r) => r[rel.toCol] === env.rows[factT][rel.fromCol]);
        return dimRow ? dimRow[a.c] : BLANK;
      }
      case 'RELATEDTABLE': {
        need(1); const t = A[0].k === 'ident' ? findTable(A[0].v) : fail('RELATEDTABLE expects a table');
        return fullTable(t, visibleRows(t, contextTransition(env)));
      }
      case 'TOPN': {
        need(2);
        const k = num(s(0));
        const tv = evalTable(A[1], env);
        if (!A[2]) return { ...tv, rows: tv.rows.slice(0, k) };
        const scored = tv.rows.map((row) => {
          const r = tv.partial ? { ...row, __partial: true, __cols: tv.cols } : row;
          return { row, v: num(scalarOf(ev(A[2], { ...env, rows: { ...env.rows, [tv.table]: r } })) ?? 0) };
        });
        const asc = A[3] && toText(scalarOf(ev(A[3], env))).toUpperCase() === 'ASC';
        scored.sort((a, b) => (asc ? a.v - b.v : b.v - a.v));
        const cutoff = scored[k - 1]?.v;
        return { ...tv, rows: scored.filter((x, i) => i < k || x.v === cutoff).map((x) => x.row) };
      }
      case 'DATESYTD': case 'DATESQTD': case 'DATESMTD': case 'TOTALYTD': case 'TOTALQTD': case 'TOTALMTD': {
        const isTotal = n.name.startsWith('TOTAL');
        const colNode = isTotal ? A[1] : A[0];
        if (!colNode || colNode.k !== 'col') fail(`${n.name} needs a date column like 'Date'[Date]`);
        const vis = visibleRows(colNode.t, env.ctx).map((r) => r[colNode.c]).filter(Boolean).sort();
        let dates = [];
        if (vis.length) {
          const last = vis[vis.length - 1];
          const { y, m } = parseD(last);
          const kind = n.name.slice(-3);
          const start = kind === 'YTD' ? fmtD(y, 1, 1) : kind === 'QTD' ? fmtD(y, Math.floor((m - 1) / 3) * 3 + 1, 1) : fmtD(y, m, 1);
          dates = T[colNode.t].filter((r) => r[colNode.c] >= start && r[colNode.c] <= last);
        }
        const tv = { table: colNode.t, cols: [colNode.c], rows: dates.map((r) => ({ [colNode.c]: r[colNode.c] })), partial: true };
        if (!isTotal) return tv;
        const fake = { k: '__tv', tv };
        return call({ k: 'call', name: 'CALCULATE', args: [A[0], fake] }, env);
      }
      case 'SAMEPERIODLASTYEAR': case 'DATEADD': case 'PARALLELPERIOD': case 'PREVIOUSMONTH': case 'PREVIOUSYEAR': case 'PREVIOUSQUARTER': case 'NEXTMONTH': {
        const colNode = A[0];
        if (!colNode || colNode.k !== 'col') fail(`${n.name} needs a date column like 'Date'[Date]`);
        const vis = visibleRows(colNode.t, env.ctx).map((r) => r[colNode.c]).filter(Boolean).sort();
        let set = new Set();
        if (vis.length) {
          if (n.name === 'SAMEPERIODLASTYEAR') set = new Set(vis.map((d) => shiftDate(d, -1, 'YEAR')));
          else if (n.name === 'DATEADD') { const k = num(s(1)); const u = unitOf(A[2]); set = new Set(vis.map((d) => shiftDate(d, k, u))); }
          else {
            // whole-period functions
            let k, u;
            if (n.name === 'PARALLELPERIOD') { k = num(s(1)); u = unitOf(A[2]); }
            else { u = n.name.replace(/PREVIOUS|NEXT/, ''); k = n.name.startsWith('NEXT') ? 1 : -1; }
            const first = parseD(shiftDate(vis[0], k, u)), last = parseD(shiftDate(vis[vis.length - 1], k, u));
            let from, to;
            if (u === 'YEAR') { from = fmtD(first.y, 1, 1); to = fmtD(last.y, 12, 31); }
            else if (u === 'QUARTER') { const fq = Math.floor((first.m - 1) / 3) * 3 + 1, lq = Math.floor((last.m - 1) / 3) * 3 + 3; from = fmtD(first.y, fq, 1); to = fmtD(last.y, lq, daysIn(last.y, lq)); }
            else if (u === 'MONTH') {
              const a = n.name === 'PARALLELPERIOD' ? first : parseD(shiftDate(vis[0], k, 'MONTH'));
              const b = n.name === 'PARALLELPERIOD' ? last : a;
              from = fmtD(a.y, a.m, 1); to = fmtD(b.y, b.m, daysIn(b.y, b.m));
            } else { from = fmtD(first.y, first.m, first.d); to = fmtD(last.y, last.m, last.d); }
            T[colNode.t].forEach((r) => { if (r[colNode.c] >= from && r[colNode.c] <= to) set.add(r[colNode.c]); });
          }
        }
        const rows = T[colNode.t].filter((r) => set.has(r[colNode.c])).map((r) => ({ [colNode.c]: r[colNode.c] }));
        return { table: colNode.t, cols: [colNode.c], rows, partial: true };
      }
      case 'DATESINPERIOD': {
        const colNode = A[0]; if (!colNode || colNode.k !== 'col') fail('DATESINPERIOD needs a date column');
        const startD = toText(s(1)); const k = num(s(2)); const u = unitOf(A[3]);
        if (!startD) return { table: colNode.t, cols: [colNode.c], rows: [], partial: true };
        const other = shiftDate(startD, k, u);
        const [lo, hi] = k < 0 ? [shiftDate(other, 1, 'DAY'), startD] : [startD, shiftDate(other, -1, 'DAY')];
        const rows = T[colNode.t].filter((r) => r[colNode.c] >= lo && r[colNode.c] <= hi).map((r) => ({ [colNode.c]: r[colNode.c] }));
        return { table: colNode.t, cols: [colNode.c], rows, partial: true };
      }
      case 'LOOKUPVALUE': {
        if (A.length < 3) fail('LOOKUPVALUE(result_column, search_column, search_value, …)');
        const res = A[0]; if (res.k !== 'col') fail('LOOKUPVALUE first argument must be a column');
        const pairs = []; for (let i = 1; i + 1 < A.length; i += 2) { if (A[i].k !== 'col') fail('LOOKUPVALUE search arguments must be columns'); pairs.push([A[i].c, s(i + 1)]); }
        const hits = [...new Set(T[res.t].filter((r) => pairs.every(([c, v]) => r[c] === v || (typeof v === 'string' && String(r[c]).toLowerCase() === v.toLowerCase()))).map((r) => r[res.c]))];
        if (hits.length > 1) fail('LOOKUPVALUE found multiple different values');
        return hits.length ? hits[0] : (A.length % 2 === 0 ? s(A.length - 1) : BLANK);
      }
      case 'DIVIDE': { need(2); const a = s(0), b = s(1); if (b === null || num(b) === 0) return A[2] ? s(2) : BLANK; return a === null ? BLANK : num(a) / num(b); }
      case 'IF': { need(2); return truthy(s(0)) ? s(1) : A[2] ? s(2) : BLANK; }
      case 'SWITCH': {
        need(3); const v = s(0);
        for (let i = 1; i + 1 < A.length; i += 2) { const x = s(i); if (x === v || (typeof x === 'string' && typeof v === 'string' && x.toLowerCase() === v.toLowerCase())) return s(i + 1); }
        return A.length % 2 === 0 ? s(A.length - 1) : BLANK;
      }
      case 'AND': need(2); return truthy(s(0)) && truthy(s(1));
      case 'OR': need(2); return truthy(s(0)) || truthy(s(1));
      case 'NOT': need(1); return !truthy(s(0));
      case 'TRUE': return true;
      case 'FALSE': return false;
      case 'BLANK': return BLANK;
      case 'ISBLANK': need(1); return s(0) === null;
      case 'COALESCE': { for (let i = 0; i < A.length; i++) { const v = s(i); if (v !== null) return v; } return BLANK; }
      case 'ROUND': need(1); { const v = s(0); if (v === null) return BLANK; const f = 10 ** num(A[1] ? s(1) : 0); return Math.round(num(v) * f) / f; }
      case 'ABS': need(1); return s(0) === null ? BLANK : Math.abs(num(s(0)));
      case 'INT': need(1); return Math.floor(num(s(0)));
      case 'UPPER': return toText(s(0)).toUpperCase();
      case 'LOWER': return toText(s(0)).toLowerCase();
      case 'LEN': return toText(s(0)).length;
      case 'LEFT': return toText(s(0)).slice(0, A[1] ? num(s(1)) : 1);
      case 'CONCATENATE': return toText(s(0)) + toText(s(1));
      case 'FORMAT': {
        need(2); const v = s(0); const f = toText(s(1));
        if (v === null) return '';
        if (/%/.test(f)) return (num(v) * 100).toFixed((/\.(0+)/.exec(f) || [, ''])[1].length) + '%';
        const dec = (/\.(0+)/.exec(f) || [, ''])[1].length;
        return num(v).toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      }
      default: fail(`Function ${n.name}() is not supported in this lab.`);
    }
    return BLANK;
  };

  const evaluateMeasure = (name, filters, selected) => {
    const m = getMeasure(name);
    if (!m) fail(`Measure [${name}] not found`);
    return ev(m.ast, { ctx: { filters, selected }, rows: {}, vars: {}, stack: [m.key] });
  };
  return { evaluateMeasure };
}

export function validate(expr) {
  parse(tokenize(expr));
}

export const SUPPORTED_DAX = 'TOTALYTD, TOTALQTD, TOTALMTD, DATESYTD, DATESQTD, DATESMTD, SAMEPERIODLASTYEAR, DATEADD, PARALLELPERIOD, PREVIOUSMONTH, PREVIOUSQUARTER, PREVIOUSYEAR, DATESINPERIOD, LOOKUPVALUE, SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, COUNTROWS, DISTINCTCOUNT, SUMX, AVERAGEX, MINX, MAXX, COUNTX, CONCATENATEX, RANKX, TOPN, CALCULATE, CALCULATETABLE, FILTER, ALL, ALLEXCEPT, ALLSELECTED, REMOVEFILTERS, KEEPFILTERS, VALUES, DISTINCT, SELECTEDVALUE, HASONEVALUE, ISFILTERED, RELATED, RELATEDTABLE, DIVIDE, IF, SWITCH, AND, OR, NOT, IN, BLANK, ISBLANK, COALESCE, ROUND, ABS, INT, FORMAT, UPPER, LOWER, LEN, LEFT, VAR / RETURN';

export function filtersFor(selections) {
  // selections: [{table, col, value}]
  return selections.map((s) => ({ table: s.table, cols: [s.col], pred: (r) => r[s.col] === s.value }));
}
