export default {
  id: 'day-04-navigation-link-userouter-dynamic-routes-route-groups',
  title: 'Navigation: Link, useRouter, usePathname; Dynamic Routes and Route Groups',
  module: 'Module 1: Next.js Basics',
  day: 4,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Move between pages without full reloads using <Link>, navigate from code with useRouter, highlight the active link with usePathname, build URL patterns like /blog/[slug] and /docs/[...slug], and organise routes with route groups that do not appear in the URL.',
  objectives: [
    'Use next/link for client-side navigation and understand prefetching',
    'Navigate programmatically with useRouter (push, replace, back, refresh) and read the URL with usePathname and useSearchParams',
    'Create dynamic segments [id], catch-all [...slug] and optional catch-all [[...slug]] routes',
    'Pre-render dynamic routes with generateStaticParams',
    'Use route groups (folder) to share layouts without changing URLs',
  ],
  theory: [
    {
      heading: 'The Link component',
      content:
        '`<Link>` from `next/link` is the primary way to navigate. It renders a normal `<a href>` (good for SEO and accessibility) but intercepts the click and performs **client-side navigation**: no full page reload, layouts stay mounted, only the changed segments are fetched.\n\n**Prefetching**: in production, when a `<Link>` scrolls into the viewport, Next.js prefetches the route in the background, so the click feels instant. Static routes are prefetched fully; dynamic routes are prefetched down to the nearest `loading.js`.\n\nUseful props:\n- `href` → string `\'/about\'` or object `{ pathname: \'/shop\', query: { sort: \'price\' } }`\n- `replace` → replace the history entry instead of pushing\n- `scroll={false}` → do not scroll to top\n- `prefetch={false}` → disable prefetching\n\nAnalogy: a plain `<a>` is taking a new taxi for every trip. `<Link>` is a metro on a fixed line that is already waiting at the platform.',
      syntax:
        "import Link from 'next/link';\n\n<Link href=\"/about\">About</Link>\n<Link href={{ pathname: '/shop', query: { sort: 'price' } }}>Cheapest first</Link>\n<Link href={`/blog/${post.slug}`}>{post.title}</Link>",
      tip: 'Use <a> only for external links (other websites). For internal pages always use <Link>, otherwise every click reloads the whole app and loses layout state.',
    },
    {
      heading: 'useRouter, usePathname and useSearchParams',
      content:
        'These hooks come from **`next/navigation`** (not `next/router`, which is the old Pages Router package). Hooks only work in **Client Components**, so the file must start with `"use client"`.\n\n- `useRouter()` → `router.push(\'/x\')`, `router.replace(\'/x\')`, `router.back()`, `router.forward()`, `router.refresh()` (re-fetch Server Component data for the current route), `router.prefetch(\'/x\')`\n- `usePathname()` → current path string, e.g. `\'/blog/hello\'`. Perfect for highlighting the active nav link\n- `useSearchParams()` → read-only `URLSearchParams` for the query string: `searchParams.get(\'q\')`\n\nUse `router.push` after an action (e.g. after login, go to `/dashboard`). Prefer `<Link>` for anything the user clicks as a link.',
      syntax:
        "'use client';\nimport { useRouter, usePathname, useSearchParams } from 'next/navigation';\n\nexport default function Toolbar() {\n  const router = useRouter();\n  const pathname = usePathname();\n  const q = useSearchParams().get('q');\n  return <button onClick={() => router.push('/cart')}>Cart (from {pathname}, q={q})</button>;\n}",
    },
    {
      heading: 'Dynamic routes: [id], [...slug], [[...slug]]',
      content:
        'When you do not know segment values in advance (product ids, blog slugs), wrap the folder name in **square brackets**:\n- `app/blog/[slug]/page.js` → matches `/blog/hello`, `/blog/next-15`. `params` = `{ slug: \'hello\' }`\n- `app/shop/[category]/[id]/page.js` → `/shop/mobiles/42` → `{ category: \'mobiles\', id: \'42\' }`\n- **Catch-all** `app/docs/[...slug]/page.js` → `/docs/a`, `/docs/a/b/c` → `{ slug: [\'a\',\'b\',\'c\'] }` (does NOT match `/docs`)\n- **Optional catch-all** `app/docs/[[...slug]]/page.js` → also matches `/docs` with `slug` undefined\n\nParams are always **strings** (convert with `Number()`), and in Next.js 15 the `params` prop is a **Promise**: `const { slug } = await params;`\n\nStatic routes win over dynamic ones: `app/blog/new/page.js` is matched before `app/blog/[slug]/page.js` for `/blog/new`.',
      syntax:
        "// app/blog/[slug]/page.js\nexport default async function Post({ params }) {\n  const { slug } = await params;\n  return <h1>Post: {slug}</h1>;\n}",
    },
    {
      heading: 'generateStaticParams: pre-rendering dynamic routes',
      content:
        'By default a dynamic route is rendered on demand. If you know the list of values at build time (e.g. all blog slugs), export **`generateStaticParams`** to pre-render them as static HTML (SSG). Values not in the list are rendered on first request and then cached, unless you set `export const dynamicParams = false`, which makes unknown values return 404.',
      syntax:
        "// app/blog/[slug]/page.js\nexport async function generateStaticParams() {\n  const posts = await fetch('https://api.example.com/posts').then((r) => r.json());\n  return posts.map((p) => ({ slug: p.slug }));\n}\n\nexport const dynamicParams = false; // optional: 404 for unknown slugs",
    },
    {
      heading: 'Route groups: (folderName)',
      content:
        'A folder wrapped in **parentheses** is a **route group**. It organises files and can have its own layout, but its name is **not** part of the URL.\n\n```\napp/\n├── (marketing)/\n│   ├── layout.js      <- big hero header\n│   ├── page.js        <- /\n│   └── pricing/page.js <- /pricing\n└── (shop)/\n    ├── layout.js      <- shop header with cart\n    └── cart/page.js   <- /cart\n```\n\nUses:\n- Different layouts for different sections (marketing vs app vs auth) at the same URL level\n- Grouping by team or feature\n- Multiple root layouts (each group with its own `<html>`), e.g. a separate admin shell\n\nCareful: two groups must not resolve to the same URL (`(a)/about/page.js` and `(b)/about/page.js` is an error).\n\nAnalogy: route groups are coloured folders in a filing cabinet. The colour helps you organise, but the address written on the letter (URL) does not mention the colour.',
    },
  ],
  examples: [
    {
      title: 'Navbar with active link highlighting',
      scenario: 'The site header must highlight the current page.',
      steps: [
        'Create app/_components/NavBar.js with "use client" at the top',
        'Import Link and usePathname',
        'Compare pathname with each link href and add an active class',
        'Render <NavBar /> in app/layout.js',
        'Run the playground to see a simulated Link + usePathname',
      ],
      code: `// app/_components/NavBar.js
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-4">
      {links.map((l) => {
        const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={active ? 'font-bold text-blue-600' : ''}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}`,
      playground: {
        jsx: `// SIMULATION: a mini "next/link" + "usePathname" built with React context.
// Real Next.js gives you these from next/link and next/navigation.
const { useState, useContext, createContext } = React;
const RouterCtx = createContext(null);

function usePathname() { return useContext(RouterCtx).pathname; }
function useRouter() { return useContext(RouterCtx); }

function Link({ href, children, style }) {
  const router = useRouter();
  return (
    <a href={href} style={style}
       onClick={(e) => { e.preventDefault(); router.push(href); }}>{children}</a>
  );
}

const links = [{ href: '/', label: 'Home' }, { href: '/blog', label: 'Blog' }, { href: '/about', label: 'About' }];

function NavBar() {
  const pathname = usePathname();
  return (
    <nav style={{ display: 'flex', gap: 12, padding: 8, background: '#f3f3f3' }}>
      {links.map((l) => {
        const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
        return <Link key={l.href} href={l.href} style={{ fontWeight: active ? 700 : 400, color: active ? '#0070f3' : '#333' }}>{l.label}</Link>;
      })}
    </nav>
  );
}

function App() {
  const [history, setHistory] = useState(['/']);
  const pathname = history[history.length - 1];
  const router = {
    pathname,
    push: (p) => setHistory((h) => [...h, p]),
    back: () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h)),
  };
  return (
    <RouterCtx.Provider value={router}>
      <div style={{ fontFamily: 'system-ui', padding: 12 }}>
        <NavBar />
        <h2>Current page: {pathname}</h2>
        <button onClick={router.back}>router.back()</button>{' '}
        <button onClick={() => router.push('/blog/hello-nextjs')}>router.push('/blog/hello-nextjs')</button>
        <p><small>History stack: {history.join(' > ')}</small></p>
      </div>
    </RouterCtx.Provider>
  );
}`,
      },
      result: 'Clicking Blog makes it bold and blue without a page reload; pushing /blog/hello-nextjs keeps Blog active (startsWith); router.back() pops the history.',
      explanation:
        'Link renders a real anchor but prevents the default full reload and updates the router state instead. usePathname reads the current path from router context; the real hooks work the same way inside Next.js.',
    },
    {
      title: 'Blog with a dynamic [slug] route and generateStaticParams',
      scenario: 'Each blog post should have its own URL like /blog/intro-to-nextjs, pre-rendered at build time.',
      steps: [
        'Create app/blog/page.js that lists posts with Link',
        'Create app/blog/[slug]/page.js',
        'Await params and find the post',
        'Call notFound() if it does not exist',
        'Export generateStaticParams to pre-render all slugs',
      ],
      code: `// lib/posts.js
export const posts = [
  { slug: 'intro-to-nextjs', title: 'Intro to Next.js', body: 'Next.js is a React framework...' },
  { slug: 'app-router', title: 'The App Router', body: 'Folders are routes...' },
];

// app/blog/page.js
import Link from 'next/link';
import { posts } from '@/lib/posts';

export default function Blog() {
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.slug}><Link href={\`/blog/\${p.slug}\`}>{p.title}</Link></li>
      ))}
    </ul>
  );
}

// app/blog/[slug]/page.js
import { notFound } from 'next/navigation';
import { posts } from '@/lib/posts';

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}`,
      playground: {
        jsx: `// SIMULATION of dynamic route matching: [slug], [...slug] and [[...slug]].
const { useState } = React;

const ROUTES = [
  { file: 'app/blog/new/page.js', pattern: ['blog', 'new'] },
  { file: 'app/blog/[slug]/page.js', pattern: ['blog', '[slug]'] },
  { file: 'app/shop/[category]/[id]/page.js', pattern: ['shop', '[category]', '[id]'] },
  { file: 'app/docs/[...slug]/page.js', pattern: ['docs', '[...slug]'] },
  { file: 'app/help/[[...slug]]/page.js', pattern: ['help', '[[...slug]]'] },
];

function match(pattern, parts) {
  const params = {};
  for (let i = 0; i < pattern.length; i++) {
    const seg = pattern[i];
    if (seg.startsWith('[[...')) { const rest = parts.slice(i); if (rest.length) params[seg.slice(5, -2)] = rest; return params; }
    if (seg.startsWith('[...')) { const rest = parts.slice(i); if (!rest.length) return null; params[seg.slice(4, -1)] = rest; return params; }
    if (parts[i] === undefined) return null;
    if (seg.startsWith('[')) params[seg.slice(1, -1)] = parts[i];
    else if (seg !== parts[i]) return null;
  }
  return parts.length === pattern.length ? params : null;
}

function App() {
  const [url, setUrl] = useState('/blog/intro-to-nextjs');
  const parts = url.split('/').filter(Boolean);
  let found = null;
  for (const r of ROUTES) { const p = match(r.pattern, parts); if (p) { found = { ...r, params: p }; break; } }
  const samples = ['/blog/new', '/blog/intro-to-nextjs', '/shop/mobiles/42', '/docs/a/b/c', '/docs', '/help', '/help/billing/refunds'];
  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }}>
      <input value={url} onChange={(e) => setUrl(e.target.value)} style={{ width: 260, padding: 6 }} />
      <div>{samples.map((s) => <button key={s} onClick={() => setUrl(s)} style={{ margin: 2 }}>{s}</button>)}</div>
      {found
        ? <p>Matched <code>{found.file}</code><br />params = <code>{JSON.stringify(found.params)}</code></p>
        : <p style={{ color: 'crimson' }}>404 - no route matches</p>}
    </div>
  );
}`,
      },
      result: '/blog/new matches the static route first; /docs/a/b/c gives {"slug":["a","b","c"]}; /docs is a 404; /help matches the optional catch-all with params {}.',
      explanation:
        'Static segments take priority over dynamic ones. A catch-all needs at least one segment; an optional catch-all also matches zero segments. In real Next.js 15, params arrives as a Promise you await.',
    },
    {
      title: 'Programmatic navigation after a form submit',
      scenario: 'After a search form is submitted, send the user to /search?q=<term>.',
      steps: [
        'Create a Client Component SearchBox with "use client"',
        'Use useRouter from next/navigation',
        'On submit call router.push with the encoded query',
        'Read the query on the search page with await searchParams',
      ],
      code: `// app/_components/SearchBox.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBox() {
  const [term, setTerm] = useState('');
  const router = useRouter();
  function onSubmit(e) {
    e.preventDefault();
    router.push('/search?q=' + encodeURIComponent(term));
  }
  return (
    <form onSubmit={onSubmit}>
      <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search..." />
      <button>Go</button>
    </form>
  );
}

// app/search/page.js
export default async function SearchPage({ searchParams }) {
  const { q = '' } = await searchParams;
  return <h1>Results for "{q}"</h1>;
}`,
      result: 'Typing "laptop" and pressing Go navigates to /search?q=laptop without a full reload and shows Results for "laptop".',
      explanation:
        'useRouter().push performs the same client-side navigation as Link, but from code. encodeURIComponent keeps spaces and symbols safe in the URL.',
    },
    {
      title: 'Route groups for marketing and app sections',
      scenario: 'Marketing pages need a big hero header; the app pages need a sidebar. Both live at top-level URLs.',
      steps: [
        'Create app/(marketing)/layout.js and app/(app)/layout.js',
        'Move page.js and pricing/ into (marketing)',
        'Put dashboard/ and settings/ inside (app)',
        'Visit /pricing and /dashboard: different layouts, no group name in the URL',
      ],
      code: `app/
├── layout.js                  // root <html><body>
├── (marketing)/
│   ├── layout.js              // hero header + footer
│   ├── page.js                // /
│   └── pricing/page.js        // /pricing
└── (app)/
    ├── layout.js              // sidebar
    ├── dashboard/page.js      // /dashboard
    └── settings/page.js       // /settings

// app/(marketing)/layout.js
export default function MarketingLayout({ children }) {
  return (
    <>
      <header className="bg-black text-white p-10 text-3xl">Build faster with ShopKit</header>
      {children}
    </>
  );
}

// app/(app)/layout.js
export default function AppLayout({ children }) {
  return (
    <div className="flex">
      <aside className="w-56">Dashboard | Settings</aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}`,
      result: '/pricing shows the hero header; /dashboard shows the sidebar. Neither URL contains (marketing) or (app).',
      explanation: 'Parentheses opt a folder out of the URL path while still letting it own a layout. Navigating between groups swaps the group layouts.',
    },
  ],
  interview: [
    { q: 'Why use next/link instead of a normal <a> tag?', a: 'Link performs client-side navigation (no full reload), keeps shared layouts mounted with their state, and prefetches routes in the viewport in production so navigation is near-instant. It still renders an <a> so it stays crawlable and accessible.', level: 'Easy' },
    { q: 'Where do useRouter, usePathname and useSearchParams come from in the App Router?', a: 'From next/navigation. next/router is the Pages Router API and does not work in the app directory. These hooks only work in Client Components ("use client").', level: 'Easy' },
    { q: 'What does router.refresh() do?', a: 'It re-requests the current route\'s Server Components from the server and merges the new payload without losing client state (such as input values or scroll). Useful after a mutation when you want fresh server data.', level: 'Hard' },
    { q: 'Difference between router.push and router.replace?', a: 'push adds a new entry to the browser history (Back returns to the previous page). replace swaps the current entry, so Back skips it, e.g. after login you replace /login with /dashboard.', level: 'Medium' },
    { q: 'What is the difference between [slug], [...slug] and [[...slug]]?', a: '[slug] matches exactly one segment. [...slug] is catch-all: one or more segments as an array. [[...slug]] is optional catch-all: zero or more segments, so it also matches the parent path.', level: 'Medium' },
    { q: 'How do you read dynamic params in Next.js 15?', a: 'Page, layout and route handler params are a Promise: const { slug } = await params in a Server Component, or use(params) in a Client Component. In client components you can also use the useParams() hook.', level: 'Medium' },
    { q: 'What is generateStaticParams?', a: 'An exported async function in a dynamic route that returns an array of params objects. Next.js pre-renders those paths at build time (SSG). It replaces getStaticPaths from the Pages Router.', level: 'Medium' },
    { q: 'What does dynamicParams = false do?', a: 'It makes params not returned by generateStaticParams return a 404 instead of being rendered on demand.', level: 'Hard' },
    { q: 'What is a route group and why use one?', a: 'A folder wrapped in parentheses, e.g. (marketing). It is excluded from the URL but can contain a layout. Used to apply different layouts to sections at the same URL level, to organise code, or to create multiple root layouts.', level: 'Medium' },
    { q: 'If both app/blog/new/page.js and app/blog/[slug]/page.js exist, which handles /blog/new?', a: 'The static route app/blog/new/page.js. Static segments are matched before dynamic ones.', level: 'Easy' },
    { q: 'How does Link prefetching differ for static and dynamic routes?', a: 'In production, for static routes the whole route payload is prefetched. For dynamic routes only the shared layouts down to the first loading.js boundary are prefetched, so the loading UI can be shown instantly. Prefetching is disabled in development.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create /products/[id] that displays "Product #<id>" and a Link back to /products. Convert id to a number and show id * 10 as a fake price.',
      hint: 'Params are strings and a Promise.',
      solution: `// app/products/[id]/page.js
import Link from 'next/link';

export default async function ProductPage({ params }) {
  const { id } = await params;
  const price = Number(id) * 10;
  return (
    <main>
      <h1>Product #{id}</h1>
      <p>Price: Rs {price}</p>
      <Link href="/products">Back to products</Link>
    </main>
  );
}`,
    },
    {
      task: 'Build a docs route that handles /docs, /docs/setup and /docs/setup/windows, showing breadcrumbs from the segments.',
      hint: 'Optional catch-all.',
      solution: `// app/docs/[[...slug]]/page.js
export default async function Docs({ params }) {
  const { slug = [] } = await params;
  return (
    <main>
      <p>Docs {slug.map((s) => ' / ' + s).join('')}</p>
      <h1>{slug.length ? slug[slug.length - 1] : 'Documentation home'}</h1>
    </main>
  );
}`,
    },
    {
      task: 'Write a LogoutButton client component that clears a token from localStorage and replaces the current URL with /login.',
      hint: 'router.replace so Back does not return to a protected page.',
      solution: `'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button onClick={() => {
      localStorage.removeItem('token');
      router.replace('/login');
    }}>
      Logout
    </button>
  );
}`,
    },
    {
      task: 'Restructure an app so /login and /register use a centred card layout while /, /about use the normal site header. Write the folder tree and both layouts.',
      hint: 'Two route groups.',
      solution: `app/
├── layout.js
├── (site)/
│   ├── layout.js        // header
│   ├── page.js          // /
│   └── about/page.js    // /about
└── (auth)/
    ├── layout.js        // centred card
    ├── login/page.js    // /login
    └── register/page.js // /register

// app/(site)/layout.js
export default function SiteLayout({ children }) {
  return (<><header>My Site</header>{children}</>);
}

// app/(auth)/layout.js
export default function AuthLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>{children}</div>
    </div>
  );
}`,
    },
    {
      task: 'Add a "Sort by price" link on /shop that keeps the user on /shop and adds ?sort=price using the object form of href.',
      hint: '{ pathname, query }',
      solution: `import Link from 'next/link';

export default function ShopPage() {
  return (
    <Link href={{ pathname: '/shop', query: { sort: 'price' } }}>Sort by price</Link>
  );
}`,
    },
  ],
  quiz: [
    { question: 'Which import is correct for the App Router?', options: ["import { useRouter } from 'next/router'", "import { useRouter } from 'next/navigation'", "import { useRouter } from 'react-router-dom'", "import useRouter from 'next/link'"], answer: 1, explanation: 'next/navigation is the App Router package.' },
    { question: 'Which folder name matches /docs, /docs/a and /docs/a/b?', options: ['[slug]', '[...slug]', '[[...slug]]', '(slug)'], answer: 2, explanation: 'Optional catch-all matches zero or more segments.' },
    { question: 'app/(shop)/cart/page.js is served at which URL?', options: ['/cart', '/(shop)/cart', '/shop/cart', 'It is not routable'], answer: 0, explanation: 'Route groups are omitted from the URL.' },
    { question: 'Which hook returns the current path like "/blog/hello"?', options: ['useParams', 'useSearchParams', 'useRouter().path', 'usePathname'], answer: 3, explanation: 'usePathname returns the path string.' },
    { question: 'What does generateStaticParams do?', options: ['Validates params at runtime', 'Returns the params to pre-render at build time', 'Reads the query string', 'Creates API routes'], answer: 1, explanation: 'It lists dynamic paths to statically generate.' },
  ],
};
