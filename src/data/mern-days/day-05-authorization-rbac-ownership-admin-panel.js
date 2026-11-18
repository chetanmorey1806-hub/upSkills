export default {
  id: 'day-05-authorization-rbac-ownership-admin-panel',
  title: 'Authorization: Roles and Permissions (RBAC), Ownership Checks and an Admin Panel',
  module: 'Module 2: Auth & Security',
  day: 5,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Decide WHAT a logged-in user may do. Define roles and permissions once in a shared module, enforce them with Express middleware and ownership checks (no IDOR bugs), mirror them in React to show or hide UI, and build a safe admin panel to manage users and roles.',
  objectives: [
    'Differentiate authentication, role checks, permission checks and ownership checks',
    'Design a role → permissions map shared by server and client',
    'Write authorize(permission) middleware and ownership-scoped queries in Express 5',
    'Build an admin panel API (list users, change role, ban) with safety rules (no self-demotion, keep at least one admin)',
    'Use a <Can> component, usePermission hook and role-protected routes in React',
  ],
  theory: [
    {
      heading: 'Authentication vs authorization (and the four questions)',
      content:
        '**Authentication** (Day 4) answers "**Who are you?**". **Authorization** answers "**What are you allowed to do?**". Every protected request in a MERN app should go through four checks, in order:\n\n1. **Is the user logged in?** → otherwise **401 Unauthorized** (badly named; it really means "unauthenticated").\n2. **Does the user\'s role have this permission?** (e.g. `product:create`) → otherwise **403 Forbidden**.\n3. **Does the user own this resource** (or have an override like admin)? → otherwise **404** (hide existence) or **403**.\n4. **Is the action valid in the current state?** (cannot cancel a delivered order) → **409 Conflict** / 400.\n\nAnalogy: an office building. The **ID card at the gate** is authentication. The **access level on the card** (employee, manager, security) is the role. Being allowed into **your own cabin but not your colleague\'s** is ownership. Even the manager cannot "unsend" a payment that was already processed: that is a state rule.',
      points: [
        '401 = we do not know who you are; 403 = we know you, but no',
        'Authorization MUST happen on the server; React only hides buttons',
        'Broken Access Control is #1 in the OWASP Top 10 (2021 and 2025 lists)',
      ],
    },
    {
      heading: 'RBAC: roles and permissions',
      content:
        '**Role-Based Access Control (RBAC)** gives each user a **role** (`customer`, `seller`, `admin`), and each role a list of **permissions** (`product:create`, `order:read:any`, `user:manage`).\n\nWhy check **permissions** instead of role names? If your code says `if (role === \'admin\' || role === \'manager\')` in 30 places, adding a new role means editing 30 places. If code says `can(user, \'order:refund\')` and the **map** decides which roles have it, a new role is a one-line change.\n\nConvention for permission names: `resource:action[:scope]`, where scope `own` means "only my documents" and `any` means "everyone\'s".\n\nPut the map in the **shared package** so React and Express read the same rules. Keep the **role on the user document** in MongoDB and in the access-token payload (so `requireAuth` can fill `req.user.role` without a DB call). Because the token lives 15 minutes, a role change takes effect at the next refresh; for immediate effect, also revoke the user\'s refresh tokens.',
      syntax:
        "// packages/shared/src/permissions.js\nexport const ROLES = ['customer', 'seller', 'admin'];\n\nexport const PERMISSIONS = {\n  customer: ['product:read', 'order:create', 'order:read:own', 'review:create'],\n  seller:   ['product:read', 'product:create', 'product:update:own', 'product:delete:own', 'order:read:own'],\n  admin:    ['*'],                               // wildcard: everything\n};\n\nexport function can(user, permission) {\n  if (!user) return false;\n  const perms = PERMISSIONS[user.role] || [];\n  return perms.includes('*') || perms.includes(permission);\n}",
    },
    {
      heading: 'Ownership checks and IDOR',
      content:
        'Role checks are not enough. A seller has `product:update:own`, but **which** products are theirs? If your route is `PATCH /api/products/:id` and you only check the role, seller A can edit seller B\'s product by changing the id in the URL. This bug is called **IDOR (Insecure Direct Object Reference)** and it is one of the most common findings in real bug-bounty reports.\n\nTwo safe patterns:\n\n1. **Scoped queries** (best): include the owner in the filter. `Product.findOneAndUpdate({ _id: id, seller: req.user.id }, ...)`. If it returns null, respond **404**. The attacker cannot even learn that the id exists.\n2. **Load then check**: `const p = await Product.findById(id); if (!p) 404; if (!p.seller.equals(req.user.id) && !can(req.user, \'product:update:any\')) 403;`. Useful when admins have an override or when the rule is complex.\n\nAlso watch **list endpoints**: `GET /api/orders` must return `find({ user: req.user.id })` for customers, never all orders with a client-side filter. And never trust an owner id sent in the body (`req.body.user`); always take it from `req.user`.',
      tip: 'Compare ObjectIds with doc.seller.equals(id) or String(doc.seller) === id. Using === between an ObjectId and a string is always false, which can lock out real owners or, with a negated condition, let everyone in.',
    },
    {
      heading: 'Authorization middleware in Express 5',
      content:
        'Build small, composable middleware:\n\n- `requireAuth` (Day 4) → sets `req.user = { id, role }` or 401.\n- `authorize(...permissions)` → 403 unless the user has **at least one** of them.\n- `loadAndAuthorize` style helpers or **service functions** that take the user and apply ownership rules.\n\nWhere should ownership live? In the **service layer**, because the same rule applies whether the request comes from REST, a Socket.IO event or a background job. Example: `productService.update(user, id, data)` builds the filter `{ _id: id, ...(can(user, \'product:update:any\') ? {} : { seller: user.id }) }`.\n\nOrder on a route: `router.patch(\'/:id\', requireAuth, authorize(\'product:update:own\', \'product:update:any\'), validate(schema), controller.update)`.',
      syntax:
        "export const authorize = (...required) => (req, res, next) => {\n  if (!req.user) return res.status(401).json({ message: 'Authentication required' });\n  if (!required.some((p) => can(req.user, p)))\n    return res.status(403).json({ message: 'You do not have permission to do this' });\n  next();\n};",
    },
    {
      heading: 'Designing a safe admin panel',
      content:
        'An admin panel is a set of normal pages backed by `/api/admin/*` routes with `router.use(requireAuth, authorize(\'user:manage\'))` at the top. Typical features: **users table** (search, paginate, filter by role), **change role**, **ban/unban**, **view orders**, **dashboard stats** (aggregation).\n\nSafety rules that interviewers love:\n\n- An admin **cannot change their own role or ban themselves** (prevents accidental lock-out).\n- Never demote/delete the **last admin**.\n- Banning or changing role must **revoke the user\'s refresh tokens** so the change applies quickly.\n- Log every admin action (**audit log**: who, what, when, before/after).\n- Admin routes return **only needed fields** (`select(\'name email role isBanned createdAt\')`): never password hashes.\n- Create the **first admin** with a one-time seed script or a CLI command, never with a public "register as admin" checkbox.',
      points: [
        'Mass-assignment defence: a normal PATCH /api/users/me must never accept "role"',
        'Return 404 for /api/admin/* to non-admins if you want to hide the admin API (optional)',
        'Rate limit and 2FA for admin accounts in real products',
      ],
    },
    {
      heading: 'Mirroring permissions in React',
      content:
        'In React, use the **same `can()` function** from the shared package:\n\n- `usePermission(\'product:create\')` → boolean from the auth context user.\n- `<Can perform="product:create">...</Can>` → renders children only when allowed (optionally a fallback).\n- `<RequirePermission permission="user:manage" />` → a layout route that shows a "403 - Not allowed" page or redirects.\n- Hide the **Admin** link in the navbar for non-admins; lazy-load the admin bundle with `React.lazy` so normal users never download admin code.\n\nFor ownership in the UI: show "Edit" only if `can(user, \'product:update:any\') || product.seller === user.id`.\n\nAgain: this is UX. If a curious user flips a boolean in React DevTools and sees the Delete button, the server must still answer 403/404.',
    },
  ],
  examples: [
    {
      title: 'RBAC + ownership on a products API (API Lab)',
      scenario:
        'Customers can read products, sellers can create and edit ONLY their own, admins can edit and delete anything. The API Lab has no JWT library, so requireAuth reads a demo header x-demo-user; in the real app it is the Day 4 JWT middleware.',
      steps: [
        'Define the PERMISSIONS map and the can() helper',
        'Write requireAuth (demo header) and authorize(...perms)',
        'Write a scoped update that adds { seller: user.id } unless the user has product:update:any',
        'Run requests as anonymous, customer, seller s1, seller s2 and admin',
      ],
      code: `// Real requireAuth (Day 4) sets req.user from the verified JWT:
// req.user = { id: payload.sub, role: payload.role }
// Everything else in this example is identical in production, except the in-memory array
// becomes: Product.findOneAndUpdate(filter, update, { new: true, runValidators: true })`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const PERMISSIONS = {
  customer: ['product:read'],
  seller: ['product:read', 'product:create', 'product:update:own', 'product:delete:own'],
  admin: ['*'],
};
const can = (user, p) => !!user && ((PERMISSIONS[user.role] || []).includes('*') || (PERMISSIONS[user.role] || []).includes(p));

const users = { c1: { id: 'c1', role: 'customer' }, s1: { id: 's1', role: 'seller' }, s2: { id: 's2', role: 'seller' }, a1: { id: 'a1', role: 'admin' } };
let products = [
  { _id: 'p1', name: 'Handmade Mug', price: 349, seller: 's1' },
  { _id: 'p2', name: 'Block-print Kurta', price: 1299, seller: 's2' },
];
let seq = 3;

// DEMO auth: real app verifies a JWT here
function requireAuth(req, res, next) {
  const user = users[req.headers['x-demo-user']];
  if (!user) return res.status(401).json({ message: 'Authentication required' });
  req.user = user;
  next();
}
const authorize = (...perms) => (req, res, next) =>
  perms.some(p => can(req.user, p)) ? next() : res.status(403).json({ message: 'Forbidden: needs ' + perms.join(' or ') });

// service: ownership rule lives here
function ownedFilter(user, id, action) {
  return can(user, 'product:' + action + ':any') ? { _id: id } : { _id: id, seller: user.id };
}
const findOne = (f) => products.find(p => Object.entries(f).every(([k, v]) => p[k] === v));

app.get('/api/products', (req, res) => res.json(products));

app.post('/api/products', requireAuth, authorize('product:create'), (req, res) => {
  const p = { _id: 'p' + seq++, name: req.body.name, price: req.body.price, seller: req.user.id }; // owner from token, never from body
  products.push(p);
  res.status(201).json(p);
});

app.patch('/api/products/:id', requireAuth, authorize('product:update:own', 'product:update:any'), (req, res) => {
  const p = findOne(ownedFilter(req.user, req.params.id, 'update'));
  if (!p) return res.status(404).json({ message: 'Product not found' });
  if (req.body.price !== undefined) p.price = req.body.price;
  if (req.body.name !== undefined) p.name = req.body.name;
  res.json(p);
});

app.delete('/api/products/:id', requireAuth, authorize('product:delete:own', 'product:delete:any'), (req, res) => {
  const p = findOne(ownedFilter(req.user, req.params.id, 'delete'));
  if (!p) return res.status(404).json({ message: 'Product not found' });
  products = products.filter(x => x !== p);
  res.sendStatus(204);
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/products', body: { name: 'Hack', price: 1 } },
          { method: 'POST', url: '/api/products', headers: { 'x-demo-user': 'c1' }, body: { name: 'Hack', price: 1 } },
          { method: 'POST', url: '/api/products', headers: { 'x-demo-user': 's1' }, body: { name: 'Brass Diya', price: 499, seller: 's2' } },
          { method: 'PATCH', url: '/api/products/p2', headers: { 'x-demo-user': 's1' }, body: { price: 1 } },
          { method: 'PATCH', url: '/api/products/p1', headers: { 'x-demo-user': 's1' }, body: { price: 399 } },
          { method: 'DELETE', url: '/api/products/p2', headers: { 'x-demo-user': 'a1' } },
          { method: 'GET', url: '/api/products' },
        ],
      },
      result: "POST /api/products → 401 {\"message\":\"Authentication required\"}\nPOST /api/products → 403 {\"message\":\"Forbidden: needs product:create\"}\nPOST /api/products → 201 {\"_id\":\"p3\",\"name\":\"Brass Diya\",\"price\":499,\"seller\":\"s1\"}\nPATCH /api/products/p2 → 404 {\"message\":\"Product not found\"}\nPATCH /api/products/p1 → 200 {\"_id\":\"p1\",\"name\":\"Handmade Mug\",\"price\":399,\"seller\":\"s1\"}\nDELETE /api/products/p2 → 204\nGET /api/products → 200 [{\"_id\":\"p1\",\"name\":\"Handmade Mug\",\"price\":399,\"seller\":\"s1\"},{\"_id\":\"p3\",\"name\":\"Brass Diya\",\"price\":499,\"seller\":\"s1\"}]",
      explanation:
        'Anonymous → 401, customer → 403 (logged in but lacks product:create). Seller s1 tried to set seller: "s2" in the body, but the server ignores it and uses req.user.id, so the new product belongs to s1 (mass-assignment defence). s1 editing s2\'s kurta gets 404, not 403: the scoped filter { _id, seller: "s1" } simply finds nothing, so the attacker learns nothing. The admin has "*" and therefore product:delete:any, so the filter drops the seller condition and the delete succeeds.',
    },
    {
      title: 'Admin API with safety rules: change role, ban, last-admin protection (API Lab)',
      scenario:
        'Build /api/admin/users endpoints. Rules: only user:manage may call them, admins cannot change their own role or ban themselves, the last admin cannot be demoted, and role/ban changes revoke the user\'s sessions.',
      steps: [
        'Protect the whole admin router with requireAuth + authorize("user:manage")',
        'GET /users supports ?role= filter and returns safe fields only',
        'PATCH /users/:id/role validates the role and applies the safety rules',
        'PATCH /users/:id/ban bans and revokes sessions',
        'Run the requests in order and read each status code',
      ],
      code: `// Real implementation of the role change with Mongoose
export async function changeRole(req, res) {
  const { role } = req.body;
  if (!ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' });
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot change your own role' });

  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });
  if (target.role === 'admin' && role !== 'admin' && (await User.countDocuments({ role: 'admin' })) <= 1)
    return res.status(409).json({ message: 'Cannot demote the last admin' });

  const before = target.role;
  target.role = role;
  await target.save();
  await revokeAllForUser(target._id);                       // new role on next login/refresh
  await AuditLog.create({ actor: req.user.id, action: 'user.role.change', target: target._id, before, after: role });
  res.json({ id: target._id, role: target.role });
}`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const ROLES = ['customer', 'seller', 'admin'];
const users = [
  { id: 'a1', name: 'Admin Anil', email: 'anil@shop.in', role: 'admin', isBanned: false, passwordHash: 'x' },
  { id: 's1', name: 'Seller Sita', email: 'sita@shop.in', role: 'seller', isBanned: false, passwordHash: 'x' },
  { id: 'c1', name: 'Customer Ravi', email: 'ravi@shop.in', role: 'customer', isBanned: false, passwordHash: 'x' },
];
const sessions = { a1: 2, s1: 1, c1: 3 };   // active refresh tokens per user
const audit = [];

function requireAuth(req, res, next) {      // DEMO: real app verifies JWT
  const u = users.find(x => x.id === req.headers['x-demo-user']);
  if (!u || u.isBanned) return res.status(401).json({ message: 'Authentication required' });
  req.user = { id: u.id, role: u.role };
  next();
}
const authorize = (perm) => (req, res, next) =>
  req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Forbidden: needs ' + perm });
const safe = ({ passwordHash, ...rest }) => rest;

const admin = express.Router();
admin.use(requireAuth, authorize('user:manage'));

admin.get('/users', (req, res) => {
  const list = req.query.role ? users.filter(u => u.role === req.query.role) : users;
  res.json({ data: list.map(safe), total: list.length });
});

admin.patch('/users/:id/role', (req, res) => {
  const { role } = req.body;
  if (!ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' });
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot change your own role' });
  const target = users.find(u => u.id === req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });
  if (target.role === 'admin' && role !== 'admin' && users.filter(u => u.role === 'admin').length <= 1)
    return res.status(409).json({ message: 'Cannot demote the last admin' });
  audit.push({ actor: req.user.id, action: 'role', target: target.id, before: target.role, after: role });
  target.role = role;
  sessions[target.id] = 0;                  // revoke refresh tokens
  res.json({ ...safe(target), activeSessions: sessions[target.id] });
});

admin.patch('/users/:id/ban', (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot ban yourself' });
  const target = users.find(u => u.id === req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });
  target.isBanned = true;
  sessions[target.id] = 0;
  audit.push({ actor: req.user.id, action: 'ban', target: target.id });
  res.json({ ...safe(target), activeSessions: 0 });
});

admin.get('/audit', (req, res) => res.json(audit));

app.use('/api/admin', admin);
app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/admin/users', headers: { 'x-demo-user': 's1' } },
          { method: 'GET', url: '/api/admin/users?role=seller', headers: { 'x-demo-user': 'a1' } },
          { method: 'PATCH', url: '/api/admin/users/a1/role', headers: { 'x-demo-user': 'a1' }, body: { role: 'customer' } },
          { method: 'PATCH', url: '/api/admin/users/c1/role', headers: { 'x-demo-user': 'a1' }, body: { role: 'superadmin' } },
          { method: 'PATCH', url: '/api/admin/users/s1/role', headers: { 'x-demo-user': 'a1' }, body: { role: 'admin' } },
          { method: 'PATCH', url: '/api/admin/users/c1/ban', headers: { 'x-demo-user': 'a1' } },
          { method: 'GET', url: '/api/admin/users', headers: { 'x-demo-user': 'c1' } },
          { method: 'PATCH', url: '/api/admin/users/a1/role', headers: { 'x-demo-user': 's1' }, body: { role: 'customer' } },
          { method: 'GET', url: '/api/admin/audit', headers: { 'x-demo-user': 's1' } },
        ],
      },
      result: "GET /api/admin/users → 403 {\"message\":\"Forbidden: needs user:manage\"}\nGET /api/admin/users?role=seller → 200 {\"data\":[{\"id\":\"s1\",\"name\":\"Seller Sita\",\"email\":\"sita@shop.in\",\"role\":\"seller\",\"isBanned\":false}],\"total\":1}\nPATCH /api/admin/users/a1/role → 400 {\"message\":\"You cannot change your own role\"}\nPATCH /api/admin/users/c1/role → 400 {\"message\":\"Invalid role\"}\nPATCH /api/admin/users/s1/role → 200 {\"id\":\"s1\",\"name\":\"Seller Sita\",\"email\":\"sita@shop.in\",\"role\":\"admin\",\"isBanned\":false,\"activeSessions\":0}\nPATCH /api/admin/users/c1/ban → 200 {\"id\":\"c1\",\"name\":\"Customer Ravi\",\"email\":\"ravi@shop.in\",\"role\":\"customer\",\"isBanned\":true,\"activeSessions\":0}\nGET /api/admin/users → 401 {\"message\":\"Authentication required\"}\nPATCH /api/admin/users/a1/role → 200 {\"id\":\"a1\",\"name\":\"Admin Anil\",\"email\":\"anil@shop.in\",\"role\":\"customer\",\"isBanned\":false,\"activeSessions\":0}\nGET /api/admin/audit → 200 [{\"actor\":\"a1\",\"action\":\"role\",\"target\":\"s1\",\"before\":\"seller\",\"after\":\"admin\"},{\"actor\":\"a1\",\"action\":\"ban\",\"target\":\"c1\"},{\"actor\":\"s1\",\"action\":\"role\",\"target\":\"a1\",\"before\":\"admin\",\"after\":\"customer\"}]",
      explanation:
        'The seller gets 403 on the admin router because authorize runs before any admin route. The admin cannot demote themselves (400) and "superadmin" is not a valid role (400). Promoting s1 to admin succeeds and revokes s1\'s sessions (activeSessions: 0) so the new role is picked up at the next login. The banned customer is rejected with 401 immediately. Then s1 (now an admin) demotes a1, which is allowed because a1 is no longer the last admin. The demo requireAuth reads the role live from the users array; with real JWTs, s1\'s old 15-minute token would still say "seller" until it expires, which is why role changes revoke sessions. The audit log records every change. passwordHash never leaves the server because of safe().',
    },
    {
      title: 'Production server code: shared permissions, middleware, scoped service, admin routes',
      scenario: 'Organise authorization code so the same rules work for REST controllers, sockets and jobs.',
      steps: [
        'Add permissions.js to packages/shared and export can()',
        'Create middleware/authorize.js',
        'Put ownership filters in services/product.service.js',
        'Create routes/admin.routes.js with pagination and search',
        'Write scripts/create-admin.js to seed the first admin',
      ],
      code: `// ===== packages/shared/src/permissions.js =====
export const ROLES = ['customer', 'seller', 'admin'];
export const PERMISSIONS = {
  customer: ['product:read', 'order:create', 'order:read:own', 'order:cancel:own', 'review:create'],
  seller: ['product:read', 'product:create', 'product:update:own', 'product:delete:own', 'order:read:own'],
  admin: ['*'],
};
export const can = (user, permission) => {
  const perms = PERMISSIONS[user?.role] ?? [];
  return perms.includes('*') || perms.includes(permission);
};

// ===== server/src/middleware/authorize.js =====
import { can } from '@mernshop/shared';
export const authorize = (...required) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  if (!required.some((p) => can(req.user, p))) return res.status(403).json({ message: 'Forbidden' });
  next();
};

// ===== server/src/services/product.service.js =====
import { can } from '@mernshop/shared';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';

const scope = (user, action, id) =>
  can(user, 'product:' + action + ':any') ? { _id: id } : { _id: id, seller: user.id };

export async function updateProduct(user, id, data) {
  const p = await Product.findOneAndUpdate(scope(user, 'update', id), data, { new: true, runValidators: true });
  if (!p) throw new AppError(404, 'Product not found');
  return p;
}
export async function deleteProduct(user, id) {
  const r = await Product.deleteOne(scope(user, 'delete', id));
  if (!r.deletedCount) throw new AppError(404, 'Product not found');
}

// ===== server/src/routes/product.routes.js =====
router.post('/', requireAuth, authorize('product:create'), validate(productSchema),
  async (req, res) => res.status(201).json(await Product.create({ ...req.body, seller: req.user.id })));
router.patch('/:id', requireAuth, authorize('product:update:own', 'product:update:any'), validate(productUpdateSchema),
  async (req, res) => res.json(await productService.updateProduct(req.user, req.params.id, req.body)));
router.delete('/:id', requireAuth, authorize('product:delete:own', 'product:delete:any'),
  async (req, res) => { await productService.deleteProduct(req.user, req.params.id); res.sendStatus(204); });

// ===== server/src/routes/admin.routes.js =====
const admin = Router();
admin.use(requireAuth, authorize('user:manage'));

admin.get('/users', async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const filter = {};
  if (ROLES.includes(req.query.role)) filter.role = req.query.role;
  if (req.query.q) {
    const safe = String(req.query.q).replace(/[.*+?^$()|[\\]\\\\{}]/g, '\\\\$&');   // escape regex
    filter.$or = [{ name: new RegExp(safe, 'i') }, { email: new RegExp(safe, 'i') }];
  }
  const [data, total] = await Promise.all([
    User.find(filter).select('name email role isBanned createdAt').sort('-createdAt')
      .skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  res.json({ data, page, total, totalPages: Math.ceil(total / limit) });
});

admin.patch('/users/:id/role', validate(changeRoleSchema), changeRole);   // see previous example
admin.patch('/users/:id/ban', banUser);
admin.get('/stats', async (req, res) => {
  const byRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
  res.json({ byRole });
});
app.use('/api/admin', admin);

// ===== server/scripts/create-admin.js  (run once: node --env-file=.env scripts/create-admin.js you@x.in) =====
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
await mongoose.connect(process.env.MONGODB_URI);
const email = process.argv[2];
const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
console.log(user ? 'Promoted ' + user.email + ' to admin' : 'User not found: register first');
await mongoose.disconnect();`,
      result:
        'Sellers can only modify products whose seller field equals their id; admins can modify all. GET /api/admin/users?q=ra&role=customer returns a paginated, password-free list. The seed script prints "Promoted you@x.in to admin".',
      explanation:
        'The scope() helper turns permissions into a MongoDB filter, so ownership is enforced by the database query itself: one round trip, no race between "check" and "update". Escaping the search string prevents users from sending expensive or invalid regular expressions (ReDoS). Using the shared can() means the React UI and the API never disagree about what a role may do.',
    },
    {
      title: 'React: usePermission, <Can>, role-protected admin route and an admin users table',
      scenario: 'Show the right buttons for each role and build a lazy-loaded admin area.',
      steps: [
        'Create usePermission and Can using the shared can() and useAuth()',
        'Create RequirePermission layout route that renders a 403 page',
        'Lazy-load AdminLayout so customers never download admin code',
        'Build AdminUsersPage with a role <select> wired to useMutation',
      ],
      code: `// ===== client/src/auth/permissions.jsx =====
import { Outlet } from 'react-router';
import { can } from '@mernshop/shared';
import { useAuth } from './AuthProvider';

export const usePermission = (permission) => can(useAuth().user, permission);

export function Can({ perform, children, fallback = null }) {
  return usePermission(perform) ? children : fallback;
}

export function RequirePermission({ permission }) {
  const { status, user } = useAuth();
  if (status === 'loading') return <p>Loading...</p>;
  return can(user, permission) ? <Outlet /> : <h1>403 - You do not have access to this page</h1>;
}

// ===== client/src/App.jsx =====
import { lazy, Suspense } from 'react';
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminUsersPage = lazy(() => import('./admin/AdminUsersPage'));

<Route element={<ProtectedRoute />}>
  <Route element={<RequirePermission permission="user:manage" />}>
    <Route path="/admin" element={<Suspense fallback={<p>Loading admin...</p>}><AdminLayout /></Suspense>}>
      <Route path="users" element={<AdminUsersPage />} />
    </Route>
  </Route>
</Route>

// ===== client/src/components/ProductCard.jsx =====
export function ProductCard({ product }) {
  const { user } = useAuth();
  const canEdit = can(user, 'product:update:any') || (can(user, 'product:update:own') && product.seller === user?.id);
  return (
    <article>
      <h3>{product.name}</h3>
      {canEdit && <Link to={'/products/' + product._id + '/edit'}>Edit</Link>}
      <Can perform="order:create"><AddToCartButton id={product._id} /></Can>
    </article>
  );
}

// ===== client/src/admin/AdminUsersPage.jsx =====
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { ROLES } from '@mernshop/shared';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthProvider';

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [params, setParams] = useState({ page: 1, q: '', role: '' });
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => api.get('/admin/users', { params }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
  const changeRole = useMutation({
    mutationFn: ({ id, role }) => api.patch('/admin/users/' + id + '/role', { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
    onError: (e) => alert(e.response?.data?.message ?? e.message),
  });

  if (isPending) return <p>Loading users...</p>;
  if (isError) return <p role="alert">{error.message}</p>;
  return (
    <section>
      <input placeholder="Search name or email" value={params.q} onChange={(e) => setParams({ ...params, q: e.target.value, page: 1 })} />
      <select value={params.role} onChange={(e) => setParams({ ...params, role: e.target.value, page: 1 })}>
        <option value="">All roles</option>
        {ROLES.map((r) => <option key={r}>{r}</option>)}
      </select>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
        <tbody>
          {data.data.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td><td>{u.email}</td>
              <td>
                <select value={u.role} disabled={u._id === me.id || changeRole.isPending}
                  onChange={(e) => changeRole.mutate({ id: u._id, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </td>
              <td>{u.isBanned ? 'Banned' : 'Active'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Page {data.page} of {data.totalPages}</p>
    </section>
  );
}`,
      result:
        'A customer sees "Add to cart" but no Edit link and no Admin menu; visiting /admin/users shows the 403 page and the admin JS chunk is never downloaded. An admin sees the users table; their own role dropdown is disabled. Trying to demote the last admin shows the server message "Cannot demote the last admin".',
      explanation:
        'React.lazy splits admin pages into a separate chunk loaded only when the route renders. The UI disables obviously invalid actions (changing your own role) but still relies on the server for the real rule, and surfaces server messages on error. Including params in the queryKey gives each search/filter/page its own cache entry.',
    },
    {
      title: 'Role switcher: see what each role can do (playground)',
      scenario:
        'Switch between customer, seller (s1), seller (s2) and admin to see how the shared can() function and ownership change the UI for the same product list.',
      steps: [
        'Click Run and choose a role from the dropdown',
        'Notice which Edit/Delete/Add buttons and the Admin link appear',
        'Click Delete as a seller on someone else\'s product to see the simulated server 404',
      ],
      code: `const PERMISSIONS = {
  customer: ['product:read', 'order:create'],
  seller: ['product:read', 'product:create', 'product:update:own', 'product:delete:own'],
  admin: ['*'],
};
const can = (user, p) => !!user && (PERMISSIONS[user.role].includes('*') || PERMISSIONS[user.role].includes(p));
function Can({ user, perform, children }) { return can(user, perform) ? children : null; }`,
      playground: {
        jsx: `const PERMISSIONS = {
  customer: ['product:read', 'order:create'],
  seller: ['product:read', 'product:create', 'product:update:own', 'product:delete:own'],
  admin: ['*'],
};
const can = (user, p) => !!user && (PERMISSIONS[user.role].includes('*') || PERMISSIONS[user.role].includes(p));
const USERS = { c1: { id: 'c1', name: 'Ravi', role: 'customer' }, s1: { id: 's1', name: 'Sita', role: 'seller' }, s2: { id: 's2', name: 'Kabir', role: 'seller' }, a1: { id: 'a1', name: 'Anil', role: 'admin' } };

function Can({ user, perform, children }) { return can(user, perform) ? children : null; }

// fake server that applies the SAME rule (the real protection)
function serverDelete(user, product) {
  const allowed = can(user, 'product:delete:any') || (can(user, 'product:delete:own') && product.seller === user.id);
  return allowed ? { status: 204 } : { status: can(user, 'product:delete:own') ? 404 : 403 };
}

function App() {
  const [uid, setUid] = React.useState('c1');
  const [showAll, setShowAll] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const [products, setProducts] = React.useState([
    { _id: 'p1', name: 'Handmade Mug', seller: 's1' },
    { _id: 'p2', name: 'Block-print Kurta', seller: 's2' },
    { _id: 'p3', name: 'Brass Diya', seller: 's1' },
  ]);
  const user = USERS[uid];

  function del(p) {
    const r = serverDelete(user, p);
    setMsg('DELETE /api/products/' + p._id + ' → ' + r.status);
    if (r.status === 204) setProducts((list) => list.filter((x) => x !== p));
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <nav style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <select value={uid} onChange={(e) => { setUid(e.target.value); setMsg(''); }}>
          {Object.values(USERS).map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
        </select>
        <a href="#">Shop</a>
        <Can user={user} perform="user:manage"><a href="#">Admin panel</a></Can>
        <Can user={user} perform="product:create"><button>+ New product</button></Can>
        <label><input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> show all buttons (simulate a hacked UI)</label>
      </nav>
      {products.map((p) => {
        const mine = p.seller === user.id;
        const canEdit = can(user, 'product:update:any') || (can(user, 'product:update:own') && mine);
        const canDelete = can(user, 'product:delete:any') || (can(user, 'product:delete:own') && mine);
        return (
          <div key={p._id} style={{ display: 'flex', gap: 10, padding: 6, borderBottom: '1px solid #ddd' }}>
            <span style={{ width: 170 }}>{p.name}</span>
            <small style={{ width: 90 }}>seller: {p.seller}</small>
            <Can user={user} perform="order:create"><button>Add to cart</button></Can>
            {(canEdit || showAll) && <button>Edit</button>}
            {(canDelete || showAll) && <button onClick={() => del(p)}>Delete</button>}
          </div>
        );
      })}
      {msg && <p><code>{msg}</code></p>}
    </div>
  );
}`,
      },
      result:
        'Customer Ravi sees only "Add to cart". Seller Sita sees "+ New product" and Edit/Delete only on the mug and the diya. Admin Anil sees the Admin panel link and Edit/Delete on everything. With "show all buttons" ticked, Sita clicking Delete on the kurta shows DELETE /api/products/p2 → 404 and nothing is deleted; Ravi gets 403.',
      explanation:
        'The checkbox proves the key lesson: hiding buttons is not security. When the UI is "hacked", the server-side rule (the same can() + ownership) still blocks the action. Sellers get 404 (scoped query found nothing) while customers get 403 (they lack the permission entirely).',
    },
  ],
  interview: [
    {
      q: 'What is the difference between 401 and 403?',
      a: '401 Unauthorized means the request is not authenticated: no token, invalid or expired token. The client should log in or refresh. 403 Forbidden means the server knows who you are but you are not allowed to perform this action; logging in again will not help.',
      level: 'Easy',
    },
    {
      q: 'What is RBAC and why check permissions instead of role names in code?',
      a: 'Role-Based Access Control assigns users roles, and roles map to permissions. Checking permissions (can(user, "order:refund")) instead of role names keeps the policy in one map: adding a role or moving a capability between roles is a one-line change instead of editing every if (role === "admin") across the codebase. It also makes it easy to share the same rules with the frontend.',
      level: 'Medium',
    },
    {
      q: 'What is IDOR and how do you prevent it in a MERN app?',
      a: 'Insecure Direct Object Reference: an endpoint uses an id from the request without checking that the current user may access that object, e.g. GET /api/orders/:id returns any order. Prevent it with owner-scoped queries (Order.findOne({ _id: id, user: req.user.id })), or load-then-check ownership with an admin override, and by never trusting owner ids sent from the client.',
      level: 'Medium',
    },
    {
      q: 'Should a missing permission for someone else\'s resource return 403 or 404?',
      a: 'For ownership failures many APIs return 404 so attackers cannot discover which ids exist (GitHub does this for private repos). For missing role permissions (a customer calling an admin endpoint) 403 is clearer. Be consistent and document it.',
      level: 'Medium',
    },
    {
      q: 'Where should authorization logic live: route, controller, service or model?',
      a: 'Coarse permission checks fit in route middleware (authorize("product:create")). Ownership and business rules belong in the service layer, so the same rule applies to REST, Socket.IO events, GraphQL resolvers or background jobs. Some checks can be pushed into the query itself (scoped filters). The frontend mirrors the rules only for UX.',
      level: 'Hard',
    },
    {
      q: 'A user\'s role was changed from admin to customer, but they can still call admin APIs for a few minutes. Why, and how do you fix it?',
      a: 'The role is embedded in the still-valid access token (e.g. 15 minutes). Fixes: revoke the user\'s refresh tokens on role change so no new token is issued; keep access tokens short; for immediate effect add a tokenVersion claim compared with the user record (one DB/Redis lookup per request) or look up the role from DB/cache in authorize for sensitive admin routes.',
      level: 'Hard',
    },
    {
      q: 'How would you create the first admin user safely?',
      a: 'With a one-time seed/CLI script run by a developer with database access (node scripts/create-admin.js email), or an environment-configured bootstrap email checked once at startup. Never via a public API field like role in the register request, which would allow anyone to become admin (mass assignment).',
      level: 'Easy',
    },
    {
      q: 'What safety rules would you add to an admin "change role" endpoint?',
      a: 'Only users with user:manage; validate the role against an allowlist; admins cannot change their own role or ban themselves; never demote or delete the last admin; revoke sessions of the affected user; write an audit log entry (actor, target, before, after, time); return only safe fields; consider rate limiting and requiring re-authentication or 2FA for admins.',
      level: 'Medium',
    },
    {
      q: 'How do you hide admin code from normal users in a React SPA?',
      a: 'Code-split admin routes with React.lazy + Suspense so the admin chunk is downloaded only when the route renders for an allowed user, and wrap them in a permission-checking layout route. Note this hides code, not data: the admin API must still be protected server-side, and determined users can still find chunk URLs.',
      level: 'Medium',
    },
    {
      q: 'RBAC vs ABAC: what is the difference?',
      a: 'RBAC decides access by role (seller can create products). ABAC (Attribute-Based Access Control) decides with attributes of user, resource and context (user.department === doc.department, time of day, order.status === "pending"). Real apps mix them: RBAC for broad capabilities plus attribute checks like ownership and state in the service layer. Libraries like CASL express both.',
      level: 'Hard',
    },
    {
      q: 'Why must the owner of a new document come from req.user and not from req.body?',
      a: 'req.body is fully controlled by the client. If the server accepts body.user or body.seller, an attacker can create or reassign documents to other users. The authenticated identity from the verified token (req.user.id) is the only trustworthy source.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Write the permission rules for an orders feature: customers can create orders and read/cancel their own (only while status is "pending"); sellers can read orders containing their products; admins can read all and refund. Implement can() checks and the cancel service function.',
      hint: 'Cancel needs ownership (scoped filter) and a state check (status: "pending") in the same query.',
      solution: `// shared permissions
export const PERMISSIONS = {
  customer: ['order:create', 'order:read:own', 'order:cancel:own'],
  seller: ['order:read:seller'],
  admin: ['*'],
};

// server/src/services/order.service.js
import { can } from '@mernshop/shared';
import { Order } from '../models/Order.js';
import { AppError } from '../utils/AppError.js';

export function listOrders(user, { page = 1, limit = 20 }) {
  let filter;
  if (can(user, 'order:read:any')) filter = {};
  else if (can(user, 'order:read:seller')) filter = { 'items.seller': user.id };
  else filter = { user: user.id };
  return Order.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit).lean();
}

export async function cancelOrder(user, id) {
  const filter = can(user, 'order:cancel:any') ? { _id: id } : { _id: id, user: user.id };
  const order = await Order.findOneAndUpdate(
    { ...filter, status: 'pending' },               // state rule inside the query (atomic)
    { status: 'cancelled', cancelledAt: new Date() },
    { new: true }
  );
  if (order) return order;
  const exists = await Order.exists(filter);
  if (!exists) throw new AppError(404, 'Order not found');
  throw new AppError(409, 'Only pending orders can be cancelled');
}`,
    },
    {
      task: 'Write an Express middleware factory checkOwnership(Model, field = "user") that loads the document by req.params.id, returns 404 if missing, 403 if the user is not the owner and lacks "<model>:update:any", and attaches it to req.doc.',
      hint: 'Use doc[field].equals(req.user.id) for ObjectIds and Model.modelName.toLowerCase() for the permission prefix.',
      solution: `import mongoose from 'mongoose';
import { can } from '@mernshop/shared';

export const checkOwnership = (Model, field = 'user') => async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
  const doc = await Model.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: Model.modelName + ' not found' });

  const resource = Model.modelName.toLowerCase();
  const isOwner = doc[field]?.equals(req.user.id);
  if (!isOwner && !can(req.user, resource + ':update:any')) {
    return res.status(403).json({ message: 'You can only modify your own ' + resource });
  }
  req.doc = doc;
  next();
};

// usage (Express 5 forwards async errors automatically)
// router.patch('/:id', requireAuth, checkOwnership(Review), async (req, res) => {
//   req.doc.text = req.body.text;
//   res.json(await req.doc.save());
// });`,
    },
    {
      task: 'Create an AuditLog model and a helper audit(req, action, target, changes) used by admin endpoints, plus GET /api/admin/audit with pagination, newest first, populated with actor name/email.',
      hint: 'Index { createdAt: -1 }; store actor as ObjectId ref User.',
      solution: `// models/AuditLog.js
import mongoose from 'mongoose';
const auditSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },          // e.g. 'user.role.change'
  target: { type: mongoose.Schema.Types.ObjectId },
  changes: mongoose.Schema.Types.Mixed,              // { before, after }
  ip: String,
}, { timestamps: { createdAt: true, updatedAt: false } });
auditSchema.index({ createdAt: -1 });
export const AuditLog = mongoose.model('AuditLog', auditSchema);

// utils/audit.js
export const audit = (req, action, target, changes) =>
  AuditLog.create({ actor: req.user.id, action, target, changes, ip: req.ip });

// routes/admin.routes.js
admin.get('/audit', async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = 50;
  const [data, total] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate('actor', 'name email').lean(),
    AuditLog.estimatedDocumentCount(),
  ]);
  res.json({ data, page, total });
});

// inside changeRole:
// await audit(req, 'user.role.change', target._id, { before, after: role });`,
    },
    {
      task: 'Build a React <RoleBadge> and a <Can> that supports an array of permissions with mode "any" or "all", plus a hook useCanEdit(resource, doc) that returns true for owners with ":update:own" or anyone with ":update:any".',
      hint: 'Use Array.prototype.some / every.',
      solution: `import { can } from '@mernshop/shared';
import { useAuth } from './AuthProvider';

export function Can({ perform, mode = 'any', children, fallback = null }) {
  const { user } = useAuth();
  const list = Array.isArray(perform) ? perform : [perform];
  const ok = mode === 'all' ? list.every((p) => can(user, p)) : list.some((p) => can(user, p));
  return ok ? children : fallback;
}

export function useCanEdit(resource, doc, ownerField = 'user') {
  const { user } = useAuth();
  if (!user || !doc) return false;
  const owner = String(doc[ownerField]?._id ?? doc[ownerField]);
  return can(user, resource + ':update:any') || (can(user, resource + ':update:own') && owner === String(user.id));
}

const COLORS = { admin: '#b91c1c', seller: '#1d4ed8', customer: '#047857' };
export function RoleBadge({ role }) {
  return (
    <span style={{ background: COLORS[role] ?? '#555', color: '#fff', padding: '2px 8px', borderRadius: 999, fontSize: 12 }}>
      {role}
    </span>
  );
}

// usage
// <Can perform={['product:update:any', 'order:refund']} mode="all"><RefundButton /></Can>
// const canEdit = useCanEdit('product', product, 'seller');`,
    },
  ],
  quiz: [
    {
      question: 'A logged-in customer calls GET /api/admin/users. What status should the API return?',
      options: ['401 Unauthorized', '403 Forbidden', '200 with an empty list', '500 Internal Server Error'],
      answer: 1,
      explanation: 'The user is authenticated (so not 401) but lacks the permission, which is 403.',
    },
    {
      question: 'Which query safely updates a product so a seller can only edit their own?',
      options: [
        'Product.findByIdAndUpdate(req.params.id, req.body)',
        'Product.updateMany({ seller: req.body.seller }, req.body)',
        'Product.findOneAndUpdate({ _id: req.params.id, seller: req.user.id }, data, { new: true, runValidators: true })',
        'Product.findById(req.params.id) and check the role in React',
      ],
      answer: 2,
      explanation: 'The owner condition from the verified token is part of the filter, so other sellers\' products cannot match.',
    },
    {
      question: 'Why share the can() permission function between React and Express?',
      options: [
        'So UI visibility and server enforcement follow the same rules',
        'So the server can skip authorization',
        'Because React cannot run if statements',
        'It makes JWTs smaller',
      ],
      answer: 0,
      explanation: 'One source of truth avoids buttons that always fail or rules that drift. The server still enforces.',
    },
    {
      question: 'What is the safest way to create the very first admin?',
      options: [
        'Add an "isAdmin" checkbox to the register form',
        'Accept role: "admin" in POST /api/auth/register',
        'Make every new user admin and demote later',
        'Run a one-time seed/CLI script with database access',
      ],
      answer: 3,
      explanation: 'Admin creation must not be reachable from public endpoints.',
    },
    {
      question: 'Seller s1 sends POST /api/products with body { name: "Lamp", seller: "s2" }. What should the server do?',
      options: [
        'Reject the whole request with 500',
        'Create the product with seller s2',
        'Create the product with seller taken from req.user.id (s1), ignoring body.seller',
        'Ask s2 to approve',
      ],
      answer: 2,
      explanation: 'Ownership fields are set from the authenticated identity, never from client input.',
    },
  ],
};
