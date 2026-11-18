// A small mongosh-like shell that runs in the browser on in-memory data (query engine: mingo).
// Supports: use/show, db.<coll>.find/findOne/insertOne/insertMany/updateOne/updateMany/replaceOne/
// deleteOne/deleteMany/countDocuments/distinct/aggregate/createIndex/getIndexes/dropIndex/drop,
// findOneAndUpdate/findOneAndDelete, cursor sort/skip/limit/project/count/toArray/forEach/map/explain.
import { Query, aggregate as mingoAggregate, update as mingoUpdate } from 'mingo';

/* ----------------------------- values & cloning ----------------------------- */
const HEX24 = /^[0-9a-f]{24}$/;
let oidCounter = Math.floor(Math.random() * 0xffffff);
export function ObjectId(hex) {
  if (hex != null) {
    const h = String(hex);
    if (!HEX24.test(h)) throw new Error(`BSONError: input must be a 24 character hex string (got '${h}')`);
    return h;
  }
  const t = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  oidCounter = (oidCounter + 1) % 0xffffff;
  return t + 'a1b2c3d4e5' + oidCounter.toString(16).padStart(6, '0');
}
export const ISODate = (s) => (s == null ? new Date() : new Date(s));

export function clone(v) {
  if (v instanceof Date) return new Date(v.getTime());
  if (Array.isArray(v)) return v.map(clone);
  if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = clone(v[k]); return o; }
  return v;
}
// {$date: '...'} (storage format) <-> Date
export function revive(v) {
  if (Array.isArray(v)) return v.map(revive);
  if (v && typeof v === 'object') {
    if (Object.keys(v).length === 1 && typeof v.$date === 'string') return new Date(v.$date);
    const o = {}; for (const k of Object.keys(v)) o[k] = revive(v[k]); return o;
  }
  return v;
}
export function toStorable(v) {
  if (v instanceof Date) return { $date: v.toISOString() };
  if (Array.isArray(v)) return v.map(toStorable);
  if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = toStorable(v[k]); return o; }
  return v;
}

/* --------------------------------- printing --------------------------------- */
const IDENT = /^[A-Za-z_$][\w$]*$/;
function fmtKey(k) { return IDENT.test(k) ? k : `'${k}'`; }
function fmtScalar(v, key) {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (v instanceof Date) return isNaN(v) ? 'Invalid Date' : `ISODate('${v.toISOString()}')`;
  if (typeof v === 'string') return (key === '_id' || key?.endsWith?.('Id')) && HEX24.test(v) ? `ObjectId('${v}')` : `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (typeof v === 'number') return Number.isInteger(v) || !isFinite(v) ? String(v) : String(Math.round(v * 1e6) / 1e6);
  return String(v);
}
export function formatValue(v, indent = 0, key) {
  const pad = '  '.repeat(indent);
  const inner = '  '.repeat(indent + 1);
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    const parts = v.map((x) => formatValue(x, indent + 1));
    const one = `[ ${parts.join(', ')} ]`;
    if (one.length + pad.length <= 76 && !one.includes('\n')) return one;
    return `[\n${parts.map((p) => inner + p).join(',\n')}\n${pad}]`;
  }
  if (v && typeof v === 'object' && !(v instanceof Date)) {
    const keys = Object.keys(v);
    if (!keys.length) return '{}';
    const parts = keys.map((k) => `${fmtKey(k)}: ${formatValue(v[k], indent + 1, k)}`);
    const one = `{ ${parts.join(', ')} }`;
    if (one.length + pad.length <= 76 && !one.includes('\n')) return one;
    return `{\n${parts.map((p) => inner + p).join(',\n')}\n${pad}}`;
  }
  return fmtScalar(v, key);
}

/* ----------------------------- statement splitter ----------------------------- */
export function splitStatements(src) {
  const out = [];
  let buf = '', depth = 0, q = null, i = 0;
  const flush = () => { if (buf.trim()) out.push(buf.trim()); buf = ''; };
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (q) {
      buf += c;
      if (c === '\\') { buf += n ?? ''; i += 2; continue; }
      if (c === q) q = null;
      i++; continue;
    }
    if (c === '/' && n === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && n === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; buf += c; i++; continue; }
    if ('([{'.includes(c)) depth++;
    if (')]}'.includes(c)) depth--;
    if (c === ';' && depth <= 0) { flush(); i++; continue; }
    if (c === '\n' && depth <= 0) {
      let j = i + 1;
      while (j < src.length && /\s/.test(src[j])) j++;
      const nextCh = src[j];
      const last = buf.trimEnd().slice(-1);
      if (nextCh === '.' || /[,+\-*/=&|?:([{]/.test(last)) { buf += c; i++; continue; }
      flush(); i++; continue;
    }
    buf += c; i++;
  }
  flush();
  return out;
}

/* ---------------------------------- errors ---------------------------------- */
// mongosh always prints _id first
function idFirst(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d) || d instanceof Date || !('_id' in d)) return d;
  const { _id, ...rest } = d;
  return { _id, ...rest };
}

class MongoServerError extends Error { constructor(msg, code) { super(msg); this.name = 'MongoServerError'; this.code = code; } }

function hasOperators(u) { return u && typeof u === 'object' && !Array.isArray(u) && Object.keys(u).some((k) => k.startsWith('$')); }

/* ------------------------------ shell instance ------------------------------ */
export function createShell(initial, current) {
  // dbs: { dbName: { collName: [docs] } }, indexes: { 'db.coll': [{ name, key, unique }] }
  const state = { dbs: revive(clone(initial.dbs || {})), indexes: clone(initial.indexes || {}), current: current || Object.keys(initial.dbs || {})[0] || 'test' };

  const coll = (name) => {
    const dbo = state.dbs[state.current] || (state.dbs[state.current] = {});
    return { get docs() { return dbo[name] || (dbo[name] = []); }, exists: () => !!dbo[name], drop: () => { const had = !!dbo[name]; delete dbo[name]; delete state.indexes[`${state.current}.${name}`]; return had; } };
  };
  const idxList = (name) => state.indexes[`${state.current}.${name}`] || [];
  const resolver = (name) => (state.dbs[state.current] || {})[name] || [];

  function checkUnique(name, docs, doc, ignore) {
    const all = [{ key: { _id: 1 }, unique: true, name: '_id_' }, ...idxList(name)].filter((ix) => ix.unique);
    for (const ix of all) {
      const fields = Object.keys(ix.key);
      const val = fields.map((f) => JSON.stringify(f.split('.').reduce((o, k) => (o == null ? o : o[k]), doc)));
      const dup = docs.find((d) => d !== ignore && d !== doc && fields.every((f, i) => JSON.stringify(f.split('.').reduce((o, k) => (o == null ? o : o[k]), d)) === val[i]));
      if (dup) throw new MongoServerError(`E11000 duplicate key error collection: ${state.current}.${name} index: ${ix.name} dup key: { ${fields.map((f, i) => `${f}: ${val[i]}`).join(', ')} }`, 11000);
    }
  }

  class Cursor {
    constructor(name, filter = {}, projection) { this.name = name; this.filter = filter || {}; this.projection = projection; this._sort = null; this._skip = 0; this._limit = 0; }
    sort(s) { this._sort = s; return this; }
    skip(n) { this._skip = n; return this; }
    limit(n) { this._limit = n; return this; }
    project(p) { this.projection = p; return this; }
    pretty() { return this; }
    toArray() {
      let c = new Query(this.filter).find(coll(this.name).docs, this.projection && Object.keys(this.projection).length ? this.projection : undefined);
      if (this._sort) c = c.sort(this._sort);
      if (this._skip) c = c.skip(this._skip);
      if (this._limit) c = c.limit(this._limit);
      return clone(c.all()).map(idFirst);
    }
    count() { return new Query(this.filter).find(coll(this.name).docs).all().length; }
    size() { return this.toArray().length; }
    itcount() { return this.toArray().length; }
    forEach(fn) { this.toArray().forEach(fn); }
    map(fn) { return this.toArray().map(fn); }
    hasNext() { return this.toArray().length > 0; }
    next() { return this.toArray()[0] ?? null; }
    explain() {
      const fields = Object.keys(this.filter).filter((k) => !k.startsWith('$'));
      const ix = [{ key: { _id: 1 }, name: '_id_' }, ...idxList(this.name)].find((x) => fields.length && Object.keys(x.key)[0] === fields[0]);
      const docs = coll(this.name).docs;
      const returned = this.count();
      return {
        queryPlanner: { namespace: `${state.current}.${this.name}`, winningPlan: ix ? { stage: 'FETCH', inputStage: { stage: 'IXSCAN', indexName: ix.name, keyPattern: ix.key } } : { stage: 'COLLSCAN', filter: this.filter } },
        executionStats: { nReturned: returned, totalKeysExamined: ix ? returned : 0, totalDocsExamined: ix ? returned : docs.length },
      };
    }
  }

  function collectionApi(name) {
    const docsOf = () => coll(name).docs;
    const matchIdx = (filter) => { const q = new Query(filter || {}); return docsOf().findIndex((d) => q.test(d)); };
    const api = {
      find: (f, p) => new Cursor(name, f, p),
      findOne: (f, p) => new Cursor(name, f, p).limit(1).toArray()[0] ?? null,
      insertOne(doc) {
        if (!doc || typeof doc !== 'object' || Array.isArray(doc)) throw new MongoServerError('insertOne requires a document');
        const d = clone(doc); if (d._id === undefined) d._id = ObjectId();
        const docs = docsOf(); checkUnique(name, docs, d); docs.push(d);
        return { acknowledged: true, insertedId: d._id };
      },
      insertMany(arr) {
        if (!Array.isArray(arr)) throw new MongoServerError('insertMany requires an array of documents');
        const ids = {};
        arr.forEach((doc, i) => { ids[i] = api.insertOne(doc).insertedId; });
        return { acknowledged: true, insertedIds: ids };
      },
      updateOne(filter, upd, opts = {}) { return doUpdate(filter, upd, opts, false); },
      updateMany(filter, upd, opts = {}) { return doUpdate(filter, upd, opts, true); },
      replaceOne(filter, repl, opts = {}) {
        if (hasOperators(repl)) throw new MongoServerError('Replacement document must not contain atomic operators');
        const i = matchIdx(filter);
        if (i < 0) {
          if (opts.upsert) { const r = api.insertOne(repl); return { acknowledged: true, insertedId: r.insertedId, matchedCount: 0, modifiedCount: 0, upsertedCount: 1 }; }
          return { acknowledged: true, insertedId: null, matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };
        }
        const docs = docsOf(); const nd = { _id: docs[i]._id, ...clone(repl) }; checkUnique(name, docs, nd, docs[i]); docs[i] = nd;
        return { acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 };
      },
      deleteOne(filter) { const i = matchIdx(filter); if (i >= 0) docsOf().splice(i, 1); return { acknowledged: true, deletedCount: i >= 0 ? 1 : 0 }; },
      deleteMany(filter) {
        const q = new Query(filter || {}); const docs = docsOf(); const keep = docs.filter((d) => !q.test(d));
        const n = docs.length - keep.length; docs.length = 0; docs.push(...keep);
        return { acknowledged: true, deletedCount: n };
      },
      countDocuments: (f) => new Cursor(name, f).count(),
      estimatedDocumentCount: () => docsOf().length,
      count: (f) => new Cursor(name, f).count(),
      distinct(field, f) {
        const seen = new Map();
        new Cursor(name, f).toArray().forEach((d) => {
          const v = field.split('.').reduce((o, k) => (o == null ? o : o[k]), d);
          (Array.isArray(v) ? v : [v]).forEach((x) => { if (x !== undefined) seen.set(JSON.stringify(x), x); });
        });
        return [...seen.values()].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
      },
      aggregate(pipeline) {
        if (!Array.isArray(pipeline)) throw new MongoServerError('aggregate() requires an array pipeline: db.coll.aggregate([ { $match: … } ])');
        const out = clone(mingoAggregate(docsOf(), pipeline, { collectionResolver: resolver })).map(idFirst);
        const outStage = pipeline.find((s) => s.$out);
        if (outStage) { const target = coll(outStage.$out); target.docs.length = 0; target.docs.push(...clone(out)); return []; }
        return out;
      },
      findOneAndUpdate(filter, upd, opts = {}) {
        const i = matchIdx(filter); if (i < 0) return null;
        const before = clone(docsOf()[i]);
        doUpdate({ _id: before._id }, upd, {}, false);
        return opts.returnDocument === 'after' || opts.returnNewDocument ? clone(docsOf().find((d) => JSON.stringify(d._id) === JSON.stringify(before._id))) : before;
      },
      findOneAndDelete(filter) { const i = matchIdx(filter); if (i < 0) return null; return docsOf().splice(i, 1)[0]; },
      createIndex(key, opts = {}) {
        if (!key || typeof key !== 'object') throw new MongoServerError('createIndex requires a key document like { email: 1 }');
        const ixName = opts.name || Object.entries(key).map(([k, v]) => `${k}_${v}`).join('_');
        const list = state.indexes[`${state.current}.${name}`] || (state.indexes[`${state.current}.${name}`] = []);
        if (!list.find((x) => x.name === ixName)) {
          const ix = { name: ixName, key, ...(opts.unique ? { unique: true } : {}) };
          if (ix.unique) { const docs = docsOf(); docs.forEach((d) => { list.push(ix); try { checkUnique(name, docs, d); } finally { list.pop(); } }); }
          list.push(ix);
        }
        docsOf();
        return ixName;
      },
      getIndexes: () => [{ v: 2, key: { _id: 1 }, name: '_id_' }, ...idxList(name).map((x) => ({ v: 2, ...x }))],
      dropIndex(n) {
        const list = state.indexes[`${state.current}.${name}`] || [];
        const i = list.findIndex((x) => x.name === n || JSON.stringify(x.key) === JSON.stringify(n));
        if (i < 0) throw new MongoServerError(`index not found with name [${typeof n === 'string' ? n : JSON.stringify(n)}]`);
        list.splice(i, 1); return { nIndexesWas: list.length + 2, ok: 1 };
      },
      drop: () => coll(name).drop(),
    };
    function doUpdate(filter, upd, opts, many) {
      if (!hasOperators(upd) && !Array.isArray(upd)) throw new MongoServerError('Update document requires atomic operators (e.g. { $set: { … } }). To replace a whole document use replaceOne().');
      const q = new Query(filter || {});
      const docs = docsOf();
      const targets = many ? docs.filter((d) => q.test(d)) : docs.filter((d) => q.test(d)).slice(0, 1);
      let modified = 0;
      for (const d of targets) {
        const before = JSON.stringify(toStorable(d));
        const copy = clone(d);
        mingoUpdate(copy, upd);
        checkUnique(name, docs, copy, d);
        if (JSON.stringify(toStorable(copy)) !== before) { Object.keys(d).forEach((k) => delete d[k]); Object.assign(d, copy); modified++; }
      }
      if (!targets.length && opts.upsert) {
        const base = {};
        Object.entries(filter || {}).forEach(([k, v]) => { if (!k.startsWith('$') && (v === null || typeof v !== 'object' || v instanceof Date || Array.isArray(v))) base[k] = clone(v); else if (v && typeof v === 'object' && '$eq' in v) base[k] = clone(v.$eq); });
        const { $setOnInsert, ...rest } = upd;
        if (Object.keys(rest).length) mingoUpdate(base, rest);
        if ($setOnInsert) Object.assign(base, clone($setOnInsert));
        const r = api.insertOne(base);
        return { acknowledged: true, insertedId: r.insertedId, matchedCount: 0, modifiedCount: 0, upsertedCount: 1 };
      }
      return { acknowledged: true, insertedId: null, matchedCount: targets.length, modifiedCount: modified, upsertedCount: 0 };
    }
    return api;
  }

  const dbApi = {
    getName: () => state.current,
    getCollectionNames: () => Object.keys(state.dbs[state.current] || {}).sort(),
    createCollection: (n) => { coll(n).docs; return { ok: 1 }; },
    dropDatabase: () => { delete state.dbs[state.current]; return { ok: 1, dropped: state.current }; },
    getSiblingDB: (n) => { state.current = n; return db; },
    getCollection: (n) => collectionApi(n),
    stats: () => ({ db: state.current, collections: Object.keys(state.dbs[state.current] || {}).length, objects: Object.values(state.dbs[state.current] || {}).reduce((s, c) => s + c.length, 0) }),
  };
  const db = new Proxy({}, {
    get(_, prop) {
      if (typeof prop === 'symbol') return undefined;
      if (prop === 'toString' || prop === 'valueOf') return () => state.current;
      if (prop in dbApi) return dbApi[prop];
      return collectionApi(String(prop));
    },
  });

  /* run a script; returns [{ input, kind: 'docs'|'value'|'print'|'error'|'info', text, docs? }] */
  function run(src) {
    const results = [];
    const stmts = splitStatements(src);
    const program = [];
    const pushOut = (stmt, value) => {
      if (value instanceof Cursor) { const docs = value.toArray(); results.push({ input: stmt, kind: 'docs', docs, text: docs.length ? docs.map((d) => formatValue(d)).join('\n') : '(no documents found)' }); return; }
      if (value === undefined) return;
      if (Array.isArray(value) && value.every((x) => x && typeof x === 'object' && !(x instanceof Date))) { results.push({ input: stmt, kind: 'docs', docs: value, text: value.length ? formatValue(value) : '[]' }); return; }
      if (value === db) { results.push({ input: stmt, kind: 'value', text: state.current }); return; }
      results.push({ input: stmt, kind: 'value', text: formatValue(value), value });
    };
    const print = (...a) => { results.push({ input: null, kind: 'print', text: a.map((x) => (typeof x === 'string' ? x : formatValue(x))).join(' ') }); };
    for (let s of stmts) {
      const use = s.match(/^use\s+([\w-]+)\s*$/);
      if (use) { program.push(`__use(${JSON.stringify(use[1])});`); continue; }
      if (/^show\s+(dbs|databases)\s*$/.test(s)) { program.push('__show("dbs");'); continue; }
      if (/^show\s+collections\s*$/.test(s) || /^show\s+tables\s*$/.test(s)) { program.push('__show("collections");'); continue; }
      if (/^(it|exit|quit|cls)\s*$/.test(s)) continue;
      if (/^(const|let|var|function|if|for|while|class|try|do|switch)\b/.test(s) || /^[A-Za-z_$][\w$]*\s*=[^=]/.test(s)) program.push(`${s};`);
      else program.push(`__out(${JSON.stringify(s)}, (${s}));`);
    }
    const __use = (n) => { state.current = n; results.push({ input: `use ${n}`, kind: 'info', text: `switched to db ${n}` }); };
    const __show = (what) => {
      if (what === 'dbs') results.push({ input: 'show dbs', kind: 'info', text: Object.keys(state.dbs).map((n) => `${n.padEnd(12)} ${Object.values(state.dbs[n]).reduce((s, c) => s + c.length, 0)} documents`).join('\n') || '(no databases)' });
      else results.push({ input: 'show collections', kind: 'info', text: dbApi.getCollectionNames().join('\n') || '(no collections)' });
    };
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('db', 'ObjectId', 'ISODate', 'print', 'printjson', '__out', '__use', '__show', `"use strict";\n${program.join('\n')}`);
      fn(db, ObjectId, ISODate, print, (x) => print(formatValue(x)), pushOut, __use, __show);
    } catch (e) {
      let msg = `${e.name || 'Error'}: ${e.message}`;
      if (e instanceof SyntaxError) msg = `SyntaxError: ${e.message}. Check brackets, commas and quotes.`;
      else if (e instanceof ReferenceError && /\$\w+ is not defined/.test(e.message)) msg = `${msg}. Operators like $gt must be keys inside an object, e.g. { price: { $gt: 500 } }.`;
      else if (e instanceof TypeError && /is not a function/.test(e.message)) msg = `TypeError: ${e.message}. Check the method name (e.g. find, insertOne, updateMany, aggregate).`;
      results.push({ input: null, kind: 'error', text: msg });
    }
    return results;
  }

  return { run, state, snapshot: () => ({ dbs: toStorable(state.dbs), indexes: clone(state.indexes), current: state.current }) };
}

// Fresh shell from the datasets file format { name: { collections: { coll: [docs] } } }.
export function shellFromDatasets(datasets, current) {
  const dbs = {};
  Object.entries(datasets).forEach(([n, ds]) => { dbs[n] = clone(ds.collections); });
  return createShell({ dbs, indexes: {} }, current);
}

// Canonical comparison used by challenges.
export function canonical(v, ordered = true) {
  const s = (x) => JSON.stringify(toStorable(x), (k, val) => (val && typeof val === 'object' && !Array.isArray(val) ? Object.keys(val).sort().reduce((o, kk) => { o[kk] = val[kk]; return o; }, {}) : val));
  if (Array.isArray(v) && !ordered) return JSON.stringify(v.map(s).sort());
  return s(v);
}
