export default {
  id: 'day-04-client-state-redux-rtk-query-zustand-context',
  title: 'Client State Architecture: Redux Toolkit 2 + RTK Query vs Zustand 5 vs Context: When to Use What',
  module: 'Module 2: Data & State',
  day: 4,
  level: 'Intermediate',
  duration: '3 hours',
  summary:
    'Choosing a state tool is one of the most common senior-level interview discussions. Learn how Context really re-renders, how to scale Redux Toolkit 2 with selectors, listener middleware and RTK Query tag invalidation, how Zustand 5 stores work with selectors and middleware, and a practical decision guide for MERN apps.',
  objectives: [
    'Classify state into local, shared UI, global client, server and URL state',
    'Explain Context re-render behaviour and the split-context / memoized value fixes',
    'Use RTK 2 features: createSlice selectors, createSelector, listener middleware and RTK Query tags',
    'Build Zustand 5 stores with selectors, useShallow, persist and devtools middleware',
    'Justify a state-management choice for a given project in an interview',
  ],
  theory: [
    {
      heading: 'Five kinds of state and where each belongs',
      content:
        'Before picking a library, classify the state:\n\n1. **Local UI state**: input value, dropdown open. `useState` / `useReducer` in the component.\n2. **Shared UI state** in one subtree: wizard step, accordion. Lift state up or a small Context.\n3. **Global client state**: logged-in user profile, theme, cart (before checkout), feature flags. Context (if it rarely changes) or a store (Zustand/Redux).\n4. **Server state**: products, orders. TanStack Query or RTK Query, **not** a hand-written Redux slice.\n5. **URL state**: filters, search, page, selected tab that should be shareable. `useSearchParams` in React Router.\n\nMost "we need Redux" problems disappear once server state goes into a query library and filters go into the URL. What remains is usually small.',
      tip: 'Interview line: "I keep state as local as possible, server data in a query cache, shareable state in the URL, and only truly global client state in a store."',
    },
    {
      heading: 'Context: dependency injection, not a state manager',
      content:
        'Context passes a value down the tree without prop drilling. It has **no selector**: when the Provider value changes (by `Object.is`), **every component that reads that context re-renders**, even if it uses only one field.\n\nCommon performance traps:\n- `value={{ user, login, logout }}` creates a **new object every render** of the provider, re-rendering all consumers even when nothing changed. Wrap it in `useMemo` and the functions in `useCallback`.\n- One giant `AppContext` with user, theme, cart and notifications: a cart change re-renders the header theme toggle.\n\nFixes: **split contexts** (`StateContext` and `DispatchContext`, or one context per concern), memoize the value, and keep frequently changing values (mouse position, timers, form input) out of context.\n\nContext is perfect for values that change **rarely**: theme, locale, auth user, a QueryClient or socket instance.',
      syntax:
        "const CartStateContext = createContext(null);\nconst CartDispatchContext = createContext(null);\n\nexport function CartProvider({ children }) {\n  const [state, dispatch] = useReducer(cartReducer, { items: [] });\n  return (\n    <CartDispatchContext value={dispatch}>   {/* dispatch is stable: consumers never re-render */}\n      <CartStateContext value={state}>{children}</CartStateContext>\n    </CartDispatchContext>\n  );\n}",
    },
    {
      heading: 'Redux Toolkit 2 at scale',
      content:
        'You learned createSlice and configureStore in the basic course. Production RTK adds:\n- **Selectors in slices** (RTK 2): `selectors: { selectTotal: state => ... }` exported as `cartSlice.selectors`.\n- **Memoized selectors** with `createSelector` (Reselect 5) for derived data like filtered lists or totals, so `useSelector` returns the same reference when inputs did not change.\n- **`useSelector` rule**: select the smallest value you need. `useSelector(state => state)` re-renders on every action.\n- **Typed hooks**: `useAppSelector`, `useAppDispatch` (`useSelector.withTypes<RootState>()` in RTK 2).\n- **Listener middleware** (`createListenerMiddleware`): run side effects in response to actions (save cart to localStorage, show toast, analytics). Lighter than redux-saga.\n- **`combineSlices`** for lazy-loaded slices in code-split apps.\n\nRTK 2 breaking changes: `createSlice` `extraReducers` and `createReducer` only accept the **builder callback** (object syntax removed); `configureStore` middleware option must be a callback.',
      syntax:
        "import { createSlice, createSelector } from '@reduxjs/toolkit';\n\nconst cartSlice = createSlice({\n  name: 'cart',\n  initialState: { items: [] },\n  reducers: {\n    added(state, action) {\n      const found = state.items.find(i => i.id === action.payload.id);\n      if (found) found.qty += 1; else state.items.push({ ...action.payload, qty: 1 });\n    },\n  },\n  selectors: {\n    selectItems: (cart) => cart.items,\n  },\n});\n\nexport const { selectItems } = cartSlice.selectors;\nexport const selectCartTotal = createSelector([selectItems], (items) =>\n  items.reduce((sum, i) => sum + i.price * i.qty, 0)\n);",
    },
    {
      heading: 'RTK Query: server state inside Redux',
      content:
        'RTK Query (included in `@reduxjs/toolkit`) is Redux\'s answer to TanStack Query. You define one **API slice** with `createApi`:\n- `baseQuery: fetchBaseQuery({ baseUrl, credentials: \'include\', prepareHeaders })`.\n- `endpoints: build => ({ getProducts: build.query(...), addProduct: build.mutation(...) })`.\n- Auto-generated hooks: `useGetProductsQuery`, `useAddProductMutation`.\n- **Tags** for cache invalidation: queries `providesTags`, mutations `invalidatesTags`. When a mutation invalidates `{ type: \'Product\', id: \'LIST\' }`, every query providing that tag refetches.\n- `onQueryStarted` with `updateQueryData` for optimistic updates.\n\nAdd `api.reducer` under `api.reducerPath` and `api.middleware` to the store.',
      syntax:
        "export const api = createApi({\n  reducerPath: 'api',\n  baseQuery: fetchBaseQuery({ baseUrl: '/api', credentials: 'include' }),\n  tagTypes: ['Product'],\n  endpoints: (build) => ({\n    getProducts: build.query({\n      query: (params) => ({ url: '/products', params }),\n      providesTags: (result) => result\n        ? [...result.items.map(p => ({ type: 'Product', id: p._id })), { type: 'Product', id: 'LIST' }]\n        : [{ type: 'Product', id: 'LIST' }],\n    }),\n    addProduct: build.mutation({\n      query: (body) => ({ url: '/products', method: 'POST', body }),\n      invalidatesTags: [{ type: 'Product', id: 'LIST' }],\n    }),\n  }),\n});\nexport const { useGetProductsQuery, useAddProductMutation } = api;",
    },
    {
      heading: 'Zustand 5: a tiny hook-based store',
      content:
        'Zustand (`npm i zustand`) creates a store with one function, no Provider needed:\n- `create((set, get) => ({ ...state, ...actions }))` returns a **hook**.\n- Components **select** what they need: `const count = useCartStore(s => s.items.length)`. The component re-renders only when the selected value changes (`Object.is`).\n- `set(partial)` merges at the top level; `set(state => ({...}))` for updates based on previous state. Use `get()` inside actions to read current state.\n- Selecting **several values as a new object/array** creates a new reference each time. In Zustand 5 this can cause an infinite loop error ("getSnapshot should be cached"). Use `useShallow` from `zustand/react/shallow`.\n- **Middleware**: `persist` (localStorage), `devtools` (Redux DevTools), `immer` (mutable syntax).\n- Outside React: `useCartStore.getState()`, `useCartStore.setState()`, `useCartStore.subscribe()`. Useful in axios interceptors (e.g. read the token).\n\nZustand 5 requires React 18+, uses native `useSyncExternalStore`, and dropped the default export.',
      syntax:
        "import { create } from 'zustand';\nimport { persist, devtools } from 'zustand/middleware';\nimport { useShallow } from 'zustand/react/shallow';\n\nexport const useCartStore = create(devtools(persist((set, get) => ({\n  items: [],\n  add: (p) => set((s) => {\n    const found = s.items.find(i => i.id === p.id);\n    return { items: found ? s.items.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...s.items, { ...p, qty: 1 }] };\n  }),\n  remove: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),\n  total: () => get().items.reduce((t, i) => t + i.price * i.qty, 0),\n}), { name: 'cart' })));\n\n// component\nconst { items, remove } = useCartStore(useShallow((s) => ({ items: s.items, remove: s.remove })));",
    },
    {
      heading: 'Decision guide: Context vs Zustand vs Redux Toolkit',
      content:
        '- **Context + useReducer**: small/medium apps, values that change rarely (auth user, theme, locale). No extra dependency. Weak for frequently changing data because there are no selectors.\n- **Zustand**: most new MERN projects that need some global client state (cart, UI preferences, multi-step form). ~1 KB, minimal boilerplate, selectors, works outside React. Less structure for very large teams.\n- **Redux Toolkit (+ RTK Query)**: large apps, many developers, complex flows needing strict patterns, time-travel debugging, middleware, or an existing Redux codebase (very common in Indian service companies and enterprise products). RTK Query gives server caching without another library.\n- **TanStack Query** pairs with Context or Zustand when you do not use Redux.\n\nTypical modern stack: **TanStack Query + Zustand + React Router search params**. Typical enterprise stack: **Redux Toolkit + RTK Query**.',
      points: [
        'Jotai/Recoil-style atoms are another option for fine-grained state; Recoil is archived, Jotai is active.',
        'Do not mix three state libraries without a reason. Consistency matters more than the "best" tool.',
      ],
    },
  ],
  examples: [
    {
      title: 'Context re-render trap and the split-context fix',
      scenario: 'A theme toggle button and a cart badge share one context. Adding to cart should not re-render the theme button.',
      steps: [
        'Build a single AppContext with theme and cart; count renders in each consumer',
        'Click "add to cart" and see the ThemeButton re-render',
        'Switch to the split version with ThemeContext and CartContext',
        'Compare render counts',
      ],
      code: `// BAD: one context, new object every render
<AppContext.Provider value={{ theme, setTheme, cart, setCart }}>

// GOOD: separate, memoized values
<ThemeContext.Provider value={themeValue}>
  <CartContext.Provider value={cartValue}>`,
      playground: {
        jsx: `const { useState, useContext, createContext, useMemo, useRef, memo } = React;

function useRenderCount() { const r = useRef(0); r.current++; return r.current; }

// ---------- single context ----------
const AppCtx = createContext(null);
const ThemeButtonA = memo(function ThemeButtonA() {
  const { theme, setTheme } = useContext(AppCtx);
  const n = useRenderCount();
  return <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>theme: {theme} (renders {n})</button>;
});
const CartBadgeA = memo(function CartBadgeA() {
  const { cart, setCart } = useContext(AppCtx);
  const n = useRenderCount();
  return <button onClick={() => setCart(c => c + 1)}>cart: {cart} (renders {n})</button>;
});
function SingleContext() {
  const [theme, setTheme] = useState('light');
  const [cart, setCart] = useState(0);
  return <AppCtx.Provider value={{ theme, setTheme, cart, setCart }}><ThemeButtonA /> <CartBadgeA /></AppCtx.Provider>;
}

// ---------- split contexts ----------
const ThemeCtx = createContext(null);
const CartCtx = createContext(null);
const ThemeButtonB = memo(function ThemeButtonB() {
  const { theme, setTheme } = useContext(ThemeCtx);
  const n = useRenderCount();
  return <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>theme: {theme} (renders {n})</button>;
});
const CartBadgeB = memo(function CartBadgeB() {
  const { cart, setCart } = useContext(CartCtx);
  const n = useRenderCount();
  return <button onClick={() => setCart(c => c + 1)}>cart: {cart} (renders {n})</button>;
});
function SplitContext() {
  const [theme, setTheme] = useState('light');
  const [cart, setCart] = useState(0);
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);
  const cartValue = useMemo(() => ({ cart, setCart }), [cart]);
  return (
    <ThemeCtx.Provider value={themeValue}>
      <CartCtx.Provider value={cartValue}><ThemeButtonB /> <CartBadgeB /></CartCtx.Provider>
    </ThemeCtx.Provider>
  );
}

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <h4>One big context</h4><SingleContext />
      <h4>Split + memoized contexts</h4><SplitContext />
      <p>Click the cart buttons several times and compare the theme button render counts.</p>
    </div>
  );
}`,
      },
      result: 'In the single-context version the theme button re-renders on every cart click. In the split version its render count stays at 1.',
      explanation:
        'Context consumers re-render whenever the provider value changes identity. memo does not help because context bypasses props. Splitting by concern and memoizing the value limits re-renders to components that actually use the changed data.',
    },
    {
      title: 'Zustand-style store with selectors (built from scratch)',
      scenario: 'Understand how Zustand works internally by implementing a 20-line version with useSyncExternalStore, then compare to the real API.',
      steps: [
        'Write create(initializer) that keeps state in a closure and a Set of listeners',
        'Return a hook that uses useSyncExternalStore with a selector',
        'Build a cart store and two components selecting different slices',
        'Add items and notice the "theme" component never re-renders',
      ],
      code: `// Real Zustand 5
import { create } from 'zustand';
export const useStore = create((set) => ({
  items: [], theme: 'light',
  add: (name) => set((s) => ({ items: [...s.items, name] })),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
}));
const count = useStore((s) => s.items.length);   // re-renders only when length changes`,
      playground: {
        jsx: `const { useSyncExternalStore, useRef } = React;

// ---- mini zustand ----
function create(initializer) {
  let state;
  const listeners = new Set();
  const setState = (partial) => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    if (!Object.is(next, state)) { state = { ...state, ...next }; listeners.forEach(l => l()); }
  };
  const getState = () => state;
  const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
  state = initializer(setState, getState);
  const useStore = (selector = (s) => s) =>
    useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
  Object.assign(useStore, { getState, setState, subscribe });
  return useStore;
}

const useStore = create((set) => ({
  items: [], theme: 'light',
  add: (name) => set((s) => ({ items: [...s.items, name] })),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
}));

function useRenders() { const r = useRef(0); return ++r.current; }

function CartCount() {
  const count = useStore((s) => s.items.length);
  return <p>Cart items: {count} <small>(renders {useRenders()})</small></p>;
}
function ThemeLabel() {
  const theme = useStore((s) => s.theme);
  return <p>Theme: {theme} <small>(renders {useRenders()})</small></p>;
}
function Controls() {
  const add = useStore((s) => s.add);           // actions are stable references
  const toggleTheme = useStore((s) => s.toggleTheme);
  return (
    <div>
      <button onClick={() => add('Item ' + Date.now())}>Add to cart</button>{' '}
      <button onClick={toggleTheme}>Toggle theme</button>{' '}
      <button onClick={() => console.log(useStore.getState())}>log getState()</button>
    </div>
  );
}

function App() {
  return <div style={{ fontFamily: 'sans-serif', padding: 16 }}><Controls /><CartCount /><ThemeLabel /></div>;
}`,
      },
      result: 'Adding items increases only the CartCount render count; toggling the theme re-renders only ThemeLabel. No Provider is used.',
      explanation:
        'useSyncExternalStore subscribes to the store and re-renders only when the selected snapshot changes. This is why selectors matter: returning a new object from a selector would change on every store update (Zustand 5 needs useShallow for that).',
    },
    {
      title: 'Redux Toolkit 2 store with listener middleware and memoized selectors',
      scenario: 'A cart slice whose changes are saved to localStorage by a listener, with a memoized total selector.',
      steps: [
        'Create cartSlice with reducers and slice selectors',
        'Create a memoized selectCartTotal with createSelector',
        'Add createListenerMiddleware that saves the cart on every cart action',
        'Use typed hooks in components',
      ],
      code: `// store.js
import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import cartReducer, { added, removed, cleared } from './cartSlice';
import { api } from './api';

const listener = createListenerMiddleware();
listener.startListening({
  matcher: isAnyOf(added, removed, cleared),
  effect: (action, listenerApi) => {
    localStorage.setItem('cart', JSON.stringify(listenerApi.getState().cart.items));
  },
});

export const store = configureStore({
  reducer: { cart: cartReducer, [api.reducerPath]: api.reducer },
  preloadedState: { cart: { items: JSON.parse(localStorage.getItem('cart') ?? '[]') } },
  middleware: (getDefault) => getDefault().prepend(listener.middleware).concat(api.middleware),
});

// hooks.js (RTK 2 / react-redux 9)
import { useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = useDispatch.withTypes();
export const useAppSelector = useSelector.withTypes();

// CartSummary.jsx
const total = useAppSelector(selectCartTotal);   // memoized: same number unless items change
const count = useAppSelector(state => state.cart.items.length);`,
      result: 'The cart survives a page refresh, components only re-render when their selected value changes, and side effects are kept out of reducers.',
      explanation:
        'Reducers must stay pure, so localStorage writes belong in middleware. The listener middleware reacts to specific actions. createSelector caches the derived total so expensive calculations and new references are avoided.',
    },
    {
      title: 'RTK Query with tags and optimistic update',
      scenario: 'Products CRUD for an admin panel using RTK Query, plus an optimistic "toggle featured".',
      steps: [
        'Define createApi with tagTypes and providesTags on the list query',
        'Mutations invalidate the LIST tag or the specific id',
        'Use onQueryStarted + updateQueryData for the optimistic toggle',
        'Call the generated hooks in components',
      ],
      code: `export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL, credentials: 'include' }),
  tagTypes: ['Product'],
  endpoints: (build) => ({
    getProducts: build.query({
      query: (page = 1) => '/products?page=' + page,
      providesTags: (res) => res
        ? [...res.items.map(({ _id }) => ({ type: 'Product', id: _id })), { type: 'Product', id: 'LIST' }]
        : [{ type: 'Product', id: 'LIST' }],
    }),
    deleteProduct: build.mutation({
      query: (id) => ({ url: '/products/' + id, method: 'DELETE' }),
      invalidatesTags: (r, e, id) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }],
    }),
    toggleFeatured: build.mutation({
      query: ({ id, featured }) => ({ url: '/products/' + id, method: 'PATCH', body: { featured } }),
      async onQueryStarted({ id, featured, page }, { dispatch, queryFulfilled }) {
        const patch = dispatch(productsApi.util.updateQueryData('getProducts', page, (draft) => {
          const p = draft.items.find(x => x._id === id);
          if (p) p.featured = featured;
        }));
        try { await queryFulfilled; } catch { patch.undo(); }
      },
    }),
  }),
});
export const { useGetProductsQuery, useDeleteProductMutation, useToggleFeaturedMutation } = productsApi;

// component
const { data, isLoading, isFetching } = useGetProductsQuery(page);
const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
await deleteProduct(id).unwrap();   // unwrap throws on error`,
      result: 'Deleting a product refetches the list automatically; toggling featured updates instantly and undoes itself on failure.',
      explanation:
        'Tags connect mutations to queries without manual refetch calls. updateQueryData uses Immer drafts and returns a patch object whose undo() reverts the optimistic change.',
    },
  ],
  interview: [
    { q: 'When would you choose Context over Redux or Zustand?', a: 'For low-frequency global values (theme, locale, auth user, injected services) in small to medium apps. Context has no selectors, so every consumer re-renders on any change; for frequently updated or large shared state, a store with selectors is better.', level: 'Easy' },
    { q: 'Why does every Context consumer re-render and how do you reduce it?', a: 'React compares the provider value by reference; when it changes, all consumers using that context re-render, regardless of which field they read, and React.memo does not block it. Fixes: memoize the value with useMemo/useCallback, split into multiple contexts (state vs dispatch, or per concern), move fast-changing state elsewhere, or use a store with selectors.', level: 'Medium' },
    { q: 'What is RTK Query and how does tag invalidation work?', a: 'A data fetching and caching layer built into Redux Toolkit. Queries declare providesTags, mutations declare invalidatesTags. When a mutation succeeds, all cached queries providing a matching tag are refetched automatically. Using { type, id: "LIST" } plus per-item ids gives fine-grained control.', level: 'Medium' },
    { q: 'Why might useStore(s => ({ a: s.a, b: s.b })) cause problems in Zustand 5?', a: 'The selector returns a new object every time, so the snapshot always looks changed. In v5 this causes an infinite re-render / "getSnapshot should be cached" error. Wrap the selector in useShallow, or select values separately.', level: 'Hard' },
    { q: 'How does Zustand avoid needing a Provider?', a: 'The store lives in a module-level closure created by create(). The returned hook subscribes to it via useSyncExternalStore. Because it is a singleton module, any component can import the hook. The downside is shared state between tests/SSR requests; you can create a store per instance with createStore + Context if needed.', level: 'Medium' },
    { q: 'What is createSelector used for?', a: 'Creating memoized selectors (Reselect). It recomputes the result only when its input selectors return new references, so derived data like filtered lists keeps the same reference and does not cause unnecessary re-renders or expensive recalculations.', level: 'Medium' },
    { q: 'Where should side effects live in Redux?', a: 'Not in reducers (they must be pure). Use thunks (createAsyncThunk) for request flows, RTK Query for data fetching, and listener middleware for reacting to actions (persisting, analytics, toasts). Sagas/observables are older heavier options.', level: 'Medium' },
    { q: 'Name RTK 2 breaking changes you have faced.', a: 'Object syntax for createSlice.extraReducers and createReducer was removed (builder callback only), configureStore middleware must be a callback, stricter TypeScript types, and Reselect 5 / react-redux 9 updates with withTypes helpers. RTK 2 also added slice selectors and combineSlices.', level: 'Hard' },
    { q: 'Should API data be stored in a Redux slice?', a: 'Generally no. Hand-written slices for server data reimplement caching, loading flags and invalidation. Use RTK Query (if on Redux) or TanStack Query. Redux slices are for client state.', level: 'Easy' },
    { q: 'How do you read Zustand or Redux state inside an axios interceptor?', a: 'Zustand: useAuthStore.getState().accessToken. Redux: import the store and call store.getState(). Hooks cannot be used outside components, but both stores expose plain getters. Be careful to avoid circular imports between store and api modules.', level: 'Medium' },
    { q: 'Which state should go in the URL?', a: 'State that should survive a refresh and be shareable or bookmarkable: search text, filters, sorting, pagination, selected tab, opened item id. Use useSearchParams; it also gives back/forward navigation for free.', level: 'Easy' },
    { q: 'Design the state architecture for a MERN e-commerce site.', a: 'Server data (products, orders, user profile) in TanStack Query or RTK Query with sensible staleTime; auth user in a small context or Zustand store with the access token in memory; cart in Zustand with persist (synced to the backend after login); filters/page in URL params; form state in React Hook Form; transient UI state local with useState.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a Zustand 5 auth store with user, accessToken, setAuth(user, token) and logout(), persisting only the user (not the token) to localStorage.',
      hint: 'persist accepts partialize: (state) => ({ user: state.user }).',
      solution: `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: 'auth', partialize: (state) => ({ user: state.user }) }
  )
);

// usage
const user = useAuthStore((s) => s.user);
const logout = useAuthStore((s) => s.logout);
// outside React (axios interceptor)
const token = useAuthStore.getState().accessToken;`,
    },
    {
      task: 'Refactor an AuthContext whose provider does value={{ user, login, logout }} so that consumers do not re-render when the provider re-renders for unrelated reasons.',
      hint: 'useCallback for functions, useMemo for the value object.',
      solution: `export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    setUser(data.user);
  }, []);
  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUser(null);
  }, []);
  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext value={value}>{children}</AuthContext>;
}`,
    },
    {
      task: 'Write an RTK Query API slice for orders: getMyOrders (provides Order LIST), getOrder(id) (provides Order id), cancelOrder(id) mutation (invalidates that id and LIST).',
      hint: 'Use tagTypes: ["Order"].',
      solution: `export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api', credentials: 'include' }),
  tagTypes: ['Order'],
  endpoints: (build) => ({
    getMyOrders: build.query({
      query: () => '/orders/mine',
      providesTags: (res = []) => [...res.map(o => ({ type: 'Order', id: o._id })), { type: 'Order', id: 'LIST' }],
    }),
    getOrder: build.query({
      query: (id) => '/orders/' + id,
      providesTags: (r, e, id) => [{ type: 'Order', id }],
    }),
    cancelOrder: build.mutation({
      query: (id) => ({ url: '/orders/' + id + '/cancel', method: 'PATCH' }),
      invalidatesTags: (r, e, id) => [{ type: 'Order', id }, { type: 'Order', id: 'LIST' }],
    }),
  }),
});
export const { useGetMyOrdersQuery, useGetOrderQuery, useCancelOrderMutation } = ordersApi;`,
    },
    {
      task: 'Write a one-paragraph justification (as you would in an interview) for choosing a state stack for a mid-size MERN job portal with 4 developers.',
      hint: 'Mention server state, client state, URL state and team size.',
      solution: `"Most of our data (jobs, applications, company profiles) is server state, so I would use TanStack Query with a shared axios instance for caching, pagination and invalidation. Job search filters and page number go into URL search params so searches are shareable. The remaining global client state is small: the logged-in user, theme and a saved-jobs draft, so a couple of Zustand stores (with persist where needed) are enough and keep boilerplate low for a 4-person team. Forms use React Hook Form with Zod. If the app grew to many teams or needed strict conventions and DevTools time travel, I would consider Redux Toolkit with RTK Query instead."`,
    },
  ],
  quiz: [
    { question: 'Which tool has NO built-in selector support, so all consumers re-render on change?', options: ['Zustand', 'Redux Toolkit', 'React Context', 'RTK Query'], answer: 2, explanation: 'Context consumers re-render whenever the provider value changes.' },
    { question: 'In Zustand 5, how do you safely select multiple fields as an object?', options: ['Wrap the selector with useShallow', 'Use JSON.stringify', 'Use React.memo', 'It is not possible'], answer: 0, explanation: 'useShallow compares the returned object shallowly and keeps a stable reference.' },
    { question: 'In RTK Query, what makes a list refetch after a POST?', options: ['keepUnusedDataFor', 'refetchOnFocus', 'A matching invalidatesTags on the mutation', 'useEffect in the component'], answer: 2, explanation: 'The mutation invalidates tags that the list query provides.' },
    { question: 'Where should saving the cart to localStorage happen in Redux?', options: ['Inside the reducer', 'In listener middleware or a store subscription', 'In useSelector', 'In the action creator'], answer: 1, explanation: 'Reducers must be pure; side effects go in middleware.' },
    { question: 'Which state is best kept in the URL?', options: ['Access token', 'Modal open/closed for a toast', 'Password field value', 'Search filters and current page'], answer: 3, explanation: 'Filters and pagination should be shareable and survive refresh.' },
  ],
};
