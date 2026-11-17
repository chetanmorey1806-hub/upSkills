export default {
  id: 'day-04-components',
  title: 'Components: Function Components, Import/Export and the Component Tree',
  module: 'Module 1: React Fundamentals',
  day: 4,
  level: 'Beginner',
  duration: '1.5 hours',
  summary:
    'Components are the building blocks of every React app. Learn to write function components, split them into files with default and named exports, and think of your UI as a tree of components.',
  objectives: [
    'Write function components with correct naming rules',
    'Split components into separate files using default and named exports',
    'Draw a component tree for a page and understand parent/child relationships',
    'Know the rules: components must be pure and must not be defined inside other components',
  ],
  theory: [
    {
      heading: 'What is a component?',
      content:
        'A **component** is a reusable, independent piece of UI with its own markup, logic and (optionally) styling. In modern React a component is simply a **JavaScript function that returns JSX**.\n\nAnalogy: a car factory does not build every car from scratch. It makes standard parts (wheels, seats, doors) and assembles them. Components are those standard parts: you build a `Button` once and reuse it everywhere.',
      syntax: `function Welcome() {
  return <h1>Welcome to ShopEasy</h1>;
}

// Arrow function version
const Footer = () => <footer>© 2026 ShopEasy</footer>;`,
    },
    {
      heading: 'Rules for function components',
      content: '',
      points: [
        '**Name must start with a capital letter** (PascalCase): `ProductCard`, not `productCard`. Lowercase tags are treated as HTML elements.',
        '**Return JSX** (or `null` to render nothing).',
        '**Use them like tags**: `<ProductCard />`, not `ProductCard()`.',
        '**Keep them pure**: given the same inputs (props), return the same JSX. Do not modify outside variables or the DOM during render.',
        '**Define components at the top level**, never inside another component. A component defined inside another is recreated on every render, which resets its state and hurts performance.',
      ],
      tip: 'Class components (class X extends React.Component) still exist in older code bases, but all new code uses function components with hooks.',
    },
    {
      heading: 'Exporting and importing components',
      content:
        'In a real project each component usually lives in its own file inside `src/components/`. ES modules let you share them:\n\n- **Default export**: one main thing per file. Import it with any name, without braces.\n- **Named export**: many per file. Import with the exact name inside braces.\n\nYou can mix both in one file.',
      syntax: `// src/components/Header.jsx
export default function Header() {
  return <header>ShopEasy</header>;
}

// src/components/Buttons.jsx
export function PrimaryButton() { return <button>Buy</button>; }
export function GhostButton() { return <button>Cancel</button>; }

// src/App.jsx
import Header from "./components/Header";            // default
import { PrimaryButton, GhostButton } from "./components/Buttons"; // named`,
      tip: 'Common mistake: import { Header } from "./Header" when Header is a default export gives undefined and the error "Element type is invalid".',
    },
    {
      heading: 'The component tree',
      content:
        'Components can render other components. This creates a **tree**: App at the top (the root), then its children, grandchildren and so on. The tree tells you:\n\n- who **owns** which data (Day 7 and Day 10)\n- which way data flows: **top to bottom** through props (Day 5)\n- what re-renders: when a parent re-renders, its children re-render by default\n\nPlanning a page? Draw boxes around each part of a design, name each box, and nest them. That is your component tree.',
      syntax: `App
├── Header
│   ├── Logo
│   └── NavBar
├── ProductList
│   ├── ProductCard
│   ├── ProductCard
│   └── ProductCard
└── Footer`,
    },
    {
      heading: 'How small should a component be?',
      content:
        'Follow the **Single Responsibility Principle**: a component should ideally do one thing. If a component grows beyond about 100–150 lines, or a piece of JSX is repeated, extract it into a new component.\n\nTypical folder structure:',
      syntax: `src/
├── components/   # reusable UI pieces (Button, Card, Modal)
├── pages/        # whole screens (HomePage, CartPage)
├── App.jsx
└── main.jsx`,
      tip: 'Coming next (Day 5): passing data into components with props so the same ProductCard can show different products.',
    },
  ],
  examples: [
    {
      title: 'Building a page from small components',
      scenario: 'Split a landing page into Header, Hero and Footer components and compose them in App.',
      steps: [
        'Write three small components: Header, Hero, Footer',
        'Render them inside App in order',
        'Click Run and see the full page assembled from parts',
      ],
      code: `function Header() {
  return <header><h2>ShopEasy</h2></header>;
}
function Hero() {
  return <section><h1>Big Diwali Sale</h1><p>Up to 60% off</p></section>;
}
function Footer() {
  return <footer>© 2026 ShopEasy</footer>;
}

function App() {
  return (
    <>
      <Header />
      <Hero />
      <Footer />
    </>
  );
}`,
      playground: {
        jsx: `function Header() {
  return (
    <header className="header">
      <h2>🛒 ShopEasy</h2>
      <nav>Home · Deals · Cart</nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <h1>Big Diwali Sale</h1>
      <p>Up to 60% off on electronics</p>
    </section>
  );
}

function Footer() {
  return <footer className="footer">© 2026 ShopEasy</footer>;
}

function App() {
  return (
    <>
      <Header />
      <Hero />
      <Footer />
    </>
  );
}`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 0 16px; background: #0f172a; color: #fff; }
.hero { padding: 40px 16px; text-align: center; background: linear-gradient(135deg, #f97316, #facc15); }
.footer { padding: 12px; text-align: center; background: #e2e8f0; }`,
      },
      result: 'A dark header with nav, an orange hero banner and a grey footer.',
      explanation:
        'Each component returns a part of the page. App composes them like HTML tags. Changing the Footer now only means editing one small function.',
    },
    {
      title: 'Reusing a component multiple times',
      scenario: 'Render the same FeatureCard three times inside a grid; every usage is an independent instance.',
      steps: [
        'Create a FeatureCard component with a like button and its own state',
        'Render it three times in App',
        'Click the like buttons and notice each card keeps its own count',
      ],
      code: `function FeatureCard() {
  const [likes, setLikes] = React.useState(0);
  return (
    <div className="card">
      <h3>Free Delivery</h3>
      <button onClick={() => setLikes(likes + 1)}>❤ {likes}</button>
    </div>
  );
}

function App() {
  return (
    <div className="grid">
      <FeatureCard />
      <FeatureCard />
      <FeatureCard />
    </div>
  );
}`,
      playground: {
        jsx: `function FeatureCard() {
  const [likes, setLikes] = React.useState(0);
  return (
    <div className="card">
      <h3>🚚 Free Delivery</h3>
      <p>On orders above ₹499</p>
      <button onClick={() => setLikes(likes + 1)}>❤ {likes}</button>
    </div>
  );
}

function App() {
  return (
    <div className="grid">
      <FeatureCard />
      <FeatureCard />
      <FeatureCard />
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.card { border: 1px solid #ddd; border-radius: 10px; padding: 12px; }
button { cursor: pointer; }`,
      },
      result: 'Three identical cards; each heart counter increases independently.',
      explanation:
        'A component is a blueprint; every <FeatureCard /> creates a separate instance with its own state. (The cards all show the same text for now; Day 5 shows how props make them different.)',
    },
    {
      title: 'Default vs named exports (multi-file project)',
      scenario: 'Organise components into files and import them correctly in App.jsx.',
      steps: [
        'Create src/components/Logo.jsx with a default export',
        'Create src/components/Nav.jsx with two named exports',
        'Import both in App.jsx and render them',
        'In the playground all components live in one file to simulate this',
      ],
      code: `// src/components/Logo.jsx
export default function Logo() {
  return <strong>ShopEasy</strong>;
}

// src/components/Nav.jsx
export function NavLinks() {
  return <nav>Home | Deals | Cart</nav>;
}
export function CartBadge() {
  return <span>🛒 3</span>;
}

// src/App.jsx
import Logo from "./components/Logo";
import { NavLinks, CartBadge } from "./components/Nav";

export default function App() {
  return (
    <header>
      <Logo />
      <NavLinks />
      <CartBadge />
    </header>
  );
}`,
      playground: {
        jsx: `// Playground: everything is in one file, so no module statements are needed.
// In a project these would live in Logo.jsx and Nav.jsx.
function Logo() {
  return <strong className="logo">ShopEasy</strong>;
}
function NavLinks() {
  return <nav>Home | Deals | Cart</nav>;
}
function CartBadge() {
  return <span className="badge">🛒 3</span>;
}

function App() {
  return (
    <header className="bar">
      <Logo />
      <NavLinks />
      <CartBadge />
    </header>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; margin: 0; }
.bar { display: flex; gap: 20px; align-items: center; padding: 12px 16px; background: #1e293b; color: #fff; }
.logo { font-size: 1.3rem; color: #38bdf8; }
.badge { margin-left: auto; background: #f43f5e; padding: 2px 10px; border-radius: 12px; }`,
      },
      result: 'A navigation bar with a blue logo, links and a red cart badge on the right.',
      explanation:
        'Default export: imported without braces and can be renamed. Named exports: imported inside braces with the exact names. The playground cannot use files, so all components share one scope.',
    },
    {
      title: 'Visualising the component tree',
      scenario: 'Render a tree where every component displays its own name, so you can see how nesting forms parent/child relationships.',
      steps: [
        'Create a Box helper component that draws a labelled border',
        'Nest App > Header > Logo, and App > Main > Card x2',
        'Run and compare the result with the tree diagram in the theory',
      ],
      code: `function Box({ name, children }) {
  return <div className="box"><b>{name}</b>{children}</div>;
}
function Logo() { return <Box name="Logo" />; }
function Header() { return <Box name="Header"><Logo /></Box>; }
function Card() { return <Box name="Card" />; }
function Main() { return <Box name="Main"><Card /><Card /></Box>; }
function App() { return <Box name="App"><Header /><Main /></Box>; }`,
      playground: {
        jsx: `function Box({ name, children }) {
  return (
    <div className="box">
      <b>&lt;{name} /&gt;</b>
      {children}
    </div>
  );
}

function Logo() { return <Box name="Logo" />; }
function Header() { return <Box name="Header"><Logo /></Box>; }
function Card() { return <Box name="Card" />; }
function Main() { return <Box name="Main"><Card /><Card /></Box>; }

function App() {
  return (
    <Box name="App">
      <Header />
      <Main />
    </Box>
  );
}`,
        css: `body { font-family: monospace; padding: 16px; }
.box { border: 2px dashed #64748b; border-radius: 8px; padding: 8px 8px 8px 12px; margin: 6px 0 6px 12px; background: rgba(56,189,248,.08); }
.box b { color: #0369a1; }`,
      },
      result: 'Nested dashed boxes labelled <App />, <Header />, <Logo />, <Main />, <Card /> and <Card />.',
      explanation:
        'Each component renders its children inside itself, so the visual nesting mirrors the component tree. Box uses the children prop, which is explained fully on Day 5.',
    },
  ],
  interview: [
    { q: 'What is a component in React?', a: 'An independent, reusable piece of UI. In modern React it is a JavaScript function that accepts props and returns JSX describing what should appear on screen.', level: 'Easy' },
    { q: 'Why must component names start with a capital letter?', a: 'JSX treats lowercase tags as built-in DOM elements (strings like "div"). Capitalised names are treated as variables referring to components.', level: 'Easy' },
    { q: 'Function components vs class components?', a: 'Function components are plain functions using hooks for state and lifecycle; they are shorter and the recommended approach. Class components extend React.Component and use this.state and lifecycle methods; they are legacy but still supported.', level: 'Medium' },
    { q: 'Difference between default and named exports?', a: 'A file can have one default export, imported without braces under any name. It can have many named exports, imported with braces using their exact names (or renamed with as).', level: 'Easy' },
    { q: 'Why should you not define a component inside another component?', a: 'The inner component is a new function on every render, so React sees a different type, unmounts the old one and mounts a new one, losing its state and DOM, and causing performance issues.', level: 'Hard' },
    { q: 'What does it mean that components should be pure?', a: 'During rendering, a component should not change anything outside itself (no mutating external variables, no DOM changes, no API calls) and should return the same output for the same props and state. Side effects belong in event handlers or useEffect.', level: 'Medium' },
    { q: 'What is the component tree?', a: 'The hierarchical structure of components, with App as the root. It defines parent/child relationships, the direction of data flow (top-down) and how re-renders propagate.', level: 'Easy' },
    { q: 'Can a component return null?', a: 'Yes. Returning null renders nothing, which is useful for conditionally hiding a component.', level: 'Easy' },
    { q: 'How do you decide when to split a component?', a: 'When a part of the UI is reused, when a component does more than one job, when it becomes long and hard to read, or when a part needs its own state.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create Navbar, Sidebar and Content components and arrange them in App as a basic dashboard layout.',
      hint: 'Use CSS grid or flex on a wrapper div in App.',
      solution: `function Navbar() { return <div style={{ background: "#0f172a", color: "#fff", padding: 10 }}>Dashboard</div>; }
function Sidebar() { return <aside style={{ background: "#e2e8f0", padding: 10 }}>Menu</aside>; }
function Content() { return <main style={{ padding: 10 }}>Welcome back!</main>; }

function App() {
  return (
    <div>
      <Navbar />
      <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", minHeight: 200 }}>
        <Sidebar />
        <Content />
      </div>
    </div>
  );
}`,
    },
    {
      task: 'Write a Star component that renders "⭐" and use it five times inside a Rating component.',
      hint: 'Rating returns a span containing five <Star /> elements.',
      solution: `function Star() { return <span>⭐</span>; }
function Rating() {
  return <span><Star /><Star /><Star /><Star /><Star /></span>;
}
function App() {
  return <p>Rating: <Rating /></p>;
}`,
    },
    {
      task: 'Split this into files: a Button.jsx with a default export and an Icons.jsx with named exports HomeIcon and CartIcon. Show the import lines in App.jsx.',
      hint: 'Default: no braces. Named: braces.',
      solution: `// Button.jsx
export default function Button() { return <button>Click</button>; }

// Icons.jsx
export const HomeIcon = () => <span>🏠</span>;
export const CartIcon = () => <span>🛒</span>;

// App.jsx
import Button from "./Button";
import { HomeIcon, CartIcon } from "./Icons";

export default function App() {
  return <div><HomeIcon /> <CartIcon /> <Button /></div>;
}`,
    },
    {
      task: 'Draw (as a comment) the component tree for a blog page with a header, a list of posts (each with title and author) and a sidebar, then implement it.',
      hint: 'App > Header, PostList > Post (x2), Sidebar.',
      solution: `// App
// ├── Header
// ├── PostList
// │   ├── Post
// │   └── Post
// └── Sidebar
function Header() { return <h1>My Blog</h1>; }
function Post() { return <article><h3>Post title</h3><small>by Author</small></article>; }
function PostList() { return <section><Post /><Post /></section>; }
function Sidebar() { return <aside>Popular tags</aside>; }

function App() {
  return (
    <>
      <Header />
      <PostList />
      <Sidebar />
    </>
  );
}`,
    },
  ],
  quiz: [
    { question: 'Which is a valid component name?', options: ['userCard', 'user-card', 'UserCard', '_usercard'], answer: 2, explanation: 'Components must start with a capital letter (PascalCase).' },
    { question: 'How do you import a default export named Header?', options: ['import Header from "./Header"', 'import { Header } from "./Header"', 'import * Header from "./Header"', 'require Header'], answer: 0, explanation: 'Default exports are imported without braces.' },
    { question: 'How many default exports can one file have?', options: ['Unlimited', 'Two', 'None', 'One'], answer: 3, explanation: 'A module can have only one default export.' },
    { question: 'What happens if you define a component inside another component?', options: ['It is faster', 'It is recreated each render and loses its state', 'React throws a syntax error', 'Nothing special'], answer: 1, explanation: 'A new function type each render makes React remount it.' },
    { question: 'What is at the top of a typical React component tree?', options: ['index.html', 'Footer', 'App', 'node_modules'], answer: 2, explanation: 'App is usually the root component rendered by main.jsx.' },
  ],
};
