export default {
  id: 'day-06-styling-global-css-css-modules-tailwind',
  title: 'Styling: Global CSS, CSS Modules, Tailwind CSS',
  module: 'Module 1: Next.js Basics',
  day: 6,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Next.js supports several styling approaches out of the box. Learn when to use global CSS, how CSS Modules scope class names automatically, how to style with Tailwind CSS v4 utilities, and what works in Server vs Client Components.',
  objectives: [
    'Add and organise global styles in app/globals.css imported from the root layout',
    'Create component-scoped styles with *.module.css and explain how class names are hashed',
    'Set up and use Tailwind CSS v4 (utilities, responsive prefixes, hover/dark variants)',
    'Combine conditional classes cleanly and choose the right approach per situation',
    'Know which styling options work in Server Components (and why runtime CSS-in-JS needs "use client")',
  ],
  theory: [
    {
      heading: 'Global CSS',
      content:
        'Global styles apply to **every** page: CSS resets, fonts, colours via CSS variables, base element styles (`body`, `h1`, `a`).\n\nIn the App Router you can import a global stylesheet from **any** layout or page, but the convention is **one file, `app/globals.css`, imported in the root layout**. Once loaded, the rules apply everywhere (global CSS is not removed when you navigate away), so keep it small and generic.\n\nCSS variables in `:root` are perfect for theming: define `--brand: #0070f3` once and use `var(--brand)` in modules or Tailwind.\n\nAnalogy: global CSS is the building\'s paint colour and electricity. Every flat gets it. Do not paint one person\'s bedroom from the main switchboard.',
      syntax:
        "/* app/globals.css */\n:root {\n  --brand: #0070f3;\n  --bg: #ffffff;\n  --fg: #111111;\n}\n@media (prefers-color-scheme: dark) {\n  :root { --bg: #0a0a0a; --fg: #ededed; }\n}\n* { box-sizing: border-box; }\nbody { margin: 0; background: var(--bg); color: var(--fg); font-family: system-ui, sans-serif; }\na { color: var(--brand); }\n\n// app/layout.js\nimport './globals.css';",
    },
    {
      heading: 'CSS Modules: locally scoped CSS',
      content:
        'A file named **`something.module.css`** is a **CSS Module**. When you import it, you get an object that maps your class names to **unique generated names**:\n\n`styles.card` → `"Card_card__x7Ab2"`\n\nSo `.title` in `Card.module.css` can never clash with `.title` in `Header.module.css`. No naming conventions like BEM needed.\n\nRules:\n- Use class selectors (`.card`), not bare element selectors at the top level (`h1 {}` is rejected as "not pure")\n- Hyphenated names need bracket access: `styles[\'primary-btn\']`, so prefer camelCase (`.primaryBtn`)\n- `:global(.some-class)` escapes the scoping when you must target a global class\n- `composes: base from \'./shared.module.css\';` reuses rules\n\nCSS Modules work in **both Server and Client Components** (the CSS is extracted at build time; no JS runtime).\n\nAnalogy: CSS Modules give every component its own private locker with a unique combination. Two students can both have a "books" shelf without mixing them up.',
      syntax:
        "/* app/_components/Card.module.css */\n.card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; }\n.title { font-size: 1.25rem; margin: 0 0 8px; }\n.highlight { border-color: var(--brand); }\n\n// app/_components/Card.js\nimport styles from './Card.module.css';\nexport default function Card({ title, children, highlight }) {\n  return (\n    <div className={highlight ? `${styles.card} ${styles.highlight}` : styles.card}>\n      <h3 className={styles.title}>{title}</h3>\n      {children}\n    </div>\n  );\n}",
    },
    {
      heading: 'Tailwind CSS (v4) in Next.js',
      content:
        '**Tailwind** is a **utility-first** framework: instead of writing CSS files you compose small single-purpose classes directly in JSX: `p-4` (padding 1rem), `text-xl`, `bg-blue-600`, `rounded-lg`, `flex`, `gap-4`.\n\nIf you chose Tailwind in create-next-app it is already set up. Current Next.js templates use **Tailwind v4**:\n- `npm install tailwindcss @tailwindcss/postcss postcss`\n- `postcss.config.mjs` uses the `@tailwindcss/postcss` plugin\n- `app/globals.css` contains `@import "tailwindcss";`\n- No `tailwind.config.js` needed: theme values are customised in CSS with `@theme { --color-brand: #0070f3; }`, which creates classes like `bg-brand`\n\n(Tailwind v3 used `@tailwind base; @tailwind components; @tailwind utilities;` and a `tailwind.config.js` with a `content` array. You will still see this in older projects.)\n\nKey syntax:\n- **Responsive** (mobile-first): `md:grid-cols-3` applies from the md breakpoint (768px) up\n- **State variants**: `hover:bg-blue-700`, `focus:ring-2`, `disabled:opacity-50`\n- **Dark mode**: `dark:bg-gray-900` (uses prefers-color-scheme by default)\n- **Arbitrary values**: `w-[350px]`, `bg-[#1da1f2]`\n\nTailwind generates plain CSS at build time, so it works in **Server Components**.',
      syntax:
        '/* app/globals.css */\n@import "tailwindcss";\n\n@theme {\n  --color-brand: #0070f3;\n  --font-display: "Inter", sans-serif;\n}\n\n// postcss.config.mjs\nexport default { plugins: { "@tailwindcss/postcss": {} } };',
      tip: 'Do not build class names dynamically like `bg-${color}-500`. Tailwind scans source files for complete class strings; a constructed string is never found and the style is missing. Map values to full class names instead: { red: "bg-red-500", green: "bg-green-500" }.',
    },
    {
      heading: 'Conditional classes and other options',
      content:
        'For conditional classes, join strings or use the tiny **`clsx`** package: `clsx(\'btn\', active && \'btn-active\', { \'opacity-50\': disabled })`. With Tailwind, **`tailwind-merge`** resolves conflicts (`p-2` vs `p-4`).\n\nOther supported options:\n- **Sass**: `npm install sass`, then import `.scss` or `.module.scss` files\n- **Inline styles**: `style={{ color: \'red\' }}`; fine for truly dynamic values (a progress bar width)\n- **CSS-in-JS** (styled-components, Emotion): need a style registry and only work in **Client Components** because they inject styles at runtime with hooks. Prefer CSS Modules or Tailwind with Server Components\n\nWhich to choose?\n- Small project / designers write CSS → **CSS Modules** + global variables\n- Fast UI building, consistent design system → **Tailwind**\n- Both together is common: Tailwind for layout and spacing, a module for a complex animation\n\nComing next (Day 7): fetching data in Server Components and controlling the cache.',
    },
  ],
  examples: [
    {
      title: 'CSS Modules: two components, same class name, no conflict',
      scenario: 'Both Card and Banner use a class called .title with different styles.',
      steps: [
        'Create Card.module.css and Banner.module.css, each with a .title class',
        'Import each module into its component as styles',
        'Render both on a page and inspect the elements in DevTools',
        'Notice the generated class names like Card_title__a1b2c',
        'Run the playground: it simulates the hashing that Next.js does at build time',
      ],
      code: `/* app/_components/Card.module.css */
.title { color: #0070f3; font-size: 18px; }

/* app/_components/Banner.module.css */
.title { color: white; background: crimson; padding: 8px; }

// app/_components/Card.js
import styles from './Card.module.css';
export default function Card() {
  return <h3 className={styles.title}>Card title</h3>;
}

// app/_components/Banner.js
import styles from './Banner.module.css';
export default function Banner() {
  return <h2 className={styles.title}>Sale: 50% off</h2>;
}

// Rendered HTML (class names generated by Next.js)
// <h2 class="Banner_title__Xy12a">Sale: 50% off</h2>
// <h3 class="Card_title__Q9b3k">Card title</h3>`,
      playground: {
        jsx: `// SIMULATION of CSS Modules: we "compile" CSS text into scoped class names
// and inject a <style> tag, like Next.js does at build time.
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h.toString(36).slice(0, 5);
}

function cssModule(fileName, css) {
  const map = {};
  const out = css.replace(/\\.([a-zA-Z_][\\w-]*)/g, (m, name) => {
    map[name] = fileName + '_' + name + '__' + hash(fileName + name);
    return '.' + map[name];
  });
  return { styles: map, css: out };
}

const card = cssModule('Card', '.title { color: #0070f3; font-size: 18px; }');
const banner = cssModule('Banner', '.title { color: white; background: crimson; padding: 8px; }');

function Card() { return <h3 className={card.styles.title}>Card title</h3>; }
function Banner() { return <h2 className={banner.styles.title}>Sale: 50% off</h2>; }

function App() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }}>
      <style>{card.css + banner.css}</style>
      <Banner />
      <Card />
      <h4>Generated CSS</h4>
      <pre style={{ background: '#f4f4f4', padding: 8 }}>{card.css + '\\n' + banner.css}</pre>
      <p>styles objects: <code>{JSON.stringify(card.styles)}</code> <code>{JSON.stringify(banner.styles)}</code></p>
    </div>
  );
}`,
      },
      result: 'The banner is white on crimson and the card title is blue, even though both CSS files use .title. The generated CSS shows two different class names.',
      explanation:
        'Each CSS Module class is renamed to File_class__hash, so rules from one file can only match elements that use that file\'s styles object. Next.js does this at build time with no runtime cost.',
    },
    {
      title: 'Responsive product grid with Tailwind',
      scenario: 'Show products in 1 column on phones, 2 on tablets and 4 on desktops, with hover effects and dark mode.',
      steps: [
        'Make sure app/globals.css starts with @import "tailwindcss";',
        'Create app/products/page.js',
        'Use grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 on the container',
        'Add hover:shadow-lg and dark: variants on the cards',
        'Resize the browser to see the columns change; run the playground for a simulated version',
      ],
      code: `// app/products/page.js  (Server Component, Tailwind classes)
const products = [
  { id: 1, name: 'Laptop', price: 55000 },
  { id: 2, name: 'Phone', price: 18999 },
  { id: 3, name: 'Earbuds', price: 1999 },
  { id: 4, name: 'Watch', price: 3499 },
];

export default function Products() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <article
            key={p.id}
            className="rounded-xl border border-gray-200 bg-white p-4 transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="text-blue-600">Rs {p.price.toLocaleString('en-IN')}</p>
            <button className="mt-3 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700">
              Add to cart
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}`,
      playground: {
        jsx: `// SIMULATION: the playground has no Tailwind build step, so a tiny map turns a few
// utility names into inline styles. The real code uses the class names directly.
const { useState } = React;

const U = {
  'p-4': { padding: 16 }, 'rounded-xl': { borderRadius: 12 }, 'border': { border: '1px solid #e5e7eb' },
  'bg-white': { background: '#fff' }, 'text-lg': { fontSize: 18 }, 'font-semibold': { fontWeight: 600 },
  'text-blue-600': { color: '#2563eb' }, 'bg-blue-600': { background: '#2563eb', color: '#fff', border: 0 },
  'w-full': { width: '100%' }, 'py-2': { paddingTop: 8, paddingBottom: 8 }, 'rounded-lg': { borderRadius: 8 },
};
const tw = (classes) => classes.split(' ').reduce((s, c) => ({ ...s, ...(U[c] || {}) }), {});

const products = [
  { id: 1, name: 'Laptop', price: 55000 }, { id: 2, name: 'Phone', price: 18999 },
  { id: 3, name: 'Earbuds', price: 1999 }, { id: 4, name: 'Watch', price: 3499 },
];

function App() {
  const [width, setWidth] = useState(1100);
  // mobile-first breakpoints: default 1 col, sm (640) 2 cols, lg (1024) 4 cols
  const cols = width >= 1024 ? 4 : width >= 640 ? 2 : 1;
  const active = width >= 1024 ? 'lg:grid-cols-4' : width >= 640 ? 'sm:grid-cols-2' : 'grid-cols-1';
  return (
    <div style={{ fontFamily: 'system-ui', padding: 12 }}>
      <label>Simulated screen width: {width}px{' '}
        <input type="range" min="320" max="1400" value={width} onChange={(e) => setWidth(+e.target.value)} />
      </label>
      <p>Active class: <code>{active}</code></p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + cols + ', 1fr)', gap: 12, background: '#f9fafb', padding: 8 }}>
        {products.map((p) => (
          <article key={p.id} style={tw('rounded-xl border bg-white p-4')}>
            <h2 style={{ ...tw('text-lg font-semibold'), margin: 0 }}>{p.name}</h2>
            <p style={tw('text-blue-600')}>Rs {p.price.toLocaleString('en-IN')}</p>
            <button style={tw('w-full rounded-lg bg-blue-600 py-2')}>Add to cart</button>
          </article>
        ))}
      </div>
    </div>
  );
}`,
      },
      result: 'Dragging the width slider switches between 1, 2 and 4 columns at 640px and 1024px, mirroring grid-cols-1 sm:grid-cols-2 lg:grid-cols-4.',
      explanation:
        'Tailwind breakpoints are mobile-first min-width media queries: unprefixed classes apply everywhere, sm: from 640px, md: 768px, lg: 1024px. Because Tailwind outputs static CSS, this page stays a Server Component.',
    },
    {
      title: 'Theme tokens with CSS variables + Tailwind @theme',
      scenario: 'The brand colour must be defined once and used in Tailwind classes and CSS Modules.',
      steps: [
        'Define the colour in @theme in app/globals.css',
        'Use bg-brand / text-brand classes in JSX',
        'Use var(--color-brand) in a CSS Module',
        'Change the value once and see it update everywhere',
      ],
      code: `/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-brand: #7c3aed;
  --color-brand-dark: #5b21b6;
}

// app/page.js
export default function Home() {
  return (
    <section className="p-10">
      <h1 className="text-4xl font-bold text-brand">ShopKit</h1>
      <button className="mt-4 rounded bg-brand px-4 py-2 text-white hover:bg-brand-dark">Get started</button>
    </section>
  );
}

/* app/_components/Badge.module.css */
.badge {
  border: 1px solid var(--color-brand);
  color: var(--color-brand);
  border-radius: 999px;
  padding: 2px 10px;
}`,
      result: 'The heading, button and badge all use purple. Changing --color-brand once re-themes all of them.',
      explanation:
        'In Tailwind v4, every @theme variable becomes both a CSS custom property and a set of utility classes (bg-brand, text-brand, border-brand). CSS Modules can read the same variable.',
    },
    {
      title: 'Conditional classes with clsx and a CSS Module',
      scenario: 'A Button component has variants (primary/secondary) and a disabled state.',
      steps: [
        'npm install clsx',
        'Create Button.module.css with .btn, .primary, .secondary, .disabled',
        'Use clsx to combine them based on props',
        'Render <Button variant="secondary" disabled>Save</Button>',
      ],
      code: `/* app/_components/Button.module.css */
.btn { padding: 8px 16px; border-radius: 6px; border: 0; cursor: pointer; }
.primary { background: #0070f3; color: #fff; }
.secondary { background: #eaeaea; color: #111; }
.disabled { opacity: 0.5; cursor: not-allowed; }

// app/_components/Button.js
import clsx from 'clsx';
import styles from './Button.module.css';

export default function Button({ variant = 'primary', disabled, children, ...rest }) {
  return (
    <button
      className={clsx(styles.btn, styles[variant], disabled && styles.disabled)}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}`,
      result: 'Button variant="secondary" disabled renders class="Button_btn__.. Button_secondary__.. Button_disabled__.." with grey background and 50% opacity.',
      explanation: 'clsx skips falsy values, so disabled && styles.disabled adds the class only when needed. styles[variant] picks the matching module class by name.',
    },
  ],
  interview: [
    { q: 'Where should global CSS be imported in the App Router?', a: 'Usually once in the root layout (app/layout.js) via import "./globals.css". It can technically be imported from any layout/page/component, but keeping it in the root layout avoids ordering surprises because global styles apply app-wide once loaded.', level: 'Easy' },
    { q: 'What is a CSS Module and how does it prevent conflicts?', a: 'A .module.css file whose class names are transformed at build time into unique names (e.g. Card_title__x7Ab2). Importing it returns an object mapping original names to generated ones, so styles are scoped to the component that uses them.', level: 'Easy' },
    { q: 'Why is a top-level "h1 { }" rule rejected in a CSS Module?', a: 'CSS Modules must be "pure": every selector must contain at least one local class or id so it can be scoped. A bare element selector would be global, so Next.js rejects it. Put element styles in global CSS or scope them like .wrapper h1.', level: 'Medium' },
    { q: 'How is Tailwind v4 set up differently from v3?', a: 'v4 uses the @tailwindcss/postcss plugin and a single @import "tailwindcss" in CSS; configuration lives in CSS via @theme instead of tailwind.config.js, and content detection is automatic. v3 used @tailwind base/components/utilities directives and a JS config with a content array.', level: 'Medium' },
    { q: 'Why should you not build Tailwind class names with template strings?', a: 'Tailwind scans source files for complete class names at build time. A string like `bg-${color}-500` never appears literally, so the CSS is not generated. Use a lookup object with full class names.', level: 'Medium' },
    { q: 'What does md:flex mean in Tailwind?', a: 'Apply display:flex at the md breakpoint (min-width 768px) and above. Tailwind is mobile-first: unprefixed utilities apply at all sizes and prefixes add min-width media queries.', level: 'Easy' },
    { q: 'Can you use styled-components in Server Components?', a: 'No. Runtime CSS-in-JS libraries rely on React context and hooks to inject styles, which only work in Client Components. You need "use client" and a style registry for SSR. Zero-runtime options (CSS Modules, Tailwind, vanilla-extract) work in Server Components.', level: 'Hard' },
    { q: 'How do you use Sass in Next.js?', a: 'Install the sass package. Then .scss/.sass files and .module.scss files can be imported directly; options can be configured with sassOptions in next.config.', level: 'Easy' },
    { q: 'What is clsx used for?', a: 'A tiny utility to build className strings conditionally: it accepts strings, objects and arrays and skips falsy values. Often combined with tailwind-merge to resolve conflicting Tailwind classes.', level: 'Easy' },
    { q: 'When would you still use inline styles?', a: 'For truly dynamic values computed at runtime, such as a progress bar width, a user-picked colour, or coordinates of a draggable item. Static styling belongs in CSS Modules or Tailwind.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a Navbar with a CSS Module: flex layout, space-between, a logo on the left and links on the right, with a hover underline on links.',
      hint: 'Use .nav, .logo, .links, .link classes.',
      solution: `/* app/_components/Navbar.module.css */
.nav { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; border-bottom: 1px solid #eee; }
.logo { font-weight: 700; font-size: 20px; }
.links { display: flex; gap: 16px; }
.link { color: inherit; text-decoration: none; }
.link:hover { text-decoration: underline; }

// app/_components/Navbar.js
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <span className={styles.logo}>ShopKit</span>
      <div className={styles.links}>
        <Link className={styles.link} href="/">Home</Link>
        <Link className={styles.link} href="/products">Products</Link>
      </div>
    </nav>
  );
}`,
    },
    {
      task: 'Build a pricing section with Tailwind: three cards stacked on mobile and side by side from md, the middle card highlighted with a border-2 border-blue-600 and a "Popular" badge.',
      hint: 'grid md:grid-cols-3; conditional class for the highlighted plan.',
      solution: `const plans = [
  { name: 'Basic', price: 0 },
  { name: 'Pro', price: 499, popular: true },
  { name: 'Team', price: 1999 },
];

export default function Pricing() {
  return (
    <section className="mx-auto grid max-w-5xl gap-6 p-6 md:grid-cols-3">
      {plans.map((p) => (
        <div key={p.name}
          className={'relative rounded-2xl p-6 shadow ' + (p.popular ? 'border-2 border-blue-600' : 'border border-gray-200')}>
          {p.popular && (
            <span className="absolute -top-3 right-4 rounded-full bg-blue-600 px-3 py-1 text-xs text-white">Popular</span>
          )}
          <h3 className="text-xl font-semibold">{p.name}</h3>
          <p className="mt-2 text-3xl font-bold">Rs {p.price}<span className="text-sm font-normal">/mo</span></p>
          <button className="mt-6 w-full rounded-lg bg-gray-900 py-2 text-white hover:bg-gray-700">Choose</button>
        </div>
      ))}
    </section>
  );
}`,
    },
    {
      task: 'A status badge receives status = "success" | "warning" | "error". Write it with Tailwind WITHOUT dynamic class string building.',
      hint: 'Lookup object.',
      solution: `const COLORS = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};

export default function StatusBadge({ status }) {
  return (
    <span className={'rounded px-2 py-1 text-sm font-medium ' + COLORS[status]}>
      {status}
    </span>
  );
}`,
    },
    {
      task: 'Add dark-mode support to globals.css using CSS variables so body background and text switch automatically with the OS setting.',
      hint: 'prefers-color-scheme media query.',
      solution: `/* app/globals.css */
:root {
  --background: #ffffff;
  --foreground: #171717;
}
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
body {
  background: var(--background);
  color: var(--foreground);
}`,
    },
  ],
  quiz: [
    { question: 'Which file name makes a CSS Module?', options: ['Card.css', 'Card.module.css', 'Card.scoped.css', 'card-module.css'], answer: 1, explanation: 'The .module.css suffix enables scoping.' },
    { question: 'In Tailwind, which class applies only from 1024px and wider?', options: ['lg:flex', 'flex-lg', 'max-lg:flex', 'flex:lg'], answer: 0, explanation: 'lg: is a min-width 1024px variant.' },
    { question: 'Which styling approach requires "use client" in the App Router?', options: ['CSS Modules', 'Tailwind CSS', 'Global CSS', 'Runtime CSS-in-JS like styled-components'], answer: 3, explanation: 'Runtime CSS-in-JS uses hooks/context.' },
    { question: 'How does Tailwind v4 get included in globals.css?', options: ['@tailwind all;', '<link> tag in layout', '@import "tailwindcss";', 'import tailwind from "tailwind"'], answer: 2, explanation: 'v4 uses a single CSS import.' },
    { question: 'What is wrong with className={`text-${color}-600`} in Tailwind?', options: ['Nothing', 'The class is not found at build time, so no CSS is generated', 'Template literals are not allowed in JSX', 'It only works in Client Components'], answer: 1, explanation: 'Tailwind needs complete class names in source.' },
  ],
};
