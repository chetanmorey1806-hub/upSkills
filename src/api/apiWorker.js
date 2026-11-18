// Web Worker that runs the student's Express code with the mini Express implementation.
import { createExpress, makeReqRes } from './miniExpress.js';

let app = null;
let logs = [];
const fmt = (a) => { try { return typeof a === 'string' ? a : a instanceof Error ? `${a.name}: ${a.message}` : JSON.stringify(a, null, 2); } catch { return String(a); } };
const log = (level, ...args) => { logs.push({ level, text: args.map(fmt).join(' ') }); };
const fakeConsole = { log: (...a) => log('log', ...a), info: (...a) => log('log', ...a), warn: (...a) => log('warn', ...a), error: (...a) => log('error', ...a), table: (...a) => log('log', ...a), debug: (...a) => log('log', ...a) };

class EventEmitter {
  constructor() { this._l = {}; }
  on(e, f) { (this._l[e] ||= []).push(f); return this; }
  addListener(e, f) { return this.on(e, f); }
  once(e, f) { const w = (...a) => { this.off(e, w); f(...a); }; return this.on(e, w); }
  off(e, f) { this._l[e] = (this._l[e] || []).filter((x) => x !== f); return this; }
  removeListener(e, f) { return this.off(e, f); }
  emit(e, ...a) { const ls = this._l[e] || []; ls.slice().forEach((f) => f.apply(this, a)); return ls.length > 0; }
  listenerCount(e) { return (this._l[e] || []).length; }
}
const pathMod = {
  sep: '/',
  join: (...p) => p.filter(Boolean).join('/').replace(/\/+/g, '/'),
  resolve: (...p) => `/${p.filter(Boolean).join('/')}`.replace(/\/+/g, '/'),
  basename: (p, ext) => { const b = String(p).split('/').pop(); return ext && b.endsWith(ext) ? b.slice(0, -ext.length) : b; },
  dirname: (p) => String(p).split('/').slice(0, -1).join('/') || '/',
  extname: (p) => { const m = /\.[^./]*$/.exec(String(p)); return m ? m[0] : ''; },
};

function run(code) {
  logs = [];
  app = null;
  const express = createExpress(log);
  const modules = {
    express, path: pathMod, events: Object.assign(EventEmitter, { EventEmitter }),
    crypto: { randomUUID: () => crypto.randomUUID() },
    util: { format: (...a) => a.map(fmt).join(' ') },
  };
  const req = (name) => {
    const n = String(name).replace(/^node:/, '');
    if (n in modules) return modules[n];
    throw new Error(`Cannot find module '${name}'. The API Lab supports: express, path, events, crypto (randomUUID), util. Install other packages in a real Node project.`);
  };
  const module = { exports: {} };
  const process = { env: { PORT: '3000', NODE_ENV: 'development' }, argv: ['node', 'server.js'], cwd: () => '/app', exit: () => {}, on: () => {}, version: 'v22.0.0', platform: 'browser' };
  try {
    // eslint-disable-next-line no-new-func
    new Function('require', 'console', 'module', 'exports', 'process', '__dirname', '__filename', 'setTimeout', 'setInterval', code)(
      req, fakeConsole, module, module.exports, process, '/app', '/app/server.js', setTimeout, () => 0,
    );
  } catch (e) {
    log('error', `${e.name}: ${e.message}`);
    return { ok: false, logs };
  }
  const apps = express.__apps;
  app = apps.find((a) => a.__listening) || apps[apps.length - 1] || (typeof module.exports === 'function' ? module.exports : null);
  if (!app) log('warn', 'No Express app was created. Did you call express()?');
  else if (!app.__listening) log('warn', 'Tip: call app.listen(3000) so the server starts (requests are still handled in the lab).');
  return { ok: !!app, logs };
}

function request(r) {
  return new Promise((resolve) => {
    logs = [];
    if (!app) { resolve({ error: 'Server is not running. Click "Run server" first.', logs }); return; }
    const t0 = performance.now();
    let done = false;
    const timer = setTimeout(() => { if (!done) { done = true; resolve({ error: 'Request timed out after 3 s: the handler never sent a response. Did you forget res.send()/res.json() or next()?', logs }); } }, 3000);
    const { req, res } = makeReqRes(r, (out) => {
      if (done) return;
      done = true; clearTimeout(timer);
      // give synchronous logs after send a moment to arrive
      setTimeout(() => resolve({ ...out, ms: Math.round((performance.now() - t0) * 10) / 10, logs }), 0);
    });
    try { app.handle(req, res); } catch (e) { log('error', e.message); }
  });
}

self.onmessage = async (e) => {
  const { id, type } = e.data;
  if (type === 'run') self.postMessage({ id, ...run(e.data.code) });
  if (type === 'request') self.postMessage({ id, ...(await request(e.data.request)) });
};
