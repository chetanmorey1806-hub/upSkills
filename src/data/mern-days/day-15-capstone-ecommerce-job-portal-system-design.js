export default {
  id: 'day-15-capstone-ecommerce-job-portal-system-design',
  title: 'Capstone: Build and Present a MERN E-commerce / Job Portal App + MERN System Design Interview Questions',
  module: 'Module 5: Capstone & Interview',
  day: 15,
  level: 'Advanced',
  duration: '4 hours (plus project time)',
  summary:
    'Plan, build, deploy and present a production-style MERN capstone (e-commerce store or job portal) using everything from this course: features, database schema, API list, pages, security, payments, real-time, testing and deployment checklist. Then prepare for MERN system-design and full-stack interview rounds with 30 questions and answers.',
  objectives: [
    'Turn a project idea into a scoped feature list (MVP vs nice-to-have) and user roles',
    'Design MongoDB schemas with the right embedding vs referencing decisions and indexes',
    'Write a clean REST API list and React page/route map with protected and admin areas',
    'Apply a deployment and security checklist and present the project with README, demo and resume bullets',
    'Answer MERN system-design questions: scaling, caching, real-time, payments, consistency and trade-offs',
  ],
  theory: [
    {
      heading: 'Choosing and scoping the capstone',
      content:
        'Pick **one** of these two (both are favourites of Indian product companies and service companies hiring MERN developers):\n\n**Option A: "ShopKart" e-commerce**\n- Customer: browse/search/filter products, product page with images and reviews, cart, address, checkout with **Razorpay**, order history, order status updates in real time, email receipts.\n- Admin: product CRUD with **Cloudinary** images, stock management, orders dashboard, change order status, sales summary.\n\n**Option B: "HireHub" job portal**\n- Candidate: profile, resume upload (PDF to Cloudinary), search jobs with filters (location, skills, salary, remote), apply once per job, track application status, real-time chat with recruiter.\n- Recruiter: company profile, post/edit/close jobs, view applicants, shortlist/reject, schedule interview, email notifications.\n- Admin: approve companies, block users, reports.\n\n**Scope like a professional**: write an **MVP** (minimum viable product) you can finish in 2-3 weeks, then a list of **stretch goals**. A finished, deployed, tested MVP impresses interviewers far more than a half-done "Amazon clone".\n\nAnalogy: building a house. First the foundation, walls and roof (auth, core CRUD, deploy). Painting and decoration (animations, dark mode, recommendations) come later.',
      points: [
        'MVP must include: auth with refresh tokens, role-based access, core CRUD, search/filter/pagination, one "wow" feature (payments or real-time), tests, CI and a live URL',
        'Stretch goals: Redis caching, wishlist, coupons, reviews with ratings aggregation, analytics charts, PWA',
        'Track work in GitHub Issues/Projects with small PRs; recruiters look at commit history',
      ],
    },
    {
      heading: 'Database schema design: embed or reference?',
      content:
        'MongoDB modelling rule: **design for how the data is read**.\n\n- **Embed** when the child data is small, belongs to one parent and is read together: order **items** (with a snapshot of name and price at purchase time), shipping **address** inside the order, a product\'s **images** array.\n- **Reference** (store ObjectId) when data is large, shared or grows without limit: `order.user`, `application.job` and `application.candidate`, reviews (could be thousands per product).\n- **Denormalise carefully**: store `ratingAvg` and `ratingCount` on the product, updated when a review is added, so listing pages do not aggregate every time.\n\nE-commerce collections: **users** (name, email unique, passwordHash, role: customer/admin, addresses[]), **products** (title, slug unique, description, price in paise, stock, category, images[{url, publicId}], ratingAvg, ratingCount, isActive), **orders** (user, items[{product, title, price, qty}], amounts {subtotal, shipping, tax, total}, address, status enum, payment {razorpayOrderId, razorpayPaymentId, status}, timestamps), **reviews** (product, user, rating, comment; unique index {product, user}), **carts** (optional; or keep cart in localStorage until checkout).\n\nJob portal collections: **users** (role: candidate/recruiter/admin), **companies**, **jobs** (company, title, skills[], location, salaryMin/Max, remote, status open/closed; text index), **applications** (job, candidate, resumeUrl, status applied/shortlisted/rejected/hired; **unique index {job, candidate}** prevents double applying), **messages** (conversation, sender, text, readAt).\n\n**Money**: store amounts as **integers in paise** (₹499.00 → 49900), exactly what Razorpay expects, to avoid floating-point errors.',
      tip: 'Never trust prices or totals from the client. The server reads product prices from MongoDB and computes the total; the client only sends product ids and quantities.',
    },
    {
      heading: 'API list and page map',
      content:
        'Write the API contract before coding; it becomes your README table and Postman collection.\n\n**E-commerce REST API (prefix /api)**\n\n- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`\n- Products: `GET /products?q=&category=&minPrice=&maxPrice=&sort=&cursor=`, `GET /products/:slug`, `POST /products` (admin), `PATCH /products/:id` (admin), `DELETE /products/:id` (admin, soft delete), `POST /uploads/signature` (admin, Cloudinary signed upload)\n- Reviews: `GET /products/:id/reviews`, `POST /products/:id/reviews` (customer who bought it)\n- Orders: `POST /orders` (creates order + Razorpay order), `POST /orders/:id/verify` (signature check), `GET /orders/mine`, `GET /orders/:id` (owner or admin), `GET /admin/orders`, `PATCH /admin/orders/:id/status`\n- Webhooks: `POST /webhooks/razorpay` (raw body, signature verified)\n- Health: `GET /health`, `GET /ready`\n\n**React pages (React Router 7)**: `/` home, `/products` listing with filters in URL search params, `/products/:slug`, `/cart`, `/checkout` (protected), `/orders` and `/orders/:id` (protected), `/login`, `/register`, `/admin` layout with `/admin/products`, `/admin/products/new`, `/admin/orders` (admin only), plus a 404 page.\n\nState: **TanStack Query** for server state (products, orders), a small **Zustand or Context** store for cart and auth user, URL search params for filters (shareable links).',
    },
    {
      heading: 'Architecture of the finished app',
      content:
        'The final architecture combines all modules of this course:\n\n1. **Browser** loads the React build from the **Vercel CDN** (myshop.in).\n2. API calls go to **api.myshop.in** (Render) or through a `/api` rewrite; access token in memory, refresh token in an **httpOnly Secure cookie**.\n3. **Express 5** app: helmet, CORS allow-list, rate limiting, request ids + pino logs, Zod validation, auth/RBAC middleware, controllers → services → Mongoose models.\n4. **MongoDB Atlas** (replica set) stores data; indexes for every listing query; transactions for stock + order creation if needed.\n5. **Redis** (Upstash/Redis Cloud) caches product lists and stores rate-limit counters; Socket.IO Redis adapter if you scale to multiple instances.\n6. **Cloudinary** stores images/resumes, delivered via its CDN with `f_auto,q_auto`.\n7. **Razorpay** for payments (order → checkout → signature verify → webhook as the source of truth).\n8. **Resend/Nodemailer** sends order confirmation and application-status emails (ideally from a background job).\n9. **Socket.IO** pushes order status / chat messages.\n10. **GitHub Actions** runs tests and deploys; **Sentry** + uptime monitor watch production.\n\nBeing able to draw this diagram and explain each arrow is exactly what interviewers ask for in the "explain your project" round.',
    },
    {
      heading: 'Deployment and quality checklist',
      content:
        'Before you share the link with recruiters, tick every item:\n\n**Security**: passwords hashed with bcrypt (cost 10-12); refresh token rotation; httpOnly + Secure cookies; helmet; CORS allow-list; rate limit on auth routes; Zod validation on every input; sanitised Mongo queries (no `$` operators from users); ownership checks on every `/:id` route; admin routes protected on the server; no secrets in the repo or in VITE_ vars; Razorpay signature verification.\n\n**Reliability**: central error handler; 404 handler; health/ready endpoints; graceful shutdown; env validation at startup; MongoDB indexes created; seed script.\n\n**Performance**: pagination everywhere; lean() + projections; images optimised; code splitting for admin; caching for public lists.\n\n**Quality**: ESLint + Prettier; API tests (auth, ownership, payments); a few React tests; one Playwright happy-path; CI green badge.\n\n**Deployment**: client on Vercel/Netlify with SPA rewrites; API on Render/Railway with health check path; Atlas user with least privilege; custom domain with HTTPS; Sentry + uptime monitor; demo accounts (customer + admin) with test-mode Razorpay.\n\n**Presentation**: README with screenshots/GIF, live links, tech stack, architecture diagram, features, API table, ER diagram, how to run locally (docker compose up), test commands, and "what I would improve next".',
    },
    {
      heading: 'How to present the project in interviews and on your resume',
      content:
        'Interviewers spend 2 minutes on your GitHub. Make those minutes count.\n\n**Resume bullets (action + tech + measurable result)**:\n\n- "Built ShopKart, a MERN e-commerce app (React 19, Express 5, MongoDB Atlas) with Razorpay payments, webhook-verified orders and Cloudinary image uploads; deployed on Vercel + Render with GitHub Actions CI/CD."\n- "Implemented JWT access/refresh-token auth with httpOnly cookies and rotation, RBAC for admin routes, and Zod validation shared by client and server."\n- "Reduced product-listing API latency from ~420 ms to ~35 ms using compound indexes, lean queries and Redis caching."\n- "Wrote 45 API tests (Jest, Supertest, mongodb-memory-server) and Playwright E2E for checkout; CI blocks merges on failures."\n\n**The 2-minute project pitch** (STAR-like): problem → your role → architecture (draw it) → one hard problem you solved (e.g. preventing double orders when the payment callback and webhook both arrive) → result/metrics → what you would improve.\n\nBe ready to open any file and explain it. Never claim features you cannot explain; interviewers will ask "show me where you verify the Razorpay signature".',
      tip: 'Keep demo credentials in the README (demo@shopkart.in / Demo@123 as a customer, a read-only admin account) and use Razorpay test mode, so reviewers can try the full flow without signing up or paying.',
    },
  ],
  examples: [
    {
      title: 'Capstone core logic: create an order with server-side pricing and stock checks',
      scenario:
        'The checkout endpoint of ShopKart. The client sends only product ids and quantities. The server looks up real prices, checks stock, computes totals in paise (with free shipping above ₹499) and rejects tampered or invalid carts.',
      steps: [
        'Keep products in memory with price in paise and stock',
        'Validate the items array (non-empty, qty integer 1-10)',
        'For each item load the product from the "DB"; 404 if missing, 409 if not enough stock',
        'Compute subtotal, shipping (₹40 under ₹499) and total on the server; ignore any price from the client',
        'Reserve stock and return the order; in real code this is followed by razorpay.orders.create',
      ],
      code: `// Real controller (Mongoose + Razorpay), simplified
export async function createOrder(req, res) {
  const { items, addressId } = orderInputSchema.parse(req.body);   // Zod: [{ productId, qty }]
  const ids = items.map(i => i.productId);
  const products = await Product.find({ _id: { $in: ids }, isActive: true }).select('title price stock').lean();
  const byId = new Map(products.map(p => [String(p._id), p]));

  const lines = items.map(({ productId, qty }) => {
    const p = byId.get(productId);
    if (!p) throw new AppError(404, 'Product not found: ' + productId);
    if (p.stock < qty) throw new AppError(409, p.title + ' has only ' + p.stock + ' left');
    return { product: p._id, title: p.title, price: p.price, qty };
  });
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const shipping = subtotal >= 49900 ? 0 : 4000;
  const total = subtotal + shipping;

  const rzpOrder = await razorpay.orders.create({ amount: total, currency: 'INR', receipt: 'rcpt_' + Date.now() });
  const order = await Order.create({
    user: req.user.id, items: lines, amounts: { subtotal, shipping, total },
    payment: { razorpayOrderId: rzpOrder.id, status: 'created' }, status: 'pending_payment',
  });
  res.status(201).json({ orderId: order._id, razorpayOrderId: rzpOrder.id, amount: total, currency: 'INR' });
}`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const products = {
  p1: { id: 'p1', title: 'Cotton Kurta', price: 59900, stock: 5 },   // price in paise (Rs 599)
  p2: { id: 'p2', title: 'Steel Bottle', price: 34900, stock: 1 },
  p3: { id: 'p3', title: 'Notebook', price: 9900, stock: 50 },
};
let nextOrder = 1001;

app.post('/api/orders', (req, res) => {
  const items = req.body && req.body.items;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array' });
  }
  const lines = [];
  for (const item of items) {
    if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > 10) {
      return res.status(400).json({ error: 'qty must be an integer from 1 to 10' });
    }
    const p = products[item.productId];
    if (!p) return res.status(404).json({ error: 'Product not found: ' + item.productId });
    if (p.stock < item.qty) return res.status(409).json({ error: p.title + ' has only ' + p.stock + ' left' });
    lines.push({ productId: p.id, title: p.title, price: p.price, qty: item.qty });  // server price!
  }
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const shipping = subtotal >= 49900 ? 0 : 4000;
  lines.forEach(l => { products[l.productId].stock -= l.qty; });                       // reserve stock
  res.status(201).json({ orderNo: 'SK' + nextOrder++, lines, amounts: { subtotal, shipping, total: subtotal + shipping }, currency: 'INR' });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/orders', body: { items: [{ productId: 'p1', qty: 1, price: 100 }] } },
          { method: 'POST', url: '/api/orders', body: { items: [{ productId: 'p3', qty: 2 }] } },
          { method: 'POST', url: '/api/orders', body: { items: [{ productId: 'p2', qty: 2 }] } },
          { method: 'POST', url: '/api/orders', body: { items: [{ productId: 'p9', qty: 1 }] } },
          { method: 'POST', url: '/api/orders', body: { items: [] } },
        ],
      },
      result: "POST /api/orders → 201 {\"orderNo\":\"SK1001\",\"lines\":[{\"productId\":\"p1\",\"title\":\"Cotton Kurta\",\"price\":59900,\"qty\":1}],\"amounts\":{\"subtotal\":59900,\"shipping\":0,\"total\":59900},\"currency\":\"INR\"}\nPOST /api/orders → 201 {\"orderNo\":\"SK1002\",\"lines\":[{\"productId\":\"p3\",\"title\":\"Notebook\",\"price\":9900,\"qty\":2}],\"amounts\":{\"subtotal\":19800,\"shipping\":4000,\"total\":23800},\"currency\":\"INR\"}\nPOST /api/orders → 409 {\"error\":\"Steel Bottle has only 1 left\"}\nPOST /api/orders → 404 {\"error\":\"Product not found: p9\"}\nPOST /api/orders → 400 {\"error\":\"items must be a non-empty array\"}",
      explanation:
        'Request 1 tried to cheat by sending price: 100, but the order uses the server price 59900 paise (₹599), and shipping is free because the subtotal is above ₹499. Request 2 (2 notebooks = ₹198) pays ₹40 shipping. Request 3 asks for 2 bottles but only 1 is in stock → 409 Conflict. Unknown product → 404, empty cart → 400. In production, stock reservation should be atomic: Product.updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } }) and check modifiedCount, or a MongoDB transaction for multiple items.',
    },
    {
      title: 'Job portal core logic: apply once, role checks and recruiter-only status updates',
      scenario:
        'HireHub. Candidates apply to open jobs only once; recruiters can update the status of applications only for their own jobs. The duplicate check mirrors a unique index on { job, candidate }.',
      steps: [
        'Simulate users with roles via an x-user header (stands in for the JWT payload)',
        'POST /api/jobs/:id/apply: candidate only, job must be open, reject duplicates with 409',
        'PATCH /api/applications/:id/status: recruiter only AND owner of the job (ownership check)',
        'Validate status against an allowed list',
        'Run the requests to see 201, 409, 403 and 200 cases',
      ],
      code: `// Mongoose: the database enforces "apply once"
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

try {
  const app = await Application.create({ job: job._id, candidate: req.user.id, resumeUrl });
  res.status(201).json(app);
} catch (e) {
  if (e.code === 11000) return res.status(409).json({ error: 'You have already applied to this job' });
  throw e;
}`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const users = { u1: { id: 'u1', role: 'candidate' }, r1: { id: 'r1', role: 'recruiter' }, r2: { id: 'r2', role: 'recruiter' } };
const jobs = { j1: { id: 'j1', title: 'MERN Developer', postedBy: 'r1', status: 'open' },
               j2: { id: 'j2', title: 'Intern', postedBy: 'r2', status: 'closed' } };
const applications = [];
const STATUSES = ['applied', 'shortlisted', 'rejected', 'hired'];

function auth(req, res, next) {
  req.user = users[req.headers['x-user']];          // real app: verify JWT
  if (!req.user) return res.status(401).json({ error: 'Login required' });
  next();
}
const allow = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden for role ' + req.user.role });

app.post('/api/jobs/:id/apply', auth, allow('candidate'), (req, res) => {
  const job = jobs[req.params.id];
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'open') return res.status(400).json({ error: 'Job is closed' });
  if (applications.some(a => a.job === job.id && a.candidate === req.user.id)) {
    return res.status(409).json({ error: 'You have already applied to this job' });
  }
  const application = { id: 'a' + (applications.length + 1), job: job.id, candidate: req.user.id, status: 'applied' };
  applications.push(application);
  res.status(201).json(application);
});

app.patch('/api/applications/:id/status', auth, allow('recruiter'), (req, res) => {
  const application = applications.find(a => a.id === req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });
  if (jobs[application.job].postedBy !== req.user.id) return res.status(403).json({ error: 'Not your job posting' });
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'status must be one of ' + STATUSES.join(', ') });
  application.status = status;
  res.json(application);
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/jobs/j1/apply', headers: { 'x-user': 'u1' } },
          { method: 'POST', url: '/api/jobs/j1/apply', headers: { 'x-user': 'u1' } },
          { method: 'POST', url: '/api/jobs/j2/apply', headers: { 'x-user': 'u1' } },
          { method: 'POST', url: '/api/jobs/j1/apply', headers: { 'x-user': 'r1' } },
          { method: 'PATCH', url: '/api/applications/a1/status', headers: { 'x-user': 'r2' }, body: { status: 'hired' } },
          { method: 'PATCH', url: '/api/applications/a1/status', headers: { 'x-user': 'r1' }, body: { status: 'shortlisted' } },
        ],
      },
      result: "POST /api/jobs/j1/apply → 201 {\"id\":\"a1\",\"job\":\"j1\",\"candidate\":\"u1\",\"status\":\"applied\"}\nPOST /api/jobs/j1/apply → 409 {\"error\":\"You have already applied to this job\"}\nPOST /api/jobs/j2/apply → 400 {\"error\":\"Job is closed\"}\nPOST /api/jobs/j1/apply → 403 {\"error\":\"Forbidden for role recruiter\"}\nPATCH /api/applications/a1/status → 403 {\"error\":\"Not your job posting\"}\nPATCH /api/applications/a1/status → 200 {\"id\":\"a1\",\"job\":\"j1\",\"candidate\":\"u1\",\"status\":\"shortlisted\"}",
      explanation:
        'The first apply succeeds (201); the same candidate applying again gets 409. The closed job returns 400. A recruiter trying to apply gets 403 from the role middleware (RBAC). Recruiter r2 is a recruiter but does not own job j1, so the ownership check returns 403; r1 owns it and can shortlist. Role checks answer "what kind of user are you?", ownership checks answer "is this YOUR resource?"; real apps need both.',
    },
    {
      title: 'Mongoose schemas for ShopKart (with indexes)',
      scenario: 'The complete data model for the e-commerce capstone, ready to paste into server/src/models.',
      steps: [
        'Create User, Product, Order and Review models',
        'Store money in paise as integers',
        'Embed order items (snapshot of title and price) and address',
        'Add indexes for login, listing, search and order history',
        'Run a seed script and check indexes in Atlas / Compass',
      ],
      code: `// server/src/models/User.js
import mongoose from 'mongoose';
const addressSchema = new mongoose.Schema({
  name: String, phone: String, line1: String, city: String, state: String,
  pincode: { type: String, match: /^[1-9][0-9]{5}$/ },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: [addressSchema],
  tokenVersion: { type: Number, default: 0 },      // bump to log out all sessions
}, { timestamps: true });
export const User = mongoose.model('User', userSchema);

// server/src/models/Product.js
const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true, min: 0 },          // paise
  stock: { type: Number, required: true, min: 0 },
  images: [{ url: String, publicId: String }],
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
productSchema.index({ category: 1, isActive: 1, price: 1 });
productSchema.index({ title: 'text', description: 'text' });
export const Product = mongoose.model('Product', productSchema);

// server/src/models/Order.js
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String, price: Number, qty: { type: Number, min: 1 },
  }],
  amounts: { subtotal: Number, shipping: Number, total: Number },
  address: addressSchema,
  status: {
    type: String,
    enum: ['pending_payment', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending_payment',
  },
  payment: {
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: String,
    status: { type: String, enum: ['created', 'captured', 'failed', 'refunded'], default: 'created' },
  },
}, { timestamps: true });
orderSchema.index({ user: 1, createdAt: -1 });              // "my orders" page
orderSchema.index({ status: 1, createdAt: -1 });            // admin dashboard
export const Order = mongoose.model('Order', orderSchema);

// server/src/models/Review.js
const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 1000 },
}, { timestamps: true });
reviewSchema.index({ product: 1, user: 1 }, { unique: true }); // one review per user per product
reviewSchema.index({ product: 1, createdAt: -1 });

reviewSchema.statics.recalc = async function (productId) {
  const [s] = await this.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.updateOne({ _id: productId }, {
    ratingAvg: s ? Math.round(s.avg * 10) / 10 : 0, ratingCount: s ? s.count : 0,
  });
};
reviewSchema.post('save', function () { this.constructor.recalc(this.product); });
export const Review = mongoose.model('Review', reviewSchema);`,
      result:
        'After seeding, Compass shows the indexes: users.email_1 (unique), products.slug_1 (unique), products.category_1_isActive_1_price_1, products text index, orders.user_1_createdAt_-1, reviews.product_1_user_1 (unique). Adding a second review by the same user fails with E11000, and adding a review updates ratingAvg/ratingCount on the product.',
      explanation:
        'Order items keep a snapshot of title and price because product prices change later but an old invoice must not. passwordHash uses select: false so it is never returned accidentally. The text index powers ?q= search; the compound index powers category listings sorted by price. ratingAvg is denormalised for fast listing pages and recalculated with an aggregation after each review.',
    },
    {
      title: 'Capstone UI: product listing with URL filters, cart and totals (React)',
      scenario:
        'The heart of the ShopKart frontend: filters stored in the URL-like state, a product grid, a cart with quantity controls and totals shown in rupees using the same paise logic as the server.',
      steps: [
        'Keep products (prices in paise) as the "API response"',
        'Hold filters (q, category, sort) in one state object, like useSearchParams in React Router',
        'Derive the visible list with useMemo',
        'Cart state: add, change qty, remove; compute subtotal, shipping (free above ₹499) and total',
        'Format paise to rupees with Intl.NumberFormat("en-IN")',
      ],
      code: `// In the real app, filters live in the URL so links are shareable
import { useSearchParams } from 'react-router';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

export function useProducts() {
  const [params] = useSearchParams();
  const filters = Object.fromEntries(params);       // { q, category, sort, cursor }
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.get('/products', { params: filters }).then(r => r.data),
    placeholderData: keepPreviousData,
  });
}`,
      playground: {
        jsx: `const { useState, useMemo } = React;

const PRODUCTS = [
  { id: 'p1', title: 'Cotton Kurta', category: 'fashion', price: 59900 },
  { id: 'p2', title: 'Steel Bottle', category: 'home', price: 34900 },
  { id: 'p3', title: 'Notebook (pack of 3)', category: 'stationery', price: 9900 },
  { id: 'p4', title: 'Denim Jacket', category: 'fashion', price: 149900 },
  { id: 'p5', title: 'Desk Lamp', category: 'home', price: 79900 },
];
const inr = (paise) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);

function App() {
  const [filters, setFilters] = useState({ q: '', category: 'all', sort: 'relevance' });
  const [cart, setCart] = useState({});           // { productId: qty }

  const visible = useMemo(() => {
    let list = PRODUCTS.filter(p =>
      p.title.toLowerCase().includes(filters.q.toLowerCase()) &&
      (filters.category === 'all' || p.category === filters.category));
    if (filters.sort === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
    if (filters.sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [filters]);

  const setQty = (id, qty) => setCart(c => {
    const next = { ...c };
    if (qty <= 0) delete next[id]; else next[id] = Math.min(qty, 10);
    return next;
  });

  const lines = Object.entries(cart).map(([id, qty]) => ({ ...PRODUCTS.find(p => p.id === id), qty }));
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 49900 ? 0 : 4000;
  const update = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }));
  const query = new URLSearchParams(filters).toString();

  return (
    <div style={{ fontFamily: 'sans-serif', display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)' }}>
      <section>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <input placeholder="Search" value={filters.q} onChange={update('q')} />
          <select value={filters.category} onChange={update('category')}>
            <option value="all">All</option><option value="fashion">Fashion</option>
            <option value="home">Home</option><option value="stationery">Stationery</option>
          </select>
          <select value={filters.sort} onChange={update('sort')}>
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>
        <small style={{ color: '#666' }}>URL: /products?{query}</small>
        {visible.length === 0 && <p>No products match.</p>}
        {visible.map(p => (
          <div key={p.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, marginTop: 8 }}>
            <b>{p.title}</b> <span style={{ color: '#888' }}>({p.category})</span>
            <div>{inr(p.price)} <button onClick={() => setQty(p.id, (cart[p.id] || 0) + 1)}>Add to cart</button></div>
          </div>
        ))}
      </section>
      <aside style={{ background: '#f6f7fb', borderRadius: 8, padding: 10 }}>
        <h3 style={{ marginTop: 0 }}>Cart</h3>
        {lines.length === 0 && <p>Cart is empty</p>}
        {lines.map(l => (
          <div key={l.id} style={{ marginBottom: 6 }}>
            {l.title}<br />
            <button onClick={() => setQty(l.id, l.qty - 1)}>-</button> {l.qty} <button onClick={() => setQty(l.id, l.qty + 1)}>+</button>
            {' '}{inr(l.price * l.qty)}
          </div>
        ))}
        <hr />
        <div>Subtotal: {inr(subtotal)}</div>
        <div>Shipping: {shipping ? inr(shipping) : 'FREE'}</div>
        <b>Total: {inr(subtotal + shipping)}</b>
        <p style={{ fontSize: 12, color: '#666' }}>The server recalculates this total; the client total is only for display.</p>
      </aside>
    </div>
  );
}`,
      },
      result:
        'Typing "lamp" shows only Desk Lamp; choosing "Price: high to low" puts Denim Jacket first and the URL line updates (e.g. /products?q=&category=all&sort=price_desc). Adding one Notebook shows Subtotal ₹99.00, Shipping ₹40.00, Total ₹139.00; adding a Cotton Kurta makes shipping FREE. Quantity cannot go above 10, and pressing - at 1 removes the line.',
      explanation:
        'All visible data is derived (useMemo, computed totals) instead of stored twice, which avoids out-of-sync bugs. Prices stay in paise until formatting, matching the server and Razorpay. In the real app the filters object is the URL search params (useSearchParams), so the TanStack Query key changes with the URL and users can bookmark or share filtered listings.',
    },
    {
      title: 'Project structure, README and go-live checklist',
      scenario: 'Organise the capstone repository so a reviewer can understand and run it in five minutes.',
      steps: [
        'Use an npm workspaces monorepo with client/ and server/',
        'Add compose.yaml for local MongoDB + Redis',
        'Write the README with the sections below',
        'Add the CI badge, live links and demo credentials',
        'Walk through the go-live checklist before sharing the link',
      ],
      code: `shopkart/
├─ package.json            # { "workspaces": ["client", "server"] }
├─ compose.yaml            # mongo, redis (dev) + server, client (prod-like)
├─ .github/workflows/      # ci.yml, deploy.yml
├─ e2e/                    # Playwright specs
├─ packages/shared/        # Zod schemas shared by client and server (optional workspace)
├─ client/
│  ├─ src/
│  │  ├─ api/              # axios instance, interceptors, resource hooks (useProducts, useOrders)
│  │  ├─ components/       # ProductCard, CartDrawer, Pagination, ProtectedRoute
│  │  ├─ pages/            # Home, Products, ProductDetail, Cart, Checkout, Orders, admin/*
│  │  ├─ store/            # auth + cart (Zustand/Context)
│  │  └─ main.jsx
│  └─ vercel.json
└─ server/
   ├─ src/
   │  ├─ config/env.js     # Zod-validated env
   │  ├─ models/           # User, Product, Order, Review
   │  ├─ routes/ controllers/ services/
   │  ├─ middleware/       # auth, rbac, validate, rateLimit, error, cache
   │  ├─ lib/              # db, redis, razorpay, cloudinary, mailer, logger, socket
   │  ├─ app.js  server.js
   ├─ scripts/seed.js
   └─ tests/

# README.md outline
# ShopKart: MERN e-commerce   [CI badge]
Live: https://shopkart.in  |  API: https://api.shopkart.in/api/health  |  Demo video: <link>
Demo login: demo@shopkart.in / Demo@123 (customer), admin@shopkart.in / Admin@123 (read-only admin)
Razorpay test card: 4111 1111 1111 1111, any future expiry, any CVV

## Features        (customer, admin; with screenshots / GIF)
## Tech stack      React 19, Vite, React Router 7, TanStack Query 5, Express 5, MongoDB Atlas, Mongoose 8, Redis, Socket.IO 4, Razorpay, Cloudinary, Resend, Jest, Playwright, Docker, GitHub Actions, Vercel, Render
## Architecture    (diagram image)
## Database schema (ER diagram + embed/reference decisions)
## API reference   (table: method, path, auth, description)
## Run locally     git clone ... && cp server/.env.example server/.env && docker compose up -d mongo redis && npm i && npm run dev
## Tests           npm test -w server | npm test -w client | npx playwright test
## Security notes  (auth flow, RBAC, validation, rate limits)
## What I would improve next

# Go-live checklist
[ ] All env vars set on Render/Vercel; env validation passes
[ ] Atlas: least-privilege user, network access, backups/alerts
[ ] CORS allow-list = production domains only; trust proxy set; cookies Secure
[ ] Razorpay webhook URL + secret configured; test payment end to end in test mode
[ ] Indexes built; seed data loaded; admin account created via script (not via public API)
[ ] Health check path set; uptime monitor + Sentry alerts working
[ ] Lighthouse mobile score checked; images optimised; admin code-split
[ ] README, demo video, live links, resume bullets updated`,
      result:
        'A reviewer opens the repo, sees a green CI badge, clicks the live link, logs in with the demo account, buys a product with a Razorpay test card, sees the order status change in real time and reads a clear README. That is a portfolio project that gets interview calls.',
      explanation:
        'A predictable structure (routes → controllers → services → models; api/ hooks/ pages/ on the client) shows you can work in a team codebase. The shared package lets one Zod schema validate forms in React and requests in Express. The checklist protects you from the most common production mistakes found in student projects: open CORS, missing indexes, secrets in the repo and unverified payments.',
    },
  ],
  interview: [
    {
      q: 'Walk me through what happens when a user clicks "Place order" in your MERN e-commerce app.',
      a: 'React sends POST /api/orders with product ids, quantities and address id using the axios instance (access token attached by an interceptor). Express runs helmet, CORS, rate limit, auth middleware (verify JWT) and Zod validation. The service loads products from MongoDB, checks stock, computes totals in paise on the server, creates a Razorpay order and saves our Order with status pending_payment. React opens Razorpay Checkout with the razorpay order id; on success it calls /api/orders/:id/verify with the payment id and signature; the server verifies the HMAC signature, marks the order paid, decrements stock atomically and queues a confirmation email. The Razorpay webhook (payment.captured) also confirms the payment idempotently, and Socket.IO notifies the admin dashboard.',
      level: 'Medium',
    },
    {
      q: 'How do you prevent overselling when two users buy the last item at the same time?',
      a: 'Make the stock update atomic and conditional: Product.updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } }) and treat modifiedCount 0 as out of stock. MongoDB applies single-document updates atomically, so only one request succeeds. For multi-item carts use a transaction (session.withTransaction) across the products and the order, or reserve stock with a TTL when the order is created and release it if payment is not completed.',
      level: 'Hard',
    },
    {
      q: 'Design the database for a job portal. What do you embed and what do you reference?',
      a: 'Collections: users (role candidate/recruiter/admin, embedded small profile, skills array), companies (referenced by recruiters and jobs), jobs (company ref, postedBy ref, title, skills[], location, salary range, remote flag, status; text index and compound indexes for filters), applications (job ref, candidate ref, resume snapshot url, status, timeline array embedded; unique index { job, candidate }), conversations and messages (referenced, since messages grow without limit). Embed small bounded data read together (status history, address); reference large, shared or unbounded data.',
      level: 'Medium',
    },
    {
      q: 'Your product listing API is slow under load. How do you investigate and fix it?',
      a: 'Measure first: response times in logs/APM, then explain("executionStats") on the query to find COLLSCAN or in-memory sorts. Fix with a compound index following ESR, projections and lean(), pagination with limits (cursor-based for deep pages), Redis caching for popular public listings with invalidation on product changes, and HTTP caching/CDN for static assets and images. Then load test (k6/autocannon) to confirm, and scale horizontally if CPU is the bottleneck.',
      level: 'Medium',
    },
    {
      q: 'How would you scale a MERN app from 1,000 to 1 million users?',
      a: 'Frontend on a CDN (already scales). Make the API stateless (JWT/refresh tokens and sessions in Redis, uploads in Cloudinary/S3) and run multiple instances behind a load balancer with autoscaling. MongoDB: proper indexes, Atlas replica set with read preference for analytics, then sharding on a good shard key for very large collections. Add Redis caching, a queue (BullMQ) for emails/image processing/webhooks, Socket.IO Redis adapter for real-time across instances, rate limiting, observability (logs, metrics, tracing) and gradual rollouts. Scale step by step based on measured bottlenecks, not all at once.',
      level: 'Hard',
    },
    {
      q: 'Where do you store the access token and refresh token in your app, and why?',
      a: 'The short-lived access token (e.g. 15 minutes) is kept in memory (React state/store) and sent in the Authorization header, so XSS cannot read it from storage and it disappears on tab close. The long-lived refresh token is in an httpOnly, Secure, SameSite cookie scoped to /api/auth, which JavaScript cannot read. On page load or a 401 the client calls /auth/refresh; the server rotates the refresh token and detects reuse. localStorage is avoided for tokens because any XSS can steal them.',
      level: 'Medium',
    },
    {
      q: 'How do you make payment confirmation reliable if the user closes the browser right after paying?',
      a: 'Never rely only on the browser callback. Configure a Razorpay webhook (payment.captured / order.paid) that hits POST /api/webhooks/razorpay; verify the X-Razorpay-Signature with the webhook secret over the raw body, find the order by razorpay_order_id and mark it paid idempotently (ignore if already paid, store processed event ids). Return 200 quickly and do heavy work in a background job. A periodic reconciliation job can also fetch payment status for orders stuck in pending_payment.',
      level: 'Hard',
    },
    {
      q: 'What is idempotency and where do you need it in a MERN app?',
      a: 'An idempotent operation gives the same result no matter how many times it is repeated. Needed for payment webhooks (Razorpay may retry), order creation (user double-clicks or the network retries) and email sending. Techniques: unique indexes (one order per idempotency key or razorpay order id), check-then-update with conditions (update where status = pending), storing processed webhook event ids, and Idempotency-Key headers on POST requests.',
      level: 'Hard',
    },
    {
      q: 'How would you implement real-time order status updates for customers?',
      a: 'Use Socket.IO with JWT authentication in the handshake (socket.handshake.auth.token). After connecting, the server joins the socket to a room per user (user:<id>). When an admin changes an order status, the controller saves it and emits io.to("user:" + order.user).emit("order:updated", {...}). The React client listens and updates the TanStack Query cache (queryClient.setQueryData or invalidateQueries). With multiple server instances, add the Redis adapter so emits reach sockets on any instance.',
      level: 'Medium',
    },
    {
      q: 'Should images be uploaded through your Express server or directly to Cloudinary?',
      a: 'Prefer direct signed uploads: the client asks the API for a signature (only authenticated users, with folder and constraints), uploads the file directly to Cloudinary, then sends the returned public_id/secure_url to the API to save. This saves server bandwidth and memory and scales better. Uploading through Express with multer is simpler and allows server-side validation of the file, but every byte passes through your server; then use memory or stream uploads and strict size/type limits.',
      level: 'Medium',
    },
    {
      q: 'How do you design search for a job portal or product catalogue?',
      a: 'Start with MongoDB text indexes or regex prefix search for small data, plus filters with compound indexes. For better relevance, typo tolerance, autocomplete and facets use MongoDB Atlas Search (Lucene-based, defined on the collection) or a dedicated engine like Elasticsearch/Meilisearch/Algolia synced from MongoDB via change streams. On the client debounce input, keep filters in URL params, and use cursor pagination or infinite scroll.',
      level: 'Hard',
    },
    {
      q: 'What is the difference between offset and cursor pagination and which would you use for an infinite-scroll feed?',
      a: 'Offset uses skip/limit (page numbers); simple but slow for deep pages because MongoDB still walks skipped documents, and results shift when new items are inserted. Cursor pagination uses the last seen sort key (e.g. createdAt + _id) in the next query: { $or: [{ createdAt: { $lt: c } }, { createdAt: c, _id: { $lt: id } }] }; it stays fast and stable. For infinite scroll use cursor pagination with useInfiniteQuery.',
      level: 'Medium',
    },
    {
      q: 'How do you handle errors consistently across the MERN stack?',
      a: 'Server: throw AppError(status, message) in services, Express 5 forwards async errors to one error middleware that maps Zod errors to 400, Mongo duplicate key 11000 to 409, CastError to 400, JWT errors to 401, and unknown errors to 500 with a generic message and request id, logged with pino and sent to Sentry. Client: the axios interceptor normalises errors, handles 401 with a refresh attempt, TanStack Query exposes error state to components, toasts show messages, and an error boundary catches render errors.',
      level: 'Medium',
    },
    {
      q: 'Explain RBAC plus ownership in your capstone.',
      a: 'RBAC: each user has a role (customer/admin or candidate/recruiter/admin) stored in MongoDB and included in the JWT; middleware like authorize("admin") protects admin routes. Ownership: for resource routes like GET /orders/:id the query includes the owner (Order.findOne({ _id, user: req.user.id })) unless the user is an admin. The React app hides admin links and uses a RequireRole route guard for UX, but security is always enforced on the server.',
      level: 'Easy',
    },
    {
      q: 'How do you share validation between React and Express?',
      a: 'Put Zod schemas in a shared workspace package (packages/shared) imported by both. The client uses them with React Hook Form via zodResolver for instant feedback; the server uses schema.parse in a validate middleware for security (client checks can be bypassed). The same schema also gives TypeScript types with z.infer, so client and server agree on the contract.',
      level: 'Easy',
    },
    {
      q: 'What would you cache in Redis for an e-commerce site, and what would you never cache in a shared key?',
      a: 'Cache public, read-heavy data: category lists, home page sections, product listing pages per filter, product details, configuration. Also use Redis for rate-limit counters, refresh-token/session data and queues. Never cache user-specific data (cart, orders, profile) under keys that do not include the user id, and do not cache stock counts for checkout decisions; checkout must read the database atomically.',
      level: 'Medium',
    },
    {
      q: 'How do you send emails without slowing down API responses?',
      a: 'Do not await a slow SMTP call inside the request. Push a job (e.g. BullMQ on Redis) with the email data; a worker process sends it via Resend/Nodemailer with retries and backoff, and logs failures. For simple apps, fire-and-forget with error logging works, but a queue survives server restarts and handles provider outages. Use templates (React Email/MJML) and track bounces via provider webhooks.',
      level: 'Medium',
    },
    {
      q: 'What are the trade-offs of putting the React app and API on the same domain vs different domains?',
      a: 'Same origin (API under /api through a proxy or rewrite): no CORS, first-party cookies with SameSite=Lax, simpler security; but you need a proxy layer and both must share routing. Different subdomains of one site (myshop.in + api.myshop.in): still same-site cookies, needs CORS with credentials. Completely different domains (vercel.app + onrender.com): third-party cookies, SameSite=None; Secure, browsers may block them; avoid for cookie-based auth.',
      level: 'Hard',
    },
    {
      q: 'How do you design notifications (email + in-app + real-time) in a job portal?',
      a: 'Create a notifications collection (user, type, data, readAt) and a NotificationService.notify(userId, type, data) that saves the record, emits to the user room via Socket.IO if online, and enqueues an email based on user preferences. The client shows a bell with unread count (TanStack Query + socket events), and marks notifications read with PATCH. Index { user: 1, readAt: 1, createdAt: -1 }. Batch digest emails to avoid spamming.',
      level: 'Hard',
    },
    {
      q: 'How would you implement a rate limiter that works across multiple server instances?',
      a: 'Store counters in Redis instead of process memory, e.g. express-rate-limit with rate-limit-redis, or a fixed/sliding window with INCR and EXPIRE per key (ip or user id + route). Apply stricter limits on login, OTP and password reset; set app.set("trust proxy", 1) so the real client IP is used. Return 429 with Retry-After. Add CAPTCHA after repeated failures.',
      level: 'Medium',
    },
    {
      q: 'What MongoDB features would you use for an admin sales dashboard?',
      a: 'Aggregation pipelines: $match on paid orders in a date range, $group by day ($dateToString with timezone "Asia/Kolkata") summing amounts.total and counting orders, $sort, and $lookup or $unwind for top products. Add an index on { status: 1, createdAt: -1 }. For heavy dashboards precompute daily stats into a summary collection with a scheduled job, or run analytics on a secondary/analytics node to avoid loading the primary.',
      level: 'Medium',
    },
    {
      q: 'How do you migrate a database schema safely in production?',
      a: 'Use expand-and-contract: first deploy code that writes both old and new fields and reads either, backfill existing documents with a migration script (migrate-mongo or a versioned script) in batches, then deploy code that uses only the new field, and finally remove the old field. Keep changes backward compatible with the previous app version so rollbacks are safe. Build new indexes before deploying queries that need them.',
      level: 'Hard',
    },
    {
      q: 'How do you secure file uploads such as resumes?',
      a: 'Allow only expected types (PDF, DOCX) by checking MIME type and extension, and verify magic bytes if uploading through the server; limit size (e.g. 2 MB); generate your own file names/public ids; store in Cloudinary/S3 with private or authenticated delivery for resumes and serve them via short-lived signed URLs only to the candidate and recruiters of that job; never execute or serve uploads from your app domain; scan for malware for sensitive platforms.',
      level: 'Medium',
    },
    {
      q: 'Monolith or microservices for your capstone? Justify.',
      a: 'A modular monolith: one Express app with clear modules (auth, products, orders, payments, notifications), one deployment, one database. For a small team it is simpler to develop, test, deploy and debug; no network calls between services or distributed transactions. Split out services later only when there is a clear need, e.g. a separate worker for emails/images or a real-time service, based on scaling or team boundaries.',
      level: 'Medium',
    },
    {
      q: 'How do you ensure your frontend and backend stay compatible during deployments?',
      a: 'Make API changes backward compatible (add fields, do not rename/remove in one step), version breaking changes (/api/v2 or new endpoints), deploy the API before the client, keep a shared contract (Zod schemas or OpenAPI) and tests on both sides, and handle unknown fields gracefully in the client. Vercel immutable deployments plus Render rollbacks let you revert quickly if something breaks.',
      level: 'Medium',
    },
    {
      q: 'Which metrics would you track after launching the app?',
      a: 'Technical: request rate, error rate (4xx/5xx), p95/p99 latency per route, MongoDB slow queries and connections, Redis hit ratio, Core Web Vitals (LCP, INP, CLS), frontend error count in Sentry, uptime. Business: sign-ups, conversion rate (cart → payment), payment failures, applications per job, daily active users. Alerts on error spikes, payment failures and downtime.',
      level: 'Easy',
    },
    {
      q: 'If you had two more weeks, what would you add to the capstone and why?',
      a: 'A good answer shows prioritisation: background jobs (BullMQ) for emails and webhooks to improve reliability; Atlas Search for better search; a recommendation section ("frequently bought together" via aggregation); accessibility and Lighthouse improvements; more E2E tests on payment edge cases; feature flags; and load testing with k6 to find limits. Explain the user or business value of each, not just the technology.',
      level: 'Easy',
    },
    {
      q: 'Why store money as integers in paise instead of floats?',
      a: 'Floating-point numbers cannot represent many decimals exactly (0.1 + 0.2 = 0.30000000000000004), which causes rounding bugs in totals, taxes and refunds. Integers in the smallest unit (paise) are exact. Razorpay also expects the amount in paise. Convert to rupees only for display with Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).',
      level: 'Easy',
    },
    {
      q: 'How do you protect the admin panel of a MERN app?',
      a: 'Server: every /api/admin route uses auth + authorize("admin") middleware; admins are created by a seed script or by another admin, never by public registration with a role field (whitelist fields to prevent mass assignment); stricter rate limits and audit logs for admin actions; optional 2FA. Client: lazy-loaded admin routes behind a RequireRole guard and hidden navigation, purely for UX. Optionally host the admin on a separate subdomain with IP restrictions.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Write the atomic stock reservation for a multi-item order using a MongoDB transaction with Mongoose.',
      hint: 'mongoose.startSession() + session.withTransaction(); conditional updateOne with $gte; throw to abort. Transactions need a replica set (Atlas or mongodb-memory-server replset).',
      solution: `import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { AppError } from '../utils/AppError.js';

export async function placeOrder(userId, items) {
  const session = await mongoose.startSession();
  try {
    let order;
    await session.withTransaction(async () => {
      const lines = [];
      for (const { productId, qty } of items) {
        const product = await Product.findOneAndUpdate(
          { _id: productId, isActive: true, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true, session, projection: 'title price stock' },
        );
        if (!product) throw new AppError(409, 'Out of stock: ' + productId);   // aborts, all changes rolled back
        lines.push({ product: product._id, title: product.title, price: product.price, qty });
      }
      const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
      const shipping = subtotal >= 49900 ? 0 : 4000;
      [order] = await Order.create([{
        user: userId, items: lines, amounts: { subtotal, shipping, total: subtotal + shipping },
      }], { session });
    });
    return order;
  } finally {
    await session.endSession();
  }
}`,
    },
    {
      task: 'Write the API list (method, path, auth, description) for the HireHub job portal MVP as a README table.',
      hint: 'Group by resource; mark roles: Public, Candidate, Recruiter, Admin.',
      solution: `| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register as candidate or recruiter (role whitelisted) |
| POST | /api/auth/login | Public | Login, returns access token + refresh cookie |
| POST | /api/auth/refresh | Cookie | Rotate refresh token, new access token |
| POST | /api/auth/logout | Cookie | Revoke refresh token, clear cookie |
| GET | /api/me | Any | Current user profile |
| PATCH | /api/me | Any | Update profile / skills |
| POST | /api/uploads/resume-signature | Candidate | Signed Cloudinary upload params for resume PDF |
| GET | /api/jobs?q=&location=&skills=&remote=&minSalary=&cursor= | Public | Search jobs with filters + cursor pagination |
| GET | /api/jobs/:id | Public | Job details |
| POST | /api/jobs | Recruiter | Create job (company of recruiter) |
| PATCH | /api/jobs/:id | Recruiter (owner) | Edit or close job |
| POST | /api/jobs/:id/apply | Candidate | Apply once (409 on duplicate) |
| GET | /api/applications/mine | Candidate | My applications with status |
| GET | /api/jobs/:id/applications | Recruiter (owner) | Applicants for my job |
| PATCH | /api/applications/:id/status | Recruiter (owner) | shortlisted / rejected / hired + email |
| GET | /api/conversations | Any | My chats |
| GET | /api/conversations/:id/messages?cursor= | Participant | Message history |
| GET | /api/admin/companies?status=pending | Admin | Companies to approve |
| PATCH | /api/admin/companies/:id | Admin | Approve / reject company |
| GET | /api/health, /api/ready | Public | Liveness / readiness |`,
    },
    {
      task: 'Write a React Router 7 route configuration for ShopKart with public pages, protected customer pages and lazy-loaded admin pages guarded by role.',
      hint: 'Use layout routes with a RequireAuth / RequireRole component that renders <Outlet /> or <Navigate />.',
      solution: `// client/src/router.jsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './store/auth';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import NotFound from './pages/NotFound';

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));

function RequireAuth() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <p>Checking session...</p>;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
function RequireRole({ role }) {
  const { user } = useAuth();
  return user?.role === role ? <Outlet /> : <p role="alert">Forbidden</p>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:slug', element: <ProductDetail /> },
      { path: 'cart', element: <Cart /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'checkout', element: <Checkout /> },
          { path: 'orders', element: <Orders /> },
          { path: 'orders/:id', element: <OrderDetail /> },
          {
            element: <RequireRole role="admin" />,
            children: [{
              path: 'admin',
              element: <Suspense fallback={<p>Loading admin...</p>}><AdminLayout /></Suspense>,
              children: [
                { index: true, element: <Navigate to="products" replace /> },
                { path: 'products', element: <AdminProducts /> },
                { path: 'products/new', element: <AdminProductForm /> },
                { path: 'products/:id/edit', element: <AdminProductForm /> },
                { path: 'orders', element: <AdminOrders /> },
              ],
            }],
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);`,
    },
    {
      task: 'Write an aggregation that returns daily revenue (in rupees) and order count for paid orders in the last 7 days, in Indian time, for the admin dashboard.',
      hint: '$match status + createdAt, $group by $dateToString with timezone "Asia/Kolkata", divide paise by 100.',
      solution: `export async function salesLast7Days(req, res) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await Order.aggregate([
    { $match: { status: { $in: ['paid', 'shipped', 'delivered'] }, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } },
        revenuePaise: { $sum: '$amounts.total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, day: '$_id', orders: 1, revenue: { $divide: ['$revenuePaise', 100] } } },
  ]);
  res.json(rows);   // [{ day: '2026-11-12', orders: 14, revenue: 18234.5 }, ...]
}
// index used by $match: orderSchema.index({ status: 1, createdAt: -1 })`,
    },
    {
      task: 'Prepare your 2-minute project pitch for the capstone in written form, following problem → architecture → hard problem → result → next steps.',
      hint: 'Use real numbers from your project (tests count, latency, Lighthouse score).',
      solution: `"I built ShopKart, a full-stack e-commerce app for small Indian clothing sellers who need a simple online store with UPI and card payments.

Architecture: a React 19 + Vite frontend on Vercel uses TanStack Query and calls an Express 5 API on Render. Data is in MongoDB Atlas (Mumbai region), images on Cloudinary, payments via Razorpay, and Redis caches product listings. Auth uses a 15-minute access token in memory and a rotating refresh token in an httpOnly cookie, with admin routes protected by RBAC.

The hardest problem was payment reliability: sometimes users closed the tab after paying, so orders stayed pending. I added a Razorpay webhook with signature verification and made order confirmation idempotent using the razorpay order id, plus an atomic stock update so two buyers cannot get the last item.

Results: listing API went from about 400 ms to 35 ms with a compound index, lean queries and caching; 48 API tests and 3 Playwright journeys run in GitHub Actions on every PR; Lighthouse mobile performance is 92.

Next, I would move emails and webhook processing to a BullMQ queue and add Atlas Search for typo-tolerant search."`,
    },
  ],
  quiz: [
    {
      question: 'Where should the final order total be calculated in a MERN e-commerce app?',
      options: [
        'In React, and sent to the server in the request body',
        'In Razorpay Checkout',
        'On the server using prices loaded from MongoDB',
        'In localStorage',
      ],
      answer: 2,
      explanation: 'Clients can be tampered with; the server must compute totals from trusted data. The client total is only for display.',
    },
    {
      question: 'Which index prevents a candidate from applying to the same job twice?',
      options: [
        'applicationSchema.index({ job: 1, candidate: 1 }, { unique: true })',
        'applicationSchema.index({ status: 1 })',
        'jobSchema.index({ title: "text" })',
        'userSchema.index({ email: 1 })',
      ],
      answer: 0,
      explanation: 'A unique compound index makes the database reject duplicates (error 11000), even under concurrent requests.',
    },
    {
      question: 'Why do order items store a snapshot of title and price?',
      options: [
        'To make the products collection smaller',
        'Because MongoDB cannot reference other collections',
        'To avoid needing an index on orders',
        'Because product details can change later, but an order must keep what the customer actually paid',
      ],
      answer: 3,
      explanation: 'Historical orders and invoices must stay correct even after price or name changes.',
    },
    {
      question: 'What is the most reliable way to confirm a Razorpay payment on the server?',
      options: [
        'Trust the success callback in the browser',
        'Verify the signature on the verify endpoint and also process the signed webhook idempotently',
        'Poll the frontend every second',
        'Ask the user to upload a screenshot',
      ],
      answer: 1,
      explanation: 'Signature verification proves authenticity; webhooks confirm payments even if the browser closes, and idempotency handles retries.',
    },
    {
      question: 'For a small team building the capstone, which architecture is usually the best starting point?',
      options: [
        'A modular monolith: one Express app with clear modules and one deployment',
        'Ten microservices, one per collection',
        'Serverless functions for every route with separate databases',
        'No backend; call MongoDB directly from React',
      ],
      answer: 0,
      explanation: 'A modular monolith is simpler to build, test and deploy; split services only when a measured need appears.',
    },
  ],
};
