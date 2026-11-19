import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, SkipBack, SkipForward, ChevronLeft, ChevronRight, Pause, Loader2 } from 'lucide-react';
import { ensurePython, runPyExec } from '../components/pyodideRunner.js';

export const VIS_LOAD_KEY = 'upskillr-visualizer-load';
const MAX_STEPS = 1000;

// Runs the student's code under sys.settrace and returns every step as JSON.
const TRACER = `
import sys, json, io, builtins, types
__src = __vis_code
__inputs = [x for x in __vis_stdin.split('\\n')] if __vis_stdin else []
__steps = []
__out = io.StringIO()
__MAX = ${MAX_STEPS}
__HIDE = {'input', 'print'}
def __r(v):
    try:
        if isinstance(v, (types.FunctionType, types.BuiltinFunctionType)): return '<function ' + getattr(v, '__name__', '?') + '>'
        if isinstance(v, type): return '<class ' + v.__name__ + '>'
        if isinstance(v, types.ModuleType): return None
        if isinstance(v, (int, float, bool, str, type(None), list, tuple, dict, set)): r = repr(v)
        else:
            d = getattr(v, '__dict__', None)
            r = type(v).__name__ + '(' + ', '.join(k + '=' + repr(x) for k, x in d.items()) + ')' if d is not None else repr(v)
        return r if len(r) <= 140 else r[:137] + '...'
    except Exception:
        return '?'
def __vars(d):
    o = {}
    for k, v in list(d.items()):
        if k.startswith('__') or k in __HIDE: continue
        r = __r(v)
        if r is not None: o[k] = [r, type(v).__name__]
    return o
class __Stop(Exception): pass
def __tr(frame, event, arg):
    if frame.f_code.co_filename != '<student>': return __tr
    if len(__steps) >= __MAX: raise __Stop()
    st = []
    f = frame
    while f is not None and f.f_code.co_filename == '<student>':
        mod = f.f_code.co_name == '<module>'
        st.append({'fn': 'main' if mod else f.f_code.co_name, 'line': f.f_lineno, 'locals': {} if mod else __vars(f.f_locals)})
        f = f.f_back
    st.reverse()
    s = {'line': frame.f_lineno, 'event': event, 'stack': st, 'globals': __vars(__g), 'out': __out.getvalue()}
    if event == 'return': s['ret'] = __r(arg)
    if event == 'exception': s['exc'] = arg[0].__name__ + ': ' + str(arg[1])
    __steps.append(s)
    return __tr
__g = {'__name__': '__main__', '__builtins__': builtins}
def __input(prompt=''):
    __out.write(str(prompt))
    v = __inputs.pop(0) if __inputs else ''
    __out.write(v + '\\n')
    return v
def __print(*a, sep=' ', end='\\n', file=None, flush=False):
    __out.write(sep.join(str(x) for x in a) + end)
__g['input'] = __input
__g['print'] = __print
__err = None
try:
    __c = compile(__src, '<student>', 'exec')
    sys.settrace(__tr)
    exec(__c, __g)
except __Stop:
    __err = 'Stopped after ' + str(__MAX) + ' steps. Is there an infinite loop? Try smaller inputs.'
except SyntaxError as e:
    __err = 'SyntaxError: ' + str(e.msg) + ' (line ' + str(e.lineno) + ')'
except Exception as e:
    __err = type(e).__name__ + ': ' + str(e)
finally:
    sys.settrace(None)
json.dumps({'steps': __steps, 'error': __err, 'out': __out.getvalue()})
`;

import Ico from '../components/Ico.jsx';
const EXAMPLES = {
  'Loop: sum of numbers': 'total = 0\nfor i in range(1, 6):\n    total = total + i\n    print("i =", i, "total =", total)\nprint("Final total:", total)\n',
  'List: find the maximum': 'marks = [56, 89, 72, 94, 61]\nbest = marks[0]\nfor m in marks:\n    if m > best:\n        best = m\nprint("Highest:", best)\n',
  'Function call': 'def area(length, width):\n    result = length * width\n    return result\n\na = area(5, 3)\nb = area(2, 8)\nprint(a + b)\n',
  'Recursion: factorial': 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(4))\n',
  'Recursion: fibonacci': 'def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nprint(fib(4))\n',
  'Bubble sort': 'nums = [5, 2, 4, 1]\nn = len(nums)\nfor i in range(n - 1):\n    for j in range(n - 1 - i):\n        if nums[j] > nums[j + 1]:\n            nums[j], nums[j + 1] = nums[j + 1], nums[j]\nprint(nums)\n',
  'String: reverse & palindrome': 'word = "level"\nrev = ""\nfor ch in word:\n    rev = ch + rev\nprint(rev)\nprint("Palindrome" if rev == word else "Not palindrome")\n',
  'Dictionary: count letters': 'text = "banana"\ncount = {}\nfor ch in text:\n    count[ch] = count.get(ch, 0) + 1\nprint(count)\n',
  'Class & object': 'class Account:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n        return self.balance\n\nacc = Account("Riya", 1000)\nacc.deposit(500)\nprint(acc.owner, acc.balance)\n',
  'Input: greet the user': 'name = input("Your name: ")\nage = int(input("Your age: "))\nprint("Hello", name, "- next year you will be", age + 1)\n',
};
const EX_STDIN = { 'Input: greet the user': 'Asha\n21' };

function describe(s, prev) {
  if (!s) return '';
  const fn = s.stack[s.stack.length - 1]?.fn || 'main';
  if (s.event === 'call') return fn === 'main' ? 'Program starts.' : `Calling ${fn}(${Object.entries(s.stack[s.stack.length - 1].locals).map(([k, v]) => `${k}=${v[0]}`).join(', ')}) — a new frame is created on the stack.`;
  if (s.event === 'return') return fn === 'main' ? 'Program finished.' : `${fn} returns ${s.ret} — its frame is removed from the stack.`;
  if (s.event === 'exception') return `${s.exc}`;
  const changed = prev ? Object.keys({ ...s.globals, ...(s.stack[s.stack.length - 1]?.locals || {}) }).filter((k) => {
    const now = (s.stack[s.stack.length - 1]?.locals || {})[k] || s.globals[k];
    const before = (prev.stack[prev.stack.length - 1]?.locals || {})[k] || prev.globals[k];
    return now && (!before || before[0] !== now[0]);
  }) : [];
  return `About to run line ${s.line}${fn !== 'main' ? ` inside ${fn}()` : ''}.${changed.length ? ` Changed: ${changed.join(', ')}.` : ''}`;
}

function VarTable({ vars, prevVars }) {
  const keys = Object.keys(vars);
  if (!keys.length) return <div className="muted small">(no variables yet)</div>;
  return (
    <table className="cv-vars"><tbody>
      {keys.map((k) => {
        const changed = !prevVars || !prevVars[k] || prevVars[k][0] !== vars[k][0];
        return <tr key={k} className={changed ? 'chg' : ''}><td className="cv-k">{k}</td><td className="cv-v"><code>{vars[k][0]}</code><span className="cv-t">{vars[k][1]}</span></td></tr>;
      })}
    </tbody></table>
  );
}

export default function CodeVisualizer() {
  const initial = useMemo(() => {
    try { const l = JSON.parse(sessionStorage.getItem(VIS_LOAD_KEY)); sessionStorage.removeItem(VIS_LOAD_KEY); if (l?.code) return l; } catch { /* ignore */ }
    return { code: EXAMPLES['Recursion: factorial'], stdin: '' };
  }, []);
  const [code, setCode] = useState(initial.code);
  const [stdin, setStdin] = useState(initial.stdin || '');
  const [trace, setTrace] = useState(null);
  const [i, setI] = useState(0);
  const [status, setStatus] = useState('idle');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timer = useRef(null);

  useEffect(() => { ensurePython().catch(() => {}); }, []);
  useEffect(() => {
    if (!playing || !trace) return undefined;
    timer.current = setTimeout(() => { if (i < trace.steps.length - 1) setI(i + 1); else setPlaying(false); }, speed);
    return () => clearTimeout(timer.current);
  }, [playing, i, trace, speed]);

  const visualize = async () => {
    setStatus('running'); setTrace(null); setI(0); setPlaying(false);
    try {
      const json = await runPyExec({ code: TRACER, vars: { __vis_code: code, __vis_stdin: stdin } }, 30000);
      const t = JSON.parse(json);
      const steps = t.steps.filter((s, k) => !(s.event === 'call' && s.stack.length === 1 && k === 0));
      setTrace({ ...t, steps });
      setStatus('ready');
    } catch (e) {
      setTrace({ steps: [], error: String(e.message || e), out: '' });
      setStatus('ready');
    }
  };

  const s = trace?.steps[i];
  const prev = i > 0 ? trace?.steps[i - 1] : null;
  const lines = code.split('\n');
  const prevFrame = (fn, depth) => prev?.stack?.[depth]?.fn === fn ? prev.stack[depth].locals : null;

  return (
    <div>
      <div className="page-head">
        <h1><Ico e="🔍" /> Code Visualizer</h1>
        <p className="muted">Run Python one step at a time and watch every variable, function call and output change. Perfect for understanding loops, lists, functions and recursion.</p>
      </div>
      <div className="card cv-top">
        <div className="quiz-settings">
          <label>Example <select defaultValue="" onChange={(e) => { const k = e.target.value; if (k) { setCode(EXAMPLES[k]); setStdin(EX_STDIN[k] || ''); setTrace(null); } }}><option value="" disabled>Choose a program…</option>{Object.keys(EXAMPLES).map((k) => <option key={k}>{k}</option>)}</select></label>
          <button className="btn primary" onClick={visualize} disabled={status === 'running'}>{status === 'running' ? <><Loader2 size={15} className="spin" /> Tracing…</> : <><Play size={15} /> Visualize</>}</button>
        </div>
        {!trace && (
          <div className="cv-edit">
            <textarea className="input mono cv-code" spellCheck={false} rows={Math.min(22, Math.max(8, lines.length + 1))} value={code} onChange={(e) => setCode(e.target.value)} />
            <label className="small">Input (one line per input())<textarea className="input mono" rows={2} value={stdin} onChange={(e) => setStdin(e.target.value)} /></label>
            <p className="muted small">Python runs inside your browser (first run downloads Python, a few seconds). Programs are limited to {MAX_STEPS} steps.</p>
          </div>
        )}
      </div>

      {trace && (
        <>
          {trace.error && !trace.steps.length && <div className="card explain bad">{trace.error}</div>}
          {trace.steps.length > 0 && (
            <div className="cv-grid">
              <div className="card cv-codeview">
                <div className="cv-controls">
                  <button className="btn small" onClick={() => setI(0)} disabled={i === 0}><SkipBack size={14} /></button>
                  <button className="btn small" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}><ChevronLeft size={14} /> Back</button>
                  <button className="btn small primary" onClick={() => setPlaying(!playing)}>{playing ? <Pause size={14} /> : <Play size={14} />}</button>
                  <button className="btn small" onClick={() => setI(Math.min(trace.steps.length - 1, i + 1))} disabled={i >= trace.steps.length - 1}>Next <ChevronRight size={14} /></button>
                  <button className="btn small" onClick={() => setI(trace.steps.length - 1)} disabled={i >= trace.steps.length - 1}><SkipForward size={14} /></button>
                  <span className="muted small">Step {i + 1} / {trace.steps.length}</span>
                </div>
                <input type="range" min={0} max={trace.steps.length - 1} value={i} onChange={(e) => { setPlaying(false); setI(Number(e.target.value)); }} className="cv-slider" />
                <label className="muted small cv-speed">Speed <input type="range" min={150} max={1500} step={50} value={1650 - speed} onChange={(e) => setSpeed(1650 - Number(e.target.value))} /></label>
                <pre className="cv-lines">{lines.map((l, n) => {
                  const cur = s.line === n + 1;
                  const was = prev && prev.line === n + 1 && !cur;
                  return <div key={n} className={`cv-line ${cur ? `cur ${s.event}` : ''} ${was ? 'was' : ''}`}><span className="cv-ln">{cur ? '➜' : was ? '›' : ''}{n + 1}</span>{l || ' '}</div>;
                })}</pre>
                <div className={`cv-say ${s.event === 'exception' ? 'bad' : ''}`}>{describe(s, prev)}</div>
                <button className="btn small" onClick={() => { setTrace(null); setPlaying(false); }}>✎ Edit code</button>
              </div>
              <div className="cv-side">
                <div className="card">
                  <h4><Ico e="📚" /> Call stack (frames)</h4>
                  <div className="cv-stack">
                    {[...s.stack].reverse().map((f, k) => {
                      const depth = s.stack.length - 1 - k;
                      return (
                        <div key={`${f.fn}-${depth}`} className={`cv-frame ${k === 0 ? 'top' : ''}`}>
                          <div className="cv-fn">{f.fn === 'main' ? 'Global frame' : `${f.fn}()`} <span className="muted small">line {f.line}</span></div>
                          <VarTable vars={f.fn === 'main' ? s.globals : f.locals} prevVars={f.fn === 'main' ? prev?.globals : prevFrame(f.fn, depth)} />
                          {k === 0 && s.event === 'return' && f.fn !== 'main' && <div className="cv-ret">↩ returns <code>{s.ret}</code></div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="card">
                  <h4><Ico e="🖥" /> Output</h4>
                  <pre className="cv-out">{s.out || ' '}</pre>
                  {i === trace.steps.length - 1 && trace.error && <div className="explain bad">{trace.error}</div>}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
