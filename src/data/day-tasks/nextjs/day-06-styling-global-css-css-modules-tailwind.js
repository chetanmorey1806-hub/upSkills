export default {
  lesson: 'day-06-styling-global-css-css-modules-tailwind',
  minutes: 30,
  intro: 'Practise where global CSS goes, how CSS Modules and Tailwind classes work, and how to build conditional class names cleanly.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Where should `app/globals.css` be imported so that its styles apply to every page?',
      options: ['In every page.js file', 'In the root layout app/layout.js', 'In next.config.mjs', 'In public/index.html'],
      answer: 1,
      explain: 'Global styles are imported once in the **root layout** (`import "./globals.css"`), which wraps every page. Importing it in each page is unnecessary, and Next.js has no `public/index.html`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'You want locally scoped styles for `Button.jsx` using a CSS Module. What must the CSS file name be?',
      accept: ['Button.module.css', 'button.module.css'],
      explain: 'Only files ending in **`.module.css`** are treated as CSS Modules. Next.js hashes each class name (e.g. `Button_primary__a1B2c`) so `.primary` in one module can never clash with `.primary` in another. A plain `Button.css` would be global.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What does the Tailwind class list `hidden md:flex` do?',
      options: [
        'Always hidden; flex only on hover',
        'Hidden on small screens, display:flex from the md breakpoint (768px) and wider',
        'Flex on small screens, hidden on medium screens',
        'It is invalid: you cannot combine hidden and flex',
      ],
      answer: 1,
      explain: 'Tailwind is **mobile-first**: un-prefixed utilities apply to all sizes, and `md:` applies from 768px up, overriding them. So the element is hidden on phones and becomes a flex container on tablets/desktops, the classic responsive nav pattern.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which styling options work in a **Server Component** without adding `"use client"`? (choose all that apply)',
      options: ['Global CSS imported in the layout', 'CSS Modules (styles.card)', 'Tailwind utility classes', 'Runtime CSS-in-JS like styled-components'],
      answers: [0, 1, 2],
      explain: 'Global CSS, CSS Modules and Tailwind are all compiled to static CSS files at build time, so they work everywhere. Runtime CSS-in-JS libraries need React context and run in the browser, so components using them must be Client Components.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What class string does this code print?',
      code: `const isActive = true, isDisabled = false, size = 'lg';
const cls = ['btn', isActive && 'btn-active', isDisabled && 'opacity-50', 'btn-' + size]
  .filter(Boolean)
  .join(' ');
console.log(cls);`,
      expected: 'btn btn-active btn-lg',
      explain: '`isDisabled && "opacity-50"` evaluates to `false`, and `.filter(Boolean)` removes falsy values, so no stray "false" ends up in the class list. This pattern (or the `clsx` package) is how you build conditional classes for CSS Modules and Tailwind.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write your own mini `clsx`: `cx(...args)` joins class names with single spaces. Each argument can be:\n- a string (added if not empty)\n- a falsy value (`false`, `null`, `undefined`, `""`) → ignored\n- an object `{ className: condition }` → each key is added when its value is truthy',
      example: { title: 'looping over an object', code: "for (const [key, value] of Object.entries({ a: true, b: false })) {\n  if (value) console.log(key); // a\n}" },
      starter: 'function cx(...args) {\n  // TODO\n}\n',
      solution: "function cx(...args) {\n  const out = [];\n  for (const a of args) {\n    if (!a) continue;\n    if (typeof a === 'string') out.push(a);\n    else if (typeof a === 'object') {\n      for (const [k, v] of Object.entries(a)) if (v) out.push(k);\n    }\n  }\n  return out.join(' ');\n}",
      tests: [
        { call: "cx('btn', 'btn-lg')", expect: 'btn btn-lg' },
        { call: "cx('btn', false && 'x', null, undefined, '')", expect: 'btn' },
        { call: "cx('card', { active: true, disabled: false })", expect: 'card active' },
        { call: "cx({ 'text-red-600': 1 > 0, 'font-bold': true })", expect: 'text-red-600 font-bold' },
      ],
      explain: 'Conditional class helpers keep JSX readable: `className={cx(styles.btn, { [styles.active]: isActive })}`. The common bug with hand-written template strings is leaving `"false"` or double spaces in the class attribute.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 6,
      q: 'The CSS below is given (like a CSS Module). Build a `FeeBadge({ paid })` component that always has class `badge` and additionally `paid` when `paid` is true, otherwise `due`; the text is `Paid` or `Due`. `App` renders two badges: `<FeeBadge paid={true} />` then `<FeeBadge paid={false} />`.',
      css: '.badge { padding: 4px 8px; border-radius: 6px; }\n.paid { background-color: rgb(22, 163, 74); color: white; }\n.due { background-color: rgb(220, 38, 38); color: white; }',
      example: { title: 'class depending on a prop', code: "<span className={'tag ' + (urgent ? 'red' : 'grey')}>{label}</span>" },
      starter: 'function FeeBadge({ paid }) {\n  // TODO\n  return <span>?</span>;\n}\n\nfunction App() {\n  return <div />;\n}\n',
      solution: "function FeeBadge({ paid }) {\n  return <span className={'badge ' + (paid ? 'paid' : 'due')}>{paid ? 'Paid' : 'Due'}</span>;\n}\n\nfunction App() {\n  return (\n    <div>\n      <FeeBadge paid={true} />\n      <FeeBadge paid={false} />\n    </div>\n  );\n}",
      checks: [
        { sel: '.badge', count: 2, msg: 'Render exactly two elements with class "badge"' },
        { sel: '.badge', index: 0, textEq: 'Paid', msg: 'The first badge must say "Paid"' },
        { sel: '.badge.paid', count: 1, style: { 'background-color': 'rgb(22, 163, 74)' }, msg: 'The paid badge needs classes "badge paid" (green)' },
        { sel: '.badge.due', count: 1, msg: 'The second badge needs classes "badge due"' },
        { sel: '.badge.due', textEq: 'Due', msg: 'The due badge must say "Due"' },
      ],
      explain: 'With CSS Modules the same idea is `className={`${styles.badge} ${paid ? styles.paid : styles.due}`}`. Keep the shared base class and switch only the variant class; do not duplicate the base styles in every variant.',
    },
  ],
};
