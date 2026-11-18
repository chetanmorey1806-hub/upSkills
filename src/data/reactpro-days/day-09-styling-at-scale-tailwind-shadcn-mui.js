export default {
  id: 'day-09-styling-at-scale-tailwind-shadcn-mui',
  title: 'Styling at Scale: Tailwind CSS 4, shadcn/ui, MUI, CSS Modules, Theming and Dark Mode',
  module: 'Module 4: Production React',
  day: 9,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Real React teams need styling that stays consistent across hundreds of components. Learn Tailwind CSS 4 (CSS-first config, @theme tokens, the Vite plugin), building variant-based components with cn() and cva, how shadcn/ui differs from a component library like MUI, scoped styles with CSS Modules, and a robust theming + dark mode setup with CSS variables that does not flash on load.',
  objectives: [
    'Set up Tailwind CSS 4 in Vite and define design tokens with @theme',
    'Build variant-driven components with clsx/tailwind-merge (cn) and class-variance-authority',
    'Explain how shadcn/ui works (copy-in components on Radix) versus MUI (installed library with sx/theme)',
    'Use CSS Modules for scoped component styles and know when to choose each approach',
    'Implement light/dark/system theme with CSS variables, persistence and no flash',
  ],
  theory: [
    {
      heading: 'Choosing a styling approach',
      content:
        'There is no single "best" option; teams pick based on design needs and speed:\n\n- **Utility-first (Tailwind CSS)**: style with small classes in JSX. Fast, consistent spacing/colour scale, tiny CSS output, no naming. Most popular choice for new React/Next.js projects and startups.\n- **Component library (MUI, Ant Design, Chakra, Mantine)**: ready-made accessible components with a theme. Great for admin panels and enterprise dashboards built quickly; harder to make look unique; bigger bundles.\n- **Copy-in component collection (shadcn/ui)**: components are copied into your repo, built on Radix primitives + Tailwind. You own and edit the code.\n- **CSS Modules / plain CSS / Sass**: classic CSS with locally scoped class names. Zero runtime, great for teams with strong CSS skills.\n- **CSS-in-JS (styled-components, Emotion)**: styles in JS with props. Runtime cost and problems with React Server Components led many teams to move to zero-runtime options (Tailwind, CSS Modules, vanilla-extract, Panda CSS).\n\nIn interviews, justify your choice: team skills, design system, performance, SSR/RSC support, bundle size.',
    },
    {
      heading: 'Tailwind CSS 4: what changed',
      content:
        'Tailwind 4 (Jan 2025) is a rewrite with a new engine (Oxide) that is much faster, and **CSS-first configuration**:\n- Install for Vite: `npm i tailwindcss @tailwindcss/vite` and add `tailwindcss()` to `vite.config.js` plugins. No PostCSS config or `tailwind.config.js` needed.\n- In your CSS: `@import "tailwindcss";` (replaces the three `@tailwind` directives).\n- **Design tokens with `@theme`**: `--color-brand-500: oklch(...)` automatically creates `bg-brand-500`, `text-brand-500` etc. `--font-display`, `--breakpoint-3xl` work the same way. All tokens are also exposed as CSS variables.\n- **Automatic content detection**: no `content` array; it scans your project (respecting .gitignore).\n- **Custom variants** in CSS: `@custom-variant dark (&:where(.dark, .dark *));` for class-based dark mode (default `dark:` uses `prefers-color-scheme`).\n- Custom utilities with `@utility`, container queries built in (`@container`, `@md:`), 3D transforms, `not-*` variants, modern colour palette in OKLCH.\n- Some renames: `shadow-sm` -> `shadow-xs`, `rounded-sm` -> `rounded-xs`, `outline-none` -> `outline-hidden`, `bg-opacity-*` removed (use `bg-black/50`). `npx @tailwindcss/upgrade` migrates v3 projects.',
      syntax:
        "/* src/index.css */\n@import \"tailwindcss\";\n\n@custom-variant dark (&:where(.dark, .dark *));\n\n@theme {\n  --color-brand-50: oklch(0.97 0.02 270);\n  --color-brand-500: oklch(0.55 0.22 270);\n  --color-brand-600: oklch(0.48 0.22 270);\n  --font-display: \"Poppins\", sans-serif;\n  --radius-card: 1rem;\n}\n\n// vite.config.js\nimport { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nimport tailwindcss from '@tailwindcss/vite';\nexport default defineConfig({ plugins: [react(), tailwindcss()] });",
    },
    {
      heading: 'Variants without chaos: cn() and cva',
      content:
        'Problems with long class strings: conditional classes, and **conflicts** when a parent passes `className="px-8"` to a button that already has `px-4` (which one wins depends on CSS order, not the string order).\n\nThe standard toolkit (used by shadcn/ui):\n- **clsx**: build class strings conditionally: `clsx(\'btn\', isActive && \'btn-active\', { \'opacity-50\': disabled })`.\n- **tailwind-merge**: removes conflicting Tailwind classes so the **last one wins**: `twMerge(\'px-4 py-2\', \'px-8\')` -> `\'py-2 px-8\'`.\n- **cn()** = `twMerge(clsx(...inputs))`, a 2-line helper in `lib/utils.js`.\n- **class-variance-authority (cva)**: define a component\'s variants (`variant`, `size`) and defaults in one object, returning the right classes.\n\nAlways let consumers pass `className` and merge it last so they can adjust layout (`mt-4`, `w-full`) without forking the component.',
      syntax:
        "import { cva } from 'class-variance-authority';\nimport { cn } from '@/lib/utils';\n\nconst buttonVariants = cva(\n  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-2 disabled:opacity-50',\n  {\n    variants: {\n      variant: {\n        primary: 'bg-brand-500 text-white hover:bg-brand-600',\n        outline: 'border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800',\n        danger: 'bg-red-600 text-white hover:bg-red-700',\n      },\n      size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4', lg: 'h-12 px-6 text-lg' },\n    },\n    defaultVariants: { variant: 'primary', size: 'md' },\n  }\n);\n\nexport function Button({ className, variant, size, ...props }) {\n  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;\n}",
    },
    {
      heading: 'shadcn/ui vs MUI',
      content:
        '**shadcn/ui** is "not a component library": the CLI (`npx shadcn@latest init`, then `npx shadcn@latest add button dialog form`) **copies source files** into `src/components/ui`. Each component uses **Radix UI** primitives (accessibility, focus management, keyboard handling) + Tailwind classes + cva. Theming uses CSS variables (`--primary`, `--background`) defined in your CSS. Pros: full ownership, easy customisation, only what you use. Cons: you maintain the code; updates are manual.\n\n**MUI (Material UI v6/v7)**: install `@mui/material @emotion/react @emotion/styled`. Rich set (DataGrid, DatePickers, Autocomplete). Customise via `createTheme` (palette, typography, components overrides), `ThemeProvider`, the `sx` prop for one-off styles and `styled()`. v6+ adds **CSS theme variables** (`cssVariables: true`) and `colorSchemes` for flicker-free dark mode, and Pigment CSS (zero-runtime) as an option. Pros: speed for dashboards, consistent Material look. Cons: larger bundle, Emotion runtime, harder to make unique.\n\nRule of thumb: customer-facing product with custom design -> Tailwind + shadcn/ui. Internal admin or data-heavy tool with tight deadline -> MUI (or Ant Design).',
      syntax:
        "// MUI theme with light/dark schemes\nimport { createTheme, ThemeProvider, CssBaseline, Button } from '@mui/material';\n\nconst theme = createTheme({\n  cssVariables: { colorSchemeSelector: 'class' },\n  colorSchemes: {\n    light: { palette: { primary: { main: '#4f46e5' } } },\n    dark: { palette: { primary: { main: '#818cf8' } } },\n  },\n  shape: { borderRadius: 10 },\n  components: { MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { textTransform: 'none' } } } },\n});\n\n<ThemeProvider theme={theme}><CssBaseline /><Button variant=\"contained\" sx={{ px: 4 }}>Save</Button></ThemeProvider>",
    },
    {
      heading: 'CSS Modules: scoped classic CSS',
      content:
        'Vite supports CSS Modules out of the box: any file named `*.module.css` (or `.module.scss`). Class names are transformed into unique names (`Card_title__x7a2b`), so `.title` in two components never clashes.\n\n- Import: `import styles from \'./Card.module.css\'` then `className={styles.title}`.\n- Combine: `className={clsx(styles.card, isActive && styles.active)}`.\n- Global escape: `:global(.some-lib-class) { ... }`.\n- Use CSS variables inside modules for theming.\n- Kebab-case class names are accessed with brackets (`styles[\'card-title\']`) unless `css.modules.localsConvention: \'camelCase\'` is set.\n\nChoose CSS Modules when the team prefers writing real CSS, for complex animations/selectors, or to style a few components in a Tailwind project.',
      syntax:
        "/* ProductCard.module.css */\n.card { border: 1px solid var(--border); border-radius: 12px; padding: 1rem; }\n.card:hover { box-shadow: 0 4px 16px rgb(0 0 0 / 0.08); }\n.title { font-weight: 600; }\n.soldOut { opacity: 0.5; }\n\n// ProductCard.jsx\nimport styles from './ProductCard.module.css';\nexport function ProductCard({ product }) {\n  return (\n    <article className={clsx(styles.card, product.stock === 0 && styles.soldOut)}>\n      <h3 className={styles.title}>{product.name}</h3>\n    </article>\n  );\n}",
    },
    {
      heading: 'Theming and dark mode the right way',
      content:
        'A scalable theme is built on **semantic CSS variables**: `--background`, `--foreground`, `--primary`, `--muted`, `--border`. Components use these (Tailwind: `bg-(--background)` or tokens mapped in `@theme inline`), never raw colours. Dark mode just redefines the variables under `.dark` (or `[data-theme="dark"]`).\n\nRequirements for a good implementation:\n1. **Three options**: light, dark, system (`matchMedia(\'(prefers-color-scheme: dark)\')`, and listen for changes).\n2. **Persist** the choice in localStorage.\n3. **No flash** of the wrong theme (FOUC): add a tiny inline `<script>` in `index.html` `<head>` that reads localStorage and sets the class **before** React loads. `useEffect` alone runs too late.\n4. Set `color-scheme: light dark` so native inputs/scrollbars match.\n5. Check contrast (WCAG AA 4.5:1 for text) in both themes.\n\nReact side: a `ThemeProvider` (context) or a Zustand store with `theme` and `setTheme`, plus an effect that toggles `document.documentElement.classList`.',
      syntax:
        "<!-- index.html, before any CSS/JS -->\n<script>\n  (function () {\n    var t = localStorage.getItem('theme') || 'system';\n    var dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);\n    document.documentElement.classList.toggle('dark', dark);\n  })();\n</script>",
      tip: 'Next.js projects use the next-themes package, which implements exactly this script + provider.',
    },
  ],
  examples: [
    {
      title: 'Light / dark / system theme with CSS variables',
      scenario: 'A dashboard header with a theme switcher that remembers the choice and follows the OS in "system" mode.',
      steps: [
        'Define semantic variables for :root and .dark',
        'Create a useTheme hook that stores the choice and resolves "system" via matchMedia',
        'Toggle the "dark" class on a wrapper (document.documentElement in a real app)',
        'Run and switch between the three modes',
      ],
      code: `function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'system');
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && mq.matches));
    apply();
    localStorage.setItem('theme', theme);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
  return [theme, setTheme];
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

const css = \`
.app { --bg: #ffffff; --fg: #111827; --muted: #6b7280; --card: #f3f4f6; --primary: #4f46e5; --border: #e5e7eb;
  background: var(--bg); color: var(--fg); padding: 16px; font-family: sans-serif; min-height: 260px; transition: background .2s, color .2s; color-scheme: light; }
.app.dark { --bg: #0b1020; --fg: #e5e7eb; --muted: #9ca3af; --card: #161d33; --primary: #818cf8; --border: #273049; color-scheme: dark; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 12px; margin-top: 12px; }
.muted { color: var(--muted); }
.btn { background: var(--primary); color: white; border: 0; border-radius: 8px; padding: 6px 12px; }
.seg button { border: 1px solid var(--border); background: transparent; color: var(--fg); padding: 4px 10px; cursor: pointer; }
.seg button[aria-pressed="true"] { background: var(--primary); color: #fff; }
\`;

function readSaved() { try { return localStorage.getItem('demo-theme') || 'system'; } catch (e) { return 'system'; } }

function useTheme() {
  const [theme, setTheme] = useState(readSaved);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  useEffect(() => { try { localStorage.setItem('demo-theme', theme); } catch (e) {} }, [theme]);
  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
  return { theme, setTheme, resolved };
}

function App() {
  const { theme, setTheme, resolved } = useTheme();
  return (
    <div className={'app' + (resolved === 'dark' ? ' dark' : '')}>
      <style>{css}</style>
      <div className="seg" role="group" aria-label="Theme">
        {['light', 'dark', 'system'].map(t => (
          <button key={t} aria-pressed={theme === t} onClick={() => setTheme(t)}>{t}</button>
        ))}
      </div>
      <p className="muted">Selected: {theme}, applied: {resolved}</p>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Orders today</h3>
        <p className="muted">128 orders, Rs 2,45,000 revenue</p>
        <button className="btn">View report</button>
      </div>
    </div>
  );
}`,
      },
      result: 'Clicking dark/light switches every colour instantly; system follows the OS setting; the choice survives a reload.',
      explanation:
        'Components only reference semantic variables, so a theme switch is just a class change; no component code changes. In a real app the class goes on <html> and a small inline script in index.html applies it before React renders to avoid a flash.',
    },
    {
      title: 'Build cn() and a cva-style Button variants function',
      scenario: 'Understand what clsx, tailwind-merge and cva do by implementing simplified versions, then see the real versions.',
      steps: [
        'Write clsx-like join of strings/objects/false values',
        'Write a naive merge that keeps the last class per Tailwind "group" (px, py, bg, text-size)',
        'Write a cva-like function returning classes for variant/size',
        'Render buttons and print the class strings',
      ],
      code: `// real code
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) { return twMerge(clsx(inputs)); }

cn('px-4 py-2 bg-indigo-600', isLarge && 'px-8', { 'opacity-50': disabled })
// => 'py-2 bg-indigo-600 px-8 opacity-50'`,
      playground: {
        jsx: `function clsx(...args) {
  return args.flatMap(a => typeof a === 'string' ? a.split(' ')
    : a && typeof a === 'object' ? Object.keys(a).filter(k => a[k]) : []).filter(Boolean);
}
// naive twMerge: later class wins within the same prefix group
function twMergeNaive(classes) {
  const group = (c) => (c.match(/^(px|py|p|mx|my|m|bg|rounded|w|h)-/) || [c])[0];
  const map = new Map();
  classes.forEach(c => { map.delete(group(c)); map.set(group(c), c); });
  return [...map.values()].join(' ');
}
const cn = (...inputs) => twMergeNaive(clsx(...inputs));

function cva(base, { variants, defaultVariants }) {
  return (props = {}) => {
    const picks = Object.keys(variants).map(k => variants[k][props[k] ?? defaultVariants[k]]);
    return clsx(base, ...picks).join(' ');
  };
}

const buttonVariants = cva('rounded-md font-medium', {
  variants: {
    variant: { primary: 'bg-indigo-600 text-white', outline: 'border bg-white', danger: 'bg-red-600 text-white' },
    size: { sm: 'px-2 py-1', md: 'px-4 py-2', lg: 'px-6 py-3' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

// tiny inline-style map so the playground renders without Tailwind
const look = { 'bg-indigo-600': '#4f46e5', 'bg-red-600': '#dc2626', 'bg-white': '#fff' };
function Button({ variant, size, className, children }) {
  const classes = cn(buttonVariants({ variant, size }), className);
  const bg = classes.split(' ').map(c => look[c]).filter(Boolean).pop();
  const pad = { 'px-2': 8, 'px-4': 16, 'px-6': 24, 'px-8': 32 };
  const px = classes.split(' ').map(c => pad[c]).filter(Boolean).pop();
  return (
    <div style={{ margin: '8px 0' }}>
      <button style={{ background: bg, color: bg === '#fff' ? '#111' : '#fff', border: '1px solid #ccc', borderRadius: 6, padding: '6px ' + px + 'px' }}>{children}</button>
      <code style={{ marginLeft: 8, fontSize: 12 }}>{classes}</code>
    </div>
  );
}

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <Button>Default</Button>
      <Button variant="outline" size="sm">Outline small</Button>
      <Button variant="danger" size="lg">Delete</Button>
      <Button className="px-8 bg-red-600">Overridden via className (px-8 wins)</Button>
    </div>
  );
}`,
      },
      result: 'Each button prints its final class string; the last one shows that className overrides px-4 and bg-indigo-600 instead of duplicating them.',
      explanation:
        'cva maps props to class lists; cn joins conditionals and resolves Tailwind conflicts so the consumer\'s className wins. The real tailwind-merge understands every Tailwind utility group, including variants like hover: and dark:.',
    },
    {
      title: 'shadcn/ui in a Vite project: setup and a Dialog form',
      scenario: 'Add accessible Dialog, Button and Input components to a Vite + Tailwind 4 MERN admin panel.',
      steps: [
        'Configure the @ alias in vite.config.js and jsconfig/tsconfig',
        'Run npx shadcn@latest init and add components',
        'Use the copied components; edit them freely in src/components/ui',
      ],
      code: `// vite.config.js
import path from 'node:path';
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});

// terminal
// npx shadcn@latest init
// npx shadcn@latest add button dialog input label

// EditCategoryDialog.jsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EditCategoryDialog({ category, onSave }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm">Edit</Button></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit category</DialogTitle></DialogHeader>
        <form onSubmit={async (e) => { e.preventDefault(); await onSave(new FormData(e.currentTarget).get('name')); setOpen(false); }}
              className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={category.name} />
          </div>
          <DialogFooter><Button type="submit">Save changes</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}`,
      result: 'An accessible modal (focus trap, Esc to close, aria labelling, scroll lock) styled with your Tailwind theme.',
      explanation:
        'Radix Dialog handles accessibility; shadcn adds Tailwind styles and puts the code in your repo. asChild lets the trigger be your own Button (Day 6 pattern). The open/onOpenChange pair is the controlled-component contract.',
    },
    {
      title: 'Same card three ways: Tailwind, CSS Module, MUI',
      scenario: 'Compare the developer experience for one product card.',
      steps: [
        'Write the card with Tailwind utility classes (dark mode included)',
        'Write it with a CSS Module',
        'Write it with MUI Card and sx',
      ],
      code: `// 1. Tailwind 4
<article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
  <img src={p.image} alt={p.name} className="aspect-square w-full rounded-xl object-cover" />
  <h3 className="mt-3 font-semibold text-gray-900 dark:text-gray-100">{p.name}</h3>
  <p className="text-brand-600 font-bold">{inr.format(p.price)}</p>
</article>

// 2. CSS Module
import s from './ProductCard.module.css';
<article className={s.card}><img className={s.image} ... /><h3 className={s.title}>{p.name}</h3><p className={s.price}>{inr.format(p.price)}</p></article>

// 3. MUI
<Card variant="outlined" sx={{ borderRadius: 4, '&:hover': { boxShadow: 4 } }}>
  <CardMedia component="img" image={p.image} alt={p.name} sx={{ aspectRatio: '1 / 1' }} />
  <CardContent>
    <Typography variant="subtitle1" fontWeight={600}>{p.name}</Typography>
    <Typography color="primary" fontWeight={700}>{inr.format(p.price)}</Typography>
  </CardContent>
</Card>

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });`,
      result: 'Three visually similar cards; Tailwind keeps everything in JSX, CSS Modules keeps CSS separate and scoped, MUI uses library components and theme values.',
      explanation:
        'All three are valid. Teams standardise on one primary approach for consistency. Intl.NumberFormat with en-IN formats prices as Rs 1,24,999 (lakh grouping) without a library.',
    },
  ],
  interview: [
    { q: 'What changed in Tailwind CSS 4?', a: 'New high-performance engine, CSS-first config with @import "tailwindcss" and @theme tokens instead of tailwind.config.js, first-party Vite plugin, automatic content detection, tokens exposed as CSS variables, built-in container queries, @custom-variant/@utility directives, OKLCH colours, and some renamed utilities (shadow-sm -> shadow-xs, outline-none -> outline-hidden).', level: 'Medium' },
    { q: 'Why is tailwind-merge needed?', a: 'CSS specificity, not class order in the string, decides which conflicting utility wins. When a component has px-4 and the consumer passes px-8, both exist and the result is unpredictable. tailwind-merge removes the earlier conflicting class so the last one reliably wins.', level: 'Medium' },
    { q: 'How is shadcn/ui different from MUI?', a: 'shadcn/ui copies component source code (Radix primitives + Tailwind + cva) into your project, so you own and customise it; it is not an npm dependency. MUI is an installed library with its own theming system, Emotion styling and a large component set; you customise through theme overrides and sx.', level: 'Easy' },
    { q: 'What are CSS Modules and how do they prevent conflicts?', a: 'CSS files named *.module.css whose class names are locally scoped by the bundler, generating unique names like Button_primary__a1b2c. Components import a styles object, so the same class name in different files never clashes.', level: 'Easy' },
    { q: 'How do you avoid the dark-mode flash on page load?', a: 'Apply the theme class before first paint with a small blocking inline script in index.html head that reads localStorage/matchMedia and sets the class on <html>. A React useEffect runs after the first paint, which is too late. Next.js apps use next-themes.', level: 'Hard' },
    { q: 'Why use semantic CSS variables for theming?', a: 'Components reference roles (--background, --primary, --border) rather than raw colours. Themes (light, dark, brand variants) just redefine variables, so no component changes and runtime switching is instant with no re-render.', level: 'Medium' },
    { q: 'What problems does runtime CSS-in-JS have today?', a: 'Styles are generated at runtime, adding JS and CPU cost, and libraries relying on React context do not work in React Server Components. Many teams move to zero-runtime options like Tailwind, CSS Modules, vanilla-extract, Panda CSS or MUI Pigment CSS.', level: 'Hard' },
    { q: 'What is class-variance-authority (cva)?', a: 'A small library to declare a component\'s base classes, variants (e.g. variant, size), compound variants and defaults, returning the correct class string for given props. It keeps variant logic out of JSX.', level: 'Medium' },
    { q: 'How do you customise MUI components globally?', a: 'With createTheme: palette, typography, shape, spacing and components.{MuiX}.defaultProps/styleOverrides, provided via ThemeProvider. Use sx for one-off styles and styled() for reusable styled variants.', level: 'Medium' },
    { q: 'How do you implement dark mode with Tailwind 4 using a class toggle?', a: 'Declare @custom-variant dark (&:where(.dark, .dark *)); in the CSS, then toggle the dark class on <html>. By default Tailwind 4 dark: uses the prefers-color-scheme media query.', level: 'Medium' },
    { q: 'Tailwind vs component library for an admin panel with a 3-week deadline?', a: 'A component library (MUI/Ant Design) or shadcn/ui gives ready accessible tables, dialogs, date pickers and forms, saving time. Pure Tailwind gives more freedom but requires building components. A balanced answer: shadcn/ui for Tailwind teams or MUI for data-heavy dashboards (DataGrid).', level: 'Easy' },
    { q: 'How do you keep styling consistent in a large team?', a: 'Define design tokens (colours, spacing, typography, radius) in one place (@theme or MUI theme), build shared primitives (Button, Input, Card) with variants, document them in Storybook, lint (eslint-plugin-tailwindcss / Prettier class sorting), and review visual changes with screenshot tests.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write src/index.css for Tailwind 4 with a brand colour scale (50, 500, 600, 700), a custom font, class-based dark mode and a custom utility "container-page" (max-width 72rem, centered, horizontal padding 1rem).',
      hint: '@theme for tokens, @custom-variant for dark, @utility for the custom class.',
      solution: `@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-brand-50: oklch(0.97 0.02 270);
  --color-brand-500: oklch(0.55 0.22 270);
  --color-brand-600: oklch(0.48 0.22 270);
  --color-brand-700: oklch(0.42 0.2 270);
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

@utility container-page {
  max-width: 72rem;
  margin-inline: auto;
  padding-inline: 1rem;
}

/* usage: <main class="container-page bg-white dark:bg-gray-950 text-brand-700"> */`,
    },
    {
      task: 'Create a Badge component with cva: variants default/success/warning/danger and sizes sm/md, accepting className merged with cn().',
      hint: 'Copy the Button pattern.',
      solution: `import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full font-medium', {
  variants: {
    variant: {
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-amber-100 text-amber-800',
      danger: 'bg-red-100 text-red-800',
    },
    size: { sm: 'px-2 py-0.5 text-xs', md: 'px-3 py-1 text-sm' },
  },
  defaultVariants: { variant: 'default', size: 'sm' },
});

export function Badge({ className, variant, size, ...props }) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

// <Badge variant="success">Delivered</Badge> <Badge variant="danger" size="md">Cancelled</Badge>`,
    },
    {
      task: 'Write a ThemeProvider (context) exposing theme ("light"|"dark"|"system"), resolvedTheme and setTheme, which toggles the "dark" class on document.documentElement and persists to localStorage.',
      hint: 'Combine the example hook with context.',
      solution: `const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.documentElement.style.colorScheme = resolvedTheme;
    localStorage.setItem('theme', theme);
  }, [theme, resolvedTheme]);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme]);
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export const useTheme = () => useContext(ThemeContext);`,
    },
    {
      task: 'Convert this MUI usage to a theme override so every Button in the app has no uppercase text and 10px radius: <Button sx={{ textTransform: "none", borderRadius: "10px" }}>.',
      hint: 'components.MuiButton.styleOverrides.root.',
      solution: `const theme = createTheme({
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 10 },
      },
    },
  },
});

// main.jsx
<ThemeProvider theme={theme}>
  <CssBaseline />
  <App />
</ThemeProvider>

// now simply: <Button variant="contained">Save</Button>`,
    },
  ],
  quiz: [
    { question: 'How do you include Tailwind CSS 4 in your main CSS file?', options: ['@tailwind base; @tailwind components; @tailwind utilities;', '@import "tailwindcss";', '@use tailwind;', 'It is added automatically without CSS'], answer: 1, explanation: 'v4 uses a single CSS import; the old directives are from v3.' },
    { question: 'Where do Tailwind 4 design tokens like --color-brand-500 go?', options: ['package.json', 'tailwind.config.js content array', 'An @theme block in CSS', 'index.html'], answer: 2, explanation: '@theme variables generate utilities such as bg-brand-500.' },
    { question: 'What does shadcn/ui install into your project?', options: ['Component source files you own', 'A compiled npm package only', 'A CDN script', 'A Sass framework'], answer: 0, explanation: 'The CLI copies components into src/components/ui.' },
    { question: 'Why does a useEffect-only dark mode cause a flash?', options: ['Effects run twice', 'CSS variables are slow', 'localStorage is async', 'Effects run after the first paint'], answer: 3, explanation: 'An inline head script must set the class before paint.' },
    { question: 'What does cn("px-4 py-2", "px-8") return with tailwind-merge?', options: ['"px-4 py-2 px-8"', '"px-4 py-2"', '"py-2 px-8"', '"px-8"'], answer: 2, explanation: 'The conflicting px-4 is removed and the last value wins.' },
  ],
};
