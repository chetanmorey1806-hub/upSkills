export default {
  lesson: 'day-09-loading-ui-error-boundaries-not-found',
  minutes: 30,
  intro: 'Practise loading.js, error.js (with reset) and not-found.js, and work out which boundary catches which error.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which line must be at the top of every `error.js` file?',
      options: ["'use server'", "'use client'", "export const dynamic = 'error'", 'No directive is needed'],
      answer: 1,
      explain: "Error boundaries are React class-based features that run in the browser and receive a `reset` function to retry, so `error.js` **must be a Client Component** (`'use client'`). Forgetting it gives a build error.",
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which props does the component exported from `error.js` receive? (choose all that apply)',
      options: ['error', 'reset', 'params', 'children', 'retryCount'],
      answers: [0, 1],
      explain: '`error` is the thrown Error object (in production the message is hidden for server errors and you get a `digest`), and `reset()` re-renders the segment to try again. `children`, `params` and `retryCount` are not passed to an error boundary.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`app/dashboard/layout.js` throws an error. Which file catches it?',
      options: ['app/dashboard/error.js', 'app/error.js (the parent segment\'s boundary)', 'app/dashboard/not-found.js', 'app/dashboard/loading.js'],
      answer: 1,
      explain: "A segment's `error.js` wraps that segment's **page and children, but sits inside its layout**. So an error in `dashboard/layout.js` bubbles up to the parent `app/error.js`. Errors in the root layout need `app/global-error.js`.",
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Inside `app/products/[id]/page.js` the product is not in the database. Which function from `next/navigation` do you call to render the nearest `not-found.js`?',
      accept: ['notFound()', 'notFound', 'notFound();'],
      explain: '`notFound()` throws a special error that Next.js catches and renders `not-found.js` with a **404 status**. You do not need `return` before it because it throws. Returning a "not found" `<p>` yourself would send a 200 status, which is bad for SEO.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'This code imitates error boundaries with try/catch. The first line simulates an error in the dashboard **page**, the second an error in the dashboard **layout**. What is printed?',
      code: `function boundary(name, fn) {
  try { return fn(); } catch (e) { return name + ' caught: ' + e.message; }
}
const page = () => { throw new Error('DB down'); };
const layout = () => { throw new Error('Layout bug'); };

console.log(boundary('app/error.js', () => boundary('app/dashboard/error.js', page)));
console.log(boundary('app/error.js', () => { layout(); return boundary('app/dashboard/error.js', page); }));`,
      expected: 'app/dashboard/error.js caught: DB down\napp/error.js caught: Layout bug',
      explain: 'The nearest boundary **around** the failing code wins. The page is inside `dashboard/error.js`, so it catches "DB down". The layout runs outside its own segment\'s boundary, so "Layout bug" goes up to `app/error.js`.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 9,
      q: 'Build the **error + retry** flow that `error.js` gives you. The given `loadCourses(attempt)` fails on the first attempt and succeeds on the second.\n- Start with `attempt = 1` and load the courses in a `useEffect` that re-runs when `attempt` changes\n- On error show `<div role="alert">` with the error message and a `<button id="retry">Try again</button>` that increases `attempt` (like `reset()`)\n- On success show the courses as `<li>` items in `<ul id="list">`',
      example: { title: 'try/catch in an effect', code: "useEffect(() => {\n  try { setData(load()); setError(null); }\n  catch (e) { setError(e.message); }\n}, [page]);" },
      starter: "const { useState, useEffect } = React;\n\nfunction loadCourses(attempt) {\n  if (attempt === 1) throw new Error('Server is busy');\n  return ['Next.js', 'Prisma', 'Auth.js'];\n}\n\nfunction App() {\n  // TODO: attempt, courses and error state\n  return <p>Loading...</p>;\n}\n",
      solution: "const { useState, useEffect } = React;\n\nfunction loadCourses(attempt) {\n  if (attempt === 1) throw new Error('Server is busy');\n  return ['Next.js', 'Prisma', 'Auth.js'];\n}\n\nfunction App() {\n  const [attempt, setAttempt] = useState(1);\n  const [courses, setCourses] = useState(null);\n  const [error, setError] = useState(null);\n  useEffect(() => {\n    try {\n      setCourses(loadCourses(attempt));\n      setError(null);\n    } catch (e) {\n      setError(e.message);\n    }\n  }, [attempt]);\n  if (error) {\n    return (\n      <div role=\"alert\">\n        <p>{error}</p>\n        <button id=\"retry\" onClick={() => setAttempt(attempt + 1)}>Try again</button>\n      </div>\n    );\n  }\n  if (!courses) return <p>Loading...</p>;\n  return <ul id=\"list\">{courses.map((c) => <li key={c}>{c}</li>)}</ul>;\n}",
      actions: [{ click: '#retry' }],
      checks: [
        { sel: '#list li', count: 3, msg: 'After clicking "Try again" the 3 courses must be listed in <ul id="list">' },
        { sel: '[role="alert"]', notExists: true, msg: 'The error alert must disappear after a successful retry' },
      ],
      explain: "In Next.js the `error.js` UI shows the message and calls `reset()`, which re-renders the segment so the failing work runs again. The key idea is that the error state is **local to a segment**: the rest of the page (layouts, nav) keeps working.",
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `findBoundary(segments, file, EXISTING)` that returns the path of the nearest boundary file for a route. `segments` is an array like `["app", "dashboard", "settings"]` and `file` is e.g. `"loading.js"`. The Set `EXISTING` lists the files that exist. Search from the deepest folder up to `app` and return the first `folder/path/file` that exists, or `null`.',
      example: { title: 'walking up a path', code: "for (let i = parts.length; i > 0; i--) {\n  const dir = parts.slice(0, i).join('/');\n  console.log(dir); // a/b/c, a/b, a\n}" },
      starter: 'function findBoundary(segments, file, EXISTING) {\n  // TODO\n}\n',
      solution: "function findBoundary(segments, file, EXISTING) {\n  for (let i = segments.length; i > 0; i--) {\n    const path = segments.slice(0, i).join('/') + '/' + file;\n    if (EXISTING.has(path)) return path;\n  }\n  return null;\n}",
      tests: [
        { call: "findBoundary(['app', 'dashboard', 'settings'], 'loading.js', new Set(['app/loading.js', 'app/dashboard/loading.js']))", expect: 'app/dashboard/loading.js' },
        { call: "findBoundary(['app', 'shop', 'cart'], 'error.js', new Set(['app/error.js']))", expect: 'app/error.js' },
        { call: "findBoundary(['app', 'blog'], 'not-found.js', new Set(['app/blog/not-found.js', 'app/not-found.js']))", expect: 'app/blog/not-found.js' },
        { call: "findBoundary(['app', 'blog'], 'error.js', new Set())", expect: null },
      ],
      explain: 'Next.js uses the **closest** `loading.js` / `error.js` / `not-found.js` above the route, so you can place one generic boundary at `app/` and more specific ones deeper. Checking from the top down instead would always pick the root file.',
    },
  ],
};
