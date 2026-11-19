import { useEffect, useMemo, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';

import Ico from '../components/Ico.jsx';
export const CS_LOAD_KEY = 'xlpbi-csharp-load';
const STORE = 'xlpbi-csharp-ide-v1';

const TEMPLATES = {
  'Hello World (Console App)': { files: { 'Program.cs': '// Console App (.NET 10) – top-level statements\nConsole.WriteLine("Hello, C#! ");\n\nstring name = "Student";\nint year = 2026;\nConsole.WriteLine($"Welcome {name}, year {year}");\n' }, expected: 'Hello, C#! Welcome Student, year 2026' },
  'Read input (Console.ReadLine)': { files: { 'Program.cs': 'Console.Write("Enter your name: ");\nstring? name = Console.ReadLine();\nConsole.Write("Enter your age: ");\nint age = int.Parse(Console.ReadLine() ?? "0");\nConsole.WriteLine($"Hello {name}, next year you will be {age + 1}");\n' }, stdin: 'Asha\n21\n', expected: 'Enter your name: Enter your age: Hello Asha, next year you will be 22' },
  'OOP: Encapsulation (BankAccount)': {
    files: {
      'Program.cs': 'var account = new BankAccount("Riya", 1000);\naccount.Deposit(5000);\naccount.Withdraw(2500);\nConsole.WriteLine($"{account.Owner}: {account.Balance}");\n',
      'BankAccount.cs': 'public class BankAccount\n{\n    private decimal balance;\n    public string Owner { get; }\n    public decimal Balance => balance;\n\n    public BankAccount(string owner, decimal opening)\n    {\n        Owner = owner;\n        balance = opening;\n    }\n\n    public void Deposit(decimal amount)\n    {\n        if (amount > 0) balance += amount;\n    }\n\n    public bool Withdraw(decimal amount)\n    {\n        if (amount <= 0 || amount > balance) return false;\n        balance -= amount;\n        return true;\n    }\n}\n',
    },
    expected: 'Riya: 3500',
  },
  'OOP: Polymorphism (Payments)': {
    files: {
      'Program.cs': 'List<Payment> payments = new() { new UpiPayment(), new CardPayment(), new CashPayment() };\nforeach (var p in payments)\n{\n    p.Pay();\n}\n',
      'Payments.cs': 'public class Payment\n{\n    public virtual void Pay() => Console.WriteLine("Payment Processing");\n}\n\npublic class UpiPayment : Payment\n{\n    public override void Pay() => Console.WriteLine("UPI Payment");\n}\n\npublic class CardPayment : Payment\n{\n    public override void Pay() => Console.WriteLine("Card Payment");\n}\n\npublic class CashPayment : Payment\n{\n    public override void Pay() => Console.WriteLine("Cash Payment");\n}\n',
    },
    expected: 'UPI Payment\nCard Payment\nCash Payment',
  },
  'LINQ: filter & group': {
    files: { 'Program.cs': 'var students = new[]\n{\n    new { Name = "Asha", Dept = "IT", Marks = 88 },\n    new { Name = "Ravi", Dept = "HR", Marks = 72 },\n    new { Name = "Neha", Dept = "IT", Marks = 93 },\n    new { Name = "Om",   Dept = "HR", Marks = 55 },\n};\n\nvar toppers = students.Where(s => s.Marks >= 80).OrderByDescending(s => s.Marks).Select(s => s.Name);\nConsole.WriteLine(string.Join(", ", toppers));\n\nforeach (var g in students.GroupBy(s => s.Dept).OrderBy(g => g.Key))\n{\n    Console.WriteLine($"{g.Key}: {g.Count()} students, avg {g.Average(s => s.Marks)}");\n}\n' },
    expected: 'Neha, Asha\nHR: 2 students, avg 63.5\nIT: 2 students, avg 90.5',
  },
};

function readStore() { try { return JSON.parse(localStorage.getItem(STORE)) || null; } catch { return null; } }

export default function CSharpIDE() {
  const initial = useMemo(() => {
    let loaded = null;
    try { loaded = JSON.parse(sessionStorage.getItem(CS_LOAD_KEY)); sessionStorage.removeItem(CS_LOAD_KEY); } catch { /* ignore */ }
    if (loaded?.files) return { files: loaded.files, stdin: loaded.stdin || '', expected: loaded.expected || '', title: loaded.title || null };
    const st = readStore();
    if (st?.files) return { ...st, title: null };
    const t = TEMPLATES['Hello World (Console App)'];
    return { files: t.files, stdin: '', expected: t.expected, title: 'Hello World' };
  }, []);

  const [files, setFiles] = useState(initial.files);
  const [stdin, setStdin] = useState(initial.stdin);
  const [expected, setExpected] = useState(initial.expected);
  const [title, setTitle] = useState(initial.title);
  const [active, setActive] = useState(Object.keys(initial.files).includes('Program.cs') ? 'Program.cs' : Object.keys(initial.files)[0]);
  const [panel, setPanel] = useState('output');
  const [fallback, setFallback] = useState(false);
  const [copied, setCopied] = useState('');
  const [runMsg, setRunMsg] = useState(false);

  useEffect(() => { loader.init().catch(() => setFallback(true)); }, []);
  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify({ files, stdin, expected })); } catch { /* ignore */ } }, [files, stdin, expected]);

  const names = Object.keys(files);
  const cur = files[active] != null ? active : names[0];
  const project = 'ConsoleApp1';

  const addClass = () => {
    const n = window.prompt('Add > Class… Name (e.g. Student):');
    if (!n) return;
    const cls = n.replace(/\.cs$/, '').replace(/[^A-Za-z0-9_]/g, '');
    if (!cls) return;
    const f = `${cls}.cs`;
    if (!files[f]) setFiles({ ...files, [f]: `public class ${cls}\n{\n\n}\n` });
    setActive(f);
  };
  const delFile = (n) => { if (names.length === 1 || !window.confirm(`Delete ${n}?`)) return; const f = { ...files }; delete f[n]; setFiles(f); setActive(Object.keys(f)[0]); };
  const loadTemplate = (name) => { if (!name) return; const t = TEMPLATES[name]; setFiles({ ...t.files }); setStdin(t.stdin || ''); setExpected(t.expected || ''); setActive('Program.cs'); setTitle(name); setPanel('output'); };
  const copy = async (text, label) => { try { await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(''), 1500); } catch { /* ignore */ } };
  const download = () => names.forEach((n, i) => setTimeout(() => {
    const url = URL.createObjectURL(new Blob([files[n]], { type: 'text/plain' }));
    const a = document.createElement('a'); a.href = url; a.download = n; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, i * 300));
  const csproj = `<Project Sdk="Microsoft.NET.Sdk">\n\n  <PropertyGroup>\n    <OutputType>Exe</OutputType>\n    <TargetFramework>net10.0</TargetFramework>\n    <ImplicitUsings>enable</ImplicitUsings>\n    <Nullable>enable</Nullable>\n  </PropertyGroup>\n\n</Project>\n`;

  return (
    <div className="vs">
      <div className="vs-menu">
        <span className="vs-logo">◆</span>
        {['File', 'Edit', 'View', 'Git', 'Project', 'Build', 'Debug', 'Test', 'Analyze', 'Tools', 'Extensions', 'Window', 'Help'].map((m) => <span key={m} className="vs-mi">{m}</span>)}
        <span className="vs-search"><Ico e="🔍" /> Search</span>
        <span className="vs-sol">{project}</span>
      </div>
      <div className="vs-toolbar">
        <select value="" onChange={(e) => loadTemplate(e.target.value)}>
          <option value="">Open example…</option>
          {Object.keys(TEMPLATES).map((t) => <option key={t}>{t}</option>)}
        </select>
        <span className="vs-cfg">Debug</span><span className="vs-cfg">Any CPU</span>
        <button className="vs-run" onClick={() => { setRunMsg(true); setPanel('output'); }} title="Start (F5)">▶ {project}</button>
        <button className="vs-btn" onClick={() => copy(files[cur], 'file')}>{copied === 'file' ? 'Copied ✓' : '⧉ Copy file'}</button>
        <button className="vs-btn" onClick={download}><Ico e="⬇" /> Download .cs files</button>
        {title && <span className="vs-title">{title}</span>}
      </div>
      <div className="vs-body">
        <section className="vs-editor">
          <div className="vs-tabs">
            {names.map((n) => <button key={n} className={`vs-tab ${n === cur ? 'on' : ''}`} onClick={() => setActive(n)}>{n}</button>)}
          </div>
          <div className="pg-monaco">
            {fallback ? (
              <textarea className="pg-fallback" spellCheck={false} value={files[cur]} onChange={(e) => setFiles({ ...files, [cur]: e.target.value })} />
            ) : (
              <Editor key={cur} language="csharp" path={cur} theme="vs-dark" value={files[cur]}
                onChange={(v) => setFiles((f) => ({ ...f, [cur]: v ?? '' }))}
                loading={<div className="pg-loading">Loading editor…</div>}
                options={{ fontSize: 14, minimap: { enabled: true }, tabSize: 4, automaticLayout: true, scrollBeyondLastLine: false, bracketPairColorization: { enabled: true }, renderLineHighlight: 'all' }} />
            )}
          </div>
        </section>
        <aside className="vs-solution">
          <div className="vs-pane-head">Solution Explorer <button className="link-btn" onClick={addClass} title="Add > Class">＋</button></div>
          <div className="vs-node"><Ico e="📋" /> Solution '{project}' (1 of 1 project)</div>
          <div className="vs-node l1">▾ <b>C#</b> {project}</div>
          <div className="vs-node l2">▸ <Ico e="🔗" /> Dependencies</div>
          <div className="vs-node l2">▸ <Ico e="📁" /> Properties</div>
          {names.map((n) => (
            <div key={n} className={`vs-node l2 file ${n === cur ? 'on' : ''}`} onClick={() => setActive(n)}>
              <span>C# {n}</span>{names.length > 1 && <button className="link-btn" onClick={(e) => { e.stopPropagation(); delFile(n); }}>✕</button>}
            </div>
          ))}
          <div className="vs-node l2 muted" onClick={() => copy(csproj, 'csproj')} title="Copy .csproj"><Ico e="⚙" /> {project}.csproj {copied === 'csproj' ? '✓' : ''}</div>
          <div className="vs-help"><b>Shortcuts (Visual Studio)</b><br />F5 Start debugging · Ctrl+F5 Run<br />F9 Breakpoint · F10 Step over · F11 Step into<br />Ctrl+K, Ctrl+D Format · Ctrl+. Quick fix<br />Ctrl+K, Ctrl+C Comment</div>
        </aside>
        <section className="vs-bottom">
          <div className="vs-ptabs">
            {[['output', 'Output'], ['input', `Program Input${stdin.trim() ? ' •' : ''}`], ['errors', 'Error List'], ['howto', 'Run in Visual Studio']].map(([k, l]) => (
              <button key={k} className={panel === k ? 'on' : ''} onClick={() => setPanel(k)}>{l}</button>
            ))}
          </div>
          <div className="vs-pbody">
            {panel === 'output' && (
              <div>
                {runMsg && <div className="vs-note"><Ico e="ℹ" /> This page can't run .NET code. Copy the files into Visual Studio (see "Run in Visual Studio") and press Ctrl+F5. The expected console output is shown below.</div>}
                <div className="vs-out-head">Show output from: Expected console output</div>
                {expected ? <pre className="vs-out">{expected}</pre> : <div className="pg-muted">Open an example from a lesson ("<Ico e="🟣" /> Open in C# IDE") to see its expected output here.</div>}
              </div>
            )}
            {panel === 'input' && (
              <div><div className="pg-muted">Values typed into the console for Console.ReadLine(), one per line.</div>
                <textarea className="jide-stdin" value={stdin} onChange={(e) => setStdin(e.target.value)} placeholder={'Asha\n21'} /></div>
            )}
            {panel === 'errors' && <div className="pg-muted">0 Errors · 0 Warnings · 0 Messages. Build in Visual Studio to see real compiler errors (Build › Build Solution, Ctrl+Shift+B).</div>}
            {panel === 'howto' && (
              <div className="jide-howto">
                <p><b>Visual Studio:</b> File › New › Project › <b>Console App</b> (C#) › name it {project} › Framework <b>.NET 10</b> › Create. Replace <code>Program.cs</code>; for other files right-click the project › Add › Class… and paste. Press <b>Ctrl+F5</b>.</p>
                <p><b>dotnet CLI / VS Code:</b> <code>dotnet new console -n {project}</code> → copy the .cs files into the folder → <code>dotnet run</code>.</p>
              </div>
            )}
          </div>
        </section>
      </div>
      <div className="vs-status"><span>✔ Ready</span><span>{cur}</span><span>C#</span><span>.NET 10</span></div>
    </div>
  );
}
