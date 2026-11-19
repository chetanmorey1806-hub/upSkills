import { useEffect, useMemo, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { ensurePython, runSQL } from '../components/pyodideRunner.js';

import Ico from '../components/Ico.jsx';
export const SQL_LOAD_KEY = 'xlpbi-sql-load';

const SAMPLE_SETUP = `-- Sample company database (SQLite)
CREATE TABLE departments (dept_id INTEGER PRIMARY KEY, dept_name TEXT NOT NULL, city TEXT);
CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, dept_id INTEGER REFERENCES departments(dept_id),
  salary INTEGER, hire_date TEXT, manager_id INTEGER
);
CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT, city TEXT);
CREATE TABLE products (product_id INTEGER PRIMARY KEY, product_name TEXT, category TEXT, price REAL);
CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, quantity INTEGER, order_date TEXT);

INSERT INTO departments VALUES (1,'IT','Pune'),(2,'HR','Mumbai'),(3,'Sales','Pune'),(4,'Finance','Nagpur');
INSERT INTO employees VALUES
 (101,'Asha Patil',1,72000,'2019-04-10',NULL),(102,'Ravi Kumar',2,45000,'2021-07-01',101),
 (103,'Neha Shah',3,52000,'2020-01-15',101),(104,'Imran Khan',1,88000,'2016-09-20',NULL),
 (105,'Priya Desai',4,61000,'2018-03-05',104),(106,'Rahul Joshi',3,39000,'2023-02-11',103),
 (107,'Sneha More',2,48000,'2020-11-30',102),(108,'Karan Mehta',1,55000,'2022-06-18',104),
 (109,'Pooja Nair',NULL,67000,'2017-08-08',NULL);
INSERT INTO customers VALUES (1,'Om Traders','Pune'),(2,'Sai Stores','Mumbai'),(3,'Kiran Mart','Nashik'),(4,'Laxmi Agencies','Pune');
INSERT INTO products VALUES (1,'Laptop','Electronics',55000),(2,'Mobile','Electronics',18000),(3,'Chair','Furniture',4500),(4,'Desk','Furniture',12000),(5,'Headphones','Accessories',2500);
INSERT INTO orders VALUES (1,1,1,2,'2024-01-05'),(2,2,2,3,'2024-01-09'),(3,1,5,5,'2024-02-02'),(4,3,4,1,'2024-02-14'),(5,2,1,1,'2024-03-01'),(6,4,3,6,'2024-03-20'),(7,1,2,2,'2024-03-28');
`;

const SAMPLE_QUERY = `-- Write your queries here. Press Ctrl+Enter to run.
SELECT d.dept_name, COUNT(*) AS employees, ROUND(AVG(e.salary)) AS avg_salary
FROM employees e
JOIN departments d ON d.dept_id = e.dept_id
GROUP BY d.dept_name
ORDER BY avg_salary DESC;`;

const EXERCISES = [
  ['Employees earning more than 50,000', "SELECT name, salary FROM employees WHERE salary > 50000 ORDER BY salary DESC;"],
  ['Employees with their department (LEFT JOIN keeps Pooja)', "SELECT e.name, d.dept_name FROM employees e LEFT JOIN departments d ON d.dept_id = e.dept_id;"],
  ['Second highest salary', "SELECT MAX(salary) AS second_highest FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);"],
  ['Employee with manager name (SELF JOIN)', "SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON m.emp_id = e.manager_id;"],
  ['Revenue per customer', "SELECT c.name, SUM(o.quantity * p.price) AS revenue FROM orders o JOIN customers c ON c.customer_id = o.customer_id JOIN products p ON p.product_id = o.product_id GROUP BY c.name ORDER BY revenue DESC;"],
  ['Rank employees by salary in each department', "SELECT name, dept_id, salary, DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk FROM employees WHERE dept_id IS NOT NULL;"],
  ['Departments with more than 2 employees', "SELECT dept_id, COUNT(*) AS cnt FROM employees GROUP BY dept_id HAVING COUNT(*) > 2;"],
  ['Monthly order count (strftime)', "SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders GROUP BY month;"],
];

export default function SqlLab() {
  const initial = useMemo(() => {
    let loaded = null;
    try { loaded = JSON.parse(sessionStorage.getItem(SQL_LOAD_KEY)); sessionStorage.removeItem(SQL_LOAD_KEY); } catch { /* ignore */ }
    return loaded || { setup: SAMPLE_SETUP, query: SAMPLE_QUERY, expected: '', title: null };
  }, []);
  const [setup, setSetup] = useState(initial.setup);
  const [query, setQuery] = useState(initial.query);
  const [expected] = useState(initial.expected || '');
  const [title, setTitle] = useState(initial.title);
  const [tab, setTab] = useState('query');
  const [res, setRes] = useState(null);
  const [status, setStatus] = useState('loading');
  const [fallback, setFallback] = useState(false);

  useEffect(() => { loader.init().catch(() => setFallback(true)); }, []);
  useEffect(() => { ensurePython().then((m) => setStatus(m.type === 'ready' ? 'ready' : 'error')); }, []);

  const run = async () => {
    setStatus('running');
    await runSQL({ setup, query }, (m) => {
      if (m.type === 'sql') setRes({ ...m.data, ms: m.ms });
      if (m.type === 'done' && m.error) setRes({ results: [], error: m.error });
    });
    setStatus('ready');
  };
  const onMount = (editor, monaco) => { editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => document.getElementById('sql-run-btn')?.click()); };

  return (
    <div className="jide">
      <div className="jide-top">
        <div className="jide-title"><span className="jide-logo sql"><Ico e="🗄" /></span><b>SQL Lab</b><span className="jide-sub">MySQL Workbench style · SQLite engine in your browser{title ? ` · ${title}` : ''}</span></div>
        <div className="jide-actions">
          <select value="" onChange={(e) => { const x = EXERCISES[Number(e.target.value)]; if (x) { setQuery(`-- ${x[0]}\n${x[1]}`); setTab('query'); setTitle(x[0]); } }}>
            <option value="">Practice queries…</option>
            {EXERCISES.map((x, i) => <option key={i} value={i}>{x[0]}</option>)}
          </select>
          <button className="btn small" onClick={() => { setSetup(SAMPLE_SETUP); setQuery(SAMPLE_QUERY); setTitle(null); }}>↺ Sample database</button>
          <button id="sql-run-btn" className="btn small primary" disabled={status !== 'ready'} onClick={run} title="Ctrl+Enter"><Ico e="⚡" /> Execute</button>
        </div>
      </div>
      <div className="jide-body sqlbody">
        <aside className="jide-tree">
          <div className="jide-tree-head"><span>SCHEMAS</span></div>
          <div className="jide-node">▾ <Ico e="🛢" /> practice_db</div>
          {[...setup.matchAll(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/gi)].map((m) => <div key={m[1]} className="jide-file">▦ {m[1]}</div>)}
          <div className="jide-help">Engine: SQLite (most MySQL queries work the same). MySQL-only syntax like AUTO_INCREMENT or stored procedures should be practised in MySQL Workbench.</div>
        </aside>
        <section className="jide-editor">
          <div className="pg-tabs">
            <button className={`pg-tab ${tab === 'query' ? 'on' : ''}`} onClick={() => setTab('query')}><Ico e="📝" /> Query</button>
            <button className={`pg-tab ${tab === 'setup' ? 'on' : ''}`} onClick={() => setTab('setup')}><Ico e="🛠" /> Setup (tables & data)</button>
          </div>
          <div className="pg-monaco">
            {fallback ? (
              <textarea className="pg-fallback" spellCheck={false} value={tab === 'query' ? query : setup} onChange={(e) => (tab === 'query' ? setQuery : setSetup)(e.target.value)} />
            ) : (
              <Editor key={tab} language="sql" theme="vs-dark" value={tab === 'query' ? query : setup} onMount={onMount}
                onChange={(v) => (tab === 'query' ? setQuery : setSetup)(v ?? '')}
                loading={<div className="pg-loading">Loading editor…</div>}
                options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false, wordWrap: 'on' }} />
            )}
          </div>
        </section>
        <section className="jide-bottom">
          <div className="jide-ptabs"><button className="on">Result Grid</button>{expected && <button onClick={() => window.alert(expected)}><Ico e="📋" /> Expected</button>}</div>
          <div className="jide-pbody">
            {status === 'loading' && <div className="pg-muted">Loading SQL engine (first time takes a few seconds)…</div>}
            {status === 'error' && <div className="pg-muted">Could not load the engine. An internet connection is needed the first time.</div>}
            {res?.results?.map((r, i) => (
              <div key={i} className="sql-res">
                {r.columns ? (
                  <>
                    <div className="pg-muted small">{r.rows.length} row(s) · {r.sql.split('\n').find((l) => l.trim() && !l.trim().startsWith('--'))?.slice(0, 90)}</div>
                    <div className="table-wrap">
                      <table className="data-table sql-table">
                        <thead><tr>{r.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                        <tbody>{r.rows.map((row, j) => <tr key={j}>{row.map((v, k) => <td key={k} className={typeof v === 'number' ? 'num' : ''}>{v === null ? <i className="muted">NULL</i> : String(v)}</td>)}</tr>)}</tbody>
                      </table>
                    </div>
                  </>
                ) : <div className="py-sys">✓ {r.message}</div>}
              </div>
            ))}
            {res?.error && <pre className="jide-out py-err">✖ {res.error}</pre>}
            {res && !res.error && <div className="pg-muted small">Executed in {res.ms} ms</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
