export default {
  id: 'day-03-file-based-routing-pages-layouts-nested-layouts',
  title: 'File-based Routing, Pages, Layouts, Nested Layouts',
  module: 'Module 1: Next.js Basics',
  day: 3,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Learn how folders in app/ become URL segments, how page.js makes a segment public, and how layout.js files nest to share UI (headers, sidebars) that keeps its state while users navigate.',
  objectives: [
    'Map any folder structure in app/ to its URLs (including nested segments)',
    'Write pages and understand the props a page receives (params, searchParams as Promises in Next.js 15)',
    'Create the root layout and nested layouts, and explain how they wrap each other',
    'Explain why layouts preserve state and do not re-render on navigation',
    'Use templates, private folders (_folder) and colocation correctly',
  ],
  theory: [
    {
      heading: 'File-system routing: folders are URL segments',
      content:
        'In the App Router the **file system is the router**. Each folder inside `app/` is one **segment** of the URL path:\n- `app/page.js` → `/`\n- `app/blog/page.js` → `/blog`\n- `app/blog/archive/page.js` → `/blog/archive`\n- `app/dashboard/settings/profile/page.js` → `/dashboard/settings/profile`\n\nThe **route** is public only when the deepest folder contains `page.js`. A folder without `page.js` is just a path segment used for organisation or layouts.\n\nAnalogy: the folder tree is the building floor plan. A `page.js` is a door with a room number. A folder without `page.js` is a corridor: you walk through it, but nobody can be "at" it.',
      points: [
        'Folder names are URL-visible, so use lowercase-with-dashes: app/contact-us/page.js → /contact-us',
        'Only one page.js per folder',
        'Do not create both app/blog/page.js and app/blog/route.js: a segment is either a page or an API endpoint',
      ],
    },
    {
      heading: 'Pages',
      content:
        'A **page** is the default export of `page.js`. It is a React **Server Component** by default and can be `async`.\n\nPages receive two props:\n- `params` → values of dynamic segments (Day 4), e.g. `{ slug: \'hello\' }`\n- `searchParams` → the query string, e.g. `/shop?sort=price` → `{ sort: \'price\' }`\n\n**Next.js 15 change**: both are now **Promises**. You must `await` them in a Server Component (or use `React.use()` in a Client Component). Reading `searchParams` makes the page dynamic because the query string is only known at request time.',
      syntax:
        "// app/shop/page.js\nexport default async function Shop({ searchParams }) {\n  const { sort = 'name' } = await searchParams;\n  return <h1>Shop sorted by {sort}</h1>;\n}",
      tip: 'Upgrading code from Next.js 14? Old code that reads props.searchParams.sort directly will log a warning in 15. Always await.',
    },
    {
      heading: 'Layouts: shared UI that wraps pages',
      content:
        'A **layout** is UI shared by a segment and all its children: navbar, sidebar, footer. Export a default component from `layout.js` that accepts a `children` prop; Next.js passes the active page (or nested layout) as `children`.\n\n- The **root layout** `app/layout.js` is required and must contain `<html>` and `<body>`\n- Layouts can fetch data and be async, just like pages\n- A layout does **not** receive `searchParams` (it is shared by many URLs)\n\n**Key behaviour**: on navigation between sibling pages, the layout **does not re-render and keeps its state** (scroll position of a sidebar, an open menu, a form input in the header). Only the `children` part changes. This is called **partial rendering** and it makes navigation fast.\n\nAnalogy: a photo frame (layout) on your wall. You swap the photo (page) but the frame stays nailed in place.',
      syntax:
        "// app/dashboard/layout.js\nexport default function DashboardLayout({ children }) {\n  return (\n    <div style={{ display: 'flex' }}>\n      <aside>Sidebar: Overview | Orders | Settings</aside>\n      <section>{children}</section>\n    </div>\n  );\n}",
    },
    {
      heading: 'Nested layouts',
      content:
        'Layouts **nest automatically** following the folder tree. For the URL `/dashboard/settings`:\n\n```\napp/layout.js                 (RootLayout)\n└─ app/dashboard/layout.js    (DashboardLayout)\n   └─ app/dashboard/settings/layout.js (SettingsLayout, optional)\n      └─ app/dashboard/settings/page.js\n```\n\nRenders as `<RootLayout><DashboardLayout><SettingsLayout><SettingsPage/></SettingsLayout></DashboardLayout></RootLayout>`.\n\nRules:\n- Only the root layout has `<html>`/`<body>`; nested layouts return normal elements\n- A parent layout cannot read the child\'s params or pass props to children directly (use fetch with caching, or context in a client component)\n- Moving from `/dashboard/orders` to `/dashboard/settings` keeps both RootLayout and DashboardLayout mounted',
    },
    {
      heading: 'Templates, private folders and colocation',
      content:
        '**template.js** is like a layout but **re-mounts on every navigation** (new instance, state reset, effects run again). Use it for enter animations or logging each page view. Most of the time you want `layout.js`.\n\n**Private folders**: a folder that starts with an underscore, like `app/_components`, is excluded from routing completely. Good for helpers you keep inside `app/`.\n\n**Colocation**: any non-special file (`Button.js`, `utils.js`, `styles.module.css`) inside a route folder is not routable. Only `page.js` and `route.js` produce URLs.\n\nComing next (Day 4): linking between these pages with `<Link>`, dynamic routes like `/blog/[slug]`, and route groups `(marketing)`.',
      syntax:
        'app/\n├── _components/      <- private, never a route\n│   └── Navbar.js\n├── dashboard/\n│   ├── layout.js\n│   ├── template.js   <- re-mounts per navigation\n│   ├── Chart.js      <- colocated, not a route\n│   └── page.js',
    },
  ],
  examples: [
    {
      title: 'Building a dashboard with a nested layout',
      scenario: 'An admin area needs a sidebar that stays visible on /dashboard, /dashboard/orders and /dashboard/settings.',
      steps: [
        'Create app/dashboard/layout.js with a sidebar and {children}',
        'Create app/dashboard/page.js, app/dashboard/orders/page.js, app/dashboard/settings/page.js',
        'Run npm run dev and open /dashboard',
        'Navigate between the pages: the sidebar stays, only the right side changes',
        'Run the playground: type in the sidebar search box, then switch pages: the text stays (layout state preserved)',
      ],
      code: `app/
├── layout.js                 // Root: <html><body><header/>{children}</body></html>
├── page.js                   // /
└── dashboard/
    ├── layout.js             // sidebar + {children}
    ├── page.js               // /dashboard
    ├── orders/page.js        // /dashboard/orders
    └── settings/page.js      // /dashboard/settings

// app/dashboard/layout.js
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex gap-6">
      <aside className="w-48">
        <input placeholder="Search..." />
        <nav className="flex flex-col">
          <Link href="/dashboard">Overview</Link>
          <Link href="/dashboard/orders">Orders</Link>
          <Link href="/dashboard/settings">Settings</Link>
        </nav>
      </aside>
      <section className="flex-1">{children}</section>
    </div>
  );
}

// app/dashboard/orders/page.js
export default function Orders() {
  return <h2>Orders (42 pending)</h2>;
}`,
      playground: {
        jsx: `// SIMULATION: a tiny App-Router-like renderer in plain React.
// The "file system" is an object; layouts wrap pages exactly like Next.js nests them.
const { useState } = React;

function RootLayout({ children, go }) {
  return (
    <div style={{ fontFamily: 'system-ui', border: '2px solid #0070f3', padding: 8 }}>
      <header style={{ background: '#0070f3', color: '#fff', padding: 6 }}>
        RootLayout (app/layout.js) <button onClick={() => go('/')}>Home</button>{' '}
        <button onClick={() => go('/dashboard')}>Dashboard</button>
      </header>
      {children}
    </div>
  );
}

function DashboardLayout({ children, go }) {
  const [search, setSearch] = useState('');
  return (
    <div style={{ display: 'flex', gap: 10, border: '2px dashed orange', padding: 8, marginTop: 8 }}>
      <aside style={{ width: 160 }}>
        <small>DashboardLayout</small>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="type here, then navigate" />
        {['/dashboard', '/dashboard/orders', '/dashboard/settings'].map((p) => (
          <div key={p}><button onClick={() => go(p)}>{p.replace('/dashboard', '') || 'Overview'}</button></div>
        ))}
      </aside>
      <section style={{ flex: 1, border: '1px solid #aaa', padding: 8 }}>{children}</section>
    </div>
  );
}

const PAGES = {
  '/': { layouts: [], Page: () => <h2>Home page (app/page.js)</h2> },
  '/dashboard': { layouts: [DashboardLayout], Page: () => <h2>Overview (app/dashboard/page.js)</h2> },
  '/dashboard/orders': { layouts: [DashboardLayout], Page: () => <h2>Orders (app/dashboard/orders/page.js)</h2> },
  '/dashboard/settings': { layouts: [DashboardLayout], Page: () => <h2>Settings (app/dashboard/settings/page.js)</h2> },
};

function App() {
  const [path, setPath] = useState('/dashboard');
  const route = PAGES[path];
  // Wrap the page in its layouts from innermost to outermost, then in RootLayout.
  let tree = <route.Page />;
  for (let i = route.layouts.length - 1; i >= 0; i--) {
    const L = route.layouts[i];
    tree = <L go={setPath}>{tree}</L>;
  }
  return (
    <div>
      <p>URL: <code>{path}</code></p>
      <RootLayout go={setPath}>{tree}</RootLayout>
    </div>
  );
}`,
      },
      result:
        'The dashboard pages render inside the orange DashboardLayout inside the blue RootLayout. Text typed in the sidebar search box survives switching between Overview, Orders and Settings, but is lost when going Home (the dashboard layout unmounts).',
      explanation:
        'React keeps a component\'s state as long as it stays at the same position in the tree. Because the layout element is the same and only its children change, its state persists, which is exactly how Next.js layouts behave during client-side navigation.',
    },
    {
      title: 'Reading searchParams in a page (Next.js 15)',
      scenario: 'The /products page must sort by ?sort=price or ?sort=name.',
      steps: [
        'Create app/products/page.js as an async Server Component',
        'Await the searchParams prop',
        'Sort the array and render',
        'Visit /products?sort=price and /products?sort=name',
      ],
      code: `// app/products/page.js
const products = [
  { id: 1, name: 'Mouse', price: 499 },
  { id: 2, name: 'Keyboard', price: 1499 },
  { id: 3, name: 'Charger', price: 899 },
];

export default async function ProductsPage({ searchParams }) {
  const { sort = 'name' } = await searchParams; // Promise in Next.js 15
  const list = [...products].sort((a, b) =>
    sort === 'price' ? a.price - b.price : a.name.localeCompare(b.name)
  );
  return (
    <main>
      <h1>Products (sorted by {sort})</h1>
      <a href="?sort=name">Name</a> | <a href="?sort=price">Price</a>
      <ul>{list.map((p) => <li key={p.id}>{p.name} - Rs {p.price}</li>)}</ul>
    </main>
  );
}`,
      playground: {
        jsx: `// SIMULATION: plain React stand-in for a page that receives searchParams.
const { useState } = React;
const products = [
  { id: 1, name: 'Mouse', price: 499 },
  { id: 2, name: 'Keyboard', price: 1499 },
  { id: 3, name: 'Charger', price: 899 },
];

function ProductsPage({ searchParams }) {
  const sort = searchParams.sort || 'name';
  const list = [...products].sort((a, b) => sort === 'price' ? a.price - b.price : a.name.localeCompare(b.name));
  return <ul>{list.map((p) => <li key={p.id}>{p.name} - Rs {p.price}</li>)}</ul>;
}

function App() {
  const [query, setQuery] = useState('?sort=name');
  const searchParams = Object.fromEntries(new URLSearchParams(query));
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <p>URL: /products<b>{query}</b></p>
      <button onClick={() => setQuery('?sort=name')}>?sort=name</button>{' '}
      <button onClick={() => setQuery('?sort=price')}>?sort=price</button>
      <p>searchParams = <code>{JSON.stringify(searchParams)}</code></p>
      <ProductsPage searchParams={searchParams} />
    </div>
  );
}`,
      },
      result: '?sort=price lists Mouse, Charger, Keyboard; ?sort=name lists Charger, Keyboard, Mouse.',
      explanation:
        'Next.js parses the query string into the searchParams object. In Next.js 15 the prop is a Promise, so the real page awaits it; the simulation passes a plain object. Using searchParams makes the route dynamic.',
    },
    {
      title: 'layout.js vs template.js',
      scenario: 'You want a page-view counter to log on every navigation inside /blog, while the blog sidebar keeps its state.',
      steps: [
        'Keep the sidebar in app/blog/layout.js',
        'Create app/blog/template.js with a "use client" useEffect that logs the view',
        'Navigate between blog posts and watch the console: template effect runs each time',
      ],
      code: `// app/blog/layout.js  (persists)
export default function BlogLayout({ children }) {
  return (
    <div className="grid grid-cols-[200px_1fr]">
      <aside>Categories</aside>
      <div>{children}</div>
    </div>
  );
}

// app/blog/template.js (re-mounts on every navigation)
'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function BlogTemplate({ children }) {
  const pathname = usePathname();
  useEffect(() => {
    console.log('page view:', pathname);
  }, [pathname]);
  return <div className="animate-fade-in">{children}</div>;
}

// Render order: <BlogLayout><BlogTemplate key={route}><Page/></BlogTemplate></BlogLayout>`,
      result: 'Each navigation inside /blog logs a page view and replays the fade-in animation, while the layout sidebar keeps its state.',
      explanation:
        'Next.js renders the template with a unique key per route, so React treats it as a new component and remounts it. Layouts do not get a new key, so they persist.',
    },
    {
      title: 'Organising with private folders',
      scenario: 'You want helper components inside app/ without accidentally creating routes.',
      steps: [
        'Create app/_components/Navbar.js',
        'Import it into app/layout.js using the @ alias',
        'Try visiting /_components/Navbar: it returns 404',
      ],
      code: `// app/_components/Navbar.js
import Link from 'next/link';
export default function Navbar() {
  return (
    <nav>
      <Link href="/">Home</Link> | <Link href="/blog">Blog</Link> | <Link href="/dashboard">Dashboard</Link>
    </nav>
  );
}

// app/layout.js
import './globals.css';
import Navbar from '@/app/_components/Navbar';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}`,
      result: 'The navbar appears on every page and /_components/... is never a route.',
      explanation: 'Folders prefixed with _ are opted out of routing, which makes intent explicit and avoids future conflicts with special file names.',
    },
  ],
  interview: [
    { q: 'How does file-based routing work in the Next.js App Router?', a: 'Each folder in app/ is a URL segment. A segment becomes a publicly accessible route when it contains page.js (UI) or route.js (API). Nested folders create nested paths, e.g. app/blog/archive/page.js → /blog/archive.', level: 'Easy' },
    { q: 'What is the difference between a page and a layout?', a: 'A page is the unique UI for one route and makes it public. A layout is shared UI that wraps a segment and all its child routes via the children prop, and it persists (keeps state, does not re-render) across navigation between those children.', level: 'Easy' },
    { q: 'What must the root layout contain?', a: 'It must define <html> and <body> tags because Next.js does not generate them. It is required in every App Router project.', level: 'Easy' },
    { q: 'How do nested layouts compose?', a: 'Layouts in parent folders wrap layouts in child folders, which wrap the page. For /dashboard/settings: RootLayout > DashboardLayout > SettingsLayout (if any) > page.', level: 'Medium' },
    { q: 'Why do layouts preserve state?', a: 'On client navigation Next.js only re-renders the segments that changed (partial rendering). The layout stays at the same place in the React tree, so React keeps its state and DOM; only children are swapped.', level: 'Medium' },
    { q: 'What is the difference between layout.js and template.js?', a: 'Both wrap children, but a template gets a unique key per route so it re-mounts on every navigation: state resets and effects re-run. Use templates for per-page enter animations or effects that must run on each navigation.', level: 'Hard' },
    { q: 'What changed about params and searchParams in Next.js 15?', a: 'They are now Promises. In Server Components you await them; in Client Components you unwrap them with React.use(). Synchronous access is deprecated and logs a warning.', level: 'Medium' },
    { q: 'Can a layout read searchParams?', a: 'No. Layouts are shared between routes and do not re-render on navigation, so they do not receive searchParams. Read them in the page, or in a client component with useSearchParams().', level: 'Hard' },
    { q: 'What are private folders?', a: 'Folders whose name starts with an underscore (e.g. _components). They and all their subfolders are excluded from routing, so you can safely keep implementation files there.', level: 'Medium' },
    { q: 'Can a folder contain both page.js and route.js?', a: 'No. At the same route segment level a page and a route handler conflict. Put API endpoints in a separate path such as app/api/.../route.js.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write the folder tree for: /, /courses, /courses/react, /courses/nextjs, /account/profile, /account/orders with a shared layout for all /account pages.',
      hint: 'One layout.js inside account/.',
      solution: `app/
├── layout.js
├── page.js                      // /
├── courses/
│   ├── page.js                  // /courses
│   ├── react/page.js            // /courses/react
│   └── nextjs/page.js           // /courses/nextjs
└── account/
    ├── layout.js                // shared account sidebar
    ├── profile/page.js          // /account/profile
    └── orders/page.js           // /account/orders
(No account/page.js, so /account itself is a 404 unless you add one.)`,
    },
    {
      task: 'Write app/account/layout.js with a left menu (Profile, Orders) and a main area. Use plain <a> or Link.',
      hint: 'Accept { children }.',
      solution: `import Link from 'next/link';

export default function AccountLayout({ children }) {
  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <nav style={{ display: 'flex', flexDirection: 'column', minWidth: 140 }}>
        <Link href="/account/profile">Profile</Link>
        <Link href="/account/orders">Orders</Link>
      </nav>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}`,
    },
    {
      task: 'Create /search that shows "Results for: <q>" using ?q= from the URL, with a default of "everything".',
      hint: 'Await searchParams.',
      solution: `// app/search/page.js
export default async function Search({ searchParams }) {
  const { q = 'everything' } = await searchParams;
  return <h1>Results for: {q}</h1>;
}`,
    },
    {
      task: 'In plain React (playground style), build a mini router with a persistent Layout that has a click counter, and two pages. Prove that the counter keeps its value when switching pages.',
      hint: 'Keep Layout outside the page switch; pass the page as children.',
      solution: `const { useState } = React;
function Layout({ children, go }) {
  const [clicks, setClicks] = useState(0);
  return (
    <div style={{ padding: 12 }}>
      <button onClick={() => setClicks(clicks + 1)}>Layout clicks: {clicks}</button>{' '}
      <button onClick={() => go('a')}>Page A</button>
      <button onClick={() => go('b')}>Page B</button>
      <hr />{children}
    </div>
  );
}
function App() {
  const [page, setPage] = useState('a');
  return <Layout go={setPage}>{page === 'a' ? <h2>Page A</h2> : <h2>Page B</h2>}</Layout>;
}`,
    },
  ],
  quiz: [
    { question: 'Which file path creates the URL /blog/archive?', options: ['app/blog-archive/page.js', 'app/blog/archive.js', 'app/blog/archive/page.js', 'pages/blog/archive/layout.js'], answer: 2, explanation: 'Each folder is a segment; page.js makes it public.' },
    { question: 'What prop does a layout use to render the active page?', options: ['children', 'page', 'outlet', 'content'], answer: 0, explanation: 'Layouts receive the nested segment as children.' },
    { question: 'Which file re-mounts on every navigation?', options: ['layout.js', 'page.js of the parent', 'loading.js', 'template.js'], answer: 3, explanation: 'Templates get a unique key per route.' },
    { question: 'In Next.js 15, how do you read searchParams in a Server Component page?', options: ['props.searchParams.q directly', 'const { q } = await searchParams', 'useSearchParams() in the server', 'window.location.search'], answer: 1, explanation: 'searchParams is a Promise in Next.js 15.' },
    { question: 'Which folder is excluded from routing?', options: ['app/components', 'app/(shop)', 'app/_lib', 'app/api'], answer: 2, explanation: 'Underscore-prefixed private folders are not routable. (shop) is a route group, covered on Day 4.' },
  ],
};
