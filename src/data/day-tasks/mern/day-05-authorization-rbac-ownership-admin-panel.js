export default {
  lesson: 'day-05-authorization-rbac-ownership-admin-panel',
  minutes: 40,
  intro: 'Decide what a logged-in user may do: a shared role → permissions map, authorize middleware, ownership checks against IDOR, a safe admin API and permission-aware React UI.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A logged-in seller changes the URL from `/api/products/12` to `/api/products/13` and can edit **another seller\'s** product. What is this bug called?',
      options: ['XSS', 'IDOR (Insecure Direct Object Reference) – a missing ownership check', 'CSRF', 'SQL injection'],
      answer: 1,
      explain: 'The user is **authenticated** and even has the right **role**, but the API never checked that the product **belongs** to them. Fix: scope the query by owner, e.g. `Product.findOne({ _id: id, owner: req.user.id })`, and only skip that for admins.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about authentication vs authorization are TRUE? (choose all that apply)',
      options: [
        'Authentication answers "who are you?"; authorization answers "what may you do?"',
        'Missing/invalid token → 401; logged in but not allowed → 403',
        'Hiding the Delete button in React is enough to protect the delete endpoint',
        'Checking permissions (products:delete) is more flexible than hard-coding role names everywhere',
        'Ownership checks belong on the server, close to the database query',
      ],
      answers: [0, 1, 3, 4],
      explain: '401 = not authenticated, 403 = authenticated but forbidden. A permission map (`role → [permissions]`) lets you add a role without touching every route. React checks are **UX only** – anyone can call the API directly, so the server must enforce every rule.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write the shared permission helper. Given the map `ROLES`, implement `can(user, permission, resource)`:\n- returns true if the user\'s role has the permission\n- permissions ending in `:own` (e.g. `products:update:own`) are allowed only when `resource.ownerId === user.id`\n- an **admin** has every permission\n\nSo `can(user, \'products:update\', product)` is true if the role has `products:update`, or has `products:update:own` and owns the product.',
      example: { title: 'looking up permissions', code: "const perms = ROLES[user.role] || [];\nperms.includes('orders:read');" },
      starter: "const ROLES = {\n  admin: ['*'],\n  seller: ['products:read', 'products:create', 'products:update:own', 'products:delete:own'],\n  customer: ['products:read', 'orders:create'],\n};\n\nfunction can(user, permission, resource) {\n  // TODO\n}\n",
      solution: "const ROLES = {\n  admin: ['*'],\n  seller: ['products:read', 'products:create', 'products:update:own', 'products:delete:own'],\n  customer: ['products:read', 'orders:create'],\n};\n\nfunction can(user, permission, resource) {\n  const perms = ROLES[user.role] || [];\n  if (perms.includes('*') || perms.includes(permission)) return true;\n  if (perms.includes(permission + ':own')) return !!resource && resource.ownerId === user.id;\n  return false;\n}\n",
      tests: [
        { call: "can({ id: 1, role: 'customer' }, 'products:read')", expect: true },
        { call: "can({ id: 1, role: 'customer' }, 'products:delete', { ownerId: 1 })", expect: false },
        { call: "can({ id: 7, role: 'seller' }, 'products:update', { ownerId: 7 })", expect: true },
        { call: "can({ id: 7, role: 'seller' }, 'products:update', { ownerId: 8 })", expect: false },
        { call: "can({ id: 2, role: 'admin' }, 'products:delete', { ownerId: 8 })", expect: true },
        { call: "can({ id: 3, role: 'guest' }, 'products:read')", expect: false },
      ],
      explain: 'One function used by both Express middleware and React (`<Can>`), so the rules never drift apart. `:own` permissions combine RBAC with an **ownership** check. Unknown roles get an empty list – default deny.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 12,
      q: 'Protect a products API. Auth is simulated with headers `x-user-id` and `x-role` (missing → **401** `{ error: \'Not authenticated\' }`).\n- `DELETE /api/products/:id`: allowed for **admin**, or a **seller** who owns the product (`ownerId`); others → **403** `{ error: \'Forbidden\' }`; unknown product → 404\n- `GET /api/my-products`: only the products of the current user (ownership-scoped query)',
      example: { title: 'reading simulated auth', code: "function auth(req, res, next) {\n  const id = req.get('x-user-id');\n  if (!id) return res.status(401).json({ error: 'Not authenticated' });\n  req.user = { id: Number(id), role: req.get('x-role') };\n  next();\n}" },
      starter: "const express = require('express');\nconst app = express();\n\nconst products = [\n  { id: 1, name: 'Kurta', ownerId: 10 },\n  { id: 2, name: 'Saree', ownerId: 11 },\n  { id: 3, name: 'Dupatta', ownerId: 10 },\n];\n\n// TODO: auth middleware, GET /api/my-products, DELETE /api/products/:id\n\napp.listen(5000);\n",
      solution: "const express = require('express');\nconst app = express();\n\nconst products = [\n  { id: 1, name: 'Kurta', ownerId: 10 },\n  { id: 2, name: 'Saree', ownerId: 11 },\n  { id: 3, name: 'Dupatta', ownerId: 10 },\n];\n\nfunction auth(req, res, next) {\n  const id = req.get('x-user-id');\n  if (!id) return res.status(401).json({ error: 'Not authenticated' });\n  req.user = { id: Number(id), role: req.get('x-role') };\n  next();\n}\n\napp.get('/api/my-products', auth, (req, res) => {\n  res.json(products.filter((p) => p.ownerId === req.user.id));\n});\n\napp.delete('/api/products/:id', auth, (req, res) => {\n  const i = products.findIndex((p) => p.id === Number(req.params.id));\n  if (i === -1) return res.status(404).json({ error: 'Product not found' });\n  const isOwner = req.user.role === 'seller' && products[i].ownerId === req.user.id;\n  if (req.user.role !== 'admin' && !isOwner) return res.status(403).json({ error: 'Forbidden' });\n  products.splice(i, 1);\n  res.status(204).end();\n});\n\napp.listen(5000);\n",
      tests: [
        { name: 'no auth → 401', steps: [
          { method: 'DELETE', url: '/api/products/1', expect: { status: 401, json: { error: 'Not authenticated' } } },
        ] },
        { name: 'seller deletes own product', steps: [
          { method: 'DELETE', url: '/api/products/1', headers: { 'x-user-id': '10', 'x-role': 'seller' }, expect: { status: 204 } },
          { method: 'GET', url: '/api/my-products', headers: { 'x-user-id': '10', 'x-role': 'seller' }, expect: { status: 200, json: [{ id: 3 }] } },
        ] },
        { name: 'seller cannot delete another seller\'s product (IDOR)', steps: [
          { method: 'DELETE', url: '/api/products/2', headers: { 'x-user-id': '10', 'x-role': 'seller' }, expect: { status: 403, json: { error: 'Forbidden' } } },
        ] },
        { name: 'customer → 403, admin → 204', steps: [
          { method: 'DELETE', url: '/api/products/3', headers: { 'x-user-id': '10', 'x-role': 'customer' }, expect: { status: 403 } },
          { method: 'DELETE', url: '/api/products/2', headers: { 'x-user-id': '1', 'x-role': 'admin' }, expect: { status: 204 } },
          { method: 'DELETE', url: '/api/products/2', headers: { 'x-user-id': '1', 'x-role': 'admin' }, expect: { status: 404 } },
        ] },
        { name: 'my-products is scoped', steps: [
          { method: 'GET', url: '/api/my-products', headers: { 'x-user-id': '11', 'x-role': 'seller' }, expect: { status: 200, json: [{ id: 2, name: 'Saree' }] } },
        ] },
      ],
      explain: 'Check the role **and** the ownership on the server. The customer in test 4 has the same id as the owner (10) but the wrong role, so the role check matters too. Scoped queries like `filter(p => p.ownerId === req.user.id)` (Mongoose: `Product.find({ owner: req.user.id })`) make IDOR impossible for list endpoints.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 10,
      q: 'Admin panel API with safety rules (the caller is always admin **id 1**, simulated):\n- `PATCH /api/admin/users/:id/role` `{ role }` → 200 updated user\n  - role must be `admin`, `seller` or `customer` → else **400** `{ error: \'Invalid role\' }`\n  - an admin cannot change **their own** role → **400** `{ error: \'You cannot change your own role\' }`\n  - unknown user → 404',
      example: { title: 'whitelisting a value', code: "const STATUSES = ['active', 'banned'];\nif (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });" },
      starter: "const express = require('express');\nconst app = express();\napp.use(express.json());\n\nconst me = { id: 1 };\nconst users = [\n  { id: 1, name: 'Asha', role: 'admin' },\n  { id: 2, name: 'Ravi', role: 'admin' },\n  { id: 3, name: 'Neha', role: 'seller' },\n];\n\n// TODO: PATCH /api/admin/users/:id/role\n\napp.listen(5000);\n",
      solution: "const express = require('express');\nconst app = express();\napp.use(express.json());\n\nconst me = { id: 1 };\nconst users = [\n  { id: 1, name: 'Asha', role: 'admin' },\n  { id: 2, name: 'Ravi', role: 'admin' },\n  { id: 3, name: 'Neha', role: 'seller' },\n];\n\napp.patch('/api/admin/users/:id/role', (req, res) => {\n  const { role } = req.body || {};\n  if (!['admin', 'seller', 'customer'].includes(role)) return res.status(400).json({ error: 'Invalid role' });\n  const user = users.find((u) => u.id === Number(req.params.id));\n  if (!user) return res.status(404).json({ error: 'User not found' });\n  if (user.id === me.id) return res.status(400).json({ error: 'You cannot change your own role' });\n  user.role = role;\n  res.json(user);\n});\n\napp.listen(5000);\n",
      tests: [
        { name: 'promote a seller', steps: [
          { method: 'PATCH', url: '/api/admin/users/3/role', body: { role: 'admin' }, expect: { status: 200, json: { id: 3, role: 'admin' } } },
        ] },
        { name: 'invalid role / unknown user', steps: [
          { method: 'PATCH', url: '/api/admin/users/3/role', body: { role: 'superuser' }, expect: { status: 400, json: { error: 'Invalid role' } } },
          { method: 'PATCH', url: '/api/admin/users/99/role', body: { role: 'seller' }, expect: { status: 404 } },
        ] },
        { name: 'no self-demotion', steps: [
          { method: 'PATCH', url: '/api/admin/users/1/role', body: { role: 'customer' }, expect: { status: 400, json: { error: 'You cannot change your own role' } } },
        ] },
        { name: 'another admin can be demoted', steps: [
          { method: 'PATCH', url: '/api/admin/users/2/role', body: { role: 'seller' }, expect: { status: 200, json: { role: 'seller' } } },
        ] },
      ],
      explain: 'Admin endpoints need extra guard rails: validate the new role against a whitelist, forbid self-demotion (an admin could lock everyone out by mistake) and keep at least one admin. Real admin panels add one more rule: never demote or ban the **last** admin (count admins before changing a role).',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 8,
      q: 'Mirror permissions in React. Write a `<Can perform="..." >` component that renders its children only if the current role has that permission (map given). App has a `<select id="role">` with options admin / seller / customer (default **customer**) and renders:\n- `<button className="buy">Buy</button>` inside `<Can perform="orders:create">`\n- `<button className="delete">Delete</button>` inside `<Can perform="products:delete">`\n\n(The checker switches the role to **seller**.)',
      example: { title: 'a permission-aware wrapper', code: "function IfAdmin({ role, children }) {\n  return role === 'admin' ? children : null;\n}" },
      starter: "const { useState } = React;\nconst PERMS = {\n  admin: ['products:delete', 'orders:create', 'users:manage'],\n  seller: ['products:delete'],\n  customer: ['orders:create'],\n};\n\nfunction App() {\n  // TODO: role select + <Can>\n  return <div>TODO</div>;\n}\n",
      solution: "const { useState, createContext, useContext } = React;\nconst PERMS = {\n  admin: ['products:delete', 'orders:create', 'users:manage'],\n  seller: ['products:delete'],\n  customer: ['orders:create'],\n};\nconst RoleContext = createContext('customer');\n\nfunction Can({ perform, children }) {\n  const role = useContext(RoleContext);\n  return (PERMS[role] || []).includes(perform) ? children : null;\n}\n\nfunction App() {\n  const [role, setRole] = useState('customer');\n  return (\n    <RoleContext.Provider value={role}>\n      <select id=\"role\" value={role} onChange={(e) => setRole(e.target.value)}>\n        <option value=\"admin\">admin</option>\n        <option value=\"seller\">seller</option>\n        <option value=\"customer\">customer</option>\n      </select>\n      <Can perform=\"orders:create\"><button className=\"buy\">Buy</button></Can>\n      <Can perform=\"products:delete\"><button className=\"delete\">Delete</button></Can>\n    </RoleContext.Provider>\n  );\n}\n",
      actions: [{ input: ['#role', 'seller'] }],
      checks: [
        { sel: '.delete', count: 1, msg: 'A seller must see the Delete button' },
        { sel: '.buy', notExists: true, msg: 'A seller must NOT see the Buy button (no orders:create permission)' },
        { sel: '#role', prop: { value: 'seller' }, msg: 'The role select must be controlled and show the chosen role' },
      ],
      explain: '`<Can>` keeps permission checks declarative and in one place; it reads the same map as the server. It only hides UI – the API still returns 403 if someone calls it directly. Returning `null` renders nothing.',
    },
  ],
};
