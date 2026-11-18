export default {
  lesson: 'day-04-navigation-link-userouter-dynamic-routes-route-groups',
  minutes: 30,
  intro: 'Practise Link and useRouter imports, dynamic and catch-all segments, route groups and active navigation links.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In the **App Router**, where do you import `useRouter` from?',
      options: ["'next/router'", "'next/navigation'", "'next/link'", "'react-router-dom'"],
      answer: 1,
      explain: "App Router hooks (`useRouter`, `usePathname`, `useSearchParams`) come from **`next/navigation`**. `next/router` is the old Pages Router API and throws an error in `app/`. Remember these hooks only work in Client Components (`'use client'`).",
    },
    {
      type: 'multi',
      mins: 2,
      q: 'The file `app/docs/[...slug]/page.js` exists (and no other docs page). Which URLs does it match? (choose all that apply)',
      options: ['/docs', '/docs/intro', '/docs/react/hooks', '/docs/a/b/c/d', '/doc/intro'],
      answers: [1, 2, 3],
      explain: 'A **catch-all** `[...slug]` matches one or more segments, giving `slug` as an array (`["react", "hooks"]`). It does NOT match `/docs` itself; for that you need the optional catch-all `[[...slug]]` or a separate `app/docs/page.js`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'The file is `app/(shop)/cart/page.js`. Which URL shows this page?',
      accept: ['/cart'],
      explain: 'Folders in parentheses are **route groups**: they organise files and can share a layout, but are left out of the URL. So `(shop)` disappears and the URL is `/cart`.',
    },
    {
      type: 'output',
      mins: 2,
      q: '`generateStaticParams` must return an array of params objects (values as strings). What does this code print?',
      code: `const products = [{ id: 1, name: 'Pen' }, { id: 2, name: 'Bag' }];

function generateStaticParams() {
  return products.map((p) => ({ id: String(p.id) }));
}

console.log(JSON.stringify(generateStaticParams()));`,
      expected: '[{"id":"1"},{"id":"2"}]',
      explain: 'For `app/products/[id]/page.js`, `generateStaticParams` tells Next.js which `id` values to pre-render at build time. Each object key must match the folder name `[id]` and the values must be **strings**, because URL segments are always strings.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: 'Write `matchRoute(pattern, url)` like the Next.js router:\n- `[name]` matches exactly one segment → `params.name` is a string\n- `[...name]` (only as the last segment) matches one or more segments → `params.name` is an array\n- other segments must be equal\n- return the params object, or `null` if it does not match',
      example: { title: 'comparing segments', code: "const a = '/blog/[slug]'.split('/').filter(Boolean);  // ['blog', '[slug]']\nconst b = '/blog/hello'.split('/').filter(Boolean);   // ['blog', 'hello']" },
      starter: 'function matchRoute(pattern, url) {\n  // TODO\n}\n',
      solution: "function matchRoute(pattern, url) {\n  const p = pattern.split('/').filter(Boolean);\n  const u = url.split('/').filter(Boolean);\n  const params = {};\n  for (let i = 0; i < p.length; i++) {\n    const seg = p[i];\n    if (seg.startsWith('[...')) {\n      const rest = u.slice(i);\n      if (!rest.length) return null;\n      params[seg.slice(4, -1)] = rest;\n      return params;\n    }\n    if (u[i] === undefined) return null;\n    if (seg.startsWith('[')) params[seg.slice(1, -1)] = u[i];\n    else if (seg !== u[i]) return null;\n  }\n  return u.length === p.length ? params : null;\n}",
      tests: [
        { call: "matchRoute('/products/[id]', '/products/42')", expect: { id: '42' } },
        { call: "matchRoute('/products/[id]', '/products')", expect: null, msg: '[id] needs a segment' },
        { call: "matchRoute('/products/[id]', '/products/42/reviews')", expect: null, msg: 'Extra segments do not match a single [id]' },
        { call: "matchRoute('/docs/[...slug]', '/docs/react/hooks')", expect: { slug: ['react', 'hooks'] } },
        { call: "matchRoute('/docs/[...slug]', '/docs')", expect: null, msg: 'A catch-all needs at least one segment' },
        { call: "matchRoute('/shop/[cat]/[item]', '/shop/books/42')", expect: { cat: 'books', item: '42' } },
        { call: "matchRoute('/about', '/contact')", expect: null },
      ],
      explain: 'Dynamic segments capture one piece of the URL; catch-all segments capture the rest as an array. Params are always **strings** (convert with `Number(id)` yourself). The usual bug is forgetting that extra segments must make a single `[id]` route fail.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 7,
      q: 'Build a client-side **nav bar with an active link** (like `usePathname`). Keep the current path in state (start at `/`). Render three `<button>`s with ids `home`, `courses`, `contact` (paths `/`, `/courses`, `/contact`). The button of the current path gets `className="active"`, and an `<h1 id="title">` shows the current path. The checks click **Courses**.',
      example: { title: 'active class with a condition', code: "<a className={pathname === '/blog' ? 'active' : ''} href=\"/blog\">Blog</a>" },
      starter: "const { useState } = React;\n\nfunction App() {\n  // TODO: path state, 3 buttons, active class, title\n  return <nav></nav>;\n}\n",
      solution: "const { useState } = React;\n\nconst links = [\n  { id: 'home', path: '/', label: 'Home' },\n  { id: 'courses', path: '/courses', label: 'Courses' },\n  { id: 'contact', path: '/contact', label: 'Contact' },\n];\n\nfunction App() {\n  const [path, setPath] = useState('/');\n  return (\n    <div>\n      <nav>\n        {links.map((l) => (\n          <button key={l.id} id={l.id} className={path === l.path ? 'active' : ''} onClick={() => setPath(l.path)}>\n            {l.label}\n          </button>\n        ))}\n      </nav>\n      <h1 id=\"title\">{path}</h1>\n    </div>\n  );\n}",
      actions: [{ click: '#courses' }],
      checks: [
        { sel: '#courses.active', count: 1, msg: 'After clicking, the Courses button must have class "active"' },
        { sel: '#home.active', notExists: true, msg: 'Home must no longer be active' },
        { sel: '#title', textEq: '/courses', msg: 'The <h1 id="title"> must show the current path /courses' },
      ],
      explain: "In Next.js you write `const pathname = usePathname()` in a `'use client'` component and compare it with each link's `href`. Clicking a `<Link>` changes the URL without a full reload, so the nav re-renders and the active class moves.",
    },
  ],
};
