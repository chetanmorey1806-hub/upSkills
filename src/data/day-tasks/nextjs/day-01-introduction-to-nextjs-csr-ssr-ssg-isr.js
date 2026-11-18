export default {
  lesson: 'day-01-introduction-to-nextjs-csr-ssr-ssg-isr',
  minutes: 25,
  intro: 'Practise the four rendering strategies (CSR, SSR, SSG, ISR), pick the right one for real pages and see stale-while-revalidate in action.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which statement best describes the relationship between **React** and **Next.js**?',
      options: [
        'Next.js is a replacement for React with its own component syntax',
        'React is a UI library; Next.js is a full framework built on top of React (routing, rendering, data fetching, APIs)',
        'Next.js is a CSS framework for React apps',
        'React runs only on the server and Next.js runs only in the browser',
      ],
      answer: 1,
      explain: 'React only gives you components and state. **Next.js** is a framework that uses React and adds file-based routing, server rendering (SSR/SSG/ISR), data fetching, Route Handlers, image/font optimisation and more. You still write normal React components in Next.js.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'An e-commerce site in Pune shows **product prices that change a few times a day**. The pages must be fast and SEO-friendly, and a price may be up to 10 minutes old. Which strategy fits best?',
      options: ['CSR: fetch everything in the browser', 'SSG: build once and never update until the next deploy', 'ISR: serve a static page and regenerate it in the background every 10 minutes', 'SSR on every single request'],
      answer: 2,
      explain: '**ISR** (Incremental Static Regeneration) gives static-page speed and SEO, but re-generates the page after the revalidate time (here 600 s). SSG would show old prices until the next deploy; SSR works but does unnecessary work on every request; CSR hurts SEO and first load.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are real **problems of pure Client-Side Rendering (CSR)** that SSR/SSG solve? (choose all that apply)',
      options: [
        'Search engines may see an almost empty HTML page',
        'The first meaningful paint waits for the JavaScript bundle to download and run',
        'Buttons cannot have click handlers',
        'Slow mobile phones do all the rendering work',
      ],
      answers: [0, 1, 3],
      explain: 'With pure CSR the server sends an empty `<div id="root">` and the browser must download, parse and run JavaScript before anything appears. That hurts **SEO** and **first load**, especially on slow phones. Click handlers work fine in CSR, so that option is false.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In the Next.js 15 App Router, complete the line that makes a page re-generate at most once every hour (ISR):\n\n`export const ______ = 3600;`',
      accept: ['revalidate'],
      explain: 'The route segment config `export const revalidate = 3600` tells Next.js to cache the page and regenerate it in the background after 3600 seconds. `revalidate = 0` would make it dynamic, and leaving it out keeps it fully static (SSG) when no dynamic APIs are used.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'This code simulates how **ISR** serves pages (revalidate = 60 seconds). Requests arrive at the times in the array. What is printed?',
      code: `let cached = { html: 'v1', at: 0 };
const revalidate = 60;
function request(t) {
  const stale = t - cached.at > revalidate;
  const served = cached.html;          // always serve what is cached
  if (stale) cached = { html: 'v' + (Number(cached.html.slice(1)) + 1), at: t };
  return served;
}
console.log([10, 50, 70, 80, 200].map(request).join(' '));`,
      expected: 'v1 v1 v1 v2 v2',
      explain: 'ISR is **stale-while-revalidate**: the request that finds a stale page (t=70) still receives the OLD page (v1) while a new version (v2) is generated in the background. The next request (t=80) gets v2. At t=200 v2 is stale, so it is served once more while v3 is built. The common mistake is to think the request at t=70 already gets v2.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write a function `chooseStrategy(page)` that recommends a rendering strategy. `page` has `seo` (boolean), `perUser` (boolean) and `changes` (`"never"`, `"hourly"` or `"every-request"`). Rules, checked in this order:\n1. not `seo` and `perUser` → `"CSR"`\n2. `changes === "every-request"` → `"SSR"`\n3. `changes === "never"` → `"SSG"`\n4. otherwise → `"ISR"`',
      example: { title: 'returning a string based on object fields', code: "function label(user) {\n  if (user.age < 18) return 'minor';\n  return user.city === 'Mumbai' ? 'local adult' : 'adult';\n}" },
      starter: 'function chooseStrategy(page) {\n  // TODO: apply the 4 rules in order\n}\n',
      solution: "function chooseStrategy(page) {\n  if (!page.seo && page.perUser) return 'CSR';\n  if (page.changes === 'every-request') return 'SSR';\n  if (page.changes === 'never') return 'SSG';\n  return 'ISR';\n}",
      tests: [
        { call: "chooseStrategy({ seo: false, perUser: true, changes: 'every-request' })", expect: 'CSR', msg: 'A private dashboard (no SEO, per user) should be CSR' },
        { call: "chooseStrategy({ seo: true, perUser: true, changes: 'every-request' })", expect: 'SSR' },
        { call: "chooseStrategy({ seo: true, perUser: false, changes: 'never' })", expect: 'SSG', msg: 'An About page that never changes should be SSG' },
        { call: "chooseStrategy({ seo: true, perUser: false, changes: 'hourly' })", expect: 'ISR', msg: 'A blog list that changes hourly should be ISR' },
      ],
      explain: 'Order matters: a private dashboard does not need SEO, so rendering in the browser (CSR) is fine. Data that must be fresh on every request needs SSR; content that never changes is best built once (SSG); content that changes sometimes gets ISR. In Next.js these map to `"use client"` + fetch, `cache: "no-store"`, the default static rendering and `revalidate`.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 6,
      q: 'Build a small **client-side rendered** component. `App` must first show `Loading...`, then in a `useEffect` set the courses `["Next.js", "React", "Node.js"]` into state and render them as `<li>` items inside a `<ul id="courses">`. When the list is shown, the `Loading...` text must be gone.',
      example: { title: 'loading state with useEffect', code: "function Profile() {\n  const [user, setUser] = React.useState(null);\n  React.useEffect(() => { setUser({ name: 'Ravi' }); }, []);\n  if (!user) return <p>Loading...</p>;\n  return <h2>{user.name}</h2>;\n}" },
      starter: "const { useState, useEffect } = React;\n\nfunction App() {\n  // TODO: state + useEffect\n  return <p>Loading...</p>;\n}\n",
      solution: "const { useState, useEffect } = React;\n\nfunction App() {\n  const [courses, setCourses] = useState(null);\n  useEffect(() => {\n    setCourses(['Next.js', 'React', 'Node.js']);\n  }, []);\n  if (!courses) return <p>Loading...</p>;\n  return (\n    <ul id=\"courses\">\n      {courses.map((c) => <li key={c}>{c}</li>)}\n    </ul>\n  );\n}",
      checks: [
        { sel: '#courses li', count: 3, msg: 'Render 3 <li> items inside <ul id="courses">' },
        { sel: '#courses li', index: 0, textEq: 'Next.js', msg: 'The first course must be "Next.js"' },
        { sel: 'p', notExists: true, msg: 'The "Loading..." paragraph must disappear after the data is set' },
      ],
      explain: 'This is exactly how **CSR** works: the first HTML shows only a loading state and the real content appears after JavaScript runs in the browser. A search-engine crawler that does not run JavaScript would only see "Loading...", which is why Next.js prefers rendering such lists on the server.',
    },
  ],
};
