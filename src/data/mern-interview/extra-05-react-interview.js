export default {
  id: 'extra-05-react-interview',
  title: 'React Interview: Virtual DOM, Reconciliation, Hooks, useEffect Pitfalls, Keys, Memoization, Context vs Redux, React 19',
  module: 'Interview: Frontend',
  extraNo: 5,
  level: 'Intermediate',
  duration: '3.5 hours',
  summary: 'The React questions asked in almost every MERN interview, from "what is the virtual DOM?" to stale closures, keys, memoization, Context vs Redux and what is new in React 19. Revise the notes, run the demos, then practise the 30 interview answers out loud.',
  objectives: [
    'Explain the virtual DOM, reconciliation, Fiber and why keys matter',
    'State the rules of hooks and explain useState batching and functional updates',
    'Avoid useEffect pitfalls: missing dependencies, stale closures, infinite loops, missing cleanup, race conditions',
    'Know when (and when not) to use React.memo, useMemo and useCallback',
    'Compare props drilling, Context, Redux Toolkit and Zustand, and controlled vs uncontrolled components',
    'Describe React 19 features: Actions, useActionState, useOptimistic, use(), ref as a prop, React Compiler, Server Components',
  ],
  theory: [
    {
      heading: 'Virtual DOM, reconciliation and Fiber',
      content: `**React** is a JavaScript library for building UIs from **components** – functions that take props and return JSX. JSX is compiled to \`React.createElement\` / \`jsx()\` calls that create plain JS objects (React elements).

The **virtual DOM** is that tree of lightweight JS objects describing the UI. When state changes, React:
1. **Renders**: calls your component again to get a new element tree.
2. **Reconciles (diffs)**: compares the new tree with the previous one.
3. **Commits**: applies only the minimal real DOM changes, then runs effects.

The diffing algorithm is O(n) thanks to two heuristics:
- Elements of a **different type** (\`<div>\` → \`<span>\`, \`<Login>\` → \`<Signup>\`) destroy the old subtree and build a new one (state is lost).
- In lists, **keys** identify which child is which across renders.

**Fiber** (React 16+) is the reconciliation engine that splits rendering work into units so React can pause, prioritise and resume it. That enables **concurrent features** in React 18/19: \`startTransition\`, \`useDeferredValue\`, Suspense, and automatic batching.

The virtual DOM is not "faster than the DOM"; it makes updates **declarative and predictable** while keeping DOM work small enough.`,
      tip: 'How to answer: "React keeps a virtual tree, diffs it with the previous one on every state change, and commits only the differences. Keys and element types guide the diff." Then give the index-as-key bug as an example.',
    },
    {
      heading: 'Hooks: rules, useState, batching and useRef',
      content: `**Rules of hooks**
1. Call hooks only at the **top level** – not inside loops, conditions or nested functions.
2. Call hooks only from **React function components or custom hooks** (names start with \`use\`).
Why: React stores hook state in a list per component and matches them by **call order**. A conditional hook shifts the order and mixes up state. (React 19's \`use()\` is the one exception that can be called conditionally.)

**useState**
- \`setState\` does not change the variable immediately; the component re-renders with the new value. Inside one render, state is a **snapshot**.
- Use the **functional update** \`setCount(c => c + 1)\` when the new value depends on the old one. Three \`setCount(count + 1)\` calls add 1; three \`setCount(c => c + 1)\` calls add 3.
- React 18+ **automatically batches** multiple updates (even in timeouts and promises) into one re-render.
- Never mutate: \`setItems([...items, newItem])\`, \`setUser({ ...user, name })\`. React compares with \`Object.is\`, so a mutated object looks "unchanged".
- Lazy initial state: \`useState(() => JSON.parse(localStorage.getItem('cart')) ?? [])\` runs only once.

**useRef** returns a mutable \`{ current }\` box that survives re-renders **without causing** a re-render. Uses: DOM access (\`inputRef.current.focus()\`), storing timer ids, previous values, render counters.

**useReducer** is useState for complex state transitions: \`const [state, dispatch] = useReducer(reducer, initial)\`.`,
    },
    {
      heading: 'useEffect: lifecycle with hooks and common pitfalls',
      content: `\`useEffect(setup, deps)\` runs **after** React commits to the screen. It is for **synchronising with external systems**: fetching, subscriptions, timers, DOM APIs, WebSockets.

**Lifecycle mapping**
- \`componentDidMount\` → \`useEffect(fn, [])\`
- \`componentDidUpdate\` → \`useEffect(fn, [a, b])\` (runs when a or b changes)
- \`componentWillUnmount\` → the **cleanup** function returned from the effect
- No deps array → runs after **every** render.

**Pitfalls interviewers ask about**
- **Missing dependencies** → stale values. Fix: include them (eslint \`react-hooks/exhaustive-deps\`) or use functional updates.
- **Infinite loop**: setting state that is also a dependency, or an object/array created in render used as a dependency.
- **No cleanup**: intervals, event listeners and sockets leak. Return a cleanup.
- **Race conditions** in fetching: older response arrives last. Fix with \`AbortController\` or an \`ignore\` flag in cleanup.
- **Async effect function**: \`useEffect(async () => ...)\` is wrong because it returns a promise, not a cleanup. Define an async function inside and call it.
- **StrictMode in development** mounts → unmounts → mounts again, so effects run twice. This is intentional to expose missing cleanups; it does not happen in production.
- **You might not need an effect**: derived data (\`fullName = first + ' ' + last\`) should be calculated during render; user events should be handled in event handlers.

\`useLayoutEffect\` runs synchronously after DOM mutation but before paint – use for measuring layout to avoid flicker.`,
      tip: 'Mention that in real projects you often use TanStack Query (React Query) or SWR for server data instead of hand-written fetch effects: caching, deduping, retries and race conditions are handled for you.',
    },
    {
      heading: 'Keys, lists, controlled components and forms',
      content: `**Keys** tell React which list item is which between renders. They must be **stable, unique among siblings, and not random**.
- Good: database \`_id\`.
- Bad: \`Math.random()\` (new key every render → remounts every item, loses state and focus).
- Risky: array **index** – fine for static lists that never reorder, but when you insert/delete/sort, state (input text, checkbox) sticks to the wrong item.

A **key change** also forces a remount: \`<Profile key={userId} />\` is a neat trick to reset a component's state.

**Controlled vs uncontrolled**
- **Controlled**: the input value lives in React state: \`<input value={name} onChange={e => setName(e.target.value)} />\`. Single source of truth, easy validation, instant formatting.
- **Uncontrolled**: the DOM keeps the value; you read it via a ref (\`inputRef.current.value\`) or \`FormData\` on submit. Less code, good for simple forms and file inputs (\`<input type="file">\` is always uncontrolled).
- Libraries: **React Hook Form** (uncontrolled-first, fast) with **Zod** validation.

**Lifting state up**: when two siblings need the same data, move the state to their closest common parent and pass it down as props.`,
    },
    {
      heading: 'Performance: React.memo, useMemo, useCallback, code splitting',
      content: `A component re-renders when **its state changes, its parent re-renders, or a context it uses changes**. Re-render is not the same as DOM update – it is usually cheap.

- **React.memo(Component)** – skips re-rendering if props are shallowly equal.
- **useMemo(() => value, deps)** – caches a **computed value** (expensive filter/sort, or an object passed to a memo child).
- **useCallback(fn, deps)** – caches a **function reference** so a memoised child does not see a "new" prop each render. \`useCallback(fn, deps)\` equals \`useMemo(() => fn, deps)\`.

They only help **together**: \`useCallback\` without a \`memo\` child (or an effect dependency) buys nothing. Memoisation has a cost, so measure first with the React DevTools Profiler.

Other techniques: **code splitting** with \`React.lazy(() => import('./Admin'))\` + \`<Suspense fallback>\`; **list virtualisation** (react-window) for thousands of rows; **debouncing** inputs; **useTransition / useDeferredValue** to keep typing responsive while a heavy list updates; keep state as **local** as possible; avoid putting rapidly changing values in a big context.

**React Compiler** (stable in 2025, works with React 19) auto-memoises components and values at build time, so manual \`useMemo\`/\`useCallback\` becomes much less necessary – but interviewers still expect you to know them.`,
    },
    {
      heading: 'State management, Context vs Redux, and React 19 features',
      content: `**Props drilling**: passing props through many layers that do not need them. Solutions: component composition (pass \`children\`), **Context**, or a store.

**Context API**: \`createContext\` → \`<ThemeContext value={...}>\` (React 19; older: \`.Provider\`) → \`useContext(ThemeContext)\`. Great for **low-frequency global data**: theme, logged-in user, language. Downside: every consumer re-renders when the value changes; no devtools/middleware.

**Redux Toolkit**: a single store, slices (\`createSlice\`), \`useSelector\` (subscribes only to the selected part), \`useDispatch\`, middleware, time-travel devtools, RTK Query for API caching. Good for large apps with complex, frequently changing shared state.

**Zustand**: tiny store with hooks, no providers, selective subscriptions – popular in startups.

**Server state vs client state**: API data (products, orders) is best handled by **TanStack Query / RTK Query**; UI state (modal open, theme) by local state/Context.

**React 19 (Dec 2024) highlights**
- **Actions**: async functions in transitions; \`<form action={fn}>\` handles pending state, errors and reset automatically.
- **useActionState** – \`const [state, formAction, isPending] = useActionState(fn, initial)\`.
- **useFormStatus** – read the parent form's pending state in a child (e.g. submit button).
- **useOptimistic** – show the expected result instantly (like a "liked" heart) and roll back on error.
- **use(promise | context)** – read a promise (with Suspense) or context, can be called conditionally.
- **ref as a prop** – \`forwardRef\` no longer needed for function components; ref callbacks can return cleanup.
- \`<Context>\` as provider, document metadata (\`<title>\`, \`<meta>\`) rendered anywhere, stylesheet/script support, better hydration errors.
- **Server Components** and **Server Actions** (used through frameworks like Next.js).`,
      tip: 'For "Context vs Redux" never say "Redux is outdated". Say: Context is a transport mechanism for dependency injection, not a state manager with optimised subscriptions. For small apps Context + useReducer is enough; for large shared, frequently updated state I would choose Redux Toolkit or Zustand; for server data, TanStack Query.',
    },
  ],
  examples: [
    {
      title: 'Stale closure in useEffect (and the functional update fix)',
      scenario: 'Classic question: "Why does my setInterval counter stop at 1?"',
      steps: ['Create a timer that uses setCount(count + 1) inside an effect with []', 'Create a second timer that uses setCount(c => c + 1)', 'Click Run and watch both counters', 'Click Unmount to see the cleanup stop the interval'],
      code: "const { useState, useEffect } = React;\n\nfunction BuggyTimer() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    // BUG: this closure captured count = 0 forever (stale closure)\n    const id = setInterval(() => setCount(count + 1), 1000);\n    return () => clearInterval(id);\n  }, []); // eslint would warn: missing dependency 'count'\n  return <p>Buggy timer: <b>{count}</b> (gets stuck at 1)</p>;\n}\n\nfunction FixedTimer() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    // FIX: functional update always receives the latest state\n    const id = setInterval(() => setCount((c) => c + 1), 1000);\n    return () => clearInterval(id); // cleanup on unmount\n  }, []);\n  return <p>Fixed timer: <b>{count}</b> (keeps counting)</p>;\n}\n\nfunction App() {\n  const [show, setShow] = useState(true);\n  return (\n    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>\n      <h3>Stale closure in useEffect</h3>\n      <BuggyTimer />\n      {show && <FixedTimer />}\n      <button onClick={() => setShow((s) => !s)}>{show ? 'Unmount' : 'Mount'} fixed timer</button>\n    </div>\n  );\n}",
      playground: { jsx: "const { useState, useEffect } = React;\n\nfunction BuggyTimer() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    // BUG: this closure captured count = 0 forever (stale closure)\n    const id = setInterval(() => setCount(count + 1), 1000);\n    return () => clearInterval(id);\n  }, []); // eslint would warn: missing dependency 'count'\n  return <p>Buggy timer: <b>{count}</b> (gets stuck at 1)</p>;\n}\n\nfunction FixedTimer() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    // FIX: functional update always receives the latest state\n    const id = setInterval(() => setCount((c) => c + 1), 1000);\n    return () => clearInterval(id); // cleanup on unmount\n  }, []);\n  return <p>Fixed timer: <b>{count}</b> (keeps counting)</p>;\n}\n\nfunction App() {\n  const [show, setShow] = useState(true);\n  return (\n    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>\n      <h3>Stale closure in useEffect</h3>\n      <BuggyTimer />\n      {show && <FixedTimer />}\n      <button onClick={() => setShow((s) => !s)}>{show ? 'Unmount' : 'Mount'} fixed timer</button>\n    </div>\n  );\n}" },
      result: 'The buggy timer shows 1 and never changes; the fixed timer keeps counting 1, 2, 3... Unmounting the fixed timer removes it and its interval is cleared.',
      explanation: 'The effect runs once (empty deps), so its callback closes over the `count` from the FIRST render, which is 0. Every tick sets 0 + 1 = 1. The functional updater `c => c + 1` does not read the captured variable; React passes the latest state. The returned cleanup `clearInterval(id)` runs on unmount (and before re-running the effect), preventing memory leaks and "state update on unmounted component" bugs.',
    },
    {
      title: 'Why index as key breaks list state',
      scenario: 'Interviewer: "Can I use the array index as key?" Show the bug with uncontrolled inputs.',
      steps: ['Render two lists, one with key=index and one with key=item.id', 'Type a note next to "Asha" in both lists', 'Click "Add item at top" in both lists', 'Compare where your typed text ends up'],
      code: "const { useState } = React;\n\nfunction List({ useIndexKey }) {\n  const [items, setItems] = useState([\n    { id: 1, name: 'Asha' },\n    { id: 2, name: 'Ravi' },\n  ]);\n  const [nextId, setNextId] = useState(3);\n  const addTop = () => {\n    setItems([{ id: nextId, name: 'New ' + nextId }, ...items]);\n    setNextId(nextId + 1);\n  };\n  return (\n    <div style={{ border: '1px solid #ccc', padding: 8, margin: 8, borderRadius: 8 }}>\n      <h4>{useIndexKey ? 'key = index (buggy)' : 'key = item.id (correct)'}</h4>\n      <button onClick={addTop}>Add item at top</button>\n      <ul>\n        {items.map((item, index) => (\n          <li key={useIndexKey ? index : item.id}>\n            {item.name} <input placeholder={'note for ' + item.name} />\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}\n\nfunction App() {\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <p>Type something in the \"Asha\" input in BOTH lists, then click \"Add item at top\".</p>\n      <List useIndexKey={true} />\n      <List useIndexKey={false} />\n    </div>\n  );\n}",
      playground: { jsx: "const { useState } = React;\n\nfunction List({ useIndexKey }) {\n  const [items, setItems] = useState([\n    { id: 1, name: 'Asha' },\n    { id: 2, name: 'Ravi' },\n  ]);\n  const [nextId, setNextId] = useState(3);\n  const addTop = () => {\n    setItems([{ id: nextId, name: 'New ' + nextId }, ...items]);\n    setNextId(nextId + 1);\n  };\n  return (\n    <div style={{ border: '1px solid #ccc', padding: 8, margin: 8, borderRadius: 8 }}>\n      <h4>{useIndexKey ? 'key = index (buggy)' : 'key = item.id (correct)'}</h4>\n      <button onClick={addTop}>Add item at top</button>\n      <ul>\n        {items.map((item, index) => (\n          <li key={useIndexKey ? index : item.id}>\n            {item.name} <input placeholder={'note for ' + item.name} />\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}\n\nfunction App() {\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <p>Type something in the \"Asha\" input in BOTH lists, then click \"Add item at top\".</p>\n      <List useIndexKey={true} />\n      <List useIndexKey={false} />\n    </div>\n  );\n}" },
      result: 'In the key=index list, your note now appears next to the NEW item (wrong row). In the key=id list the note stays next to Asha.',
      explanation: 'With index keys, the new item gets key 0, which previously belonged to Asha. React thinks row 0 just changed its text and reuses the same DOM <input> (with your typed value). With id keys, React sees a brand-new key 1→3 and inserts a new row, keeping existing rows and their DOM state intact.',
    },
    {
      title: 'React.memo + useCallback + useMemo: count the renders',
      scenario: 'Show exactly when memoisation helps.',
      steps: ['Wrap Child in React.memo and count renders with useRef', 'Pass an inline function to one child and a useCallback function to the other', 'Type in the input (changes only the parent state)', 'Click a button (changes count)'],
      code: "const { useState, useCallback, useMemo, memo, useRef } = React;\n\nconst Child = memo(function Child({ label, onClick }) {\n  const renders = useRef(0);\n  renders.current += 1;\n  return (\n    <p>\n      <button onClick={onClick}>{label}</button> rendered {renders.current} times\n    </p>\n  );\n});\n\nfunction App() {\n  const [count, setCount] = useState(0);\n  const [text, setText] = useState('');\n\n  const unstable = () => setCount((c) => c + 1);                    // new function every render\n  const stable = useCallback(() => setCount((c) => c + 1), []);     // same function every render\n\n  const expensive = useMemo(() => {\n    let total = 0;\n    for (let i = 0; i < 2e6; i++) total += i % 7;\n    return total + count;\n  }, [count]); // recalculated only when count changes\n\n  return (\n    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>\n      <input value={text} onChange={(e) => setText(e.target.value)} placeholder=\"Type here\" />\n      <p>count = {count}, expensive = {expensive}</p>\n      <Child label=\"memo child + inline function\" onClick={unstable} />\n      <Child label=\"memo child + useCallback\" onClick={stable} />\n    </div>\n  );\n}",
      playground: { jsx: "const { useState, useCallback, useMemo, memo, useRef } = React;\n\nconst Child = memo(function Child({ label, onClick }) {\n  const renders = useRef(0);\n  renders.current += 1;\n  return (\n    <p>\n      <button onClick={onClick}>{label}</button> rendered {renders.current} times\n    </p>\n  );\n});\n\nfunction App() {\n  const [count, setCount] = useState(0);\n  const [text, setText] = useState('');\n\n  const unstable = () => setCount((c) => c + 1);                    // new function every render\n  const stable = useCallback(() => setCount((c) => c + 1), []);     // same function every render\n\n  const expensive = useMemo(() => {\n    let total = 0;\n    for (let i = 0; i < 2e6; i++) total += i % 7;\n    return total + count;\n  }, [count]); // recalculated only when count changes\n\n  return (\n    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>\n      <input value={text} onChange={(e) => setText(e.target.value)} placeholder=\"Type here\" />\n      <p>count = {count}, expensive = {expensive}</p>\n      <Child label=\"memo child + inline function\" onClick={unstable} />\n      <Child label=\"memo child + useCallback\" onClick={stable} />\n    </div>\n  );\n}" },
      result: 'While typing, the "inline function" child render count increases with every key press, but the "useCallback" child stays at 1. Clicking either button increases count; only the inline child re-renders again.',
      explanation: 'React.memo compares props shallowly. An inline arrow is a NEW function every render, so memo is useless for that child. useCallback with [] returns the same function, so props are equal and the render is skipped. useMemo caches the expensive loop and only recomputes when count changes, so typing stays fast. (In StrictMode development builds, counters may show doubled numbers because of intentional double render.)',
    },
    {
      title: 'Reconciliation by key vs by index (plain JS model)',
      scenario: 'Explain reconciliation with a simplified model of what React does with list keys.',
      steps: ['Write a diff function that matches old and new items by a key function', 'Insert a new item at the top of the list', 'Compare operations when the key is the index vs the id', 'Click Run'],
      code: "// A tiny model of how React reconciles a list: by key vs by index\nfunction diff(oldList, newList, getKey) {\n  const ops = [];\n  const oldMap = new Map(oldList.map((item, i) => [getKey(item, i), item]));\n  const newKeys = new Set(newList.map((item, i) => getKey(item, i)));\n  newList.forEach((item, i) => {\n    const key = getKey(item, i);\n    const prev = oldMap.get(key);\n    if (!prev) ops.push('CREATE ' + item.name);\n    else if (prev.name !== item.name) ops.push('UPDATE key ' + key + ': ' + prev.name + ' -> ' + item.name);\n    else ops.push('KEEP ' + item.name);\n  });\n  oldList.forEach((item, i) => {\n    if (!newKeys.has(getKey(item, i))) ops.push('DELETE ' + item.name);\n  });\n  return ops;\n}\n\nconst before = [{ id: 1, name: 'Asha' }, { id: 2, name: 'Ravi' }, { id: 3, name: 'Meera' }];\nconst after = [{ id: 4, name: 'Kiran' }, ...before]; // new item added at the TOP\n\nconsole.log('Using index as key:');\nconsole.log(diff(before, after, (_, i) => i));\nconsole.log('Using id as key:');\nconsole.log(diff(before, after, (item) => item.id));",
      playground: { html: '<h3>List diff model (see console)</h3>', js: "// A tiny model of how React reconciles a list: by key vs by index\nfunction diff(oldList, newList, getKey) {\n  const ops = [];\n  const oldMap = new Map(oldList.map((item, i) => [getKey(item, i), item]));\n  const newKeys = new Set(newList.map((item, i) => getKey(item, i)));\n  newList.forEach((item, i) => {\n    const key = getKey(item, i);\n    const prev = oldMap.get(key);\n    if (!prev) ops.push('CREATE ' + item.name);\n    else if (prev.name !== item.name) ops.push('UPDATE key ' + key + ': ' + prev.name + ' -> ' + item.name);\n    else ops.push('KEEP ' + item.name);\n  });\n  oldList.forEach((item, i) => {\n    if (!newKeys.has(getKey(item, i))) ops.push('DELETE ' + item.name);\n  });\n  return ops;\n}\n\nconst before = [{ id: 1, name: 'Asha' }, { id: 2, name: 'Ravi' }, { id: 3, name: 'Meera' }];\nconst after = [{ id: 4, name: 'Kiran' }, ...before]; // new item added at the TOP\n\nconsole.log('Using index as key:');\nconsole.log(diff(before, after, (_, i) => i));\nconsole.log('Using id as key:');\nconsole.log(diff(before, after, (item) => item.id));" },
      result: `Using index as key:
[
  'UPDATE key 0: Asha -> Kiran',
  'UPDATE key 1: Ravi -> Asha',
  'UPDATE key 2: Meera -> Ravi',
  'CREATE Meera'
]
Using id as key:
[ 'CREATE Kiran', 'KEEP Asha', 'KEEP Ravi', 'KEEP Meera' ]`,
      explanation: 'With index keys, adding one item at the top makes EVERY existing row look changed: 3 updates + 1 create. With stable id keys React does 1 create and keeps the rest. This is a simplified model (React also handles moves), but it is exactly the reasoning interviewers want.',
    },
    {
      title: 'Fetching in useEffect without race conditions',
      scenario: '"The user clicks Next quickly and sometimes sees the wrong profile. Why and how do you fix it?"',
      steps: ['Fetch a user by id inside useEffect with [id] as dependency', 'Create an AbortController and pass its signal to fetch', 'Abort in the cleanup function', 'Ignore AbortError in catch', 'Click Next quickly several times'],
      code: "const { useState, useEffect } = React;\n\nfunction User({ id }) {\n  const [user, setUser] = useState(null);\n  const [error, setError] = useState('');\n\n  useEffect(() => {\n    const controller = new AbortController();\n    setUser(null);\n    setError('');\n    fetch('https://jsonplaceholder.typicode.com/users/' + id, { signal: controller.signal })\n      .then((res) => {\n        if (!res.ok) throw new Error('HTTP ' + res.status);\n        return res.json();\n      })\n      .then(setUser)\n      .catch((err) => {\n        if (err.name !== 'AbortError') setError(err.message);\n      });\n    // Cleanup: cancel the old request when id changes or component unmounts\n    return () => controller.abort();\n  }, [id]);\n\n  if (error) return <p style={{ color: 'crimson' }}>Error: {error}</p>;\n  if (!user) return <p>Loading user {id}...</p>;\n  return <p><b>{user.name}</b> ({user.email})</p>;\n}\n\nfunction App() {\n  const [id, setId] = useState(1);\n  return (\n    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>\n      <button onClick={() => setId((i) => Math.max(1, i - 1))}>Prev</button>{' '}\n      <button onClick={() => setId((i) => Math.min(10, i + 1))}>Next</button>\n      <p>Click Next quickly many times: only the LAST user is shown.</p>\n      <User id={id} />\n    </div>\n  );\n}",
      playground: { jsx: "const { useState, useEffect } = React;\n\nfunction User({ id }) {\n  const [user, setUser] = useState(null);\n  const [error, setError] = useState('');\n\n  useEffect(() => {\n    const controller = new AbortController();\n    setUser(null);\n    setError('');\n    fetch('https://jsonplaceholder.typicode.com/users/' + id, { signal: controller.signal })\n      .then((res) => {\n        if (!res.ok) throw new Error('HTTP ' + res.status);\n        return res.json();\n      })\n      .then(setUser)\n      .catch((err) => {\n        if (err.name !== 'AbortError') setError(err.message);\n      });\n    // Cleanup: cancel the old request when id changes or component unmounts\n    return () => controller.abort();\n  }, [id]);\n\n  if (error) return <p style={{ color: 'crimson' }}>Error: {error}</p>;\n  if (!user) return <p>Loading user {id}...</p>;\n  return <p><b>{user.name}</b> ({user.email})</p>;\n}\n\nfunction App() {\n  const [id, setId] = useState(1);\n  return (\n    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>\n      <button onClick={() => setId((i) => Math.max(1, i - 1))}>Prev</button>{' '}\n      <button onClick={() => setId((i) => Math.min(10, i + 1))}>Next</button>\n      <p>Click Next quickly many times: only the LAST user is shown.</p>\n      <User id={id} />\n    </div>\n  );\n}" },
      result: 'Loading text appears briefly, then the name and email of the currently selected user (e.g. "Leanne Graham (Sincere@april.biz)" for id 1). Fast clicking never shows an older user.',
      explanation: 'Without cleanup, responses can arrive out of order and an older response overwrites the newer one. Each time id changes, React runs the previous cleanup, which aborts the old request; only the latest request can call setUser. Also note we check `res.ok` because fetch does not reject on 404/500.',
    },
  ],
  interview: [
    { q: 'What is React and why is it popular?', level: 'Easy', a: `React is an open-source JavaScript **library** (by Meta) for building user interfaces from reusable **components**. It is declarative: you describe what the UI should look like for a given state and React updates the DOM.\n\nWhy popular: component reuse, one-way data flow (predictable), virtual DOM reconciliation, huge ecosystem (React Router, Redux Toolkit, TanStack Query, Next.js), React Native for mobile, and strong hiring demand. It is a library (view layer), not a full framework like Angular.` },
    { q: 'What is the virtual DOM? How is it different from the real DOM and the shadow DOM?', level: 'Easy', a: `The **virtual DOM** is an in-memory tree of JS objects that describes the UI. On state change React builds a new tree, diffs it with the old one and updates only the changed parts of the **real DOM** (which is the browser\'s actual document, slower to manipulate directly).\n\nThe **shadow DOM** is unrelated: a browser feature for **encapsulating** styles and markup inside Web Components.\n\nExample: changing one todo\'s \`done\` flag re-renders the list in memory but React touches only that one \`<li>\`\'s class in the real DOM.` },
    { q: 'What is reconciliation? Explain the diffing algorithm.', level: 'Medium', a: `Reconciliation is React\'s process of comparing the new element tree with the previous one to decide the minimal DOM changes.\n\nHeuristics (O(n) instead of O(n³)):\n1. Different element type → tear down the old subtree (state lost) and build new.\n2. Same DOM type → keep the node, update changed attributes.\n3. Same component type → keep the instance (state preserved), re-render with new props.\n4. Children lists are matched by **key**.\n\nThe work is done by the **Fiber** architecture, which can split rendering into chunks and prioritise urgent updates (typing) over non-urgent ones (transitions).` },
    { q: 'Why are keys important in lists? Can we use index as key?', level: 'Easy', a: `Keys give each list item a stable identity so React can match items across renders: reorder instead of recreate, keep each item\'s state and DOM.\n\nIndex as key is OK only when the list is static (never reordered, filtered or inserted into). Otherwise, inserting at the top makes each index point to a different item, causing wrong state in inputs/checkboxes and extra DOM updates. Never use \`Math.random()\` – it remounts every item every render.\n\n\`\`\`jsx\n{todos.map(t => <TodoItem key={t._id} todo={t} />)}\n\`\`\`` },
    { q: 'What is JSX? Can browsers read JSX?', level: 'Easy', a: `JSX is a syntax extension that lets you write HTML-like markup in JavaScript. Browsers cannot run it directly; a compiler (Babel, esbuild/SWC in Vite) transforms it into function calls:\n\`\`\`jsx\n<h1 className="title">Hi {name}</h1>\n// becomes\njsx('h1', { className: 'title', children: ['Hi ', name] })\n\`\`\`\nRules: one root element (or a Fragment \`<>...</>\`), \`className\` instead of class, \`htmlFor\`, camelCase events, close all tags, \`{}\` for JS expressions (not statements). JSX output is escaped, which protects from XSS.` },
    { q: 'Difference between state and props?', level: 'Easy', a: `- **Props**: inputs passed from parent to child; **read-only** for the child. Like function arguments.\n- **State**: data owned and managed by the component itself; changing it with the setter triggers a re-render. Like a component\'s private memory.\n\nExample: \`<Counter step={2} />\` – \`step\` is a prop; inside Counter, \`const [count, setCount] = useState(0)\` is state. When the parent passes new props, the child re-renders with them. Data flows **down** via props, events flow **up** via callback props.` },
    { q: 'What are the rules of hooks and why do they exist?', level: 'Easy', a: `1. Only call hooks at the **top level** of a component/custom hook – not in conditions, loops or nested functions.\n2. Only call hooks from **function components or custom hooks**.\n\nWhy: React identifies each hook by its **call order** in every render (it keeps an internal list per component). If a hook is skipped conditionally, all following hooks read the wrong state.\n\nWrong: \`if (isLoggedIn) { const [x] = useState() }\`. Right: call useState always, then use the condition in logic/JSX. The eslint-plugin-react-hooks enforces this. React 19\'s \`use()\` is the only API allowed inside conditions.` },
    { q: 'Why does console.log show the old value right after setState?', level: 'Medium', a: `State updates are **scheduled**, not applied immediately, and the variable in the current render is a **snapshot** (a const). React re-renders the component later with the new value.\n\n\`\`\`jsx\nconst [count, setCount] = useState(0);\nfunction handle() {\n  setCount(count + 1);\n  console.log(count); // 0 – still the old snapshot\n}\n\`\`\`\nTo act on the new value, compute it first (\`const next = count + 1; setCount(next); use(next)\`) or use an effect that depends on \`count\`.` },
    { q: 'What is the output: three setCount(count + 1) calls vs three setCount(c => c + 1) calls?', level: 'Medium', a: `\`\`\`jsx\n// count = 0\nsetCount(count + 1); setCount(count + 1); setCount(count + 1); // -> 1\nsetCount(c => c + 1); setCount(c => c + 1); setCount(c => c + 1); // -> 3\n\`\`\`\nIn the first case all three read the same snapshot (0) and set 1. In the second, React queues updater functions and runs each with the result of the previous one. Rule: **use the functional form when the next state depends on the previous state.** Thanks to batching, both cases cause only one re-render.` },
    { q: 'What is automatic batching in React 18+?', level: 'Medium', a: `Batching means grouping multiple state updates into a **single re-render**. Before React 18, only updates inside React event handlers were batched; updates in \`setTimeout\`, promises or native events caused one render each.\n\nSince React 18 (with \`createRoot\`), all updates are batched automatically:\n\`\`\`js\nfetch('/api').then(() => { setLoading(false); setData(d); }); // one render\n\`\`\`\nIf you really need an immediate DOM update you can use \`flushSync\` from react-dom (rare).` },
    { q: 'Explain useEffect and its dependency array cases.', level: 'Easy', a: `\`useEffect\` runs side effects **after render is committed**.\n- \`useEffect(fn)\` – after every render.\n- \`useEffect(fn, [])\` – once after mount (twice in dev StrictMode).\n- \`useEffect(fn, [a, b])\` – after mount and whenever a or b changes (compared with Object.is).\n- The function returned from \`fn\` is the **cleanup**, run before the next effect and on unmount.\n\n\`\`\`jsx\nuseEffect(() => {\n  const onResize = () => setW(window.innerWidth);\n  window.addEventListener('resize', onResize);\n  return () => window.removeEventListener('resize', onResize);\n}, []);\n\`\`\`` },
    { q: 'How do you do componentDidMount, componentDidUpdate and componentWillUnmount with hooks?', level: 'Easy', a: `- **Mount**: \`useEffect(() => { ... }, [])\`\n- **Update** (when specific values change): \`useEffect(() => { ... }, [userId])\`\n- **Unmount**: return a cleanup: \`useEffect(() => () => socket.disconnect(), [])\`\n- **shouldComponentUpdate**: \`React.memo\`\n- **getDerivedStateFromProps**: compute during render, or reset with a \`key\`.\n- **componentDidCatch / error boundaries**: still need a class component (or the react-error-boundary package).\n\nNote: hooks think in "synchronise with these values", not in lifecycle moments.` },
    { q: 'Why does my useEffect cause an infinite loop?', level: 'Medium', a: `Common causes:\n1. The effect sets state that is in its own dependency array: \`useEffect(() => setCount(count + 1), [count])\`.\n2. A dependency is an object/array/function **created during render**, so it is "new" every time: \`const options = { page };\` → \`useEffect(..., [options])\`.\n3. No dependency array while the effect sets state.\n\nFixes: depend on primitive values (\`[page]\`), move the object inside the effect, memoise with \`useMemo\`/\`useCallback\`, use functional updates, or remove the effect if the value can be computed during render.` },
    { q: 'Why does useEffect run twice in development?', level: 'Medium', a: `In development with \`<React.StrictMode>\`, React 18+ intentionally **mounts, unmounts and remounts** each component once to surface effects that do not clean up properly (and double-invokes render functions to detect impure code). It does **not** happen in production builds.\n\nThe correct fix is a proper cleanup (abort fetch, clear interval, unsubscribe) – not removing StrictMode or adding a "has run" ref hack.` },
    { q: 'How do you fetch data in React correctly? What is a race condition here?', level: 'Hard', a: `Basic pattern: loading/error/data state + \`useEffect\` depending on the params + cleanup.\n\`\`\`jsx\nuseEffect(() => {\n  const ctrl = new AbortController();\n  setLoading(true);\n  fetch('/api/products?q=' + q, { signal: ctrl.signal })\n    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })\n    .then(setData)\n    .catch(e => e.name !== 'AbortError' && setError(e.message))\n    .finally(() => setLoading(false));\n  return () => ctrl.abort();\n}, [q]);\n\`\`\`\nRace condition: with fast changes of \`q\`, an older slow response can arrive after a newer one and overwrite it. Aborting (or an \`ignore\` flag) in cleanup prevents it. In production apps I prefer **TanStack Query** which handles caching, dedupe, retries and races.` },
    { q: 'What is the difference between useMemo and useCallback?', level: 'Medium', a: `- \`useMemo(() => compute(a), [a])\` caches the **result** of a function.\n- \`useCallback(fn, [a])\` caches the **function itself** (same reference between renders).\n\n\`\`\`jsx\nconst filtered = useMemo(() => products.filter(p => p.price < max), [products, max]);\nconst handleAdd = useCallback(id => dispatch(addToCart(id)), [dispatch]);\n\`\`\`\nUse useMemo for expensive calculations or for stable objects passed to memo children / effect deps; useCallback for functions passed to \`React.memo\` children or used as effect dependencies. Do not wrap everything – memoisation has its own cost.` },
    { q: 'What is React.memo? When does it NOT help?', level: 'Medium', a: `\`React.memo(Component)\` is a higher-order component that skips re-rendering when the new props are **shallowly equal** to the previous ones.\n\nIt does not help when:\n- you pass new objects/arrays/functions every render (\`style={{}}\`, \`onClick={() => ...}\`) – wrap them in useMemo/useCallback;\n- the component reads a **context** that changed, or its own state changed;\n- the component is cheap anyway (the comparison costs more than the render).\n\nYou can pass a custom compare function: \`memo(Comp, (prev, next) => prev.id === next.id)\`.` },
    { q: 'What is useRef? How is it different from useState?', level: 'Easy', a: `\`useRef(initial)\` returns a mutable object \`{ current }\` that persists for the whole lifetime of the component.\n\nDifferences from useState: changing \`ref.current\` does **not** trigger a re-render, and it is updated synchronously.\n\nUses:\n\`\`\`jsx\nconst inputRef = useRef(null);\n<input ref={inputRef} />\ninputRef.current.focus();          // DOM access\nconst timerId = useRef();          // store interval id\nconst prev = useRef(value);        // previous value\n\`\`\`\nDo not read/write refs during rendering for values that should show on screen – that is what state is for.` },
    { q: 'Controlled vs uncontrolled components?', level: 'Easy', a: `**Controlled**: React state is the single source of truth for the input value.\n\`\`\`jsx\n<input value={email} onChange={e => setEmail(e.target.value)} />\n\`\`\`\nGood for instant validation, conditional disabling, formatting.\n\n**Uncontrolled**: the DOM stores the value; you read it when needed.\n\`\`\`jsx\nconst ref = useRef(); <input ref={ref} defaultValue="" />  // ref.current.value on submit\n\`\`\`\nGood for simple forms, file inputs, integrating non-React code; React Hook Form uses this approach for performance. Common bug: switching from \`value={undefined}\` to a string gives the "uncontrolled to controlled" warning – initialise with \`''\`.` },
    { q: 'What is props drilling and how do you avoid it?', level: 'Easy', a: `Props drilling is passing data through several intermediate components that do not use it, just to reach a deeply nested child (App → Layout → Navbar → Avatar for \`user\`).\n\nSolutions:\n1. **Component composition**: pass components as \`children\`/props so the data is used closer to where it is available.\n2. **Context API** for app-wide data (user, theme, language).\n3. **State libraries** (Redux Toolkit, Zustand) for large/complex shared state.\nDo not reach for Context for every prop – 2 levels of passing is fine and explicit.` },
    { q: 'Context API vs Redux – which one and when?', level: 'Medium', a: `**Context** is a built-in way to pass a value deep in the tree without props drilling. It is ideal for low-frequency updates (theme, auth user, locale). Limitation: all consumers re-render when the value changes; no middleware or devtools; splitting into many contexts gets messy.\n\n**Redux Toolkit**: a central store with slices, actions and reducers; components subscribe to slices with \`useSelector\` (only re-render when their selected data changes); middleware, devtools, RTK Query for API caching. Best for large apps, many developers, complex frequently updated shared state.\n\nMy approach: local state first → lift state → Context for global rarely-changing values → Redux Toolkit/Zustand for complex client state → TanStack Query/RTK Query for server data.` },
    { q: 'Explain the Redux flow with Redux Toolkit.', level: 'Medium', a: `Flow: UI **dispatches an action** → the store runs the **reducer** → reducer returns new state → subscribed components (\`useSelector\`) re-render.\n\n\`\`\`js\nconst cartSlice = createSlice({\n  name: 'cart',\n  initialState: { items: [] },\n  reducers: {\n    addItem(state, action) { state.items.push(action.payload); }, // Immer makes this immutable\n  },\n});\nexport const { addItem } = cartSlice.actions;\nexport const store = configureStore({ reducer: { cart: cartSlice.reducer } });\n// component\nconst items = useSelector(s => s.cart.items);\nconst dispatch = useDispatch();\ndispatch(addItem(product));\n\`\`\`\nAsync logic: \`createAsyncThunk\` (pending/fulfilled/rejected) or RTK Query. Reducers must be pure.` },
    { q: 'What are custom hooks? Give an example.', level: 'Medium', a: `A custom hook is a function whose name starts with \`use\` and that calls other hooks to **reuse stateful logic** (not UI) between components. Each component using it gets its own independent state.\n\`\`\`jsx\nfunction useDebounce(value, delay = 500) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const t = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(t);\n  }, [value, delay]);\n  return debounced;\n}\n// const q = useDebounce(search, 400);\n\`\`\`\nOther examples: \`useFetch\`, \`useLocalStorage\`, \`useAuth\`, \`useOnlineStatus\`.` },
    { q: 'What are Error Boundaries?', level: 'Medium', a: `An error boundary is a component that catches JavaScript errors during **rendering, lifecycle methods and constructors** of its children and shows a fallback UI instead of crashing the whole app.\n\nThey must be **class components** using \`static getDerivedStateFromError\` and/or \`componentDidCatch\` (or use the \`react-error-boundary\` package).\n\nThey do **not** catch errors in event handlers, async code (setTimeout, promises), server-side rendering, or errors thrown in the boundary itself – handle those with try/catch and error state.` },
    { q: 'What are Fragments and Portals?', level: 'Easy', a: `**Fragment** (\`<>...</>\` or \`<React.Fragment key={id}>\`) groups children without adding an extra DOM node – useful for returning multiple elements, table rows, keeping CSS layouts clean.\n\n**Portal** renders children into a different DOM node outside the parent hierarchy, while keeping React context and event bubbling:\n\`\`\`jsx\ncreatePortal(<Modal />, document.getElementById('modal-root'))\n\`\`\`\nUsed for modals, tooltips, toasts – escaping \`overflow:hidden\` and z-index stacking problems.` },
    { q: 'What is lazy loading / code splitting in React?', level: 'Medium', a: `Code splitting breaks the JS bundle into smaller chunks loaded **on demand**, reducing initial load time.\n\`\`\`jsx\nconst AdminDashboard = React.lazy(() => import('./AdminDashboard'));\n<Suspense fallback={<Spinner />}>\n  <AdminDashboard />\n</Suspense>\n\`\`\`\nTypical places: route-level pages, heavy charts/editors, modals. Vite creates a separate chunk for each dynamic \`import()\`. Combine with prefetching on hover for a fast feel.` },
    { q: 'What are useTransition and useDeferredValue?', level: 'Hard', a: `Both are concurrent features that mark updates as **non-urgent** so typing/clicks stay responsive.\n\n\`\`\`jsx\nconst [isPending, startTransition] = useTransition();\nfunction onChange(e) {\n  setQuery(e.target.value);                 // urgent: input updates instantly\n  startTransition(() => setFilter(e.target.value)); // non-urgent: big list can lag\n}\nconst deferredQuery = useDeferredValue(query); // value that "lags behind" during heavy renders\n\`\`\`\nUse \`useTransition\` when you control the state update; \`useDeferredValue\` when you only receive the value (e.g. as a prop). In React 19, transitions can also take async functions (Actions).` },
    { q: 'What is new in React 19?', level: 'Medium', a: `- **Actions**: async functions in transitions; \`<form action={submitFn}>\` handles pending/errors/reset.\n- **useActionState(fn, initial)** → \`[state, formAction, isPending]\`.\n- **useFormStatus()** → pending state of the parent form (for submit buttons).\n- **useOptimistic** → optimistic UI that rolls back on failure.\n- **use()** → read a promise (suspends) or context; can be called conditionally.\n- **ref as a normal prop** for function components (no \`forwardRef\`), ref cleanup functions.\n- \`<Context value>\` directly as provider; \`<title>\`/\`<meta>\` hoisting; better hydration error messages; preloading APIs.\n- Stable **Server Components / Server Actions** (via frameworks like Next.js).\n- The **React Compiler** (separate build tool, stable 2025) auto-memoises.\n\`\`\`jsx\nconst [state, action, pending] = useActionState(async (prev, formData) => {\n  const res = await login(formData.get('email'));\n  return res.error ?? null;\n}, null);\n<form action={action}><input name="email" /><button disabled={pending}>Login</button></form>\n\`\`\`` },
    { q: 'What are React Server Components? How are they different from SSR?', level: 'Hard', a: `**Server Components (RSC)** run only on the server (at build or request time). They can read the database/files directly, send **zero JS** for themselves to the browser, and pass rendered output to **Client Components** (marked \`'use client'\`) that handle interactivity with state and effects.\n\n**SSR** renders the whole app to HTML on the server for a fast first paint, but then all component JS is downloaded and **hydrated** in the browser.\n\nRSC reduces bundle size; SSR improves first paint/SEO; frameworks like Next.js App Router use both together. A plain Vite React (CSR) app does not use RSC.` },
    { q: 'How do you optimise a slow React application?', level: 'Hard', a: `1. **Measure** first: React DevTools Profiler, Lighthouse, "why did you render".\n2. Avoid unnecessary re-renders: keep state local, split contexts, \`React.memo\` + \`useCallback\`/\`useMemo\` where profiling shows a problem (or enable React Compiler).\n3. **Virtualise** long lists (react-window / TanStack Virtual).\n4. **Code split** routes and heavy components with \`React.lazy\`.\n5. Debounce search inputs, use \`useTransition\` for heavy updates.\n6. Optimise assets: compressed images (WebP/AVIF), lazy images, tree-shaking, analyse bundle size.\n7. Cache server data with TanStack Query; paginate APIs.\n8. Use stable keys, avoid inline object creation in hot paths, avoid derived state in effects.` },
  ],
  practice: [
    {
      task: 'Build a `useLocalStorage(key, initialValue)` custom hook that works like useState but persists to localStorage. Use it for a theme toggle.',
      hint: 'Lazy initial state reads localStorage once; an effect writes whenever the value changes. Wrap JSON.parse in try/catch.',
      solution: `const { useState, useEffect } = React;

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const dark = theme === 'dark';
  return (
    <div style={{ background: dark ? '#111' : '#fff', color: dark ? '#fff' : '#111', padding: 24, minHeight: 150 }}>
      <p>Current theme: {theme} (reload the page: it is remembered)</p>
      <button onClick={() => setTheme(dark ? 'light' : 'dark')}>Toggle theme</button>
    </div>
  );
}`,
    },
    {
      task: 'Create an AuthContext with login/logout and a `useAuth()` hook. Show "Welcome, <name>" and a Logout button when logged in, and a Login button otherwise.',
      hint: 'createContext(null), a Provider component holding user state, and a hook that throws if used outside the provider.',
      solution: `const { createContext, useContext, useState, useMemo } = React;

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({
    user,
    login: (name) => setUser({ name }),
    logout: () => setUser(null),
  }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

function Navbar() {
  const { user, login, logout } = useAuth();
  return user
    ? <p>Welcome, {user.name} <button onClick={logout}>Logout</button></p>
    : <button onClick={() => login('Priya')}>Login</button>;
}

function App() {
  return <AuthProvider><Navbar /></AuthProvider>;
}
// In React 19 you can write <AuthContext value={value}> instead of <AuthContext.Provider value={value}>.`,
    },
    {
      task: 'Write a counter using useReducer with actions increment, decrement (never below 0), reset, and incrementBy(amount).',
      hint: 'A pure reducer with a switch on action.type; return new objects.',
      solution: `const { useReducer } = React;

function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: Math.max(0, state.count - 1) };
    case 'incrementBy': return { count: state.count + action.amount };
    case 'reset': return { count: 0 };
    default: throw new Error('Unknown action ' + action.type);
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <div style={{ padding: 16 }}>
      <h2>{state.count}</h2>
      <button onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      <button onClick={() => dispatch({ type: 'increment' })}>+1</button>
      <button onClick={() => dispatch({ type: 'incrementBy', amount: 5 })}>+5</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}`,
    },
    {
      task: 'Build a controlled signup form (name, email, password) with validation on submit: all required, email must contain @ and a dot, password at least 8 chars. Show errors under each field and a success message.',
      hint: 'One state object for values and one for errors; a validate() function returning an errors object.',
      solution: `const { useState } = React;

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = 'Name is required';
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v.email)) e.email = 'Enter a valid email';
  if (v.password.length < 8) e.password = 'Password must be at least 8 characters';
  return e;
}

function App() {
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const onChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });
  const onSubmit = (e) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    setDone(Object.keys(errs).length === 0);
  };

  return (
    <form onSubmit={onSubmit} noValidate style={{ display: 'grid', gap: 8, maxWidth: 300, padding: 16 }}>
      {['name', 'email', 'password'].map((f) => (
        <label key={f}>
          {f}<br />
          <input name={f} type={f === 'password' ? 'password' : 'text'} value={values[f]} onChange={onChange} />
          {errors[f] && <small style={{ color: 'crimson', display: 'block' }}>{errors[f]}</small>}
        </label>
      ))}
      <button>Sign up</button>
      {done && <p style={{ color: 'green' }}>Account created for {values.name}!</p>}
    </form>
  );
}`,
    },
    {
      task: 'Fix this buggy component and explain each bug:\n```jsx\nfunction Search({ query }) {\n  const [results, setResults] = useState([]);\n  useEffect(async () => {\n    const res = await fetch("/api/search?q=" + query);\n    setResults(await res.json());\n  });\n  return results.map((r, i) => <li key={Math.random()}>{r.title}</li>);\n}\n```',
      hint: 'Look at: the async effect function, the missing dependency array, race conditions, and the key.',
      solution: `function Search({ query }) {
  const [results, setResults] = React.useState([]);

  React.useEffect(() => {                 // 1. effect callback must not be async (it would return a promise, not a cleanup)
    let ignore = false;                   // 3. guard against race conditions
    async function load() {
      const res = await fetch('/api/search?q=' + encodeURIComponent(query));
      const data = await res.json();
      if (!ignore) setResults(data);
    }
    load();
    return () => { ignore = true; };
  }, [query]);                            // 2. without deps it refetched after EVERY render -> infinite loop (setResults causes re-render)

  return <ul>{results.map((r) => <li key={r.id}>{r.title}</li>)}</ul>;  // 4. stable key, not Math.random(); wrap <li> in <ul>
}`,
    },
  ],
  quiz: [
    {
      question: 'count is 0. A click handler calls setCount(count + 1) three times. What is count after the re-render?',
      options: ['3', '1', '0', 'It throws an error'],
      answer: 1,
      explanation: 'All three calls read the same snapshot value 0, so they all set 1. Use setCount(c => c + 1) to get 3.',
    },
    {
      question: 'Which is the BEST key for a list of todos fetched from MongoDB?',
      options: ['The array index', 'Math.random()', 'todo._id', 'todo.title'],
      answer: 2,
      explanation: 'The database id is stable and unique. Index breaks on reorder/insert, random keys remount every render, titles may repeat.',
    },
    {
      question: 'When does the cleanup function returned from useEffect run?',
      options: ['Before the effect runs again and when the component unmounts', 'Only once, when the app starts', 'Before every render starts', 'Never in production'],
      answer: 0,
      explanation: 'React calls the cleanup before re-running the effect (when deps change) and on unmount.',
    },
    {
      question: 'A child is wrapped in React.memo but still re-renders every time the parent renders. The most likely cause is:',
      options: ['React.memo only works with class components', 'The child uses useState', 'The child has a key prop', 'The parent passes a new inline function or object as a prop each render'],
      answer: 3,
      explanation: 'memo does a shallow props comparison; a new function/object reference each render makes props "different". Use useCallback/useMemo.',
    },
    {
      question: 'Which React 19 hook returns [state, formAction, isPending] for handling form submissions?',
      options: ['useFormStatus', 'useOptimistic', 'useActionState', 'useTransition'],
      answer: 2,
      explanation: 'useActionState(fn, initialState) returns the latest action result, a wrapped action for <form action>, and a pending flag.',
    },
  ],
};
