export default {
  id: 'day-23-redux-toolkit',
  title: 'Redux Toolkit: createSlice, configureStore, useSelector, useDispatch and Async Thunks',
  module: 'Module 4: Routing & State Management',
  day: 23,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Redux Toolkit (RTK) is the official, modern way to use Redux. You will create slices with createSlice, combine them with configureStore, connect React with Provider, useSelector and useDispatch, and load API data with createAsyncThunk.',
  objectives: [
    'Explain the Redux data flow: store, actions, reducers, selectors',
    'Create a slice with createSlice and understand Immer-powered "mutating" reducers',
    'Configure the store with configureStore and provide it with <Provider>',
    'Read state with useSelector and send actions with useDispatch',
    'Fetch data with createAsyncThunk and handle pending / fulfilled / rejected',
  ],
  theory: [
    {
      heading: 'Redux in one picture',
      content:
        'Redux keeps the global state of your app in **one store**. Data flows in one direction:\n\n1. The UI **dispatches an action**: `{ type: \'cart/added\', payload: item }`\n2. The store runs the **reducer** with the current state and the action\n3. The reducer returns the **new state**\n4. Components that **select** changed data re-render\n\nAnalogy: a company with one central accounts ledger (store). Employees cannot edit the ledger directly. They submit forms (actions) to the accounts team (reducers), who update the ledger according to rules. Anyone can read the part of the ledger they need (selectors).\n\nYou already know the reducer idea from useReducer (Day 17). Redux makes it app-wide, with devtools and middleware.',
    },
    {
      heading: 'Setup and createSlice',
      content:
        'Install: `npm install @reduxjs/toolkit react-redux`\n\nA **slice** is one feature\'s piece of state plus the reducers that change it. `createSlice` takes a `name`, `initialState` and `reducers`, and automatically generates:\n- **Action creators**: `counterSlice.actions.increment()` returns `{ type: \'counter/increment\' }`\n- The slice **reducer**: `counterSlice.reducer`\n\nInside RTK reducers you may write code that **looks like mutation** (`state.value += 1`). RTK uses the **Immer** library, which records your changes on a draft and produces a new immutable state for you. You can also return a brand-new value instead. Do not do both in the same reducer.',
      syntax:
        "// features/counter/counterSlice.js\nimport { createSlice } from '@reduxjs/toolkit';\n\nconst counterSlice = createSlice({\n  name: 'counter',\n  initialState: { value: 0 },\n  reducers: {\n    increment: state => { state.value += 1; },          // Immer makes this safe\n    decrement: state => { state.value -= 1; },\n    incrementByAmount: (state, action) => { state.value += action.payload; },\n  },\n});\n\nexport const { increment, decrement, incrementByAmount } = counterSlice.actions;\nexport default counterSlice.reducer;",
      tip: 'The "mutating" style is only safe inside createSlice/createReducer. In plain useReducer or useState you must still return new objects.',
    },
    {
      heading: 'configureStore and Provider',
      content:
        '`configureStore` creates the store. Pass an object of slice reducers; each key becomes a top-level part of the state (`state.counter`, `state.cart`). It automatically sets up Redux DevTools and the thunk middleware.\n\nThen wrap the app in `<Provider store={store}>` from react-redux so every component can access the store.',
      syntax:
        "// app/store.js\nimport { configureStore } from '@reduxjs/toolkit';\nimport counterReducer from '../features/counter/counterSlice';\nimport cartReducer from '../features/cart/cartSlice';\n\nexport const store = configureStore({\n  reducer: { counter: counterReducer, cart: cartReducer },\n});\n\n// main.jsx\nimport { Provider } from 'react-redux';\nimport { store } from './app/store';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <Provider store={store}><App /></Provider>\n);",
    },
    {
      heading: 'useSelector and useDispatch',
      content:
        '- `useSelector(selector)` reads data from the store: `const value = useSelector(state => state.counter.value)`. The component re-renders **only when the selected value changes** (compared with `===`).\n- `useDispatch()` returns the store\'s `dispatch` function: `dispatch(increment())`.\n\nGood habits:\n- Select the **smallest** piece you need\n- Do not return a new object/array from a selector each time (`state => ({ a: state.a })`) or the component re-renders on every store update; select separately or use `createSelector` for derived data\n- Put reusable selectors next to the slice: `export const selectCount = state => state.counter.value`',
      syntax:
        "import { useSelector, useDispatch } from 'react-redux';\nimport { increment, selectCount } from './counterSlice';\n\nfunction Counter() {\n  const count = useSelector(selectCount);\n  const dispatch = useDispatch();\n  return <button onClick={() => dispatch(increment())}>{count}</button>;\n}",
    },
    {
      heading: 'Async logic with createAsyncThunk',
      content:
        'Reducers must be pure, so API calls go into **thunks**: functions that receive `dispatch` and can do async work. `createAsyncThunk(type, payloadCreator)` generates a thunk that automatically dispatches three actions:\n\n- `pending` when it starts\n- `fulfilled` with the returned data on success\n- `rejected` with the error on failure\n\nYou handle them in the slice with `extraReducers` and `builder.addCase(...)`. Store a `status` field (`idle | loading | succeeded | failed`) and `error`.',
      syntax:
        "export const fetchUsers = createAsyncThunk('users/fetch', async () => {\n  const res = await fetch('https://jsonplaceholder.typicode.com/users');\n  if (!res.ok) throw new Error('HTTP ' + res.status);\n  return res.json();\n});\n\nconst usersSlice = createSlice({\n  name: 'users',\n  initialState: { list: [], status: 'idle', error: null },\n  reducers: {},\n  extraReducers: builder => {\n    builder\n      .addCase(fetchUsers.pending, state => { state.status = 'loading'; })\n      .addCase(fetchUsers.fulfilled, (state, action) => { state.status = 'succeeded'; state.list = action.payload; })\n      .addCase(fetchUsers.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; });\n  },\n});",
      tip: 'For lots of API data, look at RTK Query (createApi), included in Redux Toolkit. It generates hooks like useGetUsersQuery() with caching built in.',
    },
    {
      heading: 'Folder structure and the playground note',
      content:
        'A common "feature folder" layout:\n- `src/app/store.js`\n- `src/features/counter/counterSlice.js`, `Counter.jsx`\n- `src/features/cart/cartSlice.js`, `Cart.jsx`\n\nThe single-file playground cannot install @reduxjs/toolkit, so the playgrounds below use a **mini Redux written in plain React** (createSlice, configureStore, Provider, useSelector, useDispatch with about 40 lines) that behaves like RTK for learning purposes. The `code` blocks contain the real RTK code to use in a Vite project.\n\nComing next: Day 24 handles large forms with React Hook Form.',
    },
  ],
  examples: [
    {
      title: 'Counter slice with Provider, useSelector and useDispatch',
      scenario: 'The classic Redux counter: increment, decrement and add an amount typed by the user.',
      steps: [
        'npm install @reduxjs/toolkit react-redux',
        'Create counterSlice.js with createSlice',
        'Create store.js with configureStore({ reducer: { counter } })',
        'Wrap <App /> in <Provider store={store}>',
        'In Counter.jsx use useSelector and useDispatch',
        'Run the playground: it uses the mini-RTK helpers defined at the top',
      ],
      code: `// counterSlice.js
import { createSlice } from '@reduxjs/toolkit';
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => { state.value += 1; },
    decrement: state => { state.value -= 1; },
    incrementByAmount: (state, action) => { state.value += action.payload; },
  },
});
export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;

// Counter.jsx
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, incrementByAmount } from './counterSlice';

export function Counter() {
  const count = useSelector(state => state.counter.value);
  const dispatch = useDispatch();
  const [amount, setAmount] = useState('2');
  return (
    <div>
      <button onClick={() => dispatch(decrement())}>-</button>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
      <input value={amount} onChange={e => setAmount(e.target.value)} />
      <button onClick={() => dispatch(incrementByAmount(Number(amount) || 0))}>Add amount</button>
    </div>
  );
}`,
      playground: {
        jsx: `// ---------- mini Redux Toolkit (learning version, plain React) ----------
function createSlice({ name, initialState, reducers }) {
  const actions = {};
  Object.keys(reducers).forEach(key => {
    const type = name + '/' + key;
    actions[key] = payload => ({ type, payload });
  });
  function reducer(state = initialState, action) {
    const key = action.type.startsWith(name + '/') ? action.type.slice(name.length + 1) : null;
    if (!key || !reducers[key]) return state;
    const draft = structuredClone(state);              // RTK uses Immer instead
    const result = reducers[key](draft, action);
    return result === undefined ? draft : result;
  }
  return { name, actions, reducer };
}
function configureStore({ reducer }) {
  const keys = Object.keys(reducer);
  let state = {};
  keys.forEach(k => { state[k] = reducer[k](undefined, { type: '@@init' }); });
  const listeners = new Set();
  const store = {
    getState: () => state,
    subscribe: l => { listeners.add(l); return () => listeners.delete(l); },
    dispatch: action => {
      if (typeof action === 'function') return action(store.dispatch, store.getState); // thunk support
      const next = {};
      keys.forEach(k => { next[k] = reducer[k](state[k], action); });
      state = next;
      console.log('dispatched', action.type);
      listeners.forEach(l => l());
      return action;
    },
  };
  return store;
}
const StoreContext = React.createContext(null);
const Provider = ({ store, children }) => <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
function useSelector(selector) {
  const store = React.useContext(StoreContext);
  return React.useSyncExternalStore(store.subscribe, () => selector(store.getState()), () => selector(store.getState()));
}
const useDispatch = () => React.useContext(StoreContext).dispatch;
// ---------- end of mini RTK ----------

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => { state.value += 1; },
    decrement: state => { state.value -= 1; },
    incrementByAmount: (state, action) => { state.value += action.payload; },
  },
});
const { increment, decrement, incrementByAmount } = counterSlice.actions;
const store = configureStore({ reducer: { counter: counterSlice.reducer } });

function Counter() {
  const count = useSelector(state => state.counter.value);
  const dispatch = useDispatch();
  const [amount, setAmount] = React.useState('2');
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <button onClick={() => dispatch(decrement())}>-</button>
      <b style={{ margin: '0 12px', fontSize: 24 }}>{count}</b>
      <button onClick={() => dispatch(increment())}>+</button>
      <div style={{ marginTop: 8 }}>
        <input value={amount} onChange={e => setAmount(e.target.value)} style={{ width: 50 }} />
        <button onClick={() => dispatch(incrementByAmount(Number(amount) || 0))}>Add amount</button>
      </div>
    </div>
  );
}

function App() {
  return <Provider store={store}><Counter /></Provider>;
}`,
      },
      result: 'A counter with -, + and "Add amount". The console logs each dispatched action type, e.g. "dispatched counter/increment".',
      explanation:
        'Clicking + dispatches counter/increment. The store runs the slice reducer, which "mutates" a draft copy, producing a new state. useSelector notices that state.counter.value changed and re-renders Counter.',
    },
    {
      title: 'Cart slice: add, remove, quantity and a derived total',
      scenario: 'An e-commerce cart stored in Redux. The header shows the count, the cart panel shows lines and the total.',
      steps: [
        'Create cartSlice with items: [] and reducers addItem, removeItem, changeQty, clearCart',
        'Write selectors selectCartCount and selectCartTotal next to the slice',
        'Add the slice to configureStore',
        'Use the selectors in Header and CartPanel',
        'Run the playground and add products',
      ],
      code: `// cartSlice.js
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addItem: (state, action) => {
      const found = state.items.find(i => i.id === action.payload.id);
      if (found) found.qty += 1;
      else state.items.push({ ...action.payload, qty: 1 });
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    changeQty: (state, action) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) item.qty = Math.max(1, action.payload.qty);
    },
    clearCart: () => ({ items: [] }),
  },
});
export const selectCartCount = state => state.cart.items.reduce((n, i) => n + i.qty, 0);
export const selectCartTotal = state => state.cart.items.reduce((s, i) => s + i.qty * i.price, 0);`,
      playground: {
        jsx: `// ---------- mini Redux Toolkit (same helpers as example 1) ----------
function createSlice({ name, initialState, reducers }) {
  const actions = {};
  Object.keys(reducers).forEach(key => { actions[key] = payload => ({ type: name + '/' + key, payload }); });
  function reducer(state = initialState, action) {
    const key = action.type.startsWith(name + '/') ? action.type.slice(name.length + 1) : null;
    if (!key || !reducers[key]) return state;
    const draft = structuredClone(state);
    const result = reducers[key](draft, action);
    return result === undefined ? draft : result;
  }
  return { actions, reducer };
}
function configureStore({ reducer }) {
  const keys = Object.keys(reducer);
  let state = {};
  keys.forEach(k => { state[k] = reducer[k](undefined, { type: '@@init' }); });
  const ls = new Set();
  const store = {
    getState: () => state,
    subscribe: l => { ls.add(l); return () => ls.delete(l); },
    dispatch: a => {
      if (typeof a === 'function') return a(store.dispatch, store.getState);
      const next = {}; keys.forEach(k => { next[k] = reducer[k](state[k], a); }); state = next; ls.forEach(l => l()); return a;
    },
  };
  return store;
}
const StoreContext = React.createContext(null);
const Provider = ({ store, children }) => <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
function useSelector(sel) {
  const store = React.useContext(StoreContext);
  return React.useSyncExternalStore(store.subscribe, () => sel(store.getState()), () => sel(store.getState()));
}
const useDispatch = () => React.useContext(StoreContext).dispatch;
// ---------- app ----------

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addItem: (state, action) => {
      const found = state.items.find(i => i.id === action.payload.id);
      if (found) found.qty += 1; else state.items.push({ ...action.payload, qty: 1 });
    },
    removeItem: (state, action) => { state.items = state.items.filter(i => i.id !== action.payload); },
    changeQty: (state, action) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) item.qty = Math.max(1, action.payload.qty);
    },
    clearCart: () => ({ items: [] }),
  },
});
const { addItem, removeItem, changeQty, clearCart } = cartSlice.actions;
const selectCartCount = s => s.cart.items.reduce((n, i) => n + i.qty, 0);
const selectCartTotal = s => s.cart.items.reduce((t, i) => t + i.qty * i.price, 0);
const store = configureStore({ reducer: { cart: cartSlice.reducer } });

const PRODUCTS = [{ id: 1, name: 'Headphones', price: 1999 }, { id: 2, name: 'Charger', price: 799 }, { id: 3, name: 'Cable', price: 249 }];

function Header() {
  const count = useSelector(selectCartCount);
  return <h3>My Shop | Cart ({count})</h3>;
}
function ProductList() {
  const dispatch = useDispatch();
  return (
    <div>
      {PRODUCTS.map(p => (
        <button key={p.id} onClick={() => dispatch(addItem(p))} style={{ marginRight: 6 }}>Add {p.name} (Rs {p.price})</button>
      ))}
    </div>
  );
}
function CartPanel() {
  const items = useSelector(s => s.cart.items);
  const total = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  if (items.length === 0) return <p>Cart is empty</p>;
  return (
    <div>
      <ul>
        {items.map(i => (
          <li key={i.id}>
            {i.name} x
            <input type="number" min="1" value={i.qty} style={{ width: 45 }}
                   onChange={e => dispatch(changeQty({ id: i.id, qty: Number(e.target.value) }))} />
            = Rs {i.qty * i.price} <button onClick={() => dispatch(removeItem(i.id))}>Remove</button>
          </li>
        ))}
      </ul>
      <b>Total: Rs {total}</b> <button onClick={() => dispatch(clearCart())}>Clear cart</button>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <div style={{ fontFamily: 'sans-serif' }}>
        <Header />
        <ProductList />
        <CartPanel />
      </div>
    </Provider>
  );
}`,
      },
      result: 'Add buttons add products to the cart; adding the same product increases its quantity. The header count and the total update everywhere. Remove, quantity input and Clear cart all work.',
      explanation:
        'All cart rules live in the slice. Components stay simple: they select data and dispatch actions. Selectors like selectCartTotal compute derived data from the store instead of storing the total separately (single source of truth).',
    },
    {
      title: 'Loading users with createAsyncThunk',
      scenario: 'Fetch users from JSONPlaceholder and track loading and error state in Redux.',
      steps: [
        'Define fetchUsers with createAsyncThunk',
        'Handle pending, fulfilled and rejected in extraReducers',
        'Dispatch fetchUsers() in a useEffect when status is idle',
        'Render based on status',
        'Run the playground: a mini createAsyncThunk dispatches the same three actions',
      ],
      code: `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const res = await fetch('https://jsonplaceholder.typicode.com/users');
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
});

const usersSlice = createSlice({
  name: 'users',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUsers.pending, state => { state.status = 'loading'; })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.status = 'succeeded'; state.list = action.payload; })
      .addCase(fetchUsers.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; });
  },
});

// UsersList.jsx
function UsersList() {
  const { list, status, error } = useSelector(state => state.users);
  const dispatch = useDispatch();
  useEffect(() => { if (status === 'idle') dispatch(fetchUsers()); }, [status, dispatch]);
  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'failed') return <p>Error: {error}</p>;
  return <ul>{list.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}`,
      playground: {
        jsx: `// mini createAsyncThunk + store (learning version)
function createAsyncThunk(type, payloadCreator) {
  const pending = type + '/pending', fulfilled = type + '/fulfilled', rejected = type + '/rejected';
  const thunk = arg => async dispatch => {
    dispatch({ type: pending });
    try {
      const payload = await payloadCreator(arg);
      dispatch({ type: fulfilled, payload });
    } catch (err) {
      dispatch({ type: rejected, error: { message: err.message } });
    }
  };
  Object.assign(thunk, { pending, fulfilled, rejected });
  return thunk;
}
function createStore(reducer) {
  let state = reducer(undefined, { type: '@@init' });
  const ls = new Set();
  const store = {
    getState: () => state,
    subscribe: l => { ls.add(l); return () => ls.delete(l); },
    dispatch: a => {
      if (typeof a === 'function') return a(store.dispatch, store.getState);
      state = reducer(state, a); console.log(a.type); ls.forEach(l => l()); return a;
    },
  };
  return store;
}
const StoreContext = React.createContext(null);
function useSelector(sel) {
  const store = React.useContext(StoreContext);
  return React.useSyncExternalStore(store.subscribe, () => sel(store.getState()), () => sel(store.getState()));
}
const useDispatch = () => React.useContext(StoreContext).dispatch;

// ---- feature code ----
const fetchUsers = createAsyncThunk('users/fetchUsers', async (fail) => {
  const url = fail ? 'https://jsonplaceholder.typicode.com/does-not-exist' : 'https://jsonplaceholder.typicode.com/users';
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
});

const initial = { list: [], status: 'idle', error: null };
function usersReducer(state = initial, action) {
  switch (action.type) {
    case fetchUsers.pending: return { ...state, status: 'loading', error: null };
    case fetchUsers.fulfilled: return { ...state, status: 'succeeded', list: action.payload };
    case fetchUsers.rejected: return { ...state, status: 'failed', error: action.error.message };
    default: return state;
  }
}
const store = createStore(usersReducer);

function UsersList() {
  const status = useSelector(s => s.status);
  const list = useSelector(s => s.list);
  const error = useSelector(s => s.error);
  const dispatch = useDispatch();
  React.useEffect(() => { if (status === 'idle') dispatch(fetchUsers(false)); }, [status, dispatch]);
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <button onClick={() => dispatch(fetchUsers(false))}>Reload</button>{' '}
      <button onClick={() => dispatch(fetchUsers(true))}>Simulate error</button>
      <p>Status: <b>{status}</b></p>
      {status === 'loading' && <p>Loading...</p>}
      {status === 'failed' && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {status === 'succeeded' && <ul>{list.map(u => <li key={u.id}>{u.name} ({u.email})</li>)}</ul>}
    </div>
  );
}

function App() {
  return <StoreContext.Provider value={store}><UsersList /></StoreContext.Provider>;
}`,
      },
      result: 'Status goes loading -> succeeded and ten user names appear. "Simulate error" shows status failed with "Error: HTTP 404". The console logs users/fetchUsers/pending, /fulfilled or /rejected.',
      explanation:
        'The thunk does the async work and dispatches lifecycle actions; the reducer just reacts to them. With real RTK, createAsyncThunk generates these three action types for you and extraReducers handles them.',
    },
  ],
  interview: [
    { q: 'What is Redux?', a: 'A predictable state container: a single store holds global state, which changes only by dispatching actions to pure reducer functions. Components subscribe to the parts they need.', level: 'Easy' },
    { q: 'What is Redux Toolkit and why is it recommended?', a: 'The official, opinionated toolset for Redux. It reduces boilerplate (createSlice, configureStore), includes Immer for simpler immutable updates, sets up DevTools and thunk middleware by default, and includes RTK Query.', level: 'Easy' },
    { q: 'What does createSlice generate?', a: 'A slice reducer and action creators (and action types) for each reducer function you define, all namespaced with the slice name, e.g. counter/increment.', level: 'Medium' },
    { q: 'How can RTK reducers "mutate" state safely?', a: 'createSlice wraps reducers with Immer. You modify a draft proxy; Immer tracks changes and produces a new immutable state object. The original state is never mutated.', level: 'Medium' },
    { q: 'What does configureStore do beyond createStore?', a: 'It combines slice reducers, adds the thunk middleware, enables Redux DevTools, and adds development checks for accidental mutations and non-serializable values.', level: 'Medium' },
    { q: 'useSelector vs useDispatch?', a: 'useSelector reads (subscribes to) a piece of store state and re-renders when it changes. useDispatch returns the dispatch function used to send actions.', level: 'Easy' },
    { q: 'Why should a selector not return a new object every time?', a: 'useSelector compares results with ===. A new object each call means "changed" on every store update, causing unnecessary re-renders. Select primitives separately, use shallowEqual, or memoize with createSelector.', level: 'Hard' },
    { q: 'What is a thunk?', a: 'A function returned instead of an action object; the thunk middleware calls it with (dispatch, getState), allowing async logic and multiple dispatches.', level: 'Medium' },
    { q: 'Which actions does createAsyncThunk dispatch?', a: 'type/pending at the start, type/fulfilled with the returned value on success, and type/rejected with the error on failure. They are handled in extraReducers.', level: 'Medium' },
    { q: 'reducers vs extraReducers in createSlice?', a: 'reducers define actions owned by this slice (and generate action creators). extraReducers respond to actions defined elsewhere, such as async thunk lifecycle actions or other slices\' actions, without generating creators.', level: 'Hard' },
    { q: 'Can you put non-serializable values (functions, class instances, Promises) in the store?', a: 'It is discouraged. Redux expects serializable state for DevTools, persistence and predictability; configureStore warns about non-serializable values.', level: 'Hard' },
    { q: 'What is RTK Query?', a: 'A data-fetching and caching layer included in Redux Toolkit. You define endpoints with createApi and get auto-generated hooks (useGetPostsQuery) that handle loading, caching, refetching and invalidation.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a todos slice with addTodo(text), toggleTodo(id) and deleteTodo(id). Configure the store and build a component that lists, toggles and deletes todos.',
      hint: 'Use nanoid from @reduxjs/toolkit or Date.now() for ids. Use the "mutating" style.',
      solution: `// todosSlice.js
import { createSlice, nanoid } from '@reduxjs/toolkit';
const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    addTodo: (state, action) => { state.push({ id: nanoid(), text: action.payload, done: false }); },
    toggleTodo: (state, action) => {
      const t = state.find(t => t.id === action.payload);
      if (t) t.done = !t.done;
    },
    deleteTodo: (state, action) => state.filter(t => t.id !== action.payload),
  },
});
export const { addTodo, toggleTodo, deleteTodo } = todosSlice.actions;
export default todosSlice.reducer;

// store.js
import { configureStore } from '@reduxjs/toolkit';
import todos from './todosSlice';
export const store = configureStore({ reducer: { todos } });

// Todos.jsx
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
export function Todos() {
  const todos = useSelector(s => s.todos);
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  return (
    <div>
      <form onSubmit={e => { e.preventDefault(); if (text) { dispatch(addTodo(text)); setText(''); } }}>
        <input value={text} onChange={e => setText(e.target.value)} />
        <button>Add</button>
      </form>
      <ul>
        {todos.map(t => (
          <li key={t.id}>
            <span onClick={() => dispatch(toggleTodo(t.id))} style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
            <button onClick={() => dispatch(deleteTodo(t.id))}>x</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
    },
    {
      task: 'Add an auth slice (user: null, login(name), logout()) to the same store and show "Hi NAME" in a Navbar while TodoList keeps working.',
      hint: 'configureStore({ reducer: { todos, auth } }).',
      solution: `import { createSlice } from '@reduxjs/toolkit';
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null },
  reducers: {
    login: (state, action) => { state.user = { name: action.payload }; },
    logout: state => { state.user = null; },
  },
});
export const { login, logout } = authSlice.actions;
export default authSlice.reducer;

// store.js
export const store = configureStore({ reducer: { todos, auth: authReducer } });

// Navbar.jsx
export function Navbar() {
  const user = useSelector(s => s.auth.user);
  const dispatch = useDispatch();
  return user
    ? <nav>Hi {user.name} <button onClick={() => dispatch(logout())}>Logout</button></nav>
    : <nav><button onClick={() => dispatch(login('Kiran'))}>Login</button></nav>;
}`,
    },
    {
      task: 'Write createAsyncThunk fetchPosts that loads https://jsonplaceholder.typicode.com/posts?_limit=5 and a PostsList component showing loading, error and titles.',
      hint: 'Track status and error in the slice; dispatch in useEffect when status === "idle".',
      solution: `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

export const fetchPosts = createAsyncThunk('posts/fetch', async () => {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
  if (!res.ok) throw new Error('Failed to load posts');
  return res.json();
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchPosts.pending, s => { s.status = 'loading'; })
     .addCase(fetchPosts.fulfilled, (s, a) => { s.status = 'succeeded'; s.items = a.payload; })
     .addCase(fetchPosts.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message; });
  },
});
export default postsSlice.reducer;

export function PostsList() {
  const { items, status, error } = useSelector(s => s.posts);
  const dispatch = useDispatch();
  useEffect(() => { if (status === 'idle') dispatch(fetchPosts()); }, [status, dispatch]);
  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'failed') return <p>{error}</p>;
  return <ol>{items.map(p => <li key={p.id}>{p.title}</li>)}</ol>;
}`,
    },
    {
      task: 'Write a memoized selector with createSelector that returns only completed todos, and explain in a comment why it avoids extra re-renders.',
      hint: 'import { createSelector } from "@reduxjs/toolkit".',
      solution: `import { createSelector } from '@reduxjs/toolkit';

const selectTodos = state => state.todos;

// Without memoization, state.todos.filter(...) returns a NEW array on every call,
// so useSelector would think the value changed after ANY store update.
// createSelector re-computes only when selectTodos returns a different reference.
export const selectCompletedTodos = createSelector([selectTodos], todos => todos.filter(t => t.done));

// usage
function CompletedList() {
  const done = useSelector(selectCompletedTodos);
  return <ul>{done.map(t => <li key={t.id}>{t.text}</li>)}</ul>;
}`,
    },
  ],
  quiz: [
    {
      question: 'Which function creates action creators and a reducer together?',
      options: ['configureStore', 'createSlice', 'combineReducers', 'useDispatch'],
      answer: 1,
      explanation: 'createSlice generates actions and the reducer from your reducers object.',
    },
    {
      question: 'Why is state.value += 1 allowed inside a createSlice reducer?',
      options: ['Redux allows mutation everywhere', 'JavaScript copies objects automatically', 'Because the state is a primitive', 'Immer turns draft mutations into a new immutable state'],
      answer: 3,
      explanation: 'RTK uses Immer to safely produce the next state.',
    },
    {
      question: 'Which hook reads data from the Redux store?',
      options: ['useSelector', 'useStore', 'useDispatch', 'useReducer'],
      answer: 0,
      explanation: 'useSelector subscribes to a part of the store.',
    },
    {
      question: 'Which three actions does createAsyncThunk dispatch?',
      options: ['start / success / fail', 'request / response / error', 'pending / fulfilled / rejected', 'loading / done / catch'],
      answer: 2,
      explanation: 'The lifecycle action types end with /pending, /fulfilled and /rejected.',
    },
    {
      question: 'Where are async thunk lifecycle actions handled in a slice?',
      options: ['reducers', 'extraReducers', 'middleware', 'initialState'],
      answer: 1,
      explanation: 'extraReducers responds to actions defined outside the slice\'s own reducers.',
    },
  ],
};
