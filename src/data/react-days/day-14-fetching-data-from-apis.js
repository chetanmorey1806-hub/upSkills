export default {
  id: 'day-14-fetching-data-from-apis',
  title: 'Fetching Data from APIs: Loading, Error and AbortController',
  module: 'Module 3: Hooks',
  day: 14,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Learn the standard pattern for loading data from a REST API in React: fetch inside useEffect, track loading and error states, re-fetch when inputs change, cancel outdated requests with AbortController to avoid race conditions, and send POST requests from event handlers.',
  objectives: [
    'Fetch JSON data inside useEffect with async/await',
    'Model loading, error and data states and render each one',
    'Re-fetch when a dependency (id, search query, page) changes',
    'Cancel requests with AbortController to prevent race conditions and leaks',
    'Send POST requests from event handlers and know when to use a data-fetching library',
  ],
  theory: [
    {
      heading: 'Where to fetch: useEffect (for now)',
      content:
        'Loading data when a component appears on screen is a side effect: it talks to an external system (a server). The basic pattern is to fetch inside `useEffect` and store the result in state.\n\nBecause the effect function cannot be `async`, define an async function **inside** the effect and call it.\n\nAnalogy: ordering food online. You place the order (fetch), see "Preparing..." (loading), then either your food arrives (data) or you get "Order failed" (error).',
      syntax: `useEffect(() => {
  async function load() {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    const data = await res.json();
    setUsers(data);
  }
  load();
}, []);`,
    },
    {
      heading: 'The three states: loading, error, data',
      content:
        'Every request can be in one of several states. Model them explicitly so the UI is never blank or misleading:\n\n1. **loading**: show a spinner or skeleton\n2. **error**: show a helpful message and a Retry button\n3. **success**: show the data (and an empty state if the list is empty)\n\n**Important**: `fetch` only rejects on network failure. An HTTP 404 or 500 still resolves! Always check `res.ok` and throw yourself.',
      syntax: `const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const res = await fetch(url);
if (!res.ok) throw new Error("HTTP " + res.status);`,
      tip: 'Use try / catch / finally: set loading false in finally so it runs for both success and error.',
    },
    {
      heading: 'Re-fetching when inputs change',
      content:
        'When the URL depends on props or state (a user id, a search term, a page number), add that value to the **dependency array**. React re-runs the effect, and therefore re-fetches, whenever it changes.',
      syntax: `useEffect(() => {
  fetch("https://jsonplaceholder.typicode.com/posts?userId=" + userId)
    .then(r => r.json())
    .then(setPosts);
}, [userId]);`,
    },
    {
      heading: 'Race conditions and AbortController',
      content:
        'Imagine a user clicks User 1, then quickly User 2. Two requests are in flight. If request 1 is slow and finishes **after** request 2, the screen shows User 1\'s posts while User 2 is selected. This is a **race condition**.\n\n`AbortController` is a browser API that can cancel a fetch. Create one in the effect, pass `controller.signal` to fetch, and call `controller.abort()` in the **cleanup**. When the dependency changes (or the component unmounts), the old request is cancelled and its promise rejects with an `AbortError`, which you should ignore.',
      syntax: `useEffect(() => {
  const controller = new AbortController();
  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error("HTTP " + res.status);
      setData(await res.json());
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  load();
  return () => controller.abort();
}, [url]);`,
      tip: 'This also fixes the StrictMode double-fetch in development: the first request is aborted by the cleanup.',
    },
    {
      heading: 'POST, PUT, DELETE: mutations belong in event handlers',
      content:
        'Creating or changing data happens because the user **did something** (submitted a form, clicked Delete). Put those requests in the **event handler**, not in an effect.\n\nSend JSON with method, headers and a stringified body.',
      syntax: `async function handleSubmit(e) {
  e.preventDefault();
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body, userId: 1 }),
  });
  const created = await res.json();   // { id: 101, ... }
}`,
    },
    {
      heading: 'Beyond useEffect: data-fetching libraries',
      content:
        'Hand-written fetching works but lacks caching, deduplication, background refetching, pagination helpers and retries. In production apps teams commonly use:\n\n- **TanStack Query (React Query)**: `useQuery({ queryKey: ["user", id], queryFn })`\n- **SWR** by Vercel\n- **RTK Query** (part of Redux Toolkit)\n- Framework loaders (React Router loaders, Next.js server components)\n\nLearn the manual pattern first: it explains what those libraries do for you, and interviewers ask about it.',
      tip: 'Coming next (Day 15): useRef for accessing DOM elements and storing mutable values without re-rendering.',
    },
  ],
  examples: [
    {
      title: 'Fetch a list of users with loading and error states',
      scenario: 'Load users from JSONPlaceholder when the component mounts, showing a loader, an error with retry, or the list.',
      steps: [
        'Create data, loading and error state',
        'Fetch inside useEffect with async/await and check res.ok',
        'Render a different UI for each state',
        'Click "Break URL" to see the error state, then Retry',
      ],
      code: `function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!res.ok) throw new Error("HTTP " + res.status);
        setUsers(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [broken, setBroken] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const url = "https://jsonplaceholder.typicode.com/" + (broken ? "userz" : "users");
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Server responded with " + res.status);
        setUsers(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [broken, attempt]);

  return (
    <div>
      <label><input type="checkbox" checked={broken} onChange={e => setBroken(e.target.checked)} /> Break URL (simulate 404)</label>
      {loading && <p className="muted">⏳ Loading users...</p>}
      {!loading && error && (
        <div className="error">
          ❌ {error} <button onClick={() => setAttempt(a => a + 1)}>Retry</button>
        </div>
      )}
      {!loading && !error && (
        <ul>
          {users.map(u => (
            <li key={u.id}><b>{u.name}</b> <span className="muted">{u.email}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.muted { color: #6b7280; font-size: .9rem; }
.error { background: #fef2f2; color: #991b1b; padding: 10px; border-radius: 8px; margin-top: 10px; }
li { margin: 4px 0; }`,
      },
      result: 'A loading message, then 10 users with emails. With "Break URL" checked an error "Server responded with 404" and a Retry button appear.',
      explanation:
        'fetch resolves even for a 404, so we check res.ok and throw. finally guarantees loading is turned off. The attempt counter in the deps lets Retry re-run the effect.',
    },
    {
      title: 'Re-fetch on change with AbortController (no race conditions)',
      scenario: 'Pick a user to see their posts. Rapid switching must never show the wrong user\'s posts.',
      steps: [
        'Keep userId in state; put it in the effect dependencies',
        'Create an AbortController in the effect and pass its signal to fetch',
        'Abort in the cleanup and ignore AbortError',
        'Click user buttons rapidly and see the cancelled count grow',
      ],
      code: `useEffect(() => {
  const controller = new AbortController();
  setLoading(true);
  fetch("https://jsonplaceholder.typicode.com/posts?userId=" + userId, { signal: controller.signal })
    .then(r => r.json())
    .then(data => { setPosts(data); setLoading(false); })
    .catch(err => { if (err.name !== "AbortError") { setError(err.message); setLoading(false); } });
  return () => controller.abort();
}, [userId]);`,
      playground: {
        jsx: `const { useState, useEffect } = React;

function App() {
  const [userId, setUserId] = useState(1);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aborted, setAborted] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // small artificial delay so you can click quickly and cause aborts
        await new Promise((r, reject) => {
          const t = setTimeout(r, 600);
          controller.signal.addEventListener("abort", () => { clearTimeout(t); reject(new DOMException("Aborted", "AbortError")); });
        });
        const res = await fetch("https://jsonplaceholder.typicode.com/posts?userId=" + userId, { signal: controller.signal });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        setPosts(data.slice(0, 4));
        setLoading(false);
      } catch (err) {
        if (err.name === "AbortError") {
          setAborted(a => a + 1);
        } else {
          setError(err.message);
          setLoading(false);
        }
      }
    }
    load();
    return () => controller.abort();
  }, [userId]);

  return (
    <div>
      {[1, 2, 3, 4, 5].map(id => (
        <button key={id} className={id === userId ? "on" : ""} onClick={() => setUserId(id)}>User {id}</button>
      ))}
      <p className="muted">Requests cancelled so far: {aborted}</p>
      {loading && <p>⏳ Loading posts of user {userId}...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <ol>{posts.map(p => <li key={p.id}><b>#{p.userId}</b> {p.title}</li>)}</ol>
      )}
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
button { margin: 3px; padding: 5px 10px; border: 1px solid #94a3b8; border-radius: 6px; background: #fff; cursor: pointer; }
button.on { background: #0ea5e9; color: #fff; border-color: #0ea5e9; }
.muted { color: #6b7280; font-size: .85rem; }
.error { color: #b91c1c; }
li { margin: 4px 0; }`,
      },
      result: 'Each user shows 4 post titles with a matching #userId. Clicking quickly increases the "cancelled" counter and the final list always belongs to the selected user.',
      explanation:
        'When userId changes, React runs the previous cleanup, which aborts the old request. Its promise rejects with AbortError, which we ignore, so only the latest request can update state. (The tiny delay is only for the demo.)',
    },
    {
      title: 'Debounced search against an API',
      scenario: 'Search posts by title as the user types, waiting 400 ms after typing stops and cancelling outdated requests.',
      steps: [
        'Keep query in state',
        'In an effect on [query], set a 400 ms timeout before fetching',
        'Cleanup clears the timeout and aborts the request',
        'Type "qui" and watch only one request fire after you pause',
      ],
      code: `useEffect(() => {
  if (!query.trim()) { setResults([]); return; }
  const controller = new AbortController();
  const timer = setTimeout(async () => {
    const res = await fetch(API + "?title_like=" + encodeURIComponent(query), { signal: controller.signal });
    setResults(await res.json());
  }, 400);
  return () => { clearTimeout(timer); controller.abort(); };
}, [query]);`,
      playground: {
        jsx: `const { useState, useEffect } = React;

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");
  const [requests, setRequests] = useState(0);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setStatus("idle"); return; }
    const controller = new AbortController();
    setStatus("typing");
    const timer = setTimeout(async () => {
      setStatus("loading");
      setRequests(r => r + 1);
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/posts", { signal: controller.signal });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const all = await res.json();
        const q = query.toLowerCase();
        setResults(all.filter(p => p.title.includes(q)).slice(0, 8));
        setStatus("done");
      } catch (err) {
        if (err.name !== "AbortError") setStatus("error: " + err.message);
      }
    }, 400);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  return (
    <div>
      <input autoFocus placeholder="Search post titles (try: qui, dolor)" value={query} onChange={e => setQuery(e.target.value)} />
      <p className="muted">Status: {status} · network requests sent: {requests}</p>
      {status === "done" && results.length === 0 && <p>No posts found.</p>}
      <ul>{results.map(p => <li key={p.id}>{p.title}</li>)}</ul>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
input { padding: 8px; width: 300px; }
.muted { color: #6b7280; font-size: .85rem; }
li { margin: 3px 0; }`,
      },
      result: 'While typing the status shows "typing"; 400 ms after you stop, one request is sent and up to 8 matching titles appear.',
      explanation:
        'Each keystroke changes query, so the previous effect is cleaned up: its timer is cleared before it fires. Only the last keystroke\'s timer survives, so one request is made. (JSONPlaceholder has no real search, so we filter on the client after fetching.)',
    },
    {
      title: 'POST request from a form submit',
      scenario: 'Create a new post by sending JSON to the API and show the server\'s response.',
      steps: [
        'Build a controlled form with title and body',
        'In handleSubmit, call fetch with method POST, headers and JSON body',
        'Disable the button while submitting; show the created object or an error',
      ],
      code: `async function handleSubmit(e) {
  e.preventDefault();
  setSubmitting(true);
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    setCreated(await res.json());
  } catch (err) {
    setError(err.message);
  } finally {
    setSubmitting(false);
  }
}`,
      playground: {
        jsx: `const { useState } = React;

function App() {
  const [form, setForm] = useState({ title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);
  const [error, setError] = useState(null);

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId: 1 }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      setCreated(await res.json());
      setForm({ title: "", body: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <input name="title" placeholder="Post title" value={form.title} onChange={change} required />
      <textarea name="body" rows={3} placeholder="Write something..." value={form.body} onChange={change} required />
      <button disabled={submitting}>{submitting ? "Publishing..." : "Publish"}</button>
      {error && <p className="error">{error}</p>}
      {created && (
        <div className="ok">
          ✅ Created post with id <b>{created.id}</b>
          <pre>{JSON.stringify(created, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.form { display: flex; flex-direction: column; gap: 8px; max-width: 340px; }
input, textarea { padding: 8px; }
.error { color: #b91c1c; }
.ok { background: #f0fdf4; padding: 8px; border-radius: 8px; }
pre { font-size: 12px; white-space: pre-wrap; }`,
      },
      result: 'After Publish, the button shows "Publishing..." and then the server response with id 101 is displayed.',
      explanation:
        'The POST runs in the submit handler because it is caused by a user action. JSON.stringify converts the object to a JSON string and the Content-Type header tells the server how to parse it. JSONPlaceholder fakes the creation and returns id 101.',
    },
  ],
  interview: [
    { q: 'How do you fetch data in a React function component?', a: 'Commonly inside useEffect: define an async function in the effect, call fetch, check res.ok, parse JSON and store it in state, while tracking loading and error. In production, libraries like TanStack Query or framework loaders are often used.', level: 'Easy' },
    { q: 'Why can\'t you pass an async function directly to useEffect?', a: 'An async function always returns a Promise, but useEffect expects the return value to be undefined or a cleanup function. Declare the async function inside and call it.', level: 'Medium' },
    { q: 'Does fetch reject on HTTP 404 or 500?', a: 'No. fetch only rejects on network errors or aborts. For HTTP errors it resolves with res.ok === false, so you must check res.ok (or res.status) and throw.', level: 'Medium' },
    { q: 'What is a race condition in data fetching and how do you prevent it?', a: 'When multiple requests are in flight and an older one finishes last, overwriting newer data. Prevent it by aborting the previous request with AbortController in the effect cleanup, or by using an "ignore" flag set in cleanup.', level: 'Hard' },
    { q: 'What is AbortController?', a: 'A browser API that creates a signal you pass to fetch. Calling controller.abort() cancels the request and makes the fetch promise reject with an AbortError.', level: 'Medium' },
    { q: 'Why does my API get called twice in development?', a: 'React 18 StrictMode mounts, unmounts and remounts components in development, so effects run twice. With proper cleanup (aborting the first request) it is harmless; it does not happen in production.', level: 'Medium' },
    { q: 'Should a POST request be made in useEffect?', a: 'Usually no. Mutations are triggered by user actions, so they belong in event handlers. Effects are for synchronising with external systems based on what is displayed.', level: 'Medium' },
    { q: 'What states should a data-fetching component handle?', a: 'Loading, error (with retry), empty data, and success. Optionally refetching/stale states.', level: 'Easy' },
    { q: 'What do libraries like React Query provide over manual fetching?', a: 'Caching, request deduplication, background refetching, stale-while-revalidate, retries, pagination/infinite queries, mutations with cache invalidation, and devtools.', level: 'Hard' },
    { q: 'How do you send JSON in a POST with fetch?', a: 'fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Fetch 5 todos from https://jsonplaceholder.typicode.com/todos?_limit=5 and display them with a ✅ or ⬜ depending on completed.',
      hint: 'Use the loading/error pattern.',
      solution: `function App() {
  const [todos, setTodos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  React.useEffect(() => {
    const controller = new AbortController();
    fetch("https://jsonplaceholder.typicode.com/todos?_limit=5", { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(data => { setTodos(data); setLoading(false); })
      .catch(err => { if (err.name !== "AbortError") { setError(err.message); setLoading(false); } });
    return () => controller.abort();
  }, []);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <ul>{todos.map(t => <li key={t.id}>{t.completed ? "✅" : "⬜"} {t.title}</li>)}</ul>;
}`,
    },
    {
      task: 'Show a single user\'s details by id with Previous/Next buttons (ids 1–10), re-fetching when the id changes.',
      hint: 'Put id in the dependency array.',
      solution: `function App() {
  const [id, setId] = React.useState(1);
  const [user, setUser] = React.useState(null);
  React.useEffect(() => {
    const controller = new AbortController();
    setUser(null);
    fetch("https://jsonplaceholder.typicode.com/users/" + id, { signal: controller.signal })
      .then(r => r.json())
      .then(setUser)
      .catch(err => { if (err.name !== "AbortError") console.error(err); });
    return () => controller.abort();
  }, [id]);
  return (
    <div>
      <button disabled={id === 1} onClick={() => setId(i => i - 1)}>Previous</button>
      <button disabled={id === 10} onClick={() => setId(i => i + 1)}>Next</button>
      {user ? <div><h3>{user.name}</h3><p>{user.email} · {user.address.city}</p></div> : <p>Loading user {id}...</p>}
    </div>
  );
}`,
    },
    {
      task: 'Build a "Load more" photo list: fetch 6 photos per page from /photos?_page=N&_limit=6 and append them.',
      hint: 'Keep page in state; append with setPhotos(p => [...p, ...data]).',
      solution: `function App() {
  const [page, setPage] = React.useState(1);
  const [photos, setPhotos] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch("https://jsonplaceholder.typicode.com/photos?_page=" + page + "&_limit=6", { signal: controller.signal })
      .then(r => r.json())
      .then(data => { setPhotos(p => [...p, ...data]); setLoading(false); })
      .catch(err => { if (err.name !== "AbortError") setLoading(false); });
    return () => controller.abort();
  }, [page]);
  return (
    <div>
      <ul>{photos.map(p => <li key={p.id}>{p.id}. {p.title}</li>)}</ul>
      <button disabled={loading} onClick={() => setPage(p => p + 1)}>{loading ? "Loading..." : "Load more"}</button>
    </div>
  );
}`,
    },
    {
      task: 'Add a Delete button to a list of posts that sends a DELETE request and removes the item from state on success.',
      hint: 'fetch(url + "/" + id, { method: "DELETE" }) inside the click handler.',
      solution: `function App() {
  const [posts, setPosts] = React.useState([]);
  React.useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts?_limit=5").then(r => r.json()).then(setPosts);
  }, []);
  async function remove(id) {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts/" + id, { method: "DELETE" });
    if (res.ok) setPosts(p => p.filter(x => x.id !== id));
  }
  return (
    <ul>
      {posts.map(p => (
        <li key={p.id}>{p.title} <button onClick={() => remove(p.id)}>Delete</button></li>
      ))}
    </ul>
  );
}`,
    },
  ],
  quiz: [
    { question: 'Where should you call fetch to load data when a component mounts (without a library)?', options: ['Directly in the component body', 'Inside useEffect', 'Inside useState', 'In the return statement'], answer: 1, explanation: 'Fetching is a side effect, so it goes in useEffect.' },
    { question: 'fetch returns a 404 response. What happens?', options: ['The promise rejects', 'The browser reloads', 'The promise resolves with res.ok false', 'React throws an error'], answer: 2, explanation: 'Only network failures reject; check res.ok.' },
    { question: 'How do you cancel an in-flight fetch?', options: ['clearTimeout(fetch)', 'fetch.cancel()', 'return false', 'AbortController.abort() with its signal passed to fetch'], answer: 3, explanation: 'Pass controller.signal and call controller.abort().' },
    { question: 'What error name should you ignore after aborting?', options: ['AbortError', 'TypeError', 'NetworkError', 'SyntaxError'], answer: 0, explanation: 'Aborted fetches reject with a DOMException named AbortError.' },
    { question: 'Where does a POST request for a submitted form belong?', options: ['useEffect with []', 'The form\'s submit event handler', 'The component body', 'A CSS file'], answer: 1, explanation: 'Mutations triggered by user actions go in event handlers.' },
  ],
};
