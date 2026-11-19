import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { buildWebDoc, buildReactDoc, PLAYGROUND_LOAD_KEY, LIBS } from '../components/playgroundRuntime.js';

import Ico from '../components/Ico.jsx';
const TEMPLATES = {
  web: {
    'Starter page': {
      html: '<h1>Hello, World! </h1>\n<p>Edit the files on the left and see the result here.</p>\n<button id="btn">Click me</button>',
      css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 24px;\n}\n\nh1 {\n  color: #4f46e5;\n}\n\nbutton {\n  padding: 8px 16px;\n  border-radius: 8px;\n  border: none;\n  background: #4f46e5;\n  color: white;\n  cursor: pointer;\n}',
      js: "const btn = document.getElementById('btn');\nlet count = 0;\n\nbtn.addEventListener('click', () => {\n  count++;\n  btn.textContent = `Clicked ${count} times`;\n  console.log('Button clicked', count);\n});",
    },
    'Flexbox navbar': {
      html: '<nav class="nav">\n  <div class="logo">MySite</div>\n  <ul>\n    <li><a href="#">Home</a></li>\n    <li><a href="#">About</a></li>\n    <li><a href="#">Contact</a></li>\n  </ul>\n</nav>',
      css: 'body { margin: 0; font-family: system-ui; }\n.nav {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 12px 24px;\n  background: #1e293b;\n}\n.logo { color: #fff; font-weight: 700; }\n.nav ul { display: flex; gap: 20px; list-style: none; margin: 0; padding: 0; }\n.nav a { color: #cbd5e1; text-decoration: none; }\n.nav a:hover { color: #fff; }',
      js: '',
    },
    'Card grid (CSS Grid)': {
      html: '<div class="grid">\n  <div class="card">Card 1</div>\n  <div class="card">Card 2</div>\n  <div class="card">Card 3</div>\n  <div class="card">Card 4</div>\n  <div class="card">Card 5</div>\n  <div class="card">Card 6</div>\n</div>',
      css: '.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));\n  gap: 16px;\n  padding: 16px;\n}\n.card {\n  padding: 32px;\n  border-radius: 12px;\n  background: linear-gradient(135deg, #6366f1, #06b6d4);\n  color: white;\n  font: 600 18px system-ui;\n  text-align: center;\n}',
      js: '',
    },
    'JavaScript console practice': {
      html: '<p>Open the Console panel below to see the output.</p>',
      css: '',
      js: "const students = [\n  { name: 'Asha', marks: 82 },\n  { name: 'Ravi', marks: 67 },\n  { name: 'Neha', marks: 91 },\n];\n\nconst passed = students.filter(s => s.marks >= 70);\nconsole.log('Passed:', passed.map(s => s.name));\n\nconst avg = students.reduce((sum, s) => sum + s.marks, 0) / students.length;\nconsole.log('Average:', avg.toFixed(2));",
    },
    'Bootstrap 5 page': {
      libs: ['bootstrap', 'bootstrap-icons'],
      html: '<nav class="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">\n  <div class="container">\n    <a class="navbar-brand" href="#"><i class="bi bi-mortarboard"></i> UpSkillr</a>\n    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav"><span class="navbar-toggler-icon"></span></button>\n    <div class="collapse navbar-collapse" id="nav">\n      <ul class="navbar-nav ms-auto">\n        <li class="nav-item"><a class="nav-link active" href="#">Home</a></li>\n        <li class="nav-item"><a class="nav-link" href="#">Courses</a></li>\n      </ul>\n    </div>\n  </div>\n</nav>\n<main class="container py-5">\n  <div class="row g-4">\n    <div class="col-md-4"><div class="card h-100 shadow-sm"><div class="card-body"><h5 class="card-title">HTML</h5><p class="card-text">Structure of web pages.</p><a href="#" class="btn btn-primary">Start</a></div></div></div>\n    <div class="col-md-4"><div class="card h-100 shadow-sm"><div class="card-body"><h5 class="card-title">CSS</h5><p class="card-text">Style and layout.</p><a href="#" class="btn btn-success">Start</a></div></div></div>\n    <div class="col-md-4"><div class="card h-100 shadow-sm"><div class="card-body"><h5 class="card-title">JavaScript</h5><p class="card-text">Make it interactive.</p><button class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#m">Open modal</button></div></div></div>\n  </div>\n</main>\n<div class="modal fade" id="m" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Hello Bootstrap</h5><button class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body">Modals work because the Bootstrap JS bundle is loaded.</div></div></div></div>',
      css: '',
      js: "console.log('Bootstrap version:', bootstrap.Tooltip.VERSION);",
    },
    'Vue 3 app': {
      libs: ['vue'],
      html: '<div id="app">\n  <h1>{{ title }}</h1>\n  <input v-model="newTask" @keyup.enter="add" placeholder="Add a task">\n  <button @click="add">Add</button>\n  <p>{{ remaining }} of {{ tasks.length }} left</p>\n  <ul>\n    <li v-for="t in tasks" :key="t.id" @click="t.done = !t.done" :class="{ done: t.done }">{{ t.text }}</li>\n  </ul>\n</div>',
      css: 'body { font-family: system-ui; padding: 16px; }\n.done { text-decoration: line-through; color: #888; }\nli { cursor: pointer; }',
      js: "const { createApp, ref, computed } = Vue;\n\ncreateApp({\n  setup() {\n    const title = ref('My Vue Tasks');\n    const newTask = ref('');\n    const tasks = ref([{ id: 1, text: 'Learn Vue', done: false }]);\n    const remaining = computed(() => tasks.value.filter((t) => !t.done).length);\n    function add() {\n      if (!newTask.value.trim()) return;\n      tasks.value.push({ id: Date.now(), text: newTask.value, done: false });\n      newTask.value = '';\n    }\n    return { title, newTask, tasks, remaining, add };\n  },\n}).mount('#app');",
    },
    'Fetch API demo': {
      html: '<h2>Users</h2>\n<ul id="list">Loading…</ul>',
      css: 'body { font-family: system-ui; padding: 16px; }',
      js: "async function loadUsers() {\n  try {\n    const res = await fetch('https://jsonplaceholder.typicode.com/users');\n    if (!res.ok) throw new Error('HTTP ' + res.status);\n    const users = await res.json();\n    document.getElementById('list').innerHTML = users\n      .map(u => `<li>${u.name} – ${u.email}</li>`)\n      .join('');\n  } catch (err) {\n    console.error('Failed:', err.message);\n  }\n}\nloadUsers();",
    },
  },
  react: {
    'Counter (useState)': {
      jsx: "const { useState } = React;\n\nfunction App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div className=\"box\">\n      <h1>Count: {count}</h1>\n      <button onClick={() => setCount(count + 1)}>+1</button>\n      <button onClick={() => setCount(0)}>Reset</button>\n    </div>\n  );\n}",
      css: '.box { text-align: center; }\nbutton { margin: 4px; padding: 8px 16px; font-size: 16px; }',
    },
    'Todo list': {
      jsx: "const { useState } = React;\n\nfunction App() {\n  const [text, setText] = useState('');\n  const [todos, setTodos] = useState([]);\n\n  function addTodo(e) {\n    e.preventDefault();\n    if (!text.trim()) return;\n    setTodos([...todos, { id: Date.now(), text, done: false }]);\n    setText('');\n  }\n  function toggle(id) {\n    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));\n  }\n\n  return (\n    <div>\n      <h2>My Todos ({todos.filter(t => !t.done).length} left)</h2>\n      <form onSubmit={addTodo}>\n        <input value={text} onChange={e => setText(e.target.value)} placeholder=\"Add a task\" />\n        <button>Add</button>\n      </form>\n      <ul>\n        {todos.map(t => (\n          <li key={t.id} onClick={() => toggle(t.id)} style={{ textDecoration: t.done ? 'line-through' : 'none', cursor: 'pointer' }}>\n            {t.text}\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
      css: 'input { padding: 6px; margin-right: 6px; }',
    },
    'Fetch with useEffect': {
      jsx: "const { useState, useEffect } = React;\n\nfunction App() {\n  const [posts, setPosts] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')\n      .then(res => res.json())\n      .then(data => setPosts(data))\n      .catch(err => setError(err.message))\n      .finally(() => setLoading(false));\n  }, []);\n\n  if (loading) return <p>Loading…</p>;\n  if (error) return <p>Error: {error}</p>;\n  return (\n    <ul>\n      {posts.map(p => <li key={p.id}>{p.title}</li>)}\n    </ul>\n  );\n}",
      css: '',
    },
  },
};

const FILES = {
  web: [['html', 'index.html', 'html'], ['css', 'style.css', 'css'], ['js', 'script.js', 'javascript']],
  react: [['jsx', 'App.jsx', 'javascript'], ['css', 'style.css', 'css']],
};
const ICON = { html: '🟧', css: '🟦', js: '🟨', jsx: '⚛️' };
const STORE = 'xlpbi-playground-v1';

function readStore() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; } }

export default function CodePlayground() {
  const initial = useMemo(() => {
    let loaded = null;
    try { loaded = JSON.parse(sessionStorage.getItem(PLAYGROUND_LOAD_KEY)); sessionStorage.removeItem(PLAYGROUND_LOAD_KEY); } catch { /* ignore */ }
    if (loaded) {
      const mode = loaded.jsx ? 'react' : 'web';
      return { mode, title: loaded.title, files: mode === 'react' ? { jsx: loaded.jsx || '', css: loaded.css || '' } : { html: loaded.html || '', css: loaded.css || '', js: loaded.js || '', libs: loaded.libs || [] } };
    }
    const st = readStore();
    const mode = st.mode || 'web';
    return { mode, title: null, files: st[mode] || TEMPLATES[mode][Object.keys(TEMPLATES[mode])[0]] };
  }, []);

  const [mode, setMode] = useState(initial.mode);
  const [files, setFiles] = useState(initial.files);
  const [title, setTitle] = useState(initial.title);
  const [active, setActive] = useState(FILES[initial.mode][0][0]);
  const [doc, setDoc] = useState('');
  const [logs, setLogs] = useState([]);
  const [autoRun, setAutoRun] = useState(true);
  const [fallback, setFallback] = useState(false);
  const [layout, setLayout] = useState('side'); // side | bottom
  const [runId, setRunId] = useState(0);
  const iframeRef = useRef(null);
  const filesRef = useRef(files);
  filesRef.current = files;

  useEffect(() => { loader.init().catch(() => setFallback(true)); }, []);

  const run = useCallback(() => {
    setLogs([]);
    const f = filesRef.current;
    setDoc(mode === 'react' ? buildReactDoc(f) : buildWebDoc(f));
    setRunId((r) => r + 1);
  }, [mode]);

  // persist
  useEffect(() => {
    const st = readStore();
    try { localStorage.setItem(STORE, JSON.stringify({ ...st, mode, [mode]: files })); } catch { /* ignore */ }
  }, [files, mode]);

  // auto-run (debounced)
  useEffect(() => {
    if (!autoRun) return undefined;
    const id = setTimeout(run, 700);
    return () => clearTimeout(id);
  }, [files, autoRun, run]);

  // console messages
  useEffect(() => {
    const h = (e) => {
      if (!e.data || !e.data.__pg) return;
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) return;
      setLogs((l) => [...l.slice(-199), { level: e.data.level, text: e.data.text }]);
    };
    window.addEventListener('message', h);
    return () => window.removeEventListener('message', h);
  }, []);

  const switchMode = (m) => {
    if (m === mode) return;
    const st = readStore();
    setMode(m);
    setFiles(st[m] || TEMPLATES[m][Object.keys(TEMPLATES[m])[0]]);
    setActive(FILES[m][0][0]);
    setTitle(null);
  };
  const loadTemplate = (name) => {
    if (!name) return;
    setFiles({ ...TEMPLATES[mode][name] });
    setActive(FILES[mode][0][0]);
    setTitle(name);
  };
  const download = () => {
    const html = mode === 'react' ? buildReactDoc(files) : buildWebDoc(files);
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'index.html'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const openNewTab = () => {
    const html = mode === 'react' ? buildReactDoc(files) : buildWebDoc(files);
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    window.open(url, '_blank');
  };

  const fileDefs = FILES[mode];
  const cur = fileDefs.find((f) => f[0] === active) || fileDefs[0];

  const onMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => run());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => run());
    monaco.languages.typescript?.javascriptDefaults?.setCompilerOptions({ jsx: monaco.languages.typescript.JsxEmit.React, allowJs: true, allowNonTsExtensions: true, target: monaco.languages.typescript.ScriptTarget.ES2020 });
    monaco.languages.typescript?.javascriptDefaults?.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: mode === 'react' });
  };

  return (
    <div className="pg">
      <div className="pg-top">
        <div className="pg-title">
          <span className="pg-logo">⌨</span>
          <b>Code Playground</b>
          {title && <span className="pg-sub">· {title}</span>}
        </div>
        <div className="pg-actions">
          <div className="seg">
            <button className={mode === 'web' ? 'on' : ''} onClick={() => switchMode('web')}>HTML / CSS / JS</button>
            <button className={mode === 'react' ? 'on' : ''} onClick={() => switchMode('react')}>React (JSX)</button>
          </div>
          <select value="" onChange={(e) => loadTemplate(e.target.value)}>
            <option value="">Load template…</option>
            {Object.keys(TEMPLATES[mode]).map((t) => <option key={t}>{t}</option>)}
          </select>
          {mode === 'web' && Object.entries(LIBS).map(([k, l]) => (
            <label key={k} className="check" title={`Load ${l.label} from CDN`}>
              <input type="checkbox" checked={(files.libs || []).includes(k)} onChange={(e) => setFiles((f) => ({ ...f, libs: e.target.checked ? [...(f.libs || []), k] : (f.libs || []).filter((x) => x !== k) }))} /> {l.label}
            </label>
          ))}
          <label className="check"><input type="checkbox" checked={autoRun} onChange={(e) => setAutoRun(e.target.checked)} /> Auto run</label>
          <button className="btn small primary" onClick={run} title="Ctrl + Enter">▶ Run</button>
          <button className="btn small" onClick={() => setLayout(layout === 'side' ? 'bottom' : 'side')} title="Toggle layout">{layout === 'side' ? <></> : '◫'} Layout</button>
          <button className="btn small" onClick={openNewTab}>↗ New tab</button>
          <button className="btn small" onClick={download}><Ico e="⬇" /> Download</button>
        </div>
      </div>

      <div className={`pg-body ${layout}`}>
        <aside className="pg-explorer">
          <div className="pg-explorer-head">EXPLORER</div>
          <div className="pg-folder">▾ {mode === 'react' ? 'react-app' : 'my-website'}</div>
          {fileDefs.map(([k, name]) => (
            <button key={k} className={`pg-file ${active === k ? 'on' : ''}`} onClick={() => setActive(k)}>
              <span><Ico e={ICON[k]} /></span> {name}
            </button>
          ))}
          <div className="pg-help">
            <b>Shortcuts</b><br />Ctrl+Enter: run<br />Ctrl+S: run<br />Ctrl+/: comment<br />Alt+↑/↓: move line<br />Shift+Alt+F: format
          </div>
        </aside>

        <section className="pg-editor">
          <div className="pg-tabs">
            {fileDefs.map(([k, name]) => (
              <button key={k} className={`pg-tab ${active === k ? 'on' : ''}`} onClick={() => setActive(k)}><Ico e={ICON[k]} /> {name}</button>
            ))}
          </div>
          <div className="pg-monaco">
            {fallback ? (
              <textarea className="pg-fallback" spellCheck={false} value={files[cur[0]] || ''} onChange={(e) => setFiles({ ...files, [cur[0]]: e.target.value })} />
            ) : (
              <Editor
                key={mode + cur[0]}
                language={cur[2]}
                path={cur[1]}
                theme="vs-dark"
                value={files[cur[0]] || ''}
                onChange={(v) => setFiles((f) => ({ ...f, [cur[0]]: v ?? '' }))}
                onMount={onMount}
                loading={<div className="pg-loading">Loading VS Code editor…</div>}
                options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: 'on', tabSize: 2, automaticLayout: true, scrollBeyondLastLine: false, fontLigatures: true, formatOnPaste: true, renderWhitespace: 'selection', bracketPairColorization: { enabled: true } }}
              />
            )}
          </div>
        </section>

        <section className="pg-output">
          <div className="pg-preview-head"><span><Ico e="🌐" /> Preview</span><span className="pg-sub">{mode === 'react' ? 'React 18 + Babel (needs internet)' : 'Live'}</span></div>
          <iframe
            key={runId}
            ref={iframeRef}
            title="preview"
            className="pg-iframe"
            srcDoc={doc}
            sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
            allow="geolocation; clipboard-read; clipboard-write; fullscreen"
          />
          <div className="pg-console">
            <div className="pg-console-head">
              <span>CONSOLE {logs.length > 0 && <span className="pg-badge">{logs.length}</span>}</span>
              <button className="link-btn" onClick={() => setLogs([])}>Clear</button>
            </div>
            <div className="pg-console-body">
              {logs.length === 0 && <div className="pg-muted">console.log() output and errors appear here</div>}
              {logs.map((l, i) => <pre key={i} className={`pg-log ${l.level}`}>{l.level === 'error' ? '✖ ' : l.level === 'warn' ? <><Ico e="⚠" /> </> : '› '}{l.text}</pre>)}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
