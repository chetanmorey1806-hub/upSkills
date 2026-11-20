// A tiny hand-written subset of Tailwind CSS utilities so that the playgrounds can use REAL Tailwind class names
// without loading Tailwind itself. Breakpoints: sm 640px, md 768px, lg 1024px (same as Tailwind).
const TW = `*, ::before, ::after { box-sizing: border-box; }
body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; }
.flex { display: flex; } .grid { display: grid; } .hidden { display: none; } .block { display: block; } .inline-flex { display: inline-flex; }
.flex-col { flex-direction: column; } .flex-wrap { flex-wrap: wrap; } .flex-1 { flex: 1 1 0%; }
.items-center { align-items: center; } .items-start { align-items: flex-start; } .justify-between { justify-content: space-between; } .justify-center { justify-content: center; }
.gap-1 { gap: .25rem; } .gap-2 { gap: .5rem; } .gap-3 { gap: .75rem; } .gap-4 { gap: 1rem; } .gap-6 { gap: 1.5rem; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); } .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.p-2 { padding: .5rem; } .p-3 { padding: .75rem; } .p-4 { padding: 1rem; } .p-6 { padding: 1.5rem; }
.px-2 { padding-left: .5rem; padding-right: .5rem; } .px-3 { padding-left: .75rem; padding-right: .75rem; } .px-4 { padding-left: 1rem; padding-right: 1rem; } .px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
.py-0\\.5 { padding-top: .125rem; padding-bottom: .125rem; } .py-1 { padding-top: .25rem; padding-bottom: .25rem; } .py-2 { padding-top: .5rem; padding-bottom: .5rem; } .py-3 { padding-top: .75rem; padding-bottom: .75rem; }
.mt-1 { margin-top: .25rem; } .mt-2 { margin-top: .5rem; } .mt-4 { margin-top: 1rem; } .mb-2 { margin-bottom: .5rem; } .mb-4 { margin-bottom: 1rem; } .mx-auto { margin-left: auto; margin-right: auto; } .m-0 { margin: 0; }
.w-full { width: 100%; } .h-40 { height: 10rem; } .h-10 { height: 2.5rem; } .w-10 { width: 2.5rem; } .max-w-sm { max-width: 24rem; } .max-w-3xl { max-width: 48rem; } .min-h-screen { min-height: 100vh; }
.object-cover { object-fit: cover; } .overflow-hidden { overflow: hidden; }
.rounded { border-radius: .25rem; } .rounded-md { border-radius: .375rem; } .rounded-lg { border-radius: .5rem; } .rounded-xl { border-radius: .75rem; } .rounded-full { border-radius: 9999px; }
.border { border: 1px solid #e2e8f0; } .border-b { border-bottom: 1px solid #e2e8f0; } .border-slate-200 { border-color: #e2e8f0; } .border-transparent { border-color: transparent; }
.shadow-sm { box-shadow: 0 1px 3px rgb(0 0 0 / .1), 0 1px 2px rgb(0 0 0 / .06); } .shadow-md { box-shadow: 0 4px 6px rgb(0 0 0 / .1), 0 2px 4px rgb(0 0 0 / .06); } .shadow-lg { box-shadow: 0 10px 15px rgb(0 0 0 / .1), 0 4px 6px rgb(0 0 0 / .05); }
.text-xs { font-size: .75rem; line-height: 1rem; } .text-sm { font-size: .875rem; line-height: 1.25rem; } .text-lg { font-size: 1.125rem; line-height: 1.75rem; } .text-xl { font-size: 1.25rem; line-height: 1.75rem; } .text-2xl { font-size: 1.5rem; line-height: 2rem; }
.font-medium { font-weight: 500; } .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; } .line-through { text-decoration: line-through; } .text-center { text-align: center; }
.text-white { color: #fff; } .text-slate-500 { color: #64748b; } .text-slate-600 { color: #475569; } .text-slate-700 { color: #334155; } .text-slate-900 { color: #0f172a; }
.text-green-700 { color: #15803d; } .text-amber-700 { color: #b45309; } .text-red-700 { color: #b91c1c; } .text-indigo-700 { color: #4338ca; } .text-indigo-600 { color: #4f46e5; }
.bg-white { background-color: #fff; } .bg-slate-50 { background-color: #f8fafc; } .bg-slate-100 { background-color: #f1f5f9; } .bg-slate-900 { background-color: #0f172a; }
.bg-indigo-600 { background-color: #4f46e5; } .bg-indigo-50 { background-color: #eef2ff; } .bg-red-600 { background-color: #dc2626; } .bg-transparent { background-color: transparent; }
.bg-green-100 { background-color: #dcfce7; } .bg-amber-100 { background-color: #fef3c7; } .bg-red-100 { background-color: #fee2e2; } .bg-indigo-100 { background-color: #e0e7ff; }
.cursor-pointer { cursor: pointer; } .transition { transition: all .15s ease; } .opacity-50 { opacity: .5; } .cursor-not-allowed { cursor: not-allowed; }
.hover\\:shadow-lg:hover { box-shadow: 0 10px 15px rgb(0 0 0 / .1), 0 4px 6px rgb(0 0 0 / .05); } .hover\\:bg-indigo-700:hover { background-color: #4338ca; } .hover\\:bg-red-700:hover { background-color: #b91c1c; } .hover\\:bg-slate-100:hover { background-color: #f1f5f9; }
.focus-visible\\:outline-2:focus-visible { outline: 2px solid #6366f1; outline-offset: 2px; }
.disabled\\:opacity-50:disabled { opacity: .5; } .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
@media (min-width: 640px) { .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } .sm\\:flex-row { flex-direction: row; } .sm\\:text-2xl { font-size: 1.5rem; line-height: 2rem; } }
@media (min-width: 768px) { .md\\:flex { display: flex; } .md\\:hidden { display: none; } .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.dark .dark\\:bg-slate-900 { background-color: #0f172a; } .dark .dark\\:bg-slate-800 { background-color: #1e293b; } .dark .dark\\:text-white { color: #fff; }
.dark .dark\\:text-slate-300 { color: #cbd5e1; } .dark .dark\\:border-slate-700 { border-color: #334155; } .dark .dark\\:bg-indigo-500 { background-color: #6366f1; } .dark .dark\\:hover\\:bg-slate-700:hover { background-color: #334155; }`;

export default {
  id: 'day-32-tailwind-css-with-react',
  title: 'Tailwind CSS with React: Utility-First Classes, Responsive Design, Dark Mode and Reusable UI Components',
  module: 'Module 7: Industry Project Setup & UI',
  day: 32,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Tailwind CSS is the most used styling approach in new React projects. You will install Tailwind CSS 4 in a Vite app, style with utility classes, build mobile-first responsive layouts, add a dark mode toggle, and wrap repeated class lists into reusable Button, Card and Badge components with variants.',
  objectives: [
    'Explain the utility-first idea and how it differs from writing custom CSS classes',
    'Install and configure Tailwind CSS 4 with the @tailwindcss/vite plugin and customise the theme with @theme',
    'Build responsive, mobile-first layouts with sm:, md: and lg: prefixes and state variants like hover: and focus-visible:',
    'Implement class-based dark mode with a toggle that remembers the user\'s choice',
    'Create reusable Button, Card and Badge components with variants and a cn() helper',
  ],
  theory: [
    {
      heading: 'What is utility-first CSS?',
      content:
        'In traditional CSS you invent a class name (`.product-card`) and write its styles in a separate file. In **Tailwind** you style directly in JSX with small, single-purpose **utility classes**: `p-4` (padding 1rem), `rounded-xl`, `shadow-md`, `text-sm`, `font-semibold`, `bg-indigo-600`, `flex`, `gap-4`.\n\nAnalogy: instead of ordering a ready-made thali (a custom class), you pick each item from a buffet (utilities). You see exactly what is on the plate.\n\n**Why companies like it**\n- No naming headaches and no dead CSS: unused utilities are never generated\n- A built-in **design system**: spacing scale (1 = 0.25rem), colour palette, font sizes, shadows, so every developer uses the same values\n- Changes are local: editing classes on one component cannot break another page\n- The final CSS file is small because Tailwind scans your files and generates only the classes you use\n\n**Common complaint**: long class lists. The answer is **components**: you write the long list once inside `<Button>` and reuse the component, not the classes.',
      syntax:
        '// Plain CSS way\n<div className="product-card">...</div>   /* + .product-card { padding: 16px; border-radius: 12px; ... } */\n\n// Tailwind way\n<div className="p-4 rounded-xl shadow-md bg-white hover:shadow-lg transition">...</div>',
      tip: 'Tailwind finds classes by scanning your source as plain text. Never build class names with string pieces like "bg-" + color + "-600": the full class never appears in the source, so it is not generated. Map values to complete class strings instead.',
    },
    {
      heading: 'Installing Tailwind CSS 4 in a Vite React app',
      content:
        'Tailwind CSS 4 (2025) is much simpler than v3: **no tailwind.config.js and no PostCSS setup needed** for Vite.\n\n1. `npm install tailwindcss @tailwindcss/vite`\n2. Add the plugin in `vite.config.js`\n3. Put `@import "tailwindcss";` at the top of `src/index.css` (imported in main.jsx)\n4. Use classes in JSX\n\nCustomise the design system in CSS with the **@theme** block. Every variable becomes utilities: `--color-brand-600` gives `bg-brand-600`, `text-brand-600`, `border-brand-600`; `--font-display` gives `font-display`.\n\nVS Code: install the **Tailwind CSS IntelliSense** extension for autocomplete, and `prettier-plugin-tailwindcss` to sort classes automatically.',
      syntax:
        "// vite.config.js\nimport { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nimport tailwindcss from '@tailwindcss/vite';\n\nexport default defineConfig({ plugins: [react(), tailwindcss()] });\n\n/* src/index.css */\n@import \"tailwindcss\";\n\n@theme {\n  --color-brand-50: #eef2ff;\n  --color-brand-600: #4f46e5;\n  --color-brand-700: #4338ca;\n  --font-display: \"Poppins\", sans-serif;\n}",
      tip: 'Upgrading from v3? Run `npx @tailwindcss/upgrade`. Some names changed in v4: the old `shadow-sm` is now `shadow-xs`, `shadow` is `shadow-sm`, `bg-opacity-50` is replaced by `bg-black/50`, and the default ring is 1px.',
    },
    {
      heading: 'Responsive design: mobile-first breakpoints',
      content:
        'Tailwind is **mobile-first**. A class without a prefix applies to **all screen sizes**; a prefixed class applies **from that width upwards**:\n\n- `sm:` ≥ 640px, `md:` ≥ 768px, `lg:` ≥ 1024px, `xl:` ≥ 1280px, `2xl:` ≥ 1536px\n\nSo `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` means: 1 column on phones, 2 on large phones/tablets, 4 on laptops. `hidden md:flex` means "hidden on mobile, flex from tablet up" (desktop navigation), and `md:hidden` is the opposite (hamburger button).\n\nThis matters in India where **more than 70% of e-commerce traffic is mobile**: design the phone layout first, then add larger-screen prefixes.',
      syntax:
        '<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">\n  {products.map(p => <ProductCard key={p.id} product={p} />)}\n</div>\n\n<nav className="hidden md:flex gap-6">...desktop links...</nav>\n<button className="md:hidden">Menu</button>',
      tip: 'Common mistake: writing `sm:` thinking it means "small screens only". It means "640px and wider". For phone-only styles use the unprefixed class and override at a larger breakpoint.',
    },
    {
      heading: 'States and variants: hover, focus, disabled and more',
      content:
        'Prefixes also handle states. They can be stacked: `md:hover:bg-indigo-700`.\n\n- `hover:`, `active:`, `focus:`, **`focus-visible:`** (keyboard focus only: best for accessible outlines)\n- `disabled:` on buttons and inputs: `disabled:opacity-50 disabled:cursor-not-allowed`\n- `group` / `group-hover:`: style a child when the parent card is hovered\n- `peer` / `peer-invalid:`: style an error text when its sibling input is invalid\n- `first:`, `last:`, `odd:` for lists and tables\n- Arbitrary values when the design needs an exact number: `w-[72px]`, `bg-[#ff9933]`, `grid-cols-[200px_1fr]`',
      syntax:
        '<button className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700\n                   focus-visible:outline-2 disabled:opacity-50 disabled:cursor-not-allowed">\n  Pay Rs 499\n</button>\n\n<div className="group rounded-xl border p-4">\n  <h3 className="group-hover:text-indigo-600">Boat Airdopes</h3>\n</div>',
    },
    {
      heading: 'Dark mode',
      content:
        'Use the `dark:` variant: `bg-white dark:bg-slate-900 text-slate-900 dark:text-white`.\n\nBy default in Tailwind 4, `dark:` follows the **operating system setting** (`prefers-color-scheme`). Most apps want a **toggle button**, so switch to **class-based** dark mode with one line in CSS, then add or remove the `dark` class on `<html>`:\n\n1. In index.css: `@custom-variant dark (&:where(.dark, .dark *));`\n2. On load: read the saved choice from localStorage, otherwise use `matchMedia(\'(prefers-color-scheme: dark)\')`\n3. Toggle: `document.documentElement.classList.toggle(\'dark\', isDark)` and save the choice\n\nTo avoid a white "flash" before React loads, put the small reading script directly in `index.html` `<head>`.',
      syntax:
        "/* index.css */\n@import \"tailwindcss\";\n@custom-variant dark (&:where(.dark, .dark *));\n\n// useTheme.js\nexport function useTheme() {\n  const [dark, setDark] = useState(() =>\n    localStorage.theme ? localStorage.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches\n  );\n  useEffect(() => {\n    document.documentElement.classList.toggle('dark', dark);\n    localStorage.theme = dark ? 'dark' : 'light';\n  }, [dark]);\n  return [dark, setDark];\n}",
    },
    {
      heading: 'Reusable UI components: variants, cn() and best practices',
      content:
        'In real projects you never repeat 15 classes on every button. You build a small **UI kit** in `src/components/ui/`: `Button`, `Card`, `Badge`, `Input`. Each component:\n\n- Has **variants** (`primary`, `secondary`, `danger`, `ghost`) and **sizes** (`sm`, `md`, `lg`) mapped to complete class strings\n- Accepts a `className` prop so the caller can add spacing (`className="mt-4"`)\n- Passes the rest of the props (`...props`) to the native element so `onClick`, `type`, `disabled`, `aria-*` work\n\nThe **cn()** helper joins conditional classes (`clsx`) and resolves conflicts (`tailwind-merge`: if the base has `px-4` and the caller passes `px-2`, only `px-2` stays). Many teams also use **cva** (class-variance-authority) to declare variants; shadcn/ui (Day 33) is built exactly this way.\n\n**Best practices**: keep a consistent order of classes (the Prettier plugin does it), avoid `@apply` everywhere (it brings back the problems of custom CSS), use `focus-visible` styles for accessibility, and extract a component as soon as a class list is copied a third time.',
      syntax:
        "// src/lib/cn.js\nimport { clsx } from 'clsx';\nimport { twMerge } from 'tailwind-merge';\nexport const cn = (...inputs) => twMerge(clsx(inputs));\n\n// usage\n<button className={cn('px-4 py-2 rounded-md', isActive && 'bg-indigo-600 text-white', className)} />",
      tip: 'Coming next (Day 33): ready-made component libraries (MUI, shadcn/ui, Ant Design) and when to use them instead of building every component yourself.',
    },
  ],
  examples: [
    {
      title: 'A product card styled only with utility classes',
      scenario: 'Build the product card of an Indian electronics store: image, title, rating, price in ₹ with MRP struck out, a discount badge and an "Add to cart" button with hover and focus styles.',
      steps: [
        'Install Tailwind 4: npm install tailwindcss @tailwindcss/vite and add the plugin to vite.config.js',
        'Add @import "tailwindcss"; to src/index.css',
        'Create ProductCard.jsx and style it with utilities (no CSS file)',
        'Use Intl.NumberFormat("en-IN") to show prices like ₹1,499',
        'Run the playground (its CSS tab holds a small hand-written subset of Tailwind utilities)',
      ],
      code: `// src/features/products/components/ProductCard.jsx
const formatINR = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export function ProductCard({ product, onAdd }) {
  const off = Math.round((1 - product.price / product.mrp) * 100);
  return (
    <article className="max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
      <img src={product.image} alt={product.title} className="h-40 w-full object-cover" />
      <div className="p-4">
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">{off}% off</span>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">{product.title}</h3>
        <p className="text-sm text-slate-500">Rating {product.rating} / 5</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xl font-bold">{formatINR(product.price)}</span>
          <span className="text-sm text-slate-500 line-through">{formatINR(product.mrp)}</span>
        </div>
        <button onClick={() => onAdd(product)}
          className="mt-4 w-full rounded-md bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 focus-visible:outline-2">
          Add to cart
        </button>
      </div>
    </article>
  );
}`,
      playground: {
        jsx: `const formatINR = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const product = { id: 1, title: 'boAt Rockerz 450 Headphones', rating: 4.2, price: 1499, mrp: 3990, image: 'https://picsum.photos/seed/headphones/400/240' };

function ProductCard({ product, onAdd }) {
  const off = Math.round((1 - product.price / product.mrp) * 100);
  return (
    <article className="max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
      <img src={product.image} alt={product.title} className="h-40 w-full object-cover" />
      <div className="p-4">
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">{off}% off</span>
        <h3 className="mt-2 text-lg font-semibold text-slate-900 m-0">{product.title}</h3>
        <p className="text-sm text-slate-500 m-0 mt-1">Rating {product.rating} / 5</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xl font-bold">{formatINR(product.price)}</span>
          <span className="text-sm text-slate-500 line-through">{formatINR(product.mrp)}</span>
        </div>
        <button onClick={() => onAdd(product)}
          className="mt-4 w-full rounded-md bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 cursor-pointer border-transparent">
          Add to cart
        </button>
      </div>
    </article>
  );
}

function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <p className="text-sm text-slate-600 mb-2">Cart items: <b>{count}</b></p>
      <ProductCard product={product} onAdd={() => setCount(c => c + 1)} />
    </div>
  );
}`,
        css: TW,
      },
      result: 'A rounded card with a photo, "62% off" badge, title, rating, ₹1,499 with ₹3,990 struck out, and an indigo button. The card shadow grows on hover; clicking the button increases the cart count.',
      explanation:
        'Each class does one thing: p-4 is padding 1rem, rounded-xl is 0.75rem radius, hover:shadow-lg only applies on hover. The playground cannot load Tailwind, so its CSS tab contains hand-written copies of exactly these utilities; in a Vite project Tailwind generates them for you from the class names it finds.',
    },
    {
      title: 'Mobile-first responsive product grid and navbar',
      scenario: 'A category page must show 1 product per row on phones, 2 on large phones, 3 on tablets and 4 on laptops. The navbar shows links on tablets and up, and a Menu button on phones.',
      steps: [
        'Write the phone layout first: grid grid-cols-1',
        'Add bigger breakpoints: sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        'Navbar links: hidden md:flex; menu button: md:hidden',
        'Run the playground and drag the preview width (or zoom the browser) to see the layout change; the current width is shown',
      ],
      code: `export function CategoryPage({ products }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="flex items-center justify-between border-b bg-white px-4 py-3">
        <span className="text-xl font-bold text-indigo-600">ShopKart</span>
        <nav className="hidden gap-6 md:flex">
          <a href="/mobiles">Mobiles</a><a href="/laptops">Laptops</a><a href="/audio">Audio</a>
        </nav>
        <button className="md:hidden" aria-expanded={open} onClick={() => setOpen(o => !o)}>Menu</button>
      </header>
      {open && <nav className="flex flex-col gap-2 p-4 md:hidden">...</nav>}

      <main className="mx-auto max-w-3xl p-4">
        <h1 className="text-xl font-bold sm:text-2xl">Audio</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </main>
    </>
  );
}`,
      playground: {
        jsx: `const ITEMS = ['Earbuds', 'Speaker', 'Soundbar', 'Headphones', 'Neckband', 'Smartwatch', 'Power bank', 'Charger'];

function useWindowWidth() {
  const [w, setW] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w;
}

function App() {
  const [open, setOpen] = React.useState(false);
  const w = useWindowWidth();
  const bp = w >= 1024 ? 'lg (4 cols)' : w >= 768 ? 'md (3 cols)' : w >= 640 ? 'sm (2 cols)' : 'base (1 col)';
  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="flex items-center justify-between border-b bg-white px-4 py-3">
        <span className="text-xl font-bold text-indigo-600">ShopKart</span>
        <nav className="hidden gap-6 md:flex text-sm">
          <a href="#mobiles">Mobiles</a><a href="#laptops">Laptops</a><a href="#audio">Audio</a>
        </nav>
        <button className="md:hidden rounded-md border px-3 py-1 bg-white cursor-pointer" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          {open ? 'Close' : 'Menu'}
        </button>
      </header>
      {open && (
        <nav className="flex flex-col gap-2 p-4 md:hidden bg-white border-b text-sm">
          <a href="#mobiles">Mobiles</a><a href="#laptops">Laptops</a><a href="#audio">Audio</a>
        </nav>
      )}
      <main className="mx-auto max-w-3xl p-4">
        <h1 className="text-xl font-bold sm:text-2xl m-0 mb-2">Audio</h1>
        <p className="text-sm text-slate-500 m-0 mb-4">Width: {w}px, active breakpoint: <b>{bp}</b></p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {ITEMS.map((name, i) => (
            <div key={name} className="rounded-lg border bg-white p-3 shadow-sm">
              <div className="h-10 rounded-md bg-indigo-100" />
              <p className="font-medium m-0 mt-2">{name}</p>
              <p className="text-sm text-slate-600 m-0">{'₹' + (999 + i * 500).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}`,
        css: TW,
      },
      result: 'On a narrow preview you see one card per row and a Menu button that opens a vertical menu. Making the preview wider switches to 2, 3 and 4 columns, the Menu button disappears and inline links appear. The current width and breakpoint are printed.',
      explanation:
        'Unprefixed classes are the phone layout; each sm:/md:/lg: class is a min-width media query that overrides it from that width up. The hook only displays the width for learning; the layout itself is pure CSS, no JavaScript needed.',
    },
    {
      title: 'Dark mode toggle that remembers the choice',
      scenario: 'Add a sun/moon toggle to the admin panel. The first visit follows the OS setting, later visits use the saved choice.',
      steps: [
        'Add @custom-variant dark (&:where(.dark, .dark *)); to index.css',
        'Write a useTheme hook: initial value from localStorage or matchMedia',
        'In an effect, toggle the dark class on document.documentElement and save to localStorage',
        'Add dark: classes (dark:bg-slate-900, dark:text-white ...) to your components',
        'Run the playground and toggle (the playground puts the dark class on a wrapper div instead of <html>)',
      ],
      code: `/* src/index.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

// src/hooks/useTheme.js
import { useEffect, useState } from 'react';

function getInitialTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useTheme() {
  const [dark, setDark] = useState(getInitialTheme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return { dark, toggle: () => setDark(d => !d) };
}

// ThemeToggle.jsx
export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-full border p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-700">
      {dark ? 'Sun' : 'Moon'}
    </button>
  );
}`,
      playground: {
        jsx: `function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
  } catch (e) { /* storage blocked in some sandboxes */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function useTheme() {
  const [dark, setDark] = React.useState(getInitialTheme);
  React.useEffect(() => {
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
    console.log('theme saved:', dark ? 'dark' : 'light');
  }, [dark]);
  return { dark, toggle: () => setDark(d => !d) };
}

const STATS = [['Orders today', '1,284'], ['Revenue', '₹4,52,300'], ['New users', '312'], ['Refunds', '9']];

function App() {
  const { dark, toggle } = useTheme();
  // In a real app: document.documentElement.classList.toggle('dark', dark)
  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 transition">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0">Admin dashboard</h2>
          <button onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-full border px-3 py-1 bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 cursor-pointer">
            {dark ? 'Sun: light' : 'Moon: dark'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {STATS.map(([label, value]) => (
            <div key={label} className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-300 m-0">{label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white m-0 mt-1">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,
        css: TW,
      },
      result: 'A small dashboard with four KPI cards. The toggle switches the whole panel between light and dark colours, logs "theme saved: dark/light", and reloading the preview keeps the last choice (when the sandbox allows localStorage).',
      explanation:
        'dark:bg-slate-900 only applies when an ancestor has the class "dark" (that is what @custom-variant dark (&:where(.dark, .dark *)) sets up). The hook decides that class once and React re-renders. Lazy initial state (useState(getInitialTheme)) reads localStorage only on the first render.',
    },
    {
      title: 'Reusable Button, Card and Badge components with variants',
      scenario: 'Your team repeats the same 12 button classes everywhere. Build a small UI kit: Button (primary, secondary, danger, ghost; sm/md/lg; loading), Badge (success, warning, danger, info) and Card, plus a cn() helper.',
      steps: [
        'npm install clsx tailwind-merge (and optionally class-variance-authority)',
        'Create src/lib/cn.js',
        'Create Button.jsx with variant and size maps of complete class strings',
        'Forward className and ...props; add disabled and loading support with aria-busy',
        'Create Badge.jsx and Card.jsx the same way',
        'Run the playground (it uses a tiny cn() without tailwind-merge)',
      ],
      code: `// src/lib/cn.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs) => twMerge(clsx(inputs));

// src/components/ui/Button.jsx
import { cn } from '@/lib/cn';

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
};
const sizes = { sm: 'px-3 py-1 text-sm', md: 'px-4 py-2', lg: 'px-5 py-3 text-lg' };

export function Button({ variant = 'primary', size = 'md', loading = false, className, children, ...props }) {
  return (
    <button
      className={cn('inline-flex items-center gap-2 rounded-md font-medium transition focus-visible:outline-2',
        'disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      aria-busy={loading}
      {...props}
    >
      {loading && <span className="animate-spin">...</span>}
      {children}
    </button>
  );
}

// src/components/ui/Badge.jsx
const tones = {
  success: 'bg-green-100 text-green-700', warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700', info: 'bg-indigo-100 text-indigo-700',
};
export const Badge = ({ tone = 'info', className, ...props }) =>
  <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', tones[tone], className)} {...props} />;

// src/components/ui/Card.jsx
export const Card = ({ title, className, children }) => (
  <section className={cn('rounded-xl border bg-white p-4 shadow-sm', className)}>
    {title && <h3 className="mb-2 font-semibold">{title}</h3>}
    {children}
  </section>
);`,
      playground: {
        jsx: `// Simplified cn(): joins truthy classes (real projects use clsx + tailwind-merge)
const cn = (...inputs) => inputs.flat().filter(Boolean).join(' ');

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 border-transparent',
  secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border-transparent',
};
const sizes = { sm: 'px-3 py-1 text-sm', md: 'px-4 py-2', lg: 'px-5 py-3 text-lg' };

function Button({ variant = 'primary', size = 'md', loading = false, className, children, ...props }) {
  return (
    <button
      className={cn('inline-flex items-center gap-2 rounded-md font-medium transition cursor-pointer focus-visible:outline-2',
        'disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? 'Saving...' : children}
    </button>
  );
}

const tones = { success: 'bg-green-100 text-green-700', warning: 'bg-amber-100 text-amber-700', danger: 'bg-red-100 text-red-700', info: 'bg-indigo-100 text-indigo-700' };
const Badge = ({ tone = 'info', className, ...props }) =>
  <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', tones[tone], className)} {...props} />;

const Card = ({ title, className, children }) => (
  <section className={cn('rounded-xl border bg-white p-4 shadow-sm', className)}>
    {title && <h3 className="mb-2 font-semibold m-0">{title}</h3>}
    {children}
  </section>
);

const ORDERS = [
  { id: 'OD1021', name: 'Priya Sharma', city: 'Pune', status: 'Delivered' },
  { id: 'OD1022', name: 'Arjun Mehta', city: 'Bengaluru', status: 'Shipped' },
  { id: 'OD1023', name: 'Neha Iyer', city: 'Chennai', status: 'Cancelled' },
];
const toneFor = { Delivered: 'success', Shipped: 'info', Cancelled: 'danger' };

function App() {
  const [saving, setSaving] = React.useState(false);
  function save() { setSaving(true); setTimeout(() => setSaving(false), 1500); }
  return (
    <div className="p-4 bg-slate-50 min-h-screen flex flex-col gap-4">
      <Card title="Buttons">
        <div className="flex flex-wrap gap-2 items-center">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger" size="sm">Delete</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="lg" loading={saving} onClick={save}>Save changes</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>
      <Card title="Recent orders">
        {ORDERS.map(o => (
          <div key={o.id} className="flex items-center justify-between py-2 border-b">
            <span className="text-sm"><b>{o.id}</b> {o.name}, {o.city}</span>
            <Badge tone={toneFor[o.status]}>{o.status}</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}`,
        css: TW,
      },
      result: 'A "Buttons" card with primary, secondary, small danger, ghost, a large "Save changes" button that shows "Saving..." and is disabled for 1.5 s when clicked, and a faded disabled button. An orders card shows green Delivered, indigo Shipped and red Cancelled badges.',
      explanation:
        'Variants and sizes are objects of COMPLETE class strings, so Tailwind can detect them when scanning the source. The component merges base classes, variant classes and the caller\'s className, and forwards ...props (onClick, type, aria-*) to the real <button>. In a real project cn() uses tailwind-merge so a caller\'s px-2 correctly replaces the base px-4.',
    },
  ],
  interview: [
    { q: 'What is utility-first CSS?', a: 'A styling approach where you compose designs from small single-purpose classes (p-4, flex, text-sm) directly in markup instead of writing custom class names and CSS rules. Tailwind is the most popular utility-first framework.', level: 'Easy' },
    { q: 'How does Tailwind keep the CSS file small?', a: 'It scans your source files for class names and generates CSS only for the utilities you actually use (formerly called purging/JIT). Unused utilities never reach the bundle.', level: 'Medium' },
    { q: 'Why does className={"bg-" + color + "-500"} not work in Tailwind?', a: 'Tailwind detects classes by plain-text scanning; the complete class bg-red-500 never appears in the source, so no CSS is generated. Use a map of full class names, e.g. { red: "bg-red-500", green: "bg-green-500" }.', level: 'Medium' },
    { q: 'What changed in Tailwind CSS 4 compared with v3?', a: 'CSS-first configuration with @import "tailwindcss" and @theme instead of tailwind.config.js, a dedicated Vite plugin (@tailwindcss/vite), automatic content detection, a faster engine, CSS variables for all theme values, @custom-variant for custom variants, and some renamed utilities (shadow-sm -> shadow-xs, opacity utilities replaced by the /50 modifier).', level: 'Hard' },
    { q: 'Explain mobile-first breakpoints in Tailwind.', a: 'Unprefixed utilities apply to all widths. Prefixes like sm:, md:, lg: are min-width media queries that apply from that breakpoint upward. So you style for phones first and add overrides for larger screens.', level: 'Easy' },
    { q: 'How do you implement a dark mode toggle with Tailwind?', a: 'Make the dark variant class-based with @custom-variant dark (&:where(.dark, .dark *)) (v3: darkMode: "class"), toggle the dark class on <html> from React, store the choice in localStorage, default to prefers-color-scheme, and use dark: utilities in components. Add an inline script in index.html to avoid a flash of the wrong theme.', level: 'Medium' },
    { q: 'How do you avoid repeating long class lists?', a: 'Extract React components (Button, Card) with variant maps; use a cn() helper (clsx + tailwind-merge) and optionally cva for variants. @apply exists but should be used sparingly, mainly for third-party HTML you do not control.', level: 'Medium' },
    { q: 'What is tailwind-merge and why is it needed?', a: 'It resolves conflicting Tailwind classes so the last one wins logically: twMerge("px-4 px-2") returns "px-2". Without it both classes stay and the winner depends on CSS order, not on the order in className, so caller overrides may silently fail.', level: 'Hard' },
    { q: 'What are group and peer in Tailwind?', a: 'group lets children react to a parent\'s state (group-hover:text-indigo-600 on a child when the card with class group is hovered). peer lets an element react to a previous sibling\'s state (peer-invalid:block on an error message after an invalid input).', level: 'Medium' },
    { q: 'Tailwind vs CSS Modules: when would you choose each?', a: 'Tailwind: fast prototyping, consistent design tokens, no naming, great with component-based UIs and design systems like shadcn/ui. CSS Modules: teams that prefer classic CSS, complex animations or heavy custom designs, or when markup readability matters more. Both are scoped and production-ready.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Build a responsive pricing section with three plans (Basic ₹199, Pro ₹499, Business ₹999). 1 column on phones, 3 on md+. Highlight Pro with a ring and a "Most popular" badge.',
      hint: 'grid grid-cols-1 md:grid-cols-3, and a conditional class for the highlighted plan.',
      solution: `const plans = [
  { name: 'Basic', price: 199, features: ['1 user', '5 GB storage'] },
  { name: 'Pro', price: 499, features: ['5 users', '50 GB storage', 'Priority support'], popular: true },
  { name: 'Business', price: 999, features: ['Unlimited users', '1 TB storage', 'Account manager'] },
];

export function Pricing() {
  return (
    <section className="mx-auto max-w-5xl p-4">
      <h2 className="mb-6 text-center text-2xl font-bold">Choose your plan</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map(p => (
          <div key={p.name}
            className={cn('rounded-xl border bg-white p-6 shadow-sm', p.popular && 'ring-2 ring-indigo-600 shadow-lg')}>
            {p.popular && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">Most popular</span>}
            <h3 className="mt-2 text-lg font-semibold">{p.name}</h3>
            <p className="mt-1 text-3xl font-bold">₹{p.price}<span className="text-sm font-normal text-slate-500">/month</span></p>
            <ul className="mt-4 space-y-1 text-sm text-slate-600">
              {p.features.map(f => <li key={f}>✓ {f}</li>)}
            </ul>
            <button className="mt-6 w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700">Choose {p.name}</button>
          </div>
        ))}
      </div>
    </section>
  );
}`,
    },
    {
      task: 'Add your brand colours (saffron #ff9933 as brand-500, dark #e67300 as brand-600) and a Poppins display font to Tailwind 4, then use them in a heading and a button.',
      hint: 'Use the @theme block in index.css; variables named --color-* and --font-*.',
      solution: `/* index.css */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap');
@import "tailwindcss";

@theme {
  --color-brand-500: #ff9933;
  --color-brand-600: #e67300;
  --font-display: "Poppins", sans-serif;
}

// Hero.jsx
export function Hero() {
  return (
    <section className="p-8 text-center">
      <h1 className="font-display text-4xl font-bold text-brand-600">Diwali Sale is Live</h1>
      <button className="mt-4 rounded-md bg-brand-500 px-5 py-3 font-semibold text-white hover:bg-brand-600">
        Shop now
      </button>
    </section>
  );
}`,
    },
    {
      task: 'Create an Input component with label, error message and Tailwind styles: red border and red text when error is passed, accessible with aria-invalid and aria-describedby.',
      hint: 'Use useId() to connect label, input and error text.',
      solution: `import { useId } from 'react';
import { cn } from '@/lib/cn';

export function Input({ label, error, className, ...props }) {
  const id = useId();
  const errorId = id + '-error';
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn('rounded-md border px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          error ? 'border-red-500 text-red-700' : 'border-slate-300', className)}
        {...props}
      />
      {error && <p id={errorId} className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

// usage
<Input label="Mobile number" placeholder="98XXXXXXXX" error={phone.length !== 10 ? 'Enter 10 digits' : ''} />`,
    },
    {
      task: 'Fix this component so all status colours appear: <span className={"bg-" + color + "-100 text-" + color + "-700"}>{status}</span> where color is green, amber or red.',
      hint: 'Tailwind cannot see dynamically built class names.',
      solution: `const STATUS_CLASSES = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
};

export function StatusPill({ color, status }) {
  return (
    <span className={'rounded-full px-2 py-0.5 text-xs font-semibold ' + (STATUS_CLASSES[color] ?? STATUS_CLASSES.green)}>
      {status}
    </span>
  );
}
// The full class strings now appear in the source, so Tailwind generates them.`,
    },
    {
      task: 'Write the index.html snippet that applies the saved theme BEFORE React loads, so dark-mode users never see a white flash.',
      hint: 'A tiny inline script in <head> that reads localStorage and matchMedia.',
      solution: `<!-- index.html -->
<head>
  <script>
    (function () {
      try {
        var saved = localStorage.getItem('theme');
        var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (dark) document.documentElement.classList.add('dark');
      } catch (e) {}
    })();
  </script>
</head>
<!-- React's useTheme hook then keeps the class in sync when the user toggles. -->`,
    },
  ],
  quiz: [
    {
      question: 'What does the class md:grid-cols-3 mean?',
      options: ['3 columns only on medium screens', '3 columns from 768px width and up', '3 columns below 768px', 'Medium-sized grid gaps'],
      answer: 1,
      explanation: 'Breakpoint prefixes are min-width: from md (768px) upwards.',
    },
    {
      question: 'In Tailwind CSS 4 with Vite, which line goes into your main CSS file?',
      options: ['@tailwind base;', '@import "tailwindcss";', '@use tailwind;', 'import tailwind from "tailwindcss"'],
      answer: 1,
      explanation: 'v4 uses a single @import "tailwindcss"; the three @tailwind directives were v3.',
    },
    {
      question: 'Why might bg-${color}-500 built from a variable not get any styles?',
      options: ['Tailwind does not support colours', 'React removes dynamic classes', 'Tailwind only generates classes that appear completely in the source code', 'Template strings are not allowed in className'],
      answer: 2,
      explanation: 'Tailwind scans files as text; dynamic pieces never form the full class name.',
    },
    {
      question: 'Which helper combination is commonly used to merge conditional Tailwind classes and resolve conflicts?',
      options: ['lodash + moment', 'axios + zod', 'styled-components + emotion', 'clsx + tailwind-merge'],
      answer: 3,
      explanation: 'cn = (...i) => twMerge(clsx(i)) is the standard helper used by shadcn/ui and many teams.',
    },
    {
      question: 'For a dark mode TOGGLE in Tailwind 4, what do you add to CSS?',
      options: ['@custom-variant dark (&:where(.dark, .dark *));', 'darkMode: true', '@media dark {}', 'Nothing, dark mode is always class-based'],
      answer: 0,
      explanation: 'By default dark: follows prefers-color-scheme; the custom variant makes it depend on a .dark class you control.',
    },
  ],
};
