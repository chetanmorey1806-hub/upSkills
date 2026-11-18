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
      keys.push(m[1] || '0');
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

function matchPath(layer, path) {
  const m = layer.match.re.exec(path);
  if (!m) return null;
  const params = {};
  layer.match.keys.forEach((k, idx) => {
    const v = m[idx + 1];
    if (v === undefined) return;
    params[k] = k === '0' || /^\*/.test(k) ? v : decodeURIComponent(v);
  });
  return { params, matched: m[0] };
}

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

function makeRouter() {
  const stack = [];
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
  router.param = () => router;

  router.handle = (req, res, done) => {
    let idx = 0;
    const basePath = req.__path ?? req.path;
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
      req.params = { ...(req.__parentParams || {}), ...m.params };
      const isErrHandler = layer.fn.length === 4;
      if (err && !isErrHandler) return next(err);
      if (!err && isErrHandler) return next();
      const call = () => {
        if (layer.kind === 'use') {
          const prevBase = req.baseUrl;
          const removed = m.matched === '/' ? '' : m.matched;
          if (layer.fn.__isRouter) {
            const parentParams = req.params;
            req.baseUrl = prevBase + removed;
            req.__path = path.slice(removed.length) || '/';
            req.__parentParams = parentParams;
            req.url = req.__path + (req.__search || '');
            return layer.fn.handle(req, res, (e) => {
              req.baseUrl = prevBase; req.__path = basePath; req.url = basePath + (req.__search || ''); req.__parentParams = undefined;
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
  express.Router = () => makeRouter();
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
    json(obj) { if (!resHeaders['content-type']) resHeaders['content-type'] = 'application/json; charset=utf-8'; return this.__end(JSON.stringify(obj === undefined ? null : obj)); },
    send(b) {
      if (b === undefined) return this.__end('');
      if (typeof b === 'object' && b !== null) return this.json(b);
      if (typeof b === 'number') { this.statusCode = b; return this.__end(STATUS_TEXT[b] || String(b)); }
      if (!resHeaders['content-type']) resHeaders['content-type'] = 'text/html; charset=utf-8';
      return this.__end(String(b));
    },
    sendStatus(c) { this.statusCode = c; resHeaders['content-type'] = 'text/plain; charset=utf-8'; return this.__end(STATUS_TEXT[c] || String(c)); },
    end(b) { return this.__end(b == null ? '' : String(b)); },
    redirect(a, b) { const [code, loc] = typeof a === 'number' ? [a, b] : [302, a]; this.statusCode = code; resHeaders.location = loc; return this.__end(`Found. Redirecting to ${loc}`); },
    cookie(n, v) { resHeaders['set-cookie'] = `${n}=${v}; Path=/`; return this; },
    clearCookie(n) { resHeaders['set-cookie'] = `${n}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`; return this; },
    render(view, data) { return this.send(`<!-- rendered view "${view}" -->\n${JSON.stringify(data || {}, null, 2)}`); },
    format(obj) { return (obj.json || obj.default || Object.values(obj)[0])(); },
    __end(text) {
      if (this.headersSent) throw new Error('Cannot set headers after they are sent to the client');
      this.headersSent = true;
      if (this.statusCode === 204 || this.statusCode === 304) text = '';
      onFinish({ status: this.statusCode, headers: { ...resHeaders }, body: text });
      return this;
    },
  };
  return { req, res };
}
