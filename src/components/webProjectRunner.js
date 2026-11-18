// Runs automated checks for Web Development final projects.
// Each test loads the student's page in a FRESH hidden, sandboxed iframe (no access to the app),
// waits for it to load (and for React to render), runs the test code inside the page and reports back.
import { buildWebDoc, buildReactDoc } from './playgroundRuntime.js';

const safeJSON = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

// Fake localStorage (sandboxed iframes have none), silent alert/confirm/prompt.
const harness = (seed) => `<script>(function(){
  var mem = ${safeJSON(seed || {})};
  var ls = {
    getItem: function(k){ return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    setItem: function(k, v){ mem[k] = String(v); },
    removeItem: function(k){ delete mem[k]; },
    clear: function(){ Object.keys(mem).forEach(function(k){ delete mem[k]; }); },
    key: function(i){ var ks = Object.keys(mem); return i < ks.length ? ks[i] : null; },
    get length(){ return Object.keys(mem).length; }
  };
  try { Object.defineProperty(window, 'localStorage', { value: ls, configurable: true }); } catch (e) {}
  window.__alerts = [];
  window.alert = function(m){ window.__alerts.push(String(m)); };
  window.confirm = function(){ return true; };
  window.prompt = function(){ return ''; };
})();<\/script>`;

// Helpers available to every test (see the project data for examples).
const runner = ({ token, code, react, src }) => `<script>
(function(){
  var TOKEN = ${safeJSON(token)}, CODE = ${safeJSON(code)}, REACT = ${react ? 'true' : 'false'}, SRC = ${safeJSON(src)};
  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  function $(s){ return document.querySelector(s); }
  function $$(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function el(x, what){ var e = typeof x === 'string' ? $(x) : x; if (!e) throw new Error((what || 'Element') + ' not found: ' + x); return e; }
  async function click(x){ el(x).click(); await wait(40); }
  function setVal(e, v){
    var proto = e.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : e.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(e, v);
  }
  async function type(x, v){ var e = el(x, 'Input'); e.focus(); setVal(e, v); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); await wait(40); }
  async function select(x, v){ var e = el(x, 'Select'); setVal(e, v); e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); await wait(40); }
  async function submit(x){ var f = el(x, 'Form'); f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); await wait(60); }
  function btn(){ var names = Array.prototype.slice.call(arguments).map(function(t){ return String(t).toLowerCase(); });
    var b = $$('button, input[type=button], input[type=submit]').find(function(x){ var t = (x.textContent || x.value || '').trim().toLowerCase(); return names.indexOf(t) !== -1; });
    if (!b) throw new Error('Button not found: ' + names.join(' / ')); return b; }
  function text(x){ var e = typeof x === 'string' ? $(x) : x; if (!e) return ''; return (e.value !== undefined && /INPUT|TEXTAREA|SELECT|OUTPUT/.test(e.tagName) ? e.value : e.textContent).trim(); }
  function visible(x){ var e = typeof x === 'string' ? $(x) : x; if (!e || e.hidden) return false; var s = getComputedStyle(e); return s.display !== 'none' && s.visibility !== 'hidden'; }
  function expect(cond, msg){ if (!cond) throw new Error(msg); }
  function mockFetch(handler){ var calls = []; window.fetch = function(url, opts){ calls.push(String(url)); return Promise.resolve().then(function(){ return handler(String(url), opts); }).then(function(r){
      if (r instanceof Error) throw r;
      var status = r.status || 200; var body = r.body;
      return { ok: status >= 200 && status < 300, status: status, json: function(){ return Promise.resolve(body); }, text: function(){ return Promise.resolve(JSON.stringify(body)); } };
    }); }; return calls; }
  function report(ok, msg){ parent.postMessage({ __wpt: TOKEN, ok: ok, msg: msg || '' }, '*'); }
  async function go(){
    if (REACT) { for (var i = 0; i < 120; i++) { var r = document.getElementById('root'); if (r && r.children.length) break; await wait(100); } await wait(80); }
    try {
      var AsyncFn = Object.getPrototypeOf(async function(){}).constructor;
      var fn = new AsyncFn('$', '$$', 'wait', 'click', 'type', 'select', 'submit', 'btn', 'text', 'visible', 'expect', 'mockFetch', 'SRC', CODE);
      var res = await fn($, $$, wait, click, type, select, submit, btn, text, visible, expect, mockFetch, SRC);
      report(res !== false, res === false ? 'Check failed' : '');
    } catch (e) { report(false, (e && e.message) || String(e)); }
  }
  if (document.readyState === 'complete') setTimeout(go, 60); else window.addEventListener('load', function(){ setTimeout(go, 60); });
})();
<\/script>`;

export function buildProjectDoc(project, files, extraHead = '') {
  const react = project.mode === 'react';
  const doc = react ? buildReactDoc({ jsx: files.jsx || '', css: files.css || '' }) : buildWebDoc({ html: files.html || '', css: files.css || '', js: files.js || '', libs: project.libs || [] });
  return extraHead ? doc.replace(/<head>/i, () => `<head>${extraHead}`) : doc;
}

let seq = 0;
export function runOneTest(project, files, test, timeoutMs) {
  const react = project.mode === 'react';
  const token = `wpt-${Date.now()}-${++seq}`;
  let doc = buildProjectDoc(project, files, harness(test.seed));
  const r = runner({ token, code: test.code, react, src: { html: files.html || '', css: files.css || '', js: files.js || '', jsx: files.jsx || '' } });
  doc = /<\/body>/i.test(doc) ? doc.replace(/<\/body>(?![\s\S]*<\/body>)/i, () => `${r}</body>`) : doc + r;
  return new Promise((resolve) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts allow-forms');
    frame.setAttribute('aria-hidden', 'true');
    // Kept inside the viewport (but invisible): browsers heavily slow down timers in off-screen cross-origin frames.
    frame.style.cssText = 'position:fixed;left:0;top:0;width:1200px;height:800px;border:0;opacity:0;pointer-events:none;z-index:-1;';
    let done = false;
    const finish = (res) => {
      if (done) return;
      done = true;
      window.removeEventListener('message', onMsg);
      clearTimeout(timer);
      setTimeout(() => frame.remove(), 0);
      resolve(res);
    };
    const onMsg = (e) => { if (e.data && e.data.__wpt === token) finish({ ok: !!e.data.ok, msg: e.data.msg }); };
    const timer = setTimeout(() => finish({ ok: false, msg: 'Timed out: the page did not finish loading or the test waited too long. Check the console for errors.' }), timeoutMs || (react ? 45000 : 20000));
    window.addEventListener('message', onMsg);
    frame.srcdoc = doc;
    document.body.appendChild(frame);
  });
}

// Runs every test in order; onEach(index, result) is called as each finishes.
export async function runAllTests(project, files, onEach) {
  const out = [];
  for (let i = 0; i < project.tests.length; i++) {
    const t = project.tests[i];
    // eslint-disable-next-line no-await-in-loop
    const r = await runOneTest(project, files, t);
    const row = { name: t.name, status: r.ok ? 'PASS' : 'FAIL', msg: r.ok ? '' : r.msg };
    out.push(row);
    onEach?.(i, row);
  }
  return out;
}

// Live preview document (sandboxed, so it gets the in-memory localStorage too).
export const previewDoc = (project, files) => buildProjectDoc(project, files, harness({}));

// A single standalone index.html students can download and open or host (GitHub Pages / Netlify).
export const standaloneDoc = (project, files) => buildProjectDoc(project, files);
