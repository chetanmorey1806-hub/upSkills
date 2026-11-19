// Automated API tests for MERN projects. Each test starts a fresh server from the student's code
// (Express simulator from the API Lab) and sends its steps in order.
// step: { method, url, body?, headers?, auth?: true (adds "Authorization: Bearer <saved token>"), save?: 'token', expect? }
// expect: { status, json (partial deep match), length, has: [keys], absent: [keys], absentIn: { key: [keys] } }

const show = (v) => { try { return JSON.stringify(v); } catch { return String(v); } };

// Partial deep match. Arrays must have the same length; '' means "any non-empty string".
export function partialMatch(actual, expected, path = 'body') {
  if (expected === '') return typeof actual === 'string' && actual.length > 0 ? null : `${path} should be a non-empty string, got ${show(actual)}`;
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return `${path} should be an array, got ${show(actual)?.slice(0, 120)}`;
    if (actual.length !== expected.length) return `${path} should have ${expected.length} item(s), got ${actual.length}`;
    for (let i = 0; i < expected.length; i++) { const e = partialMatch(actual[i], expected[i], `${path}[${i}]`); if (e) return e; }
    return null;
  }
  if (expected && typeof expected === 'object') {
    if (!actual || typeof actual !== 'object' || Array.isArray(actual)) return `${path} should be an object, got ${show(actual)?.slice(0, 120)}`;
    for (const k of Object.keys(expected)) { const e = partialMatch(actual[k], expected[k], `${path}.${k}`); if (e) return e; }
    return null;
  }
  return Object.is(actual, expected) ? null : `${path} should be ${show(expected)}, got ${show(actual)}`;
}

function checkExpect(res, expect) {
  if (!expect) return null;
  if (res.error) return res.error;
  let body;
  try { body = res.body ? JSON.parse(res.body) : undefined; } catch { body = res.body; }
  if (expect.status != null && res.status !== expect.status) return `expected status ${expect.status}, got ${res.status}${body && body.error ? ` (${body.error})` : typeof body === 'string' && body ? ` (${(body.match(/Cannot \w+ [^<\s]+/) || [body.slice(0, 80)])[0]})` : ''}`;
  if (expect.length != null && (!Array.isArray(body) || body.length !== expect.length)) return `expected an array of ${expect.length}, got ${Array.isArray(body) ? `${body.length} item(s)` : show(body)?.slice(0, 120)}`;
  if (expect.json !== undefined) { const e = partialMatch(body, expect.json); if (e) return e; }
  for (const [h, want] of Object.entries(expect.headers || {})) {
    const got = (res.headers || {})[h.toLowerCase()];
    if (got == null) return `response header "${h}" is missing`;
    if (want !== '' && !String(got).toLowerCase().includes(String(want).toLowerCase())) return `response header "${h}" is "${got}", expected it to contain "${want}"`;
  }
  for (const k of expect.has || []) if (!body || body[k] == null) return `response should contain "${k}"`;
  for (const k of expect.absent || []) if (body && k in body) return `response must NOT contain "${k}"`;
  for (const [parent, keys] of Object.entries(expect.absentIn || {})) for (const k of keys) if (body?.[parent] && k in body[parent]) return `response.${parent} must NOT contain "${k}"`;
  return null;
}

// exec: { run(code) -> {ok, logs}, request(req) -> {status, headers, body} | {error} }
export async function runApiTests(code, tests, exec) {
  const results = [];
  for (const t of tests) {
    const started = await exec.run(code);
    if (!started.ok) {
      const err = (started.logs || []).filter((l) => l.level === 'error').map((l) => l.text).join('\n') || 'Server did not start';
      results.push({ name: t.name, status: 'ERROR', msg: err });
      continue;
    }
    let token = null;
    let fail = null;
    let lastReq = '';
    for (const s of t.steps) {
      const headers = { ...(s.headers || {}) };
      if (s.auth && token) headers.Authorization = `Bearer ${token}`;
      lastReq = `${s.method} ${s.url}${s.body !== undefined ? ` ${show(s.body)}` : ''}`;
      const res = await exec.request({ method: s.method, url: s.url, body: s.body, headers });
      if (s.save === 'token') { try { token = JSON.parse(res.body).token; } catch { token = null; } }
      fail = checkExpect(res, s.expect);
      if (fail) break;
    }
    const todo = fail && /got 404 \((Route not found|Cannot \w+)/.test(fail);
    results.push(fail ? { name: t.name, status: todo ? 'TODO' : 'FAIL', msg: `${lastReq}\n→ ${todo ? 'Route not implemented yet. ' : ''}${fail}` } : { name: t.name, status: 'PASS', msg: '' });
  }
  return results;
}

// Browser executor using the API Lab worker.
export function createBrowserExec() {
  const w = new Worker(new URL('../api/apiWorker.js', import.meta.url), { type: 'module' });
  const pending = new Map();
  let id = 0;
  w.onmessage = (e) => { const f = pending.get(e.data.id); if (f) { pending.delete(e.data.id); f(e.data); } };
  const call = (msg) => new Promise((res) => { const i = ++id; pending.set(i, res); w.postMessage({ ...msg, id: i }); });
  return { run: (code) => call({ type: 'run', code }), request: (request) => call({ type: 'request', request }), close: () => w.terminate() };
}
