export default {
  id: 'day-20-react-router-basics',
  title: 'React Router: BrowserRouter, Routes, Route, Link and NavLink',
  module: 'Module 4: Routing & State Management',
  day: 20,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Single Page Applications still need multiple "pages" with their own URLs. React Router maps URLs to components so users can navigate, bookmark and use the back button, without full page reloads.',
  objectives: [
    'Explain client-side routing and why SPAs need a router',
    'Install React Router and wrap the app in BrowserRouter',
    'Define pages with Routes and Route, including a 404 route',
    'Navigate with Link and highlight the active page with NavLink',
    'Understand how routing works under the hood (History API) via a tiny hand-made router',
  ],
  theory: [
    {
      heading: 'Client-side routing in an SPA',
      content:
        'In a traditional website, clicking a link asks the server for a brand-new HTML page. The whole screen flashes and reloads.\n\nIn a **Single Page Application** there is only one HTML page. JavaScript swaps components on the screen. But users still expect:\n- A different URL for each screen (`/about`, `/products`)\n- Bookmarks and shared links that open the right screen\n- The browser Back and Forward buttons to work\n\nA **router** keeps the URL and the UI in sync. It listens to URL changes and renders the component that matches. It uses the browser **History API** (`history.pushState`) to change the URL **without reloading**.\n\nAnalogy: a TV remote. The TV (your app) stays on; the remote (router) just changes the channel (component) and shows the channel number (URL).',
    },
    {
      heading: 'Installing and setting up React Router',
      content:
        'React Router is a separate package (current major version 6/7). In a Vite project:\n\n`npm install react-router-dom`\n\nThen wrap your app in `BrowserRouter` once, usually in `main.jsx`. `BrowserRouter` uses clean URLs like `/about` and the History API.\n\nNote: our single-file playground cannot install npm packages, so the playground examples below build a **tiny router with plain React** to show the same idea. The `code` blocks show the real React Router code you will use in a Vite project.',
      syntax:
        "// main.jsx\nimport React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport { BrowserRouter } from 'react-router-dom';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <BrowserRouter>\n    <App />\n  </BrowserRouter>\n);",
    },
    {
      heading: 'Routes and Route',
      content:
        '`<Routes>` looks at the current URL and renders the **best matching** `<Route>` among its children. Each Route has:\n- `path`: the URL pattern (`/`, `/about`, `/products`)\n- `element`: the JSX to render (`<About />`)\n\nSpecial paths:\n- `path="/"` is the home page\n- `path="*"` matches anything not matched by other routes: use it for a **404 Not Found** page\n\nIn v6+ the order of routes does not matter for matching: React Router picks the most specific match automatically.',
      syntax:
        "import { Routes, Route } from 'react-router-dom';\n\nfunction App() {\n  return (\n    <Routes>\n      <Route path=\"/\" element={<Home />} />\n      <Route path=\"/about\" element={<About />} />\n      <Route path=\"/contact\" element={<Contact />} />\n      <Route path=\"*\" element={<NotFound />} />\n    </Routes>\n  );\n}",
    },
    {
      heading: 'Link vs <a>',
      content:
        'Never use a plain `<a href="/about">` for internal navigation in a React Router app. It makes the browser **reload the whole page**, losing all React state.\n\n`<Link to="/about">About</Link>` renders an `<a>` tag but intercepts the click, calls `history.pushState`, and lets React Router render the new route **without reloading**.\n\nUse a normal `<a>` only for **external** websites (`https://google.com`).',
      syntax:
        "import { Link } from 'react-router-dom';\n\n<nav>\n  <Link to=\"/\">Home</Link>\n  <Link to=\"/about\">About</Link>\n</nav>",
      tip: 'Common mistake: writing <Link href="/about">. Link uses the "to" prop, not "href".',
    },
    {
      heading: 'NavLink: links that know they are active',
      content:
        '`NavLink` is a special Link for navigation menus. It knows whether its `to` matches the current URL and:\n- Adds the class `active` automatically when it matches\n- Accepts a **function** for `className` or `style` that receives `{ isActive }`\n- Adds `aria-current="page"` for accessibility\n\nUse the `end` prop on the home link (`to="/"`) so it is only active on exactly `/`, not on every page.',
      syntax:
        "import { NavLink } from 'react-router-dom';\n\n<NavLink to=\"/\" end className={({ isActive }) => (isActive ? 'nav active' : 'nav')}>Home</NavLink>\n<NavLink to=\"/about\" style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}>About</NavLink>",
    },
    {
      heading: 'BrowserRouter vs HashRouter, and deployment',
      content:
        '- **BrowserRouter**: clean URLs (`/about`). The server must be configured to return `index.html` for every path (otherwise refreshing `/about` gives a server 404). Vite dev server already does this; on Netlify/Vercel you add a rewrite rule (Day 29).\n- **HashRouter**: URLs like `/#/about`. Everything after `#` never reaches the server, so it works on any static host without configuration, but URLs look less clean.\n\nModern projects can also use `createBrowserRouter` + `RouterProvider` (the "data router" API) which adds loaders and actions; the concepts of routes and links are the same.\n\nComing next: Day 21 covers dynamic routes (`/products/:id`), nested routes, useNavigate and protected routes.',
    },
  ],
  examples: [
    {
      title: 'A three-page site with React Router (real code) and a hash-router playground',
      scenario: 'Build Home, About and Contact pages with a navigation bar and a 404 page.',
      steps: [
        'npm create vite@latest my-site -- --template react, then npm install react-router-dom',
        'Wrap <App /> with <BrowserRouter> in main.jsx',
        'Create Home, About, Contact and NotFound components',
        'In App, add <nav> with Link components and a <Routes> block',
        'Run npm run dev and click the links; notice the URL changes without a reload',
        'In the playground, the same idea runs with a tiny hand-made hash router',
      ],
      code: `// App.jsx (React Router)
import { Routes, Route, Link } from 'react-router-dom';

function Home() { return <h2>Home</h2>; }
function About() { return <h2>About us</h2>; }
function Contact() { return <h2>Contact</h2>; }
function NotFound() { return <h2>404 - Page not found</h2>; }

export default function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link> | <Link to="/contact">Contact</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}`,
      playground: {
        jsx: `// A tiny hash-based router built with plain React (demonstrates the idea of React Router)
function useHashPath() {
  const read = () => window.location.hash.slice(1) || '/';
  const [path, setPath] = React.useState(read);
  React.useEffect(() => {
    const onChange = () => setPath(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

function Link({ to, children }) {
  return <a href={'#' + to}>{children}</a>;
}

function Home() { return <h2>Home</h2>; }
function About() { return <h2>About us</h2>; }
function Contact() { return <h2>Contact</h2>; }
function NotFound() { return <h2>404 - Page not found</h2>; }

const routes = { '/': Home, '/about': About, '/contact': Contact };

function App() {
  const path = useHashPath();
  const Page = routes[path] || NotFound;
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/oops">Broken link</Link>
      </nav>
      <p><small>Current path: {path}</small></p>
      <Page />
    </div>
  );
}`,
      },
      result: 'Clicking Home, About and Contact swaps the heading without reloading. "Broken link" shows the 404 page. The browser Back button returns to the previous page.',
      explanation:
        'The mini router reads the URL hash, listens to hashchange, and looks the path up in a routes object. React Router does the same job with the History API, pattern matching, nested routes and many more features.',
    },
    {
      title: 'Active menu with NavLink',
      scenario: 'Highlight the current page in the navbar.',
      steps: [
        'Replace Link with NavLink in the nav',
        'Give className a function: ({ isActive }) => isActive ? "active" : ""',
        'Add "end" to the home NavLink',
        'Add CSS for .active',
        'In the playground, a hand-made NavLink compares its "to" with the current path',
      ],
      code: `import { NavLink } from 'react-router-dom';

function Navbar() {
  const cls = ({ isActive }) => (isActive ? 'link active' : 'link');
  return (
    <nav>
      <NavLink to="/" end className={cls}>Home</NavLink>
      <NavLink to="/courses" className={cls}>Courses</NavLink>
      <NavLink to="/pricing" className={cls}>Pricing</NavLink>
    </nav>
  );
}
/* CSS */
/* .link { padding: 6px 10px; } .active { background: teal; color: white; border-radius: 4px; } */`,
      playground: {
        jsx: `const RouterContext = React.createContext('/');

function HashRouter({ children }) {
  const read = () => window.location.hash.slice(1) || '/';
  const [path, setPath] = React.useState(read);
  React.useEffect(() => {
    const onChange = () => setPath(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return <RouterContext.Provider value={path}>{children}</RouterContext.Provider>;
}

function NavLink({ to, end, children }) {
  const path = React.useContext(RouterContext);
  const isActive = end ? path === to : path === to || path.startsWith(to + '/');
  const style = {
    padding: '6px 10px', borderRadius: 4, textDecoration: 'none',
    background: isActive ? 'teal' : 'transparent', color: isActive ? 'white' : 'teal',
  };
  return <a href={'#' + to} style={style} aria-current={isActive ? 'page' : undefined}>{children}</a>;
}

function Route({ path, element }) {
  const current = React.useContext(RouterContext);
  return current === path ? element : null;
}

function App() {
  return (
    <HashRouter>
      <div style={{ fontFamily: 'sans-serif' }}>
        <nav style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/courses">Courses</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
        </nav>
        <Route path="/" element={<h2>Welcome to CodeAcademy</h2>} />
        <Route path="/courses" element={<h2>All courses</h2>} />
        <Route path="/pricing" element={<h2>Pricing plans</h2>} />
      </div>
    </HashRouter>
  );
}`,
      },
      result: 'The current page link has a teal background. Clicking another link moves the highlight and changes the heading.',
      explanation:
        'NavLink computes isActive by comparing its target with the current location. The "end" flag forces an exact match for the home link, exactly like React Router\'s NavLink.',
    },
    {
      title: 'Why <a href> breaks state but Link keeps it',
      scenario: 'A counter in the layout survives navigation when you use client-side links. A full page reload would reset it.',
      steps: [
        'Put a counter in the layout component that stays on screen for all pages',
        'Navigate using client-side links (pushState) and see the counter keep its value',
        'Compare with the "Reload page" button that simulates <a href> by calling location.reload()',
      ],
      code: `// With React Router
<Link to="/about">About</Link>      // no reload: layout state preserved
<a href="/about">About</a>          // full reload: all state lost`,
      playground: {
        jsx: `function App() {
  const [page, setPage] = React.useState('home');
  const [count, setCount] = React.useState(0);

  function go(e, to) {
    e.preventDefault();           // what <Link> does internally
    setPage(to);                  // React Router also calls history.pushState here
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <p>Layout counter: <b>{count}</b> <button onClick={() => setCount(c => c + 1)}>+1</button></p>
      <nav>
        <a href="#" onClick={e => go(e, 'home')}>Home</a> |{' '}
        <a href="#" onClick={e => go(e, 'about')}>About</a> |{' '}
        <button onClick={() => window.location.reload()}>Reload page (like a plain href)</button>
      </nav>
      <h2>{page === 'home' ? 'Home page' : 'About page'}</h2>
    </div>
  );
}`,
      },
      result: 'Increase the counter, then switch between Home and About: the counter keeps its value. Clicking "Reload page" resets everything to 0.',
      explanation:
        'Link prevents the browser default navigation and updates the URL with pushState, so React keeps the component tree alive. A plain href reloads the document, destroying all state.',
    },
  ],
  interview: [
    { q: 'What is React Router?', a: 'The most popular routing library for React. It maps URL paths to components, enabling multi-page navigation in a Single Page Application without full page reloads.', level: 'Easy' },
    { q: 'What is client-side routing?', a: 'Handling navigation in the browser with JavaScript: the URL is changed with the History API and the app renders a different component, instead of requesting a new HTML page from the server.', level: 'Easy' },
    { q: 'What does BrowserRouter do?', a: 'It provides routing context to the app using the HTML5 History API (pushState/popstate) for clean URLs. It must wrap all components that use routing features.', level: 'Easy' },
    { q: 'Difference between Routes and Route?', a: 'Route defines a single mapping of path to element. Routes is the container that looks at the current location and renders the best matching Route among its children.', level: 'Easy' },
    { q: 'Why use Link instead of <a>?', a: 'An <a href> triggers a full page reload, losing React state and re-downloading assets. Link intercepts the click and updates the URL via pushState so React renders the new route instantly.', level: 'Medium' },
    { q: 'What is the difference between Link and NavLink?', a: 'NavLink is a Link that knows if it is active. It adds an "active" class and aria-current="page" by default, and its className/style can be functions receiving { isActive }.', level: 'Medium' },
    { q: 'How do you create a 404 page?', a: 'Add <Route path="*" element={<NotFound />} /> inside Routes; it matches any path not matched by other routes.', level: 'Easy' },
    { q: 'What does the "end" prop on NavLink do?', a: 'It makes the link active only when the URL matches exactly, not for child paths. Typically used on the "/" home link so it is not active on every page.', level: 'Medium' },
    { q: 'BrowserRouter vs HashRouter?', a: 'BrowserRouter uses clean URLs and needs the server to serve index.html for all routes. HashRouter puts the route after # so the server never sees it; it works on any static host but URLs are less clean.', level: 'Medium' },
    { q: 'Why does refreshing /about on a deployed SPA sometimes give a 404?', a: 'The server looks for a real /about file that does not exist. You must configure a fallback/rewrite so every route returns index.html and React Router handles it.', level: 'Hard' },
    { q: 'Which browser API does React Router use to change the URL without reloading?', a: 'The History API: history.pushState / replaceState and the popstate event for back/forward.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a React Router app with Home, Products, Cart and a 404 page, plus a navbar using NavLink with an active style.',
      hint: 'Wrap in BrowserRouter in main.jsx; use path="*" for 404.',
      solution: `// main.jsx
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
ReactDOM.createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>);

// App.jsx
import { Routes, Route, NavLink } from 'react-router-dom';

const Home = () => <h2>Home</h2>;
const Products = () => <h2>Products</h2>;
const Cart = () => <h2>Your cart</h2>;
const NotFound = () => <h2>404 Not Found</h2>;

export default function App() {
  const style = ({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal', marginRight: 10 });
  return (
    <>
      <nav>
        <NavLink to="/" end style={style}>Home</NavLink>
        <NavLink to="/products" style={style}>Products</NavLink>
        <NavLink to="/cart" style={style}>Cart</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}`,
    },
    {
      task: 'Build your own mini hash router in plain React: a useHashPath hook, a Link component and a routes object with a fallback NotFound.',
      hint: 'Listen to the hashchange event inside useEffect.',
      solution: `function useHashPath() {
  const read = () => window.location.hash.slice(1) || '/';
  const [path, setPath] = React.useState(read);
  React.useEffect(() => {
    const onChange = () => setPath(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

const Link = ({ to, children }) => <a href={'#' + to}>{children}</a>;
const routes = { '/': () => <h2>Home</h2>, '/blog': () => <h2>Blog</h2> };

function App() {
  const path = useHashPath();
  const Page = routes[path] || (() => <h2>Not found</h2>);
  return (
    <div>
      <Link to="/">Home</Link> <Link to="/blog">Blog</Link>
      <Page />
    </div>
  );
}`,
    },
    {
      task: 'Add a shared Layout (header + footer) that stays on every page while only the middle content changes. Use React Router.',
      hint: 'Render the header and footer outside <Routes>.',
      solution: `import { Routes, Route, Link } from 'react-router-dom';

function Header() {
  return <header><Link to="/">Logo</Link> <Link to="/about">About</Link></header>;
}
function Footer() { return <footer>© 2026 My Site</footer>; }

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route path="/about" element={<h1>About</h1>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}`,
    },
    {
      task: 'Make a HashRouter version of the Products/Cart app so it works on a static host without rewrite rules.',
      hint: 'Import HashRouter instead of BrowserRouter; the rest of the code is identical.',
      solution: `import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <>
      <Link to="/">Home</Link> | <Link to="/cart">Cart</Link>
      <Routes>
        <Route path="/" element={<h2>Home</h2>} />
        <Route path="/cart" element={<h2>Cart</h2>} />
      </Routes>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <App />
  </HashRouter>
);
// URLs now look like https://site.com/#/cart`,
    },
  ],
  quiz: [
    {
      question: 'Which package do you install for routing in a React web app?',
      options: ['react-routes', 'react-navigation', 'react-router-dom', 'react-dom-router'],
      answer: 2,
      explanation: 'react-router-dom is the web binding of React Router.',
    },
    {
      question: 'Which prop does Link use for the destination?',
      options: ['to', 'href', 'path', 'url'],
      answer: 0,
      explanation: '<Link to="/about">. "path" belongs to Route, "href" to <a>.',
    },
    {
      question: 'Which route path catches all unknown URLs?',
      options: ['path="/"', 'path="404"', 'path="?"', 'path="*"'],
      answer: 3,
      explanation: 'The wildcard "*" matches anything not matched elsewhere.',
    },
    {
      question: 'What is special about NavLink?',
      options: ['It reloads the page', 'It knows when it is active and can style itself', 'It only works for external URLs', 'It replaces Routes'],
      answer: 1,
      explanation: 'NavLink provides isActive to className/style and adds aria-current.',
    },
    {
      question: 'Why can a plain <a href="/about"> be a problem in a React Router app?',
      options: ['It is not valid HTML', 'It does not work in Chrome', 'It causes a full page reload and loses React state', 'It cannot have text'],
      answer: 2,
      explanation: 'A plain link reloads the whole document.',
    },
  ],
};
