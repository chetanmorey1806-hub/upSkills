export default {
  lesson: 'day-07-data-fetching-server-components-caching-revalidation',
  minutes: 30,
  intro: 'Choose the right fetch caching options, revalidate on demand, avoid waterfalls with Promise.all and see why request memoisation matters.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A list of Indian states never changes. Which `fetch` option stores the response in the Data Cache and reuses it until it is revalidated?',
      options: ["{ cache: 'no-store' }", "{ cache: 'force-cache' }", "{ next: { revalidate: 0 } }", 'No options (Next.js 15 default)'],
      answer: 1,
      explain: "`cache: 'force-cache'` looks in the Data Cache first and only fetches on a miss. In **Next.js 15 the default is NOT cached** (like `no-store`), which surprises people coming from Next.js 14 tutorials. `revalidate: 0` also means no caching.",
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the fetch so the course list is cached but refreshed at most every 10 minutes:\n\n`fetch(url, { next: { ________: 600 } })`',
      accept: ['revalidate'],
      explain: '`next: { revalidate: 600 }` is time-based revalidation (ISR at the fetch level): the cached response is used for 600 seconds, then refreshed in the background on the next request.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: "Product fetches use `next: { tags: ['products'] }`. After an admin adds a product in a Server Action, which call purges exactly those cache entries?",
      options: ["revalidatePath('products')", "revalidateTag('products')", "router.refresh('products')", "fetch.clear('products')"],
      answer: 1,
      explain: "`revalidateTag('products')` (from `next/cache`) invalidates every cached fetch labelled with that tag, on any page. `revalidatePath('/products')` takes a **URL path** and refreshes that route instead.",
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these make a route render **dynamically** (on every request)? (choose all that apply)',
      options: ["fetch(url, { cache: 'no-store' })", "export const dynamic = 'force-dynamic'", 'export const revalidate = 3600', "fetch(url, { cache: 'force-cache' })", 'Reading cookies with await cookies()'],
      answers: [0, 1, 4],
      explain: "`no-store`, `force-dynamic` and request-time APIs such as `cookies()` all force per-request rendering. `revalidate = 3600` and `force-cache` keep the page static (cached), refreshed only periodically or on demand.",
    },
    {
      type: 'output',
      mins: 2,
      q: 'Three independent fetches take 300 ms, 500 ms and 200 ms. This code calculates the total wait for a **waterfall** (one after another) vs **parallel** (`Promise.all`). What is printed?',
      code: `const times = [300, 500, 200];
const sequential = times.reduce((a, b) => a + b, 0);
const parallel = Math.max(...times);
console.log('sequential: ' + sequential + 'ms');
console.log('parallel: ' + parallel + 'ms');`,
      expected: 'sequential: 1000ms\nparallel: 500ms',
      explain: 'Awaiting fetches one by one adds the times together (a **waterfall**). Starting them all and awaiting `Promise.all` waits only for the slowest one. Use sequential awaits only when one request needs the result of another.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write `async function loadDashboard(api)` that calls `api.getUser()` and `api.getCourses()` **in parallel** (both return Promises) and returns `{ user, courses }`. The tests check that the second request starts before the first one finishes.',
      example: { title: 'Promise.all with destructuring', code: "const [a, b] = await Promise.all([getA(), getB()]);" },
      starter: 'async function loadDashboard(api) {\n  // TODO: no waterfall!\n}\n',
      solution: 'async function loadDashboard(api) {\n  const [user, courses] = await Promise.all([api.getUser(), api.getCourses()]);\n  return { user, courses };\n}',
      tests: [
        { call: "loadDashboard({ getUser: async () => ({ name: 'Asha' }), getCourses: async () => ['Next.js'] })", expect: { user: { name: 'Asha' }, courses: ['Next.js'] } },
        { call: '(async () => { let started = 0; const slow = () => { started++; return new Promise((r) => setTimeout(() => r(started), 50)); }; return loadDashboard({ getUser: slow, getCourses: slow }); })()', expect: { user: 2, courses: 2 }, msg: 'Both requests must be started before awaiting (use Promise.all, not two awaits in a row)' },
      ],
      explain: 'In a Server Component, `const user = await getUser(); const courses = await getCourses();` creates a waterfall. `Promise.all` starts both requests immediately. In the second test each request records how many requests had started when it finished: with a waterfall the user sees 1, in parallel both see 2.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Next.js memoises identical requests during one render. Write `createMemo(fetcher)` that returns a function `get(url)`: the first call for a URL calls `fetcher(url)` and stores the result; later calls with the same URL return the stored result **without** calling `fetcher` again.',
      example: { title: 'a cache with Map', code: "const cache = new Map();\nif (!cache.has(key)) cache.set(key, compute(key));\nreturn cache.get(key);" },
      starter: 'function createMemo(fetcher) {\n  // TODO\n  return (url) => fetcher(url);\n}\n',
      solution: 'function createMemo(fetcher) {\n  const cache = new Map();\n  return (url) => {\n    if (!cache.has(url)) cache.set(url, fetcher(url));\n    return cache.get(url);\n  };\n}',
      tests: [
        { call: "(() => { let calls = 0; const get = createMemo((u) => { calls++; return u.toUpperCase(); }); get('/api/user'); get('/api/user'); get('/api/courses'); return calls; })()", expect: 2, msg: 'fetcher must be called once per distinct URL' },
        { call: "(() => { const get = createMemo((u) => u + '!'); get('/a'); return get('/a'); })()", expect: '/a!' },
      ],
      explain: 'This is why you can call the same `fetch` (or a `cache()`-wrapped DB function) in the layout, the page and a component without worrying: only one real request is made per render. Storing the **Promise** (not the awaited value) also deduplicates calls that happen at the same time.',
    },
  ],
};
