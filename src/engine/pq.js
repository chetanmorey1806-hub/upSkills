// Mini Power Query simulator: applies steps to a table and generates M code.
// table = { cols: [names], types: {name: 'any'|'text'|'number'|'date'}, rows: [ {name: value} ] }
export const ERR = { __err: 'DataFormat.Error' };
export const isErrV = (v) => v && typeof v === 'object' && v.__err;

const rawTable = (header, data) => {
  const cols = header.map((_, i) => `Column${i + 1}`);
  const rows = [header, ...data].map((r) => Object.fromEntries(cols.map((c, i) => [c, r[i] === undefined ? null : r[i]])));
  return { cols, types: Object.fromEntries(cols.map((c) => [c, 'any'])), rows };
};

export const SOURCES = {
  SalesRaw: {
    file: 'Sales_Q1.csv',
    note: 'A messy sales export: headers in the first row, a blank row, a duplicate order, Region only filled on some rows, "N/A" quantities, inconsistent text case and extra spaces, and "Customer - City" in one column.',
    table: rawTable(
      ['Order ID', 'Order Date', 'Customer - City', 'Region', 'Product', 'Qty', 'Unit Price'],
      [
        ['1001', '2024-01-05', 'Asha Traders - pune', 'West', 'laptop', '2', '55000'],
        ['1002', '2024-01-07', 'Ravi Stores - Mumbai', null, 'MOBILE', '3', '18000'],
        ['1003', '2024-01-09', '  Om Electronics - Pune ', null, 'Keyboard', 'N/A', '1500'],
        ['', '', '', null, '', '', ''],
        ['1004', '2024-02-11', 'Neha Enterprises - Nagpur', 'Central', 'headphones', '5', '2500'],
        ['1004', '2024-02-11', 'Neha Enterprises - Nagpur', 'Central', 'headphones', '5', '2500'],
        ['1005', '2024-02-15', 'Kiran Mart - Nashik', null, 'Desk', '1', '12000'],
        ['1006', '2024-03-02', 'Sai Furnishers - Mumbai', 'West', 'office chair', '4', '9000'],
        ['1007', '2024-03-20', 'Asha Traders - Pune', null, 'Mobile', '2', '18000'],
      ]
    ),
  },
  TargetsWide: {
    file: 'Targets_2024.xlsx',
    note: 'Monthly targets in a wide (cross-tab) layout: one column per month. Good for practising Unpivot.',
    table: rawTable(
      ['Region', 'Jan', 'Feb', 'Mar'],
      [
        ['West', '150000', '160000', '170000'],
        ['Central', '90000', '95000', '100000'],
        ['North', '120000', '118000', '125000'],
        ['South', '110000', '115000', '119000'],
      ]
    ),
  },
};

// lookup + append tables (already clean, with headers)
export const LOOKUP = {
  name: 'RegionManagers',
  rows: [
    { Region: 'West', Manager: 'Priya Desai' },
    { Region: 'Central', Manager: 'Imran Khan' },
    { Region: 'North', Manager: 'Karan Mehta' },
  ],
};
export const APPEND_ROWS = {
  name: 'Sales_Apr',
  rows: [
    { 'Order ID': '1008', 'Order Date': '2024-04-03', 'Customer - City': 'Ravi Stores - Mumbai', Region: 'West', Product: 'Laptop', Qty: '1', 'Unit Price': '56000' },
    { 'Order ID': '1009', 'Order Date': '2024-04-18', 'Customer - City': 'Kiran Mart - Nashik', Region: 'West', Product: 'Desk', Qty: '2', 'Unit Price': '12000' },
  ],
};

// ---------- operations ----------
const C = (name) => ({ key: name, type: 'col', label: 'Column' });
export const OPS = {
  promote: { label: 'Use First Row as Headers', menu: 'Home > Use First Row as Headers', params: [] },
  removeCols: { label: 'Remove Columns', menu: 'Home > Remove Columns', params: [{ key: 'cols', type: 'cols', label: 'Columns to remove' }] },
  keepCols: { label: 'Remove Other Columns (keep selected)', menu: 'Home > Remove Columns > Remove Other Columns', params: [{ key: 'cols', type: 'cols', label: 'Columns to keep' }] },
  removeBlank: { label: 'Remove Blank Rows', menu: 'Home > Remove Rows > Remove Blank Rows', params: [] },
  removeTop: { label: 'Remove Top Rows', menu: 'Home > Remove Rows > Remove Top Rows', params: [{ key: 'n', type: 'number', label: 'Number of rows' }] },
  keepTop: { label: 'Keep Top Rows', menu: 'Home > Keep Rows > Keep Top Rows', params: [{ key: 'n', type: 'number', label: 'Number of rows' }] },
  dedupe: { label: 'Remove Duplicates', menu: 'Home > Remove Rows > Remove Duplicates (select all columns first)', params: [] },
  changeType: { label: 'Change Type', menu: 'Transform > Data Type', params: [C('col'), { key: 'to', type: 'select', label: 'Type', options: ['number', 'text', 'date'] }] },
  rename: { label: 'Rename Column', menu: 'Double-click the column header', params: [C('col'), { key: 'name', type: 'text', label: 'New name' }] },
  replace: { label: 'Replace Values', menu: 'Transform > Replace Values', params: [C('col'), { key: 'find', type: 'text', label: 'Value to find' }, { key: 'with', type: 'text', label: 'Replace with' }] },
  format: { label: 'Format Text', menu: 'Transform > Format', params: [C('col'), { key: 'fn', type: 'select', label: 'Format', options: ['Trim', 'Clean', 'UPPERCASE', 'lowercase', 'Capitalize Each Word'] }] },
  split: { label: 'Split Column by Delimiter', menu: 'Home > Split Column > By Delimiter', params: [C('col'), { key: 'delim', type: 'text', label: 'Delimiter', placeholder: ' - ' }] },
  extract: { label: 'Extract Text', menu: 'Transform > Extract', params: [C('col'), { key: 'how', type: 'select', label: 'Extract', options: ['Text Before Delimiter', 'Text After Delimiter', 'First Characters', 'Last Characters', 'Length'] }, { key: 'arg', type: 'text', label: 'Delimiter / count' }] },
  mergeCols: { label: 'Merge Columns', menu: 'Transform > Merge Columns', params: [{ key: 'cols', type: 'cols', label: 'Columns (in order)' }, { key: 'sep', type: 'text', label: 'Separator', placeholder: ' ' }, { key: 'name', type: 'text', label: 'New column name' }] },
  filter: { label: 'Filter Rows', menu: 'Column header ▾ > Text/Number Filters', params: [C('col'), { key: 'op', type: 'select', label: 'Condition', options: ['equals', 'does not equal', 'contains', 'is greater than', 'is less than', 'is not null'] }, { key: 'value', type: 'text', label: 'Value' }] },
  sort: { label: 'Sort', menu: 'Column header ▾ > Sort Ascending / Descending', params: [C('col'), { key: 'dir', type: 'select', label: 'Order', options: ['Ascending', 'Descending'] }] },
  fillDown: { label: 'Fill Down', menu: 'Transform > Fill > Down', params: [C('col')] },
  fillUp: { label: 'Fill Up', menu: 'Transform > Fill > Up', params: [C('col')] },
  unpivot: { label: 'Unpivot Other Columns', menu: 'Select the ID column(s) > Transform > Unpivot Columns > Unpivot Other Columns', params: [{ key: 'cols', type: 'cols', label: 'Columns to keep (IDs)' }, { key: 'attr', type: 'text', label: 'Attribute column name', placeholder: 'Attribute' }, { key: 'val', type: 'text', label: 'Value column name', placeholder: 'Value' }] },
  pivot: { label: 'Pivot Column', menu: 'Transform > Pivot Column', params: [{ key: 'col', type: 'col', label: 'Column whose values become headers' }, { key: 'valCol', type: 'col', label: 'Values column' }, { key: 'agg', type: 'select', label: 'Aggregate', options: ['Sum', 'Count', "Don't Aggregate"] }] },
  group: { label: 'Group By', menu: 'Home > Group By', params: [{ key: 'by', type: 'col', label: 'Group by' }, { key: 'agg', type: 'select', label: 'Operation', options: ['Sum', 'Average', 'Count Rows', 'Max', 'Min'] }, { key: 'valCol', type: 'col', label: 'Column (not needed for Count Rows)' }, { key: 'name', type: 'text', label: 'New column name' }] },
  conditional: { label: 'Add Conditional Column', menu: 'Add Column > Conditional Column', params: [{ key: 'name', type: 'text', label: 'New column name' }, C('col'), { key: 'op', type: 'select', label: 'Operator', options: ['is greater than', 'is less than', 'equals', 'does not equal'] }, { key: 'value', type: 'text', label: 'Value' }, { key: 'then', type: 'text', label: 'Output (then)' }, { key: 'else', type: 'text', label: 'Else' }] },
  custom: { label: 'Add Custom Column', menu: 'Add Column > Custom Column', params: [{ key: 'name', type: 'text', label: 'New column name' }, { key: 'formula', type: 'text', label: 'Formula, e.g. [Qty] * [Unit Price]' }] },
  merge: { label: `Merge Queries with ${LOOKUP.name} (Left Outer)`, menu: 'Home > Merge Queries', params: [{ key: 'col', type: 'col', label: 'Matching column (Region)' }] },
  append: { label: `Append Queries: ${APPEND_ROWS.name}`, menu: 'Home > Append Queries', params: [] },
};

// ---------- helpers ----------
const clone = (t) => ({ cols: [...t.cols], types: { ...t.types }, rows: t.rows.map((r) => ({ ...r })) });
const need = (t, c) => { if (!t.cols.includes(c)) throw new Error(`The column '${c}' of the table wasn't found.`); };
const isBlank = (v) => v === null || v === '';
const toNumber = (v) => { if (v === null || isErrV(v)) return v; if (typeof v === 'number') return v; const s = String(v).trim(); if (s === '' ) return null; const n = Number(s.replace(/,/g, '')); return Number.isNaN(n) ? ERR : n; };
const toText = (v) => (v === null ? null : isErrV(v) ? v : String(v));
const cmp = (a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a ?? '').localeCompare(String(b ?? '')));
const parseLit = (s, type) => (type === 'number' && s !== '' && !Number.isNaN(Number(s)) ? Number(s) : s);
const properCase = (s) => s.toLowerCase().replace(/(^|[^a-z])([a-z])/g, (m, a, b) => a + b.toUpperCase());

function evalCustom(formula, row) {
  // supports [Col] references, numbers, "text", + - * / & and parentheses
  const src = formula.replace(/\[([^\]]+)\]/g, (m, c) => `__r(${JSON.stringify(c)})`);
  if (/[^\s\w.()+\-*/&",'_:]/.test(src.replace(/__r\("[^"]*"\)/g, ''))) throw new Error('Only [Column] references, numbers, "text" and + - * / & are allowed here.');
  const r = (c) => { if (!(c in row)) throw new Error(`The field '${c}' of the record wasn't found.`); return row[c]; };
  // & is text concatenation in M
  const js = src.replace(/&/g, '+""+');
  // eslint-disable-next-line no-new-func
  const fn = new Function('__r', `return (${js});`);
  const v = fn(r);
  return typeof v === 'number' && !Number.isFinite(v) ? null : v;
}

const condTest = (v, op, raw) => {
  const lit = typeof v === 'number' ? parseLit(raw, 'number') : raw;
  switch (op) {
    case 'equals': return String(v ?? '').toLowerCase() === String(lit).toLowerCase();
    case 'does not equal': return String(v ?? '').toLowerCase() !== String(lit).toLowerCase();
    case 'contains': return String(v ?? '').toLowerCase().includes(String(raw).toLowerCase());
    case 'is greater than': return v !== null && cmp(v, lit) > 0;
    case 'is less than': return v !== null && cmp(v, lit) < 0;
    case 'is not null': return !isBlank(v);
    default: return true;
  }
};

export function applyStep(t0, s) {
  const p = s.params || {};
  let t = clone(t0);
  switch (s.op) {
    case 'promote': {
      if (!t.rows.length) throw new Error('No rows to promote.');
      const first = t.rows[0];
      const names = []; t.cols.forEach((c, i) => { let n = isBlank(first[c]) ? `Column${i + 1}` : String(first[c]); while (names.includes(n)) n += '_1'; names.push(n); });
      return { cols: names, types: Object.fromEntries(names.map((n) => [n, 'any'])), rows: t.rows.slice(1).map((r) => Object.fromEntries(t.cols.map((c, i) => [names[i], r[c]]))) };
    }
    case 'removeCols': (p.cols || []).forEach((c) => need(t, c)); t.cols = t.cols.filter((c) => !p.cols.includes(c)); t.rows.forEach((r) => p.cols.forEach((c) => delete r[c])); return t;
    case 'keepCols': (p.cols || []).forEach((c) => need(t, c)); t.cols = t.cols.filter((c) => p.cols.includes(c)); t.rows = t.rows.map((r) => Object.fromEntries(t.cols.map((c) => [c, r[c]]))); return t;
    case 'removeBlank': t.rows = t.rows.filter((r) => !t.cols.every((c) => isBlank(r[c]))); return t;
    case 'removeTop': t.rows = t.rows.slice(Number(p.n) || 0); return t;
    case 'keepTop': t.rows = t.rows.slice(0, Number(p.n) || 0); return t;
    case 'dedupe': { const seen = new Set(); t.rows = t.rows.filter((r) => { const k = JSON.stringify(t.cols.map((c) => r[c])); if (seen.has(k)) return false; seen.add(k); return true; }); return t; }
    case 'changeType': need(t, p.col); t.types[p.col] = p.to; t.rows.forEach((r) => { r[p.col] = p.to === 'number' ? toNumber(r[p.col]) : p.to === 'date' ? (isBlank(r[p.col]) ? null : /^\d{4}-\d{2}-\d{2}$/.test(String(r[p.col]).trim()) ? String(r[p.col]).trim() : ERR) : toText(r[p.col]); }); return t;
    case 'rename': need(t, p.col); if (!p.name) throw new Error('Enter a new name.'); if (t.cols.includes(p.name)) throw new Error(`A column named '${p.name}' already exists.`);
      t.cols = t.cols.map((c) => (c === p.col ? p.name : c)); t.types[p.name] = t.types[p.col]; delete t.types[p.col]; t.rows = t.rows.map((r) => Object.fromEntries(t.cols.map((c) => [c, c === p.name ? r[p.col] : r[c]]))); return t;
    case 'replace': need(t, p.col); t.rows.forEach((r) => { const v = r[p.col]; const match = p.find === 'null' ? v === null : String(v ?? '') === p.find; if (match) r[p.col] = t.types[p.col] === 'number' ? parseLit(p.with, 'number') : p.with; }); return t;
    case 'format': need(t, p.col); t.rows.forEach((r) => { const v = r[p.col]; if (v === null || isErrV(v)) return; const s2 = String(v);
      r[p.col] = p.fn === 'Trim' ? s2.trim() : p.fn === 'Clean' ? s2.replace(/[\x00-\x1f]/g, '') : p.fn === 'UPPERCASE' ? s2.toUpperCase() : p.fn === 'lowercase' ? s2.toLowerCase() : properCase(s2); }); return t;
    case 'split': {
      need(t, p.col); const d = p.delim || ' - ';
      const n = Math.max(...t.rows.map((r) => (r[p.col] == null ? 1 : String(r[p.col]).split(d).length)));
      const newCols = Array.from({ length: n }, (_, i) => `${p.col}.${i + 1}`);
      const idx = t.cols.indexOf(p.col);
      t.cols = [...t.cols.slice(0, idx), ...newCols, ...t.cols.slice(idx + 1)];
      delete t.types[p.col]; newCols.forEach((c) => { t.types[c] = 'text'; });
      t.rows = t.rows.map((r) => { const parts = r[p.col] == null ? [] : String(r[p.col]).split(d); const o = {}; t.cols.forEach((c) => { o[c] = newCols.includes(c) ? (parts[newCols.indexOf(c)] ?? null) : r[c]; }); return o; });
      return t;
    }
    case 'extract': need(t, p.col); t.rows.forEach((r) => { const v = r[p.col]; if (v === null || isErrV(v)) return; const s2 = String(v); const a = p.arg ?? '';
      r[p.col] = p.how === 'Text Before Delimiter' ? (s2.includes(a) ? s2.slice(0, s2.indexOf(a)) : s2)
        : p.how === 'Text After Delimiter' ? (s2.includes(a) ? s2.slice(s2.indexOf(a) + a.length) : '')
        : p.how === 'First Characters' ? s2.slice(0, Number(a) || 0) : p.how === 'Last Characters' ? s2.slice(-(Number(a) || 0) || s2.length) : s2.length; });
      if (p.how === 'Length') t.types[p.col] = 'number';
      return t;
    case 'mergeCols': {
      const cols = p.cols || []; if (cols.length < 2) throw new Error('Select at least two columns.'); cols.forEach((c) => need(t, c));
      const name = p.name || 'Merged'; const idx = t.cols.indexOf(cols[0]);
      const rest = t.cols.filter((c) => !cols.includes(c));
      t.cols = [...rest.slice(0, Math.min(idx, rest.length)), name, ...rest.slice(Math.min(idx, rest.length))];
      t.types[name] = 'text'; cols.forEach((c) => delete t.types[c]);
      t.rows = t.rows.map((r) => { const o = {}; t.cols.forEach((c) => { o[c] = c === name ? cols.map((x) => r[x] ?? '').join(p.sep ?? ' ') : r[c]; }); return o; });
      return t;
    }
    case 'filter': need(t, p.col); t.rows = t.rows.filter((r) => condTest(r[p.col], p.op, p.value ?? '')); return t;
    case 'sort': need(t, p.col); t.rows.sort((a, b) => (p.dir === 'Descending' ? -1 : 1) * cmp(a[p.col], b[p.col])); return t;
    case 'fillDown': case 'fillUp': {
      need(t, p.col); const rows = s.op === 'fillUp' ? [...t.rows].reverse() : t.rows; let last = null;
      rows.forEach((r) => { if (r[p.col] === null) r[p.col] = last; else last = r[p.col]; }); return t;
    }
    case 'unpivot': {
      const keep = p.cols || []; keep.forEach((c) => need(t, c));
      const attr = p.attr || 'Attribute', val = p.val || 'Value';
      const others = t.cols.filter((c) => !keep.includes(c));
      const rows = []; t.rows.forEach((r) => others.forEach((c) => { if (r[c] !== null) rows.push({ ...Object.fromEntries(keep.map((k) => [k, r[k]])), [attr]: c, [val]: r[c] }); }));
      return { cols: [...keep, attr, val], types: { ...Object.fromEntries(keep.map((k) => [k, t.types[k]])), [attr]: 'text', [val]: 'any' }, rows };
    }
    case 'pivot': {
      need(t, p.col); need(t, p.valCol);
      const heads = [...new Set(t.rows.map((r) => String(r[p.col])))];
      const ids = t.cols.filter((c) => c !== p.col && c !== p.valCol);
      const map = new Map();
      t.rows.forEach((r) => { const k = JSON.stringify(ids.map((c) => r[c])); if (!map.has(k)) map.set(k, { base: Object.fromEntries(ids.map((c) => [c, r[c]])), vals: {} }); const g = map.get(k); (g.vals[r[p.col]] ||= []).push(r[p.valCol]); });
      const rows = [...map.values()].map((g) => ({ ...g.base, ...Object.fromEntries(heads.map((h) => { const v = g.vals[h] || []; if (p.agg === 'Count') return [h, v.length]; if (p.agg === 'Sum') return [h, v.length ? v.reduce((a, b) => a + (Number(b) || 0), 0) : null]; if (v.length > 1) return [h, ERR]; return [h, v[0] ?? null]; })) }));
      return { cols: [...ids, ...heads], types: { ...Object.fromEntries(ids.map((c) => [c, t.types[c]])), ...Object.fromEntries(heads.map((h) => [h, p.agg === "Don't Aggregate" ? 'any' : 'number'])) }, rows };
    }
    case 'group': {
      need(t, p.by); if (p.agg !== 'Count Rows') need(t, p.valCol);
      const name = p.name || (p.agg === 'Count Rows' ? 'Count' : `${p.agg} of ${p.valCol}`);
      if (p.agg !== 'Count Rows' && t.types[p.valCol] !== 'number') throw new Error(`Change the type of '${p.valCol}' to number before aggregating (Expression.Error: cannot apply ${p.agg} to text).`);
      const g = new Map(); t.rows.forEach((r) => { const k = r[p.by]; if (!g.has(k)) g.set(k, []); g.get(k).push(r); });
      const rows = [...g.entries()].map(([k, rs]) => {
        const v = rs.map((r) => r[p.valCol]).filter((x) => typeof x === 'number');
        const agg = p.agg === 'Count Rows' ? rs.length : p.agg === 'Sum' ? v.reduce((a, b) => a + b, 0) : p.agg === 'Average' ? (v.length ? v.reduce((a, b) => a + b, 0) / v.length : null) : p.agg === 'Max' ? (v.length ? Math.max(...v) : null) : (v.length ? Math.min(...v) : null);
        return { [p.by]: k, [name]: agg };
      });
      return { cols: [p.by, name], types: { [p.by]: t.types[p.by], [name]: 'number' }, rows };
    }
    case 'conditional': {
      need(t, p.col); const name = p.name || 'Custom'; if (t.cols.includes(name)) throw new Error(`A column named '${name}' already exists.`);
      t.cols.push(name); t.types[name] = 'text';
      t.rows.forEach((r) => { r[name] = condTest(r[p.col], p.op, p.value ?? '') ? p.then : p.else; }); return t;
    }
    case 'custom': {
      const name = p.name || 'Custom'; if (t.cols.includes(name)) throw new Error(`A column named '${name}' already exists.`);
      if (!p.formula) throw new Error('Enter a formula.');
      t.cols.push(name); t.types[name] = 'any';
      t.rows.forEach((r) => { try { const v = evalCustom(p.formula, r); r[name] = typeof v === 'string' && /[-*/]/.test(p.formula) && Number.isNaN(Number(v)) ? ERR : v; } catch (e) { if (/wasn't found|allowed/.test(e.message)) throw e; r[name] = ERR; } });
      if (t.rows.every((r) => typeof r[name] === 'number' || r[name] === null)) t.types[name] = 'number';
      return t;
    }
    case 'merge': {
      need(t, p.col);
      t.cols.push('Manager'); t.types.Manager = 'text';
      t.rows.forEach((r) => { const m = LOOKUP.rows.find((x) => String(x.Region).toLowerCase() === String(r[p.col] ?? '').toLowerCase()); r.Manager = m ? m.Manager : null; });
      return t;
    }
    case 'append': {
      const extra = APPEND_ROWS.rows.map((r) => Object.fromEntries(t.cols.map((c) => [c, c in r ? (t.types[c] === 'number' ? toNumber(r[c]) : r[c]) : null])));
      if (!t.cols.some((c) => c in APPEND_ROWS.rows[0])) throw new Error('Append matches columns by NAME. Promote headers first so the column names match Sales_Apr.');
      t.rows = [...t.rows, ...extra]; return t;
    }
    default: throw new Error('Unknown step');
  }
}

// ---------- M code ----------
const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
const id = (n) => (/^[A-Za-z_][A-Za-z0-9_]*$/.test(n) ? n : `#${q(n)}`);
const mType = { number: 'type number', text: 'type text', date: 'type date' };
const listQ = (a) => `{${a.map(q).join(', ')}}`;
const mCond = (col, op, v) => {
  const lit = v !== '' && !Number.isNaN(Number(v)) ? v : q(v);
  return { equals: `[${col}] = ${lit}`, 'does not equal': `[${col}] <> ${lit}`, contains: `Text.Contains([${col}], ${q(v)})`, 'is greater than': `[${col}] > ${lit}`, 'is less than': `[${col}] < ${lit}`, 'is not null': `[${col}] <> null` }[op];
};

export function stepM(s, prev, tBefore) {
  const p = s.params || {};
  switch (s.op) {
    case 'promote': return `Table.PromoteHeaders(${prev}, [PromoteAllScalars=true])`;
    case 'removeCols': return `Table.RemoveColumns(${prev}, ${listQ(p.cols || [])})`;
    case 'keepCols': return `Table.SelectColumns(${prev}, ${listQ(p.cols || [])})`;
    case 'removeBlank': return `Table.SelectRows(${prev}, each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null})))`;
    case 'removeTop': return `Table.Skip(${prev}, ${Number(p.n) || 0})`;
    case 'keepTop': return `Table.FirstN(${prev}, ${Number(p.n) || 0})`;
    case 'dedupe': return `Table.Distinct(${prev})`;
    case 'changeType': return `Table.TransformColumnTypes(${prev}, {{${q(p.col)}, ${mType[p.to]}}})`;
    case 'rename': return `Table.RenameColumns(${prev}, {{${q(p.col)}, ${q(p.name)}}})`;
    case 'replace': {
      const isNum = tBefore?.types[p.col] === 'number';
      const f = p.find === 'null' ? 'null' : isNum && !Number.isNaN(Number(p.find)) ? p.find : q(p.find);
      const w = isNum && !Number.isNaN(Number(p.with)) ? p.with : q(p.with);
      return `Table.ReplaceValue(${prev}, ${f}, ${w}, Replacer.ReplaceValue, {${q(p.col)}})`;
    }
    case 'format': { const fn = { Trim: 'Text.Trim', Clean: 'Text.Clean', UPPERCASE: 'Text.Upper', lowercase: 'Text.Lower', 'Capitalize Each Word': 'Text.Proper' }[p.fn]; return `Table.TransformColumns(${prev}, {{${q(p.col)}, ${fn}, type text}})`; }
    case 'split': {
      const n = Math.max(...(tBefore?.rows || []).map((r) => (r[p.col] == null ? 1 : String(r[p.col]).split(p.delim || ' - ').length)), 1);
      return `Table.SplitColumn(${prev}, ${q(p.col)}, Splitter.SplitTextByDelimiter(${q(p.delim || ' - ')}, QuoteStyle.Csv), ${listQ(Array.from({ length: n }, (_, i) => `${p.col}.${i + 1}`))})`;
    }
    case 'extract': {
      const f = { 'Text Before Delimiter': `each Text.BeforeDelimiter(_, ${q(p.arg ?? '')})`, 'Text After Delimiter': `each Text.AfterDelimiter(_, ${q(p.arg ?? '')})`, 'First Characters': `each Text.Start(_, ${Number(p.arg) || 0})`, 'Last Characters': `each Text.End(_, ${Number(p.arg) || 0})`, Length: 'Text.Length' }[p.how];
      return `Table.TransformColumns(${prev}, {{${q(p.col)}, ${f}, ${p.how === 'Length' ? 'Int64.Type' : 'type text'}}})`;
    }
    case 'mergeCols': return `Table.CombineColumns(${prev}, ${listQ(p.cols || [])}, Combiner.CombineTextByDelimiter(${q(p.sep ?? ' ')}, QuoteStyle.None), ${q(p.name || 'Merged')})`;
    case 'filter': return `Table.SelectRows(${prev}, each ${mCond(p.col, p.op, p.value ?? '')})`;
    case 'sort': return `Table.Sort(${prev}, {{${q(p.col)}, Order.${p.dir === 'Descending' ? 'Descending' : 'Ascending'}}})`;
    case 'fillDown': return `Table.FillDown(${prev}, {${q(p.col)}})`;
    case 'fillUp': return `Table.FillUp(${prev}, {${q(p.col)}})`;
    case 'unpivot': return `Table.UnpivotOtherColumns(${prev}, ${listQ(p.cols || [])}, ${q(p.attr || 'Attribute')}, ${q(p.val || 'Value')})`;
    case 'pivot': {
      const heads = [...new Set((tBefore?.rows || []).map((r) => String(r[p.col])))];
      const agg = p.agg === 'Sum' ? ', List.Sum' : p.agg === 'Count' ? ', List.Count' : '';
      return `Table.Pivot(${prev}, List.Distinct(${prev}[${p.col}]), ${q(p.col)}, ${q(p.valCol)}${agg})`.replace('List.Distinct', heads.length ? 'List.Distinct' : 'List.Distinct');
    }
    case 'group': {
      const name = p.name || (p.agg === 'Count Rows' ? 'Count' : `${p.agg} of ${p.valCol}`);
      const f = p.agg === 'Count Rows' ? 'each Table.RowCount(_), Int64.Type' : `each List.${{ Sum: 'Sum', Average: 'Average', Max: 'Max', Min: 'Min' }[p.agg]}([${p.valCol}]), type nullable number`;
      return `Table.Group(${prev}, {${q(p.by)}}, {{${q(name)}, ${f}}})`;
    }
    case 'conditional': return `Table.AddColumn(${prev}, ${q(p.name || 'Custom')}, each if ${mCond(p.col, p.op, p.value ?? '')} then ${q(p.then ?? '')} else ${q(p.else ?? '')})`;
    case 'custom': return `Table.AddColumn(${prev}, ${q(p.name || 'Custom')}, each ${p.formula})`;
    case 'merge': return `Table.ExpandTableColumn(Table.NestedJoin(${prev}, {${q(p.col)}}, ${LOOKUP.name}, {"Region"}, "RegionManagers", JoinKind.LeftOuter), "RegionManagers", {"Manager"}, {"Manager"})`;
    case 'append': return `Table.Combine({${prev}, ${APPEND_ROWS.name}})`;
    default: return prev;
  }
}

export const stepName = (s, i, all) => {
  const base = { promote: 'Promoted Headers', removeCols: 'Removed Columns', keepCols: 'Removed Other Columns', removeBlank: 'Removed Blank Rows', removeTop: 'Removed Top Rows', keepTop: 'Kept First Rows', dedupe: 'Removed Duplicates', changeType: 'Changed Type', rename: 'Renamed Columns', replace: 'Replaced Value', format: { Trim: 'Trimmed Text', Clean: 'Cleaned Text', UPPERCASE: 'Uppercased Text', lowercase: 'Lowercased Text', 'Capitalize Each Word': 'Capitalized Each Word' }[s.params?.fn] || 'Formatted Text', split: 'Split Column by Delimiter', extract: 'Extracted Text', mergeCols: 'Merged Columns', filter: 'Filtered Rows', sort: 'Sorted Rows', fillDown: 'Filled Down', fillUp: 'Filled Up', unpivot: 'Unpivoted Other Columns', pivot: 'Pivoted Column', group: 'Grouped Rows', conditional: 'Added Conditional Column', custom: 'Added Custom', merge: 'Merged Queries', append: 'Appended Query' }[s.op];
  const same = all.slice(0, i).filter((x, j) => stepNameBase(x) === base && j < i).length;
  return same ? `${base}${same}` : base;
};
const stepNameBase = (s) => stepName(s, 0, []);

export function runSteps(sourceKey, steps) {
  const states = [SOURCES[sourceKey].table];
  let error = null; let errorAt = -1;
  for (let i = 0; i < steps.length; i++) {
    try { states.push(applyStep(states[i], steps[i])); }
    catch (e) { error = e.message; errorAt = i; break; }
  }
  return { states, error, errorAt };
}

export function buildM(sourceKey, steps, states) {
  const src = SOURCES[sourceKey];
  const lines = [
    `    Source = ${src.file.endsWith('.csv') ? `Csv.Document(File.Contents("C:\\\\Data\\\\${src.file}"), [Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.None])` : `Excel.Workbook(File.Contents("C:\\\\Data\\\\${src.file}"), null, true){[Item="Targets",Kind="Sheet"]}[Data]`}`,
  ];
  let prev = 'Source';
  steps.forEach((s, i) => {
    if (i + 1 >= states.length) return;
    const n = id(stepName(s, i, steps));
    lines.push(`    ${n} = ${stepM(s, prev, states[i])}`);
    prev = n;
  });
  return `let\n${lines.join(',\n')}\nin\n    ${prev}`;
}
