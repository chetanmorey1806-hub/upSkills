import { useMemo, useState, useEffect } from 'react';
import { SOURCES, OPS, LOOKUP, APPEND_ROWS, runSteps, buildM, stepName, isErrV } from '../engine/pq.js';
import CodeBlock from '../components/CodeBlock.jsx';

import Ico from '../components/Ico.jsx';
const CHALLENGES = [
  { source: 'SalesRaw', task: 'Promote the first row to headers, then remove the blank row and the duplicate order.', hint: 'Use First Row as Headers → Remove Blank Rows → Remove Duplicates.',
    check: (t) => t.cols.includes('Order ID') && t.rows.length === 7 && new Set(t.rows.map((r) => r['Order ID'])).size === 7 },
  { source: 'SalesRaw', task: 'Region is only typed on some rows. Fill the empty (null) Region cells from the row above.', hint: 'Select Region → Transform > Fill > Down.',
    check: (t) => t.cols.includes('Region') && t.rows.length > 0 && t.rows.every((r) => r.Region !== null && r.Region !== '' || t.cols.every((c) => r[c] === '' || r[c] === null)) },
  { source: 'SalesRaw', task: 'Split "Customer - City" into two columns named Customer and City. City must be proper case (Pune, not pune) with no extra spaces.', hint: 'Trim the column, split by delimiter " - ", rename the new columns, then Capitalize Each Word on City.',
    check: (t) => t.cols.includes('Customer') && t.cols.includes('City') && t.rows.filter((r) => r.City).every((r) => ['Pune', 'Mumbai', 'Nagpur', 'Nashik'].includes(r.City)) && t.rows.some((r) => r.City) },
  { source: 'SalesRaw', task: 'Replace "N/A" in Qty with 0, then change Qty and Unit Price to number (no errors allowed).', hint: 'Replace Values first, THEN change type. If you change type first, "N/A" becomes an Error.',
    check: (t) => t.types.Qty === 'number' && t.types['Unit Price'] === 'number' && t.rows.every((r) => !isErrV(r.Qty) && !isErrV(r['Unit Price'])) },
  { source: 'SalesRaw', task: 'Add a custom column Amount = Qty × Unit Price, then keep only rows where Amount is greater than 20000.', hint: 'Add Column > Custom Column: [Qty] * [Unit Price]. Then filter Amount "is greater than" 20000.',
    check: (t) => t.cols.includes('Amount') && t.rows.length > 0 && t.rows.every((r) => typeof r.Amount === 'number' && r.Amount > 20000) },
  { source: 'SalesRaw', task: 'Create a summary table with total Amount per Region (columns: Region, Total Amount).', hint: 'Clean the data, fill down Region, convert types, add Amount, then Home > Group By Region with Sum of Amount.',
    check: (t) => t.cols.length === 2 && t.cols[0] === 'Region' && t.cols[1] === 'Total Amount' && t.rows.some((r) => r.Region === 'West' && r['Total Amount'] === 236000) },
  { source: 'SalesRaw', task: `Bring each region's Manager from the ${LOOKUP.name} table with Merge Queries (Left Outer).`, hint: 'Fill down Region first, otherwise null regions will not match.',
    check: (t) => t.cols.includes('Manager') && t.rows.length > 0 && t.rows.filter((r) => r.Region).every((r) => r.Manager) },
  { source: 'TargetsWide', task: 'Convert the wide targets table into a long table with columns Region, Month, Target (12 rows), with Target as a number.', hint: 'Promote headers → select Region → Unpivot Other Columns (name them Month and Target) → change Target to number.',
    check: (t) => t.cols.join('|') === 'Region|Month|Target' && t.rows.length === 12 && t.types.Target === 'number' },
];

const show = (v) => (v === null || v === undefined ? <i className="muted">null</i> : isErrV(v) ? <span className="err-cell">Error</span> : String(v));
const typeIcon = { any: 'ABC 123', text: 'ABC', number: '1.2', date: '📅' };

export default function PowerQueryLab() {
  const [source, setSource] = useState('SalesRaw');
  const [steps, setSteps] = useState(() => { try { return JSON.parse(localStorage.getItem('xlpbi-pq-steps')) || []; } catch { return []; } });
  const [view, setView] = useState(null); // index of selected step state (null = last)
  const [op, setOp] = useState('promote');
  const [params, setParams] = useState({});
  const [showM, setShowM] = useState(false);
  const [ch, setCh] = useState(0);
  const [hint, setHint] = useState(false);
  const [solved, setSolved] = useState(() => { try { return JSON.parse(localStorage.getItem('xlpbi-pq-solved')) || {}; } catch { return {}; } });

  useEffect(() => { try { localStorage.setItem('xlpbi-pq-steps', JSON.stringify(steps)); } catch { /* ignore */ } }, [steps]);
  useEffect(() => { try { localStorage.setItem('xlpbi-pq-solved', JSON.stringify(solved)); } catch { /* ignore */ } }, [solved]);

  const run = useMemo(() => runSteps(source, steps), [source, steps]);
  const lastIdx = run.states.length - 1;
  const idx = view == null || view > lastIdx ? lastIdx : view;
  const table = run.states[idx];
  const current = run.states[lastIdx];
  const m = useMemo(() => buildM(source, steps, run.states), [source, steps, run.states]);

  const challenge = CHALLENGES[ch];
  const passed = challenge.source === source && !run.error && (() => { try { return challenge.check(current); } catch { return false; } })();
  useEffect(() => { if (passed && !solved[ch]) setSolved((s) => ({ ...s, [ch]: true })); }, [passed, ch, solved]);

  const add = () => { setSteps([...steps, { op, params }]); setView(null); setParams({}); };
  const removeStep = (i) => { setSteps(steps.filter((_, j) => j !== i)); setView(null); };
  const reset = (src = source) => { setSource(src); setSteps([]); setView(null); };
  const setP = (k, v) => setParams({ ...params, [k]: v });

  const renderParam = (pr) => {
    const cols = current.cols;
    if (pr.type === 'col') return (
      <label key={pr.key}>{pr.label}
        <select value={params[pr.key] || ''} onChange={(e) => setP(pr.key, e.target.value)}><option value="">choose…</option>{cols.map((c) => <option key={c}>{c}</option>)}</select>
      </label>);
    if (pr.type === 'cols') return (
      <div key={pr.key} className="pq-cols"><span>{pr.label}</span>
        {cols.map((c) => <label key={c} className="check"><input type="checkbox" checked={(params[pr.key] || []).includes(c)} onChange={(e) => setP(pr.key, e.target.checked ? [...(params[pr.key] || []), c] : (params[pr.key] || []).filter((x) => x !== c))} /> {c}</label>)}
      </div>);
    if (pr.type === 'select') return (
      <label key={pr.key}>{pr.label}
        <select value={params[pr.key] || ''} onChange={(e) => setP(pr.key, e.target.value)}><option value="">choose…</option>{pr.options.map((o) => <option key={o}>{o}</option>)}</select>
      </label>);
    return (
      <label key={pr.key}>{pr.label}
        <input className="input" type={pr.type === 'number' ? 'number' : 'text'} value={params[pr.key] ?? ''} placeholder={pr.placeholder || ''} onChange={(e) => setP(pr.key, e.target.value)} />
      </label>);
  };
  const missing = OPS[op].params.some((pr) => (pr.type === 'col' || pr.type === 'select') && !params[pr.key] && !(op === 'group' && pr.key === 'valCol' && params.agg === 'Count Rows'));

  return (
    <div>
      <div className="page-head">
        <h1><Ico e="🧹" /> Power Query Lab</h1>
        <p className="muted">
          Clean a messy file the way you would in the Power Query Editor. Every step appears in <b>Applied Steps</b> and
          generates real <b>M code</b> (open the Advanced Editor). Click a step to see the data at that point; delete steps to undo.
        </p>
        <div className="chips">
          {Object.entries(SOURCES).map(([k, s]) => <button key={k} className={`chip ${source === k ? 'active' : ''}`} onClick={() => reset(k)}><Ico e="📄" /> {s.file}</button>)}
        </div>
        <p className="muted small">{SOURCES[source].note}</p>
      </div>

      <div className="pq-layout">
        <div className="card pq-steps">
          <h3>Applied Steps</h3>
          <ol>
            <li className={idx === 0 ? 'cur' : ''} onClick={() => setView(0)}>Source</li>
            {steps.map((s, i) => (
              <li key={i} className={`${idx === i + 1 ? 'cur' : ''} ${run.errorAt === i ? 'bad' : ''} ${run.errorAt >= 0 && i > run.errorAt ? 'dim' : ''}`} onClick={() => setView(i + 1)}>
                <span>{stepName(s, i, steps)}</span>
                <button className="link-btn danger" title="Delete step" onClick={(e) => { e.stopPropagation(); removeStep(i); }}>✕</button>
              </li>
            ))}
          </ol>
          <div className="row-btns">
            <button className="btn small" onClick={() => setShowM(!showM)}>{showM ? 'Hide' : 'Advanced Editor'} (M)</button>
            <button className="btn small" onClick={() => reset()}>Reset</button>
          </div>
        </div>

        <div className="pq-main">
          <div className="card">
            <div className="pq-add">
              <label>Transformation
                <select value={op} onChange={(e) => { setOp(e.target.value); setParams({}); }}>
                  {Object.entries(OPS).map(([k, o]) => <option key={k} value={k}>{o.label}</option>)}
                </select>
              </label>
              {OPS[op].params.map(renderParam)}
              <button className="btn primary" disabled={missing || !!run.error} onClick={add}>Apply step</button>
            </div>
            <div className="muted small">Ribbon path in Power BI Desktop: <b>{OPS[op].menu}</b></div>
            {run.error && <div className="explain bad"><Ico e="⚠" /> Step “{stepName(steps[run.errorAt], run.errorAt, steps)}” failed: {run.error} Delete or fix that step.</div>}
          </div>

          {showM && <CodeBlock code={m} label="Advanced Editor (M code)" />}

          <div className="card">
            <div className="toolbar">
              <h3>{idx === 0 ? 'Source' : stepName(steps[idx - 1], idx - 1, steps)} <span className="muted small">({table.rows.length} rows, {table.cols.length} columns)</span></h3>
              {idx !== lastIdx && <button className="btn small" onClick={() => setView(null)}>Go to last step</button>}
            </div>
            <div className="table-wrap tall">
              <table className="data-table pq-table">
                <thead><tr><th className="rownum"></th>{table.cols.map((c) => <th key={c}><span className="ptype">{typeIcon[table.types[c]] || 'ABC 123'}</span> {c}</th>)}</tr></thead>
                <tbody>{table.rows.map((r, i) => <tr key={i}><td className="rownum">{i + 1}</td>{table.cols.map((c) => <td key={c} className={typeof r[c] === 'number' ? 'num' : ''}>{show(r[c])}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <details className="fn-list">
              <summary>Other queries in this file: {LOOKUP.name} (for Merge) and {APPEND_ROWS.name} (for Append)</summary>
              <div className="grid2">
                <table className="data-table"><thead><tr><th>Region</th><th>Manager</th></tr></thead><tbody>{LOOKUP.rows.map((r) => <tr key={r.Region}><td>{r.Region}</td><td>{r.Manager}</td></tr>)}</tbody></table>
                <div className="table-wrap"><table className="data-table"><thead><tr>{Object.keys(APPEND_ROWS.rows[0]).map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>{APPEND_ROWS.rows.map((r, i) => <tr key={i}>{Object.values(r).map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody></table></div>
              </div>
            </details>
          </div>
        </div>

        <div className="card challenge">
          <h3><Ico e="🎯" /> Challenges ({Object.keys(solved).length}/{CHALLENGES.length})</h3>
          <div className="ch-dots">
            {CHALLENGES.map((_, i) => <button key={i} className={`dot ${i === ch ? 'cur' : ''} ${solved[i] ? 'ok' : ''}`} onClick={() => { setCh(i); setHint(false); }}>{i + 1}</button>)}
          </div>
          <p><b>#{ch + 1}.</b> {challenge.task}</p>
          <p className="muted small">File: {SOURCES[challenge.source].file}{challenge.source !== source && <> (<button className="link-btn" onClick={() => reset(challenge.source)}>switch to it</button>)</>}</p>
          <button className="btn small" onClick={() => setHint(!hint)}>Hint</button>
          {hint && <div className="tip"><Ico e="💡" /> {challenge.hint}</div>}
          <div className={`explain ${passed ? 'ok' : 'bad'}`}>{passed ? '✓ Solved! Your query produces the required result.' : 'Not solved yet. The check runs automatically after each step.'}</div>
          <p className="muted small">Tip: many challenges build on each other. Keep your steps and continue with the next challenge.</p>
        </div>
      </div>
    </div>
  );
}
