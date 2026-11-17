// Runs Python (and SQLite via Python's sqlite3) inside a Web Worker using Pyodide (WebAssembly).
// Everything executes in the student's browser sandbox — nothing runs on the server.
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

const WORKER_SRC = `
importScripts('${PYODIDE_URL}pyodide.js');
let py = null;
const ready = (async () => {
  py = await loadPyodide({ indexURL: '${PYODIDE_URL}' });
  postMessage({ type: 'ready', version: py.version });
})().catch((e) => postMessage({ type: 'fatal', text: String(e) }));

let outBytes = [], errBytes = [];
const dec = new TextDecoder();
function flush(id) {
  if (outBytes.length) { postMessage({ type: 'out', id, text: dec.decode(new Uint8Array(outBytes)) }); outBytes = []; }
  if (errBytes.length) { postMessage({ type: 'err', id, text: dec.decode(new Uint8Array(errBytes)) }); errBytes = []; }
}

onmessage = async (e) => {
  await ready;
  const msg = e.data;
  const id = msg.id;
  const t0 = performance.now();
  if (!py) { postMessage({ type: 'done', id, error: 'Python failed to load' }); return; }
  py.setStdout({ raw: (c) => { outBytes.push(c); if (c === 10 && outBytes.length > 2000) flush(id); } });
  py.setStderr({ raw: (c) => { errBytes.push(c); } });
  const lines = String(msg.stdin || '').split('\\n');
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  let li = 0;
  py.setStdin({ stdin: () => {
    flush(id);
    if (li < lines.length) { const v = lines[li++]; postMessage({ type: 'in', id, text: v + '\\n' }); return v + '\\n'; }
    postMessage({ type: 'err', id, text: '\\n[No more input: add values in the Input box]\\n' });
    return null;
  } });
  try {
    if (msg.mode === 'python') {
      const dir = '/home/pyodide/proj_' + id;
      py.FS.mkdirTree(dir);
      for (const [n, src] of Object.entries(msg.files)) py.FS.writeFile(dir + '/' + n, src);
      const allCode = Object.values(msg.files).join('\\n');
      try { await py.loadPackagesFromImports(allCode); } catch (err) { /* ignore unknown packages */ }
      py.globals.set('__proj_dir', dir);
      py.globals.set('__mods', Object.keys(msg.files).map((n) => n.replace(/\\.py$/, '')));
      await py.runPythonAsync(\`
import sys, os, runpy, traceback
for _m in list(__mods):
    sys.modules.pop(_m, None)
os.chdir(__proj_dir)
if __proj_dir not in sys.path:
    sys.path.insert(0, __proj_dir)
try:
    runpy.run_path("main.py", run_name="__main__")
except SystemExit:
    pass
except BaseException:
    _tb = traceback.format_exc().splitlines()
    _keep = [l for l in _tb if 'runpy' not in l and '<frozen' not in l and '_pyodide' not in l and 'pyodide' not in l and '<exec>' not in l]
    print("\\\\n".join(_keep), file=sys.stderr)
finally:
    if __proj_dir in sys.path:
        sys.path.remove(__proj_dir)
\`);
      flush(id);
      postMessage({ type: 'done', id, ms: Math.round(performance.now() - t0) });
    } else if (msg.mode === 'sql') {
      await py.loadPackage('sqlite3');
      py.globals.set('__setup', msg.setup || '');
      py.globals.set('__query', msg.query || '');
      const res = await py.runPythonAsync(\`
import sqlite3, json
def __split(sql):
    out, buf = [], ''
    for ch in sql:
        buf += ch
        if ch == ';' and sqlite3.complete_statement(buf):
            if buf.strip().strip(';').strip(): out.append(buf.strip())
            buf = ''
    if buf.strip(): out.append(buf.strip())
    return out
__con = sqlite3.connect(':memory:')
__results = []
try:
    __con.executescript(__setup)
    for __s in __split(__query):
        __cur = __con.execute(__s)
        if __cur.description:
            __results.append({'sql': __s, 'columns': [d[0] for d in __cur.description], 'rows': [list(r) for r in __cur.fetchall()]})
        else:
            __results.append({'sql': __s, 'message': f'OK, {__cur.rowcount if __cur.rowcount >= 0 else 0} row(s) affected'})
    __con.commit()
    __out = json.dumps({'results': __results}, default=str)
except Exception as __e:
    __out = json.dumps({'results': __results, 'error': f'{type(__e).__name__}: {__e}'})
finally:
    __con.close()
__out
\`);
      postMessage({ type: 'sql', id, data: JSON.parse(res), ms: Math.round(performance.now() - t0) });
    }
  } catch (err) {
    flush(id);
    postMessage({ type: 'done', id, error: String(err.message || err) });
  }
};
`;

let worker = null;
let readyInfo = null;
let readyWaiters = [];
const handlers = new Map();
let nextId = 1;

function makeWorker() {
  const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
  worker = new Worker(url);
  readyInfo = null;
  worker.onmessage = (e) => {
    const m = e.data;
    if (m.type === 'ready' || m.type === 'fatal') {
      readyInfo = m;
      readyWaiters.forEach((f) => f(m));
      readyWaiters = [];
      return;
    }
    const h = handlers.get(m.id);
    if (h) h(m);
  };
}

export function ensurePython() {
  if (!worker) makeWorker();
  if (readyInfo) return Promise.resolve(readyInfo);
  return new Promise((res) => readyWaiters.push(res));
}

export function restartPython() {
  if (worker) worker.terminate();
  worker = null;
  handlers.forEach((h, id) => h({ type: 'done', id, error: 'Stopped' }));
  handlers.clear();
  return ensurePython();
}

// onEvent receives {type:'out'|'err'|'in'|'done'|'sql', ...}
export function runPython({ files, stdin = '' }, onEvent, timeoutMs = 20000) {
  return runJob({ mode: 'python', files, stdin }, onEvent, timeoutMs);
}
export function runSQL({ setup, query }, onEvent, timeoutMs = 20000) {
  return runJob({ mode: 'sql', setup, query }, onEvent, timeoutMs);
}

async function runJob(job, onEvent, timeoutMs) {
  await ensurePython();
  const id = nextId++;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      handlers.delete(id);
      onEvent({ type: 'done', id, error: `Time limit exceeded (${timeoutMs / 1000}s). Is there an infinite loop? Python was restarted.` });
      restartPython();
      resolve();
    }, timeoutMs);
    handlers.set(id, (m) => {
      onEvent(m);
      if (m.type === 'done' || m.type === 'sql') { clearTimeout(timer); handlers.delete(id); resolve(); }
    });
    worker.postMessage({ ...job, id });
  });
}
