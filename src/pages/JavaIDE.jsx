import { useEffect, useMemo, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';

import Ico from '../components/Ico.jsx';
export const JAVA_LOAD_KEY = 'xlpbi-java-load';
const STORE = 'xlpbi-java-ide-v1';

const TEMPLATES = {
  'Hello World': { files: { 'Main.java': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}\n' }, expected: 'Hello, Java!' },
  'Scanner input': {
    files: { 'Main.java': 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.print("Enter your name: ");\n        String name = sc.nextLine();\n        System.out.print("Enter your age: ");\n        int age = sc.nextInt();\n        System.out.println("Hello " + name + ", next year you will be " + (age + 1));\n        sc.close();\n    }\n}\n' },
    stdin: 'Asha\n21\n', expected: 'Enter your name: Enter your age: Hello Asha, next year you will be 22',
  },
  'OOP: classes in separate files': {
    files: {
      'Main.java': 'public class Main {\n    public static void main(String[] args) {\n        Student s1 = new Student("Riya", 88);\n        Student s2 = new Student("Aman", 72);\n        s1.display();\n        s2.display();\n        System.out.println("Topper: " + (s1.getMarks() > s2.getMarks() ? s1.getName() : s2.getName()));\n    }\n}\n',
      'Student.java': 'public class Student {\n    private String name;\n    private int marks;\n\n    public Student(String name, int marks) {\n        this.name = name;\n        this.marks = marks;\n    }\n\n    public String getName() { return name; }\n    public int getMarks() { return marks; }\n\n    public void display() {\n        System.out.println(name + " scored " + marks);\n    }\n}\n',
    },
    expected: 'Riya scored 88\nAman scored 72\nTopper: Riya',
  },
  'Collections: ArrayList & HashMap': {
    files: { 'Main.java': 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        List<String> cities = new ArrayList<>(List.of("Pune", "Mumbai", "Nagpur"));\n        cities.add("Nashik");\n        Collections.sort(cities);\n        System.out.println(cities);\n\n        Map<String, Integer> marks = new TreeMap<>();\n        marks.put("Riya", 88);\n        marks.put("Aman", 72);\n        marks.put("Neha", 95);\n        for (Map.Entry<String, Integer> e : marks.entrySet()) {\n            System.out.println(e.getKey() + " -> " + e.getValue());\n        }\n    }\n}\n' },
    expected: '[Mumbai, Nagpur, Nashik, Pune]\nAman -> 72\nNeha -> 95\nRiya -> 88',
  },
  'Streams': {
    files: { 'Main.java': 'import java.util.*;\nimport java.util.stream.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        List<Integer> nums = List.of(5, 12, 7, 20, 3, 18);\n        List<Integer> evensDoubled = nums.stream()\n            .filter(n -> n % 2 == 0)\n            .map(n -> n * 2)\n            .collect(Collectors.toList());\n        System.out.println(evensDoubled);\n        System.out.println("Sum = " + nums.stream().mapToInt(Integer::intValue).sum());\n    }\n}\n' },
    expected: '[24, 40, 36]\nSum = 65',
  },
};

function readStore() { try { return JSON.parse(localStorage.getItem(STORE)) || null; } catch { return null; } }

export default function JavaIDE() {
  const initial = useMemo(() => {
    let loaded = null;
    try { loaded = JSON.parse(sessionStorage.getItem(JAVA_LOAD_KEY)); sessionStorage.removeItem(JAVA_LOAD_KEY); } catch { /* ignore */ }
    if (loaded?.files) return { files: loaded.files, stdin: loaded.stdin || '', expected: loaded.expected || '', title: loaded.title || null };
    const st = readStore();
    if (st?.files) return { ...st, title: null };
    const t = TEMPLATES['Hello World'];
    return { files: t.files, stdin: '', expected: t.expected, title: 'Hello World' };
  }, []);

  const [files, setFiles] = useState(initial.files);
  const [stdin, setStdin] = useState(initial.stdin);
  const [expected, setExpected] = useState(initial.expected);
  const [title, setTitle] = useState(initial.title);
  const [active, setActive] = useState(Object.keys(initial.files)[0]);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('xlpbi-java-theme') || 'intellij'; } catch { return 'intellij'; } });
  const [panel, setPanel] = useState('expected');
  const [fallback, setFallback] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => { loader.init().catch(() => setFallback(true)); }, []);
  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify({ files, stdin, expected })); } catch { /* ignore */ } }, [files, stdin, expected]);
  useEffect(() => { try { localStorage.setItem('xlpbi-java-theme', theme); } catch { /* ignore */ } }, [theme]);

  const names = Object.keys(files);
  const cur = files[active] != null ? active : names[0];

  const addFile = () => {
    const n = window.prompt('New class name (e.g. Student):');
    if (!n) return;
    const cls = n.replace(/\.java$/, '').replace(/[^A-Za-z0-9_]/g, '');
    if (!cls) return;
    const fname = `${cls}.java`;
    if (files[fname]) { setActive(fname); return; }
    setFiles({ ...files, [fname]: `public class ${cls} {\n\n}\n` });
    setActive(fname);
  };
  const delFile = (n) => {
    if (names.length === 1) return;
    if (!window.confirm(`Delete ${n}?`)) return;
    const f = { ...files }; delete f[n]; setFiles(f); setActive(Object.keys(f)[0]);
  };
  const loadTemplate = (name) => {
    if (!name) return;
    const t = TEMPLATES[name];
    setFiles({ ...t.files }); setStdin(t.stdin || ''); setExpected(t.expected || ''); setActive(Object.keys(t.files)[0]); setTitle(name); setPanel('expected');
  };
  const copy = async (text, label) => {
    try { await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(''), 1500); } catch { /* ignore */ }
  };
  const downloadFile = (n) => {
    const url = URL.createObjectURL(new Blob([files[n]], { type: 'text/x-java' }));
    const a = document.createElement('a'); a.href = url; a.download = n; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const downloadAll = () => names.forEach((n, i) => setTimeout(() => downloadFile(n), i * 300));

  const isLight = theme === 'eclipse';

  return (
    <div className={`jide ${isLight ? 'light' : ''}`}>
      <div className="jide-top">
        <div className="jide-title">
          <span className="jide-logo"><Ico e="☕" /></span>
          <b>Java IDE</b>
          <span className="jide-sub">{theme === 'intellij' ? 'IntelliJ IDEA style' : 'Eclipse style'}{title ? ` · ${title}` : ''}</span>
        </div>
        <div className="jide-actions">
          <div className="seg">
            <button className={theme === 'intellij' ? 'on' : ''} onClick={() => setTheme('intellij')}>IntelliJ (dark)</button>
            <button className={theme === 'eclipse' ? 'on' : ''} onClick={() => setTheme('eclipse')}>Eclipse (light)</button>
          </div>
          <select value="" onChange={(e) => loadTemplate(e.target.value)}>
            <option value="">Load example…</option>
            {Object.keys(TEMPLATES).map((t) => <option key={t}>{t}</option>)}
          </select>
          <button className="btn small primary jide-run" disabled title="Running Java needs a JDK on this computer. See the Run panel.">▶ Run 'Main'</button>
          <button className="btn small" onClick={() => copy(files[cur], 'file')}>{copied === 'file' ? 'Copied ✓' : '⧉ Copy file'}</button>
          <button className="btn small" onClick={downloadAll}><Ico e="⬇" /> Download .java files</button>
        </div>
      </div>

      <div className="jide-body">
        <aside className="jide-tree">
          <div className="jide-tree-head"><span>Project</span><button className="link-btn" onClick={addFile} title="New Java class">＋ Class</button></div>
          <div className="jide-node">▾ <Ico e="📁" /> MyJavaProject</div>
          <div className="jide-node l2">▾ <Ico e="📁" /> src</div>
          {names.map((n) => (
            <div key={n} className={`jide-file ${n === cur ? 'on' : ''}`} onClick={() => setActive(n)}>
              <span>Ⓒ {n.replace(/\.java$/, '')}</span>
              {names.length > 1 && <button className="link-btn" onClick={(e) => { e.stopPropagation(); delFile(n); }} title="Delete">✕</button>}
            </div>
          ))}
          <div className="jide-help">
            <b>Editor shortcuts</b><br />Ctrl+Space: suggestions<br />Ctrl+/: comment line<br />Alt+↑/↓: move line<br />Shift+Alt+F: format<br />Ctrl+D: select next match
          </div>
        </aside>

        <section className="jide-editor">
          <div className="pg-tabs">
            {names.map((n) => <button key={n} className={`pg-tab ${n === cur ? 'on' : ''}`} onClick={() => setActive(n)}><Ico e="☕" /> {n}</button>)}
          </div>
          <div className="pg-monaco">
            {fallback ? (
              <textarea className="pg-fallback" spellCheck={false} value={files[cur]} onChange={(e) => setFiles({ ...files, [cur]: e.target.value })} />
            ) : (
              <Editor
                key={cur}
                language="java"
                path={cur}
                theme={isLight ? 'vs' : 'vs-dark'}
                value={files[cur]}
                onChange={(v) => setFiles((f) => ({ ...f, [cur]: v ?? '' }))}
                loading={<div className="pg-loading">Loading editor…</div>}
                options={{ fontSize: 14, minimap: { enabled: false }, tabSize: 4, automaticLayout: true, scrollBeyondLastLine: false, bracketPairColorization: { enabled: true }, renderLineHighlight: 'all' }}
              />
            )}
          </div>
        </section>

        <section className="jide-bottom">
          <div className="jide-ptabs">
            {[['expected', 'Expected Output'], ['input', '⌨ Program Input (stdin)'], ['run', '▶ Run in Eclipse / IntelliJ']].map(([k, l]) => (
              <button key={k} className={panel === k ? 'on' : ''} onClick={() => setPanel(k)}>{l}</button>
            ))}
          </div>
          <div className="jide-pbody">
            {panel === 'expected' && (
              expected ? <pre className="jide-out">{expected}</pre>
                : <div className="pg-muted">Open an example from a lesson (▶ Open in Java IDE) to see its expected output here.</div>
            )}
            {panel === 'input' && (
              <div>
                <div className="pg-muted">Values your program reads with Scanner, one per line. Paste these into the Run console in your IDE when it asks for input.</div>
                <textarea className="jide-stdin" value={stdin} onChange={(e) => setStdin(e.target.value)} placeholder={'5\n10'} />
              </div>
            )}
            {panel === 'run' && (
              <div className="jide-howto">
                <p><b>IntelliJ IDEA:</b> File › New › Project › Java → right-click <code>src</code> › New › Java Class → paste each file → click the green ▶ next to <code>main</code> (Shift+F10).</p>
                <p><b>Eclipse:</b> File › New › Java Project → right-click <code>src</code> › New › Class → paste each file → Run As › Java Application (Ctrl+F11).</p>
                <p><b>Terminal:</b> save the files in one folder, then <code>javac *.java</code> and <code>java Main</code>.</p>
                <p className="pg-muted">Running Java directly inside this page needs a JDK on this computer and is not enabled yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
