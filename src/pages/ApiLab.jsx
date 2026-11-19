import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { Server, Play, Send, RotateCcw, History, Terminal, FileCode2, Trash2 } from 'lucide-react';

import Ico from '../components/Ico.jsx';
export const API_LOAD_KEY = 'xlpbi-api-load';
const STORE = 'xlpbi-api-lab-v1';

const TEMPLATES = {
  'Hello Express': {
    code: `const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.send('Hello from Express! ');\n});\n\napp.get('/hello/:name', (req, res) => {\n  res.json({ message: \`Hello, \${req.params.name}!\`, time: 'now' });\n});\n\napp.listen(3000, () => console.log('Server running on http://localhost:3000'));\n`,
    requests: [{ method: 'GET', url: '/' }, { method: 'GET', url: '/hello/Asha' }],
  },
  'REST API: Students CRUD': {
    code: `const express = require('express');\nconst app = express();\napp.use(express.json());\n\nlet students = [\n  { id: 1, name: 'Asha', course: 'React' },\n  { id: 2, name: 'Ravi', course: 'Node' },\n];\nlet nextId = 3;\n\n// READ all (with optional ?course= filter)\napp.get('/api/students', (req, res) => {\n  const { course } = req.query;\n  res.json(course ? students.filter((s) => s.course === course) : students);\n});\n\n// READ one\napp.get('/api/students/:id', (req, res) => {\n  const student = students.find((s) => s.id === Number(req.params.id));\n  if (!student) return res.status(404).json({ error: 'Student not found' });\n  res.json(student);\n});\n\n// CREATE\napp.post('/api/students', (req, res) => {\n  const { name, course } = req.body;\n  if (!name) return res.status(400).json({ error: 'name is required' });\n  const student = { id: nextId++, name, course };\n  students.push(student);\n  res.status(201).json(student);\n});\n\n// UPDATE\napp.put('/api/students/:id', (req, res) => {\n  const student = students.find((s) => s.id === Number(req.params.id));\n  if (!student) return res.status(404).json({ error: 'Student not found' });\n  Object.assign(student, req.body);\n  res.json(student);\n});\n\n// DELETE\napp.delete('/api/students/:id', (req, res) => {\n  students = students.filter((s) => s.id !== Number(req.params.id));\n  res.sendStatus(204);\n});\n\napp.listen(3000, () => console.log('API ready on port 3000'));\n`,
    requests: [
      { method: 'GET', url: '/api/students' },
      { method: 'GET', url: '/api/students?course=Node' },
      { method: 'POST', url: '/api/students', body: { name: 'Neha', course: 'Vue' } },
      { method: 'PUT', url: '/api/students/1', body: { course: 'Next.js' } },
      { method: 'DELETE', url: '/api/students/2' },
      { method: 'GET', url: '/api/students/99' },
    ],
  },
  'Middleware & error handling': {
    code: `const express = require('express');\nconst app = express();\napp.use(express.json());\n\n// 1. Logger middleware (runs for every request)\napp.use((req, res, next) => {\n  console.log(\`\${req.method} \${req.url}\`);\n  next();\n});\n\n// 2. Simple auth middleware for /admin routes\nfunction requireApiKey(req, res, next) {\n  if (req.get('x-api-key') !== 'secret123') {\n    return res.status(401).json({ error: 'Invalid or missing API key' });\n  }\n  next();\n}\n\napp.get('/admin/stats', requireApiKey, (req, res) => {\n  res.json({ users: 120, orders: 45 });\n});\n\n// 3. Async route that fails – Express 5 forwards the error automatically\napp.get('/crash', async (req, res) => {\n  throw new Error('Database connection failed');\n});\n\n// 4. 404 handler (no route matched)\napp.use((req, res) => res.status(404).json({ error: \`Route \${req.originalUrl} not found\` }));\n\n// 5. Error-handling middleware has FOUR arguments\napp.use((err, req, res, next) => {\n  console.error(err.message);\n  res.status(err.status || 500).json({ error: err.message });\n});\n\napp.listen(3000);\n`,
    requests: [
      { method: 'GET', url: '/admin/stats' },
      { method: 'GET', url: '/admin/stats', headers: { 'x-api-key': 'secret123' } },
      { method: 'GET', url: '/crash' },
      { method: 'GET', url: '/unknown' },
    ],
  },
  'Router & MVC structure': {
    code: `const express = require('express');\nconst app = express();\napp.use(express.json());\n\n// ---- "models" (in-memory) ----\nconst products = [{ id: 1, name: 'Laptop', price: 55000 }, { id: 2, name: 'Mouse', price: 500 }];\n\n// ---- controller ----\nconst productController = {\n  list: (req, res) => res.json(products),\n  get: (req, res, next) => {\n    const p = products.find((x) => x.id === Number(req.params.id));\n    if (!p) { const err = new Error('Product not found'); err.status = 404; return next(err); }\n    res.json(p);\n  },\n};\n\n// ---- routes (express.Router) ----\nconst productRouter = express.Router();\nproductRouter.get('/', productController.list);\nproductRouter.get('/:id', productController.get);\n\napp.use('/api/products', productRouter);\n\napp.use((err, req, res, next) => res.status(err.status || 500).json({ error: err.message }));\napp.listen(3000, () => console.log('MVC demo running'));\n`,
    requests: [{ method: 'GET', url: '/api/products' }, { method: 'GET', url: '/api/products/2' }, { method: 'GET', url: '/api/products/7' }],
  },
};

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const pretty = (body, ct) => { if ((ct || '').includes('json')) { try { return JSON.stringify(JSON.parse(body), null, 2); } catch { return body; } } return body; };

function useWorker() {
  const ref = useRef(null);
  const pending = useRef(new Map());
  const make = useCallback(() => {
    ref.current?.terminate();
    const w = new Worker(new URL('../api/apiWorker.js', import.meta.url), { type: 'module' });
    w.onmessage = (e) => { const f = pending.current.get(e.data.id); if (f) { pending.current.delete(e.data.id); f(e.data); } };
    ref.current = w;
  }, []);
  useEffect(() => { make(); return () => ref.current?.terminate(); }, [make]);
  const call = (msg, timeout = 6000) => new Promise((resolve) => {
    const id = Math.random().toString(36).slice(2);
    const t = setTimeout(() => { pending.current.delete(id); make(); resolve({ error: 'The server code got stuck (infinite loop?) and was restarted.', logs: [] }); }, timeout);
    pending.current.set(id, (d) => { clearTimeout(t); resolve(d); });
    ref.current.postMessage({ ...msg, id });
  });
  return call;
}

export default function ApiLab() {
  const initial = useMemo(() => {
    try { const x = JSON.parse(sessionStorage.getItem(API_LOAD_KEY)); sessionStorage.removeItem(API_LOAD_KEY); if (x?.code) return { ...x, fromLesson: true }; } catch { /* ignore */ }
    try { const st = JSON.parse(localStorage.getItem(STORE)); if (st?.code) return st; } catch { /* ignore */ }
    return { ...TEMPLATES['REST API: Students CRUD'], title: 'REST API: Students CRUD' };
  }, []);
  const [code, setCode] = useState(initial.code);
  const [presets, setPresets] = useState(initial.requests || []);
  const [title, setTitle] = useState(initial.title || '');
  const [expected] = useState(initial.expected || '');
  const [running, setRunning] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [logs, setLogs] = useState([]);
  const [method, setMethod] = useState(initial.requests?.[0]?.method || 'GET');
  const [url, setUrl] = useState(initial.requests?.[0]?.url || '/');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('');
  const [resp, setResp] = useState(null);
  const [history, setHistory] = useState([]);
  const [rtab, setRtab] = useState('body');
  const [fallback, setFallback] = useState(false);
  const call = useWorker();

  useEffect(() => { loader.init().catch(() => setFallback(true)); }, []);
  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify({ code, requests: presets, title })); } catch { /* ignore */ } }, [code, presets, title]);

  const start = async () => {
    const r = await call({ type: 'run', code });
    setLogs((l) => [...l, { level: 'sys', text: `$ node server.js${r.ok ? '' : '   (failed)'}` }, ...(r.logs || [])].slice(-200));
    setRunning(!!r.ok); setDirty(false);
    return r.ok;
  };
  useEffect(() => { start(); /* auto-start once */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async (override) => {
    const rq = override || { method, url, headers: (() => { try { return JSON.parse(headers || '{}'); } catch { return {}; } })(), body: body.trim() ? body : undefined };
    if (override) { setMethod(rq.method); setUrl(rq.url); setBody(rq.body ? (typeof rq.body === 'string' ? rq.body : JSON.stringify(rq.body, null, 2)) : ''); setHeaders(JSON.stringify(rq.headers || {})); }
    if (!running || dirty) { const ok = await start(); if (!ok) return; }
    const r = await call({ type: 'request', request: { ...rq, body: rq.body === undefined ? undefined : (typeof rq.body === 'string' ? rq.body : JSON.stringify(rq.body)) } });
    setLogs((l) => [...l, ...(r.logs || [])].slice(-200));
    setResp(r);
    setRtab('body');
    if (!r.error) setHistory((h) => [{ method: rq.method, url: rq.url, status: r.status, ms: r.ms, req: rq }, ...h].slice(0, 30));
  };

  const loadTemplate = (name) => {
    if (!name) return;
    const t = TEMPLATES[name];
    setCode(t.code); setPresets(t.requests); setTitle(name); setDirty(true); setRunning(false); setResp(null);
    setMethod(t.requests[0].method); setUrl(t.requests[0].url); setBody(''); setHeaders('{}');
  };
  const statusClass = (s) => (s >= 500 ? 'e5' : s >= 400 ? 'e4' : s >= 300 ? 's3' : 's2');

  return (
    <div className="apilab">
      <div className="api-top">
        <div className="api-title"><Server size={18} /> <b>API Lab</b><span className="muted small">Node.js + Express in your browser · {title}</span></div>
        <div className="row-btns">
          <select value="" onChange={(e) => loadTemplate(e.target.value)}>
            <option value="">Load example…</option>
            {Object.keys(TEMPLATES).map((t) => <option key={t}>{t}</option>)}
          </select>
          <button className="btn small primary" onClick={start}><Play size={14} /> {running && !dirty ? 'Restart server' : 'Run server'}</button>
          <span className={`api-dot ${running && !dirty ? 'on' : ''}`}>{running && !dirty ? 'Running on :3000' : dirty ? 'Code changed – restart' : 'Stopped'}</span>
        </div>
      </div>
      <div className="api-body">
        <section className="api-editor">
          <div className="pg-tabs"><button className="pg-tab on"><FileCode2 size={14} /> server.js</button></div>
          <div className="pg-monaco">
            {fallback ? <textarea className="pg-fallback" value={code} spellCheck={false} onChange={(e) => { setCode(e.target.value); setDirty(true); }} />
              : <Editor language="javascript" theme="vs-dark" value={code} onChange={(v) => { setCode(v ?? ''); setDirty(true); }}
                loading={<div className="pg-loading">Loading editor…</div>}
                options={{ fontSize: 14, minimap: { enabled: false }, tabSize: 2, automaticLayout: true, scrollBeyondLastLine: false, wordWrap: 'on' }} />}
          </div>
          <div className="api-console">
            <div className="api-console-head"><Terminal size={14} /> Terminal <button className="link-btn" onClick={() => setLogs([])}><Trash2 size={12} /> clear</button></div>
            <div className="api-console-body">
              {logs.length === 0 && <div className="pg-muted">Server logs (console.log) appear here.</div>}
              {logs.map((l, i) => <pre key={i} className={`pg-log ${l.level}`}>{l.level === 'sys' ? '' : l.level === 'error' ? '✖ ' : l.level === 'warn' ? <><Ico e="⚠" /> </> : '› '}{l.text}</pre>)}
            </div>
          </div>
        </section>
        <section className="api-client">
          <div className="api-reqline">
            <select value={method} onChange={(e) => setMethod(e.target.value)} className={`m-${method}`}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select>
            <span className="api-host">http://localhost:3000</span>
            <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
            <button className="btn primary" onClick={() => send()}><Send size={14} /> Send</button>
          </div>
          {presets.length > 0 && (
            <div className="api-presets"><span className="muted small">Try:</span>
              {presets.map((p, i) => <button key={i} className="chip" onClick={() => send(p)}><b className={`m-${p.method}`}>{p.method}</b> {p.url}</button>)}
            </div>
          )}
          <div className="api-reqparts">
            <label>Headers (JSON)<textarea className="input mono" rows={2} value={headers} onChange={(e) => setHeaders(e.target.value)} /></label>
            <label>Body (JSON){method === 'GET' && <span className="muted small"> – usually empty for GET</span>}<textarea className="input mono" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder={'{\n  "name": "Asha"\n}'} /></label>
          </div>
          <div className="api-response card">
            {!resp && <div className="pg-muted">Send a request to see the response here.</div>}
            {resp?.error && <div className="explain bad">{resp.error}</div>}
            {resp && !resp.error && (
              <>
                <div className="api-status"><span className={`api-code ${statusClass(resp.status)}`}>{resp.status}</span><span className="muted small">{resp.ms} ms · {resp.headers?.['content-type'] || 'no content-type'}</span></div>
                <div className="jide-ptabs light-tabs">
                  <button className={rtab === 'body' ? 'on' : ''} onClick={() => setRtab('body')}>Body</button>
                  <button className={rtab === 'headers' ? 'on' : ''} onClick={() => setRtab('headers')}>Headers</button>
                </div>
                {rtab === 'body' ? <pre className="api-out">{pretty(resp.body, resp.headers?.['content-type']) || '(empty body)'}</pre>
                  : <pre className="api-out">{Object.entries(resp.headers || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}</pre>}
              </>
            )}
          </div>
          {expected && <details className="api-expected"><summary><Ico e="📋" /> Expected results from the lesson</summary><pre>{expected}</pre></details>}
          {history.length > 0 && (
            <div className="api-history"><div className="muted small"><History size={12} /> History</div>
              {history.map((h, i) => <button key={i} className="api-hrow" onClick={() => send(h.req)}><b className={`m-${h.method}`}>{h.method}</b> {h.url} <span className={`api-code sm ${statusClass(h.status)}`}>{h.status}</span> <span className="muted small">{h.ms} ms</span></button>)}
            </div>
          )}
          <p className="muted small"><RotateCcw size={11} /> This lab runs a lightweight Express 5 compatible engine in your browser (express, path, events, crypto.randomUUID). For databases and other npm packages, run the same code with Node.js: <code className="ic">npm init -y && npm i express && node server.js</code>, and test it with Postman or Thunder Client.</p>
        </section>
      </div>
    </div>
  );
}
