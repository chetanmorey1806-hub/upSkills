// Grades "Day Task" answers in the browser and explains every mistake.
// Task types: mcq, multi, fill, output, written, code (lang: html | css | dom | jsx | js | python | sql | mysql | tsql | mongo | excel | dax | express)
// gradeTask(task, answer) -> { ok, checks: [{ ok, msg }], got?, expected?, error? }
import { runPython, runSQL, runPyExec, ensurePython } from '../components/pyodideRunner.js';
import { buildWebDoc, buildReactDoc } from '../components/playgroundRuntime.js';
import { runChallenge } from './mongoChallenge.js';
import { evaluateFormula, computeSheet, isErr, display } from './excel.js';
import { makeEngine, filtersFor } from './dax.js';
import { MODEL } from './daxModel.js';
import { runApiTests, createBrowserExec } from './apiTests.js';
import { WB_ENGINE_PY } from './wbEngine.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Python jobs share one worker: run them one at a time so their outputs never mix.
let pyQueue = Promise.resolve();
export const pyLock = (fn) => { const p = pyQueue.then(fn, fn); pyQueue = p.catch(() => {}); return p; };
const s = (v) => (v == null ? '' : String(v));
const squash = (v) => s(v).replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim();
const normLines = (v) => s(v).replace(/\r/g, '').split('\n').map((l) => l.replace(/[ \t]+$/g, '').replace(/^[ \t]+/, '')).join('\n').replace(/\n+$/g, '').replace(/^\n+/g, '');
const show = (v) => { try { return typeof v === 'string' ? JSON.stringify(v) : JSON.stringify(v); } catch { return String(v); } };
const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.keys(x).sort().reduce((o, kk) => { o[kk] = x[kk]; return o; }, {}) : typeof x === 'number' ? Math.round(x * 1e9) / 1e9 : x));
const same = (a, b) => canon(a) === canon(b);
const res = (ok, checks = [], extra = {}) => ({ ok, checks, ...extra });

/* ------------------------------ simple types ------------------------------ */
function gradeMcq(t, a) {
  const ok = a === t.answer;
  return res(ok, [], { got: a == null ? '(no answer)' : t.options[a], expected: t.options[t.answer] });
}
function gradeMulti(t, a = []) {
  const want = [...t.answers].sort().join(',');
  const got = [...(a || [])].sort().join(',');
  const missing = t.answers.filter((i) => !(a || []).includes(i)).map((i) => t.options[i]);
  const extra = (a || []).filter((i) => !t.answers.includes(i)).map((i) => t.options[i]);
  const checks = [];
  if (missing.length) checks.push({ ok: false, msg: `You missed: ${missing.join(' · ')}` });
  if (extra.length) checks.push({ ok: false, msg: `Not correct: ${extra.join(' · ')}` });
  return res(want === got, checks, { expected: t.answers.map((i) => t.options[i]).join(' · ') });
}
function gradeFill(t, a) {
  const cs = !!t.caseSensitive;
  const n = (x) => (cs ? squash(x) : squash(x).toLowerCase()).replace(/\s*([(){}[\];,=<>:])\s*/g, '$1');
  const got = n(a);
  if (!got) return res(false, [{ ok: false, msg: 'No answer given.' }], { expected: t.accept?.[0] });
  const ok = (t.accept || []).some((x) => n(x) === got) || (t.acceptRegex || []).some((r) => new RegExp(r, cs ? '' : 'i').test(squash(a)));
  return res(ok, [], { got: s(a), expected: t.accept?.[0] });
}
function gradeOutput(t, a) {
  const ok = normLines(a) === normLines(t.expected);
  return res(ok, ok ? [] : [{ ok: false, msg: normLines(a) ? 'Your output does not match the real output (check spaces, line order and capital letters).' : 'No answer given.' }], { got: s(a), expected: t.expected });
}
function gradeWritten(t, a) {
  const text = s(a);
  const low = text.toLowerCase();
  const words = (text.trim().match(/\S+/g) || []).length;
  const checks = [];
  if (t.minWords && words < t.minWords) checks.push({ ok: false, msg: `Write at least ${t.minWords} words (you wrote ${words}).` });
  if (t.maxWords && words > t.maxWords) checks.push({ ok: false, msg: `Keep it under ${t.maxWords} words (you wrote ${words}).` });
  for (const r of t.rules || []) {
    let ok = true;
    if (r.any) ok = r.any.some((k) => low.includes(String(k).toLowerCase()));
    if (ok && r.all) ok = r.all.every((k) => low.includes(String(k).toLowerCase()));
    if (ok && r.regex) ok = new RegExp(r.regex, r.flags ?? 'i').test(text);
    if (ok && r.not) ok = !r.not.some((k) => low.includes(String(k).toLowerCase()));
    checks.push({ ok, msg: r.msg });
  }
  return res(checks.every((c) => c.ok), checks, { got: text });
}

/* --------------------------- DOM (html/css/dom/jsx) --------------------------- */
async function renderFrame(html, { react = false, timeout = 12000 } = {}) {
  const f = document.createElement('iframe');
  f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-modals');
  f.style.cssText = 'position:fixed;left:-10000px;top:0;width:1024px;height:768px;border:0;visibility:hidden';
  const errors = [];
  const onMsg = (e) => { if (e.source === f.contentWindow && e.data && e.data.__pg && e.data.level === 'error') errors.push(e.data.text); };
  window.addEventListener('message', onMsg);
  document.body.appendChild(f);
  await new Promise((r) => { f.onload = r; f.srcdoc = html; setTimeout(r, timeout); });
  if (react) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      const root = f.contentDocument?.getElementById('root');
      if (errors.length || (root && root.childElementCount)) break;
      await sleep(150);
    }
  } else await sleep(80);
  await sleep(30);
  return { frame: f, errors, stop: () => window.removeEventListener('message', onMsg) };
}
function computedOf(win, doc, tag, prop, value) {
  const el = doc.createElement(tag || 'div');
  el.style.setProperty(prop, value);
  doc.body.appendChild(el);
  const v = win.getComputedStyle(el).getPropertyValue(prop);
  el.remove();
  return v;
}
async function runActions(win, doc, actions = []) {
  for (const a of actions) {
    if (a.click) { const el = doc.querySelector(a.click); if (!el) return `Could not find "${a.click}" to click.`; el.click(); }
    if (a.input) {
      const [sel, val] = a.input; const el = doc.querySelector(sel); if (!el) return `Could not find "${sel}" to type into.`;
      const proto = el.tagName === 'TEXTAREA' ? win.HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? win.HTMLSelectElement.prototype : win.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, val);
      el.dispatchEvent(new win.Event('input', { bubbles: true })); el.dispatchEvent(new win.Event('change', { bubbles: true }));
    }
    if (a.check) { const el = doc.querySelector(a.check); if (el) el.click(); }
    if (a.submit) { const el = doc.querySelector(a.submit); if (el) el.dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true })); }
    await sleep(a.wait || 80);
  }
  return null;
}
export function runDomChecks(win, doc, checks = []) {
  return checks.map((c) => {
    const els = c.sel ? [...doc.querySelectorAll(c.sel)] : [doc.documentElement];
    const fail = (why) => ({ ok: false, msg: `${c.msg}${why ? ` (${why})` : ''}` });
    if (c.notExists) return els.length ? fail(`found ${els.length} "${c.sel}"`) : { ok: true, msg: c.msg };
    if (c.count != null && els.length !== c.count) return fail(`expected ${c.count} × "${c.sel}", found ${els.length}`);
    if (c.min != null && els.length < c.min) return fail(`expected at least ${c.min} × "${c.sel}", found ${els.length}`);
    if (c.max != null && els.length > c.max) return fail(`expected at most ${c.max} × "${c.sel}", found ${els.length}`);
    if (!els.length) return fail(`no element matches "${c.sel}"`);
    const el = els[c.index || 0];
    if (c.nonEmpty && !(el.textContent || '').trim()) return fail(`"${c.sel}" is empty`);
    if (c.text != null) {
      const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!txt.toLowerCase().includes(String(c.text).toLowerCase())) return fail(`text is "${txt.slice(0, 60)}"`);
    }
    if (c.textEq != null) {
      const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (txt !== String(c.textEq)) return fail(`text is "${txt.slice(0, 60)}"`);
    }
    if (c.attr) {
      const v = el.getAttribute(c.attr.name);
      if (v == null) return fail(`missing attribute ${c.attr.name}`);
      if (c.attr.value != null && v.trim() !== String(c.attr.value)) return fail(`${c.attr.name}="${v}"`);
      if (c.attr.includes != null && !v.toLowerCase().includes(String(c.attr.includes).toLowerCase())) return fail(`${c.attr.name}="${v}"`);
    }
    if (c.prop) {
      const [k, want] = Object.entries(c.prop)[0];
      if (!same(el[k], want)) return fail(`${k} is ${show(el[k])}`);
    }
    if (c.style) {
      const cs = win.getComputedStyle(el);
      for (const [prop, want] of Object.entries(c.style)) {
        const got = cs.getPropertyValue(prop).trim();
        const exp = computedOf(win, doc, el.tagName.toLowerCase(), prop, want).trim();
        if (got !== exp && got !== String(want)) return fail(`${prop} is ${got}`);
      }
    }
    return { ok: true, msg: c.msg };
  });
}
// Student code runs in a same-origin frame (so checks can read its DOM). Give it its own in-memory
// localStorage/sessionStorage so practice code can never read or wipe the app's real data (progress, login).
const SAFE_STORAGE = `<script>(function(){function mk(){var d={};return{getItem:function(k){k=String(k);return Object.prototype.hasOwnProperty.call(d,k)?d[k]:null},setItem:function(k,v){d[String(k)]=String(v)},removeItem:function(k){delete d[String(k)]},clear:function(){d={}},key:function(i){return Object.keys(d)[i]||null},get length(){return Object.keys(d).length}}}try{Object.defineProperty(window,'localStorage',{value:mk(),configurable:true});Object.defineProperty(window,'sessionStorage',{value:mk(),configurable:true})}catch(e){}})();<\/script>`;
const withSafeStorage = (html) => (/<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + SAFE_STORAGE) : SAFE_STORAGE + html);

async function gradeDom(t, code) {
  let html;
  if (t.lang === 'html') html = /<html|<!doctype/i.test(code) ? code : buildWebDoc({ html: code, css: t.css || '', libs: t.libs });
  else if (t.lang === 'css') html = buildWebDoc({ html: t.html || '', css: code, libs: t.libs });
  else if (t.lang === 'dom') html = buildWebDoc({ html: t.html || '', css: t.css || '', js: code, libs: t.libs });
  else html = buildReactDoc({ jsx: code, css: t.css || '' });
  const { frame, errors, stop } = await renderFrame(withSafeStorage(html), { react: t.lang === 'jsx' });
  try {
    const win = frame.contentWindow, doc = frame.contentDocument;
    const actErr = await runActions(win, doc, t.actions);
    if (actErr) return res(false, [{ ok: false, msg: actErr }]);
    if (t.lang === 'jsx') await sleep(120);
    const checks = runDomChecks(win, doc, t.checks);
    if (errors.length) checks.unshift({ ok: false, msg: `Your code has an error: ${errors[0]}` });
    return res(checks.every((c) => c.ok), checks);
  } finally { stop(); frame.remove(); }
}

/* ----------------------------------- JS ----------------------------------- */
const JS_WORKER = `
const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) && !(x instanceof Map) && !(x instanceof Set) ? Object.keys(x).sort().reduce((o, kk) => { o[kk] = x[kk]; return o; }, {}) : x instanceof Map ? Object.fromEntries(x) : x instanceof Set ? [...x] : typeof x === 'number' ? Math.round(x * 1e9) / 1e9 : x === undefined ? '__undefined__' : x));
onmessage = async (e) => {
  const { code, tests } = e.data; const out = [];
  for (const t of tests) {
    const logs = []; const con = { log: (...a) => logs.push(a.map((x) => typeof x === 'string' ? x : canon(x)).join(' ')), error: (...a) => logs.push(a.join(' ')), warn: (...a) => logs.push(a.join(' ')), info: (...a) => logs.push(a.join(' ')) };
    try {
      const fn = new Function('console', code + '\\n;return (' + (t.call || 'undefined') + ');');
      let v = fn(con); if (v && typeof v.then === 'function') v = await v;
      if (t.log != null) { const got = logs.join('\\n').trim(); out.push({ ok: got === String(t.log).trim(), got: got, call: t.call || 'console output' }); }
      else out.push({ ok: canon(v) === canon(t.expect), got: canon(v), call: t.call });
    } catch (err) { out.push({ ok: false, error: (err && err.name ? err.name + ': ' : '') + (err && err.message || err), call: t.call }); }
  }
  postMessage(out);
};`;
function runJs(code, tests, ms = 4000) {
  return new Promise((resolve) => {
    const w = new Worker(URL.createObjectURL(new Blob([JS_WORKER], { type: 'text/javascript' })));
    const timer = setTimeout(() => { w.terminate(); resolve({ timeout: true }); }, ms);
    w.onmessage = (e) => { clearTimeout(timer); w.terminate(); resolve({ results: e.data }); };
    w.onerror = (e) => { clearTimeout(timer); w.terminate(); resolve({ error: e.message }); };
    w.postMessage({ code, tests });
  });
}
async function gradeJs(t, code) {
  const r = await runJs(code, t.tests);
  if (r.timeout) return res(false, [{ ok: false, msg: 'Time limit exceeded: is there an infinite loop?' }]);
  if (r.error) return res(false, [{ ok: false, msg: `Your code has an error: ${r.error}` }]);
  const checks = r.results.map((x, i) => {
    const tt = t.tests[i];
    const label = tt.msg || (tt.log != null ? 'Console output' : `${tt.call}`);
    if (x.error) return { ok: false, msg: `${label} → error: ${x.error}` };
    return x.ok ? { ok: true, msg: `${label} ✓` } : { ok: false, msg: `${label} → got ${x.got}, expected ${tt.log != null ? JSON.stringify(String(tt.log)) : JSON.stringify(tt.expect)}` };
  });
  return res(checks.every((c) => c.ok), checks);
}

/* --------------------------------- Python --------------------------------- */
const PY_HARNESS = (tests, stdin) => `
import json, io, sys, contextlib, traceback
TESTS = json.loads(${JSON.stringify(JSON.stringify(tests))})
def _canon(v):
    if isinstance(v, (set, frozenset)): return sorted(_canon(x) for x in v)
    if isinstance(v, tuple): return [_canon(x) for x in v]
    if isinstance(v, list): return [_canon(x) for x in v]
    if isinstance(v, dict): return {str(k): _canon(x) for k, x in v.items()}
    if isinstance(v, float): return round(v, 9)
    return v
src = open('student.py').read()
ns = {'__name__': 'student'}
buf = io.StringIO()
sys.stdin = io.StringIO(${JSON.stringify(stdin || '')})
try:
    with contextlib.redirect_stdout(buf):
        exec(compile(src, 'student.py', 'exec'), ns)
    load_err = None
except Exception as e:
    load_err = type(e).__name__ + ': ' + str(e)
out = buf.getvalue()
res = []
for t in TESTS:
    if load_err and 'call' in t:
        res.append({'ok': False, 'error': load_err}); continue
    if 'stdout' in t:
        got = '\\n'.join(l.rstrip() for l in out.strip().splitlines())
        want = '\\n'.join(l.rstrip() for l in str(t['stdout']).strip().splitlines())
        res.append({'ok': got == want and not load_err, 'got': got if not load_err else load_err}); continue
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            v = eval(t['call'], ns)
        g = _canon(v)
        res.append({'ok': json.dumps(g, sort_keys=True, default=str) == json.dumps(_canon(t['expect']), sort_keys=True, default=str), 'got': json.dumps(g, default=str)})
    except Exception as e:
        res.append({'ok': False, 'error': type(e).__name__ + ': ' + str(e)})
print('##RES ' + json.dumps(res))
`;
async function gradePython(t, code) {
  let text = '', err = '';
  await pyLock(() => runPython({ files: { 'main.py': PY_HARNESS(t.tests, t.stdin), 'student.py': code } }, (m) => {
    if (m.type === 'out') text += m.text; if (m.type === 'err') err += m.text; if (m.type === 'done' && m.error) err += m.error;
  }, 20000));
  const line = text.split('\n').find((l) => l.startsWith('##RES '));
  if (!line) return res(false, [{ ok: false, msg: `Your code could not run: ${(err || 'unknown error').trim().split('\n').slice(-1)[0]}` }]);
  const results = JSON.parse(line.slice(6));
  const checks = results.map((x, i) => {
    const tt = t.tests[i];
    const label = tt.msg || (tt.stdout != null ? 'Program output' : tt.call);
    if (x.error) return { ok: false, msg: `${label} → error: ${x.error}` };
    return x.ok ? { ok: true, msg: `${label} ✓` } : { ok: false, msg: `${label} → got ${tt.stdout != null ? JSON.stringify(x.got) : x.got}, expected ${tt.stdout != null ? JSON.stringify(String(tt.stdout)) : JSON.stringify(tt.expect)}` };
  });
  return res(checks.every((c) => c.ok), checks);
}

/* ----------------------------------- SQL ----------------------------------- */
async function sqliteRun(setup, query) {
  let data = null;
  await pyLock(() => runSQL({ setup, query }, (m) => { if (m.type === 'sql') data = m.data; if (m.type === 'done' && m.error) data = { error: m.error, results: [] }; }));
  return data || { error: 'No result' };
}
let wbReady = null;
async function wbRun(dialect, setup, query) {
  if (!wbReady) wbReady = (async () => { await ensurePython(); await runPyExec({ code: WB_ENGINE_PY + '\n"ok"', packages: ['sqlite3'] }); })();
  await wbReady;
  const prefix = dialect === 'tsql' ? 'CREATE DATABASE practice;\nGO\nUSE practice;\nGO\n' : 'CREATE DATABASE IF NOT EXISTS practice;\nUSE practice;\n';
  const store = dialect === 'tsql' ? 'task_tsql' : 'task_mysql';
  return pyLock(async () => {
  await runPyExec({ code: `wb_select_store('${store}'); wb_reset(); _current['dialect'] = '${dialect === 'tsql' ? 'tsql' : 'mysql'}'; wb_run(__s)`, vars: { __s: prefix + (setup || '') } });
  const raw = await runPyExec({ code: `wb_select_store('${store}'); wb_run(__q)`, vars: { __q: query } });
  const r = JSON.parse(raw);
  const err = r.results.find((x) => x.type === 'error');
  const rows = [...r.results].reverse().find((x) => x.type === 'rows');
  return { error: err?.message, columns: rows?.columns, rows: rows?.rows, results: r.results };
  });
}
async function runAnySql(t, q) {
  if (t.lang === 'sql') {
    const d = await sqliteRun(t.setup || '', q);
    const rows = [...(d.results || [])].reverse().find((x) => x.columns);
    return { error: d.error, columns: rows?.columns, rows: rows?.rows };
  }
  return wbRun(t.lang, t.setup, q);
}
async function gradeSql(t, code) {
  if (!squash(code)) return res(false, [{ ok: false, msg: 'No query written.' }]);
  const mine = await runAnySql(t, code);
  if (mine.error) return res(false, [{ ok: false, msg: `SQL error: ${mine.error}` }]);
  const ref = await runAnySql(t, t.solution);
  if (t.check) {
    // write tasks: compare the data after running the statements
    const a = await runAnySql(t, `${code}\n;\n${t.check}`);
    const b = await runAnySql(t, `${t.solution}\n;\n${t.check}`);
    const ok = same(a.rows, b.rows);
    return res(ok, [{ ok, msg: ok ? 'The data is correct after your statements.' : 'After your statements the table data is different from the expected result.' }], { got: fmtRows(a), expected: fmtRows(b) });
  }
  if (!mine.rows) return res(false, [{ ok: false, msg: 'Your statements did not return any rows. The last statement must be a SELECT.' }]);
  const norm = (r) => (r || []).map((row) => row.map((v) => (typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v == null ? null : String(v))));
  const a = norm(mine.rows), b = norm(ref.rows);
  const ok = t.ordered ? same(a, b) : same([...a].map(canon).sort(), [...b].map(canon).sort());
  const checks = [];
  if (!ok) {
    if (a.length !== b.length) checks.push({ ok: false, msg: `Your query returned ${a.length} row(s); expected ${b.length}.` });
    else if ((mine.columns || []).length !== (ref.columns || []).length) checks.push({ ok: false, msg: `Your query returned ${(mine.columns || []).length} column(s); expected ${(ref.columns || []).length}.` });
    else checks.push({ ok: false, msg: t.ordered ? 'The rows or their ORDER are different from the expected result.' : 'Some values are different from the expected result.' });
  }
  return res(ok, checks, { got: fmtRows(mine), expected: fmtRows(ref) });
}
const fmtRows = (r) => (r?.rows ? [r.columns?.join(' | '), ...r.rows.slice(0, 12).map((x) => x.map((v) => (v == null ? 'NULL' : v)).join(' | '))].filter(Boolean).join('\n') + (r.rows.length > 12 ? `\n… ${r.rows.length} rows` : '') : '');

/* --------------------------- Mongo / Excel / DAX / API --------------------------- */
function gradeMongo(t, code) {
  const r = runChallenge({ dataset: t.dataset || 'shop', solution: t.solution, check: t.check, ordered: t.ordered }, code);
  return res(r.ok, r.ok ? [] : [{ ok: false, msg: r.message }], { got: r.got, expected: r.expected });
}
function gradeExcel(t, formula) {
  const f = s(formula).trim().replace(/^=/, '');
  if (!f) return res(false, [{ ok: false, msg: 'No formula written.' }]);
  const sheet = computeSheet(t.grid || {});
  const mine = evaluateFormula(f, sheet.get);
  const ref = evaluateFormula(s(t.solution).replace(/^=/, ''), sheet.get);
  if (mine.error) return res(false, [{ ok: false, msg: `Formula error: ${mine.error}` }]);
  const a = mine.value, b = ref.value;
  const num = (v) => (typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v);
  const ok = !isErr(a) && (Array.isArray(a) || Array.isArray(b) ? same(a, b) : typeof a === 'string' && typeof b === 'string' ? a.toLowerCase() === b.toLowerCase() : num(a) === num(b));
  return res(ok, ok ? [] : [{ ok: false, msg: isErr(a) ? `Your formula returns ${display(a)}.` : `Your formula returns ${display(a)}, expected ${display(b)}.` }], { got: `=${f} → ${display(a)}`, expected: `${t.solution} → ${display(b)}` });
}
function gradeDax(t, expr) {
  // accept both "Total Sales = SUM(...)" and just "SUM(...)"
  const m = s(expr).match(/^\s*([^=(]+?)\s*=\s*([\s\S]+)$/);
  const e = (m && !/[()]/.test(m[1]) ? m[2] : s(expr)).trim();
  if (!e) return res(false, [{ ok: false, msg: 'No DAX expression written.' }]);
  let eng;
  try { eng = makeEngine({ ...(t.measures || {}), __you: e, __ref: t.solution }); eng.evaluateMeasure('__you', [], []); } catch (err) { return res(false, [{ ok: false, msg: `DAX error: ${err.message}` }]); }
  const ctxs = [[]];
  [['Product', 'Category'], ['Customer', 'City'], ['Date', 'Year']].forEach(([tb, col]) => {
    [...new Set(MODEL.tables[tb].map((r) => r[col]))].slice(0, 6).forEach((v) => ctxs.push(filtersFor([{ table: tb, col, value: v }])));
  });
  for (const f of ctxs) {
    let a, b;
    try { a = eng.evaluateMeasure('__you', f, []); } catch (err) { return res(false, [{ ok: false, msg: `DAX error: ${err.message}` }]); }
    b = eng.evaluateMeasure('__ref', f, []);
    const n = (v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v);
    if (n(a) !== n(b)) return res(false, [{ ok: false, msg: `For ${f.length ? 'one filter context (a slicer selection)' : 'the grand total'} your measure returns ${show(a)} but the expected value is ${show(b)}.` }]);
  }
  return res(true, [{ ok: true, msg: 'Correct in every filter context.' }]);
}
let apiExec = null;
async function gradeExpress(t, code) {
  if (!apiExec) apiExec = createBrowserExec();
  const r = await runApiTests(code, t.tests, apiExec);
  const checks = r.map((x) => ({ ok: x.status === 'PASS', msg: x.status === 'PASS' ? `${x.name} ✓` : `${x.name} → ${x.msg.replace(/\n/g, ' ')}` }));
  return res(checks.every((c) => c.ok), checks);
}

/* --------------------------------- dispatch --------------------------------- */
export async function gradeTask(t, answer) {
  try {
    switch (t.type) {
      case 'mcq': return gradeMcq(t, answer);
      case 'multi': return gradeMulti(t, answer);
      case 'fill': return gradeFill(t, answer);
      case 'output': return gradeOutput(t, answer);
      case 'written': return gradeWritten(t, answer);
      case 'code': {
        const code = s(answer);
        if (!code.trim() || code.trim() === s(t.starter).trim()) return res(false, [{ ok: false, msg: 'You have not written any code for this task yet.' }]);
        if (['html', 'css', 'dom', 'jsx'].includes(t.lang)) return await gradeDom(t, code);
        if (t.lang === 'js') return await gradeJs(t, code);
        if (t.lang === 'python') return await gradePython(t, code);
        if (['sql', 'mysql', 'tsql'].includes(t.lang)) return await gradeSql(t, code);
        if (t.lang === 'mongo') return gradeMongo(t, code);
        if (t.lang === 'excel') return gradeExcel(t, code);
        if (t.lang === 'dax') return gradeDax(t, code);
        if (t.lang === 'express') return await gradeExpress(t, code);
        return res(false, [{ ok: false, msg: `Unknown language ${t.lang}` }]);
      }
      default: return res(false, [{ ok: false, msg: `Unknown task type ${t.type}` }]);
    }
  } catch (e) {
    return res(false, [{ ok: false, msg: `Could not check this task: ${e.message}` }]);
  }
}

// The answer that must pass (used by the verifier and "show solution").
export function correctAnswer(t) {
  if (t.type === 'mcq') return t.answer;
  if (t.type === 'multi') return t.answers;
  if (t.type === 'fill') return t.accept?.[0] ?? '';
  if (t.type === 'output') return t.expected;
  if (t.type === 'written') return t.sample;
  return t.solution;
}
export const NEEDS_PYTHON = (t) => t.type === 'code' && ['python', 'sql', 'mysql', 'tsql'].includes(t.lang);
