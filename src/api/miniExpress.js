// A small, teaching-focused re-implementation of the parts of Express 5 students use most.
// Runs in a Web Worker (see apiWorker.js). Behaviour mirrors Express for routing, middleware,
// params/query/body, res helpers, routers, async errors and error-handling middleware.

export const STATUS_TEXT = {
  200: 'OK', 201: 'Created', 202: 'Accepted', 204: 'No Content', 301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
  400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed', 409: 'Conflict',
  410: 'Gone', 413: 'Payload Too Large', 415: 'Unsupported Media Type', 422: 'Unprocessable Entity', 429: 'Too Many Requests',
  500: 'Internal Server Error', 501: 'Not Implemented', 502: 'Bad Gateway', 503: 'Service Unavailable',
};

const escapeRe = (s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

// Path pattern -> { re, keys }. Supports :param, :param? (Express 4 style), {/:param} optional groups (Express 5),
// *splat / /*name wildcards, and the bare '*' / '/*' catch-all.
function toSrc(p, keys) {
  let src = '';
  let i = 0;
  while (i < p.length) {
    const ch = p[i];
    if (ch === '{') {
      const close = p.indexOf('}', i);
      src += `(?:${toSrc(p.slice(i + 1, close), keys)})?`;
      i = close + 1;
    } else if (ch === ':') {
      const m = /^:([A-Za-z_$][\w$]*)(\?)?/.exec(p.slice(i));
      keys.push(m[1]);
      if (m[2]) {
        // Express 4 style optional param ":id?" also swallows the preceding slash
        if (src.endsWith('/')) src = `${src.slice(0, -1)}(?:/([^/]+?))?`;
        else src += '([^/]+?)?';
      } else src += '([^/]+?)';
      i += m[0].length;
    } else if (ch === '*') {
      const m = /^\*([A-Za-z_$][\w$]*)?/.exec(p.slice(i));
      keys.push(m[1] ? `*${m[1]}` : '0');
      src += '(.*)';
      i += m[0].length;
    } else {
      src += escapeRe(ch);
      i += 1;
    }
  }
  return src;
}

// Path pattern -> { re, keys }. Supports :param, :param? (Express 4 style), {/:param} optional groups (Express 5),
// *splat / /*name wildcards, and the bare '*' / '/*' catch-all.
export function compilePath(path, { end = true } = {}) {
  if (path instanceof RegExp) return { re: path, keys: [] };
  const keys = [];
  const src = toSrc(String(path || '/'), keys).replace(/\/$/, '');
  const re = new RegExp(`^${src}${end ? '/?$' : '(?=/|$)'}`, 'i');
  return { re, keys };
}


// SHA-1 + weak ETag exactly like Express (etag package): W/"<byteLength hex>-<base64 sha1, 27 chars>"
function sha1Bytes(bytes) {
  const ml = bytes.length;
  const withPad = new Uint8Array(((ml + 9 + 63) >> 6) << 6);
  withPad.set(bytes); withPad[ml] = 0x80;
  const dv = new DataView(withPad.buffer);
  dv.setUint32(withPad.length - 4, (ml * 8) >>> 0); dv.setUint32(withPad.length - 8, Math.floor(ml / 0x20000000));
  let [h0, h1, h2, h3, h4] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  const w = new Uint32Array(80);
  for (let o = 0; o < withPad.length; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 80; i++) { const x = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]; w[i] = (x << 1) | (x >>> 31); }
    let [a, b, c, d, e] = [h0, h1, h2, h3, h4];
    for (let i = 0; i < 80; i++) {
      const [f, k] = i < 20 ? [(b & c) | (~b & d), 0x5a827999] : i < 40 ? [b ^ c ^ d, 0x6ed9eba1] : i < 60 ? [(b & c) | (b & d) | (c & d), 0x8f1bbcdc] : [b ^ c ^ d, 0xca62c1d6];
      const t = (((a << 5) | (a >>> 27)) + f + e + k + w[i]) >>> 0;
      e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }
  const out = new Uint8Array(20); const odv = new DataView(out.buffer);
  [h0, h1, h2, h3, h4].forEach((h, i) => odv.setUint32(i * 4, h));
  return out;
}
function weakEtag(text) {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length === 0) return 'W/"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"';
  const b64 = btoa(String.fromCharCode(...sha1Bytes(bytes))).slice(0, 27);
  return `W/"${bytes.length.toString(16)}-${b64}"`;
}

function matchPath(layer, path) {
  const m = layer.match.re.exec(path);
  if (!m) return null;
  const params = {};
  layer.match.keys.forEach((k, idx) => {
    const v = m[idx + 1];
    if (v === undefined) return;
    if (k === '0') params[k] = v;
    // Express 5 named wildcards (*name) give an array of decoded path segments
    else if (k[0] === '*') params[k.slice(1)] = v.split('/').filter((x) => x !== '').map((x) => { try { return decodeURIComponent(x); } catch { return x; } });
    else params[k] = decodeURIComponent(v);
  });
  return { params, matched: m[0] };
}

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

function makeRouter(opts = {}) {
  const stack = [];
  const paramFns = {};
  const router = function routerHandle(req, res, next) { return router.handle(req, res, next); };
  router.stack = stack;
  router.__isRouter = true;
  router.use = (...args) => {
    let path = '/';
    if (typeof args[0] === 'string' || args[0] instanceof RegExp || Array.isArray(args[0])) path = args.shift();
    args.flat().forEach((fn) => {
      if (typeof fn !== 'function') throw new TypeError('app.use() requires a middleware function');
      (Array.isArray(path) ? path : [path]).forEach((pp) => stack.push({ kind: 'use', path: pp, match: compilePath(pp, { end: false }), fn }));
    });
    return router;
  };
  const addRoute = (method, path, fns) => {
    fns.flat().forEach((fn) => {
      if (typeof fn !== 'function') throw new TypeError(`Route.${method}() requires a callback function but got a ${typeof fn}`);
      (Array.isArray(path) ? path : [path]).forEach((pp) => stack.push({ kind: 'route', method, path: pp, match: compilePath(pp), fn }));
    });
  };
  [...METHODS, 'all'].forEach((m) => { router[m] = (path, ...fns) => { addRoute(m, path, fns); return router; }; });
  router.route = (path) => {
    const r = {};
    [...METHODS, 'all'].forEach((m) => { r[m] = (...fns) => { addRoute(m, path, fns); return r; }; });
    return r;
  };
  router.param = (name, fn) => {
    if (typeof fn !== 'function') throw new TypeError('invalid param() call for ' + name + ', got ' + fn);
    (paramFns[name] ||= []).push(fn);
    return router;
  };
  router.__mergeParams = !!opts.mergeParams;

  router.handle = (req, res, done) => {
    let idx = 0;
    const basePath = req.__path ?? req.path;
    const parentParams = router.__mergeParams ? (req.__parentParams || {}) : {};
    const paramCalled = {};
    // run router.param() callbacks (once per value per request) before the layer
    const runParams = (params, cb) => {
      const names = Object.keys(params).filter((k) => paramFns[k] && paramCalled[k] !== params[k]);
      let i = 0;
      const step = (e) => {
        if (e) return cb(e);
        if (res.headersSent) return undefined;
        const k = names[i];
        if (k === undefined) return cb();
        const fns = paramFns[k];
        let j = 0;
        const inner = (e2) => {
          if (e2) return cb(e2);
          if (res.headersSent) return undefined;
          const f = fns[j++];
          if (!f) { paramCalled[k] = params[k]; i += 1; return step(); }
          try {
            const r = f(req, res, inner, params[k], k);
            if (r && typeof r.then === 'function') r.then(undefined, (e3) => cb(e3 || new Error('Rejected promise')));
          } catch (e3) { cb(e3); }
          return undefined;
        };
        return inner();
      };
      return step();
    };
    const next = (err) => {
      if (res.headersSent && !err) return;
      if (err === 'route' || err === 'router') err = undefined;
      const layer = stack[idx++];
      if (!layer) { req.__path = basePath; return done(err); }
      const path = basePath;
      const m = matchPath(layer, path);
      if (!m) return next(err);
      if (layer.kind === 'route') {
        const method = req.method.toLowerCase();
        if (layer.method !== 'all' && layer.method !== method && !(method === 'head' && layer.method === 'get')) return next(err);
      }
      req.params = { ...parentParams, ...m.params };
      const isErrHandler = layer.fn.length === 4;
      if (err && !isErrHandler) return next(err);
      if (!err && isErrHandler) return next();
      if (!err && Object.keys(m.params).some((k) => paramFns[k] && paramCalled[k] !== m.params[k])) {
        const saved = req.params;
        return runParams(m.params, (e) => { if (e) return next(e); req.params = saved; return go(); });
      }
      return go();
      function go() {
      const call = () => {
        if (layer.kind === 'use') {
          const prevBase = req.baseUrl;
          const removed = m.matched === '/' ? '' : m.matched;
          if (layer.fn.__isRouter) {
            const childParams = req.params;
            req.baseUrl = prevBase + removed;
            req.__path = path.slice(removed.length) || '/';
            req.__parentParams = childParams;
            req.url = req.__path + (req.__search || '');
            return layer.fn.handle(req, res, (e) => {
              req.baseUrl = prevBase; req.__path = basePath; req.url = basePath + (req.__search || ''); req.__parentParams = parentParams; req.params = childParams;
              next(e);
            });
          }
          return err ? layer.fn(err, req, res, next) : layer.fn(req, res, next);
        }
        return err ? layer.fn(err, req, res, next) : layer.fn(req, res, next);
      };
      try {
        const r = call();
        if (r && typeof r.then === 'function') r.then(undefined, (e) => next(e || new Error('Rejected promise')));
      } catch (e) {
        next(e);
      }
      return undefined;
      }
    };
    next();
  };
  return router;
}

export function createExpress(log) {
  const apps = [];
  function express() {
    const router = makeRouter();
    const settings = { env: 'development', 'x-powered-by': true };
    const app = function app(req, res) { app.handle(req, res); };
    Object.assign(app, router);
    app.handle = (req, res) => router.handle(req, res, (err) => finalHandler(err, req, res));
    app.__isRouter = false;
    app.locals = {};
    app.set = (k, v) => { settings[k] = v; return app; };
    app.get = (path, ...fns) => (fns.length === 0 && typeof path === 'string' ? settings[path] : (router.get(path, ...fns), app));
    app.enable = (k) => app.set(k, true);
    app.disable = (k) => app.set(k, false);
    app.listen = (port, ...rest) => {
      const cb = rest.find((x) => typeof x === 'function');
      app.__port = port;
      app.__listening = true;
      if (cb) cb();
      return { close: (fn) => fn && fn(), address: () => ({ port }) };
    };
    apps.push(app);
    return app;
  }
  express.Router = (opts) => makeRouter(opts);
  express.json = (opts = {}) => function jsonParser(req, res, next) {
    const ct = (req.headers['content-type'] || '').toLowerCase();
    if (req.__rawBody != null && req.__rawBody !== '' && (ct.includes('json') || (opts.type && ct.includes(opts.type)))) {
      try { req.body = typeof req.__rawBody === 'string' ? JSON.parse(req.__rawBody) : req.__rawBody; }
      catch (e) { const err = new SyntaxError(e.message); err.status = 400; err.statusCode = 400; err.type = 'entity.parse.failed'; err.body = req.__rawBody; return next(err); }
    } else if (req.body === undefined && ct.includes('json')) req.body = {};
    next();
  };
  express.urlencoded = () => function urlencodedParser(req, res, next) {
    const ct = (req.headers['content-type'] || '').toLowerCase();
    if (ct.includes('x-www-form-urlencoded') && typeof req.__rawBody === 'string') req.body = Object.fromEntries(new URLSearchParams(req.__rawBody));
    next();
  };
  express.text = () => (req, res, next) => { if ((req.headers['content-type'] || '').includes('text/')) req.body = String(req.__rawBody ?? ''); next(); };
  express.static = () => (req, res, next) => next();
  express.__apps = apps;

  function finalHandler(err, req, res) {
    if (res.headersSent) return;
    if (err) {
      const status = err.status || err.statusCode || 500;
      log('error', `${err.name || 'Error'}: ${err.message}`);
      res.status(status >= 400 && status < 600 ? status : 500).type('html')
        .send(`<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8"><title>Error</title></head>\n<body><pre>${(err.stack || `${err.name}: ${err.message}`).split('\n')[0]}</pre></body>\n</html>`);
    } else {
      res.status(404).type('html').send(`<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8"><title>Error</title></head>\n<body><pre>Cannot ${req.method} ${req.originalUrl.split('?')[0]}</pre></body>\n</html>`);
    }
  }
  return express;
}

export function makeReqRes({ method, url, headers = {}, body }, onFinish) {
  const u = new URL(url, 'http://localhost:3000');
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), String(v)]));
  if (body != null && body !== '' && !lower['content-type']) lower['content-type'] = 'application/json';
  const query = {};
  u.searchParams.forEach((v, k) => { if (k in query) query[k] = [].concat(query[k], v); else query[k] = v; });
  const req = {
    method: method.toUpperCase(), url: u.pathname + u.search, originalUrl: u.pathname + u.search, path: u.pathname, baseUrl: '',
    __path: u.pathname, __search: u.search, headers: lower, params: {}, body: undefined, __rawBody: typeof body === 'string' ? body : body == null ? '' : JSON.stringify(body),
    ip: '127.0.0.1', ips: [], hostname: 'localhost', protocol: 'http', secure: false, cookies: {},
    get: (h) => lower[String(h).toLowerCase()], header: (h) => lower[String(h).toLowerCase()],
    is: (t) => (lower['content-type'] || '').includes(t),
  };
  Object.defineProperty(req, 'query', { value: Object.freeze(query), enumerable: true });
  const resHeaders = { 'x-powered-by': 'Express' };
  const res = {
    statusCode: 200, headersSent: false, locals: {},
    status(c) { this.statusCode = Number(c); return this; },
    set(k, v) { if (typeof k === 'object') Object.entries(k).forEach(([a, b]) => { resHeaders[a.toLowerCase()] = String(b); }); else resHeaders[k.toLowerCase()] = String(v); return this; },
    header(k, v) { return this.set(k, v); },
    get(k) { return resHeaders[k.toLowerCase()]; },
    type(t) { const map = { json: 'application/json; charset=utf-8', html: 'text/html; charset=utf-8', text: 'text/plain; charset=utf-8' }; resHeaders['content-type'] = map[t] || t; return this; },
    json(obj) { this.__etagOk = true; if (!resHeaders['content-type']) resHeaders['content-type'] = 'application/json; charset=utf-8'; return this.__end(JSON.stringify(obj === undefined ? null : obj)); },
    send(b) {
      this.__etagOk = true;
      if (b === undefined) return this.__end('');
      if (typeof b === 'object' && b !== null) return this.json(b);
      if (typeof b === 'number') { this.statusCode = b; return this.__end(STATUS_TEXT[b] || String(b)); }
      if (!resHeaders['content-type']) resHeaders['content-type'] = 'text/html; charset=utf-8';
      return this.__end(String(b));
    },
    sendStatus(c) { this.__etagOk = true; this.statusCode = c; resHeaders['content-type'] = 'text/plain; charset=utf-8'; return this.__end(STATUS_TEXT[c] || String(c)); },
    end(b) { return this.__end(b == null ? '' : String(b)); },
    redirect(a, b) { const [code, loc] = typeof a === 'number' ? [a, b] : [302, a]; this.statusCode = code; resHeaders.location = loc; return this.__end(`Found. Redirecting to ${loc}`); },
    cookie(n, v) { resHeaders['set-cookie'] = `${n}=${v}; Path=/`; return this; },
    clearCookie(n) { resHeaders['set-cookie'] = `${n}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`; return this; },
    render(view, data) { return this.send(`<!-- rendered view "${view}" -->\n${JSON.stringify(data || {}, null, 2)}`); },
    format(obj) { return (obj.json || obj.default || Object.values(obj)[0])(); },
    __end(text) {
      if (this.headersSent) throw new Error('Cannot set headers after they are sent to the client');
      this.headersSent = true;
      if (this.__etagOk && (req.method === 'GET' || req.method === 'HEAD') && text !== '' && !resHeaders.etag) resHeaders.etag = weakEtag(text);
      const inm = req.headers['if-none-match'];
      const sc = this.statusCode;
      if (this.__etagOk && inm && resHeaders.etag && ((sc >= 200 && sc < 300) || sc === 304) && !/no-cache/.test(req.headers['cache-control'] || '')
        && (inm.trim() === '*' || inm.split(',').map((x) => x.trim().replace(/^W\//, '')).includes(resHeaders.etag.replace(/^W\//, '')))) {
        this.statusCode = 304;
        ['content-type', 'content-length', 'transfer-encoding'].forEach((h) => delete resHeaders[h]);
      }
      if (this.statusCode === 204 || this.statusCode === 304) text = '';
      onFinish({ status: this.statusCode, headers: { ...resHeaders }, body: text });
      return this;
    },
  };
  return { req, res };
}
