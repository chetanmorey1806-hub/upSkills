import { useEffect, useMemo, useState, useRef } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { ensurePython, runPython, restartPython } from '../components/pyodideRunner.js';

export const PY_LOAD_KEY = 'xlpbi-python-load';
const STORE = 'xlpbi-python-ide-v1';

const TEMPLATES = {
  'Hello World': { files: { 'main.py': 'print("Hello, Python! 🐍")\n\nname = "Student"\nprint(f"Welcome, {name}!")\n' } },
  'input() example': { files: { 'main.py': 'name = input("Enter your name: ")\nage = int(input("Enter your age: "))\nprint(f"Hello {name}, next year you will be {age + 1}")\n' }, stdin: 'Asha\n21\n' },
  'Functions & lists': { files: { 'main.py': 'def average(marks):\n    return sum(marks) / len(marks)\n\nstudents = {"Riya": [88, 92, 79], "Aman": [72, 65, 80], "Neha": [95, 90, 98]}\n\nfor name, marks in students.items():\n    avg = average(marks)\n    grade = "A" if avg >= 85 else "B" if avg >= 70 else "C"\n    print(f"{name:<6} avg={avg:6.2f} grade={grade}")\n\ntopper = max(students, key=lambda n: average(students[n]))\nprint("Topper:", topper)\n' } },
  'OOP with modules (2 files)': {
    files: {
      'main.py': 'from bank import Account\n\nacc = Account("Riya", 1000)\nacc.deposit(500)\ntry:\n    acc.withdraw(2000)\nexcept ValueError as e:\n    print("Error:", e)\nacc.withdraw(300)\nprint(acc)\n',
      'bank.py': 'class Account:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self._balance = balance\n\n    def deposit(self, amount):\n        self._balance += amount\n        print(f"Deposited {amount}")\n\n    def withdraw(self, amount):\n        if amount > self._balance:\n            raise ValueError("Insufficient balance")\n        self._balance -= amount\n        print(f"Withdrew {amount}")\n\n    def __str__(self):\n        return f"{self.owner}: balance = {self._balance}"\n',
    },
  },
  'File handling (CSV)': { files: { 'main.py': 'import csv\n\nrows = [["name", "city", "salary"], ["Asha", "Pune", 52000], ["Ravi", "Mumbai", 61000], ["Neha", "Pune", 58000]]\nwith open("employees.csv", "w", newline="") as f:\n    csv.writer(f).writerows(rows)\n\nwith open("employees.csv") as f:\n    reader = csv.DictReader(f)\n    pune = [r for r in reader if r["city"] == "Pune"]\n\nprint("Pune employees:", [r["name"] for r in pune])\nprint("Total salary:", sum(int(r["salary"]) for r in pune))\n' } },
  'Pandas (data analysis)': { files: { 'main.py': 'import pandas as pd\n\ndf = pd.DataFrame({\n    "region": ["West", "West", "North", "South", "North"],\n    "sales": [120, 90, 150, 80, 60],\n})\nprint(df)\nprint()\nprint(df.groupby("region")["sales"].sum().sort_values(ascending=False))\n' } },
};

function readStore() { try { return JSON.parse(localStorage.getItem(STORE)) || null; } catch { return null; } }

export default function PythonIDE() {
  const initial = useMemo(() => {
    let loaded = null;
    try { loaded = JSON.parse(sessionStorage.getItem(PY_LOAD_KEY)); sessionStorage.removeItem(PY_LOAD_KEY); } catch { /* ignore */ }
    if (loaded?.files) return { files: loaded.files, stdin: loaded.stdin || '', expected: loaded.expected || '', title: loaded.title || null };
    const st = readStore();
    if (st?.files) return { ...st, expected: '', title: null };
    return { files: TEMPLATES['Hello World'].files, stdin: '', expected: '', title: 'Hello World' };
  }, []);

  const [files, setFiles] = useState(initial.files);
  const [stdin, setStdin] = useState(initial.stdin);
  const [expected, setExpected] = useState(initial.expected);
  const [title, setTitle] = useState(initial.title);
  const [active, setActive] = useState(Object.keys(initial.files).includes('main.py') ? 'main.py' : Object.keys(initial.files)[0]);
  const [out, setOut] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | running | error
  const [version, setVersion] = useState('');
  const [panel, setPanel] = useState('run');
  const [fallback, setFallback] = useState(false);
  const runToken = useRef(0);

  useEffect(() => { loader.init().catch(() => setFallback(true)); }, []);
  useEffect(() => {
    ensurePython().then((m) => { if (m.type === 'ready') { setStatus('ready'); setVersion(m.version); } else setStatus('error'); });
  }, []);
  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify({ files, stdin })); } catch { /* ignore */ } }, [files, stdin]);

  const names = Object.keys(files);
  const cur = files[active] != null ? active : names[0];

  const run = async () => {
    if (status === 'running') return;
    if (!files['main.py']) { setOut([{ k: 'err', t: 'Create a file named main.py: it is the file that runs.' }]); return; }
    const token = ++runToken.current;
    setOut([{ k: 'sys', t: '$ python main.py\n' }]);
    setPanel('run');
    setStatus('running');
    await runPython({ files, stdin }, (m) => {
      if (token !== runToken.current) return;
      if (m.type === 'out') setOut((o) => [...o, { k: 'out', t: m.text }]);
      if (m.type === 'err') setOut((o) => [...o, { k: 'err', t: m.text }]);
      if (m.type === 'in') setOut((o) => [...o, { k: 'in', t: m.text }]);
      if (m.type === 'done') setOut((o) => [...o, m.error ? { k: 'err', t: '\n' + m.error } : { k: 'sys', t: `\nProcess finished in ${m.ms} ms` }]);
    });
    if (token === runToken.current) setStatus('ready');
  };
  const stop = async () => { runToken.current++; setStatus('loading'); setOut((o) => [...o, { k: 'err', t: '\nStopped.' }]); const m = await restartPython(); setStatus(m.type === 'ready' ? 'ready' : 'error'); };

  const addFile = () => {
    const n = window.prompt('New Python file name (e.g. utils.py):');
    if (!n) return;
    const f = n.endsWith('.py') ? n : `${n}.py`;
    if (!/^[A-Za-z_]\w*\.py$/.test(f)) { window.alert('Use a valid module name, e.g. helpers.py'); return; }
    if (!files[f]) setFiles({ ...files, [f]: '' });
    setActive(f);
  };
  const delFile = (n) => {
    if (n === 'main.py' || !window.confirm(`Delete ${n}?`)) return;
    const f = { ...files }; delete f[n]; setFiles(f); setActive('main.py');
  };
  const loadTemplate = (name) => {
    if (!name) return;
    const t = TEMPLATES[name];
    setFiles({ ...t.files }); setStdin(t.stdin || ''); setExpected(''); setActive('main.py'); setTitle(name); setOut([]);
  };
  const download = () => names.forEach((n, i) => setTimeout(() => {
    const url = URL.createObjectURL(new Blob([files[n]], { type: 'text/x-python' }));
    const a = document.createElement('a'); a.href = url; a.download = n; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, i * 300));

  const onMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.F10, () => document.getElementById('py-run-btn')?.click());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => document.getElementById('py-run-btn')?.click());
  };

  const actual = out.filter((o) => o.k === 'out' || o.k === 'in').map((o) => o.t).join('').trim();
  const matches = expected && actual && actual === expected.trim();

  return (
    <div className="jide pyide">
      <div className="jide-top">
        <div className="jide-title">
          <span className="jide-logo py">🐍</span>
          <b>Python IDE</b>
          <span className="jide-sub">PyCharm style · {status === 'loading' ? 'loading Python…' : status === 'error' ? 'Python failed to load (needs internet once)' : `Python ${version} in your browser`}{title ? ` · ${title}` : ''}</span>
        </div>
        <div className="jide-actions">
          <select value="" onChange={(e) => loadTemplate(e.target.value)}>
            <option value="">📂 Load example…</option>
            {Object.keys(TEMPLATES).map((t) => <option key={t}>{t}</option>)}
          </select>
          <button id="py-run-btn" className="btn small primary" onClick={run} disabled={status !== 'ready'} title="Shift+F10 / Ctrl+Enter">▶ Run 'main'</button>
          <button className="btn small" onClick={stop} disabled={status !== 'running'}>■ Stop</button>
          <button className="btn small" onClick={download}>⬇ Download .py</button>
        </div>
      </div>

      <div className="jide-body">
        <aside className="jide-tree">
          <div className="jide-tree-head"><span>Project</span><button className="link-btn" onClick={addFile}>＋ File</button></div>
          <div className="jide-node">▾ 📁 my_python_project</div>
          {names.map((n) => (
            <div key={n} className={`jide-file ${n === cur ? 'on' : ''}`} onClick={() => setActive(n)}>
              <span>🐍 {n}</span>
              {n !== 'main.py' && <button className="link-btn" onClick={(e) => { e.stopPropagation(); delFile(n); }}>✕</button>}
            </div>
          ))}
          <div className="jide-help"><b>Tips</b><br />main.py runs first.<br />Other files can be imported:<br /><code>from bank import Account</code><br /><br />Shift+F10 / Ctrl+Enter: run<br />Ctrl+/: comment<br />numpy/pandas load automatically.</div>
        </aside>

        <section className="jide-editor">
          <div className="pg-tabs">
            {names.map((n) => <button key={n} className={`pg-tab ${n === cur ? 'on' : ''}`} onClick={() => setActive(n)}>🐍 {n}</button>)}
          </div>
          <div className="pg-monaco">
            {fallback ? (
              <textarea className="pg-fallback" spellCheck={false} value={files[cur]} onChange={(e) => setFiles({ ...files, [cur]: e.target.value })} />
            ) : (
              <Editor key={cur} language="python" path={cur} theme="vs-dark" value={files[cur]} onMount={onMount}
                onChange={(v) => setFiles((f) => ({ ...f, [cur]: v ?? '' }))}
                loading={<div className="pg-loading">Loading editor…</div>}
                options={{ fontSize: 14, minimap: { enabled: false }, tabSize: 4, insertSpaces: true, automaticLayout: true, scrollBeyondLastLine: false, bracketPairColorization: { enabled: true } }} />
            )}
          </div>
        </section>

        <section className="jide-bottom">
          <div className="jide-ptabs">
            {[['run', '▶ Run'], ['input', `⌨ Input (stdin)${stdin.trim() ? ' •' : ''}`], ['expected', '📋 Expected Output']].map(([k, l]) => (
              <button key={k} className={panel === k ? 'on' : ''} onClick={() => setPanel(k)}>{l}</button>
            ))}
            {expected && actual && <span className={`py-match ${matches ? 'ok' : 'bad'}`}>{matches ? '✓ Output matches expected' : '≠ Output differs from expected'}</span>}
          </div>
          <div className="jide-pbody">
            {panel === 'run' && (
              out.length ? <pre className="jide-out">{out.map((o, i) => <span key={i} className={`py-${o.k}`}>{o.t}</span>)}</pre>
                : <div className="pg-muted">{status === 'loading' ? 'Loading Python (first time takes a few seconds)…' : 'Click ▶ Run to execute main.py. Output appears here.'}</div>
            )}
            {panel === 'input' && (
              <div>
                <div className="pg-muted">Each line is returned by one input() call, in order.</div>
                <textarea className="jide-stdin" value={stdin} onChange={(e) => setStdin(e.target.value)} placeholder={'Asha\n21'} />
              </div>
            )}
            {panel === 'expected' && (expected ? <pre className="jide-out">{expected}</pre> : <div className="pg-muted">Open an example from a lesson to compare your output with the expected output.</div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
