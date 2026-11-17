export default {
  id: 'day-22-global-state-context-redux-zustand',
  title: 'Global State: Context vs Redux Toolkit vs Zustand (When to Use What)',
  module: 'Module 4: Routing & State Management',
  day: 22,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'As apps grow, some data is needed in many unrelated places: the user, the cart, notifications. Learn the kinds of state, then compare three popular ways to share global state (Context + useReducer, Redux Toolkit, Zustand) and pick the right one for a project.',
  objectives: [
    'Classify state as local, shared, global, server and URL state',
    'Explain the store / subscribe / selector model used by Redux and Zustand',
    'Implement the same cart with Context and with a Zustand-style store',
    'Compare Context, Redux Toolkit and Zustand on boilerplate, performance, devtools and team size',
    'Choose the right tool (and know when you need none)',
  ],
  theory: [
    {
      heading: 'Kinds of state: not everything is global',
      content:
        'Before choosing a library, sort your state:\n\n- **Local UI state**: an input value, "is this dropdown open". Keep it in `useState` inside the component.\n- **Shared state**: needed by a few nearby components. **Lift it up** to the common parent.\n- **Global client state**: needed all over the app: logged-in user, theme, cart, feature flags. This is what today is about.\n- **Server state**: data from an API (products, posts). It is really a *cache* of the server. Tools like TanStack Query or RTK Query handle caching, refetching and loading flags better than hand-written global state.\n- **URL state**: filters, page number, selected id. Keep it in the URL (Day 21).\n\nMost bugs in "state management" come from putting the wrong kind of state in the wrong place.',
      tip: 'Start local. Move state up or to global only when you feel real pain. Many apps need very little truly global state once server data is handled by a data-fetching library.',
    },
    {
      heading: 'Option 1: Context + useReducer (built in)',
      content:
        'You already know this from Days 16-17. A provider holds `useReducer` state and passes `state` and `dispatch` through context.\n\n**Pros**\n- No extra dependency, part of React\n- Great for low-frequency data: theme, auth user, locale\n\n**Cons**\n- Every consumer re-renders when the context value changes, even if it only uses one field. No built-in **selectors**.\n- You must split contexts and memoize values manually for performance\n- No time-travel devtools or middleware out of the box',
    },
    {
      heading: 'Option 2: Redux Toolkit (RTK)',
      content:
        '**Redux** keeps all global state in a single **store**. Components **dispatch actions**; **reducers** compute the new state; components **select** just the part they need. **Redux Toolkit** is the official, modern way to write Redux with far less boilerplate (`createSlice`, `configureStore`).\n\n**Pros**\n- Predictable one-way data flow, great for large apps and big teams\n- `useSelector` subscribes to a slice of state: components re-render only when **their** selected value changes\n- Excellent Redux DevTools (see every action, time travel)\n- Middleware, async thunks, RTK Query for API caching\n\n**Cons**\n- More concepts and files than the alternatives\n- Overkill for small apps\n\nDay 23 is a full Redux Toolkit lesson.',
    },
    {
      heading: 'Option 3: Zustand',
      content:
        '**Zustand** ("state" in German) is a tiny (around 1 KB) store library. You create a store with a function that returns state and actions; components read it with a hook and a **selector**.\n\n**Pros**\n- Minimal API, almost no boilerplate, no Provider needed\n- Selectors: `useCartStore(s => s.count)` re-renders only when `count` changes\n- Works outside React too (`useCartStore.getState()`)\n- Optional devtools and persist middleware\n\n**Cons**\n- Fewer conventions, so large teams must agree on patterns themselves\n- Smaller ecosystem than Redux',
      syntax:
        "import { create } from 'zustand';\n\nconst useCartStore = create(set => ({\n  items: [],\n  add: item => set(state => ({ items: [...state.items, item] })),\n  clear: () => set({ items: [] }),\n}));\n\nfunction CartCount() {\n  const count = useCartStore(state => state.items.length);\n  return <span>{count}</span>;\n}",
    },
    {
      heading: 'How external stores work: subscribe + selector',
      content:
        'Redux and Zustand share the same core idea, which you can build yourself in 20 lines:\n\n1. A **store** object outside React holds the state\n2. `setState` updates it and **notifies subscribers**\n3. Components **subscribe** through React\'s `useSyncExternalStore` hook, passing a **selector**\n4. React re-renders a component only when its **selected** value changes\n\nThis is why external stores avoid the "all consumers re-render" problem of a big context. The playground examples below build exactly this mini store with plain React.',
    },
    {
      heading: 'Decision guide',
      content:
        '- Small app, a few global values (theme, user): **Context**\n- Medium app with a cart, filters, UI flags; want minimal code: **Zustand**\n- Large app, many developers, complex flows, need strict patterns and great devtools: **Redux Toolkit**\n- Lots of API data: add **TanStack Query** or **RTK Query** for server state, whichever global store you choose\n\n| | Context | Redux Toolkit | Zustand |\n|---|---|---|---|\n| Install | none | @reduxjs/toolkit react-redux | zustand |\n| Boilerplate | low | medium | very low |\n| Selective re-render | no (manual) | yes | yes |\n| Devtools | React DevTools | Redux DevTools | optional |\n| Provider needed | yes | yes | no |\n\nComing next: Day 23 builds a real Redux Toolkit store.',
    },
  ],
  examples: [
    {
      title: 'Cart with Context + useReducer',
      scenario: 'A navbar badge and a product list share a cart through Context. A render counter shows that every consumer re-renders on any change.',
      steps: [
        'Create CartContext and a CartProvider with useReducer',
        'Write Navbar (reads item count) and a Theme label (reads only theme)',
        'Put both cart and theme in one context value on purpose',
        'Run, click "Add" and notice that the Theme label also re-renders',
      ],
      code: `const AppContext = React.createContext(null);

function AppProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, { items: [], theme: 'light' });
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

function ThemeLabel() {
  const { state } = React.useContext(AppContext);   // re-renders on ANY change in state
  return <span>{state.theme}</span>;
}`,
      playground: {
        jsx: `const AppContext = React.createContext(null);
const renders = { navbar: 0, theme: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'add': return { ...state, items: [...state.items, action.item] };
    case 'toggleTheme': return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    default: return state;
  }
}

function AppProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, { items: [], theme: 'light' });
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

const Navbar = React.memo(function Navbar() {
  const { state } = React.useContext(AppContext);
  renders.navbar++;
  return <p>Cart items: {state.items.length} <small>(Navbar renders: {renders.navbar})</small></p>;
});

const ThemeLabel = React.memo(function ThemeLabel() {
  const { state } = React.useContext(AppContext);
  renders.theme++;
  return <p>Theme: {state.theme} <small>(ThemeLabel renders: {renders.theme})</small></p>;
});

function Controls() {
  const { dispatch } = React.useContext(AppContext);
  return (
    <div>
      <button onClick={() => dispatch({ type: 'add', item: 'Book' })}>Add book</button>{' '}
      <button onClick={() => dispatch({ type: 'toggleTheme' })}>Toggle theme</button>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <div style={{ fontFamily: 'sans-serif' }}>
        <Navbar />
        <ThemeLabel />
        <Controls />
      </div>
    </AppProvider>
  );
}`,
      },
      result: 'Clicking "Add book" increases the cart count AND the ThemeLabel render count, even though the theme did not change.',
      explanation:
        'Both components read the same context value. When any field changes, the value object changes, so all consumers re-render (React.memo cannot stop context updates). This is fine for small apps, but it is the main scaling limit of Context.',
    },
    {
      title: 'Build a mini Zustand-style store with selectors',
      scenario: 'Recreate the same cart with an external store and useSyncExternalStore. Components subscribe to only the slice they need.',
      steps: [
        'Write createStore(initializer) that keeps state, a set function and a Set of listeners',
        'Return a hook useStore(selector) that uses React.useSyncExternalStore',
        'Create useAppStore with items, theme, add and toggleTheme',
        'Use selectors in Navbar (items.length) and ThemeLabel (theme)',
        'Run, click "Add book" and see that ThemeLabel does NOT re-render',
      ],
      code: `// With the real library:
import { create } from 'zustand';
const useAppStore = create(set => ({
  items: [],
  theme: 'light',
  add: item => set(s => ({ items: [...s.items, item] })),
  toggleTheme: () => set(s => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
}));

const count = useAppStore(s => s.items.length);   // re-renders only when count changes`,
      playground: {
        jsx: `// A tiny Zustand-like store (about 20 lines) using React's useSyncExternalStore
function createStore(initializer) {
  let state;
  const listeners = new Set();
  const getState = () => state;
  const set = partial => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...next };
    listeners.forEach(l => l());
  };
  const subscribe = l => { listeners.add(l); return () => listeners.delete(l); };
  state = initializer(set, getState);
  function useStore(selector = s => s) {
    return React.useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
  }
  useStore.getState = getState;
  return useStore;
}

const useAppStore = createStore(set => ({
  items: [],
  theme: 'light',
  add: item => set(s => ({ items: [...s.items, item] })),
  toggleTheme: () => set(s => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
}));

const renders = { navbar: 0, theme: 0 };

function Navbar() {
  const count = useAppStore(s => s.items.length);
  renders.navbar++;
  return <p>Cart items: {count} <small>(Navbar renders: {renders.navbar})</small></p>;
}

function ThemeLabel() {
  const theme = useAppStore(s => s.theme);
  renders.theme++;
  return <p>Theme: {theme} <small>(ThemeLabel renders: {renders.theme})</small></p>;
}

function Controls() {
  const add = useAppStore(s => s.add);
  const toggleTheme = useAppStore(s => s.toggleTheme);
  return (
    <div>
      <button onClick={() => add('Book')}>Add book</button>{' '}
      <button onClick={toggleTheme}>Toggle theme</button>
    </div>
  );
}

const MemoNavbar = React.memo(Navbar);
const MemoTheme = React.memo(ThemeLabel);

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <MemoNavbar />
      <MemoTheme />
      <Controls />
    </div>
  );
}`,
      },
      result: '"Add book" increases only the Navbar render count. "Toggle theme" increases only the ThemeLabel render count. No Provider is needed.',
      explanation:
        'useSyncExternalStore re-renders a component only when its selector returns a different value. ThemeLabel selects theme, which does not change when items change, so it is skipped. This is how Zustand and react-redux work internally.',
    },
    {
      title: 'Same feature, three code styles (side by side)',
      scenario: 'A simple counter written with Context, Redux Toolkit and Zustand to compare boilerplate. The playground runs the Context version.',
      steps: [
        'Read the three versions in the code block',
        'Count the files and concepts each needs',
        'Run the playground (Context version) and click the buttons',
      ],
      code: `// 1) Context + useState
const CountContext = React.createContext(null);
function CountProvider({ children }) {
  const [count, setCount] = React.useState(0);
  return <CountContext.Provider value={{ count, setCount }}>{children}</CountContext.Provider>;
}
// use: const { count, setCount } = React.useContext(CountContext);

// 2) Redux Toolkit
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { Provider, useSelector, useDispatch } from 'react-redux';
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: { increment: s => { s.value += 1; } },
});
const store = configureStore({ reducer: { counter: counterSlice.reducer } });
// <Provider store={store}><App /></Provider>
// use: const n = useSelector(s => s.counter.value); dispatch(counterSlice.actions.increment());

// 3) Zustand
import { create } from 'zustand';
const useCounter = create(set => ({ count: 0, inc: () => set(s => ({ count: s.count + 1 })) }));
// use: const count = useCounter(s => s.count); const inc = useCounter(s => s.inc);`,
      playground: {
        jsx: `const CountContext = React.createContext(null);

function CountProvider({ children }) {
  const [count, setCount] = React.useState(0);
  return <CountContext.Provider value={{ count, setCount }}>{children}</CountContext.Provider>;
}

function Display() {
  const { count } = React.useContext(CountContext);
  return <h2>Count: {count}</h2>;
}

function Buttons() {
  const { setCount } = React.useContext(CountContext);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>+1</button>{' '}
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

function App() {
  return (
    <CountProvider>
      <div style={{ fontFamily: 'sans-serif' }}>
        <Display />
        <Buttons />
        <p><small>Display and Buttons are siblings sharing global state through Context.</small></p>
      </div>
    </CountProvider>
  );
}`,
      },
      result: 'A counter where two sibling components share the count. +1 increases and Reset sets it to 0.',
      explanation:
        'All three styles solve the same problem. Context needs a Provider and has no selectors; Redux Toolkit adds slices, a store and a Provider but gives structure and devtools; Zustand is one create() call with selectors and no Provider.',
    },
  ],
  interview: [
    { q: 'What is global state?', a: 'State needed by many components across different parts of the tree, such as the logged-in user, theme or cart, which would otherwise require heavy prop drilling.', level: 'Easy' },
    { q: 'What is the difference between client state and server state?', a: 'Client state is owned by the browser (UI flags, theme, cart draft). Server state is a cached copy of data owned by the backend; it can become stale and needs fetching, caching and revalidation, which tools like TanStack Query or RTK Query handle.', level: 'Medium' },
    { q: 'Is Context a state management solution?', a: 'Not by itself. Context is a way to pass values down the tree. Combined with useState/useReducer it can manage global state for small apps, but it lacks selectors, middleware and devtools.', level: 'Medium' },
    { q: 'What is the main performance problem with large contexts?', a: 'Every component that consumes a context re-renders whenever the context value changes, even if it uses only an unrelated field. Splitting contexts and memoizing values helps.', level: 'Medium' },
    { q: 'What is a selector?', a: 'A function that picks the part of the store a component needs, e.g. state => state.cart.items.length. With Redux/Zustand, the component re-renders only when the selected value changes.', level: 'Medium' },
    { q: 'When would you choose Redux Toolkit?', a: 'For large apps with complex, frequently changing global state, many developers who benefit from strict conventions, need for middleware, time-travel debugging with Redux DevTools, or RTK Query.', level: 'Medium' },
    { q: 'When would you choose Zustand?', a: 'When you want global state with selectors and minimal boilerplate, no Provider, small bundle size; typical for small to medium apps or teams preferring simplicity.', level: 'Medium' },
    { q: 'What is useSyncExternalStore?', a: 'A React 18 hook for subscribing to an external store: useSyncExternalStore(subscribe, getSnapshot). It keeps components consistent with the store during concurrent rendering and is used internally by react-redux and Zustand.', level: 'Hard' },
    { q: 'Should API data go into Redux?', a: 'It can, but modern practice is to use a server-state tool (RTK Query or TanStack Query) that handles caching, deduplication, refetching and loading/error states, and keep Redux for genuine client state.', level: 'Hard' },
    { q: 'What is the first step before adding a global state library?', a: 'Check whether the state can be local, lifted to a nearby parent, put in the URL, or handled by a data-fetching library. Add global state only for data that is truly app-wide.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Split a single AppContext containing { user, theme } into two contexts (UserContext and ThemeContext) so that changing the theme does not re-render components that only use the user.',
      hint: 'Two providers, each with its own state.',
      solution: `const UserContext = React.createContext(null);
const ThemeContext = React.createContext(null);

function Providers({ children }) {
  const [user] = React.useState({ name: 'Neha' });
  const [theme, setTheme] = React.useState('light');
  return (
    <UserContext.Provider value={user}>
      <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
    </UserContext.Provider>
  );
}

const UserName = React.memo(function UserName() {
  const user = React.useContext(UserContext);
  console.log('UserName render');
  return <p>{user.name}</p>;
});

function ThemeButton() {
  const { theme, setTheme } = React.useContext(ThemeContext);
  return <button onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}>{theme}</button>;
}

function App() {
  return <Providers><UserName /><ThemeButton /></Providers>;
}`,
    },
    {
      task: 'Using the mini createStore from the example, build a notifications store with add(message) and dismiss(id), and show a bell badge with the unread count.',
      hint: 'State: { list: [], nextId: 1 }. Badge selector: s => s.list.length.',
      solution: `function createStore(init) {
  let state; const ls = new Set();
  const set = p => { state = { ...state, ...(typeof p === 'function' ? p(state) : p) }; ls.forEach(l => l()); };
  const sub = l => { ls.add(l); return () => ls.delete(l); };
  state = init(set);
  return sel => React.useSyncExternalStore(sub, () => sel(state));
}

const useNotes = createStore(set => ({
  list: [], nextId: 1,
  add: msg => set(s => ({ list: [...s.list, { id: s.nextId, msg }], nextId: s.nextId + 1 })),
  dismiss: id => set(s => ({ list: s.list.filter(n => n.id !== id) })),
}));

function Bell() {
  const count = useNotes(s => s.list.length);
  return <p>Bell: {count}</p>;
}

function List() {
  const list = useNotes(s => s.list);
  const dismiss = useNotes(s => s.dismiss);
  return <ul>{list.map(n => <li key={n.id}>{n.msg} <button onClick={() => dismiss(n.id)}>x</button></li>)}</ul>;
}

function App() {
  const add = useNotes(s => s.add);
  return (
    <div>
      <Bell />
      <button onClick={() => add('New message at ' + new Date().toLocaleTimeString())}>Notify</button>
      <List />
    </div>
  );
}`,
    },
    {
      task: 'Write a short decision note (as code comments) for three projects: a portfolio site, a food-delivery app with cart and filters, and a banking dashboard built by 15 developers. Choose a state approach for each.',
      hint: 'Consider app size, team size and devtools needs.',
      solution: `// 1) Portfolio site
//    Global state: only theme. -> React Context (or even just CSS + localStorage). No library.

// 2) Food-delivery app
//    Cart, selected address, UI filters -> Zustand store (small, selectors, no Provider)
//    Restaurant/menu data from API -> TanStack Query (server state)
//    Search/filter options -> URL query params

// 3) Banking dashboard, 15 developers
//    Redux Toolkit for client state (strict slices, Redux DevTools, middleware for auditing)
//    RTK Query for API data (caching, invalidation)
//    Context only for theme/locale`,
    },
    {
      task: 'Implement the same "favourite movies" feature twice: once with Context + useReducer, once with the mini createStore. Count renders of a component that only shows the total.',
      hint: 'Use a module-level counter incremented during render.',
      solution: `// Context version
const FavContext = React.createContext(null);
function favReducer(s, a) { return a.type === 'add' ? { ...s, list: [...s.list, a.title] } : s; }
function FavProvider({ children }) {
  const [state, dispatch] = React.useReducer(favReducer, { list: [], filter: '' });
  return <FavContext.Provider value={{ state, dispatch }}>{children}</FavContext.Provider>;
}
let ctxRenders = 0;
function CtxTotal() { const { state } = React.useContext(FavContext); ctxRenders++; return <p>Total {state.list.length} (renders {ctxRenders})</p>; }

// Store version
function createStore(init) {
  let state; const ls = new Set();
  const set = p => { state = { ...state, ...p(state) }; ls.forEach(l => l()); };
  state = init(set);
  return sel => React.useSyncExternalStore(l => { ls.add(l); return () => ls.delete(l); }, () => sel(state));
}
const useFav = createStore(set => ({ list: [], add: t => set(s => ({ list: [...s.list, t] })) }));
let storeRenders = 0;
function StoreTotal() { const n = useFav(s => s.list.length); storeRenders++; return <p>Total {n} (renders {storeRenders})</p>; }

function App() {
  const add = useFav(s => s.add);
  return (
    <FavProvider>
      <CtxTotal />
      <StoreTotal />
      <button onClick={() => add('Inception')}>Add to store</button>
    </FavProvider>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'Which kind of state is best kept in the URL?',
      options: ['Password input value', 'Search filters and page number', 'Modal open/closed flag', 'Auth token'],
      answer: 1,
      explanation: 'URL state is shareable and survives refresh, perfect for filters and pagination.',
    },
    {
      question: 'Which option has NO built-in selector-based re-render optimization?',
      options: ['Redux Toolkit with useSelector', 'Zustand', 'React Context', 'All have it'],
      answer: 2,
      explanation: 'Context consumers re-render whenever the value changes.',
    },
    {
      question: 'Which library needs no Provider component?',
      options: ['Zustand', 'react-redux', 'Context API', 'Redux Toolkit'],
      answer: 0,
      explanation: 'Zustand stores are module-level hooks; no Provider is required.',
    },
    {
      question: 'Which React hook lets components subscribe to an external store safely?',
      options: ['useStore', 'useExternalState', 'useReducer', 'useSyncExternalStore'],
      answer: 3,
      explanation: 'useSyncExternalStore(subscribe, getSnapshot) was added in React 18 for this purpose.',
    },
    {
      question: 'For a large app with many developers and a need for time-travel debugging, the best fit is usually…',
      options: ['Plain useState only', 'Redux Toolkit', 'Global variables', 'localStorage'],
      answer: 1,
      explanation: 'Redux Toolkit offers strict structure and Redux DevTools.',
    },
  ],
};
