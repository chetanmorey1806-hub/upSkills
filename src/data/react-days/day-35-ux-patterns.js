export default {
  id: 'day-35-ux-patterns',
  title: 'UX Patterns Used in Every Company: Loading Skeletons, Empty and Error States, Toasts (react-hot-toast), Modals and Confirm Dialogs',
  module: 'Module 7: Industry Project Setup & UI',
  day: 35,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'The difference between a student project and a production app is how it behaves when things are slow, empty or broken. Learn the UX patterns every company expects: skeleton loaders, helpful empty states, error states with retry, toast notifications with react-hot-toast, and accessible modals and confirm dialogs.',
  objectives: [
    'Model every async screen with four states: loading, error, empty and success',
    'Build skeleton loaders that match the final layout and avoid layout shift',
    'Design empty and error states with a clear message and a next action (retry, clear filters, create)',
    'Show feedback with toasts (react-hot-toast): success, error, loading and toast.promise',
    'Build accessible modals and a promise-based confirm dialog for destructive actions',
  ],
  theory: [
    {
      heading: 'Every screen has four states',
      content:
        'Beginners design only the **happy path**: the list with data. Real users also see:\n\n1. **Loading**: data is on the way (slow 4G in a small town, a cold server)\n2. **Error**: network failed, server returned 500, session expired\n3. **Empty**: request succeeded but there is nothing to show (no orders yet, no search results)\n4. **Success**: the data\n\nDesign all four for every screen. In code, check them **in this order**: loading → error → empty → success. A common bug is showing "No orders yet" while data is still loading, or a blank screen when the API fails.\n\nAnalogy: a restaurant. Loading is "your food is being prepared" (not an empty table), error is "sorry, the paneer is finished, may we suggest...", empty is "no bookings today, book now", success is the food arriving.',
      syntax:
        "function OrdersPage() {\n  const { data, isLoading, error, refetch } = useOrders();\n\n  if (isLoading) return <OrdersSkeleton />;\n  if (error) return <ErrorState message={error.message} onRetry={refetch} />;\n  if (data.length === 0) return <EmptyState title=\"No orders yet\" action={<Link to=\"/products\">Start shopping</Link>} />;\n  return <OrdersTable orders={data} />;\n}",
      tip: 'Many teams create one reusable <AsyncView status data error onRetry empty={...}> or use TanStack Query (Day 37) states so no screen forgets a case.',
    },
    {
      heading: 'Loading skeletons (and when to use a spinner)',
      content:
        'A **skeleton** is a grey placeholder shaped like the real content (image box, two text lines, a button). Users perceive skeleton screens as **faster** than a spinner because the page structure appears immediately, and the layout does not jump when data arrives.\n\n**Good skeletons**\n- Match the final layout size (same card height, same number of columns)\n- Use a gentle **shimmer** or pulse animation, and respect `prefers-reduced-motion`\n- Are hidden from screen readers (`aria-hidden="true"`); the container announces loading with `aria-busy="true"` and visually hidden text "Loading products"\n- Do not flash: if data returns in under ~300 ms, a skeleton that blinks for one frame looks worse; delay showing it a little\n\n**Spinners** are still right for **small, local actions**: a button saving ("Saving..."), a form submitting, refreshing a section. Disable the button while it works to prevent double submits (double payments!).',
      syntax:
        "function ProductCardSkeleton() {\n  return (\n    <div className=\"card\" aria-hidden=\"true\">\n      <div className=\"skeleton\" style={{ aspectRatio: '4 / 3' }} />\n      <div className=\"skeleton\" style={{ height: 14, width: '80%', marginTop: 8 }} />\n      <div className=\"skeleton\" style={{ height: 14, width: '40%', marginTop: 6 }} />\n    </div>\n  );\n}\n\n/* CSS */\n.skeleton { background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 6px; }\n@media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }",
    },
    {
      heading: 'Empty states and error states',
      content:
        '**Empty states** are an opportunity, not a dead end. A good empty state has:\n- An illustration or icon (optional)\n- A clear **title**: "No results for \'iphon\'"\n- A short **reason or hint**: "Check the spelling or try another category"\n- A **primary action**: "Clear filters", "Add your first product", "Browse deals"\n\nDistinguish **first-use empty** (new user, nothing created yet) from **no-results empty** (filters too strict).\n\n**Error states**\n- Human message, not `TypeError: Cannot read properties of undefined` or raw `500`\n- Say what happened and what the user can do: "We could not load your orders. Check your internet and try again."\n- A **Retry** button; for 401 redirect to login; for 404 show a not-found page\n- Log technical details to the console / Sentry for developers\n- Keep the rest of the page usable: a failed "Recommendations" widget should not blank the whole page (Error Boundaries, Day 26)\n- Use `role="alert"` so screen readers announce the error',
      syntax:
        "export function EmptyState({ title, description, action }) {\n  return (\n    <div className=\"empty\" role=\"status\">\n      <h3>{title}</h3>\n      {description && <p>{description}</p>}\n      {action}\n    </div>\n  );\n}\n\nexport function ErrorState({ message = 'Something went wrong.', onRetry }) {\n  return (\n    <div className=\"error\" role=\"alert\">\n      <p>{message}</p>\n      {onRetry && <button onClick={onRetry}>Try again</button>}\n    </div>\n  );\n}",
    },
    {
      heading: 'Toast notifications with react-hot-toast',
      content:
        'A **toast** is a small, temporary message ("Added to cart", "Address saved", "Payment failed") that does not block the user. Use toasts for **feedback after an action**, not for critical information the user must read (use an inline error or a dialog for that).\n\n**react-hot-toast** is a tiny, popular library:\n1. `npm install react-hot-toast`\n2. Render `<Toaster />` **once** near the root (in `providers.jsx` or `App.jsx`)\n3. Call `toast()` from **anywhere**, even outside components (an Axios interceptor, Day 36): `toast.success(\'Saved\')`, `toast.error(\'Failed\')`, `toast.loading(\'Uploading...\')`\n4. `toast.promise(promise, { loading, success, error })` shows loading and then success or error automatically\n\nGood practice: short messages, success toasts auto-dismiss (2-4 s), error toasts stay a little longer, do not stack 10 toasts for one action (reuse an `id`), and keep toasts in an `aria-live` region (react-hot-toast does this). Alternatives: **sonner** (used by shadcn/ui), react-toastify, MUI Snackbar, antd message.',
      syntax:
        "// App.jsx\nimport { Toaster } from 'react-hot-toast';\n<Toaster position=\"top-right\" toastOptions={{ duration: 3000 }} />\n\n// anywhere\nimport toast from 'react-hot-toast';\ntoast.success('Added to cart');\ntoast.error('Could not apply coupon');\n\nawait toast.promise(saveAddress(form), {\n  loading: 'Saving address...',\n  success: 'Address saved',\n  error: err => 'Save failed: ' + err.message,\n});",
    },
    {
      heading: 'Modals and confirm dialogs',
      content:
        'A **modal** blocks the page until the user responds. Use it for focused tasks (edit address, quick view) and for **confirming destructive or expensive actions** (delete product, cancel order, logout from all devices). Do not use modals for simple information that a toast or inline message can show.\n\n**Accessibility checklist** (libraries like Radix/shadcn Dialog, MUI Dialog and the native `<dialog>` with `showModal()` handle most of it):\n- `role="dialog"` (or `alertdialog` for confirmations), `aria-modal="true"`, labelled by its title\n- Focus moves into the modal (for a delete confirm, focus **Cancel**, the safe option) and is **trapped** inside\n- **Escape** closes; clicking the backdrop closes (except for critical flows)\n- Focus returns to the button that opened it\n- Background does not scroll; render through a **portal** (`createPortal`, Day 26) so z-index and overflow of parents cannot clip it\n\n**Confirm dialog UX**: say exactly what will happen ("Delete \'Redmi Note 13\'? This cannot be undone."), use a specific verb on the button ("Delete", not "OK"), colour the destructive button red, and consider **undo** (a toast with an Undo button) instead of confirmation for low-risk actions.\n\nA neat industry pattern is a **promise-based confirm**: `const ok = await confirm({ title, description })`, which reads like `window.confirm` but shows your own styled, accessible dialog.',
      syntax:
        "const confirm = useConfirm();\n\nasync function handleDelete(product) {\n  const ok = await confirm({\n    title: 'Delete \"' + product.title + '\"?',\n    description: 'This cannot be undone.',\n    confirmText: 'Delete',\n    danger: true,\n  });\n  if (!ok) return;\n  await toast.promise(api.deleteProduct(product.id), {\n    loading: 'Deleting...', success: 'Product deleted', error: 'Delete failed',\n  });\n}",
      tip: 'Coming next (Day 36): Axios in depth: one API service layer where these loading, error and toast patterns are wired up centrally.',
    },
  ],
  examples: [
    {
      title: 'Skeleton loading for a product grid (real API)',
      scenario: 'Load 6 products from dummyjson.com (with an artificial 1.5 s delay so you can see the skeleton). Show skeleton cards with the same size as the real cards, then the products.',
      steps: [
        'Create ProductCardSkeleton that mirrors the real card (image box + 2 lines)',
        'While loading, render 6 skeletons inside a container with aria-busy="true"',
        'Add visually hidden "Loading products" text for screen readers',
        'Fetch https://dummyjson.com/products?limit=6&delay=1500 with AbortController cleanup',
        'Run the playground; click Reload to see the skeleton again',
      ],
      code: `// src/features/products/components/ProductGrid.jsx
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';

export function ProductGrid() {
  const { products, isLoading, error, reload } = useProducts({ limit: 6 });
  return (
    <section aria-busy={isLoading} aria-labelledby="products-title">
      <h2 id="products-title">Top deals</h2>
      {isLoading && <span className="sr-only">Loading products</span>}
      {error && <ErrorState message="Could not load products." onRetry={reload} />}
      <div className="grid">
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => <ProductCardSkeleton key={i} />)
          : products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}`,
      playground: {
        jsx: `function useProducts(limit) {
  const [state, setState] = React.useState({ status: 'loading', products: [], error: null });
  const [reloadKey, setReloadKey] = React.useState(0);
  React.useEffect(() => {
    const ctrl = new AbortController();
    setState(s => ({ ...s, status: 'loading', error: null }));
    fetch('https://dummyjson.com/products?limit=' + limit + '&delay=1500&select=title,price,thumbnail,rating', { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(data => setState({ status: 'success', products: data.products, error: null }))
      .catch(err => { if (err.name !== 'AbortError') setState({ status: 'error', products: [], error: err.message }); });
    return () => ctrl.abort();
  }, [limit, reloadKey]);
  return { ...state, reload: () => setReloadKey(k => k + 1) };
}

function ProductCardSkeleton() {
  return (
    <div className="card" aria-hidden="true">
      <div className="skeleton" style={{ aspectRatio: '4 / 3' }} />
      <div className="skeleton" style={{ height: 14, width: '85%', marginTop: 10 }} />
      <div className="skeleton" style={{ height: 14, width: '40%', marginTop: 6 }} />
    </div>
  );
}
function ProductCard({ product }) {
  return (
    <div className="card">
      <img src={product.thumbnail} alt={product.title} style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover' }} />
      <p className="title">{product.title}</p>
      <p className="price">{'$' + product.price} | {product.rating} stars</p>
    </div>
  );
}

function App() {
  const { status, products, error, reload } = useProducts(6);
  const isLoading = status === 'loading';
  return (
    <section aria-busy={isLoading} style={{ fontFamily: 'system-ui', padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Top deals</h2>
        <button onClick={reload} disabled={isLoading}>{isLoading ? 'Loading...' : 'Reload'}</button>
      </div>
      {isLoading && <span className="sr-only">Loading products</span>}
      {status === 'error' && <p role="alert" style={{ color: 'crimson' }}>Could not load products ({error}).</p>}
      <div className="grid">
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => <ProductCardSkeleton key={i} />)
          : products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}`,
        css: `.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-top: 12px; }
.card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px; min-height: 190px; background: #fff; }
.card img { border-radius: 6px; background: #f3f4f6; }
.title { font-size: 13px; font-weight: 600; margin: 8px 0 2px; }
.price { font-size: 12px; color: #4f46e5; margin: 0; }
.skeleton { background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 6px; }
@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }`,
      },
      result: 'For about 1.5 seconds six shimmering grey cards appear, then they are replaced by six real products (Essence Mascara Lash Princess, Eyeshadow Palette with Mirror, ...) with photos, $ prices and ratings, in exactly the same grid. Reload shows the skeleton again.',
      explanation:
        'The skeleton has the same structure and min-height as the real card, so nothing jumps when data arrives. aria-busy and the visually hidden text inform screen-reader users while the decorative skeletons are aria-hidden. The AbortController cleanup prevents updating state from an outdated request. (dummyjson prices are in dollars.)',
    },
    {
      title: 'One component for loading, error, empty and success (search)',
      scenario: 'A product search box. Typing "phone" shows results; "zzzz" shows a no-results empty state with "Clear search"; the "Simulate server error" switch shows an error with "Try again".',
      steps: [
        'Write a reusable AsyncView that renders loading → error → empty → children in that order',
        'Write EmptyState (title, description, action) and ErrorState (message, onRetry, role="alert")',
        'Search https://dummyjson.com/products/search?q=... (debounced by 400 ms)',
        'For the error case call https://dummyjson.com/http/500 which really returns HTTP 500',
        'Run the playground and try all four states',
      ],
      code: `// src/components/ui/AsyncView.jsx
export function AsyncView({ status, error, isEmpty, onRetry, empty, loading, children }) {
  if (status === 'loading') return loading ?? <Spinner label="Loading" />;
  if (status === 'error') return <ErrorState message={toUserMessage(error)} onRetry={onRetry} />;
  if (isEmpty) return empty;
  return children;
}

function toUserMessage(error) {
  if (!navigator.onLine) return 'You are offline. Check your internet connection.';
  if (error?.status >= 500) return 'Our server is having trouble. Please try again in a moment.';
  return 'Something went wrong. Please try again.';
}

// usage
<AsyncView
  status={status} error={error} onRetry={retry}
  isEmpty={results.length === 0}
  empty={<EmptyState title={'No results for "' + query + '"'} description="Check the spelling or try a different word."
           action={<button onClick={() => setQuery('')}>Clear search</button>} />}
>
  <ResultsList items={results} />
</AsyncView>`,
      playground: {
        jsx: `function EmptyState({ title, description, action }) {
  return (
    <div className="box empty" role="status">
      <div className="emoji" aria-hidden="true">🔍</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
function ErrorState({ message, onRetry }) {
  return (
    <div className="box error" role="alert">
      <div className="emoji" aria-hidden="true">⚠️</div>
      <h3>We could not load results</h3>
      <p>{message}</p>
      <button onClick={onRetry}>Try again</button>
    </div>
  );
}
function AsyncView({ status, error, isEmpty, onRetry, empty, children }) {
  if (status === 'loading') return <p className="muted">Searching...</p>;
  if (status === 'error') return <ErrorState message={error} onRetry={onRetry} />;
  if (isEmpty) return empty;
  return children;
}

function useDebounced(value, ms) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

function App() {
  const [query, setQuery] = React.useState('phone');
  const [failMode, setFailMode] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  const [state, setState] = React.useState({ status: 'loading', items: [], error: null });
  const q = useDebounced(query.trim(), 400);

  React.useEffect(() => {
    if (!q) { setState({ status: 'success', items: [], error: null }); return; }
    const ctrl = new AbortController();
    setState(s => ({ ...s, status: 'loading' }));
    const url = failMode ? 'https://dummyjson.com/http/500' : 'https://dummyjson.com/products/search?q=' + encodeURIComponent(q) + '&limit=8&select=title,price,category';
    fetch(url, { signal: ctrl.signal })
      .then(r => { if (!r.ok) { const e = new Error('HTTP ' + r.status); e.status = r.status; throw e; } return r.json(); })
      .then(d => setState({ status: 'success', items: d.products, error: null }))
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error('search failed:', err.message);   // details for developers
        setState({ status: 'error', items: [], error: err.status >= 500 ? 'Our server is having trouble. Please try again in a moment.' : 'Please check your internet connection.' });
      });
    return () => ctrl.abort();
  }, [q, failMode, attempt]);

  return (
    <div style={{ fontFamily: 'system-ui', padding: 12, maxWidth: 520 }}>
      <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products" aria-label="Search products" style={{ width: '100%', padding: 8 }} />
      <label style={{ display: 'block', margin: '8px 0', fontSize: 13 }}>
        <input type="checkbox" checked={failMode} onChange={e => setFailMode(e.target.checked)} /> Simulate server error (HTTP 500)
      </label>
      {!q ? (
        <EmptyState title="Search our catalogue" description="Try phone, laptop or perfume." action={<button onClick={() => setQuery('laptop')}>Try "laptop"</button>} />
      ) : (
        <AsyncView status={state.status} error={state.error} onRetry={() => setAttempt(a => a + 1)} isEmpty={state.items.length === 0}
          empty={<EmptyState title={'No results for "' + q + '"'} description="Check the spelling or try a different word." action={<button onClick={() => setQuery('')}>Clear search</button>} />}>
          <ul className="results">
            {state.items.map(p => <li key={p.id}><b>{p.title}</b> <span className="muted">{p.category}, {'$' + p.price}</span></li>)}
          </ul>
        </AsyncView>
      )}
    </div>
  );
}`,
        css: `.box { text-align: center; padding: 24px 16px; border-radius: 12px; }
.box h3 { margin: 4px 0; } .box p { color: #4b5563; margin: 4px 0 12px; }
.empty { background: #f8fafc; border: 1px dashed #cbd5e1; }
.error { background: #fef2f2; border: 1px solid #fecaca; }
.emoji { font-size: 28px; }
.box button { padding: 6px 14px; border-radius: 6px; border: 1px solid #4f46e5; background: #4f46e5; color: #fff; cursor: pointer; }
.muted { color: #6b7280; font-size: 13px; }
.results { padding-left: 18px; } .results li { margin: 6px 0; }`,
      },
      result: '"phone" lists phone products (e.g. Apple AirPods Max Silver, Apple iPhone Charger). Typing "zzzz" shows the empty state No results for "zzzz" with a Clear search button; clearing shows a first-use state with Try "laptop". Ticking the error switch shows a red box "We could not load results" and Try again; the console logs "search failed: HTTP 500".',
      explanation:
        'AsyncView enforces the order loading → error → empty → success, so no screen can show "No results" while still loading. Users see friendly text; developers get technical details in the console. Retry simply bumps the attempt counter, which is a dependency of the effect and refetches.',
    },
    {
      title: 'A mini react-hot-toast: toast.success, toast.error and toast.promise',
      scenario: 'Show feedback in a checkout page: "Added to cart" (success), "Coupon expired" (error), and placing an order with toast.promise (loading → success or error). Build a tiny version of react-hot-toast to understand how it works.',
      steps: [
        'npm install react-hot-toast; put <Toaster position="top-right" /> once in App.jsx',
        'Call toast.success / toast.error / toast.promise from event handlers',
        'In the playground, a small global store (subscribe + useSyncExternalStore) plays the role of the library',
        'Toaster renders in an aria-live region so screen readers announce messages',
        'Click the buttons and watch toasts stack and auto-dismiss',
      ],
      code: `// App.jsx
import toast, { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000, success: { duration: 2000 } }} />
      <RouterProvider router={router} />
    </>
  );
}

// CheckoutPage.jsx
function addToCart(product) {
  cart.add(product);
  toast.success(product.title + ' added to cart', { id: 'cart' }); // same id: replaces, not stacks
}

async function placeOrder() {
  await toast.promise(api.placeOrder(cart.items), {
    loading: 'Placing your order...',
    success: order => 'Order ' + order.id + ' placed!',
    error: err => 'Order failed: ' + err.message,
  });
}`,
      playground: {
        jsx: `// ---------- mini toast library (plain JS store + React Toaster) ----------
let toasts = [];
const listeners = new Set();
const emit = () => listeners.forEach(l => l());
let nextId = 1;

function show(message, type, opts = {}) {
  const id = opts.id ?? nextId++;
  const duration = opts.duration ?? (type === 'error' ? 4000 : type === 'loading' ? Infinity : 2500);
  const t = { id, message, type };
  toasts = toasts.some(x => x.id === id) ? toasts.map(x => (x.id === id ? t : x)) : [...toasts, t];
  emit();
  if (duration !== Infinity) setTimeout(() => toast.dismiss(id), duration);
  return id;
}
const toast = (msg, opts) => show(msg, 'blank', opts);
toast.success = (msg, opts) => show(msg, 'success', opts);
toast.error = (msg, opts) => show(msg, 'error', opts);
toast.loading = (msg, opts) => show(msg, 'loading', opts);
toast.dismiss = id => { toasts = toasts.filter(t => t.id !== id); emit(); };
toast.promise = (promise, msgs) => {
  const id = toast.loading(msgs.loading);
  promise.then(
    v => toast.success(typeof msgs.success === 'function' ? msgs.success(v) : msgs.success, { id }),
    e => toast.error(typeof msgs.error === 'function' ? msgs.error(e) : msgs.error, { id })
  );
  return promise;
};

function Toaster() {
  const list = React.useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => toasts, () => toasts);
  const icon = { success: '✅', error: '❌', loading: '⏳', blank: 'ℹ️' };
  return (
    <div className="toaster" aria-live="polite" role="status">
      {list.map(t => (
        <div key={t.id} className={'toast ' + t.type}>
          <span aria-hidden="true">{icon[t.type]}</span> {t.message}
          <button aria-label="Dismiss" onClick={() => toast.dismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
// ---------- app ----------
function fakePlaceOrder() {
  return new Promise((resolve, reject) => setTimeout(() => {
    Math.random() < 0.7 ? resolve({ id: 'OD' + Math.floor(Math.random() * 90000 + 10000) }) : reject(new Error('Payment declined by bank'));
  }, 1500));
}

function App() {
  const [placing, setPlacing] = React.useState(false);
  async function placeOrder() {
    setPlacing(true);
    try {
      await toast.promise(fakePlaceOrder(), {
        loading: 'Placing your order...',
        success: order => 'Order ' + order.id + ' placed!',
        error: err => 'Order failed: ' + err.message,
      });
    } catch (e) { /* already shown as a toast */ }
    finally { setPlacing(false); }
  }
  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }}>
      <Toaster />
      <h3>Checkout</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => toast.success('Bournvita 1 kg added to cart', { id: 'cart' })}>Add to cart</button>
        <button onClick={() => toast.error('Coupon DIWALI50 has expired')}>Apply coupon</button>
        <button onClick={() => toast('Delivery by Tuesday, 12 Nov to Nagpur')}>Check delivery</button>
        <button onClick={placeOrder} disabled={placing}>{placing ? 'Placing...' : 'Place order (₹1,249)'}</button>
      </div>
    </div>
  );
}`,
        css: `.toaster { position: fixed; top: 12px; right: 12px; display: flex; flex-direction: column; gap: 8px; z-index: 50; max-width: min(90vw, 320px); }
.toast { display: flex; align-items: center; gap: 8px; background: #fff; color: #111827; padding: 10px 12px; border-radius: 10px; box-shadow: 0 6px 20px rgba(0,0,0,.15); font-size: 14px; animation: in .2s ease-out; border-left: 4px solid #9ca3af; }
.toast.success { border-left-color: #16a34a; } .toast.error { border-left-color: #dc2626; } .toast.loading { border-left-color: #f59e0b; }
.toast button { margin-left: auto; border: 0; background: none; font-size: 18px; cursor: pointer; color: #6b7280; }
@keyframes in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }`,
      },
      result: 'Buttons show toasts in the top-right corner: a green success (clicking "Add to cart" repeatedly replaces the same toast instead of stacking), a red error that stays 4 s, an info toast, and "Place order" which shows ⏳ "Placing your order..." that turns into "Order ODxxxxx placed!" or "Order failed: Payment declined by bank" (30% chance).',
      explanation:
        'Toasts live in a module-level store, not in component state, which is why toast() can be called from anywhere, even outside React (an Axios interceptor). The Toaster subscribes with useSyncExternalStore. Passing an id updates an existing toast; toast.promise uses this to turn the loading toast into success or error. react-hot-toast works the same way, with more polish.',
    },
    {
      title: 'Promise-based confirm dialog: const ok = await confirm(...)',
      scenario: 'Deleting an address or cancelling an order must be confirmed. Build a ConfirmProvider and a useConfirm() hook that returns a promise, with an accessible dialog: focus on Cancel, Escape to close, focus returns to the trigger.',
      steps: [
        'Create ConfirmContext and a ConfirmProvider that stores the dialog options and a resolve function',
        'useConfirm() returns confirm(options) which opens the dialog and returns a Promise<boolean>',
        'The dialog resolves true on Confirm and false on Cancel / Escape / backdrop',
        'Use role="alertdialog", aria-modal, aria-labelledby, aria-describedby; focus the Cancel button',
        'Render it with createPortal into document.body',
        'Run the playground and delete an address',
      ],
      code: `// src/components/ui/ConfirmProvider.jsx
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [options, setOptions] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback(opts => new Promise(resolve => {
    resolverRef.current = resolve;
    setOptions(opts);
  }), []);

  const close = result => { resolverRef.current?.(result); setOptions(null); };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && createPortal(<ConfirmDialog {...options} onClose={close} />, document.body)}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);

// usage in any component
const confirm = useConfirm();
async function removeAddress(a) {
  if (await confirm({ title: 'Delete this address?', description: a.line, confirmText: 'Delete', danger: true })) {
    deleteAddress(a.id);
    toast.success('Address deleted');
  }
}`,
      playground: {
        jsx: `const ConfirmContext = React.createContext(null);

function ConfirmDialog({ title, description, confirmText = 'Confirm', danger, onClose }) {
  const cancelRef = React.useRef(null);
  React.useEffect(() => {
    const previouslyFocused = document.activeElement;
    cancelRef.current?.focus();                                   // safe option gets focus
    const onKey = e => { if (e.key === 'Escape') onClose(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();                               // focus back to the trigger
    };
  }, [onClose]);
  return (
    <div className="backdrop" onClick={() => onClose(false)}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="cd-title" aria-describedby="cd-desc" onClick={e => e.stopPropagation()}>
        <h3 id="cd-title">{title}</h3>
        <p id="cd-desc">{description}</p>
        <div className="actions">
          <button ref={cancelRef} onClick={() => onClose(false)}>Cancel</button>
          <button className={danger ? 'danger' : 'primary'} onClick={() => onClose(true)}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmProvider({ children }) {
  const [options, setOptions] = React.useState(null);
  const resolverRef = React.useRef(null);
  const confirm = React.useCallback(opts => new Promise(resolve => { resolverRef.current = resolve; setOptions(opts); }), []);
  const close = React.useCallback(result => { resolverRef.current?.(result); setOptions(null); }, []);
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && ReactDOM.createPortal(<ConfirmDialog {...options} onClose={close} />, document.body)}
    </ConfirmContext.Provider>
  );
}
const useConfirm = () => React.useContext(ConfirmContext);

function Addresses() {
  const confirm = useConfirm();
  const [list, setList] = React.useState([
    { id: 1, label: 'Home', line: '12, MG Road, Indiranagar, Bengaluru 560038' },
    { id: 2, label: 'Office', line: 'Tower B, Cyber City, Gurugram 122002' },
    { id: 3, label: 'Parents', line: '45, Shivaji Nagar, Pune 411005' },
  ]);
  const [msg, setMsg] = React.useState('');

  async function remove(a) {
    const ok = await confirm({ title: 'Delete "' + a.label + '" address?', description: a.line + '. This cannot be undone.', confirmText: 'Delete', danger: true });
    console.log('confirm result:', ok);
    if (!ok) { setMsg('Kept "' + a.label + '".'); return; }
    setList(l => l.filter(x => x.id !== a.id));
    setMsg('Deleted "' + a.label + '".');
  }
  return (
    <div>
      <h3>Saved addresses</h3>
      {list.length === 0 && <p>No saved addresses. <button>Add address</button></p>}
      {list.map(a => (
        <div key={a.id} className="row">
          <div><b>{a.label}</b><br /><small>{a.line}</small></div>
          <button className="danger-outline" onClick={() => remove(a)}>Delete</button>
        </div>
      ))}
      <p role="status" className="msg">{msg}</p>
    </div>
  );
}

function App() {
  return <ConfirmProvider><div style={{ fontFamily: 'system-ui', padding: 12, maxWidth: 520 }}><Addresses /></div></ConfirmProvider>;
}`,
        css: `.row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
.row small { color: #6b7280; }
button { padding: 6px 12px; border-radius: 6px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; }
button:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }
.danger-outline { color: #dc2626; border-color: #fecaca; }
.backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, .55); display: grid; place-items: center; z-index: 100; font-family: system-ui; }
.dialog { background: #fff; border-radius: 12px; padding: 20px; width: min(92vw, 400px); box-shadow: 0 20px 40px rgba(0,0,0,.25); animation: pop .15s ease-out; }
.dialog h3 { margin: 0 0 6px; } .dialog p { color: #4b5563; margin: 0 0 16px; }
.actions { display: flex; justify-content: flex-end; gap: 8px; }
.danger { background: #dc2626; border-color: #dc2626; color: #fff; }
.primary { background: #4f46e5; border-color: #4f46e5; color: #fff; }
.msg { color: #374151; min-height: 1.2em; }
@keyframes pop { from { transform: scale(.95); opacity: 0; } to { transform: none; opacity: 1; } }`,
      },
      result: 'Three addresses with Delete buttons. Clicking Delete opens a centred dialog titled Delete "Home" address? with the address text; Cancel is focused. Cancel, Escape or clicking outside keeps the address (the message says Kept "Home".); the red Delete removes it. The console logs "confirm result: true/false" and focus returns to the Delete button.',
      explanation:
        'confirm() creates a Promise and stores its resolve function in a ref; the dialog calls close(true/false), which resolves it. The calling code reads top-to-bottom like window.confirm but with a styled, accessible dialog. createPortal renders the dialog into document.body so parent overflow or z-index cannot clip it.',
    },
  ],
  interview: [
    { q: 'What states should every data-fetching UI handle?', a: 'Loading, error, empty and success (plus sometimes refreshing/background-loading). Check them in order loading → error → empty → success so you never show "no data" while loading or a blank screen on failure.', level: 'Easy' },
    { q: 'Skeleton loader vs spinner: when do you use each?', a: 'Skeletons for page or section content whose layout is known (lists, cards, profiles): they reduce perceived wait and prevent layout shift. Spinners for short, local actions like a button submitting or a small widget refreshing.', level: 'Easy' },
    { q: 'How do you make a skeleton screen accessible?', a: 'Mark skeleton shapes aria-hidden="true", set aria-busy="true" on the container, provide visually hidden "Loading ..." text or a live region, and disable shimmer animation with prefers-reduced-motion.', level: 'Medium' },
    { q: 'What makes a good empty state?', a: 'A clear title, a short explanation or hint, and a primary action (create first item, clear filters, browse). Different messages for first-use empty vs no results for a search/filter.', level: 'Easy' },
    { q: 'How should errors be shown to users?', a: 'With a human-friendly message that explains what happened and what to do, a retry action where it makes sense, role="alert" for screen readers, and without exposing stack traces. Technical details go to logs/monitoring (Sentry). Handle 401 (re-login), 404 (not found) and 5xx/offline differently.', level: 'Medium' },
    { q: 'How does react-hot-toast let you call toast() outside components?', a: 'Toasts are stored in a module-level store, not in component state. toast() updates the store and the <Toaster /> component, rendered once at the root, subscribes to it and re-renders. That is why it can be used in API interceptors or utility functions.', level: 'Hard' },
    { q: 'What does toast.promise do?', a: 'It takes a promise and messages: shows a loading toast immediately, then updates the same toast to the success message when the promise resolves or to the error message when it rejects. It returns the original promise.', level: 'Medium' },
    { q: 'When should you NOT use a toast?', a: 'For critical information the user must read or act on (form validation errors next to fields, payment failures needing a decision, irreversible confirmations). Toasts disappear and may be missed; use inline messages or dialogs instead.', level: 'Medium' },
    { q: 'What are the accessibility requirements of a modal dialog?', a: 'role="dialog" or "alertdialog", aria-modal="true", aria-labelledby/aria-describedby, move focus into it and trap it, close on Escape, restore focus to the trigger on close, prevent background scroll/interaction, and render via portal to avoid clipping.', level: 'Hard' },
    { q: 'How would you implement a reusable confirm dialog that can be awaited?', a: 'A ConfirmProvider holds dialog options in state and a resolver in a ref. useConfirm() returns confirm(opts), which sets the options and returns a new Promise storing its resolve. The dialog buttons call resolve(true/false) and clear the options. Callers write if (await confirm({...})) ...', level: 'Hard' },
    { q: 'Confirm dialog or undo: which is better for deleting?', a: 'For high-risk or irreversible actions (deleting an account, cancelling a paid order) confirm. For frequent low-risk actions (archiving an email, removing a cart item) an undo toast is smoother: act immediately and allow reverting for a few seconds.', level: 'Medium' },
    { q: 'How do you prevent double submission of a payment or order?', a: 'Disable the submit button and show a loading state while the request is pending, ignore clicks while pending, and on the backend use idempotency keys so a repeated request does not create a second order.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create an OrdersSkeleton for a table with 5 rows and 4 columns (Order ID, Customer, Amount, Status) that matches the real table height, and use it in OrdersPage while loading.',
      hint: 'Render a real <table> with the same header and rows of skeleton bars; aria-hidden on the tbody.',
      solution: `export function OrdersSkeleton({ rows = 5 }) {
  return (
    <table className="orders" aria-busy="true">
      <caption className="sr-only">Loading orders</caption>
      <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
      <tbody aria-hidden="true">
        {Array.from({ length: rows }, (_, r) => (
          <tr key={r}>
            {[60, 120, 70, 80].map((w, c) => (
              <td key={c}><div className="skeleton" style={{ height: 14, width: w }} /></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function OrdersPage() {
  const { data, isLoading, error, refetch } = useOrders();
  if (isLoading) return <OrdersSkeleton />;
  if (error) return <ErrorState message="Could not load orders." onRetry={refetch} />;
  if (!data.length) return <EmptyState title="No orders yet" action={<a href="/products">Start shopping</a>} />;
  return <OrdersTable orders={data} />;
}`,
    },
    {
      task: 'Write a useDelayedFlag(isLoading, 300) hook so a skeleton appears only if loading takes longer than 300 ms (no flicker on fast responses).',
      hint: 'Start a timer when isLoading becomes true; reset when it becomes false.',
      solution: `import { useEffect, useState } from 'react';

export function useDelayedFlag(flag, delay = 300) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!flag) { setShow(false); return; }
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [flag, delay]);
  return show;
}

// usage
const showSkeleton = useDelayedFlag(isLoading, 300);
if (isLoading) return showSkeleton ? <ProductsSkeleton /> : null;`,
    },
    {
      task: 'Using react-hot-toast, implement "Remove from cart" with an Undo button inside the toast that restores the item within 5 seconds.',
      hint: 'toast((t) => <span>... <button onClick={() => { undo(); toast.dismiss(t.id); }}>Undo</button></span>, { duration: 5000 }).',
      solution: `import toast from 'react-hot-toast';

function useCartActions() {
  const { items, setItems } = useCart();

  function removeItem(item) {
    const index = items.findIndex(i => i.id === item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));

    toast(t => (
      <span>
        Removed <b>{item.title}</b>
        <button
          style={{ marginLeft: 8 }}
          onClick={() => {
            setItems(prev => { const copy = [...prev]; copy.splice(index, 0, item); return copy; });
            toast.dismiss(t.id);
          }}
        >
          Undo
        </button>
      </span>
    ), { duration: 5000, id: 'remove-' + item.id });
  }
  return { removeItem };
}`,
    },
    {
      task: 'Build a reusable Modal component using the native <dialog> element (showModal / close) with a title, children, a close button and Escape support, and use it for a "Quick view" of a product.',
      hint: 'Use a ref and call ref.current.showModal() in an effect when open becomes true; listen to the dialog "close" event.',
      solution: `import { useEffect, useRef } from 'react';

export function Modal({ open, onClose, title, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();   // native: focus trap, Escape, top layer
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="modal-title"
      onClick={e => { if (e.target === ref.current) onClose(); }}   // click on backdrop area
      style={{ border: 0, borderRadius: 12, padding: 20, width: 'min(92vw, 480px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2 id="modal-title" style={{ margin: 0 }}>{title}</h2>
        <button aria-label="Close" onClick={onClose}>×</button>
      </div>
      {children}
    </dialog>
  );
}

// usage
function ProductQuickView({ product }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Quick view</button>
      <Modal open={open} onClose={() => setOpen(false)} title={product.title}>
        <img src={product.thumbnail} alt={product.title} width="200" height="200" />
        <p>{product.description}</p>
        <b>₹{product.price}</b>
      </Modal>
    </>
  );
}
/* CSS: dialog::backdrop { background: rgb(0 0 0 / .5); } */`,
    },
    {
      task: 'Write an ErrorState that shows different messages and actions for offline, 401, 404 and 5xx errors (error has a status field).',
      hint: 'navigator.onLine for offline; 401 -> "Log in again" button; 404 -> link home; 5xx -> retry.',
      solution: `export function SmartErrorState({ error, onRetry, onLogin }) {
  let title = 'Something went wrong';
  let message = 'Please try again.';
  let action = onRetry && <button onClick={onRetry}>Try again</button>;

  if (!navigator.onLine) {
    title = 'You are offline';
    message = 'Check your internet connection. We will retry when you are back online.';
  } else if (error?.status === 401) {
    title = 'Session expired';
    message = 'Please log in again to continue.';
    action = <button onClick={onLogin}>Log in again</button>;
  } else if (error?.status === 404) {
    title = 'Not found';
    message = 'This page or item does not exist anymore.';
    action = <a href="/">Go to home</a>;
  } else if (error?.status >= 500) {
    title = 'Server problem';
    message = 'Our servers are having trouble. Please try again in a minute.';
  }

  return (
    <div role="alert" className="error-box">
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'In which order should a component check its async states?',
      options: ['success → empty → error → loading', 'empty → loading → error → success', 'loading → error → empty → success', 'error → success → loading → empty'],
      answer: 2,
      explanation: 'Checking loading first avoids showing "empty" while data is still on its way.',
    },
    {
      question: 'Why are skeleton screens often preferred over a full-page spinner?',
      options: ['They load data faster', 'They show the page structure immediately and prevent layout shift', 'They do not need CSS', 'Search engines require them'],
      answer: 1,
      explanation: 'Perceived performance improves and content appears in the reserved space.',
    },
    {
      question: 'Where do you render <Toaster /> from react-hot-toast?',
      options: ['Once, near the root of the app', 'Inside every component that calls toast()', 'Inside index.html', 'Only inside modals'],
      answer: 0,
      explanation: 'One Toaster at the root shows toasts triggered from anywhere.',
    },
    {
      question: 'Which element should receive focus when a "Delete product?" confirm dialog opens?',
      options: ['The Delete button', 'The page body', 'Nothing', 'The Cancel button (the safe option)'],
      answer: 3,
      explanation: 'Focusing the safe option prevents accidental destructive confirmation via Enter.',
    },
    {
      question: 'Which toast call shows loading and then success or error for the same operation?',
      options: ['toast.loading only', 'toast.promise(promise, { loading, success, error })', 'toast.custom', 'toast.dismiss'],
      answer: 1,
      explanation: 'toast.promise updates a single toast through the promise lifecycle.',
    },
  ],
};
