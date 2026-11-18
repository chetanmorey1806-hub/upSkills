export default {
  id: 'day-01-mern-architecture-request-flow-project-setup',
  title: 'MERN Architecture: Request Flow, Folder Structure, Environment Variables, Dev Proxy vs CORS',
  module: 'Module 1: Architecture & Setup',
  day: 1,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'See the whole MERN stack as one system: how a click in React becomes an HTTP request to Express, a query to MongoDB and a JSON response back to the screen. Then set up a professional client/server monorepo with npm workspaces, environment variables and a Vite dev proxy, and learn when you need CORS instead.',
  objectives: [
    'Trace one request end to end: browser → React → Express → Mongoose → MongoDB → back to the UI',
    'Organise a MERN project as a monorepo with client/ and server/ folders using npm workspaces',
    'Manage environment variables safely on both sides (process.env on the server, import.meta.env.VITE_* on the client)',
    'Explain the difference between the Vite dev proxy and CORS, and choose the right one for development and production',
    'Describe the layered backend structure (routes → controllers → services → models) and why it scales',
  ],
  theory: [
    {
      heading: 'What MERN really is: four layers, one language',
      content:
        '**MERN** = **M**ongoDB + **E**xpress + **R**eact + **N**ode.js. The point of the stack is that you write **JavaScript everywhere**: in the browser, on the server and even in database queries (MongoDB documents look like JSON).\n\n- **React 19** (built with **Vite**) runs in the user\'s browser. It draws the UI and calls the API.\n- **Node.js 22 LTS** is the runtime that runs your server code.\n- **Express 5** is the web framework on top of Node: routing, middleware, JSON responses.\n- **MongoDB 8** stores data as documents; **Mongoose 8** gives you schemas, validation and models on top of it.\n\nAnalogy: a restaurant. **React is the dining area and the menu** (what the customer sees). **Express is the waiter** who takes the order, checks it is valid and carries it to the kitchen. **MongoDB is the store room** where ingredients are kept. **Node is the building** everything runs inside. The customer never walks into the store room directly; every request goes through the waiter.',
      points: [
        'React never talks to MongoDB directly: the database password must never reach the browser',
        'The contract between frontend and backend is the REST API (URLs + JSON shapes + status codes)',
        'Both sides are separate apps: they are built, deployed and scaled separately',
        'In production the React app becomes static files (HTML/JS/CSS) served from a CDN like Vercel or Netlify',
      ],
    },
    {
      heading: 'The life of one request (end to end)',
      content:
        'Let us follow what happens when a user clicks **"Load products"**:\n\n1. **React** runs an event handler or a TanStack Query hook which calls `api.get(\'/api/products?page=1\')`.\n2. The **browser** sends an HTTP request: `GET https://api.shop.in/api/products?page=1` with headers (cookies, `Accept: application/json`).\n3. **Express** receives it. Global middleware runs first: `helmet`, `cors`, `express.json()`, logger, auth.\n4. The **router** matches `GET /api/products` and calls the **controller**.\n5. The controller reads `req.query`, calls a **service** which calls the **Mongoose model**: `Product.find().skip(0).limit(20)`.\n6. **MongoDB** uses an index, finds the documents and returns them to the Node driver.\n7. The controller sends `res.status(200).json({ data, page, total })`.\n8. The browser receives JSON; React **updates state**, re-renders and the user sees the product cards.\n\nIf anything fails (validation, database down, bad token) the request jumps to the **error-handling middleware**, which returns a clean JSON error like `{ "message": "Product not found" }` with the right status code, and React shows an error message.',
      syntax:
        'Browser (React)  ──HTTP JSON──▶  Express (middleware → route → controller → service)\n                                          │\n                                          ▼\n                                   Mongoose model ──▶ MongoDB\n                                          │\nBrowser  ◀──── 200 { data: [...] } ───────┘',
      tip: 'In interviews, when asked "What happens when you click a button in a MERN app?", walk through these 8 steps. Mention middleware, status codes and the error handler: that is what separates a fresher who copied a tutorial from one who understands the system.',
    },
    {
      heading: 'Folder structure: client/server monorepo with npm workspaces',
      content:
        'A clean, interview-ready layout keeps frontend and backend in **one Git repository** but in **separate packages**:\n\n- `client/` is the Vite + React app (its own package.json).\n- `server/` is the Express API (its own package.json).\n- `packages/shared/` (optional) holds code used by both, such as Zod validation schemas and constants.\n- The **root package.json** declares `"workspaces"` so one `npm install` installs everything and links the shared package.\n\nInside `server/src` use a **layered** structure: `routes/` (URL → controller), `controllers/` (read req, send res), `services/` (business logic), `models/` (Mongoose schemas), `middleware/` (auth, errors, validation), `config/` (env, db connection). Inside `client/src`: `api/` (axios + query hooks), `components/`, `pages/`, `hooks/`, `context/`.\n\nWhy a monorepo? One pull request can change the API and the UI together, shared code is imported instead of copy-pasted, and CI can test both at once. It is still fine to deploy them separately.',
      syntax:
        'mern-shop/\n├── package.json            # { "workspaces": ["client", "server", "packages/*"] }\n├── packages/shared/        # zod schemas, constants (used by both)\n├── client/                 # React 19 + Vite\n│   ├── src/api/  src/pages/  src/components/  src/hooks/\n│   ├── .env.development     # VITE_API_URL=\n│   └── vite.config.js       # dev proxy /api → :5000\n└── server/                 # Express 5 + Mongoose 8\n    ├── src/config/  src/routes/  src/controllers/\n    ├── src/services/  src/models/  src/middleware/\n    ├── src/app.js           # builds the express app (exported for tests)\n    ├── src/server.js        # connects DB, calls app.listen\n    └── .env                 # MONGODB_URI, JWT secrets (never committed)',
      points: [
        'Separate app.js (create app) from server.js (listen): tests can import app without opening a port',
        'Run both in development with one command: npm run dev (using concurrently or npm --workspaces)',
        'Never commit .env files; commit a .env.example with dummy values instead',
      ],
    },
    {
      heading: 'Environment variables on both sides',
      content:
        'Configuration that changes between laptop, staging and production (database URL, secrets, API URL, port) must **not be hard-coded**. It lives in **environment variables**.\n\n**Server (Node 22):** read with `process.env.MONGODB_URI`. In development load a `.env` file with `node --env-file=.env src/server.js` (built into Node 20.6+, no dotenv needed) or the `dotenv` package. In production, the hosting platform (Render, Railway) injects them.\n\n**Client (Vite):** only variables starting with **`VITE_`** are exposed, and you read them with `import.meta.env.VITE_API_URL`. They are **baked into the JavaScript bundle at build time**, which means anyone can read them in DevTools. So the client may hold public values (API URL, Razorpay key id, Cloudinary cloud name) but **never secrets** (JWT secret, DB password, Razorpay key secret).\n\nGood practice: validate env vars at server start (fail fast). If `MONGODB_URI` is missing, crash immediately with a clear message instead of failing on the first request.',
      syntax:
        '# server/.env  (never commit)\nPORT=5000\nMONGODB_URI=mongodb://127.0.0.1:27017/mernshop\nJWT_ACCESS_SECRET=change-me\nCLIENT_URL=http://localhost:5173\n\n# client/.env.production  (public values only!)\nVITE_API_URL=https://api.mernshop.in',
      tip: 'Common mistake: putting a secret in client/.env as VITE_SECRET_KEY. It ends up inside dist/assets/index-xxxx.js for the whole world to read. If the browser needs it, it is not a secret.',
    },
    {
      heading: 'Dev proxy vs CORS: two ways to cross the port gap',
      content:
        'In development React runs on `http://localhost:5173` and Express on `http://localhost:5000`. Different port = **different origin**, so the browser applies the **Same-Origin Policy**: a script from 5173 may send a request to 5000, but it may not **read** the response unless the server allows it with **CORS** headers.\n\nYou have two solutions:\n\n1. **Vite dev proxy** (development only): React calls a relative URL `/api/products`. The request goes to the Vite dev server (same origin, no CORS), and Vite forwards it to `http://localhost:5000`. The browser never sees a cross-origin request. Cookies also work easily because everything looks same-origin.\n2. **CORS** on Express: the server replies with `Access-Control-Allow-Origin: https://mernshop.in` (and `Access-Control-Allow-Credentials: true` when using cookies). Needed whenever frontend and backend live on **different domains in production** (for example Vercel + Render).\n\nA third production option is to serve both under one domain, e.g. a reverse proxy (Nginx, Vercel rewrites) sends `mernshop.in/api/*` to the backend. Then no CORS is needed at all and cookies are first-party.',
      points: [
        'Same origin = same scheme + host + port',
        'The proxy exists only in `vite dev`; `vite build` output has no proxy',
        'CORS is enforced by the BROWSER, not the server: Postman and curl ignore it',
        'With cookies: origin must be an exact URL (not *) and credentials: true on both server and axios',
      ],
    },
    {
      heading: 'Request/response contract and error format',
      content:
        'Teams move faster when the API is **predictable**. Agree on a contract early:\n\n- **Resource URLs** in plural nouns: `/api/products`, `/api/products/:id`, `/api/orders`.\n- **Status codes**: 200 OK, 201 Created, 204 No Content, 400 validation error, 401 not logged in, 403 not allowed, 404 not found, 409 conflict, 422 (some teams), 429 too many requests, 500 server error.\n- **One success shape** for lists: `{ data: [...], page, limit, total }`, and the plain object for single items.\n- **One error shape** everywhere: `{ message: "Human readable", errors?: { field: "reason" } }`. React can then show `error.response.data.message` in a toast and map `errors` onto form fields.\n\nPut the error formatting in **one Express error-handling middleware** (4 arguments). In Express 5, errors thrown in `async` handlers are forwarded to it automatically, so you no longer need `express-async-handler` or try/catch in every controller.',
      syntax:
        '// server/src/middleware/error.js\nexport function errorHandler(err, req, res, next) {\n  const status = err.status || 500;\n  res.status(status).json({\n    message: status === 500 ? \'Something went wrong\' : err.message,\n    errors: err.errors,\n  });\n}',
      tip: 'Coming next (Day 2): we build the React side of this contract: an axios instance, interceptors and TanStack Query hooks that understand this exact error shape.',
    },
  ],
  examples: [
    {
      title: 'Request flow through Express layers (route → controller → service → model)',
      scenario:
        'You want to SEE the layers a request passes through. We simulate MongoDB with an in-memory array behind a tiny "model", so the same structure runs in the API Lab. In the real project each layer is its own file.',
      steps: [
        'Create a fake model object with find/findById methods (stands in for a Mongoose model)',
        'Write a service layer with the business rule (only in-stock products, max limit 20)',
        'Write controllers that read req.query/req.params and call the service',
        'Mount a router at /api/products and add logger, 404 and error middleware',
        'Click Run server, then send the three requests and watch the console trace',
      ],
      code: `// Real project version (server/src)
// models/Product.js
import mongoose from 'mongoose';
const productSchema = new mongoose.Schema(
  { name: { type: String, required: true }, price: Number, stock: { type: Number, default: 0 } },
  { timestamps: true }
);
export const Product = mongoose.model('Product', productSchema);

// services/product.service.js
export const listProducts = ({ limit = 10 }) =>
  Product.find({ stock: { $gt: 0 } }).limit(Math.min(limit, 20)).lean();
export const getProduct = (id) => Product.findById(id).lean();

// controllers/product.controller.js
export async function list(req, res) {
  const data = await listProducts({ limit: Number(req.query.limit) || 10 });
  res.json({ data });
}
export async function getOne(req, res) {
  const product = await getProduct(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}

// routes/product.routes.js
import { Router } from 'express';
const router = Router();
router.get('/', list);
router.get('/:id', getOne);
export default router;

// app.js
app.use('/api/products', productRoutes);`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

// ---- "model" layer (in the real app: Mongoose model + MongoDB) ----
const db = [
  { _id: 'p1', name: 'Wireless Mouse', price: 699, stock: 12 },
  { _id: 'p2', name: 'Mechanical Keyboard', price: 3499, stock: 0 },
  { _id: 'p3', name: 'USB-C Hub', price: 1299, stock: 5 },
];
const Product = {
  find: (filter) => db.filter(filter),
  findById: (id) => db.find(p => p._id === id) || null,
};

// ---- service layer: business rules live here ----
const productService = {
  list: (limit) => Product.find(p => p.stock > 0).slice(0, Math.min(limit, 20)),
  get: (id) => Product.findById(id),
};

// ---- controller layer: HTTP in, HTTP out ----
const productController = {
  list(req, res) {
    console.log('[controller] list, query =', req.query);
    const data = productService.list(Number(req.query.limit) || 10);
    res.json({ data, count: data.length });
  },
  getOne(req, res) {
    console.log('[controller] getOne, id =', req.params.id);
    const product = productService.get(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  },
};

// ---- routes ----
const router = express.Router();
router.get('/', productController.list);
router.get('/:id', productController.getOne);

// ---- app wiring ----
app.use((req, res, next) => { console.log('[middleware]', req.method, req.url); next(); });
app.use('/api/products', router);
app.use((req, res) => res.status(404).json({ message: 'Route not found: ' + req.originalUrl }));
app.use((err, req, res, next) => res.status(500).json({ message: 'Something went wrong' }));

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/products?limit=5' },
          { method: 'GET', url: '/api/products/p3' },
          { method: 'GET', url: '/api/products/p9' },
          { method: 'GET', url: '/api/orders' },
        ],
      },
      result: "GET /api/products?limit=5 → 200 {\"data\":[{\"_id\":\"p1\",\"name\":\"Wireless Mouse\",\"price\":699,\"stock\":12},{\"_id\":\"p3\",\"name\":\"USB-C Hub\",\"price\":1299,\"stock\":5}],\"count\":2}\nGET /api/products/p3 → 200 {\"_id\":\"p3\",\"name\":\"USB-C Hub\",\"price\":1299,\"stock\":5}\nGET /api/products/p9 → 404 {\"message\":\"Product not found\"}\nGET /api/orders → 404 {\"message\":\"Route not found: /api/orders\"}",
      explanation:
        'The out-of-stock keyboard is hidden by the SERVICE (a business rule), not by the controller or the route. The controller only translates HTTP to function calls and back, so later you can reuse the same service from a cron job or a Socket.IO handler. The 404 for /api/products/p9 comes from the controller (resource missing), while /api/orders hits the catch-all 404 middleware (route missing). In the real project the model calls become Product.find(...) on MongoDB and the controller becomes async; Express 5 forwards any rejected promise to the error middleware automatically.',
    },
    {
      title: 'Monorepo with npm workspaces, Vite dev proxy and one "npm run dev"',
      scenario:
        'Set up the repository the way companies do: one repo, two apps, one install command, one dev command, and a proxy so React can call /api without CORS during development.',
      steps: [
        'Create the root folder and a root package.json with "workspaces"',
        'Create the client with npm create vite@latest client -- --template react',
        'Create server/ with npm init -y, then npm i express mongoose cors helmet -w server',
        'Add the proxy block to client/vite.config.js',
        'Install concurrently at the root and add the dev script',
        'Run npm install once at the root, then npm run dev and open http://localhost:5173',
      ],
      code: `// ===== package.json (root) =====
{
  "name": "mern-shop",
  "private": true,
  "workspaces": ["client", "server", "packages/*"],
  "scripts": {
    "dev": "concurrently -n server,client -c blue,green \\"npm run dev -w server\\" \\"npm run dev -w client\\"",
    "build": "npm run build -w client",
    "test": "npm test --workspaces --if-present"
  },
  "devDependencies": { "concurrently": "^9.0.0" }
}

// ===== server/package.json =====
{
  "name": "server",
  "type": "module",
  "scripts": {
    "dev": "node --watch --env-file=.env src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": { "express": "^5.1.0", "mongoose": "^8.9.0", "cors": "^2.8.5", "helmet": "^8.0.0" }
}

// ===== server/src/app.js =====
import express from 'express';
import helmet from 'helmet';
import productRoutes from './routes/product.routes.js';
import { errorHandler } from './middleware/error.js';

export const app = express();
app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/products', productRoutes);
app.use(errorHandler);

// ===== server/src/server.js =====
import mongoose from 'mongoose';
import { app } from './app.js';

const { PORT = 5000, MONGODB_URI } = process.env;
if (!MONGODB_URI) throw new Error('MONGODB_URI is missing in server/.env');

await mongoose.connect(MONGODB_URI);
console.log('MongoDB connected');
app.listen(PORT, () => console.log('API on http://localhost:' + PORT));

// ===== client/vite.config.js =====
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});

// ===== client/src/App.jsx =====
import { useEffect, useState } from 'react';
export default function App() {
  const [health, setHealth] = useState('checking...');
  useEffect(() => {
    fetch('/api/health')                 // relative URL → goes through the Vite proxy
      .then((r) => r.json())
      .then((d) => setHealth(d.status))
      .catch(() => setHealth('API is down'));
  }, []);
  return <h1>API status: {health}</h1>;
}`,
      result:
        'npm run dev starts both apps with coloured [server] and [client] logs. Opening http://localhost:5173 shows "API status: ok". In the Network tab the request URL is http://localhost:5173/api/health (same origin), and there is no CORS error even though the server has no cors() middleware.',
      explanation:
        'Workspaces hoist dependencies into one root node_modules and let you run scripts per package with -w. node --watch (built into Node 22) restarts the server on file changes, so nodemon is optional, and --env-file loads server/.env without dotenv. The Vite proxy forwards every path starting with /api to port 5000; changeOrigin rewrites the Host header. Because the browser only ever talks to 5173, the Same-Origin Policy is satisfied. Remember: the proxy disappears after vite build, so production needs either the same domain (rewrite) or CORS.',
    },
    {
      title: 'CORS for production: exact origins, credentials and preflight',
      scenario:
        'In production the React app is on https://mernshop.vercel.app and the API on https://mernshop-api.onrender.com. Write the CORS logic by hand once so you understand what the cors package does.',
      steps: [
        'Keep an allow-list of origins read from an environment variable',
        'For an allowed Origin header, echo it back in Access-Control-Allow-Origin and allow credentials',
        'Answer OPTIONS preflight requests with 204 and the allowed methods/headers',
        'Send requests from an allowed origin, a blocked origin and a preflight',
      ],
      code: `// Real project: use the cors package (same behaviour)
import cors from 'cors';
const allowed = process.env.CLIENT_URL.split(',');   // "https://mernshop.vercel.app,http://localhost:5173"
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowed.includes(origin)) return cb(null, true);  // !origin = curl/Postman/server-to-server
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,                       // allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// React side (axios) must also opt in to cookies:
// axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true })`,
      api: {
        code: `const express = require('express');
const app = express();

const ALLOWED = ['https://mernshop.vercel.app', 'http://localhost:5173'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') {
    if (!origin || !ALLOWED.includes(origin)) return res.status(403).json({ message: 'Origin not allowed' });
    res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.sendStatus(204);
  }
  next();
});

app.get('/api/products', (req, res) => {
  res.json({ data: ['Mouse', 'Keyboard'], corsHeader: res.get('Access-Control-Allow-Origin') || 'none' });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/products', headers: { Origin: 'https://mernshop.vercel.app' } },
          { method: 'GET', url: '/api/products', headers: { Origin: 'https://evil-site.com' } },
          { method: 'OPTIONS', url: '/api/products', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'DELETE' } },
          { method: 'OPTIONS', url: '/api/products', headers: { Origin: 'https://evil-site.com' } },
        ],
      },
      result: "GET /api/products → 200 {\"data\":[\"Mouse\",\"Keyboard\"],\"corsHeader\":\"https://mernshop.vercel.app\"}\nGET /api/products → 200 {\"data\":[\"Mouse\",\"Keyboard\"],\"corsHeader\":\"none\"}\nOPTIONS /api/products → 204\nOPTIONS /api/products → 403 {\"message\":\"Origin not allowed\"}",
      explanation:
        'For the evil origin the server still returns 200 with data, but WITHOUT Access-Control-Allow-Origin, so a real browser blocks the page script from reading it ("corsHeader":"none"). That is the key insight: CORS protects users in browsers; it is not authentication and does not stop curl. The preflight (OPTIONS) is sent automatically by browsers before PUT/PATCH/DELETE or JSON bodies; an allowed origin gets 204 with the allowed methods. With credentials you must echo the exact origin; "*" is rejected by browsers when cookies are involved. Vary: Origin tells CDNs to cache separately per origin.',
    },
    {
      title: 'Validated configuration on both sides (fail fast)',
      scenario:
        'Your teammate deploys without setting JWT_ACCESS_SECRET and the server starts happily, then every login crashes. Build a config module that refuses to start with missing or invalid variables, and a matching client config.',
      steps: [
        'Install zod in the server workspace: npm i zod -w server',
        'Create server/src/config/env.js that parses process.env with a schema',
        'Import config (not process.env) everywhere in the server',
        'Create client/src/config.js that reads import.meta.env.VITE_* with defaults',
        'Commit .env.example files that list every variable with dummy values',
      ],
      code: `// ===== server/src/config/env.js =====
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().startsWith('mongodb'),
  JWT_ACCESS_SECRET: z.string().min(32, 'use at least 32 random characters'),
  CLIENT_URL: z.string().url(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);                          // crash at boot, not at the first request
}
export const config = parsed.data;          // typed, defaulted, trusted

// usage: import { config } from './config/env.js'; app.listen(config.PORT)

// ===== server/.env.example (committed) =====
// NODE_ENV=development
// PORT=5000
// MONGODB_URI=mongodb://127.0.0.1:27017/mernshop
// JWT_ACCESS_SECRET=replace-with-64-random-hex-chars
// CLIENT_URL=http://localhost:5173

// ===== client/src/config.js =====
export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? '',      // '' in dev → relative /api via proxy
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID, // public key id: OK in the browser
  isProd: import.meta.env.PROD,
};

// ===== client/.env.production =====
// VITE_API_URL=https://mernshop-api.onrender.com

// Generate a strong secret:
// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`,
      result:
        'Starting the server without JWT_ACCESS_SECRET prints: Invalid environment variables: { JWT_ACCESS_SECRET: [ "Required" ] } and exits with code 1. With a valid .env it starts normally. On the client, npm run build bakes VITE_API_URL from .env.production into the bundle.',
      explanation:
        'z.coerce.number() turns the string "5000" into a number, because all env values are strings. safeParse collects every problem at once so you fix them in one go. Crashing on boot is good: the deployment platform marks the release as failed and keeps the old version running, instead of shipping a broken server. On the client, there are no secrets: anything under import.meta.env is public after build.',
    },
    {
      title: 'Watching the round trip from React (playground)',
      scenario:
        'Make the request flow visible in the browser: a React component logs each stage (click → request sent → response → state update → render) while fetching from a real public REST API.',
      steps: [
        'Click Run to start the playground',
        'Press "Load users" and watch the timeline fill in',
        'Press "Trigger 404" to see the error path',
        'Compare the timeline with the 8 steps from the theory section',
      ],
      code: `function App() {
  const [log, setLog] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [status, setStatus] = React.useState('idle');
  const add = (msg) => setLog((l) => [...l, msg]);

  async function load(url) {
    setLog([]);
    add('1. click handler runs in React');
    setStatus('loading');
    add('2. browser sends GET ' + url);
    try {
      const res = await fetch(url);
      add('3. server answered with HTTP ' + res.status);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      add('4. JSON parsed: ' + data.length + ' records');
      setUsers(data.slice(0, 3));
      setStatus('success');
      add('5. state updated → React re-renders');
    } catch (err) {
      setStatus('error');
      add('X. error path: ' + err.message);
    }
  }
  return (/* JSX with buttons, timeline and user list */);
}`,
      playground: {
        jsx: `function App() {
  const [log, setLog] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [status, setStatus] = React.useState('idle');
  const add = (msg) => setLog((l) => [...l, msg]);

  async function load(url) {
    setLog([]);
    setUsers([]);
    add('1. click handler runs in React');
    setStatus('loading');
    add('2. browser sends GET ' + url);
    try {
      const res = await fetch(url);
      add('3. server answered with HTTP ' + res.status);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      add('4. JSON parsed: ' + data.length + ' records');
      setUsers(data.slice(0, 3));
      setStatus('success');
      add('5. state updated, React re-renders the list');
    } catch (err) {
      setStatus('error');
      add('X. error path: ' + err.message);
    }
  }

  const btn = { padding: '8px 14px', marginRight: 8, borderRadius: 6, border: '1px solid #888', cursor: 'pointer' };
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h2>Request round trip</h2>
      <button style={btn} onClick={() => load('https://jsonplaceholder.typicode.com/users')}>Load users</button>
      <button style={btn} onClick={() => load('https://jsonplaceholder.typicode.com/not-a-route')}>Trigger 404</button>
      <p>Status: <b>{status}</b></p>
      <ol style={{ background: '#f4f4f5', color: '#222', padding: '12px 28px', borderRadius: 8 }}>
        {log.map((l, i) => <li key={i} style={{ listStyle: 'none' }}>{l}</li>)}
      </ol>
      <ul>{users.map((u) => <li key={u.id}>{u.name} ({u.email})</li>)}</ul>
    </div>
  );
}`,
      },
      result:
        'Clicking "Load users" shows 5 timeline lines ending with "state updated, React re-renders the list" and three user names below. "Trigger 404" shows "server answered with HTTP 404" followed by "X. error path: HTTP 404".',
      explanation:
        'fetch() only rejects on network failure, NOT on 404/500, so we check res.ok ourselves; axios (Day 2) throws for non-2xx automatically. The status state drives loading/success/error UI, which is exactly what TanStack Query will manage for us tomorrow. In a real MERN app the URL would be /api/users and steps 2-3 would pass through Express middleware, controller, service and MongoDB.',
    },
  ],
  interview: [
    {
      q: 'Explain the MERN stack and the role of each part.',
      a: 'MongoDB is a document database that stores JSON-like (BSON) documents. Express is a minimal web framework on Node.js that handles routing, middleware and HTTP responses. React is a UI library that renders the frontend in the browser as a single-page app. Node.js is the JavaScript runtime that runs the server. Together they let you use JavaScript end to end, and JSON flows naturally from database to API to UI.',
      level: 'Easy',
    },
    {
      q: 'What happens, step by step, when a user clicks "Add to cart" in a MERN app?',
      a: '1) React handler (or useMutation) calls api.post("/api/cart", { productId, qty }). 2) Browser sends the HTTP request with cookies/Authorization header. 3) Express global middleware runs: security headers, CORS, JSON body parser, auth. 4) Router matches POST /api/cart → controller. 5) Controller validates input and calls the cart service. 6) Service uses Mongoose to update the cart document in MongoDB. 7) Controller sends 201/200 JSON. 8) React updates state or invalidates the cart query, re-renders, and the cart badge updates. Errors go to the error middleware and come back as { message } with a 4xx/5xx code.',
      level: 'Medium',
    },
    {
      q: 'Why should React never connect to MongoDB directly?',
      a: 'Everything shipped to the browser is public, so the connection string (with username/password) would be exposed and anyone could read or delete the whole database. Also there would be no place to enforce business rules, validation, authentication and authorization. The Express API is the trusted gatekeeper between untrusted clients and the database.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between the Vite dev proxy and CORS?',
      a: 'The Vite proxy is a development-only feature: the browser calls the Vite server on the same origin (e.g. localhost:5173/api) and Vite forwards it to the backend, so no cross-origin request happens. CORS is a set of response headers (Access-Control-Allow-Origin etc.) that the backend sends so a browser allows a page from another origin to read the response. In production, if frontend and backend are on different domains, you need CORS (or a same-domain rewrite/reverse proxy), because the dev proxy does not exist after vite build.',
      level: 'Medium',
    },
    {
      q: 'Does CORS protect your API from attackers?',
      a: 'No. CORS is enforced only by browsers, to protect users from malicious websites reading data with their cookies. Tools like curl, Postman or a bot ignore CORS completely. You still need authentication, authorization, rate limiting and validation on the server.',
      level: 'Medium',
    },
    {
      q: 'How do environment variables differ between the Express server and a Vite React app?',
      a: 'On the server, process.env is read at runtime and stays on the server, so it can hold secrets (DB URI, JWT secrets). In Vite, only variables prefixed with VITE_ are exposed via import.meta.env, and they are replaced at BUILD time into the JS bundle, so they are public. Changing them requires a rebuild. Never put secrets in VITE_ variables.',
      level: 'Medium',
    },
    {
      q: 'Why separate app.js and server.js in an Express project?',
      a: 'app.js builds and exports the Express app (middleware, routes, error handler) without listening. server.js connects to MongoDB and calls app.listen. Tests (Supertest) can import app directly without opening a port or connecting to the real database, and you can reuse the app in serverless handlers.',
      level: 'Medium',
    },
    {
      q: 'What are npm workspaces and why use them for a MERN monorepo?',
      a: 'Workspaces let one root package.json manage several packages (client, server, shared). A single npm install installs all dependencies (hoisted into one node_modules) and symlinks local packages, so the client and server can both import a shared package (for example Zod schemas) without publishing it. You run scripts per package with npm run dev -w server or across all with --workspaces.',
      level: 'Medium',
    },
    {
      q: 'Explain the routes → controllers → services → models layering. What goes where?',
      a: 'Routes map URL + method to a controller and attach middleware (auth, validation). Controllers deal with HTTP: read req.params/query/body, call a service, choose the status code and send JSON. Services contain business logic (pricing, stock checks, sending emails) and are framework-independent. Models define the data shape and talk to MongoDB through Mongoose. This keeps controllers thin, makes services unit-testable and lets you reuse logic from queues, cron jobs or sockets.',
      level: 'Medium',
    },
    {
      q: 'What is a preflight request and when does the browser send one?',
      a: 'A preflight is an automatic OPTIONS request the browser sends before a "non-simple" cross-origin request: methods other than GET/HEAD/POST, a Content-Type such as application/json, or custom headers like Authorization. The server must answer with Access-Control-Allow-Origin/Methods/Headers (and Allow-Credentials when using cookies). Only if the preflight passes does the browser send the real request. You can cache it with Access-Control-Max-Age.',
      level: 'Hard',
    },
    {
      q: 'How would you design a consistent error response for a MERN API?',
      a: 'Use one error-handling middleware at the end of the app. Throw errors with a status (e.g. a custom AppError(404, "Product not found")). The handler returns { message, errors? } with the right status, hides internal details and stack traces for 500 in production, and logs the full error. Mongoose ValidationError maps to 400 with per-field errors, duplicate key (code 11000) to 409, CastError (bad ObjectId) to 400. The React layer can then rely on error.response.data.message everywhere.',
      level: 'Hard',
    },
    {
      q: 'In Express 5, do you still need try/catch or express-async-handler in async controllers?',
      a: 'No. Express 5 automatically catches a rejected promise returned from a route handler or middleware and passes the error to next(err), so it reaches the error-handling middleware. In Express 4 an unhandled rejection in an async handler would hang the request (or crash), which is why wrappers like express-async-handler were common.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Create the monorepo skeleton: root package.json with workspaces for client and server, a dev script that runs both with concurrently, server dev script using node --watch and --env-file, and a /api/health route.',
      hint: 'Root "workspaces": ["client","server"]. Use npm run dev -w <name> inside concurrently.',
      solution: `// package.json (root)
{
  "name": "mern-starter",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently -n api,web \\"npm run dev -w server\\" \\"npm run dev -w client\\""
  },
  "devDependencies": { "concurrently": "^9.0.0" }
}

// server/package.json
{
  "name": "server",
  "type": "module",
  "scripts": { "dev": "node --watch --env-file=.env src/server.js", "start": "node src/server.js" },
  "dependencies": { "express": "^5.1.0" }
}

// server/src/app.js
import express from 'express';
export const app = express();
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// server/src/server.js
import { app } from './app.js';
const port = process.env.PORT || 5000;
app.listen(port, () => console.log('API on ' + port));

// server/.env
// PORT=5000
// NODE_ENV=development

// Commands
// npm create vite@latest client -- --template react
// npm install          (at the root, installs everything)
// npm run dev`,
    },
    {
      task: 'Configure the Vite proxy so that both /api and /socket.io are forwarded to the backend on port 5000 (Socket.IO needs WebSocket forwarding). Then write a React hook useHealth() that calls /api/health.',
      hint: 'Use ws: true for the socket path.',
      solution: `// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5000', ws: true, changeOrigin: true },
    },
  },
});

// client/src/hooks/useHealth.js
import { useEffect, useState } from 'react';
export function useHealth() {
  const [state, setState] = useState({ status: 'loading' });
  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/health', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then((d) => setState({ status: d.status }))
      .catch((e) => { if (e.name !== 'AbortError') setState({ status: 'down', error: e.message }); });
    return () => ctrl.abort();
  }, []);
  return state;
}`,
    },
    {
      task: 'Write an Express error-handling setup: an AppError class, a notFound middleware, and an errorHandler that maps Mongoose ValidationError → 400 with field errors, CastError → 400, duplicate key 11000 → 409, and hides 500 details in production.',
      hint: 'Check err.name and err.code. Error middleware has 4 parameters.',
      solution: `// server/src/utils/AppError.js
export class AppError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// server/src/middleware/error.js
export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found: ' + req.originalUrl });
}

export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message;
  let errors = err.errors;

  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    errors = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ' + err.path;
  } else if (err.code === 11000) {
    status = 409;
    message = Object.keys(err.keyValue).join(', ') + ' already exists';
  }

  if (status === 500) {
    console.error(err);
    if (process.env.NODE_ENV === 'production') message = 'Something went wrong';
  }
  res.status(status).json({ message, ...(errors && { errors }) });
}

// app.js (last lines)
// app.use(notFound);
// app.use(errorHandler);`,
    },
    {
      task: 'Draw (as text) the request flow for "User updates their profile name" in a MERN app with cookie auth, listing every layer, the HTTP method, URL, status codes for success and three failure cases.',
      hint: 'Think: React form → axios → middleware chain → controller → service → model → response → UI.',
      solution: `1. React: <ProfileForm> onSubmit → useMutation → api.patch('/api/users/me', { name: 'Riya' })
2. Browser: PATCH https://api.app.in/api/users/me
   Cookie: accessToken=... ; Content-Type: application/json
   (preflight OPTIONS first if cross-origin, because of PATCH + JSON)
3. Express global middleware: helmet → cors (credentials) → express.json → cookieParser → logger
4. Route: router.patch('/me', requireAuth, validate(updateProfileSchema), userController.updateMe)
   - requireAuth verifies the JWT from the cookie → req.user = { id, role }
   - validate checks body: name 2-50 chars
5. Controller: const user = await userService.updateName(req.user.id, req.body.name)
6. Service: User.findByIdAndUpdate(id, { name }, { new: true, runValidators: true })
7. MongoDB updates the document and returns it
8. Controller: res.status(200).json({ user })
9. React: onSuccess → queryClient.setQueryData(['me'], data.user) → header shows new name

Failures:
- 401 Unauthorized: no/expired access token (axios interceptor tries refresh, else redirect to /login)
- 400 Bad Request: name too short ({ message, errors: { name: '...' } } shown under the input)
- 500 Server Error: DB down → error middleware returns { message: 'Something went wrong' }, toast shown`,
    },
  ],
  quiz: [
    {
      question: 'Your React app on localhost:5173 calls fetch("/api/products") in development and it works without any CORS setup. Why?',
      options: [
        'Express allows all origins by default',
        'The Vite dev server proxies /api to the backend, so the browser sees a same-origin request',
        'fetch ignores CORS for GET requests',
        'localhost is always treated as the same origin',
      ],
      answer: 1,
      explanation: 'The proxy configured in vite.config.js forwards /api to the backend. The browser only talks to localhost:5173, so the Same-Origin Policy is satisfied.',
    },
    {
      question: 'Which value is SAFE to place in a Vite VITE_ environment variable?',
      options: ['MongoDB connection string', 'JWT signing secret', 'Razorpay key secret', 'The public API base URL'],
      answer: 3,
      explanation: 'VITE_ variables are embedded into the public JavaScript bundle at build time. Only public values like the API URL or a public key id belong there.',
    },
    {
      question: 'In a layered Express backend, where should the rule "hide products that are out of stock" live?',
      options: ['In the service layer', 'In the route file', 'In the error-handling middleware', 'In the React component only'],
      answer: 0,
      explanation: 'Business rules belong in services. Controllers handle HTTP, routes handle URL mapping; a client-only rule can be bypassed by calling the API directly.',
    },
    {
      question: 'With cookie-based auth across domains, which CORS setting is required?',
      options: [
        'Access-Control-Allow-Origin: * with credentials: false',
        'No CORS headers; cookies bypass CORS',
        'An exact Access-Control-Allow-Origin plus Access-Control-Allow-Credentials: true (and withCredentials on the client)',
        'Only Access-Control-Allow-Methods: *',
      ],
      answer: 2,
      explanation: 'Browsers refuse credentialed responses with a wildcard origin. The server must echo the exact origin and allow credentials, and axios/fetch must send credentials.',
    },
    {
      question: 'Why export the Express app from app.js and call listen() in a separate server.js?',
      options: [
        'Express 5 forbids calling listen in the same file',
        'It is required for CORS to work',
        'It makes the bundle smaller',
        'So tests can import the app without opening a port or connecting to the real database',
      ],
      answer: 3,
      explanation: 'Supertest can call request(app) directly. Keeping listen and the DB connection in server.js keeps tests fast and isolated.',
    },
  ],
};
