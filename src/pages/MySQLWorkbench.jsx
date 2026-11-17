import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { ensurePython, runPyExec, restartPython } from '../components/pyodideRunner.js';
import { WB_ENGINE_PY } from '../engine/wbEngine.js';

export const MYSQL_LOAD_KEY = 'xlpbi-mysql-load';
const DUMP_KEY = 'xlpbi-wb-dump-v1';
const TABS_KEY = 'xlpbi-wb-tabs-v1';

const SAMPLE_COLLEGE = `-- Sample database: college
CREATE DATABASE IF NOT EXISTS college;
USE college;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  dept_id INT AUTO_INCREMENT PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL UNIQUE,
  building VARCHAR(30)
);
CREATE TABLE faculty (
  faculty_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  dept_id INT,
  salary DECIMAL(10,2),
  hire_date DATE,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  gender ENUM('M','F'),
  city VARCHAR(40),
  dept_id INT,
  marks DECIMAL(5,2),
  dob DATE,
  email VARCHAR(80) UNIQUE,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE courses (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(80) NOT NULL,
  credits INT DEFAULT 3,
  dept_id INT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);
CREATE TABLE enrollments (
  enroll_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  grade CHAR(2),
  enrolled_on DATE,
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
INSERT INTO departments (dept_name, building) VALUES ('Computer','A Block'),('Mechanical','B Block'),('Civil','C Block'),('Electronics','A Block');
INSERT INTO faculty (name, dept_id, salary, hire_date) VALUES
 ('Dr. Mehta',1,95000,'2015-06-01'),('Prof. Kulkarni',1,78000,'2019-07-15'),('Dr. Rao',2,88000,'2012-01-10'),
 ('Prof. Shaikh',3,72000,'2020-03-01'),('Dr. Iyer',4,91000,'2016-08-20');
INSERT INTO students (name, gender, city, dept_id, marks, dob, email) VALUES
 ('Asha Patil','F','Pune',1,88.50,'2004-03-12','asha@college.edu'),
 ('Ravi Kumar','M','Mumbai',2,72.00,'2003-11-05','ravi@college.edu'),
 ('Neha Shah','F','Pune',1,93.25,'2004-07-21','neha@college.edu'),
 ('Imran Khan','M','Nagpur',3,65.75,'2003-01-30','imran@college.edu'),
 ('Priya Desai','F','Nashik',4,81.00,'2004-09-09','priya@college.edu'),
 ('Rahul Joshi','M','Pune',2,58.50,'2005-02-14','rahul@college.edu'),
 ('Sneha More','F','Mumbai',1,76.00,'2004-12-01','sneha@college.edu'),
 ('Karan Mehta','M','Nagpur',NULL,69.00,'2003-05-25',NULL);
INSERT INTO courses (title, credits, dept_id) VALUES
 ('Database Systems',4,1),('Data Structures',4,1),('Thermodynamics',3,2),('Surveying',3,3),('Digital Electronics',3,4),('Web Development',2,1);
INSERT INTO enrollments (student_id, course_id, grade, enrolled_on) VALUES
 (1,1,'A','2024-07-01'),(1,2,'A','2024-07-01'),(3,1,'A+','2024-07-02'),(3,6,'A','2024-07-02'),(2,3,'B','2024-07-03'),
 (4,4,'C','2024-07-03'),(5,5,'B+','2024-07-04'),(6,3,'C','2024-07-05'),(7,1,'B','2024-07-05'),(7,6,'A','2024-07-06');
SELECT 'college database ready' AS status;
`;

const SAMPLE_SHOP = `-- Sample database: ecommerce
CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  city VARCHAR(40),
  joined_on DATE
);
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(80) NOT NULL,
  category VARCHAR(40),
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0
);
CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_date DATE,
  status ENUM('Pending','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
CREATE TABLE order_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);
INSERT INTO customers (name, city, joined_on) VALUES ('Om Traders','Pune','2023-01-15'),('Sai Stores','Mumbai','2023-03-02'),('Kiran Mart','Nashik','2023-06-20'),('Laxmi Agencies','Pune','2024-01-05'),('Vijay Retail','Nagpur','2024-02-11');
INSERT INTO products (product_name, category, price, stock) VALUES ('Laptop','Electronics',55000,12),('Mobile','Electronics',18000,40),('Office Chair','Furniture',4500,25),('Desk','Furniture',12000,8),('Headphones','Accessories',2500,60),('Keyboard','Accessories',1500,45);
INSERT INTO orders (customer_id, order_date, status) VALUES (1,'2024-01-05','Delivered'),(2,'2024-01-09','Delivered'),(1,'2024-02-02','Shipped'),(3,'2024-02-14','Delivered'),(2,'2024-03-01','Cancelled'),(4,'2024-03-20','Pending'),(1,'2024-03-28','Delivered');
INSERT INTO order_items (order_id, product_id, quantity) VALUES (1,1,2),(1,5,3),(2,2,3),(3,5,5),(3,6,2),(4,4,1),(4,3,2),(5,1,1),(6,3,6),(7,2,2),(7,6,1);
SELECT 'ecommerce database ready' AS status;
`;

const SNIPPETS = [
  ['CREATE TABLE', 'CREATE TABLE table_name (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);'],
  ['INSERT', "INSERT INTO table_name (col1, col2) VALUES\n  ('value1', 10),\n  ('value2', 20);"],
  ['SELECT … WHERE', 'SELECT col1, col2\nFROM table_name\nWHERE condition\nORDER BY col1 DESC\nLIMIT 10;'],
  ['UPDATE', "UPDATE table_name\nSET col1 = 'new value'\nWHERE id = 1;"],
  ['DELETE', 'DELETE FROM table_name\nWHERE id = 1;'],
  ['INNER JOIN', 'SELECT a.col, b.col\nFROM table_a a\nINNER JOIN table_b b ON b.a_id = a.id;'],
  ['LEFT JOIN', 'SELECT a.col, b.col\nFROM table_a a\nLEFT JOIN table_b b ON b.a_id = a.id;'],
  ['GROUP BY … HAVING', 'SELECT category, COUNT(*) AS total, AVG(price) AS avg_price\nFROM products\nGROUP BY category\nHAVING COUNT(*) > 1;'],
  ['Subquery', 'SELECT name, marks\nFROM students\nWHERE marks > (SELECT AVG(marks) FROM students);'],
  ['CREATE VIEW', 'CREATE VIEW view_name AS\nSELECT col1, col2\nFROM table_name\nWHERE condition;'],
  ['CREATE INDEX', 'CREATE INDEX idx_name ON table_name (column_name);'],
  ['CASE', "SELECT name,\n  CASE\n    WHEN marks >= 75 THEN 'Distinction'\n    WHEN marks >= 60 THEN 'First Class'\n    ELSE 'Pass'\n  END AS result\nFROM students;"],
  ['Window function', 'SELECT name, dept_id, marks,\n  RANK() OVER (PARTITION BY dept_id ORDER BY marks DESC) AS rank_in_dept\nFROM students;'],
  ['CTE (WITH)', 'WITH dept_avg AS (\n  SELECT dept_id, AVG(marks) AS avg_marks\n  FROM students\n  GROUP BY dept_id\n)\nSELECT * FROM dept_avg WHERE avg_marks > 70;'],
  ['Transaction', 'START TRANSACTION;\nUPDATE accounts SET balance = balance - 500 WHERE id = 1;\nUPDATE accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT;   -- or ROLLBACK;'],
  ['Trigger', 'DELIMITER $$\nCREATE TRIGGER trg_name AFTER INSERT ON table_name\nFOR EACH ROW\nBEGIN\n  INSERT INTO audit_log (msg) VALUES (NEW.name);\nEND$$\nDELIMITER ;'],
];

const PRACTICE = [
  ['Students scoring above 80 (college)', 'USE college;\nSELECT name, city, marks FROM students WHERE marks > 80 ORDER BY marks DESC;'],
  ['Students with department name (JOIN)', 'USE college;\nSELECT s.name, d.dept_name FROM students s\nLEFT JOIN departments d ON d.dept_id = s.dept_id;'],
  ['Average marks per department', 'USE college;\nSELECT d.dept_name, COUNT(*) AS students, ROUND(AVG(s.marks), 2) AS avg_marks\nFROM students s JOIN departments d ON d.dept_id = s.dept_id\nGROUP BY d.dept_name ORDER BY avg_marks DESC;'],
  ['Second highest marks (subquery)', 'USE college;\nSELECT MAX(marks) AS second_highest FROM students\nWHERE marks < (SELECT MAX(marks) FROM students);'],
  ['Students not enrolled in any course', 'USE college;\nSELECT s.name FROM students s\nWHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.student_id);'],
  ['Age of each student', "USE college;\nSELECT name, dob, TIMESTAMPDIFF(YEAR, dob, '2025-01-01') AS age_on_2025_01_01 FROM students;"],
  ['Order value per customer (ecommerce)', 'USE ecommerce;\nSELECT c.name, SUM(oi.quantity * p.price) AS total_spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p ON p.product_id = oi.product_id\nWHERE o.status <> \'Cancelled\'\nGROUP BY c.name ORDER BY total_spent DESC;'],
  ['Rank products by revenue (window)', 'USE ecommerce;\nSELECT p.product_name, SUM(oi.quantity * p.price) AS revenue,\n  DENSE_RANK() OVER (ORDER BY SUM(oi.quantity * p.price) DESC) AS rnk\nFROM order_items oi JOIN products p ON p.product_id = oi.product_id\nGROUP BY p.product_name;'],
  ['Monthly orders', "USE ecommerce;\nSELECT DATE_FORMAT(order_date, '%Y-%m') AS month, COUNT(*) AS orders\nFROM orders GROUP BY month ORDER BY month;"],
];

const now = () => new Date().toTimeString().slice(0, 8);
const loadJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

// split for "execute current statement"
function statementAt(text, offset) {
  let start = 0, q = null;
  const bounds = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === q) q = null; continue; }
    if (c === "'" || c === '"' || c === '`') { q = c; continue; }
    if (c === '-' && text[i + 1] === '-') { const j = text.indexOf('\n', i); i = j < 0 ? text.length : j; continue; }
    if (c === ';') { bounds.push([start, i + 1]); start = i + 1; }
  }
  bounds.push([start, text.length]);
  const hit = bounds.find(([a, b]) => offset >= a && offset <= b && text.slice(a, b).trim()) || bounds.filter(([a, b]) => text.slice(a, b).trim() && b <= offset).pop();
  return hit ? text.slice(hit[0], hit[1]) : text;
}

let engineReady = null;
function initEngine() {
  if (!engineReady) {
    engineReady = (async () => {
      await ensurePython();
      await runPyExec({ code: WB_ENGINE_PY + '\n"ok"', packages: ['sqlite3'] });
      const saved = loadJSON(DUMP_KEY, null);
      const r = await runPyExec({ code: 'wb_load(__d, __c)', vars: { __d: JSON.stringify(saved?.dump || {}), __c: saved?.db || null } });
      return JSON.parse(r);
    })();
    engineReady.catch(() => { engineReady = null; });
  }
  return engineReady;
}

export default function MySQLWorkbench() {
  const initial = useMemo(() => {
    let loaded = null;
    try { loaded = JSON.parse(sessionStorage.getItem(MYSQL_LOAD_KEY)); sessionStorage.removeItem(MYSQL_LOAD_KEY); } catch { /* ignore */ }
    const tabs = loadJSON(TABS_KEY, null) || [{ name: 'Query 1', sql: '-- Welcome to the MySQL Workbench Lab 🐬\n-- 1) Click "Load sample DB: college" on the left (or write CREATE DATABASE ...)\n-- 2) Write a query and press Ctrl+Shift+Enter (execute all) or Ctrl+Enter (current statement)\n\nSHOW DATABASES;\n' }];
    if (loaded?.script) {
      tabs.push({ name: (loaded.title || 'Lesson').slice(0, 28), sql: loaded.script, expected: loaded.expected || '' });
      return { tabs, active: tabs.length - 1 };
    }
    return { tabs, active: 0 };
  }, []);

  const [tabs, setTabs] = useState(initial.tabs);
  const [active, setActive] = useState(initial.active);
  const [schemas, setSchemas] = useState({});
  const [currentDb, setCurrentDb] = useState(null);
  const [status, setStatus] = useState('loading');
  const [results, setResults] = useState([]);
  const [resTab, setResTab] = useState(0);
  const [output, setOutput] = useState([]);
  const [bottom, setBottom] = useState('result');
  const [open, setOpen] = useState({});
  const [filter, setFilter] = useState('');
  const [fallback, setFallback] = useState(false);
  const [side, setSide] = useState('snippets');
  const editorRef = useRef(null);
  const counter = useRef(0);

  useEffect(() => { loader.init().catch(() => setFallback(true)); }, []);
  useEffect(() => {
    initEngine().then((r) => { setSchemas(r.schemas); setCurrentDb(r.db); setStatus('ready'); setOpen(Object.fromEntries(Object.keys(r.schemas).map((k) => [k, true]))); })
      .catch((e) => { setStatus('error'); setOutput([{ n: 1, time: now(), action: 'Connect', message: String(e.message || e), ok: false }]); });
  }, []);
  useEffect(() => { saveJSON(TABS_KEY, tabs.map(({ name, sql }) => ({ name, sql }))); }, [tabs]);

  const persist = async () => {
    try { const d = await runPyExec({ code: 'wb_dump()' }); saveJSON(DUMP_KEY, { dump: JSON.parse(d), db: null }); } catch { /* ignore */ }
  };

  const execute = useCallback(async (sql) => {
    if (status !== 'ready' || !sql.trim()) return;
    setStatus('running');
    try {
      await initEngine();
      const raw = await runPyExec({ code: 'wb_run(__sql)', vars: { __sql: sql } });
      const r = JSON.parse(raw);
      const out = r.results.map((x) => ({
        n: ++counter.current, time: now(), action: x.sql.replace(/\s+/g, ' ').slice(0, 120),
        message: x.type === 'rows' ? `${x.rows.length} row(s) returned` : x.message, ok: x.type !== 'error', ms: x.ms,
      }));
      setOutput((o) => [...o, ...out].slice(-300));
      const grids = r.results.filter((x) => x.type === 'rows');
      setResults(grids);
      setResTab(0);
      setBottom(r.results.some((x) => x.type === 'error') || !grids.length ? 'output' : 'result');
      setSchemas(r.schemas); setCurrentDb(r.db);
      setOpen((o) => ({ ...Object.fromEntries(Object.keys(r.schemas).map((k) => [k, o[k] ?? true])) }));
      saveJSON(DUMP_KEY, null);
      persist().then(() => { const cur = loadJSON(DUMP_KEY, null); if (cur) saveJSON(DUMP_KEY, { ...cur, db: r.db }); });
    } catch (e) {
      setOutput((o) => [...o, { n: ++counter.current, time: now(), action: 'Execute', message: String(e.message || e), ok: false }]);
      setBottom('output');
    }
    setStatus('ready');
  }, [status]);

  const cur = tabs[active] || tabs[0];
  const setSql = (v) => setTabs((t) => t.map((x, i) => (i === active ? { ...x, sql: v } : x)));
  const runAll = () => {
    const ed = editorRef.current;
    const sel = ed?.getModel()?.getValueInRange(ed.getSelection());
    execute(sel && sel.trim() ? sel : cur.sql);
  };
  const runCurrent = () => {
    const ed = editorRef.current;
    if (!ed) return execute(cur.sql);
    const sel = ed.getModel().getValueInRange(ed.getSelection());
    if (sel && sel.trim()) return execute(sel);
    const off = ed.getModel().getOffsetAt(ed.getPosition());
    execute(statementAt(ed.getValue(), off));
  };
  const runRef = useRef({}); runRef.current = { runAll, runCurrent };

  const onMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => runRef.current.runAll());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current.runCurrent());
  };
  const insert = (text) => {
    const ed = editorRef.current;
    if (ed) { ed.executeEdits('snippet', [{ range: ed.getSelection(), text: text + '\n' }]); ed.focus(); }
    else setSql(cur.sql + '\n' + text + '\n');
  };
  const newTab = (sql = '', name) => { setTabs((t) => [...t, { name: name || `Query ${t.length + 1}`, sql }]); setActive(tabs.length); };
  const closeTab = (i) => { if (tabs.length === 1) return; setTabs((t) => t.filter((_, j) => j !== i)); setActive((a) => (a >= i && a > 0 ? a - 1 : a)); };
  const resetAll = async () => {
    if (!window.confirm('Delete ALL databases you created in this lab?')) return;
    const r = JSON.parse(await runPyExec({ code: 'wb_reset()' }));
    setSchemas(r.schemas); setCurrentDb(null); saveJSON(DUMP_KEY, null); setResults([]);
    setOutput((o) => [...o, { n: ++counter.current, time: now(), action: 'Reset', message: 'All schemas dropped', ok: true }]);
  };
  const stop = async () => { engineReady = null; await restartPython(); setStatus('loading'); const r = await initEngine(); setSchemas(r.schemas); setCurrentDb(r.db); setStatus('ready'); };
  const openFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    f.text().then((t) => newTab(t, f.name));
    e.target.value = '';
  };
  const saveFile = () => {
    const url = URL.createObjectURL(new Blob([cur.sql], { type: 'text/sql' }));
    const a = document.createElement('a'); a.href = url; a.download = `${cur.name.replace(/[^\w-]+/g, '_')}.sql`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const grid = results[resTab];
  const schemaNames = Object.keys(schemas).filter((s) => !filter || s.includes(filter.toLowerCase()) || Object.keys(schemas[s]).some((t) => t.toLowerCase().includes(filter.toLowerCase())));

  return (
    <div className="wb">
      <div className="wb-top">
        <div className="wb-brand"><span className="wb-logo">🐬</span><b>MySQL Workbench</b><span className="wb-conn">Local instance 3306 · {status === 'loading' ? 'connecting…' : status === 'error' ? 'not connected' : 'connected'}</span></div>
        <div className="wb-tools">
          <label className="wb-btn" title="Open SQL script">📂<input type="file" accept=".sql,.txt" hidden onChange={openFile} /></label>
          <button className="wb-btn" title="Save script" onClick={saveFile}>💾</button>
          <span className="wb-sep" />
          <button className="wb-btn exec" title="Execute all / selection (Ctrl+Shift+Enter)" disabled={status !== 'ready'} onClick={runAll}>⚡</button>
          <button className="wb-btn exec" title="Execute the statement under the cursor (Ctrl+Enter)" disabled={status !== 'ready'} onClick={runCurrent}>⚡<small>I</small></button>
          <button className="wb-btn" title="Stop" disabled={status !== 'running'} onClick={stop}>⛔</button>
          <span className="wb-sep" />
          <button className="wb-btn" title="New query tab" onClick={() => newTab('')}>＋SQL</button>
          <span className="wb-db">Default schema: <b>{currentDb || 'none'}</b></span>
        </div>
      </div>

      <div className="wb-body">
        <aside className="wb-nav">
          <div className="wb-nav-head">Navigator</div>
          <div className="wb-nav-sub">SCHEMAS</div>
          <input className="wb-filter" placeholder="Filter objects" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <div className="wb-tree">
            {schemaNames.length === 0 && <div className="wb-muted">No schemas yet.</div>}
            {schemaNames.map((s) => (
              <div key={s}>
                <div className={`wb-schema ${currentDb === s ? 'cur' : ''}`} onClick={() => setOpen({ ...open, [s]: !open[s] })} onDoubleClick={() => execute(`USE ${s};`)} title="Double-click to set as default schema">
                  {open[s] ? '▾' : '▸'} 🛢 {s}
                </div>
                {open[s] && (
                  <div className="wb-children">
                    <div className="wb-folder">▾ Tables</div>
                    {Object.entries(schemas[s]).filter(([, v]) => v.kind === 'table').map(([t, v]) => (
                      <div key={t}>
                        <div className="wb-table" onClick={() => setOpen({ ...open, [`${s}.${t}`]: !open[`${s}.${t}`] })}>
                          {open[`${s}.${t}`] ? '▾' : '▸'} ▦ {t}
                          <button className="wb-mini" title="Select Rows - Limit 1000" onClick={(e) => { e.stopPropagation(); const q = `SELECT * FROM ${s}.${t} LIMIT 1000;`; newTab(q, t); setTimeout(() => execute(`USE ${s};\nSELECT * FROM ${t} LIMIT 1000;`), 50); }}>⊞</button>
                        </div>
                        {open[`${s}.${t}`] && v.columns.map(([c, ty, pk]) => <div key={c} className="wb-col">{pk ? '🔑' : '◆'} {c} <span>{ty}</span></div>)}
                      </div>
                    ))}
                    {Object.entries(schemas[s]).some(([, v]) => v.kind === 'view') && <div className="wb-folder">▾ Views</div>}
                    {Object.entries(schemas[s]).filter(([, v]) => v.kind === 'view').map(([t]) => <div key={t} className="wb-table">👁 {t}</div>)}
                    <div className="wb-folder muted">▸ Stored Procedures</div>
                    <div className="wb-folder muted">▸ Functions</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="wb-nav-actions">
            <button className="wb-act" onClick={() => { newTab(SAMPLE_COLLEGE, 'college_setup'); setTimeout(() => execute(SAMPLE_COLLEGE), 50); }}>⬇ Load sample DB: college</button>
            <button className="wb-act" onClick={() => { newTab(SAMPLE_SHOP, 'ecommerce_setup'); setTimeout(() => execute(SAMPLE_SHOP), 50); }}>⬇ Load sample DB: ecommerce</button>
            <button className="wb-act danger" onClick={resetAll}>🗑 Drop all schemas</button>
          </div>
        </aside>

        <section className="wb-editor">
          <div className="wb-tabs">
            {tabs.map((t, i) => (
              <div key={i} className={`wb-tab ${i === active ? 'on' : ''}`} onClick={() => setActive(i)}>
                <span>{t.name}</span>{tabs.length > 1 && <button onClick={(e) => { e.stopPropagation(); closeTab(i); }}>×</button>}
              </div>
            ))}
          </div>
          <div className="wb-monaco">
            {fallback ? (
              <textarea className="pg-fallback" spellCheck={false} value={cur.sql} onChange={(e) => setSql(e.target.value)} />
            ) : (
              <Editor key={active} language="mysql" theme="vs" value={cur.sql} onMount={onMount} onChange={(v) => setSql(v ?? '')}
                loading={<div className="pg-loading">Loading SQL editor…</div>}
                options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false, wordWrap: 'on', lineNumbersMinChars: 3 }} />
            )}
          </div>
          {cur.expected && (
            <details className="wb-expected"><summary>📋 Expected output for this lesson script</summary><pre>{cur.expected}</pre></details>
          )}
        </section>

        <aside className="wb-side">
          <div className="wb-side-tabs">
            <button className={side === 'snippets' ? 'on' : ''} onClick={() => setSide('snippets')}>Snippets</button>
            <button className={side === 'practice' ? 'on' : ''} onClick={() => setSide('practice')}>Practice</button>
            <button className={side === 'help' ? 'on' : ''} onClick={() => setSide('help')}>Help</button>
          </div>
          <div className="wb-side-body">
            {side === 'snippets' && SNIPPETS.map(([n, s]) => <button key={n} className="wb-snip" onClick={() => insert(s)} title={s}>{n}</button>)}
            {side === 'practice' && (
              <>
                <div className="wb-muted">Load the sample DBs first, then try:</div>
                {PRACTICE.map(([n, s]) => <button key={n} className="wb-snip" onClick={() => newTab(s, n.slice(0, 24))}>{n}</button>)}
              </>
            )}
            {side === 'help' && (
              <div className="wb-help">
                <p><b>Ctrl+Shift+Enter</b>: execute all (or selection)</p>
                <p><b>Ctrl+Enter</b>: execute statement under cursor</p>
                <p><b>Double-click a schema</b>: set as default (USE)</p>
                <p><b>⊞ next to a table</b>: Select Rows - Limit 1000</p>
                <p>Your databases are saved in this browser.</p>
                <p className="wb-muted">This lab emulates MySQL 8 on SQLite. Stored procedures, users/GRANT, ALTER … MODIFY and EXPLAIN need real MySQL Workbench; the course shows how.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="wb-bottom">
        <div className="wb-btabs">
          <button className={bottom === 'result' ? 'on' : ''} onClick={() => setBottom('result')}>Result Grid</button>
          {bottom === 'result' && results.length > 1 && results.map((_, i) => <button key={i} className={`sub ${resTab === i ? 'on' : ''}`} onClick={() => setResTab(i)}>Result {i + 1}</button>)}
          <button className={bottom === 'output' ? 'on' : ''} onClick={() => setBottom('output')}>Output {output.some((o) => !o.ok) ? '⚠' : ''}</button>
          {bottom === 'output' && <button className="sub" onClick={() => setOutput([])}>Clear</button>}
        </div>
        <div className="wb-bbody">
          {bottom === 'result' && (grid ? (
            <table className="wb-grid">
              <thead><tr><th className="rn"></th>{grid.columns.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
              <tbody>{grid.rows.slice(0, 1000).map((r, i) => <tr key={i}><td className="rn">▸</td>{r.map((v, j) => <td key={j} className={typeof v === 'number' ? 'num' : ''}>{v === null ? <span className="null">NULL</span> : String(v)}</td>)}</tr>)}</tbody>
            </table>
          ) : <div className="wb-muted pad">{status === 'loading' ? 'Starting MySQL engine (first time takes a few seconds, needs internet once)…' : 'Run a SELECT to see rows here.'}</div>)}
          {bottom === 'output' && (
            <table className="wb-out">
              <thead><tr><th></th><th>#</th><th>Time</th><th>Action</th><th>Message</th><th>Duration</th></tr></thead>
              <tbody>{output.slice().reverse().map((o) => (
                <tr key={o.n} className={o.ok ? '' : 'bad'}><td>{o.ok ? '✅' : '⛔'}</td><td>{o.n}</td><td>{o.time}</td><td className="act">{o.action}</td><td>{o.message}</td><td>{o.ms != null ? `${(o.ms / 1000).toFixed(3)} sec` : ''}</td></tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
