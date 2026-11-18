export default {
  id: 'day-01-how-react-works-reconciliation-fiber',
  title: 'How React Works: Virtual DOM, Reconciliation, Fiber, Render vs Commit, Batching, Keys and StrictMode',
  module: 'Module 1: Modern React Internals',
  day: 1,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Look under the hood of React: what really happens between setState and the pixels on screen. You will understand render and commit phases, reconciliation rules, the Fiber architecture, automatic batching, why keys matter, and why StrictMode runs your code twice. This is the foundation for every performance and interview question that follows.',
  objectives: [
    'Explain the full update cycle: trigger, render phase, reconciliation, commit phase, browser paint',
    'Describe the reconciliation heuristics (element type and key) and predict when state is kept or reset',
    'Explain Fiber, priorities and concurrent rendering in interview-ready language',
    'Use automatic batching, flushSync and functional updates correctly',
    'Explain why StrictMode double-invokes renders and effects and how to write code that survives it',
  ],
  theory: [
    {
      heading: 'The update cycle: trigger, render, commit',
      content:
        'In the basic course you learned "state changes, component re-renders". Interviewers for MERN roles expect more detail. Every update goes through three steps:\n\n1. **Trigger**: something schedules an update: the first `root.render()`, a `setState`, a `dispatch`, a context value change or a store subscription (Redux, Zustand).\n2. **Render phase**: React calls your component functions to get a new tree of React elements, then compares it with the previous tree (**reconciliation**). This phase is **pure** and can be paused, restarted or thrown away. No DOM is touched.\n3. **Commit phase**: React applies the minimal list of DOM changes, updates refs, then runs `useLayoutEffect` callbacks (synchronously, before paint). After the browser paints, it runs `useEffect` callbacks.\n\nAnalogy: an architect (render) draws a new floor plan and marks the differences from the old one. Only after the plan is final does the construction crew (commit) break walls. If the client changes their mind halfway through drawing, the architect throws the draft away; nothing was broken.\n\n**"Re-render" does not mean "DOM update".** A component can render 50 times and produce zero DOM changes if its output is the same.',
      syntax:
        "setCount(c => c + 1)          // 1. trigger\n// 2. render: React calls Counter() -> new elements -> diff with old fiber tree\n// 3. commit: textNode.nodeValue = '1'; refs attached; layout effects; paint; useEffect",
      tip: 'Never put side effects (API calls, subscriptions, DOM writes, analytics) in the component body. The render phase may run more than once for one commit.',
    },
    {
      heading: 'Virtual DOM and reconciliation rules',
      content:
        'The "virtual DOM" is simply the tree of plain JavaScript objects that your JSX creates (`{ type: \'li\', props: {...}, key: \'7\' }`). Comparing two full trees optimally is O(n³), far too slow. React uses two **heuristics** to make it O(n):\n\n- **Different element type = different subtree.** If `<div>` becomes `<section>`, or `<LoginForm>` becomes `<SignupForm>`, React destroys the old subtree (including all state inside it) and mounts a new one.\n- **Same type at the same position = update.** React keeps the DOM node / component instance and only updates changed props. State is preserved.\n- **Keys identify children in a list.** Among siblings, React matches old and new children by `key` instead of by index.\n\nImportant consequence: **state belongs to a position in the tree, not to the component code.** Rendering `<Counter />` in the same place keeps its state; moving it to a different parent or changing a wrapper type resets it.',
      points: [
        'Defining a component inside another component creates a NEW type on every render, so its state resets every time. Always define components at module top level.',
        'Changing `key` on purpose (e.g. `<Profile key={userId} />`) is the official way to reset all state of a subtree.',
        'Conditional rendering `{isA ? <Input /> : <Input />}` keeps state because type and position are the same. Add different keys if you want a reset.',
      ],
    },
    {
      heading: 'Fiber: the engine behind React',
      content:
        'Since React 16, every component instance, DOM element and fragment is represented by a **fiber**: a JavaScript object that stores its type, key, props, state (the hooks linked list), a pointer to its parent (`return`), first `child` and next `sibling`, plus flags describing the DOM work to do.\n\nWhy fibers? The old "stack reconciler" walked the tree recursively and could not stop until it finished. Fiber turns rendering into a **loop over units of work**. React can:\n- **Pause** rendering after any fiber and give the browser time to handle a click or paint a frame (time slicing, about 5 ms chunks).\n- **Prioritise** updates using **lanes**: typing in an input (sync/urgent lane) beats rendering a filtered list wrapped in `startTransition` (transition lane).\n- **Throw away** unfinished work if a newer update arrives.\n- **Double buffer**: React keeps the `current` tree (on screen) and builds a `workInProgress` tree. At commit, it swaps the pointer.\n\nHooks are stored as a linked list on the fiber in call order. That is the real reason for the **Rules of Hooks**: if you call hooks conditionally, the order changes and React reads the wrong state.',
      syntax:
        "// Simplified fiber object\n{\n  type: TodoItem, key: '42',\n  stateNode: null,            // DOM node for host components\n  memoizedProps, memoizedState, // hooks linked list lives here\n  return: parentFiber, child: firstChild, sibling: nextSibling,\n  flags: Update | Placement,  // work for the commit phase\n  lanes: DefaultLane,\n  alternate: currentFiber      // the other buffer\n}",
    },
    {
      heading: 'Batching, flushSync and stale state',
      content:
        'Since React 18 **automatic batching** groups all state updates that happen in the same tick into **one render**, whether they come from an event handler, `setTimeout`, a promise `.then` or a native event listener.\n\n```\nsetLoading(false); setUser(data); setError(null); // ONE render, not three\n```\n\nBecause state is a **snapshot** per render, reading `count` right after `setCount(count + 1)` still gives the old value. If the next value depends on the previous one, use the **updater function**: `setCount(c => c + 1)`. React queues updaters and applies them in order.\n\nIf you truly need the DOM updated immediately (rare: e.g. scroll to a newly added item), wrap the update in `flushSync` from `react-dom`.',
      syntax:
        "import { flushSync } from 'react-dom';\n\nfunction addMessage(msg) {\n  flushSync(() => setMessages(m => [...m, msg])); // DOM updated now\n  listRef.current.lastChild.scrollIntoView();\n}",
      tip: 'flushSync hurts performance. Reach for it only when you must read the updated DOM synchronously.',
    },
    {
      heading: 'Keys in depth',
      content:
        'Keys tell React **which item is which** across renders. Using the array index as key is fine only if the list is static (never reordered, filtered or prepended). Otherwise:\n- Prepending an item shifts all indexes, so React thinks every row changed: extra DOM work.\n- Worse, **state and uncontrolled inputs stick to the wrong row**. Type into row 1, delete row 0, and your text now appears in the row that used to be row 2.\n\nRules:\n- Use a **stable, unique id from data** (MongoDB `_id`, UUID created when the item is created).\n- Never use `Math.random()` or `crypto.randomUUID()` **during render**: every render gets new keys, so every row remounts and loses state and focus.\n- Keys only need to be unique among siblings, not globally.\n- `key` is not passed as a prop; read `id` separately if the child needs it.',
    },
    {
      heading: 'StrictMode: why everything runs twice in development',
      content:
        '`<StrictMode>` is a development-only helper. It does **not** affect production builds. In React 18/19 it:\n- **Calls component functions, initialisers and reducers twice** (and discards one result) to expose impure render logic, e.g. pushing into an outer array.\n- **Mounts, unmounts and re-mounts every component once** (runs effects, cleanups, then effects again) to check that your effects clean up properly. Future features like Offscreen/Activity will unmount and restore UI, so effects must be resilient.\n- Warns about deprecated APIs.\n\nThis is why you see your `useEffect` fetch twice in dev. The fix is **not** to remove StrictMode; it is to write a proper cleanup (abort the request, ignore stale responses, unsubscribe) or, better, use a data library like TanStack Query (Day 3).',
      syntax:
        "useEffect(() => {\n  const controller = new AbortController();\n  fetch('/api/products', { signal: controller.signal })\n    .then(r => r.json()).then(setProducts)\n    .catch(err => { if (err.name !== 'AbortError') setError(err); });\n  return () => controller.abort(); // first dev mount is aborted cleanly\n}, []);",
    },
    {
      heading: 'What causes a component to re-render?',
      content:
        'Exactly four things:\n1. Its own **state** changed (`useState`, `useReducer`).\n2. Its **parent re-rendered** (by default all children re-render, even with identical props!).\n3. A **context** it reads with `useContext` / `use` changed value.\n4. An **external store** it subscribes to (via `useSyncExternalStore`: Redux, Zustand) returned a different selected value.\n\nProps changing is **not** a separate trigger: props only change because the parent rendered. `React.memo` skips rendering a child when its props are shallow-equal. React Compiler (stable in 2025) can add this memoization automatically at build time; you will study the trade-offs on Day 7.\n\nSetting state to the **same value** (`Object.is` equal) bails out: React may render that one component once more but will not render its children or commit.',
    },
  ],
  examples: [
    {
      title: 'See render vs commit with a render counter',
      scenario: 'Prove that rendering is not the same as a DOM update, and see when effects run.',
      steps: [
        'Create a parent with a counter and a child that never uses that counter',
        'Count renders with a ref (refs do not cause renders)',
        'Log from the component body, useLayoutEffect and useEffect',
        'Click Run, press the button and watch the log order',
      ],
      code: `function Child() {
  const renders = useRef(0);
  renders.current++;              // render phase
  return <p>Child rendered {renders.current} times</p>;
}
// Parent state changes -> Child re-renders even though its props did not change`,
      playground: {
        jsx: `const { useState, useRef, useEffect, useLayoutEffect } = React;

function Child({ log }) {
  const renders = useRef(0);
  renders.current++;
  log('Child render #' + renders.current);
  return <p style={{ background: '#eef', padding: 8 }}>Child rendered {renders.current} times (it has no props that change)</p>;
}

function App() {
  const [count, setCount] = useState(0);
  const logs = useRef([]);
  const [, force] = useState(0);
  const log = (m) => logs.current.push(m);
  log('App render, count = ' + count);
  useLayoutEffect(() => { log('useLayoutEffect (commit, before paint)'); });
  useEffect(() => { log('useEffect (after paint)'); });

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <button onClick={() => setCount(c => c + 1)}>count: {count}</button>{' '}
      <button onClick={() => force(x => x + 1)}>show log</button>{' '}
      <button onClick={() => { logs.current = []; force(x => x + 1); }}>clear</button>
      <Child log={log} />
      <pre style={{ background: '#111', color: '#0f0', padding: 8, fontSize: 12 }}>
        {logs.current.slice(-12).join('\\n')}
      </pre>
    </div>
  );
}`,
      },
      result: 'Every click logs "App render", "Child render", then the layout effect and the effect. Child re-renders on every parent update even though nothing it shows changed.',
      explanation:
        'Render order is parent first, then children. useLayoutEffect runs synchronously during commit; useEffect runs after the browser paints. The Child re-renders simply because its parent rendered; React.memo would stop that (Day 7).',
    },
    {
      title: 'Keys: index vs stable id with uncontrolled inputs',
      scenario: 'A list where each row has its own uncontrolled input. Prepend an item and see which version keeps the text in the right row.',
      steps: [
        'Render two lists from the same array: one with key={index}, one with key={item.id}',
        'Type something into the "Apple" row of both lists',
        'Click "Add to top"',
        'Compare: in the index list the text jumps to the wrong fruit',
      ],
      code: `{items.map((item, i) => <Row key={i} item={item} />)}       // BAD for dynamic lists
{items.map(item => <Row key={item.id} item={item} />)}      // GOOD`,
      playground: {
        jsx: `const { useState } = React;
let nextId = 3;

function Row({ item }) {
  return (
    <li style={{ marginBottom: 4 }}>
      <b style={{ display: 'inline-block', width: 70 }}>{item.name}</b>
      <input placeholder={'note for ' + item.name} />
    </li>
  );
}

function App() {
  const [items, setItems] = useState([{ id: 1, name: 'Apple' }, { id: 2, name: 'Mango' }]);
  const names = ['Kiwi', 'Grapes', 'Banana', 'Papaya'];
  const addTop = () => setItems(prev => [{ id: nextId, name: names[nextId++ % names.length] }, ...prev]);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <button onClick={addTop}>Add to top</button>
      <div style={{ display: 'flex', gap: 32 }}>
        <div><h4>key = index (buggy)</h4><ul>{items.map((it, i) => <Row key={i} item={it} />)}</ul></div>
        <div><h4>key = id (correct)</h4><ul>{items.map(it => <Row key={it.id} item={it} />)}</ul></div>
      </div>
    </div>
  );
}`,
      },
      result: 'After adding to the top, the note you typed for Apple appears next to the new fruit in the left list, but stays next to Apple in the right list.',
      explanation:
        'With index keys, the new item gets key 0, so React reuses the DOM input that belonged to Apple (old key 0) for the new item. With id keys React knows Apple moved down and moves its DOM node.',
    },
    {
      title: 'State belongs to the position in the tree',
      scenario: 'Show three cases: same position keeps state, different type resets it, and a changing key resets it on purpose.',
      steps: [
        'Build a Counter component with local state',
        'Toggle between two branches that render <Counter /> in the same place',
        'Render a counter with key={user} and switch the user',
        'Increase counters, then toggle and observe which ones reset',
      ],
      code: `{isPlayerA ? <Counter name="A" /> : <Counter name="B" />}   // state KEPT (same type, same spot)
<Counter key={user} name={user} />                            // state RESET when user changes`,
      playground: {
        jsx: `const { useState } = React;

function Counter({ name }) {
  const [n, setN] = useState(0);
  return <div style={{ border: '1px solid #ccc', padding: 8, margin: 6 }}>{name}: {n} <button onClick={() => setN(n + 1)}>+1</button></div>;
}

function App() {
  const [isA, setIsA] = useState(true);
  const [user, setUser] = useState('Asha');
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <h4>1. Same position, same type (state is kept)</h4>
      <button onClick={() => setIsA(!isA)}>switch player</button>
      {isA ? <Counter name="Player A" /> : <Counter name="Player B" />}

      <h4>2. key changes (state resets on purpose)</h4>
      <select value={user} onChange={e => setUser(e.target.value)}>
        <option>Asha</option><option>Ravi</option>
      </select>
      <Counter key={user} name={'Cart of ' + user} />
    </div>
  );
}`,
      },
      result: 'Switching player keeps the number (surprising for many developers). Switching user resets the cart counter to 0.',
      explanation:
        'Reconciliation compares type and position. Both branches render Counter in the same slot, so React treats it as the same instance. A new key tells React it is a different instance, so it unmounts the old one and mounts a fresh one.',
    },
    {
      title: 'Automatic batching and updater functions',
      scenario: 'Click a button that calls setState three times, inside a timeout, and compare value vs updater style.',
      steps: [
        'Count renders with a ref',
        'Button 1 calls setCount(count + 1) three times',
        'Button 2 calls setCount(c => c + 1) three times inside setTimeout',
        'Observe the count and the render counter',
      ],
      code: `setCount(count + 1); setCount(count + 1); setCount(count + 1); // +1 only (same snapshot)
setTimeout(() => { setCount(c => c + 1); setCount(c => c + 1); setCount(c => c + 1); }, 0); // +3, ONE render`,
      playground: {
        jsx: `const { useState, useRef } = React;

function App() {
  const [count, setCount] = useState(0);
  const renders = useRef(0);
  renders.current++;
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <h2>count = {count}</h2>
      <p>renders so far: {renders.current}</p>
      <button onClick={() => { setCount(count + 1); setCount(count + 1); setCount(count + 1); }}>
        3x setCount(count + 1)
      </button>{' '}
      <button onClick={() => setTimeout(() => { setCount(c => c + 1); setCount(c => c + 1); setCount(c => c + 1); }, 0)}>
        3x updater inside setTimeout
      </button>
    </div>
  );
}`,
      },
      result: 'Button 1 adds 1, button 2 adds 3. Each click increases the render counter by exactly 1.',
      explanation:
        'All three calls read the same snapshot value of count, so the first button sets 1 three times. Updaters receive the latest queued value. React 18+ batches updates even inside setTimeout, so there is a single render per click.',
    },
    {
      title: 'Writing StrictMode-safe effects',
      scenario: 'A chat room subscription that would leak connections if the cleanup is missing. StrictMode double-mounting exposes the bug.',
      steps: [
        'Create a fake connection object that counts open connections',
        'Connect in useEffect and return a cleanup that disconnects',
        'Toggle the component and switch rooms',
        'Confirm open connections never exceed 1',
      ],
      code: `useEffect(() => {
  const conn = createConnection(roomId);
  conn.connect();
  return () => conn.disconnect();   // without this, StrictMode shows 2 open connections
}, [roomId]);`,
      playground: {
        jsx: `const { useState, useEffect, StrictMode } = React;
const stats = { open: 0, listeners: [] };
const notify = () => stats.listeners.forEach(fn => fn(stats.open));
function createConnection(room) {
  return {
    connect() { stats.open++; notify(); },
    disconnect() { stats.open--; notify(); },
  };
}

function ChatRoom({ roomId }) {
  useEffect(() => {
    const conn = createConnection(roomId);
    conn.connect();
    return () => conn.disconnect();
  }, [roomId]);
  return <p>Connected to <b>#{roomId}</b></p>;
}

function App() {
  const [room, setRoom] = useState('general');
  const [show, setShow] = useState(true);
  const [open, setOpen] = useState(0);
  useEffect(() => { stats.listeners.push(setOpen); setOpen(stats.open); }, []);
  return (
    <StrictMode>
      <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
        <select value={room} onChange={e => setRoom(e.target.value)}>
          <option>general</option><option>react</option><option>node</option>
        </select>{' '}
        <button onClick={() => setShow(s => !s)}>{show ? 'leave' : 'join'}</button>
        {show && <ChatRoom roomId={room} />}
        <p>Open connections: <b>{open}</b> (should be 0 or 1)</p>
      </div>
    </StrictMode>
  );
}`,
      },
      result: 'Open connections stays at 1 while joined and 0 after leaving, even with StrictMode remounting the component.',
      explanation:
        'StrictMode runs effect, cleanup, effect on mount in development. Because the cleanup disconnects, the net result is one connection. Remove the return line and you will see the count climb, which is exactly the leak StrictMode is designed to reveal.',
    },
  ],
  interview: [
    { q: 'What is the virtual DOM, and is it the reason React is fast?', a: 'The virtual DOM is the tree of plain JS objects (React elements) produced by your components. React diffs the new tree against the previous one and applies only the needed DOM changes. It is not "faster than the DOM"; it is a way to write declarative UI while keeping DOM updates small. Hand-written DOM code can be faster, but harder to maintain.', level: 'Easy' },
    { q: 'Explain the render phase and the commit phase.', a: 'Render phase: React calls components, builds the new fiber tree and computes changes. It is pure, interruptible and may run several times. Commit phase: React applies DOM mutations, attaches refs, runs useLayoutEffect synchronously, then the browser paints and useEffect runs. Commit is synchronous and cannot be interrupted.', level: 'Medium' },
    { q: 'What heuristics does reconciliation use?', a: '1) Elements of different types produce different trees, so the old subtree is unmounted (state lost). 2) Same type at the same position is updated in place. 3) Children in lists are matched by key. These make diffing O(n) instead of O(n^3).', level: 'Medium' },
    { q: 'What is React Fiber and what problems does it solve?', a: 'Fiber is the reconciler architecture since React 16. Each element becomes a fiber node linked via child/sibling/return pointers. Rendering becomes an interruptible loop of units of work, enabling time slicing, priorities (lanes), concurrent features like useTransition and Suspense, and double buffering (current vs workInProgress trees).', level: 'Hard' },
    { q: 'Why must hooks be called in the same order?', a: 'Hooks are stored as a linked list on the component fiber, identified only by call order. If a hook is skipped conditionally, every following hook reads the state of a different hook. That is why hooks cannot be inside conditions, loops or nested functions.', level: 'Medium' },
    { q: 'What is automatic batching in React 18+?', a: 'React groups multiple state updates in the same tick into one render, regardless of where they happen (event handlers, timeouts, promises, native listeners). Before React 18 only React event handlers were batched. Use flushSync to opt out for a specific update.', level: 'Easy' },
    { q: 'Why does console.log(count) right after setCount(count + 1) print the old value?', a: 'State is a snapshot for a given render. setCount schedules a re-render; it does not mutate the local constant. The new value is available in the next render. Use the updater form when calculating from the previous value.', level: 'Easy' },
    { q: 'Why is using the array index as key a problem?', a: 'When items are inserted, removed or reordered, indexes shift, so React matches the wrong old element to each new item. This causes unnecessary re-renders and, worse, state and uncontrolled input values attached to the wrong row. Use stable ids from data.', level: 'Easy' },
    { q: 'Why does my useEffect run twice in development?', a: 'StrictMode intentionally mounts, unmounts and re-mounts components in development to verify effects have proper cleanup. It does not happen in production. Fix by adding cleanup (abort fetch, unsubscribe) or use a data-fetching library; do not remove StrictMode.', level: 'Medium' },
    { q: 'Does a child re-render when its parent re-renders even if props are unchanged?', a: 'Yes, by default. Rendering is recursive. Wrap the child in React.memo (and keep props referentially stable with useMemo/useCallback), or use React Compiler, to skip it. Note that re-render does not always mean DOM changes.', level: 'Medium' },
    { q: 'How can you reset a component\'s state when a prop changes?', a: 'Give it a key based on that prop: <Profile key={userId} userId={userId} />. A new key makes React unmount and remount it with fresh state. This is cleaner than syncing state in an effect.', level: 'Medium' },
    { q: 'What happens if you declare a component inside another component?', a: 'Every render creates a new function, i.e. a new component type. Reconciliation sees a different type and remounts the subtree each time, losing state and focus and hurting performance. Declare components at the top level.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Build a "render highlighter": a list of 5 product rows where each row flashes yellow whenever it renders. Add a search input in the parent and observe that every row flashes on each keystroke.',
      hint: 'Use a ref to the DOM element and useEffect without dependencies to add/remove a CSS class after each commit.',
      solution: `const { useState, useRef, useEffect } = React;

function Row({ name }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.style.background = 'yellow';
    const t = setTimeout(() => { if (ref.current) ref.current.style.background = ''; }, 300);
    return () => clearTimeout(t);
  });
  return <li ref={ref}>{name}</li>;
}

function App() {
  const [q, setQ] = useState('');
  const products = ['Laptop', 'Mouse', 'Monitor', 'Keyboard', 'Webcam'];
  return (
    <div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="type here" />
      <ul>{products.map(p => <Row key={p} name={p} />)}</ul>
    </div>
  );
}`,
    },
    {
      task: 'Fix the bug: a form with tabs "Personal" and "Company" renders `{tab === "p" ? <input placeholder="Name" /> : <input placeholder="Company" />}`. Text typed in one tab appears in the other. Make each tab keep separate input state.',
      hint: 'Same type at the same position is reused. Give the elements different keys.',
      solution: `const { useState } = React;
function App() {
  const [tab, setTab] = useState('p');
  return (
    <div>
      <button onClick={() => setTab('p')}>Personal</button>
      <button onClick={() => setTab('c')}>Company</button>
      {tab === 'p'
        ? <input key="personal" placeholder="Name" />
        : <input key="company" placeholder="Company" />}
    </div>
  );
}
// Different keys = different identities, so React unmounts one input and mounts the other.`,
    },
    {
      task: 'Write a component that fetches a user from https://jsonplaceholder.typicode.com/users/:id when the id changes, and is correct under StrictMode and fast id changes (no race conditions).',
      hint: 'Use AbortController in the effect and abort in the cleanup.',
      solution: `const { useState, useEffect } = React;
function User({ id }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    setUser(null);
    fetch('https://jsonplaceholder.typicode.com/users/' + id, { signal: controller.signal })
      .then(r => r.json())
      .then(setUser)
      .catch(err => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, [id]);
  if (error) return <p>{error}</p>;
  return <p>{user ? user.name : 'Loading...'}</p>;
}
function App() {
  const [id, setId] = useState(1);
  return <div><button onClick={() => setId(i => (i % 10) + 1)}>next</button><User id={id} /></div>;
}`,
    },
    {
      task: 'Show with a demo that setState with the same value does not re-render children. Create a parent with a "set to 5" button and a child that counts its renders.',
      hint: 'React compares with Object.is and bails out.',
      solution: `const { useState, useRef } = React;
function Child() { const r = useRef(0); r.current++; return <p>child renders: {r.current}</p>; }
function App() {
  const [n, setN] = useState(0);
  return (
    <div>
      <p>n = {n}</p>
      <button onClick={() => setN(5)}>set to 5</button>
      <Child />
    </div>
  );
}
// First click: renders (0 -> 5). Further clicks: same value, React bails out, child count stops increasing.`,
    },
  ],
  quiz: [
    { question: 'In which phase does React mutate the real DOM?', options: ['Render phase', 'Commit phase', 'Reconciliation phase', 'Hydration phase only'], answer: 1, explanation: 'The render phase only computes changes. DOM mutations happen in the commit phase.' },
    { question: 'A parent renders `{flag ? <Counter /> : <Counter />}`. What happens to Counter\'s state when flag toggles?', options: ['It is reset', 'React throws an error', 'It is preserved', 'It is duplicated'], answer: 2, explanation: 'Same component type at the same position is treated as the same instance, so state is kept.' },
    { question: 'Which statement about StrictMode is true?', options: ['It double-invokes renders and effects only in development', 'It makes production builds slower', 'It disables effects', 'It is required for React 19'], answer: 0, explanation: 'StrictMode checks are development-only and help find impure renders and missing cleanups.' },
    { question: 'Three calls to setCount(c => c + 1) inside one setTimeout in React 18+ cause how many renders?', options: ['3', '0', '2', 'One'], answer: 3, explanation: 'Automatic batching groups updates from timeouts too, and updaters chain, so count increases by 3 in a single render.' },
    { question: 'Why are hooks not allowed inside if statements?', options: ['Because JSX cannot contain if', 'Because hooks are slow', 'Because React identifies hooks by call order on the fiber', 'Because of TypeScript rules'], answer: 2, explanation: 'The hooks linked list depends on a consistent call order every render.' },
  ],
};
