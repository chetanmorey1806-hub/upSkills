export default {
  id: 'day-02-react-19-actions-new-hooks',
  title: 'React 19 Features: Actions, useActionState, useOptimistic, useFormStatus, use(), ref as a Prop and Server Components',
  module: 'Module 1: Modern React Internals',
  day: 2,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'React 19 changed how we write forms and async UI. Learn Actions and transitions, the new hooks useActionState, useOptimistic and useFormStatus, the use() API for promises and context, ref as a normal prop, document metadata, and the idea behind Server Components, so you can read modern codebases and answer "what is new in React 19?" confidently.',
  objectives: [
    'Explain what an Action is and how async transitions handle pending state and errors',
    'Build forms with <form action={fn}>, useActionState and useFormStatus',
    'Show instant feedback with useOptimistic and understand automatic rollback',
    'Read promises and context with use(), including conditionally',
    'Describe the other React 19 changes (ref as prop, <Context> as provider, metadata, Server Components)',
  ],
  theory: [
    {
      heading: 'Actions: async transitions for data mutations',
      content:
        'Before React 19, every form submit needed the same boilerplate: `isPending` state, `error` state, try/catch, `e.preventDefault()`, and manual reset. React 19 introduces **Actions**: functions (sync or async) that you run inside a transition.\n\n- `startTransition` (from `useTransition`) now accepts an **async function**. While it runs, `isPending` is `true`.\n- Errors thrown inside an Action can be caught by the nearest **Error Boundary**.\n- When you pass a function to `<form action={fn}>`, React calls it with a `FormData` object, runs it as an Action, and **resets uncontrolled form fields** on success.\n\nAnalogy: an Action is a courier with a tracking number. You hand over the package (FormData), React tracks "in transit" (pending) and tells you whether it was delivered or returned (result/error).',
      syntax:
        "const [isPending, startTransition] = useTransition();\n\nfunction handleSave() {\n  startTransition(async () => {\n    const error = await updateName(name);   // async allowed in React 19\n    if (error) { setError(error); return; }\n    navigate('/profile');\n  });\n}",
      tip: 'In React 19, state updates that happen after an `await` inside startTransition are not automatically marked as transitions yet. Wrap them in another startTransition if you need that (documented known limitation).',
    },
    {
      heading: 'useActionState: result + pending for a form',
      content:
        '`useActionState(actionFn, initialState, permalink?)` returns `[state, formAction, isPending]`.\n\n- `actionFn(previousState, formData)` runs when the form is submitted. Whatever it returns becomes the new `state` (for example `{ error: \'Email taken\' }` or `{ success: true }`).\n- `formAction` is what you pass to `<form action={formAction}>` or `<button formAction={formAction}>`.\n- `isPending` is true while the action runs.\n\nIt was called `useFormState` in the React canary / react-dom; it was renamed and moved to `react` in React 19. In a MERN app the action typically calls your Express API with axios/fetch. With Next.js the action can be a Server Function marked with `\'use server\'`.',
      syntax:
        "import { useActionState } from 'react';\n\nasync function signup(prevState, formData) {\n  const res = await fetch('/api/auth/register', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(Object.fromEntries(formData)),\n  });\n  if (!res.ok) return { error: (await res.json()).message };\n  return { error: null, ok: true };\n}\n\nfunction SignupForm() {\n  const [state, formAction, isPending] = useActionState(signup, { error: null });\n  return (\n    <form action={formAction}>\n      <input name=\"email\" type=\"email\" required />\n      <input name=\"password\" type=\"password\" required />\n      <button disabled={isPending}>{isPending ? 'Creating...' : 'Sign up'}</button>\n      {state.error && <p role=\"alert\">{state.error}</p>}\n    </form>\n  );\n}",
    },
    {
      heading: 'useFormStatus: pending state for design-system buttons',
      content:
        '`useFormStatus()` from **react-dom** returns `{ pending, data, method, action }` for the **parent `<form>`** of the component that calls it. This lets you build a reusable `<SubmitButton>` without prop drilling `isPending`.\n\nRules:\n- It must be called from a component **rendered inside** the `<form>`. Calling it in the same component that renders the form returns `pending: false` forever.\n- It only tracks forms that use the `action` prop (Actions), not classic `onSubmit` handlers.',
      syntax:
        "import { useFormStatus } from 'react-dom';\n\nexport function SubmitButton({ children }) {\n  const { pending } = useFormStatus();\n  return <button type=\"submit\" disabled={pending}>{pending ? 'Please wait...' : children}</button>;\n}\n\n// <form action={saveAddress}> ... <SubmitButton>Save</SubmitButton> </form>",
    },
    {
      heading: 'useOptimistic: instant UI with automatic rollback',
      content:
        'Optimistic UI means showing the result **before** the server confirms (like WhatsApp showing your message with a clock icon). `useOptimistic(state, updateFn)` returns `[optimisticState, addOptimistic]`.\n\n- While an Action is pending, `optimisticState` = the real state with your optimistic changes applied by `updateFn(currentState, optimisticValue)`.\n- When the Action finishes, React **drops** the optimistic value and shows the real `state` again. If you updated the real state on success, the item stays; if the request failed and you did not update state, it **disappears automatically** (rollback).\n- `addOptimistic` must be called inside an Action or transition.',
      syntax:
        "function Messages({ messages, sendMessage }) {\n  const [optimistic, addOptimistic] = useOptimistic(\n    messages,\n    (current, text) => [...current, { id: 'temp', text, sending: true }]\n  );\n  async function formAction(formData) {\n    addOptimistic(formData.get('text'));\n    await sendMessage(formData.get('text')); // parent updates real messages on success\n  }\n  return (\n    <>\n      {optimistic.map(m => <p key={m.id}>{m.text} {m.sending && <small>(sending...)</small>}</p>)}\n      <form action={formAction}><input name=\"text\" /><button>Send</button></form>\n    </>\n  );\n}",
    },
    {
      heading: 'use(): read promises and context',
      content:
        '`use(resource)` is a new API (not a hook in the strict sense) that reads the value of a **Promise** or a **Context**.\n\n- With a promise: the component **suspends** until it resolves (the nearest `<Suspense fallback>` shows), and rejections go to the nearest Error Boundary.\n- With context: works like `useContext` but **can be called inside if statements and loops**.\n\nImportant: do **not** create the promise inside the same client component during render (`use(fetch(...))`) because every render creates a new promise and it suspends forever. The promise must be **cached or created outside**: passed from a Server Component, from a router loader, or from a cache like TanStack Query.',
      syntax:
        "import { use, Suspense } from 'react';\n\nfunction Comments({ commentsPromise }) {\n  const comments = use(commentsPromise);   // suspends until resolved\n  return comments.map(c => <p key={c.id}>{c.body}</p>);\n}\n\nfunction Heading({ show }) {\n  if (!show) return null;\n  const theme = use(ThemeContext);          // allowed after an early return\n  return <h1 className={theme}>Hello</h1>;\n}",
    },
    {
      heading: 'Quality-of-life changes in React 19',
      content:
        '- **ref as a prop**: function components can accept `ref` like any other prop. `forwardRef` is no longer needed (it will be deprecated).\n- **Ref callback cleanup**: a ref callback may return a cleanup function, called when the element is removed.\n- **`<Context value={...}>`** can be used directly as a provider instead of `<Context.Provider>`.\n- **Document metadata**: render `<title>`, `<meta>` and `<link>` anywhere in a component; React hoists them to `<head>`.\n- **Stylesheet and script support** with precedence, and resource preloading APIs: `preload`, `preinit`, `preconnect`, `prefetchDNS` from react-dom.\n- **Better hydration errors** with a single diff message, and `onCaughtError` / `onUncaughtError` options on `createRoot`.\n- **Removed**: `propTypes` and `defaultProps` for function components (use default parameters and TypeScript), string refs, legacy context, `ReactDOM.render` (use `createRoot`).\n- **React Compiler** (separate Babel plugin, stable since late 2025) auto-memoizes components.',
      syntax:
        "// React 19: no forwardRef\nfunction TextInput({ label, ref, ...rest }) {\n  return <label>{label}<input ref={ref} {...rest} /></label>;\n}\n\n// Context as provider + metadata\n<ThemeContext value=\"dark\">\n  <title>My Orders | ShopKart</title>\n  <meta name=\"description\" content=\"Your recent orders\" />\n  <Orders />\n</ThemeContext>",
    },
    {
      heading: 'Server Components: the concept',
      content:
        '**React Server Components (RSC)** run only on the server (at build time or per request). They can `await` the database directly, their code is **never sent to the browser**, and they render to a special serialized format that the client merges into the tree.\n\n- **Server Component** (default in Next.js App Router): async, can read files/DB, no state, no effects, no event handlers.\n- **Client Component**: starts with `\'use client\'`; can use hooks and browser APIs. It is still pre-rendered to HTML on the server (SSR) and then hydrated.\n- **Server Functions** (`\'use server\'`): functions the client can call like normal async functions; React sends a POST request under the hood. Often used as form actions.\n\nFor a classic MERN app (Vite + Express), you will not use RSC directly; RSC needs a framework (Next.js, React Router framework mode, Waku). But the client-side React 19 hooks above work perfectly with a Vite SPA calling your Express API.',
      points: [
        'RSC is not the same as SSR. SSR renders client components to HTML; RSC components never hydrate and ship zero JS.',
        'Props passed from a Server to a Client Component must be serializable (no functions except Server Functions).',
      ],
    },
  ],
  examples: [
    {
      title: 'useActionState signup form (React 19) and the same idea in plain React',
      scenario: 'A register form that calls the Express API, shows server errors and disables the button while pending.',
      steps: [
        'Write an async action (prevState, formData) that returns { error } or { ok }',
        'Call useActionState(action, initialState) and pass formAction to <form action>',
        'Read state.error and isPending in JSX',
        'Run the playground: it re-implements the hook with React 18 APIs so you can try it',
      ],
      code: `import { useActionState } from 'react';

async function registerAction(prev, formData) {
  const email = formData.get('email');
  if (!email.includes('@')) return { error: 'Enter a valid email' };
  const res = await api.post('/auth/register', Object.fromEntries(formData)).catch(e => e.response);
  if (res.status === 409) return { error: 'Email already registered' };
  return { error: null, user: res.data.user };
}

export function Register() {
  const [state, formAction, isPending] = useActionState(registerAction, { error: null });
  return (
    <form action={formAction}>
      <input name="email" placeholder="Email" />
      <button disabled={isPending}>{isPending ? 'Creating...' : 'Create account'}</button>
      {state.error && <p className="text-red-600">{state.error}</p>}
      {state.user && <p>Welcome {state.user.email}</p>}
    </form>
  );
}`,
      playground: {
        jsx: `const { useState, useTransition } = React;

// Tiny polyfill of React 19 useActionState for the React 18 playground
function useActionStateDemo(action, initial) {
  const [state, setState] = useState(initial);
  const [isPending, setPending] = useState(false);
  async function formAction(formData) {
    setPending(true);
    const next = await action(state, formData);
    setState(next);
    setPending(false);
  }
  return [state, formAction, isPending];
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));
const taken = ['asha@test.com'];

async function registerAction(prev, formData) {
  await wait(1000);
  const email = formData.get('email');
  if (!email.includes('@')) return { error: 'Enter a valid email' };
  if (taken.includes(email)) return { error: 'Email already registered (409 from API)' };
  taken.push(email);
  return { error: null, user: { email } };
}

function App() {
  const [state, formAction, isPending] = useActionStateDemo(registerAction, { error: null });
  function onSubmit(e) {
    e.preventDefault();                 // React 19 <form action> does this for you
    formAction(new FormData(e.currentTarget));
  }
  return (
    <form onSubmit={onSubmit} style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <p>Try asha@test.com (taken) or any new email.</p>
      <input name="email" placeholder="Email" />{' '}
      <button disabled={isPending}>{isPending ? 'Creating...' : 'Create account'}</button>
      {state.error && <p style={{ color: 'crimson' }}>{state.error}</p>}
      {state.user && <p style={{ color: 'green' }}>Welcome {state.user.email}</p>}
    </form>
  );
}`,
      },
      result: 'The button shows "Creating..." for one second. Invalid or taken emails show an error; a new email shows a welcome message.',
      explanation:
        'useActionState stores the value returned by the action as state, so the server error message flows naturally into the UI. The playground uses React 18, so a 10-line polyfill mimics the hook; in a React 19 Vite project you simply import useActionState from react.',
    },
    {
      title: 'Reusable SubmitButton with useFormStatus',
      scenario: 'Every form in your admin panel needs a button that disables itself while the form is submitting.',
      steps: [
        'Create SubmitButton that calls useFormStatus()',
        'Render it inside any <form action={...}>',
        'No isPending prop is passed: the hook reads the parent form',
      ],
      code: `import { useFormStatus } from 'react-dom';

function SubmitButton({ label = 'Save' }) {
  const { pending, data } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Saving ' + (data?.get('title') ?? '') + '...' : label}
    </button>
  );
}

function AddProduct() {
  async function addProduct(formData) {
    await api.post('/products', { title: formData.get('title'), price: Number(formData.get('price')) });
  }
  return (
    <form action={addProduct}>
      <input name="title" />
      <input name="price" type="number" />
      <SubmitButton label="Add product" />   {/* works without props */}
    </form>
  );
}`,
      result: 'While the request runs the button reads "Saving <title>..." and is disabled. Uncontrolled fields reset after success.',
      explanation:
        'useFormStatus subscribes to the nearest parent form that uses an Action. The common bug is calling it in the component that renders the <form>; it must be in a child.',
    },
    {
      title: 'Optimistic like button with rollback',
      scenario: 'Instagram-style like: the heart turns red instantly; if the API fails it goes back.',
      steps: [
        'Keep the confirmed value in state',
        'Show an optimistic value while the request is pending',
        'On failure, drop the optimistic value (rollback) and show an error',
        'Run the playground and toggle "API fails" to see rollback',
      ],
      code: `// React 19
function LikeButton({ post, onLike }) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(post.liked);
  const [isPending, startTransition] = useTransition();
  function toggle() {
    startTransition(async () => {
      setOptimisticLiked(!optimisticLiked);
      await onLike(post._id, !post.liked); // updates real state on success; on error nothing changes => rollback
    });
  }
  return <button onClick={toggle}>{optimisticLiked ? '❤' : '♡'}</button>;
}`,
      playground: {
        jsx: `const { useState } = React;
const wait = (ms) => new Promise(r => setTimeout(r, ms));

function App() {
  const [liked, setLiked] = useState(false);       // confirmed by server
  const [optimistic, setOptimistic] = useState(null); // null = no pending change
  const [fail, setFail] = useState(false);
  const [error, setError] = useState('');
  const shown = optimistic ?? liked;

  async function toggle() {
    const next = !shown;
    setOptimistic(next); setError('');
    try {
      await wait(1200);
      if (fail) throw new Error('Network error, like reverted');
      setLiked(next);
    } catch (e) {
      setError(e.message);
    } finally {
      setOptimistic(null);  // what useOptimistic does automatically
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <label><input type="checkbox" checked={fail} onChange={e => setFail(e.target.checked)} /> API fails</label>
      <p>
        <button onClick={toggle} style={{ fontSize: 32, background: 'none', border: 0, cursor: 'pointer', color: shown ? 'crimson' : 'gray' }}>
          {shown ? '\\u2665' : '\\u2661'}
        </button>
        {optimistic !== null && <small> saving...</small>}
      </p>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </div>
  );
}`,
      },
      result: 'The heart changes instantly. With "API fails" checked it flips back after 1.2 s and shows an error.',
      explanation:
        'useOptimistic keeps two values: the real state and a temporary overlay that exists only while the Action is pending. When the Action ends the overlay is removed, so success shows the updated real state and failure shows the old one.',
    },
    {
      title: 'use() with Suspense for a promise',
      scenario: 'A product page starts loading reviews in the router loader and the component reads them with use().',
      steps: [
        'Create the promise outside the component (loader, parent, or cache)',
        'Call use(promise) in the child',
        'Wrap the child in <Suspense fallback> and an Error Boundary',
        'Run the playground: it demonstrates the same Suspense contract React 18 uses (throwing a promise)',
      ],
      code: `// React 19
import { use, Suspense } from 'react';

function Reviews({ reviewsPromise }) {
  const reviews = use(reviewsPromise);
  return <ul>{reviews.map(r => <li key={r._id}>{r.text}</li>)}</ul>;
}

export default function ProductPage({ reviewsPromise }) {   // promise created by a loader
  return (
    <Suspense fallback={<p>Loading reviews...</p>}>
      <Reviews reviewsPromise={reviewsPromise} />
    </Suspense>
  );
}`,
      playground: {
        jsx: `const { Suspense, useState } = React;

// Minimal "use" for React 18: cache result on the promise and throw while pending
function use(promise) {
  if (promise.status === 'fulfilled') return promise.value;
  if (promise.status === 'rejected') throw promise.reason;
  if (!promise.status) {
    promise.status = 'pending';
    promise.then(v => { promise.status = 'fulfilled'; promise.value = v; },
                 e => { promise.status = 'rejected'; promise.reason = e; });
  }
  throw promise; // Suspense catches thrown promises
}

function loadReviews(id) {
  return new Promise(r => setTimeout(() => r([
    { id: 1, text: 'Product ' + id + ': great value' },
    { id: 2, text: 'Product ' + id + ': fast delivery' },
  ]), 1000));
}

function Reviews({ reviewsPromise }) {
  const reviews = use(reviewsPromise);
  return <ul>{reviews.map(r => <li key={r.id}>{r.text}</li>)}</ul>;
}

function App() {
  const [id, setId] = useState(1);
  const [promise, setPromise] = useState(() => loadReviews(1)); // created once per id, not every render
  function next() { const n = id + 1; setId(n); setPromise(loadReviews(n)); }
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <button onClick={next}>Next product</button>
      <Suspense fallback={<p>Loading reviews...</p>}>
        <Reviews reviewsPromise={promise} />
      </Suspense>
    </div>
  );
}`,
      },
      result: '"Loading reviews..." appears for one second, then the list. Clicking Next shows the fallback again for the new product.',
      explanation:
        'Under the hood Suspense works by a component throwing a pending promise. React 19 use() implements this properly (and tracks status for you). The key rule: the promise is stored in state/created by a loader, not created inline during render.',
    },
    {
      title: 'ref as a prop (React 19) vs forwardRef (React 18)',
      scenario: 'A design-system Input component must let parents focus it.',
      steps: [
        'React 19: destructure ref from props and attach it',
        'React 18 (playground): wrap the component with forwardRef',
        'Parent creates useRef and calls ref.current.focus()',
      ],
      code: `// React 19
function Input({ label, ref, ...props }) {
  return <label>{label} <input ref={ref} {...props} /></label>;
}

// React 18 (still works in 19 but will be deprecated)
const Input18 = forwardRef(function Input({ label, ...props }, ref) {
  return <label>{label} <input ref={ref} {...props} /></label>;
});`,
      playground: {
        jsx: `const { useRef, forwardRef } = React;

const Input = forwardRef(function Input({ label, ...props }, ref) {
  return <label style={{ display: 'block', margin: 8 }}>{label} <input ref={ref} {...props} /></label>;
});

function App() {
  const emailRef = useRef(null);
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <Input label="Name" />
      <Input label="Email" ref={emailRef} type="email" />
      <button onClick={() => emailRef.current.focus()}>Focus email</button>
    </div>
  );
}`,
      },
      result: 'Clicking the button moves the cursor into the Email input.',
      explanation:
        'In React 18 the ref prop is stripped from props, so forwardRef passes it as a second argument. React 19 treats ref as a normal prop for function components, removing the wrapper.',
    },
  ],
  interview: [
    { q: 'What are Actions in React 19?', a: 'Functions that perform async mutations inside a transition. React tracks pending state, handles errors through Error Boundaries, supports optimistic updates, and for <form action={fn}> passes FormData and resets the form on success.', level: 'Easy' },
    { q: 'What does useActionState return and what are the action arguments?', a: 'It returns [state, formAction, isPending]. The action is called with (previousState, formData) and its return value becomes the next state. It replaced the experimental useFormState.', level: 'Medium' },
    { q: 'Why does useFormStatus always return pending: false in my form component?', a: 'useFormStatus reads the status of a PARENT form. It must be called inside a component rendered within the <form>, e.g. a SubmitButton child, not in the component that renders the form itself. It also only works with action-based forms.', level: 'Medium' },
    { q: 'How does useOptimistic handle failures?', a: 'The optimistic value exists only while the surrounding Action/transition is pending. When it settles, React re-renders with the real state. If the request failed and real state was not updated, the optimistic change disappears automatically, which is the rollback. You still show an error message yourself.', level: 'Medium' },
    { q: 'How is use() different from other hooks?', a: 'use can be called conditionally and in loops (but still only in components/hooks). It reads promises (suspending until resolved) and context. It cannot be called in try/catch; errors go to Error Boundaries.', level: 'Medium' },
    { q: 'Why does use(fetch(url)) inside a client component cause an infinite loading state?', a: 'Each render creates a new promise. When it resolves React re-renders, which creates another new pending promise, and suspends again. Promises must be created outside render or cached (loader, Server Component, query cache).', level: 'Hard' },
    { q: 'What happened to forwardRef in React 19?', a: 'Function components receive ref as a regular prop, so forwardRef is unnecessary and planned for deprecation. Ref callbacks can also return a cleanup function.', level: 'Easy' },
    { q: 'What are React Server Components?', a: 'Components that run only on the server, can be async and access data sources directly, and send no JavaScript to the client. They render to a serialized payload that the client merges into the tree. Client Components are opted in with "use client". They require framework support like Next.js App Router.', level: 'Medium' },
    { q: 'Difference between SSR and Server Components?', a: 'SSR renders the whole tree (including client components) to HTML for the first load and then hydrates all of it, so all component code is shipped. RSC components never hydrate and their code is never shipped; they can also be re-fetched on navigation. They are complementary.', level: 'Hard' },
    { q: 'Which APIs were removed in React 19?', a: 'propTypes and defaultProps for function components, string refs, legacy context (contextTypes), ReactDOM.render/hydrate (use createRoot/hydrateRoot), unmountComponentAtNode, findDOMNode, and react-test-renderer/shallow.', level: 'Medium' },
    { q: 'How do you set the page title in React 19 without a library?', a: 'Render <title> (and <meta>, <link>) inside any component. React 19 hoists these tags into document head automatically. Earlier you needed react-helmet or a useEffect setting document.title.', level: 'Easy' },
    { q: 'Can you use React 19 Actions in a Vite + Express MERN app?', a: 'Yes. useActionState, useOptimistic, useFormStatus and async transitions are client features. The action functions simply call the Express REST API. Only Server Functions ("use server") and Server Components need a framework.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a React 19 "Add comment" form using useActionState that validates the text (min 3 chars), POSTs to /api/comments and returns { error } or { comments } for display.',
      hint: 'Return the new state from the action; read state in JSX.',
      solution: `import { useActionState } from 'react';

async function addComment(prev, formData) {
  const text = formData.get('text')?.trim() ?? '';
  if (text.length < 3) return { ...prev, error: 'Comment must be at least 3 characters' };
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) return { ...prev, error: 'Could not save comment' };
  const saved = await res.json();
  return { error: null, comments: [...prev.comments, saved] };
}

export default function Comments() {
  const [state, formAction, isPending] = useActionState(addComment, { error: null, comments: [] });
  return (
    <section>
      <ul>{state.comments.map(c => <li key={c._id}>{c.text}</li>)}</ul>
      <form action={formAction}>
        <textarea name="text" />
        <button disabled={isPending}>{isPending ? 'Posting...' : 'Post'}</button>
      </form>
      {state.error && <p role="alert">{state.error}</p>}
    </section>
  );
}`,
    },
    {
      task: 'Create a reusable <SubmitButton> using useFormStatus and use it in two different forms.',
      hint: 'Import from react-dom; the button must be a child of the form.',
      solution: `import { useFormStatus } from 'react-dom';

export function SubmitButton({ children, pendingText = 'Please wait...' }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} aria-busy={pending}>{pending ? pendingText : children}</button>;
}

export function LoginForm({ login }) {
  return <form action={login}><input name="email" /><input name="password" type="password" /><SubmitButton>Login</SubmitButton></form>;
}
export function NewsletterForm({ subscribe }) {
  return <form action={subscribe}><input name="email" /><SubmitButton pendingText="Subscribing...">Subscribe</SubmitButton></form>;
}`,
    },
    {
      task: 'Build an optimistic todo list in React 19: new todos appear immediately with "(saving)" and disappear if the API rejects.',
      hint: 'useOptimistic(todos, (state, newTodo) => [...state, newTodo]); call addOptimistic inside the form action.',
      solution: `import { useState, useOptimistic } from 'react';

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState('');
  const [optimisticTodos, addOptimistic] = useOptimistic(todos, (state, t) => [...state, t]);

  async function addTodo(formData) {
    const title = formData.get('title');
    setError('');
    addOptimistic({ _id: 'temp-' + Date.now(), title, saving: true });
    try {
      const res = await fetch('/api/todos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) });
      if (!res.ok) throw new Error('Save failed');
      const saved = await res.json();
      setTodos(t => [...t, saved]);
    } catch (e) {
      setError(e.message); // optimistic item disappears automatically
    }
  }

  return (
    <>
      <ul>{optimisticTodos.map(t => <li key={t._id}>{t.title} {t.saving && '(saving)'}</li>)}</ul>
      <form action={addTodo}><input name="title" required /><button>Add</button></form>
      {error && <p>{error}</p>}
    </>
  );
}`,
    },
    {
      task: 'Refactor this React 18 code to React 19 style: `const Ctx = createContext(); <Ctx.Provider value={v}>`, `forwardRef` Input, and `useEffect(() => { document.title = title }, [title])`.',
      hint: 'Context as provider, ref as prop, <title> in JSX.',
      solution: `const ThemeContext = createContext('light');

function Input({ ref, ...props }) {          // no forwardRef
  return <input ref={ref} {...props} />;
}

function Page({ title, theme }) {
  return (
    <ThemeContext value={theme}>             {/* no .Provider */}
      <title>{title}</title>                 {/* hoisted to <head> */}
      <Input placeholder="Search" />
    </ThemeContext>
  );
}`,
    },
  ],
  quiz: [
    { question: 'What arguments does an action passed to useActionState receive?', options: ['(event)', '(previousState, formData)', '(formData, dispatch)', '(state, action)'], answer: 1, explanation: 'The action gets the previous state and the submitted FormData; its return value becomes the new state.' },
    { question: 'Where must useFormStatus be called?', options: ['In the component that renders the <form>', 'At module top level', 'In a component rendered inside the <form>', 'Inside the action function'], answer: 2, explanation: 'It reads the status of its parent form, so it must be in a descendant component.' },
    { question: 'What happens to an optimistic value when its Action fails and real state is unchanged?', options: ['It disappears, showing the real state again', 'It stays forever', 'React throws an error', 'The page reloads'], answer: 0, explanation: 'Optimistic state only lives while the Action is pending; afterwards the real state is shown.' },
    { question: 'Which statement about use() is correct?', options: ['It can only read context', 'It must never be called conditionally', 'It replaces useEffect', 'It can read a promise and may be called inside an if statement'], answer: 3, explanation: 'use reads promises and context and, unlike other hooks, can be called conditionally.' },
    { question: 'Which is TRUE about React Server Components?', options: ['They can use useState', 'Their code is not shipped to the browser', 'They work in any Vite SPA without a framework', 'They are the same as SSR'], answer: 1, explanation: 'Server Components run only on the server and send rendered output, not their code.' },
  ],
};
