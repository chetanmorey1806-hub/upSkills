export default {
  id: 'day-30-final-react-project-test-interview',
  title: 'Final React Project, Practical Test, Revision and Interview Questions',
  module: 'Module 6: Professional React',
  day: 30,
  level: 'Advanced',
  duration: '5 hours',
  summary:
    'Bring all 30 days together: build ShopKart, a complete mini e-commerce app with routing, context + reducer cart, custom hooks, memoization, lazy loading and an error boundary. Then take a timed practical test, revise every module, and prepare with 30 real React interview questions.',
  objectives: [
    'Plan a React app: requirements, component tree, state placement and folder structure',
    'Build a complete multi-page app combining routing, context, useReducer, custom hooks, lazy loading and error boundaries',
    'Solve practical test tasks (search with debounce and fetch, CRUD to-do with persistence) under time limits',
    'Revise all React concepts from Day 1 to Day 29 with a one-page summary',
    'Answer 30 common React interview questions confidently, including output/bug-based questions',
  ],
  theory: [
    {
      heading: 'Project brief: ShopKart mini store',
      content:
        'You will build **ShopKart**, a small online store. Requirements:\n\n1. **Pages**: Home, Products (list), Product detail (`/products/:id`), Cart, and a 404 page\n2. **Products page**: search box (debounced), category filter, sort by price\n3. **Product detail**: image, description, price, "Add to cart"\n4. **Cart**: change quantity, remove item, total price, clear cart, "Place order"\n5. **Navbar** with active links and a live cart badge\n6. **Cart persists** in localStorage (survives refresh)\n7. **Performance**: memoized product cards, lazy-loaded Cart page\n8. **Robustness**: an Error Boundary around pages, empty states ("Your cart is empty", "No products found")\n\nIn a real project you would use Vite + React Router + Context/useReducer (or Zustand/RTK). The playground version (Example 1) is a single file: it uses a tiny hash router instead of React Router, but all other code is exactly what you would write.',
    },
    {
      heading: 'Planning: component tree and where state lives',
      content:
        'Always plan before coding. Ask "who needs this data?" and keep state as low as possible.\n\n- **Cart** (items, quantities): needed by Navbar badge, ProductDetail (add), CartPage. **Global**: `CartContext` + `useReducer`, persisted with a `useLocalStorage`-style effect\n- **Search text, category, sort**: only the Products page. **Local state** (could also be URL query params)\n- **Current route**: from the router (URL)\n- **Product data**: static array here; in real life fetched from an API (server state)\n\nComponent tree:\n- `App` > `ErrorBoundary` > `CartProvider` > `Layout`\n- `Layout` > `Navbar` + current page\n- Pages: `Home`, `ProductsPage` > `Filters` + `ProductCard` (memo), `ProductDetail`, `CartPage` (lazy) > `CartRow`, `NotFound`',
      syntax:
        "src/\n  main.jsx                 // createRoot + BrowserRouter\n  App.jsx                  // routes + providers\n  components/\n    Navbar.jsx  ProductCard.jsx  ErrorBoundary.jsx\n  pages/\n    Home.jsx  Products.jsx  ProductDetail.jsx  Cart.jsx  NotFound.jsx\n  context/\n    CartContext.jsx        // provider, reducer, useCart()\n  hooks/\n    useDebounce.js  useLocalStorage.js\n  data/\n    products.js\n  styles/\n    index.css",
    },
    {
      heading: 'Step-by-step build order',
      content:
        '1. `npm create vite@latest shopkart -- --template react` and `npm install react-router-dom`\n2. Create `data/products.js` and the static pages with dummy content\n3. Add routes (`/`, `/products`, `/products/:id`, `/cart`, `*`) and the Navbar with NavLink\n4. Build `CartContext` with a reducer: `added`, `removed`, `qtyChanged`, `cleared`\n5. Persist the cart: lazy initial state from localStorage + `useEffect` to save\n6. Products page: search (useDebounce), category filter, sort with `useMemo`\n7. Memoize `ProductCard` with `React.memo` and stable callbacks with `useCallback`\n8. Lazy-load the Cart page with `React.lazy` + `Suspense`\n9. Wrap pages in an `ErrorBoundary`\n10. Test the reducer with Vitest, run `npm run build`, deploy to Netlify/Vercel with the SPA rewrite\n\nCommit after each step with a clear message (e.g. "feat: add cart reducer").',
      tip: 'Build the simplest working version first, then improve. A working ugly app beats a beautiful half-finished one in any practical test.',
    },
    {
      heading: 'Practical test: rules and marking scheme',
      content:
        '**Time**: 2 hours. **Allowed**: React docs, MDN. **Not allowed**: copying full solutions.\n\n**Task A (30 marks)**: User search: fetch users from `https://jsonplaceholder.typicode.com/users`, show loading and error states, filter by name with a debounced search box, cancel stale requests (see Example 2).\n\n**Task B (40 marks)**: To-do manager with useReducer: add, toggle, edit inline, delete, filter (All / Active / Done), "items left" counter, persist to localStorage (see Example 3).\n\n**Task C (30 marks)**: Find and fix the bugs in a given component (missing keys, mutated state, stale closure in setInterval, effect without cleanup) (see Example 4).\n\nMarking:\n- Works correctly: 50%\n- Clean component structure and naming: 20%\n- Correct state management (immutability, no unnecessary state, keys): 20%\n- UX details: loading/empty/error states, accessibility (labels, buttons): 10%',
    },
    {
      heading: 'Revision: React in one page',
      content:
        '- **Fundamentals (Days 1-6)**: React is a library for building UIs from components; Virtual DOM diffing; Vite setup; JSX rules (one parent, className, `{}` expressions, fragments); props are read-only inputs; `children`; conditional rendering (`&&`, ternary); lists need stable unique `key`s\n- **State and events (7-12)**: `useState` triggers re-render; never mutate, use spread/map/filter; functional updates `setX(prev => ...)`; synthetic events; controlled inputs; lift state up to the closest common parent; composition with `children`; styling options\n- **Hooks (13-19)**: `useEffect` for side effects with dependency array and cleanup; fetch with loading/error and AbortController; `useRef` for DOM and mutable values without re-render; `useContext` to avoid prop drilling; `useReducer` for complex state; `useMemo` / `useCallback` / `React.memo` for performance; custom hooks to reuse logic\n- **Routing and state management (20-24)**: React Router (Routes, Route, Link, NavLink, useParams, nested routes with Outlet, useNavigate, protected routes); Context vs Redux Toolkit vs Zustand; RTK slices, store, useSelector, useDispatch, thunks; React Hook Form + Zod\n- **Advanced (25-29)**: React.lazy + Suspense code splitting; Error Boundaries and Portals; testing with Vitest + RTL; TypeScript props/state/events; build, env vars, deployment, Next.js and SSR',
    },
    {
      heading: 'Interview preparation tips',
      content:
        '- **Explain with examples**: "useMemo caches a computed value, for example a filtered list of 10,000 products that should only recompute when the search text changes."\n- **Know the why**: why keys, why immutability, why cleanup, why not index as key\n- **Practice live coding**: counter, to-do, fetch with loading/error, debounce search, modal, tabs, accordion, pagination, star rating\n- **Talk about trade-offs**: Context vs Redux, CSR vs SSR, controlled vs uncontrolled\n- **Show a project**: deploy ShopKart, put the link and GitHub repo in your resume, and be ready to explain every decision\n- **Read the latest docs** at react.dev: interviewers increasingly ask about React 18/19 features (automatic batching, transitions, Suspense, Server Components, Actions, the `use` hook)',
    },
  ],
  examples: [
    {
      title: 'Final project: ShopKart (complete single-file version)',
      scenario: 'A complete store: Home, Products with debounced search, category filter and sort, Product detail, lazy Cart page with quantities and totals, persistent cart, active navbar links, error boundary and 404 page.',
      steps: [
        'Read the folder structure in the theory section; in Vite each block below would be its own file',
        'Product data and helpers: PRODUCTS array, formatPrice',
        'Router: useHashRoute + matchPath + Link/NavLink (in Vite replace with react-router-dom)',
        'Cart: cartReducer + CartProvider (useReducer + localStorage) + useCart hook',
        'Hooks: useDebounce',
        'Components: Navbar, ProductCard (React.memo), ErrorBoundary',
        'Pages: Home, ProductsPage (useMemo for filtering/sorting), ProductDetail, CartPage (lazy), NotFound',
        'App: providers + layout + route switch inside Suspense',
        'Click Run, browse products, search "watch", add items, open the cart, refresh to see the cart persist',
      ],
      code: `// context/CartContext.jsx (the heart of the app)
import { createContext, useContext, useEffect, useReducer } from 'react';

const CartContext = createContext(null);

export function cartReducer(state, action) {
  switch (action.type) {
    case 'added': {
      const exists = state.find(i => i.id === action.product.id);
      if (exists) return state.map(i => (i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...state, { id: action.product.id, qty: 1 }];
    }
    case 'qtyChanged':
      return state.map(i => (i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i));
    case 'removed':
      return state.filter(i => i.id !== action.id);
    case 'cleared':
      return [];
    default:
      throw new Error('Unknown action ' + action.type);
  }
}

function loadCart() {
  try { return JSON.parse(localStorage.getItem('shopkart-cart')) || []; } catch { return []; }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart);
  useEffect(() => { localStorage.setItem('shopkart-cart', JSON.stringify(items)); }, [items]);
  return <CartContext.Provider value={{ items, dispatch }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

// App.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
const CartPage = lazy(() => import('./pages/Cart'));

export default function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <Navbar />
        <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </CartProvider>
    </ErrorBoundary>
  );
}`,
      playground: {
        jsx: `const { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback, memo, lazy, Suspense } = React;

/* ================= data ================= */
const PRODUCTS = [
  { id: 1, title: 'Classic Wrist Watch', category: 'accessories', price: 2499, rating: 4.4, img: 'https://picsum.photos/seed/watch/300/200', desc: 'Stainless steel watch with leather strap and 1-year warranty.' },
  { id: 2, title: 'Running Shoes', category: 'footwear', price: 3299, rating: 4.6, img: 'https://picsum.photos/seed/shoes/300/200', desc: 'Lightweight running shoes with breathable mesh.' },
  { id: 3, title: 'Cotton T-Shirt', category: 'clothing', price: 599, rating: 4.1, img: 'https://picsum.photos/seed/tshirt/300/200', desc: '100% cotton regular-fit t-shirt.' },
  { id: 4, title: 'Smart Watch', category: 'accessories', price: 4999, rating: 4.2, img: 'https://picsum.photos/seed/smartwatch/300/200', desc: 'Heart-rate, steps and notifications on your wrist.' },
  { id: 5, title: 'Denim Jacket', category: 'clothing', price: 2199, rating: 4.5, img: 'https://picsum.photos/seed/jacket/300/200', desc: 'Classic blue denim jacket for all seasons.' },
  { id: 6, title: 'Leather Sandals', category: 'footwear', price: 1299, rating: 3.9, img: 'https://picsum.photos/seed/sandals/300/200', desc: 'Comfortable everyday leather sandals.' },
];
const formatPrice = n => 'Rs ' + n.toLocaleString('en-IN');

/* ================= tiny router (react-router-dom in Vite) ================= */
function useHashRoute() {
  const read = () => window.location.hash.slice(1) || '/';
  const [path, setPath] = useState(read);
  useEffect(() => {
    const on = () => { setPath(read()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}
function matchPath(pattern, path) {
  const a = pattern.split('/'), b = path.split('/');
  if (a.length !== b.length) return null;
  const params = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = b[i];
    else if (a[i] !== b[i]) return null;
  }
  return params;
}
const navigate = to => { window.location.hash = to; };
const Link = ({ to, children, style }) => <a href={'#' + to} style={style}>{children}</a>;
function NavLink({ to, current, children }) {
  const active = to === '/' ? current === '/' : current.startsWith(to);
  return <a href={'#' + to} aria-current={active ? 'page' : undefined}
            style={{ color: 'white', textDecoration: 'none', padding: '6px 10px', borderRadius: 6, background: active ? 'rgba(255,255,255,0.25)' : 'transparent' }}>{children}</a>;
}

/* ================= cart: context + reducer + persistence ================= */
const CartContext = createContext(null);
function cartReducer(state, action) {
  switch (action.type) {
    case 'added': {
      const exists = state.find(i => i.id === action.product.id);
      if (exists) return state.map(i => (i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...state, { id: action.product.id, qty: 1 }];
    }
    case 'qtyChanged': return state.map(i => (i.id === action.id ? { ...i, qty: Math.max(1, action.qty || 1) } : i));
    case 'removed': return state.filter(i => i.id !== action.id);
    case 'cleared': return [];
    default: throw new Error('Unknown action ' + action.type);
  }
}
function loadCart() {
  try { return JSON.parse(window.localStorage.getItem('shopkart-cart')) || []; } catch (e) { return []; }
}
function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart);
  useEffect(() => {
    try { window.localStorage.setItem('shopkart-cart', JSON.stringify(items)); } catch (e) { /* storage blocked */ }
  }, [items]);
  const value = useMemo(() => ({ items, dispatch }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

/* ================= hooks ================= */
function useDebounce(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), delay); return () => clearTimeout(id); }, [value, delay]);
  return v;
}

/* ================= components ================= */
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { console.error('ShopKart error:', error.message); }
  render() {
    if (this.state.error) return (
      <div role="alert" style={{ padding: 20 }}>
        <h2>Something went wrong</h2><p>{this.state.error.message}</p>
        <button onClick={() => { this.setState({ error: null }); navigate('/'); }}>Go home</button>
      </div>
    );
    return this.props.children;
  }
}

function Navbar({ path }) {
  const { items } = useCart();
  const count = items.reduce((n, i) => n + i.qty, 0);
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0f766e', padding: '10px 14px', flexWrap: 'wrap' }}>
      <b style={{ color: 'white', marginRight: 'auto', fontSize: 18 }}>ShopKart</b>
      <NavLink to="/" current={path}>Home</NavLink>
      <NavLink to="/products" current={path}>Products</NavLink>
      <NavLink to="/cart" current={path}>Cart ({count})</NavLink>
    </nav>
  );
}

const ProductCard = memo(function ProductCard({ product, onAdd }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: 'white' }}>
      <img src={product.img} alt={product.title} width="300" height="200" style={{ width: '100%', height: 130, objectFit: 'cover' }} />
      <div style={{ padding: 10 }}>
        <Link to={'/products/' + product.id} style={{ fontWeight: 'bold', color: '#111' }}>{product.title}</Link>
        <p style={{ margin: '4px 0', color: '#555' }}>{formatPrice(product.price)} | {product.rating} star</p>
        <button onClick={() => onAdd(product)}>Add to cart</button>
      </div>
    </div>
  );
});

/* ================= pages ================= */
function Home() {
  return (
    <section style={{ textAlign: 'center', padding: '30px 10px' }}>
      <h1>Welcome to ShopKart</h1>
      <p>Quality products at honest prices.</p>
      <Link to="/products" style={{ background: '#0f766e', color: 'white', padding: '10px 18px', borderRadius: 8, textDecoration: 'none' }}>Shop now</Link>
    </section>
  );
}

function ProductsPage() {
  const { dispatch } = useCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('none');
  const debounced = useDebounce(search);

  const visible = useMemo(() => {
    let list = PRODUCTS.filter(p => p.title.toLowerCase().includes(debounced.trim().toLowerCase()));
    if (category !== 'all') list = list.filter(p => p.category === category);
    if (sort === 'asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [debounced, category, sort]);

  const handleAdd = useCallback(product => dispatch({ type: 'added', product }), [dispatch]);
  const categories = ['all', ...new Set(PRODUCTS.map(p => p.category))];

  return (
    <section>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input aria-label="Search products" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." />
        <select aria-label="Category" value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select aria-label="Sort" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="none">Sort: featured</option>
          <option value="asc">Price: low to high</option>
          <option value="desc">Price: high to low</option>
        </select>
      </div>
      {visible.length === 0
        ? <p>No products found for "{debounced}".</p>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {visible.map(p => <ProductCard key={p.id} product={p} onAdd={handleAdd} />)}
          </div>}
    </section>
  );
}

function ProductDetail({ id }) {
  const { dispatch } = useCart();
  const [added, setAdded] = useState(false);
  const product = PRODUCTS.find(p => p.id === Number(id));
  if (!product) return <NotFound />;
  return (
    <section style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <img src={product.img} alt={product.title} width="300" height="200" style={{ borderRadius: 10, maxWidth: '100%' }} />
      <div style={{ flex: 1, minWidth: 200 }}>
        <h2 style={{ marginTop: 0 }}>{product.title}</h2>
        <p>{product.desc}</p>
        <h3>{formatPrice(product.price)}</h3>
        <button onClick={() => { dispatch({ type: 'added', product }); setAdded(true); }}>Add to cart</button>{' '}
        {added && <Link to="/cart">Go to cart</Link>}
        <p><Link to="/products">Back to products</Link></p>
      </div>
    </section>
  );
}

function CartPageImpl() {
  const { items, dispatch } = useCart();
  const [ordered, setOrdered] = useState(false);
  const lines = items.map(i => ({ ...i, product: PRODUCTS.find(p => p.id === i.id) })).filter(l => l.product);
  const total = lines.reduce((s, l) => s + l.qty * l.product.price, 0);
  if (ordered) return <h2>Order placed! Thank you for shopping with ShopKart.</h2>;
  if (lines.length === 0) return <p>Your cart is empty. <Link to="/products">Browse products</Link></p>;
  return (
    <section>
      <h2>Your cart</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th align="left">Product</th><th>Qty</th><th align="right">Subtotal</th><th></th></tr></thead>
        <tbody>
          {lines.map(l => (
            <tr key={l.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{l.product.title}</td>
              <td align="center">
                <input type="number" min="1" value={l.qty} aria-label={'Quantity of ' + l.product.title} style={{ width: 50 }}
                       onChange={e => dispatch({ type: 'qtyChanged', id: l.id, qty: Number(e.target.value) })} />
              </td>
              <td align="right">{formatPrice(l.qty * l.product.price)}</td>
              <td align="right"><button onClick={() => dispatch({ type: 'removed', id: l.id })}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 style={{ textAlign: 'right' }}>Total: {formatPrice(total)}</h3>
      <div style={{ textAlign: 'right' }}>
        <button onClick={() => dispatch({ type: 'cleared' })}>Clear cart</button>{' '}
        <button onClick={() => { dispatch({ type: 'cleared' }); setOrdered(true); }} style={{ background: '#0f766e', color: 'white', border: 0, padding: '8px 14px', borderRadius: 6 }}>Place order</button>
      </div>
    </section>
  );
}
// Simulates: const CartPage = lazy(() => import('./pages/Cart'))
const CartPage = lazy(() => new Promise(r => setTimeout(() => r({ default: CartPageImpl }), 500)));

function NotFound() {
  return <section><h2>404 - Page not found</h2><Link to="/">Go home</Link></section>;
}

/* ================= app ================= */
function Pages({ path }) {
  if (path === '/') return <Home />;
  if (path === '/products') return <ProductsPage />;
  if (path === '/cart') return <CartPage />;
  const m = matchPath('/products/:id', path);
  if (m) return <ProductDetail id={m.id} />;
  return <NotFound />;
}

function App() {
  const path = useHashRoute();
  return (
    <ErrorBoundary>
      <CartProvider>
        <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
          <Navbar path={path} />
          <main style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
            <Suspense fallback={<p>Loading page...</p>}>
              <Pages path={path} />
            </Suspense>
          </main>
        </div>
      </CartProvider>
    </ErrorBoundary>
  );
}`,
      },
      result: 'A teal navbar with Home, Products and Cart (count). Products shows a responsive grid of six items with search, category filter and sort. Product titles open a detail page. Adding items updates the cart badge; the Cart page (loaded lazily) lists items with quantity inputs, subtotals, total, Remove, Clear cart and Place order. Refreshing keeps the cart. Unknown URLs show the 404 page.',
      explanation:
        'Each concept from the course has a clear role: hash router for pages and params, Context + useReducer for the cart, lazy useReducer initializer + useEffect for persistence, useDebounce for search, useMemo for filtering/sorting, React.memo + useCallback so product cards do not re-render while typing, React.lazy + Suspense for the Cart page, and an Error Boundary as a safety net.',
    },
    {
      title: 'Practical test Task A solved: debounced user search with fetch',
      scenario: 'Load users from JSONPlaceholder, show loading/error states, and filter by name with a debounced search box. Each search triggers a request with ?name_like= and cancels the previous one.',
      steps: [
        'Write useDebounce(value, 400)',
        'In a useEffect depending on the debounced query, fetch users with an AbortController',
        'Track status: loading, error, data',
        'Render loading text, error message with Retry, empty state and the result list',
        'Run and type "le", then "clem"',
      ],
      code: `function useDebounce(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), delay); return () => clearTimeout(id); }, [value, delay]);
  return v;
}

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const q = useDebounce(query, 400);
  const [state, setState] = useState({ status: 'loading', users: [], error: null });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState(s => ({ ...s, status: 'loading' }));
    fetch('https://jsonplaceholder.typicode.com/users', { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(users => setState({ status: 'success', users: users.filter(u => u.name.toLowerCase().includes(q.toLowerCase())), error: null }))
      .catch(err => { if (err.name !== 'AbortError') setState({ status: 'error', users: [], error: err.message }); });
    return () => controller.abort();
  }, [q, reload]);
  // ...render
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

function useDebounce(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), delay); return () => clearTimeout(id); }, [value, delay]);
  return v;
}

function App() {
  const [query, setQuery] = useState('');
  const q = useDebounce(query, 400);
  const [state, setState] = useState({ status: 'loading', users: [], error: null });
  const [reload, setReload] = useState(0);
  const [requests, setRequests] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState(s => ({ ...s, status: 'loading' }));
    setRequests(n => n + 1);
    fetch('https://jsonplaceholder.typicode.com/users', { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(users => setState({
        status: 'success',
        users: users.filter(u => u.name.toLowerCase().includes(q.trim().toLowerCase())),
        error: null,
      }))
      .catch(err => { if (err.name !== 'AbortError') setState({ status: 'error', users: [], error: err.message }); });
    return () => controller.abort();
  }, [q, reload]);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 420 }}>
      <label>Search users: <input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. clem" /></label>
      <p><small>Requests sent: {requests} (only after you stop typing)</small></p>
      {state.status === 'loading' && <p>Loading...</p>}
      {state.status === 'error' && <p role="alert" style={{ color: 'crimson' }}>{state.error} <button onClick={() => setReload(r => r + 1)}>Retry</button></p>}
      {state.status === 'success' && state.users.length === 0 && <p>No users match "{q}".</p>}
      {state.status === 'success' && (
        <ul>{state.users.map(u => <li key={u.id}><b>{u.name}</b> - {u.email} ({u.address.city})</li>)}</ul>
      )}
    </div>
  );
}`,
      },
      result: 'Ten users load initially. Typing "clem" quickly sends only one new request after you pause, and shows Clementine Bauch and Clementina DuBuque. A name with no matches shows the empty message.',
      explanation:
        'Debouncing reduces requests; AbortController cancels in-flight requests when the query changes, preventing old responses from overwriting new results. All three UI states (loading, error, empty) are handled, which is a big part of the marks.',
    },
    {
      title: 'Practical test Task B solved: to-do manager with useReducer, edit, filters and persistence',
      scenario: 'Add, toggle, edit inline, delete, filter All/Active/Done, show items left, clear completed, and persist to localStorage.',
      steps: [
        'Write todoReducer with actions added, toggled, edited, deleted, cleared_done',
        'Initialize lazily from localStorage and save in useEffect',
        'Keep the filter in local state and derive the visible list (do not store it)',
        'Implement inline edit with a local editing id and text',
        'Run and test every feature, then click Run again to see todos persist',
      ],
      code: `function todoReducer(state, action) {
  switch (action.type) {
    case 'added':   return [...state, { id: Date.now(), text: action.text, done: false }];
    case 'toggled': return state.map(t => (t.id === action.id ? { ...t, done: !t.done } : t));
    case 'edited':  return state.map(t => (t.id === action.id ? { ...t, text: action.text } : t));
    case 'deleted': return state.filter(t => t.id !== action.id);
    case 'cleared_done': return state.filter(t => !t.done);
    default: return state;
  }
}
const [todos, dispatch] = useReducer(todoReducer, [], () => JSON.parse(localStorage.getItem('todos') || '[]'));
useEffect(() => localStorage.setItem('todos', JSON.stringify(todos)), [todos]);
const visible = todos.filter(t => (filter === 'active' ? !t.done : filter === 'done' ? t.done : true));`,
      playground: {
        jsx: `const { useReducer, useState, useEffect, useRef } = React;

function todoReducer(state, action) {
  switch (action.type) {
    case 'added': return [...state, { id: Date.now(), text: action.text, done: false }];
    case 'toggled': return state.map(t => (t.id === action.id ? { ...t, done: !t.done } : t));
    case 'edited': return state.map(t => (t.id === action.id ? { ...t, text: action.text } : t));
    case 'deleted': return state.filter(t => t.id !== action.id);
    case 'cleared_done': return state.filter(t => !t.done);
    default: return state;
  }
}
function load() {
  try { return JSON.parse(window.localStorage.getItem('day30-todos')) || []; } catch (e) { return []; }
}

function TodoItem({ todo, dispatch }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);
  const inputRef = useRef(null);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);
  function save() {
    if (text.trim()) dispatch({ type: 'edited', id: todo.id, text: text.trim() });
    else setText(todo.text);
    setEditing(false);
  }
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
      <input type="checkbox" checked={todo.done} aria-label={'Toggle ' + todo.text} onChange={() => dispatch({ type: 'toggled', id: todo.id })} />
      {editing
        ? <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} onBlur={save}
                 onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setText(todo.text); setEditing(false); } }} />
        : <span onDoubleClick={() => setEditing(true)} style={{ flex: 1, textDecoration: todo.done ? 'line-through' : 'none' }}>{todo.text}</span>}
      {!editing && <button onClick={() => setEditing(true)}>Edit</button>}
      <button onClick={() => dispatch({ type: 'deleted', id: todo.id })} aria-label={'Delete ' + todo.text}>x</button>
    </li>
  );
}

function App() {
  const [todos, dispatch] = useReducer(todoReducer, undefined, load);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('all');
  useEffect(() => { try { window.localStorage.setItem('day30-todos', JSON.stringify(todos)); } catch (e) {} }, [todos]);

  const visible = todos.filter(t => (filter === 'active' ? !t.done : filter === 'done' ? t.done : true));
  const left = todos.filter(t => !t.done).length;

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 400 }}>
      <h3>To-do manager</h3>
      <form onSubmit={e => { e.preventDefault(); if (text.trim()) { dispatch({ type: 'added', text: text.trim() }); setText(''); } }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="What needs to be done?" aria-label="New todo" />
        <button>Add</button>
      </form>
      <div style={{ margin: '8px 0' }}>
        {['all', 'active', 'done'].map(f => (
          <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} style={{ fontWeight: filter === f ? 'bold' : 'normal', marginRight: 4 }}>{f}</button>
        ))}
      </div>
      {visible.length === 0 ? <p>Nothing to show.</p> : <ul style={{ listStyle: 'none', padding: 0 }}>{visible.map(t => <TodoItem key={t.id} todo={t} dispatch={dispatch} />)}</ul>}
      <p>{left} item(s) left <button onClick={() => dispatch({ type: 'cleared_done' })}>Clear completed</button></p>
    </div>
  );
}`,
      },
      result: 'A complete to-do app: add tasks, tick them, edit via the Edit button or double-click (Enter saves, Escape cancels), delete, filter, see items left, and clear completed. Todos survive re-running the playground.',
      explanation:
        'The reducer keeps all list changes pure and immutable. The visible list and the "items left" count are derived during render rather than stored, avoiding out-of-sync state. Editing state is local to each TodoItem because no other component needs it.',
    },
    {
      title: 'Practical test Task C solved: bug hunt (before and after)',
      scenario: 'A buggy component has four classic mistakes. The code block shows the buggy version; the playground runs the fixed version.',
      steps: [
        'Read the buggy code and find: index keys with reordering, state mutation, stale closure in setInterval, missing effect cleanup',
        'Fix keys: use a stable id',
        'Fix mutation: create a new array with spread',
        'Fix stale closure: use the functional updater setSeconds(s => s + 1)',
        'Fix cleanup: return () => clearInterval(id)',
        'Run the fixed version: add names, shuffle, and watch the timer',
      ],
      code: `// BUGGY VERSION
function Buggy() {
  const [names, setNames] = useState(['Asha', 'Ravi']);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setInterval(() => setSeconds(seconds + 1), 1000);   // BUG 1: stale closure (always 0 + 1)
  }, []);                                                // BUG 2: no cleanup -> interval leaks

  function add() {
    names.push('New ' + names.length);                    // BUG 3: mutating state -> no re-render
    setNames(names);
  }

  return (
    <>
      <p>Timer: {seconds}</p>
      <button onClick={add}>Add</button>
      <button onClick={() => setNames([...names].reverse())}>Reverse</button>
      <ul>{names.map((n, i) => <li key={i}>{n} <input /></li>)}</ul>  {/* BUG 4: index key with reorder */}
    </>
  );
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

// FIXED VERSION
function App() {
  const [people, setPeople] = useState([{ id: 1, name: 'Asha' }, { id: 2, name: 'Ravi' }]);
  const [seconds, setSeconds] = useState(0);
  const [nextId, setNextId] = useState(3);

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);  // FIX 1: functional update
    return () => clearInterval(id);                               // FIX 2: cleanup
  }, []);

  function add() {
    setPeople(prev => [...prev, { id: nextId, name: 'New ' + nextId }]);  // FIX 3: new array
    setNextId(n => n + 1);
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <p>Timer: {seconds}s (keeps counting correctly)</p>
      <button onClick={add}>Add</button>{' '}
      <button onClick={() => setPeople(prev => [...prev].reverse())}>Reverse</button>
      <p><small>Type something in a row's box, then click Reverse: the text stays with the right name.</small></p>
      <ul>
        {people.map(p => (
          <li key={p.id}>{p.name} <input placeholder={'note for ' + p.name} /></li>   /* FIX 4: stable key */
        ))}
      </ul>
    </div>
  );
}`,
      },
      result: 'The timer counts 1, 2, 3... instead of getting stuck at 1. "Add" appends new names immediately. After typing notes and clicking Reverse, each note stays next to its own name.',
      explanation:
        'Bug 1: the effect captured seconds = 0 forever; the functional updater always uses the latest value. Bug 2: without cleanup, every remount adds another interval (memory leak, double ticking in Strict Mode). Bug 3: pushing into the same array keeps the same reference, so React bails out. Bug 4: index keys make React reuse DOM nodes by position, so uncontrolled input values stick to the wrong rows after reordering.',
    },
  ],
  interview: [
    { q: 'What is React and why is it popular?', a: 'React is a JavaScript library for building user interfaces from reusable components. It is declarative (describe UI for a given state), uses a Virtual DOM for efficient updates, has one-way data flow, a huge ecosystem and is backed by Meta.', level: 'Easy' },
    { q: 'What is the Virtual DOM and reconciliation?', a: 'The Virtual DOM is a lightweight JS representation of the UI. On every render React creates a new tree, diffs it against the previous one (reconciliation) and applies only the minimal changes to the real DOM.', level: 'Easy' },
    { q: 'What is JSX?', a: 'A syntax extension that lets you write HTML-like markup in JavaScript. It compiles to React.createElement (or the jsx runtime) calls that return React elements.', level: 'Easy' },
    { q: 'Props vs state?', a: 'Props are read-only inputs passed from a parent; state is data owned and updated by the component itself. Changing either causes a re-render.', level: 'Easy' },
    { q: 'Why are keys important in lists, and why avoid index as key?', a: 'Keys let React identify which items changed, moved or were removed. Index keys break when items are inserted, removed or reordered, causing wrong DOM reuse, lost input state and bugs; use stable unique ids.', level: 'Medium' },
    { q: 'Why must state be updated immutably?', a: 'React compares old and new state by reference (Object.is). Mutating keeps the same reference, so React may skip re-rendering, and it breaks features like memoization and time-travel debugging.', level: 'Medium' },
    { q: 'What is the functional update form of setState and when is it needed?', a: 'setCount(prev => prev + 1). It is needed when the new state depends on the previous one, especially for multiple updates in a row or inside closures (intervals, async callbacks) that may hold stale values.', level: 'Medium' },
    { q: 'What is batching in React 18?', a: 'React groups multiple state updates into a single re-render. React 18 introduced automatic batching for updates inside promises, timeouts and native event handlers too, not only React event handlers.', level: 'Medium' },
    { q: 'Controlled vs uncontrolled components?', a: 'Controlled inputs get their value from React state and update via onChange (single source of truth). Uncontrolled inputs keep their own DOM state and are read via refs (React Hook Form uses this for performance).', level: 'Medium' },
    { q: 'Explain the useEffect dependency array.', a: 'No array: runs after every render. Empty array []: runs once after mount (and cleanup on unmount). [a, b]: runs after mount and whenever a or b change. The cleanup runs before the next effect and on unmount.', level: 'Easy' },
    { q: 'Why does an effect run twice in development?', a: 'React 18 Strict Mode intentionally mounts, unmounts and remounts components in development to reveal missing cleanups and impure logic. It does not happen in production.', level: 'Medium' },
    { q: 'useRef vs useState?', a: 'Both persist across renders, but updating a ref (ref.current = x) does not trigger a re-render. Use refs for DOM access, timers ids and mutable values that do not affect the UI; use state for data shown in the UI.', level: 'Medium' },
    { q: 'What is prop drilling and how do you avoid it?', a: 'Passing props through components that do not need them. Avoid with component composition (children), Context, or a state library (Zustand, Redux).', level: 'Easy' },
    { q: 'useMemo vs useCallback vs React.memo?', a: 'useMemo caches a computed value, useCallback caches a function reference, React.memo skips re-rendering a component when its props are shallowly equal. They are often combined so memoized children receive stable props.', level: 'Medium' },
    { q: 'What are custom hooks?', a: 'Functions starting with "use" that call other hooks to reuse stateful logic (useFetch, useDebounce, useLocalStorage). Each call has its own independent state.', level: 'Easy' },
    { q: 'What are the Rules of Hooks?', a: 'Only call hooks at the top level (not in loops, conditions or nested functions) and only from React function components or custom hooks, so React can match hook calls by order.', level: 'Easy' },
    { q: 'When would you choose useReducer over useState?', a: 'When state is complex with several related fields or many types of updates, when the next state depends on the previous in complex ways, or to centralise and unit-test update logic.', level: 'Medium' },
    { q: 'Context vs Redux Toolkit vs Zustand?', a: 'Context passes values down without libraries but re-renders all consumers on change. Redux Toolkit gives a structured single store, selectors, devtools and middleware for large apps. Zustand gives a minimal store with selectors and no Provider for small/medium apps.', level: 'Hard' },
    { q: 'How does React Router enable navigation without reloading?', a: 'It uses the History API (pushState/popstate). Link intercepts clicks, updates the URL and React Router renders the matching Route without requesting a new page.', level: 'Medium' },
    { q: 'How do you implement a protected route?', a: 'A wrapper checks authentication; if not logged in it renders <Navigate to="/login" replace state={{ from: location }} />, otherwise the children or <Outlet />. Real security must still be enforced by the backend.', level: 'Medium' },
    { q: 'What is code splitting and how is it done in React?', a: 'Splitting the bundle into chunks loaded on demand. Use dynamic import() with React.lazy and wrap lazy components in Suspense with a fallback; split by routes and heavy components first.', level: 'Medium' },
    { q: 'What are Error Boundaries and what do they not catch?', a: 'Class components with getDerivedStateFromError/componentDidCatch that catch render errors in their subtree and show fallback UI. They do not catch errors in event handlers, async code, SSR or in the boundary itself.', level: 'Medium' },
    { q: 'What is a Portal?', a: 'ReactDOM.createPortal(children, domNode) renders children into a different DOM node (e.g. body) while keeping them in the React tree, used for modals, tooltips and toasts.', level: 'Easy' },
    { q: 'How do you test React components?', a: 'With Vitest/Jest and React Testing Library: render the component, query elements by role/label/text like a user, simulate events with user-event, use findBy for async results, and mock network calls.', level: 'Medium' },
    { q: 'CSR vs SSR vs SSG?', a: 'CSR renders in the browser after JS loads (Vite SPA). SSR renders HTML on the server per request then hydrates. SSG renders HTML at build time. SSR/SSG improve first paint and SEO.', level: 'Medium' },
    { q: 'What are React Server Components?', a: 'Components that run only on the server (default in the Next.js App Router), can fetch data directly and send no JS to the client. Interactive parts are Client Components marked with "use client".', level: 'Hard' },
    { q: 'Output question: what does the count show after one click?\nconst [count, setCount] = useState(0);\nfunction handle() { setCount(count + 1); setCount(count + 1); setCount(count + 1); }', a: '1. All three calls use the same captured count (0), so each sets 1, and they are batched into one render. Use setCount(c => c + 1) three times to get 3.', level: 'Medium' },
    { q: 'Output question: what is logged when the button is clicked?\nconst [n, setN] = useState(0);\nfunction click() { setN(n + 1); console.log(n); }', a: '0. State updates are not applied immediately; n is the value from the current render. The new value appears on the next render.', level: 'Medium' },
    { q: 'Bug question: why does this effect cause an infinite loop?\nuseEffect(() => { setData(fetchLocal()); });', a: 'There is no dependency array, so the effect runs after every render; it sets state, which triggers a re-render, which runs the effect again. Add a dependency array ([] or the real dependencies) and avoid setting state unconditionally.', level: 'Medium' },
    { q: 'Bug question: a memoized child still re-renders on every parent render. Why?\n<Child options={{ size: 10 }} onSelect={() => select()} />', a: 'The inline object and arrow function are new references each render, so React.memo\'s shallow comparison fails. Move constants outside, or use useMemo for the object and useCallback for the function.', level: 'Hard' },
    { q: 'How would you optimise a slow React app?', a: 'Measure with the Profiler and Lighthouse first; then colocate state, memoize expensive work and components, virtualize long lists, code-split routes and heavy libraries, use transitions for non-urgent updates, optimise images and check bundle size.', level: 'Hard' },
    { q: 'How do you keep secrets safe in a React app?', a: 'Never put them in frontend code or VITE_ env vars, because the bundle is public. Keep secrets on a backend or serverless function and call it from the frontend with proper authentication.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Practical test Task A (30 marks, 40 min): Build a user search page that fetches https://jsonplaceholder.typicode.com/users, filters by name with a 400 ms debounce, cancels stale requests and shows loading, error (with Retry) and empty states.',
      hint: 'useDebounce + useEffect with AbortController; status field with loading/success/error. See Example 2.',
      solution: `const { useState, useEffect } = React;

function useDebounce(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), delay); return () => clearTimeout(id); }, [value, delay]);
  return v;
}

function App() {
  const [query, setQuery] = useState('');
  const q = useDebounce(query, 400);
  const [state, setState] = useState({ status: 'loading', users: [], error: null });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState(s => ({ ...s, status: 'loading' }));
    fetch('https://jsonplaceholder.typicode.com/users', { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(users => setState({ status: 'success', users: users.filter(u => u.name.toLowerCase().includes(q.toLowerCase())), error: null }))
      .catch(err => { if (err.name !== 'AbortError') setState({ status: 'error', users: [], error: err.message }); });
    return () => controller.abort();
  }, [q, reload]);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name" aria-label="Search by name" />
      {state.status === 'loading' && <p>Loading...</p>}
      {state.status === 'error' && <p role="alert">{state.error} <button onClick={() => setReload(r => r + 1)}>Retry</button></p>}
      {state.status === 'success' && state.users.length === 0 && <p>No users found</p>}
      {state.status === 'success' && <ul>{state.users.map(u => <li key={u.id}>{u.name}</li>)}</ul>}
    </div>
  );
}`,
    },
    {
      task: 'Practical test Task B (40 marks, 50 min): To-do manager with useReducer: add, toggle, inline edit, delete, filters (All/Active/Done), items-left counter, clear completed, persisted in localStorage.',
      hint: 'Lazy initializer for loading, useEffect for saving, derive the filtered list during render. See Example 3.',
      solution: `const { useReducer, useState, useEffect } = React;

function reducer(state, a) {
  switch (a.type) {
    case 'added': return [...state, { id: Date.now(), text: a.text, done: false }];
    case 'toggled': return state.map(t => (t.id === a.id ? { ...t, done: !t.done } : t));
    case 'edited': return state.map(t => (t.id === a.id ? { ...t, text: a.text } : t));
    case 'deleted': return state.filter(t => t.id !== a.id);
    case 'cleared_done': return state.filter(t => !t.done);
    default: return state;
  }
}

function App() {
  const [todos, dispatch] = useReducer(reducer, [], () => {
    try { return JSON.parse(localStorage.getItem('todos')) || []; } catch { return []; }
  });
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('all');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  useEffect(() => { localStorage.setItem('todos', JSON.stringify(todos)); }, [todos]);

  const visible = todos.filter(t => (filter === 'active' ? !t.done : filter === 'done' ? t.done : true));

  return (
    <div>
      <form onSubmit={e => { e.preventDefault(); if (text.trim()) { dispatch({ type: 'added', text: text.trim() }); setText(''); } }}>
        <input value={text} onChange={e => setText(e.target.value)} aria-label="New todo" />
        <button>Add</button>
      </form>
      {['all', 'active', 'done'].map(f => <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}>{f}</button>)}
      <ul>
        {visible.map(t => (
          <li key={t.id}>
            <input type="checkbox" checked={t.done} onChange={() => dispatch({ type: 'toggled', id: t.id })} />
            {editId === t.id ? (
              <input value={editText} onChange={e => setEditText(e.target.value)} autoFocus
                     onKeyDown={e => { if (e.key === 'Enter') { dispatch({ type: 'edited', id: t.id, text: editText }); setEditId(null); } }} />
            ) : (
              <span onDoubleClick={() => { setEditId(t.id); setEditText(t.text); }}>{t.text}</span>
            )}
            <button onClick={() => dispatch({ type: 'deleted', id: t.id })}>x</button>
          </li>
        ))}
      </ul>
      <p>{todos.filter(t => !t.done).length} left <button onClick={() => dispatch({ type: 'cleared_done' })}>Clear completed</button></p>
    </div>
  );
}`,
    },
    {
      task: 'Practical test Task C (30 marks, 30 min): Fix all bugs in this component and explain each fix.\nfunction Clock() {\n  const [time, setTime] = useState(0);\n  const [items, setItems] = useState([]);\n  useEffect(() => { setInterval(() => setTime(time + 1), 1000); });\n  const add = () => { items.push(Math.random()); setItems(items); };\n  return <div>{time}<button onClick={add}>Add</button>{items.map((x, i) => <p key={i}>{x}</p>)}</div>;\n}',
      hint: 'Four bugs: missing dependency array, stale closure, missing cleanup, mutation (plus index keys as a bonus).',
      solution: `function Clock() {
  const [time, setTime] = React.useState(0);
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    const id = setInterval(() => setTime(t => t + 1), 1000);  // functional update fixes stale closure
    return () => clearInterval(id);                            // cleanup stops leaks
  }, []);                                                      // [] = start one interval, not one per render

  const add = () => setItems(prev => [...prev, { id: Date.now(), value: Math.random() }]); // new array, no mutation

  return (
    <div>
      {time}
      <button onClick={add}>Add</button>
      {items.map(x => <p key={x.id}>{x.value.toFixed(3)}</p>)}   {/* stable keys */}
    </div>
  );
}

function App() { return <Clock />; }

// Explanations:
// 1. No dependency array -> a NEW interval was created after every render (time increased faster and faster).
// 2. setTime(time + 1) captured an old "time"; setTime(t => t + 1) always uses the latest value.
// 3. No cleanup -> intervals kept running after unmount (memory leak).
// 4. items.push + setItems(items) keeps the same reference, so React skipped the re-render.
// 5. Bonus: stable ids instead of index keys.`,
    },
    {
      task: 'Project extension: add a Wishlist feature to ShopKart: a heart button on each ProductCard, a /wishlist page, and a count in the navbar. Store it in a separate WishlistContext and persist it.',
      hint: 'Keep a Set-like array of product ids; toggle adds or removes. Keep it separate from the cart context so cart updates do not re-render wishlist consumers.',
      solution: `const WishlistContext = React.createContext(null);

function WishlistProvider({ children }) {
  const [ids, setIds] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('shopkart-wishlist')) || []; } catch (e) { return []; }
  });
  React.useEffect(() => { localStorage.setItem('shopkart-wishlist', JSON.stringify(ids)); }, [ids]);
  const toggle = React.useCallback(id => {
    setIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }, []);
  const value = React.useMemo(() => ({ ids, toggle }), [ids, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

const useWishlist = () => React.useContext(WishlistContext);

function HeartButton({ id }) {
  const { ids, toggle } = useWishlist();
  const liked = ids.includes(id);
  return (
    <button aria-pressed={liked} aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => toggle(id)}>
      {liked ? '♥' : '♡'}
    </button>
  );
}

function WishlistPage({ products }) {
  const { ids, toggle } = useWishlist();
  const list = products.filter(p => ids.includes(p.id));
  if (list.length === 0) return <p>Your wishlist is empty.</p>;
  return <ul>{list.map(p => <li key={p.id}>{p.title} <button onClick={() => toggle(p.id)}>Remove</button></li>)}</ul>;
}

// In Navbar: const { ids } = useWishlist(); <NavLink to="/wishlist">Wishlist ({ids.length})</NavLink>
// In App: wrap with <WishlistProvider> next to <CartProvider>, and add the /wishlist route.

function App() {
  const products = [{ id: 1, title: 'Watch' }, { id: 2, title: 'Shoes' }];
  return (
    <WishlistProvider>
      {products.map(p => <p key={p.id}>{p.title} <HeartButton id={p.id} /></p>)}
      <WishlistPage products={products} />
    </WishlistProvider>
  );
}`,
    },
    {
      task: 'Write Vitest unit tests for the ShopKart cartReducer: adding a new product, adding the same product twice, changing quantity (minimum 1), removing, clearing, and throwing on an unknown action.',
      hint: 'Import cartReducer from context/CartContext.jsx; it is a pure function, so no rendering is needed.',
      solution: `import { describe, it, expect } from 'vitest';
import { cartReducer } from './CartContext';

const watch = { id: 1, title: 'Watch', price: 2499 };

describe('cartReducer', () => {
  it('adds a new product with qty 1', () => {
    expect(cartReducer([], { type: 'added', product: watch })).toEqual([{ id: 1, qty: 1 }]);
  });
  it('increments qty when the same product is added again', () => {
    const s = cartReducer([{ id: 1, qty: 1 }], { type: 'added', product: watch });
    expect(s).toEqual([{ id: 1, qty: 2 }]);
  });
  it('changes quantity but never below 1', () => {
    expect(cartReducer([{ id: 1, qty: 2 }], { type: 'qtyChanged', id: 1, qty: 5 })[0].qty).toBe(5);
    expect(cartReducer([{ id: 1, qty: 2 }], { type: 'qtyChanged', id: 1, qty: 0 })[0].qty).toBe(1);
  });
  it('removes a product', () => {
    expect(cartReducer([{ id: 1, qty: 1 }], { type: 'removed', id: 1 })).toEqual([]);
  });
  it('clears the cart', () => {
    expect(cartReducer([{ id: 1, qty: 3 }, { id: 2, qty: 1 }], { type: 'cleared' })).toEqual([]);
  });
  it('does not mutate the previous state', () => {
    const prev = [{ id: 1, qty: 1 }];
    cartReducer(prev, { type: 'added', product: watch });
    expect(prev).toEqual([{ id: 1, qty: 1 }]);
  });
  it('throws on unknown actions', () => {
    expect(() => cartReducer([], { type: 'oops' })).toThrow('Unknown action oops');
  });
});`,
    },
    {
      task: 'Deploy ShopKart: switch the playground hash router to react-router-dom with BrowserRouter, build it, add the SPA rewrite and deploy to Netlify or Vercel. Write the README section describing features, tech stack and how to run it.',
      hint: 'public/_redirects for Netlify or vercel.json for Vercel; npm run build; publish dist.',
      solution: `// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// public/_redirects   (Netlify)
// /*    /index.html   200

// vercel.json          (Vercel)
// { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }

// Terminal
// npm run build && npm run preview
// git push origin main   -> connect repo in Netlify/Vercel: build "npm run build", output "dist"

// README.md (excerpt)
// # ShopKart
// Mini e-commerce app built with React 18 + Vite.
// ## Features
// - Product list with debounced search, category filter and price sort
// - Product detail pages (/products/:id), 404 page
// - Persistent cart (Context + useReducer + localStorage)
// - Lazy-loaded cart page, memoized product cards, error boundary
// ## Tech
// React, React Router, Vite, Vitest + React Testing Library
// ## Run locally
// npm install
// npm run dev
// npm test
// ## Live demo
// https://shopkart-demo.netlify.app`,
    },
  ],
  quiz: [
    {
      question: 'In ShopKart, where should the search text for the Products page live?',
      options: ['In CartContext', 'In local state of the Products page (or the URL)', 'In localStorage only', 'In a global variable'],
      answer: 1,
      explanation: 'Only the Products page needs it, so keep it local (or in query params for shareable URLs).',
    },
    {
      question: 'After one click, what does count become?\nsetCount(count + 1); setCount(count + 1);',
      options: ['2', '0', 'It throws an error', '1'],
      answer: 3,
      explanation: 'Both calls use the same captured count (0); use the functional form to get 2.',
    },
    {
      question: 'Which combination prevents ProductCard from re-rendering while the user types in the search box?',
      options: ['React.memo on ProductCard + useCallback for onAdd', 'useEffect in ProductCard', 'useRef for products', 'Putting the cart in useState'],
      answer: 0,
      explanation: 'memo skips renders when props are equal; useCallback keeps the function prop stable.',
    },
    {
      question: 'Which pair implements loading the Cart page on demand?',
      options: ['useMemo + useCallback', 'Portal + ErrorBoundary', 'React.lazy + Suspense', 'useReducer + Context'],
      answer: 2,
      explanation: 'React.lazy with a dynamic import and a Suspense fallback splits the page into its own chunk.',
    },
    {
      question: 'Why is the "items left" count computed during render instead of stored in state?',
      options: ['State cannot hold numbers', 'It is derived data; storing it risks getting out of sync with todos', 'useReducer forbids extra state', 'It makes the app slower'],
      answer: 1,
      explanation: 'Derive values from existing state instead of duplicating them.',
    },
  ],
};
