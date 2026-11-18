export default {
  id: 'day-10-route-handlers-rest-apis',
  title: 'Route Handlers (API routes) and REST APIs in Next.js',
  module: 'Module 2: Data & Rendering',
  day: 10,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Route Handlers let you build backend endpoints inside your Next.js app with a route.js file that exports functions named after HTTP methods. Learn REST design, reading request data (JSON body, query, params, headers, cookies), returning responses with status codes, dynamic API routes, caching and CORS, and when to use a Route Handler versus a Server Component or Server Action.',
  objectives: [
    'Create app/api/**/route.js files exporting GET, POST, PUT, PATCH, DELETE handlers',
    'Read the JSON body, query string, dynamic params (awaited in Next.js 15), headers and cookies',
    'Return JSON with correct status codes using Response.json / NextResponse.json',
    'Build a complete REST CRUD API for a resource and test it with curl / Postman / Thunder Client',
    'Understand caching of GET handlers in Next.js 15, CORS headers, and when NOT to use a Route Handler',
  ],
  theory: [
    {
      heading: 'What is a Route Handler?',
      content:
        'A **Route Handler** is a file named **`route.js`** inside `app/`. Instead of returning UI (like `page.js`), it handles raw HTTP requests and returns a **`Response`**. It is the App Router replacement for the old `pages/api/*` API routes.\n\n- `app/api/hello/route.js` → endpoint `/api/hello`\n- Export a function per HTTP method: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`\n- Calling a method you did not export returns **405 Method Not Allowed** automatically\n- They use the standard Web **`Request`** and **`Response`** APIs (the same ones as in the browser), plus Next.js helpers `NextRequest` / `NextResponse`\n- A folder cannot have both `page.js` and `route.js`; the `/api` prefix is just a convention that keeps them apart\n\nAnalogy: if pages are the restaurant\'s dining hall (for humans), route handlers are the takeaway window (for programs): mobile apps, webhooks, other services and your own client components order through it and receive JSON instead of a plated meal.',
      syntax:
        "// app/api/hello/route.js\nexport async function GET() {\n  return Response.json({ message: 'Hello from Next.js' });\n}",
    },
    {
      heading: 'REST basics in one page',
      content:
        '**REST** (Representational State Transfer) is a convention for designing APIs around **resources** (nouns) and **HTTP methods** (verbs):\n\n- `GET /api/products` → list (200)\n- `POST /api/products` → create (201 Created + the new item)\n- `GET /api/products/7` → one item (200, or 404)\n- `PUT /api/products/7` → replace entirely (200)\n- `PATCH /api/products/7` → update some fields (200)\n- `DELETE /api/products/7` → delete (204 No Content)\n\nCommon status codes: **200** OK, **201** Created, **204** No Content, **400** Bad Request (invalid input), **401** Unauthorized (not logged in), **403** Forbidden (logged in, not allowed), **404** Not Found, **405** Method Not Allowed, **409** Conflict, **500** Server Error.\n\nIn Next.js the **folder** decides the URL and the **exported function name** decides the method: `app/api/products/route.js` handles the collection, `app/api/products/[id]/route.js` handles one item.',
    },
    {
      heading: 'Reading the request',
      content:
        'Each handler receives `(request, context)`:\n- **JSON body**: `const body = await request.json();` (also `request.formData()`, `request.text()`)\n- **Query string**: `request.nextUrl.searchParams.get(\'q\')` with `NextRequest`, or `new URL(request.url).searchParams` with plain `Request`\n- **Dynamic params**: second argument `{ params }` — in Next.js 15 it is a **Promise**: `const { id } = await params;`\n- **Headers**: `request.headers.get(\'authorization\')` or `await headers()` from `next/headers`\n- **Cookies**: `request.cookies.get(\'token\')` (NextRequest) or `(await cookies()).get(\'token\')`\n\nAlways **validate** input: the body comes from the outside world. Check types and required fields (or use a schema library such as zod) and return **400** with a clear message.',
      syntax:
        "// app/api/products/[id]/route.js\nexport async function GET(request, { params }) {\n  const { id } = await params;              // Next.js 15: params is a Promise\n  const fields = request.nextUrl.searchParams.get('fields');\n  const auth = request.headers.get('authorization');\n  return Response.json({ id, fields, hasAuth: Boolean(auth) });\n}",
    },
    {
      heading: 'Returning responses',
      content:
        '- `Response.json(data, { status: 201 })` → JSON with a status (standard Web API)\n- `NextResponse.json(data, { status, headers })` → the same, plus helpers like `NextResponse.redirect(url)` and `response.cookies.set(...)`\n- `new Response(null, { status: 204 })` → empty body (204 must not have a body)\n- `new Response(csvText, { headers: { \'Content-Type\': \'text/csv\' } })` → any content type\n- `redirect(\'/login\')` from `next/navigation` also works inside handlers\n\nIf a handler throws, Next.js returns a 500. Catch expected errors and return a proper status instead.',
      syntax:
        "import { NextResponse } from 'next/server';\n\nexport async function POST(request) {\n  const { email } = await request.json();\n  if (!email) {\n    return NextResponse.json({ error: 'email is required' }, { status: 400 });\n  }\n  const res = NextResponse.json({ subscribed: email }, { status: 201 });\n  res.cookies.set('subscribed', '1', { httpOnly: true, path: '/' });\n  return res;\n}",
    },
    {
      heading: 'Caching, CORS and runtime',
      content:
        '**Caching (Next.js 15)**: `GET` handlers are **not cached by default** (in Next.js 14 they were static by default). To make a GET handler static, add `export const dynamic = \'force-static\'` (optionally with `export const revalidate = 60`). Other methods are never cached.\n\n**CORS**: requests from your own Next.js pages are same-origin and need nothing. If **another domain** (a mobile web app, a partner site) calls your API, add `Access-Control-Allow-*` headers and export an `OPTIONS` handler for preflight requests (or set headers in `next.config` / middleware).\n\n**Runtime**: handlers run on the Node.js runtime by default; `export const runtime = \'edge\'` runs them on the Edge runtime (Day 19).\n\n**Important — when NOT to use a Route Handler**:\n- To get data for your own pages: do **not** `fetch(\'/api/products\')` from a Server Component. Call the database / data function directly; going through HTTP adds a needless network hop (and relative URLs do not even work on the server)\n- For form submissions and mutations from your own UI: prefer **Server Actions** (Day 11)\n- **Use Route Handlers** for: public/external APIs, mobile app backends, webhooks (Stripe, Razorpay, GitHub), file downloads (CSV/PDF), OAuth callbacks, and data for Client Components that poll or fetch in the browser',
      tip: 'In Express you write app.get("/api/products/:id", ...). In Next.js the same route is the file app/api/products/[id]/route.js with export async function GET(request, { params }). Same REST ideas, file-based instead of code-based routing.',
    },
  ],
  examples: [
    {
      title: 'Complete products CRUD API with Route Handlers',
      scenario: 'Build a REST API for products: list with search, create with validation, read, update and delete one product.',
      steps: [
        'Create lib/products.js with an in-memory array (a database comes on Day 13)',
        'Create app/api/products/route.js exporting GET and POST',
        'Create app/api/products/[id]/route.js exporting GET, PATCH and DELETE',
        'Run npm run dev and test with curl (below) or Thunder Client / Postman',
        'Run the playground: the SAME handler code runs in the browser with real Request/Response objects and a simulated router',
      ],
      code: `// lib/products.js  (in-memory "database"; resets on server restart)
export let products = [
  { id: 1, name: 'Mouse', price: 499 },
  { id: 2, name: 'Keyboard', price: 1499 },
];
let nextId = 3;
export const newId = () => nextId++;
export const setProducts = (list) => { products = list; };

// app/api/products/route.js
import { products, newId } from '@/lib/products';

export async function GET(request) {
  const q = (request.nextUrl.searchParams.get('q') || '').toLowerCase();
  return Response.json(products.filter((p) => p.name.toLowerCase().includes(q)));
}

export async function POST(request) {
  const { name, price } = await request.json();
  if (!name || typeof price !== 'number') {
    return Response.json({ error: 'name and numeric price are required' }, { status: 400 });
  }
  const product = { id: newId(), name, price };
  products.push(product);
  return Response.json(product, { status: 201 });
}

// app/api/products/[id]/route.js
import { products, setProducts } from '@/lib/products';

export async function GET(request, { params }) {
  const { id } = await params;
  const product = products.find((p) => p.id === Number(id));
  if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });
  return Response.json(product);
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const product = products.find((p) => p.id === Number(id));
  if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });
  Object.assign(product, await request.json());
  return Response.json(product);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const before = products.length;
  setProducts(products.filter((p) => p.id !== Number(id)));
  if (products.length === before) return Response.json({ error: 'Product not found' }, { status: 404 });
  return new Response(null, { status: 204 });
}

// Test from a terminal
// curl http://localhost:3000/api/products
// curl -X POST http://localhost:3000/api/products -H "Content-Type: application/json" -d '{"name":"Monitor","price":8999}'
// curl -X PATCH http://localhost:3000/api/products/1 -H "Content-Type: application/json" -d '{"price":449}'
// curl -X DELETE http://localhost:3000/api/products/2 -i`,
      playground: {
        jsx: `// SIMULATION: Next.js route.js handlers running in the browser.
// The handler functions use the REAL Web Request/Response APIs exactly like in Next.js;
// only the router (which file handles which URL) is simulated here.
const { useState } = React;

let products = [{ id: 1, name: 'Mouse', price: 499 }, { id: 2, name: 'Keyboard', price: 1499 }];
let nextId = 3;

// ---- app/api/products/route.js ----
const productsRoute = {
  async GET(request) {
    const q = (new URL(request.url).searchParams.get('q') || '').toLowerCase();
    return Response.json(products.filter((p) => p.name.toLowerCase().includes(q)));
  },
  async POST(request) {
    const { name, price } = await request.json();
    if (!name || typeof price !== 'number') return Response.json({ error: 'name and numeric price are required' }, { status: 400 });
    const product = { id: nextId++, name, price };
    products.push(product);
    return Response.json(product, { status: 201 });
  },
};

// ---- app/api/products/[id]/route.js ----
const productIdRoute = {
  async GET(request, { params }) {
    const { id } = await params;
    const product = products.find((p) => p.id === Number(id));
    if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });
    return Response.json(product);
  },
  async PATCH(request, { params }) {
    const { id } = await params;
    const product = products.find((p) => p.id === Number(id));
    if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });
    Object.assign(product, await request.json());
    return Response.json(product);
  },
  async DELETE(request, { params }) {
    const { id } = await params;
    const before = products.length;
    products = products.filter((p) => p.id !== Number(id));
    if (products.length === before) return Response.json({ error: 'Product not found' }, { status: 404 });
    return new Response(null, { status: 204 });
  },
};

// ---- simulated App Router for route.js files ----
async function dispatch(method, url, body) {
  const path = new URL(url, 'http://localhost:3000').pathname;
  let mod = null, params = {};
  if (path === '/api/products') mod = productsRoute;
  const m = path.match(/^\\/api\\/products\\/([^/]+)$/);
  if (m) { mod = productIdRoute; params = { id: m[1] }; }
  if (!mod) return new Response('Not Found', { status: 404 });
  if (!mod[method]) return new Response(null, { status: 405 });   // method not exported
  const init = { method, headers: { 'Content-Type': 'application/json' } };
  if (body && method !== 'GET' && method !== 'DELETE') init.body = body;
  const request = new Request(new URL(url, 'http://localhost:3000'), init);
  return mod[method](request, { params: Promise.resolve(params) }); // params is a Promise in Next 15
}

const PRESETS = [
  ['GET', '/api/products', ''],
  ['POST', '/api/products', '{"name":"Monitor","price":8999}'],
  ['POST', '/api/products', '{"name":"Cable"}'],
  ['GET', '/api/products?q=key', ''],
  ['PATCH', '/api/products/1', '{"price":449}'],
  ['DELETE', '/api/products/2', ''],
  ['GET', '/api/products/2', ''],
  ['PUT', '/api/products/1', '{}'],
];

function App() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('/api/products');
  const [body, setBody] = useState('');
  const [res, setRes] = useState(null);

  async function send(m = method, u = url, b = body) {
    const r = await dispatch(m, u, b);
    const text = await r.text();
    setRes({ line: m + ' ' + u, status: r.status, text: text || '(empty body)' });
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((x) => <option key={x}>{x}</option>)}
        </select>
        <input value={url} onChange={(e) => setUrl(e.target.value)} style={{ flex: 1 }} />
        <button onClick={() => send()}>Send</button>
      </div>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder='JSON body, e.g. {"name":"Pen","price":20}' rows={2} style={{ width: '100%', marginTop: 6 }} />
      <div>{PRESETS.map(([m, u, b], i) => (
        <button key={i} style={{ margin: 2, fontSize: 12 }} onClick={() => { setMethod(m); setUrl(u); setBody(b); send(m, u, b); }}>{m} {u}</button>
      ))}</div>
      {res && (
        <pre style={{ background: '#111', color: '#0f0', padding: 8, whiteSpace: 'pre-wrap' }}>
          {res.line + ' -> ' + res.status + '\\n' + res.text}
        </pre>
      )}
    </div>
  );
}`,
      },
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

let products = [
  { id: 1, name: 'Mouse', price: 499 },
  { id: 2, name: 'Keyboard', price: 1499 },
];
let nextId = 3;

// Same endpoints as app/api/products/route.js and app/api/products/[id]/route.js
app.get('/api/products', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  res.json(products.filter((p) => p.name.toLowerCase().includes(q)));
});

app.post('/api/products', (req, res) => {
  const { name, price } = req.body;
  if (!name || typeof price !== 'number') {
    return res.status(400).json({ error: 'name and numeric price are required' });
  }
  const product = { id: nextId++, name, price };
  products.push(product);
  res.status(201).json(product);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.patch('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  Object.assign(product, req.body);
  res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const before = products.length;
  products = products.filter((p) => p.id !== Number(req.params.id));
  if (products.length === before) return res.status(404).json({ error: 'Product not found' });
  res.status(204).end();
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/products' },
          { method: 'POST', url: '/api/products', body: { name: 'Monitor', price: 8999 } },
          { method: 'POST', url: '/api/products', body: { name: 'Cable' } },
          { method: 'GET', url: '/api/products?q=key' },
          { method: 'GET', url: '/api/products/3' },
          { method: 'PATCH', url: '/api/products/1', body: { price: 449 } },
          { method: 'DELETE', url: '/api/products/2' },
          { method: 'GET', url: '/api/products/2' },
          { method: 'GET', url: '/api/products' },
        ],
      },
      result: `Route Handler playground and the Express API Lab version return the same responses. Real Express 5 results, in order:
GET /api/products → 200 [{"id":1,"name":"Mouse","price":499},{"id":2,"name":"Keyboard","price":1499}]
POST /api/products → 201 {"id":3,"name":"Monitor","price":8999}
POST /api/products → 400 {"error":"name and numeric price are required"}
GET /api/products?q=key → 200 [{"id":2,"name":"Keyboard","price":1499}]
GET /api/products/3 → 200 {"id":3,"name":"Monitor","price":8999}
PATCH /api/products/1 → 200 {"id":1,"name":"Mouse","price":449}
DELETE /api/products/2 → 204
GET /api/products/2 → 404 {"error":"Product not found"}
GET /api/products → 200 [{"id":1,"name":"Mouse","price":449},{"id":3,"name":"Monitor","price":8999}]
(In the playground, PUT /api/products/1 → 405 because route.js does not export PUT.)`,
      explanation:
        'Each REST operation maps to an exported function in the right route.js: the collection file handles GET (list) and POST (create), the [id] file handles one item. Status codes follow REST conventions: 201 on create, 400 on invalid input, 404 for unknown ids, 204 with no body on delete. The Express version shows the same API with code-based routing (app.get("/api/products/:id")) instead of folders, so you can compare the two styles side by side.',
    },
    {
      title: 'Calling your Route Handler from a Client Component',
      scenario: 'A client-side "Quick add" form posts to /api/products and shows the created product.',
      steps: [
        'Create a "use client" component with a controlled form',
        'POST JSON with fetch to /api/products',
        'Check res.ok and show either the error or the new product',
        'Note: a Server Component should NOT call this endpoint; it should read the data directly',
      ],
      code: `// app/products/QuickAdd.js
'use client';
import { useState } from 'react';

export default function QuickAdd() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [msg, setMsg] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price: Number(price) }),
    });
    const data = await res.json();
    setMsg(res.ok ? 'Created #' + data.id + ' ' + data.name : 'Error: ' + data.error);
  }

  return (
    <form onSubmit={onSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" type="number" />
      <button>Add</button>
      <p>{msg}</p>
    </form>
  );
}

// ✅ app/products/page.js (Server Component) reads data directly:
// import { products } from '@/lib/products';
// ❌ not: await fetch('http://localhost:3000/api/products')`,
      result: 'Submitting "Monitor" and 8999 shows "Created #3 Monitor"; submitting without a price shows "Error: name and numeric price are required".',
      explanation:
        'Browser code can only reach the server over HTTP, so a Client Component uses the Route Handler. Server Components already run on the server and should call the data layer directly to avoid an extra HTTP round-trip. On Day 11 you will replace this pattern with a Server Action.',
    },
    {
      title: 'Webhook receiver with a secret header',
      scenario: 'A payment provider calls POST /api/webhooks/payment when a payment succeeds. Only requests with the right secret should be accepted.',
      steps: [
        'Create app/api/webhooks/payment/route.js',
        'Compare the x-webhook-secret header with process.env.WEBHOOK_SECRET',
        'Return 401 for a wrong secret, 400 for a bad payload, 200 otherwise',
        'Revalidate the orders page cache after a successful payment',
      ],
      code: `// app/api/webhooks/payment/route.js
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  const headerList = await headers();
  if (headerList.get('x-webhook-secret') !== process.env.WEBHOOK_SECRET) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event;
  try {
    event = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (event.type === 'payment.succeeded') {
    // await db.order.update({ where: { id: event.orderId }, data: { status: 'PAID' } });
    revalidatePath('/orders');
  }
  return Response.json({ received: true });
}`,
      result: 'Requests without the secret get 401, malformed JSON gets 400, valid events return {"received":true} and the /orders page is refreshed on its next visit.',
      explanation:
        'Webhooks are a classic Route Handler use case: an external service, not your UI, calls your server. Real providers sign the raw body (HMAC); comparing a shared secret header is the simplified version of the same idea.',
    },
    {
      title: 'Static GET handler, CSV download and CORS',
      scenario: 'Partners need a cached product feed, a CSV export and access from another domain.',
      steps: [
        'Create app/api/feed/route.js with dynamic = "force-static" and revalidate = 3600',
        'Create app/api/export/route.js that returns text/csv with a download header',
        'Add CORS headers and an OPTIONS handler to the feed',
      ],
      code: `// app/api/feed/route.js  (cached, refreshed hourly, callable from other origins)
import { products } from '@/lib/products';

export const dynamic = 'force-static';
export const revalidate = 3600;

const CORS = {
  'Access-Control-Allow-Origin': 'https://partner.example.com',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
  return Response.json({ updated: new Date().toISOString(), products }, { headers: CORS });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// app/api/export/route.js  (file download)
import { products } from '@/lib/products';

export async function GET() {
  const csv = ['id,name,price', ...products.map((p) => [p.id, p.name, p.price].join(','))].join('\\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="products.csv"',
    },
  });
}`,
      result: '/api/feed is generated once and cached for an hour (the "updated" time stays the same); the partner domain can call it from the browser; /api/export downloads products.csv.',
      explanation:
        'GET handlers are dynamic by default in Next.js 15, so force-static opts into caching like a static page, and revalidate refreshes it. CORS headers tell browsers that the partner origin may read the response; OPTIONS answers preflight checks. Any content type can be returned by building a Response manually.',
    },
  ],
  interview: [
    { q: 'What is a Route Handler in Next.js?', a: 'A route.js file in the app directory that exports functions named after HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS). Each receives a Web Request (NextRequest) and returns a Web Response. It is the App Router replacement for pages/api API routes.', level: 'Easy' },
    { q: 'How do you read the JSON body, query string and dynamic params in a Route Handler?', a: 'Body: await request.json(). Query: request.nextUrl.searchParams.get("q") (or new URL(request.url).searchParams). Params: second argument, const { id } = await params (a Promise in Next.js 15).', level: 'Easy' },
    { q: 'What happens if a client sends a method you did not export?', a: 'Next.js responds with 405 Method Not Allowed automatically.', level: 'Easy' },
    { q: 'Can page.js and route.js be in the same folder?', a: 'No. A route segment can be either a page (UI) or a route handler (API), not both. That is why APIs usually live under app/api/.', level: 'Medium' },
    { q: 'Are GET Route Handlers cached in Next.js 15?', a: 'No, they are dynamic by default (a change from Next.js 14, where GET handlers without dynamic APIs were static). Opt into caching with export const dynamic = "force-static", optionally with revalidate.', level: 'Medium' },
    { q: 'Should a Server Component fetch data from your own /api route?', a: 'No. Server Components already run on the server, so they should call the database or data functions directly. Fetching your own API adds a needless HTTP hop, needs an absolute URL, and complicates caching. Route Handlers are for clients outside the server: browsers (client components), mobile apps, webhooks, third parties.', level: 'Hard' },
    { q: 'Route Handler vs Server Action: when to use which?', a: 'Server Actions are best for mutations triggered by your own UI (forms, buttons): no manual endpoint, progressive enhancement, integrated revalidation. Route Handlers are best for public REST APIs, webhooks, mobile clients, file downloads, OAuth callbacks and anything needing a stable URL and HTTP semantics.', level: 'Medium' },
    { q: 'Which status codes should a REST create, delete and validation failure return?', a: 'Create: 201 Created with the new resource. Delete: 204 No Content (no body) or 200 with a message. Validation failure: 400 Bad Request (or 422) with an error explanation.', level: 'Easy' },
    { q: 'How do you set a cookie in a Route Handler response?', a: 'Create a NextResponse and call response.cookies.set(name, value, options), or use (await cookies()).set(...) from next/headers inside the handler, then return the response.', level: 'Medium' },
    { q: 'How do you enable CORS for a Route Handler?', a: 'Return Access-Control-Allow-Origin/Methods/Headers headers on responses and export an OPTIONS handler that answers preflight requests with those headers (or configure headers in next.config or middleware).', level: 'Medium' },
    { q: 'What is the difference between Response.json and NextResponse.json?', a: 'Response.json is the standard Web API. NextResponse extends Response with Next.js helpers: cookies management, redirect(), rewrite() and next() (used in middleware). For plain JSON either works.', level: 'Medium' },
    { q: 'Compare Express routing with Next.js Route Handlers.', a: 'Express defines routes in code (app.get("/api/products/:id", handler)) with req/res objects and middleware chains. Next.js defines routes by folders (app/api/products/[id]/route.js) with exported method functions using Web Request/Response. Concepts (methods, params, status codes, JSON) are identical.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create GET /api/time that returns { now: <ISO string> } and is never cached, and POST /api/echo that returns exactly the JSON it receives with status 200.',
      hint: 'Two route.js files.',
      solution: `// app/api/time/route.js
export const dynamic = 'force-dynamic';
export async function GET() {
  return Response.json({ now: new Date().toISOString() });
}

// app/api/echo/route.js
export async function POST(request) {
  const body = await request.json();
  return Response.json(body);
}`,
    },
    {
      task: 'Build a notes REST API with an in-memory array: GET /api/notes, POST /api/notes (text required, 400 otherwise), DELETE /api/notes/[id] (404 if missing, 204 on success).',
      hint: 'Shared module for the array; await params.',
      solution: `// lib/notes.js
export const store = { notes: [{ id: 1, text: 'Learn route handlers' }], nextId: 2 };

// app/api/notes/route.js
import { store } from '@/lib/notes';
export async function GET() {
  return Response.json(store.notes);
}
export async function POST(request) {
  const { text } = await request.json();
  if (!text || !text.trim()) return Response.json({ error: 'text is required' }, { status: 400 });
  const note = { id: store.nextId++, text: text.trim() };
  store.notes.push(note);
  return Response.json(note, { status: 201 });
}

// app/api/notes/[id]/route.js
import { store } from '@/lib/notes';
export async function DELETE(request, { params }) {
  const { id } = await params;
  const index = store.notes.findIndex((n) => n.id === Number(id));
  if (index === -1) return Response.json({ error: 'Note not found' }, { status: 404 });
  store.notes.splice(index, 1);
  return new Response(null, { status: 204 });
}`,
    },
    {
      task: 'Add pagination to GET /api/products: ?page=2&limit=5, returning { page, limit, total, items }. Default page 1, limit 10, max limit 50.',
      hint: 'searchParams + slice.',
      solution: `// app/api/products/route.js
import { products } from '@/lib/products';

export async function GET(request) {
  const sp = request.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get('page')) || 1);
  const limit = Math.min(50, Math.max(1, Number(sp.get('limit')) || 10));
  const start = (page - 1) * limit;
  return Response.json({
    page,
    limit,
    total: products.length,
    items: products.slice(start, start + limit),
  });
}`,
    },
    {
      task: 'Protect POST /api/admin/announce: if the Authorization header is not "Bearer <ADMIN_TOKEN env>", return 401. Otherwise return 201 with the message.',
      hint: 'request.headers.get("authorization").',
      solution: `// app/api/admin/announce/route.js
export async function POST(request) {
  const auth = request.headers.get('authorization');
  if (auth !== 'Bearer ' + process.env.ADMIN_TOKEN) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { message } = await request.json();
  return Response.json({ announced: message }, { status: 201 });
}`,
    },
    {
      task: 'Write the equivalent Express 5 route for GET /api/notes/:id that returns the note or 404, and the matching Next.js Route Handler. List two differences.',
      hint: 'Compare req.params with await params.',
      solution: `// Express 5
app.get('/api/notes/:id', (req, res) => {
  const note = notes.find((n) => n.id === Number(req.params.id));
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

// Next.js 15 - app/api/notes/[id]/route.js
export async function GET(request, { params }) {
  const { id } = await params;
  const note = notes.find((n) => n.id === Number(id));
  if (!note) return Response.json({ error: 'Note not found' }, { status: 404 });
  return Response.json(note);
}

// Differences:
// 1. Express routes are declared in code (':id'); Next.js routes come from folders ('[id]').
// 2. Express uses req/res objects (res.status().json()); Next.js returns a Web Response
//    (Response.json(data, { status })) and params is a Promise in Next.js 15.`,
    },
  ],
  quiz: [
    { question: 'Which file makes the endpoint /api/orders?', options: ['app/api/orders/page.js', 'app/api/orders.js', 'app/api/orders/route.js', 'pages/orders/api.js'], answer: 2, explanation: 'Route Handlers live in route.js files.' },
    { question: 'How do you read the id in app/api/users/[id]/route.js in Next.js 15?', options: ['request.params.id', 'const { id } = await params (second argument)', 'useParams()', 'request.query.id'], answer: 1, explanation: 'params is passed in the context argument and is a Promise.' },
    { question: 'Which response is correct for a successful create?', options: ['Response.json(item, { status: 201 })', 'Response.json(item, { status: 204 })', 'new Response(null, { status: 404 })', 'Response.json(item, { status: 500 })'], answer: 0, explanation: '201 Created with the new resource.' },
    { question: 'A Server Component needs the product list. Best approach?', options: ["fetch('/api/products')", 'Create a Server Action', 'Use useEffect', 'Call the data function / database directly'], answer: 3, explanation: 'Avoid an unnecessary HTTP hop on the server.' },
    { question: 'In Next.js 15, how do you cache a GET Route Handler?', options: ["export const dynamic = 'force-static'", "add cache: 'force-cache' to the Response", 'They are cached by default', 'Use getStaticProps'], answer: 0, explanation: 'GET handlers are dynamic by default in v15; force-static opts in.' },
  ],
};
