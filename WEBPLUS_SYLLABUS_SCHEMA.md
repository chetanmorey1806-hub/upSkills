# Web Development add-on courses: Bootstrap 5, Node.js + Express, Next.js, Vue.js 3

Read /home/stn/Pictures/DayWise/EXcel_And_PoweBI/WEB_SYLLABUS_SCHEMA.md first: the lesson format, `playground` field, quality rules and
validation command are the SAME. This file adds the course folders, two extra example fields and the syllabi.

Folders (ONE file per lesson, `day-NN-<slug>.js`, field `day: N`):
- `src/data/bootstrap-days/` Bootstrap 5 (Day 1–15)
- `src/data/node-days/`      Node.js + Express (Day 1–30)
- `src/data/nextjs-days/`    Next.js (Day 1–20)
- `src/data/vue-days/`       Vue.js 3 (Day 1–25)

## Extra example fields
1. `playground.libs`: array of CDN libraries the Code Playground injects before your html/js:
   - `'bootstrap'` → Bootstrap 5.3.3 CSS + JS bundle (Popper included); `'bootstrap-icons'` → Bootstrap Icons 1.11.3
   - `'vue'` → Vue 3 global build (window.Vue). Vue playgrounds: put the template in `html` inside `<div id="app">…</div>` and in `js`
     call `const { createApp, ref, computed, … } = Vue; createApp({ setup() { … return {…} } }).mount('#app')` (no import statements, no .vue SFC files;
     show the real `.vue` single-file-component code in `code`).
   - React/Next.js demos keep using `playground: { jsx }` (React 18 globals, `function App()`, no imports) as in WEB_SYLLABUS_SCHEMA.md.
2. `api` (Node/Express lessons): runnable in the in-app **API Lab** (an Express simulator in the browser with a Postman-like request panel):
   ```js
   api: {
     code: `const express = require('express');\nconst app = express();\napp.use(express.json());\n…\napp.listen(3000, () => console.log('Server running on port 3000'));`,
     requests: [ { method: 'GET', url: '/api/students' }, { method: 'POST', url: '/api/students', body: { name: 'Asha' } } ],
   }
   ```
   The API Lab supports CommonJS `require` of: `express` (express(), express.json(), express.urlencoded(), express.Router(), app.use/get/post/put/patch/delete/all/route,
   route params, query, req.body/params/query/headers/method/path/url, res.status/json/send/set/sendStatus/end, next(), next(err),
   4-argument error-handling middleware, router mounting with prefixes), `path`, `events` (EventEmitter), `crypto` (randomUUID only), `util` (format only).
   No real network, database, files or other npm packages in `api` examples (use in-memory arrays/objects). Keep `code` deterministic (no Date.now/random in responses).
   **VERIFY with real Express**: in your own scratch folder run `npm init -y && npm install express`, start the exact `code` (change nothing except the port if needed),
   send each request with `fetch`/`curl`, and paste the REAL results into `result` in this format, one line per request:
   `GET /api/students → 200 [{"id":1,"name":"Asha"}]`
   For Node core lessons that are not HTTP (fs, events, streams, modules), give a runnable `node` script in `code` and verify it with `node` locally (paste real output).
   Database/auth/deployment lessons (MongoDB/Mongoose, MySQL, JWT with real libraries, Socket.io, deployment) show complete real code in `code`;
   add an `api` simulation with in-memory data when the HTTP behaviour can be demonstrated.

## Quality rules (in addition to WEB_SYLLABUS_SCHEMA.md)
- Current versions: Bootstrap 5.3, Node.js 22 LTS, Express 5 (mention Express 4 differences where relevant; code must run on Express 5 — e.g. async errors are forwarded automatically, `req.query` is read-only, path syntax `/*splat`), Mongoose 8, Next.js 15 App Router (React 19, Server Components, Server Actions, `next/navigation`), Vue 3.5 Composition API with `<script setup>`, Vue Router 4, Pinia 2/3.
- Every lesson: theory with clear explanations + analogies, 3–6 solved examples with steps, 8–12 interview Q&A (25–30+ on the final day), 4–6 practice tasks with full solutions, exactly 5 quiz MCQs.
- Validation command: the one in WEB_SYLLABUS_SCHEMA.md, BUT it requires `d.examples.some(e=>e.playground)`; for Node lessons accept `api` instead — use:
```
cd /home/stn/Pictures/DayWise/EXcel_And_PoweBI && for f in <your files>; do node --input-type=module -e "import('./$f').then(m=>{const d=m.default; const ok=d.id&&d.title&&d.module&&d.day&&d.theory?.length>=4&&d.examples?.length>=3&&d.examples.every(e=>Array.isArray(e.steps)&&e.steps.length)&&d.interview?.length>=8&&d.practice?.length>=4&&d.quiz?.length===5&&d.quiz.every(q=>q.options.length===4&&q.answer>=0&&q.answer<4); if(!ok) throw new Error('schema'); console.log('ok', d.id)})" || echo FAIL $f; done
```
Keep scratch files in your own uniquely named scratchpad subfolder. Touch only your own lesson files.

## Bootstrap 5 – 15 days
Module 1: Bootstrap Basics & Layout (Day 1–5)
1 Introduction to Bootstrap, Why Frameworks, Setup via CDN and npm, Starter Template
2 Containers, Grid System Basics: rows, columns, 12-column layout
3 Responsive Grid: breakpoints, column sizing, offsets, order, nesting, gutters
4 Typography, Colors, Backgrounds, Borders, Shadows
5 Utilities: spacing, sizing, display, flex, position, visibility
Module 2: Components (Day 6–12)
6 Buttons, Button Groups, Badges, Alerts, Spinners, Progress
7 Navbar and Navs/Tabs, Breadcrumbs, Pagination
8 Cards, List Groups, Images, Bootstrap Icons
9 Forms: inputs, selects, checks, input groups, floating labels, layout
10 Form Validation (HTML5 + Bootstrap styles + JS)
11 JavaScript Components: Modal, Offcanvas, Toasts, Tooltips, Popovers
12 Carousel, Accordion, Collapse, Dropdowns, Tables
Module 3: Professional Bootstrap (Day 13–15)
13 Customization: Sass variables, CSS variables, theming, color modes (dark mode)
14 Bootstrap with React (react-bootstrap) and Best Practices, Accessibility
15 Project: Responsive Landing Page + Admin Dashboard, Practical Test, Interview Questions (bigger: 25+ Q&A)

## Node.js + Express – 30 days
Module 1: Node.js Fundamentals (Day 1–8)
1 Introduction to Node.js: V8, event loop, non-blocking I/O, where Node is used
2 Installing Node, REPL, running scripts, npm, package.json, scripts, semantic versioning
3 Modules: CommonJS vs ES Modules, exports, require/import, built-in modules
4 Core Modules: path, os, url, process, environment variables (.env)
5 File System (fs): sync, callback and promise APIs, reading/writing JSON files
6 Events and EventEmitter; Callbacks, Promises and async/await in Node
7 Buffers and Streams (readable, writable, pipe)
8 The http Module: building a server without Express, routing by hand
Module 2: Express.js (Day 9–16)
9 Introduction to Express, first server, nodemon / node --watch
10 Routing: route methods, route parameters, query strings
11 Middleware: application-level, router-level, built-in, third-party (morgan, cors), custom
12 Request and Response objects, status codes, JSON APIs
13 express.Router and MVC folder structure (routes, controllers, services)
14 Error Handling: error middleware, async errors, 404 handler, custom error classes
15 Serving Static Files and Template Engines (EJS)
16 Building a Complete REST API (CRUD) with In-memory Data
Module 3: Databases (Day 17–21)
17 MongoDB Introduction, Atlas, Compass, Documents and Collections
18 Mongoose: schemas, models, validation
19 CRUD with Mongoose, Relationships and populate()
20 MySQL with Node (mysql2) and an ORM overview (Sequelize / Prisma)
21 Pagination, Filtering, Sorting and Search in APIs
Module 4: Authentication & Security (Day 22–25)
22 Password Hashing with bcrypt, Register and Login
23 JWT Authentication, Protected Routes, Role-based Authorization
24 Security: helmet, CORS, rate limiting, input validation (express-validator / zod), environment variables
25 File Uploads (multer) and Sending Emails (nodemailer)
Module 5: Advanced Node (Day 26–29)
26 Testing APIs with Jest and Supertest
27 Real-time Apps with Socket.io (WebSockets)
28 Performance: caching, compression, cluster, PM2, logging
29 Deployment: Render / Railway, environment config, MongoDB Atlas, CI basics
Module 6: Project (Day 30)
30 Final Project: Full-stack (React + Node/Express + MongoDB) Task Manager / E-commerce API, Practical Test, Interview Questions (30+ Q&A)

## Next.js – 20 days
Module 1: Next.js Basics (Day 1–6)
1 Introduction to Next.js: CSR vs SSR vs SSG vs ISR, why Next.js
2 Setup with create-next-app, Project Structure, App Router
3 File-based Routing, Pages, Layouts, Nested Layouts
4 Navigation: Link, useRouter, usePathname; Dynamic Routes and Route Groups
5 Server Components vs Client Components ("use client")
6 Styling: Global CSS, CSS Modules, Tailwind CSS
Module 2: Data & Rendering (Day 7–12)
7 Data Fetching in Server Components, fetch caching and revalidation
8 Rendering Strategies: static, dynamic, streaming with Suspense
9 Loading UI, Error Boundaries (error.js), not-found
10 Route Handlers (API routes) and REST APIs in Next.js
11 Server Actions and Forms (useActionState, revalidatePath)
12 Images, Fonts, Metadata API and SEO
Module 3: Full-stack Next.js (Day 13–17)
13 Databases with Prisma (or Mongoose) in Next.js
14 Authentication with Auth.js (NextAuth)
15 Middleware, Redirects and Rewrites
16 Client-side Data Fetching (SWR / TanStack Query) and State Management
17 Performance Optimization, Bundle Analysis, Caching layers
Module 4: Production (Day 18–20)
18 Testing Next.js apps (Jest / React Testing Library, Playwright overview)
19 Deployment on Vercel, Environment Variables, Edge vs Node runtime
20 Final Project: Full-stack Blog / Product Catalogue, Practical Test, Interview Questions (25+ Q&A)

## Vue.js 3 – 25 days
Module 1: Vue Basics (Day 1–7)
1 Introduction to Vue.js: progressive framework, Vue vs React vs Angular, using Vue via CDN and Vite
2 Template Syntax, Interpolation and Directives (v-bind, v-on, v-if, v-for, v-model, v-html)
3 Reactivity: ref and reactive
4 Computed Properties and Watchers (watch, watchEffect)
5 Class and Style Bindings
6 Conditional and List Rendering, keys
7 Event Handling and Form Input Bindings (v-model modifiers)
Module 2: Components (Day 8–14)
8 Components and Props
9 Emitting Events and Component v-model (defineModel)
10 Slots: default, named, scoped
11 Provide / Inject
12 Lifecycle Hooks
13 Composition API vs Options API, <script setup>
14 Composables (reusable logic)
Module 3: Building Apps (Day 15–21)
15 Template Refs and Custom Directives
16 Vue Router: setup, routes, RouterLink, RouterView
17 Vue Router: dynamic routes, nested routes, navigation guards
18 State Management with Pinia
19 API Calls with fetch / axios, loading and error states
20 Transitions and Animations
21 Form Validation (VeeValidate + zod/yup)
Module 4: Professional Vue (Day 22–25)
22 TypeScript with Vue
23 Testing Vue Components (Vitest + Vue Test Utils)
24 Nuxt Introduction, Build and Deployment
25 Final Project: Vue + Pinia + Router app (e.g. Expense Tracker / Movie App), Practical Test, Interview Questions (25+ Q&A)
