export default {
  id: 'day-51-react-19-features',
  title: 'React 19 Features: Actions, useActionState, useOptimistic, useFormStatus, use(), ref as a Prop, React Compiler',
  module: 'Module 10: Advanced Industry Topics',
  day: 51,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'React 19 (stable since December 2024) changes how we write forms and async UI: Actions handle pending, errors and form reset for you, useActionState and useFormStatus remove boilerplate, useOptimistic makes instant UI easy, use() reads promises and context, ref becomes a normal prop and the React Compiler memoises automatically. You will learn each feature, compare it with the React 18 way, and see what interviewers ask.',
  objectives: [
    'Explain Actions and async transitions and how they replace manual isLoading/error state',
    'Use useActionState and the <form action={fn}> prop to build forms with pending and error states',
    'Read parent form status with useFormStatus and show instant UI with useOptimistic',
    'Read promises and context with use() together with Suspense and Error Boundaries',
    'Use ref as a prop, ref cleanup functions, <Context> as provider, document metadata, and describe the React Compiler',
  ],
  theory: [
    {
      heading: 'React 19 at a glance and how to upgrade',
      content:
        'React 19 is the first major release since React 18 (2022). Most React 18 code keeps working. The big themes are **Actions** (async data mutations), **new hooks**, **use()**, **simpler refs and context**, built-in **document metadata** and better support for **Server Components** (used by frameworks like Next.js 15).\n\nUpgrade: `npm install react@19 react-dom@19` (and `@types/react@19` for TypeScript). Run the official codemod `npx codemod@latest react/19/migration-recipe`.\n\nRemoved/changed things to know for interviews:\n- `ReactDOM.render` and `hydrate` are removed: use `createRoot` / `hydrateRoot`\n- `propTypes` and `defaultProps` on function components are removed: use TypeScript and default parameters\n- String refs and legacy context are removed\n- `forwardRef` is no longer needed (still works, will be deprecated later)\n- Errors in render are no longer re-thrown twice; new root options `onCaughtError` / `onUncaughtError`',
      tip: 'Important for this course: the playground runs React 18.3, so the demos below use tiny plain-React versions ("shims") of the new hooks with the SAME API shape. The `code` blocks show the real React 19 code you write in a Vite project.',
    },
    {
      heading: 'Actions and useActionState',
      content:
        'An **Action** is any function that starts an async transition: `startTransition(async () => { ... })`. While it runs React tracks the **pending** state, and when it finishes React applies the final state updates together.\n\nIn React 19 you can pass a function directly to a form: `<form action={submitAction}>`. React calls it with the `FormData`, wraps it in a transition and **resets uncontrolled fields** after success.\n\n`useActionState(actionFn, initialState)` returns `[state, formAction, isPending]`:\n- `actionFn(previousState, formData)` returns the next state (for example `{ error: "Invalid coupon" }` or `{ success: true }`)\n- `formAction` goes into `<form action={formAction}>` or `<button formAction={...}>`\n- `isPending` is true while the action runs\n\nThis replaces the React 18 pattern of three `useState`s (`loading`, `error`, `data`) plus `e.preventDefault()` and `try/finally`. (It was called `useFormState` in the React 18 canary; it now lives in `react`.)',
      syntax: `import { useActionState } from "react";

async function applyCoupon(prevState, formData) {
  const code = formData.get("code");
  const res = await api.applyCoupon(code);
  if (!res.ok) return { error: res.message };
  return { error: null, discount: res.discount };
}

function CouponForm() {
  const [state, formAction, isPending] = useActionState(applyCoupon, { error: null });
  return (
    <form action={formAction}>
      <input name="code" />
      <button disabled={isPending}>{isPending ? "Applying…" : "Apply"}</button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}`,
    },
    {
      heading: 'useFormStatus and useOptimistic',
      content:
        '**useFormStatus** (from `react-dom`) lets a component read the status of the **parent `<form>`**: `const { pending, data, method, action } = useFormStatus();`. Perfect for a reusable `<SubmitButton />` in a design system: no need to pass `isLoading` props down. It must be called in a component **rendered inside** the form, not in the component that renders the form.\n\n**useOptimistic** shows a temporary "optimistic" value while an async action runs:\n`const [optimisticItems, addOptimistic] = useOptimistic(items, (current, newItem) => [...current, newItem]);`\n\nCall `addOptimistic(value)` inside an Action. The UI shows the optimistic value immediately; when the action finishes React **automatically throws the optimistic value away** and shows the real `items` again (now containing the saved item, or unchanged if the request failed). Used for like buttons, chat messages, adding to cart, toggling todos.',
      syntax: `import { useFormStatus } from "react-dom";
import { useOptimistic, startTransition } from "react";

function SubmitButton({ children }) {
  const { pending } = useFormStatus();          // status of the parent form
  return <button disabled={pending}>{pending ? "Saving…" : children}</button>;
}

function LikeButton({ liked, onToggle }) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(liked);
  return (
    <button onClick={() => startTransition(async () => {
      setOptimisticLiked(!liked);   // instant
      await onToggle();             // real request; on failure UI reverts
    })}>
      {optimisticLiked ? "❤️" : "🤍"}
    </button>
  );
}`,
    },
    {
      heading: 'The use() API: promises and context',
      content:
        '`use(resource)` reads a value from a **promise** or a **context**. Unlike hooks it **can be called inside if statements and loops**.\n\n- `use(promise)`: if the promise is pending, the component **suspends** and the nearest `<Suspense fallback>` is shown; when it resolves the component renders with the value; if it rejects, the nearest **Error Boundary** shows. No `useEffect`, no loading state.\n- `use(ThemeContext)`: same as `useContext`, but allowed conditionally.\n\nRule: **do not create the promise during render** (`use(fetch(url))` creates a new promise every render and loops forever). The promise must be **cached**: created in a parent, in a loader, by a framework (Server Component passes it down) or stored in a cache/Map. For most client apps, TanStack Query (with `useSuspenseQuery`) is still the recommended way to fetch.',
      syntax: `import { use, Suspense } from "react";

function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);       // suspends until resolved
  return comments.map(c => <p key={c.id}>{c.body}</p>);
}

function Post({ id }) {
  const [commentsPromise] = useState(() => fetchComments(id)); // cached once
  return (
    <Suspense fallback={<p>Loading comments…</p>}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  );
}`,
    },
    {
      heading: 'ref as a prop, ref cleanup, <Context> provider and document metadata',
      content:
        '- **ref as a prop**: function components receive `ref` like any other prop. `function Input({ ref, ...props }) { return <input ref={ref} {...props} />; }`. In React 18 you needed `forwardRef((props, ref) => ...)`.\n- **Ref callback cleanup**: a callback ref can return a cleanup function, called when the element is removed: `ref={node => { observer.observe(node); return () => observer.unobserve(node); }}`.\n- **`<Context>` as provider**: write `<ThemeContext value="dark">` instead of `<ThemeContext.Provider value="dark">`.\n- **Document metadata**: render `<title>`, `<meta>` and `<link>` anywhere in a component; React hoists them into `<head>`. Small apps no longer need react-helmet.\n- **Stylesheets and scripts**: `<link rel="stylesheet" precedence="default">` and async `<script>` are deduplicated and ordered by React.\n- **Resource preloading APIs**: `preload`, `preinit`, `prefetchDNS`, `preconnect` from `react-dom`.\n- **useDeferredValue(value, initialValue)** gets an initial value; better hydration error messages; support for **Custom Elements** (Web Components).',
      syntax: `// React 19
function TextField({ label, ref, ...rest }) {
  return <label>{label}<input ref={ref} {...rest} /></label>;
}

// React 18 equivalent
const TextField18 = forwardRef(function TextField({ label, ...rest }, ref) {
  return <label>{label}<input ref={ref} {...rest} /></label>;
});

function ProductPage({ product }) {
  return (
    <>
      <title>{product.name + " | ShopKart"}</title>
      <meta name="description" content={product.summary} />
      <h1>{product.name}</h1>
    </>
  );
}`,
    },
    {
      heading: 'React Compiler (automatic memoisation)',
      content:
        'The **React Compiler** (released as stable v1.0 in October 2025, formerly "React Forget") is a **build-time Babel plugin** that analyses your components and inserts memoisation automatically. Code that needed `useMemo`, `useCallback` and `React.memo` to avoid re-renders can be written plainly; the compiler caches JSX and values that did not change.\n\nSetup in Vite: `npm install -D babel-plugin-react-compiler` and add it to `@vitejs/plugin-react` Babel plugins. It works with React 17, 18 (with `react-compiler-runtime`) and 19. Next.js and Expo have config flags for it.\n\nIt only works if your code follows the **Rules of React**: pure render, no mutation of props/state, hooks at the top level. `eslint-plugin-react-hooks` (v6+) includes the compiler rules and flags code it cannot optimise. Components it cannot compile are simply skipped.\n\nInterview answer: "With the compiler we rarely write useMemo/useCallback manually; we keep them only as escape hatches, for example to keep an effect dependency stable."',
      syntax: `// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({ babel: { plugins: [["babel-plugin-react-compiler", { target: "19" }]] } }),
  ],
});`,
      tip: 'Coming next: Day 52 measures performance with the React Profiler, Lighthouse and Core Web Vitals, and shows when memoisation helps and when it is a pitfall.',
    },
  ],
  examples: [
    {
      title: 'useActionState: apply a coupon code with pending and error state',
      scenario: 'A checkout page has a coupon field. The server validates the code (DIWALI50, FIRST100), returns an error message or a discount, and the button must show "Applying…" while waiting.',
      steps: [
        'Write an async action applyCoupon(prevState, formData) that returns the next state',
        'Call const [state, formAction, isPending] = useActionState(applyCoupon, initialState)',
        'Pass formAction to <form action={formAction}> and give the input a name',
        'Render state.error / state.discount and use isPending for the button',
        'In the playground try WRONG, DIWALI50 and FIRST100',
      ],
      code: `// React 19 (real code)
import { useActionState } from "react";
import { applyCouponApi } from "@/features/checkout/api";

const initial = { error: null, discount: 0, code: "" };

async function applyCoupon(prev, formData) {
  const code = String(formData.get("code")).trim().toUpperCase();
  if (!code) return { ...prev, error: "Please enter a coupon code" };
  try {
    const { discount } = await applyCouponApi(code);   // throws on invalid
    return { error: null, discount, code };
  } catch (err) {
    return { ...prev, error: err.message };
  }
}

export function CouponForm({ total }) {
  const [state, formAction, isPending] = useActionState(applyCoupon, initial);
  return (
    <form action={formAction}>
      <input name="code" placeholder="Coupon code" />
      <button disabled={isPending}>{isPending ? "Applying…" : "Apply"}</button>
      {state.error && <p role="alert">{state.error}</p>}
      {state.discount > 0 && <p>{state.code} applied: you save ₹{state.discount}</p>}
      <p>Payable: ₹{total - state.discount}</p>
    </form>
  );
}`,
      playground: {
        jsx: `const { useState, useRef } = React;

// ---- Plain-React shim of React 19's useActionState (playground runs React 18) ----
function useActionState(action, initialState) {
  const [state, setState] = useState(initialState);
  const [isPending, setPending] = useState(false);
  const stateRef = useRef(initialState);
  async function formAction(formData) {
    setPending(true);
    try {
      const next = await action(stateRef.current, formData);
      stateRef.current = next;
      setState(next);
    } finally {
      setPending(false);
    }
  }
  return [state, formAction, isPending];
}
// React 18 forms cannot take action={fn}, so this helper converts onSubmit to formAction(FormData)
const asAction = formAction => e => { e.preventDefault(); formAction(new FormData(e.currentTarget)); };

// ---- fake server ----
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function applyCouponApi(code, total) {
  await sleep(1200);
  if (code === "DIWALI50") return { discount: Math.min(500, Math.round(total * 0.5)) };
  if (code === "FIRST100") return { discount: 100 };
  throw new Error("Coupon " + code + " is invalid or expired");
}

// ---- app code: same as the React 19 version ----
const TOTAL = 1499;
const initial = { error: null, discount: 0, code: "" };

async function applyCoupon(prev, formData) {
  const code = String(formData.get("code")).trim().toUpperCase();
  if (!code) return { ...prev, error: "Please enter a coupon code" };
  try {
    const { discount } = await applyCouponApi(code, TOTAL);
    return { error: null, discount, code };
  } catch (err) {
    return { ...prev, error: err.message };
  }
}

function App() {
  const [state, formAction, isPending] = useActionState(applyCoupon, initial);
  const inr = n => "₹" + n.toLocaleString("en-IN");
  return (
    <form onSubmit={asAction(formAction)} className="card">
      <h3>Order summary</h3>
      <p>Cart total: <b>{inr(TOTAL)}</b></p>
      <label htmlFor="code">Coupon</label>
      <div className="row">
        <input id="code" name="code" placeholder="DIWALI50 / FIRST100" autoComplete="off" />
        <button disabled={isPending}>{isPending ? "Applying…" : "Apply"}</button>
      </div>
      {state.error && <p role="alert" className="err">⚠ {state.error}</p>}
      {state.discount > 0 && <p className="ok">✅ {state.code} applied: you save {inr(state.discount)}</p>}
      <p className="pay">Payable: {inr(TOTAL - state.discount)}</p>
    </form>
  );
}`,
        css: `.card { max-width: 340px; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px 16px; }
.row { display: flex; gap: 6px; margin-top: 4px; }
input { flex: 1; padding: 8px; text-transform: uppercase; }
button { padding: 8px 12px; background: #4f46e5; color: white; border: none; border-radius: 6px; }
button:disabled { opacity: .6; }
.err { color: #b91c1c; } .ok { color: #047857; } .pay { font-size: 18px; font-weight: 700; }`,
      },
      result: 'The button shows "Applying…" for ~1.2 s. WRONG shows an error; DIWALI50 saves ₹500 (50% capped at ₹500); FIRST100 saves ₹100. If a later code fails, the previous discount is kept because the action returns {...prev, error}.',
      explanation:
        'The action receives the previous state and the FormData, so all logic lives in one pure-ish async function, and the component only renders state. The shim recreates the same [state, formAction, isPending] contract with useState for React 18. In React 19 you delete the shim and asAction helper and write <form action={formAction}> directly; React also wraps the call in a transition and resets the form fields on success.',
    },
    {
      title: 'useFormStatus: a reusable SubmitButton for the design system',
      scenario: 'Every form in the company uses the same SubmitButton that disables itself and shows a spinner while its parent form is submitting, without receiving any isLoading prop.',
      steps: [
        'Create SubmitButton.jsx that calls useFormStatus() from react-dom',
        'Render it INSIDE any <form action={...}>',
        'Read pending (and data to show what is being submitted)',
        'Use the same button in two different forms',
        'In the playground submit both forms and see each button react only to its own form',
      ],
      code: `// components/ui/SubmitButton.jsx (React 19)
import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingText = "Saving…" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? pendingText : children}
    </button>
  );
}

// usage in any form
<form action={saveAddress}>
  <input name="city" />
  <SubmitButton>Save address</SubmitButton>
</form>`,
      playground: {
        jsx: `const { useState, createContext, useContext } = React;

// ---- shim: <Form action> provides status, useFormStatus reads it (React 19 does this natively) ----
const FormStatusContext = createContext({ pending: false, data: null });
function Form({ action, children, ...rest }) {
  const [status, setStatus] = useState({ pending: false, data: null });
  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus({ pending: true, data });
    try { await action(data); form.reset(); }   // React 19 resets the form after a successful action
    finally { setStatus({ pending: false, data: null }); }
  }
  return (
    <FormStatusContext.Provider value={status}>
      <form onSubmit={onSubmit} {...rest}>{children}</form>
    </FormStatusContext.Provider>
  );
}
const useFormStatus = () => useContext(FormStatusContext);

// ---- design-system component: no isLoading prop needed ----
function SubmitButton({ children, pendingText = "Saving…" }) {
  const { pending, data } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? <><span className="spin" aria-hidden="true" /> {pendingText} {data?.get("city") || data?.get("email") || ""}</> : children}
    </button>
  );
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function App() {
  const [log, setLog] = useState([]);
  async function saveAddress(fd) { await sleep(1500); setLog(l => ["Address saved: " + fd.get("city"), ...l]); }
  async function subscribe(fd) { await sleep(2500); setLog(l => ["Subscribed: " + fd.get("email"), ...l]); }

  return (
    <div className="grid">
      <Form action={saveAddress} className="card">
        <h4>Delivery city</h4>
        <input name="city" defaultValue="Nashik" required />
        <SubmitButton pendingText="Saving">Save address</SubmitButton>
      </Form>
      <Form action={subscribe} className="card">
        <h4>Newsletter</h4>
        <input name="email" type="email" defaultValue="neha@example.in" required />
        <SubmitButton pendingText="Subscribing">Subscribe</SubmitButton>
      </Form>
      <ul>{log.map((l, i) => <li key={i}>{l}</li>)}</ul>
    </div>
  );
}`,
        css: `.grid { display: grid; gap: 10px; max-width: 360px; }
.card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 14px; display: grid; gap: 6px; }
h4 { margin: 0; }
input { padding: 7px; }
button { padding: 8px; background: #0f766e; color: white; border: none; border-radius: 6px; display: inline-flex; gap: 6px; align-items: center; justify-content: center; }
button:disabled { opacity: .7; }
.spin { width: 12px; height: 12px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: s 0.8s linear infinite; }
@keyframes s { to { transform: rotate(360deg); } }`,
      },
      result: 'Each button shows a spinner and "Saving Nashik…" / "Subscribing neha@…" only while ITS form is submitting; both can be pending at the same time independently. After success the form resets and a log line appears.',
      explanation:
        'useFormStatus reads the nearest parent form, which is why the hook must be called in a child component (SubmitButton), not in the component that renders <form>. In the shim the <Form> component provides the status through context; React 19 provides it natively for any <form action={fn}>.',
    },
    {
      title: 'useOptimistic: instant like button and add-to-wishlist with rollback',
      scenario: 'On a product feed, likes must appear instantly. The server is slow and fails 30% of the time; on failure the UI must roll back and show a toast.',
      steps: [
        'Keep the real data (likes, wishlist) in state: the source of truth',
        'Create the optimistic view with useOptimistic(realState, updateFn)',
        'In the click handler, call addOptimistic(...) then await the server request',
        'On success update the real state; on failure show an error (the optimistic value disappears automatically)',
        'Click the hearts quickly in the playground; some requests fail and roll back',
      ],
      code: `// React 19
import { useOptimistic, useState, startTransition } from "react";

function Wishlist({ initial }) {
  const [items, setItems] = useState(initial);
  const [optimisticItems, addOptimistic] = useOptimistic(
    items,
    (current, newItem) => [...current, { ...newItem, sending: true }]
  );

  function add(product) {
    startTransition(async () => {
      addOptimistic(product);                       // shows immediately
      try {
        const saved = await api.addToWishlist(product.id);
        startTransition(() => setItems(prev => [...prev, saved]));   // real state
      } catch {
        toast.error("Could not add " + product.title);   // optimistic item vanishes
      }
    });
  }
  // render optimisticItems ...
}`,
      playground: {
        jsx: `const { useState, useRef } = React;

// ---- shim of React 19 useOptimistic: optimistic updates live only while their action is running ----
function useOptimistic(passthrough, reducer = (_, v) => v) {
  const [pending, setPending] = useState([]);
  const value = pending.reduce((s, p) => reducer(s, p.v), passthrough);
  function addOptimistic(v) {
    const id = Math.random();
    setPending(p => [...p, { id, v }]);
    return () => setPending(p => p.filter(x => x.id !== id)); // shim only: call when the action ends
  }
  return [value, addOptimistic];
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function toggleLikeApi(id) {
  await sleep(1000 + Math.random() * 800);
  if (Math.random() < 0.3) throw new Error("Network error");
}

const POSTS = [
  { id: 1, title: "Kashmiri Pashmina Shawl", likes: 120, liked: false },
  { id: 2, title: "Kolhapuri Chappal", likes: 87, liked: true },
  { id: 3, title: "Banarasi Silk Saree", likes: 342, liked: false },
];

function PostCard({ post, onSaved, onError }) {
  const [optimistic, addOptimistic] = useOptimistic(post, (cur, liked) => ({
    ...cur, liked, likes: cur.likes + (liked ? 1 : -1), sending: true,
  }));

  async function toggle() {
    const nextLiked = !optimistic.liked;
    const done = addOptimistic(nextLiked);          // instant UI
    try {
      await toggleLikeApi(post.id);
      onSaved(post.id, nextLiked);                  // update the real state
    } catch (e) {
      onError("Could not update like on " + post.title + ". Rolled back.");
    } finally {
      done();                                       // React 19 does this automatically
    }
  }

  return (
    <li className="post">
      <span>{post.title}</span>
      <button onClick={toggle} aria-pressed={optimistic.liked} className={optimistic.sending ? "sending" : ""}>
        {optimistic.liked ? "❤️" : "🤍"} {optimistic.likes}
      </button>
    </li>
  );
}

function App() {
  const [posts, setPosts] = useState(POSTS);
  const [toast, setToast] = useState("");
  const timer = useRef();
  function onSaved(id, liked) {
    setPosts(ps => ps.map(p => (p.id === id && p.liked !== liked ? { ...p, liked, likes: p.likes + (liked ? 1 : -1) } : p)));
  }
  function onError(msg) {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 2500);
  }
  return (
    <div>
      <ul className="feed">{posts.map(p => <PostCard key={p.id} post={p} onSaved={onSaved} onError={onError} />)}</ul>
      <p className="real">Server truth: {posts.map(p => p.likes).join(" · ")}</p>
      <div role="status" className={"toast" + (toast ? " show" : "")}>{toast}</div>
    </div>
  );
}`,
        css: `.feed { list-style: none; padding: 0; max-width: 380px; }
.post { display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 8px; }
.post button { border: 1px solid #e5e7eb; background: white; border-radius: 99px; padding: 4px 10px; cursor: pointer; }
.post button.sending { opacity: .6; }
.real { color: #6b7280; font-size: 13px; }
.toast { position: fixed; bottom: 12px; left: 12px; background: #b91c1c; color: white; padding: 8px 12px; border-radius: 8px; opacity: 0; transition: opacity .2s; }
.toast.show { opacity: 1; }`,
      },
      result: 'The heart and count change immediately (slightly faded while sending). About 70% of requests succeed and the "Server truth" line updates; failures revert the heart and show a red toast.',
      explanation:
        'The optimistic value is derived from the real state plus the list of in-flight updates, so when an update finishes (success or failure) it is removed and the UI shows the server truth again. That is exactly how React 19 useOptimistic behaves, except React removes the update automatically when the surrounding transition/Action ends; the shim returns a done() function for React 18.',
    },
    {
      title: 'use(): read a promise with Suspense and an Error Boundary',
      scenario: 'A team page loads users from an API. Instead of useEffect + loading state, the component reads a cached promise with use(), Suspense shows a skeleton and an Error Boundary shows a retry button.',
      steps: [
        'Create the promise outside render and cache it (state initializer or a Map)',
        'In the child call const users = use(usersPromise)',
        'Wrap the child in <Suspense fallback={<Skeleton />}> and an ErrorBoundary',
        'Use use(ThemeContext) inside an if statement (allowed only for use)',
        'Click "Reload" and "Load a broken URL" in the playground',
      ],
      code: `// React 19
import { use, Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

const fetchUsers = () => fetch("https://dummyjson.com/users?limit=5&select=firstName,lastName,email")
  .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); });

function UserList({ usersPromise, compact }) {
  const { users } = use(usersPromise);              // suspends while pending
  if (!compact) {
    const theme = use(ThemeContext);                // use() can be conditional
  }
  return <ul>{users.map(u => <li key={u.id}>{u.firstName} {u.lastName}</li>)}</ul>;
}

export function TeamPage() {
  const [usersPromise, setUsersPromise] = useState(fetchUsers);  // created once
  return (
    <ErrorBoundary fallbackRender={({ error }) => <p>{error.message}</p>}>
      <Suspense fallback={<p>Loading team…</p>}>
        <UserList usersPromise={usersPromise} />
      </Suspense>
    </ErrorBoundary>
  );
}`,
      playground: {
        jsx: `const { useState, Suspense, createContext, useContext, Component } = React;

// ---- shim of React 19 use() for React 18: throws the promise so Suspense can wait ----
function use(usable) {
  if (usable && usable.$$typeof === Symbol.for("react.context")) return useContext(usable);
  const p = usable;
  if (p.status === "fulfilled") return p.value;
  if (p.status === "rejected") throw p.reason;
  if (p.status !== "pending") {
    p.status = "pending";
    p.then(v => { p.status = "fulfilled"; p.value = v; }, e => { p.status = "rejected"; p.reason = e; });
  }
  throw p; // Suspense catches this and shows the fallback
}

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return this.props.fallback(this.state.error, () => this.setState({ error: null }));
    return this.props.children;
  }
}

const ThemeContext = createContext("light");
const fetchUsers = url => fetch(url).then(r => { if (!r.ok) throw new Error("Request failed: HTTP " + r.status); return r.json(); });
const GOOD = "https://dummyjson.com/users?limit=6&select=firstName,lastName,email,company";
const BAD = "https://dummyjson.com/this-route-does-not-exist";

function UserList({ usersPromise, showTheme }) {
  const { users } = use(usersPromise);
  let theme = null;
  if (showTheme) theme = use(ThemeContext); // conditional: allowed for use(), not for hooks
  return (
    <ul className={"list " + (theme || "")}>
      {users.map(u => (
        <li key={u.id}><b>{u.firstName} {u.lastName}</b><small>{u.company.title} · {u.email}</small></li>
      ))}
    </ul>
  );
}

function Skeleton() {
  return <ul className="list">{[1, 2, 3].map(i => <li key={i} className="sk" />)}</ul>;
}

function App() {
  // the promise is cached in state (created once per request), never created during render
  const [req, setReq] = useState(() => ({ id: 1, promise: fetchUsers(GOOD) }));
  const load = url => setReq(r => ({ id: r.id + 1, promise: fetchUsers(url) }));
  const [showTheme, setShowTheme] = useState(true);
  return (
    <ThemeContext.Provider value="dark">
      <button onClick={() => load(GOOD)}>Reload</button>
      <button onClick={() => load(BAD)}>Load a broken URL</button>
      <label><input type="checkbox" checked={showTheme} onChange={e => setShowTheme(e.target.checked)} /> use(ThemeContext)</label>
      <ErrorBoundary key={req.id}
        fallback={err => (
          <div className="err" role="alert">⚠ {err.message} <button onClick={() => load(GOOD)}>Retry</button></div>
        )}>
        <Suspense fallback={<Skeleton />}>
          <UserList usersPromise={req.promise} showTheme={showTheme} />
        </Suspense>
      </ErrorBoundary>
    </ThemeContext.Provider>
  );
}`,
        css: `button { margin: 0 6px 8px 0; padding: 6px 10px; }
.list { list-style: none; padding: 0; max-width: 420px; }
.list li { padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 6px; display: grid; }
.list.dark li { background: #111827; color: #f9fafb; border-color: #374151; }
.list small { color: #9ca3af; }
.sk { height: 38px; background: linear-gradient(90deg, #eee, #f8f8f8, #eee); background-size: 200% 100%; animation: sh 1.2s infinite; }
@keyframes sh { to { background-position: -200% 0; } }
.err { color: #b91c1c; padding: 8px; border: 1px solid #fecaca; border-radius: 8px; }`,
      },
      result: 'A shimmering skeleton shows while the users load, then six user cards appear (dark when the checkbox is on). "Load a broken URL" shows the Error Boundary message with Retry; Retry loads the users again (the new key remounts the boundary).',
      explanation:
        'The component reads the promise as if it were already resolved; Suspense handles "loading" and the Error Boundary handles "error", so the component only describes the success UI. The promise is stored in state so the same promise is reused across renders. The shim implements React 19 use() by throwing the pending promise (the mechanism Suspense uses internally); in React 19 you import use from "react".',
    },
    {
      title: 'ref as a prop (and forwardRef for React 18), plus code the React Compiler simplifies',
      scenario: 'A design-system TextField must expose its <input> so a parent can focus it (e.g. focus the first invalid field). React 19 lets you accept ref as a prop; React 18 needs forwardRef.',
      steps: [
        'React 19: destructure ref from props and put it on the <input>',
        'React 18 (playground): wrap the component in forwardRef',
        'In the parent create const inputRef = useRef(null) and call inputRef.current.focus()',
        'Compare the "before/after React Compiler" code: manual useMemo/useCallback disappear',
      ],
      code: `// React 19: ref is just a prop
export function TextField({ label, error, ref, ...props }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} ref={ref} aria-invalid={!!error} {...props} />
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

// Ref callback with cleanup (React 19)
<div ref={node => {
  const obs = new ResizeObserver(() => console.log(node.offsetWidth));
  obs.observe(node);
  return () => obs.disconnect();
}} />

// Context as provider (React 19)
<ThemeContext value="dark"><App /></ThemeContext>

// BEFORE React Compiler: manual memoisation
const filtered = useMemo(() => products.filter(p => p.price < max), [products, max]);
const onSelect = useCallback(id => setSelected(id), []);
const Row = memo(function Row(props) { /* ... */ });

// AFTER React Compiler: plain code, compiler memoises automatically
const filtered = products.filter(p => p.price < max);
const onSelect = id => setSelected(id);
function Row(props) { /* ... */ }`,
      playground: {
        jsx: `const { useState, useRef, useId, forwardRef } = React;

// React 18 version (playground). In React 19: function TextField({ label, error, ref, ...props })
const TextField = forwardRef(function TextField({ label, error, ...props }, ref) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} ref={ref} aria-invalid={!!error} aria-describedby={error ? id + "-err" : undefined} {...props} />
      {error && <p id={id + "-err"} role="alert" className="err">{error}</p>}
    </div>
  );
});

function App() {
  const nameRef = useRef(null);
  const pinRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    const name = nameRef.current.value.trim();
    const pin = pinRef.current.value.trim();
    const next = {};
    if (name.length < 2) next.name = "Enter your full name";
    if (!/^[1-9][0-9]{5}$/.test(pin)) next.pin = "PIN code must be 6 digits (e.g. 411001)";
    setErrors(next);
    setOk(Object.keys(next).length === 0);
    if (next.name) nameRef.current.focus();      // focus first invalid field through the ref
    else if (next.pin) pinRef.current.focus();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card">
      <TextField ref={nameRef} label="Full name" error={errors.name} placeholder="Ananya Iyer" />
      <TextField ref={pinRef} label="PIN code" error={errors.pin} inputMode="numeric" maxLength={6} placeholder="411001" />
      <button>Save address</button>
      {ok && <p className="ok">✅ Address saved</p>}
    </form>
  );
}`,
        css: `.card { max-width: 320px; display: grid; gap: 10px; }
.field { display: grid; gap: 4px; }
label { font-weight: 600; }
input { padding: 8px; border: 2px solid #d1d5db; border-radius: 6px; }
input[aria-invalid="true"] { border-color: #dc2626; }
.err { color: #b91c1c; margin: 0; font-size: 13px; }
.ok { color: #047857; }
button { padding: 8px; }`,
      },
      result: 'Submitting an empty form shows both errors and focuses "Full name"; fixing the name and submitting again focuses the PIN field. A valid name and PIN shows "Address saved".',
      explanation:
        'The parent controls focus through refs that point at the real <input> elements inside TextField. In React 18 a function component cannot receive ref unless wrapped in forwardRef; in React 19 ref is a normal prop, so the same component is written without the wrapper. The second half of the code block shows how the React Compiler removes the need for manual useMemo/useCallback/memo.',
    },
  ],
  interview: [
    { q: 'What is an Action in React 19?', a: 'A function that triggers an async transition, e.g. passed to <form action={fn}> or run with startTransition(async () => ...). React tracks its pending state, batches the resulting updates, integrates with useOptimistic and error boundaries, and resets forms after successful form actions.', level: 'Medium' },
    { q: 'What does useActionState return and what does the action receive?', a: 'It returns [state, formAction, isPending]. The action function is called as action(previousState, formData) (or with whatever payload you pass to formAction) and its return value becomes the new state.', level: 'Medium' },
    { q: 'Why must useFormStatus be called in a child of the form?', a: 'It reads the status of the nearest parent <form> from context-like machinery. The component that renders the <form> is outside it, so it would get pending=false. Put it in a child like <SubmitButton />.', level: 'Medium' },
    { q: 'How does useOptimistic roll back on failure?', a: 'The optimistic value exists only while the Action/transition is running. When it ends React re-renders with the real (passthrough) state. If the request failed and you did not update the real state, the UI automatically shows the old value again.', level: 'Hard' },
    { q: 'How is use() different from hooks?', a: 'use() can be called conditionally and in loops (but still only in components/hooks). It reads a promise (suspending until it resolves, throwing to an error boundary if it rejects) or a context. Hooks must be called unconditionally at the top level.', level: 'Medium' },
    { q: 'Why should you not write use(fetch(url)) inside a component?', a: 'Every render would create a new promise, so the component would suspend forever / refetch in a loop. Promises passed to use() must be cached: created by a parent, a loader, a framework or a cache, and kept stable across renders.', level: 'Hard' },
    { q: 'What changed about refs in React 19?', a: 'Function components can receive ref directly as a prop (forwardRef no longer needed), and callback refs can return a cleanup function that runs when the element is detached.', level: 'Easy' },
    { q: 'What is the React Compiler?', a: 'A build-time Babel plugin that automatically memoises components and values, so manual useMemo, useCallback and React.memo are rarely needed. It relies on code following the Rules of React and skips components it cannot safely optimise.', level: 'Medium' },
    { q: 'Name APIs removed in React 19.', a: 'ReactDOM.render and hydrate (use createRoot/hydrateRoot), unmountComponentAtNode, findDOMNode, string refs, legacy context (contextTypes), propTypes and defaultProps for function components, react-test-renderer/shallow, and the UMD builds.', level: 'Medium' },
    { q: 'How do you set the page title in React 19 without react-helmet?', a: 'Render <title>, <meta> and <link> tags directly inside the component; React 19 hoists them into the document head automatically.', level: 'Easy' },
    { q: 'useActionState vs TanStack Query useMutation: which would you use?', a: 'useActionState is built-in and great for form submissions, especially with Server Actions in Next.js. useMutation adds cache integration (invalidation, optimistic cache updates), retries and devtools for client-side REST apps. Many teams use TanStack Query for data and React 19 form features for simple forms.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Build a "Join waitlist" form with the useActionState shim: validate the email in the action, simulate a 1 s server call, return { error } or { success, position } and show "You are #42 on the waitlist".',
      hint: 'Reuse the useActionState shim and asAction helper from Example 1.',
      solution: `const { useState, useRef } = React;
function useActionState(action, initial) {
  const [state, setState] = useState(initial);
  const [isPending, setPending] = useState(false);
  const ref = useRef(initial);
  async function formAction(fd) {
    setPending(true);
    try { ref.current = await action(ref.current, fd); setState(ref.current); } finally { setPending(false); }
  }
  return [state, formAction, isPending];
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function join(prev, fd) {
  const email = String(fd.get("email")).trim();
  if (!/^\\S+@\\S+\\.\\S+$/.test(email)) return { error: "Enter a valid email" };
  await sleep(1000);
  return { success: true, position: 40 + Math.floor(Math.random() * 10) };
}
function App() {
  const [state, formAction, isPending] = useActionState(join, {});
  return (
    <form onSubmit={e => { e.preventDefault(); formAction(new FormData(e.currentTarget)); }}>
      <input name="email" placeholder="you@example.in" />
      <button disabled={isPending}>{isPending ? "Joining…" : "Join waitlist"}</button>
      {state.error && <p role="alert">{state.error}</p>}
      {state.success && <p>You are #{state.position} on the waitlist 🎉</p>}
    </form>
  );
}`,
    },
    {
      task: 'Optimistic todo list: adding a todo shows it immediately in grey with "Saving…", and it turns normal when the fake server confirms. Make the server reject todos containing the word "fail".',
      hint: 'useOptimistic shim with a reducer that appends { ...todo, pending: true }.',
      solution: `const { useState } = React;
function useOptimistic(base, reducer) {
  const [pending, setPending] = useState([]);
  const value = pending.reduce((s, p) => reducer(s, p.v), base);
  const add = v => { const id = Math.random(); setPending(p => [...p, { id, v }]); return () => setPending(p => p.filter(x => x.id !== id)); };
  return [value, add];
}
const save = t => new Promise((res, rej) => setTimeout(() => (t.includes("fail") ? rej(new Error("Rejected")) : res({ id: Date.now(), text: t })), 1200));
function App() {
  const [todos, setTodos] = useState([{ id: 1, text: "Pay electricity bill" }]);
  const [error, setError] = useState("");
  const [optimistic, addOptimistic] = useOptimistic(todos, (cur, text) => [...cur, { id: "tmp" + text, text, pending: true }]);
  async function onSubmit(e) {
    e.preventDefault();
    const text = new FormData(e.currentTarget).get("text").trim();
    if (!text) return;
    e.currentTarget.reset();
    const done = addOptimistic(text);
    try { const saved = await save(text); setTodos(t => [...t, saved]); setError(""); }
    catch (err) { setError(err.message + ": " + text); }
    finally { done(); }
  }
  return (
    <form onSubmit={onSubmit}>
      <input name="text" placeholder="New todo" /> <button>Add</button>
      <ul>{optimistic.map(t => <li key={t.id} style={{ color: t.pending ? "#9ca3af" : "inherit" }}>{t.text}{t.pending && " (Saving…)"}</li>)}</ul>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}`,
    },
    {
      task: 'Write the React 19 version of this React 18 component with no forwardRef and with <Context> as provider: const Search = forwardRef((props, ref) => <input ref={ref} {...props} />); <ThemeContext.Provider value="dark"><Search ref={r} /></ThemeContext.Provider>',
      hint: 'ref is a normal prop in React 19.',
      solution: `// React 19
function Search({ ref, ...props }) {
  return <input ref={ref} type="search" {...props} />;
}

function App() {
  const searchRef = useRef(null);
  return (
    <ThemeContext value="dark">
      <Search ref={searchRef} placeholder="Search products" />
      <button onClick={() => searchRef.current.focus()}>Focus search</button>
    </ThemeContext>
  );
}`,
    },
    {
      task: 'Using the use() shim, Suspense and an error boundary, show product details from https://dummyjson.com/products/1 with a "Next product" button that loads id + 1.',
      hint: 'Keep a cache Map from id to promise so each id is fetched only once.',
      solution: `const { useState, Suspense, Component } = React;
function use(p) {
  if (p.status === "fulfilled") return p.value;
  if (p.status === "rejected") throw p.reason;
  if (p.status !== "pending") { p.status = "pending"; p.then(v => { p.status = "fulfilled"; p.value = v; }, e => { p.status = "rejected"; p.reason = e; }); }
  throw p;
}
class Boundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() { return this.state.error ? <p>⚠ {this.state.error.message}</p> : this.props.children; }
}
const cache = new Map();
function getProduct(id) {
  if (!cache.has(id)) cache.set(id, fetch("https://dummyjson.com/products/" + id).then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); }));
  return cache.get(id);
}
function Product({ id }) {
  const p = use(getProduct(id));
  return <div><img src={p.thumbnail} alt={p.title} width="120" /><h3>{p.title}</h3><p>{"$" + p.price} · ⭐ {p.rating}</p></div>;
}
function App() {
  const [id, setId] = useState(1);
  return (
    <div>
      <button onClick={() => setId(i => i + 1)}>Next product</button>
      <Boundary key={id}><Suspense fallback={<p>Loading product {id}…</p>}><Product id={id} /></Suspense></Boundary>
    </div>
  );
}`,
    },
  ],
  quiz: [
    { question: 'What does useActionState return?', options: ['[state, setState]', '[state, formAction, isPending]', '{ pending, data, method }', '[value, addOptimistic]'], answer: 1, explanation: 'useActionState returns the current state, an action to pass to the form, and a pending flag.' },
    { question: 'Where must useFormStatus be called?', options: ['In a component rendered inside the <form>', 'In the component that renders the <form>', 'In main.jsx', 'Inside the action function'], answer: 0, explanation: 'It reads the status of the parent form, so the caller must be a child of that form.' },
    { question: 'Which statement about use() is TRUE?', options: ['It can only be used in class components', 'It replaces useState', 'It can be called inside an if statement', 'It must be called before all other hooks'], answer: 2, explanation: 'Unlike hooks, use() may be called conditionally or in loops.' },
    { question: 'In React 19, how does a function component receive a ref?', options: ['Only with forwardRef', 'Through this.refs', 'Through useImperativeHandle only', 'As a normal prop named ref'], answer: 3, explanation: 'ref is passed as a regular prop to function components in React 19.' },
    { question: 'What is the React Compiler?', options: ['A replacement for Vite', 'A build-time plugin that memoises components automatically', 'A new JSX syntax', 'A server for React Server Components'], answer: 1, explanation: 'It analyses code at build time and inserts memoisation, reducing the need for useMemo/useCallback/memo.' },
  ],
};
