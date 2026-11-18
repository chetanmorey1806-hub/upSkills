export default {
  id: 'day-11-server-actions-and-forms',
  title: 'Server Actions and Forms (useActionState, useFormStatus, revalidatePath)',
  module: 'Module 2: Data & Rendering',
  day: 11,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Server Actions let a form call a function that runs on the server, without writing an API route. Learn the "use server" directive, form actions, FormData, validation with zod, pending UI with useFormStatus, returning errors with useActionState, optimistic UI with useOptimistic, and refreshing cached pages with revalidatePath / redirect.',
  objectives: [
    'Explain what a Server Action is and how it differs from a Route Handler',
    'Create Server Actions with the "use server" directive (inline and in a separate actions.js file)',
    'Read and validate FormData on the server and return field errors with useActionState',
    'Show pending state with useFormStatus and instant feedback with useOptimistic',
    'Refresh data after a mutation with revalidatePath, revalidateTag and redirect',
  ],
  theory: [
    {
      heading: 'What is a Server Action?',
      content:
        'A **Server Action** is an `async` function marked with the `"use server"` directive. Next.js turns it into a secret, auto-generated POST endpoint. When a `<form action={myAction}>` is submitted, the browser sends the form data to that endpoint, the function runs **on the server** (it can talk to the database, read secrets, write files) and the updated UI is streamed back.\n\nAnalogy: a restaurant. Before Server Actions you had to build a separate "order counter" (an API route), walk to it, place the order in JSON, and walk back. A Server Action is like a waiter at your table: you hand the order (the form) to the waiter and the kitchen (server) handles it. You never see the kitchen door, but the work still happens in the kitchen.\n\nKey facts:\n- Server Actions always use **POST** and are only for **mutations** (create, update, delete), not for reading data. Read data in Server Components (Day 7).\n- Forms with a Server Action work **even before JavaScript loads** (progressive enhancement): the browser does a normal form POST.\n- The function arguments travel over the network, so they must be **serializable** (strings, numbers, plain objects, FormData, Date).\n- Every Server Action is a public endpoint. **Always check authentication and validate input inside the action** - never trust that only your UI calls it.',
      syntax:
        "// app/actions.js\n'use server';                       // every export in this file is a Server Action\n\nexport async function createTodo(formData) {\n  const title = formData.get('title');\n  await db.todo.create({ data: { title } });\n}",
      tip: 'Server Actions vs Route Handlers: use a Server Action for form submissions and mutations from your own Next.js UI. Use a Route Handler (Day 10) when something outside your app (mobile app, webhook, third-party) must call a public REST URL.',
    },
    {
      heading: 'Two ways to define a Server Action',
      content:
        '1. **Inline** inside a Server Component: put `"use server"` as the first line of the function body. Handy for tiny one-off actions.\n2. **Module level**: put `"use server"` at the top of a file (e.g. `app/actions.js`). Every exported async function becomes a Server Action. This is the only way to use actions inside **Client Components** - a client file imports the action from the server file.\n\nYou can pass extra arguments with `.bind()`: `const deleteWithId = deleteTodo.bind(null, todo.id)` then `<form action={deleteWithId}>`. The bound value is sent with the form.\n\nActions can also be called outside forms: from an `onClick` handler with `startTransition(() => likePost(id))`, or as `formAction` on a specific `<button>`.',
      syntax:
        "// app/page.js (Server Component) - inline action\nexport default function Page() {\n  async function subscribe(formData) {\n    'use server';\n    await saveEmail(formData.get('email'));\n  }\n  return (\n    <form action={subscribe}>\n      <input name=\"email\" type=\"email\" required />\n      <button>Subscribe</button>\n    </form>\n  );\n}",
      points: [
        'File-level "use server" = all exports are actions; must be async functions',
        '"use client" files cannot define actions, only import them',
        'Use .bind(null, id) to pass hidden data safely instead of hidden inputs when you prefer',
      ],
    },
    {
      heading: 'Reading FormData and validating with zod',
      content:
        'The action receives a standard Web **FormData** object. `formData.get(\'name\')` returns the value of the input with `name="name"` (always a string or File, or `null`). Use `Object.fromEntries(formData)` to turn it into a plain object.\n\nBecause anyone can POST to the action, validate on the server. **zod** is the most popular schema library: define a schema once, call `schema.safeParse(data)`, and get either `success: true` with clean typed data, or `error` with per-field messages (`error.flatten().fieldErrors`).\n\nHTML attributes like `required` and `minLength` give quick client feedback, but they are **not security** - they can be removed in DevTools. Server validation is mandatory; client validation is a convenience.',
      syntax:
        "import { z } from 'zod';\n\nconst TodoSchema = z.object({\n  title: z.string().trim().min(3, 'Title must be at least 3 characters'),\n  priority: z.enum(['low', 'high']),\n});\n\nconst parsed = TodoSchema.safeParse(Object.fromEntries(formData));\nif (!parsed.success) {\n  return { errors: parsed.error.flatten().fieldErrors };\n}",
    },
    {
      heading: 'useActionState and useFormStatus: errors and pending UI',
      content:
        '**useActionState** (React 19, imported from `react`) connects a form to an action that **returns a value** - usually `{ errors, message }`. It gives you `[state, formAction, isPending]`.\n\n- `state` is whatever the action returned last time (or the initial state)\n- `formAction` is what you pass to `<form action={...}>`\n- `isPending` is `true` while the action runs\n\nWhen used with useActionState, the action signature changes to `(prevState, formData)` - the previous state comes first.\n\n**useFormStatus** (from `react-dom`) gives `{ pending, data, method }` of the **parent form**. It must be called in a component **rendered inside** the `<form>`, which is why we make a small `<SubmitButton />` component.\n\nNote: older tutorials use `useFormState` from `react-dom`; it was renamed to `useActionState` in React 19.',
      syntax:
        "'use client';\nimport { useActionState } from 'react';\nimport { useFormStatus } from 'react-dom';\nimport { createTodo } from './actions';\n\nfunction SubmitButton() {\n  const { pending } = useFormStatus();\n  return <button disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>;\n}\n\nexport default function TodoForm() {\n  const [state, formAction] = useActionState(createTodo, { errors: {} });\n  return (\n    <form action={formAction}>\n      <input name=\"title\" />\n      {state.errors?.title && <p className=\"error\">{state.errors.title[0]}</p>}\n      <SubmitButton />\n    </form>\n  );\n}",
      tip: 'Common mistake: calling useFormStatus in the same component that renders the <form>. It always returns pending: false there. Move the button into its own child component.',
    },
    {
      heading: 'revalidatePath, revalidateTag, redirect and useOptimistic',
      content:
        'After a mutation the cached page still shows old data. Tell Next.js to refresh:\n- `revalidatePath(\'/todos\')` purges the cache for that route; the next render fetches fresh data. When called inside a Server Action, the current page is re-rendered and sent back in the **same response**.\n- `revalidateTag(\'todos\')` purges every `fetch` that was tagged with `{ next: { tags: [\'todos\'] } }` - useful when many pages show the same data.\n- `redirect(\'/todos/42\')` (from `next/navigation`) sends the user to another page. It works by **throwing** a special error, so call it **outside** try/catch and after revalidating.\n\n**useOptimistic** shows the expected result immediately while the server works. Example: a new comment appears greyed out instantly; when the action finishes, the real data replaces it. If the action fails, React drops the optimistic value automatically.',
      syntax:
        "'use server';\nimport { revalidatePath } from 'next/cache';\nimport { redirect } from 'next/navigation';\n\nexport async function createPost(prevState, formData) {\n  const post = await db.post.create({ data: { title: formData.get('title') } });\n  revalidatePath('/posts');          // refresh the list page\n  redirect('/posts/' + post.id);     // go to the new post (throws - keep outside try/catch)\n}",
      points: [
        'revalidatePath = refresh one route; revalidateTag = refresh every fetch with a tag',
        'redirect throws NEXT_REDIRECT - never wrap it in try/catch',
        'useOptimistic(state, updateFn) returns [optimisticState, addOptimistic]',
      ],
    },
    {
      heading: 'Security and best practices',
      content:
        '- **Authenticate inside every action**: `const session = await auth(); if (!session) throw new Error(\'Unauthorized\')`. Hiding the button is not protection.\n- **Authorize**: check the user owns the record before updating or deleting it.\n- **Validate** every field with zod; never pass `Object.fromEntries(formData)` straight into the database (mass-assignment bug).\n- Next.js protects actions against CSRF by only allowing POST and comparing the `Origin` header with the host; action IDs are encrypted and unused actions are removed from the client bundle.\n- Return **plain, serializable** objects (`{ message: \'Saved\' }`), not class instances or database connections.\n- Keep actions small: validate, call a data-access function, revalidate, return.\n\nComing next (Day 12): optimizing images and fonts, and the Metadata API for SEO.',
    },
  ],
  examples: [
    {
      title: 'Inline Server Action: add a guestbook entry',
      scenario: 'A guestbook page lists messages and lets visitors add one, with no API route and no client JavaScript required.',
      steps: [
        'Create app/guestbook/page.js as a Server Component (no "use client")',
        'Read the messages from the data source and render them in a list',
        'Define an async function addEntry(formData) with "use server" as the first line',
        'Inside it, read formData.get("message"), save it and call revalidatePath("/guestbook")',
        'Pass the function to <form action={addEntry}> and submit the form',
        'In the playground (a plain-React SIMULATION) type a message and click Sign',
      ],
      code:
        "// app/guestbook/page.js\nimport { revalidatePath } from 'next/cache';\nimport { db } from '@/lib/db';\n\nexport default async function GuestbookPage() {\n  const entries = await db.entry.findMany({ orderBy: { createdAt: 'desc' } });\n\n  async function addEntry(formData) {\n    'use server';\n    const message = String(formData.get('message') ?? '').trim();\n    if (message.length < 2) return;            // basic server-side guard\n    await db.entry.create({ data: { message } });\n    revalidatePath('/guestbook');               // re-render this page with fresh data\n  }\n\n  return (\n    <main>\n      <h1>Guestbook</h1>\n      <form action={addEntry}>\n        <input name=\"message\" placeholder=\"Say hi\" required />\n        <button type=\"submit\">Sign</button>\n      </form>\n      <ul>\n        {entries.map((e) => <li key={e.id}>{e.message}</li>)}\n      </ul>\n    </main>\n  );\n}",
      playground: {
        jsx: "// SIMULATION: plain React stands in for a Next.js Server Action.\n// fakeServerAction plays the role of the 'use server' function: it receives FormData,\n// waits like a network round trip, saves to a 'server' array, then we 'revalidate' (re-read).\nconst serverDb = [{ id: 1, message: 'First!' }];\n\nasync function fakeServerAction(formData) {\n  await new Promise((r) => setTimeout(r, 600)); // network + server work\n  const message = String(formData.get('message') || '').trim();\n  if (message.length < 2) return;\n  serverDb.unshift({ id: serverDb.length + 1, message });\n}\n\nfunction App() {\n  const [entries, setEntries] = React.useState([...serverDb]);\n  const [busy, setBusy] = React.useState(false);\n\n  async function handleSubmit(e) {\n    e.preventDefault();\n    const form = e.currentTarget;\n    setBusy(true);\n    await fakeServerAction(new FormData(form));\n    setEntries([...serverDb]); // like revalidatePath: re-render with fresh server data\n    setBusy(false);\n    form.reset();\n  }\n\n  return (\n    <main style={{ fontFamily: 'sans-serif', maxWidth: 360 }}>\n      <h1>Guestbook</h1>\n      <form onSubmit={handleSubmit}>\n        <input name=\"message\" placeholder=\"Say hi\" required />\n        <button disabled={busy}>{busy ? 'Signing...' : 'Sign'}</button>\n      </form>\n      <ul>{entries.map((e) => <li key={e.id}>{e.message}</li>)}</ul>\n      <small>Server array has {entries.length} entries</small>\n    </main>\n  );\n}",
      },
      result: 'Typing "Hello" and clicking Sign shows "Signing..." for about half a second, then "Hello" appears at the top of the list and the count increases.',
      explanation:
        'In real Next.js the form posts FormData to the hidden action endpoint; the function runs on the server, writes to the database and revalidatePath re-renders the Server Component, which streams back the new list. The simulation mimics that with an async function and a module-level array acting as the database.',
    },
    {
      title: 'Validation errors with zod + useActionState',
      scenario: 'A sign-up form must show "Email is invalid" or "Password too short" under each field, coming from the server.',
      steps: [
        'Create app/signup/actions.js with "use server" at the top',
        'Define a zod schema and export async function signup(prevState, formData)',
        'Return { errors: fieldErrors } when validation fails, or { message: "Account created" } on success',
        'Create a Client Component SignupForm.js using useActionState(signup, initialState)',
        'Render state.errors.email[0] under the email input',
        'Run the simulation and submit invalid values, then valid ones',
      ],
      code:
        "// app/signup/actions.js\n'use server';\nimport { z } from 'zod';\n\nconst Schema = z.object({\n  email: z.string().email('Email is invalid'),\n  password: z.string().min(8, 'Password must be at least 8 characters'),\n});\n\nexport async function signup(prevState, formData) {\n  const parsed = Schema.safeParse(Object.fromEntries(formData));\n  if (!parsed.success) {\n    return { errors: parsed.error.flatten().fieldErrors, message: '' };\n  }\n  await createUser(parsed.data);             // hash password, insert row...\n  return { errors: {}, message: 'Account created for ' + parsed.data.email };\n}\n\n// app/signup/SignupForm.js\n'use client';\nimport { useActionState } from 'react';\nimport { signup } from './actions';\n\nexport default function SignupForm() {\n  const [state, formAction, isPending] = useActionState(signup, { errors: {}, message: '' });\n  return (\n    <form action={formAction}>\n      <input name=\"email\" placeholder=\"Email\" />\n      {state.errors.email && <p className=\"error\">{state.errors.email[0]}</p>}\n      <input name=\"password\" type=\"password\" placeholder=\"Password\" />\n      {state.errors.password && <p className=\"error\">{state.errors.password[0]}</p>}\n      <button disabled={isPending}>{isPending ? 'Creating...' : 'Sign up'}</button>\n      {state.message && <p className=\"ok\">{state.message}</p>}\n    </form>\n  );\n}",
      playground: {
        jsx: "// SIMULATION of useActionState with plain React 18 (useActionState is React 19).\n// signupAction mimics the server action: (prevState, formData) => newState.\nasync function signupAction(prevState, formData) {\n  await new Promise((r) => setTimeout(r, 500));\n  const email = String(formData.get('email') || '');\n  const password = String(formData.get('password') || '');\n  const errors = {};\n  if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)) errors.email = ['Email is invalid'];\n  if (password.length < 8) errors.password = ['Password must be at least 8 characters'];\n  if (Object.keys(errors).length) return { errors, message: '' };\n  return { errors: {}, message: 'Account created for ' + email };\n}\n\n// Tiny home-made version of useActionState\nfunction useActionStateSim(action, initial) {\n  const [state, setState] = React.useState(initial);\n  const [isPending, setPending] = React.useState(false);\n  async function formAction(formData) {\n    setPending(true);\n    const next = await action(state, formData);\n    setState(next);\n    setPending(false);\n  }\n  return [state, formAction, isPending];\n}\n\nfunction App() {\n  const [state, formAction, isPending] = useActionStateSim(signupAction, { errors: {}, message: '' });\n  const err = { color: 'crimson', margin: '2px 0 8px', fontSize: 13 };\n  return (\n    <form style={{ fontFamily: 'sans-serif', display: 'grid', maxWidth: 280 }}\n      onSubmit={(e) => { e.preventDefault(); formAction(new FormData(e.currentTarget)); }}>\n      <input name=\"email\" placeholder=\"Email\" />\n      {state.errors.email && <p style={err}>{state.errors.email[0]}</p>}\n      <input name=\"password\" type=\"password\" placeholder=\"Password\" style={{ marginTop: 8 }} />\n      {state.errors.password && <p style={err}>{state.errors.password[0]}</p>}\n      <button disabled={isPending} style={{ marginTop: 8 }}>{isPending ? 'Creating...' : 'Sign up'}</button>\n      {state.message && <p style={{ color: 'green' }}>{state.message}</p>}\n    </form>\n  );\n}",
      },
      result: 'Submitting "abc" and "123" shows both red errors. Submitting "asha@mail.com" and "secret123" shows "Account created for asha@mail.com" in green.',
      explanation:
        'useActionState stores whatever the action returns. The action gets the previous state first and FormData second. Because errors come from the server, they cannot be bypassed by editing HTML. The simulation reproduces the same state flow with useState.',
    },
    {
      title: 'Pending button with useFormStatus',
      scenario: 'Reusable submit button that disables itself and shows a spinner text while its parent form is submitting.',
      steps: [
        'Create components/SubmitButton.js with "use client"',
        'Call useFormStatus() from react-dom inside it',
        'Render the button disabled when pending is true',
        'Place <SubmitButton /> inside any form that uses a Server Action',
        'In the simulation, a FormStatus context imitates useFormStatus',
      ],
      code:
        "// components/SubmitButton.js\n'use client';\nimport { useFormStatus } from 'react-dom';\n\nexport function SubmitButton({ children, pendingText = 'Saving...' }) {\n  const { pending } = useFormStatus();   // status of the PARENT <form>\n  return (\n    <button type=\"submit\" disabled={pending} aria-disabled={pending}>\n      {pending ? pendingText : children}\n    </button>\n  );\n}\n\n// app/contact/page.js (Server Component)\nimport { SubmitButton } from '@/components/SubmitButton';\nimport { sendMessage } from './actions';\n\nexport default function Contact() {\n  return (\n    <form action={sendMessage}>\n      <textarea name=\"body\" required />\n      <SubmitButton pendingText=\"Sending...\">Send</SubmitButton>\n    </form>\n  );\n}",
      playground: {
        jsx: "// SIMULATION: a context plays the role of useFormStatus (which reads the parent form's status).\nconst FormStatus = React.createContext({ pending: false });\nfunction useFormStatusSim() { return React.useContext(FormStatus); }\n\nfunction ActionForm({ action, children }) {\n  const [pending, setPending] = React.useState(false);\n  async function onSubmit(e) {\n    e.preventDefault();\n    setPending(true);\n    await action(new FormData(e.currentTarget));\n    setPending(false);\n  }\n  return (\n    <FormStatus.Provider value={{ pending }}>\n      <form onSubmit={onSubmit}>{children}</form>\n    </FormStatus.Provider>\n  );\n}\n\nfunction SubmitButton({ children, pendingText }) {\n  const { pending } = useFormStatusSim();\n  return <button disabled={pending}>{pending ? pendingText : children}</button>;\n}\n\nfunction App() {\n  const [log, setLog] = React.useState([]);\n  async function sendMessage(fd) {\n    await new Promise((r) => setTimeout(r, 1200));\n    setLog((l) => [...l, 'Sent: ' + fd.get('body')]);\n  }\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <ActionForm action={sendMessage}>\n        <textarea name=\"body\" required defaultValue=\"Hello team\" /><br />\n        <SubmitButton pendingText=\"Sending...\">Send</SubmitButton>\n      </ActionForm>\n      <ul>{log.map((m, i) => <li key={i}>{m}</li>)}</ul>\n    </div>\n  );\n}",
      },
      result: 'Clicking Send disables the button and shows "Sending..." for 1.2 seconds, then "Sent: Hello team" is added to the list.',
      explanation:
        'useFormStatus reads the status of the nearest parent form, which is why the button must be a child component. The simulation uses a context provided by the form wrapper to show the same idea.',
    },
    {
      title: 'Optimistic likes with useOptimistic',
      scenario: 'Clicking Like should increase the counter instantly, even though the server takes a second to save it.',
      steps: [
        'Create a Server Action likePost(postId) that increments the counter and calls revalidatePath',
        'In a Client Component call useOptimistic(likes, (current, inc) => current + inc)',
        'On click, call addOptimistic(1) and then await likePost inside startTransition / a form action',
        'Observe the count jumps immediately; the real value arrives after the server responds',
        'Try the simulation with "Fail next request" ticked to see the rollback',
      ],
      code:
        "// app/posts/actions.js\n'use server';\nimport { revalidatePath } from 'next/cache';\n\nexport async function likePost(postId) {\n  await db.post.update({ where: { id: postId }, data: { likes: { increment: 1 } } });\n  revalidatePath('/posts/' + postId);\n}\n\n// app/posts/[id]/LikeButton.js\n'use client';\nimport { useOptimistic, startTransition } from 'react';\nimport { likePost } from '../actions';\n\nexport default function LikeButton({ postId, likes }) {\n  const [optimisticLikes, addOptimistic] = useOptimistic(likes, (cur, inc) => cur + inc);\n\n  return (\n    <button onClick={() => startTransition(async () => {\n      addOptimistic(1);          // UI updates now\n      await likePost(postId);    // server confirms later; fresh props replace the optimistic value\n    })}>\n      Like ({optimisticLikes})\n    </button>\n  );\n}",
      playground: {
        jsx: "// SIMULATION of useOptimistic: show the expected value now, roll back on failure.\nlet serverLikes = 10;\nasync function likePostOnServer(fail) {\n  await new Promise((r) => setTimeout(r, 1000));\n  if (fail) throw new Error('Server error');\n  serverLikes += 1;\n  return serverLikes;\n}\n\nfunction App() {\n  const [likes, setLikes] = React.useState(serverLikes);   // confirmed server value\n  const [pendingInc, setPendingInc] = React.useState(0);    // optimistic delta\n  const [fail, setFail] = React.useState(false);\n  const [msg, setMsg] = React.useState('');\n\n  async function like() {\n    setPendingInc((p) => p + 1);          // addOptimistic(1)\n    setMsg('');\n    try {\n      const fresh = await likePostOnServer(fail);\n      setLikes(fresh);\n    } catch (e) {\n      setMsg('Like failed - rolled back');\n    } finally {\n      setPendingInc((p) => p - 1);        // optimistic value discarded\n    }\n  }\n\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <button onClick={like}>Like ({likes + pendingInc})</button>\n      <label style={{ marginLeft: 12 }}>\n        <input type=\"checkbox\" checked={fail} onChange={(e) => setFail(e.target.checked)} /> Fail next request\n      </label>\n      <p>Confirmed on server: {likes}</p>\n      {msg && <p style={{ color: 'crimson' }}>{msg}</p>}\n    </div>\n  );\n}",
      },
      result: 'The button shows 11 immediately after a click; one second later "Confirmed on server" also becomes 11. With "Fail next request" ticked the count jumps to 11 and then returns to 10 with a red message.',
      explanation:
        'useOptimistic keeps a temporary value only while an action is in progress. When the action ends, React shows the real state again - either the new server value or, on failure, the old one. The simulation models this with a pending delta.',
    },
  ],
  interview: [
    { q: 'What is a Server Action in Next.js?', a: 'An async function marked with "use server" that runs only on the server. Next.js exposes it as an auto-generated POST endpoint, so a form or client component can call it directly without writing an API route. It is used for mutations such as creating, updating or deleting data.', level: 'Easy' },
    { q: 'What is the difference between "use server" and "use client"?', a: '"use client" marks a module boundary: that file and its imports are bundled for the browser (Client Components). "use server" marks functions (or all exports of a file) as Server Actions that can be called from the client but execute on the server. "use server" is NOT the way to mark a Server Component - components are server by default.', level: 'Medium' },
    { q: 'When would you use a Route Handler instead of a Server Action?', a: 'When an external client needs a public HTTP API (mobile app, webhook from Stripe, third-party integration), when you need GET responses, custom headers/status codes, or non-form data formats. Server Actions are best for mutations triggered from your own Next.js UI.', level: 'Medium' },
    { q: 'How does useActionState work and what is its signature?', a: 'const [state, formAction, isPending] = useActionState(action, initialState). The action is called as action(prevState, formData) and whatever it returns becomes the new state. You pass formAction to <form action>. It is used to show validation errors or success messages returned from the server.', level: 'Medium' },
    { q: 'Why does useFormStatus return pending: false when called in the component that renders the form?', a: 'useFormStatus reads the status of the parent <form> in the tree. The component that renders the <form> is outside (above) it, so there is no parent form. Put the hook in a child component like <SubmitButton /> rendered inside the form.', level: 'Medium' },
    { q: 'What does revalidatePath do after a mutation?', a: 'It invalidates the cached data and render output for a path. Inside a Server Action, Next.js also re-renders the current route and sends the fresh UI in the same response, so the user sees updated data without a full reload.', level: 'Easy' },
    { q: 'Why must redirect() not be inside a try/catch block?', a: 'redirect() works by throwing a special NEXT_REDIRECT error that Next.js catches to perform navigation. A surrounding try/catch would swallow it and the redirect would never happen. Call it after the try/catch (or rethrow with unstable_rethrow).', level: 'Hard' },
    { q: 'Are Server Actions secure by default?', a: 'Partially. Next.js allows only POST, checks the Origin against the Host to prevent CSRF, encrypts action IDs and removes unused actions. But every action is still a public endpoint: you must authenticate the user, authorize access to the record and validate all inputs inside the action.', level: 'Hard' },
    { q: 'What is progressive enhancement in the context of Server Actions?', a: 'A <form action={serverAction}> in a Server Component works even if JavaScript has not loaded or is disabled: the browser submits a normal POST. Once JS hydrates, Next.js intercepts the submit and does it without a full page reload.', level: 'Medium' },
    { q: 'How do you pass an id to a Server Action used by a form?', a: 'Use bind: const deleteWithId = deleteTodo.bind(null, todo.id); <form action={deleteWithId}>. The action signature becomes deleteTodo(id, formData). A hidden input also works but bind keeps the value out of the visible form fields and is encoded by Next.js.', level: 'Medium' },
    { q: 'What is useOptimistic used for?', a: 'To show the expected result of an action immediately (e.g. a new message or like) while the server request is in flight. It returns [optimisticState, addOptimistic]. When the action completes, React replaces the optimistic value with the real state, or reverts it on failure.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Build a todo page with an inline Server Action that adds a todo and revalidates the page.',
      hint: 'Server Component page, async function with "use server" inside, revalidatePath("/todos").',
      solution:
        "// app/todos/page.js\nimport { revalidatePath } from 'next/cache';\nimport { db } from '@/lib/db';\n\nexport default async function TodosPage() {\n  const todos = await db.todo.findMany();\n\n  async function addTodo(formData) {\n    'use server';\n    const title = String(formData.get('title') ?? '').trim();\n    if (!title) return;\n    await db.todo.create({ data: { title, done: false } });\n    revalidatePath('/todos');\n  }\n\n  return (\n    <main>\n      <form action={addTodo}>\n        <input name=\"title\" required />\n        <button>Add</button>\n      </form>\n      <ul>{todos.map((t) => <li key={t.id}>{t.title}</li>)}</ul>\n    </main>\n  );\n}",
    },
    {
      task: 'Add a Delete button for each todo using .bind() to pass the id.',
      hint: 'Export deleteTodo(id) from app/todos/actions.js; bind it per item.',
      solution:
        "// app/todos/actions.js\n'use server';\nimport { revalidatePath } from 'next/cache';\nimport { db } from '@/lib/db';\n\nexport async function deleteTodo(id) {\n  await db.todo.delete({ where: { id } });\n  revalidatePath('/todos');\n}\n\n// inside the list in app/todos/page.js\nimport { deleteTodo } from './actions';\n// ...\n{todos.map((t) => (\n  <li key={t.id}>\n    {t.title}\n    <form action={deleteTodo.bind(null, t.id)} style={{ display: 'inline' }}>\n      <button>Delete</button>\n    </form>\n  </li>\n))}",
    },
    {
      task: 'Create a contact form that validates name (min 2) and message (min 10) with zod and shows field errors using useActionState.',
      hint: 'Action signature (prevState, formData); return { errors } or { success: true }.',
      solution:
        "// app/contact/actions.js\n'use server';\nimport { z } from 'zod';\n\nconst Schema = z.object({\n  name: z.string().trim().min(2, 'Name is too short'),\n  message: z.string().trim().min(10, 'Message must be 10+ characters'),\n});\n\nexport async function sendContact(prev, formData) {\n  const parsed = Schema.safeParse(Object.fromEntries(formData));\n  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, success: false };\n  await saveMessage(parsed.data);\n  return { errors: {}, success: true };\n}\n\n// app/contact/ContactForm.js\n'use client';\nimport { useActionState } from 'react';\nimport { sendContact } from './actions';\n\nexport default function ContactForm() {\n  const [state, action, pending] = useActionState(sendContact, { errors: {}, success: false });\n  if (state.success) return <p>Thanks! We will reply soon.</p>;\n  return (\n    <form action={action}>\n      <input name=\"name\" />\n      {state.errors.name && <p>{state.errors.name[0]}</p>}\n      <textarea name=\"message\" />\n      {state.errors.message && <p>{state.errors.message[0]}</p>}\n      <button disabled={pending}>Send</button>\n    </form>\n  );\n}",
    },
    {
      task: 'Create a reusable <SubmitButton> that shows "Please wait..." while pending, and use it in two different forms.',
      hint: 'useFormStatus from react-dom inside a "use client" component.',
      solution:
        "// components/SubmitButton.js\n'use client';\nimport { useFormStatus } from 'react-dom';\n\nexport default function SubmitButton({ label }) {\n  const { pending } = useFormStatus();\n  return <button disabled={pending}>{pending ? 'Please wait...' : label}</button>;\n}\n\n// usage in any form\n<form action={createProduct}>\n  <input name=\"name\" />\n  <SubmitButton label=\"Create product\" />\n</form>\n<form action={subscribe}>\n  <input name=\"email\" type=\"email\" />\n  <SubmitButton label=\"Subscribe\" />\n</form>",
    },
    {
      task: 'Write an action createPost that requires a logged-in user, creates the post, revalidates /posts and redirects to the new post.',
      hint: 'auth() from your Auth.js setup; redirect after revalidatePath, outside try/catch.',
      solution:
        "'use server';\nimport { auth } from '@/auth';\nimport { revalidatePath } from 'next/cache';\nimport { redirect } from 'next/navigation';\nimport { db } from '@/lib/db';\n\nexport async function createPost(prevState, formData) {\n  const session = await auth();\n  if (!session?.user) return { error: 'Please log in first' };\n\n  const title = String(formData.get('title') ?? '').trim();\n  if (title.length < 3) return { error: 'Title too short' };\n\n  let post;\n  try {\n    post = await db.post.create({ data: { title, authorId: session.user.id } });\n  } catch {\n    return { error: 'Database error, try again' };\n  }\n  revalidatePath('/posts');\n  redirect('/posts/' + post.id);   // outside try/catch\n}",
    },
  ],
  quiz: [
    { question: 'Which directive marks a function as a Server Action?', options: ['"use client"', '"use server"', '"use action"', '"server only"'], answer: 1, explanation: '"use server" at the top of a file or first line of an async function creates a Server Action.' },
    { question: 'Which HTTP method do Server Actions use?', options: ['GET', 'PUT', 'POST', 'Any method'], answer: 2, explanation: 'Server Actions are invoked only with POST, which is one reason they are meant for mutations.' },
    { question: 'With useActionState, what are the arguments the action receives?', options: ['(formData)', '(formData, prevState)', '(event)', '(prevState, formData)'], answer: 3, explanation: 'The previous state comes first and the FormData second.' },
    { question: 'Where must useFormStatus be called?', options: ['In a component rendered inside the <form>', 'In the Server Action', 'In layout.js', 'In middleware.js'], answer: 0, explanation: 'It reads the status of the parent form, so it must be in a child of the form.' },
    { question: 'What happens if redirect() is called inside a try block whose catch swallows errors?', options: ['It redirects twice', 'It works normally', 'The redirect is swallowed and does not happen', 'The page crashes on build'], answer: 2, explanation: 'redirect throws a special error; catching it prevents the navigation.' },
  ],
};
