import { useMemo, useState, useEffect } from 'react';
import { makeEngine, validate, filtersFor, SUPPORTED_DAX } from '../engine/dax.js';
import { MODEL } from '../engine/daxModel.js';

const DEFAULT_MEASURES = {
  'Total Sales': 'SUM(Sales[SalesAmount])',
  'Total Cost': 'SUM(Sales[Cost])',
  'Profit': '[Total Sales] - [Total Cost]',
  'Profit Margin %': 'DIVIDE([Profit], [Total Sales])',
  'Order Count': 'COUNTROWS(Sales)',
};

const GROUPS = [
  ['Product', 'Category'], ['Product', 'Product'], ['Customer', 'City'], ['Customer', 'Segment'],
  ['Customer', 'Customer'], ['Date', 'Year'], ['Date', 'Quarter'], ['Date', 'Month'], ['Date', 'YearMonth'],
];
const MONTH_ORDER = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function downloadCSV(name, rows) {
  const cols = Object.keys(rows[0]);
  const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url; a.download = `${name}.csv`; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const CHALLENGES = [
  { task: 'Create a measure for total quantity sold.', ref: 'SUM(Sales[Quantity])', hint: 'SUM over Sales[Quantity].' },
  { task: 'Calculate sales by multiplying Quantity × UnitPrice row by row (an iterator).', ref: 'SUMX(Sales, Sales[Quantity] * Sales[UnitPrice])', hint: 'SUMX(table, expression) evaluates the expression for each row.' },
  { task: 'Average sales amount per order.', ref: 'DIVIDE(SUM(Sales[SalesAmount]), COUNTROWS(Sales))', hint: 'DIVIDE(total sales, number of rows), or AVERAGE(Sales[SalesAmount]).' },
  { task: 'Number of distinct customers who bought.', ref: 'DISTINCTCOUNT(Sales[CustomerID])', hint: 'DISTINCTCOUNT on the key column in the fact table.' },
  { task: 'Sales of the "Electronics" category only (it should ignore the row category).', ref: 'CALCULATE(SUM(Sales[SalesAmount]), Product[Category] = "Electronics")', hint: 'CALCULATE(expression, Table[Column] = "value") overrides the filter on that column.' },
  { task: 'Sales for year 2024 only.', ref: 'CALCULATE(SUM(Sales[SalesAmount]), Sales[Year] = 2024)', hint: 'CALCULATE with a filter on Sales[Year].' },
  { task: 'Grand total sales that ignores ALL filters (same value on every row).', ref: 'CALCULATE(SUM(Sales[SalesAmount]), ALL(Sales))', hint: 'ALL(Sales) removes filters from Sales and the tables it relates to.' },
  { task: '% of grand total sales for each row (group by Product Category to test).', ref: 'DIVIDE(SUM(Sales[SalesAmount]), CALCULATE(SUM(Sales[SalesAmount]), ALL(Sales)))', hint: 'DIVIDE(current sales, CALCULATE(sales, ALL(...)))' },
  { task: 'Count orders where SalesAmount is greater than 50,000.', ref: 'CALCULATE(COUNTROWS(Sales), Sales[SalesAmount] > 50000)', hint: 'COUNTROWS inside CALCULATE with a condition, or COUNTROWS(FILTER(Sales, …)).' },
  { task: 'Sales at list price: Quantity × the Product table Price (use RELATED).', ref: 'SUMX(Sales, Sales[Quantity] * RELATED(Product[Price]))', hint: 'Inside SUMX(Sales, …) use RELATED(Product[Price]).' },
  { task: 'Rank of each Category by total sales (group by Product Category).', ref: 'RANKX(ALL(Product[Category]), CALCULATE(SUM(Sales[SalesAmount])))', hint: 'RANKX(ALL(Product[Category]), [Total Sales])' },
  { task: 'Profit using variables: VAR sales, VAR cost, RETURN sales − cost.', ref: 'SUM(Sales[SalesAmount]) - SUM(Sales[Cost])', hint: 'VAR s = SUM(...) VAR c = SUM(...) RETURN s - c' },
  { task: 'Show "High" if total sales > 500000, otherwise "Low".', ref: 'IF(SUM(Sales[SalesAmount]) > 500000, "High", "Low")', hint: 'IF(condition, "High", "Low")' },
  { task: 'Year-to-date sales (group by Date[YearMonth] to see it accumulate).', ref: "TOTALYTD(SUM(Sales[SalesAmount]), 'Date'[Date])", hint: "TOTALYTD(expression, 'Date'[Date])" },
  { task: 'Sales for the same period last year (group by Date[YearMonth]).', ref: "CALCULATE(SUM(Sales[SalesAmount]), SAMEPERIODLASTYEAR('Date'[Date]))", hint: "CALCULATE(…, SAMEPERIODLASTYEAR('Date'[Date]))" },
  { task: 'Previous month sales using DATEADD.', ref: "CALCULATE(SUM(Sales[SalesAmount]), DATEADD('Date'[Date], -1, MONTH))", hint: "DATEADD('Date'[Date], -1, MONTH) shifts the visible dates back one month." },
  { task: 'Rolling 3-month sales ending at the last visible date.', ref: "CALCULATE(SUM(Sales[SalesAmount]), DATESINPERIOD('Date'[Date], MAX('Date'[Date]), -3, MONTH))", hint: "DATESINPERIOD('Date'[Date], MAX('Date'[Date]), -3, MONTH)" },
  { task: 'Look up the Category of the product "Desk" with LOOKUPVALUE.', ref: 'LOOKUPVALUE(Product[Category], Product[Product], "Desk")', hint: 'LOOKUPVALUE(result_column, search_column, search_value)' },
  { task: 'Sales of Corporate-segment customers in Pune.', ref: 'CALCULATE(SUM(Sales[SalesAmount]), Customer[Segment] = "Corporate", Customer[City] = "Pune")', hint: 'Multiple filter arguments in CALCULATE are combined with AND.' },
];

const fmt = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return '∞';
    if (Math.abs(v) < 1 && v !== 0) return (v * 100).toFixed(2) + '%';
    return v.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }
  return String(v);
};
const sameVal = (a, b) => (typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-6 : a === b);
const distinct = (t, c) => {
  const v = [...new Set(MODEL.tables[t].map((r) => r[c]))];
  if (t === 'Date' && c === 'Month') return MONTH_ORDER.filter((m) => v.includes(m));
  return v.sort((a, b) => (a > b ? 1 : -1));
};

export default function DaxLab() {
  const [measures, setMeasures] = useState(() => { try { return JSON.parse(localStorage.getItem('xlpbi-measures')) || DEFAULT_MEASURES; } catch { return DEFAULT_MEASURES; } });
  const [name, setName] = useState('');
  const [expr, setExpr] = useState('');
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);
  const [group, setGroup] = useState(0);
  const [cols, setCols] = useState(['Total Sales', 'Profit', 'Profit Margin %']);
  const [yearF, setYearF] = useState('');
  const [cityF, setCityF] = useState('');
  const [view, setView] = useState('Sales');
  const [chIdx, setChIdx] = useState(0);
  const [chExpr, setChExpr] = useState('');
  const [chRes, setChRes] = useState(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => { try { localStorage.setItem('xlpbi-measures', JSON.stringify(measures)); } catch { /* ignore */ } }, [measures]);

  const engine = useMemo(() => makeEngine(measures), [measures]);
  const slicers = [];
  if (yearF) slicers.push({ table: 'Date', col: 'Year', value: Number(yearF) });
  if (cityF) slicers.push({ table: 'Customer', col: 'City', value: cityF });
  const slicerFilters = filtersFor(slicers);
  const [gt, gc] = GROUPS[group];
  const groupVals = distinct(gt, gc);

  const evalCell = (eng, m, gv) => {
    try {
      const f = gv === undefined ? slicerFilters : [...slicerFilters, ...filtersFor([{ table: gt, col: gc, value: gv }])];
      return { v: eng.evaluateMeasure(m, f, slicerFilters) };
    } catch (e) { return { err: e.message }; }
  };

  const save = () => {
    const n = name.trim();
    if (!n || !expr.trim()) { setMsg({ ok: false, t: 'Enter a measure name and an expression.' }); return; }
    try { validate(expr); } catch (e) { setMsg({ ok: false, t: 'Syntax error: ' + e.message }); return; }
    const next = { ...measures };
    if (editing && editing !== n) delete next[editing];
    next[n] = expr.trim();
    setMeasures(next);
    if (!cols.includes(n)) setCols([...cols.filter((c) => c !== editing), n]);
    setMsg({ ok: true, t: `Measure [${n}] saved and added to the matrix.` });
    setName(''); setExpr(''); setEditing(null);
  };
  const edit = (k) => { setEditing(k); setName(k); setExpr(measures[k]); setMsg(null); };
  const del = (k) => { const n = { ...measures }; delete n[k]; setMeasures(n); setCols(cols.filter((c) => c !== k)); };
  const toggleCol = (k) => setCols(cols.includes(k) ? cols.filter((c) => c !== k) : [...cols, k]);

  const ch = CHALLENGES[chIdx];
  const checkCh = () => {
    try { validate(chExpr); } catch (e) { setChRes({ ok: false, t: 'Syntax error: ' + e.message }); return; }
    const eng = makeEngine({ ...measures, __you: chExpr, __ref: ch.ref });
    // compare across every grouping value + total, for several groupings
    let ok = true; let detail = '';
    for (const [t, c] of [GROUPS[0], GROUPS[2], GROUPS[5], GROUPS[8]]) {
      for (const v of [undefined, ...distinct(t, c)]) {
        const f = v === undefined ? [] : filtersFor([{ table: t, col: c, value: v }]);
        let a, b;
        try { a = eng.evaluateMeasure('__you', f, []); } catch (e) { setChRes({ ok: false, t: 'Error: ' + e.message }); return; }
        b = eng.evaluateMeasure('__ref', f, []);
        if (!sameVal(a, b)) { ok = false; detail = `For ${v === undefined ? 'the grand total' : `${t}[${c}] = ${v}`} your result is ${fmt(a)} but expected ${fmt(b)}.`; break; }
      }
      if (!ok) break;
    }
    setChRes({ ok, t: ok ? 'Correct! Your measure returns the right result in every filter context. 🎉' : detail });
  };
  const goCh = (i) => { setChIdx(i); setChExpr(''); setChRes(null); setShowHint(false); };

  const viewRows = MODEL.tables[view];

  return (
    <div>
      <div className="page-head">
        <h1>⚡ DAX Lab</h1>
        <p className="muted">
          Write DAX measures against a sample star schema (Sales fact → Product &amp; Customer dimensions)
          and see them evaluated in a matrix visual. Change the rows and slicers to watch the <b>filter context</b> change.
        </p>
      </div>

      <div className="card model-diagram">
        <div className="mtable"><b>Product</b><span>{Object.keys(MODEL.tables.Product[0]).join(' · ')}</span></div>
        <div className="mrel">1 ── *</div>
        <div className="mtable fact"><b>Sales (fact)</b><span>{Object.keys(MODEL.tables.Sales[0]).join(' · ')}</span></div>
        <div className="mrel">* ── 1</div>
        <div className="mtable"><b>Customer</b><span>{Object.keys(MODEL.tables.Customer[0]).join(' · ')}</span></div>
        <div className="mrel">Sales[OrderDate] * ── 1</div>
        <div className="mtable"><b>Date (date table)</b><span>{Object.keys(MODEL.tables.Date[0]).join(' · ')}</span></div>
      </div>
      <div className="card info">
        <b>📥 Practise in real Power BI Desktop too:</b> download the same tables as CSV, load them with <i>Get data &gt; Text/CSV</i>,
        create the relationships shown above (Model view), mark <code className="ic">Date</code> as a date table, and paste your measures.
        <div className="row-btns">
          {Object.keys(MODEL.tables).map((t) => <button key={t} className="btn small" onClick={() => downloadCSV(t, MODEL.tables[t])}>⬇ {t}.csv</button>)}
        </div>
      </div>

      <div className="lab-grid">
        <div>
          <div className="card">
            <h3>Measures</h3>
            <div className="measure-list">
              {Object.entries(measures).map(([k, v]) => (
                <div key={k} className="measure">
                  <label><input type="checkbox" checked={cols.includes(k)} onChange={() => toggleCol(k)} /> <b>{k}</b></label>
                  <code className="mono small">{k} = {v}</code>
                  <span>
                    <button className="link-btn" onClick={() => edit(k)}>edit</button>
                    <button className="link-btn danger" onClick={() => del(k)}>delete</button>
                  </span>
                </div>
              ))}
            </div>
            <div className="measure-editor">
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Measure name e.g. Total Quantity" />
              <textarea className="input mono" rows={4} value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="SUM(Sales[Quantity])" />
              <div className="row-btns">
                <button className="btn primary" onClick={save}>{editing ? 'Update measure' : 'Add measure'}</button>
                {editing && <button className="btn" onClick={() => { setEditing(null); setName(''); setExpr(''); }}>Cancel</button>}
                <button className="btn small" onClick={() => { setMeasures(DEFAULT_MEASURES); setCols(['Total Sales', 'Profit', 'Profit Margin %']); }}>Reset measures</button>
              </div>
              {msg && <div className={`explain ${msg.ok ? 'ok' : 'bad'}`}>{msg.t}</div>}
            </div>
          </div>

          <div className="card">
            <div className="toolbar">
              <h3>Matrix visual</h3>
              <div className="slicers">
                <label>Rows: <select value={group} onChange={(e) => setGroup(Number(e.target.value))}>{GROUPS.map(([t, c], i) => <option key={i} value={i}>{t}[{c}]</option>)}</select></label>
                <label>Year slicer: <select value={yearF} onChange={(e) => setYearF(e.target.value)}><option value="">All</option>{distinct('Date', 'Year').map((y) => <option key={y}>{y}</option>)}</select></label>
                <label>City slicer: <select value={cityF} onChange={(e) => setCityF(e.target.value)}><option value="">All</option>{distinct('Customer', 'City').map((y) => <option key={y}>{y}</option>)}</select></label>
              </div>
            </div>
            <div className="table-wrap">
              <table className="data-table matrix">
                <thead><tr><th>{gt}[{gc}]</th>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>
                  {groupVals.map((gv) => (
                    <tr key={gv}>
                      <td>{gv}</td>
                      {cols.map((c) => { const r = evalCell(engine, c, gv); return <td key={c} className={r.err ? 'err' : 'num'} title={r.err || ''}>{r.err ? '⚠ error' : fmt(r.v)}</td>; })}
                    </tr>
                  ))}
                  <tr className="total">
                    <td>Total</td>
                    {cols.map((c) => { const r = evalCell(engine, c); return <td key={c} className={r.err ? 'err' : 'num'} title={r.err || ''}>{r.err ? '⚠ error' : fmt(r.v)}</td>; })}
                  </tr>
                </tbody>
              </table>
            </div>
            {cols.map((c) => { const r = evalCell(engine, c); return r.err ? <div key={c} className="explain bad">[{c}]: {r.err}</div> : null; })}
            <p className="muted small">Values between -1 and 1 are shown as percentages. Hover over an error to see the message.</p>
          </div>
        </div>

        <div className="card challenge">
          <h3>🎯 DAX challenges</h3>
          <div className="ch-dots">
            {CHALLENGES.map((_, i) => <button key={i} className={`dot ${i === chIdx ? 'cur' : ''}`} onClick={() => goCh(i)}>{i + 1}</button>)}
          </div>
          <p><b>#{chIdx + 1}.</b> {ch.task}</p>
          <textarea className="input mono" rows={4} value={chExpr} onChange={(e) => setChExpr(e.target.value)} placeholder="Write only the expression (without 'Name =')" />
          <div className="row-btns">
            <button className="btn primary" onClick={checkCh}>Check</button>
            <button className="btn" onClick={() => setShowHint(!showHint)}>Hint</button>
            <button className="btn" onClick={() => setChExpr(ch.ref)}>Show answer</button>
          </div>
          {showHint && <div className="tip">💡 {ch.hint}</div>}
          {chRes && <div className={`explain ${chRes.ok ? 'ok' : 'bad'}`}>{chRes.t}</div>}
          <p className="muted small">Your measure is tested in many filter contexts (each Category, City, Year and the grand total). It must match everywhere.</p>
          <details className="fn-list">
            <summary>Supported DAX</summary>
            <p className="mono small">{SUPPORTED_DAX}</p>
            <p className="muted small">Time intelligence works on the 'Date' table (2023–2024). Write the table name as 'Date'[Date] or Date[Date].</p>
          </details>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <h3>Data view</h3>
          <div className="chips">{Object.keys(MODEL.tables).map((t) => <button key={t} className={`chip ${view === t ? 'active' : ''}`} onClick={() => setView(t)}>{t} ({MODEL.tables[t].length})</button>)}</div>
        </div>
        <div className="table-wrap tall">
          <table className="data-table">
            <thead><tr>{Object.keys(viewRows[0]).map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{viewRows.map((r, i) => <tr key={i}>{Object.values(r).map((v, j) => <td key={j}>{String(v)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
