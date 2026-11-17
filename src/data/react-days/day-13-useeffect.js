export default {
  id: 'day-13-useeffect',
  title: 'useEffect: Side Effects, Dependency Array and Cleanup',
  module: 'Module 3: Hooks',
  day: 13,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'useEffect lets a component synchronise with systems outside React: timers, the document title, browser APIs, subscriptions and network requests. Master the three dependency array forms, cleanup functions, common pitfalls like infinite loops and stale values, and when you do NOT need an effect.',
  objectives: [
    'Explain what a side effect is and why effects run after render',
    'Use the dependency array correctly: none, empty [], and [deps]',
    'Write cleanup functions for timers, event listeners and subscriptions',
    'Avoid infinite loops, missing dependencies and stale closures',
    'Recognise cases where an effect is unnecessary',
  ],
  theory: [
    {
      heading: 'What is a side effect?',
      content:
        'Rendering should be **pure**: compute JSX from props and state, nothing else. A **side effect** is anything that reaches outside the component: changing `document.title`, starting a timer, adding a `window` event listener, fetching data, writing to localStorage, connecting to a chat server.\n\n`useEffect` runs your effect code **after React has updated the DOM** (after the browser paints), so it never blocks rendering.\n\nAnalogy: a restaurant kitchen (render) cooks the dish. Side effects are things like sending an SMS to the customer "your order is ready". You do that **after** the dish is plated, not while cooking.',
      syntax: `import { useEffect } from "react";

useEffect(() => {
  // effect code: runs after render
  return () => {
    // optional cleanup: runs before the next effect and on unmount
  };
}, [dependencies]);`,
    },
    {
      heading: 'The dependency array: three forms',
      content: 'The second argument controls **when** the effect re-runs.',
      points: [
        '**No array** `useEffect(fn)`: runs after **every** render. Rarely what you want.',
        '**Empty array** `useEffect(fn, [])`: runs **once after the first render** (on mount); cleanup on unmount.',
        '**With deps** `useEffect(fn, [a, b])`: runs on mount and again whenever `a` or `b` changed (compared with Object.is) since the last render.',
      ],
      syntax: `useEffect(() => { console.log("every render"); });
useEffect(() => { console.log("mounted"); }, []);
useEffect(() => { document.title = count + " clicks"; }, [count]);`,
      tip: 'Rule: every reactive value (props, state, values derived from them, functions defined in the component) used inside the effect must be in the dependency array. The eslint-plugin-react-hooks rule "exhaustive-deps" checks this for you.',
    },
    {
      heading: 'Cleanup functions',
      content:
        'If your effect starts something that keeps running, return a **cleanup function** that stops it. React calls cleanup:\n\n1. Before running the effect again (when deps change)\n2. When the component **unmounts** (is removed from the screen)\n\nWithout cleanup you get **memory leaks**, duplicate timers, listeners firing on unmounted components, and wrong data.',
      syntax: `useEffect(() => {
  const id = setInterval(() => setSeconds(s => s + 1), 1000);
  return () => clearInterval(id);           // stop timer
}, []);

useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize); // remove listener
}, []);`,
    },
    {
      heading: 'StrictMode runs effects twice in development',
      content:
        'In development with `<StrictMode>`, React mounts every component, **immediately unmounts it and mounts it again**. This runs effect → cleanup → effect, to prove your cleanup works. If your app breaks because of this, your cleanup is missing or wrong.\n\nIt does not happen in production builds.',
      tip: 'Do not "fix" double-running by removing StrictMode. Fix the cleanup instead, e.g. clear the interval or ignore a stale fetch response.',
    },
    {
      heading: 'Common pitfalls',
      content: '',
      points: [
        '**Infinite loop**: setting state in an effect that depends on that same state, or with no dependency array: `useEffect(() => setCount(count + 1))` re-renders forever',
        '**Objects/arrays/functions as deps**: created fresh every render, so the effect runs every time. Move them inside the effect, outside the component, or memoise them (Day 18)',
        '**Stale closures**: an interval created once with `[]` sees the initial state forever if you write `setCount(count + 1)`. Use the functional update `setCount(c => c + 1)`',
        '**async effect function**: `useEffect(async () => ...)` is wrong because an async function returns a Promise, not a cleanup. Define an async function inside and call it (Day 14)',
      ],
    },
    {
      heading: 'You might not need an effect',
      content:
        'Effects are an "escape hatch" to step outside React. Many beginners overuse them.\n\n- **Derived data**: do not use an effect to set `fullName` from `first` and `last`. Compute it during render: `const fullName = first + " " + last;`\n- **Responding to a user event** (like submitting a form or clicking Buy): do it in the **event handler**, not in an effect watching state.\n- **Resetting state when a prop changes**: give the component a `key` instead.\n\nUse effects for **synchronising with external systems**.',
      tip: 'Coming next (Day 14): fetching data from APIs inside useEffect with loading, error and AbortController.',
    },
  ],
  examples: [
    {
      title: 'Syncing document.title with state',
      scenario: 'Update the browser tab title whenever the unread message count changes.',
      steps: [
        'Keep unread in state',
        'In useEffect set document.title, with [unread] as dependency',
        'Click the buttons and watch the title (and the log of effect runs)',
      ],
      code: `function App() {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    document.title = unread > 0 ? "(" + unread + ") Inbox" : "Inbox";
  }, [unread]);
  return <button onClick={() => setUnread(u => u + 1)}>New message</button>;
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

function App() {
  const [unread, setUnread] = useState(0);
  const [name, setName] = useState("");
  const [runs, setRuns] = useState(0);

  useEffect(() => {
    document.title = unread > 0 ? "(" + unread + ") Inbox" : "Inbox";
    setRuns(r => r + 1);
  }, [unread]); // runs only when unread changes

  return (
    <div>
      <p>Unread: <b>{unread}</b></p>
      <button onClick={() => setUnread(u => u + 1)}>New message</button>
      <button onClick={() => setUnread(0)}>Mark all read</button>
      <p>
        <input placeholder="Typing here does NOT run the effect" value={name} onChange={e => setName(e.target.value)} />
      </p>
      <p className="log">Title effect has run {runs} time(s). Current title: "{unread > 0 ? "(" + unread + ") Inbox" : "Inbox"}"</p>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
button { margin-right: 6px; }
input { padding: 6px; width: 280px; }
.log { color: #6b7280; }`,
      },
      result: 'Clicking "New message" updates the title and increases the effect run count; typing in the input re-renders but does not run the effect.',
      explanation:
        'Because the dependency array is [unread], React re-runs the effect only when unread differs from the previous render. Typing changes name, which is not a dependency.',
    },
    {
      title: 'Timer with cleanup (stopwatch)',
      scenario: 'A stopwatch that starts and stops. The interval must be cleared when stopped or when the component unmounts.',
      steps: [
        'Keep running and seconds in state',
        'In an effect depending on [running], start setInterval when running is true',
        'Return a cleanup that clears the interval',
        'Use "Unmount" to remove the stopwatch and confirm the timer stops',
      ],
      code: `useEffect(() => {
  if (!running) return;                 // nothing to set up
  const id = setInterval(() => {
    setSeconds(s => s + 1);             // functional update avoids stale value
  }, 1000);
  return () => clearInterval(id);       // cleanup
}, [running]);`,
      playground: {
        jsx: `const { useState, useEffect } = React;

function Stopwatch({ onLog }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    onLog("▶ interval started");
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => {
      clearInterval(id);
      onLog("⏹ cleanup: interval cleared");
    };
  }, [running]); // onLog is stable in this demo (a state setter wrapper)

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <div className="watch">
      <h1>{mm}:{ss}</h1>
      <button onClick={() => setRunning(r => !r)}>{running ? "Pause" : "Start"}</button>
      <button onClick={() => { setRunning(false); setSeconds(0); }}>Reset</button>
    </div>
  );
}

function App() {
  const [show, setShow] = useState(true);
  const [log, setLog] = useState([]);
  const onLog = React.useCallback(msg => setLog(l => [msg, ...l].slice(0, 6)), []);
  return (
    <div>
      <button onClick={() => setShow(s => !s)}>{show ? "Unmount stopwatch" : "Mount stopwatch"}</button>
      {show && <Stopwatch onLog={onLog} />}
      <ul className="log">{log.map((l, i) => <li key={i}>{l}</li>)}</ul>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.watch h1 { font-family: monospace; font-size: 3rem; margin: 10px 0; }
button { margin-right: 6px; padding: 6px 12px; }
.log { color: #6b7280; font-size: 14px; }`,
      },
      result: 'Start/Pause controls the timer; unmounting while running logs the cleanup and the timer stops.',
      explanation:
        'Each time running changes, React first runs the previous cleanup (clearing the old interval) and then the new effect. On unmount, cleanup runs too. setSeconds(s => s + 1) always uses the latest value, avoiding a stale closure. (useCallback is covered on Day 18; here it keeps onLog stable.)',
    },
    {
      title: 'Window event listener: tracking window width and online status',
      scenario: 'Show the current window width and network status, adding listeners on mount and removing them on unmount.',
      steps: [
        'Read initial values from window and navigator',
        'Add resize, online and offline listeners in an effect with []',
        'Remove them in the cleanup',
        'Resize the playground panel to see the width change',
      ],
      code: `useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, []);`,
      playground: {
        jsx: `const { useState, useEffect } = React;

function App() {
  const [width, setWidth] = useState(() => window.innerWidth);
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("resize", onResize);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const device = width < 640 ? "📱 Mobile" : width < 1024 ? "💻 Tablet / small laptop" : "🖥 Desktop";
  return (
    <div className="box">
      <p>Window width: <b>{width}px</b></p>
      <p>Layout: {device}</p>
      <p>Network: {online ? "🟢 Online" : "🔴 Offline"}</p>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.box { border: 1px solid #ddd; border-radius: 10px; padding: 12px 16px; max-width: 320px; }`,
      },
      result: 'The width and layout label update live as the preview is resized; network status changes if you go offline.',
      explanation:
        'The listeners are registered once (empty dependency array) and removed in the cleanup. The lazy initial state reads window values only on the first render.',
    },
    {
      title: 'Pitfalls: infinite loop, stale closure and unnecessary effect',
      scenario: 'Compare wrong and right code for three common useEffect mistakes. The playground runs only the correct versions.',
      steps: [
        'Read the wrong versions in the code block',
        'Run the playground: a counter auto-increments correctly and fullName is derived without an effect',
        'Type in the name fields and see fullName update instantly',
      ],
      code: `// ❌ 1. Infinite loop: no deps + setState
useEffect(() => { setCount(count + 1); });

// ❌ 2. Stale closure: count is always 0 inside the interval
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, []);
// ✅ setCount(c => c + 1)

// ❌ 3. Unnecessary effect for derived data
const [fullName, setFullName] = useState("");
useEffect(() => { setFullName(first + " " + last); }, [first, last]);
// ✅ const fullName = first + " " + last;`,
      playground: {
        jsx: `const { useState, useEffect } = React;

function AutoCounter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount(c => c + 1), 1000); // ✅ functional update
    return () => clearInterval(id);
  }, []);
  return <p>Auto counter (correct): <b>{count}</b></p>;
}

function NameForm() {
  const [first, setFirst] = useState("Arjun");
  const [last, setLast] = useState("Verma");
  const fullName = (first + " " + last).trim(); // ✅ derived, no effect needed
  return (
    <div>
      <input value={first} onChange={e => setFirst(e.target.value)} />
      <input value={last} onChange={e => setLast(e.target.value)} />
      <p>Full name: <b>{fullName}</b></p>
    </div>
  );
}

function App() {
  return (
    <div>
      <AutoCounter />
      <NameForm />
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
input { padding: 6px; margin-right: 6px; width: 120px; }`,
      },
      result: 'The counter increases every second (not stuck at 1), and the full name updates as you type.',
      explanation:
        'With [] the interval callback is created once and captures the first render\'s count (0), so setCount(count + 1) would always set 1. The functional form reads the latest value. fullName needs no state or effect because it can be computed from existing state.',
    },
  ],
  interview: [
    { q: 'What is useEffect used for?', a: 'Running side effects after render: synchronising a component with external systems such as timers, subscriptions, browser APIs, the DOM outside React, or network requests.', level: 'Easy' },
    { q: 'Explain the three forms of the dependency array.', a: 'No array: runs after every render. Empty []: runs once after mount, cleanup on unmount. [a, b]: runs after mount and whenever a or b change between renders.', level: 'Easy' },
    { q: 'What is the cleanup function and when does it run?', a: 'The function returned from the effect. React runs it before re-running the effect (with the previous values) and when the component unmounts, to undo subscriptions, timers or listeners.', level: 'Medium' },
    { q: 'How do you reproduce componentDidMount, componentDidUpdate and componentWillUnmount with hooks?', a: 'useEffect(fn, []) for mount; useEffect(fn, [deps]) for updates of specific values; the returned cleanup function for unmount. But think in terms of synchronisation, not lifecycle.', level: 'Medium' },
    { q: 'Why does my effect run twice in development?', a: 'React 18 StrictMode intentionally mounts, unmounts and remounts components in development to verify effects have proper cleanup. It does not happen in production.', level: 'Medium' },
    { q: 'Why can\'t the effect callback be async?', a: 'An async function returns a Promise, but useEffect expects either nothing or a cleanup function. Define an async function inside the effect and call it.', level: 'Medium' },
    { q: 'What causes an infinite loop with useEffect?', a: 'Updating state inside an effect that runs on every render (no deps), or that depends on the state it sets, or on an object/function recreated every render.', level: 'Medium' },
    { q: 'What is a stale closure in useEffect?', a: 'When an effect or callback captures values from the render it was created in and keeps using outdated values later, e.g. an interval created once reading the initial state. Fix with correct deps, functional updates or refs.', level: 'Hard' },
    { q: 'useEffect vs useLayoutEffect?', a: 'useEffect runs after the browser paints (non-blocking). useLayoutEffect runs synchronously after DOM mutations but before paint, for measuring layout and avoiding flicker. Prefer useEffect.', level: 'Hard' },
    { q: 'When should you NOT use useEffect?', a: 'For transforming data for rendering (compute during render), for handling user events (use event handlers), and for resetting state on prop change (use a key). Effects are for external synchronisation.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Save a note to localStorage whenever it changes and load it on first render.',
      hint: 'Lazy initial state for loading; useEffect with [note] for saving.',
      solution: `function App() {
  const [note, setNote] = React.useState(() => {
    try { return localStorage.getItem("note") || ""; } catch { return ""; }
  });
  React.useEffect(() => {
    try { localStorage.setItem("note", note); } catch {}
  }, [note]);
  return <textarea rows={5} cols={40} value={note} onChange={e => setNote(e.target.value)} placeholder="Your note is auto-saved" />;
}`,
    },
    {
      task: 'Build a countdown from 10 to 0 that stops automatically at 0 and shows "Lift off!".',
      hint: 'Run the interval only while count > 0; include count in deps or use a timeout per tick.',
      solution: `function App() {
  const [count, setCount] = React.useState(10);
  React.useEffect(() => {
    if (count === 0) return;
    const id = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [count]);
  return <h1>{count > 0 ? count : "🚀 Lift off!"}</h1>;
}`,
    },
    {
      task: 'Track the mouse position on the whole window and show it; remove the listener on unmount.',
      hint: 'window.addEventListener("mousemove", handler) in an effect with [].',
      solution: `function App() {
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  React.useEffect(() => {
    const onMove = e => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return <p>Mouse: {pos.x}, {pos.y}</p>;
}`,
    },
    {
      task: 'Press the Escape key to close a "popup" box. Add a keydown listener only while the popup is open.',
      hint: 'Depend on [open]; return early if !open.',
      solution: `function App() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open popup</button>
      {open && <div style={{ border: "2px solid #333", padding: 16, marginTop: 10 }}>Press Esc to close</div>}
    </div>
  );
}`,
    },
  ],
  quiz: [
    { question: 'useEffect(fn, []) runs...', options: ['After every render', 'Once after the first render', 'Before the first render', 'Never'], answer: 1, explanation: 'An empty array means no dependencies change, so it runs once after mount.' },
    { question: 'When does the cleanup function run?', options: ['Only on page reload', 'Before every render', 'Before the effect re-runs and on unmount', 'Only on mount'], answer: 2, explanation: 'Cleanup runs before re-running the effect and when unmounting.' },
    { question: 'Which causes an infinite loop?', options: ['useEffect(() => setX(x + 1))', 'useEffect(() => {}, [])', 'useEffect(() => console.log(x), [x])', 'useEffect(() => { document.title = "Hi" }, [])'], answer: 0, explanation: 'No dependency array plus setting state triggers endless re-renders.' },
    { question: 'Inside setInterval in an effect with [], how should you increment count?', options: ['setCount(count + 1)', 'count++', 'setCount(count++)', 'setCount(c => c + 1)'], answer: 3, explanation: 'The functional update avoids the stale closure.' },
    { question: 'fullName = first + " " + last should be...', options: ['Stored in state via useEffect', 'Computed during render', 'Stored in localStorage', 'Fetched from an API'], answer: 1, explanation: 'Derived values do not need an effect.' },
  ],
};
