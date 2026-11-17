import { useMemo, useState, useRef, useEffect } from 'react';
import { computeSheet, display, evaluateFormula, isErr, numToCol, SUPPORTED } from '../engine/excel.js';

const COLS = 10;
const ROWS = 20;

const SAMPLE = (() => {
  const data = [
    ['Emp ID', 'Name', 'Department', 'City', 'Salary', 'Experience', '', 'Dept', 'Bonus %'],
    ['E101', 'Asha Patil', 'IT', 'Pune', 72000, 6, '', 'IT', 0.12],
    ['E102', 'Ravi Kumar', 'HR', 'Mumbai', 45000, 3, '', 'HR', 0.08],
    ['E103', 'Neha Shah', 'Sales', 'Pune', 52000, 4, '', 'Sales', 0.15],
    ['E104', 'Imran Khan', 'IT', 'Nagpur', 88000, 9, '', 'Finance', 0.1],
    ['E105', 'Priya Desai', 'Finance', 'Mumbai', 61000, 5],
    ['E106', 'Rahul Joshi', 'Sales', 'Nashik', 39000, 1],
    ['E107', 'Sneha More', 'HR', 'Pune', 48000, 4],
    ['E108', 'Karan Mehta', 'IT', 'Mumbai', 55000, 2],
    ['E109', 'Pooja Nair', 'Finance', 'Pune', 67000, 7],
    ['E110', 'Amit Pawar', 'Sales', 'Mumbai', 58000, 5],
  ];
  const raw = {};
  data.forEach((row, r) => row.forEach((v, c) => { if (v !== '') raw[numToCol(c + 1) + (r + 1)] = String(v); }));
  return raw;
})();

const CHALLENGES = [
  { task: 'Find the total salary of all employees.', ref: '=SUM(E2:E11)', hint: 'Use SUM on the Salary column E2:E11.' },
  { task: 'Find the average salary in the IT department.', ref: '=AVERAGEIF(C2:C11,"IT",E2:E11)', hint: 'AVERAGEIF(range, criteria, average_range)' },
  { task: 'Count employees earning more than 50,000.', ref: '=COUNTIF(E2:E11,">50000")', hint: 'Criteria with operators go inside quotes: ">50000"' },
  { task: 'Return the salary of employee E105 (use XLOOKUP or VLOOKUP).', ref: '=XLOOKUP("E105",A2:A11,E2:E11)', hint: 'XLOOKUP(lookup_value, lookup_array, return_array)' },
  { task: 'Total salary of Pune employees in the IT department.', ref: '=SUMIFS(E2:E11,C2:C11,"IT",D2:D11,"Pune")', hint: 'SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2)' },
  { task: 'Return the NAME of the highest-paid employee.', ref: '=INDEX(B2:B11,MATCH(MAX(E2:E11),E2:E11,0))', hint: 'Combine INDEX, MATCH and MAX.' },
  { task: 'Get the bonus % for the "Sales" department from the lookup table H1:I5.', ref: '=VLOOKUP("Sales",H2:I5,2,FALSE)', hint: 'VLOOKUP with exact match (FALSE).' },
  { task: 'Return "Senior" if Asha (row 2) has 5+ years of experience, else "Junior".', ref: '=IF(F2>=5,"Senior","Junior")', hint: 'IF(logical_test, value_if_true, value_if_false)' },
  { task: 'Extract the first name of the employee in B3 ("Ravi").', ref: '=LEFT(B3,FIND(" ",B3)-1)', hint: 'LEFT + FIND the position of the space.' },
  { task: 'Create the code "IT-E101" for row 2 by joining Department and Emp ID.', ref: '=C2&"-"&A2', hint: 'Use the & operator or CONCAT.' },
  { task: 'Total salary of IT employees using SUMPRODUCT (no SUMIF).', ref: '=SUMPRODUCT((C2:C11="IT")*E2:E11)', hint: 'Condition array (TRUE/FALSE) × values.' },
  { task: 'How many employees work in Mumbai OR Pune?', ref: '=COUNTIF(D2:D11,"Mumbai")+COUNTIF(D2:D11,"Pune")', hint: 'Add two COUNTIFs.' },
  { task: 'Find the 2nd highest salary.', ref: '=LARGE(E2:E11,2)', hint: 'LARGE(array, k)' },
  { task: 'Salary of E120 with XLOOKUP; show "Not found" if missing.', ref: '=XLOOKUP("E120",A2:A11,E2:E11,"Not found")', hint: 'Use the 4th argument if_not_found.' },
  { task: "Calculate Asha's bonus amount (salary × her department's bonus %).", ref: '=E2*VLOOKUP(C2,H2:I5,2,FALSE)', hint: 'Multiply salary by a VLOOKUP into the bonus table.' },
];

const sameValue = (a, b) => {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-6;
  if (typeof a === 'string' && typeof b === 'string') return a.toLowerCase() === b.toLowerCase();
  return a === b;
};

export default function FormulaLab() {
  const [raw, setRaw] = useState(() => {
    try { return JSON.parse(localStorage.getItem('xlpbi-sheet')) || SAMPLE; } catch { return SAMPLE; }
  });
  const [sel, setSel] = useState('K2');
  const [edit, setEdit] = useState(null); // editing value
  const [chIdx, setChIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(() => { try { return JSON.parse(localStorage.getItem('xlpbi-formula-solved')) || {}; } catch { return {}; } });
  const barRef = useRef();

  useEffect(() => { try { localStorage.setItem('xlpbi-sheet', JSON.stringify(raw)); } catch { /* ignore */ } }, [raw]);
  useEffect(() => { try { localStorage.setItem('xlpbi-formula-solved', JSON.stringify(solved)); } catch { /* ignore */ } }, [solved]);

  const sheet = useMemo(() => computeSheet(raw), [raw]);
  const cols = Array.from({ length: COLS + 1 }, (_, i) => numToCol(i + 1));

  const commit = (val) => {
    setRaw((r) => ({ ...r, [sel]: val }));
    setEdit(null);
  };
  const move = (dc, dr) => {
    const m = /^([A-Z]+)(\d+)$/.exec(sel);
    const c = cols.indexOf(m[1]) + dc, r = parseInt(m[2], 10) + dr;
    if (c >= 0 && c < cols.length && r >= 1 && r <= ROWS) setSel(cols[c] + r);
  };
  const onBarKey = (e) => {
    if (e.key === 'Enter') { commit(edit ?? raw[sel] ?? ''); move(0, 1); }
    if (e.key === 'Escape') setEdit(null);
  };
  const selVal = sheet.get(sel);
  const ch = CHALLENGES[chIdx];

  const check = () => {
    const f = answer.trim();
    if (!f.startsWith('=')) { setResult({ ok: false, msg: 'Formulas must start with "="' }); return; }
    const got = evaluateFormula(f.slice(1), sheet.get);
    const exp = evaluateFormula(ch.ref.slice(1), sheet.get);
    if (got.error) { setResult({ ok: false, msg: `Syntax error: ${got.error}` }); return; }
    const ok = !isErr(got.value) && sameValue(got.value, exp.value);
    setResult({ ok, msg: ok ? `Correct! Result = ${display(got.value)}` : `Your formula returns ${display(got.value)}, which is not the expected answer. Try again.` });
    if (ok) setSolved((s) => ({ ...s, [chIdx]: true }));
  };
  const goCh = (i) => { setChIdx(i); setAnswer(''); setResult(null); setShowHint(false); };

  return (
    <div>
      <div className="page-head">
        <h1>🧮 Excel Formula Lab</h1>
        <p className="muted">
          Click a cell, type a value or formula (starting with <code className="ic">=</code>) in the formula bar and press Enter.
          Sample employee data is in A1:F11 and a bonus lookup table in H1:I5. Your sheet is saved in this browser.
        </p>
      </div>

      <div className="lab-grid">
        <div>
          <div className="formula-bar">
            <span className="namebox">{sel}</span>
            <span className="fx">fx</span>
            <input
              ref={barRef}
              value={edit ?? raw[sel] ?? ''}
              onChange={(e) => setEdit(e.target.value)}
              onKeyDown={onBarKey}
              onBlur={() => edit != null && commit(edit)}
              placeholder="Type a value or =FORMULA and press Enter"
            />
          </div>
          <div className="sheet-wrap">
            <table className="sheet">
              <thead>
                <tr><th></th>{cols.map((c) => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {Array.from({ length: ROWS }, (_, r) => (
                  <tr key={r}>
                    <th>{r + 1}</th>
                    {cols.map((c) => {
                      const a = c + (r + 1);
                      const v = sheet.get(a);
                      const isF = typeof raw[a] === 'string' && raw[a].startsWith('=');
                      return (
                        <td
                          key={a}
                          className={`${sel === a ? 'sel' : ''} ${isF ? 'is-f' : ''} ${typeof v === 'number' ? 'num' : ''} ${isErr(v) ? 'err' : ''}`}
                          onClick={() => { setSel(a); setEdit(null); }}
                          onDoubleClick={() => barRef.current?.focus()}
                        >
                          {display(v)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lab-actions">
            <span className="muted small">Value of {sel}: <b>{display(selVal) || '(blank)'}</b></span>
            <button className="btn small" onClick={() => { setRaw((r) => { const n = { ...r }; delete n[sel]; return n; }); }}>Clear cell</button>
            <button className="btn small" onClick={() => setRaw(SAMPLE)}>Reset sample data</button>
          </div>
        </div>

        <div className="card challenge">
          <h3>🎯 Challenges ({Object.keys(solved).length}/{CHALLENGES.length} solved)</h3>
          <div className="ch-dots">
            {CHALLENGES.map((_, i) => (
              <button key={i} className={`dot ${i === chIdx ? 'cur' : ''} ${solved[i] ? 'ok' : ''}`} onClick={() => goCh(i)}>{i + 1}</button>
            ))}
          </div>
          <p><b>#{chIdx + 1}.</b> {ch.task}</p>
          <input className="input mono" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && check()} placeholder="=your formula" />
          <div className="row-btns">
            <button className="btn primary" onClick={check}>Check</button>
            <button className="btn" onClick={() => setShowHint(!showHint)}>Hint</button>
            <button className="btn" onClick={() => setAnswer(ch.ref)}>Show answer</button>
          </div>
          {showHint && <div className="tip">💡 {ch.hint}</div>}
          {result && <div className={`explain ${result.ok ? 'ok' : 'bad'}`}>{result.msg}</div>}
          <div className="row-btns">
            <button className="btn small" disabled={chIdx === 0} onClick={() => goCh(chIdx - 1)}>← Prev</button>
            <button className="btn small" disabled={chIdx === CHALLENGES.length - 1} onClick={() => goCh(chIdx + 1)}>Next →</button>
          </div>
          <details className="fn-list">
            <summary>Supported functions ({SUPPORTED.length})</summary>
            <p className="mono small">{SUPPORTED.join(', ')}</p>
            <p className="muted small">Operators: + - * / ^ &amp; % = &lt;&gt; &lt; &gt; &lt;= &gt;=. Dynamic-array spilling (FILTER, UNIQUE, SORT) is not simulated here; practise those in real Excel 365.</p>
          </details>
        </div>
      </div>
    </div>
  );
}
