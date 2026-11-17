import { useState } from 'react';

const DATA = {
  'Excel: Navigation & Selection': [
    ['Ctrl + Arrow', 'Jump to the edge of the data region'], ['Ctrl + Shift + Arrow', 'Select to the edge of the data'], ['Ctrl + Home / End', 'Go to A1 / the last used cell'],
    ['Ctrl + A', 'Select the current region / whole sheet'], ['Shift + Space', 'Select the entire row'], ['Ctrl + Space', 'Select the entire column'],
    ['Ctrl + G / F5', 'Go To (and Go To Special)'], ['Ctrl + PgUp / PgDn', 'Previous / next worksheet'], ['Ctrl + F / Ctrl + H', 'Find / Replace'],
  ],
  'Excel: Editing & Formatting': [
    ['F2', 'Edit the active cell'], ['F4', 'Toggle $ absolute/relative reference (or repeat the last action)'], ['Ctrl + D / Ctrl + R', 'Fill down / fill right'],
    ['Ctrl + E', 'Flash Fill'], ['Ctrl + ;', "Insert today's date"], ['Ctrl + Shift + ;', 'Insert the current time'], ['Alt + Enter', 'New line inside a cell'],
    ['Ctrl + 1', 'Format Cells dialog'], ['Ctrl + Shift + $ / % / !', 'Currency / percent / number format'], ['Ctrl + B / I / U', 'Bold / italic / underline'],
    ['Ctrl + + / Ctrl + -', 'Insert / delete cells, rows or columns'], ['Ctrl + Z / Ctrl + Y', 'Undo / redo'], ['Ctrl + Alt + V', 'Paste Special'],
  ],
  'Excel: Formulas & Data': [
    ['Alt + =', 'AutoSum'], ['Ctrl + `', 'Show / hide formulas'], ['Shift + F3', 'Insert Function dialog'], ['F9', 'Calculate now / evaluate part of a formula in edit mode'],
    ['Ctrl + Shift + Enter', 'Legacy array formula (not needed for dynamic arrays)'], ['Ctrl + T', 'Create an Excel Table'], ['Ctrl + Shift + L', 'Toggle AutoFilter'],
    ['Alt + F1 / F11', 'Insert a chart on the sheet / a new chart sheet'], ['Ctrl + F3', 'Name Manager'], ['Alt + N + V', 'Insert PivotTable'], ['Alt + F8 / Alt + F11', 'Macros dialog / VBA editor'],
    ['Ctrl + [', 'Go to the precedent cells of a formula'],
  ],
  'Power BI Desktop': [
    ['Ctrl + S', 'Save the report (.pbix)'], ['Ctrl + C / Ctrl + V', 'Copy / paste visuals (also between pages)'], ['Ctrl + G', 'Group selected visuals'],
    ['Ctrl + Click', 'Multi-select data points or visuals'], ['Ctrl + Click (on a button)', 'Use buttons / bookmarks while editing in Desktop'],
    ['Shift + Enter', 'New line in the DAX formula bar'], ['Ctrl + /', 'Comment / uncomment lines in the DAX formula bar'], ['Enter / Esc', 'Commit / cancel a formula'],
    ['F6', 'Move focus between panes (accessibility navigation)'], ['Ctrl + Z / Ctrl + Y', 'Undo / redo'],
  ],
  'DAX cheat sheet': [
    ['SUM / AVERAGE / MIN / MAX', 'Aggregate a column in the current filter context'], ['COUNTROWS(Table)', 'Count visible rows'], ['DISTINCTCOUNT(col)', 'Count unique values'],
    ['SUMX(Table, expr)', 'Row-by-row iteration then sum'], ['CALCULATE(expr, filters…)', 'Evaluate an expression in a modified filter context'], ['FILTER(Table, cond)', 'Return the rows that satisfy a condition'],
    ['ALL / REMOVEFILTERS', 'Ignore filters (for % of total)'], ['ALLEXCEPT(Table, col)', 'Remove all filters except the listed columns'], ['ALLSELECTED', 'Respect outer slicer selections only'],
    ['DIVIDE(a, b, alt)', 'Safe division'], ['RELATED(col)', 'Fetch a value from the one-side table'], ['USERELATIONSHIP', 'Activate an inactive relationship'],
    ['TOTALYTD / DATESYTD', 'Year-to-date'], ['SAMEPERIODLASTYEAR', 'Same period in the previous year'], ['DATEADD(dates, -1, MONTH)', 'Shift the period'],
    ['RANKX(ALL(col), [m])', 'Rank items'], ['SELECTEDVALUE(col, alt)', 'Value of a single selection'], ['VAR … RETURN', 'Variables for readability and performance'],
  ],
  'Excel formula cheat sheet': [
    ['SUMIFS(sum, rng1, crit1, …)', 'Conditional sum (multiple criteria)'], ['COUNTIFS(rng1, crit1, …)', 'Conditional count'], ['XLOOKUP(v, look, ret, [nf])', 'Modern lookup'],
    ['INDEX(ret, MATCH(v, look, 0))', 'Flexible lookup (left lookup too)'], ['VLOOKUP(v, table, col, FALSE)', 'Exact-match vertical lookup'], ['IFERROR(x, alt)', 'Handle errors'],
    ['IFS(c1, v1, c2, v2, …)', 'Multiple conditions'], ['TEXT(value, "dd-mmm-yyyy")', 'Format as text'], ['TEXTJOIN(", ", TRUE, rng)', 'Join with a delimiter'],
    ['FILTER(arr, cond)', 'Dynamic filter (spills)'], ['UNIQUE(arr) / SORT(arr)', 'Distinct / sorted list (spills)'], ['LET(name, val, calc)', 'Variables in a formula'],
    ['DATEDIF(start, end, "Y")', 'Age / tenure'], ['EOMONTH(date, 0)', 'End of month'], ['NETWORKDAYS(s, e, hol)', 'Working days'],
  ],
};

export default function Shortcuts() {
  const [q, setQ] = useState('');
  const ql = q.toLowerCase();
  return (
    <div>
      <div className="page-head">
        <h1>⌨️ Shortcuts &amp; cheat sheet</h1>
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search e.g. filter, date, lookup…" />
      </div>
      <div className="grid2">
        {Object.entries(DATA).map(([sec, rows]) => {
          const f = rows.filter(([k, d]) => !ql || (k + d).toLowerCase().includes(ql));
          if (!f.length) return null;
          return (
            <div key={sec} className="card">
              <h3>{sec}</h3>
              <table className="kbd-table"><tbody>
                {f.map(([k, d]) => <tr key={k}><td><kbd>{k}</kbd></td><td>{d}</td></tr>)}
              </tbody></table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
