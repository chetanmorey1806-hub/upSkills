const USE_IN_VIEW = `// Reusable hook: is the element visible inside rootRef (or the viewport)?
function useInView({ rootRef, rootMargin = '0px' } = {}) {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { root: rootRef ? rootRef.current : null, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();          // cleanup: stop observing on unmount
  }, [rootRef, rootMargin]);
  return [ref, inView];
}
`;

const MINI_INFINITE = `// ---------- mini useInfiniteQuery (learning version, plain React) ----------
function useInfiniteQuery({ queryFn, initialPageParam, getNextPageParam }) {
  const [pages, setPages] = React.useState([]);
  const [status, setStatus] = React.useState('pending');
  const [error, setError] = React.useState(null);
  const [isFetchingNextPage, setIsFetchingNextPage] = React.useState(false);
  const busy = React.useRef(false);

  const nextPageParam = pages.length ? getNextPageParam(pages[pages.length - 1], pages) : initialPageParam;
  const hasNextPage = nextPageParam !== undefined && nextPageParam !== null;

  const load = React.useCallback(async pageParam => {
    if (busy.current) return;                    // never fetch the same page twice at once
    busy.current = true;
    setIsFetchingNextPage(true);
    try {
      const page = await queryFn({ pageParam });
      setPages(prev => [...prev, page]);
      setStatus('success');
      setError(null);
    } catch (err) {
      setError(err);
      setPages(prev => { if (prev.length === 0) setStatus('error'); return prev; });
    } finally {
      busy.current = false;
      setIsFetchingNextPage(false);
    }
  }, [queryFn]);

  React.useEffect(() => { load(initialPageParam); }, []);

  return {
    data: { pages }, status, error,
    isPending: status === 'pending', isError: status === 'error',
    hasNextPage, isFetchingNextPage,
    fetchNextPage: () => { if (hasNextPage) return load(nextPageParam); },
  };
}
// ---------- end of mini useInfiniteQuery ----------
`;

const CSS = `.feed{height:360px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;padding:8px}
.item{display:flex;gap:10px;align-items:center;padding:8px;border-bottom:1px solid #f1f5f9}
.item img{width:48px;height:48px;object-fit:cover;border-radius:6px;background:#f1f5f9}
.item b{margin-left:auto;color:#0f766e}.sentinel{padding:14px;text-align:center;color:#64748b;font-size:13px}
.muted{color:#64748b;font-size:13px}.err{color:#b91c1c}button{padding:6px 12px;cursor:pointer}
.skeleton{height:48px;margin:8px 0;border-radius:6px;background:linear-gradient(90deg,#f1f5f9,#e2e8f0,#f1f5f9);background-size:200% 100%;animation:sh 1.2s infinite}
@keyframes sh{to{background-position:-200% 0}}`;

export default {
  id: 'day-39-infinite-scroll-virtualized-lists',
  title: 'Infinite Scroll and Virtualized Lists: IntersectionObserver, useInfiniteQuery and react-window',
  module: 'Module 8: Working with APIs like a Pro',
  day: 39,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Feeds like Instagram, LinkedIn and Swiggy load more content as you scroll, and admin panels must show thousands of rows without freezing. Today you build infinite scroll with IntersectionObserver, manage pages with TanStack Query\'s useInfiniteQuery, and keep huge lists fast with virtualization (react-window / TanStack Virtual).',
  objectives: [
    'Compare pagination buttons, "Load more" and infinite scroll and choose the right one',
    'Detect when the user reaches the end of a list with IntersectionObserver and a sentinel element',
    'Use useInfiniteQuery (initialPageParam, getNextPageParam, fetchNextPage, hasNextPage, isFetchingNextPage)',
    'Explain list virtualization (windowing) and render 10,000 rows with react-window',
    'Handle loading, error, retry and end-of-list states in an infinite feed',
  ],
  theory: [
    {
      heading: 'Pagination vs "Load more" vs infinite scroll',
      content:
        'All three load data in **pages**; they differ in how the next page is requested.\n\n- **Numbered pagination** (Day 38): best for admin tables, search results and anything users want to jump around in or share by page.\n- **"Load more" button**: the user clicks to append the next page. Footer stays reachable, accessible by keyboard, and the user is in control. Used by many e-commerce category pages.\n- **Infinite scroll**: the next page loads automatically when the user nears the bottom. Best for **feeds** where people browse rather than search (social media, news, reels).\n\nInfinite scroll problems you must handle: the footer becomes unreachable, the scroll position is lost when navigating back, memory grows as thousands of items are appended, and screen-reader users need a way to know new content arrived. Many teams combine infinite scroll with a "Load more" fallback button.',
      tip: 'Interview answer: "Infinite scroll for discovery feeds, pagination for goal-oriented lists like orders or admin tables, and virtualization whenever the number of rendered rows gets large."',
    },
    {
      heading: 'IntersectionObserver and the sentinel pattern',
      content:
        'The old way was listening to `scroll` events and comparing `scrollTop + clientHeight >= scrollHeight - 100`. It fires dozens of times per second and needs throttling.\n\n**IntersectionObserver** (JS Day 43) is a browser API that tells you asynchronously when an element enters or leaves the viewport (or a scrollable container). It is efficient because the browser does the work off the main thread.\n\nThe **sentinel pattern**: render an empty `<div>` after the last item. When it becomes visible, load the next page.\n\nOptions:\n\n- `root`: the scrollable container (`null` = the browser viewport)\n- `rootMargin`: grow the root box, e.g. `\'300px\'` to start loading **before** the user actually reaches the bottom\n- `threshold`: how much of the element must be visible (0 to 1)\n\nIn React, create the observer in `useEffect`, observe `ref.current`, and **disconnect in cleanup**. Libraries like `react-intersection-observer` give you a ready `useInView()` hook.',
      syntax: `useEffect(() => {
  const el = sentinelRef.current;
  if (!el) return;
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) loadMore(); },
    { root: null, rootMargin: '300px' }
  );
  observer.observe(el);
  return () => observer.disconnect();
}, [loadMore]);`,
      tip: 'Guard against double loading: do not call loadMore while a page is already loading or when there is no next page. Otherwise a fast scroll fires two requests for the same page and you get duplicate items (and duplicate key warnings).',
    },
    {
      heading: 'useInfiniteQuery (TanStack Query v5)',
      content:
        '`useInfiniteQuery` is useQuery for lists that grow. It stores **all loaded pages** in one cache entry.\n\n- `queryFn: ({ pageParam }) => ...`: fetch one page using pageParam (a page number, skip offset or cursor)\n- `initialPageParam`: **required in v5**, e.g. `0`\n- `getNextPageParam(lastPage, allPages)`: return the param for the next page, or **undefined** when there are no more pages\n- returns `data.pages` (array of page responses), `fetchNextPage()`, `hasNextPage`, `isFetchingNextPage`, plus the usual `isPending`, `isError`\n\nFlatten pages for rendering: `const items = data.pages.flatMap(p => p.products)`.\n\nBonus: when the user goes to a product and comes back, the cached pages are still there, so the list does not reload from page 1. Use `maxPages` to limit memory on very long feeds.',
      syntax: `import { useInfiniteQuery } from '@tanstack/react-query';

const LIMIT = 10;
export function useInfiniteProducts() {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite'],
    queryFn: ({ pageParam, signal }) =>
      api.get('/products', { params: { limit: LIMIT, skip: pageParam }, signal }).then(r => r.data),
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      const next = lastPage.skip + lastPage.limit;
      return next < lastPage.total ? next : undefined;
    },
  });
}`,
    },
    {
      heading: 'Why huge lists are slow: virtualization (windowing)',
      content:
        'Rendering 10,000 rows creates 10,000+ DOM nodes. The browser must lay them out and paint them, React must diff them, and memory grows. The result: slow first render, laggy scrolling and slow typing in filters.\n\n**Virtualization** renders only the rows that are **visible** plus a few extra (**overscan**). A tall empty container keeps the scrollbar correct, and each visible row is absolutely positioned at `index * rowHeight`. As you scroll, the same ~20 DOM nodes are reused for different data.\n\nAnalogy: a train window. The landscape is 500 km long, but you only see the 50 metres outside the window at any moment.\n\nThe maths for fixed-height rows:\n\n- `startIndex = Math.floor(scrollTop / rowHeight)`\n- `endIndex = Math.ceil((scrollTop + viewportHeight) / rowHeight)`\n- render `items.slice(startIndex - overscan, endIndex + overscan)`\n- inner container height = `items.length * rowHeight`',
      points: [
        'Use virtualization when you render more than a few hundred complex rows (tables, logs, chat history, dropdowns with 5,000 cities)',
        'Fixed row height is simplest and fastest; variable heights need measuring (VariableSizeList, or TanStack Virtual\'s measureElement)',
        'Ctrl+F browser search cannot find rows that are not rendered; this is a known trade-off',
      ],
    },
    {
      heading: 'react-window, TanStack Virtual and combining with infinite loading',
      content:
        '**react-window** (by Brian Vaughn, from the React team) is the most common library. Most existing codebases use the v1 API: `FixedSizeList` / `VariableSizeList` / `FixedSizeGrid` with `height`, `itemCount`, `itemSize` and a row component that **must apply the `style` prop** it receives (that style holds the absolute position). Version 2 (2025) renamed the main component to `List` with `rowComponent`, `rowCount` and `rowHeight` props; the idea is identical.\n\n**@tanstack/react-virtual** is headless (you write the markup) and is popular for tables built with TanStack Table (Day 46).\n\nInfinite + virtual together: render `itemCount = hasNextPage ? items.length + 1 : items.length`; the extra last row is a "Loading…" row, and when it is rendered you call `fetchNextPage()`.',
      syntax: `import { FixedSizeList } from 'react-window';   // npm i react-window

const Row = ({ index, style, data }) => (
  <div style={style} className="row">        {/* style is required */}
    {data[index].name}
  </div>
);

<FixedSizeList height={480} width="100%" itemCount={users.length} itemSize={48} itemData={users} overscanCount={5}>
  {Row}
</FixedSizeList>`,
      tip: 'Common mistake: forgetting to pass style to the row element. All rows then render on top of each other at the top of the list.',
    },
  ],
  examples: [
    {
      title: 'Infinite scroll with IntersectionObserver (no library)',
      scenario: 'A product feed that loads 10 more products from dummyjson whenever the user scrolls near the end of the list box.',
      steps: [
        'Keep items, skip, total, loading and error in state',
        'Write loadMore() that fetches /products?limit=10&skip=… and appends the products',
        'Create a useInView hook with IntersectionObserver; root is the scrollable box, rootMargin 150px',
        'Render a sentinel div after the list; when it is in view and not loading and there is more data, call loadMore',
        'Run the playground and scroll inside the box',
      ],
      code: `export function ProductFeed() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(Infinity);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  const [sentinelRef, inView] = useInView({ rootRef: boxRef, rootMargin: '150px' });
  const hasMore = items.length < total;

  const loadMore = useCallback(async () => {
    setLoading(true);
    const res = await fetch('https://dummyjson.com/products?limit=10&skip=' + items.length + '&select=title,price,thumbnail');
    const data = await res.json();
    setItems(prev => [...prev, ...data.products]);
    setTotal(data.total);
    setLoading(false);
  }, [items.length]);

  useEffect(() => {
    if (inView && hasMore && !loading) loadMore();
  }, [inView, hasMore, loading, loadMore]);

  return (
    <div ref={boxRef} className="feed">
      {items.map(p => <ProductRow key={p.id} product={p} />)}
      <div ref={sentinelRef}>{hasMore ? 'Loading more…' : 'You have seen everything'}</div>
    </div>
  );
}`,
      playground: {
        jsx: USE_IN_VIEW + `
const inr = usd => '₹' + Math.round(usd * 85).toLocaleString('en-IN');

function App() {
  const [items, setItems] = React.useState([]);
  const [total, setTotal] = React.useState(Infinity);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const boxRef = React.useRef(null);
  const [sentinelRef, inView] = useInView({ rootRef: boxRef, rootMargin: '150px' });
  const hasMore = items.length < total;

  const loadMore = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      console.log('loading skip=' + items.length);
      const res = await fetch('https://dummyjson.com/products?limit=10&skip=' + items.length + '&select=title,price,thumbnail');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      setItems(prev => [...prev, ...data.products]);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [items.length]);

  React.useEffect(() => {
    if (inView && hasMore && !loading && !error) loadMore();
  }, [inView, hasMore, loading, error, loadMore]);

  return (
    <div>
      <p className="muted">Loaded {items.length} of {total === Infinity ? '…' : total} products</p>
      <div ref={boxRef} className="feed">
        {items.map(p => (
          <div key={p.id} className="item">
            <img src={p.thumbnail} alt="" loading="lazy" />
            <span>{p.title}</span>
            <b>{inr(p.price)}</b>
          </div>
        ))}
        <div ref={sentinelRef} className="sentinel" aria-live="polite">
          {error ? <span className="err">{error} <button onClick={() => setError('')}>Retry</button></span>
            : hasMore ? 'Loading more…' : '🎉 You have seen all products'}
        </div>
      </div>
    </div>
  );
}`,
        css: CSS,
      },
      result: 'The box shows 10 products and the counter "Loaded 10 of 194". Scrolling near the bottom logs "loading skip=10" and appends the next 10. After 194 products the sentinel shows "You have seen all products".',
      explanation:
        'The sentinel div is always rendered after the last item. IntersectionObserver reports when it enters the scroll box (rootMargin 150px starts loading a little early). The effect only loads when not already loading and when more items exist, so one scroll cannot fire duplicate requests. If the first page does not fill the box, the sentinel stays visible; when loading turns false the effect runs again and loads another page until the box is full. aria-live announces the status for screen readers. An error stops auto-loading and shows a Retry button.',
    },
    {
      title: 'useInfiniteQuery + IntersectionObserver',
      scenario: 'The same feed written the industry way: TanStack Query stores the pages and works out the next page. The playground contains a small plain-React useInfiniteQuery with the same API (real library cannot be imported).',
      steps: [
        'Write queryFn({ pageParam }) that fetches limit=10&skip=pageParam',
        'Set initialPageParam: 0 and getNextPageParam using skip, limit and total from the last page',
        'Flatten data.pages with flatMap',
        'Call fetchNextPage() when the sentinel is in view, if hasNextPage && !isFetchingNextPage',
        'Show skeletons on the first load (isPending) and a small spinner for later pages (isFetchingNextPage)',
      ],
      code: `export function InfiniteProducts() {
  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['products', 'infinite'],
      queryFn: ({ pageParam, signal }) =>
        api.get('/products', { params: { limit: 10, skip: pageParam }, signal }).then(r => r.data),
      initialPageParam: 0,
      getNextPageParam: last => (last.skip + last.limit < last.total ? last.skip + last.limit : undefined),
    });
  const { ref, inView } = useInView({ rootMargin: '300px' });   // react-intersection-observer

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) return <ListSkeleton rows={6} />;
  if (isError) return <ErrorState message={error.message} />;
  const products = data.pages.flatMap(page => page.products);
  return (
    <>
      {products.map(p => <ProductRow key={p.id} product={p} />)}
      <div ref={ref}>{isFetchingNextPage ? <Spinner /> : !hasNextPage && 'No more products'}</div>
    </>
  );
}`,
      playground: {
        jsx: USE_IN_VIEW + MINI_INFINITE + `
const inr = usd => '₹' + Math.round(usd * 85).toLocaleString('en-IN');
const fetchProducts = async ({ pageParam }) => {
  console.log('queryFn pageParam=' + pageParam);
  const res = await fetch('https://dummyjson.com/products?limit=10&skip=' + pageParam + '&select=title,price,thumbnail,category');
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
};

function App() {
  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['products', 'infinite'],
    queryFn: fetchProducts,
    initialPageParam: 0,
    getNextPageParam: last => (last.skip + last.limit < last.total ? last.skip + last.limit : undefined),
  });
  const boxRef = React.useRef(null);
  const [sentinelRef, inView] = useInView({ rootRef: boxRef, rootMargin: '200px' });

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !error) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, error]);

  const products = data.pages.flatMap(page => page.products);
  return (
    <div>
      <p className="muted">{data.pages.length} pages · {products.length} products in cache</p>
      <div ref={boxRef} className="feed">
        {isPending && [1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" />)}
        {isError && <p role="alert" className="err">{error.message}</p>}
        {products.map(p => (
          <div key={p.id} className="item">
            <img src={p.thumbnail} alt="" loading="lazy" />
            <span>{p.title}<br /><small className="muted">{p.category}</small></span>
            <b>{inr(p.price)}</b>
          </div>
        ))}
        <div ref={sentinelRef} className="sentinel">
          {isFetchingNextPage && !isPending ? 'Loading more…' : !hasNextPage ? 'No more products' : error ? <button onClick={fetchNextPage}>Retry</button> : ''}
        </div>
      </div>
    </div>
  );
}`,
        css: CSS,
      },
      result: 'Five shimmering skeletons appear first, then 10 products. Scrolling logs "queryFn pageParam=10", "…=20" and so on; the header shows how many pages are cached. At the end the sentinel says "No more products".',
      explanation:
        'getNextPageParam reads skip, limit and total from the last page response (dummyjson returns all three) and returns undefined at the end, which makes hasNextPage false. data.pages keeps each response separately; flatMap turns them into one list for rendering. The component never tracks skip itself; the hook does. In the real library the pages also stay cached when you navigate away and back, and refetching re-requests every loaded page in order.',
    },
    {
      title: 'Virtualized list: 10,000 transactions with only ~25 DOM rows',
      scenario: 'A banking app shows 10,000 UPI transactions. Rendering them all freezes slow phones. Build a small windowing component (the same idea as react-window\'s FixedSizeList) and compare with normal rendering.',
      steps: [
        'Generate 10,000 fake transactions with ₹ amounts',
        'Build VirtualList: outer box with fixed height and onScroll, inner box with height = count × rowHeight',
        'Compute startIndex/endIndex from scrollTop and render only that slice with absolute positioning',
        'Add a toggle to render all rows normally and show how many DOM rows exist',
        'Run the playground and scroll fast in both modes',
      ],
      code: `// With the real library (react-window v1 API, used in most codebases)
import { FixedSizeList } from 'react-window';

const Row = ({ index, style, data }) => {
  const t = data[index];
  return (
    <div style={style} className="row">
      <span>{t.name}</span>
      <b className={t.amount < 0 ? 'debit' : 'credit'}>{formatINR(t.amount)}</b>
    </div>
  );
};

export function TransactionList({ transactions }) {
  return (
    <FixedSizeList height={360} width="100%" itemCount={transactions.length}
      itemSize={44} itemData={transactions} overscanCount={6}>
      {Row}
    </FixedSizeList>
  );
}`,
      playground: {
        jsx: `const NAMES = ['Swiggy', 'Zomato', 'Ola', 'IRCTC', 'Amazon', 'BigBasket', 'Jio Recharge', 'Salary credit', 'Rent to Mr. Kulkarni', 'Apollo Pharmacy'];
const TRANSACTIONS = Array.from({ length: 10000 }, (_, i) => {
  const name = NAMES[(i * 7) % NAMES.length];
  const amount = name === 'Salary credit' ? 85000 : -((i * 37) % 2400 + 49);
  return { id: i + 1, name, amount };
});
const formatINR = n => (n < 0 ? '-' : '+') + '₹' + Math.abs(n).toLocaleString('en-IN');

function VirtualList({ items, height, rowHeight, overscan = 5, renderRow }) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(items.length, Math.ceil((scrollTop + height) / rowHeight) + overscan);
  const visible = items.slice(start, end);
  return (
    <div className="box" style={{ height }} onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
      <div style={{ height: items.length * rowHeight, position: 'relative' }}>
        {visible.map((item, i) => renderRow(item, {
          position: 'absolute', top: (start + i) * rowHeight, left: 0, right: 0, height: rowHeight,
        }))}
      </div>
    </div>
  );
}

function Row({ t, style }) {
  return (
    <div className="row" style={style}>
      <span>#{t.id} {t.name}</span>
      <b className={t.amount < 0 ? 'debit' : 'credit'}>{formatINR(t.amount)}</b>
    </div>
  );
}

function App() {
  const [virtual, setVirtual] = React.useState(true);
  const [domRows, setDomRows] = React.useState(0);
  const [renderMs, setRenderMs] = React.useState(0);
  const t0 = performance.now();

  React.useEffect(() => {
    setRenderMs(Math.round(performance.now() - t0));
    setDomRows(document.querySelectorAll('.row').length);
    const id = setInterval(() => setDomRows(document.querySelectorAll('.row').length), 500);
    return () => clearInterval(id);
  }, [virtual]);

  return (
    <div>
      <label><input type="checkbox" checked={virtual} onChange={e => setVirtual(e.target.checked)} /> Virtualize</label>
      <p className="muted">{TRANSACTIONS.length.toLocaleString('en-IN')} transactions · DOM rows right now: <b>{domRows}</b> · last switch render: {renderMs} ms</p>
      {virtual ? (
        <VirtualList items={TRANSACTIONS} height={360} rowHeight={44} renderRow={(t, style) => <Row key={t.id} t={t} style={style} />} />
      ) : (
        <div className="box" style={{ height: 360 }}>
          {TRANSACTIONS.map(t => <Row key={t.id} t={t} style={{ height: 44 }} />)}
        </div>
      )}
    </div>
  );
}`,
        css: `.box{overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px}
.row{display:flex;justify-content:space-between;align-items:center;padding:0 12px;border-bottom:1px solid #f1f5f9;box-sizing:border-box;font-size:14px}
.debit{color:#b91c1c}.credit{color:#15803d}.muted{color:#64748b;font-size:13px}`,
      },
      result: 'With "Virtualize" on, the DOM row counter stays around 18–25 while you scroll through all 10,000 transactions smoothly. Unticking it renders 10,000 rows: the counter jumps to 10000 and the switch takes noticeably longer.',
      explanation:
        'The inner div is 10,000 × 44 = 440,000 px tall, so the scrollbar behaves as if every row existed. On every scroll event we compute which rows are inside the 360 px window (plus 5 rows of overscan above and below) and render only those, positioned absolutely at index × rowHeight. React reuses the components as indexes shift. This is exactly what react-window does internally, with extra optimisations (scroll throttling with requestAnimationFrame, isScrolling flag, RTL support).',
    },
    {
      title: 'Production feed: error retry, end of list, "Back to top" and scroll restore',
      scenario: 'A blog feed from jsonplaceholder (100 posts, 10 per page). It must survive a failed request, tell the user when the list ends, offer a "Back to top" button and remember the scroll position when the user switches tabs and comes back.',
      steps: [
        'Fetch /posts?_page=N&_limit=10; stop when a page returns fewer than 10 posts',
        'Add a "Fail next request" checkbox to simulate network errors and show a Retry button',
        'Show a floating "Back to top" button after scrolling 600 px',
        'Store scrollTop in a ref when the Feed unmounts and restore it on mount',
        'Run the playground: scroll, switch to "Profile", switch back',
      ],
      code: `// Scroll restoration with a module-level cache (or sessionStorage / React Router's <ScrollRestoration />)
const feedScroll = { top: 0 };

function Feed() {
  const boxRef = useRef(null);
  useLayoutEffect(() => {
    const box = boxRef.current;
    box.scrollTop = feedScroll.top;                     // restore before paint
    return () => { feedScroll.top = box.scrollTop; };   // save on unmount
  }, []);
  // ...useInfiniteQuery as before: pages stay in cache, so the restored position is valid
}`,
      playground: {
        jsx: USE_IN_VIEW + `
const PAGE = 10;
const feedCache = { posts: [], page: 0, done: false, scrollTop: 0 };   // survives tab switches
let failNext = false;

function Feed() {
  const [posts, setPosts] = React.useState(feedCache.posts);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [done, setDone] = React.useState(feedCache.done);
  const [showTop, setShowTop] = React.useState(false);
  const boxRef = React.useRef(null);
  const [sentinelRef, inView] = useInView({ rootRef: boxRef, rootMargin: '100px' });

  React.useLayoutEffect(() => {
    const box = boxRef.current;
    box.scrollTop = feedCache.scrollTop;
    return () => { feedCache.scrollTop = box.scrollTop; };
  }, []);

  const loadMore = async () => {
    setLoading(true); setError('');
    try {
      if (failNext) { failNext = false; throw new Error('Network error (simulated)'); }
      const next = feedCache.page + 1;
      const res = await fetch('https://jsonplaceholder.typicode.com/posts?_page=' + next + '&_limit=' + PAGE);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      feedCache.page = next;
      feedCache.posts = [...feedCache.posts, ...data];
      feedCache.done = data.length < PAGE;
      setPosts(feedCache.posts);
      setDone(feedCache.done);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (inView && !loading && !done && !error) loadMore();
  }, [inView, loading, done, error]);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={boxRef} className="feed" onScroll={e => setShowTop(e.currentTarget.scrollTop > 600)}>
        {posts.map(p => (
          <article key={p.id} className="item" style={{ display: 'block' }}>
            <strong>#{p.id} {p.title}</strong>
            <p className="muted">{p.body.slice(0, 80)}…</p>
          </article>
        ))}
        <div ref={sentinelRef} className="sentinel" aria-live="polite">
          {error ? <span className="err">{error} · <button onClick={() => setError('')}>Retry</button></span>
            : done ? 'You are all caught up ✔' : 'Loading…'}
        </div>
      </div>
      {showTop && <button className="top" onClick={() => boxRef.current.scrollTo({ top: 0, behavior: 'smooth' })}>↑ Back to top</button>}
    </div>
  );
}

function App() {
  const [tab, setTab] = React.useState('feed');
  const [fail, setFail] = React.useState(false);
  return (
    <div>
      <nav className="tabs">
        <button className={tab === 'feed' ? 'on' : ''} onClick={() => setTab('feed')}>Feed</button>
        <button className={tab === 'profile' ? 'on' : ''} onClick={() => setTab('profile')}>Profile</button>
        <label className="muted"><input type="checkbox" checked={fail} onChange={e => { setFail(e.target.checked); failNext = e.target.checked; }} /> Fail next request</label>
      </nav>
      {tab === 'feed' ? <Feed /> : <p>Profile page. Go back to Feed: your scroll position and loaded posts are restored.</p>}
    </div>
  );
}`,
        css: CSS + `
.tabs{display:flex;gap:8px;align-items:center;margin-bottom:8px}.tabs .on{background:#1d4ed8;color:#fff;border:1px solid #1d4ed8}
.top{position:absolute;right:16px;bottom:16px;border-radius:999px;background:#0f172a;color:#fff;border:0;box-shadow:0 4px 12px rgba(0,0,0,.2)}`,
      },
      result: 'Posts load in pages of 10 while you scroll; after post #100 it says "You are all caught up ✔". Ticking "Fail next request" makes the next load show a red error with Retry. After scrolling, "↑ Back to top" appears. Switching to Profile and back shows the same posts at the same scroll position.',
      explanation:
        'Loaded posts and the page number live in a module-level cache (in a real app: TanStack Query\'s cache), so unmounting the Feed does not lose them. useLayoutEffect restores scrollTop before the browser paints, so there is no visible jump, and its cleanup saves the position on unmount. An error stops automatic loading (otherwise the observer would retry in a tight loop) until the user presses Retry. The end of the list is detected when a page returns fewer items than the page size.',
    },
  ],
  interview: [
    { q: 'How do you implement infinite scroll in React?', a: 'Render a sentinel element after the list and observe it with IntersectionObserver (in a useEffect with cleanup, or the react-intersection-observer hook). When it intersects and there is a next page and nothing is loading, fetch the next page and append it. useInfiniteQuery manages the pages and next page param.', level: 'Medium' },
    { q: 'Why is IntersectionObserver better than a scroll event listener?', a: 'Scroll events fire many times per second on the main thread and need manual throttling and layout reads (getBoundingClientRect) that can cause jank. IntersectionObserver is asynchronous, browser-optimised and only calls back when visibility changes.', level: 'Medium' },
    { q: 'What do rootMargin and threshold do?', a: 'rootMargin grows or shrinks the root\'s bounding box (e.g. "300px" triggers loading before the element is actually visible). threshold is the fraction of the target that must be visible before the callback fires (0 = any pixel, 1 = fully visible).', level: 'Easy' },
    { q: 'Explain initialPageParam and getNextPageParam in useInfiniteQuery.', a: 'initialPageParam (required in v5) is the pageParam for the first page. getNextPageParam(lastPage, allPages) computes the next page\'s param from the last response, returning undefined when there are no more pages, which sets hasNextPage to false.', level: 'Medium' },
    { q: 'How do you avoid duplicate requests or duplicate items in infinite scroll?', a: 'Only call fetchNextPage when !isFetchingNextPage and hasNextPage, use a loading guard (ref) in hand-written code, use stable unique keys, and prefer cursor-based APIs if items can be inserted while paging (offset pagination can shift and duplicate items).', level: 'Hard' },
    { q: 'What is list virtualization?', a: 'Rendering only the rows currently visible in the scroll viewport (plus overscan) and positioning them absolutely inside a container that has the full list height. DOM size stays constant regardless of list length, so rendering and scrolling stay fast.', level: 'Easy' },
    { q: 'What is overscan?', a: 'Extra rows rendered above and below the visible window so that fast scrolling does not show blank space before React renders the new rows. Too much overscan reduces the benefit; 3–10 rows is typical.', level: 'Medium' },
    { q: 'Why must a react-window row use the style prop?', a: 'The style contains position: absolute, top, height and width calculated by the list. Without it every row renders in normal flow (or overlaps at the top) and scrolling breaks.', level: 'Medium' },
    { q: 'What are the downsides of virtualization?', a: 'Browser find (Ctrl+F) cannot see unrendered rows, variable row heights need measuring, accessibility needs care (aria-rowcount/aria-rowindex for tables), sticky headers and animations are harder, and SEO crawlers see only rendered rows.', level: 'Hard' },
    { q: 'When would you NOT use infinite scroll?', a: 'For goal-oriented lists where users need to find, compare or return to a specific item (orders, admin tables, search results), when the footer has important links, or when users must share a position ("page 4"). Pagination or Load more is better there.', level: 'Easy' },
    { q: 'How would you keep memory under control in a very long feed?', a: 'Virtualize the rendered list, limit cached pages with useInfiniteQuery\'s maxPages (with getPreviousPageParam for bi-directional loading), use lazy-loaded images with fixed dimensions, and avoid storing heavy objects per item.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Convert example 1 into a "Load more" button version with a disabled state while loading and a "Showing 20 of 194" label.',
      hint: 'Same loadMore function; remove the observer.',
      solution: `function LoadMoreList() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://dummyjson.com/products?limit=10&skip=' + items.length + '&select=title,price');
      const data = await res.json();
      setItems(prev => [...prev, ...data.products]);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadMore(); }, []);

  const hasMore = total === null || items.length < total;
  return (
    <section>
      <ul>{items.map(p => <li key={p.id}>{p.title}</li>)}</ul>
      <p>Showing {items.length} of {total ?? '…'}</p>
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>{loading ? 'Loading…' : 'Load more'}</button>
      )}
    </section>
  );
}`,
    },
    {
      task: 'Write useInfiniteQuery for a cursor-based API: GET /api/notifications?cursor=abc returns { items, nextCursor } (nextCursor is null at the end).',
      hint: 'initialPageParam can be null; getNextPageParam returns lastPage.nextCursor ?? undefined.',
      solution: `export function useNotifications() {
  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam, signal }) =>
      api.get('/notifications', { params: pageParam ? { cursor: pageParam } : {}, signal }).then(r => r.data),
    initialPageParam: null,
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
  });
}

function NotificationList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications();
  const items = data?.pages.flatMap(p => p.items) ?? [];
  return (
    <>
      {items.map(n => <NotificationRow key={n.id} n={n} />)}
      {hasNextPage && <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>More</button>}
    </>
  );
}`,
    },
    {
      task: 'Build a searchable city dropdown with 5,000 options using react-window so opening it is instant.',
      hint: 'Filter with useMemo, then render a FixedSizeList inside the dropdown panel.',
      solution: `import { useMemo, useState } from 'react';
import { FixedSizeList } from 'react-window';

const Row = ({ index, style, data }) => (
  <button type="button" style={style} className="option" onClick={() => data.onPick(data.items[index])}>
    {data.items[index]}
  </button>
);

export function CityPicker({ cities, onPick }) {
  const [q, setQ] = useState('');
  const items = useMemo(
    () => cities.filter(c => c.toLowerCase().includes(q.toLowerCase())),
    [cities, q]
  );
  return (
    <div className="picker">
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search city" aria-label="Search city" />
      <FixedSizeList height={240} width="100%" itemCount={items.length} itemSize={36} itemData={{ items, onPick }}>
        {Row}
      </FixedSizeList>
      {items.length === 0 && <p>No city found</p>}
    </div>
  );
}`,
    },
    {
      task: 'Combine infinite loading with virtualization: render loaded products in a VirtualList and fetch the next page when the last rendered index is within 5 rows of the end.',
      hint: 'Use itemCount = items.length + (hasNextPage ? 1 : 0) and check endIndex in an effect.',
      solution: `function InfiniteVirtualProducts() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteProducts();
  const items = data?.pages.flatMap(p => p.products) ?? [];
  const count = items.length + (hasNextPage ? 1 : 0);
  const [range, setRange] = useState({ start: 0, end: 0 });

  useEffect(() => {
    if (range.end >= items.length - 5 && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [range.end, items.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <FixedSizeList height={480} width="100%" itemCount={count} itemSize={64}
      onItemsRendered={({ visibleStartIndex, visibleStopIndex }) =>
        setRange({ start: visibleStartIndex, end: visibleStopIndex })}>
      {({ index, style }) => (
        <div style={style}>
          {index < items.length ? <ProductRow product={items[index]} /> : 'Loading more…'}
        </div>
      )}
    </FixedSizeList>
  );
}`,
    },
    {
      task: 'Write a reusable <InfiniteSentinel onVisible={fn} disabled={bool} /> component that calls onVisible when it scrolls into view, so feature components do not repeat IntersectionObserver code.',
      hint: 'Keep the latest onVisible in a ref so the observer does not need to be recreated.',
      solution: `import { useEffect, useRef } from 'react';

export function InfiniteSentinel({ onVisible, disabled = false, rootMargin = '300px', children }) {
  const ref = useRef(null);
  const callbackRef = useRef(onVisible);
  callbackRef.current = onVisible;            // always the latest function

  useEffect(() => {
    if (disabled || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) callbackRef.current(); },
      { rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [disabled, rootMargin]);

  return <div ref={ref} aria-live="polite">{children}</div>;
}

// usage
<InfiniteSentinel onVisible={fetchNextPage} disabled={!hasNextPage || isFetchingNextPage}>
  {isFetchingNextPage ? 'Loading…' : null}
</InfiniteSentinel>`,
    },
  ],
  quiz: [
    {
      question: 'Which browser API is the modern way to detect that the user reached the end of a list?',
      options: ['MutationObserver', 'ResizeObserver', 'IntersectionObserver', 'requestIdleCallback'],
      answer: 2,
      explanation: 'IntersectionObserver reports when the sentinel element becomes visible.',
    },
    {
      question: 'In useInfiniteQuery v5, what should getNextPageParam return when there are no more pages?',
      options: ['undefined (or null)', '0', 'false only', 'The last page again'],
      answer: 0,
      explanation: 'Returning undefined/null makes hasNextPage false.',
    },
    {
      question: 'How does useInfiniteQuery give you the loaded data?',
      options: ['data.items', 'data as one flat array', 'data.next', 'data.pages, one entry per fetched page'],
      answer: 3,
      explanation: 'Pages are stored separately; flatten them with flatMap for rendering.',
    },
    {
      question: 'With virtualization, roughly how many DOM rows exist for a 10,000-row list in a 400px box with 40px rows?',
      options: ['10,000', 'About 10 visible rows plus overscan', 'Exactly 1', '400'],
      answer: 1,
      explanation: '400 / 40 = 10 visible rows, plus a few overscan rows.',
    },
    {
      question: 'What happens if a react-window row ignores the style prop?',
      options: ['Nothing, style is optional', 'Rows render in the wrong order', 'Rows are not positioned correctly and overlap or break scrolling', 'The list fetches data twice'],
      answer: 2,
      explanation: 'The style prop holds the absolute position and size of each row.',
    },
  ],
};
