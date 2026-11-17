export default {
  id: 'day-19-custom-hooks',
  title: 'Custom Hooks: Reusing Stateful Logic (useToggle, useLocalStorage, useFetch, useDebounce)',
  module: 'Module 3: Hooks',
  day: 19,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'A custom hook is a normal JavaScript function whose name starts with "use" and that calls other hooks. It lets you pull repeated stateful logic (toggles, form fields, fetching, local storage, window size) out of components and reuse it everywhere.',
  objectives: [
    'Explain what a custom hook is and why it exists',
    'Follow the Rules of Hooks and the "use" naming convention',
    'Build useToggle, useLocalStorage, useFetch, useDebounce and useWindowWidth',
    'Understand that each call to a custom hook gets its own independent state',
    'Design clean hook APIs (return arrays vs objects)',
  ],
  theory: [
    {
      heading: 'What is a custom hook?',
      content:
        'When two components need the **same stateful behaviour** (for example "fetch data with loading and error", or "remember a value in localStorage"), you could copy-paste the useState + useEffect code. A **custom hook** lets you write that logic once in a function and call it from any component.\n\nA custom hook is just a function that:\n- Has a name starting with `use` (useToggle, useFetch)\n- Calls one or more React hooks inside (useState, useEffect, useContext, other custom hooks)\n- Returns whatever the component needs (a value, a setter, an object)\n\nAnalogy: a custom hook is like a recipe card. Every cook (component) who follows it cooks their **own** dish with their own ingredients; they do not share one plate.',
      syntax:
        "function useToggle(initial = false) {\n  const [on, setOn] = React.useState(initial);\n  const toggle = () => setOn(v => !v);\n  return [on, toggle];\n}\n\n// usage\nconst [isOpen, toggleOpen] = useToggle();",
    },
    {
      heading: 'Rules of Hooks (apply to custom hooks too)',
      content:
        '1. **Only call hooks at the top level**: never inside loops, conditions or nested functions. React relies on the call order to match each hook with its stored state.\n2. **Only call hooks from React functions**: function components or other custom hooks, not plain utility functions or class components.\n3. **Name custom hooks with `use`**: this tells React and the ESLint plugin to check the rules inside it.\n\nIf a function does not call any hooks, it should NOT start with `use`; it is just a normal helper (e.g. `formatPrice`).',
      tip: 'Install eslint-plugin-react-hooks. It catches rule violations and missing effect dependencies automatically (Vite templates include it).',
    },
    {
      heading: 'Each call has its own state',
      content:
        'Custom hooks share **logic**, not **state**. If two components (or the same component twice) call `useToggle()`, each gets its own independent `on` value.\n\nIf you want components to **share the same state**, you still need lifting state up or Context. A custom hook can wrap that too: `useAuth()` that calls `useContext(AuthContext)` gives shared state through a nice API (as seen on Day 16).',
    },
    {
      heading: 'Common useful hooks',
      content:
        '- **useToggle**: boolean on/off (modals, dropdowns)\n- **useInput / useForm**: value + onChange for form fields\n- **useLocalStorage(key, initial)**: like useState but saved in localStorage\n- **useFetch(url)**: returns { data, loading, error } and cancels with AbortController\n- **useDebounce(value, delay)**: returns the value only after the user stops typing\n- **useWindowWidth()**: listens to resize and returns the current width\n- **usePrevious(value)**: remembers the value from the previous render with useRef\n\nMany of these exist in libraries (react-use, usehooks-ts), but writing them yourself is a classic interview task.',
    },
    {
      heading: 'Designing the return value',
      content:
        'Two common styles:\n- **Array** `[value, setter]` like useState: easy to rename at the call site (`const [isMenuOpen, toggleMenu] = useToggle()`). Good for 2 items.\n- **Object** `{ data, loading, error, refetch }`: self-documenting and order-independent. Good for 3+ items.\n\nAlso:\n- Accept options as parameters (`useFetch(url, { immediate: true })`)\n- Clean up everything you start (listeners, timers, requests) inside useEffect cleanup\n- Keep hooks focused: one hook, one job',
      tip: 'Do not put JSX in custom hooks. A hook returns data and functions; components return UI. If you want to reuse UI, make a component.',
    },
    {
      heading: 'Testing and composing hooks',
      content:
        'Custom hooks can call other custom hooks. For example `useSearch` can call `useDebounce` and `useFetch`. This lets you build powerful behaviour from small, tested pieces.\n\nHooks can be tested with React Testing Library\'s `renderHook` (Day 27).\n\nComing next: Day 20 starts Module 4 with React Router.',
    },
  ],
  examples: [
    {
      title: 'useToggle used by two independent components',
      scenario: 'Two FAQ items each use useToggle to show or hide their answer. Opening one does not open the other.',
      steps: [
        'Write useToggle(initial) that returns [on, toggle]',
        'Create an FaqItem component that calls useToggle()',
        'Render two FaqItem components',
        'Run and click each question',
      ],
      code: `function useToggle(initial = false) {
  const [on, setOn] = React.useState(initial);
  const toggle = React.useCallback(() => setOn(v => !v), []);
  return [on, toggle];
}`,
      playground: {
        jsx: `function useToggle(initial = false) {
  const [on, setOn] = React.useState(initial);
  const toggle = React.useCallback(() => setOn(v => !v), []);
  return [on, toggle];
}

function FaqItem({ question, answer }) {
  const [open, toggle] = useToggle();
  return (
    <div style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
      <button onClick={toggle} style={{ width: '100%', textAlign: 'left' }}>
        {open ? '-' : '+'} {question}
      </button>
      {open && <p>{answer}</p>}
    </div>
  );
}

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 400 }}>
      <FaqItem question="What is a custom hook?" answer="A function starting with use that calls other hooks." />
      <FaqItem question="Do hooks share state?" answer="No, each call gets its own state." />
    </div>
  );
}`,
      },
      result: 'Two collapsible FAQ questions. Each opens and closes independently.',
      explanation:
        'Both FaqItems call useToggle, but React stores separate state for each component instance. The hook shares the logic only.',
    },
    {
      title: 'useLocalStorage: state that survives a refresh',
      scenario: 'A name input whose value is saved to localStorage and restored when the page reloads.',
      steps: [
        'Write useLocalStorage(key, initialValue) using lazy useState initialization',
        'Read the saved JSON in the initializer, inside try/catch',
        'Save to localStorage in a useEffect whenever the value changes',
        'Use it exactly like useState in the component',
        'Run, type a name, then click Run again: the name is restored (if storage is allowed in the sandbox)',
      ],
      code: `function useLocalStorage(key, initialValue) {
  const [value, setValue] = React.useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });
  React.useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}`,
      playground: {
        jsx: `function useLocalStorage(key, initialValue) {
  const [value, setValue] = React.useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });
  React.useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked */ }
  }, [key, value]);
  return [value, setValue];
}

function App() {
  const [name, setName] = useLocalStorage('day19-name', '');
  const [visits, setVisits] = useLocalStorage('day19-visits', 0);
  React.useEffect(() => { setVisits(v => v + 1); }, []);
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
      <p>Hello {name || 'stranger'}!</p>
      <p>This demo has been loaded {visits} time(s) in this browser.</p>
    </div>
  );
}`,
      },
      result: 'Typing a name updates the greeting. Re-running the playground restores the name and increases the visit counter (when the sandbox allows localStorage).',
      explanation:
        'The lazy initializer reads storage only on the first render. The effect writes after every change. try/catch protects against private mode or blocked storage. The component uses it exactly like useState.',
    },
    {
      title: 'useFetch with loading, error and AbortController',
      scenario: 'Load a user from JSONPlaceholder by id. Changing the id quickly cancels the previous request.',
      steps: [
        'Write useFetch(url) that returns { data, loading, error }',
        'Create an AbortController inside useEffect and abort it in the cleanup',
        'Ignore AbortError when setting the error state',
        'Use the hook in App with a number input for the user id',
        'Run and change the id between 1 and 10',
      ],
      code: `function useFetch(url) {
  const [state, setState] = React.useState({ data: null, loading: true, error: null });
  React.useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    fetch(url, { signal: controller.signal })
      .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(data => setState({ data, loading: false, error: null }))
      .catch(err => { if (err.name !== 'AbortError') setState({ data: null, loading: false, error: err.message }); });
    return () => controller.abort();
  }, [url]);
  return state;
}`,
      playground: {
        jsx: `function useFetch(url) {
  const [state, setState] = React.useState({ data: null, loading: true, error: null });
  React.useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    fetch(url, { signal: controller.signal })
      .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(data => setState({ data, loading: false, error: null }))
      .catch(err => {
        if (err.name !== 'AbortError') setState({ data: null, loading: false, error: err.message });
      });
    return () => controller.abort();
  }, [url]);
  return state;
}

function App() {
  const [id, setId] = React.useState(1);
  const { data, loading, error } = useFetch('https://jsonplaceholder.typicode.com/users/' + id);
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <label>User id: <input type="number" min="1" max="12" value={id} onChange={e => setId(Number(e.target.value))} /></label>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {data && (
        <div>
          <h3>{data.name}</h3>
          <p>{data.email} | {data.address.city}</p>
        </div>
      )}
    </div>
  );
}`,
      },
      result: 'Shows "Loading..." then the user name, email and city. Ids 11 or 12 show "Error: HTTP 404".',
      explanation:
        'All fetching logic lives in the hook, so the component is short. When url changes, the cleanup aborts the old request so a slow old response can never overwrite newer data.',
    },
    {
      title: 'useDebounce + useWindowWidth composed in one component',
      scenario: 'A search box shows the "debounced" value 500 ms after typing stops, and the component also shows the live window width.',
      steps: [
        'Write useDebounce(value, delay) with setTimeout and cleanup',
        'Write useWindowWidth() that listens to the resize event and removes the listener on cleanup',
        'Use both hooks in App',
        'Run, type quickly and watch the debounced value update only after you pause; resize the preview to see the width change',
      ],
      code: `function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}`,
      playground: {
        jsx: `function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function useWindowWidth() {
  const [width, setWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  React.useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}

function App() {
  const [text, setText] = React.useState('');
  const debounced = useDebounce(text, 500);
  const width = useWindowWidth();
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Type fast..." />
      <p>Live value: {text}</p>
      <p>Debounced value (send this to the API): <b>{debounced}</b></p>
      <p>Window width: {width}px ({width < 600 ? 'mobile' : 'desktop'} layout)</p>
    </div>
  );
}`,
      },
      result: 'The live value updates instantly; the debounced value catches up half a second after you stop typing. The width updates when the preview is resized.',
      explanation:
        'Each keystroke restarts the timer because the effect cleanup clears the previous timeout. useWindowWidth adds one resize listener and removes it on unmount, preventing memory leaks.',
    },
  ],
  interview: [
    { q: 'What is a custom hook?', a: 'A JavaScript function whose name starts with "use" and that calls other hooks. It extracts reusable stateful logic from components.', level: 'Easy' },
    { q: 'Why must custom hook names start with "use"?', a: 'It is a convention React tooling relies on: the linter applies the Rules of Hooks to functions starting with "use", and readers instantly know the function may hold state or effects.', level: 'Easy' },
    { q: 'Do two components using the same custom hook share state?', a: 'No. Each call has its own isolated state. To share state you need lifting state up, Context, or an external store.', level: 'Medium' },
    { q: 'What are the Rules of Hooks?', a: 'Call hooks only at the top level (not in loops, conditions or nested functions) and only from React function components or custom hooks.', level: 'Easy' },
    { q: 'Why can hooks not be called conditionally?', a: 'React identifies each hook by its call order on every render. A condition could skip a hook and shift the order, so state would be matched to the wrong hook.', level: 'Medium' },
    { q: 'Write a usePrevious hook.', a: 'function usePrevious(value) {\n  const ref = React.useRef();\n  React.useEffect(() => { ref.current = value; }, [value]);\n  return ref.current;\n}\nIt returns the value from the previous render because the effect updates the ref after rendering.', level: 'Hard' },
    { q: 'Write a useDebounce hook.', a: 'function useDebounce(value, delay) {\n  const [v, setV] = React.useState(value);\n  React.useEffect(() => {\n    const id = setTimeout(() => setV(value), delay);\n    return () => clearTimeout(id);\n  }, [value, delay]);\n  return v;\n}', level: 'Medium' },
    { q: 'How does a custom hook differ from a utility function?', a: 'A utility function is pure logic without hooks (e.g. formatDate). A custom hook uses React hooks, so it can hold state, run effects and must follow the Rules of Hooks.', level: 'Medium' },
    { q: 'Should a custom hook return JSX?', a: 'Generally no. Hooks return data and functions; reusable UI should be a component. Returning JSX from hooks blurs the separation and hurts reuse.', level: 'Medium' },
    { q: 'Array or object return value: which is better?', a: 'Arrays are convenient for 2 values and easy renaming (like useState). Objects are clearer for 3+ values and do not depend on order.', level: 'Easy' },
    { q: 'How do you avoid race conditions in a useFetch hook?', a: 'Use an AbortController (or an ignore flag) in the effect and abort/ignore in the cleanup, so responses from outdated requests do not overwrite current state.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a useCounter(initial, step) hook that returns { count, increment, decrement, reset } and use it twice with different steps.',
      hint: 'Return an object for clarity.',
      solution: `function useCounter(initial = 0, step = 1) {
  const [count, setCount] = React.useState(initial);
  const increment = () => setCount(c => c + step);
  const decrement = () => setCount(c => c - step);
  const reset = () => setCount(initial);
  return { count, increment, decrement, reset };
}

function App() {
  const a = useCounter(0, 1);
  const b = useCounter(100, 10);
  return (
    <div>
      <p>A: {a.count} <button onClick={a.increment}>+</button><button onClick={a.decrement}>-</button><button onClick={a.reset}>reset</button></p>
      <p>B: {b.count} <button onClick={b.increment}>+10</button><button onClick={b.decrement}>-10</button><button onClick={b.reset}>reset</button></p>
    </div>
  );
}`,
    },
    {
      task: 'Write a useInput(initial) hook that returns { value, onChange, reset } so you can spread it onto an input: <input {...name.bind} />.',
      hint: 'Return bind: { value, onChange } as a nested object.',
      solution: `function useInput(initial = '') {
  const [value, setValue] = React.useState(initial);
  return {
    value,
    reset: () => setValue(initial),
    bind: { value, onChange: e => setValue(e.target.value) },
  };
}

function App() {
  const first = useInput('');
  const last = useInput('');
  function submit(e) {
    e.preventDefault();
    alert('Hello ' + first.value + ' ' + last.value);
    first.reset();
    last.reset();
  }
  return (
    <form onSubmit={submit}>
      <input placeholder="First" {...first.bind} />
      <input placeholder="Last" {...last.bind} />
      <button>Submit</button>
    </form>
  );
}`,
    },
    {
      task: 'Write useOnlineStatus() that returns true/false using navigator.onLine and the online/offline window events.',
      hint: 'Add both listeners in one effect and remove both in the cleanup.',
      solution: `function useOnlineStatus() {
  const [online, setOnline] = React.useState(navigator.onLine);
  React.useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);
  return online;
}

function App() {
  const online = useOnlineStatus();
  return <p>{online ? 'You are online' : 'You are offline'}</p>;
}`,
    },
    {
      task: 'Write useTimer(seconds) that counts down to 0 and returns { left, start, pause, reset }.',
      hint: 'Use a running boolean in state and an interval inside useEffect that depends on running.',
      solution: `function useTimer(seconds) {
  const [left, setLeft] = React.useState(seconds);
  const [running, setRunning] = React.useState(false);
  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft(l => {
        if (l <= 1) { setRunning(false); return 0; }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);
  return {
    left,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: () => { setRunning(false); setLeft(seconds); },
  };
}

function App() {
  const t = useTimer(10);
  return (
    <div>
      <h2>{t.left}s</h2>
      <button onClick={t.start}>Start</button>
      <button onClick={t.pause}>Pause</button>
      <button onClick={t.reset}>Reset</button>
    </div>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'Which is a valid custom hook name?',
      options: ['fetchData', 'useFetchData', 'FetchDataHook', 'hookFetchData'],
      answer: 1,
      explanation: 'Custom hooks must start with "use" followed by a capital letter.',
    },
    {
      question: 'Two components call useToggle(). What happens when one toggles?',
      options: ['Both toggle', 'React throws an error', 'Only that component changes; state is independent', 'Neither changes until refresh'],
      answer: 2,
      explanation: 'Each hook call has its own state.',
    },
    {
      question: 'Where is it legal to call a hook?',
      options: ['Inside an if statement', 'Inside a for loop', 'Inside a regular helper function', 'At the top level of a custom hook'],
      answer: 3,
      explanation: 'Hooks may be called at the top level of components and custom hooks only.',
    },
    {
      question: 'What should a useDebounce effect return?',
      options: ['A cleanup that clears the timeout', 'The debounced value', 'Nothing', 'A Promise'],
      answer: 0,
      explanation: 'Clearing the previous timeout on every change is what creates the debounce.',
    },
    {
      question: 'What is the main purpose of custom hooks?',
      options: ['To replace components', 'To reuse stateful logic between components', 'To style components', 'To create global variables'],
      answer: 1,
      explanation: 'Custom hooks extract and reuse logic that uses hooks.',
    },
  ],
};
