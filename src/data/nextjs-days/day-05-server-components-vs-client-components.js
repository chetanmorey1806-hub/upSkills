export default {
  id: 'day-05-server-components-vs-client-components',
  title: 'Server Components vs Client Components ("use client")',
  module: 'Module 1: Next.js Basics',
  day: 5,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'In the App Router every component is a React Server Component unless you mark a file with "use client". Learn what runs where, what each kind can and cannot do, how to pass data across the boundary, and how to compose them so the browser downloads as little JavaScript as possible.',
  objectives: [
    'Define React Server Components (RSC) and Client Components and where each executes',
    'Decide when a component needs "use client" (state, effects, event handlers, browser APIs)',
    'Pass serialisable props from Server to Client Components and avoid passing functions',
    'Use the children / slot pattern to render Server Components inside Client Components',
    'Protect server-only code with the server-only package and understand the RSC payload',
  ],
  theory: [
    {
      heading: 'Two kinds of components',
      content:
        '**Server Components** (the default in `app/`) run **only on the server** (at build time or per request). Their code is **never sent to the browser**. They can:\n- be `async` and `await` data directly (database, file system, fetch with secrets)\n- import heavy libraries (markdown parsers, date libraries) without adding to the browser bundle\n- read secrets like `process.env.DB_PASSWORD` safely\n\nThey **cannot** use `useState`, `useEffect`, `useContext`, event handlers like `onClick`, or browser APIs (`window`, `localStorage`).\n\n**Client Components** are files that start with the directive **`"use client"`**. They are pre-rendered to HTML on the server too, then their JavaScript is sent to the browser and **hydrated**, so they can be interactive: state, effects, handlers, browser APIs.\n\nAnalogy: a restaurant. Server Components are the kitchen: heavy equipment, secret recipes, customers never see it, only the plated food (HTML). Client Components are the waiter at your table: interactive, responds to you, but has to be physically present (shipped JS).',
      points: [
        'Server Component: fetch data, access backend, keep secrets, reduce bundle size',
        'Client Component: onClick/onChange, useState/useReducer, useEffect, browser APIs, custom hooks that use these, class components',
      ],
    },
    {
      heading: 'The "use client" directive and the boundary',
      content:
        '`"use client"` goes at the **very top of a file**, before imports. It declares a **boundary**: this file, and **every module it imports**, becomes part of the client bundle.\n\nSo you do not need "use client" in every interactive file; you need it at the **entry point** where server code hands over to client code. But put it as **low (leaf-ward) in the tree as possible**. If you mark your whole layout as client, everything below it ships JavaScript and loses server benefits.\n\nThere is also `"use server"`, but it is **not** the opposite of "use client": it marks **Server Actions** (functions callable from the client), covered on Day 11.\n\nAnalogy: "use client" is a door from the kitchen to the dining hall. Everything that walks through that door (imports) is now in the dining hall.',
      syntax:
        "'use client'; // must be the first line\n\nimport { useState } from 'react';\n\nexport default function LikeButton() {\n  const [likes, setLikes] = useState(0);\n  return <button onClick={() => setLikes(likes + 1)}>Like {likes}</button>;\n}",
      tip: 'Error "You\'re importing a component that needs useState. This React Hook only works in a Client Component" means you used a hook in a file without "use client". Either add the directive or move the interactive part into its own small client component.',
    },
    {
      heading: 'Passing data across the boundary',
      content:
        'A Server Component can render a Client Component and pass it **props**. Those props travel over the network inside the **RSC payload**, so they must be **serialisable**:\n- OK: strings, numbers, booleans, null, arrays, plain objects, Date, Map, Set, Promises, JSX (React elements), Server Actions\n- Not OK: ordinary functions (event handlers), class instances, Symbols\n\nSo `<Counter initial={5} />` is fine, but `<Button onClick={() => console.log(\'x\')} />` from a Server Component throws "Functions cannot be passed directly to Client Components".\n\nThe reverse direction does not work by import: a Client Component **cannot import** a Server Component (it would be pulled into the client bundle). Instead, pass Server Components to it as **`children` or other JSX props**: the server renders them first and the client only receives the result.',
      syntax:
        "// app/page.js (Server)\nimport Modal from './Modal';        // client\nimport Cart from './Cart';          // server\n\nexport default function Page() {\n  return (\n    <Modal title=\"Your cart\">\n      <Cart />   {/* rendered on the server, passed as children */}\n    </Modal>\n  );\n}",
    },
    {
      heading: 'What happens during a request (RSC payload)',
      content:
        '1. Next.js renders the Server Component tree on the server\n2. The result is the **RSC payload**: a compact description of the UI where Server Components are already resolved to elements, and Client Components appear as **references** ("put the LikeButton from chunk 123 here, with props {likes: 3}")\n3. The payload plus Client Component code is used to pre-render HTML for a fast first paint\n4. In the browser, the HTML shows immediately, then React **hydrates** only the Client Components\n5. On later navigations, only the RSC payload for the new route is fetched; no HTML\n\nResult: a blog post with a markdown parser (server) and one like button (client) sends the browser only the like button\'s JavaScript.',
    },
    {
      heading: 'Patterns and common mistakes',
      content:
        '- **Keep client components small and at the leaves**: a static navbar (server) containing a `SearchBox` (client)\n- **Wrap third-party client-only libraries**: many npm UI packages use hooks without "use client". Re-export them from your own file that starts with "use client"\n- **Context providers** use React context, so they must be client components. Create `app/providers.js` with "use client" and wrap `{children}` in the root layout; children can still be Server Components\n- **Protect server code**: `import \'server-only\'` at the top of `lib/db.js` makes the build fail if a client component imports it, so secrets never leak\n- Environment variables without the `NEXT_PUBLIC_` prefix are only available on the server; `NEXT_PUBLIC_*` values are inlined into the client bundle\n\nComing next (Day 6): styling Server and Client Components with global CSS, CSS Modules and Tailwind.',
      syntax:
        "// lib/db.js\nimport 'server-only';\nexport async function getUsers() {\n  // uses process.env.DATABASE_URL safely\n}",
    },
  ],
  examples: [
    {
      title: 'Product page: server data + small client button',
      scenario: 'A product page reads data on the server, but the "Add to cart" button must react to clicks.',
      steps: [
        'Create app/products/[id]/page.js as an async Server Component that fetches the product',
        'Create app/products/[id]/AddToCart.js starting with "use client"',
        'Pass only serialisable props (id, name, price) to AddToCart',
        'Run the playground simulation: the "server" part renders once, the client part keeps state',
      ],
      code: `// app/products/[id]/page.js  (Server Component - no directive)
import AddToCart from './AddToCart';

export default async function ProductPage({ params }) {
  const { id } = await params;
  const res = await fetch(\`https://dummyjson.com/products/\${id}\`);
  const product = await res.json();

  return (
    <main>
      <h1>{product.title}</h1>
      <p>{product.description}</p>
      <p>Rs {product.price}</p>
      <AddToCart id={product.id} name={product.title} price={product.price} />
    </main>
  );
}

// app/products/[id]/AddToCart.js  (Client Component)
'use client';
import { useState } from 'react';

export default function AddToCart({ id, name, price }) {
  const [qty, setQty] = useState(0);
  return (
    <div>
      <button onClick={() => setQty(qty + 1)}>Add {name} to cart</button>
      {qty > 0 && <p>{qty} in cart - Rs {qty * price}</p>}
    </div>
  );
}`,
      playground: {
        jsx: `// SIMULATION: plain React acting out the server/client split.
// "ServerProductPage" pretends to run on the server: it renders ONCE from data,
// and we show the RSC-like payload it would send. "AddToCart" is the client part.
const { useState, useRef } = React;

const DB = { 7: { id: 7, title: 'Wireless Mouse', description: 'Silent clicks, 2.4 GHz', price: 699 } };

function AddToCart({ id, name, price }) {
  const [qty, setQty] = useState(0);
  return (
    <div style={{ border: '2px solid orange', padding: 8 }}>
      <small>Client Component (JS shipped, hydrated)</small><br />
      <button onClick={() => setQty(qty + 1)}>Add {name} to cart</button>
      {qty > 0 && <p>{qty} in cart - Rs {qty * price}</p>}
    </div>
  );
}

function ServerProductPage({ id, renders }) {
  renders.current++;
  const product = DB[id]; // a real Server Component would await a DB / fetch here
  return (
    <main style={{ border: '2px solid #0070f3', padding: 8 }}>
      <small>Server Component (no JS shipped)</small>
      <h2>{product.title}</h2>
      <p>{product.description} - Rs {product.price}</p>
      <AddToCart id={product.id} name={product.title} price={product.price} />
    </main>
  );
}

function App() {
  const renders = useRef(0);
  const payload = { type: 'main', children: ['h2: Wireless Mouse', 'p: Silent clicks...', { clientRef: 'AddToCart#chunk-42', props: { id: 7, name: 'Wireless Mouse', price: 699 } }] };
  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }}>
      <ServerProductPage id={7} renders={renders} />
      <h4>What the browser receives (simplified RSC payload)</h4>
      <pre style={{ background: '#f4f4f4', padding: 8, fontSize: 12 }}>{JSON.stringify(payload, null, 2)}</pre>
    </div>
  );
}`,
      },
      result: 'The blue server box shows product data; the orange client box counts clicks. The payload shows that the client only receives a reference to AddToCart plus its serialisable props.',
      explanation:
        'Only the interactive part is a Client Component, so only its code ships to the browser. The product text is plain HTML from the server. Props passed across the boundary (id, name, price) are JSON-like values.',
    },
    {
      title: 'Why you cannot pass functions to a Client Component',
      scenario: 'A teammate passes onClick={() => ...} from a Server Component page and gets an error.',
      steps: [
        'Read the failing code and the error message',
        'Understand that props are serialised into the payload',
        'Move the handler inside the Client Component, or use a Server Action',
        'Run the playground to see which values survive serialisation',
      ],
      code: `// ❌ app/page.js (Server Component)
import Button from './Button'; // 'use client'
export default function Page() {
  return <Button onClick={() => console.log('hi')}>Hi</Button>;
}
// Error: Functions cannot be passed directly to Client Components
// unless you explicitly expose it by marking it with "use server".

// ✅ Fix 1: define the handler inside the client component
// app/Button.js
'use client';
export default function Button({ message, children }) {
  return <button onClick={() => alert(message)}>{children}</button>;
}
// app/page.js
<Button message="hi">Hi</Button>

// ✅ Fix 2: pass a Server Action (Day 11)
async function save() { 'use server'; /* write to DB */ }
<Button action={save}>Save</Button>`,
      playground: {
        jsx: `// SIMULATION of the serialisation check at the server -> client boundary.
const { useState } = React;

const CANDIDATES = {
  'string "Asha"': 'Asha',
  'number 42': 42,
  'array [1,2]': [1, 2],
  'plain object {a:1}': { a: 1 },
  'function () => {}': () => {},
  'class instance new Map-like': new (class Cart { constructor() { this.items = []; } })(),
};

function check(value) {
  if (typeof value === 'function') return 'ERROR: Functions cannot be passed directly to Client Components';
  if (value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype)
    return 'ERROR: Only plain objects can be passed to Client Components (got a class instance)';
  return 'OK -> ' + JSON.stringify(value);
}

function App() {
  const [key, setKey] = useState('string "Asha"');
  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }}>
      <h3>Can this prop cross the server -> client boundary?</h3>
      {Object.keys(CANDIDATES).map((k) => (
        <button key={k} onClick={() => setKey(k)} style={{ margin: 3, fontWeight: k === key ? 700 : 400 }}>{k}</button>
      ))}
      <p style={{ color: check(CANDIDATES[key]).startsWith('OK') ? 'green' : 'crimson' }}>{check(CANDIDATES[key])}</p>
    </div>
  );
}`,
      },
      result: 'Strings, numbers, arrays and plain objects show OK; the function and the class instance show the same errors Next.js reports.',
      explanation:
        'Props from Server to Client Components are serialised into the RSC payload. Functions have no serial form (except Server Actions, which become secure references), and class instances lose their prototype, so Next.js rejects them.',
    },
    {
      title: 'Server Components inside a Client Component via children',
      scenario: 'A collapsible panel (client, needs state) must contain a list of orders loaded from the database (server).',
      steps: [
        'Create Collapsible.js with "use client" that accepts children',
        'Create Orders.js as an async Server Component',
        'In the page, nest <Orders /> inside <Collapsible> as children',
        'Do NOT import Orders inside Collapsible',
      ],
      code: `// app/dashboard/Collapsible.js
'use client';
import { useState } from 'react';

export default function Collapsible({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <section>
      <button onClick={() => setOpen(!open)}>{open ? '▼' : '▶'} {title}</button>
      {open && children}
    </section>
  );
}

// app/dashboard/Orders.js  (Server Component)
import { getOrders } from '@/lib/db'; // 'server-only' inside

export default async function Orders() {
  const orders = await getOrders();
  return <ul>{orders.map((o) => <li key={o.id}>#{o.id} - Rs {o.total}</li>)}</ul>;
}

// app/dashboard/page.js
import Collapsible from './Collapsible';
import Orders from './Orders';

export default function Dashboard() {
  return (
    <Collapsible title="Recent orders">
      <Orders />
    </Collapsible>
  );
}`,
      result: 'The panel toggles in the browser, while the orders list is rendered on the server and its database code never reaches the client.',
      explanation:
        'The page (server) renders <Orders /> first, so Collapsible receives already-rendered elements as children. Collapsible only decides whether to show them. Importing Orders inside the client file would instead try to bundle it for the browser.',
    },
    {
      title: 'Context providers in the App Router',
      scenario: 'You need a theme context available to all client components.',
      steps: [
        'Create app/providers.js with "use client" and a ThemeContext provider',
        'Wrap {children} in the root layout with <Providers>',
        'Read the context with useContext in any client component',
        'Pages remain Server Components',
      ],
      code: `// app/providers.js
'use client';
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export default function Providers({ children }) {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// app/layout.js (Server Component)
import Providers from './providers';
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}

// app/_components/ThemeToggle.js
'use client';
import { useTheme } from '../providers';
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Theme: {theme}</button>;
}`,
      result: 'ThemeToggle anywhere in the app can read and change the theme; the pages themselves stay Server Components.',
      explanation:
        'createContext is not supported in Server Components, so the provider lives in a client file. Passing children through it keeps the rest of the tree on the server, the same children pattern as the previous example.',
    },
  ],
  interview: [
    { q: 'What are React Server Components?', a: 'Components that render only on the server (at build or request time). Their code is not sent to the browser, they can be async and access data sources and secrets directly, but they cannot use state, effects, event handlers or browser APIs. In the Next.js App Router they are the default.', level: 'Easy' },
    { q: 'When do you need "use client"?', a: 'When a component uses state or reducers, effects, context, event handlers, browser-only APIs (window, localStorage), custom hooks depending on those, or class components. Put the directive at the top of the file that forms the boundary.', level: 'Easy' },
    { q: 'Are Client Components rendered on the server?', a: 'Yes. They are pre-rendered to HTML on the server for the initial load, then hydrated in the browser. "Client" means their JavaScript is also shipped and they run in the browser, not that they skip SSR.', level: 'Medium' },
    { q: 'Does every interactive file need "use client"?', a: 'No. The directive marks a boundary; all modules imported by a client file are part of the client bundle automatically. You only need it in files that are imported from Server Components.', level: 'Medium' },
    { q: 'Can a Client Component import a Server Component?', a: 'No (it would turn it into a client component or fail if it uses server-only code). Instead, pass the Server Component as children or another JSX prop from a Server Component parent.', level: 'Hard' },
    { q: 'What props can be passed from a Server to a Client Component?', a: 'Serialisable values: primitives, arrays, plain objects, Date, Map, Set, typed arrays, Promises, React elements (JSX) and Server Actions. Not ordinary functions or class instances.', level: 'Medium' },
    { q: 'What is the RSC payload?', a: 'A compact binary/text representation of the rendered Server Component tree, containing rendered output of Server Components, placeholders referencing Client Component JS chunks, and the props passed to them. React uses it to build and update the DOM, and on navigation only the payload is fetched.', level: 'Hard' },
    { q: 'Is "use server" the opposite of "use client"?', a: 'No. "use server" marks Server Actions: async functions that run on the server but can be called from client code (forms, buttons). Server Components need no directive at all.', level: 'Medium' },
    { q: 'How do you stop server code (DB, secrets) from leaking into the client bundle?', a: 'Keep it in Server Components / server modules, add import "server-only" to those modules so the build errors if a client component imports them, and never prefix secret env vars with NEXT_PUBLIC_.', level: 'Medium' },
    { q: 'How do you use React Context in the App Router?', a: 'Create a provider component in a file with "use client" and render it in a (server) layout around {children}. Client components below can consume the context; Server Components cannot use context.', level: 'Medium' },
    { q: 'What are the benefits of Server Components for performance?', a: 'Less JavaScript in the browser (dependencies stay on the server), data fetching closer to the data source (fewer client-server waterfalls), streaming of HTML, and better caching of rendered output.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'A page shows a list of FAQs from an array and each FAQ can be expanded. Split it into a Server Component page and a Client Component FaqItem.',
      hint: 'Only the toggle needs state.',
      solution: `// app/faq/page.js
import FaqItem from './FaqItem';
const faqs = [
  { id: 1, q: 'Do you ship to Pune?', a: 'Yes, in 2 days.' },
  { id: 2, q: 'Can I return?', a: 'Within 7 days.' },
];
export default function FaqPage() {
  return <main>{faqs.map((f) => <FaqItem key={f.id} q={f.q} a={f.a} />)}</main>;
}

// app/faq/FaqItem.js
'use client';
import { useState } from 'react';
export default function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)}>{q}</button>
      {open && <p>{a}</p>}
    </div>
  );
}`,
    },
    {
      task: 'This file errors: "useState only works in Client Components". Fix it in the smallest way while keeping the data fetch on the server.\n\nexport default async function Page() {\n  const users = await fetch(\'https://jsonplaceholder.typicode.com/users\').then(r => r.json());\n  const [q, setQ] = useState(\'\');\n  ...filter users by q\n}',
      hint: 'Fetch in the server page, filter in a client child.',
      solution: `// app/users/page.js (Server)
import UserFilter from './UserFilter';
export default async function Page() {
  const users = await fetch('https://jsonplaceholder.typicode.com/users').then((r) => r.json());
  return <UserFilter users={users.map((u) => ({ id: u.id, name: u.name }))} />;
}

// app/users/UserFilter.js (Client)
'use client';
import { useState } from 'react';
export default function UserFilter({ users }) {
  const [q, setQ] = useState('');
  const list = users.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter" />
      <ul>{list.map((u) => <li key={u.id}>{u.name}</li>)}</ul>
    </>
  );
}`,
    },
    {
      task: 'Wrap a third-party carousel package "acme-carousel" (which uses hooks but has no "use client") so it can be used in a Server Component page.',
      hint: 'Re-export from a client file.',
      solution: `// app/_components/Carousel.js
'use client';
import { Carousel } from 'acme-carousel';
export default Carousel;

// app/page.js (Server)
import Carousel from './_components/Carousel';
export default function Home() {
  return <Carousel slides={['a.jpg', 'b.jpg']} />;
}`,
    },
    {
      task: 'Create lib/secrets.js that reads process.env.PAYMENT_KEY and guarantees it can never be imported from a Client Component.',
      hint: 'npm install server-only',
      solution: `// npm install server-only
// lib/secrets.js
import 'server-only';

export function getPaymentKey() {
  return process.env.PAYMENT_KEY; // no NEXT_PUBLIC_ prefix -> server only
}
// Importing this from a 'use client' file fails the build with:
// "This module cannot be imported from a Client Component module."`,
    },
  ],
  quiz: [
    { question: 'In the App Router, components are by default...', options: ['Client Components', 'Server Components', 'Static HTML only', 'Web Components'], answer: 1, explanation: 'Server Components are the default; "use client" opts in to client.' },
    { question: 'Which feature requires a Client Component?', options: ['Awaiting a fetch', 'Reading process.env.DB_URL', 'onClick handler with useState', 'Rendering a list from props'], answer: 2, explanation: 'Event handlers and state need the browser.' },
    { question: 'Where must "use client" be written?', options: ['At the top of the file, before imports', 'Inside the component body', 'In next.config.mjs', 'In package.json'], answer: 0, explanation: 'Directives must be the first statement of the module.' },
    { question: 'Which prop CANNOT be passed from a Server Component to a Client Component?', options: ['{ id: 1 }', '"hello"', '[1, 2, 3]', '() => alert("hi")'], answer: 3, explanation: 'Regular functions are not serialisable.' },
    { question: 'How do you render a Server Component inside a Client Component?', options: ['Import it inside the client file', 'Pass it as children from a Server Component parent', 'Add "use server" to it', 'It is impossible'], answer: 1, explanation: 'The children/slot pattern keeps it rendered on the server.' },
  ],
};
