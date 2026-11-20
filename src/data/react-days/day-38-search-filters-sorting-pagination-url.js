// Mini router helpers used by the playgrounds (plain React learning version of React Router's useSearchParams;
// the playground runs in a sandboxed iframe, so the "URL" lives in memory and is shown in a fake address bar)
const MINI_URL = `// ---------- mini useSearchParams (learning version, plain React) ----------
const urlStore = (() => {
  let stack = ['/products'];
  let index = 0;
  const listeners = new Set();
  const emit = () => listeners.forEach(l => l());
  return {
    get: () => stack[index],
    subscribe: l => { listeners.add(l); return () => listeners.delete(l); },
    navigate: (url, opts) => {
      if (opts && opts.replace) stack[index] = url;
      else { stack = stack.slice(0, index + 1); stack.push(url); index++; }
      emit();
    },
    back: () => { if (index > 0) { index--; emit(); } },
    forward: () => { if (index < stack.length - 1) { index++; emit(); } },
  };
})();

function useLocationUrl() {
  return React.useSyncExternalStore(urlStore.subscribe, urlStore.get, urlStore.get);
}

function useSearchParams() {
  const url = useLocationUrl();
  const qs = url.split('?')[1] || '';
  const searchParams = React.useMemo(() => new URLSearchParams(qs), [qs]);
  const setSearchParams = React.useCallback((next, opts) => {
    const current = new URLSearchParams(urlStore.get().split('?')[1] || '');
    const value = typeof next === 'function' ? next(current) : next;
    const s = new URLSearchParams(value).toString();
    urlStore.navigate(urlStore.get().split('?')[0] + (s ? '?' + s : ''), opts);
  }, []);
  return [searchParams, setSearchParams];
}

function AddressBar() {
  const url = useLocationUrl();
  return (
    <div className="addr">
      <button onClick={urlStore.back} aria-label="Back">←</button>
      <button onClick={urlStore.forward} aria-label="Forward">→</button>
      <code>shopkart.in{decodeURIComponent(url)}</code>
    </div>
  );
}
// ---------- end of mini useSearchParams ----------
`;

const FETCH_HOOKS = `
function useDebounce(value, delay) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);              // typing again cancels the previous timer
  }, [value, delay]);
  return debounced;
}

function useFetchJson(url) {
  const [state, setState] = React.useState({ data: null, loading: true, error: null });
  React.useEffect(() => {
    const ctrl = new AbortController();
    setState(s => ({ ...s, loading: true, error: null }));   // keep old data while loading
    console.log('GET ' + url);
    fetch(url, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(data => setState({ data, loading: false, error: null }))
      .catch(err => { if (err.name !== 'AbortError') setState({ data: null, loading: false, error: err.message }); });
    return () => ctrl.abort();                  // cancel the old request when the URL changes
  }, [url]);
  return state;
}
const inr = usd => '₹' + Math.round(usd * 85).toLocaleString('en-IN');   // demo: dummyjson prices are USD
`;

const CSS = `.addr{display:flex;gap:6px;align-items:center;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:6px 8px;margin-bottom:12px;font-size:13px;overflow:auto}
.addr button{border:0;background:#e2e8f0;border-radius:4px;cursor:pointer;padding:2px 8px}
.toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}.toolbar input,.toolbar select{padding:7px;border:1px solid #cbd5e1;border-radius:6px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;list-style:none;padding:0}
.card{border:1px solid #e2e8f0;border-radius:8px;padding:10px;font-size:14px}.card b{display:block;color:#0f766e;margin-top:4px}
.muted{color:#64748b;font-size:13px}.pager{display:flex;gap:4px;flex-wrap:wrap;margin-top:12px}
.pager button{min-width:34px;padding:6px;border:1px solid #cbd5e1;background:#fff;border-radius:6px;cursor:pointer}
.pager button[aria-current="page"]{background:#1d4ed8;color:#fff;border-color:#1d4ed8}.pager button:disabled{opacity:.4;cursor:default}
.loading{opacity:.5;transition:opacity .2s}`;

export default {
  id: 'day-38-search-filters-sorting-pagination-url',
  title: 'Search, Filters, Sorting and Pagination with URL Search Params (useSearchParams) and Debounced Search',
  module: 'Module 8: Working with APIs like a Pro',
  day: 38,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Every product listing, admin table and job portal needs search, filters, sorting and pagination. Industry apps keep these values in the URL (?q=phone&category=laptops&sort=price-asc&page=2) so pages are shareable, bookmarkable and work with the Back button. You will use React Router\'s useSearchParams, debounce the search box, and send the values to a real API.',
  objectives: [
    'Explain why list state (search, filter, sort, page) belongs in the URL instead of useState',
    'Read and update query parameters with useSearchParams (get, set, delete, functional updates, replace)',
    'Build a debounced search box with a custom useDebounce hook and cancel stale requests',
    'Implement server-side sorting and pagination with limit/skip and total',
    'Decide between client-side and server-side filtering',
  ],
  theory: [
    {
      heading: 'Why the URL is the best place for list state',
      content:
        'Open Flipkart, search "mobiles", choose a brand and sort by price. The address bar now looks like `/search?q=mobiles&sort=price_asc&p[]=brand:Samsung&page=2`. That is not an accident:\n\n- **Shareable**: send the link on WhatsApp and your friend sees exactly the same results\n- **Bookmarkable and refresh-safe**: reload the page and filters are still applied\n- **Back/Forward work**: each filter change is a history entry\n- **SEO and analytics**: search engines and analytics tools can read the URL\n\nIf you keep filters in `useState`, they disappear on refresh and the Back button leaves the page instead of undoing the filter. Rule used by most teams: **if the user would expect it to survive a refresh or to be shared, put it in the URL**. Purely visual things (dropdown open, hover) stay in useState.\n\nAnalogy: the URL is the **order slip** at a restaurant. Anyone who reads the slip can prepare exactly the same plate.',
      points: [
        '`q`: the search text',
        '`category`, `brand`, `minPrice`, `inStock`: filters',
        '`sort`: e.g. `price-asc`, `rating-desc`',
        '`page` (and sometimes `limit`): pagination',
      ],
    },
    {
      heading: 'useSearchParams in React Router 7',
      content:
        '`useSearchParams()` works like useState for the query string and returns `[searchParams, setSearchParams]`.\n\n- `searchParams` is a standard **URLSearchParams** object: `get(\'q\')` returns a **string or null**, `getAll(\'brand\')` returns an array, `has(\'inStock\')`.\n- `setSearchParams(obj | URLSearchParams | fn, { replace })` navigates to the new query string. It **replaces the whole query string**, so to change one key use the **functional form** and copy the previous params.\n- `{ replace: true }` replaces the current history entry instead of pushing a new one. Use it for typing in a search box so Back does not walk through every letter.\n\nEverything in the URL is a **string**. Convert and validate: `Number(searchParams.get(\'page\')) || 1`. Never trust the URL; a user can type `?page=-5` or `?sort=hack`.',
      syntax: `import { useSearchParams } from 'react-router';   // RR7 (v6: 'react-router-dom')

const [searchParams, setSearchParams] = useSearchParams();
const q = searchParams.get('q') ?? '';
const page = Math.max(1, Number(searchParams.get('page')) || 1);
const sort = SORTS[searchParams.get('sort')] ? searchParams.get('sort') : 'relevance';

function updateParam(key, value) {
  setSearchParams(prev => {
    const next = new URLSearchParams(prev);
    if (value) next.set(key, value); else next.delete(key);   // keep URLs clean
    if (key !== 'page') next.delete('page');                   // new filter → back to page 1
    return next;
  });
}`,
      tip: 'Common bug: setSearchParams({ category }) wipes q, sort and page. Always copy the previous params (functional form) unless you really want to reset everything.',
    },
    {
      heading: 'Debounced search',
      content:
        'If you call the API on every keystroke, typing "samsung" fires 7 requests, wastes server money, and responses may arrive **out of order** (results for "sams" can overwrite results for "samsung").\n\n**Debouncing** waits until the user **stops typing** for N milliseconds (300–500 ms is typical) and then uses the value. You learned the JS version on JS Day 40; in React it becomes a custom hook built from useState + useEffect + setTimeout with cleanup.\n\nIndustry pattern:\n\n1. The input is **controlled by local state** (`text`) so typing is instant\n2. `useDebounce(text, 400)` produces the settled value\n3. An effect writes the debounced value into the URL with `{ replace: true }`\n4. The data fetch depends on the URL value and **aborts** the previous request with AbortController (or TanStack Query does that for you with `signal`)\n\nAlso: trim the text, ignore 1-character searches if the API is heavy, and show a small "Searching…" indicator.',
      syntax: `export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}`,
      tip: 'Debounce = wait for a pause (search box, autosave). Throttle = at most once every N ms (scroll, resize). Interviewers love this question.',
    },
    {
      heading: 'Sorting and pagination on the server',
      content:
        'Real data sets have thousands of rows, so the **server** sorts and paginates. Two common styles:\n\n- **Offset pagination**: `?limit=10&skip=20` (or `page=3&pageSize=10`). Easy, lets users jump to page 7. Used by admin tables. dummyjson uses `limit` and `skip` and returns `total`.\n- **Cursor pagination**: `?cursor=abc123&limit=10`. The server returns `nextCursor`. Stable when new rows are inserted; used by feeds and infinite scroll (Day 39).\n\nMaths for offset pagination:\n\n- `skip = (page - 1) * pageSize`\n- `totalPages = Math.ceil(total / pageSize)`\n- showing `skip + 1`–`Math.min(skip + pageSize, total)` of `total`\n\nSorting: map a friendly URL value to API parameters, e.g. `price-asc` → `sortBy=price&order=asc`. Keep the map in one object so invalid values are ignored.\n\nUX rules: reset to page 1 when search/filter/sort changes, keep the old page visible (dimmed) while the next loads, disable Prev on page 1 and Next on the last page, scroll to top after changing page, mark the current page with `aria-current="page"`.',
      syntax: `const PAGE_SIZE = 8;
const SORTS = {
  'relevance': {},
  'price-asc': { sortBy: 'price', order: 'asc' },
  'price-desc': { sortBy: 'price', order: 'desc' },
  'rating-desc': { sortBy: 'rating', order: 'desc' },
};
const params = new URLSearchParams({
  limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE, ...SORTS[sort],
});
// GET https://dummyjson.com/products?limit=8&skip=8&sortBy=price&order=asc`,
    },
    {
      heading: 'Client-side vs server-side filtering, and wiring it with TanStack Query',
      content:
        '**Client-side**: you already have the whole list (under ~500 rows: cities, your own orders). Filter and sort in the browser with `useMemo`. Instant, no network.\n\n**Server-side**: big or growing data (products, users, logs). Send params to the API; only one page comes back.\n\nWith TanStack Query (Day 37) the URL params simply become part of the **query key**. Changing the URL changes the key, which fetches and caches each combination. `placeholderData: keepPreviousData` keeps the previous page on screen while the next one loads.\n\nIndustry folder structure: `features/products/hooks/useProductFilters.js` (reads/writes URL params and validates them) + `features/products/api/queries.js` (useProducts(filters)) + small presentational components `SearchBox`, `CategorySelect`, `SortSelect`, `Pagination`.',
      syntax: `export function useProductFilters() {
  const [sp, setSp] = useSearchParams();
  const filters = {
    q: sp.get('q') ?? '',
    category: sp.get('category') ?? '',
    sort: SORTS[sp.get('sort')] ? sp.get('sort') : 'relevance',
    page: Math.max(1, Number(sp.get('page')) || 1),
  };
  return { filters, setFilter: (key, value) => setSp(prev => { /* as above */ }) };
}

export const useProducts = filters =>
  useQuery({
    queryKey: ['products', 'list', filters],
    queryFn: ({ signal }) => api.get(buildUrl(filters), { signal }).then(r => r.data),
    placeholderData: keepPreviousData,
  });`,
      tip: 'Coming next (Day 39): replacing page buttons with infinite scroll and rendering 10,000 rows smoothly with virtualization.',
    },
  ],
  examples: [
    {
      title: 'Filters and sorting stored in the URL (client-side list)',
      scenario: 'A food-delivery page lists restaurants in a few Indian cities. Users filter by city, "Pure veg" and sort by rating or cost. The list is small, so filtering happens in the browser, but the choices live in the URL so the link can be shared.',
      steps: [
        'Read city, veg and sort from useSearchParams with safe defaults',
        'Write an updateParam(key, value) helper that copies the previous params',
        'Filter + sort the array with useMemo',
        'Run the playground, change filters, then use the ← and → buttons in the fake address bar',
      ],
      code: `import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

export default function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get('city') ?? 'all';
  const veg = searchParams.get('veg') === '1';
  const sort = searchParams.get('sort') ?? 'rating';

  const updateParam = (key, value) =>
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      value ? next.set(key, value) : next.delete(key);
      return next;
    });

  const visible = useMemo(() => {
    const list = RESTAURANTS.filter(r => (city === 'all' || r.city === city) && (!veg || r.veg));
    return list.toSorted((a, b) => (sort === 'cost' ? a.cost - b.cost : b.rating - a.rating));
  }, [city, veg, sort]);
  // ...render selects, checkbox and list
}`,
      playground: {
        jsx: MINI_URL + `
const RESTAURANTS = [
  { id: 1, name: 'Vaishali', city: 'Pune', veg: true, rating: 4.6, cost: 400 },
  { id: 2, name: 'Barbeque Nation', city: 'Pune', veg: false, rating: 4.2, cost: 1600 },
  { id: 3, name: 'Shree Thaker Bhojanalay', city: 'Mumbai', veg: true, rating: 4.5, cost: 900 },
  { id: 4, name: 'Bademiya', city: 'Mumbai', veg: false, rating: 4.1, cost: 700 },
  { id: 5, name: 'MTR', city: 'Bengaluru', veg: true, rating: 4.7, cost: 500 },
  { id: 6, name: 'Meghana Foods', city: 'Bengaluru', veg: false, rating: 4.4, cost: 800 },
  { id: 7, name: 'Saravana Bhavan', city: 'Chennai', veg: true, rating: 4.3, cost: 450 },
  { id: 8, name: 'Karim\\'s', city: 'Delhi', veg: false, rating: 4.4, cost: 900 },
];
const CITIES = ['all', 'Pune', 'Mumbai', 'Bengaluru', 'Chennai', 'Delhi'];

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const city = CITIES.includes(searchParams.get('city')) ? searchParams.get('city') : 'all';
  const veg = searchParams.get('veg') === '1';
  const sort = searchParams.get('sort') === 'cost' ? 'cost' : 'rating';

  const updateParam = (key, value) =>
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    });

  const visible = React.useMemo(() => {
    const list = RESTAURANTS.filter(r => (city === 'all' || r.city === city) && (!veg || r.veg));
    return [...list].sort((a, b) => (sort === 'cost' ? a.cost - b.cost : b.rating - a.rating));
  }, [city, veg, sort]);

  return (
    <div>
      <AddressBar />
      <div className="toolbar">
        <label>City{' '}
          <select value={city} onChange={e => updateParam('city', e.target.value === 'all' ? '' : e.target.value)}>
            {CITIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All cities' : c}</option>)}
          </select>
        </label>
        <label><input type="checkbox" checked={veg} onChange={e => updateParam('veg', e.target.checked ? '1' : '')} /> Pure veg</label>
        <label>Sort{' '}
          <select value={sort} onChange={e => updateParam('sort', e.target.value === 'rating' ? '' : e.target.value)}>
            <option value="rating">Rating: high to low</option>
            <option value="cost">Cost for two: low to high</option>
          </select>
        </label>
      </div>
      <p className="muted">{visible.length} restaurants</p>
      <ul className="grid">
        {visible.map(r => (
          <li key={r.id} className="card">{r.veg ? '🟢' : '🔴'} {r.name}<span className="muted"> · {r.city}</span><b>★ {r.rating} · ₹{r.cost} for two</b></li>
        ))}
      </ul>
    </div>
  );
}`,
        css: CSS,
      },
      result: 'Choosing Pune, ticking Pure veg and sorting by cost changes the address bar to shopkart.in/products?city=Pune&veg=1&sort=cost and filters the cards. The ← button undoes the last filter, → redoes it.',
      explanation:
        'The URL is the single source of truth: nothing about the filters is stored in useState. Each change pushes a new history entry, so Back/Forward replay the filters. Default values (all cities, rating sort) are removed from the URL to keep links short. Unknown values (?city=Paris) fall back to the default because we validate against CITIES. The playground uses a small in-memory version of useSearchParams because the sandboxed iframe has no real router; the API is identical to React Router\'s.',
    },
    {
      title: 'Debounced search box synced to ?q=',
      scenario: 'A product search box. Typing must feel instant, but the API should be called only after the user pauses, and the URL should not get one history entry per letter.',
      steps: [
        'Keep the input value in local state, initialised from searchParams.get(\'q\')',
        'Create useDebounce(text, 400)',
        'In an effect, write the debounced text to the URL with { replace: true }',
        'Fetch /products/search?q= based on the URL value and abort old requests',
        'Run the playground, type "phone" quickly and watch the console: only one GET',
      ],
      code: `// features/products/components/SearchBox.jsx
export function SearchBox() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [text, setText] = useState(searchParams.get('q') ?? '');
  const debounced = useDebounce(text.trim(), 400);

  useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      debounced ? next.set('q', debounced) : next.delete('q');
      next.delete('page');
      return next;
    }, { replace: true });
  }, [debounced, setSearchParams]);

  return (
    <input type="search" aria-label="Search products" value={text}
      onChange={e => setText(e.target.value)} placeholder="Search products…" />
  );
}

// ResultsList.jsx reads q from the URL and calls useProducts({ q })`,
      playground: {
        jsx: MINI_URL + FETCH_HOOKS + `
function SearchBox() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [text, setText] = React.useState(searchParams.get('q') || '');
  const debounced = useDebounce(text.trim(), 400);

  React.useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (debounced) next.set('q', debounced); else next.delete('q');
      return next;
    }, { replace: true });
  }, [debounced, setSearchParams]);

  return (
    <div className="toolbar">
      <input type="search" aria-label="Search products" value={text} onChange={e => setText(e.target.value)} placeholder="Try: phone, watch, lipstick" style={{ flex: 1 }} />
      {text.trim() !== debounced && <span className="muted">typing…</span>}
    </div>
  );
}

function Results() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const { data, loading, error } = useFetchJson('https://dummyjson.com/products/search?q=' + encodeURIComponent(q) + '&limit=8&select=title,price,category');
  if (error) return <p role="alert">{error}</p>;
  if (!data) return <p className="muted">Loading…</p>;
  return (
    <div className={loading ? 'loading' : ''} aria-busy={loading}>
      <p className="muted">{q ? data.total + ' results for "' + q + '"' : 'Showing popular products'}</p>
      {data.products.length === 0 ? <p>No products match "{q}". Try another word.</p> : (
        <ul className="grid">
          {data.products.map(p => <li key={p.id} className="card">{p.title}<span className="muted"> · {p.category}</span><b>{inr(p.price)}</b></li>)}
        </ul>
      )}
    </div>
  );
}

function App() {
  return <div><AddressBar /><SearchBox /><Results /></div>;
}`,
        css: CSS,
      },
      result: 'While typing, "typing…" appears and nothing is fetched. 400 ms after you stop, the address bar becomes /products?q=phone, the console logs a single GET .../products/search?q=phone… and the results fade in. The ← button does not step through each letter because replace: true was used.',
      explanation:
        'useDebounce restarts its timer on every keystroke (the cleanup clears the previous setTimeout), so the debounced value changes only after a pause. The URL is updated from the debounced value, and Results depends only on the URL, so it fetches once. useFetchJson aborts the previous request when the URL changes, so a slow old response can never overwrite newer results. Old results stay visible but dimmed while loading, which avoids layout jumps. Empty results show a friendly empty state.',
    },
    {
      title: 'Server-side pagination with ?page= and limit/skip',
      scenario: 'An admin "All products" page with 194 products, 8 per page. Users can jump to a page, use Prev/Next, and share a link to page 5.',
      steps: [
        'Read page from the URL and clamp it to at least 1',
        'Compute skip = (page - 1) * PAGE_SIZE and call /products?limit=8&skip=…',
        'Use total from the response to compute totalPages',
        'Build a Pagination component with Prev, numbers with ellipsis, Next and aria-current',
        'Run the playground and click page numbers',
      ],
      code: `const PAGE_SIZE = 8;

export function ProductsAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const { data, isPending, isFetching } = useQuery({
    queryKey: ['products', 'list', { page }],
    queryFn: () => api.get('/products', { params: { limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE } }).then(r => r.data),
    placeholderData: keepPreviousData,
  });
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;
  const goTo = p => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', p); return n; }); window.scrollTo(0, 0); };
  // ...table + <Pagination page={page} totalPages={totalPages} onChange={goTo} />
}

// Pagination.jsx: page numbers with ellipsis
export function getPageNumbers(page, total) {
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['…', p] : [p]));
}`,
      playground: {
        jsx: MINI_URL + FETCH_HOOKS + `
const PAGE_SIZE = 8;

function getPageNumbers(page, total) {
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['…', p] : [p]));
}

function Pagination({ page, totalPages, onChange }) {
  return (
    <nav className="pager" aria-label="Pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>‹ Prev</button>
      {getPageNumbers(page, totalPages).map((p, i) =>
        p === '…' ? <span key={'gap' + i} className="muted">…</span> : (
          <button key={p} aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>{p}</button>
        )
      )}
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next ›</button>
    </nav>
  );
}

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const { data, loading, error } = useFetchJson('https://dummyjson.com/products?limit=' + PAGE_SIZE + '&skip=' + skip + '&select=title,price,stock');
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;
  const goTo = p => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n; });

  return (
    <div>
      <AddressBar />
      {error && <p role="alert">{error}</p>}
      {!data ? <p className="muted">Loading…</p> : (
        <div className={loading ? 'loading' : ''}>
          <p className="muted">Showing {skip + 1}–{Math.min(skip + PAGE_SIZE, data.total)} of {data.total}</p>
          <ul className="grid">
            {data.products.map(p => <li key={p.id} className="card">#{p.id} {p.title}<b>{inr(p.price)} · stock {p.stock}</b></li>)}
          </ul>
          <Pagination page={page} totalPages={totalPages} onChange={goTo} />
        </div>
      )}
    </div>
  );
}`,
        css: CSS,
      },
      result: 'Page 1 shows "Showing 1–8 of 194" and pager "‹ Prev 1 2 … 25 Next ›". Clicking 2 changes the URL to ?page=2, logs GET …&skip=8 and shows items #9–#16. Prev is disabled on page 1 and Next on page 25.',
      explanation:
        'The page number is read from the URL and turned into skip for the API. total from the response gives totalPages. getPageNumbers always shows the first, last, current and neighbouring pages and inserts "…" for gaps, which is how most admin panels look. Old data stays on screen (dimmed) while the next page loads, like keepPreviousData in TanStack Query.',
    },
    {
      title: 'Full product catalogue: search + category + sort + pagination together',
      scenario: 'The real thing: a catalogue page where every control writes to the URL and one function builds the API URL from the params. Changing search, category or sort resets the page to 1.',
      steps: [
        'Create a useProductFilters() hook that reads and validates q, category, sort and page',
        'Create setFilter(key, value) that deletes page when any other key changes',
        'Write buildProductsUrl(filters) that chooses /search, /category/:slug or /products and adds limit, skip, sortBy and order',
        'Load categories from /products/categories for the select',
        'Run the playground and try ?q=… then a sort, then page 2',
      ],
      code: `// features/products/hooks/useProductFilters.js
const SORTS = { relevance: {}, 'price-asc': { sortBy: 'price', order: 'asc' }, 'price-desc': { sortBy: 'price', order: 'desc' }, 'rating-desc': { sortBy: 'rating', order: 'desc' } };

export function useProductFilters() {
  const [sp, setSp] = useSearchParams();
  const filters = {
    q: sp.get('q') ?? '',
    category: sp.get('category') ?? '',
    sort: sp.get('sort') in SORTS ? sp.get('sort') : 'relevance',
    page: Math.max(1, Number(sp.get('page')) || 1),
  };
  const setFilter = (key, value) =>
    setSp(prev => {
      const next = new URLSearchParams(prev);
      value ? next.set(key, value) : next.delete(key);
      if (key !== 'page') next.delete('page');
      if (key === 'q') next.delete('category');       // this API cannot combine both
      if (key === 'category') next.delete('q');
      return next;
    }, { replace: key === 'q' });
  return { filters, setFilter };
}

// features/products/api/buildProductsUrl.js
export function buildProductsUrl({ q, category, sort, page }, pageSize = 8) {
  const base = q ? '/products/search' : category ? '/products/category/' + category : '/products';
  const params = new URLSearchParams({ limit: pageSize, skip: (page - 1) * pageSize, ...SORTS[sort] });
  if (q) params.set('q', q);
  return base + '?' + params;
}`,
      playground: {
        jsx: MINI_URL + FETCH_HOOKS + `
const PAGE_SIZE = 8;
const SORTS = { relevance: {}, 'price-asc': { sortBy: 'price', order: 'asc' }, 'price-desc': { sortBy: 'price', order: 'desc' }, 'rating-desc': { sortBy: 'rating', order: 'desc' } };

function useProductFilters() {
  const [sp, setSp] = useSearchParams();
  const filters = {
    q: sp.get('q') || '',
    category: sp.get('category') || '',
    sort: SORTS[sp.get('sort')] ? sp.get('sort') : 'relevance',
    page: Math.max(1, Number(sp.get('page')) || 1),
  };
  const setFilter = React.useCallback((key, value) =>
    setSp(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      if (key !== 'page') next.delete('page');
      if (key === 'q' && value) next.delete('category');
      if (key === 'category' && value) next.delete('q');
      return next;
    }, { replace: key === 'q' }), [setSp]);
  return { filters, setFilter };
}

function buildProductsUrl({ q, category, sort, page }) {
  const base = q ? '/products/search' : category ? '/products/category/' + category : '/products';
  const params = new URLSearchParams({ limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE, select: 'title,price,rating,category', ...SORTS[sort] });
  if (q) params.set('q', q);
  return 'https://dummyjson.com' + base + '?' + params;
}

function SearchInput({ value, onSearch }) {
  const [text, setText] = React.useState(value);
  const debounced = useDebounce(text.trim(), 400);
  React.useEffect(() => { setText(value); }, [value]);              // URL changed from outside (Back, category)
  React.useEffect(() => { if (debounced !== value) onSearch(debounced); }, [debounced]);
  return <input type="search" aria-label="Search" placeholder="Search…" value={text} onChange={e => setText(e.target.value)} />;
}

function App() {
  const { filters, setFilter } = useProductFilters();
  const categories = useFetchJson('https://dummyjson.com/products/categories');
  const { data, loading, error } = useFetchJson(buildProductsUrl(filters));
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div>
      <AddressBar />
      <div className="toolbar">
        <SearchInput value={filters.q} onSearch={v => setFilter('q', v)} />
        <select aria-label="Category" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
          <option value="">All categories</option>
          {(categories.data || []).map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select aria-label="Sort" value={filters.sort} onChange={e => setFilter('sort', e.target.value === 'relevance' ? '' : e.target.value)}>
          <option value="relevance">Relevance</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating-desc">Rating</option>
        </select>
      </div>
      {error && <p role="alert">Could not load products: {error}</p>}
      {!data ? <p className="muted">Loading…</p> : (
        <div className={loading ? 'loading' : ''}>
          <p className="muted">{data.total} products · page {filters.page} of {totalPages}</p>
          {data.products.length === 0 && <p>No results. <button onClick={() => urlStore.navigate('/products')}>Clear all filters</button></p>}
          <ul className="grid">
            {data.products.map(p => <li key={p.id} className="card">{p.title}<span className="muted"> · ★{p.rating}</span><b>{inr(p.price)}</b></li>)}
          </ul>
          <div className="pager">
            <button disabled={filters.page <= 1} onClick={() => setFilter('page', String(filters.page - 1))}>‹ Prev</button>
            <span className="muted" style={{ padding: 6 }}>{filters.page} / {totalPages}</span>
            <button disabled={filters.page >= totalPages} onClick={() => setFilter('page', String(filters.page + 1))}>Next ›</button>
          </div>
        </div>
      )}
    </div>
  );
}`,
        css: CSS,
      },
      result: 'Choose "Laptops" and "Price: low to high": the URL becomes /products?category=laptops&sort=price-asc and the cheapest laptops appear. Next › adds &page=2. Typing in search removes the category and page, and the console shows exactly one GET per settled change.',
      explanation:
        'All UI state is derived from the URL by useProductFilters, so the page can be reloaded or shared. setFilter is the only writer and enforces business rules (reset page, mutually exclusive q/category because dummyjson cannot combine them). buildProductsUrl is a pure function, easy to unit test. The search input keeps its own text for instant typing and syncs back when the URL changes from outside (Back button or choosing a category). In the real app useFetchJson is replaced by useQuery with the filters object in the query key.',
    },
  ],
  interview: [
    { q: 'Why store search, filter, sort and page in the URL instead of useState?', a: 'The URL survives refresh, can be shared or bookmarked, works with Back/Forward, and is visible to analytics and SEO. useState is lost on reload and Back would leave the page instead of undoing a filter.', level: 'Easy' },
    { q: 'What does useSearchParams return and what type are the values?', a: 'A tuple [searchParams, setSearchParams]. searchParams is a URLSearchParams instance; get() returns a string or null, so numbers and booleans must be converted and validated.', level: 'Easy' },
    { q: 'Why does setSearchParams({ category: "x" }) remove my search text?', a: 'setSearchParams replaces the whole query string. To change one key, use the functional form: setSearchParams(prev => { const n = new URLSearchParams(prev); n.set("category", "x"); return n; }).', level: 'Medium' },
    { q: 'When should you pass { replace: true } to setSearchParams or navigate?', a: 'When the change should not create a new history entry, e.g. while typing in a search box or normalising an invalid URL. Otherwise Back would step through every keystroke.', level: 'Medium' },
    { q: 'Explain debounce and write a useDebounce hook.', a: 'Debounce delays using a value until it stops changing for N ms. const useDebounce = (v, d) => { const [x, setX] = useState(v); useEffect(() => { const t = setTimeout(() => setX(v), d); return () => clearTimeout(t); }, [v, d]); return x; }. The cleanup cancels the previous timer on each change.', level: 'Medium' },
    { q: 'Debounce vs throttle?', a: 'Debounce runs once after activity stops (search input, autosave, resize end). Throttle runs at most once per interval during continuous activity (scroll position, mousemove, infinite scroll checks).', level: 'Easy' },
    { q: 'How do you prevent race conditions in search results?', a: 'Abort the previous request with AbortController in the effect cleanup (or use TanStack Query, which passes a signal and ignores outdated responses because results are stored per query key). Debouncing reduces requests but does not by itself prevent out-of-order responses.', level: 'Hard' },
    { q: 'Offset vs cursor pagination?', a: 'Offset (limit/skip or page/pageSize) allows jumping to any page and showing totals, but can skip or duplicate rows if data changes and is slow for huge offsets. Cursor pagination uses an opaque pointer to the last item; it is stable and fast, ideal for feeds and infinite scroll, but cannot jump to page N.', level: 'Medium' },
    { q: 'Why reset page to 1 when a filter changes?', a: 'The new result set may have fewer pages; staying on page 7 could show an empty page. Users also expect to see the top results of a new search.', level: 'Easy' },
    { q: 'When do you filter on the client vs on the server?', a: 'Client-side when the full data set is small and already loaded (instant, no network). Server-side when data is large, paginated, or permission-filtered; the server returns only the requested page and totals.', level: 'Medium' },
    { q: 'How do URL params work with TanStack Query?', a: 'Parse and validate the params into a filters object and put it in the query key: [\'products\', \'list\', filters]. Each combination is fetched and cached separately; placeholderData: keepPreviousData keeps the old page visible while the new one loads.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add a "Min rating" filter (?minRating=4) to the restaurant example using client-side filtering. Invalid values must be ignored.',
      hint: 'Number(searchParams.get("minRating")) and check it is between 0 and 5.',
      solution: `const raw = Number(searchParams.get('minRating'));
const minRating = raw >= 0 && raw <= 5 ? raw : 0;

<select value={minRating} onChange={e => updateParam('minRating', e.target.value === '0' ? '' : e.target.value)}>
  <option value="0">Any rating</option>
  <option value="4">4★ and above</option>
  <option value="4.5">4.5★ and above</option>
</select>

const visible = useMemo(
  () => RESTAURANTS
    .filter(r => (city === 'all' || r.city === city) && (!veg || r.veg) && r.rating >= minRating)
    .sort((a, b) => (sort === 'cost' ? a.cost - b.cost : b.rating - a.rating)),
  [city, veg, sort, minRating]
);`,
    },
    {
      task: 'Write a reusable useQueryParam(key, defaultValue) hook that returns [value, setValue] like useState but stores the value in the URL and removes the key when it equals the default.',
      hint: 'Wrap useSearchParams; use the functional form of setSearchParams.',
      solution: `import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

export function useQueryParam(key, defaultValue = '', { replace = false } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(key) ?? defaultValue;
  const setValue = useCallback(
    next => {
      setSearchParams(prev => {
        const params = new URLSearchParams(prev);
        if (next === defaultValue || next === '' || next == null) params.delete(key);
        else params.set(key, String(next));
        return params;
      }, { replace });
    },
    [key, defaultValue, replace, setSearchParams]
  );
  return [value, setValue];
}

// usage
const [sort, setSort] = useQueryParam('sort', 'relevance');`,
    },
    {
      task: 'Build a "Clear filters" button that appears only when at least one filter is active and shows chips for each active filter (click a chip to remove that filter).',
      hint: 'Iterate searchParams.entries() and skip page.',
      solution: `function ActiveFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = [...searchParams.entries()].filter(([k]) => k !== 'page');
  if (active.length === 0) return null;
  const remove = key => setSearchParams(prev => {
    const n = new URLSearchParams(prev);
    n.delete(key); n.delete('page');
    return n;
  });
  return (
    <div className="chips">
      {active.map(([k, v]) => (
        <button key={k} onClick={() => remove(k)} aria-label={'Remove ' + k + ' filter'}>
          {k}: {v} ✕
        </button>
      ))}
      <button onClick={() => setSearchParams({})}>Clear all</button>
    </div>
  );
}`,
    },
    {
      task: 'Convert the pagination example to TanStack Query with keepPreviousData and prefetch the next page so clicking Next is instant.',
      hint: 'queryClient.prefetchQuery with the key for page + 1 inside a useEffect.',
      solution: `const fetchPage = page =>
  api.get('/products', { params: { limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE } }).then(r => r.data);

export function ProductsPage() {
  const [sp, setSp] = useSearchParams();
  const page = Math.max(1, Number(sp.get('page')) || 1);
  const queryClient = useQueryClient();
  const { data, isPending, isPlaceholderData } = useQuery({
    queryKey: ['products', 'list', { page }],
    queryFn: () => fetchPage(page),
    placeholderData: keepPreviousData,
  });
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  useEffect(() => {
    if (page < totalPages) {
      queryClient.prefetchQuery({ queryKey: ['products', 'list', { page: page + 1 }], queryFn: () => fetchPage(page + 1) });
    }
  }, [page, totalPages, queryClient]);

  if (isPending) return <TableSkeleton />;
  return (
    <div style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
      <ProductTable rows={data.products} />
      <Pagination page={page} totalPages={totalPages}
        onChange={p => setSp(prev => { const n = new URLSearchParams(prev); n.set('page', p); return n; })} />
    </div>
  );
}`,
    },
    {
      task: 'Write unit tests (Vitest) for getPageNumbers(page, total) covering: total = 1, page in the middle, page near the end.',
      hint: 'Expected output for (5, 10) is [1, "…", 4, 5, 6, "…", 10].',
      solution: `import { describe, it, expect } from 'vitest';
import { getPageNumbers } from './getPageNumbers';

describe('getPageNumbers', () => {
  it('returns [1] when there is one page', () => {
    expect(getPageNumbers(1, 1)).toEqual([1]);
  });
  it('adds ellipsis on both sides for a middle page', () => {
    expect(getPageNumbers(5, 10)).toEqual([1, '…', 4, 5, 6, '…', 10]);
  });
  it('has no gap at the end when on the last page', () => {
    expect(getPageNumbers(10, 10)).toEqual([1, '…', 9, 10]);
  });
  it('has no gap when pages are adjacent', () => {
    expect(getPageNumbers(2, 3)).toEqual([1, 2, 3]);
  });
});`,
    },
  ],
  quiz: [
    {
      question: 'What does searchParams.get("page") return for the URL /products?page=3?',
      options: ['The number 3', 'The string "3"', 'An array ["3"]', 'undefined'],
      answer: 1,
      explanation: 'URL values are always strings (or null if missing); convert with Number().',
    },
    {
      question: 'Which option stops a search box from creating one history entry per keystroke?',
      options: ['{ preventScrollReset: true }', '{ state: null }', '{ replace: true }', '{ relative: "path" }'],
      answer: 2,
      explanation: 'replace: true replaces the current history entry instead of pushing a new one.',
    },
    {
      question: 'With 194 items and 8 per page, what is skip for page 3?',
      options: ['16', '24', '3', '8'],
      answer: 0,
      explanation: 'skip = (page - 1) * pageSize = 2 * 8 = 16.',
    },
    {
      question: 'Why does a useDebounce hook need a cleanup function in its effect?',
      options: ['To abort the fetch request', 'To reset the URL', 'React requires every effect to return something', 'To clear the previous timer when the value changes again'],
      answer: 3,
      explanation: 'Clearing the old setTimeout on each change is what makes it wait for a pause.',
    },
    {
      question: 'Which approach best prevents old search results from overwriting newer ones?',
      options: ['Abort the previous request (or key results per query with TanStack Query)', 'Increase the debounce delay', 'Use useMemo', 'Store results in localStorage'],
      answer: 0,
      explanation: 'Debouncing reduces requests, but only cancellation or per-key caching guarantees the latest results win.',
    },
  ],
};
