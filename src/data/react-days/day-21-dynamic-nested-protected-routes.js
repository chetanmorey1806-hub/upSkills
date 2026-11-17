export default {
  id: 'day-21-dynamic-nested-protected-routes',
  title: 'Dynamic Routes, useParams, Nested Routes, useNavigate and Protected Routes',
  module: 'Module 4: Routing & State Management',
  day: 21,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Real apps need URLs like /products/42, layouts with nested pages, redirects after login and pages only logged-in users can see. Today you learn URL parameters, nested routes with Outlet, programmatic navigation and protected routes.',
  objectives: [
    'Create dynamic routes with :params and read them with useParams',
    'Build nested routes with a shared layout and Outlet, including index routes',
    'Navigate in code with useNavigate (redirect after submit, go back)',
    'Read and update query strings with useSearchParams',
    'Protect routes so only authenticated users can access them, using Navigate',
  ],
  theory: [
    {
      heading: 'Dynamic segments and useParams',
      content:
        'An online shop has thousands of products. You do not write a Route for each one. Instead you write **one route with a placeholder**:\n\n`<Route path="/products/:id" element={<ProductDetail />} />`\n\nThe `:id` part is a **dynamic segment** (URL parameter). It matches `/products/1`, `/products/42`, `/products/abc`.\n\nInside the component, `useParams()` returns an object with the values: for `/products/42` you get `{ id: "42" }`.\n\nAnalogy: a dynamic route is like a form letter "Dear ____". One template, many names filled in.',
      syntax:
        "import { useParams } from 'react-router-dom';\n\nfunction ProductDetail() {\n  const { id } = useParams();            // always a string!\n  const product = products.find(p => p.id === Number(id));\n  if (!product) return <p>Product not found</p>;\n  return <h2>{product.name}</h2>;\n}",
      tip: 'Params are always strings. Convert with Number(id) before comparing with numeric ids, otherwise "42" === 42 is false.',
    },
    {
      heading: 'Nested routes and Outlet',
      content:
        'Many pages share a frame: a dashboard with a sidebar where only the right side changes. Nested routes model this:\n\n- The **parent route** renders the layout (sidebar, header)\n- The layout places `<Outlet />` where the **child route** should appear\n- Child paths are **relative** to the parent (`path="settings"` under `/dashboard` means `/dashboard/settings`)\n- An **index route** (`<Route index element={...} />`) is the default child shown at the parent\'s exact URL\n\nAnalogy: Outlet is a picture frame on the wall. The frame (layout) stays; you swap the picture (child page).',
      syntax:
        "<Routes>\n  <Route path=\"/dashboard\" element={<DashboardLayout />}>\n    <Route index element={<Overview />} />          {/* /dashboard */}\n    <Route path=\"orders\" element={<Orders />} />   {/* /dashboard/orders */}\n    <Route path=\"settings\" element={<Settings />} />\n  </Route>\n</Routes>\n\nfunction DashboardLayout() {\n  return (\n    <div className=\"dash\">\n      <Sidebar />\n      <main><Outlet /></main>\n    </div>\n  );\n}",
    },
    {
      heading: 'Programmatic navigation with useNavigate',
      content:
        'Links are for clicks. But sometimes code must navigate: after a form is submitted, after login, after deleting an item. `useNavigate()` returns a `navigate` function:\n\n- `navigate(\'/dashboard\')`: go to a path\n- `navigate(-1)`: go back one page (like the browser Back button)\n- `navigate(\'/login\', { replace: true })`: replace the current history entry so Back does not return here\n- `navigate(\'/thanks\', { state: { orderId: 7 } })`: pass data, read it with `useLocation().state`\n\nThere is also the `<Navigate to="/login" />` **component**, which redirects as soon as it renders.',
      syntax:
        "const navigate = useNavigate();\n\nfunction handleSubmit(e) {\n  e.preventDefault();\n  saveOrder();\n  navigate('/orders', { replace: true });\n}",
      tip: 'Do not call navigate() directly during render. Call it in an event handler or useEffect, or render <Navigate /> instead.',
    },
    {
      heading: 'Query strings with useSearchParams',
      content:
        'Query strings are the `?key=value` part of a URL: `/products?category=shoes&sort=price`. They are perfect for filters, search terms and pagination because the user can bookmark or share the exact view.\n\n`const [searchParams, setSearchParams] = useSearchParams();`\n- `searchParams.get(\'category\')` reads a value (or null)\n- `setSearchParams({ category: \'shoes\' })` updates the URL and re-renders\n\nRule of thumb: **path params** identify a resource (`/users/7`), **query params** filter or sort a list (`/users?role=admin`).',
    },
    {
      heading: 'Protected routes',
      content:
        'Some pages (dashboard, profile, admin) must only be visible to logged-in users. A **protected route** is a wrapper component that checks authentication:\n\n- If the user is logged in, render the children (or `<Outlet />`)\n- Otherwise, render `<Navigate to="/login" replace state={{ from: location }} />`\n\nAfter login, read `location.state.from` and navigate the user back to the page they originally wanted.\n\nImportant: this only hides UI. **Real security must be on the server**: the API must still check the token for every request.',
      syntax:
        "function RequireAuth({ children }) {\n  const { user } = useAuth();\n  const location = useLocation();\n  if (!user) return <Navigate to=\"/login\" replace state={{ from: location }} />;\n  return children;\n}\n\n<Route path=\"/dashboard\" element={<RequireAuth><Dashboard /></RequireAuth>} />",
    },
    {
      heading: 'About the playground examples',
      content:
        'The single-file playground cannot install react-router-dom, so each example shows **real React Router code** in the `code` field and a **plain React demo** in the playground that implements the same idea with a tiny hash router (pattern matching for `:id`, an outlet slot, a navigate function and an auth guard). Copy the `code` into a Vite project with react-router-dom installed to run the real thing.\n\nComing next: Day 22 compares global state options: Context, Redux Toolkit and Zustand.',
    },
  ],
  examples: [
    {
      title: 'Product list and product detail with :id',
      scenario: 'A product list links to /products/:id. The detail page reads the id and shows the product, or "not found".',
      steps: [
        'Create a PRODUCTS array with id, name and price',
        'Add routes: /products and /products/:id',
        'In ProductList, link to "/products/" + p.id',
        'In ProductDetail, read id with useParams and find the product',
        'Add a Back button with navigate(-1)',
        'Run the playground: it matches "/products/:id" with a small helper',
      ],
      code: `import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

function ProductList() {
  return (
    <ul>
      {PRODUCTS.map(p => (
        <li key={p.id}><Link to={'/products/' + p.id}>{p.name}</Link></li>
      ))}
    </ul>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = PRODUCTS.find(p => p.id === Number(id));
  if (!product) return <p>Product {id} not found</p>;
  return (
    <div>
      <h2>{product.name}</h2>
      <p>Rs {product.price}</p>
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:id" element={<ProductDetail />} />
    </Routes>
  );
}`,
      playground: {
        jsx: `const PRODUCTS = [
  { id: 1, name: 'Wireless Mouse', price: 699 },
  { id: 2, name: 'Mechanical Keyboard', price: 3499 },
  { id: 3, name: 'USB-C Hub', price: 1599 },
];

// --- tiny router helpers (stand-in for react-router-dom) ---
function useHashPath() {
  const read = () => window.location.hash.slice(1) || '/products';
  const [path, setPath] = React.useState(read);
  React.useEffect(() => {
    const on = () => setPath(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}
function matchPath(pattern, path) {
  const p = pattern.split('/'), u = path.split('/');
  if (p.length !== u.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(u[i]);
    else if (p[i] !== u[i]) return null;
  }
  return params;
}
const navigate = to => (to === -1 ? window.history.back() : (window.location.hash = to));

// --- pages ---
function ProductList() {
  return (
    <ul>
      {PRODUCTS.map(p => <li key={p.id}><a href={'#/products/' + p.id}>{p.name}</a></li>)}
      <li><a href="#/products/99">Missing product (id 99)</a></li>
    </ul>
  );
}
function ProductDetail({ params }) {
  const product = PRODUCTS.find(p => p.id === Number(params.id));
  if (!product) return <p>Product {params.id} not found. <button onClick={() => navigate(-1)}>Back</button></p>;
  return (
    <div>
      <h2>{product.name}</h2>
      <p>Price: Rs {product.price}</p>
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}

function App() {
  const path = useHashPath();
  let page = <p>404</p>;
  if (matchPath('/products', path)) page = <ProductList />;
  else {
    const params = matchPath('/products/:id', path);
    if (params) page = <ProductDetail params={params} />;
  }
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h3>Shop</h3>
      <small>URL: {path}</small>
      {page}
    </div>
  );
}`,
      },
      result: 'A list of three products. Clicking one shows its name and price with a Back button. The "Missing product" link shows "Product 99 not found".',
      explanation:
        'One route pattern serves every product. useParams (here matchPath) extracts the id string from the URL; Number(id) converts it before comparing.',
    },
    {
      title: 'Nested dashboard with Outlet and an index route',
      scenario: 'A dashboard layout with a sidebar. Overview, Orders and Settings render inside the layout.',
      steps: [
        'Create a parent Route path="/dashboard" with element <DashboardLayout />',
        'Add child routes: index (Overview), orders, settings',
        'Place <Outlet /> inside DashboardLayout where child content goes',
        'Use NavLink in the sidebar with relative paths',
        'Run the playground: the layout passes the matching child as the "outlet"',
      ],
      code: `import { Routes, Route, NavLink, Outlet } from 'react-router-dom';

function DashboardLayout() {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <aside>
        <NavLink to="/dashboard" end>Overview</NavLink><br />
        <NavLink to="orders">Orders</NavLink><br />
        <NavLink to="settings">Settings</NavLink>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}

<Routes>
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<Overview />} />
    <Route path="orders" element={<Orders />} />
    <Route path="settings" element={<Settings />} />
  </Route>
</Routes>`,
      playground: {
        jsx: `function useHashPath(fallback) {
  const read = () => window.location.hash.slice(1) || fallback;
  const [path, setPath] = React.useState(read);
  React.useEffect(() => {
    const on = () => setPath(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}

const Overview = () => <p>Sales today: Rs 12,400</p>;
const Orders = () => <ul><li>#101 Shoes</li><li>#102 Watch</li></ul>;
const Settings = () => <label><input type="checkbox" /> Email notifications</label>;

const children = { '': Overview, orders: Orders, settings: Settings };

function DashboardLayout({ outlet, current }) {
  const link = (to, label) => (
    <a href={'#/dashboard' + (to ? '/' + to : '')}
       style={{ display: 'block', padding: 6, fontWeight: current === to ? 'bold' : 'normal' }}>{label}</a>
  );
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <aside style={{ borderRight: '1px solid #ccc', paddingRight: 12 }}>
        {link('', 'Overview')}{link('orders', 'Orders')}{link('settings', 'Settings')}
      </aside>
      <main>{outlet}</main>
    </div>
  );
}

function App() {
  const path = useHashPath('/dashboard');
  const sub = path.replace(/^\\/dashboard\\/?/, '');
  const Child = children[sub];
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h3>Admin Dashboard</h3>
      {Child ? <DashboardLayout current={sub} outlet={<Child />} /> : <p>404</p>}
    </div>
  );
}`,
      },
      result: 'A sidebar with Overview, Orders, Settings. The sidebar stays while only the right-hand content changes. /dashboard shows Overview by default (index route).',
      explanation:
        'In React Router the layout renders <Outlet />, and the router fills it with the matched child. The index route is what appears at the parent URL itself.',
    },
    {
      title: 'Protected route with login redirect',
      scenario: 'The /profile page requires login. Visiting it while logged out redirects to /login; after logging in, the user is sent back to /profile.',
      steps: [
        'Create an AuthContext with user, login and logout',
        'Write RequireAuth that renders <Navigate to="/login" replace state={{ from: location }} /> when there is no user',
        'Wrap the profile route element in <RequireAuth>',
        'In Login, after login() call navigate(from, { replace: true })',
        'Run the playground and click "Profile" while logged out',
      ],
      code: `import { Navigate, useLocation, useNavigate } from 'react-router-dom';

function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  return <button onClick={() => { login('Asha'); navigate(from, { replace: true }); }}>Log in</button>;
}

<Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
<Route path="/login" element={<Login />} />`,
      playground: {
        jsx: `const AuthContext = React.createContext(null);
const RouterContext = React.createContext(null);

function Router({ children }) {
  const [loc, setLoc] = React.useState({ path: '/', state: null });
  const navigate = (path, opts = {}) => setLoc({ path, state: opts.state || null });
  return <RouterContext.Provider value={{ loc, navigate }}>{children}</RouterContext.Provider>;
}
const useRouter = () => React.useContext(RouterContext);

function Navigate({ to, state }) {
  const { navigate } = useRouter();
  React.useEffect(() => { navigate(to, { state }); }, []);
  return null;
}

function RequireAuth({ children }) {
  const { user } = React.useContext(AuthContext);
  const { loc } = useRouter();
  if (!user) return <Navigate to="/login" state={{ from: loc.path }} />;
  return children;
}

function Login() {
  const { login } = React.useContext(AuthContext);
  const { loc, navigate } = useRouter();
  const from = (loc.state && loc.state.from) || '/';
  return (
    <div>
      <p>Please log in to continue to <code>{from}</code></p>
      <button onClick={() => { login('Asha'); navigate(from); }}>Log in as Asha</button>
    </div>
  );
}

function Profile() {
  const { user, logout } = React.useContext(AuthContext);
  return <div><h3>Profile of {user.name}</h3><button onClick={logout}>Log out</button></div>;
}

function Pages() {
  const { loc, navigate } = useRouter();
  let page = <h3>Home (public)</h3>;
  if (loc.path === '/profile') page = <RequireAuth><Profile /></RequireAuth>;
  if (loc.path === '/login') page = <Login />;
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <nav>
        <button onClick={() => navigate('/')}>Home</button>{' '}
        <button onClick={() => navigate('/profile')}>Profile (protected)</button>
      </nav>
      <small>Path: {loc.path}</small>
      {page}
    </div>
  );
}

function App() {
  const [user, setUser] = React.useState(null);
  const auth = { user, login: name => setUser({ name }), logout: () => setUser(null) };
  return (
    <AuthContext.Provider value={auth}>
      <Router><Pages /></Router>
    </AuthContext.Provider>
  );
}`,
      },
      result: 'Clicking "Profile (protected)" while logged out redirects to /login with the message "continue to /profile". Clicking "Log in as Asha" sends you to the profile page. Log out and try again.',
      explanation:
        'RequireAuth renders a Navigate component instead of the page when there is no user, and remembers where the user wanted to go. Login reads that "from" value and navigates back after success.',
    },
    {
      title: 'Filters in the URL with useSearchParams',
      scenario: 'A course list filtered by level. The filter is stored in the query string so the view can be bookmarked.',
      steps: [
        "Read the level with searchParams.get('level')",
        'Filter the list based on it',
        'Update with setSearchParams({ level }) when a button is clicked',
        'Run the playground: it uses URLSearchParams on the hash to mimic the same API',
      ],
      code: `import { useSearchParams } from 'react-router-dom';

function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const level = searchParams.get('level') || 'all';
  const shown = level === 'all' ? COURSES : COURSES.filter(c => c.level === level);
  return (
    <>
      {['all', 'beginner', 'advanced'].map(l => (
        <button key={l} onClick={() => setSearchParams(l === 'all' ? {} : { level: l })}>{l}</button>
      ))}
      <ul>{shown.map(c => <li key={c.id}>{c.title}</li>)}</ul>
    </>
  );
}`,
      playground: {
        jsx: `const COURSES = [
  { id: 1, title: 'HTML Basics', level: 'beginner' },
  { id: 2, title: 'React Patterns', level: 'advanced' },
  { id: 3, title: 'CSS Flexbox', level: 'beginner' },
  { id: 4, title: 'Node Performance', level: 'advanced' },
];

function useSearchParams() {
  const read = () => new URLSearchParams(window.location.hash.split('?')[1] || '');
  const [params, setParams] = React.useState(read);
  React.useEffect(() => {
    const on = () => setParams(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const set = obj => { window.location.hash = '/courses?' + new URLSearchParams(obj).toString(); };
  return [params, set];
}

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const level = searchParams.get('level') || 'all';
  const shown = level === 'all' ? COURSES : COURSES.filter(c => c.level === level);
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {['all', 'beginner', 'advanced'].map(l => (
        <button key={l} onClick={() => setSearchParams(l === 'all' ? {} : { level: l })}
                style={{ fontWeight: l === level ? 'bold' : 'normal', marginRight: 6 }}>{l}</button>
      ))}
      <p><small>Query: ?{searchParams.toString()}</small></p>
      <ul>{shown.map(c => <li key={c.id}>{c.title} ({c.level})</li>)}</ul>
    </div>
  );
}`,
      },
      result: 'Clicking "beginner" shows only beginner courses and the query shows level=beginner. "all" removes the filter.',
      explanation:
        'The filter lives in the URL instead of component state, so refreshing or sharing the link keeps the same filtered view.',
    },
  ],
  interview: [
    { q: 'How do you define a dynamic route in React Router?', a: 'Use a colon segment in the path: <Route path="/users/:userId" element={<User />} />. The segment matches any value in that position.', level: 'Easy' },
    { q: 'What does useParams return?', a: 'An object of the current route\'s dynamic segments as strings, e.g. { userId: "7" } for /users/7.', level: 'Easy' },
    { q: 'What is Outlet?', a: 'A component used in a parent route\'s element to mark where the matched child route should render. It enables nested layouts.', level: 'Medium' },
    { q: 'What is an index route?', a: 'A child route with the index prop and no path. It renders in the parent\'s Outlet when the URL exactly matches the parent path, acting as the default child.', level: 'Medium' },
    { q: 'useNavigate vs Navigate component?', a: 'useNavigate returns a function to navigate imperatively from event handlers or effects. <Navigate to="..." /> is a component that redirects when rendered, useful in render logic such as protected routes.', level: 'Medium' },
    { q: 'What does navigate(-1) do?', a: 'It goes back one entry in the history stack, like the browser Back button.', level: 'Easy' },
    { q: 'What is the replace option in navigate?', a: 'navigate(path, { replace: true }) replaces the current history entry instead of pushing a new one, so pressing Back will not return to the replaced page (useful after login or redirects).', level: 'Medium' },
    { q: 'Path params vs query params?', a: 'Path params identify a specific resource (/products/42). Query params (?sort=price&page=2) modify the view: filtering, sorting, pagination, search.', level: 'Medium' },
    { q: 'How do you implement a protected route?', a: 'Create a wrapper (e.g. RequireAuth) that checks auth state; if not authenticated it returns <Navigate to="/login" replace state={{ from: location }} />, otherwise renders children or <Outlet />.', level: 'Medium' },
    { q: 'Are protected routes enough to secure data?', a: 'No. They only hide UI in the browser. Anyone can call the API directly, so the backend must verify authentication and authorization on every request.', level: 'Hard' },
    { q: 'How do you send the user back to the page they originally requested after login?', a: 'Pass the original location in Navigate\'s state, then in the login page read useLocation().state?.from and call navigate(from, { replace: true }) after a successful login.', level: 'Hard' },
    { q: 'Why convert useParams values with Number()?', a: 'URL params are always strings. Comparing "5" === 5 fails, so convert before comparing with numeric ids.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create /users and /users/:userId routes. The detail page fetches https://jsonplaceholder.typicode.com/users/:userId and shows name and email.',
      hint: 'Use useParams for the id and a useEffect that depends on [userId].',
      solution: `import { Routes, Route, Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Users() {
  const ids = [1, 2, 3, 4, 5];
  return <ul>{ids.map(id => <li key={id}><Link to={'/users/' + id}>User {id}</Link></li>)}</ul>;
}

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const c = new AbortController();
    fetch('https://jsonplaceholder.typicode.com/users/' + userId, { signal: c.signal })
      .then(r => r.json()).then(setUser).catch(() => {});
    return () => c.abort();
  }, [userId]);
  if (!user) return <p>Loading...</p>;
  return <div><h2>{user.name}</h2><p>{user.email}</p><Link to="/users">Back</Link></div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/users" element={<Users />} />
      <Route path="/users/:userId" element={<UserDetail />} />
    </Routes>
  );
}`,
    },
    {
      task: 'Build a nested /account layout with index (Profile), /account/orders and /account/security using Outlet.',
      hint: 'Child paths are relative: path="orders".',
      solution: `import { Routes, Route, NavLink, Outlet } from 'react-router-dom';

function AccountLayout() {
  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <nav>
        <NavLink to="/account" end>Profile</NavLink><br />
        <NavLink to="orders">Orders</NavLink><br />
        <NavLink to="security">Security</NavLink>
      </nav>
      <section><Outlet /></section>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/account" element={<AccountLayout />}>
        <Route index element={<h2>Profile</h2>} />
        <Route path="orders" element={<h2>Orders</h2>} />
        <Route path="security" element={<h2>Security</h2>} />
      </Route>
    </Routes>
  );
}`,
    },
    {
      task: 'Make a contact form that, on submit, navigates to /thank-you and passes the user\'s name in navigation state. Show "Thanks, NAME" on the thank-you page.',
      hint: "navigate('/thank-you', { state: { name } }) and useLocation().state.",
      solution: `import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

function Contact() {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  return (
    <form onSubmit={e => { e.preventDefault(); navigate('/thank-you', { state: { name } }); }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
      <button>Send</button>
    </form>
  );
}

function ThankYou() {
  const { state } = useLocation();
  return <h2>Thanks, {state?.name || 'friend'}!</h2>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Contact />} />
      <Route path="/thank-you" element={<ThankYou />} />
    </Routes>
  );
}`,
    },
    {
      task: 'Protect a group of routes (/admin, /admin/users) with a layout-style guard that renders <Outlet /> when logged in.',
      hint: 'A guard route without a path: <Route element={<RequireAuth />}> ...children... </Route>.',
      solution: `import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';

function RequireAuth() {
  const { user } = useAuth();          // from your AuthContext
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'For the route "/posts/:postId" and URL "/posts/15", what does useParams() return?',
      options: ['{ postId: 15 }', '{ postId: "15" }', '"15"', '{ id: "15" }'],
      answer: 1,
      explanation: 'Params are named after the segment and are always strings.',
    },
    {
      question: 'Where does a nested child route render?',
      options: ['Wherever <Outlet /> is placed in the parent element', 'At the top of the page', 'Inside <Routes> only', 'In a new browser tab'],
      answer: 0,
      explanation: 'The parent layout decides where children appear by rendering <Outlet />.',
    },
    {
      question: 'Which call goes back one page?',
      options: ["navigate('back')", 'navigate(0)', 'navigate(-1)', "navigate('/', { back: true })"],
      answer: 2,
      explanation: 'A negative number moves back in the history stack.',
    },
    {
      question: 'Which is the best place for a "sort by price" option so it can be bookmarked?',
      options: ['A useState variable', 'localStorage', 'A path param like /sort/:price', 'A query param like ?sort=price'],
      answer: 3,
      explanation: 'Query params describe how a view is filtered/sorted and survive refresh and sharing.',
    },
    {
      question: 'What does a protected route usually render when the user is NOT logged in?',
      options: ['<Navigate to="/login" replace />', 'null and an alert', 'The page with blurred content', 'An <a href="/login">'],
      answer: 0,
      explanation: 'It redirects to the login page, often passing the original location in state.',
    },
  ],
};
