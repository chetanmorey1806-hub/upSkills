export default {
  id: 'day-34-layouts-responsive-dashboards',
  title: 'Layouts & Responsive Dashboards: Header, Sidebar, Main Layout with Outlet, Mobile Menu, lucide-react Icons, Images and Fonts',
  module: 'Module 7: Industry Project Setup & UI',
  day: 34,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Almost every company app is a dashboard: a header, a sidebar with navigation and a main area that changes per page. Build that shell the professional way with React Router 7 layout routes and <Outlet />, make it responsive with a collapsible sidebar and a mobile drawer, and add icons (lucide-react), optimised images and web fonts.',
  objectives: [
    'Create a reusable DashboardLayout using nested routes and <Outlet /> so the shell renders once',
    'Build the layout with CSS Grid: header, sidebar and scrollable main area',
    'Implement an accessible mobile menu (drawer + overlay, Escape, closes on navigation) and a collapsible desktop sidebar',
    'Use lucide-react icons correctly (size, strokeWidth, aria-hidden, accessible labels)',
    'Load images and fonts for performance: lazy loading, width/height, aspect-ratio, srcset, font-display: swap',
  ],
  theory: [
    {
      heading: 'Layout routes and <Outlet />',
      content:
        'In a dashboard, the header and sidebar stay the same while the main content changes: `/dashboard`, `/orders`, `/products`, `/settings`. Copying `<Header /><Sidebar />` into every page is repetitive and the sidebar would re-mount (losing state like "collapsed") on every navigation.\n\nReact Router solves this with **layout routes** (Day 21 nested routes). A parent route renders the layout, and **`<Outlet />`** marks the spot where the matching child route renders.\n\n- The layout mounts **once**; only the Outlet content changes\n- An **index route** is the default child (`/` shows DashboardHome)\n- You can have several layouts: `AuthLayout` (centred card for login/register) and `DashboardLayout` (sidebar app)\n- `<Outlet context={{ user }} />` + `useOutletContext()` pass data from layout to pages\n\nReact Router 7 (library mode) has the same API as v6. Import from `react-router` (the `react-router-dom` package still works and re-exports it).',
      syntax:
        "// src/app/router.jsx\nimport { createBrowserRouter } from 'react-router';\nimport DashboardLayout from '@/components/layout/DashboardLayout';\nimport AuthLayout from '@/components/layout/AuthLayout';\n\nexport const router = createBrowserRouter([\n  {\n    element: <DashboardLayout />,\n    children: [\n      { index: true, element: <DashboardHome /> },\n      { path: 'orders', element: <OrdersPage /> },\n      { path: 'products', element: <ProductsPage /> },\n      { path: 'settings', element: <SettingsPage /> },\n    ],\n  },\n  { element: <AuthLayout />, children: [{ path: 'login', element: <LoginPage /> }] },\n  { path: '*', element: <NotFoundPage /> },\n]);\n\n// main.jsx\n<RouterProvider router={router} />",
    },
    {
      heading: 'Building the shell: Header, Sidebar and Main with CSS Grid',
      content:
        'The classic dashboard shell is a **CSS Grid** with two columns (sidebar, content) and two rows (header, main):\n\n- `grid-template-columns: 240px 1fr` and `grid-template-rows: 56px 1fr`\n- `height: 100dvh` on the shell and `overflow-y: auto` on `<main>`, so only the content scrolls while header and sidebar stay fixed\n- Use semantic elements: `<header>`, `<nav aria-label="Main">`, `<main>`; this helps screen readers and SEO\n- Navigation uses **`NavLink`**, which adds an active state (`className={({ isActive }) => ...}`) and `aria-current="page"` automatically\n\nKeep layout components in `src/components/layout/`: `DashboardLayout.jsx`, `Header.jsx`, `Sidebar.jsx`, `navItems.js` (one array that defines label, path and icon, used by both desktop sidebar and mobile drawer).',
      syntax:
        ".shell {\n  display: grid;\n  grid-template-columns: 240px 1fr;\n  grid-template-rows: 56px 1fr;\n  grid-template-areas: 'sidebar header' 'sidebar main';\n  height: 100dvh;\n}\n.shell > header { grid-area: header; }\n.shell > aside  { grid-area: sidebar; }\n.shell > main   { grid-area: main; overflow-y: auto; }\n@media (max-width: 767px) {\n  .shell { grid-template-columns: 1fr; grid-template-areas: 'header' 'main'; }\n  .shell > aside { display: none; }   /* replaced by the mobile drawer */\n}",
      tip: 'Use 100dvh (dynamic viewport height) instead of 100vh on mobile: 100vh ignores the browser address bar on phones and causes the bottom of the page to be hidden.',
    },
    {
      heading: 'Responsive behaviour: collapsible sidebar and mobile drawer',
      content:
        'Two patterns appear in almost every dashboard:\n\n1. **Desktop collapse**: a button shrinks the sidebar to icons only (`72px`). Save the preference in localStorage. Show the label as a tooltip/`title` and keep an `aria-label` on links when the text is hidden.\n2. **Mobile drawer** (below 768px): the sidebar is hidden; a **hamburger button** in the header opens it as an overlay drawer.\n\nA good mobile drawer:\n- The hamburger has `aria-label="Open menu"`, `aria-expanded` and `aria-controls`\n- A dark **backdrop**; clicking it closes the drawer\n- **Escape** closes it\n- It closes automatically **when the route changes** (watch `useLocation().pathname`)\n- The page behind does not scroll (`document.body.style.overflow = \'hidden\'` while open)\n- Focus moves into the drawer and back to the hamburger on close (libraries like Radix/MUI Drawer do this for you)',
      syntax:
        "const { pathname } = useLocation();\nconst [mobileOpen, setMobileOpen] = useState(false);\n\nuseEffect(() => { setMobileOpen(false); }, [pathname]);   // close on navigation\n\nuseEffect(() => {\n  if (!mobileOpen) return;\n  const onKey = e => e.key === 'Escape' && setMobileOpen(false);\n  document.addEventListener('keydown', onKey);\n  document.body.style.overflow = 'hidden';\n  return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };\n}, [mobileOpen]);",
    },
    {
      heading: 'Icons with lucide-react',
      content:
        '**lucide-react** is the most popular icon set for new React projects (also used by shadcn/ui): 1,500+ clean, consistent SVG icons as React components.\n\n- Install: `npm install lucide-react`\n- Import **only the icons you use**: `import { House, ShoppingCart, Users, Settings, Menu, X } from \'lucide-react\'`. Each is a separate ES module, so the bundle includes only those (tree shaking)\n- Props: `size` (default 24), `color` (default `currentColor`, so icons follow the text colour), `strokeWidth` (default 2), `className`\n\n**Accessibility**\n- **Decorative** icon next to text ("[icon] Orders"): add `aria-hidden="true"`; the text already says it\n- **Icon-only button**: the button needs an accessible name: `<button aria-label="Open menu"><Menu aria-hidden="true" /></button>`\n\nOther popular sets: `react-icons` (many sets in one package), `@heroicons/react`, MUI icons. Pick one set per project for a consistent look.',
      syntax:
        "import { House, Package, ShoppingCart, Users, Settings } from 'lucide-react';\n\n// src/components/layout/navItems.js\nexport const NAV_ITEMS = [\n  { to: '/', label: 'Dashboard', icon: House, end: true },\n  { to: '/orders', label: 'Orders', icon: ShoppingCart },\n  { to: '/products', label: 'Products', icon: Package },\n  { to: '/customers', label: 'Customers', icon: Users },\n  { to: '/settings', label: 'Settings', icon: Settings },\n];\n\n// render: the component is stored in the array, so use a capitalised variable\n{NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (\n  <NavLink key={to} to={to} end={end}><Icon size={18} aria-hidden=\"true\" /> {label}</NavLink>\n))}",
      tip: 'Common mistake: `import * as Icons from "lucide-react"` and choosing icons by string name. That pulls all icons into the bundle (hundreds of KB). Import named icons or keep a small map of the ones you need.',
    },
    {
      heading: 'Images: where to put them and how to load them fast',
      content:
        '**Where**\n- `src/assets/logo.svg` imported in JSX (`import logo from \'@/assets/logo.svg\'`): Vite adds a content hash to the filename (cache-busting) and inlines very small files\n- `public/favicon.svg`, `public/og-image.png`: served as-is from `/`, for files referenced by exact URL (favicon, robots.txt, social preview)\n- User content (product photos, avatars) comes from a CDN/backend URL\n\n**Performance checklist**\n- Always set **`width` and `height`** (or CSS `aspect-ratio`) so the browser reserves space and the layout does not jump (CLS, Day 52)\n- **`loading="lazy"`** for images below the fold; keep the hero image eager, optionally `fetchpriority="high"`\n- **`srcset` and `sizes`** to send smaller files to phones\n- Modern formats: **WebP/AVIF**\n- `object-fit: cover` to crop images neatly into cards\n- Meaningful **`alt`** text (product name); `alt=""` for decorative images\n- An **`onError` fallback** for broken URLs',
      syntax:
        "import logo from '@/assets/logo.svg';\n\n<img src={logo} alt=\"ShopKart\" width=\"120\" height=\"32\" />\n\n<img\n  src={product.thumbnail}\n  srcSet={product.image400 + ' 400w, ' + product.image800 + ' 800w'}\n  sizes=\"(min-width: 768px) 25vw, 50vw\"\n  alt={product.title}\n  width=\"400\" height=\"300\"\n  loading=\"lazy\"\n  style={{ objectFit: 'cover', aspectRatio: '4 / 3' }}\n  onError={e => { e.currentTarget.src = '/placeholder.png'; }}\n/>",
    },
    {
      heading: 'Web fonts without slowing the app down',
      content:
        'Three common ways to add a font such as **Inter** or **Poppins**:\n\n1. **Google Fonts link** in `index.html` with `preconnect` to fonts.googleapis.com and fonts.gstatic.com, and `&display=swap`\n2. **Self-host with Fontsource** (popular in Vite apps): `npm install @fontsource-variable/inter` and `import \'@fontsource-variable/inter\';` in main.jsx. No third-party request, works offline and is GDPR-friendly\n3. Put `.woff2` files in `src/assets/fonts` and write `@font-face` yourself\n\nThen set the family once: in CSS (`body { font-family: \'Inter Variable\', system-ui, sans-serif; }`), in Tailwind 4 `@theme { --font-sans: ... }`, or in the MUI theme `typography.fontFamily`.\n\n**Rules**: load only the weights you use (400, 500, 600, 700), prefer **variable fonts** (one file for all weights), use `font-display: swap` so text is visible immediately with a fallback font, and always end the stack with a system fallback.',
      syntax:
        "<!-- index.html (option 1) -->\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />\n<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin />\n<link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap\" rel=\"stylesheet\" />\n\n// main.jsx (option 2: self-hosted)\nimport '@fontsource-variable/inter';\n\n/* index.css */\nbody { font-family: 'Inter Variable', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }",
      tip: 'Coming next (Day 35): filling this layout with professional UX patterns: skeletons, empty and error states, toasts and confirm dialogs.',
    },
  ],
  examples: [
    {
      title: 'DashboardLayout with nested routes and <Outlet />',
      scenario: 'Build the shell of "ShopKart Admin": a header, a sidebar with NavLinks and a main area. The sidebar keeps its own counter state to prove that the layout does not re-mount when you navigate.',
      steps: [
        'Create src/components/layout/DashboardLayout.jsx with Header, Sidebar and <Outlet />',
        'Create src/app/router.jsx with a parent route (element: <DashboardLayout />) and child routes',
        'Use NavLink in the Sidebar for the active style',
        'Render <RouterProvider router={router} /> in main.jsx',
        'Run the playground: a small hash router imitates Outlet and NavLink in plain React',
      ],
      code: `// src/components/layout/DashboardLayout.jsx
import { Outlet, NavLink } from 'react-router';
import { NAV_ITEMS } from './navItems';
import './layout.css';

export default function DashboardLayout() {
  return (
    <div className="shell">
      <header className="topbar">ShopKart Admin</header>
      <aside className="sidebar">
        <nav aria-label="Main">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              <Icon size={18} aria-hidden="true" /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Outlet />   {/* the matching child route renders here */}
      </main>
    </div>
  );
}

// src/app/router.jsx
export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardHome /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'products', element: <ProductsPage /> },
    ],
  },
]);`,
      playground: {
        jsx: `// ---- tiny hash router with Outlet + NavLink (plain React learning version) ----
const RouterCtx = React.createContext(null);
const OutletCtx = React.createContext(null);
function useHashPath() {
  const get = () => window.location.hash.slice(1) || '/';
  const [path, setPath] = React.useState(get);
  React.useEffect(() => {
    const on = () => setPath(get());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}
function RouterProvider({ routes }) {
  const path = useHashPath();
  const parent = routes[0];
  const child = parent.children.find(c => (c.index ? path === '/' : path === '/' + c.path)) || { element: <h2>404: Page not found</h2> };
  return (
    <RouterCtx.Provider value={path}>
      <OutletCtx.Provider value={child.element}>{parent.element}</OutletCtx.Provider>
    </RouterCtx.Provider>
  );
}
const Outlet = () => React.useContext(OutletCtx);
function NavLink({ to, className, children }) {
  const path = React.useContext(RouterCtx);
  const isActive = path === to;
  return <a href={'#' + to} aria-current={isActive ? 'page' : undefined} className={className({ isActive })}>{children}</a>;
}
// ---- app ----
const NAV = [{ to: '/', label: 'Dashboard' }, { to: '/orders', label: 'Orders' }, { to: '/products', label: 'Products' }];

function Sidebar() {
  const [clicks, setClicks] = React.useState(0);
  React.useEffect(() => { console.log('Sidebar mounted'); }, []);
  return (
    <aside className="sidebar">
      <nav aria-label="Main">
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>{n.label}</NavLink>
        ))}
      </nav>
      <button className="small" onClick={() => setClicks(c => c + 1)}>Sidebar state: {clicks}</button>
    </aside>
  );
}
function DashboardLayout() {
  return (
    <div className="shell">
      <header className="topbar"><b>ShopKart Admin</b><span>Hi, Anjali</span></header>
      <Sidebar />
      <main className="content"><Outlet /></main>
    </div>
  );
}
const DashboardHome = () => <><h2>Dashboard</h2><p>Today: 128 orders, ₹2,45,600 revenue.</p></>;
const OrdersPage = () => <><h2>Orders</h2><ul>{['OD-901 Pune', 'OD-902 Jaipur', 'OD-903 Kolkata'].map(o => <li key={o}>{o}</li>)}</ul></>;
const ProductsPage = () => <><h2>Products</h2><p>342 active products.</p></>;

const routes = [{ element: <DashboardLayout />, children: [
  { index: true, element: <DashboardHome /> },
  { path: 'orders', element: <OrdersPage /> },
  { path: 'products', element: <ProductsPage /> },
] }];

function App() { return <RouterProvider routes={routes} />; }`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; }
.shell { display: grid; grid-template-columns: 200px 1fr; grid-template-rows: 52px 1fr; grid-template-areas: 'sidebar header' 'sidebar main'; height: 100dvh; }
.topbar { grid-area: header; display: flex; justify-content: space-between; align-items: center; padding: 0 16px; border-bottom: 1px solid #e5e7eb; background: #fff; }
.sidebar { grid-area: sidebar; background: #111827; color: #fff; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; }
.nav-link { display: block; color: #d1d5db; text-decoration: none; padding: 8px 10px; border-radius: 6px; margin-bottom: 4px; }
.nav-link:hover { background: #1f2937; }
.nav-link.active { background: #4f46e5; color: #fff; }
.content { grid-area: main; overflow-y: auto; padding: 16px 20px; background: #f9fafb; }
.small { font-size: 12px; }`,
      },
      result: 'A dark sidebar with Dashboard, Orders and Products, a white header and a grey content area. Clicking a link changes only the main content and highlights the active link. "Sidebar mounted" is logged once, and the sidebar counter keeps its value while you switch pages.',
      explanation:
        'The parent route renders DashboardLayout; Outlet is replaced by the element of the matching child route. Because the layout element stays in the same place in the tree, React keeps it mounted and its state survives navigation. The playground uses a tiny hash router; React Router does the same with createBrowserRouter, NavLink and Outlet.',
    },
    {
      title: 'Collapsible sidebar and accessible mobile drawer',
      scenario: 'On a laptop, the user can collapse the sidebar to icons. On a phone, a hamburger opens the menu as a drawer that closes on backdrop click, Escape or after choosing a page.',
      steps: [
        'Keep collapsed (desktop) and mobileOpen (phone) as two separate state values',
        'Save collapsed in localStorage',
        'Hamburger button: aria-label, aria-expanded, aria-controls; visible only below 768px',
        'Drawer: backdrop click, Escape key and route change close it; lock body scroll while open',
        'Run the playground and make the preview narrower than 768px to see the hamburger',
      ],
      code: `export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useLocalStorage('sidebar-collapsed', false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = e => e.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <div className={'shell' + (collapsed ? ' collapsed' : '')}>
      <header className="topbar">
        <button className="hamburger" aria-label="Open menu" aria-expanded={mobileOpen}
          aria-controls="mobile-nav" onClick={() => setMobileOpen(true)}>
          <Menu aria-hidden="true" />
        </button>
        <button className="collapse-btn" onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
        </button>
      </header>
      <aside className="sidebar"><SidebarNav collapsed={collapsed} /></aside>
      {mobileOpen && (
        <>
          <div className="backdrop" onClick={() => setMobileOpen(false)} />
          <aside id="mobile-nav" className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
            <button aria-label="Close menu" onClick={() => setMobileOpen(false)}><X aria-hidden="true" /></button>
            <SidebarNav />
          </aside>
        </>
      )}
      <main className="content"><Outlet /></main>
    </div>
  );
}`,
      playground: {
        jsx: `const NAV = [
  { id: 'dashboard', label: 'Dashboard', short: 'D' },
  { id: 'orders', label: 'Orders', short: 'O' },
  { id: 'customers', label: 'Customers', short: 'C' },
  { id: 'settings', label: 'Settings', short: 'S' },
];

function readCollapsed() { try { return localStorage.getItem('sidebar-collapsed') === 'true'; } catch (e) { return false; } }

function SidebarNav({ page, onNavigate, collapsed }) {
  return (
    <nav aria-label="Main">
      {NAV.map(n => (
        <button key={n.id} className={'nav-link' + (page === n.id ? ' active' : '')} onClick={() => onNavigate(n.id)}
          aria-current={page === n.id ? 'page' : undefined} title={collapsed ? n.label : undefined} aria-label={collapsed ? n.label : undefined}>
          <span className="icon" aria-hidden="true">{n.short}</span>{!collapsed && <span>{n.label}</span>}
        </button>
      ))}
    </nav>
  );
}

function App() {
  const [page, setPage] = React.useState('dashboard');
  const [collapsed, setCollapsed] = React.useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const hamburgerRef = React.useRef(null);

  React.useEffect(() => { try { localStorage.setItem('sidebar-collapsed', String(collapsed)); } catch (e) {} }, [collapsed]);
  React.useEffect(() => { setMobileOpen(false); }, [page]);           // close drawer on "route change"
  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = e => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const btn = hamburgerRef.current;
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      if (btn) btn.focus();                                          // return focus to the trigger
    };
  }, [mobileOpen]);

  return (
    <div className={'shell' + (collapsed ? ' collapsed' : '')}>
      <header className="topbar">
        <button ref={hamburgerRef} className="hamburger" aria-label="Open menu" aria-expanded={mobileOpen} aria-controls="mobile-nav" onClick={() => setMobileOpen(true)}>☰</button>
        <button className="collapse-btn" onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? '»' : '«'}</button>
        <b>ShopKart Admin</b>
      </header>
      <aside className="sidebar"><SidebarNav page={page} onNavigate={setPage} collapsed={collapsed} /></aside>
      {mobileOpen && (
        <>
          <div className="backdrop" onClick={() => setMobileOpen(false)} />
          <aside id="mobile-nav" className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
            <button className="close" aria-label="Close menu" onClick={() => setMobileOpen(false)} autoFocus>✕</button>
            <SidebarNav page={page} onNavigate={setPage} collapsed={false} />
          </aside>
        </>
      )}
      <main className="content">
        <h2 style={{ textTransform: 'capitalize' }}>{page}</h2>
        <p>Resize the preview below 768px to switch to the mobile drawer.</p>
        {Array.from({ length: 12 }, (_, i) => <p key={i}>Content row {i + 1}</p>)}
      </main>
    </div>
  );
}`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; }
.shell { display: grid; grid-template-columns: 220px 1fr; grid-template-rows: 52px 1fr; grid-template-areas: 'sidebar header' 'sidebar main'; height: 100dvh; transition: grid-template-columns .2s; }
.shell.collapsed { grid-template-columns: 64px 1fr; }
.topbar { grid-area: header; display: flex; align-items: center; gap: 10px; padding: 0 12px; border-bottom: 1px solid #e5e7eb; }
.topbar button { border: 1px solid #d1d5db; background: #fff; border-radius: 6px; padding: 4px 10px; cursor: pointer; font-size: 16px; }
.hamburger { display: none; }
.sidebar { grid-area: sidebar; background: #111827; padding: 10px; overflow: hidden; }
.nav-link { display: flex; align-items: center; gap: 10px; width: 100%; border: 0; background: none; color: #d1d5db; padding: 8px; border-radius: 6px; cursor: pointer; font: inherit; text-align: left; margin-bottom: 4px; }
.nav-link:hover { background: #1f2937; }
.nav-link.active { background: #4f46e5; color: #fff; }
.icon { display: inline-grid; place-items: center; width: 26px; height: 26px; border-radius: 6px; background: #374151; color: #fff; font-weight: 700; flex-shrink: 0; }
.content { grid-area: main; overflow-y: auto; padding: 12px 20px; }
.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 10; }
.drawer { position: fixed; top: 0; left: 0; bottom: 0; width: min(80vw, 260px); background: #111827; padding: 12px; z-index: 11; animation: slide .2s ease-out; }
.drawer .close { background: none; border: 0; color: #fff; font-size: 20px; cursor: pointer; margin-bottom: 8px; }
@keyframes slide { from { transform: translateX(-100%); } to { transform: none; } }
@media (max-width: 767px) {
  .shell, .shell.collapsed { grid-template-columns: 1fr; grid-template-areas: 'header' 'main'; }
  .sidebar, .collapse-btn { display: none; }
  .hamburger { display: inline-block; }
}`,
      },
      result: 'On a wide preview, « collapses the sidebar to letter icons (with tooltips) and » expands it; the choice survives a reload. On a narrow preview the sidebar disappears and ☰ opens a sliding drawer over a dark backdrop. Escape, the backdrop, ✕ or choosing a page closes it and focus returns to ☰.',
      explanation:
        'collapsed and mobileOpen are separate because they are different UI states for different screen sizes. The effect that depends on page closes the drawer after navigation; the mobileOpen effect adds the Escape listener and scroll lock and cleans both up, then returns focus to the trigger. In the real app the letter icons are lucide-react icons.',
    },
    {
      title: 'Icon component with lucide-style props and accessible icon buttons',
      scenario: 'Build a top bar with notification, cart and profile icon buttons. Learn how size, color (currentColor) and strokeWidth work and how to make icon-only buttons accessible.',
      steps: [
        'npm install lucide-react',
        'Import named icons: import { Bell, ShoppingCart, User } from "lucide-react"',
        'Decorative icons get aria-hidden="true"; icon-only buttons get aria-label',
        'Add a badge with a visually hidden text for screen readers',
        'Run the playground: a small Icon component draws simplified SVG icons with the same props as lucide-react',
      ],
      code: `import { Bell, ShoppingCart, User } from 'lucide-react';

export function TopActions({ unread, cartCount }) {
  return (
    <div className="flex items-center gap-2">
      <button aria-label={'Notifications, ' + unread + ' unread'} className="icon-btn">
        <Bell size={20} strokeWidth={1.75} aria-hidden="true" />
        {unread > 0 && <span className="badge" aria-hidden="true">{unread}</span>}
      </button>
      <button aria-label={'Cart, ' + cartCount + ' items'} className="icon-btn">
        <ShoppingCart size={20} aria-hidden="true" />
      </button>
      <button className="flex items-center gap-1">
        <User size={18} aria-hidden="true" /> Profile   {/* text is the accessible name */}
      </button>
    </div>
  );
}`,
      playground: {
        jsx: `// Simplified SVG paths in a 24x24 viewBox (real lucide-react ships 1,500+ polished icons)
const PATHS = {
  bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  cart: ['M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6', 'M9 21h.01', 'M18 21h.01'],
  user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
};

function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 2, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      {PATHS[name].map(d => <path key={d} d={d} />)}
    </svg>
  );
}

function App() {
  const [size, setSize] = React.useState(22);
  const [stroke, setStroke] = React.useState(2);
  const [unread, setUnread] = React.useState(3);
  const [cart, setCart] = React.useState(2);
  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }}>
      <div className="bar">
        <button className="icon-btn" aria-label="Open menu"><Icon name="menu" size={size} strokeWidth={stroke} aria-hidden="true" /></button>
        <b style={{ flex: 1 }}>ShopKart</b>
        <button className="icon-btn" aria-label={'Notifications, ' + unread + ' unread'} onClick={() => setUnread(0)}>
          <Icon name="bell" size={size} strokeWidth={stroke} aria-hidden="true" />
          {unread > 0 && <span className="badge" aria-hidden="true">{unread}</span>}
        </button>
        <button className="icon-btn" aria-label={'Cart, ' + cart + ' items'} onClick={() => setCart(c => c + 1)}>
          <Icon name="cart" size={size} strokeWidth={stroke} aria-hidden="true" />
          <span className="badge" aria-hidden="true">{cart}</span>
        </button>
        <button className="text-btn"><Icon name="user" size={18} strokeWidth={stroke} aria-hidden="true" /> Profile</button>
      </div>
      <div style={{ marginTop: 16, display: 'grid', gap: 8, maxWidth: 320 }}>
        <label>size: {size}px <input type="range" min="14" max="40" value={size} onChange={e => setSize(Number(e.target.value))} /></label>
        <label>strokeWidth: {stroke} <input type="range" min="1" max="3" step="0.25" value={stroke} onChange={e => setStroke(Number(e.target.value))} /></label>
        <small>Icons use currentColor: hover a button to see the icon change colour with the text.</small>
      </div>
    </div>
  );
}`,
        css: `.bar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 10px; color: #374151; }
.icon-btn { position: relative; display: inline-grid; place-items: center; width: 42px; height: 42px; border: 0; border-radius: 999px; background: transparent; color: inherit; cursor: pointer; }
.icon-btn:hover, .text-btn:hover { background: #eef2ff; color: #4f46e5; }
.icon-btn:focus-visible, .text-btn:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }
.badge { position: absolute; top: 4px; right: 2px; min-width: 18px; height: 18px; border-radius: 9px; background: #dc2626; color: #fff; font-size: 11px; display: grid; place-items: center; padding: 0 4px; }
.text-btn { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #d1d5db; border-radius: 999px; background: #fff; color: inherit; padding: 6px 12px; cursor: pointer; }`,
      },
      result: 'A top bar with menu, bell (badge 3), cart (badge 2) and a "Profile" button. Sliders change icon size and stroke width live. Hovering turns the icon indigo because it uses currentColor. Clicking the bell clears the badge; clicking the cart increases it.',
      explanation:
        'lucide-react icons are SVG components with the same props as this Icon: size sets width/height, stroke uses currentColor so the icon follows CSS color, and extra props (aria-hidden, className) are passed to the <svg>. Icon-only buttons get their accessible name from aria-label, including the count, while the visual badge is hidden from screen readers to avoid reading it twice.',
    },
    {
      title: 'Responsive product image grid: lazy loading, aspect-ratio and fallbacks',
      scenario: 'The products page shows 12 photos. They must not make the layout jump while loading, should load lazily, show a placeholder while loading and a fallback when a URL is broken.',
      steps: [
        'Give every image width/height (or CSS aspect-ratio) to reserve space',
        'Add loading="lazy" and decoding="async" for images below the fold',
        'Track a loaded state per image to fade it in over a grey placeholder',
        'Handle onError with a fallback (inline SVG data URI or /placeholder.png)',
        'Use a system font stack fallback after the custom font',
        'Run the playground (images from picsum.photos; card 5 has a broken URL on purpose)',
      ],
      code: `// src/components/ui/SmartImage.jsx
import { useState } from 'react';
import placeholder from '@/assets/placeholder.svg';

export function SmartImage({ src, alt, ratio = '4 / 3', className = '', ...props }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className={'relative overflow-hidden rounded-lg bg-slate-200 ' + className} style={{ aspectRatio: ratio }}>
      <img
        src={failed ? placeholder : src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => { setFailed(true); setLoaded(true); }}
        className={'h-full w-full object-cover transition-opacity duration-300 ' + (loaded ? 'opacity-100' : 'opacity-0')}
        {...props}
      />
    </div>
  );
}

// main.jsx: self-hosted variable font
import '@fontsource-variable/inter';`,
      playground: {
        jsx: `const FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#e5e7eb"/><text x="2" y="1.8" font-size=".5" text-anchor="middle" fill="#6b7280">No image</text></svg>'
);

function SmartImage({ src, alt, ratio = '4 / 3' }) {
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  return (
    <div className="frame" style={{ aspectRatio: ratio }}>
      <img src={failed ? FALLBACK : src} alt={alt} loading="lazy" decoding="async"
        onLoad={() => { setLoaded(true); console.log('loaded', alt); }}
        onError={() => { console.warn('broken image:', alt); setFailed(true); setLoaded(true); }}
        style={{ opacity: loaded ? 1 : 0 }} />
    </div>
  );
}

const NAMES = ['Kurta set', 'Running shoes', 'Steel bottle', 'Office chair', 'Desk lamp', 'Saree', 'Backpack', 'Smartwatch', 'Pressure cooker', 'Yoga mat', 'Headphones', 'Tea set'];
const products = NAMES.map((name, i) => ({
  id: i + 1,
  name,
  price: 299 + i * 350,
  img: i === 4 ? 'https://example.invalid/broken.jpg' : 'https://picsum.photos/seed/shop' + (i + 1) + '/400/300',
}));

function App() {
  return (
    <div className="page">
      <h2>Products ({products.length})</h2>
      <div className="grid">
        {products.map(p => (
          <article key={p.id} className="card">
            <SmartImage src={p.img} alt={p.name} />
            <h3>{p.name}</h3>
            <p>{'₹' + p.price.toLocaleString('en-IN')}</p>
          </article>
        ))}
      </div>
    </div>
  );
}`,
        css: `body { margin: 0; font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; }
.page { padding: 12px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px; }
.card h3 { font-size: 14px; margin: 8px 0 2px; }
.card p { margin: 0; color: #4f46e5; font-weight: 600; }
.frame { position: relative; overflow: hidden; border-radius: 8px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; }
.frame img { width: 100%; height: 100%; object-fit: cover; display: block; transition: opacity .3s; }
@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }`,
      },
      result: 'A responsive grid of 12 product cards. Each card keeps a 4:3 shimmering grey box while its photo loads, then the photo fades in. Card 5 (Desk lamp) shows a grey "No image" fallback and the console warns "broken image: Desk lamp". The layout never jumps.',
      explanation:
        'aspect-ratio reserves the exact space before the image arrives, which prevents layout shift. loading="lazy" lets the browser delay off-screen images. onLoad and onError switch from placeholder to image or fallback. The CSS font stack starts with Inter and falls back to system fonts if it is not loaded.',
    },
  ],
  interview: [
    { q: 'What is <Outlet /> in React Router?', a: 'A placeholder inside a parent (layout) route element where the matched child route renders. It lets the layout (header, sidebar) render once and stay mounted while child pages change.', level: 'Easy' },
    { q: 'How do you create a layout shared by several pages?', a: 'Use a layout route: a parent route whose element is the layout component (containing <Outlet />) and whose children are the pages. Pathless layout routes (no path, only element and children) let you group routes under a layout without changing URLs.', level: 'Medium' },
    { q: 'What is the difference between Link and NavLink?', a: 'Both navigate without reloading. NavLink knows if it matches the current URL: it can receive className/style functions with { isActive, isPending } and sets aria-current="page". The end prop makes it match only the exact path.', level: 'Easy' },
    { q: 'How do you pass data from a layout to its child routes?', a: 'Use <Outlet context={value} /> in the layout and useOutletContext() in the child. For app-wide data, use Context, a store, or route loaders.', level: 'Medium' },
    { q: 'How would you build a responsive dashboard layout?', a: 'CSS Grid shell with header, sidebar and main areas; main scrolls (overflow-y: auto) with height 100dvh; below a breakpoint the sidebar is hidden and replaced by a hamburger-triggered drawer; optional collapsed sidebar on desktop saved in localStorage; nav items defined once in an array.', level: 'Medium' },
    { q: 'What makes a mobile menu accessible?', a: 'A real <button> with aria-label, aria-expanded and aria-controls; the drawer labelled (role="dialog" with aria-modal or a nav landmark); Escape and backdrop close it; focus moves into it and returns to the trigger; background scroll locked; it closes after navigation.', level: 'Hard' },
    { q: 'How should you import icons from lucide-react?', a: 'As named imports of only the icons you use (import { Menu, X } from "lucide-react"), which allows tree shaking. Avoid import * or dynamic lookup by name, which bundles all icons.', level: 'Easy' },
    { q: 'How do you make an icon-only button accessible?', a: 'Give the button an accessible name via aria-label (or visually hidden text) and mark the SVG aria-hidden="true". Ensure a visible focus style and a large enough touch target (about 44x44px).', level: 'Medium' },
    { q: 'src/assets vs public folder in Vite: when to use each?', a: 'Import files from src/assets when used in code: Vite processes them, adds hashes for caching and can inline small files. Use public/ for files that must keep an exact URL and are not imported: favicon, robots.txt, manifest icons, og-image.', level: 'Medium' },
    { q: 'How do you avoid layout shift (CLS) from images?', a: 'Reserve space with width and height attributes or CSS aspect-ratio, use placeholders/skeletons of the same size, avoid inserting content above existing content, and load web fonts with font-display: swap plus matching fallbacks.', level: 'Hard' },
    { q: 'What are the options for adding custom fonts to a React app?', a: 'Google Fonts <link> with preconnect and display=swap; self-hosting via Fontsource packages (import "@fontsource-variable/inter") or your own @font-face with woff2 files. Load only needed weights, prefer variable fonts, and define fallbacks.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create two layouts: AuthLayout (centred card with logo, used by /login and /register) and DashboardLayout (sidebar app, used by /, /orders, /settings). Write the router config.',
      hint: 'Use pathless layout routes: { element: <AuthLayout />, children: [...] }.',
      solution: `// src/components/layout/AuthLayout.jsx
import { Outlet } from 'react-router';
import logo from '@/assets/logo.svg';

export default function AuthLayout() {
  return (
    <div className="grid min-h-dvh place-items-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow">
        <img src={logo} alt="ShopKart" width="120" height="32" className="mx-auto mb-4" />
        <Outlet />
      </div>
    </div>
  );
}

// src/app/router.jsx
import { createBrowserRouter } from 'react-router';
export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardHome /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);`,
    },
    {
      task: 'Write a navItems.js config with lucide-react icons and a SidebarNav component that renders NavLinks with active styles and supports a collapsed mode (icons only with title and aria-label).',
      hint: 'Rename the icon field to a capitalised variable while destructuring: icon: Icon.',
      solution: `// src/components/layout/navItems.js
import { House, ShoppingCart, Package, Users, Settings } from 'lucide-react';
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: House, end: true },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

// src/components/layout/SidebarNav.jsx
import { NavLink } from 'react-router';
import { NAV_ITEMS } from './navItems';

export function SidebarNav({ collapsed = false }) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to} to={to} end={end}
          title={collapsed ? label : undefined}
          aria-label={collapsed ? label : undefined}
          className={({ isActive }) =>
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm ' +
            (isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800')}
        >
          <Icon size={18} aria-hidden="true" />
          {!collapsed && <span>{label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}`,
    },
    {
      task: 'Write a useMediaQuery(query) hook and use it to render <MobileHeader /> below 768px and <DesktopHeader /> above, updating live when the window is resized.',
      hint: 'window.matchMedia(query) has .matches and a "change" event.',
      solution: `import { useEffect, useState } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = e => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

// Header.jsx
export function Header() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  return isMobile ? <MobileHeader /> : <DesktopHeader />;
}
// Prefer pure CSS (media queries / Tailwind md:) when only styles differ;
// use the hook when different COMPONENTS or behaviour are needed.`,
    },
    {
      task: 'Add the Poppins font (weights 500 and 700) for headings and Inter for body text using Fontsource, with good fallbacks, in a Vite + Tailwind 4 project.',
      hint: 'npm i @fontsource/poppins @fontsource-variable/inter; import the weights in main.jsx; define --font-* in @theme.',
      solution: `npm i @fontsource/poppins @fontsource-variable/inter

// main.jsx
import '@fontsource-variable/inter';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/700.css';
import './index.css';

/* index.css */
@import "tailwindcss";
@theme {
  --font-sans: "Inter Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-display: "Poppins", "Inter Variable", system-ui, sans-serif;
}

// usage
<h1 className="font-display text-3xl font-bold">Festive offers</h1>
<p className="font-sans">Body text uses Inter.</p>
// Fontsource CSS already uses font-display: swap.`,
    },
    {
      task: 'Build a "Settings" page inside the dashboard layout that reads the logged-in user from the layout via useOutletContext and shows their name and city.',
      hint: '<Outlet context={{ user }} /> in the layout.',
      solution: `// DashboardLayout.jsx
import { Outlet } from 'react-router';
export default function DashboardLayout() {
  const user = { name: 'Anjali Desai', city: 'Ahmedabad', role: 'admin' };
  return (
    <div className="shell">
      <Header user={user} />
      <Sidebar />
      <main className="content">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}

// SettingsPage.jsx
import { useOutletContext } from 'react-router';
export default function SettingsPage() {
  const { user } = useOutletContext();
  return (
    <section>
      <h1>Settings</h1>
      <p>Name: {user.name}</p>
      <p>City: {user.city}</p>
    </section>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'Where does a child route render inside its parent layout route?',
      options: ['Inside <Routes>', 'At the <Outlet /> position', 'Inside <Link>', 'At the end of <body>'],
      answer: 1,
      explanation: 'Outlet marks where the matching child route element appears.',
    },
    {
      question: 'Why does the sidebar keep its state when navigating between child routes?',
      options: ['Because of localStorage', 'React Router caches every page', 'The layout element stays mounted; only the Outlet content changes', 'Because of React.memo'],
      answer: 2,
      explanation: 'The parent route element is not re-created on child navigation.',
    },
    {
      question: 'Which is the correct way to use lucide-react icons for a small bundle?',
      options: ['import { Menu, X } from "lucide-react"', 'import * as Icons from "lucide-react"', 'Load all icons from a CDN', 'Use <i class="lucide-menu">'],
      answer: 0,
      explanation: 'Named imports allow tree shaking; only those icons are bundled.',
    },
    {
      question: 'What should an icon-only "open menu" button have?',
      options: ['A title only', 'alt="menu" on the button', 'tabindex="-1"', 'aria-label="Open menu" and aria-expanded'],
      answer: 3,
      explanation: 'aria-label gives the accessible name and aria-expanded tells the menu state.',
    },
    {
      question: 'What prevents an image from causing layout shift while it loads?',
      options: ['loading="eager"', 'Reserving its space with width/height or aspect-ratio', 'Using PNG instead of JPEG', 'Putting it in the public folder'],
      answer: 1,
      explanation: 'Known dimensions let the browser reserve the box before the image arrives.',
    },
  ],
};
