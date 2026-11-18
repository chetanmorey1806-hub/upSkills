export default {
  id: 'day-12-react-interview-masterclass-machine-coding',
  title: 'React Interview Masterclass and Machine-Coding Round: Autocomplete, Pagination, Infinite Scroll, Star Rating, Modal and Todo in 45-60 Minutes',
  module: 'Module 5: Interview',
  day: 12,
  level: 'Advanced',
  duration: '4 hours',
  summary:
    'Put the whole course together for interviews. Learn how React interview rounds are structured at Indian product companies and service firms, a repeatable 45-60 minute plan for machine-coding rounds, and build the six most-asked components (autocomplete, pagination, infinite scroll, star rating, modal, todo) with accessibility and edge cases. Finish with 30 rapid-fire interview questions covering the full course.',
  objectives: [
    'Follow a time-boxed plan for a machine-coding round: clarify, design, build, polish, explain',
    'Build autocomplete with debounce, race-condition handling and keyboard navigation',
    'Build pagination, star rating, accessible modal and todo components from scratch',
    'Implement infinite scroll with IntersectionObserver without a library',
    'Answer 30 high-frequency React interview questions concisely and accurately',
  ],
  theory: [
    {
      heading: 'How React interviews are structured',
      content:
        'A typical MERN/React hiring loop (startups, product companies, and service firms like TCS Digital, Infosys Power Programmer, Accenture, Cognizant GenC Next):\n\n1. **Online assessment**: JS output questions, DSA (arrays/strings), sometimes a small React task on HackerRank/Codility.\n2. **Technical round 1 (concepts)**: JavaScript (closures, event loop, promises, this), React fundamentals and internals (Days 1-2), hooks, state management, performance.\n3. **Machine-coding round** (45-90 min): build a working UI component or mini-app in CodeSandbox/StackBlitz/your laptop while sharing the screen.\n4. **Technical round 2 / system design (frontend)**: design a feature (news feed, e-commerce cart, chat), API contracts, state, caching, auth, performance, testing.\n5. **Managerial / HR**: projects, ownership, conflicts, notice period.\n\nWhat interviewers evaluate: **working code first**, then code structure, naming, state design, edge cases, accessibility, performance awareness, and how clearly you **communicate** your thinking.',
    },
    {
      heading: 'The 45-60 minute machine-coding plan',
      content:
        '1. **Clarify (3-5 min)**: repeat the problem. Ask: API or static data? Required features vs nice-to-have? Styling expected? Keyboard support? Mobile? Write a short checklist at the top of the file as comments.\n2. **Design (5 min)**: list components and **state** (what is source of truth, what is derived). Sketch the data shape. Decide which pieces are reusable (e.g. `useDebounce`).\n3. **Build the core (20-25 min)**: get the happy path working end to end with minimal styling. Commit to simple solutions; avoid installing libraries unless allowed.\n4. **Handle states and edge cases (8-10 min)**: loading, error, empty, disabled buttons at bounds, fast typing (race conditions), large inputs.\n5. **Polish (5-8 min)**: accessibility (labels, roles, keyboard, focus), basic CSS, extract components, remove console logs.\n6. **Explain (3-5 min)**: walk through the design, trade-offs, what you would add with more time (tests, virtualization, caching, TypeScript).\n\nKeep talking while coding ("I will keep the page in state and derive the visible items"). If stuck, say what you are trying and simplify.',
      tip: 'Practise each component below at least twice with a timer. Speed comes from having patterns ready: debounce hook, fetch with AbortController, keyboard handling, portal modal.',
    },
    {
      heading: 'Reusable building blocks to memorise',
      content:
        '- **useDebounce(value, delay)**: `useEffect` + `setTimeout` + cleanup.\n- **Fetch in effect with race protection**: `AbortController` or an `ignore` flag in cleanup.\n- **Derived state**: compute filtered/sorted/paginated lists during render; do not store them in state.\n- **Functional updates**: `setItems(prev => ...)` for anything based on previous state.\n- **Stable keys**: ids from data or `crypto.randomUUID()` at creation time (not during render).\n- **Keyboard list navigation**: `activeIndex` state, ArrowDown/ArrowUp with wrap-around, Enter selects, Escape closes, `aria-activedescendant`.\n- **Click outside**: `mousedown` listener on `document` checking `ref.current.contains(e.target)`.\n- **Portal**: `createPortal(ui, document.body)` for modals/toasts so they escape `overflow: hidden` and z-index stacking.\n- **IntersectionObserver** for infinite scroll and lazy loading.\n- **localStorage persistence** with lazy initial state and try/catch.',
      syntax:
        "function useDebounce(value, delay = 300) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const t = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(t);\n  }, [value, delay]);\n  return debounced;\n}",
    },
    {
      heading: 'Accessibility and edge-case checklist',
      content:
        'Mentioning and implementing these quickly separates good candidates:\n- **Forms**: every input has a `<label>`; buttons are `<button type="button">` unless submitting; Enter submits.\n- **Autocomplete**: `role="combobox"`, `aria-expanded`, `aria-controls`, list `role="listbox"`, items `role="option"` with `aria-selected`; Escape closes; mouse and keyboard both work.\n- **Modal**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`; focus moves into the dialog and returns to the trigger on close; Escape closes; overlay click closes; body scroll locked. (Native `<dialog>` with `showModal()` gives most of this.)\n- **Star rating**: radio-group semantics or buttons with `aria-label="Rate 3 out of 5"`; hover preview; keyboard support.\n- **Pagination**: `<nav aria-label="Pagination">`, `aria-current="page"`, disabled Prev/Next at bounds, handle 0 results and page > totalPages.\n- **Lists**: empty state message, loading indicator, error with retry.\n- **Data**: trim input, ignore empty todos, avoid duplicate requests, handle API failures.',
    },
    {
      heading: 'Frontend system design in 10 minutes',
      content:
        'For senior-leaning rounds, structure your answer with **RADIO**:\n- **R**equirements: functional (what users do) and non-functional (performance, offline, SEO, accessibility, devices, scale).\n- **A**rchitecture: SPA vs SSR (Next.js) vs hybrid; component tree; routing; where state lives (server cache, client store, URL).\n- **D**ata model: entities and their shapes on the client; normalisation; caching keys.\n- **I**nterface (API): REST endpoints or GraphQL, pagination style (cursor vs offset), real-time (WebSocket/SSE), error format, auth (Day 8).\n- **O**ptimisations: code splitting, virtualization, image optimisation, optimistic updates, prefetching, CDN, Web Vitals, monitoring (Sentry), testing strategy.\n\nExample: "Design an infinite news feed": cursor pagination API, TanStack Query `useInfiniteQuery`, virtualized list (variable heights), optimistic likes, image lazy loading with fixed aspect ratios, WebSocket for "new posts" banner, skeletons to avoid CLS.',
    },
    {
      heading: 'Talking about your MERN projects',
      content:
        'Almost every interview asks "Explain your project". Prepare a 2-minute answer for one strong project using **STAR + tech depth**:\n- **What** it does and who uses it (one sentence).\n- **Architecture**: React (Vite) + React Router + TanStack Query/Redux; Express REST API; MongoDB with Mongoose; auth with JWT access + refresh cookie; deployed on Vercel/Render/AWS with Docker.\n- **Your hardest problem** and how you solved it (e.g. "token refresh caused 4 parallel refresh calls; I implemented a shared refresh promise in the axios interceptor").\n- **Numbers**: "reduced bundle from 900 KB to 350 KB with route splitting", "LCP from 4.1 s to 2.2 s", "test coverage 78%".\n- **What you would improve** next.\n\nBe ready for follow-ups on every technology you list. Never put a tool on your resume you cannot explain.',
    },
  ],
  examples: [
    {
      title: 'Machine coding 1: Autocomplete with debounce, race handling and keyboard navigation',
      scenario: 'Build a user search box that suggests names from https://jsonplaceholder.typicode.com/users as you type. Arrow keys move, Enter selects, Escape closes.',
      steps: [
        'State: query, results, status, open, activeIndex, selected',
        'Debounce the query (300 ms) and fetch in an effect with AbortController',
        'Filter results, highlight the match, handle empty/error states',
        'Add keyboard handling and ARIA combobox attributes',
        'Close on outside click and on selection',
      ],
      code: `// Key ideas
const debounced = useDebounce(query, 300);
useEffect(() => {
  if (!debounced.trim()) { setResults([]); return; }
  const controller = new AbortController();
  fetch(url + '?q=' + debounced, { signal: controller.signal }) ...
  return () => controller.abort();          // stale responses never overwrite new ones
}, [debounced]);

function onKeyDown(e) {
  if (e.key === 'ArrowDown') setActive(i => (i + 1) % results.length);
  if (e.key === 'ArrowUp') setActive(i => (i - 1 + results.length) % results.length);
  if (e.key === 'Enter' && active >= 0) select(results[active]);
  if (e.key === 'Escape') setOpen(false);
}`,
      playground: {
        jsx: `const { useState, useEffect, useRef, useId } = React;

function useDebounce(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return v;
}

function Highlight({ text, query }) {
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1 || !query) return text;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + query.length)}</mark>{text.slice(i + query.length)}</>;
}

function Autocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [selected, setSelected] = useState(null);
  const debounced = useDebounce(query, 300);
  const boxRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    if (!debounced.trim()) { setResults([]); setStatus('idle'); return; }
    const controller = new AbortController();
    setStatus('loading');
    fetch('https://jsonplaceholder.typicode.com/users', { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(users => {
        setResults(users.filter(u => u.name.toLowerCase().includes(debounced.toLowerCase())));
        setStatus('done'); setActive(-1);
      })
      .catch(e => { if (e.name !== 'AbortError') setStatus('error'); });
    return () => controller.abort();
  }, [debounced]);

  useEffect(() => {
    const onDown = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function select(user) { setSelected(user); setQuery(user.name); setOpen(false); }

  function onKeyDown(e) {
    if (!open && e.key === 'ArrowDown') { setOpen(true); return; }
    if (!results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => (i + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => (i - 1 + results.length) % results.length); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); select(results[active]); }
    else if (e.key === 'Escape') setOpen(false);
  }

  const showList = open && query.trim();
  return (
    <div ref={boxRef} style={{ position: 'relative', width: 300 }}>
      <label htmlFor={listId + '-input'}>Search users</label>
      <input id={listId + '-input'} value={query} autoComplete="off"
        role="combobox" aria-expanded={!!showList} aria-controls={listId} aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? listId + '-' + active : undefined}
        onChange={e => { setQuery(e.target.value); setOpen(true); setSelected(null); }}
        onFocus={() => setOpen(true)} onKeyDown={onKeyDown}
        style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} />
      {showList && (
        <ul id={listId} role="listbox" style={{ position: 'absolute', left: 0, right: 0, margin: 0, padding: 0, listStyle: 'none', background: '#fff', border: '1px solid #ccc', maxHeight: 200, overflow: 'auto', zIndex: 1 }}>
          {status === 'loading' && <li style={{ padding: 8 }}>Loading...</li>}
          {status === 'error' && <li style={{ padding: 8, color: 'crimson' }}>Something went wrong</li>}
          {status === 'done' && results.length === 0 && <li style={{ padding: 8 }}>No matches</li>}
          {status === 'done' && results.map((u, i) => (
            <li key={u.id} id={listId + '-' + i} role="option" aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); select(u); }} onMouseEnter={() => setActive(i)}
              style={{ padding: 8, cursor: 'pointer', background: i === active ? '#e0e7ff' : '#fff' }}>
              <Highlight text={u.name} query={debounced} />
            </li>
          ))}
        </ul>
      )}
      {selected && <p>Selected: <b>{selected.name}</b> ({selected.email})</p>}
    </div>
  );
}

function App() { return <div style={{ fontFamily: 'sans-serif', padding: 16 }}><Autocomplete /></div>; }`,
      },
      result: 'Typing "le" shows matching users with the match highlighted; arrow keys move the highlight, Enter selects, Escape or clicking outside closes.',
      explanation:
        'Debounce reduces API calls, AbortController prevents an old slow response from replacing newer results, onMouseDown + preventDefault selects before the input loses focus, and ARIA combobox attributes make it usable with screen readers.',
    },
    {
      title: 'Machine coding 2: Pagination with page numbers and ellipsis',
      scenario: 'Show 97 products, 10 per page, with Prev/Next, numbered buttons, ellipsis for many pages, and a page-size selector.',
      steps: [
        'Keep only page and pageSize in state; derive totalPages and the visible slice',
        'Write getPageNumbers(current, total) returning numbers and "..."',
        'Disable Prev/Next at the bounds; reset to page 1 when pageSize changes',
        'Add nav aria-label and aria-current',
      ],
      code: `function getPageNumbers(current, total, siblings = 1) {
  const pages = new Set([1, total, current]);
  for (let i = 1; i <= siblings; i++) { pages.add(current - i); pages.add(current + i); }
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['...', p] : [p]));
}
getPageNumbers(6, 10)  // [1, '...', 5, 6, 7, '...', 10]`,
      playground: {
        jsx: `const { useState } = React;
const products = Array.from({ length: 97 }, (_, i) => ({ id: i + 1, name: 'Product ' + (i + 1) }));

function getPageNumbers(current, total, siblings = 1) {
  const pages = new Set([1, total, current]);
  for (let i = 1; i <= siblings; i++) { pages.add(current - i); pages.add(current + i); }
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['...', p] : [p]));
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const btn = { minWidth: 34, padding: '4px 8px', margin: 2, cursor: 'pointer' };
  return (
    <nav aria-label="Pagination">
      <button style={btn} disabled={page === 1} onClick={() => onChange(page - 1)}>Prev</button>
      {getPageNumbers(page, totalPages).map((p, i) => p === '...'
        ? <span key={'e' + i} style={{ padding: '0 6px' }}>...</span>
        : <button key={p} style={{ ...btn, background: p === page ? '#4f46e5' : '', color: p === page ? '#fff' : '' }}
            aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>{p}</button>)}
      <button style={btn} disabled={page === totalPages} onClick={() => onChange(page + 1)}>Next</button>
    </nav>
  );
}

function App() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(products.length / pageSize);
  const visible = products.slice((page - 1) * pageSize, page * pageSize);   // derived, not stored
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <label>Per page{' '}
        <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
          {[5, 10, 20, 50].map(n => <option key={n}>{n}</option>)}
        </select>
      </label>
      <p>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, products.length)} of {products.length}</p>
      <ul style={{ columns: 2 }}>{visible.map(p => <li key={p.id}>{p.name}</li>)}</ul>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}`,
      },
      result: 'Page buttons show 1 ... 5 6 7 ... 10 style navigation; Prev/Next disable at the ends; changing page size resets to page 1.',
      explanation:
        'Only page and pageSize are state; everything else is derived during render, which avoids sync bugs. The Set-based algorithm is short enough to write under pressure and handles edges (first/last pages, small totals).',
    },
    {
      title: 'Machine coding 3: Star rating (reusable, hover preview, half-free, keyboard)',
      scenario: 'A product review form needs a 5-star rating component that shows a hover preview and can be read-only on product cards.',
      steps: [
        'Props: value, onChange, max = 5, readOnly',
        'Local hover state for preview; display = hover || value',
        'Render buttons with aria-label and aria-pressed',
        'Keyboard: buttons are focusable; ArrowLeft/ArrowRight change the value',
      ],
      code: `<StarRating value={rating} onChange={setRating} />
<StarRating value={4} readOnly />`,
      playground: {
        jsx: `const { useState } = React;

function StarRating({ value, onChange, max = 5, readOnly = false, size = 28 }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  function onKeyDown(e) {
    if (readOnly) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.min(max, value + 1)); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(1, value - 1)); }
  }
  return (
    <div role="group" aria-label={'Rating: ' + value + ' out of ' + max} onKeyDown={onKeyDown}
      onMouseLeave={() => setHover(0)} style={{ display: 'inline-flex' }}>
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1;
        const filled = star <= display;
        return (
          <button key={star} type="button" disabled={readOnly}
            aria-label={'Rate ' + star + ' out of ' + max} aria-pressed={star === value}
            onClick={() => onChange(star === value ? 0 : star)}       // click same star again to clear
            onMouseEnter={() => !readOnly && setHover(star)}
            style={{ background: 'none', border: 0, padding: 2, fontSize: size, lineHeight: 1,
              cursor: readOnly ? 'default' : 'pointer', color: filled ? '#f59e0b' : '#d1d5db' }}>
            {'\\u2605'}
          </button>
        );
      })}
    </div>
  );
}

const labels = ['Not rated', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];

function App() {
  const [rating, setRating] = useState(0);
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <h4>Rate this product</h4>
      <StarRating value={rating} onChange={setRating} />
      <p>{labels[rating]} ({rating}/5)</p>
      <h4>Read-only on a product card</h4>
      <StarRating value={4} readOnly size={18} /> <small>4.0 (1,284 reviews)</small>
    </div>
  );
}`,
      },
      result: 'Hovering previews stars, clicking sets the rating, clicking the same star clears it, arrow keys adjust it, and the read-only version cannot be changed.',
      explanation:
        'The parent owns the value (controlled component) while hover is purely local UI state. Using real buttons gives focus and keyboard support for free; aria-labels describe each option for screen readers.',
    },
    {
      title: 'Machine coding 4: Accessible modal with portal, Escape, overlay click, focus handling',
      scenario: 'A reusable Modal used for "Delete product?" confirmation.',
      steps: [
        'Render into document.body with ReactDOM.createPortal',
        'Close on Escape and on overlay click (not on content click)',
        'Move focus into the dialog on open and restore it on close',
        'Lock body scroll while open',
      ],
      code: `function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    dialogRef.current.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(<div className="overlay" onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-labelledby="t" ref={dialogRef} tabIndex={-1} onClick={e => e.stopPropagation()}>...</div>
  </div>, document.body);
}`,
      playground: {
        jsx: `const { useState, useEffect, useRef, useId } = React;

function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    dialogRef.current && dialogRef.current.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {                                  // simple focus trap
        const f = dialogRef.current.querySelectorAll('button, [href], input, select, textarea');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = oldOverflow;
      previouslyFocused && previouslyFocused.focus && previouslyFocused.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return ReactDOM.createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'grid', placeItems: 'center', fontFamily: 'sans-serif' }}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={dialogRef}
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 12, padding: 20, width: 'min(90vw, 360px)', outline: 'none' }}>
        <h3 id={titleId} style={{ marginTop: 0 }}>{title}</h3>
        {children}
      </div>
    </div>,
    document.body
  );
}

function App() {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState(['iPhone 16', 'Pixel 9', 'OnePlus 13']);
  const [target, setTarget] = useState(null);
  const close = React.useCallback(() => setOpen(false), []);
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <ul>{products.map(p => (
        <li key={p}>{p} <button onClick={() => { setTarget(p); setOpen(true); }}>Delete</button></li>
      ))}</ul>
      <Modal open={open} onClose={close} title="Delete product?">
        <p>Are you sure you want to delete <b>{target}</b>? This cannot be undone.</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={close}>Cancel</button>
          <button style={{ background: '#dc2626', color: '#fff', border: 0, padding: '6px 12px', borderRadius: 6 }}
            onClick={() => { setProducts(ps => ps.filter(x => x !== target)); close(); }}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}`,
      },
      result: 'Clicking Delete opens a centred dialog. Escape, Cancel or clicking the dark overlay closes it; Tab cycles inside the dialog; focus returns to the Delete button.',
      explanation:
        'The portal renders outside parent containers so overflow and z-index cannot clip it, while React events still bubble through the React tree. stopPropagation on the content prevents overlay-click closing. onClose is memoized so the effect does not re-run each render. Mention native <dialog> as an alternative.',
    },
    {
      title: 'Machine coding 5: Todo app with filters, edit, persistence',
      scenario: 'The classic: add, toggle, edit (double-click), delete, filter All/Active/Completed, clear completed, persist in localStorage.',
      steps: [
        'State: todos array (id, text, done) and filter; derive visible list and counts',
        'Lazy-initialise from localStorage and save in an effect',
        'Use useReducer to keep updates in one place',
        'Inline edit with Enter to save and Escape to cancel',
      ],
      code: `function reducer(todos, action) {
  switch (action.type) {
    case 'add': return [...todos, { id: crypto.randomUUID(), text: action.text, done: false }];
    case 'toggle': return todos.map(t => t.id === action.id ? { ...t, done: !t.done } : t);
    case 'edit': return todos.map(t => t.id === action.id ? { ...t, text: action.text } : t);
    case 'delete': return todos.filter(t => t.id !== action.id);
    case 'clearCompleted': return todos.filter(t => !t.done);
    default: return todos;
  }
}`,
      playground: {
        jsx: `const { useReducer, useState, useEffect } = React;
let seq = 0;
const newId = () => Date.now().toString(36) + (seq++);

function reducer(todos, action) {
  switch (action.type) {
    case 'add': return [...todos, { id: newId(), text: action.text, done: false }];
    case 'toggle': return todos.map(t => t.id === action.id ? { ...t, done: !t.done } : t);
    case 'edit': return todos.map(t => t.id === action.id ? { ...t, text: action.text } : t);
    case 'delete': return todos.filter(t => t.id !== action.id);
    case 'clearCompleted': return todos.filter(t => !t.done);
    default: return todos;
  }
}
function load() { try { return JSON.parse(localStorage.getItem('mc-todos')) || []; } catch (e) { return []; } }

function TodoItem({ todo, dispatch }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  function save() {
    const text = draft.trim();
    if (!text) dispatch({ type: 'delete', id: todo.id });
    else dispatch({ type: 'edit', id: todo.id, text });
    setEditing(false);
  }
  return (
    <li style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
      <input type="checkbox" checked={todo.done} onChange={() => dispatch({ type: 'toggle', id: todo.id })} aria-label={'Mark ' + todo.text} />
      {editing
        ? <input autoFocus value={draft} onChange={e => setDraft(e.target.value)} onBlur={save}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setDraft(todo.text); setEditing(false); } }} />
        : <span onDoubleClick={() => setEditing(true)} style={{ flex: 1, textDecoration: todo.done ? 'line-through' : 'none', color: todo.done ? '#999' : '' }}>{todo.text}</span>}
      <button onClick={() => dispatch({ type: 'delete', id: todo.id })} aria-label={'Delete ' + todo.text}>x</button>
    </li>
  );
}

function App() {
  const [todos, dispatch] = useReducer(reducer, undefined, load);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('all');
  useEffect(() => { try { localStorage.setItem('mc-todos', JSON.stringify(todos)); } catch (e) {} }, [todos]);

  const visible = todos.filter(t => filter === 'all' ? true : filter === 'active' ? !t.done : t.done);
  const left = todos.filter(t => !t.done).length;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16, maxWidth: 420 }}>
      <form onSubmit={e => { e.preventDefault(); if (text.trim()) { dispatch({ type: 'add', text: text.trim() }); setText(''); } }}>
        <label>New todo <input value={text} onChange={e => setText(e.target.value)} placeholder="What needs to be done?" /></label>{' '}
        <button>Add</button>
      </form>
      {todos.length === 0 ? <p>Nothing to do. Add your first task!</p> : (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>{visible.map(t => <TodoItem key={t.id} todo={t} dispatch={dispatch} />)}</ul>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span>{left} item{left === 1 ? '' : 's'} left</span>
            {['all', 'active', 'completed'].map(f => (
              <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)} style={{ fontWeight: filter === f ? 'bold' : 'normal' }}>{f}</button>
            ))}
            <button onClick={() => dispatch({ type: 'clearCompleted' })} disabled={left === todos.length}>Clear completed</button>
          </div>
          <small>Double-click a todo to edit it.</small>
        </>
      )}
    </div>
  );
}`,
      },
      result: 'A complete todo app: add, toggle, inline edit, delete, filters, counter and clear completed; data survives a reload.',
      explanation:
        'Todos are the only stored data; visible items and counts are derived. The reducer centralises updates (easy to test and explain). Lazy initialisation reads localStorage once; the effect persists changes. Editing an item to empty deletes it, a detail interviewers like.',
    },
  ],
  interview: [
    { q: 'What happens when you call setState?', a: 'React schedules an update on the component fiber with a priority lane, batches it with other updates in the same tick, re-renders the component (render phase), reconciles the new elements with the old fiber tree, and commits the minimal DOM changes, then runs layout effects and effects.', level: 'Medium' },
    { q: 'Explain reconciliation and the role of keys in one minute.', a: 'React diffs the new element tree with the previous one using heuristics: different types replace subtrees, same type updates in place, and keys identify list children across renders. Stable unique keys preserve state and DOM for moved items; index keys break with inserts/reorders.', level: 'Easy' },
    { q: 'useEffect vs useLayoutEffect?', a: 'useEffect runs after the browser paints (non-blocking) and is used for most side effects. useLayoutEffect runs synchronously after DOM mutations but before paint, used for measuring layout or preventing visual flicker (tooltips, scroll position). Overusing it blocks painting.', level: 'Medium' },
    { q: 'Why do we need cleanup functions in effects?', a: 'To undo what the effect started: remove listeners, clear timers, abort requests, close sockets. Cleanup runs before the effect re-runs and on unmount, preventing memory leaks, duplicate subscriptions and state updates from stale requests.', level: 'Easy' },
    { q: 'What is a stale closure in React and how do you fix it?', a: 'A function (e.g. in setInterval or an effect) captures state from the render it was created in and keeps seeing the old value. Fix with correct dependency arrays, functional updates (setCount(c => c + 1)), or refs holding the latest value (useEffectEvent is the newer React API for this).', level: 'Hard' },
    { q: 'Controlled vs uncontrolled inputs?', a: 'Controlled: React state is the source of truth via value + onChange. Uncontrolled: the DOM keeps the value and you read it via refs or FormData. React Hook Form uses uncontrolled inputs for performance; file inputs are always uncontrolled.', level: 'Easy' },
    { q: 'What are the new hooks in React 19?', a: 'useActionState (form action state + pending), useOptimistic (temporary optimistic UI), useFormStatus (pending state of the parent form, from react-dom), and the use() API for promises/context. Also ref as a prop, <Context> as provider and document metadata support.', level: 'Easy' },
    { q: 'Server state vs client state: which tools for which?', a: 'Server state (API data) belongs in TanStack Query or RTK Query for caching, deduplication, refetching and invalidation. Client state (UI, preferences, cart draft) belongs in useState/useReducer, Context for rarely-changing values, or Zustand/Redux for shared frequently-changing state. Shareable filters go in the URL.', level: 'Medium' },
    { q: 'How does TanStack Query decide when to refetch?', a: 'A query is fresh until staleTime passes. Stale queries refetch on mount of a new observer, window refocus, network reconnect, interval, or manual invalidation. Inactive queries are garbage collected after gcTime.', level: 'Medium' },
    { q: 'Redux Toolkit vs Zustand vs Context in one sentence each?', a: 'Context: dependency injection for rarely changing values, no selectors. Zustand: tiny hook-based store with selectors and no provider, great default for global client state. Redux Toolkit: structured, opinionated store with middleware, DevTools and RTK Query, suited to large teams and complex apps.', level: 'Medium' },
    { q: 'How would you optimise a slow React page?', a: 'Measure with React Profiler and Lighthouse on a production build; then fix structure (colocate state, split context, children-as-props), memoize where props are stable, virtualize long lists, defer non-urgent updates with useTransition/useDeferredValue, code-split routes, optimise images and dependencies, and track Web Vitals.', level: 'Hard' },
    { q: 'When does React.memo help?', a: 'When a component re-renders often with the same props and its render is expensive. Props must be referentially stable (useMemo/useCallback or primitives). It does not help when props change every render, or when the component\'s own state or context changes.', level: 'Medium' },
    { q: 'What is code splitting and how do you do it in React?', a: 'Splitting the bundle into chunks loaded on demand. Use dynamic import() with React.lazy + Suspense, or the lazy property of React Router routes. Split by route first, then heavy components (charts, editors).', level: 'Easy' },
    { q: 'Where would you store JWTs and why?', a: 'Short-lived access token in memory, long-lived refresh token in an httpOnly Secure SameSite cookie with rotation. localStorage is readable by injected scripts (XSS). Cookies need CSRF protection and CORS with credentials.', level: 'Medium' },
    { q: 'How do you protect routes in React Router 7?', a: 'Layout route components that check auth state and render <Outlet /> or <Navigate to="/login" replace state={{ from }} />, with a loading state while the session is restored; role checks for admin routes; data router loaders can throw redirect(). The backend must enforce the same rules.', level: 'Easy' },
    { q: 'How does a 401 auto-refresh interceptor work?', a: 'On a 401 response for a request not already retried, it awaits a single shared refresh promise (POST /auth/refresh with the cookie), stores the new access token, and retries the original request. If refresh fails, it logs out. The refresh endpoint itself is excluded.', level: 'Hard' },
    { q: 'What are compound components?', a: 'Components that work together and share implicit state via context, like <Tabs>, <Tabs.List>, <Tabs.Tab>, <Tabs.Panel>. They allow flexible composition without prop explosion.', level: 'Easy' },
    { q: 'What is a headless component?', a: 'A component or hook that provides behaviour, state and accessibility without markup or styles (TanStack Table, Radix primitives, Downshift), often returning prop getters, so you fully control the UI.', level: 'Medium' },
    { q: 'How do you handle forms with dynamic fields and server errors?', a: 'React Hook Form with a Zod resolver; useFieldArray (key by field.id) for dynamic rows; Controller for UI-library inputs; setError for field-level server errors and root.serverError for general errors; isSubmitting to disable submit.', level: 'Medium' },
    { q: 'What is MSW and why use it in tests?', a: 'Mock Service Worker intercepts network requests and returns mocked responses, so components, axios and query libraries run unchanged. Tests are realistic and independent of the fetching implementation; handlers can be overridden per test with server.use.', level: 'Medium' },
    { q: 'Which RTL query would you use for a button and why?', a: 'getByRole("button", { name: /save/i }) because it queries like assistive technology and also validates accessibility. Use findByRole if it appears asynchronously and queryByRole to assert absence.', level: 'Easy' },
    { q: 'How do you type a generic list component in TypeScript?', a: 'function List<T>({ items, renderItem, getKey }: { items: T[]; renderItem: (item: T) => React.ReactNode; getKey: (item: T) => string }) {...}. T is inferred from items at the call site, keeping renderItem strongly typed. In arrow functions in .tsx use <T,>.', level: 'Hard' },
    { q: 'What is the difference between SSR, SSG, CSR and RSC?', a: 'CSR renders in the browser after JS loads (Vite SPA). SSR renders HTML per request on the server then hydrates. SSG renders HTML at build time. RSC (React Server Components) run only on the server and send a serialized tree with zero component JS; they combine with SSR in frameworks like Next.js.', level: 'Hard' },
    { q: 'What is hydration and what causes hydration errors?', a: 'Hydration attaches React event handlers and state to server-rendered HTML. Errors occur when the client\'s first render differs from the server HTML: using Date.now(), Math.random(), window/localStorage during render, invalid HTML nesting, or locale differences.', level: 'Hard' },
    { q: 'How do you prevent race conditions when fetching in effects?', a: 'Abort the previous request with AbortController in the cleanup, or use an ignore flag so stale responses do not set state; or use a data library that handles it (TanStack Query cancels and keys results by query key).', level: 'Medium' },
    { q: 'What would you do in the first 5 minutes of a machine-coding round?', a: 'Restate the problem, ask clarifying questions (data source, must-have features, keyboard/a11y, styling expectations), write a feature checklist, and outline components and state shape before coding.', level: 'Easy' },
    { q: 'How would you design the state for an autocomplete?', a: 'query (controlled input), debounced query (derived via hook), results + status (from fetch or a query library keyed by the debounced query), open flag, activeIndex for keyboard navigation, and the selected item. Results are not recomputed from query directly to avoid excess requests.', level: 'Medium' },
    { q: 'Why use a portal for modals?', a: 'Portals render children into a different DOM node (usually document.body), escaping parent overflow:hidden and stacking-context z-index issues, while keeping React context and event bubbling through the React tree.', level: 'Medium' },
    { q: 'What are error boundaries and what do they not catch?', a: 'Class components (or react-error-boundary) that catch render/lifecycle errors in their subtree and show a fallback. They do not catch errors in event handlers, async code (setTimeout, promises outside React), SSR, or in the boundary itself; React 19 Actions do route errors thrown in transitions to boundaries.', level: 'Medium' },
    { q: 'What is React Compiler and does it replace useMemo?', a: 'A build-time compiler (stable in 2025) that automatically memoizes components and values based on static analysis, so most manual useMemo/useCallback/memo becomes unnecessary. You still need to follow the Rules of React and may keep manual memoization for specific effect dependency control.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Machine coding (45 min): Infinite scroll photo grid using https://picsum.photos/v2/list?page=N&limit=12. Load the next page when the user reaches the bottom; show a loader; stop at page 10; handle errors with a Retry button.',
      hint: 'Sentinel div + IntersectionObserver; keep pages, loading, error and hasMore in state; guard against double loads.',
      solution: `const { useState, useEffect, useRef, useCallback } = React;

function App() {
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinel = useRef(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch('https://picsum.photos/v2/list?page=' + page + '&limit=12');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      setPhotos(p => [...p, ...data]);
      setPage(p => p + 1);
      if (data.length < 12 || page >= 10) setHasMore(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || error) return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadMore(); }, { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, error]);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
        {photos.map(p => (
          <img key={p.id} src={'https://picsum.photos/id/' + p.id + '/300/300'} alt={'Photo by ' + p.author}
               width="300" height="300" loading="lazy" style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
        ))}
      </div>
      <div ref={sentinel} style={{ height: 1 }} />
      {loading && <p>Loading...</p>}
      {error && <p>Failed: {error} <button onClick={loadMore}>Retry</button></p>}
      {!hasMore && <p>No more photos</p>}
    </div>
  );
}`,
    },
    {
      task: 'Machine coding (30 min): Nested comments (like Reddit) with reply and delete at any depth, data shape { id, text, replies: [] }.',
      hint: 'Recursive component + recursive immutable update helpers.',
      solution: `const { useState } = React;
let nid = 100;
const initial = [{ id: 1, text: 'Great article!', replies: [{ id: 2, text: 'Agreed', replies: [] }] }];

const addReply = (list, parentId, text) => list.map(c => c.id === parentId
  ? { ...c, replies: [...c.replies, { id: nid++, text, replies: [] }] }
  : { ...c, replies: addReply(c.replies, parentId, text) });
const remove = (list, id) => list.filter(c => c.id !== id).map(c => ({ ...c, replies: remove(c.replies, id) }));

function Comment({ comment, onReply, onDelete }) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState('');
  return (
    <div style={{ marginLeft: 16, borderLeft: '2px solid #eee', paddingLeft: 8 }}>
      <p>{comment.text} <button onClick={() => setReplying(r => !r)}>Reply</button> <button onClick={() => onDelete(comment.id)}>Delete</button></p>
      {replying && (
        <form onSubmit={e => { e.preventDefault(); if (text.trim()) { onReply(comment.id, text.trim()); setText(''); setReplying(false); } }}>
          <input autoFocus value={text} onChange={e => setText(e.target.value)} /> <button>Post</button>
        </form>
      )}
      {comment.replies.map(r => <Comment key={r.id} comment={r} onReply={onReply} onDelete={onDelete} />)}
    </div>
  );
}

function App() {
  const [comments, setComments] = useState(initial);
  return comments.map(c => (
    <Comment key={c.id} comment={c}
      onReply={(id, text) => setComments(cs => addReply(cs, id, text))}
      onDelete={(id) => setComments(cs => remove(cs, id))} />
  ));
}`,
    },
    {
      task: 'Machine coding (30 min): OTP input with 6 boxes: auto-focus next on type, Backspace goes back, paste of a 6-digit code fills all boxes, Submit enabled only when complete.',
      hint: 'Array of refs; handle onChange, onKeyDown and onPaste.',
      solution: `const { useState, useRef } = React;

function OtpInput({ length = 6, onComplete }) {
  const [values, setValues] = useState(Array(length).fill(''));
  const refs = useRef([]);

  function setAt(i, v) {
    const next = [...values]; next[i] = v; setValues(next);
    if (next.every(Boolean)) onComplete(next.join(''));
  }
  function onChange(i, e) {
    const v = e.target.value.replace(/\\D/g, '').slice(-1);
    setAt(i, v);
    if (v && i < length - 1) refs.current[i + 1].focus();
  }
  function onKeyDown(i, e) {
    if (e.key === 'Backspace' && !values[i] && i > 0) refs.current[i - 1].focus();
  }
  function onPaste(e) {
    const digits = e.clipboardData.getData('text').replace(/\\D/g, '').slice(0, length);
    if (!digits) return;
    e.preventDefault();
    const next = Array.from({ length }, (_, i) => digits[i] || '');
    setValues(next);
    refs.current[Math.min(digits.length, length - 1)].focus();
    if (next.every(Boolean)) onComplete(next.join(''));
  }
  return (
    <div onPaste={onPaste} style={{ display: 'flex', gap: 8 }}>
      {values.map((v, i) => (
        <input key={i} ref={el => (refs.current[i] = el)} value={v} inputMode="numeric" maxLength={1}
          aria-label={'Digit ' + (i + 1)} onChange={e => onChange(i, e)} onKeyDown={e => onKeyDown(i, e)}
          style={{ width: 40, height: 48, textAlign: 'center', fontSize: 22 }} />
      ))}
    </div>
  );
}

function App() {
  const [code, setCode] = useState('');
  return (
    <div style={{ padding: 16 }}>
      <OtpInput onComplete={setCode} />
      <button disabled={code.length !== 6} style={{ marginTop: 12 }}>Verify {code}</button>
    </div>
  );
}`,
    },
    {
      task: 'Machine coding (40 min): Data table with search, column sorting (asc/desc toggle) and pagination for 50 users from https://jsonplaceholder.typicode.com/users (repeat the 10 users 5 times with new ids).',
      hint: 'Derive filtered -> sorted -> paginated arrays with useMemo; reset page on search.',
      solution: `const { useState, useEffect, useMemo } = React;

function App() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users').then(r => r.json()).then(data =>
      setUsers(Array.from({ length: 5 }, (_, k) => data.map(u => ({ id: k * 10 + u.id, name: u.name, email: u.email, city: u.address.city }))).flat()));
  }, []);

  const rows = useMemo(() => {
    const filtered = users.filter(u => (u.name + u.email + u.city).toLowerCase().includes(q.toLowerCase()));
    return [...filtered].sort((a, b) => {
      const r = String(a[sort.key]).localeCompare(String(b[sort.key]));
      return sort.dir === 'asc' ? r : -r;
    });
  }, [users, q, sort]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);
  const toggleSort = (key) => setSort(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  const arrow = (key) => sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <input placeholder="Search" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', marginTop: 8 }}>
        <thead><tr>{['name', 'email', 'city'].map(k => (
          <th key={k} aria-sort={sort.key === k ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
            <button onClick={() => toggleSort(k)}>{k}{arrow(k)}</button>
          </th>))}</tr></thead>
        <tbody>
          {visible.length ? visible.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.city}</td></tr>)
            : <tr><td colSpan="3">No results</td></tr>}
        </tbody>
      </table>
      <p>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button> Page {page} / {totalPages}{' '}
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </p>
    </div>
  );
}`,
    },
    {
      task: 'Write your 2-minute "Explain your MERN project" answer using the template from the theory section, including one hard problem, one metric and one improvement.',
      hint: 'What, architecture, hard problem, numbers, next steps.',
      solution: `"I built ShopKart, an e-commerce app where customers browse products, pay with Razorpay test mode and track orders, and admins manage inventory.
Architecture: React 19 with Vite, React Router 7 and TanStack Query on the frontend; Zustand for the cart; React Hook Form + Zod shared with the backend; Express REST API with MongoDB/Mongoose; JWT access token in memory plus httpOnly refresh cookie with rotation; images on Cloudinary; deployed with Docker on Render and the frontend on Vercel.
Hard problem: after the access token expired, the dashboard fired four requests that all tried to refresh, and with rotation three of them failed and logged the user out. I implemented a single shared refresh promise in the axios interceptor and retried queued requests, and covered it with MSW tests.
Metrics: route-level code splitting and image optimisation reduced the initial JS from 820 KB to 310 KB and improved mobile LCP from 4.0 s to 2.3 s; Vitest + RTL coverage is about 75%.
Next, I would add server-side rendering for product pages for SEO using Next.js or React Router framework mode, and Playwright tests for checkout."`,
    },
  ],
  quiz: [
    { question: 'In a machine-coding round, what should you do first?', options: ['Install a UI library', 'Clarify requirements and list features and state', 'Write unit tests', 'Start styling'], answer: 1, explanation: 'Clarifying avoids building the wrong thing and shows structured thinking.' },
    { question: 'In an autocomplete, what prevents an older slow response from overwriting newer results?', options: ['useMemo', 'A larger debounce delay', 'Aborting the previous request (or ignore flag) in the effect cleanup', 'React.memo'], answer: 2, explanation: 'Cleanup cancels or ignores stale requests when the query changes.' },
    { question: 'Why render a modal with a portal?', options: ['To escape parent overflow and z-index stacking issues', 'To make it a Server Component', 'To skip React events', 'Portals are faster'], answer: 0, explanation: 'Portals place DOM elsewhere while keeping React tree behaviour.' },
    { question: 'In the pagination example, which values are stored in state?', options: ['The visible items array', 'totalPages and the slice', 'Every page of data', 'Only page and pageSize'], answer: 3, explanation: 'Everything else is derived during render.' },
    { question: 'Which mousedown trick lets a suggestion be selected before the input blurs?', options: ['onMouseDown with preventDefault on the option', 'onBlur with setTimeout of 5 seconds', 'autoFocus on the list', 'Using a form submit'], answer: 0, explanation: 'Preventing default on mousedown keeps focus in the input so the click is handled first.' },
  ],
};
