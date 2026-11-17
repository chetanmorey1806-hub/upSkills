export default {
  id: 'day-18-usememo-usecallback-memo',
  title: 'Performance Hooks: useMemo, useCallback and React.memo',
  module: 'Module 3: Hooks',
  day: 18,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Understand why React components re-render and how to skip unnecessary work with useMemo (cache a calculated value), useCallback (cache a function) and React.memo (skip re-rendering a component when its props did not change). Learn when these tools help and when they are just noise.',
  objectives: [
    'Explain when and why a React component re-renders',
    'Cache expensive calculations with useMemo',
    'Keep function references stable with useCallback',
    'Skip child re-renders with React.memo and understand shallow comparison',
    'Decide when memoization is worth it and avoid premature optimization',
  ],
  theory: [
    {
      heading: 'Why components re-render',
      content:
        'A component re-renders when:\n1. Its own **state** changes\n2. Its **parent re-renders** (by default every child re-renders too, even if its props are the same)\n3. A **context** it reads changes\n\nRe-rendering means React calls your function again. That is usually fast. It only becomes a problem when a component does **expensive work** during render (filtering 50,000 rows) or when a big subtree re-renders many times per second (typing in an input).\n\nImportant: re-render is not the same as updating the real DOM. React compares the result and only touches the DOM where something actually changed.',
      tip: 'Measure first. Use the React DevTools Profiler ("Highlight updates when components render") to see what actually re-renders before adding memoization everywhere.',
    },
    {
      heading: 'useMemo: remember a calculated value',
      content:
        '`useMemo(calculate, deps)` runs `calculate` on the first render and stores the result. On later renders it returns the **stored result** unless one of the `deps` changed.\n\nAnalogy: a student who solved a long maths problem writes the answer on a sticky note. Next time the same question comes, they read the note instead of solving again. Only if the numbers in the question change do they recalculate.\n\nUse it for:\n- Expensive calculations (sorting/filtering large lists, heavy maths)\n- Keeping an object or array **reference stable** so a memoized child or an effect does not see a "new" value every render',
      syntax:
        "const visibleTodos = React.useMemo(\n  () => todos.filter(t => t.text.includes(query)),\n  [todos, query]   // recalculate only when these change\n);",
    },
    {
      heading: 'useCallback: remember a function',
      content:
        'In JavaScript, a function defined inside a component is a **new function object on every render**. `() => {}` !== `() => {}`.\n\n`useCallback(fn, deps)` returns the **same function reference** between renders until a dependency changes. It is exactly `useMemo(() => fn, deps)`.\n\nuseCallback on its own does **nothing for speed**. It only helps when the function is:\n- Passed to a child wrapped in `React.memo`\n- Used as a dependency of `useEffect`, `useMemo` or another hook',
      syntax:
        "const handleDelete = React.useCallback(id => {\n  setItems(prev => prev.filter(i => i.id !== id));\n}, []);   // stable forever: uses functional update, no outside values",
      tip: 'Use the functional update form (setItems(prev => ...)) inside callbacks so you can keep the dependency list short and avoid stale values.',
    },
    {
      heading: 'React.memo: skip re-rendering a child',
      content:
        '`React.memo(Component)` returns a memoized version of a component. When its parent re-renders, React compares the **new props with the old props** using a **shallow comparison** (`Object.is` for each prop). If all props are equal, React **reuses the previous result** and skips calling the component.\n\nShallow comparison means:\n- Numbers, strings and booleans compare by value: `5 === 5`\n- Objects, arrays and functions compare by **reference**: `{}` !== `{}`\n\nThat is why React.memo, useMemo and useCallback are a **team**: React.memo only works if the parent passes stable object/function props, which is what useMemo and useCallback provide.',
      syntax:
        "const Row = React.memo(function Row({ item, onDelete }) {\n  return <li>{item.name} <button onClick={() => onDelete(item.id)}>x</button></li>;\n});",
    },
    {
      heading: 'Common mistakes',
      content:
        '- **Memoizing everything**: every useMemo/useCallback costs memory and a dependency comparison. For cheap work it can make code slower and harder to read.\n- **Wrong dependencies**: leaving a value out of the dependency array gives you a **stale** value (the cached result uses old data). Turn on the `react-hooks/exhaustive-deps` ESLint rule.\n- **Inline objects to memo children**: `<Chart options={{ color: \'red\' }} />` creates a new object every render, so memo never helps. Move constants outside the component or use useMemo.\n- **Thinking useMemo is a guarantee**: React may throw away cached values in the future (e.g. offscreen). Your code must still be correct without it; memoization is a performance hint.',
    },
    {
      heading: 'A simple decision checklist',
      content:
        'Ask these questions in order:\n1. Is there a real, measurable slowness? If not, do nothing.\n2. Can I fix it by **moving state down** (keeping fast-changing state in a small component) or **lifting content up** (passing children)? This is often better than memo.\n3. Is a calculation expensive? Use **useMemo**.\n4. Is a child expensive and re-rendering with the same props? Wrap it in **React.memo**, then stabilise object props with useMemo and function props with useCallback.\n\nNote: the new React Compiler (React 19 era) can add this memoization automatically, but understanding these hooks is still expected in interviews and existing code.\n\nComing next: Day 19 teaches custom hooks, so you can package reusable stateful logic.',
    },
  ],
  examples: [
    {
      title: 'useMemo for an expensive filter',
      scenario: 'A list of 20,000 numbers is filtered by a search term. An unrelated counter also causes re-renders. Without useMemo the filter would run on every click.',
      steps: [
        'Generate a large array once outside the component',
        'Keep query and an unrelated count in state',
        'Wrap the filtering in useMemo with [query] as the dependency',
        'Increase a counter variable each time the filter actually runs',
        'Run, click "Unrelated +1" many times and watch "filter ran" stay the same; then type in the box',
      ],
      code: `const filtered = React.useMemo(() => {
  filterRuns.current += 1;
  return NUMBERS.filter(n => String(n).includes(query));
}, [query]);`,
      playground: {
        jsx: `const { useState, useMemo, useRef } = React;
const NUMBERS = Array.from({ length: 20000 }, (_, i) => i + 1);

function App() {
  const [query, setQuery] = useState('');
  const [count, setCount] = useState(0);
  const filterRuns = useRef(0);

  const filtered = useMemo(() => {
    filterRuns.current += 1;
    return NUMBERS.filter(n => String(n).includes(query));
  }, [query]);

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search numbers e.g. 777" />
      <button onClick={() => setCount(c => c + 1)}>Unrelated +1 ({count})</button>
      <p>Matches: {filtered.length} | filter ran {filterRuns.current} time(s)</p>
      <p>First 10: {filtered.slice(0, 10).join(', ')}</p>
    </div>
  );
}`,
      },
      result: 'Clicking "Unrelated +1" increases the count but "filter ran" does not increase. Typing in the input changes the matches and increases "filter ran" by one per keystroke.',
      explanation:
        'useMemo returns the cached array while query is unchanged. Only when query changes does React call the filter function again. The useRef counter is just for demonstration: it lets us count calls without causing extra renders.',
    },
    {
      title: 'React.memo + useCallback for a list of rows',
      scenario: 'A parent has a text input (changes on every key) and a list of rows. Each Row logs when it renders. See how stable callbacks let React.memo skip the rows.',
      steps: [
        'Wrap Row in React.memo',
        'Create handleRemove with useCallback and a functional state update',
        'Add a note input in the parent that re-renders it on every keystroke',
        'Count renders of each Row with a render counter shown on screen',
        'Run, type in the note box and watch the row render counts stay the same',
      ],
      code: `const Row = React.memo(function Row({ item, onRemove }) {
  return <li>{item.name} <button onClick={() => onRemove(item.id)}>Remove</button></li>;
});

const handleRemove = React.useCallback(id => {
  setItems(prev => prev.filter(i => i.id !== id));
}, []);`,
      playground: {
        jsx: `const { useState, useCallback, memo } = React;
const renderCounts = {};

const Row = memo(function Row({ item, onRemove }) {
  renderCounts[item.id] = (renderCounts[item.id] || 0) + 1;
  return (
    <li>
      {item.name} <small>(rendered {renderCounts[item.id]}x)</small>{' '}
      <button onClick={() => onRemove(item.id)}>Remove</button>
    </li>
  );
});

function App() {
  const [items, setItems] = useState([
    { id: 1, name: 'Rahul' }, { id: 2, name: 'Sneha' }, { id: 3, name: 'Imran' },
  ]);
  const [note, setNote] = useState('');

  const handleRemove = useCallback(id => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Type here to re-render parent" />
      <p>Note: {note}</p>
      <ul>{items.map(item => <Row key={item.id} item={item} onRemove={handleRemove} />)}</ul>
    </div>
  );
}`,
      },
      result: 'Typing in the input re-renders App, but each row keeps showing "rendered 1x" (or 2x in Strict Mode dev). Removing a row only affects the list.',
      explanation:
        'Row is memoized, its item prop is the same object reference, and onRemove is the same function thanks to useCallback. Shallow comparison finds equal props, so React skips the rows. Remove useCallback and every keystroke would re-render every Row.',
    },
    {
      title: 'Why React.memo fails with inline objects',
      scenario: 'Compare two memoized children: one receives an inline style object (new every render), the other receives a memoized object.',
      steps: [
        'Create a memoized Badge component that counts its renders',
        'Render one Badge with style={{ color: "teal" }} written inline',
        'Render another Badge with a style created by useMemo',
        'Run and click the "Re-render parent" button',
      ],
      code: `<Badge label="inline" style={{ color: 'teal' }} />       // new object every render -> re-renders
const stable = React.useMemo(() => ({ color: 'teal' }), []);
<Badge label="memoized" style={stable} />               // same reference -> skipped`,
      playground: {
        jsx: `const counts = { inline: 0, memoized: 0 };

const Badge = React.memo(function Badge({ label, style }) {
  counts[label] += 1;
  return <p style={style}>{label} badge rendered {counts[label]} time(s)</p>;
});

function App() {
  const [tick, setTick] = React.useState(0);
  const stableStyle = React.useMemo(() => ({ color: 'teal' }), []);
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <button onClick={() => setTick(t => t + 1)}>Re-render parent ({tick})</button>
      <Badge label="inline" style={{ color: 'teal' }} />
      <Badge label="memoized" style={stableStyle} />
    </div>
  );
}`,
      },
      result: 'Each click increases the "inline" badge render count, while the "memoized" badge count stays the same.',
      explanation:
        'React.memo compares props with Object.is. An inline object literal is a brand-new object on each render, so the comparison fails. useMemo keeps the same object, so the comparison passes and rendering is skipped.',
    },
  ],
  interview: [
    { q: 'What does useMemo do?', a: 'It caches the result of a calculation between renders: const value = useMemo(() => compute(a, b), [a, b]). The function re-runs only when a dependency changes.', level: 'Easy' },
    { q: 'What does useCallback do?', a: 'It caches a function definition between renders: const fn = useCallback(() => {...}, deps). It returns the same function reference until a dependency changes. It equals useMemo(() => fn, deps).', level: 'Easy' },
    { q: 'What is React.memo?', a: 'A higher-order component that memoizes a component. When the parent re-renders, React shallowly compares the new and old props and skips re-rendering the component if they are equal.', level: 'Easy' },
    { q: 'Difference between useMemo and React.memo?', a: 'useMemo is a hook used inside a component to cache a value. React.memo wraps a whole component to skip re-renders when props are unchanged.', level: 'Medium' },
    { q: 'Why does useCallback alone not improve performance?', a: 'Creating a function is cheap. The benefit only appears when the stable reference is consumed by something that compares it: a React.memo child, or a hook dependency array.', level: 'Medium' },
    { q: 'What is shallow comparison?', a: 'Comparing each top-level prop with Object.is. Primitives compare by value; objects, arrays and functions compare by reference, so a new object with the same content is considered different.', level: 'Medium' },
    { q: 'What happens if you leave a dependency out of useMemo?', a: 'The cached value will not update when that value changes, producing stale and incorrect results. The exhaustive-deps lint rule helps prevent it.', level: 'Medium' },
    { q: 'Should you wrap every component in React.memo?', a: 'No. Memoization has a cost (prop comparison, memory) and complicates code. Apply it where profiling shows unnecessary expensive re-renders.', level: 'Medium' },
    { q: 'Can React.memo take a custom comparison function?', a: 'Yes: React.memo(Component, (prevProps, nextProps) => boolean). Return true if the props are equal (skip render). Use carefully; a wrong comparison causes stale UI.', level: 'Hard' },
    { q: 'Does React.memo prevent re-renders caused by context or internal state?', a: 'No. A memoized component still re-renders when its own state changes or when a context it consumes changes. memo only skips renders caused by the parent with equal props.', level: 'Hard' },
    { q: 'Name alternatives to memoization for fixing slow renders.', a: 'Move state down into a smaller component, pass expensive subtrees as children (lifting content up), virtualize long lists, debounce input, or split contexts.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a component that computes the factorial-like sum 1+2+...+n for n up to 5,000,000 using useMemo, and has a separate theme toggle that should not recompute the sum.',
      hint: 'Dependencies: [n] only.',
      solution: `function App() {
  const [n, setN] = React.useState(1000000);
  const [dark, setDark] = React.useState(false);
  const total = React.useMemo(() => {
    let s = 0;
    for (let i = 1; i <= n; i++) s += i;
    return s;
  }, [n]);
  return (
    <div style={{ background: dark ? '#222' : '#fff', color: dark ? '#fff' : '#000', padding: 16 }}>
      <input type="number" value={n} max={5000000} onChange={e => setN(Number(e.target.value))} />
      <p>Sum 1..n = {total}</p>
      <button onClick={() => setDark(d => !d)}>Toggle theme</button>
    </div>
  );
}`,
    },
    {
      task: 'Build a memoized TodoItem list where toggling one item does not re-render the other items. Use React.memo and useCallback.',
      hint: 'Toggle with setTodos(prev => prev.map(...)) so only the changed item gets a new object reference.',
      solution: `const TodoItem = React.memo(function TodoItem({ todo, onToggle }) {
  console.log('render', todo.text);
  return (
    <li onClick={() => onToggle(todo.id)} style={{ textDecoration: todo.done ? 'line-through' : 'none', cursor: 'pointer' }}>
      {todo.text}
    </li>
  );
});

function App() {
  const [todos, setTodos] = React.useState([
    { id: 1, text: 'Learn useMemo', done: false },
    { id: 2, text: 'Learn useCallback', done: false },
    { id: 3, text: 'Learn React.memo', done: false },
  ]);
  const onToggle = React.useCallback(id => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);
  return <ul>{todos.map(t => <TodoItem key={t.id} todo={t} onToggle={onToggle} />)}</ul>;
}`,
    },
    {
      task: 'Sort a product list by price ascending/descending with useMemo, and also show a live clock-like counter updated by a button that must not trigger re-sorting.',
      hint: 'Copy the array before sorting: [...products].sort(...) because sort mutates.',
      solution: `const PRODUCTS = [
  { id: 1, name: 'Phone', price: 15000 },
  { id: 2, name: 'Laptop', price: 55000 },
  { id: 3, name: 'Earbuds', price: 2500 },
];

function App() {
  const [asc, setAsc] = React.useState(true);
  const [clicks, setClicks] = React.useState(0);
  const sorted = React.useMemo(() => {
    console.log('sorting...');
    return [...PRODUCTS].sort((a, b) => (asc ? a.price - b.price : b.price - a.price));
  }, [asc]);
  return (
    <div>
      <button onClick={() => setAsc(a => !a)}>Sort {asc ? 'desc' : 'asc'}</button>
      <button onClick={() => setClicks(c => c + 1)}>Clicks: {clicks}</button>
      <ul>{sorted.map(p => <li key={p.id}>{p.name}: Rs {p.price}</li>)}</ul>
    </div>
  );
}`,
    },
    {
      task: 'Refactor this slow pattern without any memo hooks: an App has a fast-changing input and a SlowChart component that re-renders on every keystroke. Use "move state down".',
      hint: 'Extract the input and its state into its own SearchBox component.',
      solution: `function SlowChart() {
  const start = performance.now();
  while (performance.now() - start < 30) {} // pretend to be slow
  return <div>Big chart</div>;
}

function SearchBox() {
  const [text, setText] = React.useState('');
  return <input value={text} onChange={e => setText(e.target.value)} placeholder="Type fast" />;
}

function App() {
  // App no longer holds the text state, so typing does not re-render SlowChart
  return (
    <div>
      <SearchBox />
      <SlowChart />
    </div>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'Which hook caches the RESULT of a calculation?',
      options: ['useCallback', 'useRef', 'useMemo', 'useEffect'],
      answer: 2,
      explanation: 'useMemo stores the returned value; useCallback stores a function.',
    },
    {
      question: 'React.memo compares props using…',
      options: ['A shallow comparison with Object.is per prop', 'A deep JSON comparison', 'Only the key prop', 'String conversion of props'],
      answer: 0,
      explanation: 'By default React.memo shallowly compares each prop with Object.is.',
    },
    {
      question: 'Why would a React.memo child still re-render on every parent render?',
      options: ['Because memo is disabled in development', 'Because it is passed a new inline object or function each render', 'Because it has a key prop', 'Because it uses JSX'],
      answer: 1,
      explanation: 'New references for objects/functions make the shallow comparison fail.',
    },
    {
      question: 'useCallback(fn, deps) is equivalent to…',
      options: ['useEffect(fn, deps)', 'useRef(fn)', 'React.memo(fn)', 'useMemo(() => fn, deps)'],
      answer: 3,
      explanation: 'useCallback is shorthand for memoizing a function value with useMemo.',
    },
    {
      question: 'What should you do before adding memoization?',
      options: ['Wrap all components in memo', 'Measure with the Profiler to find real bottlenecks', 'Convert to class components', 'Remove all state'],
      answer: 1,
      explanation: 'Optimize only measurable problems; premature memoization adds complexity.',
    },
  ],
};
