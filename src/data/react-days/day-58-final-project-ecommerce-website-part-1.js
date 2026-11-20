export default {
  id: 'day-58-final-project-ecommerce-website-part-1',
  title: 'Final Project 2 (Part 1): E-commerce Website: Product Listing, Categories, Search/Filter/Sort, Product Details and Cart',
  module: 'Module 12: React Native & Final Projects',
  day: 58,
  level: 'Advanced',
  duration: '5 hours',
  summary:
    "Build the customer side of \"ShopKart\", an e-commerce website like a mini Flipkart/Amazon: products from the dummyjson.com API, categories, search with debounce, sort and price filter stored in URL search params, a product details page, and a cart built with Context + useReducer that survives a page refresh through localStorage. Part 2 (Day 59) adds login, checkout, orders, an admin dashboard, payments and deployment.",
  objectives: [
    'Plan an e-commerce front end: user stories, routes, folder structure and state ownership',
    'Build an API service layer for dummyjson.com products, categories, search and pagination',
    'Keep search, category, sort, price and page in the URL with useSearchParams so pages are shareable',
    'Build a product details page with an image gallery, discount price, stock and reviews',
    'Implement the cart with Context + useReducer, derived totals and localStorage persistence',
  ],
  theory: [
    {
      heading: 'Project brief: ShopKart user stories and routes',
      content:
        "**User stories (Part 1):**\n1. As a shopper, I want to **browse products** in a grid with image, title, price, discount and rating.\n2. As a shopper, I want to **filter by category** (smartphones, laptops, groceries, ...), **search** by name and **sort** by price or rating.\n3. As a shopper, I want to **share a link** to my filtered results (\"laptops under ₹80,000 sorted by price\") and the page should open exactly like that.\n4. As a shopper, I want a **product details page** with images, description, stock status and reviews.\n5. As a shopper, I want to **add to cart**, change quantity, remove items and see subtotal, discount, delivery and total.\n6. As a shopper, I want my **cart to still be there** after refreshing or closing the tab.\n\n**Routes (React Router 7, library mode, same API as v6):**\n- `/` home: product grid with filters (`/?category=laptops&sort=price-asc&q=mac&page=2`)\n- `/product/:id` product details\n- `/cart` cart page\n- `*` 404 page\n- (Day 59) `/login`, `/checkout`, `/orders`, `/admin`\n\n**Acceptance criteria example:** \"Given I selected Laptops and sorted by price low to high, when I refresh the page, the same filter and sort are applied.\"",
      points: [
        'Server state (products) comes from the API; client state (cart) lives in Context + useReducer',
        'Filter state lives in the URL, not in useState: shareable, back-button friendly, refresh safe',
        'Every list has loading (skeleton), error (retry) and empty (no products found) states',
      ],
    },
    {
      heading: 'The dummyjson.com products API',
      content:
        "dummyjson.com is a free fake REST API used for practice. Endpoints used today:\n- `GET /products?limit=12&skip=0&select=title,price,...` returns `{ products, total, skip, limit }` (194 products)\n- `GET /products/search?q=phone` search by text\n- `GET /products/category/laptops` products of one category\n- `GET /products/categories` returns `[{ slug, name, url }]`\n- `GET /products/1` one product with `description, images[], thumbnail, rating, stock, brand, discountPercentage, reviews[], warrantyInformation, shippingInformation, availabilityStatus, returnPolicy`\n- Sorting on any list endpoint: `&sortBy=price&order=asc`\n\n**Pagination:** `skip = (page - 1) * limit`; total pages = `Math.ceil(total / limit)`.\n\n**Prices:** dummyjson prices are in US dollars. ShopKart shows rupees by converting with a fixed demo rate in one helper: `formatINR(usd)` uses `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })` on `usd * 85`. In a real Indian store the backend sends prices in paise (integer) to avoid floating point errors: ₹1,299.00 = 129900.\n\n**Limitations:** search cannot be combined with category on the server, so ShopKart uses search OR category on the API and applies the price filter on the client (on the current page). A real backend would support all filters together; mention this honestly in interviews.",
      syntax:
        "// src/api/products.js\nconst BASE = 'https://dummyjson.com';\nconst FIELDS = 'title,price,discountPercentage,rating,stock,thumbnail,category,brand';\n\nexport async function fetchProducts({ q = '', category = '', sort = '', page = 1, limit = 12 }, signal) {\n  const [sortBy, order] = sort ? sort.split('-') : [];\n  const params = new URLSearchParams({ limit, skip: (page - 1) * limit, select: FIELDS });\n  if (sortBy) { params.set('sortBy', sortBy); params.set('order', order); }\n  let path = '/products';\n  if (q) { path = '/products/search'; params.set('q', q); }\n  else if (category) path = '/products/category/' + category;\n  const res = await fetch(BASE + path + '?' + params, { signal });\n  if (!res.ok) throw new Error('Could not load products (' + res.status + ')');\n  return res.json();                        // { products, total, skip, limit }\n}",
    },
    {
      heading: 'Folder structure and state ownership',
      content:
        "A **feature-based** structure (Day 31) keeps each feature's components, hooks and API together:\n\n- `src/api/client.js` (fetch/Axios instance), `src/api/products.js`\n- `src/features/products/` ProductGrid, ProductCard, Filters, Pagination, ProductDetails, useProducts.js, useProduct.js\n- `src/features/cart/` CartContext.jsx, cartReducer.js, CartPage.jsx, CartItem.jsx, CartSummary.jsx\n- `src/components/` Header, Rating, Price, Skeleton, ErrorState, EmptyState (shared UI)\n- `src/hooks/` useDebounce.js, useLocalStorage.js\n- `src/utils/format.js` formatINR, discountedPrice\n- `src/routes/` AppRoutes.jsx, `src/layouts/` MainLayout.jsx (Header + Outlet + Footer)\n\n**Who owns which state?**\n- Products, categories, single product: **server state**, fetched by hooks (or TanStack Query in production: `useQuery({ queryKey: ['products', params] })`)\n- Filters: **URL state** via `useSearchParams`\n- Cart: **global client state** via Context + useReducer (Redux Toolkit or Zustand are equally valid; the cart is a classic interview example for all three)\n- Input text before debounce, image gallery index: **local state**",
      syntax:
        "shopkart/src/\n├─ api/            client.js  products.js\n├─ features/\n│  ├─ products/    ProductGrid.jsx  ProductCard.jsx  Filters.jsx  Pagination.jsx\n│  │               ProductDetails.jsx  useProducts.js  useProduct.js\n│  └─ cart/        CartContext.jsx  cartReducer.js  CartPage.jsx  CartSummary.jsx\n├─ components/     Header.jsx  Rating.jsx  Price.jsx  Skeleton.jsx  ErrorState.jsx\n├─ hooks/          useDebounce.js  useLocalStorage.js\n├─ layouts/        MainLayout.jsx\n├─ utils/          format.js\n├─ App.jsx  main.jsx  index.css",
    },
    {
      heading: 'Filters in the URL with useSearchParams',
      content:
        "`useSearchParams()` from React Router returns `[searchParams, setSearchParams]`, like useState for the query string.\n\n- Read: `const category = searchParams.get('category') ?? ''`\n- Write: copy, change, set: `const next = new URLSearchParams(searchParams); next.set('sort', 'price-asc'); next.delete('page'); setSearchParams(next)`\n- **Reset the page to 1** whenever a filter changes, otherwise you can land on page 5 of a 2-page result\n- Use `setSearchParams(next, { replace: true })` for typing in the search box so every key press does not create a history entry\n- Search input: keep the text in local state, debounce it (400 ms), then write `q` to the URL\n\nBenefits: shareable links, browser back/forward works, refresh keeps filters, and analytics can read the URL. This is exactly how Flipkart and Amazon URLs work (`?q=shoes&sort=price_asc&p[]=...`).\n\nPlayground note: the single-file playground has no React Router, so the examples use a tiny `useSearchParamsLite` hook (state + URLSearchParams) and a state-based router with the same API shape. The `code` blocks show the real React Router code.",
      syntax:
        "import { useSearchParams } from 'react-router';   // 'react-router-dom' in v6\n\nfunction Filters() {\n  const [params, setParams] = useSearchParams();\n  const update = (key, value) => {\n    const next = new URLSearchParams(params);\n    value ? next.set(key, value) : next.delete(key);\n    if (key !== 'page') next.delete('page');          // back to page 1\n    setParams(next);\n  };\n  return (\n    <select value={params.get('sort') ?? ''} onChange={(e) => update('sort', e.target.value)}>\n      <option value=\"\">Relevance</option>\n      <option value=\"price-asc\">Price: Low to High</option>\n      <option value=\"price-desc\">Price: High to Low</option>\n      <option value=\"rating-desc\">Rating</option>\n    </select>\n  );\n}",
      tip: 'Common mistake: copying URL params into useState and then syncing with useEffect. Read them directly from searchParams every render; the URL is the single source of truth.',
    },
    {
      heading: 'Cart with Context + useReducer and localStorage',
      content:
        "The cart reducer handles every change in one pure function, which is easy to test and to explain:\n- `ADD` (product, qty): add a new line or increase the quantity, capped at stock\n- `REMOVE` (id), `SET_QTY` (id, qty; qty 0 removes), `CLEAR`\n\nStore only what you need in each line: `{ id, title, price, discountPercentage, thumbnail, stock, qty }`. **Derive** count, subtotal, discount and total with selectors; never store totals in state (they get out of sync).\n\n**Persistence:** useReducer's third argument is a lazy initialiser: `useReducer(cartReducer, [], () => JSON.parse(localStorage.getItem('shopkart:cart')) ?? [])`, and a `useEffect` saves the cart on every change. Wrap both in try/catch.\n\n**Performance:** the context value changes on every cart update, so every consumer re-renders. Memoise the value with useMemo, split state and dispatch into two contexts if needed, or switch to Zustand/Redux where components subscribe to slices.\n\n**Pricing rules for ShopKart:** MRP = price; selling price = price × (1 − discount%/100); delivery free above ₹499, else ₹40.",
      syntax:
        "export function cartReducer(state, action) {\n  switch (action.type) {\n    case 'ADD': {\n      const { product, qty = 1 } = action;\n      const line = state.find((l) => l.id === product.id);\n      if (line) return state.map((l) => l.id === product.id ? { ...l, qty: Math.min(l.qty + qty, l.stock) } : l);\n      return [...state, { ...product, qty: Math.min(qty, product.stock) }];\n    }\n    case 'SET_QTY':\n      return action.qty <= 0\n        ? state.filter((l) => l.id !== action.id)\n        : state.map((l) => l.id === action.id ? { ...l, qty: Math.min(action.qty, l.stock) } : l);\n    case 'REMOVE': return state.filter((l) => l.id !== action.id);\n    case 'CLEAR': return [];\n    default: throw new Error('Unknown action: ' + action.type);\n  }\n}",
      tip: 'Never trust prices stored in the browser. localStorage can be edited by the user, so the server must recalculate the order total from product ids and quantities at checkout (Day 59).',
    },
    {
      heading: 'Industry checklist for Part 1',
      content:
        "- **Images:** `loading=\"lazy\"`, fixed aspect ratio (`aspect-ratio: 1`) to avoid layout shift, meaningful `alt` (product title)\n- **Accessibility:** product cards are links, buttons have text, quantity buttons have `aria-label`, the cart count is announced (`aria-live`)\n- **Performance:** request only needed fields with `select=`, paginate, debounce search, memoise derived lists, code-split the details and cart routes with React.lazy\n- **UX:** skeleton cards, empty state with a Clear filters button, error state with Retry, disabled Add to cart when out of stock, toast \"Added to cart\"\n- **SEO:** each product page sets `document.title` (React 19 lets you render `<title>` inside components)\n- **Git:** one feature per branch and PR (`feat/product-grid`, `feat/cart`)\n\nComing next: Day 59 adds login with JWT, checkout with validation, orders history, an admin dashboard, Razorpay/Stripe test payments and deployment.",
    },
  ],
  examples: [
    {
      title: 'Feature 1: API layer + product grid with skeleton, error and pagination',
      scenario: 'Show 12 products per page from dummyjson with image, title, discounted price in ₹, MRP struck through, discount badge and rating; skeleton cards while loading, Retry on error and Prev/Next pagination.',
      steps: [
        'npm create vite@latest shopkart -- --template react and npm install react-router',
        'Create src/utils/format.js with formatINR and sellingPrice',
        'Create src/api/products.js with fetchProducts (limit, skip, select)',
        'Create a useProducts(params) hook with { data, loading, error, reload } and AbortController',
        'Build ProductCard and ProductGrid with skeletons and pagination',
        'Run the playground and page through the 194 products',
      ],
      code: `// src/utils/format.js
const USD_TO_INR = 85;              // demo rate: dummyjson prices are in USD
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatINR = (usd) => inr.format(usd * USD_TO_INR);
export const sellingPrice = (p) => p.price * (1 - p.discountPercentage / 100);

// src/features/products/useProducts.js
import { useEffect, useState, useCallback } from 'react';
import { fetchProducts } from '../../api/products';

export function useProducts(params) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const key = JSON.stringify(params);
  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchProducts(params, controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e) => e.name !== 'AbortError' && setState({ data: null, loading: false, error: e.message }));
    return () => controller.abort();
  }, [key, reloadKey]);
  return { ...state, reload: useCallback(() => setReloadKey((k) => k + 1), []) };
}

// Production version with TanStack Query (Day 37):
// const { data, isPending, error, refetch } = useQuery({
//   queryKey: ['products', params], queryFn: ({ signal }) => fetchProducts(params, signal),
//   placeholderData: keepPreviousData,
// });

// src/features/products/ProductCard.jsx
import { Link } from 'react-router';
export function ProductCard({ product }) {
  return (
    <Link to={'/product/' + product.id} className="card">
      <img src={product.thumbnail} alt={product.title} loading="lazy" />
      <h3>{product.title}</h3>
      <p><strong>{formatINR(sellingPrice(product))}</strong> <s>{formatINR(product.price)}</s>
        <span className="off">{Math.round(product.discountPercentage)}% off</span></p>
      <span className="rating">{product.rating.toFixed(1)} ★</span>
    </Link>
  );
}`,
      playground: {
        jsx: `const { useState, useEffect, useCallback } = React;

// ---- utils/format.js ----
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatINR = (usd) => inr.format(usd * 85);
const sellingPrice = (p) => p.price * (1 - p.discountPercentage / 100);

// ---- api/products.js ----
const FIELDS = 'title,price,discountPercentage,rating,stock,thumbnail,category,brand';
async function fetchProducts({ page = 1, limit = 12 }, signal) {
  const params = new URLSearchParams({ limit, skip: (page - 1) * limit, select: FIELDS });
  const res = await fetch('https://dummyjson.com/products?' + params, { signal });
  if (!res.ok) throw new Error('Could not load products (' + res.status + ')');
  return res.json();
}

// ---- useProducts ----
function useProducts(params) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const key = JSON.stringify(params);
  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchProducts(params, controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e) => { if (e.name !== 'AbortError') setState({ data: null, loading: false, error: e.message }); });
    return () => controller.abort();
  }, [key, reloadKey]);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { ...state, reload };
}

// ---- components ----
function ProductCard({ product }) {
  return (
    <a className="card" href={'#/product/' + product.id}>
      <img src={product.thumbnail} alt={product.title} loading="lazy" />
      <h3>{product.title}</h3>
      <p className="price">
        <strong>{formatINR(sellingPrice(product))}</strong> <s>{formatINR(product.price)}</s>
      </p>
      <p className="meta">
        <span className="rating">{product.rating.toFixed(1)} ★</span>
        <span className="off">{Math.round(product.discountPercentage)}% off</span>
      </p>
      {product.stock < 10 && <p className="low">Only {product.stock} left</p>}
    </a>
  );
}

function SkeletonCard() {
  return <div className="card skel" aria-hidden="true"><div className="img" /><div className="line" /><div className="line short" /></div>;
}

function App() {
  const [page, setPage] = useState(1);
  const limit = 12;
  const { data, loading, error, reload } = useProducts({ page, limit });
  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <main>
      <header><h1>🛍 ShopKart</h1><span>{data ? data.total + ' products' : ''}</span></header>
      {error && (
        <div className="error" role="alert"><p>⚠ {error}</p><button onClick={reload}>Retry</button></div>
      )}
      <div className="grid" aria-busy={loading}>
        {loading
          ? Array.from({ length: limit }, (_, i) => <SkeletonCard key={i} />)
          : data && data.products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      <nav className="pager" aria-label="Pagination">
        <button disabled={page === 1 || loading} onClick={() => setPage((p) => p - 1)}>← Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>Next →</button>
      </nav>
    </main>
  );
}`,
        css: `body { background: #f1f5f9; }
main { max-width: 900px; margin: auto; font-family: system-ui, sans-serif; }
header { display: flex; justify-content: space-between; align-items: center; }
h1 { color: #2563eb; font-size: 22px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.card { background: #fff; border-radius: 12px; padding: 10px; text-decoration: none; color: inherit; display: flex; flex-direction: column; gap: 4px; transition: box-shadow .2s; }
.card:hover { box-shadow: 0 6px 20px rgba(15,23,42,.12); }
.card img { width: 100%; aspect-ratio: 1; object-fit: contain; background: #f8fafc; border-radius: 8px; }
.card h3 { font-size: 14px; margin: 4px 0 0; }
.price { margin: 0; }
.price s { color: #94a3b8; font-size: 12px; }
.meta { display: flex; gap: 8px; margin: 0; font-size: 12px; }
.rating { background: #16a34a; color: #fff; padding: 1px 6px; border-radius: 4px; }
.off { color: #16a34a; font-weight: 600; }
.low { color: #dc2626; font-size: 12px; margin: 0; }
.skel .img { aspect-ratio: 1; border-radius: 8px; }
.skel .img, .skel .line { background: linear-gradient(90deg, #e2e8f0, #f8fafc, #e2e8f0); background-size: 200% 100%; animation: sh 1.2s infinite; }
.skel .line { height: 12px; border-radius: 6px; }
.skel .short { width: 50%; }
@keyframes sh { to { background-position: -200% 0; } }
.pager { display: flex; justify-content: center; align-items: center; gap: 12px; margin: 16px 0; }
.pager button { padding: 8px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; }
.pager button:disabled { opacity: .4; cursor: not-allowed; }
.error { background: #fee2e2; color: #991b1b; padding: 12px; border-radius: 10px; margin-bottom: 12px; }`,
      },
      result: 'Twelve shimmering skeleton cards, then a responsive grid of product cards with image, title, ₹ selling price, struck MRP, a green rating badge, % off and "Only N left" for low stock. Prev/Next moves through 17 pages.',
      explanation:
        "The API function builds limit/skip from the page number and requests only the fields the card needs with select=, making responses much smaller. useProducts serialises params into a key so the effect re-runs only when the actual values change, aborts outdated requests and exposes reload for the Retry button. Skeleton cards have the same size as real cards, so nothing jumps when data arrives. All currency formatting goes through one helper, so switching to real INR prices later is a one-line change.",
    },
    {
      title: 'Feature 2: Categories, debounced search, sort and price filter in the URL',
      scenario: 'Add a filter bar: category dropdown from /products/categories, a search box (debounced), sort (price, rating) and a max price slider. All filters live in the query string so "?category=laptops&sort=price-asc" can be shared.',
      steps: [
        'Fetch categories once from /products/categories ([{ slug, name }])',
        'Extend fetchProducts: q → /products/search, category → /products/category/:slug, sort → sortBy & order',
        'Read filters from useSearchParams (real) / useSearchParamsLite (playground)',
        'Keep the search text in local state, debounce 400 ms, then write q to the URL with replace: true',
        'Reset page whenever a filter changes; show an empty state with "Clear filters"',
        'Run the playground: choose Laptops, sort by price, then search "mac"',
      ],
      code: `// src/features/products/ProductsPage.jsx (real app)
import { useSearchParams } from 'react-router';
import { useEffect, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useProducts } from './useProducts';

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const filters = {
    q: params.get('q') ?? '',
    category: params.get('category') ?? '',
    sort: params.get('sort') ?? '',
    maxPrice: Number(params.get('maxPrice') ?? 0),
    page: Number(params.get('page') ?? 1),
  };
  const [text, setText] = useState(filters.q);
  const debounced = useDebounce(text, 400);

  function update(key, value, options) {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== 'page') next.delete('page');
    if (key === 'q') next.delete('category');        // API: search OR category
    if (key === 'category') next.delete('q');
    setParams(next, options);
  }

  useEffect(() => {
    if (debounced !== filters.q) update('q', debounced.trim(), { replace: true });
  }, [debounced]);

  const { data, loading, error, reload } = useProducts(filters);
  const visible = (data?.products ?? []).filter((p) => !filters.maxPrice || p.price * 85 <= filters.maxPrice);
  // ...render Filters, ProductGrid, Pagination, EmptyState
}`,
      playground: {
        jsx: `const { useState, useEffect, useCallback } = React;

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatINR = (usd) => inr.format(usd * 85);
const sellingPrice = (p) => p.price * (1 - p.discountPercentage / 100);

// Playground stand-in for React Router's useSearchParams (same API shape)
function useSearchParamsLite(initial) {
  const [params, setParamsState] = useState(() => new URLSearchParams(initial));
  const setParams = useCallback((next) => setParamsState(new URLSearchParams(next)), []);
  return [params, setParams];
}
function useDebounce(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), delay); return () => clearTimeout(id); }, [value, delay]);
  return v;
}

async function fetchProducts({ q, category, sort, page }, signal) {
  const limit = 12;
  const params = new URLSearchParams({ limit, skip: (page - 1) * limit, select: 'title,price,discountPercentage,rating,thumbnail,category' });
  if (sort) { const [by, order] = sort.split('-'); params.set('sortBy', by); params.set('order', order); }
  let path = '/products';
  if (q) { path = '/products/search'; params.set('q', q); } else if (category) path = '/products/category/' + category;
  const res = await fetch('https://dummyjson.com' + path + '?' + params, { signal });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

function useFetch(fn, key) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    const c = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fn(c.signal).then((data) => setState({ data, loading: false, error: null }))
      .catch((e) => { if (e.name !== 'AbortError') setState({ data: null, loading: false, error: e.message }); });
    return () => c.abort();
  }, [key]);
  return state;
}

function App() {
  const [params, setParams] = useSearchParamsLite('sort=rating-desc');
  const filters = {
    q: params.get('q') || '',
    category: params.get('category') || '',
    sort: params.get('sort') || '',
    maxPrice: Number(params.get('maxPrice') || 0),
    page: Number(params.get('page') || 1),
  };
  const [text, setText] = useState(filters.q);
  const debounced = useDebounce(text.trim(), 400);

  function update(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    if (key === 'q' && value) next.delete('category');
    if (key === 'category' && value) { next.delete('q'); setText(''); }
    setParams(next);
  }
  useEffect(() => { if (debounced !== filters.q) update('q', debounced); }, [debounced]);

  const cats = useFetch((s) => fetch('https://dummyjson.com/products/categories', { signal: s }).then((r) => r.json()), 'cats');
  const { data, loading, error } = useFetch((s) => fetchProducts(filters, s), JSON.stringify([filters.q, filters.category, filters.sort, filters.page]));
  const visible = (data ? data.products : []).filter((p) => !filters.maxPrice || sellingPrice(p) * 85 <= filters.maxPrice);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / 12)) : 1;

  return (
    <main>
      <h1>🛍 ShopKart</h1>
      <p className="url">URL: /?{params.toString() || '(no filters)'}</p>
      <div className="filters">
        <input aria-label="Search products" value={text} onChange={(e) => setText(e.target.value)} placeholder="Search e.g. mac, perfume" />
        <select aria-label="Category" value={filters.category} onChange={(e) => update('category', e.target.value)}>
          <option value="">All categories</option>
          {(cats.data || []).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select aria-label="Sort" value={filters.sort} onChange={(e) => update('sort', e.target.value)}>
          <option value="">Relevance</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Customer rating</option>
        </select>
        <label className="range">Max {filters.maxPrice ? formatINR(filters.maxPrice / 85) : 'any'}
          <input type="range" min="0" max="200000" step="5000" value={filters.maxPrice} onChange={(e) => update('maxPrice', e.target.value === '0' ? '' : e.target.value)} />
        </label>
      </div>

      {error && <p className="err" role="alert">⚠ {error}</p>}
      {loading && <p>Loading…</p>}
      {!loading && !error && visible.length === 0 && (
        <div className="empty"><p>No products match these filters.</p><button onClick={() => { setText(''); setParams(''); }}>Clear filters</button></div>
      )}
      {!loading && (
        <ul className="list">
          {visible.map((p) => (
            <li key={p.id}>
              <img src={p.thumbnail} alt={p.title} width="56" height="56" loading="lazy" />
              <div><b>{p.title}</b><small>{p.category} · {p.rating.toFixed(1)} ★</small></div>
              <strong>{formatINR(sellingPrice(p))}</strong>
            </li>
          ))}
        </ul>
      )}
      <nav className="pager">
        <button disabled={filters.page <= 1} onClick={() => update('page', String(filters.page - 1))}>←</button>
        <span>{filters.page} / {totalPages}</span>
        <button disabled={filters.page >= totalPages} onClick={() => update('page', String(filters.page + 1))}>→</button>
      </nav>
    </main>
  );
}`,
        css: `main { max-width: 720px; margin: auto; font-family: system-ui, sans-serif; }
h1 { color: #2563eb; font-size: 22px; margin-bottom: 4px; }
.url { font-family: monospace; background: #0f172a; color: #a5f3fc; padding: 6px 10px; border-radius: 8px; font-size: 12px; overflow-x: auto; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.filters input[type=text], .filters input:not([type]), select { padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
.filters input:not([type]) { flex: 1; min-width: 160px; }
.range { display: flex; flex-direction: column; font-size: 12px; color: #475569; }
.list { list-style: none; padding: 0; }
.list li { display: flex; align-items: center; gap: 10px; padding: 8px; border-bottom: 1px solid #f1f5f9; }
.list img { object-fit: contain; background: #f8fafc; border-radius: 8px; }
.list div { flex: 1; display: flex; flex-direction: column; }
.list small { color: #64748b; }
.empty { text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px; }
.err { color: #b91c1c; }
.pager { display: flex; gap: 12px; justify-content: center; align-items: center; }
button { padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; }
button:disabled { opacity: .4; }`,
      },
      result: 'A filter bar and the live "URL" line. Choosing Laptops changes the URL to sort=rating-desc&category=laptops and lists laptops; sorting by price updates instantly; typing "mac" (after a short pause) switches to search results and removes the category; the max price slider hides costlier items; "Clear filters" appears when nothing matches.',
      explanation:
        "Every filter is read from the params object on each render, so there is exactly one source of truth (in the real app, the browser URL). update() copies the params, changes one key and resets the page, which prevents empty pages after a filter change. The search box keeps instant local text for typing but only writes the debounced value to the URL. Because dummyjson cannot combine search and category, choosing one clears the other, and the price filter is applied on the client to the current page; a production backend would accept all filters in one request.",
    },
    {
      title: 'Feature 3: Product details page with gallery, stock and reviews',
      scenario: 'The /product/:id page: image gallery with thumbnails, brand, title, rating, ₹ price with discount, stock status, warranty and shipping info, a quantity picker, Add to cart, and customer reviews.',
      steps: [
        'Add the route <Route path="/product/:id" element={<ProductDetails />} /> and read id with useParams',
        'Create useProduct(id) that fetches /products/:id and handles 404 ("Product not found")',
        'Keep the selected image index in local state; thumbnails are buttons',
        'Quantity picker limited to 1..stock; disable Add to cart when out of stock',
        'Render reviews with stars, name and date (toLocaleDateString("en-IN"))',
        'Set document.title to the product name for SEO and browser tabs',
      ],
      code: `// src/features/products/ProductDetails.jsx
import { useParams, Link } from 'react-router';
import { useEffect, useState } from 'react';
import { useProduct } from './useProduct';
import { useCart } from '../cart/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const { data: product, loading, error } = useProduct(id);
  const { addToCart } = useCart();
  const [imageIndex, setImageIndex] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => { if (product) document.title = product.title + ' | ShopKart'; }, [product]);

  if (loading) return <DetailsSkeleton />;
  if (error) return <ErrorState message={error} />;       // "Product not found" for 404
  return (
    <article className="details">
      <Link to={-1}>← Back</Link>
      {/* gallery, info, qty picker, add to cart, reviews (see playground) */}
      <button disabled={product.stock === 0} onClick={() => addToCart(product, qty)}>Add to cart</button>
    </article>
  );
}

// src/features/products/useProduct.js
export function useProduct(id) {
  // same pattern as useProducts; fetch('https://dummyjson.com/products/' + id)
  // if (res.status === 404) throw new Error('Product not found');
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatINR = (usd) => inr.format(usd * 85);
const sellingPrice = (p) => p.price * (1 - p.discountPercentage / 100);

function useProduct(id) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    const c = new AbortController();
    setState({ data: null, loading: true, error: null });
    fetch('https://dummyjson.com/products/' + id, { signal: c.signal })
      .then((r) => { if (r.status === 404) throw new Error('Product not found'); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e) => { if (e.name !== 'AbortError') setState({ data: null, loading: false, error: e.message }); });
    return () => c.abort();
  }, [id]);
  return state;
}

const Stars = ({ value }) => <span className="stars" aria-label={value + ' out of 5'}>{'★★★★★'.slice(0, Math.round(value))}<span>{'★★★★★'.slice(Math.round(value))}</span></span>;

function ProductDetails({ id, onAdd }) {
  const { data: p, loading, error } = useProduct(id);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  useEffect(() => { setImg(0); setQty(1); }, [id]);
  useEffect(() => { if (p) document.title = p.title + ' | ShopKart'; }, [p]);

  if (loading) return <div className="skel" aria-busy="true" />;
  if (error) return <p className="err" role="alert">⚠ {error}</p>;
  const out = p.stock === 0;
  return (
    <article className="details">
      <div className="gallery">
        <img className="main" src={p.images[img]} alt={p.title + ' image ' + (img + 1)} />
        <div className="thumbs">
          {p.images.map((src, i) => (
            <button key={src} className={i === img ? 'on' : ''} onClick={() => setImg(i)} aria-label={'Show image ' + (i + 1)}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </div>
      <div className="info">
        <small className="brand">{p.brand || p.category}</small>
        <h2>{p.title}</h2>
        <p><span className="badge">{p.rating.toFixed(1)} ★</span> {p.reviews.length} reviews</p>
        <p className="price"><strong>{formatINR(sellingPrice(p))}</strong> <s>{formatINR(p.price)}</s> <span className="off">{Math.round(p.discountPercentage)}% off</span></p>
        <p className={out ? 'err' : p.stock < 10 ? 'low' : 'ok'}>{out ? 'Out of stock' : p.stock < 10 ? 'Hurry, only ' + p.stock + ' left' : 'In stock'}</p>
        <p>{p.description}</p>
        <ul className="facts"><li>🛡 {p.warrantyInformation}</li><li>🚚 {p.shippingInformation}</li><li>↩ {p.returnPolicy}</li></ul>
        <div className="buy">
          <div className="qty">
            <button aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty(qty - 1)}>−</button>
            <span aria-live="polite">{qty}</span>
            <button aria-label="Increase quantity" disabled={qty >= p.stock} onClick={() => setQty(qty + 1)}>+</button>
          </div>
          <button className="add" disabled={out} onClick={() => onAdd(p, qty)}>🛒 Add to cart</button>
        </div>
        <h3>Customer reviews</h3>
        {p.reviews.map((r, i) => (
          <div key={i} className="review">
            <Stars value={r.rating} /> <b>{r.reviewerName}</b>
            <small> · {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</small>
            <p>{r.comment}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function App() {
  const [id, setId] = useState(121);
  const [msg, setMsg] = useState('');
  return (
    <main>
      <nav className="demo">Try product: {[121, 78, 6, 9999].map((n) => <button key={n} onClick={() => setId(n)} className={n === id ? 'on' : ''}>#{n}</button>)}</nav>
      {msg && <p className="toast" role="status">{msg}</p>}
      <ProductDetails id={id} onAdd={(p, q) => setMsg('Added ' + q + ' × ' + p.title + ' to cart')} />
    </main>
  );
}`,
        css: `main { max-width: 860px; margin: auto; font-family: system-ui, sans-serif; }
.demo button { margin-left: 6px; }
button { cursor: pointer; border: 1px solid #cbd5e1; background: #fff; border-radius: 8px; padding: 6px 10px; }
button.on { background: #2563eb; color: #fff; border-color: #2563eb; }
button:disabled { opacity: .4; cursor: not-allowed; }
.details { display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 12px; }
@media (min-width: 640px) { .details { grid-template-columns: 1fr 1.2fr; } }
.main { width: 100%; aspect-ratio: 1; object-fit: contain; background: #f8fafc; border-radius: 12px; }
.thumbs { display: flex; gap: 6px; margin-top: 6px; }
.thumbs button { padding: 2px; }
.thumbs img { width: 52px; height: 52px; object-fit: contain; }
.brand { color: #2563eb; text-transform: uppercase; font-weight: 600; }
h2 { margin: 4px 0; }
.badge { background: #16a34a; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
.price strong { font-size: 26px; }
.price s { color: #94a3b8; }
.off { color: #16a34a; font-weight: 700; }
.ok { color: #16a34a; } .low { color: #ea580c; font-weight: 600; } .err { color: #dc2626; font-weight: 600; }
.facts { padding-left: 18px; color: #475569; }
.buy { display: flex; gap: 10px; align-items: center; }
.qty { display: flex; align-items: center; gap: 8px; }
.add { background: #f59e0b; color: #fff; border: 0; padding: 10px 18px; font-weight: 700; }
.review { border-top: 1px solid #f1f5f9; padding: 8px 0; }
.review p { margin: 4px 0 0; }
.stars { color: #f59e0b; } .stars span { color: #e2e8f0; }
.toast { background: #dcfce7; color: #166534; padding: 8px 12px; border-radius: 8px; }
.skel { height: 300px; border-radius: 12px; background: #e2e8f0; }`,
      },
      result: 'An Apple iPhone 5s details page (product #121): large image with clickable thumbnails, brand, title, rating badge, ₹ price with MRP and % off, stock status, description, warranty/shipping/return facts, a quantity picker limited to the stock, Add to cart (shows a green confirmation) and the customer reviews. Product #9999 shows "Product not found".',
      explanation:
        "In the real app the id comes from useParams(); here buttons change it to show the same component with different data. useProduct turns a 404 into a friendly error message. Resetting the gallery index and quantity when the id changes prevents showing image 4 of a product that has only 1 image. The quantity buttons are bounded by stock and have aria-labels, the quantity is announced with aria-live, and Add to cart is disabled when out of stock, all common interview follow-up points.",
    },
    {
      title: 'Feature 4: Cart with Context + useReducer (and reducer tests)',
      scenario: 'Implement the cart: CartProvider with cartReducer, a useCart hook exposing addToCart, setQty, remove, clear and derived count/subtotal/total, plus a header badge that updates from anywhere.',
      steps: [
        'Write cartReducer as a pure function (ADD, SET_QTY, REMOVE, CLEAR)',
        'Create CartContext, CartProvider (useReducer + useMemo value) and useCart (throws outside the provider)',
        'Compute count, MRP total, discount, delivery and total with a selector function',
        'Wrap <App /> in <CartProvider> in main.jsx',
        'Use useCart() in the header (badge) and product cards (Add to cart)',
        'Run the playground: the console shows quick reducer tests, the UI shows the cart',
      ],
      code: `// src/features/cart/CartContext.jsx
import { createContext, useContext, useMemo, useReducer, useEffect } from 'react';
import { cartReducer } from './cartReducer';

const CartContext = createContext(null);
const KEY = 'shopkart:cart';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) ?? []; } catch { return []; } };

export function selectTotals(items) {
  const mrp = items.reduce((s, l) => s + l.price * l.qty, 0);
  const subtotal = items.reduce((s, l) => s + l.price * (1 - l.discountPercentage / 100) * l.qty, 0);
  const deliveryINR = subtotal * 85 >= 499 || items.length === 0 ? 0 : 40;
  return { count: items.reduce((s, l) => s + l.qty, 0), mrp, discount: mrp - subtotal, subtotal, deliveryINR };
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, load);    // lazy init from storage
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {} }, [items]);

  const value = useMemo(() => ({
    items,
    ...selectTotals(items),
    addToCart: (product, qty = 1) => dispatch({ type: 'ADD', product, qty }),
    setQty: (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
    remove: (id) => dispatch({ type: 'REMOVE', id }),
    clear: () => dispatch({ type: 'CLEAR' }),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

// cartReducer.test.js (Vitest)
// test('ADD twice increases qty', () => {
//   const s1 = cartReducer([], { type: 'ADD', product: phone, qty: 1 });
//   expect(cartReducer(s1, { type: 'ADD', product: phone, qty: 2 })[0].qty).toBe(3);
// });`,
      playground: {
        jsx: `const { createContext, useContext, useMemo, useReducer } = React;

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatINR = (usd) => inr.format(usd * 85);

// ---- cartReducer.js ----
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, qty = 1 } = action;
      const line = state.find((l) => l.id === product.id);
      if (line) return state.map((l) => (l.id === product.id ? { ...l, qty: Math.min(l.qty + qty, l.stock) } : l));
      const { id, title, price, discountPercentage, thumbnail, stock } = product;
      return [...state, { id, title, price, discountPercentage, thumbnail, stock, qty: Math.min(qty, stock) }];
    }
    case 'SET_QTY':
      return action.qty <= 0
        ? state.filter((l) => l.id !== action.id)
        : state.map((l) => (l.id === action.id ? { ...l, qty: Math.min(action.qty, l.stock) } : l));
    case 'REMOVE':
      return state.filter((l) => l.id !== action.id);
    case 'CLEAR':
      return [];
    default:
      throw new Error('Unknown action: ' + action.type);
  }
}

// quick tests (Vitest in a real project)
(function testReducer() {
  const phone = { id: 1, title: 'Phone', price: 100, discountPercentage: 10, thumbnail: '', stock: 3 };
  let s = cartReducer([], { type: 'ADD', product: phone });
  s = cartReducer(s, { type: 'ADD', product: phone, qty: 5 });
  console.log('qty capped at stock (3):', s[0].qty === 3 ? 'PASS' : 'FAIL');
  console.log('SET_QTY 0 removes line:', cartReducer(s, { type: 'SET_QTY', id: 1, qty: 0 }).length === 0 ? 'PASS' : 'FAIL');
  console.log('original state not mutated:', s.length === 1 ? 'PASS' : 'FAIL');
})();

function selectTotals(items) {
  const mrp = items.reduce((s, l) => s + l.price * l.qty, 0);
  const subtotal = items.reduce((s, l) => s + l.price * (1 - l.discountPercentage / 100) * l.qty, 0);
  const deliveryINR = items.length === 0 || subtotal * 85 >= 499 ? 0 : 40;
  return { count: items.reduce((s, l) => s + l.qty, 0), mrp, discount: mrp - subtotal, subtotal, deliveryINR };
}

// ---- CartContext.jsx ----
const CartContext = createContext(null);
function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const value = useMemo(() => ({
    items,
    ...selectTotals(items),
    addToCart: (product, qty) => dispatch({ type: 'ADD', product, qty }),
    setQty: (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
    remove: (id) => dispatch({ type: 'REMOVE', id }),
    clear: () => dispatch({ type: 'CLEAR' }),
  }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

// ---- components (far apart in the tree, no prop drilling) ----
const PRODUCTS = [
  { id: 1, title: 'Noise Smartwatch', price: 35, discountPercentage: 20, stock: 5, thumbnail: '⌚' },
  { id: 2, title: 'boAt Earbuds', price: 18, discountPercentage: 35, stock: 2, thumbnail: '🎧' },
  { id: 3, title: 'Cotton Kurta', price: 4, discountPercentage: 10, stock: 10, thumbnail: '👕' },
];

function Header() {
  const { count } = useCart();
  return <header><h1>🛍 ShopKart</h1><span className="badge" aria-live="polite">🛒 {count}</span></header>;
}

function ProductList() {
  const { addToCart, items } = useCart();
  return (
    <ul className="products">
      {PRODUCTS.map((p) => {
        const inCart = items.find((l) => l.id === p.id);
        return (
          <li key={p.id}>
            <span className="emoji">{p.thumbnail}</span>
            <b>{p.title}</b>
            <span>{formatINR(p.price * (1 - p.discountPercentage / 100))}</span>
            <button disabled={inCart && inCart.qty >= p.stock} onClick={() => addToCart(p, 1)}>
              {inCart ? 'Add more (' + inCart.qty + ')' : 'Add to cart'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function MiniCart() {
  const { items, setQty, remove, clear, mrp, discount, subtotal, deliveryINR } = useCart();
  if (!items.length) return <p className="empty">Your cart is empty.</p>;
  return (
    <section className="cart">
      {items.map((l) => (
        <div key={l.id} className="line">
          <span>{l.thumbnail} {l.title}</span>
          <div className="qty">
            <button aria-label="Decrease" onClick={() => setQty(l.id, l.qty - 1)}>−</button>
            <span>{l.qty}</span>
            <button aria-label="Increase" disabled={l.qty >= l.stock} onClick={() => setQty(l.id, l.qty + 1)}>+</button>
          </div>
          <button className="link" onClick={() => remove(l.id)}>Remove</button>
        </div>
      ))}
      <dl>
        <dt>Price (MRP)</dt><dd>{formatINR(mrp)}</dd>
        <dt>Discount</dt><dd className="green">− {formatINR(discount)}</dd>
        <dt>Delivery</dt><dd>{deliveryINR ? '₹' + deliveryINR : 'FREE'}</dd>
        <dt><b>Total</b></dt><dd><b>{inr.format(subtotal * 85 + deliveryINR)}</b></dd>
      </dl>
      <button className="link" onClick={clear}>Clear cart</button>
    </section>
  );
}

function App() {
  return (
    <CartProvider>
      <main>
        <Header />
        <ProductList />
        <MiniCart />
      </main>
    </CartProvider>
  );
}`,
        css: `main { max-width: 480px; margin: auto; font-family: system-ui, sans-serif; }
header { display: flex; justify-content: space-between; align-items: center; }
h1 { color: #2563eb; font-size: 22px; }
.badge { background: #f59e0b; color: #fff; border-radius: 999px; padding: 4px 12px; font-weight: 700; }
.products { list-style: none; padding: 0; }
.products li { display: grid; grid-template-columns: 36px 1fr auto auto; gap: 8px; align-items: center; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
.emoji { font-size: 26px; }
button { cursor: pointer; border: 1px solid #cbd5e1; background: #fff; border-radius: 8px; padding: 5px 10px; }
button:disabled { opacity: .4; }
.cart { background: #f8fafc; padding: 12px; border-radius: 12px; margin-top: 12px; }
.line { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 6px 0; }
.qty { display: flex; align-items: center; gap: 6px; }
.link { border: 0; background: none; color: #2563eb; }
dl { display: grid; grid-template-columns: 1fr auto; gap: 4px; border-top: 1px dashed #cbd5e1; padding-top: 8px; }
dd { margin: 0; text-align: right; }
.green { color: #16a34a; }
.empty { color: #64748b; text-align: center; }`,
      },
      result: 'The console prints three PASS lines for the reducer tests. Clicking Add to cart updates the 🛒 badge in the header, the button label ("Add more (2)") and the cart with quantity controls, MRP, discount, delivery (₹40 below ₹499, FREE above) and total. Earbuds stop at 2 because only 2 are in stock.',
      explanation:
        "The reducer is a pure function, so it can be tested without rendering anything; quantity is capped at stock in one place. Header, ProductList and MiniCart are siblings that never pass cart props to each other: they all read the same context through useCart(). Totals are derived by selectTotals on each change, never stored. The context value is memoised with useMemo so consumers re-render only when items change. useCart throws a clear error if someone forgets the provider, a pattern used in most company codebases.",
    },
    {
      title: 'Complete Part 1 app: ShopKart (listing, filters, details, cart, persistence)',
      scenario: 'All features together with a tiny router: home with category chips, search and sort; product details; cart page with price summary; header cart badge; and the cart saved in localStorage so it survives a refresh.',
      steps: [
        'Set up routes: /, /product/:id, /cart and a 404 in AppRoutes with a MainLayout (Header + Outlet)',
        'Wrap everything in <CartProvider> (which now loads and saves localStorage)',
        'Home: filters from the URL + product grid; Details: useProduct + Add to cart; Cart: lines + summary',
        'Add a toast "Added to cart" and an empty-cart state with a "Continue shopping" link',
        'Test: add items, refresh (click Run again): the cart is still there',
        'Commit: feat(cart): persist cart in localStorage',
      ],
      code: `// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { CartProvider } from './features/cart/CartContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </StrictMode>
);

// src/App.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout';
import ProductsPage from './features/products/ProductsPage';
const ProductDetails = lazy(() => import('./features/products/ProductDetails'));
const CartPage = lazy(() => import('./features/cart/CartPage'));

export default function App() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<ProductsPage />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}`,
      playground: {
        jsx: `const { useState, useEffect, useReducer, useMemo, createContext, useContext, useCallback } = React;

/* ---------- utils ---------- */
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatINR = (usd) => inr.format(usd * 85);
const sellingPrice = (p) => p.price * (1 - p.discountPercentage / 100);
const API = 'https://dummyjson.com';
const FIELDS = 'title,price,discountPercentage,rating,stock,thumbnail,category,brand';

/* ---------- tiny router (stand-in for React Router) ---------- */
const RouterContext = createContext(null);
function Router({ children }) {
  const [path, setPath] = useState('/');
  const navigate = useCallback((to) => { setPath(to); try { window.scrollTo(0, 0); } catch (e) {} }, []);
  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}
const useRouter = () => useContext(RouterContext);
function Link({ to, children, className }) {
  const { navigate } = useRouter();
  return <a href={'#' + to} className={className} onClick={(e) => { e.preventDefault(); navigate(to); }}>{children}</a>;
}

/* ---------- data hook ---------- */
function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [n, setN] = useState(0);
  useEffect(() => {
    const c = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fetch(url, { signal: c.signal })
      .then((r) => { if (r.status === 404) throw new Error('Not found'); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e) => { if (e.name !== 'AbortError') setState({ data: null, loading: false, error: e.message }); });
    return () => c.abort();
  }, [url, n]);
  return { ...state, reload: () => setN((x) => x + 1) };
}

/* ---------- cart ---------- */
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, qty } = action;
      if (state.some((l) => l.id === product.id)) return state.map((l) => (l.id === product.id ? { ...l, qty: Math.min(l.qty + qty, l.stock) } : l));
      const { id, title, price, discountPercentage, thumbnail, stock } = product;
      return [...state, { id, title, price, discountPercentage, thumbnail, stock, qty: Math.min(qty, stock) }];
    }
    case 'SET_QTY': return action.qty <= 0 ? state.filter((l) => l.id !== action.id) : state.map((l) => (l.id === action.id ? { ...l, qty: Math.min(action.qty, l.stock) } : l));
    case 'REMOVE': return state.filter((l) => l.id !== action.id);
    case 'CLEAR': return [];
    default: throw new Error('Unknown action ' + action.type);
  }
}
const CART_KEY = 'shopkart:cart';
const loadCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; } };
const CartContext = createContext(null);
function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart);
  const [toast, setToast] = useState('');
  useEffect(() => { try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) {} }, [items]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 2000); return () => clearTimeout(id); }, [toast]);
  const value = useMemo(() => {
    const mrp = items.reduce((s, l) => s + l.price * l.qty, 0);
    const subtotal = items.reduce((s, l) => s + sellingPrice(l) * l.qty, 0);
    return {
      items, toast,
      count: items.reduce((s, l) => s + l.qty, 0), mrp, subtotal, discount: mrp - subtotal,
      deliveryINR: items.length === 0 || subtotal * 85 >= 499 ? 0 : 40,
      addToCart: (product, qty) => { dispatch({ type: 'ADD', product, qty: qty || 1 }); setToast('Added "' + product.title + '" to cart'); },
      setQty: (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
      remove: (id) => dispatch({ type: 'REMOVE', id }),
      clear: () => dispatch({ type: 'CLEAR' }),
    };
  }, [items, toast]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
const useCart = () => useContext(CartContext);

/* ---------- shared UI ---------- */
function Header() {
  const { count } = useCart();
  return (
    <header className="top">
      <Link to="/" className="logo">🛍 ShopKart</Link>
      <Link to="/cart" className="cartLink">🛒 Cart <span className="badge" aria-live="polite">{count}</span></Link>
    </header>
  );
}
function Price({ p, big }) {
  return (
    <p className={'price' + (big ? ' big' : '')}>
      <strong>{formatINR(sellingPrice(p))}</strong> <s>{formatINR(p.price)}</s> <span className="off">{Math.round(p.discountPercentage)}% off</span>
    </p>
  );
}

/* ---------- pages ---------- */
function HomePage() {
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => { const id = setTimeout(() => setQ(text.trim()), 400); return () => clearTimeout(id); }, [text]);
  const cats = useFetch(API + '/products/category-list');
  const params = new URLSearchParams({ limit: '20', select: FIELDS });
  if (sort) { params.set('sortBy', sort.split('-')[0]); params.set('order', sort.split('-')[1]); }
  let path = '/products';
  if (q) { path = '/products/search'; params.set('q', q); } else if (category) path = '/products/category/' + category;
  const { data, loading, error, reload } = useFetch(API + path + '?' + params);
  const { addToCart } = useCart();

  return (
    <>
      <div className="bar">
        <input aria-label="Search" value={text} onChange={(e) => setText(e.target.value)} placeholder="🔍 Search for products, brands…" />
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Relevance</option><option value="price-asc">Price ↑</option><option value="price-desc">Price ↓</option><option value="rating-desc">Rating</option>
        </select>
      </div>
      <div className="chips">
        {['', ...(cats.data || []).slice(0, 12)].map((c) => (
          <button key={c || 'all'} className={category === c && !q ? 'on' : ''} onClick={() => { setCategory(c); setText(''); setQ(''); }}>{c ? c.replace(/-/g, ' ') : 'All'}</button>
        ))}
      </div>
      {error && <div className="error" role="alert">⚠ {error} <button onClick={reload}>Retry</button></div>}
      {!loading && data && data.products.length === 0 && <p className="empty">No products found for "{q}".</p>}
      <div className="grid" aria-busy={loading}>
        {loading ? Array.from({ length: 8 }, (_, i) => <div key={i} className="card skel" />) : data && data.products.map((p) => (
          <div key={p.id} className="card">
            <Link to={'/product/' + p.id} className="cardLink">
              <img src={p.thumbnail} alt={p.title} loading="lazy" />
              <h3>{p.title}</h3>
            </Link>
            <span className="rating">{p.rating.toFixed(1)} ★</span>
            <Price p={p} />
            <button className="add" disabled={p.stock === 0} onClick={() => addToCart(p, 1)}>{p.stock === 0 ? 'Out of stock' : 'Add to cart'}</button>
          </div>
        ))}
      </div>
    </>
  );
}

function ProductPage({ id }) {
  const { data: p, loading, error } = useFetch(API + '/products/' + id);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  if (loading) return <div className="card skel tall" />;
  if (error) return <p className="error">⚠ {error === 'Not found' ? 'Product not found' : error} · <Link to="/">Go home</Link></p>;
  return (
    <article className="details">
      <div>
        <img className="mainImg" src={p.images[img] || p.thumbnail} alt={p.title} />
        <div className="thumbs">{p.images.map((s, i) => <button key={s} className={i === img ? 'on' : ''} onClick={() => setImg(i)}><img src={s} alt="" /></button>)}</div>
      </div>
      <div>
        <Link to="/">← Back to products</Link>
        <h2>{p.title}</h2>
        <span className="rating">{p.rating.toFixed(1)} ★</span> <small>{p.reviews.length} reviews · {p.availabilityStatus}</small>
        <Price p={p} big />
        <p>{p.description}</p>
        <p className="muted">🚚 {p.shippingInformation} · 🛡 {p.warrantyInformation}</p>
        <div className="buy">
          <button aria-label="Decrease" disabled={qty <= 1} onClick={() => setQty(qty - 1)}>−</button><span>{qty}</span>
          <button aria-label="Increase" disabled={qty >= p.stock} onClick={() => setQty(qty + 1)}>+</button>
          <button className="add" disabled={p.stock === 0} onClick={() => addToCart(p, qty)}>Add to cart</button>
        </div>
      </div>
    </article>
  );
}

function CartPage() {
  const { items, setQty, remove, clear, mrp, discount, subtotal, deliveryINR, count } = useCart();
  if (!items.length) return <div className="empty"><p>🛒 Your cart is empty.</p><Link to="/">Continue shopping</Link></div>;
  return (
    <div className="cartPage">
      <section>
        <h2>My Cart ({count})</h2>
        {items.map((l) => (
          <div key={l.id} className="line">
            <img src={l.thumbnail} alt="" width="64" height="64" />
            <div className="grow">
              <Link to={'/product/' + l.id}>{l.title}</Link>
              <Price p={l} />
              <div className="buy">
                <button aria-label={'Decrease ' + l.title} onClick={() => setQty(l.id, l.qty - 1)}>−</button><span>{l.qty}</span>
                <button aria-label={'Increase ' + l.title} disabled={l.qty >= l.stock} onClick={() => setQty(l.id, l.qty + 1)}>+</button>
                <button className="link" onClick={() => remove(l.id)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
        <button className="link" onClick={clear}>Clear cart</button>
      </section>
      <aside className="summary">
        <h3>Price details</h3>
        <dl>
          <dt>Price ({count} items)</dt><dd>{formatINR(mrp)}</dd>
          <dt>Discount</dt><dd className="green">− {formatINR(discount)}</dd>
          <dt>Delivery</dt><dd>{deliveryINR ? '₹' + deliveryINR : 'FREE'}</dd>
          <dt><b>Total amount</b></dt><dd><b>{inr.format(subtotal * 85 + deliveryINR)}</b></dd>
        </dl>
        <p className="green">You save {formatINR(discount)} on this order</p>
        <button className="add wide" onClick={() => console.log('Checkout comes in Part 2 (Day 59)')}>Place order</button>
      </aside>
    </div>
  );
}

function Routes() {
  const { path } = useRouter();
  const m = path.match(/^\\/product\\/(\\d+)$/);
  if (path === '/') return <HomePage />;
  if (m) return <ProductPage key={m[1]} id={m[1]} />;
  if (path === '/cart') return <CartPage />;
  return <p>404 · <Link to="/">Home</Link></p>;
}

function Toast() {
  const { toast } = useCart();
  return toast ? <div className="toast" role="status">✅ {toast}</div> : null;
}

function App() {
  return (
    <Router>
      <CartProvider>
        <Header />
        <main><Routes /></main>
        <Toast />
      </CartProvider>
    </Router>
  );
}`,
        css: `body { margin: 0; background: #f1f5f9; font-family: system-ui, sans-serif; color: #0f172a; }
a { color: #2563eb; text-decoration: none; }
button { cursor: pointer; border: 1px solid #cbd5e1; background: #fff; border-radius: 8px; padding: 6px 10px; font: inherit; }
button:disabled { opacity: .4; cursor: not-allowed; }
.top { position: sticky; top: 0; z-index: 5; display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #2563eb; }
.top a { color: #fff; font-weight: 700; }
.logo { font-size: 20px; }
.badge { background: #f59e0b; border-radius: 999px; padding: 1px 8px; margin-left: 4px; }
main { max-width: 960px; margin: auto; padding: 12px 16px; }
.bar { display: flex; gap: 8px; }
.bar input { flex: 1; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 15px; }
.chips { display: flex; gap: 6px; overflow-x: auto; padding: 10px 0; }
.chips button { flex: none; text-transform: capitalize; border-radius: 999px; }
.chips .on, .thumbs .on { background: #2563eb; color: #fff; border-color: #2563eb; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(165px, 1fr)); gap: 12px; }
.card { background: #fff; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 4px; }
.cardLink { color: inherit; }
.card img { width: 100%; aspect-ratio: 1; object-fit: contain; background: #f8fafc; border-radius: 8px; }
.card h3 { font-size: 14px; margin: 4px 0 0; }
.skel { min-height: 260px; background: linear-gradient(90deg, #e2e8f0, #f8fafc, #e2e8f0); background-size: 200% 100%; animation: sh 1.2s infinite; }
.tall { min-height: 400px; }
@keyframes sh { to { background-position: -200% 0; } }
.rating { align-self: flex-start; background: #16a34a; color: #fff; padding: 1px 6px; border-radius: 4px; font-size: 12px; }
.price { margin: 0; }
.price s { color: #94a3b8; font-size: 12px; }
.price.big strong { font-size: 26px; }
.off, .green { color: #16a34a; font-weight: 600; font-size: 13px; }
.add { background: #f59e0b; color: #fff; border: 0; font-weight: 700; margin-top: auto; }
.wide { width: 100%; padding: 12px; }
.details { display: grid; gap: 20px; background: #fff; padding: 16px; border-radius: 12px; }
@media (min-width: 680px) { .details { grid-template-columns: 1fr 1.2fr; } .cartPage { grid-template-columns: 2fr 1fr; } }
.mainImg { width: 100%; aspect-ratio: 1; object-fit: contain; }
.thumbs { display: flex; gap: 6px; }
.thumbs img { width: 48px; height: 48px; object-fit: contain; }
.buy { display: flex; gap: 8px; align-items: center; }
.muted { color: #64748b; }
.cartPage { display: grid; gap: 16px; }
.cartPage section, .summary { background: #fff; border-radius: 12px; padding: 14px; align-self: start; }
.line { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.line img { object-fit: contain; }
.grow { flex: 1; }
.link { border: 0; background: none; color: #2563eb; }
dl { display: grid; grid-template-columns: 1fr auto; gap: 6px; }
dd { margin: 0; text-align: right; }
.empty { text-align: center; padding: 30px; background: #fff; border-radius: 12px; }
.error { background: #fee2e2; color: #991b1b; padding: 10px; border-radius: 10px; }
.toast { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); background: #0f172a; color: #fff; padding: 10px 16px; border-radius: 10px; }`,
      },
      result: 'A working mini store: blue sticky header with a cart badge, search and sort, category chips, a product grid with Add to cart and a toast, product pages with gallery and quantity, and a cart page with quantity controls and a Flipkart-style price summary. Items stay in the cart after clicking Run again (when storage is allowed).',
      explanation:
        "The tiny Router/Link/Routes trio mirrors React Router so the page components look like the real ones; in the Vite project you swap them for BrowserRouter, Link and Routes from react-router. CartProvider is the single owner of cart state, uses a lazy initialiser to load from localStorage and an effect to save, and exposes a memoised API. Pages only call useCart(), so the header badge, product cards, details page and cart page all stay in sync. Passing key={id} to ProductPage resets its gallery and quantity state when you move to another product.",
    },
  ],
  interview: [
    { q: 'Explain the architecture of your e-commerce front end.', a: "Feature-based folders: api (fetch/Axios client and products service), features/products (grid, filters, details, hooks), features/cart (context, reducer, pages), shared components, hooks and utils. Server data is fetched with hooks (TanStack Query in production), filters live in the URL with useSearchParams, the cart is global client state in Context + useReducer persisted to localStorage, and routes are lazy-loaded.", level: 'Medium' },
    { q: 'Why did you put filters in the URL instead of useState?', a: "So the state is shareable (send the link), survives refresh, works with the browser back/forward buttons and can be read by analytics. The URL becomes the single source of truth: components read searchParams every render instead of syncing copies with effects.", level: 'Medium' },
    { q: 'Why reset the page number when a filter changes?', a: "The number of pages changes with the filter. If you are on page 6 of all products and choose a category with 2 pages, page 6 would be empty. update() deletes the page param for any key except page itself.", level: 'Easy' },
    { q: 'How does your cart reducer work and why useReducer instead of useState?', a: "One pure function handles ADD (add line or increase qty, capped at stock), SET_QTY (0 removes), REMOVE and CLEAR, returning new arrays immutably. useReducer centralises all transitions, makes them easy to unit test and to log, and keeps components simple (they dispatch intentions instead of computing new arrays).", level: 'Medium' },
    { q: 'Why don\'t you store the cart total in state?', a: "It is derived data. Storing it creates two sources of truth that can go out of sync (e.g. quantity updated but total not). I compute count, MRP, discount, delivery and total from items in a selector, memoised with useMemo if needed.", level: 'Easy' },
    { q: 'How do you persist the cart and what are the risks?', a: "useReducer's lazy initialiser reads localStorage once, and an effect writes on every change; both in try/catch. Risks: storage can be blocked or full, data can be stale (price or stock changed) or edited by the user. So at checkout the server must re-validate prices and stock from product ids; for logged-in users the cart should also be synced to the backend so it works across devices.", level: 'Hard' },
    { q: 'Context re-renders every consumer when the value changes. How would you optimise the cart?', a: "Memoise the value with useMemo; split into CartStateContext and CartDispatchContext so components that only dispatch (Add to cart buttons) do not re-render; or use Zustand/Redux where components subscribe to selected slices (useCartStore(s => s.count)). Also memoise heavy children with React.memo.", level: 'Hard' },
    { q: 'How did you implement search without overloading the API?', a: "The input keeps local text for instant typing; a 400 ms debounce writes the trimmed value to the URL (with replace: true to avoid history spam), and the products hook aborts the previous request with AbortController when params change so stale responses are ignored.", level: 'Medium' },
    { q: 'How do you handle loading, error and empty states in the listing?', a: "Skeleton cards with the same dimensions as real cards (no layout shift) and aria-busy on the grid; an error box with role=alert and a Retry button that re-runs the hook; an empty state with a Clear filters action when no products match.", level: 'Easy' },
    { q: 'How would you make product images fast?', a: "Use thumbnails in the grid and full images only on the details page, loading=\"lazy\" below the fold, fixed aspect-ratio boxes to avoid CLS, modern formats (dummyjson serves WebP), responsive srcset/sizes from an image CDN, and preloading the main image on the details page.", level: 'Medium' },
    { q: 'How do you handle money correctly in JavaScript?', a: "Avoid floating-point arithmetic for money: backends send amounts in the smallest unit (paise) as integers, calculations happen in integers, and formatting uses Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }). The final amount is always calculated on the server.", level: 'Medium' },
    { q: 'What would you change to support 1 lakh products?', a: "Server-side filtering, sorting and pagination for every filter (not client-side), cursor-based infinite scroll with useInfiniteQuery, list virtualisation (react-window) if many items stay in the DOM, a search service (Elasticsearch/Algolia) with typo tolerance and facets, caching with TanStack Query, and CDN caching of category pages.", level: 'Hard' },
    { q: 'How did you make the product page SEO-friendly?', a: "In a client-rendered Vite app I set document.title (or render <title> and <meta> inside the component with React 19) and use semantic HTML. For real SEO, product pages should be server-rendered or statically generated (Next.js, React Router framework mode) with Open Graph tags and JSON-LD Product structured data.", level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add a "Wishlist" feature: a ♡ button on each product card that toggles the product in a wishlist (Context + localStorage), a header badge with the count and a /wishlist page with "Move to cart".',
      hint: 'Create WishlistContext with a Set-like array of ids plus product snapshots. "Move to cart" = addToCart(product) then removeFromWishlist(id).',
      solution: `const { createContext, useContext, useEffect, useMemo, useState } = React;

const WishlistContext = createContext(null);
function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shopkart:wishlist')) || []; } catch (e) { return []; }
  });
  useEffect(() => { try { localStorage.setItem('shopkart:wishlist', JSON.stringify(items)); } catch (e) {} }, [items]);
  const value = useMemo(() => ({
    items,
    has: (id) => items.some((p) => p.id === id),
    toggle: (p) => setItems((list) => (list.some((x) => x.id === p.id) ? list.filter((x) => x.id !== p.id) : [...list, { id: p.id, title: p.title }])),
    remove: (id) => setItems((list) => list.filter((x) => x.id !== id)),
  }), [items]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
const useWishlist = () => useContext(WishlistContext);

const PRODUCTS = [{ id: 1, title: 'Kurta' }, { id: 2, title: 'Saree' }, { id: 3, title: 'Sneakers' }];

function Cards({ onMoveToCart }) {
  const w = useWishlist();
  return (
    <div>
      <p>♡ Wishlist: {w.items.length}</p>
      {PRODUCTS.map((p) => (
        <p key={p.id}>{p.title} <button aria-pressed={w.has(p.id)} onClick={() => w.toggle(p)}>{w.has(p.id) ? '♥' : '♡'}</button></p>
      ))}
      <h3>Wishlist page</h3>
      {w.items.map((p) => (
        <p key={p.id}>{p.title} <button onClick={() => { onMoveToCart(p); w.remove(p.id); }}>Move to cart</button></p>
      ))}
    </div>
  );
}

function App() {
  const [cart, setCart] = useState([]);
  return (
    <WishlistProvider>
      <Cards onMoveToCart={(p) => setCart((c) => [...c, p.title])} />
      <p>Cart: {cart.join(', ') || 'empty'}</p>
    </WishlistProvider>
  );
}`,
    },
    {
      task: 'Replace Prev/Next pagination with infinite scroll: load 12 more products when a sentinel div at the bottom becomes visible (IntersectionObserver), stop when all products are loaded.',
      hint: 'Keep products in an array and append each page. Observe a ref with new IntersectionObserver(([e]) => e.isIntersecting && loadMore(), { rootMargin: "200px" }). Guard against loading twice with a loading flag.',
      solution: `const { useState, useEffect, useRef, useCallback } = React;

function App() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(Infinity);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || items.length >= total) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch('https://dummyjson.com/products?limit=12&select=title,thumbnail&skip=' + items.length);
      const data = await res.json();
      setItems((prev) => [...prev, ...data.products]);
      setTotal(data.total);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [items.length, total]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadMore(); }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  return (
    <div>
      {items.map((p) => <p key={p.id}><img src={p.thumbnail} alt="" width="40" height="40" /> {p.title}</p>)}
      <div ref={sentinel} />
      {loading && <p>Loading more…</p>}
      {items.length >= total && <p>You have seen all {total} products 🎉</p>}
    </div>
  );
}`,
    },
    {
      task: 'Rewrite the cart with Zustand (persist middleware) instead of Context + useReducer, keeping the same API: items, addToCart, setQty, remove, clear, plus a selector for count.',
      hint: 'npm install zustand. create(persist((set) => ({ ... }), { name: "shopkart:cart" })). Components select slices: useCartStore((s) => s.items.reduce(...)).',
      solution: `// src/features/cart/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      addToCart: (product, qty = 1) =>
        set((state) => {
          const line = state.items.find((l) => l.id === product.id);
          if (line) {
            return { items: state.items.map((l) => (l.id === product.id ? { ...l, qty: Math.min(l.qty + qty, l.stock) } : l)) };
          }
          const { id, title, price, discountPercentage, thumbnail, stock } = product;
          return { items: [...state.items, { id, title, price, discountPercentage, thumbnail, stock, qty: Math.min(qty, stock) }] };
        }),
      setQty: (id, qty) =>
        set((state) => ({
          items: qty <= 0 ? state.items.filter((l) => l.id !== id) : state.items.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, l.stock) } : l)),
        })),
      remove: (id) => set((state) => ({ items: state.items.filter((l) => l.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'shopkart:cart' }          // saved to localStorage automatically
  )
);

export const selectCount = (s) => s.items.reduce((n, l) => n + l.qty, 0);

// Header.jsx: re-renders only when the count changes
// const count = useCartStore(selectCount);
// AddButton.jsx: never re-renders because of cart changes
// const addToCart = useCartStore((s) => s.addToCart);`,
    },
    {
      task: 'Add "Recently viewed" products: every time a product details page opens, save { id, title, thumbnail } at the front of a list (max 6, no duplicates) in localStorage and show it as a horizontal strip on the home page.',
      hint: 'Write a pure function addRecent(list, product) and test it. Call it in an effect on the details page when the product loads.',
      solution: `const { useState, useEffect } = React;

function addRecent(list, p) {
  return [{ id: p.id, title: p.title, thumbnail: p.thumbnail }, ...list.filter((x) => x.id !== p.id)].slice(0, 6);
}

function useRecentlyViewed() {
  const [list, setList] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shopkart:recent')) || []; } catch (e) { return []; }
  });
  useEffect(() => { try { localStorage.setItem('shopkart:recent', JSON.stringify(list)); } catch (e) {} }, [list]);
  return [list, (p) => setList((l) => addRecent(l, p))];
}

function App() {
  const [recent, track] = useRecentlyViewed();
  const [id, setId] = useState(1);
  const [product, setProduct] = useState(null);
  useEffect(() => {
    fetch('https://dummyjson.com/products/' + id + '?select=title,thumbnail')
      .then((r) => r.json())
      .then((p) => { setProduct(p); track(p); });
  }, [id]);
  return (
    <div>
      <p>Open product: {[1, 5, 10, 20, 30, 40, 50].map((n) => <button key={n} onClick={() => setId(n)}>#{n}</button>)}</p>
      {product && <h3>{product.title}</h3>}
      <h4>Recently viewed</h4>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
        {recent.map((p) => (
          <button key={p.id} onClick={() => setId(p.id)} style={{ flex: 'none', width: 90 }}>
            <img src={p.thumbnail} alt="" width="60" height="60" /><br /><small>{p.title}</small>
          </button>
        ))}
      </div>
    </div>
  );
}`,
    },
    {
      task: 'Write Vitest unit tests for cartReducer and selectTotals: adding the same product twice, quantity capped at stock, SET_QTY 0 removes the line, REMOVE, CLEAR, free delivery above ₹499 and ₹40 below.',
      hint: 'Create fixtures for two products. Remember USD prices are converted with × 85 in selectTotals. Use describe/it/expect from vitest.',
      solution: `// src/features/cart/cartReducer.test.js
import { describe, it, expect } from 'vitest';
import { cartReducer } from './cartReducer';
import { selectTotals } from './CartContext';

const phone = { id: 1, title: 'Phone', price: 100, discountPercentage: 10, thumbnail: '', stock: 3 };
const pen = { id: 2, title: 'Pen', price: 1, discountPercentage: 0, thumbnail: '', stock: 50 };

describe('cartReducer', () => {
  it('adds a new line and increases qty for the same product', () => {
    let s = cartReducer([], { type: 'ADD', product: phone, qty: 1 });
    s = cartReducer(s, { type: 'ADD', product: phone, qty: 1 });
    expect(s).toHaveLength(1);
    expect(s[0].qty).toBe(2);
  });
  it('caps quantity at stock', () => {
    const s = cartReducer([], { type: 'ADD', product: phone, qty: 10 });
    expect(s[0].qty).toBe(3);
  });
  it('SET_QTY 0 removes the line', () => {
    const s = cartReducer([{ ...phone, qty: 2 }], { type: 'SET_QTY', id: 1, qty: 0 });
    expect(s).toEqual([]);
  });
  it('REMOVE and CLEAR', () => {
    const start = [{ ...phone, qty: 1 }, { ...pen, qty: 1 }];
    expect(cartReducer(start, { type: 'REMOVE', id: 1 })).toEqual([{ ...pen, qty: 1 }]);
    expect(cartReducer(start, { type: 'CLEAR' })).toEqual([]);
  });
  it('does not mutate the previous state', () => {
    const start = Object.freeze([Object.freeze({ ...phone, qty: 1 })]);
    expect(() => cartReducer(start, { type: 'ADD', product: phone, qty: 1 })).not.toThrow();
  });
});

describe('selectTotals', () => {
  it('free delivery above ₹499', () => {
    const t = selectTotals([{ ...phone, qty: 1 }]);       // 90 USD * 85 = ₹7,650
    expect(t.deliveryINR).toBe(0);
    expect(t.discount).toBeCloseTo(10);
  });
  it('₹40 delivery below ₹499', () => {
    expect(selectTotals([{ ...pen, qty: 2 }]).deliveryINR).toBe(40);   // ₹170
  });
});`,
    },
  ],
  quiz: [
    {
      question: 'Which dummyjson request returns page 3 of products with 12 per page?',
      options: ['/products?page=3&size=12', '/products?limit=12&skip=24', '/products?limit=36', '/products/3?limit=12'],
      answer: 1,
      explanation: 'dummyjson uses limit and skip; skip = (page − 1) × limit = 24.',
    },
    {
      question: 'Why store the selected category and sort in useSearchParams?',
      options: ['It is faster than useState', 'React Router requires it', 'The filtered page becomes shareable, refresh-safe and works with back/forward', 'localStorage cannot store strings'],
      answer: 2,
      explanation: 'URL state survives refresh and can be shared and navigated with browser history.',
    },
    {
      question: 'What should the cart reducer return for { type: "SET_QTY", id: 5, qty: 0 }?',
      options: ['A new array without the line with id 5', 'The same array with qty 0 for id 5', 'undefined', 'It should throw an error'],
      answer: 0,
      explanation: 'A quantity of zero means the user removed the item, so the line is filtered out (immutably).',
    },
    {
      question: 'How do you load the initial cart from localStorage only once with useReducer?',
      options: ['Call localStorage in every render', 'Use useEffect to dispatch a LOAD action after every render', 'Store the cart in a global variable', 'Pass an init function as the third argument: useReducer(reducer, undefined, loadCart)'],
      answer: 3,
      explanation: 'The lazy initialiser runs only on the first render, avoiding repeated JSON parsing.',
    },
    {
      question: 'Which value should NOT be kept in its own state variable?',
      options: ['Cart items', 'The cart total amount', 'The search input text', 'The selected image index on the details page'],
      answer: 1,
      explanation: 'The total is derived from items; compute it instead of storing it to avoid out-of-sync state.',
    },
  ],
};
